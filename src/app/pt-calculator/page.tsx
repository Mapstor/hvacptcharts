import type { Metadata } from "next";
import { Activity, Calculator as CalcIcon, Gauge, Table as TableIcon } from "lucide-react";
import { refrigerants, getRefrigerant, getPressureAtTempF } from "@/data/refrigerants";
import { CalculatorShell } from "@/components/calculators/shared/CalculatorShell";
import { PtCalculator } from "@/components/calculators/PtCalculator";
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
import { RefrigerantGlide } from "@/components/refrigerant/RefrigerantGlide";
import { SITE_URL } from "@/lib/schema/shared";

const PUBLISHED = refrigerants[0]?.dataSource.ptChartGeneratedAt ?? new Date().toISOString();

const FAQS = [
  {
    q: "What's the difference between PSI, PSIG, and PSIA?",
    a: "PSI is a generic pressure unit (pounds per square inch). PSIG is gauge pressure — pressure above atmospheric (0 PSIG = 14.696 PSIA at sea level). PSIA is absolute pressure measured from a perfect vacuum. Service manifold gauges read in PSIG. All values on this calculator and across hvacptcharts.com are PSIG unless explicitly stated as PSIA. Convert with PSIA = PSIG + 14.696.",
  },
  {
    q: "Why do some refrigerants show two pressures (bubble and dew)?",
    a: "Zeotropic blends boil and condense across a temperature range at constant pressure rather than at a single temperature. The bubble pressure is the saturation pressure of the liquid (where vapor first forms); the dew pressure is the saturation pressure of the vapor (where the last liquid disappears). The temperature difference at the same pressure is the glide. For pure refrigerants (R-22, R-134a, R-32) and azeotropes (R-507A, R-500) the two values coincide.",
  },
  {
    q: "How accurate is the calculator?",
    a: "Saturation pressures come from CoolProp 7.2.0 (REFPROP-compatible Helmholtz EOS). For pure refrigerants and predefined CoolProp mixtures, accuracy is typically better than ±0.5% across the operating range. For the 11 manufacturer-blend refrigerants not modeled by CoolProp (R-448A, R-450A, R-1336mzz(Z), etc.) values come directly from the named manufacturer's PT chart with the same accuracy as the source datasheet.",
  },
  {
    q: "What temperature range does the calculator cover?",
    a: "Default coverage is -40°F to 150°F at 1°F increments — 191 data points per refrigerant. Sub-critical refrigerants are truncated at their critical temperature where no saturation state exists. R-744 (CO2) stops at 87°F (critical temperature 87.8°F); R-13 at 84°F; R-1150 (ethylene) at 48°F. Outside the chart range the calculator returns 'out of range' rather than extrapolating values that don't correspond to physical saturation.",
  },
  {
    q: "Can I get PT values in metric units?",
    a: "Yes — toggle the unit set to °C / kPa. The kPa values are gauge (kPa above atmospheric, where atmospheric is 101.325 kPa). For absolute kPa, add 101.325. The calculator handles both unit systems with the same underlying CoolProp data.",
  },
  {
    q: "How does this PT calculator differ from the superheat and subcooling calculators?",
    a: "The PT calculator does pressure-to-temperature lookup in either direction — it answers 'what's the saturation pressure at this temperature?' or 'what's the saturation temperature at this pressure?' The superheat and subcooling calculators add the line-temperature input and compute the temperature difference: superheat = suction line temperature − saturation temperature at suction pressure (using the dew curve for blends); subcooling = saturation temperature at discharge pressure (bubble curve for blends) − liquid line temperature.",
  },
  {
    q: "Why do operating pressures differ from saturation pressures?",
    a: "Saturation pressure is the thermodynamic equilibrium pressure at a given temperature. Operating pressure on a running system depends on refrigerant charge, ambient temperature, indoor load, superheat, subcooling, and line pressure drop. The PT chart gives the reference value; actual gauge readings on a running system vary around the saturation reference based on these operating factors.",
  },
  {
    q: "Can I use the calculator for retrofit decisions?",
    a: "Yes — the PT calculator is useful for understanding the pressure envelope of candidate retrofit refrigerants relative to the original equipment design. Compare R-22 saturation values to R-407C bubble/dew values to see the retrofit pressure delta. Compare R-410A to R-32 saturation to confirm the small 5-8% pressure increase that R-32 introduces. For pair comparisons with full retrofit guidance, use the refrigerant comparison and retrofit compatibility tools.",
  },
];

export const metadata: Metadata = {
  title: "PT Calculator — Refrigerant Saturation Pressure & Temperature Lookup",
  description:
    "Bidirectional pressure-temperature calculator for 50+ HVAC refrigerants with bubble/dew handling for zeotropic blends. Verified CoolProp 7.2.0 data, worked examples for residential AC, commercial refrigeration, chillers, mobile AC, transcritical CO2.",
  alternates: { canonical: `${SITE_URL}/pt-calculator/` },
};

