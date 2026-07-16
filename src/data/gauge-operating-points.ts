import {
  getRefrigerant,
  getPressureAtTempF,
  type Refrigerant,
} from "./refrigerants";

/**
 * Canonical (evapTempF, condTempF) design point for each refrigerant that
 * has a /what-pressure-should-{slug}/ page. Consumed by both the answer-box
 * copy on that page AND the SystemGaugesDiagram — passing the same slug +
 * temps to fmtPsigDew/Bubble on both sides gives identical output by
 * construction, so the "diagram numbers = page numbers" consistency rule
 * holds structurally, not by assertion.
 *
 * Frozen at build time by scripts/verify-gauge-operating-points.ts: the
 * script fails the build if the SUPPORTED predicate returns false for any
 * entry or if either temperature is outside the fluid's ptTable range.
 *
 * R-744 is intentionally absent — SUPPORTED filters it via the subcritical
 * check (critical 87.8°F ≤ any real design cond). R-717 (ammonia) would be
 * filtered by the B-class check if it were added.
 */

export interface GaugeOperatingPoint {
  slug: string;
  evapTempF: number;
  condTempF: number;
  contextLabel: string;
  altDutyNote?: string;
}

export const GAUGE_OPERATING_POINTS: Record<string, GaugeOperatingPoint> = {
  "r-22": {
    slug: "r-22",
    evapTempF: 40,
    condTempF: 105,
    contextLabel: "Residential A/C at 95°F outdoor (ARI 210/240 design point)",
  },
  "r-32": {
    slug: "r-32",
    evapTempF: 40,
    condTempF: 105,
    contextLabel: "Residential A/C at 95°F outdoor (ARI 210/240 design point)",
  },
  "r-134a": {
    slug: "r-134a",
    evapTempF: 40,
    condTempF: 105,
    contextLabel: "Centrifugal chiller at 95°F outdoor (primary stationary duty)",
    altDutyNote:
      "Automotive A/C service on R-134a typically runs 40°F evap / 130°F cond due to smaller condensers; medium-temp commercial refrigeration runs around 20°F evap.",
  },
  "r-410a": {
    slug: "r-410a",
    evapTempF: 40,
    condTempF: 105,
    contextLabel: "Residential A/C at 95°F outdoor (ARI 210/240 design point)",
  },
  "r-407c": {
    slug: "r-407c",
    evapTempF: 40,
    condTempF: 105,
    contextLabel:
      "Residential A/C at 95°F outdoor (R-22 replacement in existing equipment)",
  },
  "r-404a": {
    slug: "r-404a",
    evapTempF: 25,
    condTempF: 105,
    contextLabel: "Medium-temperature display case at 95°F ambient (35°F case temp, ~25°F evap saturation)",
    altDutyNote:
      "Low-temperature freezer duty on R-404A typically runs -20°F evap / 105°F cond.",
  },
  "r-449a": {
    slug: "r-449a",
    evapTempF: 25,
    condTempF: 105,
    contextLabel:
      "Medium-temperature display case at 95°F ambient (R-404A replacement, ~25°F evap saturation)",
  },
  "r-454b": {
    slug: "r-454b",
    evapTempF: 40,
    condTempF: 105,
    contextLabel:
      "Residential A/C at 95°F outdoor (R-410A replacement, A2L)",
  },
  "r-454c": {
    slug: "r-454c",
    evapTempF: 20,
    condTempF: 105,
    contextLabel:
      "Medium-temperature commercial refrigeration (R-404A replacement, A2L)",
  },
  "r-1234yf": {
    slug: "r-1234yf",
    evapTempF: 40,
    condTempF: 130,
    contextLabel:
      "Automotive A/C at design condition (smaller condenser → higher head)",
  },
};

/**
 * SUPPORTED predicate for the SystemGaugesDiagram — structural, not a
 * blocklist. Three tests, each keyed to a real reason the standard round
 * PSIG gauge face misrepresents the fluid's service regime:
 *
 *   1. B-class refrigerants (higher toxicity, ASHRAE 34 designation starts
 *      with "B"). Ammonia's service procedures and dual vacuum/PSIG gauge
 *      convention aren't what a standard round PSIG face depicts. Filters
 *      R-717 today; any future B1/B2/B2L/B3 addition is filtered by the
 *      same rule.
 *
 *   2. Transcritical or near-critical at the design head condition. Above
 *      the critical temperature saturation is undefined; within ~5°F of
 *      critical the pseudocritical region makes any single "saturation"
 *      reading a fiction. Filters R-744 (Tcrit 87.8°F) at any real
 *      design cond ≥ ~83°F, so any A/C or refrigeration head condition
 *      excludes it — as intended.
 *
 *   3. Either temperature outside the fluid's ptTable range. Structural
 *      guard against edge fluids whose datasheet transcription doesn't
 *      cover the design range yet.
 *
 * When false, the diagram component returns null and the page renders no
 * diagram. Nothing to configure per-fluid; the predicate governs.
 */
export function isGaugeDiagramSupported(
  r: Refrigerant,
  evapTempF: number,
  condTempF: number,
): boolean {
  if (r.safetyClass.startsWith("B")) return false;
  const critTempF = r.physical.critical.tempF;
  if (critTempF !== null && critTempF <= condTempF + 5) return false;
  const evapSat = getPressureAtTempF(r.slug, evapTempF);
  const condSat = getPressureAtTempF(r.slug, condTempF);
  if (!evapSat || !condSat) return false;
  return true;
}

export function getGaugeOperatingPoint(
  slug: string,
): GaugeOperatingPoint | undefined {
  return GAUGE_OPERATING_POINTS[slug];
}

/**
 * Returns the frozen (dew, bubble) saturation pressures for a slug's
 * operating point. Used by both the WhatPressurePage design-point line and
 * the SystemGaugesDiagram — one source, one lookup, guaranteed-consistent
 * output.
 */
export function getGaugePsigForSlug(
  slug: string,
): { dewPsig: number; bubblePsig: number; point: GaugeOperatingPoint } | null {
  const pt = GAUGE_OPERATING_POINTS[slug];
  if (!pt) return null;
  const r = getRefrigerant(slug);
  if (!r) return null;
  if (!isGaugeDiagramSupported(r, pt.evapTempF, pt.condTempF)) return null;
  const evapSat = getPressureAtTempF(slug, pt.evapTempF);
  const condSat = getPressureAtTempF(slug, pt.condTempF);
  if (!evapSat || !condSat) return null;
  return { dewPsig: evapSat.dew, bubblePsig: condSat.bubble, point: pt };
}
