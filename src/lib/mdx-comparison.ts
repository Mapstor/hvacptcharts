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
  introOneLiner: z.string(),
  chooseA: z.string(),
  chooseB: z.string(),
  whenNeither: z.string().optional(),
  retrofitNotes: z.string(),
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