export default function PtCalculatorPage() {
  return (
    <CalculatorShell
      schema={{
        path: "pt-calculator",
        name: "PT Calculator",
        description:
          "Pressure-temperature calculator for HVAC refrigerants. Bidirectional: enter temperature to get saturation pressure, or pressure to get saturation temperature. Bubble and dew handling for zeotropic blends.",
        featureList: [
          "50+ refrigerants with verified CoolProp 7.2.0 data",
          "Bidirectional: temperature to pressure or pressure to temperature",
          "Bubble and dew curves for zeotropic blends",
          "Imperial (°F, PSIG) and metric (°C, kPa) units",
          "No signup, no paywall, mobile-friendly",
          "Worked examples for residential AC, commercial refrigeration, chillers, mobile AC, transcritical CO2",
        ],
        publishedDate: PUBLISHED,
        breadcrumbLabel: "PT Calculator",
      }}
      introOneLiner="Enter a temperature or a pressure for any refrigerant in the dataset; get the corresponding saturation value, with bubble/dew handling for zeotropic blends and ten-plus worked examples covering the full range of HVAC service scenarios."
      generatedDate={PUBLISHED.slice(0, 10)}
      howTo={{
        steps: [
          "Pick a refrigerant from the dropdown. Defaults to R-410A.",
          "Choose direction: 'Pressure from temperature' (PT chart lookup) or 'Temperature from pressure' (inverse).",
          "Adjust unit toggles if you need metric values (°C / kPa).",
          "Enter your value. The result updates immediately, with both bubble and dew for zeotropic blends.",
          "Cross-reference against the equipment data plate and the worked examples below to interpret the result for your specific scenario.",
        ],
        commonErrors: [
          "Confusing PSIG (gauge) with PSIA (absolute). Manifold gauges read PSIG; PSIA = PSIG + 14.696.",
          "Using the bubble pressure for superheat math on a zeotropic blend — use the dew pressure instead. The superheat calculator handles this automatically when a zeotropic blend is selected.",
          "Treating saturation pressure as operating pressure. Saturation is the thermodynamic reference; operating pressure depends on charge, ambient, load, superheat, and subcooling.",
          "Extrapolating beyond the chart range. R-744 has no saturation state above 87.8°F (the critical temperature); the calculator returns 'out of range' rather than producing a fabricated value.",
        ],
      }}
      math={{
        formula:
          "P_sat = f(T)  or  T_sat = f(P)\n\nLinear interpolation between adjacent 1°F data points in the refrigerant's PT chart. For zeotropic blends, both bubble (saturated liquid) and dew (saturated vapor) curves are interpolated independently.",
        sourceCitation:
          "Saturation pressures from CoolProp 7.2.0 (Bell, Wronski, Quoilin, Lemort 2014, doi:10.1021/ie4033999), REFPROP-compatible Helmholtz EOS. For the 11 manufacturer-blend refrigerants not in CoolProp's reference library (R-448A, R-450A, R-1336mzz(Z), R-454C blended-data-mode, etc.), values come from the named manufacturer PT charts cited on each refrigerant's detail page. Cross-checked against AHRI Standard 700-2019 refrigerant specifications.",
        workedExample:
          "R-410A at 70°F: CoolProp returns P_bubble = 201.76 PSIG, P_dew = 201.07 PSIG (0.7 PSI glide — near-azeotropic).\n\nR-407C at 70°F: CoolProp returns P_bubble = 140.52 PSIG, P_dew = 117.29 PSIG (23 PSI glide — significant zeotrope).\n\nR-744 (CO2) at 70°F: P_sat = 838.13 PSIG. Above 87.8°F (the critical point) no saturation state exists and the chart truncates.\n\nR-32 at 95°F: 296 PSIG saturation. R-410A at 95°F: 278 PSIG. The 5-8 percent R-32 pressure premium over R-410A is consistent across the operating envelope.",
      }}
      relatedTools={[
        { href: "/superheat-calculator/", label: "Superheat Calculator", blurb: "Suction-line PSIG plus measured °F to superheat, with diagnostic context." },
        { href: "/subcooling-calculator/", label: "Subcooling Calculator", blurb: "Liquid-line PSIG plus measured °F to subcooling." },
        { href: "/pt-superheat-subcooling-calculator/", label: "Combined SH/SC/PT", blurb: "Both sides plus pattern-matching diagnostic banner in one workflow." },
        { href: "/refrigerant-pt-comparison-tool/", label: "PT Comparison Tool", blurb: "Overlay 2-4 refrigerants' PT curves for side-by-side comparison." },
        { href: "/refrigerant-retrofit-compatibility-calculator/", label: "Retrofit Compatibility", blurb: "Pair comparison: lubricant, safety class, pressure envelope, glide." },
      ]}
      faqs={FAQS}
      bodySections={<RichContent />}
    >
      <PtCalculator />
    </CalculatorShell>
  );
}

/* ──────────────────────── Body content ──────────────────────── */

