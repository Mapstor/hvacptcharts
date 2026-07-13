#!/usr/bin/env node
/**
 * Build-time schema validator.
 *
 * Walks every prerendered HTML file in .next/server/app, extracts every
 * <script type="application/ld+json"> block, parses the @graph, and checks
 * both structural shape and required entity types per page category.
 *
 * Two checks:
 *  1. Structural (zod). Each script tag must parse to
 *     { "@context": "https://schema.org", "@graph": [ …entities ] } and each
 *     entity must have a string "@type". Article / TechArticle / Dataset
 *     must carry ISO 8601 datePublished + dateModified. Invalid = build fail.
 *  2. Presence-per-category. Refrigerant pages must have Dataset, calculators
 *     must have WebApplication, guides must have TechArticle, etc.
 *     Per docs/spec/06-SCHEMA_INVENTORY.md §Required entities per page type.
 *
 * "Required" entities cause a non-zero exit; "expected" ones (editorial-
 * dependent, e.g. FAQPage) log warnings.
 *
 * Run as part of `pnpm build`:
 *   next build && pnpm run validate-schema
 */
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

const ROOT = path.resolve(process.cwd());
const BUILD_DIR = path.join(ROOT, ".next", "server", "app");

interface Category {
  name: string;
  matcher: (url: string) => boolean;
  required: string[];
  expected: string[];
}

const CATEGORIES: Category[] = [
  {
    name: "homepage",
    matcher: (u) => u === "/",
    required: ["Organization", "WebSite", "CollectionPage"],
    expected: ["SearchAction", "ItemList"],
  },
  {
    name: "refrigerant",
    matcher: (u) => /^\/refrigerant\/[a-z0-9-]+\/$/.test(u),
    required: ["Organization", "WebSite", "Article", "DefinedTerm", "Dataset", "BreadcrumbList"],
    expected: ["FAQPage"],
  },
  {
    name: "calculator",
    matcher: (u) => /^\/(pt-calculator|superheat-calculator|subcooling-calculator|pt-superheat-subcooling-calculator|saturation-properties-calculator|refrigerant-pt-comparison-tool|refrigerant-retrofit-compatibility-calculator|system-pressure-diagnostic-calculator|refrigerant-charge-calculator|psychrometric-calculator|duct-size-calculator|hvac-load-calculator)\/$/.test(u),
    required: ["Organization", "WebSite", "Article", "WebApplication", "BreadcrumbList"],
    expected: ["FAQPage"],
  },
  {
    name: "what-pressure",
    matcher: (u) => /^\/what-pressure-should-[a-z0-9]+\/$/.test(u),
    required: ["Organization", "WebSite", "Article", "BreadcrumbList"],
    expected: ["HowTo", "FAQPage"],
  },
  {
    name: "comparison",
    matcher: (u) => /^\/r-[a-z0-9-]+-vs-r-[a-z0-9-]+\/$/.test(u),
    // Comparisons emit TechArticle (subtype of Article).
    required: ["Organization", "WebSite", "TechArticle", "BreadcrumbList"],
    expected: ["FAQPage"],
  },
  {
    name: "hub",
    matcher: (u) => u === "/calculators-hub/" || u === "/pt-charts-tools-hub/" || u === "/guides-hub/",
    required: ["Organization", "WebSite", "CollectionPage", "BreadcrumbList"],
    expected: ["ItemList"],
  },
  {
    name: "reference",
    matcher: (u) => u === "/refrigerant-safety-classifications/" || u === "/refrigerant-gwp-rankings/",
    required: ["Organization", "WebSite", "Article", "Dataset", "BreadcrumbList"],
    expected: [],
  },
  {
    name: "long-form guide",
    matcher: (u) => u === "/superheat-subcooling-fundamentals/" || u === "/pt-chart-guide/" || u === "/high-head-pressure-causes/" || u === "/refrigerant-comparison-guide/" || u === "/carrier-410a-charging-chart/" || u === "/hvac-troubleshooting-guide/" || u === "/refrigerant-prices-guide/" || u === "/hvac-load-calculation-guide/" || u === "/hvac-duct-design-guide/" || u === "/hvac-refrigerant-recovery-guide/" || u === "/hvac-energy-efficiency-guide/" || u === "/hvac-commissioning-guide/" || u === "/hvac-maintenance-service-guide/" || u === "/hvac-indoor-air-quality-guide/" || u === "/hvac-mechanical-ventilation-guide/" || u === "/hvac-system-design-guide/" || u === "/hvac-controls-automation-guide/" || u === "/hvac-safety-procedures-guide/" || u === "/hvac-tools-equipment-guide/" || u === "/hvac-retrofitting-upgrades-guide/" || u === "/hvac-energy-management-guide/" || u === "/hvac-building-automation-guide/" || u === "/hvac-ductless-mini-split-guide/",
    required: ["Organization", "WebSite", "TechArticle", "BreadcrumbList"],
    expected: ["FAQPage"],
  },
  {
    name: "about page",
    matcher: (u) => u === "/about-us/",
    required: ["Organization", "WebSite", "AboutPage", "BreadcrumbList"],
    expected: [],
  },
  {
    name: "contact page",
    matcher: (u) => u === "/contact-us/",
    required: ["Organization", "WebSite", "ContactPage", "BreadcrumbList"],
    expected: [],
  },
  {
    name: "site page",
    matcher: (u) => u === "/privacy-policy/" || u === "/terms-of-service/",
    required: ["Organization", "WebSite", "WebPage", "BreadcrumbList"],
    expected: [],
  },
];

