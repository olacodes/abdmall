import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { InviteAccept } from "@/components/invite-accept";
import { ButtonLink } from "@/components/ui/button";
import { ArrowRight } from "@/components/icons";

export const metadata: Metadata = {
  title: "Admin invite",
  robots: { index: false, follow: false },
};

type InviteState = "pending" | "accepted" | "expired" | "revoked";

function Shell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-5 py-20 text-center">
      <p className="eyebrow">abdmall admin</p>
      <h1 className="mt-2 font-display text-3xl text-ink">{title}</h1>
      <div className="mt-6 flex w-full flex-col items-center gap-4">
        {children}
      </div>
    </div>
  );
}

/**
 * Where an invite link lands. Deliberately outside /admin — the proxy sends
 * signed-out visitors of /admin to sign-in and requireAdmin 404s everyone else,
 * so an invitee could never reach a page nested under it.
 */
export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();

  const { data } = await supabase.rpc("admin_invite_status", { p_token: token });
  const invite = (data ?? [])[0] as
    | { email: string; state: InviteState }
    | undefined;

  if (!invite) {
    return (
      <Shell title="This invite link isn't valid">
        <p className="text-muted">
          Check you copied the whole link, or ask whoever invited you for a new
          one.
        </p>
        <ButtonLink href="/" size="lg">
          Go to the store <ArrowRight className="h-4 w-4" />
        </ButtonLink>
      </Shell>
    );
  }

  if (invite.state !== "pending") {
    const reason = {
      accepted: "This invite has already been used.",
      expired: "This invite has expired.",
      revoked: "This invite was revoked.",
    }[invite.state];

    return (
      <Shell title="This invite can't be used">
        <p className="text-muted">{reason} Ask for a new link.</p>
        <ButtonLink href="/" size="lg">
          Go to the store <ArrowRight className="h-4 w-4" />
        </ButtonLink>
      </Shell>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Shell title="You've been invited to help run abdmall">
        <p className="text-muted">
          This invite is for{" "}
          <span className="font-semibold text-ink">{invite.email}</span>. Sign in
          with that address — or create an account with it — then come back to
          this link to accept.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <ButtonLink href="/sign-up" size="lg">
            Create an account
          </ButtonLink>
          <Link
            href="/sign-in"
            className="inline-flex h-12 items-center rounded-full border border-line-strong px-6 text-sm font-semibold text-ink transition-colors hover:bg-surface-2"
          >
            I already have one
          </Link>
        </div>
      </Shell>
    );
  }

  if (user.email?.toLowerCase() !== invite.email.toLowerCase()) {
    return (
      <Shell title="Wrong account">
        <p className="text-muted">
          This invite was sent to{" "}
          <span className="font-semibold text-ink">{invite.email}</span>, but
          you&rsquo;re signed in as{" "}
          <span className="font-semibold text-ink">{user.email}</span>. Sign out
          and use the invited account.
        </p>
        <ButtonLink href="/account" size="lg">
          Go to your account <ArrowRight className="h-4 w-4" />
        </ButtonLink>
      </Shell>
    );
  }

  return (
    <Shell title="You've been invited to help run abdmall">
      <p className="text-muted">
        Accepting gives{" "}
        <span className="font-semibold text-ink">{invite.email}</span> access to
        the catalogue, every order, and product images.
      </p>
      <InviteAccept token={token} />
    </Shell>
  );
}
