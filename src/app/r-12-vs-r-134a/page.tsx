import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComparisonPage } from "@/components/comparison/ComparisonPage";
import { loadComparison } from "@/lib/mdx-comparison";
import { pageMetadata } from "@/lib/schema/shared";

const SLUG = "r-12-vs-r-134a";

export const metadata: Metadata = pageMetadata({
  title: "R12 vs R134a: Key Differences Explained (Pressure, Oil, Retrofit)",
  description:
    "R12 vs R134a for retrofit and legacy service: same A1 safety class, but 87% GWP cut (10,900→1,430). Different oils; charge ~80–90% of R12 nameplate.",
  path: "/r-12-vs-r-134a/",
});

export default function R12vsR134aPage() {
  const mdx = loadComparison(SLUG);
  if (!mdx) notFound();
  return <ComparisonPage fm={mdx.frontmatter} body={mdx.body} />;
}
