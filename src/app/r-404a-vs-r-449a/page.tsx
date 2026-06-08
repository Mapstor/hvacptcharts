import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComparisonPage } from "@/components/comparison/ComparisonPage";
import { loadComparison } from "@/lib/mdx-comparison";
import { SITE_URL } from "@/lib/schema/shared";

const SLUG = "r-404a-vs-r-449a";

export const metadata: Metadata = {
  title: "R-404A vs R-449A — Pressures, Glide, Retrofit, GWP Reduction",
  description:
    "R-404A vs R-449A for commercial refrigeration: quaternary HFC blend retrofit for R-404A with 65% GWP reduction (1397 vs 3922). Same POE oil; ~10°F glide.",
  alternates: { canonical: `${SITE_URL}/${SLUG}/` },
};

export default function R404AvsR449APage() {
  const mdx = loadComparison(SLUG);
  if (!mdx) notFound();
  return <ComparisonPage fm={mdx.frontmatter} body={mdx.body} />;
}
