import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComparisonPage } from "@/components/comparison/ComparisonPage";
import { loadComparison } from "@/lib/mdx-comparison";
import { SITE_URL } from "@/lib/schema/shared";

const SLUG = "r-32-vs-r-410a";

export const metadata: Metadata = {
  title: "R-32 vs R-410A — Pressures, GWP, Safety, Retrofit Reality",
  description:
    "Direct comparison of R-32 and R-410A for residential AC: PT curves overlaid, side-by-side properties, retrofit guidance, FAQ. Built on verified CoolProp data.",
  alternates: { canonical: `${SITE_URL}/${SLUG}/` },
};

export default function R32vsR410APage() {
  const mdx = loadComparison(SLUG);
  if (!mdx) notFound();
  return <ComparisonPage fm={mdx.frontmatter} body={mdx.body} />;
}
