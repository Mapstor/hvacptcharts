import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComparisonPage } from "@/components/comparison/ComparisonPage";
import { loadComparison } from "@/lib/mdx-comparison";
import { SITE_URL } from "@/lib/schema/shared";

const SLUG = "r-744-vs-r-290";

export const metadata: Metadata = {
  title: "R-744 vs R-290 — CO₂ Transcritical vs Propane A3 Charge-Limited",
  description:
    "R-744 vs R-290: CO₂ (very high pressure, non-flammable, transcritical) vs propane (charge-limited A3 highly flammable). Both GWP < 5. Different application classes.",
  alternates: { canonical: `${SITE_URL}/${SLUG}/` },
};

export default function R744vsR290Page() {
  const mdx = loadComparison(SLUG);
  if (!mdx) notFound();
  return <ComparisonPage fm={mdx.frontmatter} body={mdx.body} />;
}