function RichContent() {
  return (
    <>
      <TechSection icon="chart" tone="blue" title="What the PT calculator actually computes">
        <p>
          A PT calculator converts between refrigerant saturation pressure and saturation
          temperature at thermodynamic equilibrium. Pick a temperature, get the saturation
          pressure; pick a pressure, get the saturation temperature.
        </p>
        <p>
          The math is direct lookup against the refrigerant&apos;s PT chart, interpolated
          linearly between the 1°F data points in the underlying dataset. The relationship is
          fundamental to vapor-compression refrigeration. Any point where liquid and vapor
          coexist — broadly, the evaporator and condenser — sits on the saturation curve.
        </p>
        <PtCurvesOverlay />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Four representative refrigerants on a single PT chart, showing how saturation
          pressure rises with temperature. Source: CoolProp 7.2.0 saturation data, plotted
          over the −40°F to 130°F service range.
        </p>
        <KeyInsight tone="emerald" icon="insight" title="One thermodynamic relationship powers the whole tool">
          Every superheat measurement, every subcooling check, every charging procedure, and
          every retrofit pressure comparison traces back to the underlying PT lookup. The
          calculator on this page does the lookup; the worked examples below show how to
          apply it across the major HVAC scenarios.
        </KeyInsight>
      </TechSection>

      <TechSection
        icon="composition"
        tone="purple"
        title="Pure refrigerants vs zeotropic blends — why bubble and dew matter"
      >
        <p>
          Pure refrigerants (R-22, R-32, R-134a, R-744) have a single saturation curve — at any
          pressure there is one saturation temperature. Azeotropic blends (R-507A, R-500,
          R-502) behave the same way because their component proportions are engineered for
          zero-glide behavior.
        </p>
        <p>
          Zeotropic blends (R-407C, R-454C, R-455A, R-448A, R-449A) have two saturation curves
          at any pressure: bubble, where the first vapor forms when heating the liquid, and
          dew, where the last liquid disappears when condensing the vapor. The temperature
          difference between bubble and dew at the same pressure is the temperature glide.
        </p>
        <RefrigerantGlide slug="r-407c" atTempF={40} />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Glide visualization for R-407C across a typical residential evaporator coil at 40°F
          bubble. Source: CoolProp 7.2.0 saturation data.
        </p>
        <p>
          For service measurement, the curve selection matters. Suction-line superheat uses
          the dew temperature at suction pressure as the saturation reference; liquid-line
          subcooling uses the bubble temperature at discharge pressure. Wrong-curve selection
          introduces measurement error equal to the glide.
        </p>
        <GlideBars />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Temperature glide across common HVAC blends, measured as bubble-minus-dew at 0°C
          (CoolProp 7.2.0 dataset value). Pure refrigerants and azeotropes have zero glide and
          are omitted.
        </p>
      </TechSection>

      <TechSection
        icon="service"
        tone="amber"
        title="Real service problems solved with the PT chart"
      >
        <p>
          Ten field scenarios spanning residential AC, commercial refrigeration, chillers,
          mobile AC, transcritical CO2, and heat pumps. Each shows what gets measured at the
          manifold, the PT chart lookups that convert pressures to saturation temperatures,
          the derived superheat / subcooling values, and a verdict on what to do next.
        </p>
      </TechSection>

      <ServiceProblem
        number={1}
        refrigerant="R-410A"
        title="Verifying R-410A charge on a 95°F day"
        scenario="3-ton residential R-410A central AC, 95°F outdoor ambient, 75°F indoor return air, TXV metering device. The system has been running 20 minutes at steady state and you want to confirm charge before signing off."
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
              { input: "130 PSIG", output: "45°F sat", note: "evaporator saturation" },
              { input: "380 PSIG", output: "111°F sat", note: "condenser saturation" },
            ]}
          />
        </Panel>
        <Panel title="Derived" icon={Activity}>
          <Derived
            rows={[
              { formula: "Superheat = 60°F − 45°F = 15°F", verdict: "ok", note: "in target 8-15°F" },
              { formula: "Subcooling = 111°F − 100°F = 11°F", verdict: "ok", note: "in target 8-12°F" },
            ]}
          />
        </Panel>
        <VerdictBanner status="ok" title="Properly charged — no service action">
          Superheat and subcooling both sit inside the standard target ranges; suction and
          discharge match what we expect at 95°F design ambient. Sign off and move on.
        </VerdictBanner>
      </ServiceProblem>

      <ServiceProblem
        number={2}
        refrigerant="R-410A"
        title="Spotting an R-410A undercharge after a leak repair"
        scenario="Same 3-ton residential R-410A system, just back from a leak repair at the evaporator. You suspect the recharge wasn't complete and want to confirm before the customer calls back when the weather warms up."
      >
        <Panel title="Measured at the manifold" icon={Gauge}>
          <Gauges
            items={[
              { label: "Suction P", value: "100 PSIG", side: "low" },
              { label: "Suction line", value: "65°F", side: "low" },
              { label: "Discharge P", value: "320 PSIG", side: "high" },
              { label: "Liquid line", value: "105°F", side: "high" },
            ]}
          />
        </Panel>
        <Panel title="PT chart lookup (R-410A)" icon={CalcIcon}>
          <Lookups
            rows={[
              { input: "100 PSIG", output: "31°F sat", note: "evaporator saturation" },
              { input: "320 PSIG", output: "99°F sat", note: "condenser saturation" },
            ]}
          />
        </Panel>
        <Panel title="Derived" icon={Activity}>
          <Derived
            rows={[
              { formula: "Superheat = 65°F − 31°F = 34°F", verdict: "bad", note: "high — should be 8-15°F" },
              { formula: "Subcooling = 99°F − 105°F = −6°F", verdict: "bad", note: "negative — flash gas in liquid line" },
            ]}
          />
        </Panel>
        <VerdictBanner status="bad" title="Classic undercharge fingerprint">
          Negative subcooling means vapor is reaching the metering device; high superheat
          means the evaporator is starving for liquid. Both lower-than-spec pressures and
          these derived values point to one cause: insufficient refrigerant in the system.
        </VerdictBanner>
        <FixCallout>
          Confirm the leak is fully repaired (EPA Section 608 requires this before adding
          refrigerant), then charge by weight to nameplate using a recovery/charging scale.
          Re-test superheat and subcooling at steady state to confirm the fix.
        </FixCallout>
      </ServiceProblem>

      <ServiceProblem
        number={3}
        refrigerant="R-410A"
        title="Catching an R-410A overcharge from a prior service add"
        scenario="Same 3-ton residential R-410A system. A previous tech topped off by gauge feel rather than by weight. The compressor is running noisy and the customer is reporting higher power bills."
      >
        <Panel title="Measured at the manifold" icon={Gauge}>
          <Gauges
            items={[
              { label: "Suction P", value: "160 PSIG", side: "low" },
              { label: "Suction line", value: "55°F", side: "low" },
              { label: "Discharge P", value: "480 PSIG", side: "high" },
              { label: "Liquid line", value: "90°F", side: "high" },
            ]}
          />
        </Panel>
        <Panel title="PT chart lookup (R-410A)" icon={CalcIcon}>
          <Lookups
            rows={[
              { input: "160 PSIG", output: "55°F sat", note: "evaporator saturation" },
              { input: "480 PSIG", output: "130°F sat", note: "condenser saturation" },
            ]}
          />
        </Panel>
        <Panel title="Derived" icon={Activity}>
          <Derived
            rows={[
              { formula: "Superheat = 55°F − 55°F = 0°F", verdict: "bad", note: "zero — slugging risk to compressor" },
              { formula: "Subcooling = 130°F − 90°F = 40°F", verdict: "bad", note: "very high — excess liquid in condenser" },
            ]}
          />
        </Panel>
        <VerdictBanner status="bad" title="Overcharge — liquid is reaching the compressor">
          Zero superheat with 40°F subcooling is the classic overcharge fingerprint. Excess
          refrigerant backs up in the condenser (high subcooling) and saturated liquid
          reaches the compressor suction (zero superheat); continued operation risks valve
          damage or hydraulic lock.
        </VerdictBanner>
        <FixCallout>
          Recover refrigerant in 1 oz increments, re-testing superheat and subcooling after
          each step. Stop when superheat reaches 8-15°F and subcooling reaches 8-12°F.
        </FixCallout>
      </ServiceProblem>

      <ServiceProblem
        number={4}
        refrigerant="R-454C (zeotropic, ~14°F glide)"
        title="Charging a wide-glide R-454C walk-in freezer"
        scenario="R-454C walk-in freezer, -20°F target evaporator temperature, 95°F ambient. R-454C has roughly 14°F glide so curve selection matters: dew at suction for superheat, bubble at discharge for subcooling."
      >
        <Panel title="Measured at the manifold" icon={Gauge}>
          <Gauges
            items={[
              { label: "Suction P", value: "7 PSIG", side: "low" },
              { label: "Suction line", value: "5°F", side: "low" },
              { label: "Discharge P", value: "200 PSIG", side: "high" },
              { label: "Liquid line", value: "95°F", side: "high" },
            ]}
          />
        </Panel>
        <Panel title="PT chart lookup (R-454C — dual curves)" icon={CalcIcon}>
          <Lookups
            rows={[
              { input: "7 PSIG dew", output: "−20°F sat", note: "evap outlet — use for superheat" },
              { input: "7 PSIG bubble", output: "−34°F sat", note: "evap inlet — reference only" },
              { input: "200 PSIG bubble", output: "88°F sat", note: "cond outlet — use for subcooling" },
              { input: "200 PSIG dew", output: "74°F sat", note: "cond inlet — reference only" },
            ]}
          />
        </Panel>
        <Panel title="Derived" icon={Activity}>
          <Derived
            rows={[
              { formula: "Superheat (dew) = 5°F − (−20°F) = 25°F", verdict: "warn", note: "high end of 10-20°F target" },
              { formula: "Subcooling check: 95°F liquid vs 88°F bubble = −7°F", verdict: "bad", note: "liquid warmer than saturation — no subcooling" },
            ]}
          />
        </Panel>
        <VerdictBanner status="bad" title="Insufficient subcooling — condenser-side issue">
          Liquid line warmer than the bubble at discharge means the condenser is not
          subcooling — likely undercharge or restricted condenser airflow. Using the wrong
          (bubble) curve for superheat would have computed 39°F instead of the actual 25°F,
          a 14°F error equal to the glide that would drive wrong charging decisions.
        </VerdictBanner>
        <FixCallout>
          Verify condenser fan operation, clean the coil, then check refrigerant charge by
          weight. For zeotropic blends, always confirm curve selection in PT chart software:
          dew for suction-side superheat, bubble for discharge-side subcooling.
        </FixCallout>
      </ServiceProblem>

      <ServiceProblem
        number={5}
        refrigerant="R-22 → R-407C retrofit"
        title="Pressure-envelope check for an R-22 to R-407C retrofit"
        scenario="Existing R-22 residential AC under consideration for R-407C retrofit. Customer wants to know: will the existing manifold gauges, hoses, and line set handle R-407C, or does the equipment need replacement?"
      >
        <Panel title="PT chart comparison (PSIG)" icon={TableIcon}>
          <ComparisonTable
            headers={["Refrigerant", "40°F", "70°F", "95°F", "Δ vs R-22"]}
            rows={[
              { label: "R-22 (pure)", cells: ["69", "121", "181", "baseline"] },
              { label: "R-407C bubble", cells: ["80", "141", "215", "+16-19%"], tone: "delta" },
              { label: "R-407C dew", cells: ["63", "117", "180", "≈ R-22"], tone: "delta" },
            ]}
          />
        </Panel>
        <VerdictBanner status="info" title="Compatible retrofit — standard procedure applies">
          R-407C bubble runs 16-19% above R-22; dew is essentially equal. Standard 500 PSI
          manifold gauges handle both refrigerants, and the difference matters mainly for
          service measurement: dew curve for superheat, bubble curve for subcooling on
          R-407C (R-22 has a single curve).
        </VerdictBanner>
        <FixCallout>
          Standard retrofit procedure: recover R-22, drain mineral oil and replace with POE,
          swap the filter-drier, evacuate to 500 microns, then charge R-407C by weight to
          approximately 90% of the R-22 nameplate. Verify superheat and subcooling at steady
          state after recharge.
        </FixCallout>
      </ServiceProblem>

      <ServiceProblem
        number={6}
        refrigerant="R-32 vs R-410A"
        title="Will R-410A service tools handle a new R-32 system?"
        scenario="A homeowner is replacing an R-410A condenser with a new R-32 system. The field tech asks the practical question: do I need new manifold gauges, hoses, recovery cylinders for R-32, or can my existing R-410A gear stay?"
      >
        <Panel title="PT chart comparison (PSIG)" icon={TableIcon}>
          <ComparisonTable
            headers={["Refrigerant", "40°F", "70°F", "95°F", "Δ vs R-410A"]}
            rows={[
              { label: "R-410A (near-azeotrope)", cells: ["119", "202", "278", "baseline"] },
              { label: "R-32 (pure)", cells: ["124", "206", "296", "+4-6%"], tone: "delta" },
            ]}
          />
        </Panel>
        <VerdictBanner status="info" title="Yes — R-410A tools handle R-32 without modification">
          Pressure delta is only 4-6% across the residential operating range, well inside
          the safety margin of R-410A-rated equipment (800 PSI gauges, hoses, recovery
          cylinders). The design changes for R-32 are flammability-related (A2L sealed
          motors, charge limits), not pressure ratings.
        </VerdictBanner>
        <FixCallout>
          Use existing R-410A service tools as-is. For the install, confirm indoor equipment
          is A2L-rated, the room volume meets the IEC 60335-2-40 charge limit table for the
          new charge size, and the existing line set is rated for R-32 service.
        </FixCallout>
      </ServiceProblem>

      <ServiceProblem
        number={7}
        refrigerant="R-134a"
        title="Diagnosing a struggling R-134a centrifugal chiller"
        scenario="Water-cooled R-134a centrifugal chiller. Operator reports the chiller has trouble making its 45°F leaving chilled water setpoint despite 85°F entering condenser water. You take manifold and liquid line readings."
      >
        <Panel title="Measured" icon={Gauge}>
          <Gauges
            items={[
              { label: "Suction P", value: "38 PSIG", side: "low" },
              { label: "Discharge P", value: "152 PSIG", side: "high" },
              { label: "Liquid line", value: "95°F", side: "high" },
              { label: "Leaving cond H₂O", value: "95°F", side: "high" },
            ]}
          />
        </Panel>
        <Panel title="PT chart lookup (R-134a)" icon={CalcIcon}>
          <Lookups
            rows={[
              { input: "38 PSIG", output: "47°F sat", note: "evaporator saturation" },
              { input: "152 PSIG", output: "113°F sat", note: "condenser saturation" },
            ]}
          />
        </Panel>
        <Panel title="Derived approach values" icon={Activity}>
          <Derived
            rows={[
              { formula: "Evap approach = 47°F − 45°F = 2°F", verdict: "ok", note: "target 2-5°F" },
              { formula: "Cond approach = 113°F − 95°F = 18°F", verdict: "bad", note: "high — should be 5-10°F water-cooled" },
              { formula: "Subcooling = 113°F − 95°F = 18°F", verdict: "warn", note: "high — consistent with cond approach" },
            ]}
          />
        </Panel>
        <VerdictBanner status="bad" title="Condenser-side bottleneck">
          High condenser approach with high subcooling points to fouled condenser tubes
          (heat-transfer fouling raises condenser temperature for the same heat rejection)
          or low condenser water flow. Evaporator side looks fine, so the chiller capacity
          bottleneck is high-side heat rejection.
        </VerdictBanner>
        <FixCallout>
          Inspect condenser tube cleanliness — schedule a brush-and-flush if fouled. Verify
          condenser water pump flow against the chiller&apos;s nameplate; check for bypass
          valves stuck open or strainer blockage upstream.
        </FixCallout>
      </ServiceProblem>

      <ServiceProblem
        number={8}
        refrigerant="R-1234yf"
        title="Hot-day R-1234yf mobile AC verification"
        scenario="2020+ model year vehicle with R-1234yf MAC system. 100°F ambient, AC at max cooling, vehicle stationary in a parking lot. Customer says the cabin doesn't get cold enough; you hook up MAC manifold gauges."
      >
        <Panel title="Measured at MAC service ports" icon={Gauge}>
          <Gauges
            items={[
              { label: "Low side", value: "35 PSIG", side: "low" },
              { label: "High side", value: "235 PSIG", side: "high" },
              { label: "Ambient", value: "100°F", side: "high" },
              { label: "Vehicle state", value: "Stationary" },
            ]}
          />
        </Panel>
        <Panel title="PT chart lookup (R-1234yf)" icon={CalcIcon}>
          <Lookups
            rows={[
              { input: "35 PSIG", output: "39°F sat", note: "evaporator saturation" },
              { input: "235 PSIG", output: "136°F sat", note: "condenser saturation" },
            ]}
          />
        </Panel>
        <Panel title="Interpretation" icon={Activity}>
          <Derived
            rows={[
              { formula: "Cabin air ≈ evap sat + 1-3°F ≈ 40°F", verdict: "ok", note: "appropriate cabin cooling" },
              { formula: "Cond above ambient = 136°F − 100°F = 36°F", verdict: "ok", note: "typical stationary vehicle" },
            ]}
          />
        </Panel>
        <VerdictBanner status="ok" title="Normal hot-day stationary MAC operation">
          Pressures and saturation temperatures fit typical hot-ambient stationary
          conditions. R-1234yf was engineered to preserve R-134a&apos;s pressure envelope
          (R-134a at 35 PSIG = 41°F; at 235 PSIG = 144°F), so existing MAC service
          procedures and equipment work without modification.
        </VerdictBanner>
        <FixCallout>
          If the customer wants more cabin cooling at idle, advise that road speed (more
          airflow across the condenser) will drop the high side and improve cooling. Check
          the condenser face for debris and verify the radiator/condenser fan is engaging on
          AC demand.
        </FixCallout>
      </ServiceProblem>

      <ServiceProblem
        number={9}
        refrigerant="R-744 (CO2, transcritical)"
        title="Reading an R-744 transcritical supermarket system"
        scenario="Supermarket R-744 transcritical commercial refrigeration system at 95°F outdoor — above CO2 critical temperature (87.8°F). Medium-temp and low-temp evaporator circuits feed a single high-pressure gas cooler."
      >
        <Panel title="Measured" icon={Gauge}>
          <Gauges
            items={[
              { label: "MT suction", value: "290 PSIG", side: "low" },
              { label: "LT suction", value: "40 PSIG", side: "low" },
              { label: "Gas cooler", value: "1350 PSIG", side: "high" },
              { label: "Ambient", value: "95°F", side: "high" },
            ]}
          />
        </Panel>
        <Panel title="PT chart lookup (R-744)" icon={CalcIcon}>
          <Lookups
            rows={[
              { input: "290 PSIG", output: "0°F sat", note: "MT evaporator — sub-critical" },
              { input: "40 PSIG", output: "−50°F sat", note: "LT evaporator — sub-critical" },
              { input: "1350 PSIG", output: "out of range", note: "no saturation above 87.8°F critical point" },
            ]}
          />
        </Panel>
        <VerdictBanner status="info" title="High side is transcritical — different rules apply">
          The 1350 PSIG gas cooler discharge is controlled by a high-pressure throttle valve,
          not by ambient-driven condensation. No saturation state exists above the critical
          temperature, so &quot;subcooling&quot; as a concept does not apply on the high
          side — the PT calculator correctly returns &quot;out of range&quot;.
        </VerdictBanner>
        <FixCallout>
          For transcritical high-side health, measure gas cooler outlet temperature directly
          — target is 8-10°F above ambient at design optimum (so 103-105°F at 95°F outdoor).
          The high-pressure valve setpoint controls system COP and should be tuned per OEM
          service literature, not by PT chart lookup.
        </FixCallout>
      </ServiceProblem>

      <ServiceProblem
        number={10}
        refrigerant="R-410A (heat pump)"
        title="Reading an R-410A heat pump in heating mode at 30°F outdoor"
        scenario="R-410A residential air-source heat pump in heating mode. 30°F outdoor (outdoor coil is now the evaporator), 70°F indoor return air (indoor coil is now the condenser). Customer reports the unit runs but the home doesn't feel warm."
      >
        <Panel title="Measured" icon={Gauge}>
          <Gauges
            items={[
              { label: "Suction P", value: "70 PSIG", side: "low" },
              { label: "Discharge P", value: "320 PSIG", side: "high" },
              { label: "Outdoor temp", value: "30°F", side: "low" },
              { label: "Indoor return", value: "70°F", side: "high" },
            ]}
          />
        </Panel>
        <Panel title="PT chart lookup (R-410A — reversed cycle)" icon={CalcIcon}>
          <Lookups
            rows={[
              { input: "70 PSIG", output: "14°F sat", note: "outdoor coil — now the evaporator" },
              { input: "320 PSIG", output: "99°F sat", note: "indoor coil — now the condenser" },
            ]}
          />
        </Panel>
        <Panel title="Interpretation" icon={Activity}>
          <Derived
            rows={[
              { formula: "Outdoor coil = 30°F − 14°F = 16°F below ambient", verdict: "ok", note: "normal heating-mode evaporator" },
              { formula: "Indoor coil = 99°F − 70°F = 29°F above return", verdict: "ok", note: "the temperature lift" },
            ]}
          />
        </Panel>
        <VerdictBanner status="ok" title="Normal heat-pump heating-mode operation">
          Outdoor coil saturation must run below ambient to absorb heat — 14°F below
          freezing means frost on the outdoor coil is expected, managed by defrost cycles.
          Indoor coil 29°F above return air delivers a supply temperature around 95-100°F,
          cooler than gas-furnace heat but normal for heat pumps.
        </VerdictBanner>
        <FixCallout>
          If the unit feels &quot;not warming&quot; despite normal readings, check defrost
          cycle operation (frost accumulation blocks airflow) and verify auxiliary heat is
          engaging when needed. Abnormally high outdoor saturation (say, 25°F at 30°F
          ambient) would suggest compressor or charge issues — these readings are healthy.
        </FixCallout>
      </ServiceProblem>

      <TechSection
        icon="composition"
        tone="purple"
        title="Operating pressure ranges by refrigerant — quick reference table"
      >
        <p>
          Typical operating pressure ranges across major refrigerants and applications. These
          are field-service reference ranges, not exact values — actual operating pressures
          depend on charge, ambient, load, superheat, subcooling, and equipment-specific
          conditions.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left">Refrigerant</th>
                <th className="text-left">Application</th>
                <th className="text-right">Suction PSIG</th>
                <th className="text-right">Discharge PSIG</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>R-410A</td><td>Residential AC, 95°F ambient</td><td className="text-right">120-140</td><td className="text-right">350-400</td></tr>
              <tr><td>R-32</td><td>Residential AC, 95°F ambient</td><td className="text-right">130-145</td><td className="text-right">360-410</td></tr>
              <tr><td>R-454B</td><td>Residential AC, 95°F ambient</td><td className="text-right">115-135</td><td className="text-right">340-385</td></tr>
              <tr><td>R-22</td><td>Residential AC (legacy), 95°F</td><td className="text-right">65-80</td><td className="text-right">240-290</td></tr>
              <tr><td>R-407C</td><td>R-22 retrofit AC, 95°F</td><td className="text-right">70-90</td><td className="text-right">280-330</td></tr>
              <tr><td>R-404A</td><td>Low-temp commercial, neg twenty evap</td><td className="text-right">15-25</td><td className="text-right">250-290</td></tr>
              <tr><td>R-448A</td><td>Low-temp commercial retrofit</td><td className="text-right">13-20</td><td className="text-right">230-270</td></tr>
              <tr><td>R-454C</td><td>Low-temp commercial new</td><td className="text-right">5-12</td><td className="text-right">220-260</td></tr>
              <tr><td>R-134a</td><td>Centrifugal chiller, 45°F evap</td><td className="text-right">35-45</td><td className="text-right">145-180</td></tr>
              <tr><td>R-513A</td><td>Chiller retrofit, 45°F evap</td><td className="text-right">38-48</td><td className="text-right">155-190</td></tr>
              <tr><td>R-1234yf</td><td>Mobile AC, 100°F ambient</td><td className="text-right">30-45</td><td className="text-right">220-260</td></tr>
              <tr><td>R-744 (sub-critical)</td><td>Cold-ambient CO2 refrigeration</td><td className="text-right">200-500</td><td className="text-right">600-900</td></tr>
              <tr><td>R-744 (transcritical)</td><td>Warm-ambient CO2 refrigeration</td><td className="text-right">290-470</td><td className="text-right">1100-1700</td></tr>
              <tr><td>R-290</td><td>Heat pump, 95°F ambient</td><td className="text-right">70-90</td><td className="text-right">200-260</td></tr>
              <tr><td>R-717</td><td>Industrial low-temp, neg twenty evap</td><td className="text-right">4-8</td><td className="text-right">165-200</td></tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Source: ASHRAE Handbook of Refrigeration 2022, ACCA Manual T, equipment OEM service
          literature. Actual operating ranges vary by equipment design and operating
          conditions.
        </p>
      </TechSection>

      <TechSection
        icon="composition"
        tone="purple"
        title="Saturation pressure quick reference — common service temperatures"
      >
        <p>
          Saturation pressure values at common service temperatures across mainstream
          refrigerants. All values are PSIG from CoolProp 7.2.0. For zeotropic blends,
          bubble / dew values shown.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left">Refrigerant</th>
                <th className="text-right">32°F</th>
                <th className="text-right">45°F</th>
                <th className="text-right">70°F</th>
                <th className="text-right">95°F</th>
                <th className="text-right">120°F</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>R-22</td><td className="text-right">58</td><td className="text-right">76</td><td className="text-right">121</td><td className="text-right">181</td><td className="text-right">260</td></tr>
              <tr><td>R-410A</td><td className="text-right">102</td><td className="text-right">130</td><td className="text-right">202</td><td className="text-right">278</td><td className="text-right">380</td></tr>
              <tr><td>R-32</td><td className="text-right">110</td><td className="text-right">142</td><td className="text-right">206</td><td className="text-right">296</td><td className="text-right">410</td></tr>
              <tr><td>R-454B</td><td className="text-right">99</td><td className="text-right">128</td><td className="text-right">190/184</td><td className="text-right">262/256</td><td className="text-right">360/350</td></tr>
              <tr><td>R-134a</td><td className="text-right">28</td><td className="text-right">40</td><td className="text-right">71</td><td className="text-right">124</td><td className="text-right">187</td></tr>
              <tr><td>R-404A</td><td className="text-right">73</td><td className="text-right">97</td><td className="text-right">148</td><td className="text-right">232</td><td className="text-right">332</td></tr>
              <tr><td>R-407C</td><td className="text-right">53/43</td><td className="text-right">75/63</td><td className="text-right">141/117</td><td className="text-right">215/180</td><td className="text-right">305/258</td></tr>
              <tr><td>R-454C</td><td className="text-right">30/22</td><td className="text-right">47/35</td><td className="text-right">141/112</td><td className="text-right">220/185</td><td className="text-right">305/255</td></tr>
              <tr><td>R-744 (CO2)</td><td className="text-right">491</td><td className="text-right">595</td><td className="text-right">838</td><td className="text-right">transcritical</td><td className="text-right">transcritical</td></tr>
              <tr><td>R-290</td><td className="text-right">56</td><td className="text-right">74</td><td className="text-right">110</td><td className="text-right">175</td><td className="text-right">250</td></tr>
              <tr><td>R-717 (NH3)</td><td className="text-right">47</td><td className="text-right">62</td><td className="text-right">114</td><td className="text-right">181</td><td className="text-right">270</td></tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Use this table for quick mental reference. For exact values at any temperature, use
          the calculator above. Source: CoolProp 7.2.0; values verified against AHRI Standard
          700-2019 specifications.
        </p>
        <SaturationAt95FBars />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Saturation pressure at 95°F across mainstream refrigerants, descending — visual
          companion to the quick-reference table. Zeotropic blends shown at bubble pressure.
          R-744 (CO2) is transcritical at 95°F and omitted (no saturation state above
          87.8°F).
        </p>
      </TechSection>

      <TechSection
        icon="warning"
        tone="amber"
        title="Common PT lookup mistakes — and how to avoid them"
      >
        <p>
          PT calculator results can mislead service decisions when applied incorrectly. The
          five most common mistakes:
        </p>
        <ol>
          <li>
            <strong>PSIG vs PSIA confusion.</strong> Service manifold gauges read PSIG;
            the PT calculator uses PSIG by default. Confusing the two introduces a 14.696 PSI
            offset (PSIA = PSIG + 14.696 at sea level, slightly less at altitude).
          </li>
          <li>
            <strong>Wrong curve on zeotropic blends.</strong> Using bubble pressure for
            superheat measurement on R-407C, R-454C, R-455A introduces error equal to the
            glide (11-22°F). Always use the dew curve for superheat (suction line), the bubble
            curve for subcooling (liquid line). Pure refrigerants and azeotropes have a single
            curve, so this concern does not apply.
          </li>
          <li>
            <strong>Saturation pressure is not operating pressure.</strong> The PT calculator
            gives saturation pressure at thermodynamic equilibrium. Actual operating pressure
            on a running system depends on charge, ambient, load, superheat, subcooling, and
            line pressure drop. Saturation is the reference; operating values vary around it.
          </li>
          <li>
            <strong>Extrapolating beyond chart range.</strong> The calculator returns
            &quot;out of range&quot; outside the chart&apos;s valid temperature range — this is
            correct physics, not a bug. R-744 has no saturation state above 87.8°F (its
            critical point); other refrigerants have similar validity limits at extremes.
          </li>
          <li>
            <strong>Ignoring line pressure drop.</strong> The pressure at the manifold service
            port differs slightly from the pressure at the compressor or evaporator due to
            line pressure drop. For most residential applications the drop is small and
            ignorable; for long line sets, large commercial systems, or systems with
            substantial filter-drier pressure drop, the effect is more meaningful. Account for
            line losses when interpreting manifold readings against design conditions.
          </li>
        </ol>
      </TechSection>

      <TechSection icon="data" tone="emerald" title="Pressure unit conversions reference">
        <p>
          The PT calculator supports °F / PSIG and °C / kPa unit pairs. Other pressure unit
          conversions are sometimes needed in HVAC service:
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left">From</th>
                <th className="text-left">To</th>
                <th className="text-left">Multiplier</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>PSIG</td><td>PSIA</td><td>plus 14.696 (at sea level)</td></tr>
              <tr><td>PSIG</td><td>kPa (gauge)</td><td>times 6.8948</td></tr>
              <tr><td>PSIG</td><td>bar (gauge)</td><td>times 0.06895</td></tr>
              <tr><td>PSIG</td><td>inHg vacuum (below atmospheric)</td><td>times negative 2.036</td></tr>
              <tr><td>kPa (gauge)</td><td>kPa (absolute)</td><td>plus 101.325</td></tr>
              <tr><td>bar</td><td>PSIG</td><td>times 14.504</td></tr>
              <tr><td>MPa</td><td>PSIG</td><td>times 145.04</td></tr>
              <tr><td>Pa</td><td>kPa</td><td>divided by 1000</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          For temperature conversions: °F = (°C times nine over five) plus 32; °C = (°F minus
          32) times five over nine. The calculator handles both temperature units
          automatically; this conversion table is for reference when reading equipment data
          plates in unfamiliar units.
        </p>
      </TechSection>

      <TechSection icon="book" tone="emerald" title="When to use this calculator vs the others">
        <p>
          The PT calculator is the foundational lookup tool. Other calculators on the site
          build on PT lookups for specific service tasks:
        </p>
        <ul>
          <li>
            <strong>PT Calculator</strong> (this page) — pressure-temperature lookup, either
            direction, for any refrigerant. Use for quick reference, retrofit comparison, or
            as a building block in manual calculations.
          </li>
          <li>
            <strong>
              <a href="/superheat-calculator/" className="underline">Superheat Calculator</a>
            </strong>{" "}
            — adds suction-line temperature input, computes superheat with automatic dew/bubble
            curve selection. Use for charging fixed-orifice systems or for diagnostic superheat
            measurement on any system.
          </li>
          <li>
            <strong>
              <a href="/subcooling-calculator/" className="underline">Subcooling Calculator</a>
            </strong>{" "}
            — adds liquid-line temperature input, computes subcooling with automatic curve
            selection. Use for charging TXV systems or for diagnostic subcooling measurement.
          </li>
          <li>
            <strong>
              <a href="/pt-superheat-subcooling-calculator/" className="underline">
                Combined SH/SC/PT Calculator
              </a>
            </strong>{" "}
            — both suction and liquid line inputs, computes superheat and subcooling together,
            displays diagnostic pattern banner (undercharge/overcharge/restriction/airflow).
          </li>
          <li>
            <strong>
              <a href="/refrigerant-pt-comparison-tool/" className="underline">
                PT Comparison Tool
              </a>
            </strong>{" "}
            — overlays 2-4 refrigerants&apos; PT curves on a single chart. Use for retrofit
            pressure-envelope comparison.
          </li>
          <li>
            <strong>
              <a href="/refrigerant-retrofit-compatibility-calculator/" className="underline">
                Retrofit Compatibility Calculator
              </a>
            </strong>{" "}
            — pair comparison covering lubricant compatibility, safety class, pressure
            envelope, and glide. Use for retrofit decision-making beyond just pressure
            comparison.
          </li>
        </ul>
      </TechSection>

      <TechSection icon="source" tone="zinc" title="Sources behind the calculator data">
        <p>All saturation values come from primary references with documented provenance:</p>
        <ul>
          <li>
            <strong>CoolProp 7.2.0</strong> (Bell, Wronski, Quoilin, Lemort 2014,
            doi:10.1021/ie4033999) — REFPROP-compatible Helmholtz EOS implementation. Source
            for pure refrigerants (R-22, R-32, R-134a, R-744, etc.) and CoolProp&apos;s
            predefined mixtures (R-410A, R-407C, R-404A, etc.). Accuracy typically better than
            ±0.5 percent across the operating range.
          </li>
          <li>
            <strong>AHRI Standard 700-2019</strong> — Specifications for Refrigerants. Used to
            verify CoolProp values against the manufacturer-specification standard.
          </li>
          <li>
            <strong>Manufacturer technical datasheets</strong> — for the 11 blends not modeled
            by CoolProp (R-448A, R-450A, R-1336mzz(Z), R-454C blended mode, etc.). Honeywell,
            Chemours, Arkema, and AGC PT charts cited on each refrigerant detail page.
          </li>
          <li>
            <strong>ASHRAE Standard 34-2022</strong> — Designation and Safety Classification of
            Refrigerants. Source for composition specifications and safety class assignments.
          </li>
          <li>
            <strong>ASHRAE Handbook of Refrigeration 2022</strong> — Application context,
            operating range references, service procedure guidance.
          </li>
          <li>
            <strong>ACCA Manual T</strong> — Air-Side and Refrigerant-Side Diagnostics. Field
            service interpretation context for PT lookup applications.
          </li>
        </ul>
        <p>
          Each refrigerant&apos;s detail page (linked from the dropdown) cites the specific
          data source for that refrigerant&apos;s PT chart.
        </p>
      </TechSection>
    </>
  );
}

