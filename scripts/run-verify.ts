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
import fs from "node:fs";
import path from "node:path";
import { refrigerants } from "@/data/refrigerants";
import { verifyAgainstAnchors } from "../.claude/skills/hvacptcharts/verify";
import { banner } from "./build-guard";

// First line: Node version + dataset size. A dataset that collapsed to a
// handful of fluids (or zero) must fail before any anchor check runs — anchors
// pass vacuously against an empty dataset.
banner("run-verify", refrigerants.length, 55, "refrigerants");

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
if (DATASHEET_ANCHORS.length === 0) {
  console.error("x  run-verify: DATASHEET_ANCHORS is empty — datasheet transcription would go unverified.");
  process.exit(1);
}
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

// ─────────────────────────────────────────────────────────────────────────
// Precomputed anchors — Task 4C (CoolProp 8.0.0 fluids)
//
// The six restored chiller/HTHP refrigerants (R-515B, R-515A, R-514A, R-450A,
// R-1336mzz(Z), R-1224yd(Z)) carry PT tables computed out-of-band with CoolProp
// 8.0.0 and stored in data/precomputed/coolprop8-pt.json. These anchors pin the
// converted site values (PSIG at ±0.05) and assert the physical invariants
// bubble ≥ dew and monotonically rising pressure with temperature.
// ─────────────────────────────────────────────────────────────────────────

interface PrecomputedAnchor {
  slug: string;
  tempF: number;
  side: "bubble" | "dew";
  psig: number;
  note?: string;
}

const PRECOMPUTED_ANCHORS: PrecomputedAnchor[] = [
  { slug: "r-515b", tempF: 40, side: "bubble", psig: 22.16 },
  { slug: "r-515a", tempF: 40, side: "bubble", psig: 22.14 },
  { slug: "r-514a", tempF: 100, side: "bubble", psig: 5.1, note: "19.79 psia" },
  { slug: "r-450a", tempF: 40, side: "bubble", psig: 29.8 },
  { slug: "r-450a", tempF: 40, side: "dew", psig: 28.85 },
  { slug: "r-1336mzz-z", tempF: 100, side: "bubble", psig: 2.48 },
  { slug: "r-1224yd-z", tempF: 100, side: "bubble", psig: 18.24 },
];
const PRECOMPUTED_TOLERANCE = 0.05;
const PRECOMPUTED_SLUGS = ["r-515b", "r-515a", "r-514a", "r-450a", "r-1336mzz-z", "r-1224yd-z"];
if (PRECOMPUTED_ANCHORS.length === 0 || PRECOMPUTED_SLUGS.length === 0) {
  console.error("x  run-verify: PRECOMPUTED_ANCHORS/SLUGS is empty — precomputed fluids would go unverified.");
  process.exit(1);
}

const precomputedErrors: string[] = [];

for (const a of PRECOMPUTED_ANCHORS) {
  const r = refrigerants.find((x) => x.slug === a.slug);
  if (!r) {
    precomputedErrors.push(`${a.slug} not found in dataset`);
    continue;
  }
  const row = r.ptChart.find((p) => p.tempF === a.tempF);
  if (!row) {
    precomputedErrors.push(`${a.slug}: no ptChart row at ${a.tempF}°F`);
    continue;
  }
  const got = a.side === "bubble" ? row.bubblePsig : row.dewPsig;
  const delta = Math.abs(got - a.psig);
  if (delta > PRECOMPUTED_TOLERANCE) {
    precomputedErrors.push(
      `${a.slug} @ ${a.tempF}°F ${a.side}: ${got} PSIG, expected ${a.psig} PSIG (drift ${delta.toFixed(3)} > ${PRECOMPUTED_TOLERANCE})`,
    );
  }
}

// Invariants for every precomputed table: bubble ≥ dew, and both curves rise
// monotonically with temperature.
for (const slug of PRECOMPUTED_SLUGS) {
  const r = refrigerants.find((x) => x.slug === slug);
  if (!r) {
    precomputedErrors.push(`${slug} not found in dataset`);
    continue;
  }
  if (r.ptChart.length === 0) {
    precomputedErrors.push(`${slug}: empty ptChart (expected precomputed table)`);
    continue;
  }
  const rows = [...r.ptChart].sort((x, y) => x.tempF - y.tempF);
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].bubblePsig < rows[i].dewPsig - 1e-6) {
      precomputedErrors.push(`${slug} @ ${rows[i].tempF}°F: bubble ${rows[i].bubblePsig} < dew ${rows[i].dewPsig}`);
    }
    if (i > 0) {
      if (rows[i].bubblePsig < rows[i - 1].bubblePsig - 1e-6) {
        precomputedErrors.push(`${slug}: bubble not rising at ${rows[i].tempF}°F (${rows[i - 1].bubblePsig} → ${rows[i].bubblePsig})`);
      }
      if (rows[i].dewPsig < rows[i - 1].dewPsig - 1e-6) {
        precomputedErrors.push(`${slug}: dew not rising at ${rows[i].tempF}°F (${rows[i - 1].dewPsig} → ${rows[i].dewPsig})`);
      }
    }
  }
}

