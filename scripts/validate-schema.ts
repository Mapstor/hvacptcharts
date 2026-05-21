#!/usr/bin/env node
/**
 * Build-time schema validator.
 *
 * Walks every prerendered HTML file in .next/server/app, extracts every
 * <script type="application/ld+json"> block, parses the @graph, and checks
 * that required entity types per page category are present.
 *
 * Per docs/spec/06-SCHEMA_INVENTORY.md §Required entities per page type.
 *
 * Categorizes "required" (must be present — script exits non-zero) versus
 * "expected" (warning only — typically editorial-dependent like FAQPage on
 * refrigerant pages without per-refrigerant MDX yet).
 *
 * Run after `pnpm build`:
 *   pnpm run validate-schema
 */
import fs from "node:fs";
import path from "node:path";

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
    matcher: (u) => /^\/(pt-calculator|superheat-calculator|subcooling-calculator|pt-superheat-subcooling-calculator|saturation-properties-calculator|refrigerant-pt-comparison-tool)\/$/.test(u),
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
    required: ["Organization", "WebSite", "Article", "BreadcrumbList"],
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
    matcher: (u) => u === "/superheat-subcooling-fundamentals/" || u === "/pt-chart-guide/",
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

function extractSchemas(html: string): Array<{ "@type": string; [k: string]: unknown }> {
  const out: Array<{ "@type": string; [k: string]: unknown }> = [];
  const regex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    const raw = match[1].replace(/\\u003c/g, "<");
    try {
      const parsed = JSON.parse(raw);
      const collect = (node: unknown): void => {
        if (Array.isArray(node)) node.forEach(collect);
        else if (node && typeof node === "object") {
          const obj = node as Record<string, unknown>;
          if (obj["@type"] && typeof obj["@type"] === "string") {
            out.push(obj as { "@type": string; [k: string]: unknown });
          }
          if (Array.isArray(obj["@graph"])) (obj["@graph"] as unknown[]).forEach(collect);
          if (obj.mainEntity) collect(obj.mainEntity);
          if (obj.potentialAction) collect(obj.potentialAction);
          if (Array.isArray(obj.itemListElement)) (obj.itemListElement as unknown[]).forEach(collect);
        }
      };
      collect(parsed);
    } catch (e) {
      console.error(`  ! JSON parse failed: ${(e as Error).message}`);
    }
  }
  return out;
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
    const schemas = extractSchemas(html);
    const types = new Set(schemas.map((s) => s["@type"]));

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

console.log("OK  All required schema entities present across all pages.");