/* ──────────────────────── Static SVG charts (server-rendered) ──────────────────────── */

const PT_OVERLAY_PICKS: { slug: string; color: string }[] = [
  { slug: "r-22", color: "#3a8ed1" },
  { slug: "r-410a", color: "#c45757" },
  { slug: "r-32", color: "#8e4dd1" },
  { slug: "r-134a", color: "#d49a2b" },
];

function PtCurvesOverlay() {
  const W = 720;
  const H = 380;
  const PAD_L = 56;
  const PAD_R = 16;
  const PAD_T = 44;
  const PAD_B = 40;
  const PLOT_W = W - PAD_L - PAD_R;
  const PLOT_H = H - PAD_T - PAD_B;
  const xMin = -40;
  const xMax = 130;
  const yMin = 0;
  const yMax = 450;
  const xScale = (v: number) => PAD_L + ((v - xMin) / (xMax - xMin)) * PLOT_W;
  const yScale = (v: number) => PAD_T + PLOT_H - ((v - yMin) / (yMax - yMin)) * PLOT_H;

  const series = PT_OVERLAY_PICKS.flatMap(({ slug, color }) => {
    const r = getRefrigerant(slug);
    if (!r) return [];
    const points = r.ptChart.filter(
      (p) => p.tempF >= xMin && p.tempF <= xMax && p.bubblePsig <= yMax
    );
    if (points.length < 2) return [];
    const d = points
      .map(
        (p, i) =>
          `${i === 0 ? "M" : "L"} ${xScale(p.tempF).toFixed(1)} ${yScale(p.bubblePsig).toFixed(1)}`
      )
      .join(" ");
    return [{ name: r.displayName, color, d }];
  });

  const xTicks = [-40, -20, 0, 20, 40, 60, 80, 100, 120];
  const yTicks = [0, 50, 100, 150, 200, 250, 300, 350, 400, 450];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Saturation pressure vs temperature overlay chart for R-22, R-410A, R-32, and R-134a from CoolProp 7.2.0 data."
      className="my-3 h-auto w-full text-zinc-700 dark:text-zinc-300"
      preserveAspectRatio="xMidYMid meet"
    >
      <text x={W / 2} y={20} textAnchor="middle" fontSize="13" fontWeight={600} fill="currentColor">
        Saturation pressure vs temperature
      </text>
      {xTicks.map((t) => (
        <line
          key={`gx-${t}`}
          x1={xScale(t)}
          y1={PAD_T}
          x2={xScale(t)}
          y2={PAD_T + PLOT_H}
          stroke="currentColor"
          opacity={0.1}
          strokeDasharray="2 3"
          strokeWidth={1}
        />
      ))}
      {yTicks.map((t) => (
        <line
          key={`gy-${t}`}
          x1={PAD_L}
          y1={yScale(t)}
          x2={PAD_L + PLOT_W}
          y2={yScale(t)}
          stroke="currentColor"
          opacity={0.1}
          strokeDasharray="2 3"
          strokeWidth={1}
        />
      ))}
      <line x1={PAD_L} y1={PAD_T + PLOT_H} x2={PAD_L + PLOT_W} y2={PAD_T + PLOT_H} stroke="currentColor" opacity={0.5} strokeWidth={1.25} />
      <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + PLOT_H} stroke="currentColor" opacity={0.5} strokeWidth={1.25} />
      {xTicks.map((t) => (
        <text key={`tx-${t}`} x={xScale(t)} y={PAD_T + PLOT_H + 14} textAnchor="middle" fontSize="10" fill="currentColor" opacity={0.7}>
          {t}
        </text>
      ))}
      {yTicks.map((t) => (
        <text key={`ty-${t}`} x={PAD_L - 6} y={yScale(t) + 4} textAnchor="end" fontSize="10" fill="currentColor" opacity={0.7}>
          {t}
        </text>
      ))}
      <text x={PAD_L + PLOT_W / 2} y={H - 6} textAnchor="middle" fontSize="11" fill="currentColor" opacity={0.8}>
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
      {series.map((s) => (
        <path key={s.name} d={s.d} stroke={s.color} strokeWidth={2.25} fill="none" />
      ))}
      {series.map((s, i) => (
        <g key={`leg-${s.name}`} transform={`translate(${PAD_L + 16 + i * 130}, ${PAD_T - 22})`}>
          <line x1={0} y1={4} x2={22} y2={4} stroke={s.color} strokeWidth={2.5} />
          <text x={28} y={8} fontSize="11" fontWeight={500} fill="currentColor">
            {s.name}
          </text>
        </g>
      ))}
    </svg>
  );
}

