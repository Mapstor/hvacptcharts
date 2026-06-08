import type { Metadata } from "next";
import { Activity, Calculator as CalcIcon, Gauge, Table as TableIcon } from "lucide-react";
import { refrigerants, getRefrigerant } from "@/data/refrigerants";
import { CalculatorShell } from "@/components/calculators/shared/CalculatorShell";
import { RefrigerantPtComparison } from "@/components/calculators/RefrigerantPtComparison";
import {
  ComparisonTable,
  Derived,
  FixCallout,
  Gauges,
  Lookups,
  Panel,
  ServiceProblem,
  VerdictBanner,
} from "@/components/calculators/shared/ServiceProblem";
import { TechSection, KeyInsight } from "@/components/refrigerant/TechSection";
import { SITE_URL } from "@/lib/schema/shared";

const PUBLISHED = refrigerants[0]?.dataSource.ptChartGeneratedAt ?? new Date().toISOString();

const FAQS = [
  {
    q: "What does this tool show?",
    a: "Pick 2-4 refrigerants and the tool overlays their saturation pressure-temperature curves on one set of axes. The result makes pressure-envelope comparisons across the operating range immediate — R-454B vs R-410A across residential AC, R-22 vs R-407C for retrofit, R-32 vs R-410A for new-equipment specification.",
  },
  {
    q: "Why are some curves dashed?",
    a: "Solid lines are the bubble (saturated liquid) curve at the temperature given. Dashed lines are the dew (saturated vapor) curve. For pure refrigerants and azeotropes (R-22, R-32, R-134a, R-507A) the two coincide so only the solid line is drawn. For zeotropic blends (R-407C, R-454C, R-455A, R-448A, R-449A) both are shown and the vertical gap at any temperature is the temperature glide at that pressure.",
  },
  {
    q: "Why does my comparison look squished when I mix high- and low-pressure refrigerants?",
    a: "If you include refrigerants with very different operating envelopes — R-744 (CO₂, 800+ PSIG at 70°F) with R-1234ze (~50 PSIG at 70°F) — the linear y-axis compresses lower-pressure curves toward zero. The relationship is still correct but visual readability suffers. For wildly different envelopes, do two separate comparisons (high-pressure family, low-pressure family) for cleaner reading.",
  },
  {
    q: "How do I compare two refrigerants for retrofit feasibility?",
    a: "Retrofit feasibility depends on more than the PT curve: lubricant compatibility, component pressure rating, safety class change, capacity match, and glide all matter. The PT overlay shows whether system pressures will be comparable across the operating range (look at the curves at 40°F evaporator and 110°F condenser for residential AC; -20°F evap and 95°F cond for LT walk-in). For a structured pair comparison, use the Retrofit Compatibility Calculator.",
  },
  {
    q: "What are the typical use cases for PT comparison?",
    a: "Five primary uses: (1) retrofit feasibility — R-22 vs candidate replacement (R-407C, R-422D, R-454C); (2) new-equipment specification — R-32 vs R-410A vs R-454B for residential AC; (3) commercial transition — R-404A vs R-448A vs R-449A vs R-454C for low-GWP commercial refrigeration; (4) mobile AC — R-134a vs R-1234yf compatibility; (5) phase-down trajectory visualization — showing pressure envelope evolution across a refrigerant family over decades.",
  },
  {
    q: "Does the chart account for service temperature ranges?",
    a: "The chart spans -40°F to 130°F by default — covering the residential AC service range. For commercial refrigeration use the lower end (-40°F to 30°F evap, 80°F to 130°F condenser). For chillers focus on the 30°F-130°F band. For mobile AC focus on the 30°F-150°F band. The chart includes the full envelope but interpretive focus depends on application.",
  },
  {
    q: "What's the relationship between PT curve slope and operating efficiency?",
    a: "Steep PT curves (high dP/dT) mean small temperature changes produce large pressure swings. R-32 is steeper than R-410A; R-744 (CO₂) is steeper than R-32 in its sub-critical regime. Steep curves require pressure-rated components and tighter charge control but offer higher volumetric capacity per unit displacement. Flatter PT curves (R-134a, R-1234yf) are forgiving but lower capacity.",
  },
];

