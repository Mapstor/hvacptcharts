import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComparisonPage } from "@/components/comparison/ComparisonPage";
import { loadComparison } from "@/lib/mdx-comparison";
import { pageMetadata } from "@/lib/schema/shared";

const SLUG = "r-410a-vs-r-454b";

export const metadata: Metadata = pageMetadata({
  title: "R410A vs R454B: Key Differences Explained (Pressure, GWP, Oil)",
  description:
    "R410A vs R454B for residential AC: pressures within 5%, POE oil unchanged, GWP cut 78% (2088→466). A1→A2L means new A2L equipment — no field retrofit path.",
  path: "/r-410a-vs-r-454b/",
});

export default function R410AvsR454BPage() {
  const mdx = loadComparison(SLUG);
  if (!mdx) notFound();
  return <ComparisonPage fm={mdx.frontmatter} body={mdx.body} />;
}
