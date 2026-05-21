import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { ORG, SITE_URL, WEBSITE } from "@/lib/schema/shared";

const PAGE_URL = `${SITE_URL}/contact-us/`;

export const metadata: Metadata = {
  title: "Contact HVAC PT Charts",
  description: "How to get in touch with HVAC PT Charts — corrections, data questions, suggestions.",
  alternates: { canonical: PAGE_URL },
};

export default function ContactPage() {
  return (
    <>
      <JsonLd
        graph={[
          ORG,
          WEBSITE,
          {
            "@type": "ContactPage",
            "@id": `${PAGE_URL}#contactpage`,
            url: PAGE_URL,
            name: "Contact HVAC PT Charts",
            mainEntity: { "@id": `${SITE_URL}/#organization` },
          },
          {
            "@type": "BreadcrumbList",
            "@id": `${PAGE_URL}#breadcrumb`,
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
              { "@type": "ListItem", position: 2, name: "Contact" },
            ],
          },
        ]}
      />
      <article className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span aria-hidden> / </span>
          <span aria-current="page">Contact</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Contact</h1>
          <p className="mt-3 text-lg text-zinc-700 dark:text-zinc-300">
            The fastest way to flag a wrong number, propose an addition, or ask a technical question.
          </p>
        </header>

        <section className="prose prose-zinc max-w-none dark:prose-invert">
          <h2>Corrections and data questions</h2>
          <p>
            If you spot a saturation pressure that doesn&apos;t match your manufacturer datasheet or your CoolProp
            run, please send the refrigerant, temperature, the value the site shows, the value you have, and the
            source you&apos;re comparing against. Cross-check material is especially helpful.
          </p>
          <p>
            For per-refrigerant editorial pages that don&apos;t exist yet (manufacturer-blend PT data, missing
            narrative), the structural answer is that the page renders with data + chart and omits the prose
            section until the editorial pass picks it up.
          </p>

          <h2>Suggestions and additions</h2>
          <p>
            Calculators, refrigerants, or reference data the field tech world wants that the site doesn&apos;t cover
            yet: send a note. The data layer is set up so adding a new refrigerant is a config + regeneration + MDX
            commit, not a re-architecture.
          </p>

          <h2>Email</h2>
          <p>
            <strong>[Marko — replace this placeholder with the contact email address before launch]</strong>
          </p>
          <p>
            All correspondence is reviewed by a human; expect a response within a few business days. The site
            doesn&apos;t use a contact form to keep the surface area small and to avoid the spam-vector overhead of a
            form endpoint.
          </p>

          <h2>Not a service request channel</h2>
          <p>
            HVAC PT Charts is a reference site. It is not a service-call referral, equipment recommendation, or
            licensed-professional consultation. For active troubleshooting on a specific system, contact a local
            HVAC contractor or EPA Section 608 certified technician.
          </p>
        </section>

        <section className="mt-10 flex flex-wrap gap-3 text-sm">
          <Link href="/about-us/" className="rounded-md border border-zinc-300 px-3 py-1.5 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900">About this site</Link>
          <Link href="/privacy-policy/" className="rounded-md border border-zinc-300 px-3 py-1.5 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900">Privacy</Link>
          <Link href="/terms-of-service/" className="rounded-md border border-zinc-300 px-3 py-1.5 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900">Terms</Link>
        </section>
      </article>
    </>
  );
}
