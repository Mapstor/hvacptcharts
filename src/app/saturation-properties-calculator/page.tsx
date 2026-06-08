import type { Metadata } from "next";
import { Activity, Calculator as CalcIcon, Gauge, Table as TableIcon } from "lucide-react";
import { refrigerants, getRefrigerant } from "@/data/refrigerants";
import { CalculatorShell } from "@/components/calculators/shared/CalculatorShell";
import { SaturationPropertiesCalculator } from "@/components/calculators/SaturationPropertiesCalculator";
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
    q: "What is saturation pressure?",
    a: "Saturation pressure is the pressure at which a refrigerant exists as both liquid and vapor in equilibrium at a given temperature. For pure refrigerants and azeotropes, a single saturation pressure corresponds to each temperature. For zeotropic blends there are two values: bubble pressure (saturated liquid — where vapor first forms) and dew pressure (saturated vapor — where the last liquid disappears). Service technicians use saturation pressure to interpret manifold gauge readings via the PT chart relationship.",
  },
  {
    q: "Why do bubble and dew differ for blends?",
    a: "Zeotropic refrigerant blends are mixtures of components with different normal boiling points. At constant pressure, the more volatile component vaporizes preferentially, shifting the composition of the remaining liquid as evaporation progresses. The saturation temperature changes during the phase transition — the difference between starting (bubble) and ending (dew) is the temperature glide. R-407C has ~11°F glide; R-454C ~14°F; R-455A ~22°F; R-410A is near-azeotropic with ~0.7°F glide.",
  },
  {
    q: "What is the critical point and why does it matter?",
    a: "The critical point is the temperature and pressure above which the liquid and vapor phases become indistinguishable — there is no boiling, no condensation, no separate phases. Above the critical temperature, the refrigerant is a supercritical fluid. R-744 (CO₂) has a critical temperature of 87.8°F, which is why CO₂ refrigeration systems often operate transcritically in warm climates (high-side above the critical point). HFCs like R-410A have much higher critical temperatures (160°F) so they always operate sub-critically in HVAC service.",
  },
  {
    q: "What is the triple point?",
    a: "The triple point is the unique temperature and pressure at which solid, liquid, and vapor coexist in equilibrium. Below the triple-point temperature the refrigerant cannot exist as liquid at any pressure — only solid or vapor. Most HVAC refrigerants have triple-point temperatures well below normal service ranges (R-410A: −238°F; R-134a: −156°F), so triple-point behavior is irrelevant for routine HVAC. CO₂ is an exception: triple point at −69.8°F, which matters for low-temp R-744 system design and refrigerant handling.",
  },
  {
    q: "What about density, enthalpy, and entropy?",
    a: "Liquid density, vapor density, and enthalpy of vaporization come from CoolProp for pure refrigerants and predefined blends, but require an extension to the data generator that isn't shipped yet. For now, use the refrigerant's detail page to find its CoolProp identifier, then query CoolProp directly (Python or via the JS WASM wrapper). The data shown here covers saturation P-T and reference properties (critical point, normal boiling point, molar mass).",
  },
  {
    q: "What's the difference between absolute and gauge pressure?",
    a: "Absolute pressure is measured from a perfect vacuum (0 PSIA = vacuum). Gauge pressure is measured from atmospheric (0 PSIG = atmospheric, approximately 14.696 PSIA at sea level). Service manifold gauges read PSIG by default. This calculator reports PSIG; for PSIA, add 14.696. Likewise the kPa values are gauge — for kPa absolute, add 101.325.",
  },
  {
    q: "Why is normal boiling point a key refrigerant property?",
    a: "Normal boiling point (NBP) is the temperature at which the refrigerant boils at 1 atm (14.696 PSIA, 0 PSIG). It anchors the saturation curve and tells you the range of HVAC applications the refrigerant fits. Low NBP refrigerants (R-744 NBP = −108°F, R-32 NBP = −62°F, R-410A NBP = −60°F) work for AC and commercial refrigeration. Higher NBP refrigerants (R-134a NBP = −15°F, R-1233zd NBP = +65°F) are used for chillers and high-temperature applications.",
  },
  {
    q: "How does this calculator differ from the PT calculator?",
    a: "The PT calculator is a focused bidirectional lookup (enter T → get P, or enter P → get T). This calculator emphasizes the broader saturation properties: bubble, dew, critical point, normal boiling point, and reference physical properties (molar mass). Use the PT calculator for in-the-field service measurements; use this one for engineering design, cycle calculations, or learning the thermodynamic context.",
  },
];

