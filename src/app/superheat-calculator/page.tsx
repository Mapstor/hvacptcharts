import type { Metadata } from "next";
import { Activity, Calculator as CalcIcon, Gauge, Table as TableIcon, Thermometer } from "lucide-react";
import { refrigerants, getRefrigerant, getPressureAtTempF, satTemp } from "@/data/refrigerants";
import { CalculatorShell } from "@/components/calculators/shared/CalculatorShell";
import { SuperheatCalculator } from "@/components/calculators/SuperheatCalculator";
import { ChargingChartMatrix } from "@/components/calculators/ChargingChartMatrix";
import { TARGET_SUPERHEAT_LABEL } from "@/lib/target-superheat";
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
import { pageMetadata } from "@/lib/schema/shared";
import { MeasurementDiagram } from "@/components/diagrams/MeasurementDiagram";

const FAQS = [
  {
    q: "What is superheat?",
    a: "Superheat is the temperature of refrigerant vapor above its saturation temperature at the same pressure. On a working HVAC system, it's measured at the suction line near the compressor: actual suction-line temperature minus the saturation temperature corresponding to the suction-line pressure. Positive superheat means the refrigerant has fully boiled; zero or negative superheat means liquid is reaching the compressor — slugging, which damages valves and bearings.",
  },
  {
    q: "What is the target superheat for an HVAC system?",
    a: "Depends on the metering device. Fixed-orifice systems target a variable 5-25°F superheat read from a fixed-orifice charging chart indexed on indoor wet-bulb and outdoor dry-bulb temperatures (a field approximation of the OEM bead charts). TXV / EEV systems target a fixed 8-15°F superheat regardless of ambient (the valve regulates to its setpoint, typically 10°F). Walk-in coolers target 6-12°F; walk-in freezers 8-15°F; heat-pump heating mode 10-20°F. Always cross-check against the manufacturer's service literature for the specific equipment.",
  },
  {
    q: "How do I measure superheat in the field?",
    a: "Connect a manifold gauge to the suction service port and read the pressure in PSIG. Clamp a contact temperature probe on the suction line within 6 inches of the compressor inlet, insulate it from ambient air, and let the reading stabilize (10-20 minutes after start). Convert the suction pressure to saturation temperature using a PT chart for your refrigerant — use the dew curve for zeotropic blends. Subtract: superheat = T_line − T_sat. This calculator does the conversion and dew-curve selection automatically.",
  },
  {
    q: "What does low superheat indicate?",
    a: "Low superheat (under 5°F on most systems) usually means the system is overcharged, the metering device is flooding the evaporator (TXV stuck open, oversized orifice, missing distributor nozzle), or indoor airflow is too low to fully boil the refrigerant. Liquid refrigerant reaching the compressor — slugging — causes valve damage and bearing failure. Cross-check with subcooling and verify indoor airflow before adjusting charge.",
  },
  {
    q: "What does high superheat indicate?",
    a: "High superheat (over 25°F on most residential systems) usually means undercharge, a liquid-line restriction starving the evaporator, a TXV over-controlling or stuck partially closed, or low indoor load. Check subcooling first — low subcooling alongside high superheat strongly suggests undercharge. Verify indoor airflow and inspect the filter-drier (a partially clogged drier raises subcooling on the inlet side and superheat at the outlet) before adding refrigerant under EPA Section 608.",
  },
  {
    q: "Why does superheat math differ for zeotropic blends?",
    a: "Zeotropic blends (R-407C, R-454C, R-455A, R-448A, R-449A) condense and evaporate across a temperature range at constant pressure. On the suction line the refrigerant has already passed through evaporation — the relevant saturation boundary is the dew temperature, not the bubble temperature. This calculator uses the dew curve automatically for zeotropic blends. Using the bubble curve for R-407C would overstate superheat by approximately 11°F; for R-455A by approximately 22°F (bubble sits below dew at a given pressure, so subtracting it inflates the result).",
  },
  {
    q: "Is this the same as Total Superheat versus Evaporator Superheat?",
    a: "This calculator computes superheat at the measurement point — typically the suction line near the compressor, which is the 'Total Superheat' value most charging procedures reference. Evaporator Superheat (at the evaporator outlet, before line pickup) is 2-5°F higher than Total Superheat at the compressor. TXV setpoints control to Evaporator Superheat; fixed-orifice charging charts target Total Superheat. The distinction matters most on systems with long suction line sets exposed to warm spaces.",
  },
  {
    q: "Does this calculator work with R-1234yf and R-454B?",
    a: "Yes — R-1234yf (mobile AC) and R-454B (residential AC A2L replacement for R-410A) are both supported, along with the full 49 CoolProp-modeled refrigerants in the dataset. For R-454B (zeotropic, ~2°F glide) the calculator uses the dew curve automatically, though the glide is small enough that bubble vs dew rarely changes the SH reading by more than 2-3°F. R-1234yf is pure and uses a single saturation curve.",
  },
];

export const metadata: Metadata = pageMetadata({
  title: "Superheat Calculator: For Any Refrigerant (+ Target Chart)",
  description:
    "Free superheat calculator for 50+ refrigerants with dew-curve math for blends. Suction PSIG + line temp → superheat, fixed-orifice charging targets, diagnostics.",
  path: "/superheat-calculator/",
});

