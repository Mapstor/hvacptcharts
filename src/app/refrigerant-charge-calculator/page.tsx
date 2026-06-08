import type { Metadata } from "next";
import { Activity, Calculator as CalcIcon, Gauge, Table as TableIcon } from "lucide-react";
import { refrigerants } from "@/data/refrigerants";
import { CalculatorShell } from "@/components/calculators/shared/CalculatorShell";
import { RefrigerantCharge } from "@/components/calculators/RefrigerantCharge";
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
    q: "What does this calculator actually compute?",
    a: "It computes the line-set adjustment to the nameplate charge. Residential split systems ship pre-charged for a standard line-set length (typically 15 ft for residential, 25 ft for some heat-pump matchups). When the actual installation has a different length, refrigerant must be added (or removed) to account for the extra liquid mass carried in the longer/shorter liquid line. The calculator returns the adjustment amount and the resulting total charge.",
  },
  {
    q: "Where do the per-foot values come from?",
    a: "They are calculated from first principles: cross-sectional area of the liquid-line ID (Type L copper) × CoolProp 7.2.0 saturated-liquid density at 100°F for R-410A (64.24 lb/ft³). For 3/8\" liquid line this works out to ~0.56 oz/ft, which matches OEM service literature (Trane: 0.60, Carrier: 0.55-0.65, Lennox: 0.60-0.65) within ±10%. For other refrigerants the calculator applies a density-ratio multiplier — R-22 is ~13% denser than R-410A, hydrocarbons like R-290 are ~57% lower density.",
  },
  {
    q: "Why doesn't this calculator estimate charge from tonnage?",
    a: "Tonnage-based charge estimates (\"2-4 lb per ton\") are too inaccurate to be useful in the field — the actual charge depends on coil internal volume, line lengths, receiver size, and operating conditions, and varies by ±50% across manufacturers for nominally identical systems. Charging by tonnage produces frequent miscalibrations. The authoritative starting point is always the nameplate charge from the unit's data plate; the calculator adjusts that figure for line-set length, the one variable that's commonly different from the OEM standard.",
  },
  {
    q: "What about vertical rise / elevation?",
    a: "Above ~50 ft of vertical rise (evaporator above condenser) additional charge may be required, and oil-return traps or special line sizing may be needed. The amount varies by manufacturer and is not standardized. The calculator triggers a warning above 50 ft rise but does not compute an adjustment — for those installations the equipment installation manual is the authoritative source.",
  },
  {
    q: "How accurate is the adjustment?",
    a: "Per-foot adjustments are accurate to ±15-20% — the residual error comes from line-set conditions (temperature, presence of vapor bubbles in undercharged systems, two-phase flow in heat-pump mode), OEM-specific reference lengths, and refrigerant density variation with actual liquid-line temperature. For a typical residential AC install with 30-50 ft of line set, the adjustment is a few ounces, well within the verifiable range of subcooling on a TXV system. Always confirm with superheat (and subcooling on TXV/EXV systems) after charging.",
  },
  {
    q: "Why is the per-foot rate based on the liquid line only?",
    a: "The suction (vapor) line carries refrigerant at vapor density, which is ~50-100× lower than liquid density. For typical residential line sizes the suction-line contribution to total charge is <5% of the liquid-line contribution, well within the noise. Industrial-scale installations with very long suction lines or low-temperature systems may need to account for it; OEM service literature for those systems publishes a combined per-foot figure.",
  },
  {
    q: "What's the difference between Type L and Type M copper?",
    a: "Type L has thicker walls than Type M, giving Type L a smaller ID for the same OD. For HVAC liquid lines the difference is small (a few thousandths of an inch on the ID) and the per-foot adjustment is within tolerance. The calculator uses Type L IDs because Type L is standard for ACR (air-conditioning/refrigeration) copper tubing.",
  },
  {
    q: "Can I use this for charging a brand-new install after a refrigerant change?",
    a: "Yes for the line-set portion of the charge. If you've also changed the refrigerant (e.g., R-22 to R-410A retrofit), the system has different internal-volume effects: condenser coil holdup, receiver/accumulator volume, and the line set itself. The calculator handles the line-set component; for the system-wide retrofit charge you also need the OEM's retrofit guidance for charge factor (often charge by weight to 80-90% of original R-22 amount, then fine-tune via subcooling). See /refrigerant-retrofit-compatibility-calculator/ for the compatibility analysis.",
  },
];

