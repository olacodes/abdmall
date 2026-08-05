"use client";

import { useEffect, useState } from "react";

function remaining(target: number) {
  const diff = Math.max(0, target - Date.now());
  const total = Math.floor(diff / 1000);
  return {
    h: Math.floor(total / 3600),
    m: Math.floor((total % 3600) / 60),
    s: total % 60,
  };
}

const pad = (n: number) => n.toString().padStart(2, "0");

/** Live flash-sale countdown. Defaults to end of the current day. */
export function Countdown({ target }: { target?: number }) {
  // End of today, in the browser's timezone, unless a target is provided.
  const [end] = useState(() => {
    if (target) return target;
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d.getTime();
  });

  // Start null so the server-prerendered HTML and the client's first render
  // match; the real time is filled in after mount, avoiding a hydration mismatch.
  const [time, setTime] = useState<ReturnType<typeof remaining> | null>(null);

  useEffect(() => {
    // Fill in the real time only after mount — the server render intentionally
    // shows placeholders, so this client-clock sync avoids a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTime(remaining(end));
    const id = setInterval(() => setTime(remaining(end)), 1000);
    return () => clearInterval(id);
  }, [end]);

  const parts: [string, number | null][] = [
    ["Hrs", time?.h ?? null],
    ["Min", time?.m ?? null],
    ["Sec", time?.s ?? null],
  ];

  const srLabel =
    time === null
      ? "Sale countdown loading"
      : `Sale ends in ${time.h} hours ${time.m} minutes`;

  return (
    <div
      className="flex items-center gap-1.5"
      role="timer"
      aria-label={srLabel}
    >
      {parts.map(([label, value], i) => (
        <div key={label} className="flex items-center gap-1.5">
          <div className="flex flex-col items-center">
            <span className="flex h-10 min-w-10 items-center justify-center rounded-md bg-brand px-2 text-lg font-extrabold text-white tabular-nums">
              {value === null ? "--" : pad(value)}
            </span>
            <span className="mt-1 text-[0.58rem] font-semibold uppercase tracking-widest text-muted">
              {label}
            </span>
          </div>
          {i < parts.length - 1 && (
            <span className="pb-4 text-lg font-bold text-sale">:</span>
          )}
        </div>
      ))}
    </div>
  );
}