export default function SuperheatCalculatorPage() {
  return (
    <CalculatorShell
      schema={{
        path: "superheat-calculator",
        name: "Superheat Calculator",
        description:
          "Compute HVAC superheat from suction-line pressure and temperature for any of 50+ refrigerants. Correct dew-curve math for zeotropic blends. Diagnostic context, fixed-orifice charging-chart target table, and 10 worked service problems for residential AC, walk-in commercial refrigeration, heat pumps, and chillers.",
        featureList: [
          "Supports all 49 CoolProp-modeled refrigerants in the dataset",
          "Correct dew-curve math for zeotropic blends (R-407C, R-454C, R-455A, R-448A, R-449A)",
          "Imperial (°F, PSIG) and metric (°C, kPa) units",
          "Fixed-orifice charging-chart target superheat reference table",
          "10 worked service problems for residential, commercial, heat pump, chiller applications",
          "Inline diagnostic context for high/low/zero superheat patterns",
          "Mobile-friendly, no signup",
        ],
        breadcrumbLabel: "Superheat Calculator",
      }}
      introOneLiner="Enter your suction-line pressure and temperature for any refrigerant; get superheat plus diagnostic context. Correct dew-curve math for zeotropic blends so high-glide refrigerants (R-407C, R-454C, R-455A) don't read 11-22°F off."
      route="/superheat-calculator/"
      howToReadResults={[
        {
          output: "Superheat (°F or °C)",
          meaning:
            "How many degrees the suction-line vapor sits above its saturation temperature — the vapor margin that keeps liquid out of the compressor. Roughly 5–25°F covers most working systems (TXV/EEV target 8–15°F; fixed-orifice varies by charging chart); near-zero means little margin against flooding, and a value well above 25°F points to a starved evaporator (undercharge, restriction, or low airflow).",
        },
        {
          output: "Saturation temperature at suction pressure",
          meaning:
            "The temperature the entered suction pressure corresponds to on the PT chart — the baseline the superheat is measured from (superheat = line temp − this value). For zeotropic blends the tool reads the dew curve (labeled as such), which is the correct boundary for suction-line superheat; using the bubble curve would overstate superheat by the refrigerant's glide.",
        },
        {
          output: "Diagnostic banner",
          meaning:
            "Interprets the reading against generic thresholds: negative superheat means liquid is reaching the compressor (slugging — stop and investigate); under 5°F is very low margin (suspect overcharge, a stuck TXV, or low evaporator load); 5–25°F is within the typical operating range; above 25°F is high (suspect undercharge, an over-controlling TXV, an airflow problem, or a liquid-line restriction). Always confirm against the equipment's charging chart or manufacturer spec.",
        },
      ]}
      howTo={{
        steps: [
          "Pick the refrigerant in the system. Defaults to R-410A.",
          "Read the suction-line pressure from the low-side manifold gauge — most service gauges read PSIG by default.",
          "Measure the suction-line temperature with a contact or clamp-on probe within 6 inches of the compressor inlet. Insulate from ambient air and let the reading stabilize (10-20 min after compressor start).",
          "Enter both values. The calculator returns superheat in °F (or °C if you toggle the unit) plus a diagnostic banner.",
          "Compare against your equipment's target superheat (OEM charging chart, TXV spec, or the fixed-orifice charging-chart reference below).",
        ],
        commonErrors: [
          "Reading the discharge pressure instead of the suction pressure. The suction is the LOW side; discharge is the HIGH side.",
          "Probing the suction line without insulating — ambient air pulls the reading toward room temperature, inflating apparent superheat.",
          "On zeotropic blends, using the bubble pressure for saturation temperature — overstates superheat by the temperature glide (11°F for R-407C, 14°F for R-454C, 22°F for R-455A). This calculator does dew-curve math automatically.",
          "Forgetting that fixed-orifice and TXV systems have very different target ranges. A fixed-orifice system reading 10°F superheat on a 95°F day may actually be undercharged per the fixed-orifice charging chart.",
          "Reading SH before steady state. Allow 10-20 minutes after compressor start before the readings stabilize.",
        ],
      }}
      math={{
        formula:
          "Superheat (°F) = T_suction_line − T_sat(P_suction)\n\nT_sat is read off the DEW curve at the measured suction pressure for zeotropic blends. For pure refrigerants and azeotropes, bubble ≡ dew, so the curve choice is moot.",
        sourceCitation:
          "Saturation temperatures from CoolProp 7.2.0 (Bell, Wronski, Quoilin, Lemort 2014, doi:10.1021/ie4033999), REFPROP-compatible Helmholtz EOS. Fixed-orifice target superheat is a field approximation of the OEM charging charts (see California Title 24 Reference Appendix RA3.2, Table RA3.2-2); application target ranges from ASHRAE Handbook of Refrigeration 2022 (Chapter 1, 23) and equipment-specific manufacturer charging charts (Carrier, Trane, Lennox, Daikin, Goodman).",
        workedExample:
          "R-410A residential AC, 95°F outdoor, TXV metering:\n  Suction pressure (gauge): 130 PSIG\n  Suction-line temperature: 60°F\n  Saturation temperature at 130 PSIG: 45°F (CoolProp 7.2.0)\n  Superheat = 60 − 45 = 15°F\n\nWithin the typical 8-15°F TXV target range and comfortably above the slugging threshold. For a fixed-orifice system, cross-check against the fixed-orifice charging chart for the specific indoor wet-bulb / outdoor dry-bulb combination.",
      }}
      relatedTools={[
        { href: "/subcooling-calculator/", label: "Subcooling Calculator", blurb: "Companion to superheat on the liquid line. Together they pin down a system's charge state." },
        { href: "/pt-superheat-subcooling-calculator/", label: "Combined PT / SH / SC", blurb: "All three measurements on one form with pattern-matching diagnostic banner." },
        { href: "/pt-calculator/", label: "PT Calculator", blurb: "Raw saturation-pressure lookup for any refrigerant." },
        { href: "/system-pressure-diagnostic-calculator/", label: "System Diagnostic", blurb: "Pattern matcher for high/low pressure × high/low SH/SC fingerprints." },
        { href: "/target-superheat-chart/", label: "Target Superheat Chart", blurb: "Fixed-orifice target lookup by indoor WB × outdoor DB. Refrigerant-independent method." },
        { href: "/r410a-superheat-chart/", label: "R-410A Superheat Chart", blurb: "Target matrix + R-410A saturation quick table for fixed-orifice residential AC." },
        { href: "/r22-superheat-chart/", label: "R-22 Superheat Chart", blurb: "Target matrix + R-22 saturation quick table for legacy fixed-orifice service." },
        { href: "/high-suction-low-head-pressure/", label: "High Suction Low Head", blurb: "Diagnostic tree for the specific pattern where both pressures converge — internal leakage." },
        { href: "/ac-low-side-pressure-too-high/", label: "AC Low Side Pressure Too High", blurb: "Diagnostic tree for suction above normal. Overcharge is the most common cause." },
        { href: "/low-suction-pressure/", label: "Low Suction Pressure", blurb: "Broad diagnostic tree for suction below normal — undercharge, restriction, or airflow." },
        { href: "/ac-compressor-short-cycling/", label: "AC Compressor Short Cycling", blurb: "Cycling patterns and their root causes on residential and automotive systems." },
        { href: "/refrigerant/r-410a/", label: "R-410A reference", blurb: "Full PT chart, operating pressures, and lubricant guidance for the dominant residential AC refrigerant." },
      ]}
      faqs={FAQS}
      bodySections={
        <>
          <MeasurementDiagram variant="superheat" />
          <RichContent />
        </>
      }
    >
      <SuperheatCalculator />
    </CalculatorShell>
  );
}

/* ──────────────────────── Body content ──────────────────────── */

