/**
 * Unit conversions used across calculators. Keep all numeric constants explicit
 * and cite them in comments — Rule 1: no fabricated values, no "approximately".
 */

/** 1 psi = 6.894757 kPa (exact for psi unit definition). */
export const PSI_TO_KPA = 6.894757;
/** Gauge offset: standard atmospheric pressure in kPa. */
export const ATM_KPA = 101.325;

export function fToC(f: number): number {
  return ((f - 32) * 5) / 9;
}

export function cToF(c: number): number {
  return (c * 9) / 5 + 32;
}

/** Delta in °F → delta in °C (no offset). */
export function deltaFtoC(df: number): number {
  return (df * 5) / 9;
}

/** PSIG → kPa gauge. */
export function psigToKpag(psig: number): number {
  return psig * PSI_TO_KPA;
}

/** kPa gauge → PSIG. */
export function kpagToPsig(kpag: number): number {
  return kpag / PSI_TO_KPA;
}
