import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComparisonPage } from "@/components/comparison/ComparisonPage";
import { loadComparison } from "@/lib/mdx-comparison";
import { pageMetadata } from "@/lib/schema/shared";

const SLUG = "r-22-vs-r-407c";

export const metadata: Metadata = pageMetadata({
  title: "R22 vs R407C: Key Differences Explained (Pressure, GWP, Oil)",
  description:
    "R22 vs R407C: R407C is the classic R22 retrofit HFC blend, ~11°F glide, pressures within 5% of R22. Standard retrofit — but POE oil required (MO incompatible).",
  path: "/r-22-vs-r-407c/",
});

export default function R22vsR407CPage() {
  const mdx = loadComparison(SLUG);
  if (!mdx) notFound();
  return <ComparisonPage fm={mdx.frontmatter} body={mdx.body} />;
}
