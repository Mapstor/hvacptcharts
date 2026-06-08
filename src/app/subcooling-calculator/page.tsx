import type { Metadata } from "next";
import { Activity, Calculator as CalcIcon, Gauge, Table as TableIcon } from "lucide-react";
import { refrigerants, getRefrigerant } from "@/data/refrigerants";
import { CalculatorShell } from "@/components/calculators/shared/CalculatorShell";
import { SubcoolingCalculator } from "@/components/calculators/SubcoolingCalculator";
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
    q: "What is subcooling?",
    a: "Subcooling is the temperature of liquid refrigerant below its saturation temperature at the same pressure. It is measured on the liquid line leaving the condenser: condenser saturation temperature minus measured liquid-line temperature equals subcooling. Positive subcooling confirms fully-liquid refrigerant entering the metering device; zero or negative subcooling means vapor bubbles (flash gas) are present, starving the metering device and reducing capacity.",
  },
  {
    q: "What is the target subcooling for an HVAC system?",
    a: "TXV / EEV residential AC: 8-12°F at the condenser outlet (per Carrier, Trane, Lennox, Daikin OEM service literature). Heat pumps in cooling mode: 8-15°F; in heating mode the indoor coil becomes the condenser and target is similar. Walk-in commercial refrigeration: 5-15°F depending on line run length. Centrifugal chillers: 2-5°F at the condenser exit. Fixed-orifice residential systems are charged by superheat — subcooling is informational only. Always cross-check the equipment label and OEM service literature.",
  },
  {
    q: "How do I measure subcooling in the field?",
    a: "Read the high-side (discharge / liquid-line) pressure from the manifold gauge in PSIG. Clamp a contact temperature probe on the liquid line at the outdoor unit's service valve — the smaller, uninsulated copper line. Make solid metal-to-metal contact, insulate from ambient air, and let the reading stabilize (10-20 minutes after compressor start). Convert the liquid pressure to saturation temperature using a PT chart for your refrigerant — use the bubble curve for zeotropic blends. Subtract: subcooling = T_sat − T_line. This calculator handles the conversion and bubble-curve selection automatically.",
  },
  {
    q: "What does low subcooling indicate?",
    a: "Low subcooling (under 3°F on a TXV system) usually means undercharge — the compressor can't condense enough vapor to fill the condenser with a liquid column, so refrigerant leaves the condenser still partly vapor. Negative subcooling means flash gas reaching the metering device. Cross-check superheat: high SH + low SC is the textbook undercharge fingerprint. Look for leaks before adding refrigerant under EPA Section 608. Less commonly, low SC can indicate a stuck-open bypass valve or sensor malfunction on commercial equipment.",
  },
  {
    q: "What does high subcooling indicate?",
    a: "High subcooling (over 15°F on a residential system) usually means overcharge — excess refrigerant backs up in the condenser, taking up space normally used by condensing vapor. Less commonly: a dirty condenser coil (heat-transfer fouling raises condenser saturation temperature for the same heat rejection load), restricted condenser airflow, recirculation of hot discharge air over the coil, or non-condensable gases trapped in the system. Cross-check superheat: low SH + high SC is the overcharge fingerprint. Always verify condenser airflow and coil cleanliness before adjusting charge — fouling looks like overcharge.",
  },
  {
    q: "Why does subcooling math differ for zeotropic blends?",
    a: "Zeotropic blends condense across a temperature range at constant pressure. On the liquid line the refrigerant has fully condensed — the relevant saturation boundary is the bubble temperature (below which everything is liquid), not the dew temperature. This calculator uses the bubble curve automatically for zeotropic blends. Using the dew curve for R-407C would overestimate subcooling by approximately 11°F; for R-455A by approximately 22°F.",
  },
  {
    q: "Why is TXV charged by subcooling and fixed-orifice by superheat?",
    a: "A TXV / EEV regulates superheat to its setpoint regardless of how much refrigerant is in the system. So superheat on a TXV system tells you about valve operation, not charge. Subcooling, by contrast, measures how much liquid is backed up in the condenser — directly proportional to charge. Fixed-orifice devices have no feedback control, so superheat varies directly with charge and ambient; it is the right signal to charge against. The ACCA Manual T charging procedure formalizes this: TXV = subcooling, fixed orifice = superheat.",
  },
  {
    q: "How does subcooling differ from condenser approach?",
    a: "Subcooling is T_sat (at discharge pressure) − T_liquid_line, measured on the air side at the condenser exit. Condenser approach is T_sat − T_air_off_condenser (air-cooled) or T_sat − T_leaving_condenser_water (water-cooled), measured on the heat-rejection medium side. Approach tells you how efficiently the condenser is transferring heat; subcooling tells you how much liquid is sitting in the condenser. They&apos;re related but separate metrics. A high condenser approach with normal subcooling indicates condenser fouling without overcharge; high subcooling with normal approach indicates overcharge without fouling.",
  },
  {
    q: "Why does long line-set installation affect subcooling?",
    a: "Long liquid line sets — common on mini-splits and multi-zone installations — introduce pressure drop and heat pickup that change subcooling between the outdoor unit and the indoor metering device. Manufacturers commonly recommend higher subcooling at the condenser outlet (e.g., 12-15°F instead of 8-10°F) for line sets over 50 feet to ensure sufficient liquid column reaches the indoor TXV. Always check the manufacturer's line set length adjustment table when commissioning long-line installations.",
  },
];

export const metadata: Metadata = {
  title: "Subcooling Calculator — HVAC Liquid-Line Subcooling with Bubble-Curve Math",
  description:
    "Free subcooling calculator for 50+ HVAC refrigerants with correct bubble-curve handling for zeotropic blends. TXV charging targets, 10 worked service problems for residential AC, commercial refrigeration, chillers, heat pumps. Sourced from CoolProp 7.2.0.",
  alternates: { canonical: `${SITE_URL}/subcooling-calculator/` },
};

