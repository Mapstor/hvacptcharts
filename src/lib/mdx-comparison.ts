import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import { FAQ } from "./mdx";

export const ComparisonFrontmatter = z.object({
  slug: z.string(),
  refrigerantA: z.string(),
  refrigerantB: z.string(),
  title: z.string(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  /**
   * Original publication date (ISO 8601, YYYY-MM-DD accepted). Backfilled
   * from the file's git first-commit date. TechArticle datePublished.
   */
  datePublished: z.string(),
  introOneLiner: z.string(),
  chooseA: z.string(),
  chooseB: z.string(),
  whenNeither: z.string().optional(),
  retrofitNotes: z.string(),
  /**
   * Whether A → B is a plausible field retrofit. When absent, the template
   * derives a default from safety class + lubricant compatibility (see
   * deriveRetrofitFeasibility in ComparisonPage.tsx). Set explicitly in
   * frontmatter to override the derivation for edge cases.
   *
   * When false, the page renders a "Why direct retrofit isn't possible"
   * section explaining the specific barriers, instead of the "Standard
   * transition procedure" recipe — which would otherwise walk a
   * technician through steps 1–8 for a swap that step 7 then reveals is
   * impossible. (Task 2, 2026-07: user flagged r-410a-vs-r-454b as the
   * canonical example of the inconsistency.)
   */
  retrofitFeasible: z.boolean().optional(),
  faqs: z.array(FAQ).optional().default([]),
});
export type ComparisonFrontmatter = z.infer<typeof ComparisonFrontmatter>;

export interface LoadedComparison {
  frontmatter: ComparisonFrontmatter;
  body: string;
}

const CONTENT_DIR = path.resolve(process.cwd(), "content", "comparisons");

export function loadComparison(slug: string): LoadedComparison | null {
  const filepath = path.join(CONTENT_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filepath)) return null;
  const raw = fs.readFileSync(filepath, "utf8");
  const { content, data } = matter(raw);
  const fm = ComparisonFrontmatter.parse(data);
  if (fm.slug !== slug) {
    throw new Error(`comparison MDX slug mismatch in ${filepath}: "${fm.slug}" vs filename "${slug}".`);
  }
  return { frontmatter: fm, body: content.trim() };
}

export interface ComparisonSummary {
  slug: string;
  refrigerantA: string;
  refrigerantB: string;
  title: string;
}

/**
 * List all comparison pages by reading every .mdx file in content/comparisons/.
 * Used to programmatically surface related pair comparisons on per-refrigerant
 * pages.
 */
export function listComparisons(): ComparisonSummary[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  const out: ComparisonSummary[] = [];
  for (const file of fs.readdirSync(CONTENT_DIR)) {
    if (!file.endsWith(".mdx")) continue;
    const slug = file.replace(/\.mdx$/, "");
    const c = loadComparison(slug);
    if (!c) continue;
    out.push({
      slug,
      refrigerantA: c.frontmatter.refrigerantA,
      refrigerantB: c.frontmatter.refrigerantB,
      title: c.frontmatter.title,
    });
  }
  return out;
}

/** Find comparison summaries that involve the given refrigerant slug. */
export function findComparisonsForRefrigerant(slug: string): ComparisonSummary[] {
  return listComparisons().filter(
    (c) => c.refrigerantA === slug || c.refrigerantB === slug,
  );
}
