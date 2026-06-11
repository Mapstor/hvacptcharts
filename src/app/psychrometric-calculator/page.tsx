import type { Metadata } from "next";
import Link from "next/link";
import { Activity, Droplet, Wind, BookOpen, ListChecks, Mountain, Gauge } from "lucide-react";
import { refrigerants } from "@/data/refrigerants";
import { SITE_URL } from "@/lib/schema/shared";
import { CalculatorShell } from "@/components/calculators/shared/CalculatorShell";
import { PsychrometricCalculator } from "@/components/calculators/PsychrometricCalculator";
import {
  ComparisonTable,
  FixCallout,
  Lookups,
  Panel,
  ServiceProblem,
  VerdictBanner,
} from "@/components/calculators/shared/ServiceProblem";
import { TechSection, KeyInsight } from "@/components/refrigerant/TechSection";
import {
  computePsychrometricState,
  atmPressureAtAltitudeFt,
} from "@/lib/psychrometrics";

const PAGE_URL = `${SITE_URL}/psychrometric-calculator/`;
const PUBLISHED = refrigerants[0]?.dataSource.ptChartGeneratedAt ?? new Date().toISOString();

export const metadata: Metadata = {
  title: "Psychrometric Calculator — 7 Air Properties from Any 2 Inputs (ASHRAE + Altitude Correction)",
  description:
    "Compute dry-bulb, wet-bulb, dew point, relative humidity, humidity ratio, enthalpy, and specific volume from any 2 inputs. ASHRAE Handbook 2021 equations with altitude correction. Three worked examples, common-error diagnostics, and the full psychrometric framework HVAC pros use for load, comfort, and condensation analysis.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Psychrometric Calculator — 7 Air Properties from Any 2 Inputs (ASHRAE)",
    description:
      "Free ASHRAE-equation psychrometric calculator with altitude correction, worked examples, and the conceptual framework for HVAC load and comfort analysis.",
    url: PAGE_URL,
    type: "article",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Psychrometric Calculator — ASHRAE Equations, All 7 Air Properties",
    description: "Compute the full air-property state from any 2 inputs, with altitude correction and worked examples.",
    images: ["/twitter-image"],
  },
};

const r2 = (n: number) => (Number.isFinite(n) ? n.toFixed(2) : "—");
const r1 = (n: number) => (Number.isFinite(n) ? n.toFixed(1) : "—");
const r0 = (n: number) => (Number.isFinite(n) ? n.toFixed(0) : "—");

// Precompute example values for inline prose
const EX1 = computePsychrometricState({ mode: "DB_RH", tempDbF: 78, rhPercent: 50, pAtmPsia: 14.696 })!;
const EX2 = computePsychrometricState({ mode: "DB_DP", tempDbF: 92, tempDpF: 75, pAtmPsia: 14.696 })!;
const EX3 = computePsychrometricState({ mode: "DB_RH", tempDbF: 78, rhPercent: 50, pAtmPsia: atmPressureAtAltitudeFt(5280) })!;
const DENVER_P = atmPressureAtAltitudeFt(5280);

