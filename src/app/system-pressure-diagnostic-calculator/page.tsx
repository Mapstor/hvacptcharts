import type { Metadata } from "next";
import { Activity, Calculator as CalcIcon, Gauge, Table as TableIcon } from "lucide-react";
import { refrigerants } from "@/data/refrigerants";
import { CalculatorShell } from "@/components/calculators/shared/CalculatorShell";
import { SystemPressureDiagnostic } from "@/components/calculators/SystemPressureDiagnostic";
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
    q: "What does this calculator do that the combined PT/SH/SC calculator doesn't?",
    a: "The combined PT/SH/SC calculator computes superheat and subcooling and shows a four-pattern interpretation. This diagnostic calculator extends the analysis with two more dimensions: condenser approach (discharge saturation vs ambient) and evaporator approach (return air vs suction saturation), then produces structured flags with severity, evidence, and ordered recommendations. The combined calculator answers 'is the charge correct?'; the diagnostic answers 'what's wrong and what should I do about it?'.",
  },
  {
    q: "What is condenser approach and why does it matter?",
    a: "Condenser approach is the discharge saturation temperature minus the outdoor ambient. On a properly-running residential AC, the approach is typically 15-25°F — the condenser needs that delta to reject heat to the air. An approach significantly above this range indicates the condenser can't reject heat as fast as the system is generating it: dirty coil, blocked airflow, non-condensables, or compressor inefficiency. Above ~45°F approach raises high-pressure-cutout risk and warrants stopping the system. ASHRAE Handbook of Refrigeration 2022 Chapter 39 (condensers) and equipment OEM service literature are the authoritative references.",
  },
  {
    q: "What is evaporator approach and why does it matter?",
    a: "Evaporator approach is the return-air temperature minus the suction saturation temperature. For residential AC the approach is typically 20-40°F depending on indoor humidity — the evap needs that delta to absorb heat from the air. An approach significantly below 20°F suggests low indoor airflow (dirty filter, failed blower) — the air spends too long over the coil. Above 40°F suggests evap starvation (undercharge, TXV restriction, blocked liquid line). The approach is independent of charge in a way that SH is not, so it gives an orthogonal diagnostic dimension.",
  },
  {
    q: "Why does the calculator ask for system type?",
    a: "Target ranges for superheat and subcooling differ by metering device and application. TXV residential AC targets tight SH (8-15°F) with SC as the primary charge metric (8-12°F). Fixed-orifice residential AC uses a wider SH range from the ACCA Manual T chart. Walk-in cooler / freezer targets wider ranges (SH 8-20°F, SC 5-15°F). Without the system type the calculator uses a generic envelope; with it the flags are calibrated to what the specific equipment class expects.",
  },
  {
    q: "How accurate are the diagnostic patterns?",
    a: "The patterns reflect well-established HVAC diagnostic conventions from ACCA Manual T and ASHRAE Handbook of Refrigeration 2022 — high SH + low SC = undercharge is the textbook fingerprint, repeated across decades of service literature. The calculator surfaces these patterns reliably from the input combination, but doesn't account for every real-world variable (system age, recent service, equipment-specific quirks, ambient changes during the reading). Treat the flags as 'here's what to investigate' rather than 'definitive diagnosis'.",
  },
  {
    q: "What if multiple flags appear at the same time?",
    a: "Read them in priority order — alarm before concern before caution before OK. An ALARM flag (negative SH, negative SC, very-high condenser approach) demands action before continuing operation. A CONCERN flag identifies a likely cause and recommends specific investigation. A CAUTION flag is a less-clear pattern that warrants verification. Multiple flags often share root causes (overcharge flag + high condenser approach can both result from the same overcharge condition).",
  },
  {
    q: "Can I use this on commercial refrigeration?",
    a: "Yes — pick medium-temp or low-temp commercial system type. Target ranges adjust accordingly. Commercial systems have wider tolerance ranges on SH and SC than residential AC because case load, door openings, and defrost cycles introduce more variability into steady-state readings. For very-large industrial systems and transcritical CO₂, use the equipment OEM diagnostic procedures rather than these generic patterns.",
  },
  {
    q: "Does this work for R-744 (CO₂) transcritical systems?",
    a: "Partially. The sub-critical low-side analysis works for CO₂ systems (R-744 saturation pressures below 87.8°F critical temperature are well-modeled). The transcritical high-side cannot be analyzed with the saturation-based logic — above the critical temperature there is no saturation pressure, so subcooling and condenser approach calculations don't apply. For CO₂ transcritical diagnostic work, refer to equipment OEM service literature; the patterns are different from sub-critical HVAC.",
  },
  {
    q: "Why does the calculator weight some patterns higher than others?",
    a: "Severity is determined by both the magnitude of the deviation and the consequence. Zero superheat (slugging risk) is an ALARM because of immediate compressor-damage risk; high condenser approach during normal operation is a CONCERN because of long-term efficiency loss; slightly elevated subcooling alone is CAUTION because it might be early-stage and might be measurement error. The weighting follows ACCA Manual T severity-ranking conventions used in field service.",
  },
];

