import type { Metadata } from "next";
import Link from "next/link";
import { refrigerants } from "@/data/refrigerants";
import { JsonLd } from "@/components/seo/JsonLd";
import { ORG, SITE_URL, WEBSITE } from "@/lib/schema/shared";
import { SafetyClassTable } from "@/components/reference/SafetyClassTable";
import { SafetyClassChip } from "@/components/svg/SafetyClassChip";

const PAGE_URL = `${SITE_URL}/refrigerant-safety-classifications/`;
const PUBLISHED = refrigerants[0]?.dataSource.ptChartGeneratedAt ?? new Date().toISOString();

export const metadata: Metadata = {
  title: "Refrigerant Safety Classifications — ASHRAE 34",
  description:
    "Searchable table of every common HVAC refrigerant classified per ANSI/ASHRAE Standard 34-2022. A1, A2L, A2, A3, B1, B2L explained with the full table of 61 refrigerants.",
  alternates: { canonical: PAGE_URL },
};

function buildSchema() {
  return [
    ORG,
    WEBSITE,
    {
      "@type": "Article",
      "@id": `${PAGE_URL}#article`,
      headline: "Refrigerant Safety Classifications — ASHRAE 34",
      description:
        "Reference table of HVAC refrigerant safety classifications per ANSI/ASHRAE Standard 34-2022. Every refrigerant in the dataset, sortable and filterable by class and type.",
      url: PAGE_URL,
      datePublished: PUBLISHED,
      dateModified: PUBLISHED,
      publisher: { "@id": `${SITE_URL}/#organization` },
      author: { "@id": `${SITE_URL}/#organization` },
      mainEntityOfPage: PAGE_URL,
      isPartOf: { "@id": `${SITE_URL}/#website` },
    },
    {
      "@type": "Dataset",
      "@id": `${PAGE_URL}#dataset`,
      name: "HVAC Refrigerant Safety Classifications",
      description:
        "ASHRAE 34-2022 safety classifications for 61 common HVAC refrigerants, with toxicity / flammability descriptors and source citations.",
      url: PAGE_URL,
      license: "https://creativecommons.org/licenses/by/4.0/",
      creator: { "@id": `${SITE_URL}/#organization` },
      isAccessibleForFree: true,
      citation: [
        "ANSI/ASHRAE Standard 34-2022: Designation and Safety Classification of Refrigerants",
        "UL 60335-2-40 (A2L charge limits and equipment design)",
        "EPA Section 608 program documentation",
        "IIAR standards (for B2L ammonia handling)",
      ],
      variableMeasured: [
        { "@type": "PropertyValue", name: "Refrigerant designation" },
        { "@type": "PropertyValue", name: "ASHRAE 34 safety class" },
        { "@type": "PropertyValue", name: "Refrigerant type" },
      ],
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${PAGE_URL}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "PT Charts", item: `${SITE_URL}/pt-charts-tools-hub/` },
        { "@type": "ListItem", position: 3, name: "Safety Classifications" },
      ],
    },
  ];
}

