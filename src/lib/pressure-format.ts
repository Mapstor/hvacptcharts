/**
 * Canonical formatters for saturation pressure values across the site.
 *
 * One rounding convention, one source of truth: every prose reference to a
 * saturation pressure at a specific temperature renders through these
 * helpers so a diagnostic page and the what-pressure page it links to
 * always agree to one decimal. Wave 1 (2026-07) introduced this after a
 * proposed table drifted from a linked page's description by rounding
 * convention — helper-only enforcement + a build-time grep guard for
 * numeric PSIG literals in new page sources catches drift structurally.
 *
 * Throws if the dataset lacks a PT point for (slug, tempF). Callers should
 * only pass service-realistic temperatures inside the refrigerant's dataset
 * range; a throw here means the caller referenced an out-of-range point.
 */

import { getPressureAtTempF } from "@/data/refrigerants";

/**
 * Bubble-point saturation pressure at a given temperature, one decimal,
 * for use in prose or metadata descriptions. Example: "35.0" for R-134a
 * at 40°F. Use for pure fluids and near-azeotropes; for the vapor side of
 * a zeotropic blend at the evaporator outlet use fmtPsigDew instead.
 */
export function fmtPsigBubble(slug: string, tempF: number): string {
  const p = getPressureAtTempF(slug, tempF);
  if (!p) throw new Error(`fmtPsigBubble: no PT data for ${slug} at ${tempF}°F`);
  return p.bubble.toFixed(1);
}

/**
 * Dew-point saturation pressure at a given temperature, one decimal. Use
 * for the vapor side of zeotropic blends (R-407C, R-454C, R-455A, R-449A)
 * — superheat measurements on the suction line reference the dew curve.
 */
export function fmtPsigDew(slug: string, tempF: number): string {
  const p = getPressureAtTempF(slug, tempF);
  if (!p) throw new Error(`fmtPsigDew: no PT data for ${slug} at ${tempF}°F`);
  return p.dew.toFixed(1);
}
