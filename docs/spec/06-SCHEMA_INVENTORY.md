# SCHEMA_INVENTORY.md

JSON-LD structured data, page by page. The current site emits zero schema. The new site emits comprehensive, validated schema on every page — this is the highest-leverage SEO + LLM-citation work in the rebuild because (a) it's mechanical, (b) it costs us nothing in editorial effort, and (c) it directly affects rich result eligibility and AI overview inclusion.

## Why this matters specifically for this site

PT chart data is a textbook fit for the `Dataset` schema — it's reference data with clear units, well-defined provenance, and downloadable distributions. `Dataset` is underused on hobby/tech sites, which means it's a comparative advantage for citation. FAQ schema is table stakes. `HowTo` for charging/diagnostic procedures has rich-result history in Google's experiments. `DefinedTerm` on refrigerant pages signals "this is the canonical definition page for R-410A."

## Conventions

- All schema is rendered as a single `<script type="application/ld+json">` block per page, containing a `@graph` array of all the entities. Single block, multiple entities, with `@id` cross-references so the graph is internally linked.
- Every URL uses absolute form (`https://hvacptcharts.com/...`), not relative.
- Every `@id` uses a stable fragment identifier so entities can be referenced across schema. Pattern: `https://hvacptcharts.com/refrigerant/r-410a/#refrigerant` or `#article`, `#dataset`, etc.
- Dates are ISO 8601 with timezone (`2026-05-20T08:00:00Z`).
- Publisher and Organization are shared across all pages — defined once, referenced everywhere.

## Shared entities (defined once, referenced by `@id` everywhere)

```typescript
// src/lib/schema/shared.ts

export const ORG = {
  '@type': 'Organization',
  '@id': 'https://hvacptcharts.com/#organization',
  name: 'HVAC PT Charts',
  url: 'https://hvacptcharts.com',
  logo: {
    '@type': 'ImageObject',
    url: 'https://hvacptcharts.com/logo.png',
    width: 512,
    height: 512,
  },
  sameAs: [
    // Add real social profiles only when they exist; do not invent.
  ],
};

export const WEBSITE = {
  '@type': 'WebSite',
  '@id': 'https://hvacptcharts.com/#website',
  name: 'HVAC PT Charts',
  url: 'https://hvacptcharts.com',
  publisher: { '@id': 'https://hvacptcharts.com/#organization' },
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://hvacptcharts.com/?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
  inLanguage: 'en-US',
};
```

These two entities ARE emitted on every page so that Google's graph builder can reliably cross-reference them. They cost ~400 bytes; worth it.

## Template renderer

Single component that takes an array of entities and renders them as one script tag:

```tsx
// src/components/seo/JsonLd.tsx
export function JsonLd({ graph }: { graph: object[] }) {
  const data = {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

Used as: `<JsonLd graph={[ORG, WEBSITE, articleSchema, faqSchema, datasetSchema, breadcrumbSchema]} />`

## Schema by page type

### Page type 1: Refrigerant detail (`/refrigerant/{slug}/`)

**Emits 5 entities:** `Article`, `DefinedTerm`, `Dataset`, `FAQPage`, `BreadcrumbList`.

Full example for `/refrigerant/r-410a/`:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://hvacptcharts.com/#organization",
      "name": "HVAC PT Charts",
      "url": "https://hvacptcharts.com",
      "logo": { "@type": "ImageObject", "url": "https://hvacptcharts.com/logo.png" }
    },
    {
      "@type": "WebSite",
      "@id": "https://hvacptcharts.com/#website",
      "name": "HVAC PT Charts",
      "url": "https://hvacptcharts.com",
      "publisher": { "@id": "https://hvacptcharts.com/#organization" }
    },
    {
      "@type": "Article",
      "@id": "https://hvacptcharts.com/refrigerant/r-410a/#article",
      "headline": "R-410A Pressure Temperature Chart, Properties & Operating Pressures",
      "description": "Verified saturation pressure-temperature data for R-410A refrigerant from -40°F to 150°F, plus critical properties, GWP, safety class, and lubricant compatibility. Reference data for HVAC professionals.",
      "url": "https://hvacptcharts.com/refrigerant/r-410a/",
      "mainEntityOfPage": "https://hvacptcharts.com/refrigerant/r-410a/",
      "datePublished": "2026-05-20T08:00:00Z",
      "dateModified": "2026-05-20T08:00:00Z",
      "publisher": { "@id": "https://hvacptcharts.com/#organization" },
      "author": { "@id": "https://hvacptcharts.com/#organization" },
      "about": { "@id": "https://hvacptcharts.com/refrigerant/r-410a/#refrigerant" },
      "isPartOf": { "@id": "https://hvacptcharts.com/#website" },
      "inLanguage": "en-US"
    },
    {
      "@type": "DefinedTerm",
      "@id": "https://hvacptcharts.com/refrigerant/r-410a/#refrigerant",
      "name": "R-410A",
      "alternateName": ["R410A", "Puron", "Genetron AZ-20", "Suva 410A"],
      "termCode": "R-410A",
      "description": "Near-azeotropic blend of difluoromethane (R-32) and pentafluoroethane (R-125) in 50/50 mass proportion. ASHRAE safety class A1. GWP 2088 (IPCC AR5). Used in residential and light commercial air conditioning since the early 2000s, currently in phase-down under the US AIM Act.",
      "inDefinedTermSet": {
        "@type": "DefinedTermSet",
        "name": "ASHRAE 34 Refrigerant Designations",
        "url": "https://www.ashrae.org/technical-resources/standards-and-guidelines"
      }
    },
    {
      "@type": "Dataset",
      "@id": "https://hvacptcharts.com/refrigerant/r-410a/#dataset",
      "name": "R-410A Saturation Pressure-Temperature Data",
      "alternateName": "R-410A PT Chart",
      "description": "Bubble point and dew point saturation pressures for R-410A refrigerant from -40°F to 150°F at 1°F increments. Generated from CoolProp 7.2.0 thermodynamic equations of state (REFPROP-compatible) and verified against Arkema Forane 410A PT chart and ASHRAE Handbook of Refrigeration 2022 Chapter 29.",
      "url": "https://hvacptcharts.com/refrigerant/r-410a/",
      "license": "https://creativecommons.org/licenses/by/4.0/",
      "creator": { "@id": "https://hvacptcharts.com/#organization" },
      "datePublished": "2026-05-20T08:00:00Z",
      "dateModified": "2026-05-20T08:00:00Z",
      "keywords": ["R-410A", "pressure temperature chart", "saturation pressure", "HFC refrigerant", "Puron", "HVAC reference"],
      "variableMeasured": [
        {
          "@type": "PropertyValue",
          "name": "Temperature",
          "unitText": "DEG F",
          "unitCode": "FAH",
          "minValue": -40,
          "maxValue": 150
        },
        {
          "@type": "PropertyValue",
          "name": "Bubble point pressure",
          "unitText": "PSIG",
          "unitCode": "PS",
          "description": "Saturated liquid pressure (gauge)"
        },
        {
          "@type": "PropertyValue",
          "name": "Dew point pressure",
          "unitText": "PSIG",
          "unitCode": "PS",
          "description": "Saturated vapor pressure (gauge)"
        }
      ],
      "distribution": [
        {
          "@type": "DataDownload",
          "encodingFormat": "text/csv",
          "contentUrl": "https://hvacptcharts.com/data/refrigerant/r-410a.csv",
          "name": "CSV download"
        },
        {
          "@type": "DataDownload",
          "encodingFormat": "application/json",
          "contentUrl": "https://hvacptcharts.com/data/refrigerant/r-410a.json",
          "name": "JSON download"
        }
      ],
      "isAccessibleForFree": true,
      "spatialCoverage": { "@type": "Place", "name": "Global (thermodynamic data)" },
      "citation": [
        "CoolProp 7.2.0 — Bell, Wronski, Quoilin, Lemort (2014)",
        "ASHRAE Handbook of Refrigeration 2022, Chapter 29",
        "Arkema Forane 410A Pressure Temperature Chart",
        "IPCC AR5 (2013), Table 8.A.1 (GWP values)"
      ]
    },
    {
      "@type": "FAQPage",
      "@id": "https://hvacptcharts.com/refrigerant/r-410a/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is the normal operating pressure of R-410A?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "On a 95°F day with a properly charged residential R-410A system, expect low-side (suction) pressures around 130 PSIG and high-side (discharge) pressures around 350-400 PSIG. Saturation pressure at 95°F is 291 PSIG; actual operating values depend on superheat, subcooling, and ambient conditions."
          }
        },
        {
          "@type": "Question",
          "name": "What does R-410A's GWP of 2088 mean?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Global Warming Potential is a relative measure: one kilogram of R-410A released to the atmosphere traps about 2,088 times as much heat over 100 years as one kilogram of CO2. This IPCC AR5 figure is what the EPA uses to assign R-410A to the AIM Act phase-down tier."
          }
        },
        {
          "@type": "Question",
          "name": "Can I retrofit an R-22 system to R-410A?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. R-410A operates at substantially higher pressures than R-22 and uses an incompatible lubricant (POE instead of mineral oil). Retrofit requires replacing the compressor, expansion device, and possibly the indoor coil — at that point the economics favor full system replacement. For a true R-22 retrofit, consider R-407C, R-422D, R-438A, or R-427A."
          }
        },
        {
          "@type": "Question",
          "name": "Is R-410A flammable?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "R-410A is ASHRAE safety class A1: non-toxic and non-flammable under normal handling. Its near-term replacements R-32 and R-454B are class A2L (mildly flammable) and require different handling, leak-detection, and equipment design."
          }
        },
        {
          "@type": "Question",
          "name": "When will R-410A be phased out?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Production phase-down for new residential AC equipment under the EPA's AIM Act took effect January 1, 2025. R-410A itself remains legal to service existing equipment indefinitely under current regulations; the service supply is expected to increasingly come from reclaimed R-410A through the 2030s."
          }
        },
        {
          "@type": "Question",
          "name": "What lubricant does R-410A use?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Polyolester (POE) oil. POE is hygroscopic, so vacuum integrity matters more than with mineral-oil systems. Pull deep vacuum (500 microns or below, held for 30+ minutes) before charging. Mineral oil and alkylbenzene oils are not miscible with R-410A and must not be used."
          }
        }
      ]
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://hvacptcharts.com/refrigerant/r-410a/#breadcrumb",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://hvacptcharts.com/" },
        { "@type": "ListItem", "position": 2, "name": "PT Charts", "item": "https://hvacptcharts.com/pt-charts-tools-hub/" },
        { "@type": "ListItem", "position": 3, "name": "R-410A" }
      ]
    }
  ]
}
```