export default function SafetyClassificationsPage() {
  const counts = countByClass();

  return (
    <>
      <JsonLd graph={buildSchema()} />
      <article className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-500">
          <Link href="/" className="hover:underline">Home</Link>
          <span aria-hidden> / </span>
          <Link href="/pt-charts-tools-hub/" className="hover:underline">PT Charts</Link>
          <span aria-hidden> / </span>
          <span aria-current="page">Safety Classifications</span>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Refrigerant Safety Classifications</h1>
          <p className="mt-3 text-lg text-zinc-700 dark:text-zinc-300">
            ANSI/ASHRAE Standard 34-2022 classifies refrigerants by toxicity (Class A or B) and flammability
            (Subclass 1, 2L, 2, or 3). The combination — A1, A2L, A3, B1, B2L, and so on — determines equipment
            requirements, charge limits, leak detection, and machine room ventilation under codes including UL
            60335-2-40 and ASHRAE 15.
          </p>
        </header>

        <section className="mb-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(["A1", "A2L", "A2", "A3", "B1", "B2L"] as const).map((c) => (
            <div key={c} className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <SafetyClassChip safetyClass={c} size="sm" />
                <span className="text-xs font-mono text-zinc-500">{counts[c] ?? 0}/{refrigerants.length}</span>
              </div>
              <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">{shortGloss(c)}</p>
            </div>
          ))}
        </section>

        <section className="mb-10">
          <h2 className="mb-3 text-xl font-semibold">How to read the class code</h2>
          <div className="prose prose-zinc max-w-none dark:prose-invert">
            <p>
              <strong>Letter (A or B)</strong> indicates toxicity. <strong>A-class</strong> refrigerants have lower
              toxicity — the Occupational Exposure Limit (OEL) is 400 ppm or higher. <strong>B-class</strong>{" "}
              refrigerants have higher toxicity, with an OEL below 400 ppm.
            </p>
            <p>
              <strong>Number (1, 2L, 2, or 3)</strong> indicates flammability.
              <em> 1</em>: no flame propagation at 60°C in air.
              <em> 2L</em>: flame propagates with a low burning velocity (≤ 10 cm/s) and a lower heating value below
              19,000 kJ/kg.
              <em> 2</em>: flame propagates with a burning velocity between 10 and 100 cm/s.
              <em> 3</em>: high burning velocity (above 100 cm/s) or high heat of combustion.
            </p>
            <p>
              So <strong>A2L</strong> means lower toxicity + low burning velocity (the category for R-32, R-454B,
              R-1234yf, R-1234ze). <strong>B2L</strong> means higher toxicity + low burning velocity (the category
              for R-717 ammonia). <strong>A3</strong> is lower toxicity + highly flammable (R-290 propane, R-600a
              isobutane, R-1150 ethylene).
            </p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 text-xl font-semibold">All refrigerants in the dataset</h2>
          <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
            Click a column heading to sort. Use the filters to narrow by type or class. Each refrigerant name links to its
            full reference page with PT chart and properties.
          </p>
          <SafetyClassTable />
        </section>

        <footer className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-xs leading-relaxed text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
          <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Sources</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>ANSI/ASHRAE Standard 34-2022: Designation and Safety Classification of Refrigerants</li>
            <li>UL 60335-2-40 (A2L charge limits, equipment design, leak detection requirements)</li>
            <li>ASHRAE Standard 15 (machine room ventilation, refrigerant detection)</li>
            <li>EPA Section 608 program documentation (technician certification, refrigerant management)</li>
            <li>IIAR standards (industrial ammonia refrigeration — B2L handling)</li>
          </ul>
          <p className="mt-3">
            Classifications are stored as a Zod-validated enum on each refrigerant record (<code>r.safetyClass</code>). The
            rendering on this page and across the site reads that field directly — it is structurally impossible to render
            the wrong class for a refrigerant once the enum value is set correctly.
          </p>
        </footer>
      </article>
    </>
  );
}

function countByClass() {
  const out: Record<string, number> = {};
  for (const r of refrigerants) {
    out[r.safetyClass] = (out[r.safetyClass] ?? 0) + 1;
  }
  return out;
}

function shortGloss(c: string): string {
  switch (c) {
    case "A1": return "Lower toxicity, no flame propagation. The safest category.";
    case "A2L": return "Lower toxicity, low burning velocity. Requires A2L-rated equipment + leak detection.";
    case "A2": return "Lower toxicity, flammable. Uncommon in HVAC.";
    case "A3": return "Lower toxicity, highly flammable. Hydrocarbon class — propane, isobutane, ethylene, propylene.";
    case "B1": return "Higher toxicity, no flame propagation. R-123 and other centrifugal-chiller refrigerants.";
    case "B2L": return "Higher toxicity, low burning velocity. Ammonia class — industrial refrigeration.";
    default: return "";
  }
}