const FAQS = [
  {
    q: "What is psychrometrics and why do HVAC technicians need it?",
    a: "Psychrometrics is the thermodynamics of moist air — how dry-bulb temperature, humidity, and atmospheric pressure relate to each other and to the energy content of the air. Every HVAC calculation that involves air carrying or releasing moisture sits on a psychrometric foundation: cooling load (sensible vs latent split), dehumidifier sizing, evaporative cooling effectiveness, condensation risk on cold surfaces, attic ventilation design, indoor air quality, and process-air conditioning for printing, food storage, hospital surgical suites, and semiconductor cleanrooms. A technician who can pull two air-property numbers off a meter and derive the other five is operating with full situational awareness; a technician who can read only what the meter shows is missing half the picture.",
  },
  {
    q: "What are the 7 air properties this calculator computes?",
    a: "(1) Dry-bulb temperature (DB) — what a standard thermometer reads. (2) Wet-bulb temperature (WB) — the temperature an evaporation-cooled wet sock would settle at; lower than DB if the air isn't saturated. (3) Dew point (DP) — the temperature at which water condenses out as the air is cooled at constant pressure; equals DB only at 100% RH. (4) Relative humidity (RH) — actual vapor pressure divided by saturation vapor pressure at DB, expressed as a percentage. (5) Humidity ratio (W) — mass of water vapor per pound of dry air. (6) Enthalpy (h) — total energy per pound of dry air, in BTU/lb. (7) Specific volume (v) — volume per pound of dry air, in ft³/lb. The first four are temperatures; the last three are mass/energy/volume quantities.",
  },
  {
    q: "Which 2 inputs are most useful for field work?",
    a: "Dry-bulb + wet-bulb is the classic field measurement — a sling psychrometer reads both simultaneously, and every other property derives from that pair plus atmospheric pressure. Dry-bulb + relative humidity is the most common when using a digital hygrometer (RH sensor + thermistor combo). Dry-bulb + dew point is useful when you have a chilled-mirror dew-point meter or a high-accuracy digital meter that reports DP directly. The calculator above accepts any of these pairs.",
  },
  {
    q: "Why does altitude matter?",
    a: `Atmospheric pressure drops with elevation, which changes the relationship between vapor pressure and humidity ratio. At sea level (14.696 psia) the standard psychrometric chart applies. At Denver's 5,280 ft elevation atmospheric pressure is about ${r2(DENVER_P)} psia — roughly 17% lower than sea level. The same dry-bulb and RH at Denver hold ${r2((EX3.humidityRatio - EX1.humidityRatio) * 7000)} more grains of water per pound of dry air than at sea level (yes, more — for the same RH, lower atmospheric pressure means more vapor mass at the same partial pressure ratio). Cooling-load calculations done with sea-level assumptions at altitude under-size the latent capacity, leading to systems that never quite catch up on humid days. Always use the altitude correction for installs above ~2,000 ft.`,
  },
  {
    q: "How accurate are the Magnus-form saturation vapor pressure equations vs Hyland-Wexler?",
    a: "Magnus form (used here) is within ±0.3% of the Hyland-Wexler 1983 formulation across the HVAC operating range (32°F to 140°F dry-bulb). Hyland-Wexler is more accurate at extreme temperatures (below freezing, above boiling) but adds computational complexity not justified for HVAC field work. Commercial psychrometric chart software uses Hyland-Wexler; this calculator uses Magnus and prints the same values within rounding. For applications requiring laboratory-grade accuracy (NIST traceability, primary humidity standards) use the ASHRAE Reference equations or NIST PsychroLib directly.",
  },
  {
    q: "What is the difference between humidity ratio (W) and relative humidity (RH)?",
    a: "Humidity ratio is an absolute measurement — the actual mass of water vapor per mass of dry air. Relative humidity is a ratio — how much water the air currently holds divided by how much it could hold at the current temperature. RH changes with temperature even when no moisture is added or removed: take the same outdoor air at 60°F/100% RH (humidity ratio about 0.011 lb/lb) and warm it to 78°F without adding moisture and RH falls to about 56% (humidity ratio unchanged at 0.011 lb/lb). For HVAC load calculations and dehumidifier sizing, humidity ratio is the more useful quantity because it's invariant under sensible-only processes.",
  },
  {
    q: "Can I use this for indoor air quality / mold-risk analysis?",
    a: "Yes — the dew-point output is the direct mold-risk metric. Mold growth requires sustained RH above ~80% at the surface. If indoor air at 70°F has a dew point of 60°F (about 70% RH at 70°F), any surface cooler than 60°F (think exterior walls in winter, cold-water pipes, ductwork) will reach 100% RH at the surface and grow mold. Most residential mold problems are dew-point problems disguised as ventilation problems. Use the calculator to convert your measured indoor DB+RH to dew point, then compare against the coldest surface temperatures in the space.",
  },
  {
    q: "How do I calculate the sensible heat ratio (SHR) of a cooling load?",
    a: "Sensible heat = mass flow × specific heat × ΔT_dry-bulb. Latent heat = mass flow × ΔW × heat of vaporization. SHR = Q_sensible / Q_total. The calculator above gives you the enthalpy of inlet and outlet air, from which Q_total = mass flow × Δh. Q_sensible = mass flow × 0.240 × ΔTdb. SHR = Q_sensible / Q_total. Typical residential cooling SHR is 0.70-0.85 (15-30% latent); commercial spaces with high occupancy can drop to 0.55-0.65. A cooling coil that produces less latent capacity than the load requires will run continuously, drive RH up, and produce comfort complaints even when DB setpoint is met.",
  },
];

const HOWTO_STEPS = [
  {
    title: "Choose your input pair based on what you can measure",
    text: "Sling psychrometer or digital meter with wetted wick → DB + WB. Digital hygrometer with RH sensor → DB + RH. Chilled-mirror dew-point meter → DB + DP. The calculator returns the other 5 properties regardless of which pair you start with.",
  },
  {
    title: "Measure dry-bulb in still air, in shade, away from radiant sources",
    text: "Hold the thermometer or probe 4-6 ft from the floor, away from supply registers, direct sun, light bulbs, and warm equipment. Wait 30-60 seconds for the probe to equilibrate. Typical residential return-air DB: 72-78°F in cooling mode, 68-72°F in heating mode.",
  },
  {
    title: "Measure wet-bulb with a freshly wetted wick",
    text: "If using a sling psychrometer, wet the cotton sock with distilled water, then sling for 60-90 seconds until WB reading stabilizes. If using a digital meter with a WB probe, ensure the wick is saturated before reading. A dry wick reads several degrees low. WB is always ≤ DB; equal to DB only at 100% RH.",
  },
  {
    title: "Adjust for altitude if above 2,000 ft",
    text: "Enter elevation in the calculator. At 5,280 ft (Denver) atmospheric pressure is about 12.2 psia vs 14.7 psia at sea level — a 17% reduction that meaningfully changes humidity ratio and enthalpy outputs for the same DB+RH inputs.",
  },
  {
    title: "Read the derived properties from the calculator",
    text: "The calculator solves the ASHRAE psychrometric equations and returns all 7 properties: DB, WB, DP, RH, humidity ratio (W), grains H₂O/lb dry air, enthalpy (BTU/lb), and specific volume (ft³/lb). Highlighted outputs are calculated from your inputs (not entered).",
  },
  {
    title: "Interpret for the task at hand",
    text: "For comfort analysis: check that 30% ≤ RH ≤ 60% in residential, dew point below coldest surface in the space. For load calculation: enthalpy difference across the cooling coil gives total Q, dry-bulb difference gives sensible Q, ratio gives SHR. For condensation risk: dew point sets the lowest safe surface temperature. For dehumidifier sizing: target latent removal = mass flow × (W_inlet − W_outlet).",
  },
];

