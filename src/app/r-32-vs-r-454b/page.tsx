import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComparisonPage } from "@/components/comparison/ComparisonPage";
import { loadComparison } from "@/lib/mdx-comparison";
import { pageMetadata } from "@/lib/schema/shared";

const SLUG = "r-32-vs-r-454b";

export const metadata: Metadata = pageMetadata({
  title: "R32 vs R454B: Key Differences Explained (Pressure, GWP, Oil)",
  description:
    "R32 vs R454B for new A2L residential AC: R32 pure (Daikin/Mitsubishi) vs R454B blend (Carrier/Trane), GWP 675 vs 466, similar pressures. OEM-choice decision.",
  path: "/r-32-vs-r-454b/",
});

export default function R32vsR454BPage() {
  const mdx = loadComparison(SLUG);
  if (!mdx) notFound();
  return <ComparisonPage fm={mdx.frontmatter} body={mdx.body} />;
}
