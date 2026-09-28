import type { Metadata } from "next";
import { refrigerants, getRefrigerant, getPressureAtTempF, satPressure } from "@/data/refrigerants";
import { CalculatorShell } from "@/components/calculators/shared/CalculatorShell";
import { PtCalculator } from "@/components/calculators/PtCalculator";
import { TechSection, KeyInsight } from "@/components/refrigerant/TechSection";
import { RefrigerantGlide } from "@/components/refrigerant/RefrigerantGlide";
import { pageMetadata } from "@/lib/schema/shared";
import { scenariosForPage } from "@/lib/scenarios";
import { WorkedScenario } from "@/components/calculators/shared/WorkedScenario";
import { ptDataProvenance } from "@/lib/data-provenance";

/* ── Computed reference-table data (no typed pressures) ─────────────────── */

// PT-data source split, counted from the dataset at build time so the sources
// copy can't drift from what actually ships (51 CoolProp 7.2.0, 6 CoolProp
// 8.0.0, 2 manufacturer-datasheet fluids at time of writing).
const PROV = ptDataProvenance();

// Quick-reference: saturation PSIG at these temps for these fluids, computed
// live from the dataset via satPressure (bubble/dew for zeotropic blends).
const QUICK_REF_TEMPS = [32, 45, 70, 95, 120];
const QUICK_REF_SLUGS = [
  "r-22", "r-410a", "r-32", "r-454b", "r-134a", "r-404a",
  "r-407c", "r-454c", "r-744", "r-290", "r-717",
];

// Operating-pressure ranges, computed with the same method as the
// /what-pressure-should-*/ pages: residential AC = dew(38–45°F evap) suction,
// bubble(ambient+15…+25) head; commercial refrigeration = dew(evap±3) suction,
// bubble(ambient+15…+30) head. Rows whose method isn't defined yet (chillers,
// heat pump, transcritical CO2, mobile MVAC) are intentionally omitted — see
// OPERATING_DROPPED below.
type OpRow = { slug: string; application: string; model: "res" | "com"; evaporatorF?: number; ambientF: number };
const OPERATING_ROWS: OpRow[] = [
  { slug: "r-410a", application: "Residential AC, 95°F ambient", model: "res", ambientF: 95 },
  { slug: "r-32", application: "Residential AC, 95°F ambient", model: "res", ambientF: 95 },
  { slug: "r-454b", application: "Residential AC, 95°F ambient", model: "res", ambientF: 95 },
  { slug: "r-22", application: "Residential AC (legacy), 95°F ambient", model: "res", ambientF: 95 },
  { slug: "r-407c", application: "R-22 retrofit AC, 95°F ambient", model: "res", ambientF: 95 },
  { slug: "r-404a", application: "Low-temp commercial, −20°F evap, 95°F ambient", model: "com", evaporatorF: -20, ambientF: 95 },
  { slug: "r-448a", application: "Low-temp commercial retrofit, −20°F evap, 95°F ambient", model: "com", evaporatorF: -20, ambientF: 95 },
  { slug: "r-454c", application: "Low-temp commercial, −20°F evap, 95°F ambient", model: "com", evaporatorF: -20, ambientF: 95 },
];
const OPERATING_DROPPED =
  "R-744 (sub-critical + transcritical CO₂), R-290 heat pump, R-717 (ammonia) industrial, R-134a and R-513A chillers, and R-1234yf mobile A/C are omitted — their operating-pressure method isn't defined in the dataset-computed model yet.";

/** Compute a whole-PSIG suction/head range for one row, or null if out of range. */
function computeOpRange(row: OpRow): { suction: string; discharge: string } | null {
  const sucLoT = row.model === "res" ? 38 : (row.evaporatorF as number) - 3;
  const sucHiT = row.model === "res" ? 45 : (row.evaporatorF as number) + 3;
  const headHiOff = row.model === "res" ? 25 : 30;
  const sLo = satPressure(row.slug, sucLoT, "dew");
  const sHi = satPressure(row.slug, sucHiT, "dew");
  const dLo = satPressure(row.slug, row.ambientF + 15, "bubble");
  const dHi = satPressure(row.slug, row.ambientF + headHiOff, "bubble");
  if (sLo === null || sHi === null || dLo === null || dHi === null) return null;
  return {
    suction: `${Math.round(sLo)}-${Math.round(sHi)}`,
    discharge: `${Math.round(dLo)}-${Math.round(dHi)}`,
  };
}

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
    a: `Saturation pressures come from CoolProp, a REFPROP-compatible Helmholtz-energy EOS: CoolProp 7.2.0 for ${PROV.coolprop72} fluids and CoolProp 8.0.0 for ${PROV.coolprop80} newer low-GWP fluids (including R-450A and the pure HFO R-1336mzz(Z)). The remaining ${PROV.datasheet} refrigerants — R-438A (Chemours ISCEON MO99) and R-448A (Honeywell Solstice N40) — are transcribed from the named manufacturer PT charts and match the source datasheet.`,
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
    a: "Yes — the PT calculator is useful for understanding the pressure envelope of candidate retrofit refrigerants relative to the original equipment design. Compare R-22 saturation values to R-407C bubble/dew values to see the retrofit pressure delta. Compare R-410A to R-32 saturation to confirm the small (~2%) pressure increase that R-32 introduces. For pair comparisons with full retrofit guidance, use the refrigerant comparison and retrofit compatibility tools.",
  },
];

