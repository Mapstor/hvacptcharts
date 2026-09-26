#!/usr/bin/env node
/**
 * Generate data/content-dates.json — honest per-route { updated, published }
 * dates computed ONCE from the full local git history, so the build never has
 * to call git or read file mtimes (Vercel builds from a shallow clone where
 * both are wrong).
 *
 * Rules (see docs/spec + task 5):
 *  - A route's `updated` is the latest commit that changed that page's OWN
 *    content: its page.tsx, its MDX, or — for refrigerant pages — that slug's
 *    object inside the shared JSON (generation-timestamp fields like
 *    ptChartGeneratedAt ignored).
 *  - Commits whose subject contains "[no-date]" are skipped (mechanical commits).
 *  - Shared components/templates are reflected only when the same commit also
 *    touched the route's own file — which is how every Task 3–4 visible-content
 *    change landed — so an unrelated shared-lib commit never bumps a page.
 *  - `published` is the first commit that created the route's source.
 *
 * Usage:
 *   node scripts/update-content-dates.mjs            # regenerate everything
 *   node scripts/update-content-dates.mjs --touch /pt-calculator/   # bump one route's updated to today
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "data", "content-dates.json");
const NO_DATE = "[no-date]";
const US = "\x1f", RS = "\x1e";

function sh(cmd) {
  return execSync(cmd, { cwd: ROOT, encoding: "utf8", maxBuffer: 512 * 1024 * 1024 });
}

/** Commits (newest→oldest) that touched any of `paths`, minus [no-date] ones. */
function commitsFor(paths) {
  if (paths.length === 0) return [];
  const args = paths.map((p) => `"${p}"`).join(" ");
  // --follow tracks renames but accepts exactly one pathspec.
  const follow = paths.length === 1 ? "--follow " : "";
  const out = sh(`git log --format="%H${US}%aI${US}%s${RS}" ${follow}-- ${args} 2>/dev/null`);
  return out
    .split(RS)
    .map((r) => r.replace(/^\n/, ""))
    .filter(Boolean)
    .map((rec) => {
      const [hash, aiso, subject] = rec.split(US);
      return { hash, date: aiso.slice(0, 10), subject: subject ?? "" };
    })
    .filter((c) => !c.subject.includes(NO_DATE));
}

function existing(paths) {
  return paths.filter((p) => fs.existsSync(path.join(ROOT, p)));
}

/* ─── per-slug JSON dating: compare the slug's object across each commit,
       ignoring generation-timestamp fields ─────────────────────────────── */
const SLUG_JSON_FILES = ["data/refrigerants.config.json", "data/refrigerants.json"];

function stripGenFields(rec) {
  if (!rec || typeof rec !== "object") return rec;
  const c = JSON.parse(JSON.stringify(rec));
  if (c.dataSource) {
    delete c.dataSource.ptChartGeneratedAt; // generation timestamp — not content
  }
  return c;
}
// config is keyed by slug; refrigerants.json is an array with a slug field.
function pluck(parsed, file, slug) {
  if (file.endsWith("config.json")) return parsed?.[slug];
  if (Array.isArray(parsed)) return parsed.find((r) => r.slug === slug);
  return undefined;
}
function fileAtRev(rev, file) {
  try {
    return JSON.parse(sh(`git show ${rev}:${file} 2>/dev/null`));
  } catch {
    return null; // file didn't exist at that rev (e.g. the creating commit's parent)
  }
}
const _jsonCommitCache = {};
function jsonCommits(file) {
  if (!_jsonCommitCache[file]) _jsonCommitCache[file] = commitsFor([file]);
  return _jsonCommitCache[file];
}
function slugRecordCommits(slug) {
  const hits = [];
  for (const file of SLUG_JSON_FILES) {
    if (!fs.existsSync(path.join(ROOT, file))) continue;
    for (const c of jsonCommits(file)) {
      const after = pluck(fileAtRev(c.hash, file), file, slug);
      const before = pluck(fileAtRev(`${c.hash}^`, file), file, slug);
      const a = JSON.stringify(stripGenFields(after) ?? null);
      const b = JSON.stringify(stripGenFields(before) ?? null);
      if (a !== b) hits.push(c);
    }
  }
  // de-dup by hash, keep newest ordering (already newest→oldest per file)
  const seen = new Set();
  return hits.filter((c) => (seen.has(c.hash) ? false : seen.add(c.hash)));
}

/* ─── route → source-file mapping ─────────────────────────────────────── */
function urlFromPageFile(file) {
  // src/app/foo/bar/page.tsx -> /foo/bar/
  let u = file.replace(/^src\/app/, "").replace(/\/page\.tsx$/, "");
  if (u === "") u = "/";
  else u = u + "/";
  return u;
}

