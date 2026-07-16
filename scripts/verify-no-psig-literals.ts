#!/usr/bin/env node
/**
 * Grep guard: Wave 1 new files must not contain numeric PSIG literals.
 *
 * Every saturation pressure value on these pages must render through
 * fmtPsigBubble / fmtPsigDew (src/lib/pressure-format.ts) or come directly
 * from dataset props. If a literal like "119 PSIG" appears in the source,
 * a future dataset change (or a typo during authoring) would silently
 * diverge from the numbers on the linked pages.
 *
 * The prose-regex approach from proposal option (B) would have caught the
 * hand-copied "114 PSIG (95°F sat)" for R-1234yf in the Wave 1 plan; this
 * grep guard is the structural equivalent, scoped to the new files only.
 *
 * Ranges like "125–145 PSIG" and switch cutout references ("500–650 PSIG")
 * inside long-form prose ARE valid dataset-independent claims — they cite
 * OEM literature bands, not a computed saturation lookup. The convention:
 * literal digit-followed-by-PSIG anywhere in a Wave 1 source file is a
 * violation. If a page needs a service-observed range that isn't a
 * saturation lookup, either move it into an existing page (out of the
 * guard's scope) or express it as an interpolation with a comment
 * explaining the source.
 *
 * Wave 2+ can extend the allowlist. Do NOT retro-scope existing pages —
 * the discipline lives at the boundary of new authoring.
 */

import fs from "node:fs";
import path from "node:path";

const REPO_ROOT = path.resolve(process.cwd());

// Files added in Wave 1 that must be free of numeric PSIG literals.
// Extended in the B4 SVG exemplar (2026-07-15) to cover the two new
// diagram components in src/components/diagrams/. Neither carries a
// PSIG value in its current form, but the guard covers them
// prophylactically: any future diagram that surfaces a pressure value
// must route through fmtPsigBubble/fmtPsigDew like the other Wave 1
// authoring paths.
//
// Extended again in the Tier 1 SVG rollout (2026-07-16) to cover the
// three new cylinder components + SystemGaugesDiagram + the gauge
// operating-points constants file. The gauge diagram and constants file
// legitimately reference PSIG in JSDoc prose; the regex ignores
// designations like "R-410A" but flags bare "119 PSIG" — the JSDoc
// comments have been written to describe pressures without literals.
const WAVE_1_ALLOWLIST = [
  "src/lib/pressure-format.ts",
  "src/components/calculators/ChargingChartMatrix.tsx",
  "src/components/diagrams/CycleTimelineDiagram.tsx",
  "src/components/diagrams/OilFoamMechanismDiagram.tsx",
  "src/components/diagrams/RefrigerantCylinderDiagram.tsx",
  "src/components/diagrams/RefrigerantCylinderStory.tsx",
  "src/components/diagrams/CylinderComparisonRow.tsx",
  "src/components/diagrams/SystemGaugesDiagram.tsx",
  "src/data/gauge-operating-points.ts",
  "src/app/target-superheat-chart/page.tsx",
  "src/app/r410a-superheat-chart/page.tsx",
  "src/app/r22-superheat-chart/page.tsx",
  "src/app/r410a-charging-chart/page.tsx",
  "src/app/high-suction-low-head-pressure/page.tsx",
  "src/app/ac-low-side-pressure-too-high/page.tsx",
  "src/app/low-suction-pressure/page.tsx",
  "src/app/ac-compressor-short-cycling/page.tsx",
  "src/app/overcharged-ac-symptoms/page.tsx",
  "src/app/r-12-vs-r-134a/page.tsx",
  "content/comparisons/r-12-vs-r-134a.mdx",
];

// Refrigerant designations like "R-22" or "R-410A" would otherwise trigger
// on any digit adjacent to a "PSIG" label word. Require the digit not to
// be preceded by a letter, digit, or hyphen — matches only the *start* of
// bare number tokens like "119 PSIG" or "500 PSIG".
const PSIG_LITERAL = /(?<![A-Za-z0-9-])\d+(?:\.\d+)?\s*PSIG\b/g;

interface Violation {
  file: string;
  line: number;
  text: string;
  matches: string[];
}

const violations: Violation[] = [];

for (const rel of WAVE_1_ALLOWLIST) {
  const abs = path.join(REPO_ROOT, rel);
  if (!fs.existsSync(abs)) {
    console.error(`[verify-no-psig-literals] file not found: ${rel}`);
    process.exit(1);
  }
  const content = fs.readFileSync(abs, "utf8").split("\n");
  content.forEach((line, i) => {
    const matches = line.match(PSIG_LITERAL);
    if (matches) {
      violations.push({ file: rel, line: i + 1, text: line.trim(), matches });
    }
  });
}

const bar = "=".repeat(80);
console.log(`\n[verify-no-psig-literals] scanned ${WAVE_1_ALLOWLIST.length} Wave 1 files`);

if (violations.length === 0) {
  console.log(`[verify-no-psig-literals] OK — 0 numeric PSIG literals; every pressure renders through fmtPsigBubble/fmtPsigDew or dataset props.\n`);
  process.exit(0);
}

console.error(bar);
console.error(`[verify-no-psig-literals] FAIL — ${violations.length} numeric PSIG literal${violations.length === 1 ? "" : "s"} in Wave 1 source files.`);
console.error(`[verify-no-psig-literals] Every saturation pressure must render through fmtPsigBubble / fmtPsigDew.`);
console.error(bar);
for (const v of violations) {
  console.error(`  ${v.file}:${v.line}`);
  console.error(`    matches: ${v.matches.join(", ")}`);
  const trimmed = v.text.length > 120 ? v.text.slice(0, 117) + "..." : v.text;
  console.error(`    line:    ${trimmed}`);
}
console.error(bar);
process.exit(1);
