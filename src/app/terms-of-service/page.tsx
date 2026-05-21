import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { ORG, SITE_URL, WEBSITE } from "@/lib/schema/shared";

const PAGE_URL = `${SITE_URL}/terms-of-service/`;

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of service for HVAC PT Charts: what the site is, what it isn't, disclaimers, intellectual property.",
  alternates: { canonical: PAGE_URL },
};

export default function TermsPage() {
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
            name: "Terms of Service",
            isPartOf: { "@id": `${SITE_URL}/#website` },
          },
          {
            "@type": "BreadcrumbList",
            "@id": `${PAGE_URL}#breadcrumb`,
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
              { "@type": "ListItem", position: 2, name: "Terms" },
            ],
          },
        ]}
      />
      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span aria-hidden> / </span>
          <span aria-current="page">Terms</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Terms of Service</h1>
          <p className="mt-3 text-sm text-zinc-500">Effective date: 2026-05-21. Last updated: 2026-05-21.</p>
        </header>

        <section className="prose prose-zinc max-w-none dark:prose-invert">
          <h2>What the site is</h2>
          <p>
            HVAC PT Charts is an open-access reference site for HVAC professionals and serious DIYers. It provides
            saturation pressure-temperature data for {`refrigerants`} commonly used in HVAC and refrigeration, plus
            calculators built on that data and reference material on safety classifications, regulatory status, and
            comparison of refrigerants.
          </p>

          <h2>What the site is not</h2>
          <p>
            <strong>Not professional advice.</strong> The site is reference material. It is not engineering
            consultation, licensed-professional advice, or service-call recommendation. For active troubleshooting
            on a specific system, contact a local HVAC contractor or EPA Section 608 certified technician.
          </p>
          <p>
            <strong>Not an authoritative regulatory source.</strong> Regulatory status (EPA AIM Act, SNAP, Montreal
            Protocol, EU F-Gas) is reported as a reference; for compliance decisions, consult the original
            regulation and a qualified compliance professional.
          </p>
          <p>
            <strong>Not a replacement for equipment data plates.</strong> Saturation pressures are thermodynamic
            reference values. Operating pressures and charging procedures depend on equipment design and must be
            verified against the equipment data plate and manufacturer service literature.
          </p>

          <h2>Use of data</h2>
          <p>
            The saturation PT dataset for each refrigerant is released under{" "}
            <a href="https://creativecommons.org/licenses/by/4.0/" rel="nofollow">Creative Commons Attribution 4.0</a>{" "}
            (CC BY 4.0). You may use, redistribute, adapt, and incorporate the data into your own tooling, with
            attribution to HVAC PT Charts.
          </p>
          <p>
            Page content — narrative, images, and code — is © HVAC PT Charts unless otherwise noted. Limited
            quotation with attribution is welcome; bulk reproduction is not authorized without permission.
          </p>

          <h2>Disclaimer of warranties</h2>
          <p>
            The site is provided &quot;as is&quot; without warranty of any kind, express or implied. Saturation
            pressures are computed from CoolProp 7.2.0 or transcribed from named manufacturer datasheets; while
            every value is verified at build time against known anchors and bounded by physical constraints, no
            guarantee is made that any specific value is fit for any specific purpose. The user is responsible for
            verifying values against the manufacturer&apos;s authoritative reference before applying them to a
            specific system.
          </p>

          <h2>Limitation of liability</h2>
          <p>
            In no event shall HVAC PT Charts or its operators be liable for any direct, indirect, incidental,
            special, or consequential damages arising from the use of, or inability to use, the site or its data.
            This includes but is not limited to equipment damage, service errors, financial loss, or personal injury.
          </p>

          <h2>External links</h2>
          <p>
            The site links to external resources — IPCC reports, EPA pages, manufacturer datasheets, ASHRAE
            standards. These links are provided for reference; HVAC PT Charts is not responsible for the content,
            accuracy, or availability of external resources.
          </p>

          <h2>Changes</h2>
          <p>
            Terms may be updated as the site evolves. Material changes will be reflected in the effective date at
            the top of this page.
          </p>

          <h2>Governing law and contact</h2>
          <p>
            For questions about these terms, see the <Link href="/contact-us/">Contact page</Link>.
          </p>
        </section>
      </article>
    </>
  );
}
