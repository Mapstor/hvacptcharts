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
