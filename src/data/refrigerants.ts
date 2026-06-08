import { z } from "zod";
import rawData from "../../data/refrigerants.json";

/* ─────────────── ENUMS ─────────────── */

export const SafetyClass = z.enum(["A1", "A2", "A2L", "A3", "B1", "B2", "B2L", "B3"]);
export type SafetyClass = z.infer<typeof SafetyClass>;

export const RefrigerantType = z.enum([
  "cfc",
  "hcfc",
  "hfc-pure",
  "hfc-blend",
  "hfo-pure",
  "hfo-blend",
  "hc",
  "natural",
]);
export type RefrigerantType = z.infer<typeof RefrigerantType>;

export const Lubricant = z.enum(["MO", "AB", "POE", "PVE", "PAG", "PAO", "PFPE"]);
export type Lubricant = z.infer<typeof Lubricant>;

/* ─────────────── PT CHART POINT ─────────────── */

export const PTPoint = z.object({
  tempF: z.number(),
  tempC: z.number(),
  /** Saturated-liquid (bubble) pressure, gauge PSIG. */
  bubblePsig: z.number(),
  /** Saturated-vapor (dew) pressure, gauge PSIG. Equals bubble for pures/azeotropes. */
  dewPsig: z.number(),
  bubbleKpag: z.number(),
  dewKpag: z.number(),
  /** Mean of bubble + dew for single-column display. */
  displayPsig: z.number(),
  displayKpag: z.number(),
});
export type PTPoint = z.infer<typeof PTPoint>;

/* ─────────────── CRITICAL POINT ─────────────── */
/**
 * Each field is nullable because blends generally don't have a single critical
 * point — CoolProp returns Infinity for `Tcrit` on a blend (the critical locus
 * is a curve, not a point). For pures, all fields are populated.
 */
export const CriticalPoint = z.object({
  tempC: z.number().nullable(),
  tempF: z.number().nullable(),
  pressurePsia: z.number().nullable(),
  pressurePsig: z.number().nullable(),
  pressureKpaA: z.number().nullable(),
  pressureKpaG: z.number().nullable(),
});
export type CriticalPoint = z.infer<typeof CriticalPoint>;

/* ─────────────── COMPOSITION (BLENDS ONLY) ─────────────── */

export const Composition = z.object({
  component: z.string(),
  /** Mass fraction (0..1). */
  massFraction: z.number(),
});
export type Composition = z.infer<typeof Composition>;

/* ─────────────── PHYSICAL PROPERTIES ─────────────── */

export const PhysicalProperties = z.object({
  boilingPointC: z.number().nullable(),
  boilingPointF: z.number().nullable(),
  critical: CriticalPoint,
  molarMassGPerMol: z.number().nullable(),
  liquidDensityKgPerM3At25C: z.number().nullable(),
  /** Bubble − dew at 0°C, in °F. Zero for pures/azeotropes. */
  temperatureGlideF: z.number(),
  /** True if |glide| ≥ 1°F — drives UI decision to show dual-column tables. */
  hasSignificantGlide: z.boolean(),
});
export type PhysicalProperties = z.infer<typeof PhysicalProperties>;

/* ─────────────── ENVIRONMENTAL ─────────────── */

export const Environmental = z.object({
  /** Ozone Depletion Potential. R-11 = 1.0 (reference); HFCs = 0. Null only when no published figure exists for a specialty refrigerant. */
  odp: z.number().nullable(),
  /** Global Warming Potential, 100-year, IPCC AR5 — the EPA / AIM Act figure. */
  gwp100Ar5: z.number().nullable(),
  /** IPCC AR6 100-year value if different. */
  gwp100Ar6: z.number().nullable(),
  atmosphericLifetimeYears: z.number().nullable(),
  snapStatus: z.string().nullable(),
});
export type Environmental = z.infer<typeof Environmental>;

export const LubricantCompatibility = z.object({
  compatible: z.array(Lubricant),
  incompatible: z.array(Lubricant),
  notes: z.string().nullable(),
});
export type LubricantCompatibility = z.infer<typeof LubricantCompatibility>;

export const TradeName = z.object({
  name: z.string(),
  manufacturer: z.string(),
});
export type TradeName = z.infer<typeof TradeName>;

export const RegulatoryStatus = z.object({
  epaPhaseoutComplete: z.boolean(),
  epaPhaseoutDate: z.string().nullable(),
  aimActAffected: z.boolean(),
  snapApproved: z.boolean().nullable(),
});
export type RegulatoryStatus = z.infer<typeof RegulatoryStatus>;

export const PrimarySource = z.object({
  type: z.string(),
  citation: z.string(),
  url: z.string().nullable().optional(),
  doi: z.string().optional(),
  scope: z.string().optional(),
  note: z.string().optional(),
});
export type PrimarySource = z.infer<typeof PrimarySource>;

export const DataStatus = z.enum([
  "complete",
  "published-eos-not-in-build",
  "manufacturer-datasheet-published",
  "historical-retired-refrigerant",
  "no-commercial-data-published",
]);
export type DataStatus = z.infer<typeof DataStatus>;

