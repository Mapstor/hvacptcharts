/**
 * Operating-pressure calculation module — the SINGLE source of every pressure
 * on the /what-pressure-should-{id}/ operating pages (Task 10). Task 13 (car
 * A/C: R-134a, R-1234yf) reuses these builders unchanged.
 *
 * Everything derives from the CoolProp-verified PT dataset via satPressure /
 * satTemp (src/data/refrigerants.ts). Nothing here holds a typed pressure
 * literal; every value is a saturation lookup. Out-of-range lookups return
 * null and render "—" — the module NEVER extrapolates.
 *
 * Method (matches the site's existing residential/commercial convention):
 *   Residential A/C, cooling:
 *     low side  = dew pressure across a fixed 38–45°F indoor coil (same every row)
 *     high side = bubble pressure at outdoor + 15…25°F condenser split
 *   Commercial refrigeration:
 *     suction   = dew pressure at the coil temperature ± 3°F
 *     head      = bubble pressure at outdoor + 15…30°F condenser split
 *   Coil temps from AHRI 1250-2020: walk-in cooler 25°F suction dew (Table 16),
 *     walk-in freezer −20°F suction dew (Table 17).
 *   Anchor for answer blocks + metas: 95°F outdoors (AHRI 210/240 A2 rating,
 *     Table 8; also an AHRI 1250 outdoor condensing-unit point, Tables 13/15).
 *
 * Rounding: psig as integers, one decimal below 10 psig; kPa(gauge) as
 * integers with thousands separators; °C to one decimal; bar(gauge) to one
 * decimal. Vacuum would render in in. Hg (none of these fluids reach it here).
 */
import { getRefrigerant, satPressure, satTemp, type Refrigerant } from "./refrigerants";

/** psi → kPa (exact psi definition); same constant as calculators/shared/units.ts. */
export const PSI_TO_KPA = 6.894757;

/* ─────────────────────────── method constants ─────────────────────────── */

/** Outdoor rows for every by-temperature chart: 65–115°F in 5°F steps (11 rows). */
export const OUTDOOR_ROWS_F: readonly number[] = [65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115];
/** Standing-pressure rows: 65–115°F in 5°F steps. */
export const STANDING_ROWS_F: readonly number[] = [65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115];
/** Answer-block / meta anchor: 95°F outdoors. */
export const ANCHOR_OUTDOOR_F = 95;

/** Residential indoor-coil saturation band (low side follows the coil, not the weather). */
export const RES_COIL_LO_F = 38;
export const RES_COIL_HI_F = 45;
/** Condenser split above outdoor air. */
export const RES_HEAD_LO_OFFSET = 15;
export const RES_HEAD_HI_OFFSET = 25;
export const COM_HEAD_LO_OFFSET = 15;
export const COM_HEAD_HI_OFFSET = 30;

/** AHRI 1250-2020 walk-in suction dew points. */
export const COOLER_COIL_F = 25; // Table 16, 35°F entering air
export const FREEZER_COIL_F = -20; // Table 17, −10°F entering air
export const COIL_SPAN_F = 3; // suction = dew at coil ± 3°F

/** R-744 high-side condensing table + standstill table rows. */
export const CO2_CONDENSING_ROWS_F: readonly number[] = [40, 45, 50, 55, 60, 65, 70, 75, 80, 85];
export const CO2_STANDSTILL_ROWS_F: readonly number[] = [65, 70, 75, 80, 85];

export const AHRI_1250_URL = "https://law.resource.org/pub/us/cfr/ibr/inc/ansi/ahri.1250.2020.pdf";
export const AHRI_210_240_URL = "https://law.resource.org/pub/us/cfr/ibr/inc/ansi/ahri.0210-0240.2020.2023.pdf";

export const EM_DASH = "—";
export const GAP_NOTE = "outside the calculated range";

/* ─────────────────────────── formatters ─────────────────────────── */

/**
 * Integer psig, one decimal below 10 psig, thousands separator at 1,000+;
 * "—" when null (out of range).
 */
