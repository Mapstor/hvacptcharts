import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComparisonPage } from "@/components/comparison/ComparisonPage";
import { loadComparison } from "@/lib/mdx-comparison";
import { pageMetadata } from "@/lib/schema/shared";

const SLUG = "r-454b-vs-r-454c";

export const metadata: Metadata = pageMetadata({
  title: "R454B vs R454C: The Two A2L Blends Compared (GWP, Glide)",
  description:
    "R454B vs R454C: same R32/R1234yf components, different ratios. R454B GWP 466 (residential AC); R454C GWP 148 with 13.9°F glide (LT commercial).",
  path: "/r-454b-vs-r-454c/",
});

export default function R454BvsR454CPage() {
  const mdx = loadComparison(SLUG);
  if (!mdx) notFound();
  return <ComparisonPage fm={mdx.frontmatter} body={mdx.body} />;
}