### Template implementation

```typescript
// src/lib/schema/refrigerant.ts
import { Refrigerant } from '@/data/refrigerants';
import { ORG, WEBSITE } from './shared';

export function buildRefrigerantSchema(r: Refrigerant, faqs: { q: string; a: string }[]) {
  const url = `https://hvacptcharts.com/refrigerant/${r.slug}/`;

  return [
    ORG,
    WEBSITE,
    {
      '@type': 'Article',
      '@id': `${url}#article`,
      headline: `${r.displayName} Pressure Temperature Chart, Properties & Operating Pressures`,
      description: `Verified saturation pressure-temperature data for ${r.displayName} refrigerant from -40°F to 150°F, plus critical properties, GWP, safety class, and lubricant compatibility.`,
      url,
      mainEntityOfPage: url,
      datePublished: r.dataSource.ptChartGeneratedAt,
      dateModified: r.dataSource.ptChartGeneratedAt,
      publisher: { '@id': 'https://hvacptcharts.com/#organization' },
      author: { '@id': 'https://hvacptcharts.com/#organization' },
      about: { '@id': `${url}#refrigerant` },
      isPartOf: { '@id': 'https://hvacptcharts.com/#website' },
      inLanguage: 'en-US',
    },
    {
      '@type': 'DefinedTerm',
      '@id': `${url}#refrigerant`,
      name: r.displayName,
      alternateName: [...r.altSpellings, ...r.tradeNames.map(t => t.name)],
      termCode: r.ashraeNumber,
      description: buildOneLineDescription(r), // helper that summarizes composition + class + GWP + use
      inDefinedTermSet: {
        '@type': 'DefinedTermSet',
        name: 'ASHRAE 34 Refrigerant Designations',
        url: 'https://www.ashrae.org/technical-resources/standards-and-guidelines',
      },
    },
    {
      '@type': 'Dataset',
      '@id': `${url}#dataset`,
      name: `${r.displayName} Saturation Pressure-Temperature Data`,
      alternateName: `${r.displayName} PT Chart`,
      description: buildDatasetDescription(r),  // helper that names the data source explicitly
      url,
      license: 'https://creativecommons.org/licenses/by/4.0/',
      creator: { '@id': 'https://hvacptcharts.com/#organization' },
      datePublished: r.dataSource.ptChartGeneratedAt,
      dateModified: r.dataSource.ptChartGeneratedAt,
      keywords: [
        r.displayName,
        'pressure temperature chart',
        'saturation pressure',
        `${r.type} refrigerant`,
        ...r.tradeNames.map(t => t.name),
        'HVAC reference',
      ],
      variableMeasured: [
        { '@type': 'PropertyValue', name: 'Temperature', unitText: 'DEG F', unitCode: 'FAH', minValue: -40, maxValue: 150 },
        { '@type': 'PropertyValue', name: 'Bubble point pressure', unitText: 'PSIG', unitCode: 'PS' },
        ...(r.physical.hasSignificantGlide
          ? [{ '@type': 'PropertyValue', name: 'Dew point pressure', unitText: 'PSIG', unitCode: 'PS' }]
          : []),
      ],
      distribution: [
        { '@type': 'DataDownload', encodingFormat: 'text/csv',  contentUrl: `https://hvacptcharts.com/data/refrigerant/${r.slug}.csv` },
        { '@type': 'DataDownload', encodingFormat: 'application/json', contentUrl: `https://hvacptcharts.com/data/refrigerant/${r.slug}.json` },
      ],
      isAccessibleForFree: true,
      citation: r.dataSource.ptChartVerifiedAgainst,
    },
    {
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      mainEntity: faqs.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://hvacptcharts.com/' },
        { '@type': 'ListItem', position: 2, name: 'PT Charts', item: 'https://hvacptcharts.com/pt-charts-tools-hub/' },
        { '@type': 'ListItem', position: 3, name: r.displayName },
      ],
    },
  ];
}
```

### Page type 2: Calculator (`/superheat-calculator/`, `/pt-calculator/`, etc.)

**Emits 4 entities:** `Article`, `WebApplication` (or `SoftwareApplication`), `FAQPage`, `BreadcrumbList`.

Full example for `/superheat-calculator/`:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    { "@id": "https://hvacptcharts.com/#organization", "@type": "Organization", "name": "HVAC PT Charts", "url": "https://hvacptcharts.com" },
    { "@id": "https://hvacptcharts.com/#website", "@type": "WebSite", "url": "https://hvacptcharts.com", "publisher": { "@id": "https://hvacptcharts.com/#organization" } },
    {
      "@type": "Article",
      "@id": "https://hvacptcharts.com/superheat-calculator/#article",
      "headline": "Superheat Calculator: Measure HVAC System Superheat in Seconds",
      "description": "Free superheat calculator for all common HVAC refrigerants. Enter your suction pressure and suction line temperature; get superheat instantly. Built on verified saturation data.",
      "url": "https://hvacptcharts.com/superheat-calculator/",
      "datePublished": "2026-05-20T08:00:00Z",
      "dateModified": "2026-05-20T08:00:00Z",
      "publisher": { "@id": "https://hvacptcharts.com/#organization" },
      "author": { "@id": "https://hvacptcharts.com/#organization" },
      "mainEntityOfPage": "https://hvacptcharts.com/superheat-calculator/",
      "isPartOf": { "@id": "https://hvacptcharts.com/#website" }
    },
    {
      "@type": "WebApplication",
      "@id": "https://hvacptcharts.com/superheat-calculator/#application",
      "name": "Superheat Calculator",
      "applicationCategory": "EngineeringApplication",
      "operatingSystem": "Web browser (any)",
      "url": "https://hvacptcharts.com/superheat-calculator/",
      "browserRequirements": "Requires JavaScript enabled",
      "isAccessibleForFree": true,
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": [
        "Supports 49 refrigerants with verified CoolProp data",
        "Imperial (°F, PSIG) and metric (°C, kPa) units",
        "Target superheat reference table for fixed-orifice and TXV systems",
        "Mobile-friendly, no signup required"
      ]
    },
    {
      "@type": "FAQPage",
      "@id": "https://hvacptcharts.com/superheat-calculator/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is superheat?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Superheat is the temperature of refrigerant vapor above its saturation temperature at the same pressure. In an HVAC system, superheat is measured at the suction line near the compressor: the actual suction line temperature minus the saturation temperature corresponding to the suction line pressure. Positive superheat means the refrigerant is fully vaporized; zero or negative superheat means liquid refrigerant is reaching the compressor — a damaging condition."
          }
        },
        {
          "@type": "Question",
          "name": "What is the target superheat for an HVAC system?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "It depends on the metering device. Fixed-orifice systems target 8-15°F superheat, calculated using the indoor wet-bulb and outdoor dry-bulb temperatures via a charging chart. TXV (thermostatic expansion valve) systems target a fixed 10-15°F superheat regardless of conditions. Refrigeration systems target 10-20°F. Always check the equipment label and manufacturer literature for the specific system."
          }
        },
        {
          "@type": "Question",
          "name": "How do I measure superheat in the field?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Connect a manifold gauge to the suction service port and read the pressure in PSIG. Use a contact or clamp-on temperature probe on the suction line within 6 inches of the compressor (or per manufacturer spec). Convert the suction pressure to saturation temperature using a PT chart for your refrigerant. Subtract that saturation temperature from your measured line temperature. The difference is superheat."
          }
        },
        {
          "@type": "Question",
          "name": "What does low superheat indicate?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Low superheat (under 5°F) usually means the system is overcharged, the metering device is flooding the evaporator, or the indoor airflow is too low. Liquid refrigerant entering the compressor — slugging — can cause valve damage and bearing failure. Verify with subcooling and an indoor airflow check before adjusting charge."
          }
        }
      ]
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://hvacptcharts.com/superheat-calculator/#breadcrumb",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://hvacptcharts.com/" },
        { "@type": "ListItem", "position": 2, "name": "Calculators", "item": "https://hvacptcharts.com/calculators-hub/" },
        { "@type": "ListItem", "position": 3, "name": "Superheat Calculator" }
      ]
    }
  ]
}
```