function RichContent() {
  // ── Worked-example saturation temps, superheat, and subcooling ──
  // Every value below is computed from the dataset via satTemp(). SUPERHEAT is
  // read on the DEW curve (suction/vapor side); SUBCOOLING on the BUBBLE curve
  // (liquid side). No saturation temperature is hand-typed.
  // Example 1 — R-410A fixed orifice
  const ex1Sat = satTemp("r-410a", 120, "dew")!;
  const ex1SH = 56 - ex1Sat;
  // Example 2 — R-410A TXV (commissioned)
  const ex2SucSat = satTemp("r-410a", 130, "dew")!;
  const ex2DisSat = satTemp("r-410a", 380, "bubble")!;
  const ex2SH = 60 - ex2SucSat;
  const ex2SC = ex2DisSat - 100;
  // Example 3 — R-410A high superheat
  const ex3SucSat = satTemp("r-410a", 110, "dew")!;
  const ex3DisSat = satTemp("r-410a", 340, "bubble")!;
  const ex3SH = 75 - ex3SucSat;
  const ex3SC = ex3DisSat - 108;
  // Example 4 — R-410A low superheat
  const ex4SucSat = satTemp("r-410a", 155, "dew")!;
  const ex4DisSat = satTemp("r-410a", 460, "bubble")!;
  const ex4SH = 55 - ex4SucSat;
  const ex4SC = ex4DisSat - 92;
  // Example 5 — R-22 slugging
  const ex5SucSat = satTemp("r-22", 80, "dew")!;
  const ex5DisSat = satTemp("r-22", 245, "bubble")!;
  const ex5SH = 48 - ex5SucSat;
  const ex5SC = ex5DisSat - 75;
  // Example 6 — R-407C (dew correct vs bubble wrong)
  const ex6Dew = satTemp("r-407c", 30, "dew")!;
  const ex6Bubble = satTemp("r-407c", 30, "bubble")!;
  const ex6SHdew = 35 - ex6Dew;
  const ex6SHbubble = 35 - ex6Bubble;
  const ex6Glide = ex6Dew - ex6Bubble;
  // Example 7 — R-454C (dew correct vs bubble wrong)
  const ex7Dew = satTemp("r-454c", 5, "dew")!;
  const ex7Bubble = satTemp("r-454c", 5, "bubble")!;
  const ex7SHdew = 0 - ex7Dew;
  const ex7SHbubble = 0 - ex7Bubble;
  const ex7Glide = ex7Dew - ex7Bubble;
  // Example 8 — R-410A heat pump, heating mode
  const ex8Sat = satTemp("r-410a", 80, "dew")!;
  const ex8SH = 30 - ex8Sat;
  const ex8Depression = 35 - ex8Sat;
  // Example 9 — R-134a centrifugal chiller
  const ex9Sat = satTemp("r-134a", 38, "dew")!;
  const ex9SH = 50 - ex9Sat;
  const ex9Approach = 45 - ex9Sat;

  return (
    <>
      <TechSection icon="thermometer" tone="blue" title="What superheat is and why we measure it">
        <p>
          Superheat is the temperature of refrigerant vapor above its saturation temperature
          at the same pressure. At any pressure, the saturation temperature is the boundary
          where liquid and vapor coexist; once the refrigerant has fully boiled, every degree
          above that saturation reading is one degree of superheat.
        </p>
        <p>
          On a working HVAC system, suction-line superheat serves two simultaneous purposes.
          First, it protects the compressor: positive superheat guarantees no liquid is
          reaching the suction crankcase (liquid refrigerant in the cylinder is essentially
          incompressible — &quot;slugging&quot; damages valves, bearings, and rotors).
          Second, it tells you whether the evaporator is being fed correctly — too little
          superheat means liquid is leaving the evaporator unboiled (wasted capacity); too
          much means the evaporator is starved.
        </p>
        <SuctionMeasurementDiagram />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Schematic of a residential split-system suction line, showing where the
          thermocouple should clamp (within 6 inches of the compressor inlet, insulated from
          ambient) and where the suction pressure is read at the manifold service port.
          Source: Carrier / Trane / Lennox residential service literature.
        </p>
        <KeyInsight tone="emerald" icon="insight" title="Superheat answers a single question">
          How much vapor margin do you have above saturation? Positive margin = safe for the
          compressor and the evaporator&apos;s capacity is mostly used; near-zero margin =
          slugging risk; very high margin = the evaporator is starved.
        </KeyInsight>
      </TechSection>

      <TechSection
        icon="composition"
        tone="purple"
        title="Two metering devices, two different questions"
      >
        <p>
          What you do with a superheat reading depends entirely on whether the system uses a
          fixed-orifice metering device (piston, capillary tube, accurator) or a thermostatic
          expansion valve (TXV / EEV). Different devices, different procedures.
        </p>
        <Panel title="Fixed-orifice vs TXV vs EEV" icon={TableIcon}>
          <ComparisonTable
            headers={["Metering device", "Charge by", "Verify by", "Typical SH"]}
            rows={[
              {
                label: "Fixed orifice (piston, captube)",
                cells: ["Superheat (target from chart)", "Match fixed-orifice chart target", "5-25°F (variable)"],
              },
              {
                label: "TXV (thermostatic expansion valve)",
                cells: ["Subcooling (charge to SC target)", "Steady SH at TXV setpoint", "8-15°F (regulated)"],
              },
              {
                label: "EEV (electronic expansion valve)",
                cells: ["Subcooling", "EEV control board diagnostic", "5-15°F (regulated)"],
              },
            ]}
          />
        </Panel>
        <p>
          Fixed-orifice devices have no feedback control — superheat varies with charge,
          ambient, and indoor load. Charging a fixed-orifice system means adjusting
          refrigerant mass until superheat lands on the fixed-orifice charging-chart target value for the
          current indoor wet bulb / outdoor dry bulb conditions. TXV and EEV systems have a
          sensing element that modulates flow to maintain a fixed superheat setpoint
          (typically 10°F at the bulb).
        </p>
        <p>
          On TXV / EEV systems, charge is set by subcooling instead. Superheat measurement
          on these systems verifies the valve is operating in its target range; it does not
          determine charge directly. A TXV system reading 30°F superheat usually points to a
          stuck-closed valve or restriction, not undercharge (cross-check subcooling).
        </p>
      </TechSection>

      <TechSection icon="data" tone="emerald" title="Target superheat reference — fixed-orifice charging charts and OEM service literature">
        <p>
          The fixed-orifice charging chart targets superheat
          based on the indoor wet-bulb temperature entering the evaporator coil and the
          outdoor dry-bulb temperature at the condenser. Higher indoor WB and lower outdoor
          DB both raise the target. The interactive matrix below computes the target from a
          field-approximation formula; the chart or label on the specific unit always takes
          precedence.
        </p>
        <ChargingChartMatrix label="target superheat" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {TARGET_SUPERHEAT_LABEL}
        </p>
        <Panel title="Target superheat by application (OEM + ASHRAE)" icon={TableIcon}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-[10px] uppercase tracking-wider text-zinc-500 dark:border-zinc-800">
                  <th className="py-1.5 text-left">Application</th>
                  <th className="py-1.5 text-right">Target SH</th>
                  <th className="py-1.5 text-left">Source</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5">Residential AC, TXV / EEV</td><td className="py-1.5 text-right font-mono tabular-nums">8-15°F</td><td className="py-1.5 text-xs">Carrier, Trane, Lennox, Daikin OEM literature</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5">Residential AC, fixed orifice</td><td className="py-1.5 text-right font-mono tabular-nums">per chart</td><td className="py-1.5 text-xs">fixed-orifice charging charts</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5">Walk-in cooler (MT), TXV</td><td className="py-1.5 text-right font-mono tabular-nums">6-12°F</td><td className="py-1.5 text-xs">ASHRAE Handbook of Refrigeration 2022 Ch. 23</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5">Walk-in freezer (LT), TXV</td><td className="py-1.5 text-right font-mono tabular-nums">8-15°F</td><td className="py-1.5 text-xs">ASHRAE Handbook of Refrigeration 2022 Ch. 23</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5">Heat pump, heating mode</td><td className="py-1.5 text-right font-mono tabular-nums">10-20°F</td><td className="py-1.5 text-xs">Carrier / Trane heat-pump service procedures</td></tr>
                <tr><td className="py-1.5">Centrifugal chiller at evap</td><td className="py-1.5 text-right font-mono tabular-nums">2-5°F</td><td className="py-1.5 text-xs">ASHRAE HVAC Systems &amp; Equipment 2024 Ch. 43</td></tr>
              </tbody>
            </table>
          </div>
        </Panel>
        <TargetSHBars />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Target superheat ranges across HVAC applications. Service-line targets are read at
          the suction line near the compressor; suction-line pickup adds further superheat
          between the line probe and the compressor crankcase.
        </p>
      </TechSection>

      <TechSection icon="service" tone="amber" title="Real service problems solved with the superheat measurement">
        <p>
          Ten field scenarios spanning residential AC charging (fixed-orifice and TXV),
          walk-in commercial refrigeration with wide-glide zeotropic blends, heat pump
          heating mode, and slugging-risk pattern recognition. Each shows what gets measured,
          the PT chart lookup that converts suction pressure to saturation temperature, the
          superheat derivation, and a verdict on what to do.
        </p>
      </TechSection>

      <ServiceProblem
        number={1}
        refrigerant="R-410A (fixed orifice)"
        title="Charging a new R-410A residential AC by superheat target"
        scenario="Brand-new R-410A residential AC, piston metering device, 95°F outdoor dry bulb, 63°F indoor wet bulb (75°F return air, 50% RH). You need to set the charge by superheat per the manufacturer's charging instructions, cross-checked against the fixed-orifice charging chart."
      >
        <Panel title="Measured at the manifold" icon={Gauge}>
          <Gauges
            items={[
              { label: "Suction P", value: "120 PSIG", side: "low" },
              { label: "Suction line", value: "56°F", side: "low" },
              { label: "Outdoor DB", value: "95°F", side: "high" },
              { label: "Indoor WB", value: "63°F" },
            ]}
          />
        </Panel>
        <Panel title="PT chart lookup (R-410A)" icon={CalcIcon}>
          <Lookups
            rows={[
              { input: "120 PSIG", output: `${ex1Sat.toFixed(1)}°F sat`, note: "evaporator saturation" },
            ]}
          />
        </Panel>
        <Panel title="Derived" icon={Activity}>
          <Derived
            rows={[
              { formula: `Superheat = 56°F − ${ex1Sat.toFixed(1)}°F = ${ex1SH.toFixed(1)}°F`, verdict: "warn", note: "actual measured value" },
              { formula: "target superheat at 63°F WB / 95°F DB ≈ 7°F", verdict: "info", note: "fixed-orifice charging-chart target" },
            ]}
          />
        </Panel>
        <VerdictBanner status="warn" title="Undercharged — add refrigerant to lower superheat">
          Measured SH is {ex1SH.toFixed(1)}°F vs the fixed-orifice charging-chart target of approximately 7°F
          at this WB / DB combination. Superheat above target means the evaporator is starved;
          the system is undercharged, and adding refrigerant will reduce superheat toward the
          target.
        </VerdictBanner>
        <FixCallout>
          Add refrigerant in 2-4 oz increments using a scale, allowing 10-15 minutes for
          steady state between additions. Stop when SH = 7°F (±2°F tolerance). Confirm
          subcooling lands in the 8-12°F range as a sanity check on the final charge.
        </FixCallout>
      </ServiceProblem>

      <ServiceProblem
        number={2}
        refrigerant="R-410A (TXV)"
        title="Verifying TXV operation on a commissioned R-410A system"
        scenario="R-410A TXV-equipped residential AC, just commissioned. Charge was set by subcooling (10°F target). You want to verify the TXV is regulating superheat correctly before signing off."
      >
        <Panel title="Measured at the manifold" icon={Gauge}>
          <Gauges
            items={[
              { label: "Suction P", value: "130 PSIG", side: "low" },
              { label: "Suction line", value: "60°F", side: "low" },
              { label: "Discharge P", value: "380 PSIG", side: "high" },
              { label: "Liquid line", value: "100°F", side: "high" },
            ]}
          />
        </Panel>
        <Panel title="PT chart lookup (R-410A)" icon={CalcIcon}>
          <Lookups
            rows={[
              { input: "130 PSIG", output: `${ex2SucSat.toFixed(1)}°F sat`, note: "evaporator saturation" },
              { input: "380 PSIG", output: `${ex2DisSat.toFixed(1)}°F sat`, note: "condenser saturation (for SC cross-check)" },
            ]}
          />
        </Panel>
        <Panel title="Derived" icon={Activity}>
          <Derived
            rows={[
              { formula: `Superheat = 60°F − ${ex2SucSat.toFixed(1)}°F = ${ex2SH.toFixed(1)}°F`, verdict: "ok", note: "TXV target 8-15°F" },
              { formula: `Subcooling = ${ex2DisSat.toFixed(1)}°F − 100°F = ${ex2SC.toFixed(1)}°F`, verdict: "ok", note: "target 8-12°F (sanity check)" },
            ]}
          />
        </Panel>
        <VerdictBanner status="ok" title="TXV operating in target range">
          Superheat ({ex2SH.toFixed(1)}°F) sits inside the 8-15°F TXV target window and subcooling
          ({ex2SC.toFixed(1)}°F, right at the top of the 8-12°F range) confirms the charge is correct.
          The valve is regulating properly. No further service action.
        </VerdictBanner>
      </ServiceProblem>

      <ServiceProblem
        number={3}
        refrigerant="R-410A (TXV)"
        title="High superheat — diagnosing undercharge vs restriction"
        scenario="Same R-410A TXV system, two months later. Customer reports poor cooling on a 95°F day. Suction pressure looks low and the suction line feels warmer than expected."
      >
        <Panel title="Measured" icon={Gauge}>
          <Gauges
            items={[
              { label: "Suction P", value: "110 PSIG", side: "low" },
              { label: "Suction line", value: "75°F", side: "low" },
              { label: "Discharge P", value: "340 PSIG", side: "high" },
              { label: "Liquid line", value: "108°F", side: "high" },
            ]}
          />
        </Panel>
        <Panel title="PT chart lookup (R-410A)" icon={CalcIcon}>
          <Lookups
            rows={[
              { input: "110 PSIG", output: `${ex3SucSat.toFixed(1)}°F sat`, note: "evap saturation (low for 95°F day)" },
              { input: "340 PSIG", output: `${ex3DisSat.toFixed(1)}°F sat`, note: "cond saturation" },
            ]}
          />
        </Panel>
        <Panel title="Derived" icon={Activity}>
          <Derived
            rows={[
              { formula: `Superheat = 75°F − ${ex3SucSat.toFixed(1)}°F = ${ex3SH.toFixed(1)}°F`, verdict: "bad", note: "very high — should be 8-15°F" },
              { formula: `Subcooling = ${ex3DisSat.toFixed(1)}°F − 108°F = ${ex3SC.toFixed(1)}°F`, verdict: "bad", note: "negative — confirms undercharge" },
            ]}
          />
        </Panel>
        <VerdictBanner status="bad" title="Undercharge — leak somewhere in the system">
          High superheat with negative subcooling is the textbook undercharge fingerprint:
          the evaporator is starved (high SH) and the condenser is not maintaining a
          subcooled liquid column (negative SC, flash gas reaching the metering device). Two
          months from commissioning suggests a slow leak.
        </VerdictBanner>
        <FixCallout>
          Find and repair the leak per EPA Section 608 before adding refrigerant. After
          repair, evacuate to 500 microns and charge by weight to nameplate using a
          recovery / charging scale. Re-test SH and SC at steady state.
        </FixCallout>
      </ServiceProblem>

      <ServiceProblem
        number={4}
        refrigerant="R-410A (TXV)"
        title="Low superheat — overcharge or TXV flooding the evaporator"
        scenario="R-410A TXV system after a service add by a previous tech. The compressor is running noticeably louder than normal and you suspect liquid floodback."
      >
        <Panel title="Measured" icon={Gauge}>
          <Gauges
            items={[
              { label: "Suction P", value: "155 PSIG", side: "low" },
              { label: "Suction line", value: "55°F", side: "low" },
              { label: "Discharge P", value: "460 PSIG", side: "high" },
              { label: "Liquid line", value: "92°F", side: "high" },
            ]}
          />
        </Panel>
        <Panel title="PT chart lookup (R-410A)" icon={CalcIcon}>
          <Lookups
            rows={[
              { input: "155 PSIG", output: `${ex4SucSat.toFixed(1)}°F sat`, note: "evap saturation (high for cooling)" },
              { input: "460 PSIG", output: `${ex4DisSat.toFixed(1)}°F sat`, note: "cond saturation (very high)" },
            ]}
          />
        </Panel>
        <Panel title="Derived" icon={Activity}>
          <Derived
            rows={[
              { formula: `Superheat = 55°F − ${ex4SucSat.toFixed(1)}°F = ${ex4SH.toFixed(1)}°F`, verdict: "bad", note: "near zero — slugging risk" },
              { formula: `Subcooling = ${ex4DisSat.toFixed(1)}°F − 92°F = ${ex4SC.toFixed(1)}°F`, verdict: "bad", note: "very high — overcharge" },
            ]}
          />
        </Panel>
        <VerdictBanner status="bad" title="Overcharge — recover refrigerant immediately">
          Near-zero superheat with {ex4SC.toFixed(1)}°F subcooling is the classic overcharge fingerprint:
          excess refrigerant backs up in the condenser (high SC) and saturated liquid is
          reaching the compressor (near-zero SH). Continued operation risks valve damage or
          hydraulic lock; the compressor noise is the warning sign.
        </VerdictBanner>
        <FixCallout>
          Recover refrigerant in 1 oz increments using a recovery / charging scale. Re-test
          SH and SC after each step. Stop when SH = 8-15°F and SC = 8-12°F. If SH remains low
          after charge is correct, suspect TXV stuck open or sensing-bulb failure.
        </FixCallout>
      </ServiceProblem>

      <ServiceProblem
        number={5}
        refrigerant="R-22 (TXV)"
        title="Zero superheat — emergency slugging shutdown"
        scenario="Legacy R-22 split system reported as 'making knocking noise'. You arrive on-site, hook up gauges, and find concerning numbers. The compressor sound is consistent with hydraulic events."
      >
        <Panel title="Measured" icon={Gauge}>
          <Gauges
            items={[
              { label: "Suction P", value: "80 PSIG", side: "low" },
              { label: "Suction line", value: "48°F", side: "low" },
              { label: "Discharge P", value: "245 PSIG", side: "high" },
              { label: "Liquid line", value: "75°F", side: "high" },
            ]}
          />
        </Panel>
        <Panel title="PT chart lookup (R-22)" icon={CalcIcon}>
          <Lookups
            rows={[
              { input: "80 PSIG", output: `${ex5SucSat.toFixed(1)}°F sat`, note: "evaporator saturation" },
              { input: "245 PSIG", output: `${ex5DisSat.toFixed(1)}°F sat`, note: "condenser saturation" },
            ]}
          />
        </Panel>
        <Panel title="Derived" icon={Activity}>
          <Derived
            rows={[
              { formula: `Superheat = 48°F − ${ex5SucSat.toFixed(1)}°F = ${ex5SH.toFixed(1)}°F`, verdict: "bad", note: "essentially zero — saturated mixture in suction" },
              { formula: `Subcooling = ${ex5DisSat.toFixed(1)}°F − 75°F = ${ex5SC.toFixed(1)}°F`, verdict: "bad", note: "extreme — confirms overcharge" },
            ]}
          />
        </Panel>
        <VerdictBanner status="bad" title="Imminent compressor damage — shut system down">
          Near-zero superheat ({ex5SH.toFixed(1)}°F) means the suction line carries an essentially
          saturated liquid-vapor mixture; the compressor is actively slugging. Combined with
          {" "}{ex5SC.toFixed(1)}°F subcooling (severe overcharge)
          this is an emergency: every minute of run-time is breaking valves and crankshaft
          bearings.
        </VerdictBanner>
        <FixCallout>
          Shut the system down immediately. Recover refrigerant down to nameplate weight,
          inspect compressor for damage (oil analysis, crankcase oil sample), and consider
          adding a suction-line accumulator if not present. Verify TXV operation and indoor
          airflow before restarting. For R-22 service: the supply chain is past-tense — plan
          for retrofit (R-407C, R-422D) or full equipment replacement.
        </FixCallout>
      </ServiceProblem>

      <ServiceProblem
        number={6}
        refrigerant="R-407C (zeotropic, ~11°F glide)"
        title="R-407C medium-temp commercial — why curve selection matters"
        scenario="R-407C retrofit on a medium-temp commercial unit (reach-in deli case), 25°F evaporator target. R-407C is zeotropic with ~11°F glide, so the bubble vs dew distinction is significant for superheat calculation."
      >
        <Panel title="Measured" icon={Gauge}>
          <Gauges
            items={[
              { label: "Suction P", value: "30 PSIG", side: "low" },
              { label: "Suction line", value: "35°F", side: "low" },
            ]}
          />
        </Panel>
        <Panel title="PT chart lookup (R-407C — dual curves)" icon={CalcIcon}>
          <Lookups
            rows={[
              { input: "30 PSIG dew", output: `${ex6Dew.toFixed(1)}°F sat`, note: "USE THIS — evap outlet saturation" },
              { input: "30 PSIG bubble", output: `${ex6Bubble.toFixed(1)}°F sat`, note: "evap inlet — wrong for SH" },
            ]}
          />
        </Panel>
        <Panel title="Derived (correct vs wrong-curve)" icon={Activity}>
          <Derived
            rows={[
              { formula: `Superheat (dew, correct) = 35°F − ${ex6Dew.toFixed(1)}°F = ${ex6SHdew.toFixed(1)}°F`, verdict: "warn", note: "above 6-12°F MT target — evaporator starved" },
              { formula: `Superheat (bubble, wrong) = 35°F − ${ex6Bubble.toFixed(1)}°F = ${ex6SHbubble.toFixed(1)}°F`, verdict: "bad", note: `overstates SH by the ${ex6Glide.toFixed(1)}°F glide` },
            ]}
          />
        </Panel>
        <VerdictBanner status="warn" title="High superheat — evaporator starved, verify charge and airflow">
          Using the dew curve (the correct curve for suction-line superheat on zeotropic
          blends) gives SH = {ex6SHdew.toFixed(1)}°F, well above the 6-12°F MT walk-in target —
          the evaporator is starved, so check charge, TXV feed, and evaporator airflow. Using the
          bubble curve would have shown SH = {ex6SHbubble.toFixed(1)}°F, overstating superheat by
          the {ex6Glide.toFixed(1)}°F glide and pushing you to over-add refrigerant.
        </VerdictBanner>
        <FixCallout>
          For zeotropic blends (R-407C, R-454C, R-455A, R-448A, R-449A), always confirm your
          PT chart software is using the dew curve at suction pressure. This calculator does
          it automatically. The glide-aware curve selection diagram below illustrates the
          principle.
        </FixCallout>
      </ServiceProblem>

      <ServiceProblem
        number={7}
        refrigerant="R-454C (zeotropic, ~14°F glide)"
        title="R-454C low-temp walk-in freezer superheat charging"
        scenario="R-454C walk-in freezer (low-temp commercial), -20°F target evaporator temperature, 95°F ambient. R-454C is a wide-glide zeotropic blend used as a low-GWP replacement for R-404A in commercial refrigeration."
      >
        <Panel title="Measured" icon={Gauge}>
          <Gauges
            items={[
              { label: "Suction P", value: "5 PSIG", side: "low" },
              { label: "Suction line", value: "0°F", side: "low" },
              { label: "Ambient", value: "95°F", side: "high" },
              { label: "Box temp", value: "−10°F" },
            ]}
          />
        </Panel>
        <Panel title="PT chart lookup (R-454C — dual curves)" icon={CalcIcon}>
          <Lookups
            rows={[
              { input: "5 PSIG dew", output: `${ex7Dew.toFixed(1)}°F sat`, note: "USE THIS — evap outlet saturation" },
              { input: "5 PSIG bubble", output: `${ex7Bubble.toFixed(1)}°F sat`, note: "evap inlet — wrong for SH" },
            ]}
          />
        </Panel>
        <Panel title="Derived" icon={Activity}>
          <Derived
            rows={[
              { formula: `Superheat (dew, correct) = 0°F − (${ex7Dew.toFixed(1)}°F) = ${ex7SHdew.toFixed(1)}°F`, verdict: "warn", note: "above LT 8-15°F target" },
              { formula: `Wrong-curve error = ${ex7Glide.toFixed(1)}°F = R-454C glide`, verdict: "info", note: `bubble curve would show SH = ${ex7SHbubble.toFixed(1)}°F` },
            ]}
          />
        </Panel>
        <VerdictBanner status="warn" title="Superheat high — likely undercharge or TXV throttling">
          {ex7SHdew.toFixed(1)}°F SH using the correct dew curve is above the 8-15°F LT target. Either the
          system is slightly undercharged, the TXV is slightly over-controlling, or the
          evaporator coil has reduced airflow. Cross-check subcooling and look for frost
          patterns on the evaporator before charging.
        </VerdictBanner>
        <FixCallout>
          For R-454C LT systems, verify TXV is rated for LT service and the sensing bulb is
          properly insulated on the suction line. Glide-related stratification in the
          evaporator can shift TXV control behavior compared to R-404A, even though the
          target SH range is similar.
        </FixCallout>
      </ServiceProblem>

      <ServiceProblem
        number={8}
        refrigerant="R-410A (heat pump, heating mode)"
        title="R-410A heat pump superheat at 35°F outdoor heating mode"
        scenario="R-410A residential air-source heat pump in heating mode. 35°F outdoor (outdoor coil is now the evaporator), 70°F indoor return air (indoor coil is the condenser). Customer report of weak warm air — you're checking if the system is operating correctly."
      >
        <Panel title="Measured" icon={Gauge}>
          <Gauges
            items={[
              { label: "Suction P", value: "80 PSIG", side: "low" },
              { label: "Suction line", value: "30°F", side: "low" },
              { label: "Outdoor", value: "35°F", side: "low" },
              { label: "Indoor return", value: "70°F", side: "high" },
            ]}
          />
        </Panel>
        <Panel title="PT chart lookup (R-410A)" icon={CalcIcon}>
          <Lookups
            rows={[
              { input: "80 PSIG", output: `${ex8Sat.toFixed(1)}°F sat`, note: "outdoor coil — now the evaporator" },
            ]}
          />
        </Panel>
        <Panel title="Derived" icon={Activity}>
          <Derived
            rows={[
              { formula: `Superheat = 30°F − ${ex8Sat.toFixed(1)}°F = ${ex8SH.toFixed(1)}°F`, verdict: "ok", note: "just below heating-mode 10-20°F target" },
              { formula: `Outdoor coil = 35°F − ${ex8Sat.toFixed(1)}°F = ${ex8Depression.toFixed(1)}°F below ambient`, verdict: "ok", note: "normal heating-mode evap depression" },
            ]}
          />
        </Panel>
        <VerdictBanner status="ok" title="TXV operating correctly in heating mode">
          {ex8SH.toFixed(1)}°F superheat sits just below the heating-mode 10-20°F target range; the
          TXV is regulating. Outdoor coil saturation at {ex8Sat.toFixed(1)}°F is {ex8Depression.toFixed(1)}°F below ambient — normal
          for heating mode where the evaporator must run below ambient to absorb heat from
          cold outdoor air.
        </VerdictBanner>
        <FixCallout>
          If the customer reports weak heating despite normal SH, the issue is likely
          elsewhere: low refrigerant charge (cross-check SC), defrost cycle malfunction
          (frost blocking outdoor coil airflow), auxiliary heat strip not engaging, or
          improperly sized equipment for the climate. Verify auxiliary heat operation in
          cold weather.
        </FixCallout>
      </ServiceProblem>

      <ServiceProblem
        number={9}
        refrigerant="R-134a (centrifugal chiller)"
        title="R-134a centrifugal chiller — very low superheat targets (2–5°F)"
        scenario="Water-cooled R-134a centrifugal chiller, 45°F leaving chilled water, 85°F entering condenser water. You measure suction and want to verify the evaporator is operating correctly. Chillers are different from residential AC — much lower SH targets."
      >
        <Panel title="Measured" icon={Gauge}>
          <Gauges
            items={[
              { label: "Suction P", value: "38 PSIG", side: "low" },
              { label: "Suction line", value: "50°F", side: "low" },
              { label: "Leaving CHW", value: "45°F" },
              { label: "Entering CW", value: "85°F", side: "high" },
            ]}
          />
        </Panel>
        <Panel title="PT chart lookup (R-134a)" icon={CalcIcon}>
          <Lookups
            rows={[
              { input: "38 PSIG", output: `${ex9Sat.toFixed(1)}°F sat`, note: "evaporator saturation" },
            ]}
          />
        </Panel>
        <Panel title="Derived" icon={Activity}>
          <Derived
            rows={[
              { formula: `Superheat = 50°F − ${ex9Sat.toFixed(1)}°F = ${ex9SH.toFixed(1)}°F`, verdict: "warn", note: "above chiller 2-5°F target" },
              { formula: `Evap approach = 45°F − ${ex9Sat.toFixed(1)}°F = ${ex9Approach.toFixed(1)}°F`, verdict: "ok", note: "good chiller approach (refrigerant below CHW)" },
            ]}
          />
        </Panel>
        <VerdictBanner status="warn" title="Superheat above chiller target — verify evaporator refrigerant level">
          {ex9SH.toFixed(1)}°F superheat is above the centrifugal chiller 2-5°F target. Chillers
          deliberately run very low SH: the flooded evaporator design maximizes heat transfer by
          submerging tubes in liquid refrigerant, and an eliminator section + accumulator prevents
          liquid carryover to the compressor. Superheat this high suggests the evaporator refrigerant
          level or float/level control is slightly low — the tight {ex9Approach.toFixed(1)}°F approach
          confirms the heat exchanger itself is clean, so investigate charge and level control rather
          than fouling.
        </VerdictBanner>
      </ServiceProblem>

      <ServiceProblem
        number={10}
        refrigerant="R-32 / R-454B (A2L)"
        title="R-32 vs R-454B superheat targets — same as R-410A?"
        scenario="New installation choosing between R-32 (pure) and R-454B (zeotropic ~2°F glide) for residential AC. Field tech asks: do these A2L refrigerants need different superheat targets than R-410A?"
      >
        <Panel title="Target SH comparison" icon={TableIcon}>
          <ComparisonTable
            headers={["Refrigerant", "Glide", "TXV target SH", "Fixed-orifice approach"]}
            rows={[
              { label: "R-410A", cells: ["~0°F (near-az)", "8-15°F", "fixed-orifice chart target"] },
              { label: "R-32 (pure)", cells: ["0°F", "8-15°F", "fixed-orifice chart target"] },
              { label: "R-454B (zeotropic)", cells: ["~2°F", "8-15°F (dew curve)", "fixed-orifice chart target"] },
            ]}
          />
        </Panel>
        <VerdictBanner status="info" title="Same target ranges, dew-curve math for R-454B">
          R-32 and R-454B both use the same 8-15°F TXV target as R-410A — OEMs (Carrier,
          Trane, Daikin, Mitsubishi) specify nearly identical service procedures. R-454B&apos;s
          2°F glide is small enough that bubble vs dew rarely matters at residential
          operating pressures, but use the dew curve to be exact. This calculator handles
          R-454B&apos;s dew curve automatically.
        </VerdictBanner>
        <FixCallout>
          For A2L-rated equipment (R-32, R-454B), follow IEC 60335-2-40 charge limit
          requirements based on room floor area and refrigerant flammability classification.
          Recovery and service equipment must be A2L-rated; service tools that handle R-410A
          are typically rated for these A2Ls as well, but verify before use.
        </FixCallout>
      </ServiceProblem>

      <TechSection icon="glide" tone="purple" title="Glide-aware curve selection — why dew is the right curve for superheat">
        <p>
          Zeotropic blends boil across a temperature range at constant pressure. As liquid
          refrigerant enters the evaporator (bubble point) and progresses to fully vaporized
          (dew point), the saturation temperature rises by the glide value — even though the
          pressure is unchanged.
        </p>
        <p>
          Suction-line superheat is measured downstream of the evaporator, where refrigerant
          is fully vaporized. The relevant saturation reference is the dew point: the
          temperature at which the last drop of liquid disappeared. Using the bubble point
          would treat the entry-side saturation as if it were the exit-side reference,
          overstating superheat by the glide value (bubble sits below dew, so subtracting
          it inflates the result).
        </p>
        <GlideCurveSelector />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          R-407C bubble and dew saturation curves over the service range, showing the
          consistent 11°F glide between the two. Use the dew curve at suction pressure for
          superheat (suction line); use the bubble curve at discharge pressure for
          subcooling (liquid line). Source: CoolProp 7.2.0 saturation data for R-407C.
        </p>
        <p>
          Glide values across common HVAC blends: R-454B ≈ 2°F, R-448A ≈ 6°F, R-449A ≈ 6°F,
          R-407C ≈ 11°F, R-454C ≈ 14°F, R-455A ≈ 22°F. Wrong-curve selection on R-455A
          would shift superheat by 22°F — easily enough to invalidate a charging decision
          or trigger an unnecessary compressor protection shutdown.
        </p>
      </TechSection>

      <TechSection icon="warning" tone="amber" title="Six common superheat measurement mistakes">
        <ol>
          <li>
            <strong>Wrong curve on zeotropes.</strong> Using bubble pressure for saturation
            temperature on R-407C / R-454C / R-455A overstates superheat by the glide
            value (11-22°F). This calculator uses the dew curve automatically — verify any
            paper PT chart you reference shows both columns and use the dew column for SH.
          </li>
          <li>
            <strong>Thermocouple at the wrong location.</strong> Industry standard is within
            6 inches of the compressor suction inlet on the suction line; the OEM service
            literature for your equipment specifies the exact location. Probing at the
            evaporator outlet, at random elbows mid-line, or at the compressor body itself
            gives different values that don&apos;t match the OEM&apos;s SH target.
          </li>
          <li>
            <strong>No insulation on the probe.</strong> An uninsulated clamp-on probe reads
            partly the line temperature and partly the ambient air temperature. Inside a
            warm attic this inflates apparent superheat by 5-10°F. Use closed-cell foam tape
            or insulation putty over the probe.
          </li>
          <li>
            <strong>Reading before steady state.</strong> Superheat takes 10-20 minutes after
            compressor start to stabilize as the system reaches steady-state operation. Brief
            after-start spikes or transient values during defrost / cycle changes are not
            charging-decision data.
          </li>
          <li>
            <strong>Confusing total vs evaporator superheat.</strong> Total Superheat is
            measured at the compressor suction (what manifold-based service procedures use);
            Evaporator Superheat is at the evap outlet (what the TXV bulb senses). Total
            SH is 2-5°F higher than Evap SH due to suction-line pickup. Fixed-orifice
            charging-chart targets are Total SH; TXV setpoints are Evap SH.
          </li>
          <li>
            <strong>PSIG vs PSIA mix-up.</strong> Service gauges read PSIG (gauge pressure
            above atmospheric); some refrigerant property software wants PSIA (absolute,
            measured from vacuum). PSIA = PSIG + 14.696 at sea level. Confusing the two
            shifts the saturation lookup by 15 PSI which can swing a reading by 5°F or more
            at low-side pressures.
          </li>
        </ol>
      </TechSection>

      <TechSection icon="book" tone="emerald" title="When to use this calculator vs the others">
        <ul>
          <li>
            <strong>Superheat Calculator</strong> (this page) — suction-line measurement.
            Charge fixed-orifice systems; verify TXV operation; diagnose evaporator-side
            issues (undercharge, restriction, flooding).
          </li>
          <li>
            <strong>
              <a href="/subcooling-calculator/" className="underline">Subcooling Calculator</a>
            </strong>{" "}
            — liquid-line measurement. Charge TXV / EEV systems; diagnose condenser-side
            issues (fouling, overcharge, low ambient airflow). Always pair with SH.
          </li>
          <li>
            <strong>
              <a href="/pt-superheat-subcooling-calculator/" className="underline">Combined SH / SC / PT</a>
            </strong>{" "}
            — both sides plus pattern-matching diagnostic banner. Use for full system
            commissioning or comprehensive diagnostic.
          </li>
          <li>
            <strong>
              <a href="/pt-calculator/" className="underline">PT Calculator</a>
            </strong>{" "}
            — raw saturation lookup, no measurement input. Reference tool for cross-checking
            or comparing refrigerants.
          </li>
          <li>
            <strong>
              <a href="/system-pressure-diagnostic-calculator/" className="underline">
                System Pressure Diagnostic
              </a>
            </strong>{" "}
            — high-low pressure × high-low SH / SC pattern matcher. Use when you have all
            four values and want a quick fingerprint identification (undercharge, overcharge,
            restriction, airflow problem, compressor issue).
          </li>
        </ul>
      </TechSection>

      <TechSection icon="source" tone="zinc" title="Primary sources behind the calculator and content">
        <ul>
          <li>
            <strong>CoolProp 7.2.0</strong> (Bell, Wronski, Quoilin, Lemort 2014,
            doi:10.1021/ie4033999) — REFPROP-compatible Helmholtz EOS for all saturation
            temperatures. Accuracy typically better than ±0.5% across the operating range.
          </li>
          <li>
            <strong>California Title 24 Reference Appendix RA3.2 (Table RA3.2-2)</strong> —
            the field-approximation target-superheat table for fixed-orifice charging
            (indexed on indoor wet-bulb and outdoor dry-bulb). The chart or label on the
            specific unit always takes precedence over this approximation.
          </li>
          <li>
            <strong>ASHRAE Handbook of Refrigeration 2022</strong> — Chapter 1
            (vapor-compression fundamentals), Chapter 23 (service procedures and target
            superheat by application). The reference text for commercial refrigeration
            service.
          </li>
          <li>
            <strong>ASHRAE HVAC Systems &amp; Equipment 2024</strong> — Chapter 43
            (chillers), centrifugal chiller evaporator approach and superheat targets.
          </li>
          <li>
            <strong>EPA Section 608 (40 CFR Part 82 Subpart F)</strong> — Refrigerant
            handling certification, leak repair requirements before adding refrigerant.
          </li>
          <li>
            <strong>OEM service literature</strong> — Carrier, Trane, Lennox, Daikin,
            Mitsubishi, Goodman charging procedures and target superheat ranges per
            equipment model.
          </li>
          <li>
            <strong>IEC 60335-2-40 (2022)</strong> — A2L refrigerant charge limits and
            installation requirements for R-32, R-454B equipment.
          </li>
        </ul>
      </TechSection>
    </>
  );
}

