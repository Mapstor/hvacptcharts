import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComparisonPage } from "@/components/comparison/ComparisonPage";
import { loadComparison } from "@/lib/mdx-comparison";
import { pageMetadata } from "@/lib/schema/shared";

const SLUG = "r-404a-vs-r-448a";

export const metadata: Metadata = pageMetadata({
  title: "R404A vs R448A: Solstice N40 Retrofit Compared",
  description:
    "R404A vs R448A: Solstice N40 retrofit cuts GWP 65% (3922→1387), keeps A1+POE, similar pressures at service temps. Zeotropic ~11°F glide vs R404A near-azeotropic.",
  path: "/r-404a-vs-r-448a/",
});

export default function R404AvsR448APage() {
  const mdx = loadComparison(SLUG);
  if (!mdx) notFound();
  return <ComparisonPage fm={mdx.frontmatter} body={mdx.body} />;
}