function enumerateRoutes() {
  const pageFiles = sh(`find src/app -name page.tsx`).split("\n").filter(Boolean);
  const routes = {};
  for (const f of pageFiles) {
    if (f.includes("[slug]")) continue; // dynamic — expanded below
    if (f.includes("src/app/dev/")) continue; // dev-only preview, noindex
    const url = urlFromPageFile(f);
    let sources = [f];
    const wpId = url.match(/^\/what-pressure-should-(.+)\/$/);
    const cmp = url.match(/^\/(r-[0-9a-z-]+-vs-r-[0-9a-z-]+)\/$/);
    if (wpId) {
      const mdx = `content/what-pressure/${wpId[1]}.mdx`;
      sources = existing([mdx, f]);
    } else if (cmp) {
      const mdx = `content/comparisons/${cmp[1]}.mdx`;
      sources = existing([mdx, f]);
    }
    routes[url] = { type: "static", sources };
  }
  // refrigerant detail pages (dynamic [slug])
  const refs = JSON.parse(fs.readFileSync(path.join(ROOT, "data/refrigerants.json"), "utf8"));
  for (const r of refs) {
    routes[`/refrigerant/${r.slug}/`] = { type: "refrigerant", slug: r.slug,
      sources: existing([`content/refrigerants/${r.slug}.mdx`]) };
  }
  return routes;
}

/* ─── build dates ─────────────────────────────────────────────────────── */
function datesForRoute(route, def) {
  let commits = commitsFor(def.sources); // newest→oldest, [no-date] excluded
  if (def.type === "refrigerant") {
    commits = commits.concat(slugRecordCommits(def.slug));
  }
  if (commits.length === 0) {
    // No dated commit found (e.g. only [no-date] history) — fall back to the
    // route's full history so we always have SOMETHING; note it.
    const all = def.sources.length ? commitsForIncludingNoDate(def.sources) : [];
    if (all.length === 0) return null;
    const ds = all.map((c) => c.date).sort();
    return { updated: ds[ds.length - 1], published: ds[0], _fallback: true };
  }
  const ds = commits.map((c) => c.date).sort();
  return {
    updated: ds[ds.length - 1],
    published: ds[0],
    _updatedBy: commits.find((c) => c.date === ds[ds.length - 1])?.hash?.slice(0, 7),
    _updatedSubject: commits.find((c) => c.date === ds[ds.length - 1])?.subject,
  };
}
function commitsForIncludingNoDate(paths) {
  const args = paths.map((p) => `"${p}"`).join(" ");
  const out = sh(`git log --format="%H${US}%aI${US}%s${RS}" -- ${args} 2>/dev/null`);
  return out.split(RS).map((r) => r.replace(/^\n/, "")).filter(Boolean).map((rec) => {
    const [hash, aiso, subject] = rec.split(US);
    return { hash, date: aiso.slice(0, 10), subject: subject ?? "" };
  });
}

function todayISO() {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

function main() {
  const touchIdx = process.argv.indexOf("--touch");
  if (touchIdx !== -1) {
    const route = process.argv[touchIdx + 1];
    const data = JSON.parse(fs.readFileSync(OUT, "utf8"));
    if (!data[route]) throw new Error(`--touch: route not in content-dates.json: ${route}`);
    data[route].updated = todayISO();
    fs.writeFileSync(OUT, JSON.stringify(sortObj(data), null, 2) + "\n");
    console.log(`touched ${route} -> updated ${data[route].updated}`);
    return;
  }

  const routes = enumerateRoutes();
  const out = {};
  const notes = [];
  for (const [route, def] of Object.entries(routes)) {
    const d = datesForRoute(route, def);
    if (!d) { notes.push(`NO COMMITS for ${route} (sources: ${def.sources.join(", ") || "none"})`); continue; }
    if (d._fallback) notes.push(`FALLBACK (no dated commit) for ${route}`);
    out[route] = { updated: d.updated, published: d.published };
  }
  // If route enumeration collapsed (wrong cwd / missing src/app / empty
  // refrigerant list) this would otherwise overwrite content-dates.json with
  // {} and exit 0, silently wiping every page's dates. Refuse.
  if (Object.keys(out).length === 0) {
    console.error(`enumerateRoutes produced 0 dated routes — refusing to overwrite ${OUT} with an empty object.`);
    process.exit(1);
  }
  fs.writeFileSync(OUT, JSON.stringify(sortObj(out), null, 2) + "\n");
  const dates = Object.values(out).flatMap((v) => [v.updated, v.published]).sort();
  console.log(`content-dates.json: ${Object.keys(out).length} routes; min ${dates[0]} max ${dates[dates.length - 1]}`);
  if (notes.length) console.log("NOTES:\n  " + notes.join("\n  "));
}
function sortObj(o) {
  return Object.fromEntries(Object.keys(o).sort().map((k) => [k, o[k]]));
}
main();