export const metadata: Metadata = {
  title: "System Pressure Diagnostic Calculator — Multi-Input HVAC Fault Finder",
  description:
    "Free multi-input HVAC diagnostic calculator for 50+ refrigerants. Enter ambient, return air, suction P/T, liquid P/T, and system type; get superheat, subcooling, condenser & evaporator approach, plus severity-ranked diagnostic flags with evidence and ordered recommendations. Built on ACCA Manual T, ASHRAE Handbook of Refrigeration 2022, and AHRI Standard 540.",
  alternates: { canonical: `${SITE_URL}/system-pressure-diagnostic-calculator/` },
};

export default function SystemPressureDiagnosticPage() {
  return (
    <CalculatorShell
      schema={{
        path: "system-pressure-diagnostic-calculator",
        name: "System Pressure Diagnostic Calculator",
        description:
          "Multi-input expert system for HVAC pressure diagnostic interpretation. Eight inputs (refrigerant, ambient, return air, suction P+T, liquid P+T, system type) produce structured flags with severity, evidence, and ordered recommendations.",
        featureList: [
          "Eight-input analysis: refrigerant + ambient + return air + suction P/T + liquid P/T + system type",
          "Derived values: SH (dew curve), SC (bubble curve), condenser approach, evaporator approach",
          "Per-system-type target ranges (TXV vs fixed-orifice vs MT/LT commercial)",
          "Severity-ranked flags: alarm / concern / caution / OK",
          "Each flag includes evidence + ordered service recommendations",
          "Six multi-flag service problems showing diagnostic synthesis",
          "ACCA Manual T, ASHRAE Handbook of Refrigeration 2022 sourced",
          "Mobile-friendly, no signup",
        ],
        publishedDate: PUBLISHED,
        breadcrumbLabel: "System Pressure Diagnostic",
      }}
      introOneLiner="Enter your full set of pressure and temperature readings; the calculator computes SH, SC, condenser approach, and evaporator approach, then produces severity-ranked diagnostic flags with evidence and ordered recommendations."
      generatedDate={PUBLISHED.slice(0, 10)}
      howTo={{
        steps: [
          "Pick the refrigerant in the system. Pick the system type (TXV, fixed-orifice, EXV, or MT / LT commercial) — target ranges adjust accordingly.",
          "Record outdoor ambient at the condenser inlet (not in direct sun) and indoor return-air at the air handler.",
          "Let the system run 10-20 minutes under load to stabilize. Connect manifold gauges to suction and discharge ports.",
          "Read suction pressure (low side) and discharge pressure (high side). Clamp temperature probes to suction line (within 6 inches of compressor) and liquid line (at condenser outlet). Insulate probes from ambient.",
          "Enter all six measurements. The diagnostic flags update immediately. Read flags in priority order — alarms first.",
          "Follow the numbered recommendations for the highest-severity flag first.",
        ],
        commonErrors: [
          "Measuring before stabilization — transient readings produce conflicting patterns. Wait 10-20 minutes under load.",
          "Probing temperature without insulating from ambient.",
          "Confusing high-side and low-side ports — reversed connections invert the diagnosis entirely.",
          "Treating the highest-severity alarm as the only finding — multiple flags often share root causes; read the full list.",
          "Using the diagnostic for transcritical CO₂ — saturation-based analysis doesn't apply above the critical point.",
        ],
      }}
      math={{
        formula:
          "Superheat = T_suction_line − T_sat(P_suction, dew)\nSubcooling = T_sat(P_liquid, bubble) − T_liquid_line\nCondenser approach = T_sat(P_liquid, bubble) − T_ambient\nEvaporator approach = T_return_air − T_sat(P_suction, dew)\n\nDiagnostic flags fire when derived values fall outside per-system-type target ranges, with severity ranked by magnitude × consequence.",
        sourceCitation:
          "Saturation values from CoolProp 7.2.0. Diagnostic patterns and recommended actions from ACCA Manual T (2017), ASHRAE Handbook of Refrigeration 2022 (Chapters 23, 39), AHRI Standard 540-2020, and equipment manufacturer service literature.",
        workedExample:
          "R-410A TXV residential AC, 95°F outdoor, 75°F return air:\n  Suction: 110 PSIG, 62°F\n  Discharge: 340 PSIG, 98°F\n\nDerived:\n  Suction sat (dew): 37°F → SH = 62 − 37 = 25°F (above 8-15°F target)\n  Discharge sat (bubble): 102°F → SC = 102 − 98 = 4°F (below 8-12°F target)\n  Condenser approach = 102 − 95 = 7°F (LOW — should be 15-25°F)\n  Evap approach = 75 − 37 = 38°F (high end of normal)\n\nFlags (priority-sorted):\n  CONCERN — Likely undercharge (high SH + low SC fingerprint, supported by low condenser approach)\n  CAUTION — Verify with leak search before adjusting charge\n\nRecommendation order:\n  1. Leak search before adding refrigerant\n  2. Repair leak per EPA 608\n  3. Evacuate to 500 microns, charge by weight to nameplate",
      }}
      relatedTools={[
        { href: "/pt-superheat-subcooling-calculator/", label: "Combined PT/SH/SC", blurb: "Simpler four-pattern view of SH + SC without approach temperatures." },
        { href: "/superheat-calculator/", label: "Superheat Calculator", blurb: "Suction-side measurement alone." },
        { href: "/subcooling-calculator/", label: "Subcooling Calculator", blurb: "Liquid-side measurement alone." },
        { href: "/high-head-pressure-causes/", label: "High Head Pressure Causes", blurb: "Decision-tree narrative behind condenser-side flags." },
        { href: "/superheat-subcooling-fundamentals/", label: "SH/SC Fundamentals", blurb: "Conceptual basis for the diagnostic patterns." },
      ]}
      faqs={FAQS}
      bodySections={<RichContent />}
    >
      <SystemPressureDiagnostic />
    </CalculatorShell>
  );
}