export const metadata: Metadata = {
  title: "Saturation Properties Calculator — Bubble, Dew, Critical Point, NBP",
  description:
    "Refrigerant saturation property reference for 50+ HVAC refrigerants. Bubble and dew pressures at any temperature, critical point, triple point, normal boiling point, molar mass. Sourced from CoolProp 7.2.0 with NIST REFPROP-compatible Helmholtz EOS.",
  alternates: { canonical: `${SITE_URL}/saturation-properties-calculator/` },
};

export default function SaturationPropertiesPage() {
  return (
    <CalculatorShell
      schema={{
        path: "saturation-properties-calculator",
        name: "Saturation Properties Calculator",
        description:
          "Look up bubble, dew, and glide saturation pressures for any refrigerant in the dataset. Plus refrigerant reference properties: critical point, boiling point, molar mass. Sourced from CoolProp 7.2.0.",
        featureList: [
          "Bubble and dew pressures at any temperature in chart range",
          "Both PSIG and kPa gauge units side-by-side",
          "Critical point, normal boiling point, molar mass reference data",
          "Phase diagram visualization explaining saturation regions",
          "Comparison tables across mainstream refrigerant families",
          "Sourced from CoolProp 7.2.0 (REFPROP-compatible Helmholtz EOS)",
          "Mobile-friendly, no signup",
        ],
        publishedDate: PUBLISHED,
        breadcrumbLabel: "Saturation Properties",
      }}
      introOneLiner="Bubble and dew saturation pressures at any temperature, plus the refrigerant's reference properties (critical point, normal boiling point, molar mass). Foundation data for service measurements, retrofit comparisons, and engineering design."
      generatedDate={PUBLISHED.slice(0, 10)}
      howTo={{
        steps: [
          "Pick the refrigerant from the dropdown. Defaults to R-410A.",
          "Enter the temperature of interest in °F or °C.",
          "Read the bubble and dew pressures (PSIG and kPa shown side-by-side). For pure refrigerants and azeotropes bubble = dew.",
          "Reference properties (critical T, critical P, NBP, molar mass) shown alongside the saturation values.",
          "Use the result to interpret service measurements, do cycle calculations, or compare against alternative refrigerants.",
        ],
        commonErrors: [
          "Confusing PSIG and PSIA — manifold gauges read PSIG; PSIA = PSIG + 14.696.",
          "Using bubble pressure for superheat calculations on zeotropic blends — use dew curve at suction pressure.",
          "Trying to look up properties above the critical temperature — saturation doesn't exist; the calculator returns 'transcritical'.",
          "Treating the chart range (-40 to 150°F) as universal — some refrigerants have narrower validity (R-744 critical at 87.8°F).",
        ],
      }}
      math={{
        formula:
          "Saturation properties from CoolProp 7.2.0:\n  P_sat,bubble(T) = saturated liquid pressure at temperature T\n  P_sat,dew(T)    = saturated vapor pressure at temperature T\n  Glide(T)        = T_sat,dew(P) − T_sat,bubble(P) at the same pressure\n\nReference properties:\n  T_critical      = temperature above which no phase distinction\n  P_critical      = pressure at critical point\n  T_NBP           = saturation T at 1 atm absolute (0 PSIG)\n  M               = molar mass",
        sourceCitation:
          "All saturation properties from CoolProp 7.2.0 (Bell, Wronski, Quoilin, Lemort 2014, doi:10.1021/ie4033999), REFPROP-compatible Helmholtz EOS. Critical points cross-checked against NIST REFPROP 10.0 (NIST Standard Reference Database 23). Normal boiling points per ASHRAE Standard 34-2022. Molar masses per CAS Registry / NIST WebBook.",
        workedExample:
          "R-410A at 70°F:\n  Bubble pressure: 201.8 PSIG (PSIA = 216.5)\n  Dew pressure: 201.1 PSIG (PSIA = 215.8)\n  Glide: ~0.7°F (near-azeotropic)\n  Critical T: 160.5°F\n  Critical P: 712.8 PSIA (698.1 PSIG)\n  NBP: −60.0°F\n  Molar mass: 72.59 g/mol\n\nR-407C at 70°F:\n  Bubble pressure: 140.5 PSIG\n  Dew pressure: 117.3 PSIG\n  Glide: ~11°F (significant zeotrope)\n  Critical T: 187.0°F\n  Critical P: 689.4 PSIA\n  NBP: −47.4°F\n  Molar mass: 86.20 g/mol",
      }}
      relatedTools={[
        { href: "/pt-calculator/", label: "PT Calculator", blurb: "Bidirectional temperature ↔ pressure lookup for service use." },
        { href: "/superheat-calculator/", label: "Superheat Calculator", blurb: "Apply dew pressure to suction-line measurements." },
        { href: "/subcooling-calculator/", label: "Subcooling Calculator", blurb: "Apply bubble pressure to liquid-line measurements." },
        { href: "/refrigerant-pt-comparison-tool/", label: "PT Comparison Tool", blurb: "Visual overlay of 2-4 refrigerant saturation curves." },
        { href: "/refrigerant/r-410a/", label: "R-410A detail page", blurb: "Full reference for R-410A and 50+ other refrigerants." },
      ]}
      faqs={FAQS}
      bodySections={<RichContent />}
    >
      <SaturationPropertiesCalculator />
    </CalculatorShell>
  );
}

