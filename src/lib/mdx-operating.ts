import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import { FAQ } from "./mdx";

/**
 * Frontmatter schema for the rebuilt operating-pressure pages (Task 10).
 * These files live alongside the legacy what-pressure files in
 * content/what-pressure/ but carry `layout: operating` and a section-driven
 * structure. Prose lives here; every pressure NUMBER is computed by
 * src/data/operating-pressures.ts and injected via {slots} — the frontmatter
 * holds no typed pressures.
 */

export const OperatingSectionKind = z.enum([
  "residential-chart",
  "commercial-head-chart",
  "application-suction",
  "standing",
  "comparison-anchor",
  "comparison-chart",
  "co2-suction",
  "co2-highside",
  "co2-standstill",
  "prose",
]);
export type OperatingSectionKind = z.infer<typeof OperatingSectionKind>;

export const OperatingSection = z.object({
  h2: z.string(),
  kind: OperatingSectionKind,
  /** Prose body (Markdown-lite). May contain {slots} filled from the module. */
  body: z.string().optional(),
  /** Standing-table mode. */
  mode: z.enum(["sat", "bubble", "range"]).optional(),
  /** Extra standing rows outside the 65–115 grid (e.g. 68°F=20°C, 86°F=30°C). */
  extraTempsF: z.array(z.number()).optional(),
  /** comparison-anchor: the refrigerants to line up (include this page's slug first). */
  compareSlugs: z.array(z.string()).optional(),
  /** comparison-chart: the OTHER refrigerant to overlay across 65–115°F. */
  compareSlug: z.string().optional(),
  /** residential-chart: add a bar(gauge) column (R-407C). */
  showBar: z.boolean().optional(),
  /** A short note line rendered under the section table. */
  note: z.string().optional(),
});
export type OperatingSection = z.infer<typeof OperatingSection>;

export const OperatingFrontmatter = z.object({
  layout: z.literal("operating"),
  id: z.string(),
  refrigerantSlug: z.string(),
  pageKind: z.enum(["residential", "commercial", "co2"]),
  /** ≤60 chars as rendered. */
  metaTitle: z.string(),
  /** Template with {slots}; filled + length-checked (140–155) at build. */
  metaDescription: z.string(),
  /** H1 — "What Pressure Should R-xxx Be?" (hyphenated ASHRAE name). */
  h1: z.string(),
  /** Concise one-liner for the hub/registry blurb + description fallback. */
  introOneLiner: z.string(),
  /** Intro: 1–3 short plain-prose paragraphs, no labels. */
  intro: z.array(z.string()).min(1).max(3),
  /** Answer block template (40–60 words rendered, must contain **bold**). */
  answerBlock: z.string(),
  /** Ordered sections (define the H2 order). */
  sections: z.array(OperatingSection).min(1),
  faqs: z.array(FAQ).min(1),
  /** Extra prose for the "How these numbers are calculated" method block. */
  methodNote: z.string().optional(),
  /** Contextual internal links (3–8). */
  links: z.array(z.object({ href: z.string(), label: z.string() })).min(3).max(8),
  /** Optional regulatory line — must be sourced from regulatory.json wording. */
  regulatoryNote: z.string().optional(),
});
export type OperatingFrontmatter = z.infer<typeof OperatingFrontmatter>;

export interface LoadedOperating {
  frontmatter: OperatingFrontmatter;
}

const CONTENT_DIR = path.resolve(process.cwd(), "content", "what-pressure");

/** Parse just enough to tell an operating-layout file from a legacy one. */
export function isOperatingFile(id: string): boolean {
  const filepath = path.join(CONTENT_DIR, `${id}.mdx`);
  if (!fs.existsSync(filepath)) return false;
  const { data } = matter(fs.readFileSync(filepath, "utf8"));
  return (data as { layout?: unknown }).layout === "operating";
}

export function loadOperating(id: string): LoadedOperating | null {
  const filepath = path.join(CONTENT_DIR, `${id}.mdx`);
  if (!fs.existsSync(filepath)) return null;
  const { data } = matter(fs.readFileSync(filepath, "utf8"));
  if ((data as { layout?: unknown }).layout !== "operating") return null;
  const fm = OperatingFrontmatter.parse(data);
  if (fm.id !== id) {
    throw new Error(`operating MDX id mismatch in ${filepath}: "${fm.id}" vs filename "${id}".`);
  }
  return { frontmatter: fm };
}

export function listOperatingIds(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""))
    .filter((id) => isOperatingFile(id));
}