function RichContent() {
  return (
    <>
      <TechSection icon="composition" tone="blue" title="Multi-input diagnostic — beyond pattern matching">
        <p>
          Single measurements like superheat or subcooling answer specific questions about
          one side of the system. Two measurements together (the combined SH × SC matrix)
          form a 2D coordinate that classifies into eight patterns. A multi-input
          diagnostic adds two more dimensions — condenser approach and evaporator approach
          — for richer discrimination between root causes that the 2D matrix would lump
          together.
        </p>
        <p>
          A condenser-fouling case and an overcharge case both show high SC, for instance,
          but condenser approach distinguishes them cleanly: fouling raises approach
          (condenser can&apos;t reject heat), overcharge doesn&apos;t (condenser still
          rejecting normally, just more liquid backed up). With both metrics in hand, the
          diagnostic shifts from &quot;might be A or B&quot; to &quot;definitely A, with
          this evidence.&quot;
        </p>
        <KeyInsight tone="emerald" icon="insight" title="Four metrics, eight inputs, sixteen-plus distinct root causes">
          Adding ambient and return air temperatures unlocks approach calculations. The
          four derived metrics (SH, SC, cond approach, evap approach) span more diagnostic
          space than two metrics alone, distinguishing root causes that look identical in
          the SH × SC plane.
        </KeyInsight>
      </TechSection>

      <TechSection icon="thermometer" tone="purple" title="Approach temperatures — the missing diagnostic dimension">
        <p>
          Approach temperature is the difference between the refrigerant&apos;s saturation
          temperature and the heat-transfer medium (air, water) on the other side of the
          coil. For an air-cooled condenser, approach = T_sat_discharge − T_ambient. For
          an evaporator, approach = T_return_air − T_sat_suction. The approach measures
          how efficiently the coil is moving heat.
        </p>
        <Panel title="Target approach by application" icon={TableIcon}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-[10px] uppercase tracking-wider text-zinc-500 dark:border-zinc-800">
                  <th className="py-1.5 text-left">Application / coil</th>
                  <th className="py-1.5 text-right">Normal approach</th>
                  <th className="py-1.5 text-left">What high approach means</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5">Air-cooled condenser, residential AC</td><td className="py-1.5 text-right font-mono tabular-nums">15-25°F</td><td className="py-1.5 text-xs">Dirty coil, blocked airflow, non-condensables, overcharge</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5">Water-cooled condenser, chiller</td><td className="py-1.5 text-right font-mono tabular-nums">5-10°F</td><td className="py-1.5 text-xs">Tube fouling, low water flow</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5">Air-cooled condenser, walk-in</td><td className="py-1.5 text-right font-mono tabular-nums">15-30°F</td><td className="py-1.5 text-xs">Dirty coil, condenser fan failure</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5">Evaporator, residential AC</td><td className="py-1.5 text-right font-mono tabular-nums">20-40°F</td><td className="py-1.5 text-xs">Low indoor airflow, dirty filter, blower problem</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5">Evaporator, walk-in cooler</td><td className="py-1.5 text-right font-mono tabular-nums">10-20°F</td><td className="py-1.5 text-xs">Iced coil, low refrigerant, fan problem</td></tr>
                <tr><td className="py-1.5">Evaporator, chiller (flooded)</td><td className="py-1.5 text-right font-mono tabular-nums">2-5°F</td><td className="py-1.5 text-xs">Tube fouling, low water flow</td></tr>
              </tbody>
            </table>
          </div>
        </Panel>
        <ApproachVisual />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Condenser approach visualized for a residential AC: refrigerant saturates 15-25°F
          above ambient on a properly-running condenser. Approach climbing into the 30-45°F
          range indicates a condenser-side problem; above 45°F is approaching the
          high-pressure cutout. Source: ASHRAE Handbook of Refrigeration 2022 Ch. 39
          (condensers), Carrier / Trane / Lennox service literature.
        </p>
      </TechSection>

      <TechSection icon="data" tone="emerald" title="Severity classification — alarm / concern / caution / OK">
        <p>
          The diagnostic ranks each flag by severity. Severity = magnitude of deviation ×
          consequence of the underlying condition. This means a small SH deviation might
          warrant only a CAUTION while a large condenser approach deviation triggers
          ALARM, even if both deviations are technically &quot;outside target.&quot;
        </p>
        <Panel title="Severity tiers" icon={TableIcon}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-[10px] uppercase tracking-wider text-zinc-500 dark:border-zinc-800">
                  <th className="py-1.5 text-left">Severity</th>
                  <th className="py-1.5 text-left">Examples</th>
                  <th className="py-1.5 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5 text-red-700 dark:text-red-300 font-semibold">ALARM</td><td className="py-1.5">Zero / negative SH, negative SC, condenser approach &gt; 45°F, discharge P near cutout</td><td className="py-1.5">Stop the system, investigate before restart.</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5 text-amber-700 dark:text-amber-300 font-semibold">CONCERN</td><td className="py-1.5">SH 20-30°F above target, SC &lt; 3°F, condenser approach 30-45°F</td><td className="py-1.5">Identify root cause, plan service action.</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5 text-sky-700 dark:text-sky-300 font-semibold">CAUTION</td><td className="py-1.5">SH or SC 5-10°F off target, approach slightly elevated, pressure trends mismatched</td><td className="py-1.5">Verify with additional measurement, schedule follow-up.</td></tr>
                <tr><td className="py-1.5 text-emerald-700 dark:text-emerald-300 font-semibold">OK</td><td className="py-1.5">All metrics in target range</td><td className="py-1.5">No action; document baseline.</td></tr>
              </tbody>
            </table>
          </div>
        </Panel>
      </TechSection>

      <TechSection icon="service" tone="amber" title="Real service problems — multi-flag diagnostic synthesis">
        <p>
          Six scenarios where two or more flags fire at the same time. The multi-input
          diagnostic identifies the root cause that resolves all flags, distinguishing it
          from cases where multiple independent issues coexist.
        </p>
      </TechSection>

      <ServiceProblem
        number={1}
        refrigerant="R-410A (TXV)"
        title="Single-cause undercharge — three flags, one root cause"
        scenario="R-410A TXV residential AC, 95°F outdoor, 75°F return air. Customer reports poor cooling. You take the full set of readings."
      >
        <Panel title="Measured" icon={Gauge}>
          <Gauges
            items={[
              { label: "Suction P", value: "110 PSIG", side: "low" },
              { label: "Suction line", value: "62°F", side: "low" },
              { label: "Discharge P", value: "340 PSIG", side: "high" },
              { label: "Liquid line", value: "98°F", side: "high" },
            ]}
          />
        </Panel>
        <Panel title="Derived" icon={Activity}>
          <Derived
            rows={[
              { formula: "SH = 62 − 37 = 25°F", verdict: "bad", note: "above 8-15°F TXV target" },
              { formula: "SC = 102 − 98 = 4°F", verdict: "bad", note: "below 8-12°F TXV target" },
              { formula: "Cond approach = 102 − 95 = 7°F", verdict: "warn", note: "below 15-25°F target" },
              { formula: "Evap approach = 75 − 37 = 38°F", verdict: "warn", note: "high end normal" },
            ]}
          />
        </Panel>
        <VerdictBanner status="bad" title="CONCERN — undercharge (all three flags share one cause)">
          High SH + low SC + low condenser approach all point to one cause: insufficient
          refrigerant. The low condenser approach is a direct consequence of the
          undercharge — less refrigerant means less condensing happening per pass, so the
          condenser doesn&apos;t need to climb above ambient to reject heat (because
          it&apos;s not rejecting much heat).
        </VerdictBanner>
        <FixCallout>
          Find and repair the leak per EPA Section 608, then evacuate and charge by weight.
          All three flags should clear once charge is correct.
        </FixCallout>
      </ServiceProblem>

      <ServiceProblem
        number={2}
        refrigerant="R-410A (TXV)"
        title="Two independent causes — dirty filter + slight overcharge"
        scenario="R-410A TXV system. Customer reports the AC cools but cycles on and off more than it should. Some readings look like overcharge, but evap approach is also low — hinting at two issues."
      >
        <Panel title="Measured" icon={Gauge}>
          <Gauges
            items={[
              { label: "Suction P", value: "145 PSIG", side: "low" },
              { label: "Suction line", value: "56°F", side: "low" },
              { label: "Discharge P", value: "410 PSIG", side: "high" },
              { label: "Liquid line", value: "98°F", side: "high" },
            ]}
          />
        </Panel>
        <Panel title="Derived" icon={Activity}>
          <Derived
            rows={[
              { formula: "SH = 56 − 50 = 6°F", verdict: "warn", note: "below 8-15°F target" },
              { formula: "SC = 116 − 98 = 18°F", verdict: "warn", note: "above 8-12°F target" },
              { formula: "Cond approach = 116 − 95 = 21°F", verdict: "ok", note: "in 15-25°F target — coil clean" },
              { formula: "Evap approach = 75 − 50 = 25°F", verdict: "warn", note: "low end of 20-40°F — airflow restricted" },
            ]}
          />
        </Panel>
        <VerdictBanner status="warn" title="CAUTION — two independent issues (overcharge + low airflow)">
          The SH × SC pattern looks like overcharge (low SH, high SC), but normal condenser
          approach + low evap approach reveals a second cause: indoor airflow restriction
          (low evap approach because air spends too long over the coil and cools further).
          Just recovering refrigerant won&apos;t fully fix this — you also need to address
          airflow.
        </VerdictBanner>
        <FixCallout>
          Change air filter first, verify blower wheel is clean and operating at correct
          speed, then re-test. After airflow is restored, recover refrigerant in
          increments until SC reaches 10°F target. Two fixes for two causes.
        </FixCallout>
      </ServiceProblem>

      <ServiceProblem
        number={3}
        refrigerant="R-410A (TXV)"
        title="Condenser fouling — high SC but condenser approach is the smoking gun"
        scenario="R-410A TXV system. SC is high (looks like overcharge) but the system has no recent service history. Could be overcharge — but the condenser-approach flag distinguishes overcharge from fouling cleanly."
      >
        <Panel title="Measured" icon={Gauge}>
          <Gauges
            items={[
              { label: "Suction P", value: "130 PSIG", side: "low" },
              { label: "Suction line", value: "60°F", side: "low" },
              { label: "Discharge P", value: "445 PSIG", side: "high" },
              { label: "Liquid line", value: "98°F", side: "high" },
            ]}
          />
        </Panel>
        <Panel title="Derived" icon={Activity}>
          <Derived
            rows={[
              { formula: "SH = 60 − 45 = 15°F", verdict: "ok", note: "TXV in target" },
              { formula: "SC = 121 − 98 = 23°F", verdict: "warn", note: "above 8-12°F target" },
              { formula: "Cond approach = 121 − 95 = 26°F", verdict: "bad", note: "above 15-25°F target — condenser bottleneck" },
              { formula: "Evap approach = 75 − 45 = 30°F", verdict: "ok", note: "in 20-40°F target" },
            ]}
          />
        </Panel>
        <VerdictBanner status="bad" title="CONCERN — condenser fouling, NOT overcharge">
          High SC + high condenser approach is fouling (heat-transfer impedance forces
          condenser saturation higher to reject the same heat). Overcharge would show high
          SC + NORMAL condenser approach (excess liquid in coil but coil still rejects heat
          efficiently). Service action differs: clean the condenser, don&apos;t recover
          refrigerant.
        </VerdictBanner>
        <FixCallout>
          Clean condenser coil per OEM procedure. Re-test all four metrics. If SC drops to
          target after cleaning, charge was correct all along. If SC remains high after
          cleaning, then recover refrigerant in increments.
        </FixCallout>
      </ServiceProblem>

      <ServiceProblem
        number={4}
        refrigerant="R-410A (TXV)"
        title="ALARM — zero superheat with elevated condenser approach"
        scenario="R-410A TXV system. Compressor making loud knocking sounds. You connect gauges and find immediate red flags."
      >
        <Panel title="Measured" icon={Gauge}>
          <Gauges
            items={[
              { label: "Suction P", value: "175 PSIG", side: "low" },
              { label: "Suction line", value: "60°F", side: "low" },
              { label: "Discharge P", value: "510 PSIG", side: "high" },
              { label: "Liquid line", value: "92°F", side: "high" },
            ]}
          />
        </Panel>
        <Panel title="Derived" icon={Activity}>
          <Derived
            rows={[
              { formula: "SH = 60 − 60 = 0°F", verdict: "bad", note: "ALARM — saturated mixture in suction" },
              { formula: "SC = 136 − 92 = 44°F", verdict: "bad", note: "ALARM — extreme overcharge" },
              { formula: "Cond approach = 136 − 95 = 41°F", verdict: "bad", note: "ALARM — approaching cutout" },
              { formula: "Evap approach = 75 − 60 = 15°F", verdict: "bad", note: "very low — coil flooded" },
            ]}
          />
        </Panel>
        <VerdictBanner status="bad" title="ALARM — stop the system, multiple severe alarms">
          Zero SH (slugging compressor), 44°F SC (extreme overcharge), 41°F condenser
          approach (approaching high-pressure cutout) are all simultaneously alarming.
          Compressor knocking confirms hydraulic events. Continued operation risks
          immediate compressor failure.
        </VerdictBanner>
        <FixCallout>
          Shut the system down immediately. Recover refrigerant to nameplate weight,
          inspect compressor for valve damage (oil sample, current draw test on restart),
          consider adding a suction accumulator if not present. Identify how the system
          became this severely overcharged — likely multiple service adds by gauge without
          weight reference.
        </FixCallout>
      </ServiceProblem>

      <ServiceProblem
        number={5}
        refrigerant="R-410A (fixed orifice)"
        title="Fixed-orifice system at 105°F outdoor — ACCA chart vs flags"
        scenario="R-410A fixed-orifice (piston) residential AC, hot 105°F outdoor day, indoor 75°F / 65°F WB. You're charging by SH per ACCA Manual T target — but the diagnostic shows additional flags. How to interpret?"
      >
        <Panel title="Measured" icon={Gauge}>
          <Gauges
            items={[
              { label: "Suction P", value: "115 PSIG", side: "low" },
              { label: "Suction line", value: "55°F", side: "low" },
              { label: "Discharge P", value: "440 PSIG", side: "high" },
              { label: "Liquid line", value: "108°F", side: "high" },
            ]}
          />
        </Panel>
        <Panel title="Derived" icon={Activity}>
          <Derived
            rows={[
              { formula: "SH = 55 − 39 = 16°F", verdict: "ok", note: "matches ACCA Manual T target ~17°F at 105°F DB / 65°F WB" },
              { formula: "SC = 120 − 108 = 12°F", verdict: "ok", note: "informational on FXO system" },
              { formula: "Cond approach = 120 − 105 = 15°F", verdict: "ok", note: "lower end of target" },
              { formula: "Evap approach = 75 − 39 = 36°F", verdict: "ok", note: "normal" },
            ]}
          />
        </Panel>
        <VerdictBanner status="ok" title="OK — properly charged fixed-orifice system at hot ambient">
          SH matches the ACCA Manual T target for the WB / DB combination, all four
          metrics in their respective ranges. The system is operating correctly despite
          the high ambient pressures (which would look concerning without context). This
          is why system type matters in the diagnostic — fixed-orifice systems at hot
          ambient run pressures that would flag as overcharge on a TXV system.
        </VerdictBanner>
      </ServiceProblem>

      <ServiceProblem
        number={6}
        refrigerant="R-454C (LT walk-in freezer)"
        title="Commercial LT — diagnostic at the low end of operating envelope"
        scenario="R-454C walk-in freezer LT (low-temp commercial), -20°F box target, 95°F ambient. You're checking diagnostic flags for a system the operator says is running but not maintaining box temp."
      >
        <Panel title="Measured" icon={Gauge}>
          <Gauges
            items={[
              { label: "Suction P", value: "7 PSIG", side: "low" },
              { label: "Suction line", value: "−5°F", side: "low" },
              { label: "Discharge P", value: "200 PSIG", side: "high" },
              { label: "Liquid line", value: "85°F", side: "high" },
            ]}
          />
        </Panel>
        <Panel title="Derived (R-454C zeotropic — dew for SH, bubble for SC)" icon={Activity}>
          <Derived
            rows={[
              { formula: "SH (dew) = −5 − (−20) = 15°F", verdict: "ok", note: "in 8-20°F LT range" },
              { formula: "SC (bubble) = 88 − 85 = 3°F", verdict: "warn", note: "below 5-15°F LT range" },
              { formula: "Cond approach = 88 − 95 = −7°F", verdict: "bad", note: "negative — impossible without low charge" },
              { formula: "Evap approach = box T (−10°F) − (−20°F) = 10°F", verdict: "ok", note: "in 10-20°F LT range" },
            ]}
          />
        </Panel>
        <VerdictBanner status="bad" title="CONCERN — low refrigerant charge on LT system">
          Low SC with negative condenser approach (condenser saturation BELOW ambient)
          indicates the condenser is not building a liquid column — system is undercharged.
          Even though SH looks normal, the high-side metrics fail. Negative condenser
          approach is only possible when there&apos;s essentially no liquid in the
          condenser to back up.
        </VerdictBanner>
        <FixCallout>
          Leak search on the LT system. For R-454C, use POE-compatible leak detection
          (UV dye is rated for POE oil). After repair, evacuate to 500 microns and charge
          R-454C by weight to nameplate. The R-454C bubble curve is approximately 14°F
          above the dew curve at the same pressure — confirm your service software uses
          the correct curves for the LT setpoint.
        </FixCallout>
      </ServiceProblem>

      <TechSection icon="book" tone="emerald" title="When to use this calculator vs the others">
        <ul>
          <li>
            <strong>System Pressure Diagnostic</strong> (this page) — full multi-input
            synthesis with approach temperatures and severity-ranked flags. Use when you
            have all six readings (ambient, return air, suction P+T, liquid P+T) and want
            the deepest available diagnostic.
          </li>
          <li>
            <strong>
              <a href="/pt-superheat-subcooling-calculator/" className="underline">Combined PT/SH/SC</a>
            </strong>{" "}
            — eight-pattern matrix view without approach temperatures. Use when you have
            the four pressure/temperature inputs but not ambient or return air.
          </li>
          <li>
            <strong>
              <a href="/superheat-calculator/" className="underline">Superheat Calculator</a>
            </strong>{" "}
            — focused suction-side. Quick charging of fixed-orifice or TXV verification.
          </li>
          <li>
            <strong>
              <a href="/subcooling-calculator/" className="underline">Subcooling Calculator</a>
            </strong>{" "}
            — focused liquid-side. TXV / EEV charging primary metric.
          </li>
          <li>
            <strong>
              <a href="/high-head-pressure-causes/" className="underline">High Head Pressure Causes</a>
            </strong>{" "}
            — narrative decision tree for the condenser-side fault path. Use as a
            human-readable companion to the diagnostic flag output.
          </li>
        </ul>
      </TechSection>

      <TechSection icon="source" tone="zinc" title="Primary sources behind the calculator and content">
        <ul>
          <li>
            <strong>CoolProp 7.2.0</strong> (Bell, Wronski, Quoilin, Lemort 2014,
            doi:10.1021/ie4033999) — REFPROP-compatible Helmholtz EOS for all saturation
            temperatures.
          </li>
          <li>
            <strong>ACCA Manual T &quot;Air-Side and Refrigerant-Side Diagnostics&quot;
            (2017)</strong> — multi-input diagnostic framework, target ranges by system
            type, severity ranking conventions.
          </li>
          <li>
            <strong>ASHRAE Handbook of Refrigeration 2022</strong> — Chapter 23 (service
            procedures), Chapter 39 (condensers, approach temperatures), Chapter 40
            (evaporators).
          </li>
          <li>
            <strong>ASHRAE HVAC Systems &amp; Equipment 2024</strong> — Chapter 43
            (chillers), water-cooled condenser approach targets.
          </li>
          <li>
            <strong>AHRI Standard 540-2020</strong> — compressor protection minimum
            return-gas superheat (20°F hermetic, 30°F semi-hermetic).
          </li>
          <li>
            <strong>EPA Section 608</strong> — refrigerant handling certification, leak
            repair requirements.
          </li>
          <li>
            <strong>OEM service literature</strong> — Carrier, Trane, Lennox, Daikin,
            Goodman, Mitsubishi service manuals; commercial refrigeration OEMs (Heatcraft,
            Hussmann, Bohn) for walk-in approach and SH / SC targets.
          </li>
        </ul>
      </TechSection>
    </>
  );
}

