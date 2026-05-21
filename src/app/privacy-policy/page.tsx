import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { ORG, SITE_URL, WEBSITE } from "@/lib/schema/shared";

const PAGE_URL = `${SITE_URL}/privacy-policy/`;

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for HVAC PT Charts. What data is collected (very little), how it's used, and how to opt out.",
  alternates: { canonical: PAGE_URL },
};

export default function PrivacyPage() {
  return (
    <>
      <JsonLd
        graph={[
          ORG,
          WEBSITE,
          {
            "@type": "WebPage",
            "@id": `${PAGE_URL}#webpage`,
            url: PAGE_URL,
            name: "Privacy Policy",
            isPartOf: { "@id": `${SITE_URL}/#website` },
          },
          {
            "@type": "BreadcrumbList",
            "@id": `${PAGE_URL}#breadcrumb`,
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
              { "@type": "ListItem", position: 2, name: "Privacy" },
            ],
          },
        ]}
      />
      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span aria-hidden> / </span>
          <span aria-current="page">Privacy</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Privacy Policy</h1>
          <p className="mt-3 text-sm text-zinc-500">Effective date: 2026-05-21. Last updated: 2026-05-21.</p>
        </header>

        <section className="prose prose-zinc max-w-none dark:prose-invert">
          <h2>Short version</h2>
          <p>
            HVAC PT Charts is a static reference site. There are no user accounts. There is no advertising in this
            version. No personally identifiable information is collected by the site itself.
          </p>

          <h2>What is collected</h2>
          <p>
            <strong>Server access logs.</strong> The hosting provider (Vercel) records standard access logs:
            timestamp, requested URL, IP address, user agent, referrer. These are used for operational purposes
            (security, uptime, debugging) and are retained per Vercel&apos;s log retention policy.
          </p>
          <p>
            <strong>Aggregate page-view analytics.</strong> When enabled, the site uses{" "}
            <a href="https://vercel.com/docs/analytics" rel="nofollow">Vercel Analytics</a>, which records aggregate
            page views without setting third-party tracking cookies or collecting personally identifiable
            information. No cross-site tracking; no advertising IDs.
          </p>
          <p>
            <strong>Data downloads.</strong> If you download the CSV or JSON dataset for a refrigerant, the download
            is served as a standard HTTP response from the CDN. No additional information is collected beyond the
            standard access log.
          </p>

          <h2>What is not collected</h2>
          <ul>
            <li>No cookies for tracking or advertising.</li>
            <li>No third-party analytics scripts (Google Analytics, Meta Pixel, etc.).</li>
            <li>No advertising; no ad-network tracking.</li>
            <li>No user accounts, no email signups, no newsletters.</li>
            <li>No contact form data — see the Contact page for the manual email address.</li>
          </ul>

          <h2>Cookies</h2>
          <p>
            The site does not set tracking cookies. The browser may set local cookies for technical purposes (e.g.,
            preferences for unit display) — these are scoped to the site and not transmitted to third parties.
          </p>

          <h2>Children</h2>
          <p>
            The site is intended for HVAC professionals and is not directed at children under 13. No information is
            knowingly collected from children.
          </p>

          <h2>Your rights (EU / California)</h2>
          <p>
            Because the site does not collect personally identifiable information, there is no personal data file
            associated with you to request, correct, or delete. Vercel&apos;s access logs are governed by their own
            data-handling practices.
          </p>

          <h2>Changes</h2>
          <p>
            If material privacy practices change (e.g., advertising is added), this page will be updated and the
            effective date revised.
          </p>

          <h2>Questions</h2>
          <p>
            See the <Link href="/contact-us/">Contact page</Link> for the current contact email.
          </p>
        </section>
      </article>
    </>
  );
}