export const metadata: Metadata = pageMetadata({
  title: "HVAC PT Calculator: Calculate Pressure And Temperature (60 Refrigerants)",
  description:
    "Instant saturation lookup for 60 refrigerants: temperature → PSIG or pressure → °F, bubble/dew handled for blends. 70°F R410A = 201.8 PSIG saturation.",
  path: "/pt-calculator/",
});

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
        breadcrumbLabel: "PT Calculator",
      }}
      introOneLiner="Enter a temperature or a pressure for any refrigerant in the dataset; get the corresponding saturation value, with bubble/dew handling for zeotropic blends and ten-plus worked examples covering the full range of HVAC service scenarios."
      route="/pt-calculator/"
      howToReadResults={[
        {
          output: "Saturation pressure (PSIG or kPa)",
          meaning:
            "In the temperature-to-pressure direction, this is the gauge pressure at which a pure refrigerant boils or condenses at the temperature you entered. It is the thermodynamic reference a manifold should read at that saturation temperature; actual operating pressure varies with charge, ambient, load, and line drop. PSIG is gauge (PSIA = PSIG + 14.696 at sea level); kPa shown is gauge above 101.325 kPa atmospheric.",
        },
        {
          output: "Saturation temperature (°F or °C)",
          meaning:
            "In the pressure-to-temperature direction, this is the temperature at which a pure refrigerant boils or condenses at the gauge pressure you entered. Subtract it from a measured suction-line temperature to get superheat, or subtract a measured liquid-line temperature from it to get subcooling.",
        },
        {
          output: "Bubble value (bubble pressure or bubble temperature)",
          meaning:
            "Shown only for zeotropic blends. The bubble point is the saturated-liquid side, where the first vapor bubble forms. Use the bubble curve for liquid-line subcooling on blends; using it for superheat introduces error equal to the glide.",
        },
        {
          output: "Dew value (dew pressure or dew temperature)",
          meaning:
            "Shown only for zeotropic blends. The dew point is the saturated-vapor side, where the last liquid droplet evaporates. Use the dew curve for suction-line superheat on blends; the superheat calculator selects it automatically.",
        },
        {
          output: "Glide",
          meaning:
            "The spread between the bubble and dew values at your entered condition, displayed in the active pressure or temperature unit. Near-zero for pure refrigerants, azeotropes, and near-azeotropes like R-410A means the two curves coincide; a large glide (R-407C, R-454C) means curve selection materially changes superheat and subcooling results.",
        },
        {
          output: "Out-of-range and no-data messages",
          meaning:
            "“Outside the chart range” means the entered value falls beyond the refrigerant’s validated −40°F to 150°F table or above its critical point (for example R-744 above 87.8°F), where no saturation state exists — this is correct physics, not an error. “No PT data available” appears for manual-blend refrigerants that have no computed chart.",
        },
        {
          output: "PT chart range reference",
          meaning:
            "Below the result, the tool states the valid temperature span for the selected refrigerant and, for zeotropic blends, the dataset glide at 0°C. Confirm your input sits inside the modeled range before trusting the result.",
        },
      ]}
      howTo={{
        steps: [
          "Pick a refrigerant from the dropdown. Defaults to R-410A.",
          "Choose direction: 'Pressure from temperature' (PT chart lookup) or 'Temperature from pressure' (inverse).",
          "Adjust unit toggles if you need metric values (°C / kPa).",
          "Enter your value and click Calculate. The result shows both bubble and dew for zeotropic blends.",
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
        sourceCitation: `Saturation pressures from CoolProp — ${PROV.coolprop72} fluids on CoolProp 7.2.0 (Bell, Wronski, Quoilin, Lemort 2014, doi:10.1021/ie4033999) and ${PROV.coolprop80} newer low-GWP fluids on CoolProp 8.0.0, both REFPROP-compatible Helmholtz EOS. The ${PROV.datasheet} manufacturer-datasheet fluids (R-438A, R-448A) come from the named manufacturer PT charts cited on each refrigerant's detail page.`,
        workedExample: `R-410A at 70°F: CoolProp returns P_bubble = 201.76 PSIG, P_dew = 201.07 PSIG (0.7 PSI glide — near-azeotropic).\n\nR-407C at 70°F: CoolProp returns P_bubble = 140.52 PSIG, P_dew = 117.29 PSIG (23 PSI glide — significant zeotrope).\n\nR-744 (CO2) at 70°F: P_sat = 838.13 PSIG. Above 87.8°F (the critical point) no saturation state exists and the chart truncates.\n\nR-32 at 95°F: ${satPressure("r-32", 95, "bubble")!.toFixed(1)} PSIG saturation. R-410A at 95°F: ${satPressure("r-410a", 95, "bubble")!.toFixed(1)} PSIG. R-32 runs about ${Math.round(((satPressure("r-32", 95, "bubble")! / satPressure("r-410a", 95, "bubble")!) - 1) * 100)}% higher than R-410A, consistent across the operating envelope.`,
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
          Temperature glide across common HVAC blends, measured as dew-minus-bubble at 0°C
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

      {scenariosForPage("/pt-calculator/").map((s) => (
        <WorkedScenario key={s.id} scenario={s} />
      ))}

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
        <div data-src="dataset" className="overflow-x-auto">
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
              {OPERATING_ROWS.map((row) => {
                const rr = getRefrigerant(row.slug);
                const range = computeOpRange(row);
                if (!rr || !range) return null;
                return (
                  <tr key={row.slug}>
                    <td>{rr.displayName}</td>
                    <td>{row.application}</td>
                    <td className="text-right">{range.suction}</td>
                    <td className="text-right">{range.discharge}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Suction and head are computed from the CoolProp-verified PT dataset (dew and bubble
          saturation via satPressure, rounded to whole PSIG): residential = dew pressure of a
          38–45°F evaporator with head 15–25°F above ambient; commercial = dew pressure within
          ±3°F of the listed evaporator with head 15–30°F above ambient. Actual gauge readings
          vary with charge, load, and equipment condition. {OPERATING_DROPPED}
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
        <div data-src="dataset" className="overflow-x-auto">
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
              {QUICK_REF_SLUGS.map((slug) => {
                const rr = getRefrigerant(slug);
                if (!rr) return null;
                const glide = rr.physical.hasSignificantGlide;
                return (
                  <tr key={slug}>
                    <td>{rr.displayName}</td>
                    {QUICK_REF_TEMPS.map((t) => {
                      const bub = satPressure(slug, t, "bubble");
                      const dew = satPressure(slug, t, "dew");
                      const cell =
                        bub === null
                          ? "transcritical"
                          : glide && dew !== null
                            ? `${Math.round(bub)}/${Math.round(dew)}`
                            : `${Math.round(bub)}`;
                      return <td key={t} className="text-right">{cell}</td>;
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Computed live from the CoolProp 7.2.0 PT dataset via satPressure() — bubble
          (saturated liquid) shown for pures; bubble/dew for zeotropic blends; “transcritical”
          where the temperature is above the fluid&apos;s critical point. For exact values at
          any temperature, use the calculator above.
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
            <strong>Extrapolating beyond chart range.</strong>{" "}The calculator returns
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
        <div data-src="dataset" className="overflow-x-auto">
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
            for {PROV.coolprop72} fluids: pure refrigerants (R-22, R-32, R-134a, R-744, etc.)
            and CoolProp&apos;s predefined mixtures (R-410A, R-407C, R-404A, etc.).
          </li>
          <li>
            <strong>CoolProp 8.0.0</strong> — same Helmholtz EOS engine, newer release. Source
            for {PROV.coolprop80} lower-GWP fluids CoolProp 7.2.0 did not yet ship, including
            R-450A, R-514A, R-515A, R-515B, R-1224yd(Z), and the pure HFO R-1336mzz(Z).
          </li>
          <li>
            <strong>Manufacturer technical datasheets</strong> — for the {PROV.datasheet}{" "}
            R-404A retrofit blends CoolProp does not model: R-438A (Chemours ISCEON MO99) and
            R-448A (Honeywell Solstice N40). The published PT tables are cited on each
            refrigerant&apos;s detail page.
          </li>
          <li>
            <strong>ASHRAE Standard 34-2022</strong> — Designation and Safety Classification of
            Refrigerants. Source for composition specifications and safety class assignments.
          </li>
          <li>
            <strong>ASHRAE Handbook—Refrigeration (2022)</strong> — Application context,
            operating range references, service procedure guidance.
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
