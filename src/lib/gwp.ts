import gwpRef from "../../data/reference/gwp-reference.json";
import { gwpText, type Gwp, type GwpCell } from "@/data/refrigerants";

/** The 8 GWP sources (key → {title, url}) from the reference file. */
export const GWP_SOURCES = gwpRef.sources as Record<string, { title: string; url: string }>;

/** The documented method blurbs (headline / ar4 / ar5 / ar6 / rounding). */
export const GWP_METHOD = gwpRef.method as Record<string, string>;

/**
 * Plain-words basis for a headline GWP, from its source key. These are the only
 * three keys a headline ever carries (regulated HFC, EPA 84.64(b), or CFC/HCFC/
 * PFC on the AR4 table).
 */
export function basisLabel(sourceKey: string): string {
  switch (sourceKey) {
    case "aim_app_a":
      return "AIM Act exchange value (IPCC AR4)";
    case "cfr_84_64b":
      return "US EPA value, 40 CFR 84.64(b)";
    case "ipcc_ar4":
      return "IPCC AR4";
    case "ipcc_ar5":
      return "IPCC AR5";
    case "ipcc_ar6":
      return "IPCC AR6";
    default:
      return sourceKey;
  }
}

/** "IPCC: AR4 x · AR5 y · AR6 z" — "not assessed" where a report omits it. */
export function ipccLine(gwp: Gwp): string {
  const cell = (c: GwpCell | null) => (c == null ? "not assessed" : gwpText(c));
  return `IPCC: AR4 ${cell(gwp.ar4)} · AR5 ${cell(gwp.ar5)} · AR6 ${cell(gwp.ar6)}`;
}

/** Colour band for a numeric headline GWP (shared by hero / tables / charts). */
export function gwpTone(n: number | null): "neutral" | "emerald" | "amber" | "red" {
  if (n == null) return "neutral";
  if (n < 150) return "emerald";
  if (n < 700) return "amber";
  return "red";
}