export function fmtPsig(p: number | null): string {
  if (p === null || p === undefined || Number.isNaN(p)) return EM_DASH;
  if (Math.abs(p) < 10) return p.toFixed(1);
  return group(Math.round(p));
}

/** Thousands-grouped integer kPa(gauge); "—" when null. */
export function fmtKpaG(psig: number | null): string {
  if (psig === null || psig === undefined || Number.isNaN(psig)) return EM_DASH;
  return group(Math.round(psig * PSI_TO_KPA));
}

/** bar(gauge) to one decimal; "—" when null. */
export function fmtBarG(psig: number | null): string {
  if (psig === null || psig === undefined || Number.isNaN(psig)) return EM_DASH;
  return ((psig * PSI_TO_KPA) / 100).toFixed(1);
}

/** °C to one decimal (deterministic; no locale). */
export function fmtC(tempF: number): string {
  return (((tempF - 32) * 5) / 9).toFixed(1);
}

/** Whole °C, for round room-temperature labels (20°C, 30°C). */
export function roundC(tempF: number): number {
  return Math.round(((tempF - 32) * 5) / 9);
}

/** Deterministic thousands grouping (no Intl / locale dependence at build time). */
function group(n: number): string {
  const neg = n < 0;
  const s = String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return neg ? `-${s}` : s;
}

/* ─────────────────────────── cells & bands ─────────────────────────── */

export interface Cell {
  /** Temperature this saturation value was looked up at, °F. */
  tempF: number;
  /** Raw psig (null = out of the fluid's PT range). */
  psig: number | null;
  /** Formatted psig ("114", "8.1", or "—"). */
  psigStr: string;
  /** Formatted kPa(gauge). */
  kpaStr: string;
}

export interface Band {
  loF: number;
  hiF: number;
  lo: Cell;
  hi: Cell;
  /** "114–130", "≥ 450" style is avoided — a null endpoint collapses to "—". */
  psigStr: string;
  kpaStr: string;
  barStr: string;
  /** True when either endpoint is out of range (renders "—", footnoted). */
  gap: boolean;
}

function cell(slug: string, tempF: number, curve: "dew" | "bubble"): Cell {
  const psig = satPressure(slug, tempF, curve);
  return { tempF, psig, psigStr: fmtPsig(psig), kpaStr: fmtKpaG(psig) };
}

/**
 * A saturation band across two temperatures on one curve. If either endpoint
 * falls outside the PT range the whole band renders "—" (gap=true) and is
 * footnoted; we never show a half-computed range and never extrapolate.
 */
export function band(
  slug: string,
  loF: number,
  hiF: number,
  curve: "dew" | "bubble",
): Band {
  const lo = cell(slug, loF, curve);
  const hi = cell(slug, hiF, curve);
  const gap = lo.psig === null || hi.psig === null;
  // If either end of the range is below 10 psig, show BOTH ends to one decimal
  // ("8.1–11.6", not "8.1–12"). Rewrite the cell strings so data-psig, the value
  // set, and the rendered band all agree.
  const subTen = (lo.psig !== null && Math.abs(lo.psig) < 10) || (hi.psig !== null && Math.abs(hi.psig) < 10);
  if (subTen) {
    if (lo.psig !== null) lo.psigStr = lo.psig.toFixed(1);
    if (hi.psig !== null) hi.psigStr = hi.psig.toFixed(1);
  }
  return {
    loF,
    hiF,
    lo,
    hi,
    psigStr: gap ? EM_DASH : `${lo.psigStr}–${hi.psigStr}`,
    kpaStr: gap ? EM_DASH : `${lo.kpaStr}–${hi.kpaStr}`,
    barStr: gap ? EM_DASH : `${fmtBarG(lo.psig)}–${fmtBarG(hi.psig)}`,
    gap,
  };
}

/** Single-temperature saturation value on one curve. */
export function satAt(slug: string, tempF: number, curve: "dew" | "bubble"): Cell {
  return cell(slug, tempF, curve);
}

/* ─────────────────────────── residential A/C ─────────────────────────── */

/** Low-side band: dew across the 38–45°F indoor coil. Same in every chart row. */
export function residentialLowBand(slug: string): Band {
  return band(slug, RES_COIL_LO_F, RES_COIL_HI_F, "dew");
}

