import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { listAdmins, listInvites } from "@/lib/admin-team";
import { TeamControls } from "@/components/admin/team-controls";

export const metadata: Metadata = { title: "Team" };

export default async function AdminTeamPage() {
  const { user } = await requireAdmin();
  const [members, invites] = await Promise.all([listAdmins(), listInvites()]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl text-ink">Team</h2>
        <p className="mt-0.5 text-sm text-muted">
          {members.length} admin{members.length === 1 ? "" : "s"}
          {invites.length > 0 ? `, ${invites.length} invite pending` : ""} ·
          everyone here can edit the catalogue and see every order
        </p>
      </div>

      <TeamControls
        members={members}
        invites={invites}
        currentUserId={user.id}
      />

      <p className="text-xs text-faint">
        Admin access is checked by the database on every request, so changes
        take effect immediately — nobody has to sign out and back in.
      </p>
    </div>
  );
}
