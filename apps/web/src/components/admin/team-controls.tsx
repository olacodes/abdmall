"use client";

import { useActionState, useState } from "react";
import {
  inviteAdmin,
  revokeInvite,
  setAdminAccess,
  type TeamActionState,
} from "@/app/admin/team/actions";
import type { PendingInvite, TeamMember } from "@/lib/admin-team";

const EMPTY: TeamActionState = {};

function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function granted(member: TeamMember) {
  if (!member.grantedAt) return "Granted before this page existed";
  const when = shortDate(member.grantedAt);
  return member.grantedByEmail
    ? `Granted ${when} by ${member.grantedByEmail}`
    : `Granted ${when}`;
}

function Notice({ state }: { state: TeamActionState }) {
  if (state.error) {
    return (
      <p
        role="alert"
        className="rounded-lg border border-sale/30 bg-sale/10 px-4 py-3 text-sm font-medium text-sale"
      >
        {state.error}
      </p>
    );
  }
  if (state.message) {
    return (
      <p
        role="status"
        className="rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm font-medium text-success"
      >
        {state.message}
      </p>
    );
  }
  return null;
}

/** The link is the credential, so it's shown once, big, with a copy button —
 *  the admin has to actually deliver it for the invite to be worth anything. */
function InviteLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="rounded-lg border border-gold/40 bg-gold-soft p-4">
      <p className="text-sm font-semibold text-ink">
        Send them this link — it&rsquo;s the only way in
      </p>
      <p className="mt-1 text-xs text-muted">
        Valid for 14 days, usable once, and only by the address it was sent to.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <input
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          className="h-10 min-w-56 flex-1 rounded-lg border border-line bg-surface px-3 font-mono text-xs text-ink"
        />
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(url);
              setCopied(true);
            } catch {
              // Clipboard blocked — the field is selectable, so say nothing.
            }
          }}
          className="h-10 rounded-full bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-black"
        >
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>
    </div>
  );
}

export function TeamControls({
  members,
  invites,
  currentUserId,
}: {
  members: TeamMember[];
  invites: PendingInvite[];
  currentUserId: string;
}) {
  const [inviteState, inviteAction, inviting] = useActionState(inviteAdmin, EMPTY);
  const [removeState, removeAction, removing] = useActionState(setAdminAccess, EMPTY);
  const [revokeState, revokeAction, revoking] = useActionState(revokeInvite, EMPTY);
  const lastAdmin = members.length <= 1;

  return (
    <div className="space-y-8">
      <section className="space-y-3">
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
                  <form action={removeAction}>
                    <input type="hidden" name="email" value={member.email} />
                    <input type="hidden" name="make" value="false" />
                    <button
                      type="submit"
                      disabled={removing}
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
        <Notice state={removeState} />
      </section>

      {invites.length > 0 && (
        <section className="space-y-3">
          <h3 className="font-display text-lg text-ink">
            Invites waiting to be accepted
          </h3>
          <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
            {invites.map((invite) => (
              <li
                key={invite.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">{invite.email}</p>
                  <p className="mt-0.5 text-xs text-faint">
                    {invite.expired
                      ? `Expired ${shortDate(invite.expiresAt)}`
                      : `Expires ${shortDate(invite.expiresAt)}`}
                    {invite.invitedByEmail ? ` · invited by ${invite.invitedByEmail}` : ""}
                  </p>
                </div>
                <form action={revokeAction}>
                  <input type="hidden" name="id" value={invite.id} />
                  <button
                    type="submit"
                    disabled={revoking}
                    className="rounded-full border border-line-strong px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Revoke
                  </button>
                </form>
              </li>
            ))}
          </ul>
          <Notice state={revokeState} />
        </section>
      )}

      <section className="rounded-xl border border-line bg-surface p-5">
        <h3 className="font-display text-lg text-ink">Add an admin</h3>
        <p className="mt-1 text-sm text-muted">
          Enter their email. If they already have an abdmall account they become
          an admin straight away; if not, you&rsquo;ll get a link to send them.
        </p>

        <form action={inviteAction} className="mt-4 flex flex-wrap gap-3">
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
            disabled={inviting}
            className="h-11 rounded-full bg-brand px-6 text-sm font-semibold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
          >
            {inviting ? "Working…" : "Add admin"}
          </button>
        </form>

        <div className="mt-4 space-y-3">
          <Notice state={inviteState} />
          {inviteState.inviteUrl && <InviteLink url={inviteState.inviteUrl} />}
        </div>
      </section>
    </div>
  );
}
