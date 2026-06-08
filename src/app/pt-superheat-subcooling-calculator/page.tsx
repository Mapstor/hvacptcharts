import type { Metadata } from "next";
import { Activity, Calculator as CalcIcon, Gauge, Table as TableIcon } from "lucide-react";
import { refrigerants } from "@/data/refrigerants";
import { CalculatorShell } from "@/components/calculators/shared/CalculatorShell";
import { CombinedCalculator } from "@/components/calculators/CombinedCalculator";
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
    q: "Why measure both superheat and subcooling together?",
    a: "Each one alone tells half the story; together they pin down the system's charge state and isolate root causes. The classic combinations: high SH + low SC = undercharge, low SH + high SC = overcharge, high SH + high SC = airflow problem, low SH + low SC = restriction or TXV failure. No single measurement gives you these patterns — you need both.",
  },
  {
    q: "Which one should I trust more for charging?",
    a: "Depends on the metering device. Fixed-orifice systems are charged by superheat (per ACCA Manual T chart). TXV / EEV systems are charged by subcooling (8-12°F target per OEM nameplate). On a TXV system, superheat hovers near the TXV setpoint regardless of charge — even an overcharged TXV system reads normal SH — so subcooling is the primary metric. Use the other measurement as a cross-check.",
  },
  {
    q: "What if both superheat and subcooling are off in the same direction?",
    a: "Both high typically means low indoor airflow (raises evaporator temperature, raises SH) plus condenser fouling or low ambient airflow (raises SC). Both low typically means a restricted metering device flow path — TXV stuck open, oversized orifice, or distributor nozzle missing. Cross-check airflow on both sides before adjusting charge.",
  },
  {
    q: "Does this work for zeotropic blends?",
    a: "Yes. The calculator uses the dew curve at suction pressure for superheat (correct for vapor-side measurement) and the bubble curve at discharge pressure for subcooling (correct for liquid-side measurement). For wide-glide blends like R-407C (~11°F), R-454C (~14°F), R-455A (~22°F), this avoids errors equal to the glide value that would invalidate charging decisions.",
  },
  {
    q: "Can I use this for commercial refrigeration?",
    a: "Yes, but apply commercial target ranges: 10-20°F superheat and 5-15°F subcooling depending on application (walk-in cooler, walk-in freezer, refrigerated transport). The diagnostic banner uses residential HVAC ranges by default — interpret commercial readings against the equipment OEM spec rather than the banner. Walk-in / commercial reference targets are tabulated below.",
  },
  {
    q: "What about the eight-pattern diagnostic matrix?",
    a: "The matrix correlates SH × SC × pressure patterns to root causes. There are eight common fingerprints: properly charged, undercharge, overcharge, liquid-line restriction, condenser fouling, slow leak (early stage), TXV failure, non-condensables. Each has a distinct combined pattern that this calculator's diagnostic banner detects. The full matrix is in the reference table below.",
  },
  {
    q: "How does this relate to the system pressure diagnostic calculator?",
    a: "Both tools synthesize SH + SC + pressure into a fingerprint. This combined calculator focuses on measurement entry and pattern interpretation; the System Pressure Diagnostic tool is structured around the decision tree (input four readings, get a ranked list of suspected causes with confidence scores). Use this calculator first to get clean SH/SC values, then feed them into the diagnostic if you want deeper decision-tree analysis.",
  },
  {
    q: "Why are the target ranges so specific to the equipment?",
    a: "Different OEMs design their TXVs, condensers, and evaporators to specific operating points. Carrier targets 10°F SC, Trane targets 8°F SC, some Lennox models target 12°F — there's no universal residential AC value. The ACCA Manual T chart gives generic SH targets indexed on WB/DB conditions for fixed-orifice systems, but every TXV system is charged to its specific nameplate SC value. Always read the nameplate before charging.",
  },
];

export const metadata: Metadata = {
  title: "Combined PT, Superheat & Subcooling Calculator — Eight-Pattern Diagnostic",
  description:
    "Free combined HVAC diagnostic calculator for 50+ refrigerants. Enter both suction and liquid line readings; get SH, SC, and the eight-pattern root cause matrix (undercharge, overcharge, restriction, fouling, TXV failure, non-condensables). Correct dew/bubble curve math for zeotropic blends. Sourced from ACCA Manual T and ASHRAE Handbook of Refrigeration 2022.",
  alternates: { canonical: `${SITE_URL}/pt-superheat-subcooling-calculator/` },
};

