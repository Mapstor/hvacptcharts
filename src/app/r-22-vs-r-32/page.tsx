import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComparisonPage } from "@/components/comparison/ComparisonPage";
import { loadComparison } from "@/lib/mdx-comparison";
import { pageMetadata } from "@/lib/schema/shared";

const SLUG = "r-22-vs-r-32";

export const metadata: Metadata = pageMetadata({
  title: "R22 vs R32: Key Differences Explained (Pressure, GWP, Oil)",
  description:
    "R22 vs R32: HCFC A1 with MO (production banned 2020) vs modern HFC A2L with POE. R32 runs ~70% higher pressure — full A2L equipment replacement, no field retrofit.",
  path: "/r-22-vs-r-32/",
});

export default function R22vsR32Page() {
  const mdx = loadComparison(SLUG);
  if (!mdx) notFound();
  return <ComparisonPage fm={mdx.frontmatter} body={mdx.body} />;
}