/* ──────────────────────── Inline SVG charts (server-rendered) ──────────────────────── */

function SuctionMeasurementDiagram() {
  const W = 720;
  const H = 220;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Schematic of suction-line superheat measurement: evaporator outlet to compressor inlet, with thermocouple location and manifold pressure port marked."
      className="my-3 h-auto w-full text-zinc-700 dark:text-zinc-300"
      preserveAspectRatio="xMidYMid meet"
    >
      <text x={W / 2} y={20} textAnchor="middle" fontSize="13" fontWeight={600} fill="currentColor">
        Where to measure suction-line superheat
      </text>
      {/* evaporator */}
      <rect x={40} y={70} width={140} height={80} rx={6} fill="#3a8ed1" opacity={0.15} stroke="#3a8ed1" strokeWidth={1.5} />
      <text x={110} y={100} textAnchor="middle" fontSize="11" fontWeight={600} fill="currentColor">Evaporator</text>
      <text x={110} y={118} textAnchor="middle" fontSize="9" fill="currentColor" opacity={0.7}>(refrigerant boils)</text>
      <text x={110} y={138} textAnchor="middle" fontSize="9" fill="currentColor" opacity={0.7}>indoor airflow ↓</text>
      {/* suction line */}
      <line x1={180} y1={110} x2={560} y2={110} stroke="#5a6f8a" strokeWidth={6} strokeLinecap="round" />
      <text x={370} y={92} textAnchor="middle" fontSize="10" fill="currentColor" opacity={0.6}>suction line (vapor)</text>
      {/* arrow on suction line */}
      <polygon points={`540,104 552,110 540,116`} fill="#5a6f8a" />
      {/* compressor */}
      <circle cx={620} cy={110} r={40} fill="#c45757" opacity={0.15} stroke="#c45757" strokeWidth={1.5} />
      <text x={620} y={106} textAnchor="middle" fontSize="11" fontWeight={600} fill="currentColor">Compressor</text>
      <text x={620} y={122} textAnchor="middle" fontSize="9" fill="currentColor" opacity={0.7}>(suction inlet)</text>
      {/* thermocouple */}
      <rect x={490} y={96} width={28} height={28} rx={2} fill="none" stroke="#d49a2b" strokeWidth={2} />
      <line x1={518} y1={110} x2={534} y2={110} stroke="#d49a2b" strokeWidth={2} />
      <text x={504} y={148} textAnchor="middle" fontSize="10" fontWeight={600} fill="#d49a2b">
        thermocouple
      </text>
      <text x={504} y={162} textAnchor="middle" fontSize="9" fill="currentColor" opacity={0.7}>
        within 6&quot; of inlet, insulated
      </text>
      {/* pressure port */}
      <line x1={420} y1={110} x2={420} y2={70} stroke="#8e4dd1" strokeWidth={2} />
      <circle cx={420} cy={64} r={8} fill="none" stroke="#8e4dd1" strokeWidth={2} />
      <text x={420} y={55} textAnchor="middle" fontSize="10" fontWeight={600} fill="#8e4dd1">manifold port</text>
      <text x={420} y={196} textAnchor="middle" fontSize="9" fill="currentColor" opacity={0.7}>
        read suction P here · convert to T_sat
      </text>
      {/* formula */}
      <text x={W / 2} y={H - 8} textAnchor="middle" fontSize="11" fontFamily="ui-monospace, monospace" fontWeight={600} fill="currentColor">
        Superheat = T_line (yellow probe) − T_sat (from purple port pressure)
      </text>
    </svg>
  );
}

