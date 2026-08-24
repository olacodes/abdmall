"use client";

/**
 * Lets the header's search box drive the catalogue on pages that show one,
 * without a second search box appearing beside it.
 *
 * The wiring is deliberately not state: typing would otherwise re-render the
 * whole layout on every keystroke, and neither side needs to know whether the
 * other is there. The header just calls through, and on a page with no
 * catalogue nothing is listening, so it keeps navigating to /shop as before.
 *
 * The mutable part stays inside the provider and only functions cross the
 * context boundary — the React Compiler treats anything read from context as
 * immutable, so handing out a ref to mutate is a lint error, not just poor
 * taste.
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Sink = (value: string) => void;

export type SearchBridge = {
  /** Registers the catalogue; returns an unregister for effect cleanup. */
  registerResults: (sink: Sink) => () => void;
  /** Registers the header's input, so the catalogue can write back to it. */
  registerInput: (sink: Sink) => () => void;
  sendToResults: (value: string) => void;
  sendToInput: (value: string) => void;
  /** Whether a catalogue is listening — i.e. whether typing filters in place. */
  hasResults: () => boolean;
};

const SearchBridgeContext = createContext<SearchBridge | null>(null);

/**
 * A plain closure rather than a ref: the registrations aren't rendering state,
 * and a ref passed into callbacks trips the compiler's "may read during render"
 * rule. Built once per provider through useState's lazy initializer.
 */
function createBridge(): SearchBridge {
  const sinks: { results: Sink | null; input: Sink | null } = {
    results: null,
    input: null,
  };

  // Only clears its own registration: a page that mounts before the previous
  // one has finished tearing down shouldn't have its sink wiped by the exit.
  const register = (slot: "results" | "input") => (sink: Sink) => {
    sinks[slot] = sink;
    return () => {
      if (sinks[slot] === sink) sinks[slot] = null;
    };
  };

  return {
    registerResults: register("results"),
    registerInput: register("input"),
    sendToResults: (value) => sinks.results?.(value),
    sendToInput: (value) => sinks.input?.(value),
    hasResults: () => sinks.results !== null,
  };
}

export function SearchBridgeProvider({ children }: { children: ReactNode }) {
  const [bridge] = useState(createBridge);

  return <SearchBridgeContext value={bridge}>{children}</SearchBridgeContext>;
}

export function useSearchBridge() {
  return useContext(SearchBridgeContext);
}

/**
 * Registers a handler for as long as the component is mounted, and hands back
 * the bridge for sending. React state setters are stable, so passing one runs
 * this once rather than on every render.
 */
export function useSearchSink(
  slot: "results" | "input",
  handler: Sink,
): SearchBridge | null {
  const bridge = useSearchBridge();

  useEffect(() => {
    if (!bridge) return;
    return slot === "results"
      ? bridge.registerResults(handler)
      : bridge.registerInput(handler);
  }, [bridge, slot, handler]);

  return bridge;
}