export default function SubcoolingCalculatorPage() {
  return (
    <CalculatorShell
      schema={{
        path: "subcooling-calculator",
        name: "Subcooling Calculator",
        description:
          "Compute HVAC subcooling from liquid-line pressure and temperature for 50+ refrigerants. Bubble-curve math for zeotropic blends. Diagnostic context, target SC reference table, and 10 worked service problems.",
        featureList: [
          "Supports all 49 CoolProp-modeled refrigerants in the dataset",
          "Correct bubble-curve math for zeotropic blends (R-407C, R-454C, R-455A, R-448A, R-449A)",
          "Imperial (°F, PSIG) and metric (°C, kPa) units",
          "Target subcooling reference table for residential, commercial, chiller, heat pump",
          "TXV / EEV charging procedure (subcooling-based)",
          "10 worked service problems for residential AC, commercial refrigeration, heat pumps",
          "Inline diagnostic context: undercharge / overcharge / fouling patterns",
          "Long-line-set adjustment guidance per OEM literature",
          "Mobile-friendly, no signup",
        ],
        publishedDate: PUBLISHED,
        breadcrumbLabel: "Subcooling Calculator",
      }}
      introOneLiner="Enter your liquid-line pressure and temperature for any refrigerant; get subcooling plus diagnostic context. Bubble-curve math so high-glide blends (R-407C, R-454C, R-455A) don't read 11-22°F off."
      generatedDate={PUBLISHED.slice(0, 10)}
      howTo={{
        steps: [
          "Pick the refrigerant. Defaults to R-410A.",
          "Read the high-side (discharge / liquid-line) pressure from the manifold gauge.",
          "Clamp a contact temperature probe on the liquid line at the outdoor unit's service valve — the smaller, uninsulated copper line. Insulate from ambient.",
          "Allow 10-20 minutes after compressor start for steady-state. Enter both values.",
          "Compare against your equipment's target subcooling (TXV target typically 8-12°F; check the OEM nameplate or service manual for the specific equipment).",
        ],
        commonErrors: [
          "Probing the wrong line. The LIQUID line is the smaller, uninsulated line at the outdoor unit; the suction line is larger and foam-insulated.",
          "Confusing high subcooling for 'extra capacity' — it usually means overcharge or condenser fouling, both of which reduce capacity.",
          "On zeotropic blends, using the dew curve at the discharge pressure — overestimates subcooling by the glide value (11°F for R-407C). This calculator uses the bubble curve automatically.",
          "Forgetting line set length adjustments — long mini-split line sets require higher SC at the outdoor unit to deliver adequate SC at the indoor TXV.",
        ],
      }}
      math={{
        formula:
          "Subcooling (°F) = T_sat(P_liquid) − T_liquid_line\n\nT_sat is read off the BUBBLE curve at the measured liquid pressure for zeotropic blends. For pure refrigerants and azeotropes, bubble ≡ dew, so the curve choice is moot.",
        sourceCitation:
          "Saturation temperatures from CoolProp 7.2.0 (Bell, Wronski, Quoilin, Lemort 2014, doi:10.1021/ie4033999), REFPROP-compatible Helmholtz EOS. Target subcooling per equipment manufacturer service literature (Carrier, Trane, Lennox, Daikin, Goodman), ACCA Manual T (2017), ASHRAE Handbook of Refrigeration 2022 (Chapter 23), and ASHRAE HVAC Systems & Equipment 2024 (Chapter 43, chillers).",
        workedExample:
          "R-410A residential AC TXV system, 95°F outdoor:\n  Liquid pressure: 380 PSIG\n  Liquid-line temperature: 100°F\n  Saturation temperature at 380 PSIG: 111°F (CoolProp 7.2.0)\n  Subcooling = 111 − 100 = 11°F\n\nWithin the typical 8-12°F TXV target range. TXV systems are charged BY subcooling — adjust refrigerant in 1-2 oz increments until SC lands on target (usually 10°F).",
      }}
      relatedTools={[
        { href: "/superheat-calculator/", label: "Superheat Calculator", blurb: "Suction-line companion. Together they pin down a system's charge state." },
        { href: "/pt-superheat-subcooling-calculator/", label: "Combined PT / SH / SC", blurb: "All three measurements on one form with pattern-matching diagnostic banner." },
        { href: "/pt-calculator/", label: "PT Calculator", blurb: "Raw saturation lookup for any refrigerant." },
        { href: "/high-head-pressure-causes/", label: "High head pressure causes", blurb: "High SC often signals a condenser-side condition. Diagnostic decision tree." },
        { href: "/system-pressure-diagnostic-calculator/", label: "System Diagnostic", blurb: "Pattern matcher for high/low pressure × high/low SH/SC fingerprints." },
      ]}
      faqs={FAQS}
      bodySections={<RichContent />}
    >
      <SubcoolingCalculator />
    </CalculatorShell>
  );
}

/* ──────────────────────── Body content ──────────────────────── */

