#!/usr/bin/env node
/**
 * Compute the per-refrigerant GWP object (headline/ar4/ar5/ar6 with source keys)
 * from data/reference/gwp-reference.json + the compositions in
 * refrigerants.config.json, using the file's documented method:
 *   blend value = Σ massFraction × constituent GWP, "<1" counted as 1, a column
 *   present only when every constituent has it, rounded half-up to an integer.
 *
 * This is the single source of truth the generator uses (mirrored in
 * generate-refrigerant-data.{mjs,py}). Run standalone to verify against the
 * file's blend values + EPA fixtures and to surface any composition mismatch.
 *
 * Usage: node scripts/reference/compute_gwp.mjs            (verify + report)
 *        node scripts/reference/compute_gwp.mjs --emit     (print slug→gwp JSON)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const REF = JSON.parse(fs.readFileSync(path.join(ROOT, "data/reference/gwp-reference.json"), "utf8"));
const CONFIG = JSON.parse(fs.readFileSync(path.join(ROOT, "data/refrigerants.config.json"), "utf8"));

// slug → reference component id (pure fluids). Blends resolve via composition.
export const SLUG_TO_COMPONENT = {
  "r-11": "R-11", "r-12": "R-12", "r-13": "R-13", "r-22": "R-22", "r-23": "R-23",
  "r-32": "R-32", "r-115": "R-115", "r-123": "R-123", "r-124": "R-124", "r-125": "R-125",
  "r-134a": "R-134a", "r-143a": "R-143a", "r-152a": "R-152a", "r-218": "R-218",
  "r-227ea": "R-227ea", "r-236ea": "R-236ea", "r-236fa": "R-236fa", "r-245fa": "R-245fa",
  "r-365mfc": "R-365mfc", "r-c318": "R-C318", "r-290": "R-290", "r-600": "R-600",
  "r-600a": "R-600a", "r-601a": "R-601a", "r-1150": "R-1150", "r-1270": "R-1270",
  "r-717": "R-717", "r-744": "R-744", "r-1234yf": "R-1234yf",
  "r-1234ze": "R-1234ze(E)", "r-1234ze-e": "R-1234ze(E)", "r-1234ze-z": "R-1234ze(Z)",
  "r-1233zd-e": "R-1233zd(E)", "r-1224yd-z": "R-1224yd(Z)", "r-1336mzz-z": "R-1336mzz(Z)",
  "r-1130-e": "R-1130(E)",
};

// composition component-label → reference component id (aliases where the config
// label differs from the reference id — e.g. R-455A lists "CO2" for R-744).
const COMPONENT_ALIAS = { CO2: "R-744", "R-744": "R-744" };

function componentId(label) {
  if (COMPONENT_ALIAS[label]) return COMPONENT_ALIAS[label];
  return label; // reference already uses R-125, R-1234ze(E), etc.
}

const num = (v) => (v == null ? null : v === "<1" ? 1 : Number(v));
const roundHalfUp = (x) => Math.floor(x + 0.5); // x ≥ 0 for all GWP

/** Blend value for one column, or null if any constituent lacks it. */
function blendColumn(comp, col) {
  let total = 0;
  for (const { component, massFraction } of comp) {
    const c = REF.components[componentId(component)];
    if (!c) throw new Error(`no reference component for "${component}"`);
    const cell = c[col];
    if (cell == null) return null;
    total += massFraction * num(cell.value);
  }
  return roundHalfUp(total);
}

/** Build the gwp object for a slug. */
export function gwpForSlug(slug, cfg) {
  const comp = cfg.composition || [];
  if (comp.length === 0) {
    const id = SLUG_TO_COMPONENT[slug];
    if (!id) throw new Error(`no component mapping for pure slug ${slug}`);
    const c = REF.components[id];
    if (!c) throw new Error(`no reference component ${id} for ${slug}`);
    const g = { headline: c.headline, ar4: c.ar4, ar5: c.ar5, ar6: c.ar6 };
    if (c.note) g.note = c.note;
    return g;
  }
  // blend
  const g = {};
  for (const col of ["headline", "ar4", "ar5", "ar6"]) {
    const v = blendColumn(comp, col);
    if (v == null) { g[col] = null; continue; }
    const source = col === "headline" ? "cfr_84_64b" : `ipcc_${col}`;
    g[col] = { value: v, source };
  }
  return g;
}

// slug → blend id in the reference file (for verification)
function refBlendId(slug) {
  const id = slug.toUpperCase();
  return REF.blends[id] ? id : null;
}

function run() {
  const emit = process.argv.includes("--emit");
  const out = {};
  const problems = [];
  const compositionNotes = [];
  for (const slug of Object.keys(CONFIG)) {
    const cfg = CONFIG[slug];
    const g = gwpForSlug(slug, cfg);
    out[slug] = g;
    // verify blends against the reference file's precomputed blend values
    if ((cfg.composition || []).length > 0) {
      const bid = refBlendId(slug);
      if (bid) {
        const ref = REF.blends[bid];
        for (const col of ["headline", "ar4", "ar5", "ar6"]) {
          const mine = g[col] == null ? null : g[col].value;
          const theirs = ref[col] == null ? null : ref[col].value;
          if (mine !== theirs) problems.push(`${slug} ${col}: computed ${mine} vs file ${theirs}`);
        }
      }
    }
  }
  // EPA fixtures (17)
  const fixtureResults = [];
  for (const [bid, epa] of Object.entries(REF.epaPublishedBlendValues)) {
    const slug = bid.toLowerCase();
    const g = out[slug];
    const got = g && g.headline ? g.headline.value : null;
    fixtureResults.push(`${bid}: computed ${got} vs EPA ${epa} ${got === epa ? "OK" : "*** MISMATCH ***"}`);
    if (got !== epa) problems.push(`EPA ${bid}: ${got} vs ${epa}`);
  }
  // every refrigerant has a headline
  for (const slug of Object.keys(out)) {
    if (!out[slug].headline || out[slug].headline.value == null) problems.push(`${slug}: no headline`);
  }

  if (emit) { console.log(JSON.stringify(out, null, 1)); return; }
  console.log("=== 17 EPA fixtures ===");
  fixtureResults.forEach((r) => console.log("  " + r));
  console.log("\n=== problems ===");
  console.log(problems.length ? problems.map((p) => "  " + p).join("\n") : "  none — all blends + fixtures + pures match");
  compositionNotes.forEach((n) => console.log(n));
}

if (import.meta.url === `file://${process.argv[1]}`) run();
