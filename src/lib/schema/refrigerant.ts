/**
 * JSON-LD @graph builder for /refrigerant/[slug]/ pages.
 *
 * Emits 5 schema.org entities (plus the shared ORG + WEBSITE):
 *   Article + DefinedTerm + Dataset + FAQPage + BreadcrumbList
 *
 * Per docs/spec/06-SCHEMA_INVENTORY.md §Page type 1.
 */

import type { Refrigerant } from "@/data/refrigerants";
import type { FAQ } from "@/lib/mdx";
import { ORG, SITE_URL, WEBSITE } from "./shared";

function oneLineDescription(r: Refrigerant): string {
  const compositionPart =
    r.composition.length > 0
      ? r.composition
          .map((c) => `${(c.massFraction * 100).toFixed(c.massFraction * 100 < 10 ? 1 : 0)}% ${c.component}`)
          .join("/")
      : null;
  const gwpPart = r.environmental.gwp100Ar5 !== null ? `GWP ${r.environmental.gwp100Ar5} (AR5)` : null;
  const odpPart = r.environmental.odp !== null && r.environmental.odp !== 0 ? `ODP ${r.environmental.odp}` : null;

  const head =
    compositionPart
      ? `${typeLabel(r.type)} blend (${compositionPart})`
      : `${typeLabel(r.type)} ${chemNoun(r)}`;

  return [head, `ASHRAE class ${r.safetyClass}`, odpPart, gwpPart].filter(Boolean).join(", ") + ".";
}

function typeLabel(t: Refrigerant["type"]): string {
  switch (t) {
    case "cfc": return "Chlorofluorocarbon (CFC)";
    case "hcfc": return "Hydrochlorofluorocarbon (HCFC)";
    case "hfc-pure": return "Hydrofluorocarbon (HFC)";
    case "hfc-blend": return "HFC";
    case "hfo-pure": return "Hydrofluoroolefin (HFO)";
    case "hfo-blend": return "HFO";
    case "hc": return "Hydrocarbon";
    case "natural": return "Natural refrigerant";
  }
}

function chemNoun(r: Refrigerant): string {
  return r.chemicalName.length < 60 ? r.chemicalName.toLowerCase() : "refrigerant";
}

function datasetDescription(r: Refrigerant): string {
  const range =
    r.ptChart.length > 0
      ? `from ${r.ptChart[0].tempF}°F to ${r.ptChart[r.ptChart.length - 1].tempF}°F at 1°F increments`
      : "(empty; pending datasheet transcription)";
  const verified =
    r.dataSource.ptChartVerifiedAgainst.length > 0
      ? `Cross-checked against ${r.dataSource.ptChartVerifiedAgainst.join("; ")}.`
      : "";
  return `Bubble and dew point saturation pressures for ${r.displayName} refrigerant ${range}. Source: ${r.dataSource.ptChartSource}. ${verified}`.trim();
}

export function buildRefrigerantSchema(r: Refrigerant, faqs: FAQ[]): object[] {
  const pageUrl = `${SITE_URL}/refrigerant/${r.slug}/`;
  const altNames = [...new Set([...r.altSpellings, ...r.tradeNames.map((t) => t.name)])];

  const graph: object[] = [
    ORG,
    WEBSITE,
    {
      "@type": "Article",
      "@id": `${pageUrl}#article`,
      headline: `${r.displayName} Pressure Temperature Chart, Properties & Operating Pressures`,
      description: `Verified saturation pressure-temperature data for ${r.displayName} refrigerant, plus critical properties, GWP, ASHRAE safety class, and lubricant compatibility. Generated from ${r.dataSource.ptChartSource}.`,
      url: pageUrl,
      mainEntityOfPage: pageUrl,
      datePublished: r.dataSource.ptChartGeneratedAt,
      dateModified: r.dataSource.ptChartGeneratedAt,
      publisher: { "@id": `${SITE_URL}/#organization` },
      author: { "@id": `${SITE_URL}/#organization` },
      about: { "@id": `${pageUrl}#refrigerant` },
      isPartOf: { "@id": `${SITE_URL}/#website` },
      inLanguage: "en-US",
    },
    {
      "@type": "DefinedTerm",
      "@id": `${pageUrl}#refrigerant`,
      name: r.displayName,
      alternateName: altNames,
      termCode: r.ashraeNumber,
      description: oneLineDescription(r),
      inDefinedTermSet: {
        "@type": "DefinedTermSet",
        name: "ASHRAE 34 Refrigerant Designations",
        url: "https://www.ashrae.org/technical-resources/standards-and-guidelines",
      },
    },
    {
      "@type": "Dataset",
      "@id": `${pageUrl}#dataset`,
      name: `${r.displayName} Saturation Pressure-Temperature Data`,
      alternateName: `${r.displayName} PT Chart`,
      description: datasetDescription(r),
      url: pageUrl,
      license: "https://creativecommons.org/licenses/by/4.0/",
      creator: { "@id": `${SITE_URL}/#organization` },
      datePublished: r.dataSource.ptChartGeneratedAt,
      dateModified: r.dataSource.ptChartGeneratedAt,
      keywords: [
        r.displayName,
        "pressure temperature chart",
        "saturation pressure",
        `${typeLabel(r.type)} refrigerant`,
        ...r.tradeNames.map((t) => t.name),
        "HVAC reference",
      ],
      variableMeasured: [
        { "@type": "PropertyValue", name: "Temperature", unitText: "DEG F", unitCode: "FAH", minValue: r.ptChart[0]?.tempF ?? null, maxValue: r.ptChart[r.ptChart.length - 1]?.tempF ?? null },
        { "@type": "PropertyValue", name: "Bubble point pressure", unitText: "PSIG", unitCode: "PS", description: "Saturated liquid pressure (gauge)" },
        ...(r.physical.hasSignificantGlide
          ? [{ "@type": "PropertyValue", name: "Dew point pressure", unitText: "PSIG", unitCode: "PS", description: "Saturated vapor pressure (gauge)" }]
          : []),
      ],
      distribution: [
        { "@type": "DataDownload", encodingFormat: "text/csv", contentUrl: `${SITE_URL}/data/refrigerant/${r.slug}/csv/`, name: "CSV download" },
        { "@type": "DataDownload", encodingFormat: "application/json", contentUrl: `${SITE_URL}/data/refrigerant/${r.slug}/json/`, name: "JSON download" },
      ],
      isAccessibleForFree: true,
      spatialCoverage: { "@type": "Place", name: "Global (thermodynamic data)" },
      citation: r.dataSource.ptChartVerifiedAgainst,
    },
  ];

  if (faqs.length > 0) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${pageUrl}#faq`,
      mainEntity: faqs.map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    });
  }

  graph.push({
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL + "/" },
      { "@type": "ListItem", position: 2, name: "PT Charts", item: `${SITE_URL}/pt-charts-tools-hub/` },
      { "@type": "ListItem", position: 3, name: r.displayName },
    ],
  });

  return graph;
}
