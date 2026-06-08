import type { Metadata } from "next";
import { refrigerants } from "@/data/refrigerants";
import { HubPage } from "@/components/hub/HubPage";
import { SITE_URL } from "@/lib/schema/shared";

const PUBLISHED = refrigerants[0]?.dataSource.ptChartGeneratedAt ?? new Date().toISOString();

export const metadata: Metadata = {
  title: "HVAC Calculators — Superheat, Subcooling, PT, Comparison, Diagnostic",
  description:
    "Free HVAC calculators built on verified CoolProp 7.2.0 saturation data: superheat (dew curve), subcooling (bubble curve), PT lookup, combined diagnostic, charge calculator, retrofit compatibility, comparison tool, saturation properties. Imperial and metric units, mobile-friendly, no signup.",
  alternates: { canonical: `${SITE_URL}/calculators-hub/` },
};

export default function CalculatorsHubPage() {
  return (
    <HubPage
      path="calculators-hub"
      title="HVAC Calculators"
      introHeadline="Free calculators for HVAC field work. Built on the verified refrigerant dataset — same source as the PT charts."
      introBody="Each calculator reads from the same Zod-validated saturation data that drives the chart pages. Bubble vs dew curves are handled correctly for zeotropic blends. All targets and ranges cite ACCA Manual T (2017), ASHRAE Handbook of Refrigeration 2022, AHRI Standard 540-2020, and equipment-specific manufacturer literature (Carrier, Trane, Lennox, Daikin, Goodman). Nine calculators total, each with worked service problems, reference tables, and SVG diagnostic visualizations."
      publishedDate={PUBLISHED}
      scenarios={[
        {
          situation: "I'm charging a new R-410A TXV residential AC by subcooling",
          href: "/subcooling-calculator/",
          toolLabel: "Subcooling Calculator",
          reasoning: "TXV systems are charged by SC (8-12°F target). Use this with the discharge pressure and liquid line temp.",
        },
        {
          situation: "I'm charging a fixed-orifice R-22 / R-410A AC by superheat",
          href: "/superheat-calculator/",
          toolLabel: "Superheat Calculator",
          reasoning: "Fixed-orifice systems use ACCA Manual T charging chart (SH indexed on indoor WB / outdoor DB).",
        },
        {
          situation: "System is running but cooling is weak — diagnose root cause",
          href: "/system-pressure-diagnostic-calculator/",
          toolLabel: "System Pressure Diagnostic",
          reasoning: "Multi-input diagnostic with approach temperatures. Distinguishes undercharge / fouling / restriction / overcharge fingerprints.",
        },
        {
          situation: "Considering R-22 retrofit to R-407C — will pressures fit?",
          href: "/refrigerant-pt-comparison-tool/",
          toolLabel: "PT Comparison Tool",
          reasoning: "Visual overlay of 2-4 refrigerants' PT curves. Quick envelope check across service range.",
        },
        {
          situation: "Refrigerant swap — full compatibility analysis",
          href: "/refrigerant-retrofit-compatibility-calculator/",
          toolLabel: "Retrofit Compatibility",
          reasoning: "Five-criterion verdict: lubricant, safety class, pressure, glide, application. Tells you drop-in / standard retrofit / not feasible.",
        },
        {
          situation: "Adjusting nameplate charge for actual line set length",
          href: "/refrigerant-charge-calculator/",
          toolLabel: "Refrigerant Charge Calculator",
          reasoning: "Per-foot oz/ft from CoolProp liquid density × line ID. Standard pre-charging step for residential installs.",
        },
      ]}
      sections={[
        {
          heading: "Charging and diagnostic",
          description: "Service-call tools. Read manifold pressures + line temperatures, get superheat / subcooling / verdict.",
          items: [
            { href: "/superheat-calculator/", label: "Superheat Calculator", blurb: "Suction-line PSIG + temperature → superheat with diagnostic interpretation. Top-traffic page on the site. ACCA Manual T target SH chart for fixed-orifice systems, dew-curve math for zeotropic blends.", tag: "Top traffic" },
            { href: "/subcooling-calculator/", label: "Subcooling Calculator", blurb: "Liquid-line PSIG + temperature → subcooling. Primary charging metric for TXV / EEV systems (8-12°F target). Bubble-curve math for zeotropic blends." },
            { href: "/pt-superheat-subcooling-calculator/", label: "Combined PT / Superheat / Subcooling", blurb: "Both sides on one form with eight-pattern diagnostic matrix (undercharge, overcharge, restriction, fouling, TXV failure, non-condensables)." },
            { href: "/system-pressure-diagnostic-calculator/", label: "System Pressure Diagnostic", blurb: "8-input expert system: ambient, return air, suction P/T, liquid P/T → flagged findings with evidence and ordered recommendations." },
            { href: "/refrigerant-charge-calculator/", label: "Refrigerant Charge Calculator", blurb: "Line-set length adjustment to nameplate charge. Per-foot oz from CoolProp liquid density × Type L copper ID. Density-corrected for 50+ refrigerants." },
          ],
        },
        {
          heading: "Lookup and reference",
          description: "Foundation tools. PT lookups, saturation properties, retrofit feasibility analysis.",
          items: [
            { href: "/pt-calculator/", label: "PT Calculator", blurb: "Bidirectional saturation pressure ↔ temperature lookup for 50+ refrigerants, bubble + dew for blends. 10 worked service problems, ACCA Manual T target charts." },
            { href: "/saturation-properties-calculator/", label: "Saturation Properties Calculator", blurb: "Bubble, dew, glide at any temperature plus reference properties (critical point, boiling point, molar mass)." },
            { href: "/refrigerant-pt-comparison-tool/", label: "Refrigerant PT Comparison Tool", blurb: "Overlay 2-4 refrigerants on one PT chart. Six common comparison presets for residential phase-down, commercial LT, mobile AC, retrofit." },
            { href: "/refrigerant-retrofit-compatibility-calculator/", label: "Retrofit Compatibility", blurb: "Pair-comparison decision matrix: lubricant, safety class, pressure rating, glide, application overlap. Six-tier verdict from drop-in to not feasible." },
          ],
        },
      ]}
      learningPaths={[
        {
          title: "New to HVAC service measurement",
          description: "Start here if you're learning the fundamentals.",
          steps: [
            { href: "/superheat-subcooling-fundamentals/", label: "Superheat & subcooling fundamentals" },
            { href: "/pt-calculator/", label: "PT calculator — quick lookups" },
            { href: "/superheat-calculator/", label: "Superheat calculator — first measurement" },
            { href: "/subcooling-calculator/", label: "Subcooling calculator — pair with SH" },
            { href: "/pt-superheat-subcooling-calculator/", label: "Combined calculator — diagnostic patterns" },
          ],
        },
        {
          title: "Working on a refrigerant transition",
          description: "Choose between R-410A / R-32 / R-454B, or retrofit R-22 / R-404A.",
          steps: [
            { href: "/refrigerant-pt-comparison-tool/", label: "PT comparison tool — envelope check" },
            { href: "/refrigerant-retrofit-compatibility-calculator/", label: "Retrofit compatibility — full analysis" },
            { href: "/refrigerant-comparison-guide/", label: "Refrigerant comparison guide — long-form" },
            { href: "/refrigerant-gwp-rankings/", label: "GWP rankings — regulatory context" },
          ],
        },
      ]}
      aboutSections={[
        {
          heading: "Why these calculators",
          body: `HVAC service measurements are inherently quantitative — superheat, subcooling, condenser approach, and refrigerant charge all reduce to PT chart lookups plus arithmetic. The calculators on this site formalize that arithmetic with verified saturation data so the only thing a technician needs to bring to the field is accurate pressure and temperature readings.

The previous WordPress version of this site shipped with approximately 25,000 fabricated quantitative errors — PT values wrong by 2-15×, some above critical pressure (physically impossible), several A2L/A3/B2L refrigerants classified as "A1 non-flammable" (safety-critical misclassifications). The current rebuild was structured specifically to make those failure modes impossible: every value comes from CoolProp 7.2.0 or a cited manufacturer datasheet, safety class is a Zod enum (impossible to display the wrong class), and any input outside the valid chart range returns "out of range" instead of an extrapolated number.

This means the calculators here are deliberately less "smart" than some competitors — they refuse to guess. That's the feature, not a bug.`,
        },
        {
          heading: "What the verification looks like",
          body: `Saturation data: CoolProp 7.2.0 (Bell, Wronski, Quoilin, Lemort 2014, doi:10.1021/ie4033999) implements REFPROP-compatible Helmholtz EOS for pure refrigerants and predefined mixtures. Cross-checked against AHRI Standard 700-2019 specifications where applicable. For 11 manufacturer-blend refrigerants not in CoolProp's library (R-448A, R-450A, R-1336mzz(Z), etc.), values come from named manufacturer datasheets (Honeywell, Chemours, Arkema, AGC).

Target SH and SC ranges: ACCA Manual T (2017) for fixed-orifice charging charts and diagnostic patterns; ASHRAE Handbook of Refrigeration 2022 (Chapter 23) for application-specific target ranges; equipment OEM service literature (Carrier, Trane, Lennox, Daikin, Goodman, Mitsubishi) for equipment-specific setpoints; AHRI Standard 540-2020 for compressor protection minimums.

Regulatory context: EPA AIM Act (40 CFR Part 84) for HFC phase-down dates and GWP caps; ASHRAE Standard 34-2022 for safety classifications; IEC 60335-2-40 for A2L equipment requirements; EPA Section 608 for refrigerant handling and leak repair.

Every claim on every calculator page traces to one of these primary sources. The footer of each calculator lists the specific sources used.`,
        },
        {
          heading: "What's NOT in these calculators",
          body: `Equipment-specific charge values. The calculators reference equipment OEM literature for nameplate charge but don't store per-model factory charges. Always read the nameplate or service manual for the specific equipment being serviced.

Real-time pricing or availability. Refrigerant prices and supply fluctuate based on AIM Act allocations, weather, and import/export dynamics. Use distributor pricing for current quotes.

Equipment-specific charging procedures. The calculators surface the general procedure (charge by SC on TXV, charge by SH on fixed-orifice with ACCA Manual T chart). Specific equipment may have OEM-specific procedures that override the general approach — always check.

Real-time diagnostic recommendations. The diagnostic calculators surface pattern-matched root causes and ordered investigation steps; they don't replace technician judgment. Treat the flags as "here's what to investigate first" rather than "here's the definitive answer."

For these, refer to the specific equipment OEM, your distributor, and your own field experience — the calculators are a thinking aid, not a replacement.`,
        },
        {
          heading: "How the calculators have evolved",
          body: `The first version of these calculators shipped on WordPress with approximately 25,000 fabricated quantitative errors — PT values wrong by 2-15× across the dataset, several values physically impossible (above critical pressure), and safety-critical misclassifications (A2L/A3/B2L refrigerants labeled "A1 non-flammable"). That version of the site was technically a calculator but structurally a liability — a technician trusting the numbers risked equipment damage or safety incidents.

The current rebuild started from the data layer. Every refrigerant property comes from a primary source (CoolProp 7.2.0 / NIST REFPROP / manufacturer datasheet); every value passes Zod schema validation at build time; safety class is a typed enum so the wrong class cannot be displayed; values outside the valid range return "out of range" instead of an extrapolated fabrication. The calculator code then sits on top of this verified data layer with minimal computation — usually just unit conversion, interpolation between adjacent data points, and pattern-matched diagnostic logic from ACCA Manual T.

This means the calculators are deliberately "thin" — they do less than some competitors but the small amount they do is verifiable. Each calculator page lists every source feeding into the calculation. The downloadable refrigerant dataset under CC BY 4.0 is the same dataset the calculators read from, so independent verification is possible.

The trade-off is conservatism: when a refrigerant has limited published data, the calculator reports "out of range" rather than guessing. For mainstream HVAC refrigerants (R-22, R-410A, R-32, R-454B, R-134a, R-407C, R-404A, R-454C, R-744, etc.), data coverage is comprehensive across the full operating envelope. For specialty or very rare refrigerants, coverage is intentionally limited to what's verifiable from primary sources.`,
        },
      ]}
      faqs={[
        {
          q: "Why do you list multiple target SH/SC ranges for the same refrigerant?",
          a: `Target SH and SC depend on the metering device (TXV vs fixed-orifice), the application (residential AC vs commercial refrigeration vs chiller), and the specific equipment OEM. The calculators list the typical ranges per application; always cross-check the equipment nameplate for the specific value.

For example: residential AC TXV is typically 8-12°F SC, but Carrier targets 10°F, Trane targets 8°F, Lennox targets 12°F on different models. The OEM nameplate is authoritative.`,
        },
        {
          q: "Do these calculators handle R-744 (CO2) transcritical operation?",
          a: `Partially. The sub-critical low-side analysis works for CO2 systems (saturation pressures below the 87.8°F critical temperature). The transcritical high-side cannot be analyzed with saturation-based logic — above the critical temperature there's no saturation pressure, so subcooling and condenser approach calculations don't apply.

For CO2 transcritical diagnostic work, refer to equipment OEM service literature. The patterns are different from sub-critical HVAC and require different metrics (gas cooler outlet temperature instead of subcooling).`,
        },
        {
          q: "Why dew curve for superheat and bubble curve for subcooling on zeotropic blends?",
          a: `Superheat is measured on the suction line where the refrigerant has fully passed through evaporation — the relevant saturation boundary is the dew temperature (where the last drop of liquid disappeared). Subcooling is measured on the liquid line where the refrigerant has fully condensed — the relevant boundary is the bubble temperature (below which everything is liquid).

Using the wrong curve introduces an error equal to the glide value: 11°F for R-407C, 14°F for R-454C, 22°F for R-455A. The site's calculators handle this automatically.`,
        },
        {
          q: "Can I trust these calculators for legal/compliance documentation?",
          a: `The calculators provide service-decision support; they don't replace EPA Section 608 documentation requirements or OEM-mandated charging procedures. For compliance documentation: keep a written record of recovery amounts, refrigerant added, leak repairs, and service procedures performed as required by 40 CFR Part 82 Subpart F.

The calculators' diagnostic patterns and recommendations are sourced from ACCA Manual T, ASHRAE Handbook of Refrigeration 2022, and AHRI standards — the same primary sources EPA-certified technicians reference. Source citations on each calculator page identify the specific authority.`,
        },
        {
          q: "Why don't you have a heat-load / sizing calculator?",
          a: `Heat-load calculation (ACCA Manual J for residential, ACCA Manual N or commercial Manual L for commercial) requires building-specific inputs (envelope, infiltration, internal gains, ventilation, occupancy) that don't fit a single-form calculator. The right tool is ACCA Manual J / Manual S compliant software (Wrightsoft, Elite Software, CoolCalc).

This site focuses on refrigerant-side service tools — the kind a technician uses with manifold gauges and temperature probes on a running system. Load calculation is upstream (design phase); refrigerant-side measurement is downstream (commissioning and service).`,
        },
        {
          q: "Are the calculators free?",
          a: `Yes. All calculators on this site are free with no signup, no paywall, no email harvesting. The site monetizes via Raptive display advertising (banner placements that do not affect calculator functionality or data accuracy).

The underlying refrigerant dataset is licensed CC BY 4.0 and downloadable as CSV/JSON from each refrigerant detail page — free to use, redistribute, or build upon with attribution.`,
        },
        {
          q: "How can I report a calculation error or data issue?",
          a: `Open an issue on the project repository or email the maintainer. Include the refrigerant slug, the input values you used, the calculator output you received, and the expected output with its source citation (CoolProp, ACCA Manual T, ASHRAE, manufacturer datasheet — whichever you're cross-checking against).

Verified errors are corrected immediately. The verification audit history (when the data layer last regenerated, what changed) is published in the site's commit log for transparency.`,
        },
      ]}
      crosslinks={[
        { href: "/pt-charts-tools-hub/", label: "PT charts & tools" },
        { href: "/guides-hub/", label: "Guides" },
      ]}
    />
  );
}
