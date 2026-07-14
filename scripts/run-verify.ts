#!/usr/bin/env node
/**
 * Build-time refrigerant data verifier.
 *
 * Runs as a `prebuild` hook (see package.json). Loads the refrigerant dataset
 * (which itself parses through Zod) and then runs the anchor-and-invariant check
 * from `.claude/skills/hvacptcharts/verify.ts`. A failed verification blocks the
 * build — this is the structural last line of defense against ever shipping
 * fabricated PT data.
 */
import { refrigerants } from "@/data/refrigerants";
import { verifyAgainstAnchors } from "../.claude/skills/hvacptcharts/verify";

const { ok, errors } = verifyAgainstAnchors(refrigerants);

if (!ok) {
  console.error(`\nx  Refrigerant data verification FAILED (${errors.length} issue${errors.length === 1 ? "" : "s"}):\n`);
  for (const e of errors) console.error(`  - ${e}`);
  console.error("\nFix data/refrigerants.config.json or data/manufacturer-blends/*.json, then re-run `pnpm run generate-data`.\nDirect edits to data/refrigerants.json are a code smell.\n");
  process.exit(1);
}

const anchorCount = 10;
console.log(`OK  Verified ${refrigerants.length} refrigerants against ${anchorCount} anchor values. All within +/-5% tolerance. No saturation pressure exceeds critical.`);

// ─────────────────────────────────────────────────────────────────────────
// Datasheet anchors — Wave 1.6b
//
// For fluids whose PT data comes from a manufacturer datasheet at native
// resolution (ptTable populated), verify specific pressure-indexed anchor
// points against the published table. Any drift >0.5°F between the
// dataset row and the published datasheet value fails the build. This
// prevents silent transcription errors from ever shipping — the ISCEON
// MO99 and Solstice N40 tables are the primary sources and the site's
// dataset must reproduce them exactly.
// ─────────────────────────────────────────────────────────────────────────

interface DatasheetAnchor {
  slug: string;
  psig: number;
  bubbleF: number;
  dewF: number;
  source: string;
}

const DATASHEET_ANCHORS: DatasheetAnchor[] = [
  // Honeywell Solstice® N40 (R-448A) Technical Data Sheet, Publication 3820,
  // September 2019, page 2. Values read directly from the published table.
  { slug: "r-448a", psig: 40, bubbleF: 5.5, dewF: 16.0, source: "Honeywell 3820 (Sep 2019)" },
  { slug: "r-448a", psig: 121, bubbleF: 56.2, dewF: 65.9, source: "Honeywell 3820 (Sep 2019)" },
  { slug: "r-448a", psig: 450, bubbleF: 146.9, dewF: 153.0, source: "Honeywell 3820 (Sep 2019)" },
  // DuPont ISCEON® MO99™ (R-438A) Pressure-Temperature Chart, Publication
  // K-22220-1, September 2009. Values read directly from the published
  // table (also reproduced as Appendix B of Chemours C-10862, Aug 2016).
  { slug: "r-438a", psig: 10, bubbleF: -23.4, dewF: -12.6, source: "DuPont K-22220-1 (Sep 2009)" },
  { slug: "r-438a", psig: 40, bubbleF: 13.6, dewF: 23.5, source: "DuPont K-22220-1 (Sep 2009)" },
  { slug: "r-438a", psig: 200, bubbleF: 96.5, dewF: 104.2, source: "DuPont K-22220-1 (Sep 2009)" },
];

const DATASHEET_TOLERANCE_F = 0.5;
const datasheetErrors: string[] = [];

for (const a of DATASHEET_ANCHORS) {
  const r = refrigerants.find((x) => x.slug === a.slug);
  if (!r) {
    datasheetErrors.push(`${a.slug} not found in dataset`);
    continue;
  }
  const table = r.ptTable;
  if (!table || table.length === 0) {
    datasheetErrors.push(`${a.slug}: ptTable empty; expected datasheet transcription per Wave 1.6b`);
    continue;
  }
  const row = table.find((t) => Math.abs(t.psig - a.psig) < 0.001);
  if (!row) {
    datasheetErrors.push(`${a.slug}: no ptTable row at ${a.psig} psig (${a.source} anchor)`);
    continue;
  }
  const bubbleDelta = Math.abs(row.bubbleF - a.bubbleF);
  const dewDelta = Math.abs(row.dewF - a.dewF);
  if (bubbleDelta > DATASHEET_TOLERANCE_F) {
    datasheetErrors.push(
      `${a.slug} @ ${a.psig} psig: bubble = ${row.bubbleF.toFixed(1)}°F, published = ${a.bubbleF.toFixed(1)}°F (drift ${bubbleDelta.toFixed(2)}°F > ${DATASHEET_TOLERANCE_F}°F) — ${a.source}`,
    );
  }
  if (dewDelta > DATASHEET_TOLERANCE_F) {
    datasheetErrors.push(
      `${a.slug} @ ${a.psig} psig: dew = ${row.dewF.toFixed(1)}°F, published = ${a.dewF.toFixed(1)}°F (drift ${dewDelta.toFixed(2)}°F > ${DATASHEET_TOLERANCE_F}°F) — ${a.source}`,
    );
  }
}

if (datasheetErrors.length > 0) {
  console.error(`\nx  Datasheet anchor verification FAILED (${datasheetErrors.length} issue${datasheetErrors.length === 1 ? "" : "s"}):\n`);
  for (const e of datasheetErrors) console.error(`  - ${e}`);
  console.error("\nRe-transcribe the affected row(s) in data/manufacturer-blends/{slug}.json from the source datasheet PDF and re-run `pnpm run generate-data`.\n");
  process.exit(1);
}

console.log(`OK  Verified ${DATASHEET_ANCHORS.length} datasheet anchor points across ${new Set(DATASHEET_ANCHORS.map((a) => a.slug)).size} fluids. All within +/-${DATASHEET_TOLERANCE_F}°F of published values.`);
