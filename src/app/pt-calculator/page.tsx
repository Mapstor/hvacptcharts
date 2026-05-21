import type { Metadata } from "next";
import { refrigerants } from "@/data/refrigerants";
import { CalculatorShell } from "@/components/calculators/shared/CalculatorShell";
import { PtCalculator } from "@/components/calculators/PtCalculator";
import { SITE_URL } from "@/lib/schema/shared";

const PUBLISHED = refrigerants[0]?.dataSource.ptChartGeneratedAt ?? new Date().toISOString();

const FAQS = [
  {
    q: "What's the difference between PSI and PSIG?",
    a: "PSI is a generic unit of pressure (pounds per square inch). PSIG is pressure expressed as gauge — pressure above atmospheric. Service manifold gauges read in PSIG (0 PSIG = atmospheric pressure, 14.696 PSIA). All values on this calculator and across hvacptcharts.com are PSIG unless explicitly stated as PSIA.",
  },
  {
    q: "Why do some refrigerants show two pressures (bubble and dew)?",
    a: "Zeotropic blends — refrigerants whose components have different volatilities — boil and condense across a range of temperatures at constant pressure rather than at a single point. The bubble pressure is the saturation pressure of the liquid; the dew pressure is the saturation pressure of the vapor. The difference is the temperature glide. For pure refrigerants and azeotropes (e.g., R-22, R-134a, R-410A near-azeotrope, R-507A azeotrope) the two values coincide.",
  },
  {
    q: "How accurate is this calculator?",
    a: "The saturation pressures come from CoolProp 7.2.0 (REFPROP-compatible Helmholtz-energy equations of state), cross-checked against manufacturer datasheets from Honeywell, Chemours, and Arkema. For pure refrigerants and predefined CoolProp mixtures the accuracy is typically better than ±0.5% over the chart range. For the 11 manufacturer blends not modeled by CoolProp (R-448A, R-450A, R-1336mzz(Z), etc.) the values come directly from the named manufacturer's PT chart.",
  },
  {
    q: "What temperature range does the chart cover?",
    a: "Default coverage is -40°F to 150°F at 1°F increments (191 data points). Sub-critical refrigerants are truncated at the critical temperature where no saturation state exists — R-744 (CO2) stops at 87°F (Tcrit = 87.8°F), R-13 at 84°F, R-1150 (ethylene) at 48°F. Outside the chart range, the calculator returns 'out of range' rather than extrapolating.",
  },
  {
    q: "Can I get PT values in kPa?",
    a: "Yes — toggle the pressure unit to kPa. The kPa values are gauge (kPa above atmospheric, where atmospheric is 101.325 kPa). For absolute pressure, add 101.325.",
  },
];

export const metadata: Metadata = {
  title: "PT Calculator — Refrigerant Saturation Pressure & Temperature",
  description:
    "Free pressure-temperature calculator for 50+ HVAC refrigerants. Computes saturation pressure from temperature, or temperature from pressure, with bubble/dew handling for zeotropic blends. Verified CoolProp data.",
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
          "50+ refrigerants with verified CoolProp data",
          "Bidirectional: temperature → pressure or pressure → temperature",
          "Bubble and dew curves for zeotropic blends",
          "Imperial (°F, PSIG) and metric (°C, kPa) units",
          "No signup, no ads, mobile-friendly",
        ],
        publishedDate: PUBLISHED,
        breadcrumbLabel: "PT Calculator",
      }}
      introOneLiner="Enter a temperature or a pressure for any refrigerant in the dataset; get the corresponding saturation value, with bubble/dew handling for zeotropic blends."
      generatedDate={PUBLISHED.slice(0, 10)}
      howTo={{
        steps: [
          "Pick a refrigerant from the dropdown. Defaults to R-410A.",
          "Choose direction: 'Pressure from temperature' (PT chart lookup) or 'Temperature from pressure' (inverse).",
          "Adjust unit toggles if you need metric values.",
          "Enter your value. The result updates immediately.",
        ],
        commonErrors: [
          "Confusing PSIG (gauge) with PSIA (absolute). Manifold gauges read PSIG.",
          "Using the bubble pressure for superheat math on a zeotropic blend — use the dew pressure instead. The superheat calculator handles this automatically.",
        ],
      }}
      math={{
        formula: "P_sat = f(T)  or  T_sat = f(P), interpolated linearly between adjacent points in the refrigerant's PT chart",
        sourceCitation:
          "Saturation pressures from CoolProp 7.2.0 (Bell, Wronski, Quoilin, Lemort 2014), REFPROP-compatible Helmholtz EOS. For the 11 manufacturer-blend refrigerants not modeled by CoolProp, values come from the named manufacturer PT charts cited on each refrigerant's detail page.",
        workedExample:
          "R-410A at 70°F: CoolProp returns P_bubble = 201.76 PSIG, P_dew = 201.07 PSIG (~0.7 PSI glide).\n\nR-407C at 70°F: CoolProp returns P_bubble = 140.52 PSIG, P_dew = 117.29 PSIG (~23 PSI glide — significant zeotrope).\n\nR-744 (CO2) at 70°F: P_sat = 838.13 PSIG. Above 87.8°F (the critical point) no saturation state exists and the chart truncates.",
      }}
      relatedTools={[
        { href: "/superheat-calculator/", label: "Superheat Calculator", blurb: "Suction-line PSIG + measured °F → superheat, with diagnostic context." },
        { href: "/subcooling-calculator/", label: "Subcooling Calculator", blurb: "Liquid-line PSIG + measured °F → subcooling." },
        { href: "/refrigerant-pt-comparison-tool/", label: "PT Comparison Tool", blurb: "Overlay 2-4 refrigerants' PT curves for side-by-side comparison." },
      ]}
      faqs={FAQS}
    >
      <PtCalculator />
    </CalculatorShell>
  );
}
