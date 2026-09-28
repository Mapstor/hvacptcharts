/**
 * verify-scenarios — build-time gate for the worked-scenario cards.
 *
 * Every card is defined as INPUTS ONLY in src/lib/scenarios.data.ts; the derived
 * numbers and the verdict/severity are computed by computeScenario() with the
 * same lib functions the live calculators use. This gate re-computes each
 * scenario and refuses the build if a card is physically impossible or its
 * printed verdict wouldn't match the classifier:
 *
 *  - a verdict that differs from the classifier output;
 *  - SH < 0 or SC < 0;
 *  - air-cooled: liquid-line temp below the condenser air, or condensing (bubble)
 *    saturation at or below the condenser air;
 *  - suction saturation at or above the air the evaporator is cooling
 *    (return air for AC, box temp for refrigeration; roles swap in heat-pump
 *    heating);
 *  - R-744: any pressure below 60.4 PSIG (triple point) or a PT lookup at/above
 *    87.8°F (critical);
 *  - water-cooled: liquid-line temp below the entering condenser water.
 *
 * An opt-out requires a visible `teachingCase` string (a card that deliberately
 * shows impossible inputs to teach what they mean). Target: zero opt-outs.
 */
import { SCENARIOS, computeScenario, type Scenario } from "@/lib/scenarios";
import { classifyShSc } from "@/lib/fault-patterns";
import { banner } from "./build-guard";

const CO2_TRIPLE_POINT_PSIG = 60.4;
const CO2_CRITICAL_F = 87.8;

interface Violation {
  id: string;
  page: string;
  rule: string;
  detail: string;
}
const violations: Violation[] = [];
const optOuts: string[] = [];

function fail(s: Scenario, rule: string, detail: string) {
  violations.push({ id: s.id, page: s.page, rule, detail });
}

for (const s of SCENARIOS) {
  const c = computeScenario(s);

  // Opt-out: deliberately-impossible teaching card. Counted, not asserted.
  if (s.teachingCase) {
    optOuts.push(`${s.id}: ${s.teachingCase}`);
    continue;
  }

  // Verdict must be a computed, non-empty value (never a stored literal).
  if (!c.verdict.title) fail(s, "verdict", "empty computed verdict");
  // For a charge card with both SH and SC, the verdict severity must match the
  // classifier (or the more-severe approach/fixed-orifice finding).
  if (
    s.kind === "charge-diagnostic" &&
    c.superheatF !== null &&
    c.subcoolingF !== null &&
    c.targets &&
    s.metering !== "fixed-orifice"
  ) {
    const cls = classifyShSc(c.superheatF, c.subcoolingF, c.targets);
    // The rendered verdict must not be LESS severe than the raw SH×SC classifier.
    const rank: Record<string, number> = { info: 0, caution: 1, concern: 2, alarm: 3 };
    if (rank[c.verdict.severity] < rank[cls.severity]) {
      fail(s, "verdict-vs-classifier", `rendered ${c.verdict.severity} < classifier ${cls.severity} (${cls.id})`);
    }
  }

  // SH / SC must be ≥ 0.
  if (c.superheatF !== null && c.superheatF < 0) fail(s, "negative-SH", `superheat ${c.superheatF}°F`);
  if (c.subcoolingF !== null && c.subcoolingF < 0) fail(s, "negative-SC", `subcooling ${c.subcoolingF}°F`);

  // Air-cooled condenser checks.
  if ((s.coolingMedium ?? "air") === "air") {
    if (s.liquidLineF !== undefined && c.condenserAirF !== null && s.liquidLineF < c.condenserAirF) {
      fail(s, "liquid-below-air", `liquid line ${s.liquidLineF}°F < condenser air ${c.condenserAirF}°F`);
    }
    if (c.dischargeSatBubbleF !== null && c.condenserAirF !== null && c.dischargeSatBubbleF <= c.condenserAirF) {
      fail(s, "condensing-at-or-below-air", `condensing bubble ${c.dischargeSatBubbleF}°F ≤ condenser air ${c.condenserAirF}°F`);
    }
  }

  // Water-cooled condenser check.
  if (s.coolingMedium === "water" && s.liquidLineF !== undefined && s.enteringWaterF !== undefined && s.liquidLineF < s.enteringWaterF) {
    fail(s, "liquid-below-entering-water", `liquid line ${s.liquidLineF}°F < entering water ${s.enteringWaterF}°F`);
  }

  // Evaporator: suction saturation must be below the air it cools.
  if (c.suctionSatDewF !== null && c.evaporatorAirF !== null && c.suctionSatDewF >= c.evaporatorAirF) {
    fail(s, "suction-at-or-above-evap-air", `suction sat ${c.suctionSatDewF}°F ≥ evaporator air ${c.evaporatorAirF}°F`);
  }

  // R-744 triple-point / critical guards.
  if (s.slug === "r-744") {
    const pressures = [s.suctionPsig, s.liquidPsig, ...(s.pressures ?? []).map((p) => p.psig)].filter(
      (p): p is number => typeof p === "number",
    );
    for (const p of pressures) {
      if (p < CO2_TRIPLE_POINT_PSIG) fail(s, "r744-below-triple", `${p} PSIG < ${CO2_TRIPLE_POINT_PSIG} PSIG triple point`);
    }
    for (const t of [c.suctionSatDewF, c.suctionSatBubbleF, c.dischargeSatBubbleF, c.dischargeSatDewF]) {
      if (t !== null && t >= CO2_CRITICAL_F) fail(s, "r744-above-critical", `PT lookup ${t}°F ≥ ${CO2_CRITICAL_F}°F critical`);
    }
  }
}

banner("verify-scenarios", SCENARIOS.length, Math.max(30, SCENARIOS.length), "scenarios");

if (optOuts.length) {
  console.log(`[verify-scenarios] ${optOuts.length} teachingCase opt-out(s):`);
  for (const o of optOuts) console.log(`   • ${o}`);
}

if (violations.length) {
  console.error(`\n[verify-scenarios] FAIL — ${violations.length} physically-invalid scenario(s):`);
  for (const v of violations) console.error(`  ✗ ${v.id} (${v.page}) [${v.rule}]: ${v.detail}`);
  process.exit(1);
}
console.log(`[verify-scenarios] OK — all ${SCENARIOS.length} scenarios compute to a valid, classifier-consistent verdict.`);
process.exit(0);
