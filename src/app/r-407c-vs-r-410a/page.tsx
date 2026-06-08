import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComparisonPage } from "@/components/comparison/ComparisonPage";
import { loadComparison } from "@/lib/mdx-comparison";
import { SITE_URL } from "@/lib/schema/shared";

const SLUG = "r-407c-vs-r-410a";

export const metadata: Metadata = {
  title: "R-407C vs R-410A — R-22 Retrofit vs New Equipment Standard",
  description:
    "R-407C vs R-410A: R-407C is the R-22 retrofit HFC blend (~11°F glide); R-410A is the HFC blend designed for new equipment with ~60% higher pressures. Different equipment classes.",
  alternates: { canonical: `${SITE_URL}/${SLUG}/` },
};

export default function R407CvsR410APage() {
  const mdx = loadComparison(SLUG);
  if (!mdx) notFound();
  return <ComparisonPage fm={mdx.frontmatter} body={mdx.body} />;
}
