"use client";

import { useActionState } from "react";
import { setAdminAccess, type TeamActionState } from "@/app/admin/team/actions";
import type { TeamMember } from "@/lib/admin-team";

const EMPTY: TeamActionState = {};

function granted(member: TeamMember) {
  if (!member.grantedAt) return "Granted before this page existed";
  const when = new Date(member.grantedAt).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return member.grantedByEmail
    ? `Granted ${when} by ${member.grantedByEmail}`
    : `Granted ${when}`;
}

/**
 * The roster and the promote/demote forms share one action state so every
 * outcome — a promotion, a refused demotion, an unknown email — lands in the
 * same place instead of being scattered per row.
 */
export function TeamControls({
  members,
  currentUserId,
}: {
  members: TeamMember[];
  currentUserId: string;
}) {
  const [state, formAction, pending] = useActionState(setAdminAccess, EMPTY);
  const lastAdmin = members.length <= 1;

  return (
    <div className="space-y-6">
      <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
        {members.map((member) => {
          const isSelf = member.id === currentUserId;

          return (
            <li
              key={member.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-4"
            >
              <div className="min-w-0">
                <p className="flex items-center gap-2 font-semibold text-ink">
                  <span className="truncate">{member.name ?? member.email}</span>
                  {isSelf && (
                    <span className="shrink-0 rounded-full bg-gold-soft px-2 py-0.5 text-xs font-bold text-gold-deep">
                      You
                    </span>
                  )}
                </p>
                {member.name && (
                  <p className="truncate text-sm text-muted">{member.email}</p>
                )}
                <p className="mt-0.5 text-xs text-faint">{granted(member)}</p>
              </div>

              {isSelf || lastAdmin ? (
                <span className="text-xs text-faint">
                  {isSelf
                    ? "You can't remove your own access"
                    : "The last admin can't be removed"}
                </span>
              ) : (
                <form action={formAction}>
                  <input type="hidden" name="email" value={member.email} />
                  <input type="hidden" name="make" value="false" />
                  <button
                    type="submit"
                    disabled={pending}
                    className="rounded-full border border-sale/40 px-4 py-2 text-sm font-semibold text-sale transition-colors hover:bg-sale/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Remove admin
                  </button>
                </form>
              )}
            </li>
          );
        })}
      </ul>

      <div className="rounded-xl border border-line bg-surface p-5">
        <h3 className="font-display text-lg text-ink">Add an admin</h3>
        <p className="mt-1 text-sm text-muted">
          They need an abdmall account first — ask them to sign up, then enter
          the same email here.
        </p>

        <form action={formAction} className="mt-4 flex flex-wrap gap-3">
          <input type="hidden" name="make" value="true" />
          <label className="min-w-56 flex-1">
            <span className="sr-only">Email address</span>
            <input
              name="email"
              type="email"
              required
              placeholder="them@example.com"
              className="h-11 w-full rounded-lg border border-line bg-surface-2 px-4 text-sm text-ink placeholder:text-faint focus:border-line-strong focus:bg-surface focus:outline-none"
            />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="h-11 rounded-full bg-brand px-6 text-sm font-semibold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
          >
            {pending ? "Saving…" : "Make admin"}
          </button>
        </form>
      </div>

      {state.error && (
        <p
          role="alert"
          className="rounded-lg border border-sale/30 bg-sale/10 px-4 py-3 text-sm font-medium text-sale"
        >
          {state.error}
        </p>
      )}
      {state.message && (
        <p
          role="status"
          className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm font-medium text-success"
        >
          {state.message}
        </p>
      )}
    </div>
  );
}
