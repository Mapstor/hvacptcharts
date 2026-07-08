import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComparisonPage } from "@/components/comparison/ComparisonPage";
import { loadComparison } from "@/lib/mdx-comparison";
import { pageMetadata } from "@/lib/schema/shared";

const SLUG = "r-1234yf-vs-r-134a";

export const metadata: Metadata = pageMetadata({
  title: "R1234yf vs R134a: Key Differences Explained (Pressure, GWP, Oil)",
  description:
    "R1234yf vs R134a for mobile AC: A2L HFO replacement (GWP 4) for the legacy A1 HFC (GWP 1430). Similar pressure envelope, 99.7% GWP cut. Fleet-transition driver.",
  path: "/r-1234yf-vs-r-134a/",
});

export default function R1234yfvsR134APage() {
  const mdx = loadComparison(SLUG);
  if (!mdx) notFound();
  return <ComparisonPage fm={mdx.frontmatter} body={mdx.body} />;
}
