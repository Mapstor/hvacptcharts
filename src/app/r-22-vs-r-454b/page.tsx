import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComparisonPage } from "@/components/comparison/ComparisonPage";
import { loadComparison } from "@/lib/mdx-comparison";
import { pageMetadata } from "@/lib/schema/shared";

const SLUG = "r-22-vs-r-454b";

export const metadata: Metadata = pageMetadata({
  title: "R22 vs R454B: Key Differences Explained (Pressure, GWP, Oil)",
  description:
    "R22 vs R454B: HCFC A1 (production banned 2020, reclaimed legal) vs A2L HFC/HFO blend. R454B runs ~60% higher pressure; new A2L equipment only — no retrofit.",
  path: "/r-22-vs-r-454b/",
});

export default function R22vsR454BPage() {
  const mdx = loadComparison(SLUG);
  if (!mdx) notFound();
  return <ComparisonPage fm={mdx.frontmatter} body={mdx.body} />;
}
