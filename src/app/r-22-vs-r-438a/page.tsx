import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComparisonPage } from "@/components/comparison/ComparisonPage";
import { loadComparison } from "@/lib/mdx-comparison";
import { pageMetadata } from "@/lib/schema/shared";

const SLUG = "r-22-vs-r-438a";

export const metadata: Metadata = pageMetadata({
  title: "MO99 vs R22: Drop-In R22 Replacement Compared (Oil, Pressure)",
  description:
    "MO99 vs R22: Chemours R438A drop-in retrofit for R22 with mineral oil compatibility (no flush). Charge ~85% initial, ~95% final. Similar pressures; both A1.",
  path: "/r-22-vs-r-438a/",
});

export default function R22vsR438APage() {
  const mdx = loadComparison(SLUG);
  if (!mdx) notFound();
  return <ComparisonPage fm={mdx.frontmatter} body={mdx.body} />;
}
