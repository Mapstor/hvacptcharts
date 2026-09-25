/**
 * Target (total) superheat for fixed-orifice / piston / capillary-tube charging.
 *
 * The single site-wide formula:
 *
 *   targetSuperheat(WB, DB) = round( (3 × indoor wet-bulb − 80 − outdoor dry-bulb) / 2 )
 *
 * Returns null (render as "—") when the result is below 5°F, where probe error
 * swamps the setpoint and the operating point is usually outside the
 * fixed-orifice charging envelope.
 *
 * TXV / EEV systems charge by SUBCOOLING, not superheat — this target does not
 * apply to them. The chart or label printed on the specific unit always takes
 * precedence over this field approximation.
 */

export const MIN_RELIABLE_TSH_F = 5;

/**
 * Provenance label for the formula. Attributes it honestly as a field
 * approximation of the OEM fixed-orifice charging charts — NOT to ACCA Manual T
 * (which is ACCA's air-distribution manual, not a charging-chart source).
 */
export const TARGET_SUPERHEAT_LABEL =
  "Standard field approximation of fixed-orifice charging charts (within about ±3°F of the Carrier/Bryant table in normal conditions; see California Title 24 Reference Appendix RA3.2, Table RA3.2-2). The chart or label on the unit always takes precedence.";

/** Target superheat in whole °F, or null when below the 5°F reliability floor. */
export function targetSuperheat(indoorWB: number, outdoorDB: number): number | null {
  const raw = (3 * indoorWB - 80 - outdoorDB) / 2;
  if (!Number.isFinite(raw) || raw < MIN_RELIABLE_TSH_F) return null;
  return Math.round(raw);
}

/** "—" when unreliable/out-of-envelope, else "N°F". */
export function formatTargetSuperheat(indoorWB: number, outdoorDB: number): string {
  const t = targetSuperheat(indoorWB, outdoorDB);
  return t === null ? "—" : `${t}°F`;
}

// Build-time guard: the canonical spec check values. If the formula regresses,
// the module throws on import and the build fails.
(function assertTargetSuperheat() {
  const checks: Array<[number, number, number | null]> = [
    [67, 95, 13],
    [65, 95, 10],
    [60, 85, 8], // 7.5 rounds to 8
    [55, 75, 5],
    [60, 95, null], // 2.5 < 5 → "—"
  ];
  for (const [wb, db, expected] of checks) {
    const actual = targetSuperheat(wb, db);
    if (actual !== expected) {
      throw new Error(
        `targetSuperheat regression: targetSuperheat(${wb}, ${db}) = ${actual}, expected ${expected}`,
      );
    }
  }
})();
