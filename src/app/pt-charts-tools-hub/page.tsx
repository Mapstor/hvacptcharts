import type { Metadata } from "next";
import { refrigerants, gwpText } from "@/data/refrigerants";
import { HubPage } from "@/components/hub/HubPage";
import { RefrigerantAZList } from "@/components/refrigerant/RefrigerantAZList";
import { listWhatPressureIds, loadWhatPressure } from "@/lib/mdx-what-pressure";
import { pageMetadata } from "@/lib/schema/shared";
import { ptDataProvenance } from "@/lib/data-provenance";


const POPULAR_SLUGS = ["r-410a", "r-22", "r-134a", "r-32", "r-404a", "r-454b", "r-407c", "r-1234yf"];

// All 11 operating-pressure ("what pressure should X be") pages, linked with a
// descriptive "R-XXX operating pressures" anchor (not the old "What pressure
// should X be?" placeholder). Built from the what-pressure MDX registry so it
// stays complete as pages are added.
const WHAT_PRESSURE_ITEMS: Array<{ href: string; label: string; blurb: string }> = listWhatPressureIds()
  .map((id) => {
    const wp = loadWhatPressure(id);
    if (!wp) return null;
    const r = refrigerants.find((x) => x.slug === wp.frontmatter.refrigerantSlug);
    if (!r) return null;
    return {
      href: `/what-pressure-should-${id}/`,
      label: `${r.displayName} operating pressures`,
      blurb: wp.frontmatter.introOneLiner,
    };
  })
  .filter((x): x is { href: string; label: string; blurb: string } => x !== null)
  .sort((a, b) => a.label.localeCompare(b.label, "en", { numeric: true }));

export const metadata: Metadata = pageMetadata({
  title: "PT Charts For 60 Refrigerants: Tables, Tools, PDFs (Free)",
  description:
    "Saturation PT charts for 60 HVAC refrigerants, plus overlay comparison tool, operating-pressure references, and sortable ASHRAE 34 safety and GWP tables.",
  path: "/pt-charts-tools-hub/",
  ogType: "website",
});

