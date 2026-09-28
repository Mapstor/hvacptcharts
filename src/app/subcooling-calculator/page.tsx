import type { Metadata } from "next";
import { Table as TableIcon } from "lucide-react";
import { satTemp } from "@/data/refrigerants";
import { CalculatorShell } from "@/components/calculators/shared/CalculatorShell";
import { SubcoolingCalculator } from "@/components/calculators/SubcoolingCalculator";
import {
  ComparisonTable,
  Panel,
} from "@/components/calculators/shared/ServiceProblem";
import { TechSection, KeyInsight } from "@/components/refrigerant/TechSection";
import { pageMetadata } from "@/lib/schema/shared";
import { MeasurementDiagram } from "@/components/diagrams/MeasurementDiagram";
import { scenariosForPage } from "@/lib/scenarios";
import { WorkedScenario } from "@/components/calculators/shared/WorkedScenario";

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
    a: "A TXV / EEV regulates superheat to its setpoint regardless of how much refrigerant is in the system. So superheat on a TXV system tells you about valve operation, not charge. Subcooling, by contrast, measures how much liquid is backed up in the condenser — directly proportional to charge. Fixed-orifice devices have no feedback control, so superheat varies directly with charge and ambient; it is the right signal to charge against. Standard charging practice formalizes this: TXV = subcooling, fixed orifice = superheat.",
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

export const metadata: Metadata = pageMetadata({
  title: "Subcooling Calculator: What Should Subcooling Be? (60 Refrigerants)",
  description:
    "Liquid PSIG + line temp → subcooling with overcharge/undercharge reading. TXV target 8–12°F. Works for all common refrigerants including blends with glide.",
  path: "/subcooling-calculator/",
});