### Page type 3: Comparison page (`/r-32-vs-r-410a/`)

**Emits 4 entities:** `Article`, `FAQPage`, `BreadcrumbList`, plus `about` references to both refrigerants' `DefinedTerm` `@id`s.

```json
{
  "@type": "Article",
  "@id": "https://hvacptcharts.com/r-32-vs-r-410a/#article",
  "headline": "R-32 vs R-410A: Pressures, GWP, Performance, and Retrofit Reality",
  "description": "Side-by-side comparison of R-32 and R-410A: pressure-temperature curves, global warming potential, safety class, lubricant compatibility, and what the AIM Act phase-down means for installers and homeowners.",
  "url": "https://hvacptcharts.com/r-32-vs-r-410a/",
  "datePublished": "2026-05-20",
  "dateModified": "2026-05-20",
  "publisher": { "@id": "https://hvacptcharts.com/#organization" },
  "about": [
    { "@id": "https://hvacptcharts.com/refrigerant/r-32/#refrigerant" },
    { "@id": "https://hvacptcharts.com/refrigerant/r-410a/#refrigerant" }
  ]
}
```

The `about` array cross-references the canonical `DefinedTerm` records on the individual refrigerant pages. Schema cross-linking helps both Google's knowledge graph and LLM citation pipelines understand that this page is the canonical comparison between two specific terms defined elsewhere.

