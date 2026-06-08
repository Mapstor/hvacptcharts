import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComparisonPage } from "@/components/comparison/ComparisonPage";
import { loadComparison } from "@/lib/mdx-comparison";
import { SITE_URL } from "@/lib/schema/shared";

const SLUG = "r-22-vs-r-407c";

export const metadata: Metadata = {
  title: "R-22 vs R-407C — Pressures, Glide, Retrofit Procedure, Capacity",
  description:
    "R-22 vs R-407C: ternary HFC blend designed as R-22 retrofit. POE oil required (mineral oil incompatible). ~11°F temperature glide. Capacity within 5% of R-22 at typical conditions.",
  alternates: { canonical: `${SITE_URL}/${SLUG}/` },
};

export default function R22vsR407CPage() {
  const mdx = loadComparison(SLUG);
  if (!mdx) notFound();
  return <ComparisonPage fm={mdx.frontmatter} body={mdx.body} />;
}