export default function SubcoolingCalculatorPage() {
  // Saturation temperature computed from the dataset (bubble = liquid side for subcooling).
  const workedSat = satTemp("r-410a", 380, "bubble")!;
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
        breadcrumbLabel: "Subcooling Calculator",
      }}
      introOneLiner="Enter your liquid-line pressure and temperature for any refrigerant; get subcooling plus diagnostic context. Bubble-curve math so high-glide blends (R-407C, R-454C, R-455A) don't read 11-22°F off."
      route="/subcooling-calculator/"
      howToReadResults={[
        {
          output: "Subcooling (°F or °C)",
          meaning:
            "The headline number: how far the liquid refrigerant sits below its saturation point, computed as saturation temp minus measured liquid-line temp. TXV residential AC typically targets 8–12°F; a healthy positive value confirms a solid liquid column reaching the metering device, while a reading near zero or negative means flash gas is present. Switching the temperature unit to °C shows the value as a temperature difference (delta), not an absolute temperature.",
        },
        {
          output: "Saturation temperature at your liquid-line pressure",
          meaning:
            "The bubble-point temperature the tool looks up from the PT chart at the pressure you entered — the boundary the liquid line must fall below to be subcooled. Subtracting your measured line temperature from it yields the subcooling. It is echoed back so you can sanity-check the pressure-to-temperature conversion.",
        },
        {
          output: "Diagnostic banner (negative / low / within range / high)",
          meaning:
            "A color-coded interpretation of the number. Negative (red) means vapor in the liquid line — undercharge, a restriction, or non-condensables — so stop and diagnose before adding refrigerant. Below 3°F (amber) suggests undercharge, especially alongside high superheat. 3–15°F (green) covers most residential and commercial TXV systems. Above 15°F (amber) points to overcharge, restricted condenser airflow, or a dirty coil — verify airflow and coil cleanliness before recovering refrigerant.",
        },
        {
          output: "Bubble-curve note (zeotropic blends only)",
          meaning:
            "Appears only for high-glide blends (R-407C, R-454C, R-455A, R-448A, R-449A) to confirm the saturation lookup used the bubble curve rather than the dew curve. Reading subcooling off the dew curve would overstate it by the refrigerant's glide — roughly 11°F for R-407C and up to about 22°F for R-455A — so this note flags that the math is correct for the liquid line.",
        },
        {
          output: "Chart range for the selected refrigerant",
          meaning:
            "The lowest-to-highest temperature the refrigerant's PT data covers. If your liquid pressure converts to a saturation temperature outside this span, the calculator reports that the pressure is out of range instead of a number; transcritical CO2 (R-744) above its critical point has no saturation state and returns no subcooling.",
        },
      ]}
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
          "Saturation temperatures from CoolProp 7.2.0 (Bell, Wronski, Quoilin, Lemort 2014, doi:10.1021/ie4033999), REFPROP-compatible Helmholtz EOS. Target subcooling per equipment manufacturer service literature (Carrier, Trane, Lennox, Daikin, Goodman), the ASHRAE Handbook—Refrigeration (2022), “Equipment and System Dehydrating, Charging, and Testing”, and the ASHRAE Handbook—HVAC Systems and Equipment (2024), “Liquid-Chilling Systems”.",
        workedExample: `R-410A residential AC TXV system, 95°F outdoor:\n  Liquid pressure: 380 PSIG\n  Liquid-line temperature: 100°F\n  Saturation temperature at 380 PSIG: ${workedSat.toFixed(1)}°F (CoolProp 7.2.0)\n  Subcooling = ${workedSat.toFixed(1)} − 100 = ${(workedSat - 100).toFixed(1)}°F\n\nAt the top of the typical 8-12°F TXV target range. TXV systems are charged BY subcooling — adjust refrigerant in 1-2 oz increments until SC lands on target (usually 10°F).`,
      }}
      relatedTools={[
        { href: "/superheat-calculator/", label: "Superheat Calculator", blurb: "Suction-line companion. Together they pin down a system's charge state." },
        { href: "/pt-superheat-subcooling-calculator/", label: "Combined PT / SH / SC", blurb: "All three measurements on one form with pattern-matching diagnostic banner." },
        { href: "/pt-calculator/", label: "PT Calculator", blurb: "Raw saturation lookup for any refrigerant." },
        { href: "/high-head-pressure-causes/", label: "High head pressure causes", blurb: "High SC often signals a condenser-side condition. Diagnostic decision tree." },
        { href: "/system-pressure-diagnostic-calculator/", label: "System Diagnostic", blurb: "Pattern matcher for high/low pressure × high/low SH/SC fingerprints." },
        { href: "/overcharged-ac-symptoms/", label: "Overcharged AC Symptoms", blurb: "8 signs of too much refrigerant — high SC is the definitive fingerprint." },
        { href: "/r410a-charging-chart/", label: "R-410A Charging Chart", blurb: "TXV subcooling target + fixed-orifice superheat matrix on one page." },
        { href: "/high-suction-low-head-pressure/", label: "High Suction Low Head", blurb: "Diagnostic tree for the specific converging-pressure pattern." },
      ]}
      faqs={FAQS}
      bodySections={
        <>
          <MeasurementDiagram variant="subcooling" />
          <RichContent />
        </>
      }
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
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5">Walk-in cooler (medium-temp)</td><td className="py-1.5 text-right font-mono tabular-nums">5-15°F</td><td className="py-1.5 text-xs">ASHRAE Handbook—Refrigeration (2022), “Charging &amp; Testing”</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5">Walk-in freezer (low-temp)</td><td className="py-1.5 text-right font-mono tabular-nums">5-15°F</td><td className="py-1.5 text-xs">ASHRAE Handbook—Refrigeration (2022), “Charging &amp; Testing”</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5">Mini-split with long line set (&gt;50 ft)</td><td className="py-1.5 text-right font-mono tabular-nums">12-15°F</td><td className="py-1.5 text-xs">Mitsubishi, Daikin, LG line-set adjustment tables</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5">Centrifugal chiller at condenser exit</td><td className="py-1.5 text-right font-mono tabular-nums">2-5°F</td><td className="py-1.5 text-xs">ASHRAE Handbook—HVAC Systems and Equipment (2024), “Liquid-Chilling Systems”</td></tr>
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

      {scenariosForPage("/subcooling-calculator/").map((s) => (
        <WorkedScenario key={s.id} scenario={s} />
      ))}

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
            <strong>Ignoring line-set length on mini-splits.</strong>{" "}Long line sets
            (&gt;50 ft) require higher SC at the outdoor unit to deliver adequate SC at the
            indoor TXV. Mitsubishi, Daikin, LG, and Fujitsu all publish line-length
            correction tables — use them.
          </li>
          <li>
            <strong>Reading before steady state.</strong>{" "}Subcooling stabilizes 10-20
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
            temperatures.
          </li>
          <li>
            <strong>ASHRAE Handbook—Refrigeration (2022)</strong> — “Equipment and System
            Dehydrating, Charging, and Testing” (service procedures; target subcooling by
            application for commercial refrigeration).
          </li>
          <li>
            <strong>ASHRAE Handbook—HVAC Systems and Equipment (2024)</strong> — “Liquid-Chilling
            Systems” (centrifugal chiller subcooling targets) and “Condensers” (condenser approach).
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
        Source: ASHRAE Handbook—Refrigeration (2022), ASHRAE HVAC S&amp;E 2024, OEM literature.
      </text>
    </svg>
  );
}
