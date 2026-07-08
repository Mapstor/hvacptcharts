import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComparisonPage } from "@/components/comparison/ComparisonPage";
import { loadComparison } from "@/lib/mdx-comparison";
import { pageMetadata } from "@/lib/schema/shared";

const SLUG = "r-454c-vs-r-455a";

export const metadata: Metadata = pageMetadata({
  title: "R454C vs R455A: Key Differences Explained (Pressure, GWP, Oil)",
  description:
    "R454C vs R455A for commercial refrigeration: both A2L, both GWP 148. R455A has 22°F glide vs R454C's 14°F, and higher pressures from 3% R744 content.",
  path: "/r-454c-vs-r-455a/",
});

export default function R454CvsR455APage() {
  const mdx = loadComparison(SLUG);
  if (!mdx) notFound();
  return <ComparisonPage fm={mdx.frontmatter} body={mdx.body} />;
}
