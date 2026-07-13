/**
 * Git-derived publication/modification dates for content files.
 *
 * Used by JSON-LD builders (TechArticle, refrigerant Article, etc.) and the
 * sitemap so datePublished/dateModified/lastmod reflect real content-change
 * events, not build time. Google reads these as freshness signals; using
 * build time made every page look modified on every deploy.
 *
 * Reads from `git log` at build time. In CI environments with a shallow
 * clone (fetch-depth: 1) git-log has no history — the fallback path uses
 * fs.statSync().mtime, which for a fresh checkout equals check-out time
 * (i.e. build time). Every fallback + the shallow-repo status is appended
 * to .next/git-dates-log.jsonl; validate-schema.ts reads that log after
 * the build, prints a banner listing affected files, and fails the build
 * if >50% of dated files fell back — the shallow-clone footgun should be
 * impossible to miss.
 *
 * Callable only from server components / build-time scripts. Do NOT import
 * this from a client component — it would drag `child_process` into the
 * browser bundle.
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const REPO_ROOT = path.resolve(process.cwd());
const LOG_FILE = path.join(REPO_ROOT, ".next", "git-dates-log.jsonl");

interface GitDates {
  /** First commit that touched this file, as ISO 8601 with offset. */
  published: string;
  /** Most recent commit that touched this file, as ISO 8601 with offset. */
  modified: string;
  /** True if git had no history and we fell back to filesystem mtime. */
  fromFsFallback: boolean;
}

const cache = new Map<string, GitDates>();

const isShallow: boolean = (() => {
  try {
    const out = execFileSync(
      "git",
      ["rev-parse", "--is-shallow-repository"],
      { cwd: REPO_ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    ).trim();
    return out === "true";
  } catch {
    return false;
  }
})();

function loudBanner(lines: string[]): void {
  const bar = "=".repeat(80);
  console.warn(bar);
  for (const l of lines) console.warn(l);
  console.warn(bar);
}

if (isShallow) {
  loudBanner([
    "[git-dates] SHALLOW REPO DETECTED",
    "[git-dates] `git rev-parse --is-shallow-repository` = true.",
    "[git-dates] Content-file dates will fall back to filesystem mtime (= build time),",
    "[git-dates] which defeats the whole point of git-derived dateModified.",
    "[git-dates] Fix — Vercel: Project Settings > Git > uncheck 'Shallow Clone'.",
    "[git-dates] Fix — GitHub Actions: actions/checkout@v4 with `fetch-depth: 0`.",
  ]);
}

function gitLog(absPath: string): string[] | null {
  try {
    const out = execFileSync(
      "git",
      ["log", "--follow", "--format=%aI", "--", absPath],
      { cwd: REPO_ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    );
    const lines = out.trim().split("\n").filter(Boolean);
    return lines.length > 0 ? lines : null;
  } catch {
    return null;
  }
}

function fsFallback(absPath: string): GitDates {
  const stat = fs.statSync(absPath);
  const iso = stat.mtime.toISOString();
  return { published: iso, modified: iso, fromFsFallback: true };
}

function appendLog(entry: object): void {
  try {
    fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
    // JSON entries stay well under PIPE_BUF (4096 bytes on Linux), so
    // concurrent appends from Next.js worker processes remain atomic.
    fs.appendFileSync(LOG_FILE, JSON.stringify(entry) + "\n");
  } catch {
    // best-effort; a read-only fs or full disk shouldn't break the build
  }
}

/**
 * Returns the first-commit and last-commit ISO timestamps for a repo file.
 * Path may be absolute or relative to the repo root.
 * Throws if the file does not exist.
 */
export function getFileGitDates(filepath: string): GitDates {
  const abs = path.isAbsolute(filepath) ? filepath : path.join(REPO_ROOT, filepath);
  const cached = cache.get(abs);
  if (cached) return cached;

  if (!fs.existsSync(abs)) {
    throw new Error(`getFileGitDates: file not found: ${abs}`);
  }

  const lines = gitLog(abs);
  const result: GitDates =
    lines === null
      ? fsFallback(abs)
      : { published: lines[lines.length - 1], modified: lines[0], fromFsFallback: false };

  cache.set(abs, result);

  const relPath = path.relative(REPO_ROOT, abs);
  if (result.fromFsFallback) {
    console.warn(`[git-dates] fs-mtime fallback for ${relPath} (git log returned no history)`);
  }
  appendLog({ file: relPath, fallback: result.fromFsFallback, shallow: isShallow });

  return result;
}