### Page type 4: "What pressure should X be" (`/what-pressure-should-r22-be/`)

**Emits 5 entities:** `Article`, `HowTo` (the diagnostic cheatsheet), `FAQPage`, `BreadcrumbList`, plus reference to the refrigerant's `DefinedTerm`.

Key entity here is the `HowTo` schema for the diagnostic flow:

```json
{
  "@type": "HowTo",
  "@id": "https://hvacptcharts.com/what-pressure-should-r22-be/#howto",
  "name": "How to diagnose abnormal R-22 system pressures",
  "description": "Step-by-step procedure to interpret R-22 suction and discharge pressure readings and identify likely root causes.",
  "totalTime": "PT15M",
  "tool": [
    { "@type": "HowToTool", "name": "Refrigerant manifold gauge set rated for R-22 (800 PSI minimum)" },
    { "@type": "HowToTool", "name": "Contact or clamp-on temperature probe (±1°F accuracy)" },
    { "@type": "HowToTool", "name": "EPA Section 608 certification (Type II or Universal)" }
  ],
  "step": [
    {
      "@type": "HowToStep",
      "name": "Measure outdoor ambient and indoor return air temperatures",
      "text": "Record outdoor dry-bulb temperature near the condenser unit and indoor return air temperature at the air handler. These set the expected operating range. R-22 systems are typically rated at 95°F outdoor / 80°F indoor dry-bulb (67°F wet-bulb)."
    },
    {
      "@type": "HowToStep",
      "name": "Read low-side (suction) and high-side (discharge) pressures",
      "text": "Connect the manifold to the service ports. After 10-15 minutes of stable run time, read both pressures in PSIG. For R-22 at 95°F outdoor, expect roughly 65-75 PSIG suction and 240-275 PSIG discharge in a normally-charged system."
    },
    {
      "@type": "HowToStep",
      "name": "Compare to expected ranges",
      "text": "If low-side is below normal range: undercharge, restriction, or low evaporator airflow. If low-side is above: overcharge or compressor inefficiency. If high-side is above: overcharge, dirty condenser, non-condensable contamination, or high ambient. If high-side is below: undercharge, low ambient, or compressor wear."
    },
    {
      "@type": "HowToStep",
      "name": "Verify with superheat and subcooling",
      "text": "Pressure readings alone don't diagnose. Measure superheat (suction line temp − saturation temp at suction pressure) and subcooling (saturation temp at discharge pressure − liquid line temp). Together with pressures, these isolate the cause."
    }
  ]
}
```