export const metadata: Metadata = {
  title: "Refrigerant Charge Calculator — Line-Set Length Adjustment",
  description:
    "Compute the line-set adjustment to nameplate charge for residential and commercial split systems. Per-foot oz values from CoolProp liquid density at 100°F. Supports R-410A, R-22, R-32, R-454B, R-134a, R-407C, R-404A, R-290, R-744, and 50+ other refrigerants.",
  alternates: { canonical: `${SITE_URL}/refrigerant-charge-calculator/` },
};

export default function RefrigerantChargeCalculatorPage() {
  return (
    <CalculatorShell
      schema={{
        path: "refrigerant-charge-calculator",
        name: "Refrigerant Charge Calculator",
        description:
          "Line-set length adjustment to nameplate charge. Computes ounces of refrigerant per foot of liquid line from CoolProp liquid density (R-410A baseline at 100°F: 64.24 lb/ft³) with density-ratio multiplier for other refrigerants.",
        featureList: [
          "Per-foot adjustment for 1/4\" through 7/8\" Type L copper liquid lines",
          "Density-corrected for 50+ refrigerants (CoolProp 7.2.0 baseline + manufacturer data)",
          "Configurable OEM standard reference length (15 ft default residential, 25 ft for heat pumps)",
          "Warnings for unusual line lengths and vertical rise > 50 ft",
          "Cross-references to superheat / subcooling verification calculators",
          "Reference table of baseline oz/ft values by liquid-line OD",
        ],
        publishedDate: PUBLISHED,
        breadcrumbLabel: "Refrigerant Charge Calculator",
      }}
      introOneLiner="Adjust the nameplate charge for the actual line-set length. Calculator computes per-foot mass from refrigerant liquid density and applies the delta to your nameplate figure."
      generatedDate={PUBLISHED.slice(0, 10)}
      howTo={{
        steps: [
          "Read the nameplate charge from the unit's data plate (typically in lb; some smaller units list oz — divide by 16 for lb).",
          "Determine the OEM's standard reference length from the installation manual (15 ft for most residential split systems, 25 ft for some heat-pump matchups). Some manuals state this as 'precharged for X feet of line set'.",
          "Measure the actual one-way liquid line length from the condenser to the evaporator. Use the actual route, not the straight-line distance.",
          "Identify the liquid-line OD (typically 3/8\" for residential 1.5-5 ton, 1/4\" for small units, 1/2\" or 5/8\" for commercial).",
          "Enter all inputs. The calculator returns the adjustment amount (add or recover) and the total adjusted charge.",
          "Charge by weight using a recovery/charging scale. Then verify with subcooling on TXV systems (or the OEM charging chart for fixed-orifice) under steady-state conditions.",
        ],
        commonErrors: [
          "Measuring round-trip length instead of one-way — the standard reference length is one-way, so doubling it inflates the adjustment by 2×.",
          "Skipping the verification step — line-set adjustment is a starting point. Always confirm with superheat and subcooling after the system stabilizes.",
          "Using the calculator for non-line-set charge differences — if the unit was previously undercharged due to a leak, you need to find and repair the leak before recharging. The calculator doesn't 'find' missing refrigerant.",
          "Applying the residential calculation to large commercial or industrial systems — those need OEM piping design tables that account for suction-line mass, receivers, and operating envelope.",
        ],
      }}
      math={{
        formula:
          "Adjustment (oz) = (actual_length − standard_length) × oz_per_ft × density_factor\n\n" +
          "Where oz_per_ft is computed from Type L copper liquid-line ID and saturated-liquid density:\n" +
          "oz_per_ft = (π × ID²/4 × 12 in/ft) × ρ_liquid × 16 oz/lb\n\n" +
          "For R-410A 3/8″ line at 100°F:\n" +
          "= π × 0.315² / 4 × 12 × 0.0372 lb/in³ × 16 oz/lb\n" +
          "= 0.557 oz/ft\n\n" +
          "Density factor scales for other refrigerants relative to R-410A baseline.",
        sourceCitation:
          "Liquid density values from CoolProp 7.2.0 saturated-liquid at 100°F (311 K, quality 0). Type L copper IDs per ASTM B280. Baseline values cross-reference Trane SB-AC-001, Carrier residential heat-pump installation manuals, Lennox tech bulletins — all within ±10% of computed values for R-410A 3/8\" residential.",
        workedExample:
          "Scenario: 3-ton R-410A split AC, nameplate 8.5 lb, installed with 45 ft of 3/8\" liquid line, OEM standard 15 ft.\n\n" +
          "Inputs:\n" +
          "  Refrigerant: R-410A (factor 1.00)\n" +
          "  Nameplate: 8.5 lb\n" +
          "  Standard length: 15 ft\n" +
          "  Actual length: 45 ft\n" +
          "  Liquid line OD: 3/8\"\n\n" +
          "Computation:\n" +
          "  Baseline oz/ft for 3/8\" R-410A: 0.56 oz/ft\n" +
          "  Adjusted oz/ft: 0.56 × 1.00 = 0.56 oz/ft\n" +
          "  Δ length: 45 − 15 = 30 ft\n" +
          "  Adjustment: 30 × 0.56 = 16.8 oz = 1.05 lb (add)\n\n" +
          "Result: Total charge = 8.5 + 1.05 = 9.55 lb. Then verify with subcooling at 95°F outdoor / 75°F return air after 15 min steady-state.",
      }}
      relatedTools={[
        { href: "/superheat-calculator/", label: "Superheat Calculator", blurb: "Verify charge after install with superheat measurement." },
        { href: "/subcooling-calculator/", label: "Subcooling Calculator", blurb: "TXV/EXV systems: primary charging-verification metric." },
        { href: "/system-pressure-diagnostic-calculator/", label: "System Pressure Diagnostic", blurb: "Full-system multi-input diagnostic after charging." },
        { href: "/refrigerant-retrofit-compatibility-calculator/", label: "Retrofit Compatibility", blurb: "When changing refrigerants, evaluate compatibility before applying the charge adjustment." },
      ]}
      faqs={FAQS}
      bodySections={<RichContent />}
    >
      <RefrigerantCharge />
    </CalculatorShell>
  );
}

