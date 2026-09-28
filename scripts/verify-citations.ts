#!/usr/bin/env tsx
/**
 * Build gate (after verify-regulatory): no orphan sources and no dangling
 * citations. For every built page that renders a "Sources & citations" list
 * (a <section id="sources"> with <li id="src-…"> items):
 *
 *   - ORPHAN: a listed source that no sentence on the page cites
 *     (no <a href="#src-{id}"> points at it).
 *   - UNRESOLVED: a citation <a href="#src-{id}"> whose target id exists on no
 *     element on the page (a cited [n] that doesn't resolve).
 *
 * Floor = number of pages that carry a sources list, so a build that silently
 * stops emitting sources lists can't pass by checking nothing.
 *
 * Runs post-`next build`; scans .next/server/app HTML.
 */
import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";
import { banner } from "./build-guard";

const ROOT = process.cwd();
const APP_DIR = process.argv[2] ? path.resolve(process.argv[2]) : path.join(ROOT, ".next", "server", "app");

const FLOOR = 25; // pages with a "Sources & citations" list (refrigerant detail pages)

const failures: string[] = [];
const fail = (m: string) => failures.push(m);

function walk(dir: string, acc: string[]): string[] {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    const rel = path.relative(APP_DIR, full).split(path.sep).join("/");
    if (rel === "dev" || rel.startsWith("dev/")) continue;
    if (e.isDirectory()) walk(full, acc);
    else if (e.isFile() && e.name.endsWith(".html")) acc.push(full);
  }
  return acc;
}

interface PageReport { file: string; orphans: string[]; unresolved: string[]; listed: number }
const reports: PageReport[] = [];
let pagesWithSources = 0;

if (!fs.existsSync(APP_DIR)) {
  fail(`.next/server/app not found at ${APP_DIR} — run after \`next build\``);
} else {
  for (const file of walk(APP_DIR, [])) {
    const rel = file.slice(ROOT.length + 1);
    const $ = cheerio.load(fs.readFileSync(file, "utf8"));

    const sourcesSection = $("#sources");
    if (sourcesSection.length === 0) continue; // page has no sources list

    // Every citation-target id present anywhere on the page (src-… and src-eos-…).
    const targetIds = new Set<string>();
    $('[id^="src-"]').each((_, el) => { const id = $(el).attr("id"); if (id) targetIds.add(id); });

    // Every citation anchor in the page body (points at "#src-{id}").
    const citedIds = new Set<string>();
    $('a[href^="#src-"]').each((_, el) => {
      const href = $(el).attr("href");
      if (href) citedIds.add(href.slice(1)); // strip leading '#'
    });

    // UNRESOLVED: a cited target that exists on no element.
    const unresolved: string[] = [];
    for (const cid of citedIds) {
      if (!targetIds.has(cid)) unresolved.push(cid.replace(/^src-/, ""));
    }

    // ORPHAN: a listed frontmatter source that nothing cites.
    const listedIds: string[] = [];
    sourcesSection.find('li[id^="src-"]').each((_, el) => { const id = $(el).attr("id"); if (id) listedIds.push(id); });
    const orphans = listedIds.filter((id) => !citedIds.has(id)).map((id) => id.replace(/^src-/, ""));

    pagesWithSources++;
    if (orphans.length || unresolved.length) {
      reports.push({ file: rel, orphans, unresolved, listed: listedIds.length });
      for (const id of orphans) fail(`orphan source: ${rel} lists "${id}" but no sentence cites it`);
      for (const id of unresolved) fail(`unresolved citation: ${rel} cites [#src-${id}] which resolves to no source`);
    }
  }
}

/* ─────────────────────────── report + exit ──────────────────────────────── */

banner("verify-citations", pagesWithSources, FLOOR, "pages with sources");

if (reports.length) {
  console.log("[verify-citations] issues by page:");
  for (const r of reports.slice(0, 80)) {
    if (r.orphans.length) console.log(`  ${r.file}: ${r.orphans.length} orphan(s) → ${r.orphans.join(", ")}`);
    if (r.unresolved.length) console.log(`  ${r.file}: ${r.unresolved.length} unresolved → ${r.unresolved.join(", ")}`);
  }
}
if (failures.length) {
  console.error(`\n[verify-citations] FAIL — ${failures.length} issue(s):`);
  for (const m of failures.slice(0, 80)) console.error("  ✗ " + m);
  if (failures.length > 80) console.error(`  … and ${failures.length - 80} more`);
  process.exit(1);
}
console.log("[verify-citations] OK — every listed source is cited and every citation resolves ✓");
process.exit(0);