function RichContent() {
  return (
    <>
      <TechSection icon="thermometer" tone="blue" title="What subcooling is and why it matters">
        <p>
          Subcooling is the temperature of liquid refrigerant below its saturation temperature
          at the same pressure. At any discharge pressure, the saturation temperature is the
          boundary above which any refrigerant is vapor; once the refrigerant has fully
          condensed and continues to lose heat to the condenser airstream, every degree below
          that saturation reading is one degree of subcooling.
        </p>
        <p>
          On a working system, subcooling serves two purposes. First, it guarantees liquid
          (not flash gas) is reaching the metering device — a TXV or fixed-orifice device fed
          with two-phase refrigerant loses massive capacity because the orifice meters by
          volume, and vapor takes up most of the volume with little cooling effect. Second,
          subcooling indirectly measures refrigerant charge: more refrigerant in the system
          means more liquid backed up in the condenser, which means more subcooling.
        </p>
        <LiquidLineMeasurementDiagram />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Schematic of a residential split-system liquid line, showing the smaller
          uninsulated copper line, the probe location at the outdoor service valve, and the
          high-side manifold pressure port. Source: Carrier / Trane / Lennox residential
          service literature.
        </p>
        <KeyInsight tone="emerald" icon="insight" title="Subcooling is the TXV charging signal">
          For TXV / EEV residential AC and most commercial systems, subcooling is the primary
          charging metric — superheat is determined by the valve, but subcooling is determined
          by how much refrigerant you have. Match the SC target, and the system is charged.
        </KeyInsight>
      </TechSection>

      <TechSection icon="composition" tone="purple" title="When to use SC vs SH for charging — the metering-device rule">
        <p>
          The reason TXV systems are charged by subcooling and fixed-orifice systems by
          superheat traces to what each device controls. A TXV regulates superheat to its
          setpoint by modulating refrigerant flow; charge changes do not directly alter
          superheat on a TXV system (the valve compensates). But charge changes do alter
          subcooling: more refrigerant means more liquid in the condenser, raising SC.
        </p>
        <p>
          Fixed-orifice devices (pistons, capillary tubes, accurators) have no feedback
          control. Superheat varies directly with charge, ambient temperature, and indoor
          load. Subcooling on a fixed-orifice system is informational — it depends on too
          many factors to give a clean charge reading.
        </p>
        <Panel title="Metering device → charging metric" icon={TableIcon}>
          <ComparisonTable
            headers={["Device", "Charge by", "Verify with", "Target SC"]}
            rows={[
              { label: "TXV", cells: ["Subcooling", "SH at TXV setpoint (8-15°F)", "8-12°F"] },
              { label: "EEV", cells: ["Subcooling", "EEV diagnostic + SH", "5-12°F"] },
              { label: "Fixed orifice (piston, captube)", cells: ["Superheat (ACCA chart)", "SC informational", "Varies 0-15°F"] },
            ]}
          />
        </Panel>
        <p>
          On a TXV residential split system, the standard procedure is: charge to 10°F SC,
          then verify SH is somewhere in 8-15°F as a sanity check. If SC lands on target but
          SH is way off (very low or very high), the issue is not charge — it&apos;s the
          valve, the airflow, or the load.
        </p>
      </TechSection>

      <TechSection icon="data" tone="emerald" title="Target subcooling reference — by application and equipment type">
        <Panel title="Target subcooling by application" icon={TableIcon}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-[10px] uppercase tracking-wider text-zinc-500 dark:border-zinc-800">
                  <th className="py-1.5 text-left">Application</th>
                  <th className="py-1.5 text-right">Target SC</th>
                  <th className="py-1.5 text-left">Source</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5">Residential AC, TXV (R-410A, R-32, R-454B)</td><td className="py-1.5 text-right font-mono tabular-nums">8-12°F</td><td className="py-1.5 text-xs">Carrier, Trane, Lennox, Daikin OEM</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5">Heat pump, cooling mode</td><td className="py-1.5 text-right font-mono tabular-nums">8-15°F</td><td className="py-1.5 text-xs">Carrier / Trane heat-pump service guides</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5">Heat pump, heating mode (indoor coil = condenser)</td><td className="py-1.5 text-right font-mono tabular-nums">8-15°F</td><td className="py-1.5 text-xs">Carrier / Trane heat-pump service guides</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5">Walk-in cooler (medium-temp)</td><td className="py-1.5 text-right font-mono tabular-nums">5-15°F</td><td className="py-1.5 text-xs">ASHRAE Handbook of Refrigeration 2022 Ch. 23</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5">Walk-in freezer (low-temp)</td><td className="py-1.5 text-right font-mono tabular-nums">5-15°F</td><td className="py-1.5 text-xs">ASHRAE Handbook of Refrigeration 2022 Ch. 23</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5">Mini-split with long line set (&gt;50 ft)</td><td className="py-1.5 text-right font-mono tabular-nums">12-15°F</td><td className="py-1.5 text-xs">Mitsubishi, Daikin, LG line-set adjustment tables</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5">Centrifugal chiller at condenser exit</td><td className="py-1.5 text-right font-mono tabular-nums">2-5°F</td><td className="py-1.5 text-xs">ASHRAE HVAC Systems &amp; Equipment 2024 Ch. 43</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5">Refrigerated transport (high SC for distance)</td><td className="py-1.5 text-right font-mono tabular-nums">15-25°F</td><td className="py-1.5 text-xs">Carrier Transicold service literature</td></tr>
                <tr><td className="py-1.5">Mobile AC (R-1234yf, R-134a)</td><td className="py-1.5 text-right font-mono tabular-nums">5-10°F</td><td className="py-1.5 text-xs">SAE J2912 (MAC service procedures)</td></tr>
              </tbody>
            </table>
          </div>
        </Panel>
        <TargetSCBars />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Target subcooling ranges across HVAC applications. Long-line-set residential
          mini-splits run higher SC at the outdoor unit to compensate for line-set heat
          pickup and pressure drop. Refrigerated transport runs the highest SC of common
          applications because of long line distances and high heat exposure.
        </p>
      </TechSection>

      <TechSection icon="service" tone="amber" title="Real service problems solved with subcooling measurement">
        <p>
          Ten field scenarios covering residential AC TXV charging (the primary use case),
          undercharge / overcharge / fouling pattern recognition, zeotropic blend bubble-curve
          handling, heat pump dual-mode operation, chiller condenser approach diagnostics, and
          long-line-set installation. Each shows what gets measured, the chart lookup, the
          derivation, and the verdict.
        </p>
      </TechSection>

      <ServiceProblem
        number={1}
        refrigerant="R-410A (TXV)"
        title="Charging an R-410A TXV residential AC by subcooling"
        scenario="New R-410A TXV residential AC, 95°F outdoor day, system has been running 20 minutes. You are setting the charge by subcooling per the nameplate (10°F target SC stamped on the outdoor unit data plate)."
      >
        <Panel title="Measured" icon={Gauge}>
          <Gauges
            items={[
              { label: "Discharge P", value: "380 PSIG", side: "high" },
              { label: "Liquid line", value: "100°F", side: "high" },
              { label: "Suction P", value: "130 PSIG", side: "low" },
              { label: "Suction line", value: "60°F", side: "low" },
            ]}
          />
        </Panel>
        <Panel title="PT chart lookup (R-410A)" icon={CalcIcon}>
          <Lookups
            rows={[
              { input: "380 PSIG", output: "111°F sat", note: "condenser saturation" },
              { input: "130 PSIG", output: "45°F sat", note: "evap saturation (for SH cross-check)" },
            ]}
          />
        </Panel>
        <Panel title="Derived" icon={Activity}>
          <Derived
            rows={[
              { formula: "Subcooling = 111°F − 100°F = 11°F", verdict: "ok", note: "matches 10°F target ±1°F" },
              { formula: "Superheat = 60°F − 45°F = 15°F", verdict: "ok", note: "TXV in 8-15°F range" },
            ]}
          />
        </Panel>
        <VerdictBanner status="ok" title="Properly charged — TXV operating">
          Subcooling matches the 10°F nameplate target within tolerance; superheat
          cross-check confirms TXV is regulating. No further service action.
        </VerdictBanner>
      </ServiceProblem>

      <ServiceProblem
        number={2}
        refrigerant="R-410A (TXV)"
        title="Negative subcooling — flash gas in the liquid line"
        scenario="Same R-410A TXV system, three months after install. Customer reports the unit runs constantly but doesn't cool. You hook up gauges and read concerning numbers."
      >
        <Panel title="Measured" icon={Gauge}>
          <Gauges
            items={[
              { label: "Discharge P", value: "320 PSIG", side: "high" },
              { label: "Liquid line", value: "108°F", side: "high" },
              { label: "Suction P", value: "100 PSIG", side: "low" },
              { label: "Suction line", value: "75°F", side: "low" },
            ]}
          />
        </Panel>
        <Panel title="PT chart lookup (R-410A)" icon={CalcIcon}>
          <Lookups
            rows={[
              { input: "320 PSIG", output: "99°F sat", note: "condenser saturation" },
              { input: "100 PSIG", output: "31°F sat", note: "evap saturation" },
            ]}
          />
        </Panel>
        <Panel title="Derived" icon={Activity}>
          <Derived
            rows={[
              { formula: "Subcooling = 99°F − 108°F = −9°F", verdict: "bad", note: "negative — liquid line warmer than saturation" },
              { formula: "Superheat = 75°F − 31°F = 44°F", verdict: "bad", note: "very high — confirms undercharge" },
            ]}
          />
        </Panel>
        <VerdictBanner status="bad" title="Undercharge — significant leak">
          Negative subcooling means there is no liquid column in the condenser — flash gas
          (two-phase) is reaching the metering device. High superheat confirms the
          evaporator is starved. The system is significantly undercharged; a leak is the
          most likely cause given the recent commissioning.
        </VerdictBanner>
        <FixCallout>
          Find and repair the leak per EPA Section 608 before adding refrigerant.
          Standard leak-search procedure: electronic leak detector along all joints and
          accessible line segments, soap solution for confirmation, UV dye if the leak is
          intermittent or hidden. After repair: evacuate to 500 microns, hold ≥30 min,
          charge by weight to nameplate.
        </FixCallout>
      </ServiceProblem>

      <ServiceProblem
        number={3}
        refrigerant="R-410A (TXV)"
        title="Very high subcooling — overcharge or condenser fouling?"
        scenario="R-410A TXV system, two years old. Customer reports the unit runs longer than it used to and the electric bill is higher. You measure subcooling at 22°F — well above the 10°F target. Two suspects: overcharge or dirty condenser. Which?"
      >
        <Panel title="Measured" icon={Gauge}>
          <Gauges
            items={[
              { label: "Discharge P", value: "440 PSIG", side: "high" },
              { label: "Liquid line", value: "98°F", side: "high" },
              { label: "Ambient", value: "95°F", side: "high" },
              { label: "Air off cond", value: "115°F", side: "high" },
            ]}
          />
        </Panel>
        <Panel title="PT chart lookup (R-410A)" icon={CalcIcon}>
          <Lookups
            rows={[
              { input: "440 PSIG", output: "120°F sat", note: "condenser saturation (very high)" },
            ]}
          />
        </Panel>
        <Panel title="Derived" icon={Activity}>
          <Derived
            rows={[
              { formula: "Subcooling = 120°F − 98°F = 22°F", verdict: "bad", note: "very high" },
              { formula: "Condenser approach = 120°F − 115°F = 5°F", verdict: "info", note: "approach is normal — fouling NOT the cause" },
              { formula: "Cond above ambient = 120°F − 95°F = 25°F", verdict: "bad", note: "very high — should be ~15-20°F" },
            ]}
          />
        </Panel>
        <VerdictBanner status="bad" title="Overcharge — condenser is healthy">
          High SC with normal condenser approach (5°F) and high condenser-above-ambient
          delta confirms overcharge: excess refrigerant fills the condenser, raising
          saturation temperature for the same heat rejection load. If approach were also
          high (12-18°F), fouling would be the cause. The 5°F approach proves the coil is
          clean and airflow is good.
        </VerdictBanner>
        <FixCallout>
          Recover refrigerant in 1-2 oz increments using a recovery / charging scale. After
          each increment, allow 10-15 minutes for steady state, then re-test SC. Stop when
          SC reaches 10°F. Also verify SH lands in 8-15°F as a final cross-check.
        </FixCallout>
      </ServiceProblem>

      <ServiceProblem
        number={4}
        refrigerant="R-410A (TXV)"
        title="High SC with high condenser approach — this IS condenser fouling"
        scenario="Same R-410A TXV system, customer reports the AC isn't cooling well during peak heat. You measure 18°F SC (high) but the air off the condenser is noticeably hotter than usual. Are we sure it's not overcharge?"
      >
        <Panel title="Measured" icon={Gauge}>
          <Gauges
            items={[
              { label: "Discharge P", value: "420 PSIG", side: "high" },
              { label: "Liquid line", value: "99°F", side: "high" },
              { label: "Ambient", value: "95°F", side: "high" },
              { label: "Air off cond", value: "105°F", side: "high" },
            ]}
          />
        </Panel>
        <Panel title="PT chart lookup (R-410A)" icon={CalcIcon}>
          <Lookups
            rows={[
              { input: "420 PSIG", output: "117°F sat", note: "condenser saturation (very high)" },
            ]}
          />
        </Panel>
        <Panel title="Derived" icon={Activity}>
          <Derived
            rows={[
              { formula: "Subcooling = 117°F − 99°F = 18°F", verdict: "warn", note: "high" },
              { formula: "Condenser approach = 117°F − 105°F = 12°F", verdict: "bad", note: "high — should be 3-7°F clean coil" },
              { formula: "Cond above ambient = 117°F − 95°F = 22°F", verdict: "bad", note: "very high" },
            ]}
          />
        </Panel>
        <VerdictBanner status="bad" title="Condenser fouling — clean before adjusting charge">
          High SC AND high approach is the fouling fingerprint, not overcharge. The
          condenser is holding extra liquid (high SC) because heat-transfer fouling raises
          saturation temperature; the high approach proves the coil isn&apos;t rejecting heat
          efficiently. Fixing this with refrigerant recovery would mask the real problem
          and leave the system undercharged once the coil is clean.
        </VerdictBanner>
        <FixCallout>
          Clean the condenser coil (compressed air or condenser cleaner per OEM service
          procedure), then re-test SC at steady state. If SC drops to 8-12°F after cleaning,
          the charge was correct. If SC remains high after cleaning, then recover
          refrigerant in increments until SC reaches 10°F target.
        </FixCallout>
      </ServiceProblem>

      <ServiceProblem
        number={5}
        refrigerant="R-407C (zeotropic ~11°F glide)"
        title="R-407C subcooling — why curve selection matters"
        scenario="R-407C retrofit on a residential AC originally R-22. R-407C is zeotropic with ~11°F glide, so the bubble vs dew distinction matters significantly for subcooling calculation."
      >
        <Panel title="Measured" icon={Gauge}>
          <Gauges
            items={[
              { label: "Discharge P", value: "320 PSIG", side: "high" },
              { label: "Liquid line", value: "98°F", side: "high" },
            ]}
          />
        </Panel>
        <Panel title="PT chart lookup (R-407C — dual curves)" icon={CalcIcon}>
          <Lookups
            rows={[
              { input: "320 PSIG bubble", output: "118°F sat", note: "USE THIS — cond outlet saturation" },
              { input: "320 PSIG dew", output: "107°F sat", note: "cond inlet — wrong for SC" },
            ]}
          />
        </Panel>
        <Panel title="Derived (correct vs wrong-curve)" icon={Activity}>
          <Derived
            rows={[
              { formula: "Subcooling (bubble, correct) = 118°F − 98°F = 20°F", verdict: "warn", note: "high — overcharge?" },
              { formula: "Subcooling (dew, wrong) = 107°F − 98°F = 9°F", verdict: "info", note: "would falsely look normal" },
            ]}
          />
        </Panel>
        <VerdictBanner status="warn" title="Investigate overcharge or fouling — dew curve would have hidden it">
          The correct bubble-curve calculation shows SC = 20°F, well above the 8-12°F
          target — flags overcharge or condenser fouling for investigation. Using the wrong
          dew curve would have shown SC = 9°F and signed off the system as properly
          charged. Wrong-curve error = 11°F = R-407C glide.
        </VerdictBanner>
        <FixCallout>
          For zeotropic blends (R-407C, R-454C, R-455A, R-448A, R-449A), always confirm PT
          chart software is using the bubble curve at discharge pressure for subcooling.
          This calculator does it automatically. Check condenser airflow and coil
          cleanliness; if those are fine, recover refrigerant in increments.
        </FixCallout>
      </ServiceProblem>

      <ServiceProblem
        number={6}
        refrigerant="R-454C (zeotropic ~14°F glide)"
        title="R-454C low-temp walk-in freezer subcooling check"
        scenario="R-454C walk-in freezer, low-temp commercial, -20°F target evaporator. R-454C replaces R-404A as a sub-700 GWP option under the AIM Act. Wide 14°F glide means curve selection matters even more."
      >
        <Panel title="Measured" icon={Gauge}>
          <Gauges
            items={[
              { label: "Discharge P", value: "200 PSIG", side: "high" },
              { label: "Liquid line", value: "82°F", side: "high" },
              { label: "Ambient", value: "95°F", side: "high" },
            ]}
          />
        </Panel>
        <Panel title="PT chart lookup (R-454C — dual curves)" icon={CalcIcon}>
          <Lookups
            rows={[
              { input: "200 PSIG bubble", output: "88°F sat", note: "USE THIS — cond outlet saturation" },
              { input: "200 PSIG dew", output: "74°F sat", note: "cond inlet — wrong for SC" },
            ]}
          />
        </Panel>
        <Panel title="Derived" icon={Activity}>
          <Derived
            rows={[
              { formula: "Subcooling (bubble, correct) = 88°F − 82°F = 6°F", verdict: "ok", note: "in 5-15°F LT walk-in target" },
              { formula: "Wrong-curve error = 14°F = R-454C glide", verdict: "info", note: "dew would give SC = −8°F" },
            ]}
          />
        </Panel>
        <VerdictBanner status="ok" title="Within target — bubble curve gives correct answer">
          6°F subcooling using the correct bubble curve is at the low end of the 5-15°F
          walk-in freezer range. Wide line runs (typical for walk-in installations) often
          shift SC toward the higher end of the range; if this freezer has short lines,
          the low end is appropriate.
        </VerdictBanner>
      </ServiceProblem>

      <ServiceProblem
        number={7}
        refrigerant="R-134a (centrifugal chiller)"
        title="R-134a centrifugal chiller — why SC is low by design"
        scenario="Water-cooled R-134a centrifugal chiller, 45°F leaving chilled water, 85°F entering condenser water. You measure subcooling at 3°F and worry it's undercharged. Should you add refrigerant?"
      >
        <Panel title="Measured" icon={Gauge}>
          <Gauges
            items={[
              { label: "Discharge P", value: "152 PSIG", side: "high" },
              { label: "Liquid line", value: "110°F", side: "high" },
              { label: "Leaving CHW", value: "45°F" },
              { label: "Leaving CW", value: "95°F", side: "high" },
            ]}
          />
        </Panel>
        <Panel title="PT chart lookup (R-134a)" icon={CalcIcon}>
          <Lookups
            rows={[
              { input: "152 PSIG", output: "113°F sat", note: "condenser saturation" },
            ]}
          />
        </Panel>
        <Panel title="Derived" icon={Activity}>
          <Derived
            rows={[
              { formula: "Subcooling = 113°F − 110°F = 3°F", verdict: "ok", note: "chiller target 2-5°F" },
              { formula: "Condenser approach = 113°F − 95°F = 18°F", verdict: "bad", note: "high — should be 5-10°F water-cooled" },
            ]}
          />
        </Panel>
        <VerdictBanner status="ok" title="Subcooling normal — but condenser fouling needs attention">
          3°F SC is within the chiller 2-5°F design range — chillers run lower SC than
          residential AC because the flooded-evaporator design and high-side liquid sump
          handle hold-up rather than relying on condenser sub-cooling. The high condenser
          approach (18°F vs target 5-10°F) is the real issue: condenser tubes need cleaning
          or condenser water flow is restricted.
        </VerdictBanner>
        <FixCallout>
          Do NOT add refrigerant. Schedule a condenser tube brush-and-flush per chiller OEM
          procedure. Verify condenser water flow rate against nameplate; check for stuck
          bypass valves or strainer blockage. Re-test SC after cleaning — should remain
          within 2-5°F target.
        </FixCallout>
      </ServiceProblem>

      <ServiceProblem
        number={8}
        refrigerant="R-410A (heat pump cooling mode)"
        title="Heat pump cooling mode subcooling — same as straight AC?"
        scenario="R-410A residential air-source heat pump running in cooling mode. You want to confirm SC behaves the same as a straight AC condenser; the heat pump has a reversing valve and dual TXVs which complicates the picture."
      >
        <Panel title="Measured" icon={Gauge}>
          <Gauges
            items={[
              { label: "Discharge P", value: "395 PSIG", side: "high" },
              { label: "Liquid line", value: "102°F", side: "high" },
              { label: "Ambient", value: "95°F", side: "high" },
              { label: "Indoor return", value: "75°F" },
            ]}
          />
        </Panel>
        <Panel title="PT chart lookup (R-410A)" icon={CalcIcon}>
          <Lookups
            rows={[
              { input: "395 PSIG", output: "114°F sat", note: "outdoor coil (= condenser in cooling)" },
            ]}
          />
        </Panel>
        <Panel title="Derived" icon={Activity}>
          <Derived
            rows={[
              { formula: "Subcooling = 114°F − 102°F = 12°F", verdict: "ok", note: "heat pump cooling target 8-15°F" },
            ]}
          />
        </Panel>
        <VerdictBanner status="ok" title="Properly charged for cooling mode">
          12°F SC is in the heat pump cooling-mode target range. Heat pump systems typically
          have a slightly wider SC target than straight AC (8-15°F vs 8-12°F) because of the
          dual-mode TXV / accumulator design — extra SC margin ensures liquid column in both
          cooling and heating mode operation. Verify nameplate for the specific
          installation.
        </VerdictBanner>
        <FixCallout>
          For full heat pump commissioning, test SC in BOTH cooling mode (outdoor coil =
          condenser) and heating mode (indoor coil = condenser). Heat pump charge is often
          checked in heating mode after a service call, since heating mode is where most
          performance complaints arise. Verify defrost cycle operation and reversing valve
          actuation at the same visit.
        </FixCallout>
      </ServiceProblem>

      <ServiceProblem
        number={9}
        refrigerant="R-32 (mini-split, long line set)"
        title="Mini-split with 75-ft line set — adjusting target SC"
        scenario="Daikin / Mitsubishi-style R-32 mini-split with a 75-ft pre-charged line set running through unconditioned attic. OEM nameplate target SC is 10°F at the outdoor unit, but the long line set requires adjustment per the OEM service literature."
      >
        <Panel title="Measured" icon={Gauge}>
          <Gauges
            items={[
              { label: "Discharge P", value: "395 PSIG", side: "high" },
              { label: "Liquid line at OU", value: "100°F", side: "high" },
              { label: "Line length", value: "75 ft" },
              { label: "Lift", value: "10 ft" },
            ]}
          />
        </Panel>
        <Panel title="PT chart lookup (R-32)" icon={CalcIcon}>
          <Lookups
            rows={[
              { input: "395 PSIG", output: "111°F sat", note: "outdoor coil saturation (R-32 pure)" },
            ]}
          />
        </Panel>
        <Panel title="Derived" icon={Activity}>
          <Derived
            rows={[
              { formula: "Subcooling at OU = 111°F − 100°F = 11°F", verdict: "warn", note: "below long-line target" },
              { formula: "Long-line target (75 ft) = 13°F per OEM table", verdict: "info", note: "+2-3°F per 25 ft over 25-ft baseline" },
            ]}
          />
        </Panel>
        <VerdictBanner status="warn" title="Under target for long-line installation — add small charge">
          For line sets over 25 feet, OEMs (Mitsubishi, Daikin, Fujitsu) specify higher
          subcooling at the outdoor unit to ensure sufficient liquid column reaches the
          indoor TXV. The 75-ft line set adds ~3°F to the baseline 10°F target; your reading
          of 11°F is below the 13°F long-line target.
        </VerdictBanner>
        <FixCallout>
          Add refrigerant in 2-4 oz increments per the OEM line-length charge correction
          table (typically +0.4 to 0.6 oz per foot over 25 ft for R-32 / R-410A mini-splits).
          Re-test SC at the outdoor unit until it reaches the long-line target. Verify
          superheat at the indoor unit lands in 8-15°F.
        </FixCallout>
      </ServiceProblem>

      <ServiceProblem
        number={10}
        refrigerant="R-744 (CO2, transcritical)"
        title="R-744 transcritical — there is no subcooling on the high side"
        scenario="Supermarket R-744 transcritical commercial refrigeration system at 95°F outdoor (above CO2 critical 87.8°F). New technician asks: what's the subcooling target on the gas cooler exit?"
      >
        <Panel title="Measured" icon={Gauge}>
          <Gauges
            items={[
              { label: "Gas cooler outlet P", value: "1350 PSIG", side: "high" },
              { label: "Gas cooler outlet T", value: "105°F", side: "high" },
              { label: "Ambient", value: "95°F", side: "high" },
            ]}
          />
        </Panel>
        <Panel title="PT chart lookup (R-744)" icon={CalcIcon}>
          <Lookups
            rows={[
              { input: "1350 PSIG", output: "out of range", note: "no saturation above 87.8°F critical point" },
            ]}
          />
        </Panel>
        <VerdictBanner status="info" title="Subcooling does not apply in transcritical mode">
          Above the CO2 critical temperature (87.8°F), no saturation state exists — there&apos;s
          no liquid / vapor distinction, so the concept of subcooling doesn&apos;t apply.
          Instead, the meaningful high-side metric is gas cooler outlet temperature
          approach: typically 8-10°F above ambient at design (so 103-105°F at 95°F outdoor).
          Your 105°F reading is right at the design point.
        </VerdictBanner>
        <FixCallout>
          For transcritical systems, optimize high-pressure throttle valve setpoint per OEM
          to maintain target gas cooler outlet temperature. Below the critical temperature
          (cold-ambient sub-critical mode), R-744 condenses normally and standard SC math
          applies. Many supermarket R-744 systems switch between modes seasonally.
        </FixCallout>
      </ServiceProblem>

      <TechSection icon="warning" tone="amber" title="Six common subcooling measurement mistakes">
        <ol>
          <li>
            <strong>Wrong curve on zeotropes.</strong> Using dew pressure for saturation
            temperature on R-407C / R-454C / R-455A / R-448A / R-449A overestimates
            subcooling by the glide value (11-22°F). This calculator uses the bubble curve
            automatically — verify any paper PT chart shows both columns and use the bubble
            column for SC.
          </li>
          <li>
            <strong>Probing the wrong line.</strong> The liquid line is the smaller,
            uninsulated copper line at the outdoor unit service valve. The suction line is
            larger and foam-insulated. Probing the suction line gives you a superheat
            measurement, not subcooling.
          </li>
          <li>
            <strong>High SC interpreted as &quot;extra capacity&quot;.</strong> High SC
            actually reduces capacity — excess refrigerant in the condenser raises
            condensing pressure (more compressor work) and reduces effective condenser area
            for vapor condensation. Always investigate high SC, never celebrate it.
          </li>
          <li>
            <strong>Confusing fouling for overcharge.</strong> Both produce high SC, but
            condenser approach distinguishes them: high SC + high approach = fouling
            (clean the coil), high SC + normal approach = overcharge (recover refrigerant).
            Always check approach before adjusting charge.
          </li>
          <li>
            <strong>Ignoring line-set length on mini-splits.</strong> Long line sets
            (&gt;50 ft) require higher SC at the outdoor unit to deliver adequate SC at the
            indoor TXV. Mitsubishi, Daikin, LG, and Fujitsu all publish line-length
            correction tables — use them.
          </li>
          <li>
            <strong>Reading before steady state.</strong> Subcooling stabilizes 10-20
            minutes after compressor start. Brief transient values after defrost or cycle
            changes aren&apos;t charge-decision data — wait for steady state.
          </li>
        </ol>
      </TechSection>

      <TechSection icon="book" tone="emerald" title="When to use this calculator vs the others">
        <ul>
          <li>
            <strong>Subcooling Calculator</strong> (this page) — liquid-line measurement.
            Primary charging signal for TXV / EEV systems. Diagnose condenser-side issues
            (fouling, overcharge, low ambient airflow, non-condensables).
          </li>
          <li>
            <strong>
              <a href="/superheat-calculator/" className="underline">Superheat Calculator</a>
            </strong>{" "}
            — suction-line measurement. Charge fixed-orifice systems; verify TXV operation;
            diagnose evaporator-side issues (undercharge, restriction, flooding). Always
            pair with SC.
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
            four values and want a quick fingerprint identification.
          </li>
          <li>
            <strong>
              <a href="/high-head-pressure-causes/" className="underline">
                High head pressure causes
              </a>
            </strong>{" "}
            — companion guide when SC and head pressure are both high. Decision tree for
            condenser-side troubleshooting.
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
            (2017)</strong> — TXV charging procedure (subcooling-based), condenser fouling
            vs overcharge distinction, common error patterns. Industry-standard reference.
          </li>
          <li>
            <strong>ASHRAE Handbook of Refrigeration 2022</strong> — Chapter 23 (service
            procedures), target subcooling by application for commercial refrigeration.
          </li>
          <li>
            <strong>ASHRAE HVAC Systems &amp; Equipment 2024</strong> — Chapter 43 (chillers),
            centrifugal chiller subcooling targets and condenser approach.
          </li>
          <li>
            <strong>EPA Section 608 (40 CFR Part 82 Subpart F)</strong> — refrigerant
            handling certification, leak repair requirements before adding refrigerant.
          </li>
          <li>
            <strong>SAE J2912 / J639</strong> — mobile AC service procedures (R-1234yf,
            R-134a SC targets).
          </li>
          <li>
            <strong>OEM service literature</strong> — Carrier, Trane, Lennox, Daikin,
            Mitsubishi, Goodman, LG, Fujitsu charging procedures, target SC ranges per
            model, and line-set length correction tables.
          </li>
        </ul>
      </TechSection>
    </>
  );
}

