/**
 * verify-diagnostics — build-time assertions for the diagnostic logic.
 *
 * Guards two invariants that regressed in the field:
 *  1. Range checks are INCLUSIVE and compare the value ROUNDED to the displayed
 *     precision. A superheat shown as "15.0°F" must read as inside an 8–15°F
 *     target, not "above" it (the boundary bug). Cases: 7.9, 8.0, 15.0, 15.1,
 *     plus a raw value (15.04) that displays as 15.0.
 *  2. Each SH×SC fault pattern classifies to the expected fingerprint, from the
 *     single shared fault-pattern module used by both the combined calculator
 *     and the system-pressure diagnostic.
 *
 * Run via tsx (pre-build gate). Exits non-zero on any failed assertion.
 */
import {
  classifyShSc,
  inTargetRange,
  round1,
  GENERIC_SH_SC_TARGETS,
  RESIDENTIAL_CONDENSER_APPROACH_F,
} from "@/lib/fault-patterns";
import { diagnose } from "@/lib/diagnostic";
import { getSaturationTempAtPsigF } from "@/data/refrigerants";

let passed = 0;
const failures: string[] = [];

function assert(cond: boolean, msg: string) {
  if (cond) passed++;
  else failures.push(msg);
}

console.log(`[verify-diagnostics] node ${process.version}`);

// ── 1. Boundary cases against a TXV superheat target of 8–15°F ──────────────
const TXV_SH: [number, number] = [8, 15];
const boundary: Array<[number, boolean, string]> = [
  [7.9, false, "below the low bound"],
  [8.0, true, "on the low bound (inclusive)"],
  [15.0, true, "on the high bound (inclusive)"],
  [15.1, false, "above the high bound"],
  // Raw values that DISPLAY at a boundary must be treated as that boundary:
  [15.04, true, "raw 15.04 displays 15.0 — inside 8–15"],
  [7.96, true, "raw 7.96 displays 8.0 — inside 8–15"],
  [7.94, false, "raw 7.94 displays 7.9 — below 8"],
];
for (const [value, expected, why] of boundary) {
  const got = inTargetRange(value, TXV_SH);
  assert(
    got === expected,
    `boundary: inTargetRange(${value}, [8,15]) = ${got}, expected ${expected} (${why}); displayed=${round1(value).toFixed(1)}`,
  );
  console.log(`  SH ${round1(value).toFixed(1)}°F (raw ${value}) vs 8–15 → ${got ? "in range" : "out of range"}  [${expected === got ? "ok" : "FAIL"}]`);
}

// ── 2. One case per SH×SC fault pattern (generic envelope: SH 8–25, SC 3–15) ─
const patternCases: Array<{ sh: number; sc: number; id: string; label: string }> = [
  { sh: 15, sc: 10, id: "normal", label: "both in target" },
  { sh: 5, sc: 18, id: "overcharge", label: "low SH + high SC" },
  { sh: 30, sc: 1, id: "undercharge", label: "high SH + low SC" },
  { sh: 30, sc: 18, id: "restriction", label: "high SH + high SC" },
  { sh: 5, sc: 1, id: "airflow-metering", label: "low SH + low SC" },
  { sh: -2, sc: 10, id: "slugging-alarm", label: "negative SH" },
  { sh: 30, sc: 10, id: "ambiguous", label: "one out, one in" },
];
for (const c of patternCases) {
  const p = classifyShSc(c.sh, c.sc, GENERIC_SH_SC_TARGETS);
  assert(p.id === c.id, `pattern: classifyShSc(${c.sh}, ${c.sc}) = "${p.id}", expected "${c.id}" (${c.label})`);
  console.log(`  SH ${c.sh} / SC ${c.sc} → ${p.id}  [${p.id === c.id ? "ok" : "FAIL"}]`);
}

// ── 3. End-to-end: the reported boundary bug through diagnose() ─────────────
// R-410A TXV: build inputs so superheat is raw 15.04 (displays 15.0). It must NOT
// be flagged "above target range 8-15" and must read as within range.
{
  const suctionSat = getSaturationTempAtPsigF("r-410a", 130, "dew");
  const liquidSat = getSaturationTempAtPsigF("r-410a", 380, "bubble");
  assert(suctionSat !== null && liquidSat !== null, "e2e: R-410A saturation lookups returned data");
  if (suctionSat !== null && liquidSat !== null) {
    const out = diagnose({
      slug: "r-410a",
      systemType: "txv-residential",
      suctionPsig: 130,
      suctionLineF: suctionSat + 15.04, // raw SH 15.04 → displays 15.0
      liquidPsig: 380,
      liquidLineF: liquidSat - 10, // SC 10 (in 8–12)
      ambientF: liquidSat - 20, // condenser approach 20 (in 15–25)
      returnAirF: 75,
    });
    const shFlagged = out.flags.some((f) => f.evidence.some((e) => /superheat/i.test(e) && /above target/i.test(e)));
    assert(!shFlagged, `e2e: superheat displaying 15.0°F was wrongly flagged "above target" — flags: ${out.flags.map((f) => f.label).join(", ")}`);
    assert(round1(out.derived.superheatF ?? -1) === 15.0, `e2e: derived superheat should display 15.0, got ${out.derived.superheatF}`);
    const ok = out.flags.some((f) => f.label === "Operating within expected ranges");
    assert(ok, `e2e: SH 15.0 / SC 10 / approach 20 should read as operating within ranges — flags: ${out.flags.map((f) => f.label).join(", ")}`);
    console.log(`  diagnose R-410A: SH ${out.derived.superheatF}°F, SC ${out.derived.subcoolingF}°F, approach ${out.derived.condenserApproachF}°F → ${out.flags.map((f) => f.label).join("; ")}`);
  }
}

