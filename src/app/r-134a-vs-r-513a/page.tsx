import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComparisonPage } from "@/components/comparison/ComparisonPage";
import { loadComparison } from "@/lib/mdx-comparison";
import { SITE_URL } from "@/lib/schema/shared";

const SLUG = "r-134a-vs-r-513a";

export const metadata: Metadata = {
  title: "R-134a vs R-513A — Pressures, GWP Reduction, A1 Drop-In",
  description:
    "R-134a vs R-513A: azeotropic R-1234yf/R-134a blend designed as R-134a drop-in. 56% GWP reduction (631 vs 1430). Same A1, same POE oil, similar pressure envelope.",
  alternates: { canonical: `${SITE_URL}/${SLUG}/` },
};

export default function R134AvsR513APage() {
  const mdx = loadComparison(SLUG);
  if (!mdx) notFound();
  return <ComparisonPage fm={mdx.frontmatter} body={mdx.body} />;
}
