/**
 * Pure-function duct sizing library.
 *
 * Implements the ACCA Manual D / ASHRAE Handbook of Fundamentals 2021
 * Chapter 21 equal-friction sizing method for galvanized round sheet-metal
 * duct, with Huebscher round⇔rectangular equivalence.
 *
 * Sources:
 *   - ACCA Manual D, Residential Duct Systems (3rd ed., 2014 & later)
 *   - ASHRAE Handbook of Fundamentals 2021, Chapter 21: Duct Design
 *   - SMACNA HVAC Duct Construction Standards (3rd ed., 2005) — material gauges
 *   - ASHRAE Standard 152 — duct system efficiency
 *
 * The friction equation is the closed-form simplification of Darcy-Weisbach
 * with Colebrook-White friction factor for galvanized steel (ε = 0.0003 ft)
 * at standard air (0.075 lb/ft³ at 70°F, sea level). Standard form:
 *   ΔP/100ft = 0.0307 × (V/100)^1.9 / D^1.22       (V in fpm, D in inches)
 * Substituting V = 183.3 × Q / D² gives the direct CFM↔diameter form used
 * by the solver below.
 */

// ────────────────────────────────────────────────────────────────────
// Air density (for non-standard altitude/temperature)
// ────────────────────────────────────────────────────────────────────

export const STANDARD_AIR_DENSITY = 0.075; // lb/ft³ at 70°F, sea level

/** Approximate atmospheric pressure at altitude (psia). */
export function atmPressurePsia(altitudeFt: number): number {
  return 14.696 * Math.pow(1 - 6.8755e-6 * altitudeFt, 5.2559);
}

/** Air density (lb/ft³) at given temperature and altitude. */
export function airDensity(tempF: number, altitudeFt: number): number {
  const p = atmPressurePsia(altitudeFt);
  return STANDARD_AIR_DENSITY * (530 / (tempF + 460)) * (p / 14.696);
}

// ────────────────────────────────────────────────────────────────────
// Friction loss (galvanized round duct, simplified ASHRAE form)
// ────────────────────────────────────────────────────────────────────

/** Velocity (fpm) for given CFM and round-duct diameter (inches). */
export function velocityFpm(cfm: number, diameterInches: number): number {
  if (diameterInches <= 0) return 0;
  return (576 * cfm) / (Math.PI * diameterInches * diameterInches);
}

/** Friction loss per 100 ft (in.w.c./100 ft) for given diameter, velocity, density. */
export function frictionLossPerHundredFt(
  diameterInches: number,
  velocityFpmArg: number,
  density: number = STANDARD_AIR_DENSITY,
): number {
  if (diameterInches <= 0 || velocityFpmArg <= 0) return 0;
  const standardLoss =
    0.0307 * Math.pow(velocityFpmArg / 100, 1.9) / Math.pow(diameterInches, 1.22);
  return standardLoss * (density / STANDARD_AIR_DENSITY);
}

/** Exact (not rounded) round diameter for given CFM and target friction rate.
 *  Closed-form solution: D = (0.0992 × Q^1.9 / (ΔP/100))^(1/5.02). */
export function exactDiameterInches(
  cfm: number,
  frictionPerHundredFt: number,
  density: number = STANDARD_AIR_DENSITY,
): number {
  if (cfm <= 0 || frictionPerHundredFt <= 0) return Number.NaN;
  // Adjust the K constant for non-standard density (friction scales linearly with ρ)
  const k = 0.0992 * (density / STANDARD_AIR_DENSITY);
  return Math.pow((k * Math.pow(cfm, 1.9)) / frictionPerHundredFt, 1 / 5.02);
}

/** Standard sheet-metal round duct sizes (inches). */
export const STANDARD_ROUND_SIZES = [
  4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 36, 42, 48,
];

/** Round up to nearest standard round size. Returns the standard size to spec. */
export function nearestStandardRound(exactDiameter: number): number {
  for (const size of STANDARD_ROUND_SIZES) {
    if (exactDiameter <= size) return size;
  }
  return STANDARD_ROUND_SIZES[STANDARD_ROUND_SIZES.length - 1];
}

// ────────────────────────────────────────────────────────────────────
// Huebscher round ↔ rectangular equivalent diameter (ASHRAE / ACCA)
// ────────────────────────────────────────────────────────────────────

/** Huebscher equivalent round diameter for a rectangular duct (a × b, inches).
 *  D_eq = 1.30 × (a × b)^0.625 / (a + b)^0.25
 *  Yields the round diameter that gives the same friction at the same CFM. */
export function huebscherEquivalent(aInches: number, bInches: number): number {
  if (aInches <= 0 || bInches <= 0) return 0;
  return (1.30 * Math.pow(aInches * bInches, 0.625)) / Math.pow(aInches + bInches, 0.25);
}

/** Find rectangular dimensions (a × b) that approximate a target equivalent
 *  round diameter, in 2-inch sheet-metal increments, with aspect ratio
 *  constrained (default ≤ 4:1 per ACCA Manual D). Returns up to 6 options. */