const SKIP_PATTERNS = [
  /^\/_not-found\/?$/,
  /^\/_global-error\/?$/,
  /^\/dev\//,             // noindex'd dev gallery
  /^\/data\/refrigerant\//, // data download endpoints (route handlers, no HTML schema)
];

function findHtmlFiles(dir: string): string[] {
  const out: string[] = [];
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      out.push(...findHtmlFiles(full));
    } else if (ent.isFile() && ent.name.endsWith(".html")) {
      out.push(full);
    }
  }
  return out;
}

function urlFromHtmlPath(filepath: string): string {
  const rel = path.relative(BUILD_DIR, filepath);
  // refrigerant/r-410a.html → /refrigerant/r-410a/
  // index.html → /
  // pt-calculator.html → /pt-calculator/
  let url = "/" + rel.replace(/\.html$/, "");
  if (url === "/index") return "/";
  if (!url.endsWith("/")) url += "/";
  return url;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})?)?$/;

const Entity = z
  .object({
    "@type": z.string().min(1, "@type is required and must be a non-empty string"),
    "@id": z.string().url().optional(),
  })
  .passthrough();

const Graph = z.object({
  "@context": z.literal("https://schema.org"),
  "@graph": z.array(Entity).min(1, "@graph must contain at least one entity"),
});

const DATE_TYPES = new Set(["Article", "TechArticle", "Dataset"]);

interface StructuralError {
  url: string;
  message: string;
}

function validateStructural(
  url: string,
  scripts: string[],
): { entities: Array<{ "@type": string; [k: string]: unknown }>; errors: StructuralError[] } {
  const errors: StructuralError[] = [];
  const entities: Array<{ "@type": string; [k: string]: unknown }> = [];

  for (const raw of scripts) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      errors.push({ url, message: `JSON parse failed: ${(e as Error).message}` });
      continue;
    }
    const parseResult = Graph.safeParse(parsed);
    if (!parseResult.success) {
      const issues = parseResult.error.issues
        .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
        .join("; ");
      errors.push({ url, message: `schema shape invalid: ${issues}` });
      continue;
    }
    for (const ent of parseResult.data["@graph"]) {
      entities.push(ent);
      if (DATE_TYPES.has(ent["@type"])) {
        const dp = ent["datePublished"];
        const dm = ent["dateModified"];
        if (typeof dp !== "string" || !ISO_DATE.test(dp)) {
          errors.push({
            url,
            message: `${ent["@type"]} @id=${ent["@id"] ?? "(none)"} datePublished missing or not ISO 8601 (got ${JSON.stringify(dp)})`,
          });
        }
        if (typeof dm !== "string" || !ISO_DATE.test(dm)) {
          errors.push({
            url,
            message: `${ent["@type"]} @id=${ent["@id"] ?? "(none)"} dateModified missing or not ISO 8601 (got ${JSON.stringify(dm)})`,
          });
        }
      }
    }
  }
  return { entities, errors };
}

function extractSchemas(html: string, url: string): { entities: Array<{ "@type": string; [k: string]: unknown }>; structuralErrors: StructuralError[] } {
  const regex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  const rawScripts: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    rawScripts.push(match[1].replace(/\\u003c/g, "<"));
  }

  const { entities: rootEntities, errors: structuralErrors } = validateStructural(url, rawScripts);

  const flat: Array<{ "@type": string; [k: string]: unknown }> = [];
  const collect = (node: unknown): void => {
    if (Array.isArray(node)) node.forEach(collect);
    else if (node && typeof node === "object") {
      const obj = node as Record<string, unknown>;
      if (obj["@type"] && typeof obj["@type"] === "string") {
        flat.push(obj as { "@type": string; [k: string]: unknown });
      }
      if (Array.isArray(obj["@graph"])) (obj["@graph"] as unknown[]).forEach(collect);
      if (obj.mainEntity) collect(obj.mainEntity);
      if (obj.potentialAction) collect(obj.potentialAction);
      if (Array.isArray(obj.itemListElement)) (obj.itemListElement as unknown[]).forEach(collect);
    }
  };
  rootEntities.forEach(collect);

  return { entities: flat, structuralErrors };
}

