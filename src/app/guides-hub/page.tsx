import type { Metadata } from "next";
import { refrigerants } from "@/data/refrigerants";
import { HubPage } from "@/components/hub/HubPage";
import { SITE_URL } from "@/lib/schema/shared";

const PUBLISHED = refrigerants[0]?.dataSource.ptChartGeneratedAt ?? new Date().toISOString();

export const metadata: Metadata = {
  title: "HVAC Guides — Refrigerant, Charging, and System References",
  description:
    "Reference guides for HVAC professionals: PT chart reading, superheat and subcooling fundamentals, refrigerant comparisons, safety classification, and regulatory context.",
  alternates: { canonical: `${SITE_URL}/guides-hub/` },
};

export default function GuidesHubPage() {
  return (
    <HubPage
      path="guides-hub"
      title="HVAC Guides"
      introHeadline="Reference material for HVAC technicians and engineers: the conceptual anchors behind the calculator pages, plus refrigerant comparisons and regulatory context."
      introBody="Every guide is sourced — ACCA Manual T, ASHRAE Handbooks, EPA AIM Act / SNAP, IIAR for ammonia, manufacturer service literature. No 'general industry knowledge' filler; if a claim is in a guide, it carries an attribution."
      publishedDate={PUBLISHED}
      sections={[
        {
          heading: "Fundamentals",
          items: [
            { href: "/superheat-subcooling-fundamentals/", label: "Superheat & Subcooling Fundamentals", blurb: "What they are, how to measure, target ranges by metering device, the 4 classic diagnostic patterns. The conceptual anchor for the charging calculators." },
            { href: "/pt-chart-guide/", label: "How to Read a PT Chart", blurb: "Bubble vs dew columns, temperature glide, critical point truncation, partial vs full charts, common pitfalls." },
          ],
        },
        {
          heading: "Refrigerant comparisons",
          items: [
            { href: "/r-32-vs-r-410a/", label: "R-32 vs R-410A", blurb: "Side-by-side properties, PT overlay, retrofit reality, the A1 → A2L safety class change as the structural blocker." },
            { href: "/r-32-vs-r-454b/", label: "R-32 vs R-454B (pending)", blurb: "The two leading R-410A replacements, decided largely by OEM preference. Pending in Phase 5 continuation.", tag: "Pending" },
            { href: "/r-410a-vs-r-454b/", label: "R-410A vs R-454B (pending)", blurb: "Direct replacement comparison for new equipment installs. Pending.", tag: "Pending" },
          ],
        },
        {
          heading: "Reference tables",
          items: [
            { href: "/refrigerant-safety-classifications/", label: "Safety Classifications", blurb: "All 61 refrigerants by ASHRAE 34 class, with full A vs B and 1/2L/2/3 explanation." },
            { href: "/refrigerant-gwp-rankings/", label: "GWP Rankings", blurb: "Sortable IPCC AR5/AR6 values, EU F-Gas and AIM Act thresholds marked." },
          ],
        },
        {
          heading: "Operating-pressure references",
          items: [
            { href: "/what-pressure-should-r22-be/", label: "R-22 operating pressures", blurb: "Typical suction and discharge ranges by ambient, with diagnostic procedure." },
            { href: "/what-pressure-should-410a-be/", label: "R-410A operating pressures", blurb: "Operating ranges with A2L-replacement context." },
            { href: "/what-pressure-should-r32-be/", label: "R-32 operating pressures", blurb: "A2L-specific operating ranges and handling notes." },
          ],
        },
        {
          heading: "Pending (Phase 5 continuation)",
          items: [
            { href: "/high-head-pressure-causes/", label: "High Head Pressure — Causes & Diagnosis", blurb: "Diagnostic decision tree for high-side pressure problems. Coming in Phase 5 continuation.", tag: "Pending" },
            { href: "/refrigerant-comparison-guide/", label: "How to Choose a Refrigerant", blurb: "Decision guide across performance, regulation, safety, lubricant compatibility.", tag: "Pending" },
            { href: "/refrigerant-prices-guide/", label: "Refrigerant Prices Guide", blurb: "Distributor-sourced price ranges (pending Marko's source decision).", tag: "Pending" },
          ],
        },
      ]}
      crosslinks={[
        { href: "/pt-charts-tools-hub/", label: "PT charts & tools" },
        { href: "/calculators-hub/", label: "Calculators" },
      ]}
    />
  );
}