export default function CombinedCalculatorPage() {
  return (
    <CalculatorShell
      schema={{
        path: "pt-superheat-subcooling-calculator",
        name: "PT / Superheat / Subcooling Calculator",
        description:
          "One form for all three diagnostic measurements: suction-line superheat, liquid-line subcooling, and saturation pressures. Eight-pattern diagnostic matrix correlates SH × SC × pressures to root causes (undercharge, overcharge, restriction, fouling, TXV failure, non-condensables).",
        featureList: [
          "Superheat (dew curve), subcooling (bubble curve), and pressures in one workflow",
          "Eight-pattern diagnostic matrix: properly charged, undercharge, overcharge, restriction, fouling, slow leak, TXV failure, non-condensables",
          "Supports all 49 CoolProp-modeled refrigerants",
          "Imperial (°F, PSIG) and metric (°C, kPa) units",
          "Correct curve selection for zeotropic blends (dew for SH, bubble for SC)",
          "Worked diagnostic scenarios for each pattern",
          "Charging cheat sheet for TXV / EEV / fixed orifice",
          "Mobile-friendly, no signup",
        ],
        publishedDate: PUBLISHED,
        breadcrumbLabel: "Combined Calculator",
      }}
      introOneLiner="One form for both the low side (suction, superheat) and the high side (liquid, subcooling). The eight-pattern diagnostic matrix maps the combined SH × SC × pressure fingerprint to the root cause: properly charged, undercharge, overcharge, restriction, fouling, TXV failure, or non-condensables."
      generatedDate={PUBLISHED.slice(0, 10)}
      howTo={{
        steps: [
          "Pick the refrigerant. Defaults to R-410A.",
          "On the low-side panel: enter suction-line pressure (PSIG) and suction-line temperature (°F).",
          "On the high-side panel: enter liquid-line pressure and liquid-line temperature.",
          "Read superheat (dew curve, suction), subcooling (bubble curve, liquid), and the combined-pattern diagnostic banner.",
          "Compare against your equipment's targets — TXV system 8-12°F SC, fixed-orifice per ACCA Manual T chart.",
        ],
        commonErrors: [
          "Measuring at the wrong service port — suction is the LOW-side port on the larger insulated line; liquid is the HIGH-side port on the smaller uninsulated line.",
          "Reading before steady state — let the system run 10-20 minutes after compressor start.",
          "Probing without insulating thermocouples — ambient pickup inflates SH and depresses SC.",
          "Adjusting charge based on a single reading. The eight-pattern matrix needs both SH and SC to identify the right root cause.",
        ],
      }}
      math={{
        formula:
          "Superheat = T_suction_line − T_sat(P_suction, dew)\nSubcooling = T_sat(P_liquid, bubble) − T_liquid_line\n\nDiagnostic pattern from {SH, SC, P_suction, P_liquid} via the eight-pattern matrix.",
        sourceCitation:
          "Saturation values from CoolProp 7.2.0 (Bell, Wronski, Quoilin, Lemort 2014, doi:10.1021/ie4033999). Target ranges per ACCA Manual T (2017), ASHRAE Handbook of Refrigeration 2022 (Chapter 23), AHRI Standard 540-2020 (compressor protection minimums), and equipment-specific manufacturer charging procedures (Carrier, Trane, Lennox, Daikin, Goodman).",
        workedExample:
          "R-410A residential TXV system, 95°F outdoor:\n  Suction 130 PSIG / line 60°F  →  SH = 60 − 45 = 15°F (in 8-15°F TXV range)\n  Liquid 380 PSIG / line 100°F  →  SC = 111 − 100 = 11°F (in 8-12°F TXV range)\n  Diagnostic pattern: SH normal, SC normal, pressures normal\n  Verdict: properly charged.",
      }}
      relatedTools={[
        { href: "/superheat-calculator/", label: "Superheat alone", blurb: "Focused single-result view of just the suction side." },
        { href: "/subcooling-calculator/", label: "Subcooling alone", blurb: "Just the liquid side." },
        { href: "/pt-calculator/", label: "PT Calculator", blurb: "Raw pressure-temperature lookup without measurements." },
        { href: "/system-pressure-diagnostic-calculator/", label: "System Pressure Diagnostic", blurb: "Decision-tree fingerprint matcher with ranked root cause output." },
        { href: "/high-head-pressure-causes/", label: "High head pressure causes", blurb: "Decision tree for high SC / high discharge pressure cases." },
      ]}
      faqs={FAQS}
      bodySections={<RichContent />}
    >
      <CombinedCalculator />
    </CalculatorShell>
  );
}

/* ──────────────────────── Body content ──────────────────────── */

