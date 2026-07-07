import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComparisonPage } from "@/components/comparison/ComparisonPage";
import { loadComparison } from "@/lib/mdx-comparison";
import { pageMetadata } from "@/lib/schema/shared";

const SLUG = "r-22-vs-r-454b";

export const metadata: Metadata = pageMetadata({
  title: "R-22 vs R-454B — Pressures, GWP, Safety Class, Equipment Replacement",
  description:
    "R-22 vs R-454B: HCFC pure (production banned 2020) vs HFC/HFO A2L blend (modern). 60% higher pressures, different lubricants, different safety classes. Full equipment replacement only.",
  path: `/${SLUG}/`,
});

export default function R22vsR454BPage() {
  const mdx = loadComparison(SLUG);
  if (!mdx) notFound();
  return <ComparisonPage fm={mdx.frontmatter} body={mdx.body} />;
}