const BodySections = (
  <>
    {/* SECTION 01 — Why psychrometrics matters */}
    <section className="mb-12">
      <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
        <span className="font-mono text-sm text-zinc-400">01</span>
        What psychrometrics is and why every HVAC calculation needs it
      </h2>
      <p className="text-zinc-700 dark:text-zinc-300">
        Psychrometrics is the thermodynamics of moist air — the equations relating dry-bulb temperature, water-vapor content, and atmospheric pressure to each other and to the air&apos;s energy content. The discipline gets its own chapter in the ASHRAE Handbook of Fundamentals because virtually every HVAC calculation that involves air carrying or releasing moisture sits on a psychrometric foundation: cooling-load split (sensible vs latent), dehumidifier sizing, evaporative cooler effectiveness, condensation risk on cold surfaces, attic ventilation design, IAQ analysis, and process-air conditioning for printing presses, hospital surgical suites, semiconductor cleanrooms, museum archives, and food storage.
      </p>

      <KeyInsight tone="blue" title="The seven properties — and why two is enough">
        Moist-air state at a given atmospheric pressure is fully specified by any 2 independent properties; the other 5 follow from the ASHRAE equations. So a technician with a sling psychrometer (reading DB + WB) or a digital hygrometer (reading DB + RH) has measured a complete air state. The remaining 5 properties — dew point, humidity ratio, grains/lb, enthalpy, specific volume — derive directly. This calculator does that derivation in milliseconds; before it existed, technicians read the five derived values off a printed psychrometric chart by hand.
      </KeyInsight>

      <p className="mt-4 text-zinc-700 dark:text-zinc-300">
        Why does it matter in the field? Two examples. <strong>Latent load:</strong> a homeowner complains the AC &quot;runs all the time but it&apos;s still sticky.&quot; The thermostat reads 76°F setpoint, dry-bulb 76°F — sensible load is met. But indoor wet-bulb is 70°F and dew point is 68°F: RH is 76%. The coil isn&apos;t removing enough moisture. This is a sensible-heat-ratio problem (the coil is producing too much sensible capacity and not enough latent), invisible to a thermostat that only sees DB. <strong>Condensation:</strong> a commercial building has moisture beading on the cold-water domestic pipes in the ceiling cavity. Indoor air is 72°F / 55% RH — dew point 56°F. The pipes are at 55°F. Pipes are below dew point, condensation is physics. Solution: insulate pipes or run a dehumidifier to lower the dew point below pipe surface temperature.
      </p>
    </section>

    {/* SECTION 02 — The 7 properties explained */}
    <section className="mb-12">
      <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
        <span className="font-mono text-sm text-zinc-400">02</span>
        The 7 air properties — what each one means and when you use it
      </h2>

      <TechSection icon="insight" tone="blue" title="Dry-bulb temperature (DB) — °F">
        What an ordinary thermometer or thermistor reads. This is the temperature you set on a thermostat, the value reported by every commercial HVAC sensor, and the &quot;design temperature&quot; in Manual J load calculations. Range in normal HVAC operation: about 60°F to 100°F indoors, -20°F to 115°F outdoors depending on climate zone. DB by itself tells you nothing about moisture; two air streams at 78°F can have wildly different latent loads.
      </TechSection>

      <TechSection icon="insight" tone="blue" title="Wet-bulb temperature (WB) — °F">
        The temperature a thermometer with a wetted wick settles at while exposed to flowing air. Water evaporates from the wick, cooling the bulb until the rate of evaporative cooling matches the rate of sensible heat gain from the air. WB is always ≤ DB; equal to DB only at 100% RH (no evaporation possible). WB is what cooling-tower performance is rated against and the input axis of the Carrier R-410A charging chart for fixed-orifice systems (see our <Link href="/carrier-410a-charging-chart/" className="underline">Carrier charging chart guide</Link>). Range: 40-85°F covers most HVAC field conditions.
      </TechSection>

      <TechSection icon="insight" tone="blue" title="Dew point (DP) — °F">
        The temperature at which water vapor in the air condenses out — cool the air to dew point and you reach 100% RH; cool below and droplets form. Unlike RH (which changes with temperature), dew point is a stable measure of absolute moisture content: heating or cooling air without adding or removing moisture leaves DP unchanged. DP is the primary metric for condensation risk, mold growth, and comfort: humans perceive &quot;mugginess&quot; based on dew point, not RH (dew point above 65°F = uncomfortable for most people regardless of DB).
      </TechSection>

      <TechSection icon="insight" tone="blue" title="Relative humidity (RH) — %">
        Ratio of actual water-vapor pressure to saturation water-vapor pressure at the current DB, times 100. The intuitive humidity measure most people understand, but mathematically derived rather than directly measured (a &quot;humidity sensor&quot; actually measures DP or capacitance and converts). Useful for comfort (residential target 30-60%), thermal comfort calculations (ASHRAE 55), and equipment specs that quote &quot;operating range 10-90% RH non-condensing.&quot; Misleading for load math: same RH at different temperatures means different humidity ratios.
      </TechSection>

      <TechSection icon="insight" tone="blue" title="Humidity ratio (W) — lb water / lb dry air">
        The mass of water vapor per pound of dry air. The fundamental absolute moisture measurement. Range: about 0.001 lb/lb in cold dry winter air to 0.025 lb/lb in tropical conditions. Humidity ratio is conserved across sensible-only processes (no moisture added/removed) so it&apos;s the right quantity for cooling-coil mass balances, dehumidifier sizing (latent removal = airflow × ΔW × heat of vaporization), and outdoor-air ventilation calculations. Often expressed in grains H₂O per pound dry air (1 lb = 7,000 grains) for HVAC field work — a more readable scale than 4-digit decimals.
      </TechSection>

      <TechSection icon="insight" tone="blue" title="Enthalpy (h) — BTU per lb dry air">
        Total energy content of the moist air per pound of dry air. h = 0.240 × T_db + W × (1061 + 0.444 × T_db). The 0.240 term is sensible enthalpy of dry air; the W × (1061+...) term is the enthalpy of the water vapor including its latent heat of vaporization. Enthalpy is the right metric for cooling-coil and air-mixing analysis: total cooling capacity = airflow × (h_inlet − h_outlet) × ρ. Range: 15-50 BTU/lb covers most HVAC conditions.
      </TechSection>

      <TechSection icon="insight" tone="blue" title="Specific volume (v) — ft³ per lb dry air">
        Volume occupied by one pound of dry air at the current state. The reciprocal of density. Used to convert between volumetric airflow (CFM) and mass flow (lb/hr) for energy and mass-balance calculations. v ≈ 13.3 ft³/lb at standard conditions (70°F, sea level); rises with temperature and altitude. The 4% v difference between 60°F and 90°F air is the source of the &quot;standard air density correction&quot; in fan-curve and duct-pressure calculations.
      </TechSection>
    </section>

    {/* SECTION 03 — Psychrometric chart */}
    <section className="mb-12">
      <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
        <span className="font-mono text-sm text-zinc-400">03</span>
        The psychrometric chart — visualizing the equations
      </h2>
      <p className="text-zinc-700 dark:text-zinc-300">
        The ASHRAE psychrometric chart is the graphical version of this calculator. It plots dry-bulb (x-axis) against humidity ratio (y-axis), with overlaid lines for wet-bulb, dew point, relative humidity, enthalpy, and specific volume. Reading the chart: find your DB on the x-axis, follow up to your RH curve, then read off the other properties from the intersecting lines. The calculator above does the same lookup arithmetically — same equations, same answers, in milliseconds rather than minutes with a printed chart.
      </p>

      <KeyInsight tone="amber" title="Why every HVAC pro should still know how to read the chart">
        The calculator gives you point answers; the chart gives you spatial intuition for processes. Cooling a coil isn&apos;t a single point — it&apos;s a process line that moves down and to the left on the chart (lower DB, lower W). Mixing two air streams plots as a point on the line between them, weighted by mass flow ratio. Adding humidity moves you straight up at constant DB. Reading a process as a line on the chart makes the physics visible in a way that a table of before/after numbers doesn&apos;t.
      </KeyInsight>

      <p className="mt-4 text-zinc-700 dark:text-zinc-300">
        For drawing actual psychrometric process lines, this calculator is the back-end for software that draws the chart (PsyCalc, Psychrometric+, the chart in Carrier HAP, the embedded charts in dehumidifier-sizing software). Use the calculator to find any chart-point arithmetically; use a printed chart to think about process flows visually.
      </p>
    </section>

    {/* SECTION 04 — Altitude */}
    <section className="mb-12">
      <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
        <span className="font-mono text-sm text-zinc-400">04</span>
        Altitude correction — why elevation changes the math
      </h2>
      <p className="text-zinc-700 dark:text-zinc-300">
        Standard psychrometric charts and tables assume sea-level atmospheric pressure (14.696 psia / 101.325 kPa). At altitude, atmospheric pressure drops following the barometric formula:
      </p>
      <pre className="my-3 overflow-x-auto rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs dark:border-zinc-800 dark:bg-zinc-900">
{`P(altitude) = 101.325 × (1 − 2.25577×10⁻⁵ × elevation_meters)^5.2559   [kPa]
            = 14.696 × (1 − 6.8755×10⁻⁶ × elevation_feet)^5.2559     [psia]`}
      </pre>

      <ComparisonTable
        headers={["Location", "Elevation", "Atm. pressure (psia)", "Effect on psychrometrics"]}
        rows={[
          { label: "Sea level (Miami, Houston)", cells: ["0 ft", "14.696", "Standard chart values apply directly"] },
          { label: "Atlanta", cells: ["1,050 ft", `${r2(atmPressureAtAltitudeFt(1050))}`, "Negligible — within chart accuracy"] },
          { label: "Albuquerque", cells: ["5,312 ft", `${r2(atmPressureAtAltitudeFt(5312))}`, "Use altitude-corrected calculator"] },
          { label: "Denver", cells: ["5,280 ft", `${r2(atmPressureAtAltitudeFt(5280))}`, "17% lower pressure → 17% higher humidity ratio at same RH"] },
          { label: "Mexico City", cells: ["7,350 ft", `${r2(atmPressureAtAltitudeFt(7350))}`, "23% lower pressure → significant chart deviation"] },
          { label: "Aspen", cells: ["7,908 ft", `${r2(atmPressureAtAltitudeFt(7908))}`, "Use altitude-specific charts for design"] },
        ]}
      />

      <FixCallout>
        <strong>Practical rule:</strong> below 2,000 ft elevation, sea-level assumptions are within 1-2% of the altitude-corrected answer — fine for field work. Above 2,000 ft, always use altitude-corrected math for load calculations and equipment selection. Mountain-region HVAC contractors who use sea-level psychrometric tables systematically undersize latent capacity, leading to humidity complaints in monsoon season.
      </FixCallout>
    </section>

    {/* SECTION 05 — Worked Example 1 */}
    <section className="mb-12">
      <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
        <span className="font-mono text-sm text-zinc-400">05</span>
        Worked example 1 — Residential comfort target (78°F / 50% RH)
      </h2>
      <ServiceProblem
        number={1}
        title="Verify return-air state matches comfort target"
        refrigerant="(air — not a refrigerant calculation)"
        scenario="Residential cooling. Thermostat setpoint 76°F. You measure return-air dry-bulb 78°F and digital meter reads 50% RH. ENERGY STAR comfort range is 68-78°F at 30-60% RH. Is the system meeting comfort? What's the latent load?"
      >
        <Panel title="Calculator inputs" icon={ListChecks}>
          <Lookups rows={[
            { input: "Mode", output: "DB + RH" },
            { input: "Dry-bulb", output: "78°F" },
            { input: "Relative humidity", output: "50%" },
            { input: "Altitude", output: "0 ft (sea level, 14.696 psia)" },
          ]}/>
        </Panel>
        <Panel title="Computed air state" icon={Gauge}>
          <Lookups rows={[
            { input: "Wet-bulb", output: `${r1(EX1.tempWbF)}°F`, note: "implied by DB + RH" },
            { input: "Dew point", output: `${r1(EX1.tempDpF)}°F`, note: "comfortable — below the 60°F &quot;sticky&quot; threshold" },
            { input: "Humidity ratio", output: `${EX1.humidityRatio.toFixed(4)} lb/lb`, note: `= ${r1(EX1.grainsPerLb)} grains H₂O / lb dry air` },
            { input: "Enthalpy", output: `${r2(EX1.enthalpyBtuPerLb)} BTU/lb`, note: "total energy content per lb dry air" },
            { input: "Specific volume", output: `${r2(EX1.specificVolumeFt3PerLb)} ft³/lb`, note: "density ≈ 0.074 lb/ft³" },
          ]}/>
        </Panel>
        <VerdictBanner status="ok" title="Within comfort range">
          78°F DB / 50% RH puts dew point at {r1(EX1.tempDpF)}°F — well below the 60°F dew-point threshold where most people start perceiving the air as &quot;humid.&quot; RH is at the midpoint of the 30-60% comfort window. The system is meeting both sensible and latent load. The thermostat&apos;s 76°F setpoint vs actual 78°F return is 2°F above target — the system is in mid-cycle catching up; check supply DB to confirm the coil is producing the expected ΔT.
        </VerdictBanner>
        <FixCallout>
          <strong>If RH read 70% instead of 50%</strong> at the same 78°F DB, dew point would rise to about 67°F — into the sticky-feeling zone. The system would be meeting sensible load (DB on-target) but failing latent load. Diagnostic next step: measure supply-air DB and WB to compute coil ΔW (humidity ratio difference); if ΔW is below 0.002 lb/lb the coil is too warm to dehumidify (compressor short-cycling, or oversized equipment that satisfies sensible load before pulling latent).
        </FixCallout>
      </ServiceProblem>
    </section>

    {/* SECTION 06 — Worked Example 2 */}
    <section className="mb-12">
      <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
        <span className="font-mono text-sm text-zinc-400">06</span>
        Worked example 2 — Hot, humid outdoor air (92°F / 75°F DP)
      </h2>
      <ServiceProblem
        number={2}
        title="Design outdoor air state for Houston in August"
        refrigerant="(air — not a refrigerant calculation)"
        scenario="ASHRAE 1% design conditions for Houston: 92°F DB, 75°F mean coincident dew point. You need to compute outdoor enthalpy for an outdoor-air ventilation load calculation."
      >
        <Panel title="Calculator inputs" icon={ListChecks}>
          <Lookups rows={[
            { input: "Mode", output: "DB + DP" },
            { input: "Dry-bulb", output: "92°F" },
            { input: "Dew point", output: "75°F" },
            { input: "Altitude", output: "0 ft (Houston)" },
          ]}/>
        </Panel>
        <Panel title="Computed air state" icon={Gauge}>
          <Lookups rows={[
            { input: "Wet-bulb", output: `${r1(EX2.tempWbF)}°F`, note: "comparable to sling psychrometer reading" },
            { input: "Relative humidity", output: `${r1(EX2.rhPercent)}%`, note: "high humidity for the DB" },
            { input: "Humidity ratio", output: `${EX2.humidityRatio.toFixed(4)} lb/lb`, note: `= ${r1(EX2.grainsPerLb)} grains H₂O / lb dry air` },
            { input: "Enthalpy", output: `${r2(EX2.enthalpyBtuPerLb)} BTU/lb`, note: "design outdoor air enthalpy for load math" },
          ]}/>
        </Panel>
        <VerdictBanner status="info" title="Use this enthalpy for outdoor-air ventilation load">
          For a building with 500 CFM of outdoor-air ventilation: mass flow ≈ 500 / {r2(EX2.specificVolumeFt3PerLb)} ≈ {r0((500 / EX2.specificVolumeFt3PerLb) * 60)} lb/hr. If indoor enthalpy is {r2(EX1.enthalpyBtuPerLb)} BTU/lb (78°F / 50% RH from example 1), the outdoor-air sensible+latent load is roughly: 500 × 60 / {r2(EX2.specificVolumeFt3PerLb)} × ({r2(EX2.enthalpyBtuPerLb)} − {r2(EX1.enthalpyBtuPerLb)}) ≈ {r0(500 * 60 / EX2.specificVolumeFt3PerLb * (EX2.enthalpyBtuPerLb - EX1.enthalpyBtuPerLb))} BTU/hr. That&apos;s {r1(500 * 60 / EX2.specificVolumeFt3PerLb * (EX2.enthalpyBtuPerLb - EX1.enthalpyBtuPerLb) / 12000)} tons of cooling capacity just for outdoor-air conditioning.
        </VerdictBanner>
      </ServiceProblem>
    </section>

    {/* SECTION 07 — Worked Example 3 (altitude) */}
    <section className="mb-12">
      <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
        <span className="font-mono text-sm text-zinc-400">07</span>
        Worked example 3 — Altitude effect (78°F / 50% RH at Denver elevation)
      </h2>
      <ServiceProblem
        number={3}
        title="Same DB and RH, different altitude — how much do the other properties shift?"
        refrigerant="(air — not a refrigerant calculation)"
        scenario="Compare the residential comfort state from example 1 (78°F / 50% RH at sea level) to the same DB and RH at Denver's 5,280 ft elevation. How much does the lower atmospheric pressure shift the derived properties?"
      >
        <Panel title="Side-by-side" icon={Mountain}>
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-900">
              <tr>
                <th className="px-3 py-2 text-left font-mono text-xs">Property</th>
                <th className="px-3 py-2 text-left font-mono text-xs">Sea level (14.696 psia)</th>
                <th className="px-3 py-2 text-left font-mono text-xs">Denver ({r2(DENVER_P)} psia)</th>
                <th className="px-3 py-2 text-left font-mono text-xs">Δ</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="px-3 py-2 font-mono">Wet-bulb</td><td className="px-3 py-2 font-mono">{r1(EX1.tempWbF)}°F</td><td className="px-3 py-2 font-mono">{r1(EX3.tempWbF)}°F</td><td className="px-3 py-2 font-mono">{r1(EX3.tempWbF - EX1.tempWbF)}°F</td></tr>
              <tr><td className="px-3 py-2 font-mono">Dew point</td><td className="px-3 py-2 font-mono">{r1(EX1.tempDpF)}°F</td><td className="px-3 py-2 font-mono">{r1(EX3.tempDpF)}°F</td><td className="px-3 py-2 font-mono">{r1(EX3.tempDpF - EX1.tempDpF)}°F</td></tr>
              <tr><td className="px-3 py-2 font-mono">Humidity ratio</td><td className="px-3 py-2 font-mono">{EX1.humidityRatio.toFixed(4)}</td><td className="px-3 py-2 font-mono">{EX3.humidityRatio.toFixed(4)}</td><td className="px-3 py-2 font-mono">+{((EX3.humidityRatio - EX1.humidityRatio) / EX1.humidityRatio * 100).toFixed(1)}%</td></tr>
              <tr><td className="px-3 py-2 font-mono">Grains/lb</td><td className="px-3 py-2 font-mono">{r1(EX1.grainsPerLb)}</td><td className="px-3 py-2 font-mono">{r1(EX3.grainsPerLb)}</td><td className="px-3 py-2 font-mono">+{r1(EX3.grainsPerLb - EX1.grainsPerLb)}</td></tr>
              <tr><td className="px-3 py-2 font-mono">Enthalpy</td><td className="px-3 py-2 font-mono">{r2(EX1.enthalpyBtuPerLb)}</td><td className="px-3 py-2 font-mono">{r2(EX3.enthalpyBtuPerLb)}</td><td className="px-3 py-2 font-mono">+{r2(EX3.enthalpyBtuPerLb - EX1.enthalpyBtuPerLb)} BTU/lb</td></tr>
              <tr><td className="px-3 py-2 font-mono">Specific volume</td><td className="px-3 py-2 font-mono">{r2(EX1.specificVolumeFt3PerLb)}</td><td className="px-3 py-2 font-mono">{r2(EX3.specificVolumeFt3PerLb)}</td><td className="px-3 py-2 font-mono">+{r2(EX3.specificVolumeFt3PerLb - EX1.specificVolumeFt3PerLb)} ft³/lb</td></tr>
            </tbody>
          </table>
        </Panel>
        <VerdictBanner status="warn" title="Altitude meaningfully shifts the latent half of HVAC math">
          Same DB + RH, but Denver air at 5,280 ft holds {((EX3.humidityRatio / EX1.humidityRatio - 1) * 100).toFixed(0)}% more water by mass per pound of dry air than sea-level air. Specific volume is {((EX3.specificVolumeFt3PerLb / EX1.specificVolumeFt3PerLb - 1) * 100).toFixed(0)}% higher (thinner air). Enthalpy is {(EX3.enthalpyBtuPerLb - EX1.enthalpyBtuPerLb).toFixed(2)} BTU/lb higher. A cooling-load calculation done with sea-level psychrometric tables at Denver under-sizes the latent capacity by roughly the same percentage — which is why Front Range HVAC contractors use altitude-corrected design software (Wrightsoft, Carrier HAP) rather than sea-level rules of thumb.
        </VerdictBanner>
      </ServiceProblem>
    </section>

    {/* SECTION 08 — Common errors */}
    <section className="mb-12">
      <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
        <span className="font-mono text-sm text-zinc-400">08</span>
        Common measurement errors and how to avoid them
      </h2>

      <TechSection icon="problem" tone="amber" title="Error 1 — Wet-bulb with a dry wick">
        A sling psychrometer with a dry cotton sock reads several degrees above true wet-bulb. The error feeds straight through the calculator to depress dew point and inflate RH. Always wet the wick with distilled water immediately before slinging; in low-humidity environments wet it twice (it dries out faster). After slinging, the WB reading should be visibly lower than DB — if both temperatures are equal you either have 100% RH (very rare indoors) or a dry wick.
      </TechSection>

      <TechSection icon="problem" tone="amber" title="Error 2 — Digital hygrometer RH drift">
        Capacitive RH sensors in digital hygrometers drift over time; a meter that read accurately 2 years ago can be 5-10% off today. Most consumer hygrometers should be re-calibrated annually using the salt-test method (saturated NaCl solution in a sealed jar = 75.3% RH at 70°F). If your reading at the salt-test reference deviates more than ±2% from 75.3%, the meter is out of spec and the calculator output is propagating that error.
      </TechSection>

      <TechSection icon="problem" tone="amber" title="Error 3 — Dry-bulb reading affected by radiant sources">
        A thermometer in direct sunlight or near a warm surface reads several degrees above the true air temperature. Symptom: RH calculation comes out lower than actual because high DB makes saturation vapor pressure look larger relative to actual vapor pressure. Always measure DB in shade, away from direct radiant sources (windows, light fixtures, warm equipment), and let the probe equilibrate for at least 60 seconds.
      </TechSection>

      <TechSection icon="problem" tone="amber" title="Error 4 — Ignoring altitude correction">
        Above ~2,000 ft elevation, using sea-level atmospheric pressure (14.696 psia) in the calculator under-reports humidity ratio and enthalpy. Symptom: cooling load calculations from sea-level rules of thumb undersize equipment for the actual altitude. Always enter local elevation in the altitude field; if you don&apos;t know your elevation, look up the address in a topographic database (USGS has a free elevation API).
      </TechSection>

      <TechSection icon="problem" tone="amber" title="Error 5 — Reading transient conditions">
        Air properties measured in the first few minutes after opening a door, turning on a humidifier, or starting an HVAC system are transient values, not steady-state. Always let the space stabilize for at least 15 minutes after any disturbance before recording values used for load calculations or condensation-risk analysis. Continuous-logging hygrometers help identify when a space has truly stabilized vs when you&apos;re reading a transient.
      </TechSection>
    </section>

    {/* SECTION 09 — Related */}
    <section className="mb-12">
      <h2 className="mb-4 flex items-baseline gap-3 text-2xl font-semibold tracking-tight">
        <span className="font-mono text-sm text-zinc-400">09</span>
        Related calculations and tools
      </h2>
      <ul className="space-y-3 text-zinc-700 dark:text-zinc-300">
        <li>
          <strong>Sensible Heat Ratio (SHR):</strong> ratio of sensible cooling to total cooling. Compute as 0.240 × ΔT_db / Δh. The calculator above gives Δh; multiply your coil ΔT_db by 0.240 to get sensible side and divide. Typical residential SHR 0.70-0.85.
        </li>
        <li>
          <strong>Cooling load (outdoor-air ventilation):</strong> mass flow × Δh × 60. The calculator gives Δh; multiply by CFM × 60 ÷ specific volume.
        </li>
        <li>
          <strong>Dehumidifier sizing:</strong> latent removal capacity needed = mass flow × ΔW × 1061 BTU/lb (heat of vaporization). The calculator gives ΔW between inlet and target outlet states.
        </li>
        <li>
          <strong>Evaporative cooler effectiveness:</strong> effectiveness = (DB_in − DB_out) / (DB_in − WB_in). Use the calculator to find WB_in, then evaporative-cooled outlet DB = DB_in − effectiveness × (DB_in − WB_in).
        </li>
        <li>
          <strong>Condensation risk:</strong> measure indoor DB+RH → compute dew point with the calculator → compare to coldest surface temperatures in the space. Surfaces below dew point will condense moisture.
        </li>
      </ul>
    </section>
  </>
);

