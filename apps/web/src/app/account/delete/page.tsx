import type { Metadata } from "next";
import { DeleteAccountPanel } from "@/components/account/delete-account-panel";

/**
 * Closing an account, from the web.
 *
 * Deliberately reachable while signed out: both app stores require a deletion
 * route someone can follow after uninstalling, and this URL is the one given
 * to Google Play. So the explanation of what happens is rendered on the
 * server and the page reads correctly with no JavaScript at all — only the
 * confirm step, which needs to know who is signed in, is a client component.
 */

export const metadata: Metadata = {
  title: "Delete your account",
  description:
    "Close your abdmall account. Your sign-in, profile and saved addresses are deleted; past orders are kept as a record of sale.",
  robots: { index: false, follow: false },
};

export default function DeleteAccountPage() {
  return (
    <div className="mx-auto max-w-xl px-5 py-16 sm:px-8">
      <p className="eyebrow">Your account</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ink">
        Delete your abdmall account
      </h1>

      {/* Static, so it is in the HTML whether or not scripts run. */}
      <div className="mt-6 rounded-xl border border-line bg-surface p-5 text-sm">
        <p className="font-semibold text-ink">What gets deleted</p>
        <ul className="mt-2 flex list-disc flex-col gap-1 pl-5 text-muted">
          <li>Your sign-in and password</li>
          <li>Your profile — name and phone number</li>
          <li>Any saved delivery addresses</li>
        </ul>
        <p className="mt-4 font-semibold text-ink">What we have to keep</p>
        <ul className="mt-2 flex list-disc flex-col gap-1 pl-5 text-muted">
          <li>
            Past orders stay on file, because we&rsquo;re required to keep a
            record of sales. They are no longer linked to an account, and
            you won&rsquo;t be able to see them here any more.
          </li>
        </ul>
        <p className="mt-4 text-faint">
          This cannot be undone. Shopping as a guest still works, and you can
          create a new account at any time.
        </p>
      </div>

      <div className="mt-6">
        <DeleteAccountPanel />
      </div>

      <p className="mt-6 text-sm text-muted">
        Can&rsquo;t sign in? Email{" "}
        <a
          href="mailto:support@abdmall.com?subject=Delete%20my%20account"
          className="font-semibold text-gold-deep underline-offset-4 hover:underline"
        >
          support@abdmall.com
        </a>{" "}
        from the address on the account and we&rsquo;ll close it for you.
      </p>
    </div>
  );
}