/* ──────────────────────── Inline SVG charts ──────────────────────── */

function LiquidLineMeasurementDiagram() {
  const W = 720;
  const H = 220;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Liquid-line subcooling measurement schematic: condenser to metering device, with thermocouple location and manifold high-side port marked."
      className="my-3 h-auto w-full text-zinc-700 dark:text-zinc-300"
      preserveAspectRatio="xMidYMid meet"
    >
      <text x={W / 2} y={20} textAnchor="middle" fontSize="13" fontWeight={600} fill="currentColor">
        Where to measure liquid-line subcooling
      </text>
      {/* condenser */}
      <rect x={40} y={70} width={140} height={80} rx={6} fill="#c45757" opacity={0.15} stroke="#c45757" strokeWidth={1.5} />
      <text x={110} y={100} textAnchor="middle" fontSize="11" fontWeight={600} fill="currentColor">Condenser</text>
      <text x={110} y={118} textAnchor="middle" fontSize="9" fill="currentColor" opacity={0.7}>(vapor → liquid)</text>
      <text x={110} y={138} textAnchor="middle" fontSize="9" fill="currentColor" opacity={0.7}>ambient airflow ↑</text>
      {/* liquid line (smaller, uninsulated) */}
      <line x1={180} y1={110} x2={560} y2={110} stroke="#5a6f8a" strokeWidth={3} strokeLinecap="round" />
      <text x={370} y={92} textAnchor="middle" fontSize="10" fill="currentColor" opacity={0.6}>liquid line (small, uninsulated)</text>
      <polygon points={`540,106 552,110 540,114`} fill="#5a6f8a" />
      {/* metering device */}
      <rect x={580} y={92} width={64} height={36} rx={4} fill="#8e4dd1" opacity={0.15} stroke="#8e4dd1" strokeWidth={1.5} />
      <text x={612} y={108} textAnchor="middle" fontSize="10" fontWeight={600} fill="currentColor">TXV /</text>
      <text x={612} y={120} textAnchor="middle" fontSize="10" fontWeight={600} fill="currentColor">orifice</text>
      {/* thermocouple at OU service valve */}
      <rect x={200} y={96} width={28} height={28} rx={2} fill="none" stroke="#d49a2b" strokeWidth={2} />
      <line x1={228} y1={110} x2={244} y2={110} stroke="#d49a2b" strokeWidth={2} />
      <text x={214} y={148} textAnchor="middle" fontSize="10" fontWeight={600} fill="#d49a2b">
        thermocouple
      </text>
      <text x={214} y={162} textAnchor="middle" fontSize="9" fill="currentColor" opacity={0.7}>
        at OU service valve, insulated
      </text>
      {/* pressure port */}
      <line x1={300} y1={110} x2={300} y2={70} stroke="#8e4dd1" strokeWidth={2} />
      <circle cx={300} cy={64} r={8} fill="none" stroke="#8e4dd1" strokeWidth={2} />
      <text x={300} y={55} textAnchor="middle" fontSize="10" fontWeight={600} fill="#8e4dd1">manifold port</text>
      <text x={300} y={196} textAnchor="middle" fontSize="9" fill="currentColor" opacity={0.7}>
        read discharge P here · convert to T_sat (bubble for zeotropes)
      </text>
      {/* formula */}
      <text x={W / 2} y={H - 8} textAnchor="middle" fontSize="11" fontFamily="ui-monospace, monospace" fontWeight={600} fill="currentColor">
        Subcooling = T_sat (from purple port) − T_line (yellow probe)
      </text>
    </svg>
  );
}

