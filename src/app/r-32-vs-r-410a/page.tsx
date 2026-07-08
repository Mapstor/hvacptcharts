import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComparisonPage } from "@/components/comparison/ComparisonPage";
import { loadComparison } from "@/lib/mdx-comparison";
import { pageMetadata } from "@/lib/schema/shared";

const SLUG = "r-32-vs-r-410a";

export const metadata: Metadata = pageMetadata({
  title: "R32 vs R410A: Key Differences Explained (Pressure, GWP, Oil)",
  description:
    "R32 vs R410A for residential AC: R32 runs 5–8% higher pressure with 68% GWP cut (2088→675). Both use POE oil; A1→A2L switch needs new A2L-certified equipment.",
  path: "/r-32-vs-r-410a/",
});

export default function R32vsR410APage() {
  const mdx = loadComparison(SLUG);
  if (!mdx) notFound();
  return <ComparisonPage fm={mdx.frontmatter} body={mdx.body} />;
}