function ApproachVisual() {
  const W = 720;
  const H = 280;
  const PAD_L = 50;
  const PAD_R = 30;
  const PAD_T = 50;
  const PAD_B = 60;
  const PLOT_W = W - PAD_L - PAD_R;
  const PLOT_H = H - PAD_T - PAD_B;
  const yMin = 0, yMax = 60;
  const yScale = (v: number) => PAD_T + PLOT_H - ((v - yMin) / (yMax - yMin)) * PLOT_H;
  const zones: { from: number; to: number; fill: string; label: string }[] = [
    { from: 0, to: 15, fill: "#5a8a3a", label: "Low (look for undercharge)" },
    { from: 15, to: 25, fill: "#5a8a3a", label: "Normal — properly charged" },
    { from: 25, to: 35, fill: "#d49a2b", label: "Slightly elevated — investigate" },
    { from: 35, to: 45, fill: "#c45757", label: "High — fouling / overcharge" },
    { from: 45, to: 60, fill: "#7a3a3a", label: "ALARM — approaching cutout" },
  ];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Condenser approach temperature severity scale for residential AC."
      className="my-3 h-auto w-full text-zinc-700 dark:text-zinc-300"
      preserveAspectRatio="xMidYMid meet"
    >
      <text x={W / 2} y={24} textAnchor="middle" fontSize="14" fontWeight={600} fill="currentColor">
        Condenser approach severity (residential AC, °F above ambient)
      </text>
      {zones.map((z) => {
        const top = yScale(z.to);
        const bottom = yScale(z.from);
        return (
          <g key={z.from}>
            <rect x={PAD_L} y={top} width={PLOT_W} height={bottom - top} fill={z.fill} opacity={0.25} />
            <text x={PAD_L + PLOT_W / 2} y={(top + bottom) / 2 + 4} textAnchor="middle" fontSize="11" fontWeight={500} fill="currentColor">
              {z.label}
            </text>
          </g>
        );
      })}
      {[0, 10, 20, 30, 40, 50, 60].map((t) => (
        <g key={`tick-${t}`}>
          <line x1={PAD_L - 4} y1={yScale(t)} x2={PAD_L} y2={yScale(t)} stroke="currentColor" opacity={0.5} />
          <text x={PAD_L - 8} y={yScale(t) + 4} textAnchor="end" fontSize="10" fill="currentColor" opacity={0.7}>
            {t}°F
          </text>
        </g>
      ))}
      <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + PLOT_H} stroke="currentColor" opacity={0.6} />
      <text x={W / 2} y={H - 12} textAnchor="middle" fontSize="10" fill="currentColor" opacity={0.7}>
        Source: ASHRAE Handbook of Refrigeration 2022 Ch. 39, ACCA Manual T, Carrier / Trane service literature
      </text>
    </svg>
  );
}
