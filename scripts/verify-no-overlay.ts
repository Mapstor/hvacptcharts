#!/usr/bin/env node
/**
 * Grep guard: components under src/components/diagrams/ must NOT use
 * absolute/fixed positioning.
 *
 * The Tier 1 SVG rollout (2026-07-16) locked in a pattern-wide rule that
 * diagram figures are normal-flow block elements. Their height comes from
 * the viewBox aspect ratio, they wrap in <figure>/<figcaption>, and they
 * never render over following content. Absolute or fixed positioning
 * inside a diagram component is the failure mode this guard catches:
 * every diagram is a self-contained, in-flow element.
 *
 * Scope: files under src/components/diagrams/. Usage sites (page.tsx,
 * templates) live outside the scan — Tailwind's `absolute` / `fixed`
 * classes are widely used elsewhere in the app for legitimate purposes
 * (dropdowns, sticky headers, toast notifications). Scoping to the diagram
 * directory keeps the rule enforceable without false positives.
 */

import fs from "node:fs";
import path from "node:path";

const REPO_ROOT = path.resolve(process.cwd());
const DIAGRAMS_DIR = path.join(REPO_ROOT, "src/components/diagrams");

// Match `absolute`, `fixed` as standalone Tailwind class tokens inside a
// className= string. Also match `position: absolute` / `position: fixed`
// inside inline style props. Deliberately narrow — Tailwind's `relative`,
// `sticky`, `static` are all fine.
const CLASSNAME_TOKENS = /\bclassName\s*=\s*["'`][^"'`]*\b(absolute|fixed)\b/;
const INLINE_STYLE = /position\s*:\s*["'`]?(absolute|fixed)/;

interface Violation {
  file: string;
  line: number;
  match: string;
  text: string;
}

const violations: Violation[] = [];
const files: string[] = [];

function walk(dir: string): void {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && /\.(tsx|ts)$/.test(entry.name))
      files.push(full);
  }
}

if (!fs.existsSync(DIAGRAMS_DIR)) {
  console.log(
    `\n[verify-no-overlay] ${DIAGRAMS_DIR} not found — nothing to scan\n`,
  );
  process.exit(0);
}

walk(DIAGRAMS_DIR);

for (const abs of files) {
  const rel = path.relative(REPO_ROOT, abs);
  const lines = fs.readFileSync(abs, "utf8").split("\n");
  lines.forEach((line, i) => {
    const m1 = line.match(CLASSNAME_TOKENS);
    const m2 = line.match(INLINE_STYLE);
    if (m1) {
      violations.push({
        file: rel,
        line: i + 1,
        match: m1[1],
        text: line.trim(),
      });
    } else if (m2) {
      violations.push({
        file: rel,
        line: i + 1,
        match: m2[1],
        text: line.trim(),
      });
    }
  });
}

const bar = "=".repeat(80);
console.log(
  `\n[verify-no-overlay] scanned ${files.length} files under src/components/diagrams/`,
);

if (violations.length === 0) {
  console.log(
    `[verify-no-overlay] OK — 0 absolute/fixed positioning in diagram components\n`,
  );
  process.exit(0);
}

console.error(bar);
console.error(
  `[verify-no-overlay] FAIL — ${violations.length} overlay violation${violations.length === 1 ? "" : "s"} in diagram components.`,
);
console.error(
  `[verify-no-overlay] Diagrams are normal-flow block elements. See scripts/verify-no-overlay.ts for the pattern rule.`,
);
console.error(bar);
for (const v of violations) {
  console.error(`  ${v.file}:${v.line}`);
  console.error(`    matches: ${v.match}`);
  const trimmed = v.text.length > 120 ? v.text.slice(0, 117) + "..." : v.text;
  console.error(`    line:    ${trimmed}`);
}
console.error(bar);
process.exit(1);