export function rectangularEquivalents(
  targetRoundInches: number,
  options: { aspectMax?: number; tolerance?: number; max?: number } = {},
): Array<{ width: number; height: number; aspectRatio: number; equivDiameter: number }> {
  const aspectMax = options.aspectMax ?? 4;
  const tol = options.tolerance ?? 0.4;
  const max = options.max ?? 6;
  const out: Array<{ width: number; height: number; aspectRatio: number; equivDiameter: number }> = [];
  // Practical sheet-metal sizes
  const sizes = [4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 30, 36, 42, 48];
  for (const w of sizes) {
    for (const h of sizes) {
      if (h > w) continue; // dedupe (a ≥ b)
      const ratio = w / h;
      if (ratio > aspectMax) continue;
      const eq = huebscherEquivalent(w, h);
      if (Math.abs(eq - targetRoundInches) <= tol) {
        out.push({ width: w, height: h, aspectRatio: ratio, equivDiameter: eq });
      }
    }
  }
  // Sort by closest to target, then by lower aspect ratio
  out.sort((a, b) => {
    const ad = Math.abs(a.equivDiameter - targetRoundInches);
    const bd = Math.abs(b.equivDiameter - targetRoundInches);
    if (Math.abs(ad - bd) > 0.05) return ad - bd;
    return a.aspectRatio - b.aspectRatio;
  });
  return out.slice(0, max);
}

// ────────────────────────────────────────────────────────────────────
// Velocity limits & application presets
// ────────────────────────────────────────────────────────────────────

export interface ApplicationPreset {
  id: string;
  label: string;
  /** Recommended friction rate (in.w.c./100 ft). */
  friction: number;
  /** Maximum recommended velocity (fpm). */
  maxVelocity: number;
  /** Per ACCA Manual D / ASHRAE 33-2016 noise-controlled velocity limits. */
  notes: string;
}

export const APPLICATION_PRESETS: ApplicationPreset[] = [
  {
    id: "res-supply-trunk",
    label: "Residential supply trunk",
    friction: 0.08,
    maxVelocity: 900,
    notes: "ACCA Manual D Table 7 — primary supply, max 900 fpm to control noise.",
  },
  {
    id: "res-supply-branch",
    label: "Residential supply branch",
    friction: 0.08,
    maxVelocity: 700,
    notes: "Branch runs to individual rooms, max 700 fpm for noise comfort.",
  },
  {
    id: "res-return",
    label: "Residential return",
    friction: 0.05,
    maxVelocity: 600,
    notes: "Lower friction and velocity than supply — returns are more noise-sensitive.",
  },
  {
    id: "comm-supply-low",
    label: "Commercial low-pressure supply",
    friction: 0.10,
    maxVelocity: 1500,
    notes: "Office and retail VAV systems, typical low-pressure design.",
  },
  {
    id: "comm-supply-med",
    label: "Commercial medium-pressure supply",
    friction: 0.20,
    maxVelocity: 2500,
    notes: "Larger commercial systems with sound attenuation in supply boxes.",
  },
];

// ────────────────────────────────────────────────────────────────────
// Top-level sizing
// ────────────────────────────────────────────────────────────────────

export interface DuctSizingResult {
  cfm: number;
  frictionTarget: number;
  density: number;
  exactDiameter: number;
  standardDiameter: number;
  velocityAtStandard: number;
  frictionAtStandard: number;
  velocityWarning: "ok" | "elevated" | "exceeds" | null;
  rectangularEquivalents: Array<{ width: number; height: number; aspectRatio: number; equivDiameter: number }>;
}

export interface DuctSizingInputs {
  cfm: number;
  frictionTarget: number;
  tempF?: number;
  altitudeFt?: number;
  maxVelocity?: number;
}

export function sizeDuct(inputs: DuctSizingInputs): DuctSizingResult | null {
  if (inputs.cfm <= 0 || inputs.frictionTarget <= 0) return null;
  const density = airDensity(inputs.tempF ?? 70, inputs.altitudeFt ?? 0);
  const exact = exactDiameterInches(inputs.cfm, inputs.frictionTarget, density);
  if (!Number.isFinite(exact)) return null;
  const standard = nearestStandardRound(exact);
  const velocity = velocityFpm(inputs.cfm, standard);
  const friction = frictionLossPerHundredFt(standard, velocity, density);

  let warning: DuctSizingResult["velocityWarning"] = null;
  if (inputs.maxVelocity) {
    if (velocity > inputs.maxVelocity) warning = "exceeds";
    else if (velocity > 0.9 * inputs.maxVelocity) warning = "elevated";
    else warning = "ok";
  }

  return {
    cfm: inputs.cfm,
    frictionTarget: inputs.frictionTarget,
    density,
    exactDiameter: exact,
    standardDiameter: standard,
    velocityAtStandard: velocity,
    frictionAtStandard: friction,
    velocityWarning: warning,
    rectangularEquivalents: rectangularEquivalents(standard),
  };
}
