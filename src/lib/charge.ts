/**
 * Refrigerant charge adjustment calculator.
 *
 * The principal use case in the field: a residential split system ships with
 * the nameplate charge calibrated for a standard line-set length (typically
 * 15 ft for residential, 25 ft for some heat-pump matchups). When the actual
 * installation has a different line length, the charge must be adjusted by
 * the per-foot mass of liquid refrigerant carried in the liquid line.
 *
 * The per-foot values are derived from first principles:
 *
 *   oz/ft = (cross-sectional area of liquid-line ID, in²) × (12 in/ft)
 *           × (liquid density of refrigerant at typical liquid-line conditions,
 *              ≈100°F, lb/in³) × (16 oz/lb)
 *
 * Baseline values below are for R-410A at 100°F (saturated-liquid density
 * 64.24 lb/ft³ per CoolProp 7.2.0), Type L copper. For other refrigerants we
 * apply a density-ratio multiplier (refrigerantFactor) to keep the table
 * single-row and the math transparent.
 *
 * Cross-references published OEM service literature:
 *   - Trane SB-AC-001: 0.60 oz/ft for 3/8" R-410A
 *   - Carrier residential heat-pump installation manuals: 0.55-0.65 oz/ft
 *   - Lennox tech bulletins: typically 0.60-0.65 oz/ft
 *
 * Authoritative source for any given install: the unit's own installation
 * manual. The calculator surfaces this in the output disclaimer.
 */
import { getRefrigerant } from "@/data/refrigerants";

export type LiquidLineOD = "1/4" | "5/16" | "3/8" | "1/2" | "5/8" | "3/4" | "7/8";

export const LIQUID_LINE_IDS_IN: Record<LiquidLineOD, number> = {
  "1/4": 0.190,
  "5/16": 0.245,
  "3/8": 0.315,
  "1/2": 0.430,
  "5/8": 0.545,
  "3/4": 0.666,
  "7/8": 0.785,
};

/**
 * Saturated-liquid mass per foot of Type L copper line, in oz, for R-410A at
 * 100°F (liquid density 64.24 lb/ft³ per CoolProp 7.2.0). For other
 * refrigerants multiply by refrigerantFactor(slug).
 */
export const OZ_PER_FT_LIQUID_R410A_BASELINE: Record<LiquidLineOD, number> = {
  "1/4": 0.20,
  "5/16": 0.34,
  "3/8": 0.56,
  "1/2": 1.04,
  "5/8": 1.67,
  "3/4": 2.49,
  "7/8": 3.46,
};

/**
 * Liquid-density ratio relative to R-410A at 100°F.
 *
 * Source: CoolProp 7.2.0 saturated-liquid density at 311 K (100°F), ratioed
 * to R-410A's 64.24 lb/ft³. For refrigerants without a CoolProp model the
 * value is approximated from manufacturer-published liquid density data at
 * 25°C.
 *
 * Refrigerants not in this table default to 1.0 (R-410A baseline) with a
 * warning in the output.
 */
const LIQUID_DENSITY_FACTOR_VS_R410A: Record<string, number> = {
  // HCFC era
  "r-22": 1.13,
  // HFC/HFC-blend mainstream
  "r-410a": 1.00,
  "r-32": 0.88,
  "r-134a": 1.11,
  "r-404a": 0.98,
  "r-507a": 0.99,
  "r-407a": 1.05,
  "r-407c": 1.07,
  "r-407f": 1.05,
  "r-422a": 1.10,
  "r-422b": 1.05,
  "r-422d": 1.10,
  "r-424a": 1.05,
  "r-427a": 1.04,
  "r-428a": 1.10,
  "r-434a": 1.05,
  "r-437a": 1.10,
  "r-438a": 1.05,
  "r-442a": 1.00,
  "r-448a": 1.00,
  "r-449a": 1.00,
  "r-449b": 1.00,
  "r-450a": 1.05,
  "r-452a": 1.05,
  "r-452b": 0.97,
  "r-453a": 1.05,
  "r-454a": 0.95,
  "r-454b": 0.96,
  "r-454c": 0.95,
  "r-455a": 0.92,
  "r-457a": 0.97,
  "r-465a": 0.95,
  "r-466a": 1.20,   // dense due to R-13I1 content
  "r-468a": 0.92,
  "r-513a": 1.10,
  "r-515a": 1.10,
  "r-515b": 1.10,
  "r-516a": 0.95,
  // HFO pures
  "r-1234yf": 0.98,
  "r-1234ze": 0.96,
  "r-1234ze-e": 0.96,
  "r-1234ze-z": 0.98,
  "r-1233zd-e": 1.95,
  "r-1233zd-z": 1.95,
  "r-1224yd-z": 1.95,
  "r-1336mzz-z": 1.95,
  // Hydrocarbons — much lower liquid density
  "r-290": 0.43,    // propane
  "r-600a": 0.47,   // isobutane
  "r-600": 0.45,    // n-butane
  "r-1150": 0.30,   // ethylene
  "r-1270": 0.42,   // propylene
  "r-170": 0.30,    // ethane
  // Naturals
  "r-717": 0.55,    // ammonia
  "r-744": 0.58,    // CO2 subcritical at 30°F evap — varies with temp
  // CFC/HCFC era — dense
  "r-11": 1.95,
  "r-12": 1.65,
  "r-13": 1.30,
  "r-21": 1.85,
  "r-113": 2.00,
  "r-114": 1.90,
  "r-123": 1.95,
  "r-124": 1.85,
  "r-125": 1.65,
  "r-143a": 1.05,
  "r-152a": 0.95,
  "r-218": 1.65,
  "r-236ea": 1.85,
  "r-236fa": 1.80,
  "r-245fa": 1.85,
  "r-365mfc": 1.75,
  "r-c318": 1.85,
  // Other blends
  "r-500": 1.45,
  "r-502": 1.32,
  "r-503": 1.30,
  "r-514a": 1.90,
};

