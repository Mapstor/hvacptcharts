import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComparisonPage } from "@/components/comparison/ComparisonPage";
import { loadComparison } from "@/lib/mdx-comparison";
import { SITE_URL } from "@/lib/schema/shared";

const SLUG = "r-22-vs-r-32";

export const metadata: Metadata = {
  title: "R-22 vs R-32 — Lubricant, Safety Class, Pressure, Capacity",
  description:
    "R-22 vs R-32: HCFC pure (banned 2020) vs HFC pure (modern A2L). Different lubricants, different safety classes, R-32 ~70% higher pressure. Full replacement only — no retrofit path.",
  alternates: { canonical: `${SITE_URL}/${SLUG}/` },
};

export default function R22vsR32Page() {
  const mdx = loadComparison(SLUG);
  if (!mdx) notFound();
  return <ComparisonPage fm={mdx.frontmatter} body={mdx.body} />;
}
