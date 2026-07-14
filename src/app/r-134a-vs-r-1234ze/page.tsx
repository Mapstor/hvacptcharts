import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComparisonPage } from "@/components/comparison/ComparisonPage";
import { loadComparison } from "@/lib/mdx-comparison";
import { pageMetadata } from "@/lib/schema/shared";

const SLUG = "r-134a-vs-r-1234ze";

export const metadata: Metadata = pageMetadata({
  title: "R134a vs R1234ze(E): Chiller Alternative Compared",
  description:
    "R134a vs R1234ze(E) for chillers: R1234ze runs 22.2 PSIG at 40°F evap vs R134a's 35.0 — 37% lower pressure requires larger displacement to match capacity.",
  path: "/r-134a-vs-r-1234ze/",
});

export default function R134AvsR1234zePage() {
  const mdx = loadComparison(SLUG);
  if (!mdx) notFound();
  return <ComparisonPage fm={mdx.frontmatter} body={mdx.body} />;
}
