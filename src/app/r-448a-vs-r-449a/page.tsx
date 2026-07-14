import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComparisonPage } from "@/components/comparison/ComparisonPage";
import { loadComparison } from "@/lib/mdx-comparison";
import { pageMetadata } from "@/lib/schema/shared";

const SLUG = "r-448a-vs-r-449a";

export const metadata: Metadata = pageMetadata({
  title: "R448A vs R449A: The Two R404A Retrofits Compared",
  description:
    "R448A vs R449A: two A1 R404A retrofits — Honeywell N40 (GWP 1387) vs Chemours XP40 (GWP 1282). Same POE oil; near-identical pressures at service temps.",
  path: "/r-448a-vs-r-449a/",
});

export default function R448AvsR449APage() {
  const mdx = loadComparison(SLUG);
  if (!mdx) notFound();
  return <ComparisonPage fm={mdx.frontmatter} body={mdx.body} />;
}