function TargetSCBars() {
  const apps: { label: string; min: number; max: number; tone: string }[] = [
    { label: "Chiller (cond exit)", min: 2, max: 5, tone: "#3a8ed1" },
    { label: "Mobile AC", min: 5, max: 10, tone: "#3a8ed1" },
    { label: "Walk-in cooler MT", min: 5, max: 15, tone: "#5a8a3a" },
    { label: "Walk-in freezer LT", min: 5, max: 15, tone: "#5a8a3a" },
    { label: "Residential TXV", min: 8, max: 12, tone: "#5a8a3a" },
    { label: "Heat pump cooling", min: 8, max: 15, tone: "#d49a2b" },
    { label: "Heat pump heating", min: 8, max: 15, tone: "#d49a2b" },
    { label: "Long-line mini-split (>50ft)", min: 12, max: 15, tone: "#d49a2b" },
    { label: "Refrigerated transport", min: 15, max: 25, tone: "#c45757" },
  ];
  const W = 720;
  const ROW_H = 28;
  const PAD_T = 36;
  const PAD_B = 28;
  const LABEL_W = 180;
  const PAD_R = 50;
  const BAR_W = W - LABEL_W - PAD_R;
  const xMax = 30;
  const xScale = (v: number) => LABEL_W + (v / xMax) * BAR_W;
  const H = PAD_T + apps.length * ROW_H + PAD_B;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Bar chart of target subcooling ranges by HVAC application."
      className="my-3 h-auto w-full text-zinc-700 dark:text-zinc-300"
      preserveAspectRatio="xMidYMid meet"
    >
      <text x={W / 2} y={20} textAnchor="middle" fontSize="13" fontWeight={600} fill="currentColor">
        Target subcooling by application (°F)
      </text>
      {[0, 5, 10, 15, 20, 25, 30].map((t) => (
        <g key={`tick-${t}`}>
          <line
            x1={xScale(t)}
            y1={PAD_T - 4}
            x2={xScale(t)}
            y2={PAD_T + apps.length * ROW_H}
            stroke="currentColor"
            opacity={0.1}
            strokeDasharray="2 3"
          />
          <text x={xScale(t)} y={PAD_T - 8} textAnchor="middle" fontSize="9" fill="currentColor" opacity={0.6}>{t}</text>
        </g>
      ))}
      {apps.map((a, i) => {
        const y = PAD_T + i * ROW_H;
        return (
          <g key={a.label}>
            <text x={LABEL_W - 8} y={y + 14} textAnchor="end" fontSize="11" fontWeight={500} fill="currentColor">
              {a.label}
            </text>
            <rect x={xScale(a.min)} y={y + 6} width={xScale(a.max) - xScale(a.min)} height={12} fill={a.tone} rx={2} />
            <text x={xScale(a.max) + 6} y={y + 16} fontSize="10" fontWeight={600} fill="currentColor">
              {a.min}-{a.max}
            </text>
          </g>
        );
      })}
      <text x={W / 2} y={H - 8} textAnchor="middle" fontSize="10" fill="currentColor" opacity={0.7}>
        Source: ACCA Manual T (2017), ASHRAE Handbook of Refrigeration 2022, ASHRAE HVAC S&amp;E 2024, OEM literature.
      </text>
    </svg>
  );
}