function RichContent() {
  return (
    <>
      <TechSection icon="composition" tone="blue" title="Why both measurements together — the diagnostic synthesis">
        <p>
          Superheat measures the suction side: how much vapor margin you have above
          saturation, how well the evaporator is being fed. Subcooling measures the
          condenser side: how much liquid column you have below saturation, how much
          refrigerant is backed up in the condenser. Each alone gives you half the picture.
        </p>
        <p>
          Together, they form a coordinate system. Plot a system&apos;s state in the
          SH × SC plane and the position tells you the root cause: bottom-right (low SH,
          high SC) is overcharge; top-left (high SH, low SC) is undercharge; center is
          properly charged; corners and edges tell other stories.
        </p>
        <KeyInsight tone="emerald" icon="insight" title="The combined reading is more than the sum of its parts">
          A system can show normal SH but abnormal SC — pointing to a TXV that&apos;s
          regulating correctly but a charge problem. Or normal SC with high SH — pointing
          to a restriction downstream of the condenser. The matrix below maps each
          combination to a specific root cause that a single reading can&apos;t identify.
        </KeyInsight>
      </TechSection>

      <TechSection icon="data" tone="purple" title="The eight-pattern diagnostic matrix">
        <p>
          Combining SH × SC × pressure trends yields eight common fingerprints that cover
          the majority of HVAC service issues. Each fingerprint has a distinct root cause
          and a corresponding service action.
        </p>
        <Panel title="Eight-pattern diagnostic matrix" icon={TableIcon}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-[10px] uppercase tracking-wider text-zinc-500 dark:border-zinc-800">
                  <th className="py-1.5 text-left">#</th>
                  <th className="py-1.5 text-left">SH</th>
                  <th className="py-1.5 text-left">SC</th>
                  <th className="py-1.5 text-left">Suction P</th>
                  <th className="py-1.5 text-left">Discharge P</th>
                  <th className="py-1.5 text-left">Root cause</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5 font-mono">1</td><td className="py-1.5 text-emerald-700 dark:text-emerald-300">Normal</td><td className="py-1.5 text-emerald-700 dark:text-emerald-300">Normal</td><td className="py-1.5 text-emerald-700 dark:text-emerald-300">Normal</td><td className="py-1.5 text-emerald-700 dark:text-emerald-300">Normal</td><td className="py-1.5"><strong>Properly charged.</strong> No action.</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5 font-mono">2</td><td className="py-1.5 text-red-700 dark:text-red-300">High</td><td className="py-1.5 text-red-700 dark:text-red-300">Low / neg</td><td className="py-1.5 text-red-700 dark:text-red-300">Low</td><td className="py-1.5 text-red-700 dark:text-red-300">Low</td><td className="py-1.5"><strong>Undercharge.</strong> Find leak, repair, recharge by weight.</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5 font-mono">3</td><td className="py-1.5 text-red-700 dark:text-red-300">Low / zero</td><td className="py-1.5 text-red-700 dark:text-red-300">High</td><td className="py-1.5 text-red-700 dark:text-red-300">High</td><td className="py-1.5 text-red-700 dark:text-red-300">High</td><td className="py-1.5"><strong>Overcharge.</strong> Recover refrigerant in increments.</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5 font-mono">4</td><td className="py-1.5 text-amber-700 dark:text-amber-300">High</td><td className="py-1.5 text-emerald-700 dark:text-emerald-300">Normal</td><td className="py-1.5 text-amber-700 dark:text-amber-300">Low</td><td className="py-1.5 text-emerald-700 dark:text-emerald-300">Normal</td><td className="py-1.5"><strong>Liquid-line restriction</strong> (filter-drier, kinked line, TXV stuck closed).</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5 font-mono">5</td><td className="py-1.5 text-emerald-700 dark:text-emerald-300">Normal</td><td className="py-1.5 text-amber-700 dark:text-amber-300">High</td><td className="py-1.5 text-emerald-700 dark:text-emerald-300">Normal</td><td className="py-1.5 text-amber-700 dark:text-amber-300">High</td><td className="py-1.5"><strong>Condenser fouling / low ambient airflow.</strong> Clean coil, check fan.</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5 font-mono">6</td><td className="py-1.5 text-amber-700 dark:text-amber-300">Slight high</td><td className="py-1.5 text-amber-700 dark:text-amber-300">Slight low</td><td className="py-1.5 text-amber-700 dark:text-amber-300">Slight low</td><td className="py-1.5 text-amber-700 dark:text-amber-300">Slight low</td><td className="py-1.5"><strong>Slow leak (early stage).</strong> Leak search before adding refrigerant.</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5 font-mono">7</td><td className="py-1.5 text-red-700 dark:text-red-300">Low / zero</td><td className="py-1.5 text-red-700 dark:text-red-300">Low / neg</td><td className="py-1.5 text-red-700 dark:text-red-300">Variable</td><td className="py-1.5 text-amber-700 dark:text-amber-300">Variable</td><td className="py-1.5"><strong>TXV stuck open + undercharge.</strong> Replace TXV, recharge.</td></tr>
                <tr><td className="py-1.5 font-mono">8</td><td className="py-1.5 text-amber-700 dark:text-amber-300">High</td><td className="py-1.5 text-amber-700 dark:text-amber-300">High</td><td className="py-1.5 text-amber-700 dark:text-amber-300">Normal</td><td className="py-1.5 text-red-700 dark:text-red-300">Very high</td><td className="py-1.5"><strong>Non-condensables in system.</strong> Recover, evacuate, recharge.</td></tr>
              </tbody>
            </table>
          </div>
        </Panel>
        <DiagnosticMatrixVisual />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          The SH × SC plane visualized: each quadrant corresponds to a different root cause
          family. The center region (10°F SH ±5, 10°F SC ±3) is the &quot;properly
          charged&quot; window for residential TXV systems. Source: ACCA Manual T (2017),
          ASHRAE Handbook of Refrigeration 2022.
        </p>
      </TechSection>

      <TechSection icon="composition" tone="emerald" title="Charging procedure cheat sheet — TXV vs fixed orifice">
        <Panel title="TXV / EEV system charging procedure" icon={CalcIcon}>
          <ol className="list-decimal pl-5 text-sm space-y-1">
            <li>Verify equipment is clean and properly installed; clear nameplate target SC value.</li>
            <li>Run system for 10-20 minutes to reach steady state.</li>
            <li>Measure SC. Compare to nameplate (typically 10°F ±2°F).</li>
            <li>If SC is low: add refrigerant in 1-2 oz increments, re-test after each.</li>
            <li>If SC is high: recover refrigerant in 1-2 oz increments.</li>
            <li>Cross-check SH lands in 8-15°F (verifies TXV is regulating).</li>
            <li>Document final reading on service log.</li>
          </ol>
        </Panel>
        <Panel title="Fixed-orifice system charging procedure (ACCA Manual T)" icon={CalcIcon}>
          <ol className="list-decimal pl-5 text-sm space-y-1">
            <li>Verify equipment is clean; airflow is correct (400 CFM/ton standard).</li>
            <li>Measure indoor wet-bulb (entering evaporator) and outdoor dry-bulb (entering condenser).</li>
            <li>Look up target SH on the ACCA Manual T chart for the WB / DB combination.</li>
            <li>Run system 10-20 min to steady state.</li>
            <li>Measure SH. Compare to chart target.</li>
            <li>If SH is high: add refrigerant. If SH is low: recover refrigerant.</li>
            <li>Adjust in 2-4 oz increments, re-test SH after each.</li>
            <li>SC on fixed-orifice systems is informational; don&apos;t charge by it.</li>
          </ol>
        </Panel>
      </TechSection>

      <TechSection icon="service" tone="amber" title="Real service problems — eight-pattern matrix in action">
        <p>
          Eight scenarios — one per pattern in the matrix — show what each fingerprint looks
          like in actual field readings and how to use the combined SH + SC + pressure data
          to identify the root cause and choose the right service action.
        </p>
      </TechSection>

      <ServiceProblem
        number={1}
        refrigerant="R-410A (TXV)"
        title="Pattern 1: properly charged — no action"
        scenario="R-410A TXV residential AC, 95°F outdoor day, 75°F indoor / 63°F WB. Just charged. You measure all four values to verify."
      >
        <Panel title="Measured" icon={Gauge}>
          <Gauges
            items={[
              { label: "Suction P", value: "130 PSIG", side: "low" },
              { label: "Suction line", value: "60°F", side: "low" },
              { label: "Discharge P", value: "380 PSIG", side: "high" },
              { label: "Liquid line", value: "100°F", side: "high" },
            ]}
          />
        </Panel>
        <Panel title="Derived" icon={Activity}>
          <Derived
            rows={[
              { formula: "SH = 60 − 45 = 15°F", verdict: "ok", note: "in 8-15°F TXV range" },
              { formula: "SC = 111 − 100 = 11°F", verdict: "ok", note: "in 8-12°F TXV range" },
              { formula: "Pattern: SH normal · SC normal · P_low normal · P_high normal", verdict: "ok", note: "matches Pattern 1" },
            ]}
          />
        </Panel>
        <VerdictBanner status="ok" title="Pattern 1 — properly charged">
          All four metrics in target range and the SH × SC × pressure fingerprint matches
          the &quot;properly charged&quot; row of the matrix. Sign off.
        </VerdictBanner>
      </ServiceProblem>

      <ServiceProblem
        number={2}
        refrigerant="R-410A (TXV)"
        title="Pattern 2: undercharge — the textbook leak fingerprint"
        scenario="Same R-410A TXV system, six months later. Customer reports poor cooling on a 95°F day. You take the full readings to confirm what's going on."
      >
        <Panel title="Measured" icon={Gauge}>
          <Gauges
            items={[
              { label: "Suction P", value: "100 PSIG", side: "low" },
              { label: "Suction line", value: "70°F", side: "low" },
              { label: "Discharge P", value: "320 PSIG", side: "high" },
              { label: "Liquid line", value: "108°F", side: "high" },
            ]}
          />
        </Panel>
        <Panel title="Derived" icon={Activity}>
          <Derived
            rows={[
              { formula: "SH = 70 − 31 = 39°F", verdict: "bad", note: "very high (target 8-15°F)" },
              { formula: "SC = 99 − 108 = −9°F", verdict: "bad", note: "negative — flash gas in liquid line" },
              { formula: "Pattern: SH high · SC negative · P_low low · P_high low", verdict: "bad", note: "matches Pattern 2" },
            ]}
          />
        </Panel>
        <VerdictBanner status="bad" title="Pattern 2 — undercharge (leak)">
          High SH + negative SC + both pressures low is the textbook undercharge
          fingerprint. The refrigerant has leaked out of the system since commissioning.
        </VerdictBanner>
        <FixCallout>
          Find the leak per EPA Section 608 (electronic detector, soap, UV dye), repair the
          leak, then evacuate to 500 microns and charge by weight to nameplate. Do NOT add
          refrigerant without leak repair.
        </FixCallout>
      </ServiceProblem>

      <ServiceProblem
        number={3}
        refrigerant="R-410A (TXV)"
        title="Pattern 3: overcharge — recover refrigerant"
        scenario="R-410A TXV system. Previous tech added refrigerant by gauge feel. Compressor is running noisy and the customer reports higher power bills."
      >
        <Panel title="Measured" icon={Gauge}>
          <Gauges
            items={[
              { label: "Suction P", value: "160 PSIG", side: "low" },
              { label: "Suction line", value: "55°F", side: "low" },
              { label: "Discharge P", value: "480 PSIG", side: "high" },
              { label: "Liquid line", value: "90°F", side: "high" },
            ]}
          />
        </Panel>
        <Panel title="Derived" icon={Activity}>
          <Derived
            rows={[
              { formula: "SH = 55 − 55 = 0°F", verdict: "bad", note: "zero — slugging risk" },
              { formula: "SC = 130 − 90 = 40°F", verdict: "bad", note: "very high" },
              { formula: "Pattern: SH zero · SC very high · P_low high · P_high very high", verdict: "bad", note: "matches Pattern 3" },
            ]}
          />
        </Panel>
        <VerdictBanner status="bad" title="Pattern 3 — overcharge">
          Zero SH + 40°F SC + both pressures high is the textbook overcharge fingerprint.
          Liquid refrigerant is reaching the compressor (slugging risk) and excess fills the
          condenser (high SC).
        </VerdictBanner>
        <FixCallout>
          Recover refrigerant in 1 oz increments, re-testing SH and SC after each step.
          Stop when SH = 8-15°F and SC = 8-12°F. The compressor noise is a warning sign —
          inspect for valve damage if it persists after correction.
        </FixCallout>
      </ServiceProblem>

      <ServiceProblem
        number={4}
        refrigerant="R-410A (TXV)"
        title="Pattern 4: liquid-line restriction — partially clogged filter-drier"
        scenario="R-410A TXV system. Recent customer complaint of weak cooling, but pressures look only slightly off and the unit has plenty of refrigerant (no recent service add or leak history)."
      >
        <Panel title="Measured" icon={Gauge}>
          <Gauges
            items={[
              { label: "Suction P", value: "100 PSIG", side: "low" },
              { label: "Suction line", value: "75°F", side: "low" },
              { label: "Discharge P", value: "395 PSIG", side: "high" },
              { label: "Liquid line", value: "100°F", side: "high" },
            ]}
          />
        </Panel>
        <Panel title="Derived" icon={Activity}>
          <Derived
            rows={[
              { formula: "SH = 75 − 31 = 44°F", verdict: "bad", note: "very high" },
              { formula: "SC = 114 − 100 = 14°F", verdict: "warn", note: "slightly high but in range" },
              { formula: "Pattern: SH very high · SC normal/high · P_low low · P_high near normal", verdict: "warn", note: "matches Pattern 4" },
            ]}
          />
        </Panel>
        <VerdictBanner status="warn" title="Pattern 4 — liquid-line restriction">
          Very high SH with normal-to-slightly-high SC and only low-side pressure depressed
          points to a restriction in the liquid line (filter-drier partially clogged, TXV
          stuck partly closed, kinked line). The condenser is filling normally but flow to
          the evaporator is restricted — starving the evap (high SH) without changing total
          charge (normal SC).
        </VerdictBanner>
        <FixCallout>
          Check filter-drier outlet temperature — significant drop across drier (e.g., 10°F
          colder than inlet) confirms restriction. Replace filter-drier. If symptoms
          persist, inspect TXV operation (sensing bulb contact, equalizer line) and check
          line set for kinks. Do not add refrigerant — that won&apos;t fix a restriction.
        </FixCallout>
      </ServiceProblem>

      <ServiceProblem
        number={5}
        refrigerant="R-410A (TXV)"
        title="Pattern 5: condenser fouling — high SC but normal SH"
        scenario="R-410A TXV system at end of summer. Customer reports the AC isn't keeping up during peak heat. You measure and find SC and discharge pressure are both elevated, but SH and suction pressure look normal."
      >
        <Panel title="Measured" icon={Gauge}>
          <Gauges
            items={[
              { label: "Suction P", value: "130 PSIG", side: "low" },
              { label: "Suction line", value: "60°F", side: "low" },
              { label: "Discharge P", value: "440 PSIG", side: "high" },
              { label: "Liquid line", value: "100°F", side: "high" },
            ]}
          />
        </Panel>
        <Panel title="Derived" icon={Activity}>
          <Derived
            rows={[
              { formula: "SH = 60 − 45 = 15°F", verdict: "ok", note: "normal TXV range" },
              { formula: "SC = 120 − 100 = 20°F", verdict: "bad", note: "high — should be 8-12°F" },
              { formula: "Pattern: SH normal · SC very high · P_low normal · P_high very high", verdict: "warn", note: "matches Pattern 5" },
            ]}
          />
        </Panel>
        <VerdictBanner status="warn" title="Pattern 5 — condenser fouling or low ambient airflow">
          Normal SH (evaporator side healthy) with high SC and high discharge pressure
          points to a condenser-side bottleneck. The condenser isn&apos;t rejecting heat
          efficiently — either fouled coil, restricted ambient airflow (debris around unit,
          weak condenser fan), or recirculation.
        </VerdictBanner>
        <FixCallout>
          Inspect condenser coil — clean with coil cleaner per OEM procedure. Verify
          condenser fan is operating at correct speed. Check for ambient air recirculation
          (unit too close to wall, debris blocking intake). If problem persists after
          cleaning, suspect refrigerant overcharge as secondary cause.
        </FixCallout>
      </ServiceProblem>

      <ServiceProblem
        number={6}
        refrigerant="R-410A (TXV)"
        title="Pattern 6: slow leak (early stage) — subtle pattern shift"
        scenario="R-410A TXV residential AC. System is two years old, customer says cooling seems slightly weaker than last summer. All four readings are only slightly off — easy to miss without comparing to baseline."
      >
        <Panel title="Measured" icon={Gauge}>
          <Gauges
            items={[
              { label: "Suction P", value: "120 PSIG", side: "low" },
              { label: "Suction line", value: "63°F", side: "low" },
              { label: "Discharge P", value: "365 PSIG", side: "high" },
              { label: "Liquid line", value: "103°F", side: "high" },
            ]}
          />
        </Panel>
        <Panel title="Derived" icon={Activity}>
          <Derived
            rows={[
              { formula: "SH = 63 − 41 = 22°F", verdict: "warn", note: "slightly high (target 8-15°F)" },
              { formula: "SC = 108 − 103 = 5°F", verdict: "warn", note: "slightly low (target 8-12°F)" },
              { formula: "Pattern: SH slightly high · SC slightly low · pressures slightly low", verdict: "warn", note: "matches Pattern 6 — early leak" },
            ]}
          />
        </Panel>
        <VerdictBanner status="warn" title="Pattern 6 — slow leak (early stage)">
          Subtle pattern shift in the undercharge direction across all four metrics. No
          single reading flags as &quot;bad&quot; — but the consistent direction across SH,
          SC, and pressures points to slow leak before it has progressed to the dramatic
          undercharge fingerprint (Pattern 2).
        </VerdictBanner>
        <FixCallout>
          Schedule leak detection (electronic + UV dye over a working period of weeks if
          intermittent). Confirm leak, repair, then evacuate and charge by weight. Do not
          add refrigerant without leak repair — early stage will progress to severe
          undercharge if ignored.
        </FixCallout>
      </ServiceProblem>

      <ServiceProblem
        number={7}
        refrigerant="R-410A (TXV)"
        title="Pattern 7: TXV stuck open + low refrigerant — confused pattern"
        scenario="R-410A TXV system. Customer reports compressor noise and weak cooling. The pattern doesn't match clean undercharge or clean overcharge — both SH and SC are low simultaneously, which is the TXV-flooding fingerprint."
      >
        <Panel title="Measured" icon={Gauge}>
          <Gauges
            items={[
              { label: "Suction P", value: "145 PSIG", side: "low" },
              { label: "Suction line", value: "53°F", side: "low" },
              { label: "Discharge P", value: "350 PSIG", side: "high" },
              { label: "Liquid line", value: "104°F", side: "high" },
            ]}
          />
        </Panel>
        <Panel title="Derived" icon={Activity}>
          <Derived
            rows={[
              { formula: "SH = 53 − 50 = 3°F", verdict: "bad", note: "very low — slugging risk" },
              { formula: "SC = 105 − 104 = 1°F", verdict: "bad", note: "very low" },
              { formula: "Pattern: SH very low · SC very low · pressures somewhere in middle", verdict: "bad", note: "matches Pattern 7" },
            ]}
          />
        </Panel>
        <VerdictBanner status="bad" title="Pattern 7 — TXV stuck open + low refrigerant column">
          Both SH and SC are low — neither matches clean undercharge or overcharge. This is
          the TXV-flooding-the-evaporator fingerprint: the valve is letting too much
          refrigerant pass (low SC because no liquid column backs up; low SH because
          evaporator is flooded). Refrigerant level may also be sub-spec.
        </VerdictBanner>
        <FixCallout>
          Inspect TXV sensing bulb (should be insulated, clamped tightly to suction line).
          If bulb has lost charge or sensing tube is broken, replace the TXV. After replace,
          recover refrigerant, evacuate, and charge by weight. Cross-check SH and SC at
          steady state — should both land in target.
        </FixCallout>
      </ServiceProblem>

      <ServiceProblem
        number={8}
        refrigerant="R-410A (TXV)"
        title="Pattern 8: non-condensables in system — air contamination"
        scenario="R-410A TXV system, recent commissioning but not properly evacuated before charging. Discharge pressure is unusually high despite normal-ish other readings. Both SH and SC are slightly high."
      >
        <Panel title="Measured" icon={Gauge}>
          <Gauges
            items={[
              { label: "Suction P", value: "135 PSIG", side: "low" },
              { label: "Suction line", value: "65°F", side: "low" },
              { label: "Discharge P", value: "510 PSIG", side: "high" },
              { label: "Liquid line", value: "98°F", side: "high" },
            ]}
          />
        </Panel>
        <Panel title="Derived" icon={Activity}>
          <Derived
            rows={[
              { formula: "SH = 65 − 47 = 18°F", verdict: "warn", note: "slightly high" },
              { formula: "SC = 136 − 98 = 38°F", verdict: "bad", note: "extreme" },
              { formula: "Pattern: SH high · SC very high · P_low normal · P_high very high", verdict: "bad", note: "matches Pattern 8" },
            ]}
          />
        </Panel>
        <VerdictBanner status="bad" title="Pattern 8 — non-condensables (air) in system">
          Extreme discharge pressure with high SC and high SH points to non-condensable
          gases (air, nitrogen) trapped in the condenser. Non-condensables occupy condenser
          volume that should be holding refrigerant, raising condensing pressure
          dramatically. The pressures don&apos;t match what charge alone would produce.
        </VerdictBanner>
        <FixCallout>
          Recover all refrigerant. Evacuate to deep vacuum (≤500 microns) and hold ≥30
          minutes with vacuum pump isolated to confirm no leakback. Replace filter-drier.
          Recharge by weight. Common cause: skipping or shortening the evacuation step
          during commissioning; the result here demonstrates why proper evacuation matters.
        </FixCallout>
      </ServiceProblem>

      <TechSection icon="warning" tone="amber" title="When the combined readings don't fit a clean pattern">
        <p>
          Real-world systems sometimes show patterns that don&apos;t match any single matrix
          row cleanly. Multiple faults can stack (e.g., dirty condenser plus mild
          undercharge), and zeotropic blends with wide glide can confuse pattern detection
          if curve selection is wrong. Three principles for ambiguous readings:
        </p>
        <ol className="list-decimal pl-5 space-y-1 text-sm">
          <li>
            <strong>Verify curve selection first.</strong> If using a zeotropic blend
            (R-407C, R-454C, R-455A), confirm your SH calculation uses dew and SC uses
            bubble. Wrong-curve errors can shift readings by 11-22°F and confuse pattern
            matching.
          </li>
          <li>
            <strong>Check airflow on both sides.</strong> Low indoor airflow (dirty filter,
            failed blower wheel, closed dampers) raises evap temperature and SH; low
            condenser airflow raises condenser temperature and SC. Many ambiguous patterns
            resolve once airflow is corrected.
          </li>
          <li>
            <strong>Look at the trend, not just the snapshot.</strong> If this is a
            recurring service visit, compare today&apos;s readings to previous service logs.
            A slowly drifting pattern (Pattern 6 fingerprint) tells you something different
            than a snapshot that just happens to be off.
          </li>
        </ol>
      </TechSection>

      <TechSection icon="book" tone="emerald" title="When to use this calculator vs the others">
        <ul>
          <li>
            <strong>Combined SH / SC / PT</strong> (this page) — full diagnostic synthesis.
            Best for system commissioning, post-repair verification, and complex
            troubleshooting where you have all four readings and want to identify the root
            cause from the matrix.
          </li>
          <li>
            <strong>
              <a href="/superheat-calculator/" className="underline">Superheat Calculator</a>
            </strong>{" "}
            — focused single-result. Use for fixed-orifice charging, quick TXV operation
            check, or when you only have the suction-side readings.
          </li>
          <li>
            <strong>
              <a href="/subcooling-calculator/" className="underline">Subcooling Calculator</a>
            </strong>{" "}
            — focused liquid-side. Use for TXV / EEV charging where SC is the primary
            metric, or condenser-side troubleshooting.
          </li>
          <li>
            <strong>
              <a href="/pt-calculator/" className="underline">PT Calculator</a>
            </strong>{" "}
            — raw saturation lookup. Use for reference, retrofit comparisons, or as a
            building block in manual calculations.
          </li>
          <li>
            <strong>
              <a href="/system-pressure-diagnostic-calculator/" className="underline">
                System Pressure Diagnostic
              </a>
            </strong>{" "}
            — decision-tree fingerprint matcher with ranked root cause output. Use after
            computing SH and SC here if you want a richer decision-tree analysis with
            ranked suspect causes.
          </li>
        </ul>
      </TechSection>

      <TechSection icon="source" tone="zinc" title="Primary sources behind the calculator and content">
        <ul>
          <li>
            <strong>CoolProp 7.2.0</strong> (Bell, Wronski, Quoilin, Lemort 2014,
            doi:10.1021/ie4033999) — REFPROP-compatible Helmholtz EOS for all saturation
            temperatures. Accuracy typically better than ±0.5% across operating range.
          </li>
          <li>
            <strong>ACCA Manual T &quot;Air-Side and Refrigerant-Side Diagnostics&quot;
            (2017)</strong> — combined SH × SC × pressure pattern matrix, charging
            procedures for TXV and fixed-orifice systems, ambient-corrected target SH.
          </li>
          <li>
            <strong>ASHRAE Handbook of Refrigeration 2022</strong> — Chapter 23 (service
            procedures), eight-pattern fingerprint discussion, non-condensable detection.
          </li>
          <li>
            <strong>AHRI Standard 540-2020</strong> — compressor protection minimum
            return-gas superheat (20°F hermetic, 30°F semi-hermetic).
          </li>
          <li>
            <strong>EPA Section 608 (40 CFR Part 82 Subpart F)</strong> — refrigerant
            handling certification, leak repair requirements before adding refrigerant.
          </li>
          <li>
            <strong>OEM service literature</strong> — Carrier, Trane, Lennox, Daikin,
            Goodman, Mitsubishi service manuals for equipment-specific SC and SH targets.
          </li>
        </ul>
      </TechSection>
    </>
  );
}