function RichContent() {
  return (
    <>
      <TechSection icon="composition" tone="blue" title="Charge by weight, verify by superheat / subcooling">
        <p>
          The authoritative charging procedure for any HVAC system is &quot;charge by
          weight&quot;: read the nameplate value, adjust for the line set, weigh
          refrigerant onto a recovery / charging scale, then verify with SH (fixed-orifice)
          or SC (TXV / EEV) at steady state. Gauge-feel charging — adding refrigerant
          until pressures &quot;look right&quot; — produces frequent overcharge errors that
          show up months later as compressor failures.
        </p>
        <p>
          The nameplate is the source of truth. It&apos;s stamped on the outdoor unit&apos;s
          data plate, typically marked &quot;Factory Charge&quot;, &quot;Refrigerant
          Charge&quot;, or &quot;System Charge&quot;. Most residential nameplates also
          state a reference line-set length and a per-foot adjustment instruction (e.g.,
          &quot;add 0.6 oz per foot above 15 ft&quot;).
        </p>
        <KeyInsight tone="emerald" icon="insight" title="EPA Section 608 requires leak repair BEFORE adding refrigerant">
          You cannot legally top off a system without first identifying and repairing the
          leak. The charge calculator handles line-set adjustments for a healthy system;
          if charge is missing from a previously-charged system, the answer is leak
          search, not a top-up.
        </KeyInsight>
      </TechSection>

      <TechSection icon="data" tone="purple" title="Per-foot reference table — oz/ft by refrigerant and line size">
        <p>
          Per-foot adjustment values come from saturated-liquid density × cross-sectional
          area of the Type L copper liquid line. R-410A baseline values at 100°F liquid
          line temperature; other refrigerants scale by density ratio.
        </p>
        <Panel title="R-410A baseline oz/ft by liquid-line OD (Type L copper)" icon={TableIcon}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-[10px] uppercase tracking-wider text-zinc-500 dark:border-zinc-800">
                  <th className="py-1.5 text-left">Liquid-line OD</th>
                  <th className="py-1.5 text-right">ID (Type L, in)</th>
                  <th className="py-1.5 text-right">R-410A oz/ft @ 100°F</th>
                  <th className="py-1.5 text-left">Typical system</th>
                </tr>
              </thead>
              <tbody className="font-mono tabular-nums">
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td>1/4&quot;</td><td className="text-right">0.200</td><td className="text-right">0.23</td><td className="text-xs font-sans">Window unit, sub-1-ton mini-split</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td>5/16&quot;</td><td className="text-right">0.260</td><td className="text-right">0.39</td><td className="text-xs font-sans">1-1.5 ton mini-split</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td>3/8&quot;</td><td className="text-right">0.315</td><td className="text-right">0.56</td><td className="text-xs font-sans">1.5-5 ton residential split</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td>1/2&quot;</td><td className="text-right">0.430</td><td className="text-right">1.05</td><td className="text-xs font-sans">5-7.5 ton residential / light commercial</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td>5/8&quot;</td><td className="text-right">0.545</td><td className="text-right">1.68</td><td className="text-xs font-sans">Light commercial</td></tr>
                <tr><td>7/8&quot;</td><td className="text-right">0.785</td><td className="text-right">3.49</td><td className="text-xs font-sans">Commercial</td></tr>
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel title="Density factor (multiply R-410A oz/ft by this for other refrigerants)" icon={TableIcon}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-[10px] uppercase tracking-wider text-zinc-500 dark:border-zinc-800">
                  <th className="py-1.5 text-left">Refrigerant</th>
                  <th className="py-1.5 text-right">Liquid ρ @ 100°F (lb/ft³)</th>
                  <th className="py-1.5 text-right">Factor vs R-410A</th>
                </tr>
              </thead>
              <tbody className="font-mono tabular-nums">
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td>R-410A (baseline)</td><td className="text-right">64.2</td><td className="text-right">1.00</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td>R-22</td><td className="text-right">72.5</td><td className="text-right">1.13</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td>R-32</td><td className="text-right">57.2</td><td className="text-right">0.89</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td>R-454B</td><td className="text-right">62.4</td><td className="text-right">0.97</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td>R-134a</td><td className="text-right">73.4</td><td className="text-right">1.14</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td>R-407C</td><td className="text-right">68.8</td><td className="text-right">1.07</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td>R-404A</td><td className="text-right">63.4</td><td className="text-right">0.99</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td>R-454C</td><td className="text-right">62.0</td><td className="text-right">0.97</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td>R-1234yf</td><td className="text-right">63.4</td><td className="text-right">0.99</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td>R-290 (propane)</td><td className="text-right">29.2</td><td className="text-right">0.45</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td>R-717 (NH₃)</td><td className="text-right">36.1</td><td className="text-right">0.56</td></tr>
                <tr><td>R-744 (CO₂, sub-critical)</td><td className="text-right">47.5</td><td className="text-right">0.74</td></tr>
              </tbody>
            </table>
          </div>
        </Panel>
        <DensityBars />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Liquid density visualization: hydrocarbons (R-290 propane) and ammonia (R-717)
          are much less dense than HFCs, so per-foot adjustments are smaller on those
          refrigerants for the same line size. Source: CoolProp 7.2.0 saturated-liquid
          density at 100°F (311 K, quality 0).
        </p>
      </TechSection>

      <TechSection icon="service" tone="amber" title="Real install scenarios — line-set adjustments and verification">
        <p>
          Five scenarios covering common install configurations: residential AC standard
          length, long-line residential, mini-split with extreme line length, heat pump
          with vertical rise, commercial walk-in with multi-stage piping.
        </p>
      </TechSection>

      <ServiceProblem
        number={1}
        refrigerant="R-410A"
        title="3-ton residential split AC, 45-ft line set"
        scenario="New 3-ton R-410A residential AC install. Nameplate factory charge = 8.5 lb, factory reference length = 15 ft. Actual installation runs 45 ft of 3/8 inch liquid line through a basement to the air handler."
      >
        <Panel title="Inputs" icon={Gauge}>
          <Gauges
            items={[
              { label: "Nameplate", value: "8.5 lb" },
              { label: "Ref length", value: "15 ft" },
              { label: "Actual length", value: "45 ft" },
              { label: "Liquid OD", value: "3/8\"" },
            ]}
          />
        </Panel>
        <Panel title="Computation" icon={CalcIcon}>
          <Lookups
            rows={[
              { input: "3/8\" R-410A oz/ft", output: "0.56 oz/ft", note: "from reference table" },
              { input: "Δ length = 45 − 15", output: "30 ft", note: "extra liquid line" },
              { input: "Adjustment = 30 × 0.56", output: "16.8 oz = 1.05 lb", note: "ADD" },
            ]}
          />
        </Panel>
        <VerdictBanner status="ok" title="Total adjusted charge = 9.55 lb">
          Charge 9.55 lb (8.5 lb nameplate + 1.05 lb line-set adjustment). Then verify
          with SC at 95°F outdoor / 75°F return air after 15-minute steady-state run.
          Target SC = nameplate value (typically 10°F for TXV residential).
        </VerdictBanner>
      </ServiceProblem>

      <ServiceProblem
        number={2}
        refrigerant="R-32 (mini-split)"
        title="2-ton R-32 mini-split, 80-ft line set with 15-ft vertical rise"
        scenario="High-end ductless mini-split install with R-32. Indoor unit on third floor, outdoor unit at ground level. Nameplate 4.4 lb at 25 ft reference length; 5/16 inch liquid line."
      >
        <Panel title="Inputs" icon={Gauge}>
          <Gauges
            items={[
              { label: "Nameplate", value: "4.4 lb" },
              { label: "Ref length", value: "25 ft" },
              { label: "Actual length", value: "80 ft" },
              { label: "Vertical rise", value: "15 ft" },
            ]}
          />
        </Panel>
        <Panel title="Computation" icon={CalcIcon}>
          <Lookups
            rows={[
              { input: "5/16\" R-410A oz/ft", output: "0.39 oz/ft" },
              { input: "R-32 density factor", output: "0.89", note: "vs R-410A baseline" },
              { input: "5/16\" R-32 oz/ft = 0.39 × 0.89", output: "0.35 oz/ft" },
              { input: "Δ length = 80 − 25", output: "55 ft" },
              { input: "Adjustment = 55 × 0.35", output: "19.3 oz = 1.20 lb", note: "ADD" },
            ]}
          />
        </Panel>
        <VerdictBanner status="ok" title="Total adjusted charge = 5.60 lb">
          Charge 5.60 lb. The 15-ft vertical rise is within the 50-ft warning threshold,
          no additional oil-return concerns. Verify SC at the outdoor unit after stabilizing;
          mini-splits often target higher SC for long-line installs (12-15°F vs the standard
          10°F).
        </VerdictBanner>
        <FixCallout>
          For mini-splits over 50 ft of line set, check the OEM installation manual for
          line-length charge correction tables — they may differ from the generic
          density-based calculation. Mitsubishi, Daikin, and Fujitsu publish specific
          tables for their equipment.
        </FixCallout>
      </ServiceProblem>

      <ServiceProblem
        number={3}
        refrigerant="R-410A heat pump"
        title="5-ton residential heat pump with 60-ft vertical rise"
        scenario="5-ton R-410A heat pump install. Evaporator (indoor coil) on third floor; outdoor unit on ground. Vertical rise exceeds 50 ft — calculator warns and additional considerations apply."
      >
        <Panel title="Inputs" icon={Gauge}>
          <Gauges
            items={[
              { label: "Nameplate", value: "12.0 lb" },
              { label: "Vertical rise", value: "60 ft" },
              { label: "Liquid OD", value: "3/8\"" },
              { label: "Run length", value: "75 ft" },
            ]}
          />
        </Panel>
        <VerdictBanner status="warn" title="Vertical rise &gt; 50 ft — OEM manual required">
          Vertical rise above 50 ft requires manufacturer-specific guidance for oil-return
          provisions, possible suction-line traps, and additional charge beyond the
          standard linear adjustment. The calculator stops short of estimating this
          additional charge.
        </VerdictBanner>
        <FixCallout>
          Consult the equipment installation manual for the specific OEM&apos;s vertical
          rise charge correction. Carrier, Trane, Lennox, Goodman all publish residential
          heat-pump installation tables for vertical separations. Most require additional
          line-set charge plus inverted oil-return traps at every 20-30 ft of vertical
          lift. Document the install per OEM warranty requirements.
        </FixCallout>
      </ServiceProblem>

      <ServiceProblem
        number={4}
        refrigerant="R-454C (commercial walk-in)"
        title="Walk-in freezer 80-ft remote condenser, R-454C low-GWP retrofit"
        scenario="R-454C low-temp walk-in freezer install with rooftop condenser 80 ft from the evaporator (multi-zone supermarket). 1/2-inch liquid line. Calculator applies density factor for R-454C."
      >
        <Panel title="Inputs" icon={Gauge}>
          <Gauges
            items={[
              { label: "Nameplate (LT)", value: "32 lb" },
              { label: "Ref length", value: "0 ft" },
              { label: "Actual length", value: "80 ft" },
              { label: "Liquid OD", value: "1/2\"" },
            ]}
          />
        </Panel>
        <Panel title="Computation" icon={CalcIcon}>
          <Lookups
            rows={[
              { input: "1/2\" R-410A oz/ft", output: "1.05 oz/ft" },
              { input: "R-454C density factor", output: "0.97" },
              { input: "1/2\" R-454C oz/ft = 1.05 × 0.97", output: "1.02 oz/ft" },
              { input: "Adjustment = 80 × 1.02", output: "81.6 oz = 5.10 lb" },
            ]}
          />
        </Panel>
        <VerdictBanner status="ok" title="Total system charge = 37.1 lb (32 + 5.1)">
          Commercial walk-in systems typically size the nameplate for the equipment alone
          (no line set assumed) — all line-set charge is calculated additively. Verify
          with SC (R-454C bubble curve) at the condenser outlet after stabilization;
          target 5-15°F for LT walk-in.
        </VerdictBanner>
      </ServiceProblem>

      <ServiceProblem
        number={5}
        refrigerant="R-22 → R-407C retrofit"
        title="R-22 to R-407C retrofit — charge calculation for new refrigerant"
        scenario="Legacy R-22 residential AC, customer wants to retrofit to R-407C rather than full equipment replacement. R-407C density is 7% higher than R-410A, but more importantly the OEM retrofit guidance specifies a charge factor."
      >
        <Panel title="Inputs" icon={Gauge}>
          <Gauges
            items={[
              { label: "R-22 nameplate", value: "7.0 lb" },
              { label: "Line length", value: "40 ft" },
              { label: "Liquid OD", value: "3/8\"" },
              { label: "Retrofit factor", value: "0.90" },
            ]}
          />
        </Panel>
        <Panel title="Computation" icon={CalcIcon}>
          <Lookups
            rows={[
              { input: "R-407C base charge = 7.0 × 0.90", output: "6.3 lb", note: "retrofit factor per OEM" },
              { input: "3/8\" R-407C oz/ft = 0.56 × 1.07", output: "0.60 oz/ft" },
              { input: "Line-set adjustment = (40 − 15) × 0.60", output: "15 oz = 0.94 lb" },
              { input: "Total R-407C charge", output: "7.24 lb" },
            ]}
          />
        </Panel>
        <VerdictBanner status="info" title="R-407C charge ≈ 7.2 lb (was 7.0 lb R-22)">
          R-407C retrofit charge is approximately equal to the R-22 amount it replaces,
          within a few percent. The retrofit factor (typically 0.85-0.95) accounts for
          minor capacity differences and ensures the system runs at slightly lower charge
          to avoid overcharge edge cases. After charging, verify SC using R-407C bubble
          curve at the discharge pressure.
        </VerdictBanner>
        <FixCallout>
          Standard R-22 → R-407C retrofit procedure: recover R-22, drain mineral oil and
          replace with POE (R-407C is not mineral-oil compatible), replace filter-drier,
          evacuate to 500 microns, then charge R-407C by weight per the above calculation.
          Cross-check SC on the R-407C bubble curve; target 8-12°F.
        </FixCallout>
      </ServiceProblem>

      <TechSection icon="warning" tone="amber" title="Common charging mistakes">
        <ol>
          <li>
            <strong>Round-trip length instead of one-way.</strong> The reference and actual
            lengths are both one-way (condenser to evaporator). Doubling the length
            inflates the adjustment by 2× and creates a severe overcharge.
          </li>
          <li>
            <strong>Skipping verification.</strong> Line-set adjustment is the starting
            charge — always verify with SH (fixed-orifice) or SC (TXV / EEV) at steady
            state. Small residual errors from temperature variation, undercharge gas pockets,
            or measurement tolerances are corrected at verification.
          </li>
          <li>
            <strong>Charging by gauge feel.</strong> Adding refrigerant until pressures
            &quot;look right&quot; produces frequent overcharge errors. Discharge pressure
            climbs with both charge AND ambient AND fouling — you can&apos;t tell which is
            elevating it from pressure alone. Charge by weight, verify by SC.
          </li>
          <li>
            <strong>Ignoring vertical rise.</strong> Above 50 ft of vertical separation,
            the OEM&apos;s vertical-rise charge table applies. Linear per-foot adjustment
            from the calculator is not sufficient for tall installations.
          </li>
          <li>
            <strong>Topping off a leaking system.</strong> EPA Section 608 prohibits
            adding refrigerant without first finding and repairing the leak. If charge
            seems short on an established system, leak search comes first; the calculator
            is for new installs and line-set sizing, not for filling leaks.
          </li>
          <li>
            <strong>Confusing oz with fluid oz.</strong> Refrigerant is weighed in mass
            ounces (16 per lb), not fluid ounces. Use a calibrated mass scale, not a
            volume measure.
          </li>
        </ol>
      </TechSection>

      <TechSection icon="book" tone="emerald" title="When to use this calculator vs the others">
        <ul>
          <li>
            <strong>Refrigerant Charge Calculator</strong> (this page) — line-set length
            adjustment to nameplate charge for new installs. Pre-charging step before
            running the system.
          </li>
          <li>
            <strong>
              <a href="/superheat-calculator/" className="underline">Superheat Calculator</a>
            </strong>{" "}
            — verification after charging for fixed-orifice systems; ACCA Manual T charging
            chart references.
          </li>
          <li>
            <strong>
              <a href="/subcooling-calculator/" className="underline">Subcooling Calculator</a>
            </strong>{" "}
            — verification after charging for TXV / EEV systems; primary
            charging-verification metric.
          </li>
          <li>
            <strong>
              <a href="/system-pressure-diagnostic-calculator/" className="underline">System Pressure Diagnostic</a>
            </strong>{" "}
            — full multi-input diagnostic for after-charge troubleshooting; identifies
            charge errors plus airflow, fouling, restriction.
          </li>
          <li>
            <strong>
              <a href="/refrigerant-retrofit-compatibility-calculator/" className="underline">Retrofit Compatibility</a>
            </strong>{" "}
            — when changing refrigerants, evaluate compatibility (oil, safety class,
            pressure envelope) before applying the charge adjustment.
          </li>
        </ul>
      </TechSection>

      <TechSection icon="source" tone="zinc" title="Primary sources">
        <ul>
          <li>
            <strong>CoolProp 7.2.0</strong> (Bell, Wronski, Quoilin, Lemort 2014,
            doi:10.1021/ie4033999) — saturated-liquid density at 100°F for per-foot
            calculation.
          </li>
          <li>
            <strong>ASTM B280</strong> — ACR copper tubing standard, Type L ID
            specifications for HVAC liquid lines.
          </li>
          <li>
            <strong>OEM installation manuals</strong> — Carrier residential heat-pump
            installation manual, Trane SB-AC-001 service bulletin, Lennox service tech
            bulletins for per-foot adjustment factors and vertical-rise procedures.
          </li>
          <li>
            <strong>EPA Section 608 (40 CFR Part 82 Subpart F)</strong> — refrigerant
            handling certification, leak repair requirements.
          </li>
          <li>
            <strong>ACCA Manual T (2017)</strong> — charging procedures for TXV and
            fixed-orifice systems with verification at steady state.
          </li>
          <li>
            <strong>Mini-split OEM literature</strong> — Mitsubishi, Daikin, Fujitsu, LG
            line-length charge correction tables for ductless and multi-zone installs.
          </li>
        </ul>
      </TechSection>
    </>
  );
}

