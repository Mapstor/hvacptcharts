import type { Metadata } from "next";
import { refrigerants } from "@/data/refrigerants";
import { HubPage } from "@/components/hub/HubPage";
import { SITE_URL } from "@/lib/schema/shared";

const PUBLISHED = refrigerants[0]?.dataSource.ptChartGeneratedAt ?? new Date().toISOString();

export const metadata: Metadata = {
  title: "HVAC Calculators — Superheat, Subcooling, PT, Comparison",
  description:
    "Free HVAC calculators built on verified CoolProp saturation data: superheat, subcooling, PT lookup, saturation properties, comparison tool. Imperial and metric units.",
  alternates: { canonical: `${SITE_URL}/calculators-hub/` },
};

export default function CalculatorsHubPage() {
  return (
    <HubPage
      path="calculators-hub"
      title="HVAC Calculators"
      introHeadline="Free calculators for HVAC field work. Built on the verified refrigerant dataset — same source as the PT charts."
      introBody="Each calculator reads from the same Zod-validated saturation data that drives the chart pages. Bubble vs dew curves are handled correctly for zeotropic blends. All targets and ranges cite ACCA, ASHRAE, or equipment manufacturer literature."
      publishedDate={PUBLISHED}
      sections={[
        {
          heading: "Charging and diagnostic",
          items: [
            { href: "/superheat-calculator/", label: "Superheat Calculator", blurb: "Suction-line PSIG + temperature → superheat with diagnostic interpretation. Top-traffic page on the site.", tag: "Top traffic" },
            { href: "/subcooling-calculator/", label: "Subcooling Calculator", blurb: "Liquid-line PSIG + temperature → subcooling. Primary charging metric for TXV systems." },
            { href: "/pt-superheat-subcooling-calculator/", label: "Combined PT / Superheat / Subcooling", blurb: "Both sides on one form, with combined-pattern interpretation (undercharge, overcharge, airflow, metering)." },
          ],
        },
        {
          heading: "Lookup and reference",
          items: [
            { href: "/pt-calculator/", label: "PT Calculator", blurb: "Bidirectional saturation pressure ↔ temperature lookup for 50+ refrigerants, bubble + dew for blends." },
            { href: "/saturation-properties-calculator/", label: "Saturation Properties Calculator", blurb: "Bubble, dew, glide at any temperature plus reference properties (critical point, boiling point, molar mass)." },
            { href: "/refrigerant-pt-comparison-tool/", label: "Refrigerant PT Comparison Tool", blurb: "Overlay 2-4 refrigerants on one PT chart. Useful for retrofit assessment." },
          ],
        },
        {
          heading: "Planned",
          items: [
            { href: "/refrigerant-charge-calculator/", label: "Refrigerant Charge Calculator", blurb: "System tonnage + line-set dimensions → estimated charge. Coming in Phase 4 continuation.", tag: "Pending" },
            { href: "/refrigerant-retrofit-compatibility-calculator/", label: "Retrofit Compatibility", blurb: "Pair-comparison decision matrix: lubricant, safety class, pressure rating.", tag: "Pending" },
            { href: "/system-pressure-diagnostic-calculator/", label: "System Pressure Diagnostic", blurb: "Multi-input expert system flagging overcharge, undercharge, dirty condenser, restrictions.", tag: "Pending" },
          ],
        },
      ]}
      crosslinks={[
        { href: "/pt-charts-tools-hub/", label: "PT charts & tools" },
        { href: "/guides-hub/", label: "Guides" },
      ]}
    />
  );
}
