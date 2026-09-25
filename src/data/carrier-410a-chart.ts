/**
 * Carrier's published R-410A fixed-orifice "Superheat Charging — AC Only" chart
 * (Table 3), reproduced verbatim from the primary sources:
 *
 *  - Carrier "Installation Instructions 24AAA5, 24AAA6, 24ABB3, 24ABC6, 24ACA4,
 *    24ACC4", Catalog No. 24AAA-ACC-6SI, edition 10/16, Table 3
 *    "Superheat Charging — AC Only".
 *  - Bryant II114CNA-CNC-03 (09/15), Table 3 (identical values).
 *
 * Columns = evaporator entering-air wet-bulb (°F). Rows = outdoor temperature
 * (°F). A null cell renders as "—" and means: do NOT charge under these
 * conditions (risk of compressor slugging). Chart tolerance ±3°F.
 *
 * Footnote on the 67°F column: the wet-bulb column printed as 67°F in the source
 * sits between 64°F and 68°F; the 2°F spacing and its values suggest it should
 * read 66°F. Reproduced as printed.
 *
 * Carrier, Bryant and Puron are trademarks of their respective owners.
 * HVAC PT Charts is not affiliated with or endorsed by Carrier Corporation.
 */

export const CARRIER_WB_COLS = [50, 52, 54, 56, 58, 60, 62, 64, 67, 68, 70, 72, 74, 76] as const;
export const CARRIER_OD_ROWS = [55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115] as const;

/** Outdoor-temp row → target superheat (°F) per wet-bulb column (null = "—"). */
export const CARRIER_SH_CHART: Record<number, Array<number | null>> = {
  55: [9, 12, 14, 17, 20, 23, 26, 29, 32, 35, 37, 40, 42, 45],
  60: [7, 10, 12, 15, 18, 21, 24, 27, 30, 33, 35, 38, 40, 43],
  65: [null, 6, 10, 13, 16, 19, 21, 24, 27, 30, 33, 36, 38, 41],
  70: [null, null, 7, 10, 13, 16, 19, 21, 24, 27, 30, 33, 36, 39],
  75: [null, null, null, 6, 9, 12, 15, 18, 21, 24, 28, 31, 34, 37],
  80: [null, null, null, null, 5, 8, 12, 15, 18, 21, 25, 28, 31, 35],
  85: [null, null, null, null, null, null, 8, 11, 15, 19, 22, 26, 30, 33],
  90: [null, null, null, null, null, null, 5, 9, 13, 16, 20, 24, 27, 31],
  95: [null, null, null, null, null, null, null, 6, 10, 14, 18, 22, 25, 29],
  100: [null, null, null, null, null, null, null, null, 8, 12, 15, 20, 23, 27],
  105: [null, null, null, null, null, null, null, null, 5, 9, 13, 17, 22, 26],
  110: [null, null, null, null, null, null, null, null, null, 6, 11, 15, 20, 25],
  115: [null, null, null, null, null, null, null, null, null, null, 8, 14, 18, 23],
};

export const CARRIER_CHART_TOLERANCE_F = 3;

export const CARRIER_CHART_CITATION =
  'Carrier "Installation Instructions 24AAA5, 24AAA6, 24ABB3, 24ABC6, 24ACA4, 24ACC4", Catalog No. 24AAA-ACC-6SI, edition 10/16, Table 3 "Superheat Charging — AC Only"; identical in Bryant II114CNA-CNC-03 (09/15), Table 3.';

export const CARRIER_TRADEMARK_NOTICE =
  "Carrier, Bryant and Puron are trademarks of their respective owners. HVAC PT Charts is not affiliated with or endorsed by Carrier Corporation.";

/**
 * Nearest-published-cell lookup: snaps wet-bulb and outdoor temp DOWN to the
 * nearest axis value Carrier publishes, then returns that cell (null = "—",
 * meaning do not charge). This is a table lookup — the values are Carrier's, not
 * a formula. For a between-rows estimate, interpolate the returned cells.
 */
export function carrierTargetSuperheat(wb: number, od: number): number | null {
  if (!Number.isFinite(wb) || !Number.isFinite(od)) return null;
  const wbCol = CARRIER_WB_COLS.reduce((a, v) => (v <= wb ? v : a), CARRIER_WB_COLS[0]);
  const odRow = CARRIER_OD_ROWS.reduce((a, v) => (v <= od ? v : a), CARRIER_OD_ROWS[0]);
  const wbIdx = CARRIER_WB_COLS.indexOf(wbCol);
  const row = CARRIER_SH_CHART[odRow];
  return row ? row[wbIdx] ?? null : null;
}

// Build-time guard: shape + a couple of spec-anchored cells. Fails the build on
// a transcription regression.
(function assertCarrierChart() {
  for (const od of CARRIER_OD_ROWS) {
    const row = CARRIER_SH_CHART[od];
    if (!row || row.length !== CARRIER_WB_COLS.length) {
      throw new Error(`Carrier chart row ${od}°F has ${row?.length} cells, expected ${CARRIER_WB_COLS.length}`);
    }
  }
  const spec: Array<[number, number, number | null]> = [
    [67, 95, 10], // 95°F OD / 67°F WB → 10°F
    [68, 95, 14],
    [50, 55, 9], // top-left published corner (WB 50 / OD 55)
    [76, 115, 23], // bottom-right corner
    [50, 65, null], // blanked (do not charge)
  ];
  for (const [wb, od, expected] of spec) {
    const actual = carrierTargetSuperheat(wb, od);
    if (actual !== expected) {
      throw new Error(`Carrier chart regression: carrierTargetSuperheat(${wb}, ${od}) = ${actual}, expected ${expected}`);
    }
  }
})();
