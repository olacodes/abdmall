import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { getShopSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "What abdmall collects, why, who else sees it, and how to have it removed.",
};

/**
 * Required by Google Play and the App Store before either will publish the
 * app, and checked against the Data Safety declaration — so this has to
 * describe what the code actually does, not a template.
 *
 * Everything here was taken from the schema and the source: the columns in
 * `orders`, `profiles` and `addresses`; the absence of any analytics,
 * advertising or tracking package; and the fact that card details are entered
 * on Paystack's own page and never reach this system. If any of that changes,
 * this page and the store declarations have to change with it.
 */

const UPDATED = "27 October 2026";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-line pt-6">
      <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted">
        {children}
      </div>
    </section>
  );
}

export default async function PrivacyPage() {
  const settings = await getShopSettings();
  const email = settings.supportEmail ?? "support@abdmall.com";

  return (
    <>
      <PageHeader
        title="Privacy Policy"
        subtitle={`Last updated ${UPDATED}`}
        crumb="Privacy"
      />

      <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
        <p className="text-base leading-relaxed text-ink">
          This explains what abdmall collects when you shop with us, why we
          need it, and who else sees it. It covers both the abdmall website and
          the abdmall mobile app.
        </p>

        <div className="mt-8 space-y-8">
          <Section title="What we collect">
            <p>
              <strong className="text-ink">When you place an order</strong> —
              whether or not you have an account — we collect your name, email
              address, phone number and delivery address, along with what you
              ordered and the amount.
            </p>
            <p>
              <strong className="text-ink">When you create an account</strong>{" "}
              we store your email address and name, and any delivery addresses
              you choose to save so you do not have to type them again.
            </p>
            <p>
              <strong className="text-ink">When you pay</strong> we record which
              method you used and a payment reference from Paystack. That is
              all.
            </p>
          </Section>

          <Section title="What we do not collect">
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                <strong className="text-ink">
                  We never see your card details.
                </strong>{" "}
                Card numbers, PINs and bank passwords are entered on Paystack&rsquo;s
                own secure page and are never sent to us or stored by us.
              </li>
              <li>
                <strong className="text-ink">
                  We do not track you or advertise to you.
                </strong>{" "}
                abdmall contains no analytics, advertising or tracking software
                of any kind. We do not build a profile of you, and we have
                nothing to sell to advertisers.
              </li>
              <li>
                We do not collect your location, contacts, photos or anything
                else from your device.
              </li>
            </ul>
          </Section>

          <Section title="What is stored on your own device">
            <p>
              Your shopping basket and, if you are signed in, your login
              session are kept on your own phone or browser so the site
              remembers them between visits. They stay on your device and are
              cleared when you sign out or clear your browser data.
            </p>
          </Section>

          <Section title="Who else sees your information">
            <p>
              We use a small number of companies to run abdmall. They only
              receive what they need to do their part, and may not use it for
              anything else.
            </p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                <strong className="text-ink">Paystack</strong> — processes
                payments and handles your card details directly.
              </li>
              <li>
                <strong className="text-ink">Supabase</strong> — stores the
                database and manages accounts and sign-in.
              </li>
              <li>
                <strong className="text-ink">Vercel</strong> — hosts the
                website.
              </li>
              <li>
                <strong className="text-ink">Zoho</strong> — sends our emails,
                such as sign-up confirmations.
              </li>
            </ul>
            <p>
              <strong className="text-ink">
                We do not sell your information, and we do not share it for
                advertising.
              </strong>{" "}
              We will only hand it to anyone else if the law requires it.
            </p>
          </Section>

          <Section title="How long we keep it">
            <p>
              Order records are kept as business and accounting records. If you
              close your account, we remove your profile and saved addresses,
              but past orders remain on file because we are required to keep a
              record of sales.
            </p>
          </Section>

          <Section title="Your rights">
            <p>You can ask us at any time to:</p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>tell you what information we hold about you</li>
              <li>correct anything that is wrong</li>
              <li>delete your account</li>
            </ul>
            <p>
              Write to{" "}
              <a
                href={`mailto:${email}`}
                className="font-semibold text-gold-deep hover:underline"
              >
                {email}
              </a>{" "}
              and we will respond.
            </p>
          </Section>

          <Section title="Children">
            <p>
              abdmall is not intended for children under 18, and we do not
              knowingly collect information from them.
            </p>
          </Section>

          <Section title="Changes to this policy">
            <p>
              If we change how we handle your information, we will update this
              page and change the date at the top.
            </p>
          </Section>

          <Section title="Contact us">
            <p>
              Questions about this policy, or about information we hold, go to{" "}
              <a
                href={`mailto:${email}`}
                className="font-semibold text-gold-deep hover:underline"
              >
                {email}
              </a>
              {settings.supportPhone ? (
                <>
                  {" "}
                  or call{" "}
                  <span className="font-semibold text-ink">
                    {settings.supportPhone}
                  </span>
                </>
              ) : null}
              .
            </p>
          </Section>
        </div>
      </div>
    </>
  );
}