export interface HighRow {
  outdoorF: number;
  outdoorC: string;
  band: Band;
}

/** High-side band per outdoor row: bubble at outdoor + 15…25°F. */
export function residentialHighRows(slug: string): HighRow[] {
  return OUTDOOR_ROWS_F.map((o) => ({
    outdoorF: o,
    outdoorC: fmtC(o),
    band: band(slug, o + RES_HEAD_LO_OFFSET, o + RES_HEAD_HI_OFFSET, "bubble"),
  }));
}

/** 95°F anchor for residential answer blocks / metas. */
export function residentialAnchor(slug: string): { low: Band; high: Band } {
  return {
    low: residentialLowBand(slug),
    high: band(slug, ANCHOR_OUTDOOR_F + RES_HEAD_LO_OFFSET, ANCHOR_OUTDOOR_F + RES_HEAD_HI_OFFSET, "bubble"),
  };
}

/* ─────────────────────────── commercial refrigeration ─────────────────────────── */

/** Suction bands at the AHRI 1250 walk-in coil temps, dew ± 3°F. */
export function commercialSuction(slug: string): { cooler: Band; freezer: Band } {
  return {
    cooler: band(slug, COOLER_COIL_F - COIL_SPAN_F, COOLER_COIL_F + COIL_SPAN_F, "dew"),
    freezer: band(slug, FREEZER_COIL_F - COIL_SPAN_F, FREEZER_COIL_F + COIL_SPAN_F, "dew"),
  };
}

/** Head band per outdoor row: bubble at outdoor + 15…30°F. */
export function commercialHeadRows(slug: string): HighRow[] {
  return OUTDOOR_ROWS_F.map((o) => ({
    outdoorF: o,
    outdoorC: fmtC(o),
    band: band(slug, o + COM_HEAD_LO_OFFSET, o + COM_HEAD_HI_OFFSET, "bubble"),
  }));
}

/** 95°F anchor for commercial answer blocks / metas. */
export function commercialAnchor(slug: string): { cooler: Band; freezer: Band; head: Band } {
  const s = commercialSuction(slug);
  return {
    cooler: s.cooler,
    freezer: s.freezer,
    head: band(slug, ANCHOR_OUTDOOR_F + COM_HEAD_LO_OFFSET, ANCHOR_OUTDOOR_F + COM_HEAD_HI_OFFSET, "bubble"),
  };
}

/* ─────────────────────────── standing pressure ─────────────────────────── */

export type StandingMode = "sat" | "bubble" | "range";

export interface StandingRow {
  tempF: number;
  tempC: string;
  /** For "sat"/"bubble": one value. For "range": dew–bubble. */
  psigStr: string;
  kpaStr: string;
  /** Individual cells (for the value set). */
  cells: Cell[];
}

/**
 * Standing (system-off, equalized) pressure rows.
 *   "sat"    — single saturation value (pure/azeotrope; dew===bubble): R-22, R-32, R-744.
 *   "bubble" — bubble value (R-410A convention).
 *   "range"  — dew-to-bubble range for a glide blend: R-407C, R-454B, R-454C.
 */
export function standingRows(
  slug: string,
  mode: StandingMode,
  tempsF: readonly number[] = STANDING_ROWS_F,
): StandingRow[] {
  return tempsF.map((t) => {
    if (mode === "range") {
      const d = cell(slug, t, "dew");
      const b = cell(slug, t, "bubble");
      const gap = d.psig === null || b.psig === null;
      return {
        tempF: t,
        tempC: fmtC(t),
        psigStr: gap ? EM_DASH : `${d.psigStr}–${b.psigStr}`,
        kpaStr: gap ? EM_DASH : `${d.kpaStr}–${b.kpaStr}`,
        cells: [d, b],
      };
    }
    const c = cell(slug, t, mode === "bubble" ? "bubble" : "dew");
    return { tempF: t, tempC: fmtC(t), psigStr: c.psigStr, kpaStr: c.kpaStr, cells: [c] };
  });
}

/* ─────────────────────────── comparisons ─────────────────────────── */