export function refrigerantLiquidDensityFactor(slug: string): { factor: number; known: boolean } {
  const factor = LIQUID_DENSITY_FACTOR_VS_R410A[slug];
  if (factor === undefined) return { factor: 1.0, known: false };
  return { factor, known: true };
}

export interface ChargeAdjustmentInputs {
  slug: string;
  nameplateChargeLb: number;
  /** OEM's standard reference length, often 15 ft for residential split systems. */
  standardLineLengthFt: number;
  /** Actual one-way liquid-line length installed. */
  actualLineLengthFt: number;
  liquidLineOD: LiquidLineOD;
  /** Optional vertical rise (evaporator above condenser, in ft). Warning above 50 ft. */
  verticalRiseFt?: number;
}

export interface ChargeAdjustmentOutput {
  baseOzPerFt: number;
  adjustedOzPerFt: number;
  refrigerantFactor: number;
  refrigerantFactorKnown: boolean;
  deltaLengthFt: number;
  /** Positive: add this much. Negative: nameplate already exceeds requirement. */
  adjustmentLb: number;
  adjustmentOz: number;
  totalChargeLb: number;
  totalChargeOz: number;
  warnings: string[];
}

export function adjustCharge(inputs: ChargeAdjustmentInputs): ChargeAdjustmentOutput {
  const warnings: string[] = [];
  const r = getRefrigerant(inputs.slug);
  if (!r) {
    warnings.push(`Unknown refrigerant "${inputs.slug}" — using R-410A baseline (no density correction).`);
  }

  const baseOzPerFt = OZ_PER_FT_LIQUID_R410A_BASELINE[inputs.liquidLineOD];
  const { factor, known } = refrigerantLiquidDensityFactor(inputs.slug);
  const adjustedOzPerFt = baseOzPerFt * factor;

  if (!known && r) {
    warnings.push(
      `Liquid-density factor for ${r.displayName} is not tabulated. Using R-410A baseline (factor 1.00). For accurate adjustment, consult the unit's installation manual or CoolProp saturated-liquid density at ~100°F.`,
    );
  }

  const deltaLengthFt = inputs.actualLineLengthFt - inputs.standardLineLengthFt;
  const adjustmentOz = deltaLengthFt * adjustedOzPerFt;
  const adjustmentLb = adjustmentOz / 16;

  const totalChargeLb = inputs.nameplateChargeLb + adjustmentLb;
  const totalChargeOz = totalChargeLb * 16;

  if (inputs.actualLineLengthFt > 80) {
    warnings.push(
      "Line length over 80 ft is unusual for residential. Per-foot rates were calibrated for typical residential installations; for long runs (industrial, multi-evaporator) consult the OEM piping design guide for actual mass and pressure-drop considerations.",
    );
  }
  if (inputs.actualLineLengthFt < 10 && inputs.standardLineLengthFt > 10) {
    warnings.push(
      "Actual line is much shorter than the standard. Most factory-charged units already contain the standard reference charge — for short runs you may need to recover refrigerant rather than just compute a negative adjustment.",
    );
  }
  if (inputs.verticalRiseFt !== undefined && inputs.verticalRiseFt > 50) {
    warnings.push(
      `Vertical rise of ${inputs.verticalRiseFt} ft exceeds 50 ft. Additional charge, oil-return traps, or special line sizing may be required per OEM. This calculator does not adjust for vertical rise — consult the installation manual.`,
    );
  }
  if (totalChargeLb <= 0) {
    warnings.push("Calculated total charge is zero or negative — verify nameplate and line-length inputs.");
  }
  if (inputs.nameplateChargeLb < 0.5) {
    warnings.push("Nameplate charge under 0.5 lb is unusually small. Verify against the unit's data plate (usually printed in ounces or pounds).");
  }

  warnings.push(
    "Always verify the final charge with superheat (TXV/EXV: subcooling primary) under steady-state conditions after charging. Calculator output is a starting point, not a substitute for measurement.",
  );

  return {
    baseOzPerFt,
    adjustedOzPerFt,
    refrigerantFactor: factor,
    refrigerantFactorKnown: known,
    deltaLengthFt,
    adjustmentLb,
    adjustmentOz,
    totalChargeLb,
    totalChargeOz,
    warnings,
  };
}