/* ──────────────────────── Inline SVG charts ──────────────────────── */

function DiagnosticMatrixVisual() {
  const W = 720;
  const H = 460;
  const PAD_L = 70;
  const PAD_R = 30;
  const PAD_T = 50;
  const PAD_B = 60;
  const PLOT_W = W - PAD_L - PAD_R;
  const PLOT_H = H - PAD_T - PAD_B;
  // X axis: Superheat 0 to 50
  // Y axis: Subcooling -10 to 40
  const xMin = 0, xMax = 50;
  const yMin = -10, yMax = 40;
  const xScale = (v: number) => PAD_L + ((v - xMin) / (xMax - xMin)) * PLOT_W;
  const yScale = (v: number) => PAD_T + PLOT_H - ((v - yMin) / (yMax - yMin)) * PLOT_H;

  const patterns = [
    { label: "P1 ✓", sh: 12, sc: 10, fill: "#5a8a3a", desc: "Properly charged" },
    { label: "P2", sh: 35, sc: -5, fill: "#c45757", desc: "Undercharge" },
    { label: "P3", sh: 2, sc: 30, fill: "#c45757", desc: "Overcharge" },
    { label: "P4", sh: 38, sc: 12, fill: "#d49a2b", desc: "Restriction" },
    { label: "P5", sh: 13, sc: 22, fill: "#d49a2b", desc: "Fouling" },
    { label: "P6", sh: 20, sc: 6, fill: "#e6a83a", desc: "Early leak" },
    { label: "P7", sh: 3, sc: 2, fill: "#c45757", desc: "TXV open" },
    { label: "P8", sh: 18, sc: 32, fill: "#c45757", desc: "Non-cond" },
  ];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="The eight-pattern SH-by-SC diagnostic matrix visualized as a scatter chart, with each pattern positioned by its typical SH and SC values."
      className="my-3 h-auto w-full text-zinc-700 dark:text-zinc-300"
      preserveAspectRatio="xMidYMid meet"
    >
      <text x={W / 2} y={24} textAnchor="middle" fontSize="14" fontWeight={600} fill="currentColor">
        Eight-pattern diagnostic matrix (SH × SC plane)
      </text>
      {/* properly-charged target zone */}
      <rect
        x={xScale(8)}
        y={yScale(12)}
        width={xScale(15) - xScale(8)}
        height={yScale(8) - yScale(12)}
        fill="#5a8a3a"
        opacity={0.15}
        stroke="#5a8a3a"
        strokeDasharray="4 2"
        strokeWidth={1.5}
      />
      <text x={xScale(11.5)} y={yScale(10) - 4} textAnchor="middle" fontSize="9" fill="#5a8a3a" fontWeight={600}>
        TXV target zone
      </text>
      {/* grid */}
      {[0, 10, 20, 30, 40, 50].map((t) => (
        <g key={`gx-${t}`}>
          <line x1={xScale(t)} y1={PAD_T} x2={xScale(t)} y2={PAD_T + PLOT_H} stroke="currentColor" opacity={0.1} strokeDasharray="2 3" />
          <text x={xScale(t)} y={PAD_T + PLOT_H + 16} textAnchor="middle" fontSize="10" fill="currentColor" opacity={0.7}>
            {t}
          </text>
        </g>
      ))}
      {[-10, 0, 10, 20, 30, 40].map((t) => (
        <g key={`gy-${t}`}>
          <line x1={PAD_L} y1={yScale(t)} x2={PAD_L + PLOT_W} y2={yScale(t)} stroke="currentColor" opacity={0.1} strokeDasharray="2 3" />
          <text x={PAD_L - 8} y={yScale(t) + 4} textAnchor="end" fontSize="10" fill="currentColor" opacity={0.7}>
            {t}
          </text>
        </g>
      ))}
      <line x1={PAD_L} y1={yScale(0)} x2={PAD_L + PLOT_W} y2={yScale(0)} stroke="currentColor" opacity={0.4} strokeWidth={1} />
      <line x1={PAD_L} y1={PAD_T + PLOT_H} x2={PAD_L + PLOT_W} y2={PAD_T + PLOT_H} stroke="currentColor" opacity={0.6} />
      <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + PLOT_H} stroke="currentColor" opacity={0.6} />
      <text x={PAD_L + PLOT_W / 2} y={H - 20} textAnchor="middle" fontSize="11" fontWeight={600} fill="currentColor">
        Superheat (°F)
      </text>
      <text
        x={16}
        y={PAD_T + PLOT_H / 2}
        textAnchor="middle"
        fontSize="11"
        fontWeight={600}
        fill="currentColor"
        transform={`rotate(-90 16 ${PAD_T + PLOT_H / 2})`}
      >
        Subcooling (°F)
      </text>
      {/* pattern markers */}
      {patterns.map((p) => (
        <g key={p.label}>
          <circle cx={xScale(p.sh)} cy={yScale(p.sc)} r={12} fill={p.fill} opacity={0.7} stroke="white" strokeWidth={1.5} />
          <text x={xScale(p.sh)} y={yScale(p.sc) + 3} textAnchor="middle" fontSize="9" fontWeight={700} fill="white">
            {p.label}
          </text>
          <text x={xScale(p.sh)} y={yScale(p.sc) + 26} textAnchor="middle" fontSize="9" fill="currentColor" opacity={0.8}>
            {p.desc}
          </text>
        </g>
      ))}
      <text x={W / 2} y={H - 4} textAnchor="middle" fontSize="9" fill="currentColor" opacity={0.6}>
        Each pattern in the eight-row matrix plotted in the SH × SC plane.
      </text>
    </svg>
  );
}