export const DataSource = z.object({
  ptChartSource: z.string(),
  ptChartGeneratedAt: z.string(),
  ptChartVerifiedAgainst: z.array(z.string()),
  propertiesSource: z.string(),
  gwpSource: z.string(),
  dataStatus: DataStatus.optional(),
  primarySources: z.array(PrimarySource).optional(),
});
export type DataSource = z.infer<typeof DataSource>;

/* ─────────────── REFRIGERANT ─────────────── */

export const Refrigerant = z.object({
  /** URL slug — lowercase, hyphens. Matches existing live URLs: /refrigerant/r-410a/ */
  slug: z.string().regex(/^r-[0-9a-z-]+$/),
  displayName: z.string(),
  altSpellings: z.array(z.string()),
  chemicalName: z.string(),
  chemicalFormula: z.string(),
  ashraeNumber: z.string(),
  type: RefrigerantType,
  safetyClass: SafetyClass,
  tradeNames: z.array(TradeName),
  composition: z.array(Composition),
  physical: PhysicalProperties,
  environmental: Environmental,
  lubricants: LubricantCompatibility,
  applications: z.array(z.string()),
  replacementOptions: z.array(z.string()),
  replaces: z.array(z.string()).nullable(),
  regulatoryStatus: RegulatoryStatus,
  ptChart: z.array(PTPoint),
  dataSource: DataSource,
});
export type Refrigerant = z.infer<typeof Refrigerant>;

const RefrigerantsArray = z.array(Refrigerant);
export const refrigerants: Refrigerant[] = RefrigerantsArray.parse(rawData);

/* ─────────────── LOOKUP HELPERS ─────────────── */

const bySlugMap = new Map(refrigerants.map((r) => [r.slug, r]));

export function getRefrigerant(slug: string): Refrigerant | undefined {
  return bySlugMap.get(slug);
}

export function getAllSlugs(): string[] {
  return refrigerants.map((r) => r.slug);
}

export function hasCriticalPoint(r: Refrigerant): boolean {
  return r.physical.critical.tempC !== null;
}

export function hasPTData(r: Refrigerant): boolean {
  return r.ptChart.length > 0;
}

/**
 * Linear interpolation lookup of bubble/dew PSIG at any temperature in the
 * refrigerant's PT chart range. Returns null if the temperature is outside the
 * available range or if the refrigerant has no PT data.
 */
export function getPressureAtTempF(
  slug: string,
  tempF: number
): { bubble: number; dew: number } | null {
  const r = getRefrigerant(slug);
  if (!r || r.ptChart.length === 0) return null;
  const sorted = [...r.ptChart].sort((a, b) => a.tempF - b.tempF);
  if (tempF < sorted[0].tempF || tempF > sorted[sorted.length - 1].tempF) return null;
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];
    if (a.tempF <= tempF && tempF <= b.tempF) {
      const t = (tempF - a.tempF) / (b.tempF - a.tempF);
      return {
        bubble: a.bubblePsig + t * (b.bubblePsig - a.bubblePsig),
        dew: a.dewPsig + t * (b.dewPsig - a.dewPsig),
      };
    }
  }
  return null;
}

/**
 * Inverse lookup: saturation temperature (°F) at a given pressure (PSIG).
 *
 * `curve` chooses which saturation boundary to interpolate on:
 *   - "bubble" (default): pressure-vs-temperature on the saturated-LIQUID line.
 *     Use this for **subcooling** measurement (liquid line) — at the bubble
 *     pressure on the liquid side, the bubble temp is the boundary below which
 *     refrigerant is fully liquid and subcooled.
 *   - "dew": pressure-vs-temperature on the saturated-VAPOR line. Use this for
 *     **superheat** measurement (suction line) — at the dew pressure on the
 *     vapor side, the dew temp is the boundary above which refrigerant is
 *     fully vapor and superheated.
 *
 * For pure refrigerants and azeotropes the two curves coincide and the choice
 * is moot. For zeotropic blends (R-407C, R-454C, R-455A, etc.) using the wrong
 * curve produces superheat / subcooling errors equal to the glide.
 *
 * Returns null if pressure is outside the chart's range for the chosen curve
 * or the refrigerant has no PT data.
 */
export function getSaturationTempAtPsigF(
  slug: string,
  psig: number,
  curve: "bubble" | "dew" = "bubble"
): number | null {
  const r = getRefrigerant(slug);
  if (!r || r.ptChart.length === 0) return null;
  const pField = curve === "bubble" ? "bubblePsig" : "dewPsig";
  const sorted = [...r.ptChart].sort((a, b) => a[pField] - b[pField]);
  const minP = sorted[0][pField];
  const maxP = sorted[sorted.length - 1][pField];
  if (psig < minP || psig > maxP) return null;
  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];
    if (a[pField] <= psig && psig <= b[pField]) {
      if (b[pField] === a[pField]) return a.tempF;
      const t = (psig - a[pField]) / (b[pField] - a[pField]);
      return a.tempF + t * (b.tempF - a.tempF);
    }
  }
  return null;
}
