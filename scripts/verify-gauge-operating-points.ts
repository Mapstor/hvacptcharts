#!/usr/bin/env node
/**
 * Build-time validator for src/data/gauge-operating-points.ts.
 *
 * Fails the build if any entry violates the SUPPORTED predicate, or if
 * either temperature is outside the fluid's ptTable range. Both
 * consumers of the constants — the /what-pressure-should-{slug}/ answer
 * copy and the SystemGaugesDiagram — read the same GAUGE_OPERATING_POINTS
 * struct, so a mistake here would break the whole what-pressure surface
 * area silently. Fail fast at build.
 */

import {
  GAUGE_OPERATING_POINTS,
  isGaugeDiagramSupported,
} from "../src/data/gauge-operating-points";
import { getRefrigerant, getPressureAtTempF } from "../src/data/refrigerants";

let hadError = false;
const entries = Object.entries(GAUGE_OPERATING_POINTS);
console.log(
  `\n[verify-gauge-operating-points] validating ${entries.length} entries`,
);

for (const [slug, pt] of entries) {
  const r = getRefrigerant(slug);
  if (!r) {
    console.error(`  ✗ ${slug}: refrigerant not found in dataset`);
    hadError = true;
    continue;
  }
  if (!isGaugeDiagramSupported(r, pt.evapTempF, pt.condTempF)) {
    console.error(
      `  ✗ ${slug}: SUPPORTED predicate failed (safetyClass=${r.safetyClass}, criticalF=${r.physical.critical.tempF})`,
    );
    hadError = true;
    continue;
  }
  const evapSat = getPressureAtTempF(slug, pt.evapTempF);
  const condSat = getPressureAtTempF(slug, pt.condTempF);
  if (!evapSat || !condSat) {
    console.error(
      `  ✗ ${slug}: ptTable lookup returned null at evap=${pt.evapTempF}°F or cond=${pt.condTempF}°F`,
    );
    hadError = true;
    continue;
  }
  console.log(
    `  ✓ ${slug.padEnd(10)} — evap ${String(pt.evapTempF).padStart(3)}°F → dew ${evapSat.dew.toFixed(1).padStart(6)} PSIG; cond ${String(pt.condTempF).padStart(3)}°F → bubble ${condSat.bubble.toFixed(1).padStart(6)} PSIG`,
  );
}

if (hadError) {
  console.error(`\n[verify-gauge-operating-points] FAIL`);
  process.exit(1);
}
console.log(`[verify-gauge-operating-points] OK — all entries valid\n`);