export default function PTChartsToolsHubPage() {
  const prov = ptDataProvenance();
  const popularItems = POPULAR_SLUGS.map((slug) => {
    const r = refrigerants.find((x) => x.slug === slug);
    if (!r) return null;
    return {
      href: `/refrigerant/${r.slug}/`,
      label: r.displayName,
      blurb: `${r.type.replace("-", " ").toUpperCase()} · ASHRAE ${r.safetyClass} · GWP ${gwpText(r.environmental.gwp.headline)}`,
    };
  }).filter(Boolean) as Array<{ href: string; label: string; blurb: string }>;

  return (
    <HubPage
      path="pt-charts-tools-hub"
      title="PT Charts & Reference Tools"
      introHeadline={`Verified pressure-temperature data for ${refrigerants.length} refrigerants, plus the sortable reference tables and comparison tools.`}
      introBody="All saturation data generated from CoolProp 7.2.0 (Bell, Wronski, Quoilin, Lemort 2014, doi:10.1021/ie4033999), REFPROP-compatible Helmholtz EOS, or transcribed from named manufacturer datasheets (Honeywell, Chemours, Arkema, AGC). The full chart for each refrigerant is downloadable as CSV or JSON under CC BY 4.0. Bubble and dew curves for zeotropic blends are computed independently; safety classifications come from ANSI/ASHRAE Standard 34-2022 and are stored as fixed values so the wrong class can't be displayed."
      route="/pt-charts-tools-hub/"
      scenarios={[
        {
          situation: "I need to find a refrigerant by name or ASHRAE number",
          href: "/#find",
          toolLabel: "Homepage A-Z browser",
          reasoning: "Searchable list of all 60 refrigerants with filters by type, safety class, and GWP bucket.",
        },
        {
          situation: "Quick PT lookup for service measurement",
          href: "/pt-calculator/",
          toolLabel: "PT Calculator",
          reasoning: "Bidirectional saturation lookup (P→T or T→P). Bubble/dew handled for blends automatically.",
        },
        {
          situation: "Overlay 2-4 refrigerants to compare PT curves",
          href: "/refrigerant-pt-comparison-tool/",
          toolLabel: "PT Comparison Tool",
          reasoning: "Visual envelope check for retrofit feasibility or new-equipment specification.",
        },
        {
          situation: "Operating pressure reference for a service call",
          href: "/what-pressure-should-410a/",
          toolLabel: "R-410A operating pressures",
          reasoning: "Per-refrigerant operating pressure ranges with diagnostic procedure (R-410A, R-22, R-32, R-454B, R-454C, R-134a, R-1234yf mobile A/C, R-449A Opteon XP40 retrofit, R-404A, R-407C, R-744) — all 11 linked below.",
        },
        {
          situation: "Looking up GWP for AIM Act compliance",
          href: "/refrigerant-gwp-rankings/",
          toolLabel: "GWP Rankings",
          reasoning: "Sortable 100-year GWP on the US EPA basis, with IPCC AR4/AR5/AR6 columns.",
        },
        {
          situation: "Checking safety class for A2L equipment",
          href: "/refrigerant-safety-classifications/",
          toolLabel: "Safety Classifications",
          reasoning: "ASHRAE 34-2022 class for every refrigerant with A2L deep-dive and IEC 60335-2-40 charge limits.",
        },
      ]}
      sections={[
        {
          heading: "Sortable reference tables",
          items: [
            { href: "/refrigerant-safety-classifications/", label: "Safety Classifications", blurb: "Every refrigerant's ASHRAE 34 class (A1 / A2L / A3 / B1 / B2L). Filter by type, search by name." },
            { href: "/refrigerant-gwp-rankings/", label: "GWP Rankings", blurb: "Sortable by GWP (US EPA basis), IPCC AR4/AR5/AR6, and ODP." },
          ],
        },
        {
          heading: "Most-used refrigerant pages",
          items: popularItems,
        },
        {
          heading: "Comparison tools",
          items: [
            { href: "/refrigerant-pt-comparison-tool/", label: "PT Comparison Tool", blurb: "Overlay 2-4 refrigerants on one chart. Useful for retrofit feasibility scans." },
            { href: "/r-32-vs-r-410a/", label: "R-32 vs R-410A", blurb: "Side-by-side written comparison, the residential AC phase-down decision." },
            { href: "/r-454b-vs-r-454c/", label: "R-454B vs R-454C", blurb: "Same R-32/R-1234yf components in opposite ratios — residential AC vs LT commercial refrigeration split." },
            { href: "/r-404a-vs-r-452a/", label: "R-404A vs R-452A", blurb: "Transport-refrigeration retrofit — 45% GWP cut with lower discharge temp advantage." },
            { href: "/r-134a-vs-r-1234ze/", label: "R-134a vs R-1234ze(E)", blurb: "Chiller HFO alternative — GWP < 1, A2L, requires larger compressor displacement to match capacity." },
            { href: "/r-290-vs-r-600a/", label: "R-290 vs R-600a", blurb: "Propane vs isobutane — natural refrigerants at opposite ends of the pressure envelope, both A3." },
            { href: "/r-12-vs-r-134a/", label: "R-12 vs R-134a", blurb: "Classic CFC to HFC retrofit — oil change, seal update, 80–90% charge rule." },
            { href: "/r-22-vs-r-438a/", label: "R-22 vs MO99 (R-438A)", blurb: "Chemours mineral-oil-compatible R-22 retrofit — no oil change required in most systems." },
            { href: "/r-404a-vs-r-448a/", label: "R-404A vs R-448A", blurb: "Honeywell Solstice N40 R-404A retrofit — 65% GWP cut, A1 preserved." },
            { href: "/r-448a-vs-r-449a/", label: "R-448A vs R-449A", blurb: "Honeywell N40 vs Chemours XP40 — the two dominant A1 R-404A retrofits." },
          ],
        },
        {
          heading: "Operating-pressure references — all 11",
          description: "Typical suction and discharge pressures by ambient, with a diagnostic procedure, for every refrigerant that has a dedicated operating-pressure page.",
          items: WHAT_PRESSURE_ITEMS,
        },
        {
          heading: "Charging charts",
          items: [
            { href: "/target-superheat-chart/", label: "Target Superheat Chart", blurb: "Universal fixed-orifice target lookup by indoor WB × outdoor DB." },
            { href: "/r410a-superheat-chart/", label: "R-410A Superheat Chart", blurb: "Full matrix + R-410A saturation quick table." },
            { href: "/r22-superheat-chart/", label: "R-22 Superheat Chart", blurb: "Matrix + R-22 saturation quick table for legacy service." },
            { href: "/r410a-charging-chart/", label: "R-410A Charging Chart", blurb: "TXV subcooling method + fixed-orifice superheat method." },
          ],
        },
        {
          heading: "Full A–Z",
          items: [
            { href: "/#find", label: `Browse all ${refrigerants.length} refrigerants`, blurb: "Searchable, filterable A–Z list on the homepage. Filter by type, safety class, or GWP bucket." },
          ],
        },
      ]}
      aboutSections={[
        {
          heading: "About the dataset",
          body: `The verified refrigerant dataset is the foundation under every page on this site. Each of the 60 refrigerants is represented by a single JSON record containing: ASHRAE 34 safety classification, refrigerant type, composition (mass fractions for blends), physical properties (boiling point, critical point, glide), environmental data (GWP on the US EPA basis plus IPCC AR4/AR5/AR6, ODP, atmospheric lifetime), lubricant compatibility, applications, replacement options, regulatory status, and a 191-row PT chart (-40°F to 150°F in 1°F increments).

The PT chart is generated from CoolProp, a REFPROP-compatible Helmholtz EOS implementation: ${prov.coolprop72} fluids on CoolProp 7.2.0 (Bell, Wronski, Quoilin, Lemort 2014, doi:10.1021/ie4033999) and ${prov.coolprop80} newer low-GWP fluids (R-450A, R-514A, R-515A/B, R-1224yd(Z), R-1336mzz(Z)) on CoolProp 8.0.0. For the ${prov.datasheet} R-404A retrofit blends CoolProp does not model — R-438A and R-448A — PT values come directly from the named manufacturer datasheets (Chemours ISCEON MO99, Honeywell Solstice N40).

Every value is checked against reference values at build time. Safety class is stored as a fixed value — it's structurally impossible to render the wrong class for a refrigerant. PT values below the critical pressure are guaranteed to be non-negative; values above the critical temperature truncate rather than extrapolate.`,
        },
        {
          heading: "Data verification policy",
          body: `Three-layer verification:

(1) Source-level: CoolProp values are REFPROP-compatible (NIST Standard Reference Database 23, the canonical thermodynamic property database for refrigerants). Manufacturer-blend values are transcribed from named manufacturer datasheets with the publication date and URL recorded per refrigerant.

(2) Structure-level: every refrigerant record is validated at build time. PT values must be numbers (not text or blank). Safety class must be one of the ASHRAE 34 classes (A1, A2L, A2, A3, B1, B2L, B2, B3). GWP must be a non-negative number or blank (blank indicates no published value). Type must match a known refrigerant family.

(3) Cross-check: manufacturer-blend PT tables are checked against the published datasheet they were transcribed from; several CoolProp fluids are additionally cross-checked against the NIST WebBook and the ASHRAE Handbook—Refrigeration (each refrigerant record lists what its chart was verified against). Critical-point values cross-checked against NIST REFPROP 10.0. GWP headline values on the US EPA basis (40 CFR 84 / IPCC AR4), with IPCC AR4/AR5/AR6 shown alongside.

The previous WordPress version of this site shipped with approximately 25,000 fabricated quantitative errors. The current rebuild was structured to make those failure modes impossible: data comes from primary sources, validation runs at every build, and any value outside the chart range returns "out of range" rather than an extrapolated number.`,
        },
        {
          heading: "Downloads — CSV and JSON",
          body: `Each refrigerant detail page provides download links for the underlying PT data in CSV and JSON formats, plus the full refrigerant record in JSON. All downloads are licensed CC BY 4.0 — free to use, redistribute, or build upon with attribution to hvacptcharts.com and the underlying source (CoolProp / manufacturer datasheet) for the specific values.

Common use cases for the downloads: integrating refrigerant data into custom HVAC software, building training materials, populating equipment-OEM-specific charging tables, academic research on refrigerant transitions, and verifying calculations against the verified dataset.

Every PT chart page has CSV and JSON downloads at /data/refrigerant/<slug>/json and /csv (also CC BY 4.0).`,
        },
        {
          heading: "Refrigerant families overview",
          body: `The 60 refrigerants in this dataset span several chemical families with characteristic property and regulatory profiles:

HCFCs (R-22, R-123) — ozone-depleting, phased out under Montreal Protocol. R-22 production stopped in developed countries 2020; service from reclaimed stock. R-123 production ends 2030.

HFCs (R-410A, R-134a, R-404A, R-32, R-407C, R-507A, etc.) — zero-ODP but high-GWP. Subject to AIM Act phase-down (40 CFR Part 84) in US and EU F-Gas Regulation. R-32 (GWP 675) is the lower-GWP HFC; R-404A (GWP 3922) is among the highest.

HFC/HFO blends (R-454B, R-454C, R-455A, R-448A, R-449A, R-513A) — designed to achieve sub-700 or sub-150 GWP via HFO content. The AIM Act-compliant replacement family for HFCs.

HFOs (R-1234yf, R-1234ze, R-1233zd, R-1336mzz) — synthetic refrigerants with very low GWP (1-9) via short atmospheric lifetime. Used in mobile AC, chillers, and high-temperature process refrigeration.

Natural refrigerants (R-744 CO2, R-717 ammonia, R-290 propane, R-600a isobutane, R-1270 propylene) — zero or near-zero GWP. Used in commercial refrigeration (R-744), industrial refrigeration (R-717), small appliances (R-290, R-600a). Safety classes range from A1 (R-744) to A3 (hydrocarbons) to B2L (ammonia) — each with distinct equipment and handling requirements.

Use the homepage A-Z list and filters to browse the full set, or jump to the most popular refrigerants from the sections above.`,
        },
        {
          heading: "ASHRAE 34 designation system — how the numbering works",
          body: `ASHRAE Standard 34 assigns refrigerant numbers using a chemical-composition encoding that lets you decode a refrigerant&apos;s structure from its number alone.

For pure refrigerants in the methane / ethane / propane series, the R-number indicates: hundreds digit = (carbon atoms − 1), tens digit = (hydrogen atoms + 1), units digit = fluorine atoms; the remaining halogens fill out the molecular structure. R-22 (CHClF₂) = 0 carbons − 1 = 0 hundreds (skipped), 1 hydrogen + 1 = 2 tens, 2 fluorines = 2 units → 22. R-134a (CH₂FCF₃) is a 1-carbon ethane derivative: 1 carbon, the digit before the suffix tells you which isomer.

For zeotropic blends (400-series), the number is assigned sequentially as ASHRAE certifies new blends; the lowercase suffix (a, b, c) distinguishes different mass-fraction recipes of the same components. R-407A, R-407B, R-407C are all blends of R-32 + R-125 + R-134a in different ratios.

For azeotropic blends (500-series), same convention. R-507A is R-125 + R-143a in a near-azeotropic ratio.

For hydrocarbons (600-series), R-600 is butane (n-C₄H₁₀), R-600a is isobutane, R-601 is pentane. For inorganics (700-series), the number after 7 is the molecular weight: R-717 is ammonia (MW 17), R-744 is CO₂ (MW 44), R-718 is water (MW 18). For unsaturated compounds with double bonds (1000+ series — HFOs), the four-digit number encodes a more elaborate structure.

This isn&apos;t trivia — knowing how to decode an ASHRAE number tells you the refrigerant&apos;s rough chemistry without looking it up, which speeds field-service work when encountering an unfamiliar refrigerant.`,
        },
      ]}
      faqs={[
        {
          q: "Why does the PT chart only cover -40°F to 150°F?",
          a: `That range covers the operating envelope of common HVAC applications: residential AC (40°F evap to 110°F cond), commercial refrigeration MT (15-30°F evap), commercial LT (-40°F to -10°F evap), heat pumps in heating mode (10-25°F evap), centrifugal chillers (40-50°F evap), mobile AC (35-45°F evap).

Specialized applications (cryogenics below -150°F, high-temperature process refrigeration above 200°F) need refrigerants outside this range. Their PT data extends per-refrigerant on the detail pages.

The -40°F lower bound coincides with the F/C unit equivalence point (-40°F = -40°C) for cross-unit convenience.`,
        },
        {
          q: "Why do some refrigerants' charts truncate before 150°F?",
          a: `Each pure refrigerant has a critical temperature above which liquid and vapor become indistinguishable — no saturation state exists. The chart truncates at the critical temperature.

Examples: R-744 (CO2) critical = 87.8°F, chart stops at 87°F; R-410A critical = 160°F, chart extends to 150°F (full range); R-32 critical = 173°F, full range; R-13 critical = 84°F, chart stops at 84°F.

For zeotropic blends, the critical point becomes a critical locus that varies with composition; charts for those blends typically extend to ~5°F below the critical-locus minimum.`,
        },
        {
          q: "Are the manufacturer-blend PT values as accurate as CoolProp values?",
          a: `Generally yes, since manufacturers publish PT data validated against the same Helmholtz EOS or equivalent measurement methods. CoolProp values are REFPROP-compatible; manufacturer datasheets state their own accuracy per publication.

For the two R-404A retrofit blends CoolProp does not model (R-438A and R-448A), the manufacturer datasheet is the authoritative source — there's no "more accurate" reference to cross-check against. The dataset records the source manufacturer and publication URL per refrigerant.`,
        },
        {
          q: "How do I find a refrigerant by ASHRAE number or trade name?",
          a: `Use the homepage A-Z browser (/) — searchable by ASHRAE designation (R-410A, R-32, R-454B), refrigerant type (HCFC, HFC, HFO, natural), or trade name (Genetron, Opteon, Forane, AMOLEA). Each result links to the full refrigerant detail page.

Alternatively, the URL pattern /refrigerant/[slug]/ uses the lowercase hyphenated form: r-410a, r-32, r-454b, r-744 (for CO2), r-717 (for ammonia), r-1234yf, etc.`,
        },
        {
          q: "What if a refrigerant I need isn't in the dataset?",
          a: `60 refrigerants cover the mainstream HVAC and commercial refrigeration market. Very rare specialty refrigerants (some older CFCs no longer in service, some niche industrial process refrigerants) aren't covered.

If you encounter a refrigerant not in the dataset, check the equipment OEM service literature for that refrigerant's PT chart and properties, or contact us with a request — we add refrigerants based on demand and data availability.`,
        },
        {
          q: "Can I integrate this data into my own software?",
          a: `Yes — the dataset is CC BY 4.0 licensed. CSV and JSON downloads are available from each refrigerant detail page at /data/refrigerant/<slug>/json and /csv.

Common integrations: HVAC service apps, training simulators, equipment OEM internal tooling, academic research, building energy modeling software. Attribution to hvacptcharts.com and the underlying source (CoolProp citation, manufacturer datasheet citation) is required per CC BY 4.0; commercial use is permitted.`,
        },
        {
          q: "What about the JSON schema for the dataset?",
          a: `Each refrigerant record follows a strict, validated structure covering: slug, displayName, ASHRAE designation, type (HCFC/HFC/HFO/blend/natural), safety classification (A1/A2L/A2/A3/B1/B2L/B2/B3), composition (mass fractions for blends), physical properties (boiling point, critical temperature/pressure, glide), environmental data (GWP on the US EPA basis plus IPCC AR4/AR5/AR6, ODP, atmospheric lifetime), lubricant compatibility, applications, replacement options, replaces (legacy refrigerants this one replaces), regulatory status (AIM Act affected), PT chart (array of 191 temperature/pressure points), and data-source provenance (PT chart source, verification date, verified-against references). The same structure is enforced on every value in the downloadable dataset, so what you download matches exactly what the site displays.`,
        },
      ]}
      crosslinks={[
        { href: "/calculators-hub/", label: "Calculators" },
        { href: "/guides-hub/", label: "Guides" },
      ]}
      azList={<RefrigerantAZList />}
    />
  );
}