/* ──────────────────────── Density bars chart ──────────────────────── */

function DensityBars() {
  const data: { label: string; value: number; tone: string }[] = [
    { label: "R-134a", value: 73.4, tone: "#3a8ed1" },
    { label: "R-22", value: 72.5, tone: "#3a8ed1" },
    { label: "R-407C", value: 68.8, tone: "#3a8ed1" },
    { label: "R-410A", value: 64.2, tone: "#5a8a3a" },
    { label: "R-1234yf", value: 63.4, tone: "#3a8ed1" },
    { label: "R-404A", value: 63.4, tone: "#3a8ed1" },
    { label: "R-454B", value: 62.4, tone: "#3a8ed1" },
    { label: "R-454C", value: 62.0, tone: "#3a8ed1" },
    { label: "R-32", value: 57.2, tone: "#d49a2b" },
    { label: "R-744 (CO₂)", value: 47.5, tone: "#d49a2b" },
    { label: "R-717 (NH₃)", value: 36.1, tone: "#c45757" },
    { label: "R-290 (C₃H₈)", value: 29.2, tone: "#c45757" },
  ];
  const W = 720;
  const ROW_H = 22;
  const PAD_T = 40;
  const PAD_B = 28;
  const LABEL_W = 130;
  const PAD_R = 60;
  const BAR_W = W - LABEL_W - PAD_R;
  const xMax = 80;
  const xScale = (v: number) => LABEL_W + (v / xMax) * BAR_W;
  const H = PAD_T + data.length * ROW_H + PAD_B;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Saturated liquid density at 100°F across common HVAC refrigerants. Lower density = smaller per-foot adjustment for the same line size."
      className="my-3 h-auto w-full text-zinc-700 dark:text-zinc-300"
      preserveAspectRatio="xMidYMid meet"
    >
      <text x={W / 2} y={20} textAnchor="middle" fontSize="13" fontWeight={600} fill="currentColor">
        Saturated liquid density at 100°F (lb/ft³) — R-410A baseline marked
      </text>
      {[0, 20, 40, 60, 80].map((t) => (
        <g key={`gx-${t}`}>
          <line x1={xScale(t)} y1={PAD_T - 4} x2={xScale(t)} y2={PAD_T + data.length * ROW_H} stroke="currentColor" opacity={0.1} strokeDasharray="2 3" />
          <text x={xScale(t)} y={PAD_T - 8} textAnchor="middle" fontSize="9" fill="currentColor" opacity={0.6}>{t}</text>
        </g>
      ))}
      {data.map((d, i) => {
        const y = PAD_T + i * ROW_H;
        const barLen = (d.value / xMax) * BAR_W;
        return (
          <g key={d.label}>
            <text x={LABEL_W - 8} y={y + 12} textAnchor="end" fontSize="10" fontWeight={500} fill="currentColor">
              {d.label}
            </text>
            <rect x={LABEL_W} y={y + 4} width={barLen} height={12} fill={d.tone} rx={2} />
            <text x={LABEL_W + barLen + 6} y={y + 14} fontSize="10" fontWeight={600} fill="currentColor">
              {d.value}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
