import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComparisonPage } from "@/components/comparison/ComparisonPage";
import { loadComparison } from "@/lib/mdx-comparison";
import { pageMetadata } from "@/lib/schema/shared";

const SLUG = "r-404a-vs-r-452a";

export const metadata: Metadata = pageMetadata({
  title: "R404A vs R452A: Transport Refrigeration Retrofit",
  description:
    "R404A vs R452A: transport refrigeration retrofit. Chemours Opteon XP44 cuts GWP 45% (3922→2140), keeps POE oil. Lower discharge temp, similar suction.",
  path: "/r-404a-vs-r-452a/",
});

export default function R404AvsR452APage() {
  const mdx = loadComparison(SLUG);
  if (!mdx) notFound();
  return <ComparisonPage fm={mdx.frontmatter} body={mdx.body} />;
}
