import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComparisonPage } from "@/components/comparison/ComparisonPage";
import { loadComparison } from "@/lib/mdx-comparison";
import { pageMetadata } from "@/lib/schema/shared";

const SLUG = "r-290-vs-r-600a";

export const metadata: Metadata = pageMetadata({
  title: "R290 vs R600a: Propane vs Isobutane Compared (Pressure, Use)",
  description:
    "R290 vs R600a: propane runs 63.9 PSIG at 40°F evap, isobutane 11.9 PSIG — a 5.4× ratio. Both A3 (flammable); different applications, never interchangeable.",
  path: "/r-290-vs-r-600a/",
});

export default function R290vsR600aPage() {
  const mdx = loadComparison(SLUG);
  if (!mdx) notFound();
  return <ComparisonPage fm={mdx.frontmatter} body={mdx.body} />;
}
