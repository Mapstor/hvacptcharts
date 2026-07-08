import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComparisonPage } from "@/components/comparison/ComparisonPage";
import { loadComparison } from "@/lib/mdx-comparison";
import { pageMetadata } from "@/lib/schema/shared";

const SLUG = "r-404a-vs-r-449a";

export const metadata: Metadata = pageMetadata({
  title: "R404A vs R449A: Key Differences Explained (Pressure, GWP, Oil)",
  description:
    "R404A vs R449A for commercial refrigeration: R449A is the HFO/HFC quaternary retrofit. Same POE oil, 9.5°F glide, GWP cut 67% (3922→1282). Standard retrofit.",
  path: "/r-404a-vs-r-449a/",
});

export default function R404AvsR449APage() {
  const mdx = loadComparison(SLUG);
  if (!mdx) notFound();
  return <ComparisonPage fm={mdx.frontmatter} body={mdx.body} />;
}
