import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComparisonPage } from "@/components/comparison/ComparisonPage";
import { loadComparison } from "@/lib/mdx-comparison";
import { pageMetadata } from "@/lib/schema/shared";

const SLUG = "r-407c-vs-r-410a";

export const metadata: Metadata = pageMetadata({
  title: "R407C vs R410A: Key Differences Explained (Pressure, GWP, Oil)",
  description:
    "R407C vs R410A: R407C is the R22 retrofit HFC blend (~11°F glide); R410A is new-equipment HFC. At 130°F: R410A 478 vs R407C 341 PSIG. Different equipment classes.",
  path: "/r-407c-vs-r-410a/",
});

export default function R407CvsR410APage() {
  const mdx = loadComparison(SLUG);
  if (!mdx) notFound();
  return <ComparisonPage fm={mdx.frontmatter} body={mdx.body} />;
}
