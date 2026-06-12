import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import { FAQ } from "./mdx";

export const OperatingRange = z.object({
  ambientF: z.number(),
  application: z.string(),
  suctionPsigLow: z.number(),
  suctionPsigHigh: z.number(),
  dischargePsigLow: z.number(),
  dischargePsigHigh: z.number(),
  /** Optional companion values. */
  superheatTargetF: z.tuple([z.number(), z.number()]).optional(),
  subcoolingTargetF: z.tuple([z.number(), z.number()]).optional(),
});
export type OperatingRange = z.infer<typeof OperatingRange>;

export const DiagnosticStep = z.object({
  title: z.string(),
  text: z.string(),
  /** Optional tools list. */
  tools: z.array(z.string()).optional(),
});
export type DiagnosticStep = z.infer<typeof DiagnosticStep>;

/**
 * Optional MDX-provided override for the auto-generated service scenarios.
 * Used when the auto-gen logic (residential AC, EPA 608 framing) is wrong for
 * the application — e.g., MVAC (automotive) refrigerants need ambient × engine
 * RPM scenarios and EPA Section 609 referencing.
 *
 * Shape mirrors the GeneratedScenario interface in WhatPressurePage.tsx.
 */
const Verdict = z.enum(["ok", "warn", "bad", "info"]);
const Measurement = z.object({
  label: z.string(),
  value: z.string(),
  side: z.enum(["low", "high"]).optional(),
});
const Lookup = z.object({
  input: z.string(),
  output: z.string(),
  note: z.string().optional(),
});
const Derived = z.object({
  formula: z.string(),
  verdict: Verdict,
  note: z.string().optional(),
});
export const ScenarioOverride = z.object({
  title: z.string(),
  scenario: z.string(),
  measured: z.array(Measurement),
  lookups: z.array(Lookup),
  derived: z.array(Derived),
  verdict: z.object({ status: Verdict, title: z.string(), body: z.string() }),
  fix: z.string().optional(),
});
export type ScenarioOverride = z.infer<typeof ScenarioOverride>;

/** Envelope-context bullet (replaces the auto-gen list when supplied). */
export const EnvelopeBullet = z.object({
  label: z.string(),
  body: z.string(),
});
export type EnvelopeBullet = z.infer<typeof EnvelopeBullet>;

/** Single common-mistake item (replaces the auto-gen list when supplied). */
export const CommonMistake = z.object({
  emphasis: z.string(),
  body: z.string(),
});
export type CommonMistake = z.infer<typeof CommonMistake>;

export const WhatPressureFrontmatter = z.object({
  id: z.string(),
  refrigerantSlug: z.string(),
  title: z.string(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  introOneLiner: z.string(),
  /** ACCA Manual T / EPA Section 608 / manufacturer source label for the operating ranges. */
  operatingRangesSource: z.string(),
  operatingRanges: z.array(OperatingRange).min(1),
  diagnosticSteps: z.array(DiagnosticStep).min(1),
  faqs: z.array(FAQ).optional().default([]),
  narrativeIntro: z.string().optional(),
  /**
   * Optional overrides for sections the template auto-generates from refrigerant
   * data alone. Provide these when the application context (e.g. MVAC vs
   * stationary HVAC) makes the auto-gen prose wrong. When present, the override
   * replaces the auto-gen output entirely for that section.
   */
  serviceScenarios: z.array(ScenarioOverride).optional(),
  envelopeBullets: z.array(EnvelopeBullet).optional(),
  commonMistakes: z.array(CommonMistake).optional(),
  /** Tools cited in the HowTo schema. Defaults to stationary-HVAC tools. */
  diagnosticTools: z.array(z.string()).optional(),
  /** Extra sources appended to the provenance footer (additive). */
  extraSources: z.array(z.string()).optional(),
  /**
   * Omit the stationary-HVAC-specific footer lines (AHRI 540-2020 compressor
   * minimums; ACCA Manual T diagnostic procedures) when this page is for a
   * non-stationary application (e.g. MVAC). When true, supply replacement
   * provenance via extraSources.
   */
  omitStationaryFooterClaims: z.boolean().optional(),
});
export type WhatPressureFrontmatter = z.infer<typeof WhatPressureFrontmatter>;

export interface LoadedWhatPressure {
  frontmatter: WhatPressureFrontmatter;
  body: string;
}

const CONTENT_DIR = path.resolve(process.cwd(), "content", "what-pressure");

export function loadWhatPressure(id: string): LoadedWhatPressure | null {
  const filepath = path.join(CONTENT_DIR, `${id}.mdx`);
  if (!fs.existsSync(filepath)) return null;
  const raw = fs.readFileSync(filepath, "utf8");
  const { content, data } = matter(raw);
  const fm = WhatPressureFrontmatter.parse(data);
  if (fm.id !== id) {
    throw new Error(`what-pressure MDX id mismatch in ${filepath}: "${fm.id}" vs filename "${id}".`);
  }
  return { frontmatter: fm, body: content.trim() };
}

export function listWhatPressureIds(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

/**
 * Build a map from refrigerantSlug → what-pressure id by reading each MDX
 * file's frontmatter. Used to surface "what should X pressures be" links on
 * per-refrigerant pages.
 */
export function buildWhatPressureSlugMap(): Map<string, string> {
  const map = new Map<string, string>();
  for (const id of listWhatPressureIds()) {
    const wp = loadWhatPressure(id);
    if (wp) map.set(wp.frontmatter.refrigerantSlug, id);
  }
  return map;
}

export function findWhatPressureForRefrigerant(slug: string): string | null {
  return buildWhatPressureSlugMap().get(slug) ?? null;
}
