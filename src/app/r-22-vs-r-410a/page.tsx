import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComparisonPage } from "@/components/comparison/ComparisonPage";
import { loadComparison } from "@/lib/mdx-comparison";
import { pageMetadata } from "@/lib/schema/shared";

const SLUG = "r-22-vs-r-410a";

export const metadata: Metadata = pageMetadata({
  title: "R22 vs R410A: Key Differences Explained (Pressure, GWP, Oil)",
  description:
    "R22 vs R410A for residential AC: R410A pressures ~65% higher, MO→POE oil change required, R22 production banned 2020 (reclaimed legal for service). Replacement only.",
  path: "/r-22-vs-r-410a/",
});

export default function R22vsR410APage() {
  const mdx = loadComparison(SLUG);
  if (!mdx) notFound();
  return <ComparisonPage fm={mdx.frontmatter} body={mdx.body} />;
}