function RichContent() {
  return (
    <>
      <TechSection icon="composition" tone="blue" title="Saturation properties — the thermodynamic backbone of HVAC service">
        <p>
          Every refrigerant&apos;s service behavior is anchored by its saturation curve: the
          locus of points in the pressure-temperature plane where liquid and vapor coexist
          in equilibrium. The curve starts at the triple point (where solid, liquid, and
          vapor meet) and ends at the critical point (where the phases merge into a
          supercritical fluid).
        </p>
        <p>
          On the curve, pressure and temperature are coupled: knowing one tells you the
          other. Above the curve (higher P or lower T) the refrigerant is liquid; below
          the curve (lower P or higher T) it&apos;s vapor; on the curve it&apos;s a
          two-phase mixture. The saturation curve is what makes service manifold gauges
          useful — read a pressure, look up the saturation temperature, infer the phase
          state.
        </p>
        <PhaseDiagramExplainer />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Pressure-temperature phase diagram for a pure refrigerant. The saturation curve
          (solid line) bounds the two-phase region. Above the critical point no phase
          distinction exists. Below the triple point the refrigerant cannot be liquid at
          any pressure. Source: ASHRAE Handbook of Refrigeration 2022 Chapter 1
          (vapor-compression cycle thermodynamics).
        </p>
        <KeyInsight tone="emerald" icon="insight" title="One curve, everything follows">
          Superheat, subcooling, expansion-device sizing, charge calculations, retrofit
          decisions — every HVAC service calculation traces back to the saturation curve.
          This calculator gives you the foundation data; the other site calculators apply
          it to specific service scenarios.
        </KeyInsight>
      </TechSection>

      <TechSection icon="data" tone="purple" title="Reference properties across mainstream refrigerants">
        <Panel title="Critical point, normal boiling point, molar mass" icon={TableIcon}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-[10px] uppercase tracking-wider text-zinc-500 dark:border-zinc-800">
                  <th className="py-1.5 text-left">Refrigerant</th>
                  <th className="py-1.5 text-right">T_crit (°F)</th>
                  <th className="py-1.5 text-right">P_crit (PSIA)</th>
                  <th className="py-1.5 text-right">NBP (°F)</th>
                  <th className="py-1.5 text-right">Molar mass (g/mol)</th>
                  <th className="py-1.5 text-left">Notes</th>
                </tr>
              </thead>
              <tbody className="font-mono tabular-nums">
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="text-left">R-22</td><td className="text-right">205.1</td><td className="text-right">722.2</td><td className="text-right">−41.4</td><td className="text-right">86.5</td><td className="text-xs text-left font-sans">Legacy HCFC, phased out 2020</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="text-left">R-32</td><td className="text-right">172.6</td><td className="text-right">838.8</td><td className="text-right">−61.8</td><td className="text-right">52.0</td><td className="text-xs text-left font-sans">A2L, dominant in Asia</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="text-left">R-410A</td><td className="text-right">160.4</td><td className="text-right">712.8</td><td className="text-right">−60.0</td><td className="text-right">72.6</td><td className="text-xs text-left font-sans">A1 HFC blend, near-azeotropic</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="text-left">R-454B</td><td className="text-right">170.5</td><td className="text-right">756.0</td><td className="text-right">−58.4</td><td className="text-right">62.6</td><td className="text-xs text-left font-sans">A2L, leading R-410A replacement in NA</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="text-left">R-134a</td><td className="text-right">213.9</td><td className="text-right">589.0</td><td className="text-right">−15.2</td><td className="text-right">102.0</td><td className="text-xs text-left font-sans">Chiller / mobile AC HFC</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="text-left">R-407C</td><td className="text-right">187.0</td><td className="text-right">689.4</td><td className="text-right">−47.4</td><td className="text-right">86.2</td><td className="text-xs text-left font-sans">R-22 retrofit zeotrope</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="text-left">R-404A</td><td className="text-right">161.6</td><td className="text-right">540.4</td><td className="text-right">−51.6</td><td className="text-right">97.6</td><td className="text-xs text-left font-sans">Legacy LT commercial HFC, AIM Act</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="text-left">R-454C</td><td className="text-right">181.0</td><td className="text-right">643.0</td><td className="text-right">−51.3</td><td className="text-right">90.8</td><td className="text-xs text-left font-sans">A2L LT commercial replacement</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="text-left">R-1234yf</td><td className="text-right">200.7</td><td className="text-right">488.2</td><td className="text-right">−20.9</td><td className="text-right">114.0</td><td className="text-xs text-left font-sans">Mobile AC HFO</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="text-left">R-744 (CO₂)</td><td className="text-right">87.8</td><td className="text-right">1071.4</td><td className="text-right">−108.4</td><td className="text-right">44.0</td><td className="text-xs text-left font-sans">Transcritical above 87.8°F</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="text-left">R-290 (propane)</td><td className="text-right">206.1</td><td className="text-right">617.4</td><td className="text-right">−43.7</td><td className="text-right">44.1</td><td className="text-xs text-left font-sans">A3 hydrocarbon, low GWP</td></tr>
                <tr><td className="text-left">R-717 (NH₃)</td><td className="text-right">270.3</td><td className="text-right">1645.8</td><td className="text-right">−28.0</td><td className="text-right">17.0</td><td className="text-xs text-left font-sans">B2L industrial refrigeration</td></tr>
              </tbody>
            </table>
          </div>
        </Panel>
        <CriticalPointBars />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Critical temperature visualization across HVAC refrigerants. R-744 (CO₂) has the
          lowest critical temperature (87.8°F) — below typical hot-weather ambient — which
          is why R-744 commercial refrigeration often operates transcritically. Ammonia
          (R-717) has the highest critical temperature (270°F) and is the most
          thermodynamically capable refrigerant for industrial applications. Source:
          CoolProp 7.2.0 cross-checked against NIST REFPROP 10.0.
        </p>
      </TechSection>

      <TechSection icon="thermometer" tone="emerald" title="Normal boiling point — the application envelope anchor">
        <p>
          The normal boiling point (NBP) — saturation temperature at 1 atm absolute — is
          the most useful single-number characterization of a refrigerant&apos;s service
          envelope. Refrigerants with low NBP work in cold applications without the system
          going into vacuum on the suction side; refrigerants with high NBP avoid excessive
          high-side pressure but can&apos;t maintain low evaporator temperatures.
        </p>
        <Panel title="NBP by application family" icon={TableIcon}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-[10px] uppercase tracking-wider text-zinc-500 dark:border-zinc-800">
                  <th className="py-1.5 text-left">Application</th>
                  <th className="py-1.5 text-left">Typical evap T</th>
                  <th className="py-1.5 text-left">Typical refrigerants (NBP)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5">Cryogenics</td><td className="py-1.5 font-mono">below −150°F</td><td className="py-1.5 text-xs">R-23 (NBP −115°F), R-14 (NBP −198°F)</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5">Ultra-low-temp medical / freezer</td><td className="py-1.5 font-mono">−100°F to −60°F</td><td className="py-1.5 text-xs">R-744 (NBP −108°F), R-744 / R-290 cascades</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5">Low-temp commercial</td><td className="py-1.5 font-mono">−40°F to −10°F</td><td className="py-1.5 text-xs">R-404A (NBP −52°F), R-454C, R-455A</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5">Medium-temp commercial</td><td className="py-1.5 font-mono">10°F to 30°F</td><td className="py-1.5 text-xs">R-448A, R-449A, R-407A</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5">Residential / light commercial AC</td><td className="py-1.5 font-mono">40°F to 50°F</td><td className="py-1.5 text-xs">R-410A (NBP −60°F), R-32, R-454B, R-22</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5">Mobile AC</td><td className="py-1.5 font-mono">35°F to 45°F</td><td className="py-1.5 text-xs">R-1234yf (NBP −21°F), R-134a</td></tr>
                <tr className="border-b border-zinc-100 dark:border-zinc-900"><td className="py-1.5">Centrifugal chiller</td><td className="py-1.5 font-mono">40°F to 50°F</td><td className="py-1.5 text-xs">R-134a (NBP −15°F), R-513A, R-1234ze (NBP +0°F)</td></tr>
                <tr><td className="py-1.5">High-temp / industrial process</td><td className="py-1.5 font-mono">100°F to 250°F</td><td className="py-1.5 text-xs">R-1233zd (NBP +65°F), R-1336mzz</td></tr>
              </tbody>
            </table>
          </div>
        </Panel>
      </TechSection>

      <TechSection icon="service" tone="amber" title="Real engineering scenarios using saturation properties">
        <p>
          Five scenarios showing how saturation properties anchor engineering decisions:
          retrofit envelope check, cycle calculation for capacity sizing, critical-point
          relevance for CO₂ system design, evaporator design for chiller, low-temp
          refrigerant selection.
        </p>
      </TechSection>

      <ServiceProblem
        number={1}
        refrigerant="R-410A"
        title="Compressor discharge above critical point — protection cutout sizing"
        scenario="R-410A residential AC. The high-pressure safety cutout needs to be set below the critical pressure to prevent operation in the supercritical regime. What's the value to set?"
      >
        <Panel title="Saturation properties referenced" icon={CalcIcon}>
          <Lookups
            rows={[
              { input: "R-410A T_critical", output: "160.4°F", note: "from this calculator" },
              { input: "R-410A P_critical", output: "712.8 PSIA = 698 PSIG", note: "absolute - 14.7" },
            ]}
          />
        </Panel>
        <Panel title="Cutout sizing logic" icon={Activity}>
          <Derived
            rows={[
              { formula: "Standard HPS cutout = 0.85 × P_critical", verdict: "info", note: "common safety factor" },
              { formula: "Cutout = 0.85 × 698 = 593 PSIG", verdict: "ok", note: "Carrier / Trane R-410A residential default 600-650 PSIG" },
            ]}
          />
        </Panel>
        <VerdictBanner status="info" title="High-pressure cutout typically set at 600-650 PSIG">
          Below the critical pressure (698 PSIG) with margin. Industry-standard cutout
          settings on R-410A residential equipment fall in 600-650 PSIG range — well
          below critical to protect against runaway and the system operating in unstable
          near-critical regime where small temperature changes cause large pressure
          excursions.
        </VerdictBanner>
      </ServiceProblem>

      <ServiceProblem
        number={2}
        refrigerant="R-744 (CO₂)"
        title="CO₂ supermarket — when does the system go transcritical?"
        scenario="R-744 transcritical supermarket commercial refrigeration system in northern climate. Operator asks: at what outdoor ambient does the system switch from sub-critical to transcritical operation?"
      >
        <Panel title="Saturation properties" icon={CalcIcon}>
          <Lookups
            rows={[
              { input: "R-744 T_critical", output: "87.8°F", note: "fundamental property" },
              { input: "R-744 P_critical", output: "1071.4 PSIA = 1057 PSIG", note: "high-pressure system" },
              { input: "R-744 T_triple", output: "−69.8°F", note: "below this T, no liquid CO₂" },
            ]}
          />
        </Panel>
        <VerdictBanner status="info" title="Transcritical above 87.8°F outdoor">
          When outdoor air temperature exceeds 87.8°F (R-744 critical T), the gas cooler
          (high side) operates supercritically — there is no condensation, just sensible
          gas cooling. Below 87.8°F outdoor the system operates sub-critically with normal
          condensation. Most R-744 supermarket systems are designed to handle both modes
          and switch automatically via the high-pressure throttle valve setpoint.
        </VerdictBanner>
        <FixCallout>
          R-744 system design must account for both regimes: sub-critical condenser /
          transcritical gas cooler. Components are rated for transcritical pressures
          (typically 130 bar / 1900 PSIG design pressure). The high-pressure valve
          modulates to optimize system COP based on whether the cycle is sub-critical or
          transcritical at the current ambient.
        </FixCallout>
      </ServiceProblem>

      <ServiceProblem
        number={3}
        refrigerant="R-1234ze (chiller)"
        title="Chiller refrigerant selection — why R-1234ze NBP matters"
        scenario="New centrifugal chiller specification. R-1234ze is being considered as a low-GWP HFO option for new chiller plants. What's special about R-1234ze's NBP that affects chiller design?"
      >
        <Panel title="Saturation properties comparison" icon={CalcIcon}>
          <Lookups
            rows={[
              { input: "R-134a NBP", output: "−15.2°F", note: "standard chiller HFC" },
              { input: "R-1234ze NBP", output: "+0.0°F (15.4°F warmer)", note: "low-pressure HFO" },
              { input: "R-1234ze P @ 45°F evap", output: "~5 PSIG (vs R-134a 40 PSIG)", note: "much lower" },
            ]}
          />
        </Panel>
        <VerdictBanner status="info" title="R-1234ze runs in mild vacuum on the evaporator side">
          R-1234ze&apos;s NBP at 0°F means at typical chiller evaporator temperatures
          (45°F), the saturation pressure is only ~5 PSIG — barely above atmospheric and
          close to entering vacuum for slightly colder evap temps. R-1234ze chiller
          systems are designed with low-pressure refrigerant management in mind:
          larger-bore piping, purge units to handle non-condensables that enter through
          near-atmospheric joints, vacuum-rated service procedures.
        </VerdictBanner>
        <FixCallout>
          For new chiller specification, the low-pressure characteristics of R-1234ze
          favor systems engineered specifically for it (Trane Chillers using R-1234ze).
          Retrofitting an existing R-134a chiller to R-1234ze is generally not done —
          equipment must be designed around the low-pressure operating envelope.
        </FixCallout>
      </ServiceProblem>

      <ServiceProblem
        number={4}
        refrigerant="R-32 (residential AC)"
        title="R-32 application sizing — using NBP for evaporator T limit"
        scenario="R-32 mini-split design for a hot-and-humid climate where the dew point requires below-freezing evaporator temperatures. Can R-32 reach a 20°F evaporator without going into vacuum?"
      >
        <Panel title="Saturation property check" icon={CalcIcon}>
          <Lookups
            rows={[
              { input: "R-32 NBP", output: "−61.8°F", note: "atmospheric saturation T" },
              { input: "R-32 P @ 20°F evap", output: "~80 PSIG (positive)", note: "well above atmospheric" },
              { input: "R-32 P @ −20°F", output: "~25 PSIG (still positive)", note: "comfortable LT range" },
            ]}
          />
        </Panel>
        <VerdictBanner status="ok" title="R-32 easily handles 20°F evap without vacuum">
          R-32&apos;s low NBP (−62°F) means saturation pressure stays positive across
          residential AC and even low-temp commercial ranges. At 20°F evaporator, pressure
          is ~80 PSIG — well into positive-gauge territory. R-32 can comfortably operate
          across the residential AC and most commercial refrigeration ranges without
          vacuum management.
        </VerdictBanner>
      </ServiceProblem>

      <ServiceProblem
        number={5}
        refrigerant="R-407C vs R-410A"
        title="Capacity comparison using saturation properties — pressure ratio at design"
        scenario="Comparing R-407C and R-410A capacity potential using saturation properties alone. Volumetric capacity is roughly proportional to suction-side density × heat-of-vaporization; for first-order comparison, suction-side pressure (and thus density) is the dominant factor."
      >
        <Panel title="Saturation property comparison" icon={CalcIcon}>
          <Lookups
            rows={[
              { input: "R-410A P @ 40°F evap", output: "119 PSIG", note: "suction pressure" },
              { input: "R-407C P @ 40°F evap (dew)", output: "63 PSIG", note: "lower suction pressure" },
              { input: "Pressure ratio R-410A/R-407C", output: "1.89×", note: "approximate density ratio" },
            ]}
          />
        </Panel>
        <VerdictBanner status="info" title="R-410A delivers ~1.5-1.6× capacity per unit compressor displacement vs R-407C">
          The roughly 2× suction pressure of R-410A vs R-407C translates to approximately
          50-60% more volumetric capacity per unit compressor displacement (after
          accounting for compression ratio and heat-of-vaporization differences). This is
          why R-22 retrofit to R-410A wasn&apos;t a drop-in: smaller-displacement R-410A
          compressors deliver the same capacity as larger R-22 equipment, but the
          equipment needs to be sized for R-410A from the start.
        </VerdictBanner>
        <FixCallout>
          For detailed capacity comparison, do full thermodynamic cycle calculation using
          CoolProp (Python or WASM): compute h_1 and h_2 at suction and discharge,
          subtract for refrigerating effect, multiply by mass flow rate. The saturation
          property comparison here is a first-order proxy — useful for screening but not
          a substitute for cycle modeling.
        </FixCallout>
      </ServiceProblem>

      <TechSection icon="book" tone="emerald" title="When to use this calculator vs the others">
        <ul>
          <li>
            <strong>Saturation Properties</strong> (this page) — broad saturation reference
            with bubble, dew, critical point, NBP, molar mass. Best for engineering design,
            cycle calculations, learning thermodynamic context.
          </li>
          <li>
            <strong>
              <a href="/pt-calculator/" className="underline">PT Calculator</a>
            </strong>{" "}
            — focused bidirectional lookup for service measurement. Faster for in-the-field
            use.
          </li>
          <li>
            <strong>
              <a href="/superheat-calculator/" className="underline">Superheat Calculator</a>
            </strong>{" "}
            — applies saturation values to suction-line measurements.
          </li>
          <li>
            <strong>
              <a href="/subcooling-calculator/" className="underline">Subcooling Calculator</a>
            </strong>{" "}
            — applies saturation values to liquid-line measurements.
          </li>
          <li>
            <strong>
              <a href="/refrigerant-pt-comparison-tool/" className="underline">PT Comparison Tool</a>
            </strong>{" "}
            — visual overlay of multiple refrigerants&apos; saturation curves.
          </li>
          <li>
            <strong>Per-refrigerant detail pages</strong> — full reference for any
            refrigerant in the dataset, with PT charts, properties, lubricant, safety, and
            replacement options.
          </li>
        </ul>
      </TechSection>

      <TechSection icon="source" tone="zinc" title="Primary sources">
        <ul>
          <li>
            <strong>CoolProp 7.2.0</strong> (Bell, Wronski, Quoilin, Lemort 2014,
            doi:10.1021/ie4033999) — REFPROP-compatible Helmholtz EOS for all saturation
            and reference properties.
          </li>
          <li>
            <strong>NIST REFPROP 10.0</strong> (Lemmon, Bell, Huber, McLinden 2018,
            doi:10.18434/T4/1502528) — Reference Fluid Thermodynamic and Transport
            Properties Database. CoolProp cross-checks against REFPROP for accuracy.
          </li>
          <li>
            <strong>ASHRAE Standard 34-2022</strong> — Designation and Safety Classification
            of Refrigerants. Normal boiling points and reference designation.
          </li>
          <li>
            <strong>ASHRAE Handbook of Refrigeration 2022</strong> — Chapter 1
            (vapor-compression cycle), Chapter 7 (lubricants), Chapter 23 (service
            procedures). Phase diagram explanations, saturation property usage in cycle
            calculations.
          </li>
          <li>
            <strong>NIST WebBook</strong> — chemical properties, molar masses, CAS registry
            references.
          </li>
          <li>
            <strong>Manufacturer technical datasheets</strong> — Honeywell, Chemours,
            Arkema, AGC saturation tables for 11 manufacturer-blend refrigerants not in
            CoolProp&apos;s reference library.
          </li>
        </ul>
      </TechSection>
    </>
  );
}