function TargetSHBars() {
  const apps: { label: string; min: number; max: number; tone: string }[] = [
    { label: "Chiller (evap)", min: 2, max: 5, tone: "#3a8ed1" },
    { label: "Walk-in cooler MT", min: 6, max: 12, tone: "#3a8ed1" },
    { label: "Residential TXV", min: 8, max: 15, tone: "#5a8a3a" },
    { label: "Walk-in freezer LT", min: 8, max: 15, tone: "#5a8a3a" },
    { label: "Heat pump heating", min: 10, max: 20, tone: "#d49a2b" },
    { label: "Residential FXO", min: 5, max: 25, tone: "#d49a2b" },
  ];
  const W = 720;
  const ROW_H = 28;
  const PAD_T = 36;
  const PAD_B = 28;
  const LABEL_W = 160;
  const PAD_R = 50;
  const BAR_W = W - LABEL_W - PAD_R;
  const xMax = 35;
  const xScale = (v: number) => LABEL_W + (v / xMax) * BAR_W;
  const H = PAD_T + apps.length * ROW_H + PAD_B;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Bar chart of target superheat ranges by HVAC application."
      className="my-3 h-auto w-full text-zinc-700 dark:text-zinc-300"
      preserveAspectRatio="xMidYMid meet"
    >
      <text x={W / 2} y={20} textAnchor="middle" fontSize="13" fontWeight={600} fill="currentColor">
        Target superheat by application (°F)
      </text>
      {[0, 5, 10, 15, 20, 25, 30, 35].map((t) => (
        <g key={`tick-${t}`}>
          <line
            x1={xScale(t)}
            y1={PAD_T - 4}
            x2={xScale(t)}
            y2={PAD_T + apps.length * ROW_H}
            stroke="currentColor"
            opacity={0.1}
            strokeDasharray="2 3"
            strokeWidth={1}
          />
          <text x={xScale(t)} y={PAD_T - 8} textAnchor="middle" fontSize="9" fill="currentColor" opacity={0.6}>{t}</text>
        </g>
      ))}
      {apps.map((a, i) => {
        const y = PAD_T + i * ROW_H;
        const isPoint = a.min === a.max;
        return (
          <g key={a.label}>
            <text x={LABEL_W - 8} y={y + 14} textAnchor="end" fontSize="11" fontWeight={500} fill="currentColor">
              {a.label}
            </text>
            {isPoint ? (
              <g>
                <line x1={xScale(a.min)} y1={y + 4} x2={xScale(a.min)} y2={y + 20} stroke={a.tone} strokeWidth={3} />
                <text x={xScale(a.min) + 8} y={y + 16} fontSize="10" fontWeight={600} fill={a.tone}>
                  ≥ {a.min}°F
                </text>
              </g>
            ) : (
              <g>
                <rect x={xScale(a.min)} y={y + 6} width={xScale(a.max) - xScale(a.min)} height={12} fill={a.tone} rx={2} />
                <text x={xScale(a.max) + 6} y={y + 16} fontSize="10" fontWeight={600} fill="currentColor">
                  {a.min}-{a.max}
                </text>
              </g>
            )}
          </g>
        );
      })}
      <text x={W / 2} y={H - 8} textAnchor="middle" fontSize="10" fill="currentColor" opacity={0.7}>
        Source: ASHRAE Handbook of Refrigeration 2022, OEM service literature.
      </text>
    </svg>
  );
}

