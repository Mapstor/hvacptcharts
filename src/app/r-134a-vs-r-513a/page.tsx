import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComparisonPage } from "@/components/comparison/ComparisonPage";
import { loadComparison } from "@/lib/mdx-comparison";
import { pageMetadata } from "@/lib/schema/shared";

const SLUG = "r-134a-vs-r-513a";

export const metadata: Metadata = pageMetadata({
  title: "R134a vs R513A: Key Differences Explained (Pressure, GWP, Oil)",
  description:
    "R134a vs R513A: R513A is the azeotropic R1234yf/R134a blend designed as R134a drop-in. Same A1, same POE oil, similar pressures. GWP cut 56% (1430→631).",
  path: "/r-134a-vs-r-513a/",
});

export default function R134AvsR513APage() {
  const mdx = loadComparison(SLUG);
  if (!mdx) notFound();
  return <ComparisonPage fm={mdx.frontmatter} body={mdx.body} />;
}
