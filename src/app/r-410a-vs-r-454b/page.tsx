import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComparisonPage } from "@/components/comparison/ComparisonPage";
import { loadComparison } from "@/lib/mdx-comparison";
import { SITE_URL } from "@/lib/schema/shared";

const SLUG = "r-410a-vs-r-454b";

export const metadata: Metadata = {
  title: "R-410A vs R-454B — Residential AC Phase-Down Decision",
  description:
    "Direct comparison of R-410A (legacy) and R-454B (replacement) for residential AC. PT curves overlaid, side-by-side properties, A1-to-A2L safety class change, retrofit reality.",
  alternates: { canonical: `${SITE_URL}/${SLUG}/` },
};

export default function R410AvsR454BPage() {
  const mdx = loadComparison(SLUG);
  if (!mdx) notFound();
  return <ComparisonPage fm={mdx.frontmatter} body={mdx.body} />;
}
