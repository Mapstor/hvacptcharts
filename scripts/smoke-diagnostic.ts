#!/usr/bin/env tsx
/**
 * Smoke test for src/lib/diagnostic.ts.
 *
 * Walks ~6 canonical scenarios and asserts the expected flag is present.
 * If a pattern doesn't fire, the diagnostic engine has drifted from
 * documented behavior in /superheat-subcooling-fundamentals/ and the
 * calculator FAQ.
 */
import { diagnose, type DiagnosticInputs } from "../src/lib/diagnostic";

interface Scenario {
  name: string;
  inputs: DiagnosticInputs;
  expectFlagLabel: string;
}

const SCENARIOS: Scenario[] = [
  {
    name: "R-410A TXV — undercharge fingerprint (high SH, low SC)",
    inputs: { slug: "r-410a", systemType: "txv-residential", ambientF: 95, returnAirF: 75, suctionPsig: 110, suctionLineF: 62, liquidPsig: 340, liquidLineF: 98 },
    expectFlagLabel: "Likely undercharge",
  },
  {
    name: "R-410A TXV — overcharge fingerprint (low SH, high SC)",
    inputs: { slug: "r-410a", systemType: "txv-residential", ambientF: 95, returnAirF: 75, suctionPsig: 145, suctionLineF: 53, liquidPsig: 450, liquidLineF: 110 },
    expectFlagLabel: "Likely overcharge",
  },
  {
    name: "R-410A TXV — restriction fingerprint (high SH, high SC)",
    inputs: { slug: "r-410a", systemType: "txv-residential", ambientF: 95, returnAirF: 75, suctionPsig: 100, suctionLineF: 65, liquidPsig: 450, liquidLineF: 100 },
    expectFlagLabel: "Likely restriction or low evaporator airflow",
  },
  {
    name: "R-410A TXV — negative SH (slugging)",
    inputs: { slug: "r-410a", systemType: "txv-residential", ambientF: 95, returnAirF: 75, suctionPsig: 145, suctionLineF: 45, liquidPsig: 400, liquidLineF: 100 },
    expectFlagLabel: "Negative superheat — slugging risk",
  },
  {
    name: "R-22 TXV — operating in spec",
    inputs: { slug: "r-22", systemType: "txv-residential", ambientF: 95, returnAirF: 75, suctionPsig: 70, suctionLineF: 52, liquidPsig: 260, liquidLineF: 110 },
    expectFlagLabel: "Operating within expected ranges",
  },
  {
    name: "R-410A TXV — very high condenser approach (heat rejection failure)",
    inputs: { slug: "r-410a", systemType: "txv-residential", ambientF: 95, returnAirF: 75, suctionPsig: 130, suctionLineF: 55, liquidPsig: 560, liquidLineF: 130 },
    expectFlagLabel: "Very high condenser approach — heat rejection failure",
  },
];

let failures = 0;
for (const s of SCENARIOS) {
  const result = diagnose(s.inputs);
  const labels = result.flags.map((f) => f.label);
  const hit = labels.includes(s.expectFlagLabel);
  const status = hit ? "OK   " : "FAIL ";
  console.log(`${status} ${s.name}`);
  console.log(`        SH=${result.derived.superheatF?.toFixed(1)} SC=${result.derived.subcoolingF?.toFixed(1)} CA=${result.derived.condenserApproachF?.toFixed(1)}`);
  console.log(`        flags: ${labels.join(" | ")}`);
  if (!hit) {
    console.log(`        EXPECTED: ${s.expectFlagLabel}`);
    failures++;
  }
}

if (failures > 0) {
  console.log(`\n${failures} scenario(s) failed.`);
  process.exit(1);
}
console.log(`\nAll ${SCENARIOS.length} scenarios passed.`);