// ── 4. Shared condenser-approach constant is the residential 15–25°F target ──
assert(
  RESIDENTIAL_CONDENSER_APPROACH_F[0] === 15 && RESIDENTIAL_CONDENSER_APPROACH_F[1] === 25,
  `approach: RESIDENTIAL_CONDENSER_APPROACH_F should be [15,25], got [${RESIDENTIAL_CONDENSER_APPROACH_F.join(",")}]`,
);

// ── 5. Evaporator approach direction (B1): HIGH = low airflow / starvation;
//        LOW = high airflow / overcharge. Both must fire the right flag. ──────
{
  // HIGH approach: suction sat low, return air high (return − suctionSat large).
  const outHigh = diagnose({
    slug: "r-410a", systemType: "txv-residential",
    suctionPsig: 100, suctionLineF: getSaturationTempAtPsigF("r-410a", 100, "dew")! + 12,
    liquidPsig: 400, liquidLineF: getSaturationTempAtPsigF("r-410a", 400, "bubble")! - 10,
    ambientF: 95, returnAirF: 85,
  });
  const eaHigh = outHigh.derived.evaporatorApproachF ?? 0;
  assert(eaHigh > 40, `evap approach HIGH case: expected >40°F, got ${eaHigh}`);
  assert(outHigh.flags.some((f) => /High evaporator approach/i.test(f.label)),
    `evap approach HIGH should flag low-airflow/starvation — flags: ${outHigh.flags.map((f) => f.label).join(", ")}`);
  console.log(`  evap approach HIGH ${eaHigh.toFixed(1)}°F → ${outHigh.flags.some((f) => /High evaporator approach/i.test(f.label)) ? "flagged" : "MISSED"}`);

  // LOW approach: suction sat high relative to return air.
  const outLow = diagnose({
    slug: "r-410a", systemType: "txv-residential",
    suctionPsig: 145, suctionLineF: getSaturationTempAtPsigF("r-410a", 145, "dew")! + 10,
    liquidPsig: 400, liquidLineF: getSaturationTempAtPsigF("r-410a", 400, "bubble")! - 10,
    ambientF: 95, returnAirF: 60,
  });
  const eaLow = outLow.derived.evaporatorApproachF ?? 99;
  assert(eaLow < 20, `evap approach LOW case: expected <20°F, got ${eaLow}`);
  assert(outLow.flags.some((f) => /Low evaporator approach/i.test(f.label)),
    `evap approach LOW should flag high-airflow/overcharge — flags: ${outLow.flags.map((f) => f.label).join(", ")}`);
  console.log(`  evap approach LOW ${eaLow.toFixed(1)}°F → ${outLow.flags.some((f) => /Low evaporator approach/i.test(f.label)) ? "flagged" : "MISSED"}`);
}

// ── 6. Condenser approach below zero (B2): flag the reading-check alarm. ──────
{
  const out = diagnose({
    slug: "r-410a", systemType: "txv-residential",
    suctionPsig: 130, suctionLineF: getSaturationTempAtPsigF("r-410a", 130, "dew")! + 12,
    liquidPsig: 350, liquidLineF: getSaturationTempAtPsigF("r-410a", 350, "bubble")! - 5,
    ambientF: 120, returnAirF: 75,
  });
  const ca = out.derived.condenserApproachF ?? 0;
  assert(ca < 0, `condenser approach <0 case: expected negative, got ${ca}`);
  assert(out.flags.some((f) => /condensing saturation below outdoor air/i.test(f.label)),
    `condenser approach <0 should flag the reading-check alarm — flags: ${out.flags.map((f) => f.label).join(", ")}`);
  console.log(`  condenser approach ${ca.toFixed(1)}°F (<0) → ${out.flags.some((f) => /below outdoor air/i.test(f.label)) ? "flagged" : "MISSED"}`);
}

if (failures.length) {
  console.error(`\n[verify-diagnostics] FAIL — ${failures.length} assertion(s):`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log(`\n[verify-diagnostics] OK — ${passed} assertions passed (boundary cases 7.9/8.0/15.0/15.1, all fault patterns, e2e diagnose, approach constant).`);