`HowTo` schema has historically been eligible for rich results in Google Search and is well-cited by AI assistants when answering procedural questions ("how do I check R-22 pressure"). This is high-leverage markup for technical sites.

### Page type 5: Homepage (`/`)

**Emits 3 entities:** `Organization`, `WebSite` with `SearchAction`, `CollectionPage` (the homepage as a curated index).

```json
{
  "@type": "CollectionPage",
  "@id": "https://hvacptcharts.com/#collectionpage",
  "name": "HVAC PT Charts — Verified Pressure-Temperature Data for 61 Refrigerants",
  "description": "Field reference for HVAC professionals: saturation pressure-temperature charts, superheat and subcooling calculators, retrofit guidance, and GWP rankings.",
  "url": "https://hvacptcharts.com/",
  "publisher": { "@id": "https://hvacptcharts.com/#organization" },
  "mainEntity": {
    "@type": "ItemList",
    "name": "Most-referenced refrigerant PT charts",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "url": "https://hvacptcharts.com/refrigerant/r-410a/", "name": "R-410A" },
      { "@type": "ListItem", "position": 2, "url": "https://hvacptcharts.com/refrigerant/r-22/", "name": "R-22" },
      { "@type": "ListItem", "position": 3, "url": "https://hvacptcharts.com/refrigerant/r-134a/", "name": "R-134a" },
      { "@type": "ListItem", "position": 4, "url": "https://hvacptcharts.com/refrigerant/r-32/", "name": "R-32" },
      { "@type": "ListItem", "position": 5, "url": "https://hvacptcharts.com/refrigerant/r-404a/", "name": "R-404A" },
      { "@type": "ListItem", "position": 6, "url": "https://hvacptcharts.com/refrigerant/r-454b/", "name": "R-454B" }
    ]
  }
}
```

### Page type 6: Hub (`/calculators-hub/`, `/guides-hub/`, `/pt-charts-tools-hub/`)

**Emits:** `CollectionPage` listing all items, `BreadcrumbList`, `Organization`, `WebSite`.

