import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComparisonPage } from "@/components/comparison/ComparisonPage";
import { loadComparison } from "@/lib/mdx-comparison";
import { pageMetadata } from "@/lib/schema/shared";

const SLUG = "r-744-vs-r-290";

export const metadata: Metadata = pageMetadata({
  title: "R744 vs R290: Key Differences Explained (Pressure, GWP, Oil)",
  description:
    "R744 vs R290 naturals: R744 (CO2, GWP 1, non-flammable, transcritical) vs R290 (propane, GWP 3, A3 charge-limited). Different application classes — not swaps.",
  path: "/r-744-vs-r-290/",
});

export default function R744vsR290Page() {
  const mdx = loadComparison(SLUG);
  if (!mdx) notFound();
  return <ComparisonPage fm={mdx.frontmatter} body={mdx.body} />;
}