/* ──────────────────────── Inline SVG charts ──────────────────────── */

function PhaseDiagramExplainer() {
  const W = 720;
  const H = 360;
  const PAD_L = 60;
  const PAD_R = 30;
  const PAD_T = 50;
  const PAD_B = 60;
  const PLOT_W = W - PAD_L - PAD_R;
  const PLOT_H = H - PAD_T - PAD_B;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Pressure-temperature phase diagram with saturation curve, critical point, triple point, and labeled phase regions."
      className="my-3 h-auto w-full text-zinc-700 dark:text-zinc-300"
      preserveAspectRatio="xMidYMid meet"
    >
      <text x={W / 2} y={24} textAnchor="middle" fontSize="14" fontWeight={600} fill="currentColor">
        Pressure-temperature phase diagram (pure refrigerant, schematic)
      </text>
      {/* axes */}
      <line x1={PAD_L} y1={PAD_T + PLOT_H} x2={PAD_L + PLOT_W} y2={PAD_T + PLOT_H} stroke="currentColor" opacity={0.6} />
      <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + PLOT_H} stroke="currentColor" opacity={0.6} />
      <text x={PAD_L + PLOT_W / 2} y={H - 24} textAnchor="middle" fontSize="11" fontWeight={600} fill="currentColor">
        Temperature →
      </text>
      <text
        x={20}
        y={PAD_T + PLOT_H / 2}
        textAnchor="middle"
        fontSize="11"
        fontWeight={600}
        fill="currentColor"
        transform={`rotate(-90 20 ${PAD_T + PLOT_H / 2})`}
      >
        Pressure →
      </text>
      {/* saturation curve - hand-drawn approximation: starts at triple point (lower left), rises exponentially to critical point */}
      <path
        d={`M ${PAD_L + 80} ${PAD_T + PLOT_H - 20} Q ${PAD_L + 250} ${PAD_T + PLOT_H - 100} ${PAD_L + 420} ${PAD_T + 40}`}
        fill="none"
        stroke="#8e4dd1"
        strokeWidth={2.5}
      />
      {/* solid-liquid line (vertical, conceptual) */}
      <line x1={PAD_L + 80} y1={PAD_T + PLOT_H - 20} x2={PAD_L + 90} y2={PAD_T + 10} stroke="#5a6f8a" strokeWidth={2} strokeDasharray="4 2" />
      {/* triple point */}
      <circle cx={PAD_L + 80} cy={PAD_T + PLOT_H - 20} r={4} fill="#d49a2b" />
      <text x={PAD_L + 95} y={PAD_T + PLOT_H - 16} fontSize="10" fill="#d49a2b" fontWeight={600}>
        triple point
      </text>
      {/* critical point */}
      <circle cx={PAD_L + 420} cy={PAD_T + 40} r={5} fill="#c45757" />
      <text x={PAD_L + 410} y={PAD_T + 30} fontSize="10" fill="#c45757" fontWeight={600} textAnchor="end">
        critical point
      </text>
      {/* phase labels */}
      <text x={PAD_L + 200} y={PAD_T + 80} textAnchor="middle" fontSize="11" fontWeight={500} fill="#3a8ed1">
        LIQUID
      </text>
      <text x={PAD_L + 400} y={PAD_T + PLOT_H - 60} textAnchor="middle" fontSize="11" fontWeight={500} fill="#5a8a3a">
        VAPOR
      </text>
      <text x={PAD_L + 100} y={PAD_T + 80} textAnchor="middle" fontSize="11" fontWeight={500} fill="#5a6f8a">
        SOLID
      </text>
      <text x={PAD_L + 500} y={PAD_T + 40} textAnchor="middle" fontSize="11" fontWeight={500} fill="#c45757">
        SUPERCRITICAL
      </text>
      {/* saturation curve label */}
      <text x={PAD_L + 280} y={PAD_T + PLOT_H - 100} fontSize="11" fontWeight={600} fill="#8e4dd1">
        saturation curve
      </text>
      <text x={PAD_L + 280} y={PAD_T + PLOT_H - 86} fontSize="9" fill="currentColor" opacity={0.7}>
        (liquid ⇌ vapor equilibrium)
      </text>
    </svg>
  );
}

