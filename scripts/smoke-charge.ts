#!/usr/bin/env tsx
/**
 * Smoke test for src/lib/charge.ts line-set adjustment.
 *
 * Asserts that:
 *   - R-410A 3/8" 30 ft over standard adds ~17 oz
 *   - R-22 same scenario adds more (denser liquid)
 *   - R-290 (propane) same scenario adds much less (lower density)
 *   - Vertical rise > 50 ft triggers warning
 *   - Negative delta (line shorter than standard) returns negative adjustment
 */
import { adjustCharge } from "../src/lib/charge";

interface Scenario {
  name: string;
  args: Parameters<typeof adjustCharge>[0];
  check: (out: ReturnType<typeof adjustCharge>) => string | null; // null = pass; string = fail reason
}

const SCENARIOS: Scenario[] = [
  {
    name: "R-410A 3/8\" 30 ft over standard",
    args: { slug: "r-410a", nameplateChargeLb: 8.5, standardLineLengthFt: 15, actualLineLengthFt: 45, liquidLineOD: "3/8" },
    check: (o) => Math.abs(o.adjustmentOz - 16.8) < 0.5 ? null : `expected ~16.8 oz, got ${o.adjustmentOz.toFixed(2)}`,
  },
  {
    name: "R-22 3/8\" same scenario (denser liquid)",
    args: { slug: "r-22", nameplateChargeLb: 8.5, standardLineLengthFt: 15, actualLineLengthFt: 45, liquidLineOD: "3/8" },
    check: (o) => o.adjustmentOz > 18 ? null : `expected >18 oz (denser than R-410A), got ${o.adjustmentOz.toFixed(2)}`,
  },
  {
    name: "R-290 propane 3/8\" same scenario (much lower density)",
    args: { slug: "r-290", nameplateChargeLb: 8.5, standardLineLengthFt: 15, actualLineLengthFt: 45, liquidLineOD: "3/8" },
    check: (o) => o.adjustmentOz < 10 ? null : `expected <10 oz (much less than R-410A), got ${o.adjustmentOz.toFixed(2)}`,
  },
  {
    name: "Vertical rise warning",
    args: { slug: "r-410a", nameplateChargeLb: 8.5, standardLineLengthFt: 15, actualLineLengthFt: 30, liquidLineOD: "3/8", verticalRiseFt: 60 },
    check: (o) => o.warnings.some((w) => w.includes("Vertical rise of 60 ft")) ? null : "expected vertical-rise warning",
  },
  {
    name: "Line shorter than standard returns negative adjustment",
    args: { slug: "r-410a", nameplateChargeLb: 8.5, standardLineLengthFt: 25, actualLineLengthFt: 10, liquidLineOD: "3/8" },
    check: (o) => o.adjustmentOz < 0 ? null : `expected negative adjustment, got ${o.adjustmentOz.toFixed(2)}`,
  },
  {
    name: "Unknown refrigerant warns and uses baseline",
    args: { slug: "r-bogus" as string, nameplateChargeLb: 8.5, standardLineLengthFt: 15, actualLineLengthFt: 30, liquidLineOD: "3/8" },
    check: (o) => o.warnings.some((w) => w.includes("Unknown refrigerant")) && o.refrigerantFactor === 1.0 ? null : "expected unknown-refrigerant warning",
  },
  {
    name: "1/2\" liquid line has larger per-foot than 3/8\"",
    args: { slug: "r-410a", nameplateChargeLb: 8.5, standardLineLengthFt: 15, actualLineLengthFt: 45, liquidLineOD: "1/2" },
    check: (o) => o.baseOzPerFt > 1.0 ? null : `expected >1.0 oz/ft for 1/2", got ${o.baseOzPerFt}`,
  },
];

let failures = 0;
for (const s of SCENARIOS) {
  const out = adjustCharge(s.args);
  const err = s.check(out);
  const status = err === null ? "OK   " : "FAIL ";
  console.log(`${status} ${s.name}`);
  console.log(`        adj=${out.adjustmentOz.toFixed(2)}oz total=${out.totalChargeLb.toFixed(2)}lb perFt=${out.adjustedOzPerFt.toFixed(2)} factor=${out.refrigerantFactor.toFixed(2)}`);
  if (err !== null) {
    console.log(`        ${err}`);
    failures++;
  }
}

if (failures > 0) {
  console.log(`\n${failures} scenario(s) failed.`);
  process.exit(1);
}
console.log(`\nAll ${SCENARIOS.length} scenarios passed.`);
