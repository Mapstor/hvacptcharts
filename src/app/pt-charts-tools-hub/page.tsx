import type { Metadata } from "next";
import { refrigerants } from "@/data/refrigerants";
import { HubPage } from "@/components/hub/HubPage";
import { SITE_URL } from "@/lib/schema/shared";

const PUBLISHED = refrigerants[0]?.dataSource.ptChartGeneratedAt ?? new Date().toISOString();

const POPULAR_SLUGS = ["r-410a", "r-22", "r-134a", "r-32", "r-404a", "r-454b", "r-407c", "r-1234yf"];

export const metadata: Metadata = {
  title: "PT Charts & Reference Tools — All 61 Refrigerants",
  description:
    "Saturation pressure-temperature charts for 61 HVAC refrigerants, plus comparison tools, operating-pressure references, and the sortable safety / GWP reference tables.",
  alternates: { canonical: `${SITE_URL}/pt-charts-tools-hub/` },
};

export default function PTChartsToolsHubPage() {
  const popularItems = POPULAR_SLUGS.map((slug) => {
    const r = refrigerants.find((x) => x.slug === slug);
    if (!r) return null;
    return {
      href: `/refrigerant/${r.slug}/`,
      label: r.displayName,
      blurb: `${r.type.replace("-", " ").toUpperCase()} · ASHRAE ${r.safetyClass} · GWP ${r.environmental.gwp100Ar5 ?? "—"}`,
    };
  }).filter(Boolean) as Array<{ href: string; label: string; blurb: string }>;

  return (
    <HubPage
      path="pt-charts-tools-hub"
      title="PT Charts & Reference Tools"
      introHeadline={`Verified pressure-temperature data for ${refrigerants.length} refrigerants, plus the sortable reference tables and comparison tools.`}
      introBody="All saturation data generated from CoolProp 7.2.0 (REFPROP-compatible Helmholtz EOS) or transcribed from named manufacturer datasheets. The full chart for each refrigerant is downloadable as CSV or JSON under CC BY 4.0."
      publishedDate={PUBLISHED}
      sections={[
        {
          heading: "Sortable reference tables",
          items: [
            { href: "/refrigerant-safety-classifications/", label: "Safety Classifications", blurb: "Every refrigerant's ASHRAE 34 class (A1 / A2L / A3 / B1 / B2L). Filter by type, search by name." },
            { href: "/refrigerant-gwp-rankings/", label: "GWP Rankings", blurb: "Sortable by IPCC AR5, AR6, ODP. Highlights EU F-Gas 150 and EPA AIM Act 700 thresholds." },
          ],
        },
        {
          heading: "Most-used refrigerant pages",
          items: popularItems,
        },
        {
          heading: "Comparison and operating-pressure tools",
          items: [
            { href: "/refrigerant-pt-comparison-tool/", label: "PT Comparison Tool", blurb: "Overlay 2-4 refrigerants on one chart. Useful for retrofit feasibility scans." },
            { href: "/r-32-vs-r-410a/", label: "R-32 vs R-410A", blurb: "Side-by-side written comparison, the residential AC phase-down decision." },
            { href: "/what-pressure-should-r22-be/", label: "R-22 operating pressures", blurb: "Operating pressure ranges by ambient + diagnostic HowTo guide." },
            { href: "/what-pressure-should-410a-be/", label: "R-410A operating pressures", blurb: "Operating pressure ranges + A1-vs-A2L handling distinction." },
            { href: "/what-pressure-should-r32-be/", label: "R-32 operating pressures", blurb: "A2L-specific operating ranges with handling notes." },
          ],
        },
        {
          heading: "Full A–Z",
          items: [
            { href: "/#find", label: `Browse all ${refrigerants.length} refrigerants`, blurb: "Searchable, filterable A–Z list on the homepage. Filter by type, safety class, or GWP bucket." },
          ],
        },
      ]}
      crosslinks={[
        { href: "/calculators-hub/", label: "Calculators" },
        { href: "/guides-hub/", label: "Guides" },
      ]}
    />
  );
}