export interface ComparePct {
  /** Percentage difference of A relative to B, one decimal with sign. */
  dewPct: string;
  bubblePct: string;
  dewA: Cell;
  dewB: Cell;
  bubA: Cell;
  bubB: Cell;
}

/** Dew (low side) and bubble (high side) % difference of A vs B at the anchor. */
export function comparisonAt(
  slugA: string,
  slugB: string,
  lowTempF = RES_COIL_LO_F,
  highTempF = ANCHOR_OUTDOOR_F + RES_HEAD_LO_OFFSET,
): ComparePct | null {
  const dewA = cell(slugA, lowTempF, "dew");
  const dewB = cell(slugB, lowTempF, "dew");
  const bubA = cell(slugA, highTempF, "bubble");
  const bubB = cell(slugB, highTempF, "bubble");
  if (dewA.psig === null || dewB.psig === null || bubA.psig === null || bubB.psig === null) return null;
  const pct = (a: number, b: number) => {
    const v = ((a - b) / b) * 100;
    return `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`;
  };
  return {
    dewPct: pct(dewA.psig, dewB.psig),
    bubblePct: pct(bubA.psig, bubB.psig),
    dewA,
    dewB,
    bubA,
    bubB,
  };
}

/* ─────────────────────────── R-744 (CO₂) ─────────────────────────── */

export interface Co2Critical {
  tempF: number;
  tempC: number;
  psig: number;
  tempFStr: string; // "87.8°F"
  psigStr: string; // "1,055"
}

/** Critical point straight from the dataset (not a saturation lookup / not extrapolated). */
export function co2Critical(slug: string): Co2Critical | null {
  const r = getRefrigerant(slug);
  if (!r) return null;
  const c = r.physical.critical;
  if (c.tempF === null || c.pressurePsig === null || c.pressurePsig === undefined) return null;
  return {
    tempF: c.tempF,
    tempC: c.tempC ?? Math.round(((c.tempF - 32) * 5) / 9),
    psig: c.pressurePsig,
    tempFStr: `${c.tempF.toFixed(1)}°F`,
    psigStr: group(Math.round(c.pressurePsig)), // "1,055"
  };
}

export interface Co2Row {
  tempF: number;
  tempC: string;
  cell: Cell;
}

/** R-744 high-side condensing table (subcritical), 40–85°F bubble (=sat, pure). */
export function co2CondensingRows(slug: string): Co2Row[] {
  return CO2_CONDENSING_ROWS_F.map((t) => ({ tempF: t, tempC: fmtC(t), cell: cell(slug, t, "bubble") }));
}

/** R-744 standstill table, 65–85°F saturation. */
export function co2StandstillRows(slug: string): Co2Row[] {
  return CO2_STANDSTILL_ROWS_F.map((t) => ({ tempF: t, tempC: fmtC(t), cell: cell(slug, t, "dew") }));
}

/** R-744 suction bands at the walk-in coil temps. */
export function co2Suction(slug: string): { cooler: Band; freezer: Band } {
  return commercialSuction(slug);
}

/* ─────────────────────────── provenance ─────────────────────────── */

/** The dataset's CoolProp attribution for a fluid, for the method block. */
export function ptDatasetSource(slug: string): string {
  const r = getRefrigerant(slug);
  const raw = r?.dataSource?.ptChartSource ?? "";
  // "CoolProp 7.2.0 R410A.mix" → "CoolProp 7.2.0"
  const m = raw.match(/CoolProp\s+[\d.]+/i);
  return m ? m[0] : raw || "CoolProp";
}

export function getRef(slug: string): Refrigerant | undefined {
  return getRefrigerant(slug);
}

/* ─────────────────────────── value-set collection ─────────────────────────── */

/** Push a cell's individual formatted psig string (skipping gaps) into a set. */
export function collectCell(set: Set<string>, ...cells: Cell[]): void {
  for (const c of cells) if (c.psigStr !== EM_DASH) set.add(c.psigStr);
}

export function collectBand(set: Set<string>, ...bands: Band[]): void {
  for (const b of bands) collectCell(set, b.lo, b.hi);
}