export const metadata: Metadata = {
  title: "Refrigerant PT Comparison Tool — Overlay PT Charts for Retrofit & New Equipment",
  description:
    "Overlay saturation pressure-temperature curves for 2-4 HVAC refrigerants on one chart. Visual comparison for retrofit (R-22 → R-407C, R-454C), new-equipment specification (R-32 vs R-410A vs R-454B), commercial low-GWP transitions (R-404A → R-448A → R-454C), and mobile AC (R-134a vs R-1234yf). CoolProp 7.2.0 sourced.",
  alternates: { canonical: `${SITE_URL}/refrigerant-pt-comparison-tool/` },
};

export default function ComparisonToolPage() {
  return (
    <CalculatorShell
      schema={{
        path: "refrigerant-pt-comparison-tool",
        name: "Refrigerant PT Comparison Tool",
        description:
          "Overlay saturation pressure-temperature curves for 2-4 refrigerants on one chart. Useful for retrofit feasibility assessment, new-equipment specification, commercial low-GWP transitions, and quick visual comparison of operating envelopes.",
        featureList: [
          "Overlay 2-4 refrigerants on one PT axis (50+ refrigerants supported)",
          "Bubble + dew rendering for zeotropic blends — visible glide",
          "Imperial (°F, PSIG) and metric (°C, kPa) unit toggles",
          "Color-coded series with legend",
          "Six common comparison presets (residential phase-down, commercial LT, mobile AC, retrofit, etc.)",
          "Service problems showing retrofit feasibility workflow",
          "Mobile-friendly, no signup",
        ],
        publishedDate: PUBLISHED,
        breadcrumbLabel: "PT Comparison Tool",
      }}
      introOneLiner="Pick 2-4 refrigerants from the dataset; the tool overlays their saturation curves on one chart. Glide visible for zeotropic blends. Useful for retrofit feasibility, new-equipment specification, and commercial low-GWP transition planning."
      generatedDate={PUBLISHED.slice(0, 10)}
      howTo={{
        steps: [
          "Tool starts with R-22, R-410A, R-32, and R-454B — the residential AC phase-down trajectory.",
          "Swap any refrigerant from the dropdowns. Add up to 4 series, or remove down to 2.",
          "Toggle units between °F/°C and PSIG/kPa.",
          "Read curves at your operating points: 40°F evap / 110°F cond for residential AC; -20°F evap / 95°F cond for LT walk-in; 45°F evap / 110°F cond for chiller.",
          "For zeotropic blends, both bubble (solid) and dew (dashed) curves are shown — the gap is the glide.",
        ],
        commonErrors: [
          "Comparing across vastly different pressure envelopes (R-744 + R-1234ze) on one chart — readability suffers. Split into separate comparisons.",
          "Ignoring glide on zeotropic blends — the wide gap matters for service measurement and capacity calculations.",
          "Treating curve crossover as significant — at one specific temperature curves can coincide; the broader envelope shape matters more.",
          "Using PT overlay alone for retrofit decisions — lubricant compatibility, safety class, and GWP need separate evaluation.",
        ],
      }}
      math={{
        formula:
          "Each plotted curve = saturation pressure at given temperature for that refrigerant.\nFor pure refrigerants and azeotropes: P_sat = f(T) single curve.\nFor zeotropic blends: P_bubble = f(T) solid, P_dew = f(T) dashed.",
        sourceCitation:
          "Saturation pressures from CoolProp 7.2.0 (Bell, Wronski, Quoilin, Lemort 2014, doi:10.1021/ie4033999), REFPROP-compatible Helmholtz EOS. For 11 manufacturer-blend refrigerants not in CoolProp's reference library, values from named manufacturer PT charts (Honeywell, Chemours, Arkema, AGC).",
        workedExample:
          "R-410A vs R-32 vs R-454B at 95°F (typical residential design ambient):\n  R-410A: 278 PSIG\n  R-32: 296 PSIG (+6.5% vs R-410A)\n  R-454B: 262 PSIG bubble / 256 PSIG dew (−5.8% vs R-410A)\n\nAt 40°F (evaporator):\n  R-410A: 119 PSIG\n  R-32: 124 PSIG\n  R-454B: 115 PSIG / 113 PSIG\n\nInterpretation: R-32 runs slightly higher pressure than R-410A; R-454B slightly lower. All three within standard 500 PSI service equipment ratings.",
      }}
      relatedTools={[
        { href: "/pt-calculator/", label: "PT Calculator", blurb: "Single-refrigerant lookup, either direction." },
        { href: "/refrigerant-retrofit-compatibility-calculator/", label: "Retrofit Compatibility", blurb: "Structured pair comparison: lubricants, safety, pressure, glide, GWP." },
        { href: "/refrigerant/r-410a/", label: "R-410A detail page", blurb: "Full reference + GWP + retrofit guidance." },
        { href: "/refrigerant/r-454b/", label: "R-454B detail page", blurb: "Leading R-410A replacement (A2L)." },
        { href: "/refrigerant-comparison-guide/", label: "Full Comparison Guide", blurb: "Long-form sourced guide to all common HVAC refrigerant comparisons." },
      ]}
      faqs={FAQS}
      bodySections={<RichContent />}
    >
      <RefrigerantPtComparison />
    </CalculatorShell>
  );
}

