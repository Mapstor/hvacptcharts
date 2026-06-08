import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComparisonPage } from "@/components/comparison/ComparisonPage";
import { loadComparison } from "@/lib/mdx-comparison";
import { SITE_URL } from "@/lib/schema/shared";

const SLUG = "r-22-vs-r-410a";

export const metadata: Metadata = {
  title: "R-22 vs R-410A — Pressures, Lubricant, Retrofit Reality, Cost",
  description:
    "Direct comparison of R-22 and R-410A for residential AC: PT curves, lubricant compatibility, why retrofit isn't a drop-in, and how to decide between continued R-22 service and full system replacement.",
  alternates: { canonical: `${SITE_URL}/${SLUG}/` },
};

export default function R22vsR410APage() {
  const mdx = loadComparison(SLUG);
  if (!mdx) notFound();
  return <ComparisonPage fm={mdx.frontmatter} body={mdx.body} />;
}