function CriticalPointBars() {
  const data: { label: string; tCrit: number; tone: string }[] = [
    { label: "R-744 (CO₂)", tCrit: 87.8, tone: "#c45757" },
    { label: "R-410A", tCrit: 160.4, tone: "#3a8ed1" },
    { label: "R-404A", tCrit: 161.6, tone: "#3a8ed1" },
    { label: "R-454B", tCrit: 170.5, tone: "#5a8a3a" },
    { label: "R-32", tCrit: 172.6, tone: "#5a8a3a" },
    { label: "R-454C", tCrit: 181.0, tone: "#5a8a3a" },
    { label: "R-407C", tCrit: 187.0, tone: "#3a8ed1" },
    { label: "R-1234yf", tCrit: 200.7, tone: "#5a8a3a" },
    { label: "R-22", tCrit: 205.1, tone: "#d49a2b" },
    { label: "R-290 (propane)", tCrit: 206.1, tone: "#d49a2b" },
    { label: "R-134a", tCrit: 213.9, tone: "#3a8ed1" },
    { label: "R-717 (NH₃)", tCrit: 270.3, tone: "#7a3a3a" },
  ];
  const W = 720;
  const ROW_H = 22;
  const PAD_T = 40;
  const PAD_B = 28;
  const LABEL_W = 130;
  const PAD_R = 60;
  const BAR_W = W - LABEL_W - PAD_R;
  const xMax = 300;
  const xScale = (v: number) => LABEL_W + (v / xMax) * BAR_W;
  const H = PAD_T + data.length * ROW_H + PAD_B;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Critical temperature across HVAC refrigerants. R-744 (CO₂) lowest, ammonia highest."
      className="my-3 h-auto w-full text-zinc-700 dark:text-zinc-300"
      preserveAspectRatio="xMidYMid meet"
    >
      <text x={W / 2} y={20} textAnchor="middle" fontSize="13" fontWeight={600} fill="currentColor">
        Critical temperature across HVAC refrigerants (°F)
      </text>
      {[0, 50, 100, 150, 200, 250, 300].map((t) => (
        <g key={`tick-${t}`}>
          <line x1={xScale(t)} y1={PAD_T - 4} x2={xScale(t)} y2={PAD_T + data.length * ROW_H} stroke="currentColor" opacity={0.1} strokeDasharray="2 3" />
          <text x={xScale(t)} y={PAD_T - 8} textAnchor="middle" fontSize="9" fill="currentColor" opacity={0.6}>{t}</text>
        </g>
      ))}
      <line x1={xScale(95)} y1={PAD_T - 4} x2={xScale(95)} y2={PAD_T + data.length * ROW_H} stroke="#d49a2b" strokeWidth={1.5} strokeDasharray="3 3" />
      <text x={xScale(95)} y={PAD_T + data.length * ROW_H + 16} textAnchor="middle" fontSize="9" fill="#d49a2b" fontWeight={600}>
        ← typical 95°F ambient
      </text>
      {data.map((d, i) => {
        const y = PAD_T + i * ROW_H;
        const barLen = (d.tCrit / xMax) * BAR_W;
        return (
          <g key={d.label}>
            <text x={LABEL_W - 8} y={y + 12} textAnchor="end" fontSize="10" fontWeight={500} fill="currentColor">
              {d.label}
            </text>
            <rect x={LABEL_W} y={y + 4} width={barLen} height={12} fill={d.tone} rx={2} />
            <text x={LABEL_W + barLen + 6} y={y + 14} fontSize="10" fontWeight={600} fill="currentColor">
              {d.tCrit}°F
            </text>
          </g>
        );
      })}
    </svg>
  );
}