if (precomputedErrors.length > 0) {
  console.error(`\nx  Precomputed anchor verification FAILED (${precomputedErrors.length} issue${precomputedErrors.length === 1 ? "" : "s"}):\n`);
  for (const e of precomputedErrors) console.error(`  - ${e}`);
  console.error("\nFix data/precomputed/coolprop8-pt.json or re-run the precomputed pipeline (scripts/generate-refrigerant-data.*).\n");
  process.exit(1);
}

console.log(`OK  Verified ${PRECOMPUTED_ANCHORS.length} precomputed anchor points + bubble≥dew / monotonic invariants across ${PRECOMPUTED_SLUGS.length} CoolProp 8.0.0 fluids. All within +/-${PRECOMPUTED_TOLERANCE} PSIG.`);

// ─────────────────────────────────────────────────────────────────────────
// GWP verification (task 7) — the generated gwp objects must reproduce
// data/reference/gwp-reference.json exactly: the 17 EPA-published blend
// headline values, every pure component's four columns, and a headline on
// every refrigerant.
// ─────────────────────────────────────────────────────────────────────────
interface GwpCellJson { value: number | "<1"; source: string }
interface GwpRefComponent { headline: GwpCellJson; ar4: GwpCellJson | null; ar5: GwpCellJson | null; ar6: GwpCellJson | null; note?: string }
interface GwpRefFile {
  components: Record<string, GwpRefComponent>;
  epaPublishedBlendValues: Record<string, number>;
}
const gwpRef = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "data", "reference", "gwp-reference.json"), "utf8"),
) as GwpRefFile;

// Pure slug → reference component id (blends verify via the EPA fixtures).
const GWP_SLUG_TO_COMPONENT: Record<string, string> = {
  "r-11": "R-11", "r-12": "R-12", "r-13": "R-13", "r-22": "R-22", "r-23": "R-23",
  "r-32": "R-32", "r-115": "R-115", "r-123": "R-123", "r-124": "R-124", "r-125": "R-125",
  "r-134a": "R-134a", "r-143a": "R-143a", "r-152a": "R-152a", "r-218": "R-218",
  "r-227ea": "R-227ea", "r-236ea": "R-236ea", "r-236fa": "R-236fa", "r-245fa": "R-245fa",
  "r-365mfc": "R-365mfc", "r-c318": "R-C318", "r-290": "R-290", "r-600": "R-600",
  "r-600a": "R-600a", "r-601a": "R-601a", "r-1150": "R-1150", "r-1270": "R-1270",
  "r-717": "R-717", "r-744": "R-744", "r-1234yf": "R-1234yf",
  "r-1234ze": "R-1234ze(E)", "r-1234ze-e": "R-1234ze(E)", "r-1234ze-z": "R-1234ze(Z)",
  "r-1233zd-e": "R-1233zd(E)", "r-1224yd-z": "R-1224yd(Z)", "r-1336mzz-z": "R-1336mzz(Z)",
};
const cellEq = (a: GwpCellJson | null, b: GwpCellJson | null) =>
  (a == null && b == null) || (a != null && b != null && a.value === b.value && a.source === b.source);

const gwpErrors: string[] = [];
// 1. every refrigerant has a headline value
for (const r of refrigerants) {
  if (r.environmental.gwp?.headline?.value == null) gwpErrors.push(`${r.slug}: missing GWP headline`);
}
// 2. the 17 EPA-published blend headline values match exactly
for (const [bid, epa] of Object.entries(gwpRef.epaPublishedBlendValues)) {
  const r = refrigerants.find((x) => x.slug === bid.toLowerCase());
  if (!r) { gwpErrors.push(`EPA fixture ${bid}: no refrigerant with that slug`); continue; }
  const got = r.environmental.gwp.headline.value;
  if (got !== epa) gwpErrors.push(`EPA blend ${bid}: headline ${got} != published ${epa}`);
}
// 3. every pure component matches the reference file (all four columns + sources)
for (const r of refrigerants) {
  if (r.composition.length > 0) continue;
  const id = GWP_SLUG_TO_COMPONENT[r.slug];
  const c = id ? gwpRef.components[id] : undefined;
  if (!c) { gwpErrors.push(`${r.slug}: no reference component (${id ?? "unmapped"})`); continue; }
  const g = r.environmental.gwp;
  for (const col of ["headline", "ar4", "ar5", "ar6"] as const) {
    if (!cellEq(g[col] as GwpCellJson | null, c[col])) {
      gwpErrors.push(`${r.slug} ${col}: ${JSON.stringify(g[col])} != ${JSON.stringify(c[col])}`);
    }
  }
}
if (gwpErrors.length > 0) {
  console.error(`\nx  GWP verification FAILED (${gwpErrors.length} issue${gwpErrors.length === 1 ? "" : "s"}):\n`);
  for (const e of gwpErrors) console.error(`  - ${e}`);
  console.error("\nFix data/reference/gwp-reference.json or the composition, then re-run `pnpm run generate-data`.\n");
  process.exit(1);
}
console.log(`OK  Verified GWP: 17 EPA-published blend values, ${Object.keys(GWP_SLUG_TO_COMPONENT).length} pure-component mappings, and a headline on all ${refrigerants.length} refrigerants.`);