const SAT_95F_SLUGS = [
  "r-32",
  "r-410a",
  "r-454b",
  "r-404a",
  "r-454c",
  "r-407c",
  "r-22",
  "r-717",
  "r-290",
  "r-1234yf",
  "r-134a",
];

function SaturationAt95FBars() {
  const rows = SAT_95F_SLUGS.flatMap((slug) => {
    const r = getRefrigerant(slug);
    if (!r) return [];
    const p = getPressureAtTempF(slug, 95);
    if (!p) return [];
    return [
      {
        slug,
        name: r.displayName,
        value: p.bubble,
        hasGlide: r.physical.hasSignificantGlide,
        dewValue: p.dew,
      },
    ];
  }).sort((a, b) => b.value - a.value);

  const W = 720;
  const ROW_H = 26;
  const PAD_T = 36;
  const PAD_B = 18;
  const LABEL_W = 90;
  const PAD_R = 64;
  const BAR_W = W - LABEL_W - PAD_R;
  const H = PAD_T + rows.length * ROW_H + PAD_B;
  const maxVal = rows.length ? Math.max(...rows.map((r) => r.value)) * 1.05 : 1;

  const colorFor = (slug: string) => {
    if (["r-407c", "r-454c", "r-448a", "r-449a", "r-455a", "r-454b"].includes(slug)) return "#8e4dd1";
    if (slug === "r-717") return "#5a8a3a";
    if (slug === "r-290" || slug === "r-1234yf") return "#d49a2b";
    return "#3a8ed1";
  };

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Bar chart of saturation pressure at 95°F across major refrigerants, descending. CoolProp 7.2.0 data."
      className="my-3 h-auto w-full text-zinc-700 dark:text-zinc-300"
      preserveAspectRatio="xMidYMid meet"
    >
      <text x={W / 2} y={20} textAnchor="middle" fontSize="13" fontWeight={600} fill="currentColor">
        Saturation pressure at 95°F (PSIG) — descending
      </text>
      {rows.map((r, i) => {
        const y = PAD_T + i * ROW_H;
        const barLen = (r.value / maxVal) * BAR_W;
        const label = r.hasGlide
          ? `${r.value.toFixed(0)} / ${r.dewValue.toFixed(0)}`
          : r.value.toFixed(0);
        return (
          <g key={r.slug}>
            <text x={LABEL_W - 8} y={y + 14} textAnchor="end" fontSize="11" fontWeight={500} fill="currentColor">
              {r.name}
            </text>
            <rect x={LABEL_W} y={y + 3} width={barLen} height={16} fill={colorFor(r.slug)} rx={2} />
            <text x={LABEL_W + barLen + 6} y={y + 15} fontSize="11" fontWeight={600} fill="currentColor">
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

const GLIDE_SLUGS = [
  "r-455a",
  "r-454c",
  "r-407c",
  "r-448a",
  "r-449a",
  "r-454b",
  "r-450a",
  "r-513a",
];

function GlideBars() {
  const rows = GLIDE_SLUGS.flatMap((slug) => {
    const r = getRefrigerant(slug);
    if (!r) return [];
    return [{ slug, name: r.displayName, value: Math.abs(r.physical.temperatureGlideF) }];
  }).sort((a, b) => b.value - a.value);

  const W = 720;
  const ROW_H = 24;
  const PAD_T = 36;
  const PAD_B = 18;
  const LABEL_W = 90;
  const PAD_R = 56;
  const BAR_W = W - LABEL_W - PAD_R;
  const H = PAD_T + rows.length * ROW_H + PAD_B;
  const maxVal = rows.length ? Math.max(...rows.map((r) => r.value), 1) * 1.1 : 1;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Temperature glide bar chart across zeotropic HVAC blends, from CoolProp 7.2.0 dataset."
      className="my-3 h-auto w-full text-zinc-700 dark:text-zinc-300"
      preserveAspectRatio="xMidYMid meet"
    >
      <text x={W / 2} y={20} textAnchor="middle" fontSize="13" fontWeight={600} fill="currentColor">
        Temperature glide (°F) — common HVAC blends
      </text>
      {rows.map((r, i) => {
        const y = PAD_T + i * ROW_H;
        const barLen = (r.value / maxVal) * BAR_W;
        return (
          <g key={r.slug}>
            <text x={LABEL_W - 8} y={y + 13} textAnchor="end" fontSize="11" fontWeight={500} fill="currentColor">
              {r.name}
            </text>
            <rect x={LABEL_W} y={y + 3} width={barLen} height={14} fill="#8e4dd1" rx={2} />
            <text x={LABEL_W + barLen + 6} y={y + 14} fontSize="11" fontWeight={600} fill="currentColor">
              {r.value.toFixed(1)}°F
            </text>
          </g>
        );
      })}
    </svg>
  );
}
