import type { Metadata } from "next";
import { refrigerants } from "@/data/refrigerants";
import { HubPage } from "@/components/hub/HubPage";
import { SITE_URL } from "@/lib/schema/shared";

const PUBLISHED = refrigerants[0]?.dataSource.ptChartGeneratedAt ?? new Date().toISOString();

export const metadata: Metadata = {
  title: "HVAC Guides — Refrigerant, Charging, and System References",
  description:
    "Reference guides for HVAC professionals: PT chart reading, superheat and subcooling fundamentals, refrigerant comparisons, safety classification, and regulatory context.",
  alternates: { canonical: `${SITE_URL}/guides-hub/` },
};

export default function GuidesHubPage() {
  return (
    <HubPage
      path="guides-hub"
      title="HVAC Guides"
      introHeadline="Reference material for HVAC technicians and engineers: the conceptual anchors behind the calculator pages, plus refrigerant comparisons and regulatory context."
      introBody="Every guide is sourced — ACCA Manual T (2017), ASHRAE Handbook of Refrigeration 2022, ASHRAE Standard 34-2022, EPA AIM Act / SNAP, IPCC AR5/AR6, AHRI Standard 540-2020, IIAR for ammonia, equipment OEM service literature (Carrier, Trane, Lennox, Daikin, Goodman). No 'general industry knowledge' filler; if a claim is in a guide, it carries an attribution. The guides pair with the calculator pages — guides provide the conceptual context, calculators do the math."
      publishedDate={PUBLISHED}
      scenarios={[
        {
          situation: "I'm learning what superheat and subcooling actually mean",
          href: "/superheat-subcooling-fundamentals/",
          toolLabel: "Superheat & Subcooling Fundamentals",
          reasoning: "Definition, measurement procedure, target ranges by metering device, four-pattern diagnostic matrix.",
        },
        {
          situation: "Customer's AC is showing high discharge pressure on a hot day",
          href: "/high-head-pressure-causes/",
          toolLabel: "High Head Pressure Causes",
          reasoning: "Decision tree with 8 root causes ranked by frequency. Condenser airflow is #1 (45% of cases).",
        },
        {
          situation: "Picking refrigerant for new equipment under AIM Act",
          href: "/refrigerant-comparison-guide/",
          toolLabel: "Refrigerant Comparison Guide",
          reasoning: "Sector-by-sector low-GWP options with AR5 GWP, safety class, lubricant compatibility.",
        },
        {
          situation: "Need to look up GWP for regulatory compliance",
          href: "/refrigerant-gwp-rankings/",
          toolLabel: "GWP Rankings",
          reasoning: "Sortable IPCC AR5/AR6 values with EU F-Gas (150) and AIM Act (700) thresholds marked.",
        },
        {
          situation: "Choosing between A2L refrigerants for residential AC",
          href: "/r-32-vs-r-454b/",
          toolLabel: "R-32 vs R-454B",
          reasoning: "The two dominant A2L replacements for R-410A — decision driven by OEM preference and slight envelope differences.",
        },
        {
          situation: "Need to know if my A2L equipment is safety-compliant",
          href: "/refrigerant-safety-classifications/",
          toolLabel: "Safety Classifications",
          reasoning: "Full ASHRAE 34 reference with A2L equipment requirements per IEC 60335-2-40.",
        },
      ]}
      learningPaths={[
        {
          title: "New HVAC technician — start with fundamentals",
          description: "Build the conceptual base before diving into specific refrigerants.",
          steps: [
            { href: "/pt-chart-guide/", label: "How to read a PT chart" },
            { href: "/superheat-subcooling-fundamentals/", label: "Superheat & subcooling fundamentals" },
            { href: "/refrigerant-safety-classifications/", label: "Safety classifications (A1, A2L, A3, B)" },
            { href: "/high-head-pressure-causes/", label: "High head pressure causes (diagnostic)" },
          ],
        },
        {
          title: "Refrigerant transition planning",
          description: "Working through AIM Act-driven equipment and service changes.",
          steps: [
            { href: "/refrigerant-gwp-rankings/", label: "GWP rankings & regulatory thresholds" },
            { href: "/refrigerant-comparison-guide/", label: "Refrigerant comparison guide" },
            { href: "/r-410a-vs-r-454b/", label: "R-410A vs R-454B (residential)" },
            { href: "/r-404a-vs-r-449a/", label: "R-404A vs R-449A (commercial)" },
            { href: "/r-454c-vs-r-455a/", label: "R-454C vs R-455A (low-temp commercial)" },
          ],
        },
        {
          title: "Diagnosing a specific service issue",
          description: "When you've got readings in hand and need to interpret.",
          steps: [
            { href: "/what-pressure-should-410a/", label: "Operating pressure reference (find your refrigerant)" },
            { href: "/superheat-subcooling-fundamentals/", label: "SH × SC pattern interpretation" },
            { href: "/high-head-pressure-causes/", label: "High head pressure decision tree (if applicable)" },
            { href: "/system-pressure-diagnostic-calculator/", label: "System pressure diagnostic (multi-input)" },
          ],
        },
      ]}
      sections={[
        {
          heading: "Fundamentals",
          items: [
            { href: "/superheat-subcooling-fundamentals/", label: "Superheat & Subcooling Fundamentals", blurb: "What they are, how to measure, target ranges by metering device, the 4 classic diagnostic patterns. The conceptual anchor for the charging calculators." },
            { href: "/pt-chart-guide/", label: "How to Read a PT Chart", blurb: "Bubble vs dew columns, temperature glide, critical point truncation, partial vs full charts, common pitfalls." },
          ],
        },
        {
          heading: "Refrigerant comparisons & decisions",
          items: [
            { href: "/refrigerant-comparison-guide/", label: "Refrigerant Comparison Guide", blurb: "Framework for comparing refrigerants across 5 axes (thermo, safety, environment, regulation, practical) with decision logic for new equipment, retrofit, and replacement scenarios." },
            { href: "/r-22-vs-r-410a/", label: "R-22 vs R-410A", blurb: "Homeowner replacement decision — why R-22 retrofit isn't a drop-in, when to repair vs replace." },
            { href: "/r-22-vs-r-407c/", label: "R-22 vs R-407C", blurb: "R-22 mineral-oil retrofit path requiring oil change to POE. 11°F glide, POE oil, ~5% capacity reduction." },
            { href: "/r-32-vs-r-410a/", label: "R-32 vs R-410A", blurb: "Side-by-side properties, PT overlay, retrofit reality, the A1 → A2L safety class change as the structural blocker." },
            { href: "/r-32-vs-r-454b/", label: "R-32 vs R-454B", blurb: "The two leading R-410A replacements, decided largely by OEM preference." },
            { href: "/r-410a-vs-r-454b/", label: "R-410A vs R-454B", blurb: "Direct replacement comparison for new equipment installs." },
            { href: "/r-404a-vs-r-449a/", label: "R-404A vs R-449A", blurb: "Commercial refrigeration retrofit — 65% GWP reduction, same POE oil, ~10°F glide." },
            { href: "/r-134a-vs-r-513a/", label: "R-134a vs R-513A", blurb: "Chiller drop-in retrofit — 56% GWP reduction, A1 preserved, same POE oil, azeotropic." },
            { href: "/r-454c-vs-r-455a/", label: "R-454C vs R-455A", blurb: "Low-GWP A2L commercial refrigeration choice — same GWP 148, different glide (14°F vs 22°F) and pressure envelope." },
          ],
        },
        {
          heading: "Reference tables",
          items: [
            { href: "/refrigerant-safety-classifications/", label: "Safety Classifications", blurb: "All 61 refrigerants by ASHRAE 34 class, with full A vs B and 1/2L/2/3 explanation." },
            { href: "/refrigerant-gwp-rankings/", label: "GWP Rankings", blurb: "Sortable IPCC AR5/AR6 values, EU F-Gas and AIM Act thresholds marked." },
          ],
        },
        {
          heading: "Operating-pressure references",
          items: [
            { href: "/what-pressure-should-r22/", label: "R-22 operating pressures", blurb: "Typical suction and discharge ranges by ambient, with diagnostic procedure." },
            { href: "/what-pressure-should-410a/", label: "R-410A operating pressures", blurb: "Operating ranges with A2L-replacement context." },
            { href: "/what-pressure-should-r32/", label: "R-32 operating pressures", blurb: "A2L-specific operating ranges and handling notes." },
            { href: "/what-pressure-should-r454b/", label: "R-454B operating pressures", blurb: "A2L low-glide HFC/HFO blend ranges for new residential AC." },
            { href: "/what-pressure-should-r134a/", label: "R-134a operating pressures", blurb: "Chiller and commercial cooling ranges." },
            { href: "/what-pressure-should-r404a/", label: "R-404A operating pressures", blurb: "Commercial refrigeration medium and low-temp ranges." },
            { href: "/what-pressure-should-r407c/", label: "R-407C operating pressures", blurb: "R-22 retrofit HFC blend ranges with 11°F glide handling." },
            { href: "/what-pressure-should-r454c/", label: "R-454C operating pressures", blurb: "Low-GWP A2L commercial refrigeration ranges (medium and low-temp)." },
            { href: "/what-pressure-should-r744/", label: "R-744 (CO₂) operating pressures", blurb: "Subcritical and transcritical operation — pressures unlike any other HVAC refrigerant." },
          ],
        },
        {
          heading: "Diagnostics",
          items: [
            { href: "/high-head-pressure-causes/", label: "High Head Pressure — Causes & Diagnosis", blurb: "Diagnostic decision tree for high-side pressure problems. Pairs with the system pressure diagnostic calculator." },
          ],
        },
        // Planned: a refrigerant-prices-guide is on the roadmap pending a
        // primary-source decision. The section is intentionally omitted until
        // the page exists — listing a 404 link would break trust and the
        // internal-link audit.
      ]}
      aboutSections={[
        {
          heading: "How these guides relate to the calculators",
          body: `The calculators do math. The guides explain why. A technician charging an R-410A TXV system uses the subcooling calculator to convert manifold pressure + line temperature into a SC value — but understanding what SC means, why the TXV target is 8-12°F, and how to interpret a 20°F SC reading requires the conceptual framework in the guides.

Every calculator page links to relevant guides; every guide links to relevant calculators. The pairing is deliberate: tools and concepts are complementary, not separable. Pick the calculator for the immediate field measurement; read the guide once to internalize the framework.

The 14 guides on this site cover: PT chart reading, superheat & subcooling fundamentals, high head pressure diagnosis, 9 refrigerant-specific operating pressure references, 13 refrigerant pair comparisons (retrofit decisions), GWP rankings, and ASHRAE 34 safety classifications.`,
        },
        {
          heading: "Editorial standards and source hierarchy",
          body: `Every claim in every guide carries a source. The source hierarchy in priority order:

(1) Primary scientific source — CoolProp 7.2.0, NIST REFPROP, peer-reviewed thermodynamic literature (Lemmon et al., Bell et al., Span & Wagner) for refrigerant properties.

(2) Industry standards — ANSI/ASHRAE Standard 34-2022 (refrigerant designation and safety classification), AHRI Standard 540-2020 (compressor pressure limits), AHRI Standard 700-2019 (refrigerant specifications), IEC 60335-2-40 (A2L equipment), IIAR 2/9 (ammonia installation), ASTM B280 (copper tubing).

(3) Industry best practice — ACCA Manual T (2017) "Air-Side and Refrigerant-Side Diagnostics", ASHRAE Handbook of Refrigeration 2022, ASHRAE Handbook of Fundamentals 2021, ASHRAE HVAC Systems & Equipment 2024.

(4) Regulatory references — EPA AIM Act (40 CFR Part 84), EPA Section 608 (40 CFR Part 82 Subpart F), EU F-Gas Regulation 517/2014 and 2024/573, Kigali Amendment to Montreal Protocol (2016), IPCC AR5/AR6 for GWP values.

(5) Equipment OEM service literature — Carrier, Trane, Lennox, Daikin, Goodman, Mitsubishi, LG, Fujitsu, Heatcraft, Hussmann for equipment-specific procedures and setpoints.

If a guide makes a specific quantitative claim ("R-407C glide is 11°F", "TXV residential target SC is 8-12°F") it carries an attribution to one of the above. No "general industry knowledge" filler.`,
        },
        {
          heading: "How to use the guides hub",
          body: `For new technicians: start with the "New HVAC technician — start with fundamentals" learning path above (PT chart guide → SH/SC fundamentals → safety classifications → high head pressure diagnosis).

For specific service problems: use the "Quick picks" section at the top to jump to the most relevant guide for your situation (high discharge pressure, A2L compliance question, GWP regulatory lookup, etc.).

For refrigerant transitions: the "Refrigerant transition planning" learning path walks through GWP rankings → comparison guide → specific pair comparisons. The 13 pair-comparison guides cover the most common transitions (R-22→R-407C, R-410A→R-454B, R-404A→R-449A, R-134a→R-513A, etc.).

For long-form reference: the comparison guide and operating pressure pages are designed to be readable end-to-end as background — not just quick lookups.`,
        },
        {
          heading: "Guide structure — what to expect inside each one",
          body: `Every guide follows a consistent structure to make information findable: a TL;DR callout at the top stating the headline conclusion; a table of contents with anchor links; numbered sections with concept primers and worked examples; visual diagnostic / pattern matrices where applicable; service problem cards with measured-derived-verdict-fix structure; common pitfalls list; FAQ accordion; and a sourced footer.

Worked examples appear in cards with the same five-block structure: measured values (gauge chips), PT chart lookup (input → output rows), derived calculations (color-coded by verdict), verdict banner (ok / warn / bad / info), and optional fix callout. This pattern repeats across the calculator pages and the guide pages so technicians develop visual fluency — once you've seen the pattern on one page, every subsequent page is faster to parse.

Visualizations come in several flavors: PT curves (single refrigerant or overlaid 2-4), bar charts (operating pressure ranges, GWP comparisons, glide values across blends), decision tree flowcharts (high head pressure diagnosis), pattern matrices (SH × SC plane with diagnostic regions), and schematic diagrams (suction-line measurement location, condenser approach). All are server-rendered inline SVG — no client-side JavaScript required, no third-party tracking, accessible via aria-label.

The structural consistency is intentional: it lets a technician form a mental model of the site once and apply it everywhere. That mental model — "look for the TL;DR, scan section headers, drill into the service problem cards that match my situation, check the sources footer" — works on every guide and every calculator.`,
        },
      ]}
      faqs={[
        {
          q: "How often are the guides updated?",
          a: `The guides update when underlying sources change. CoolProp is updated periodically; ASHRAE handbooks refresh on a 4-year cycle (Refrigeration 2022, Fundamentals 2021, HVAC S&E 2024); ASHRAE Standard 34 updates every 3-4 years (most recent 2022); EPA AIM Act technology transition rules update as sectors phase in; equipment OEM service literature updates per-model.

The page footer on each guide shows the dataset generation date, which corresponds to the most recent CoolProp / source refresh.`,
        },
        {
          q: "Do these guides replace formal HVAC training?",
          a: `No. The guides are reference material, not curriculum. EPA Section 608 certification (required to legally handle refrigerants in the US), NATE certification, and manufacturer-specific training programs (Carrier University, Trane, etc.) are the formal training paths.

The guides on this site serve as a companion to formal training — quick reference when you need to look up a target value, refresh on the conceptual framework, or check a specific refrigerant's properties.`,
        },
        {
          q: "What's the difference between this site's guides and ACCA / ASHRAE publications?",
          a: `This site's guides cite ACCA and ASHRAE extensively; they don't replace those publications. ACCA Manual T (~$60), ASHRAE Handbook of Refrigeration (~$200), and ASHRAE Standard 34 (~$130) are the authoritative industry publications.

The guides here are free-to-read, focused specifically on field-service measurement and refrigerant comparison, and updated when source standards change. For comprehensive coverage of HVAC design, load calculation, duct sizing, equipment selection, and similar topics, ACCA and ASHRAE publications are the canonical references.`,
        },
        {
          q: "Why are R-454B and R-454C such different refrigerants if the numbers are similar?",
          a: `Different blend compositions. ASHRAE 34 refrigerant designation uses the 4xx range for zeotropic blends, with the lowercase suffix (a, b, c) distinguishing different mass-fraction recipes of the same components. R-454A, R-454B, and R-454C are all blends of R-32 and R-1234yf, but in different ratios:

R-454A: 35% R-32 / 65% R-1234yf — uncommon
R-454B: 68.9% R-32 / 31.1% R-1234yf — the residential AC R-410A replacement (low glide, A2L)
R-454C: 21.5% R-32 / 78.5% R-1234yf — the LT commercial R-404A replacement (high glide, A2L)

Same component refrigerants, different applications because the proportion changes the thermodynamic envelope dramatically.`,
        },
        {
          q: "Are there commercial refrigeration guides for non-supermarket applications (transport, ice rinks)?",
          a: `Coverage on this site is currently focused on the most common HVAC applications: residential AC (R-410A/R-32/R-454B), commercial refrigeration MT/LT (R-404A/R-448A/R-449A/R-454C/R-455A), centrifugal chillers (R-134a/R-513A/R-1234ze/R-1233zd), mobile AC (R-1234yf/R-134a), heat pumps, and CO2 transcritical commercial refrigeration.

Refrigerated transport (Carrier Transicold, Thermo King), ice rinks (R-744/R-717 industrial), and specialty applications use the same refrigerant pages but with sector-specific OEM service literature. For those, consult the equipment OEM directly.`,
        },
        {
          q: "Can I cite these guides in technical reports or training materials?",
          a: `Yes. The guides and underlying dataset are licensed CC BY 4.0 — free to cite, redistribute, and adapt with attribution. Cite as: "hvacptcharts.com [page URL], accessed [date]" along with the relevant primary source attribution shown on the page (CoolProp, ACCA Manual T, ASHRAE Handbook, etc.) for the specific claim being referenced.

For the underlying refrigerant dataset, CSV/JSON downloads are available from each refrigerant detail page with the same CC BY 4.0 license.`,
        },
      ]}
      crosslinks={[
        { href: "/pt-charts-tools-hub/", label: "PT charts & tools" },
        { href: "/calculators-hub/", label: "Calculators" },
      ]}
    />
  );
}