```json
{
  "@type": "CollectionPage",
  "@id": "https://hvacptcharts.com/calculators-hub/#collectionpage",
  "name": "HVAC Calculators",
  "description": "Free calculators for HVAC field work: superheat, subcooling, PT lookup, refrigerant charge, retrofit compatibility, and more.",
  "mainEntity": {
    "@type": "ItemList",
    "itemListElement": [/* one ListItem per calculator */]
  }
}
```

### Page type 7: Long-form guide (`/superheat-subcooling-fundamentals/`, `/pt-chart-guide/`, etc.)

**Emits:** `Article` (or `TechArticle`), `FAQPage`, `BreadcrumbList`, optionally `HowTo` if procedural.

`TechArticle` is a subtype of `Article` specifically for technical content; using it signals to Google that the content is reference material rather than news. Worth using for the explainer guides:

```json
{
  "@type": "TechArticle",
  "@id": "https://hvacptcharts.com/superheat-subcooling-fundamentals/#article",
  "headline": "Superheat and Subcooling: How HVAC Systems Use Refrigerant State",
  "description": "Plain-language explanation of superheat and subcooling, how they're measured, what target values mean for different system types, and how to use them in diagnosis.",
  "proficiencyLevel": "Beginner to Intermediate",
  "dependencies": "Familiarity with HVAC refrigeration cycle basics",
  "url": "https://hvacptcharts.com/superheat-subcooling-fundamentals/",
  "datePublished": "2026-05-20",
  "dateModified": "2026-05-20",
  "publisher": { "@id": "https://hvacptcharts.com/#organization" },
  "author": { "@id": "https://hvacptcharts.com/#organization" }
}
```

### Page type 8: Reference pages (`/refrigerant-safety-classifications/`, `/refrigerant-gwp-rankings/`)

**Emits:** `Dataset` (the reference table is itself a dataset), `Article`, `BreadcrumbList`.

For `/refrigerant-gwp-rankings/`:

```json
{
  "@type": "Dataset",
  "@id": "https://hvacptcharts.com/refrigerant-gwp-rankings/#dataset",
  "name": "HVAC Refrigerant Global Warming Potential Rankings",
  "description": "Sortable, filterable table of GWP (IPCC AR5 and AR6) for 61 common HVAC refrigerants, with ASHRAE safety class, ODP, and current EPA regulatory status.",
  "url": "https://hvacptcharts.com/refrigerant-gwp-rankings/",
  "license": "https://creativecommons.org/licenses/by/4.0/",
  "isAccessibleForFree": true,
  "creator": { "@id": "https://hvacptcharts.com/#organization" },
  "citation": [
    "IPCC AR5 Working Group I (2013), Table 8.A.1",
    "IPCC AR6 Working Group I (2021), Chapter 7 Supplementary Material",
    "ASHRAE Standard 34-2022 — Refrigerant Designation and Safety Classification",
    "US EPA Section 608 program documentation",
    "US EPA AIM Act final rule (2021)"
  ],
  "variableMeasured": [
    { "@type": "PropertyValue", "name": "Refrigerant designation" },
    { "@type": "PropertyValue", "name": "GWP (100-year, IPCC AR5)", "unitText": "ratio relative to CO2" },
    { "@type": "PropertyValue", "name": "GWP (100-year, IPCC AR6)", "unitText": "ratio relative to CO2" },
    { "@type": "PropertyValue", "name": "Ozone Depletion Potential", "unitText": "ratio relative to R-11" },
    { "@type": "PropertyValue", "name": "ASHRAE safety class" }
  ]
}
```

### Page type 9: Carrier charging chart (`/carrier-410a-charging-chart/`)

**Emits:** `Article` with explicit `citation` to Carrier's published source, `Dataset` for the chart values, `BreadcrumbList`.

```json
{
  "@type": "Article",
  "headline": "Carrier R-410A Charging Chart: Service Manual Reference",
  "citation": [
    {
      "@type": "CreativeWork",
      "name": "Carrier Residential Split System Service Manual — R-410A Charging Tables",
      "publisher": "Carrier Corporation",
      "url": "https://www.carrier.com/residential/en/us/products/..."
    }
  ],
  "about": { "@id": "https://hvacptcharts.com/refrigerant/r-410a/#refrigerant" }
}
```