function GlideCurveSelector() {
  const W = 720;
  const H = 300;
  const PAD_L = 56;
  const PAD_R = 16;
  const PAD_T = 36;
  const PAD_B = 40;
  const PLOT_W = W - PAD_L - PAD_R;
  const PLOT_H = H - PAD_T - PAD_B;
  const xMin = -20;
  const xMax = 130;
  const yMin = 0;
  const yMax = 280;
  const xScale = (v: number) => PAD_L + ((v - xMin) / (xMax - xMin)) * PLOT_W;
  const yScale = (v: number) => PAD_T + PLOT_H - ((v - yMin) / (yMax - yMin)) * PLOT_H;

  const r407c = getRefrigerant("r-407c");
  let bubblePath = "";
  let dewPath = "";
  if (r407c) {
    const pts = r407c.ptChart.filter(
      (p) => p.tempF >= xMin && p.tempF <= xMax && p.bubblePsig <= yMax && p.dewPsig <= yMax
    );
    bubblePath = pts
      .map((p, i) => `${i === 0 ? "M" : "L"} ${xScale(p.tempF).toFixed(1)} ${yScale(p.bubblePsig).toFixed(1)}`)
      .join(" ");
    dewPath = pts
      .map((p, i) => `${i === 0 ? "M" : "L"} ${xScale(p.tempF).toFixed(1)} ${yScale(p.dewPsig).toFixed(1)}`)
      .join(" ");
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="R-407C bubble and dew saturation curves showing which curve to use for suction-line superheat vs liquid-line subcooling."
      className="my-3 h-auto w-full text-zinc-700 dark:text-zinc-300"
      preserveAspectRatio="xMidYMid meet"
    >
      <text x={W / 2} y={20} textAnchor="middle" fontSize="13" fontWeight={600} fill="currentColor">
        R-407C — which curve for which measurement?
      </text>
      {[0, 50, 100, 150, 200, 250].map((t) => (
        <line
          key={`gy-${t}`}
          x1={PAD_L}
          y1={yScale(t)}
          x2={PAD_L + PLOT_W}
          y2={yScale(t)}
          stroke="currentColor"
          opacity={0.1}
          strokeDasharray="2 3"
        />
      ))}
      {[-20, 0, 20, 40, 60, 80, 100, 120].map((t) => (
        <g key={`gx-${t}`}>
          <line
            x1={xScale(t)}
            y1={PAD_T}
            x2={xScale(t)}
            y2={PAD_T + PLOT_H}
            stroke="currentColor"
            opacity={0.1}
            strokeDasharray="2 3"
          />
          <text x={xScale(t)} y={PAD_T + PLOT_H + 14} textAnchor="middle" fontSize="10" fill="currentColor" opacity={0.7}>
            {t}
          </text>
        </g>
      ))}
      {[0, 50, 100, 150, 200, 250].map((t) => (
        <text key={`ty-${t}`} x={PAD_L - 6} y={yScale(t) + 4} textAnchor="end" fontSize="10" fill="currentColor" opacity={0.7}>
          {t}
        </text>
      ))}
      <line x1={PAD_L} y1={PAD_T + PLOT_H} x2={PAD_L + PLOT_W} y2={PAD_T + PLOT_H} stroke="currentColor" opacity={0.5} />
      <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + PLOT_H} stroke="currentColor" opacity={0.5} />
      <text x={PAD_L + PLOT_W / 2} y={H - 8} textAnchor="middle" fontSize="11" fill="currentColor" opacity={0.8}>
        Temperature (°F)
      </text>
      <text
        x={14}
        y={PAD_T + PLOT_H / 2}
        textAnchor="middle"
        fontSize="11"
        fill="currentColor"
        opacity={0.8}
        transform={`rotate(-90 14 ${PAD_T + PLOT_H / 2})`}
      >
        Saturation pressure (PSIG)
      </text>
      {dewPath ? <path d={dewPath} stroke="#3a8ed1" strokeWidth={2.5} fill="none" /> : null}
      {bubblePath ? <path d={bubblePath} stroke="#8e4dd1" strokeWidth={2.5} strokeDasharray="6 3" fill="none" /> : null}
      {/* legend */}
      <g transform={`translate(${PAD_L + 16}, ${PAD_T - 16})`}>
        <line x1={0} y1={4} x2={22} y2={4} stroke="#3a8ed1" strokeWidth={2.5} />
        <text x={28} y={8} fontSize="11" fontWeight={500} fill="currentColor">
          Dew (use for superheat)
        </text>
        <line x1={180} y1={4} x2={202} y2={4} stroke="#8e4dd1" strokeWidth={2.5} strokeDasharray="6 3" />
        <text x={208} y={8} fontSize="11" fontWeight={500} fill="currentColor">
          Bubble (use for subcooling)
        </text>
      </g>
      {/* annotation */}
      <g>
        <rect x={xScale(30) - 2} y={yScale(75) - 12} width={120} height={36} rx={4} fill="white" stroke="#3a8ed1" strokeWidth={1.5} opacity={0.95} />
        <text x={xScale(30) + 58} y={yScale(75) + 3} textAnchor="middle" fontSize="10" fontWeight={600} fill="#3a8ed1">
          11°F glide
        </text>
        <text x={xScale(30) + 58} y={yScale(75) + 16} textAnchor="middle" fontSize="9" fill="currentColor" opacity={0.7}>
          bubble − dew at same P
        </text>
      </g>
    </svg>
  );
}
