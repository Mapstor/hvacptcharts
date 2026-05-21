import type { Metadata } from "next";
import { refrigerants } from "@/data/refrigerants";
import { CalculatorShell } from "@/components/calculators/shared/CalculatorShell";
import { SaturationPropertiesCalculator } from "@/components/calculators/SaturationPropertiesCalculator";
import { SITE_URL } from "@/lib/schema/shared";

const PUBLISHED = refrigerants[0]?.dataSource.ptChartGeneratedAt ?? new Date().toISOString();

const FAQS = [
  {
    q: "What is saturation pressure?",
    a: "Saturation pressure is the pressure at which a refrigerant exists as both liquid and vapor in equilibrium at a given temperature. For pure refrigerants and azeotropes, a single saturation pressure corresponds to each temperature. For zeotropic blends, there are two values: bubble pressure (saturated liquid) and dew pressure (saturated vapor). Service technicians use saturation pressure to interpret manifold gauge readings.",
  },
  {
    q: "Why do bubble and dew differ for blends?",
    a: "Zeotropic refrigerant blends are mixtures of refrigerants with different normal boiling points. At constant pressure, the more volatile component vaporizes preferentially, shifting the composition of the remaining liquid. As a result, the saturation temperature changes during the phase transition — the difference between starting (bubble) and ending (dew) is the temperature glide. R-407C has ~7 K glide; R-454C has ~5 K; R-410A and R-507A are near-azeotropic with negligible glide.",
  },
  {
    q: "What about density and enthalpy?",
    a: "Liquid density, vapor density, and enthalpy of vaporization are available from CoolProp for pure refrigerants and predefined blends, but they require an extension to the data generator that isn't shipped yet. Use the refrigerant's detail page to find its CoolProp identifier, then query CoolProp directly (Python, or via the JS WASM wrapper used by this site's data generator).",
  },
  {
    q: "What's the difference between absolute and gauge pressure?",
    a: "Absolute pressure is measured from a perfect vacuum (0 PSIA = vacuum). Gauge pressure is measured from atmospheric (0 PSIG = ambient atmospheric, approximately 14.696 PSIA at sea level). Service manifold gauges read in PSIG by default. This calculator reports PSIG; for PSIA, add 14.696. Likewise kPa here is gauge — for absolute, add 101.325 kPa.",
  },
];

export const metadata: Metadata = {
  title: "Saturation Properties Calculator — Refrigerant Bubble, Dew, Glide",
  description:
    "Saturation pressure-temperature lookup for HVAC refrigerants, with bubble and dew pressures, glide, and reference properties (critical point, boiling point, molar mass).",
  alternates: { canonical: `${SITE_URL}/saturation-properties-calculator/` },
};

export default function SaturationPropertiesPage() {
  return (
    <CalculatorShell
      schema={{
        path: "saturation-properties-calculator",
        name: "Saturation Properties Calculator",
        description:
          "Look up bubble, dew, and glide saturation pressures for any refrigerant in the dataset. Plus refrigerant reference properties: critical point, boiling point, molar mass.",
        featureList: [
          "Bubble and dew pressures at any temperature in the chart range",
          "Both PSIG and kPa gauge units side-by-side",
          "Refrigerant reference properties from the data layer",
          "Honest note about density and enthalpy of vaporization (pending generator extension)",
        ],
        publishedDate: PUBLISHED,
        breadcrumbLabel: "Saturation Properties",
      }}
      introOneLiner="Bubble and dew saturation pressures at any temperature in the chart range, plus the refrigerant's reference properties from the data layer."
      generatedDate={PUBLISHED.slice(0, 10)}
      relatedTools={[
        { href: "/pt-calculator/", label: "PT Calculator", blurb: "Bidirectional temperature ↔ pressure lookup." },
        { href: "/superheat-calculator/", label: "Superheat Calculator", blurb: "Apply saturation values to suction-line measurements." },
        { href: "/subcooling-calculator/", label: "Subcooling Calculator", blurb: "Liquid-line companion to superheat." },
      ]}
      faqs={FAQS}
    >
      <SaturationPropertiesCalculator />
    </CalculatorShell>
  );
}
