import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComparisonPage } from "@/components/comparison/ComparisonPage";
import { loadComparison } from "@/lib/mdx-comparison";
import { SITE_URL } from "@/lib/schema/shared";

const SLUG = "r-1234yf-vs-r-134a";

export const metadata: Metadata = {
  title: "R-1234yf vs R-134a — Mobile AC, Pressures, GWP 4 vs 1430",
  description:
    "R-1234yf vs R-134a: HFO replacement for R-134a in mobile AC and some chillers. A2L vs A1, GWP 4 vs 1430 (99.7% reduction), similar pressure envelope.",
  alternates: { canonical: `${SITE_URL}/${SLUG}/` },
};

export default function R1234yfvsR134APage() {
  const mdx = loadComparison(SLUG);
  if (!mdx) notFound();
  return <ComparisonPage fm={mdx.frontmatter} body={mdx.body} />;
}