function validate(): { ok: boolean; errors: string[]; warnings: string[]; visited: number; skipped: number } {
  const errors: string[] = [];
  const warnings: string[] = [];
  let visited = 0;
  let skipped = 0;

  const files = findHtmlFiles(BUILD_DIR).sort();
  for (const file of files) {
    const url = urlFromHtmlPath(file);
    if (SKIP_PATTERNS.some((p) => p.test(url))) {
      skipped++;
      continue;
    }
    const cat = CATEGORIES.find((c) => c.matcher(url));
    if (!cat) {
      warnings.push(`${url}: no schema category matched (rule needed in validate-schema.ts CATEGORIES?)`);
      continue;
    }
    visited++;
    const html = fs.readFileSync(file, "utf8");
    const { entities, structuralErrors } = extractSchemas(html, url);
    for (const se of structuralErrors) {
      errors.push(`${se.url} [${cat.name}] structural: ${se.message}`);
    }
    const types = new Set(entities.map((s) => s["@type"]));

    for (const req of cat.required) {
      if (!types.has(req)) {
        errors.push(`${url} [${cat.name}]: missing required ${req}`);
      }
    }
    for (const exp of cat.expected) {
      if (!types.has(exp)) {
        warnings.push(`${url} [${cat.name}]: missing expected ${exp}`);
      }
    }
  }

  return { ok: errors.length === 0, errors, warnings, visited, skipped };
}

const { ok, errors, warnings, visited, skipped } = validate();

console.log(`\nSchema validation summary`);
console.log(`  visited:  ${visited} pages`);
console.log(`  skipped:  ${skipped} (dev gallery, data endpoints, not-found)`);
console.log(`  warnings: ${warnings.length}`);
console.log(`  errors:   ${errors.length}\n`);

if (warnings.length > 0) {
  console.log("Warnings (editorial-dependent, not blocking):");
  for (const w of warnings.slice(0, 20)) console.log("  - " + w);
  if (warnings.length > 20) console.log(`  ...and ${warnings.length - 20} more`);
  console.log();
}

if (!ok) {
  console.error("Errors (blocking):");
  for (const e of errors) console.error("  - " + e);
  console.error();
  process.exit(1);
}

console.log("OK  All required schema entities present across all pages.\n");

// ─────────────────────────────────────────────────────────────────────
// git-dates fallback audit
//
// src/lib/git-dates.ts appends one JSONL entry per call to this log during
// the build. Aggregate here so a Vercel build with a shallow clone can't
// silently ship "dateModified = build time" to Google. Fail the build if
// >50% of dated files fell back — the shallow-clone footgun is common
// enough that we want a hard stop, not just a warning.
// ─────────────────────────────────────────────────────────────────────

const GIT_DATES_LOG = path.join(ROOT, ".next", "git-dates-log.jsonl");
if (fs.existsSync(GIT_DATES_LOG)) {
  const seen = new Map<string, { fallback: boolean; shallow: boolean }>();
  for (const line of fs.readFileSync(GIT_DATES_LOG, "utf8").split("\n")) {
    if (!line) continue;
    try {
      const e = JSON.parse(line) as { file: string; fallback: boolean; shallow: boolean };
      seen.set(e.file, { fallback: e.fallback, shallow: e.shallow });
    } catch {
      // skip malformed line — atomic-write race would leave a partial JSON
    }
  }
  try { fs.unlinkSync(GIT_DATES_LOG); } catch { /* ignore */ }

  const total = seen.size;
  const fallbackFiles = [...seen.entries()].filter(([, v]) => v.fallback).map(([f]) => f).sort();
  const anyShallow = [...seen.values()].some((v) => v.shallow);
  const fallbackRate = total > 0 ? (fallbackFiles.length / total) * 100 : 0;
  const critical = fallbackRate > 50;

  if (fallbackFiles.length > 0 || anyShallow) {
    const bar = "=".repeat(80);
    const fn = critical ? console.error : console.warn;
    fn(bar);
    fn(`[git-dates] ${critical ? "BUILD-FAILING" : "WARNING"}: ${fallbackFiles.length}/${total} dated files fell back to filesystem mtime (${fallbackRate.toFixed(0)}%).`);
    if (anyShallow) {
      fn(`[git-dates] Repository is SHALLOW ('git rev-parse --is-shallow-repository' = true).`);
      fn(`[git-dates] git log lacks history, so dateModified reflects checkout time, not authoring time.`);
    }
    if (fallbackFiles.length > 0) {
      fn(`[git-dates] Affected files:`);
      for (const f of fallbackFiles.slice(0, 25)) fn(`[git-dates]   - ${f}`);
      if (fallbackFiles.length > 25) fn(`[git-dates]   ...and ${fallbackFiles.length - 25} more`);
    }
    fn(`[git-dates] Fix — Vercel: Project Settings > Git > uncheck 'Shallow Clone'.`);
    fn(`[git-dates] Fix — GitHub Actions: actions/checkout@v4 with 'fetch-depth: 0'.`);
    fn(bar);
    if (critical) process.exit(1);
  } else {
    console.log(`[git-dates] OK — ${total} dated files, all resolved via git log.`);
  }
}
