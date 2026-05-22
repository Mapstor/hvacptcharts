import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComparisonPage } from "@/components/comparison/ComparisonPage";
import { loadComparison } from "@/lib/mdx-comparison";
import { SITE_URL } from "@/lib/schema/shared";

const SLUG = "r-32-vs-r-454b";

export const metadata: Metadata = {
  title: "R-32 vs R-454B — A2L Residential AC, OEM Choice",
  description:
    "Direct comparison of R-32 and R-454B, the two leading A2L replacements for R-410A in residential AC. PT curves overlaid, side-by-side properties, retrofit guidance, FAQ.",
  alternates: { canonical: `${SITE_URL}/${SLUG}/` },
};

export default function R32vsR454BPage() {
  const mdx = loadComparison(SLUG);
  if (!mdx) notFound();
  return <ComparisonPage fm={mdx.frontmatter} body={mdx.body} />;
}