function RichContent() {
  return (
    <>
      <TechSection icon="chart" tone="blue" title="What the PT comparison chart actually shows">
        <p>
          Each curve on the overlay chart represents one refrigerant&apos;s saturation
          pressure plotted against saturation temperature. At any temperature on the x-axis,
          you can read off the pressure at which that refrigerant&apos;s liquid and vapor
          coexist in equilibrium. Comparing two curves at the same temperature shows the
          pressure delta between the refrigerants.
        </p>
        <p>
          For pure refrigerants and azeotropes (single saturation temperature per pressure),
          each is a single solid curve. For zeotropic blends, two curves: the bubble line
          (solid) where the first vapor forms when heating the liquid, and the dew line
          (dashed) where the last liquid disappears when condensing the vapor. The vertical
          distance between bubble and dew at any pressure is the glide.
        </p>
        <KeyInsight tone="emerald" icon="insight" title="The chart compresses dozens of data points into one visual">
          A PT chart for a single refrigerant is a 191-row table (1°F increments from -40 to
          150). An overlay of four refrigerants is 764 data points compressed into a
          single chart. The visual makes pressure-envelope decisions immediate that would
          take minutes to compute from tables alone.
        </KeyInsight>
      </TechSection>

      <TechSection icon="composition" tone="purple" title="Common comparison presets — what each one reveals">
        <Panel title="Recommended PT comparison presets" icon={TableIcon}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-[10px] uppercase tracking-wider text-zinc-500 dark:border-zinc-800">
                  <th className="py-1.5 text-left">Use case</th>
                  <th className="py-1.5 text-left">Refrigerants to overlay</th>
                  <th className="py-1.5 text-left">What to look for</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5">Residential AC phase-down</td><td className="py-1.5 font-mono text-xs">R-22 · R-410A · R-32 · R-454B</td><td className="py-1.5 text-xs">Pressure envelope trajectory across HCFC → HFC → A2L</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5">R-22 retrofit candidates</td><td className="py-1.5 font-mono text-xs">R-22 · R-407C · R-422D · R-454C</td><td className="py-1.5 text-xs">Which retrofit matches R-22 envelope; dew vs bubble for zeotropes</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5">Commercial LT low-GWP</td><td className="py-1.5 font-mono text-xs">R-404A · R-448A · R-449A · R-454C</td><td className="py-1.5 text-xs">AIM Act compliance path; capacity match at low-temp evap</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5">Mobile AC transition</td><td className="py-1.5 font-mono text-xs">R-134a · R-1234yf</td><td className="py-1.5 text-xs">SAE J639 / EU MAC Directive compatibility</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5">Chiller refrigerants</td><td className="py-1.5 font-mono text-xs">R-134a · R-513A · R-1234ze · R-1233zd</td><td className="py-1.5 text-xs">Centrifugal chiller R-134a replacement options</td></tr>
                <tr><td className="py-1.5">High vs low pressure</td><td className="py-1.5 font-mono text-xs">R-744 · R-410A · R-22 · R-134a</td><td className="py-1.5 text-xs">CO₂ trans-critical envelope vs traditional HFC range</td></tr>
              </tbody>
            </table>
          </div>
        </Panel>
      </TechSection>

      <TechSection icon="thermometer" tone="emerald" title="Reading the chart for retrofit feasibility">
        <p>
          A successful refrigerant retrofit requires the candidate&apos;s pressure envelope
          to fall within the equipment&apos;s design pressure ratings across the full
          operating range. The PT overlay reveals this at a glance.
        </p>
        <p>
          Look at three operating temperatures: 40°F (typical evaporator saturation for AC),
          70°F (typical room ambient), and 95-110°F (typical condenser saturation). If the
          candidate curve sits within 10-20% of the incumbent at all three points, the
          pressure-envelope match is acceptable. Differences greater than 30% require
          equipment re-rating or replacement.
        </p>
        <Panel title="Retrofit pressure envelope decision matrix" icon={TableIcon}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-[10px] uppercase tracking-wider text-zinc-500 dark:border-zinc-800">
                  <th className="py-1.5 text-left">Δ pressure at 95°F</th>
                  <th className="py-1.5 text-left">Feasibility</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5 text-emerald-700 dark:text-emerald-300">±5%</td><td className="py-1.5">Drop-in compatible (pressure-wise). Verify lubricant + safety class.</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5 text-amber-700 dark:text-amber-300">±5-20%</td><td className="py-1.5">Acceptable with standard retrofit (oil change, drier, recharge by weight).</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5 text-amber-700 dark:text-amber-300">±20-40%</td><td className="py-1.5">Marginal. Component pressure ratings need re-evaluation; capacity may shift.</td></tr>
                <tr><td className="py-1.5 text-red-700 dark:text-red-300">±40%+</td><td className="py-1.5">Not a drop-in. Equipment redesign or full replacement required.</td></tr>
              </tbody>
            </table>
          </div>
        </Panel>
      </TechSection>

      <TechSection icon="service" tone="amber" title="Real comparison scenarios — using the chart for decisions">
        <p>
          Six scenarios showing how to interpret the PT overlay for specific service or
          specification decisions. Each maps a comparison to a verdict (compatible,
          marginal, requires redesign).
        </p>
      </TechSection>

      <ServiceProblem
        number={1}
        refrigerant="R-22 → R-407C"
        title="Pressure-envelope check for residential R-22 retrofit"
        scenario="Legacy R-22 residential AC. Customer wants to extend equipment life rather than full replacement. R-407C is the most common R-22 retrofit option — does the pressure envelope match?"
      >
        <Panel title="Comparison at service temperatures" icon={TableIcon}>
          <ComparisonTable
            headers={["Temp", "R-22 (pure)", "R-407C bubble", "R-407C dew", "Max Δ"]}
            rows={[
              { label: "40°F evap", cells: ["69 PSIG", "80", "63", "+16%"], tone: "delta" },
              { label: "95°F cond", cells: ["181 PSIG", "215", "180", "+19%"], tone: "delta" },
              { label: "120°F cutout", cells: ["260 PSIG", "305", "258", "+17%"], tone: "delta" },
            ]}
          />
        </Panel>
        <VerdictBanner status="ok" title="Compatible retrofit — standard procedure">
          R-407C bubble pressure runs 16-19% above R-22 across the envelope; dew is nearly
          identical to R-22. Within the ±20% feasibility band. Standard 500 PSI manifold
          gauges handle both. Component pressure rating margin is adequate.
        </VerdictBanner>
        <FixCallout>
          Standard R-22 → R-407C retrofit procedure: recover R-22, drain mineral oil
          (R-407C requires POE), replace filter-drier, evacuate to 500 microns, charge
          R-407C by weight to ~90% of R-22 nameplate. Use bubble curve for SC measurement
          (R-407C has ~11°F glide).
        </FixCallout>
      </ServiceProblem>

      <ServiceProblem
        number={2}
        refrigerant="R-410A → R-32"
        title="New equipment specification — R-32 vs R-410A pressure delta"
        scenario="Selecting between R-32 and R-410A for new residential AC equipment in the 2026 AIM Act-driven transition. R-32 is the dominant A2L choice in Asia; R-454B leads in North America. Quick pressure check."
      >
        <Panel title="Comparison at service temperatures" icon={TableIcon}>
          <ComparisonTable
            headers={["Temp", "R-410A", "R-32", "Δ vs R-410A"]}
            rows={[
              { label: "40°F evap", cells: ["119 PSIG", "124 PSIG", "+4%"], tone: "delta" },
              { label: "95°F cond", cells: ["278 PSIG", "296 PSIG", "+6%"], tone: "delta" },
              { label: "120°F cutout", cells: ["380 PSIG", "410 PSIG", "+8%"], tone: "delta" },
            ]}
          />
        </Panel>
        <VerdictBanner status="info" title="R-32 runs 4-8% higher than R-410A">
          Within the drop-in range. R-410A-rated 800 PSI service equipment handles R-32
          without modification. Equipment-design accommodations for R-32 are A2L
          flammability (sealed motors, IEC 60335-2-40 charge limits) rather than pressure
          ratings.
        </VerdictBanner>
      </ServiceProblem>

      <ServiceProblem
        number={3}
        refrigerant="R-404A → R-454C"
        title="Commercial LT walk-in low-GWP transition"
        scenario="Supermarket R-404A walk-in freezer. AIM Act prohibits R-404A in new commercial refrigeration. Comparing R-454C (sub-150 GWP, A2L) as the replacement for new equipment specification."
      >
        <Panel title="Comparison at LT operating points" icon={TableIcon}>
          <ComparisonTable
            headers={["Temp", "R-404A", "R-454C bubble", "R-454C dew", "Δ at bubble"]}
            rows={[
              { label: "−20°F evap", cells: ["19 PSIG", "21", "5", "+11%"], tone: "delta" },
              { label: "95°F cond", cells: ["232 PSIG", "220", "185", "−5%"], tone: "delta" },
            ]}
          />
        </Panel>
        <VerdictBanner status="info" title="Close envelope match — bubble pressure within ±10%">
          R-454C is engineered as a low-GWP drop-in replacement for R-404A in low-temp
          commercial. Pressure envelope is within ±10% of R-404A using the correct
          bubble curve. The 14°F glide is the main service difference — TXV sensing and
          superheat / subcooling measurement need dew / bubble curve awareness.
        </VerdictBanner>
        <FixCallout>
          For new LT walk-in equipment specification under AIM Act, R-454C is one of the
          two leading sub-700 GWP options (R-455A is the other). For service of existing
          R-404A equipment, retrofit candidates include R-448A and R-449A which retain
          mineral-oil compatibility (R-454C requires POE).
        </FixCallout>
      </ServiceProblem>

      <ServiceProblem
        number={4}
        refrigerant="R-134a → R-1234yf"
        title="Mobile AC R-134a to R-1234yf — pressure envelope was engineered to match"
        scenario="2017+ vehicle production transitioned from R-134a to R-1234yf for global GWP compliance (EU MAC Directive, US EPA SNAP). R-1234yf was engineered specifically to preserve R-134a-compatible mobile AC equipment design."
      >
        <Panel title="Comparison at MAC operating points" icon={TableIcon}>
          <ComparisonTable
            headers={["Temp", "R-134a", "R-1234yf", "Δ"]}
            rows={[
              { label: "35°F evap", cells: ["28 PSIG", "26 PSIG", "−7%"], tone: "delta" },
              { label: "100°F cabin ambient", cells: ["124 PSIG", "127 PSIG", "+2%"], tone: "delta" },
              { label: "140°F engine bay", cells: ["217 PSIG", "227 PSIG", "+5%"], tone: "delta" },
            ]}
          />
        </Panel>
        <VerdictBanner status="ok" title="Near-identical envelope — drop-in compatible by design">
          R-1234yf was synthesized to match R-134a&apos;s pressure envelope within a few
          percent. Service equipment for R-134a handles R-1234yf — only the service-port
          dimensions differ (SAE J639 specifies different fittings to prevent
          cross-contamination). Lubricant (PAG) compatible with both. The pressure-envelope
          match was the entire point of choosing this molecule as the R-134a successor.
        </VerdictBanner>
      </ServiceProblem>

      <ServiceProblem
        number={5}
        refrigerant="Chiller (R-134a → R-513A)"
        title="Centrifugal chiller R-134a replacement — R-513A is the leading option"
        scenario="Centrifugal water-cooled chiller, R-134a, due for refrigerant transition (AIM Act, lower GWP). R-513A (Trane / Chemours Opteon XP10) is the most common chiller replacement; it's an azeotropic R-134a/R-1234yf blend."
      >
        <Panel title="Comparison at chiller operating points" icon={TableIcon}>
          <ComparisonTable
            headers={["Temp", "R-134a", "R-513A", "Δ"]}
            rows={[
              { label: "40°F evap", cells: ["35 PSIG", "37 PSIG", "+6%"], tone: "delta" },
              { label: "110°F cond", cells: ["146 PSIG", "157 PSIG", "+8%"], tone: "delta" },
              { label: "130°F max ambient", cells: ["199 PSIG", "213 PSIG", "+7%"], tone: "delta" },
            ]}
          />
        </Panel>
        <VerdictBanner status="ok" title="R-513A runs 6-8% above R-134a — chiller-friendly">
          R-513A pressure envelope is closely matched to R-134a. POE lubricant compatible.
          Many chiller OEMs (Trane, Carrier, Daikin) certify R-513A as a drop-in
          replacement for R-134a in their centrifugal chiller lines with minor service
          procedure updates. Lower GWP (631 vs R-134a&apos;s 1430).
        </VerdictBanner>
      </ServiceProblem>

      <ServiceProblem
        number={6}
        refrigerant="R-744 (CO₂) vs HFC family"
        title="CO₂ transcritical vs HFC sub-critical — different operating regimes"
        scenario="Considering R-744 transcritical for a supermarket commercial refrigeration project. Comparing against R-410A and R-22 to visualize the dramatic pressure-envelope difference."
      >
        <Panel title="Comparison at common refrigeration temperatures" icon={TableIcon}>
          <ComparisonTable
            headers={["Temp", "R-22", "R-410A", "R-744", "R-744 vs R-410A"]}
            rows={[
              { label: "−20°F (LT evap)", cells: ["10 PSIG", "26", "199", "+665%"], tone: "delta" },
              { label: "20°F (MT evap)", cells: ["41 PSIG", "78", "421", "+440%"], tone: "delta" },
              { label: "87.8°F (CO₂ critical)", cells: ["157 PSIG", "240", "1057", "+340%"], tone: "delta" },
              { label: "100°F+", cells: ["196 PSIG", "320", "transcritical", "N/A"], tone: "delta" },
            ]}
          />
        </Panel>
        <VerdictBanner status="info" title="R-744 operates 3-7× higher pressure than HFCs">
          R-744 (CO₂) operates in a fundamentally different pressure regime than the HFC
          family. Above 87.8°F (critical temperature) no saturation exists — the high
          side becomes transcritical and is controlled by a high-pressure throttle valve.
          R-744 systems require purpose-designed equipment (200+ bar / 3000+ PSIG
          components) and cannot use standard HFC service tools or piping.
        </VerdictBanner>
        <FixCallout>
          For supermarket transcritical CO₂ specification, work with R-744-experienced
          contractors and OEM-certified service teams. The pressure-envelope shift is too
          large for any HFC-compatible service equipment; specialized gauges, hoses, and
          recovery cylinders are required.
        </FixCallout>
      </ServiceProblem>

      <TechSection icon="warning" tone="amber" title="What PT comparison alone does NOT tell you">
        <p>
          The pressure-envelope match shown by the PT overlay is necessary but not
          sufficient for retrofit decisions. Other factors that the chart does not show
          must be evaluated separately:
        </p>
        <ol>
          <li>
            <strong>Lubricant compatibility.</strong> R-22 systems use mineral oil; HFC
            replacements (R-407C, R-410A) require POE. Hydrocarbon blends (R-422D, R-438A)
            include small hydrocarbon components specifically to retain mineral-oil
            compatibility. The PT chart cannot show this.
          </li>
          <li>
            <strong>Safety classification.</strong> A1 (non-flammable, low-toxicity) vs A2L
            (mildly flammable) vs A3 (flammable) vs B (toxic) shift charge limits, leak
            detection requirements, and installation procedures. R-32 / R-454B are A2L;
            R-410A is A1. Same pressure envelope, different safety regime.
          </li>
          <li>
            <strong>GWP.</strong> R-22 (GWP 1810) vs R-407C (GWP 1774) — nearly identical
            GWP, no climate benefit from retrofit. R-22 vs R-454C (GWP 148) — substantial
            climate benefit. The PT chart shows pressure, not climate impact.
          </li>
          <li>
            <strong>Capacity.</strong> Pressure envelope match does not guarantee capacity
            match. R-32 produces ~5% more cooling capacity per unit displacement than
            R-410A even though pressures are similar — equipment sizing matters.
          </li>
          <li>
            <strong>Component pressure ratings.</strong> Beyond the refrigerant pressure
            envelope, the system&apos;s line set, valves, accumulator, receiver, and
            compressor have their own pressure ratings. Equipment originally certified for
            R-22 (500 PSI design) cannot be retrofitted to R-410A or R-744 without
            re-rating.
          </li>
        </ol>
      </TechSection>

      <TechSection icon="book" tone="emerald" title="When to use this calculator vs the others">
        <ul>
          <li>
            <strong>PT Comparison Tool</strong> (this page) — quick visual envelope check
            across 2-4 refrigerants. Best for preliminary retrofit screening, new-equipment
            specification, and education.
          </li>
          <li>
            <strong>
              <a href="/refrigerant-retrofit-compatibility-calculator/" className="underline">Retrofit Compatibility</a>
            </strong>{" "}
            — structured pair-comparison covering pressure, lubricant, safety class, glide,
            GWP, application fit. Use after PT screening to evaluate full feasibility.
          </li>
          <li>
            <strong>
              <a href="/pt-calculator/" className="underline">PT Calculator</a>
            </strong>{" "}
            — single-refrigerant lookup, either direction. Use for specific point
            calculations after deciding on a refrigerant.
          </li>
          <li>
            <strong>
              <a href="/refrigerant-comparison-guide/" className="underline">Refrigerant Comparison Guide</a>
            </strong>{" "}
            — long-form sourced reference for all common HVAC refrigerant comparisons.
          </li>
          <li>
            <strong>Per-refrigerant detail pages</strong> — every refrigerant in the
            dataset has its own page with full PT chart, properties, lubricant, safety
            classification, and replacement options.
          </li>
        </ul>
      </TechSection>

      <TechSection icon="source" tone="zinc" title="Primary sources">
        <ul>
          <li>
            <strong>CoolProp 7.2.0</strong> (Bell, Wronski, Quoilin, Lemort 2014,
            doi:10.1021/ie4033999) — REFPROP-compatible Helmholtz EOS for all saturation
            pressures.
          </li>
          <li>
            <strong>AHRI Standard 700-2019</strong> — refrigerant specifications and
            cross-reference to CoolProp values.
          </li>
          <li>
            <strong>ASHRAE Standard 34-2022</strong> — refrigerant designation, safety
            classification, composition.
          </li>
          <li>
            <strong>Manufacturer technical datasheets</strong> — Honeywell, Chemours,
            Arkema, AGC PT charts for 11 manufacturer-blend refrigerants not in CoolProp&apos;s
            library (R-448A, R-450A, R-1336mzz(Z), etc.).
          </li>
          <li>
            <strong>EPA AIM Act (40 CFR Part 84)</strong> — phase-down schedule for
            high-GWP refrigerants driving retrofit and new-equipment decisions.
          </li>
          <li>
            <strong>SAE J639 / J2912</strong> — mobile AC service procedures for R-134a
            and R-1234yf.
          </li>
          <li>
            <strong>EU F-Gas Regulation (517/2014, 2024/573)</strong> — European phase-down
            driving similar refrigerant transitions globally.
          </li>
        </ul>
      </TechSection>
    </>
  );
}