export default function PsychrometricCalculatorPage() {
  return (
    <CalculatorShell
      schema={{
        path: "psychrometric-calculator",
        name: "Psychrometric Calculator — 7 Air Properties from Any 2 Inputs",
        description:
          "Compute dry-bulb, wet-bulb, dew point, relative humidity, humidity ratio, enthalpy, and specific volume from any 2 inputs using ASHRAE Handbook of Fundamentals 2021 psychrometric equations. Altitude correction supported.",
        featureList: [
          "Any 2 of {DB, WB, RH, DP} as input, returns all 7 derived properties",
          "Altitude correction for elevations 0-10,000 ft",
          "ASHRAE Handbook Fundamentals 2021 equation set (Magnus saturation vapor pressure)",
          "Humidity ratio in lb/lb and grains/lb (HVAC field units)",
          "Enthalpy in BTU/lb dry air for cooling-coil and ventilation load calculations",
          "Specific volume for mass-flow conversions",
        ],
        publishedDate: PUBLISHED,
        breadcrumbLabel: "Psychrometric Calculator",
      }}
      introOneLiner="Enter any 2 air properties — DB, WB, RH, or dew point — plus altitude, and the calculator returns all 7 properties (DB, WB, DP, RH, humidity ratio, grains/lb, enthalpy, specific volume) using ASHRAE Handbook 2021 equations."
      howTo={{ steps: HOWTO_STEPS.map((s) => `${s.title}: ${s.text}`) }}
      math={{
        formula: "Pws (Magnus): Pws_kPa = 0.61078 × exp(17.27 × T_C / (T_C + 237.3))\nW: W = 0.621945 × Pw / (P − Pw)\nh: h = 0.240 × Tdb + W × (1061 + 0.444 × Tdb) BTU/lb dry air\nWB: iterative solve of ((1093 − 0.556 × Twb) × Ws(Twb) − 0.240 × (Tdb − Twb)) / (1093 + 0.444 × Tdb − Twb) = W",
        sourceCitation: "ASHRAE Handbook of Fundamentals 2021, Chapter 1: Psychrometrics. Saturation vapor pressure: Magnus formula (±0.3% accuracy vs Hyland-Wexler 1983 in the HVAC operating range).",
        workedExample: `Input: 78°F DB, 50% RH, sea level (14.696 psia).\nSaturation vapor pressure at 78°F: Pws = 0.61078 × exp(17.27 × 25.6 / (25.6 + 237.3)) = 3.30 kPa = ${r2(EX1.satVaporPressurePsia)} psia.\nActual vapor pressure: Pw = 0.50 × ${r2(EX1.satVaporPressurePsia)} = ${r2(EX1.vaporPressurePsia)} psia.\nHumidity ratio: W = 0.621945 × ${r2(EX1.vaporPressurePsia)} / (14.696 − ${r2(EX1.vaporPressurePsia)}) = ${EX1.humidityRatio.toFixed(4)} lb/lb.\nEnthalpy: h = 0.240 × 78 + ${EX1.humidityRatio.toFixed(4)} × (1061 + 0.444 × 78) = ${r2(EX1.enthalpyBtuPerLb)} BTU/lb.\nDew point: solve Pws(Tdp) = ${r2(EX1.vaporPressurePsia)} → Tdp = ${r1(EX1.tempDpF)}°F.\nWet-bulb (iterative): Twb = ${r1(EX1.tempWbF)}°F.`,
      }}
      relatedTools={[
        { href: "/superheat-calculator/", label: "Superheat calculator", blurb: "From suction PSIG + line °F → superheat. Pairs with psychrometrics for full coil analysis." },
        { href: "/subcooling-calculator/", label: "Subcooling calculator", blurb: "Liquid line PSIG + °F → SC. TXV charging metric." },
        { href: "/refrigerant-charge-calculator/", label: "Refrigerant charge calculator", blurb: "Line-set adjustment to nameplate charge." },
        { href: "/carrier-410a-charging-chart/", label: "Carrier R-410A charging chart", blurb: "Wet-bulb × outdoor dry-bulb → target superheat for fixed-orifice systems." },
        { href: "/refrigerant-safety-classifications/", label: "Safety classifications", blurb: "ASHRAE 34 reference for all 61 refrigerants in our dataset." },
        { href: "/high-head-pressure-causes/", label: "High head pressure causes", blurb: "Diagnostic decision tree for high-side problems." },
      ]}
      faqs={FAQS}
      generatedDate={PUBLISHED.slice(0, 10)}
      bodySections={BodySections}
    >
      <PsychrometricCalculator />
    </CalculatorShell>
  );
}

// Suppress unused import warnings for icons used in JSX components above
void [Activity, Droplet, Wind, BookOpen];
