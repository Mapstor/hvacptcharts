/**
 * Shared build-gate guard (QA-1b).
 *
 * Every gate must (a) announce the Node version it ran under and how much it
 * actually inspected, and (b) hard-fail when it inspected too little. A gate
 * that silently checks nothing — e.g. file discovery that returns an empty list
 * because a path filter matched an ancestor directory, or a Node-version change
 * in directory walking — is worse than no gate: it reports a green build while
 * verifying nothing. See the `/dev/`-path-filter bug that shipped past
 * verify-no-generator-text when the checkout lived under a `dev/` directory.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

/**
 * Number of <loc> entries in the prerendered sitemap. The HTML gates derive
 * their floor from this (sitemap URLs − 5), so "discovery found nothing" can
 * never masquerade as success. Throws if no non-empty sitemap is present.
 */
export function sitemapUrlCount(): number {
  const candidates = [
    path.join(ROOT, ".next", "server", "app", "sitemap.xml.body"),
    path.join(ROOT, ".next", "server", "app", "sitemap.xml"),
  ];
  for (const f of candidates) {
    try {
      if (!fs.statSync(f).isFile()) continue;
      const xml = fs.readFileSync(f, "utf8");
      const n = (xml.match(/<loc>/g) ?? []).length;
      if (n > 0) return n;
    } catch {
      /* try next candidate */
    }
  }
  throw new Error(
    "[build-guard] no non-empty prerendered sitemap (.next/server/app/sitemap.xml.body) — run after `next build`",
  );
}

/** HTML gates must scan at least (sitemap URLs − 5). */
export function htmlFloor(): number {
  return Math.max(1, sitemapUrlCount() - 5);
}

/**
 * First line every gate prints: Node version + how much it checked. Hard-exits
 * (code 1) when fewer than `min` items were checked. Call this as the FIRST
 * console output of the gate, once the count is known.
 */
export function banner(gate: string, checked: number, min: number, unit = "items"): void {
  console.log(`[${gate}] node ${process.version} — checked ${checked} ${unit} (floor ${min})`);
  if (checked < min) {
    console.error(
      `[${gate}] FAIL: only ${checked} ${unit} checked, need at least ${min}. ` +
        `Discovery/coverage collapsed — refusing to report success.`,
    );
    process.exit(1);
  }
}
