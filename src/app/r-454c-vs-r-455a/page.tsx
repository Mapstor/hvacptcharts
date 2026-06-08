import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComparisonPage } from "@/components/comparison/ComparisonPage";
import { loadComparison } from "@/lib/mdx-comparison";
import { SITE_URL } from "@/lib/schema/shared";

const SLUG = "r-454c-vs-r-455a";

export const metadata: Metadata = {
  title: "R-454C vs R-455A — Same GWP, Different Glide, Different Pressure",
  description:
    "R-454C vs R-455A: both A2L commercial refrigeration blends with GWP 148. R-455A has more glide (22°F vs 14°F) and higher pressures due to 3% R-744 content.",
  alternates: { canonical: `${SITE_URL}/${SLUG}/` },
};

export default function R454CvsR455APage() {
  const mdx = loadComparison(SLUG);
  if (!mdx) notFound();
  return <ComparisonPage fm={mdx.frontmatter} body={mdx.body} />;
}
