import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

/**
 * MDX frontmatter schema for per-refrigerant content files in
 * `content/refrigerants/{slug}.mdx`. Per spec 04-CONTENT_BRIEF.md.
 *
 * The slug field is REQUIRED and must match the filename — this guards against
 * the template-swap failure mode where copy intended for one refrigerant ends
 * up on another.
 */
export const FAQ = z.object({
  q: z.string(),
  a: z.string(),
});
export type FAQ = z.infer<typeof FAQ>;

export const Narrative = z.object({
  whatItIs: z.string().nullable().optional(),
  whereItsUsed: z.array(z.string()).optional().default([]),
  phaseDownStatus: z.string().nullable().optional(),
  serviceNotes: z.string().nullable().optional(),
});
export type Narrative = z.infer<typeof Narrative>;

export const RetrofitGuidance = z.object({
  fromRefrigerant: z.string(),
  notes: z.string(),
});

export const SourceRef = z.object({
  id: z.string(),
  label: z.string(),
  url: z.string().url().optional(),
  date: z.string().optional(),
  note: z.string().optional(),
});
export type SourceRef = z.infer<typeof SourceRef>;

export const KeyStat = z.object({
  label: z.string(),
  value: z.string(),
  unit: z.string().optional(),
  context: z.string(),
  sourceId: z.string().optional(),
});
export type KeyStat = z.infer<typeof KeyStat>;

export const RefrigerantFrontmatter = z.object({
  slug: z.string(),
  title: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  introOneLiner: z.string().optional(),
  narrative: Narrative.optional().default({ whereItsUsed: [] }),
  faqs: z.array(FAQ).optional().default([]),
  retrofitGuidance: RetrofitGuidance.optional(),
  sources: z.array(SourceRef).optional().default([]),
  keyStats: z.array(KeyStat).optional().default([]),
});
export type RefrigerantFrontmatter = z.infer<typeof RefrigerantFrontmatter>;

export interface LoadedRefrigerantMdx {
  frontmatter: RefrigerantFrontmatter;
  /** Raw MDX body, to be compiled by next-mdx-remote/rsc <MDXRemote source={body} />. */
  body: string;
}

const CONTENT_DIR = path.resolve(process.cwd(), "content", "refrigerants");

/**
 * Load per-refrigerant MDX from disk. Returns null when no MDX file exists for
 * the slug — the page should render the data-only sections in that case
 * (per Rule 2: no template-swap fallback prose).
 */
export function loadRefrigerantMdx(slug: string): LoadedRefrigerantMdx | null {
  const filepath = path.join(CONTENT_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filepath)) return null;
  const raw = fs.readFileSync(filepath, "utf8");
  const { content, data } = matter(raw);
  const fm = RefrigerantFrontmatter.parse(data);
  if (fm.slug !== slug) {
    throw new Error(
      `MDX frontmatter mismatch in ${filepath}: slug "${fm.slug}" does not match filename "${slug}". ` +
        `This is the structural defense against template-swap copy bugs.`
    );
  }
  return { frontmatter: fm, body: content.trim() };
}