The explicit `citation` to Carrier as the source is critical for legal/IP positioning and for AI assistants citing the page accurately.

### Page type 10: Site pages (about, contact, privacy, terms)

**Emits:** `WebPage`, `Organization`, `BreadcrumbList`. Minimal.

For `/contact-us/`, additionally `ContactPage`:

```json
{
  "@type": "ContactPage",
  "@id": "https://hvacptcharts.com/contact-us/#contactpage",
  "name": "Contact HVAC PT Charts",
  "mainEntity": {
    "@id": "https://hvacptcharts.com/#organization"
  }
}
```

For `/privacy-policy/` and `/terms-of-service/`: just `WebPage` + breadcrumb. No special schema.

## Validation

Every page's schema must pass:

1. **Google's Rich Results Test** (https://search.google.com/test/rich-results)
2. **Schema.org validator** (https://validator.schema.org/)
3. **Internal Zod validation** at build time — see schema below

### Build-time validation

```typescript
// scripts/validate-schema.ts
import { z } from 'zod';

const SchemaEntity = z.object({
  '@type': z.string(),
  '@id': z.string().url().optional(),
}).passthrough();

const SchemaGraph = z.object({
  '@context': z.literal('https://schema.org'),
  '@graph': z.array(SchemaEntity).min(1),
});

// Walk the build output, find every <script type="application/ld+json">, parse and validate.
// Fail build if any malformed.
```

### Required entities per page type (build-time check)

| Page type | Required entities |
|---|---|
| Refrigerant detail | Organization, WebSite, Article, DefinedTerm, Dataset, FAQPage, BreadcrumbList |
| Calculator | Organization, WebSite, Article, WebApplication, FAQPage, BreadcrumbList |
| Comparison | Organization, WebSite, Article (with `about[]`), FAQPage, BreadcrumbList |
| What-pressure | Organization, WebSite, Article, HowTo, FAQPage, BreadcrumbList |
| Homepage | Organization, WebSite (with SearchAction), CollectionPage |
| Hub | Organization, WebSite, CollectionPage, BreadcrumbList |
| Long-form guide | Organization, WebSite, TechArticle, FAQPage, BreadcrumbList |
| Reference (GWP/safety) | Organization, WebSite, Article, Dataset, BreadcrumbList |
| Manufacturer chart | Organization, WebSite, Article (with citation[]), Dataset, BreadcrumbList |
| Site pages | Organization, WebSite, WebPage, BreadcrumbList |

A build script walks the routes, extracts the JSON-LD, and asserts the required entities are present. Missing entities fail the build.

## What we are NOT emitting

To stay defensible:

- **No fake `aggregateRating`** on any page. The current AI-content-policy guide treats fabricated review aggregates as a major risk. We have no reviews, so we don't claim them.
- **No `Review` schema.** Same reason.
- **No fake `Person` schema** for fake expert reviewers. Authorship is `Organization` only.
- **No `MedicalEntity`-adjacent schema** for refrigerant exposure / inhalation effects. Stays in plain prose with citations to NIOSH/OSHA if discussed at all.
- **No `Offer`/`Product` schema** on the prices guide page unless it's tied to a real distributor's published prices, in which case we cite. The current site's invented prices would generate a Helpful Content / spam policy risk if rendered with `Offer` schema.

## LLM-citation specific notes

Per the Google AI content policy skill: LLM citations come from "passages that read as authoritative reference material." The schema choices above are tuned for that:

- `DefinedTerm` signals "this page is the canonical definition of R-410A." LLM training pipelines and live retrieval systems treat this as a citation anchor.
- `Dataset` with explicit `variableMeasured`, `distribution`, and `citation` signals "this is reference data with provenance." Higher trust score in retrieval ranking.
- `HowTo` with explicit `tool` and ordered `step` arrays parses cleanly into action-oriented LLM responses ("here's how to measure superheat").
- `FAQPage` with concise `Answer.text` matches the format LLMs prefer to surface verbatim.

Combined, this is the schema posture of a reference site, not a content farm. It's the structural signal that backs up the editorial commitment to source every claim.
