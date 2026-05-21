import type { Metadata } from "next";
import { refrigerants } from "@/data/refrigerants";
import { CalculatorShell } from "@/components/calculators/shared/CalculatorShell";
import { RefrigerantPtComparison } from "@/components/calculators/RefrigerantPtComparison";
import { SITE_URL } from "@/lib/schema/shared";

const PUBLISHED = refrigerants[0]?.dataSource.ptChartGeneratedAt ?? new Date().toISOString();

const FAQS = [
  {
    q: "What does this tool show?",
    a: "Pick 2-4 refrigerants and the tool overlays their saturation pressure-temperature curves on one set of axes. The result makes it easy to see how a candidate replacement refrigerant compares to the incumbent across the full operating range: R-454B vs R-410A across the residential AC range, for instance, or R-32 vs R-22 to understand pressure ratings.",
  },
  {
    q: "Why are some curves dashed?",
    a: "Solid lines are the bubble (saturated liquid) curve. Dashed lines are the dew (saturated vapor) curve. For pure refrigerants and azeotropes the two coincide so only the solid line is drawn. For zeotropic blends — R-407C, R-454C, R-455A, R-448A, R-449A — both are shown and the gap between them is the temperature glide at each pressure.",
  },
  {
    q: "Why does my comparison look squished?",
    a: "If you include refrigerants with very different operating envelopes — R-744 (CO2, 800+ PSIG at 70°F) with R-1234ze (~50 PSIG at 70°F) — the linear y-axis compresses the lower-pressure curves to near-zero. The visualization still shows the right relationship but the lower curve is hard to read. A log-scale toggle is a future improvement.",
  },
  {
    q: "How do I compare two refrigerants for retrofit feasibility?",
    a: "Retrofit feasibility depends on more than the PT curve: lubricant compatibility, component pressure rating, safety class change, capacity match, and glide all matter. The PT overlay shows whether system pressures will be comparable (look at the curves at typical operating temperatures: 40°F and 110°F for residential AC). For a structured comparison, see the per-refrigerant pages — each links to its replacement options with retrofit notes.",
  },
];

export const metadata: Metadata = {
  title: "Refrigerant PT Comparison Tool — Overlay PT Charts",
  description:
    "Overlay saturation pressure-temperature curves for 2-4 HVAC refrigerants on one chart. Side-by-side visualization of operating envelopes, glide, and retrofit pressure compatibility.",
  alternates: { canonical: `${SITE_URL}/refrigerant-pt-comparison-tool/` },
};

export default function ComparisonToolPage() {
  return (
    <CalculatorShell
      schema={{
        path: "refrigerant-pt-comparison-tool",
        name: "Refrigerant PT Comparison Tool",
        description:
          "Overlay saturation pressure-temperature curves for 2-4 refrigerants on one chart. Useful for retrofit assessment, equipment sizing, and quick visual comparison of operating envelopes.",
        featureList: [
          "Overlay 2-4 refrigerants on one PT axis",
          "Bubble + dew rendering for zeotropic blends",
          "Imperial / metric unit toggles",
          "Color-coded series with legend",
        ],
        publishedDate: PUBLISHED,
        breadcrumbLabel: "PT Comparison Tool",
      }}
      introOneLiner="Pick 2-4 refrigerants from the dataset; the tool overlays their saturation curves on one chart. Glide visible for zeotropic blends."
      generatedDate={PUBLISHED.slice(0, 10)}
      howTo={{
        steps: [
          "The tool starts with R-22, R-410A, R-32, and R-454B — the residential AC phase-down trajectory.",
          "Swap any refrigerant from the dropdowns. Add up to 4 series, or remove down to 2.",
          "Toggle units between °F/°C and PSIG/kPa.",
          "Read the curves at your operating points (typically 40°F for evaporator, 110°F for condenser).",
        ],
      }}
      relatedTools={[
        { href: "/refrigerant/r-410a/", label: "R-410A detail page", blurb: "Full reference + GWP comparison + retrofit guidance." },
        { href: "/refrigerant/r-454b/", label: "R-454B detail page", blurb: "The leading R-410A replacement." },
        { href: "/refrigerant-retrofit-compatibility-calculator/", label: "Retrofit compatibility (planned)", blurb: "Structured pair-comparison: lubricants, safety class, pressure ratings. Coming soon." },
      ]}
      faqs={FAQS}
    >
      <RefrigerantPtComparison />
    </CalculatorShell>
  );
}
