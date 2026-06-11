/**
 * Pure-function psychrometric library.
 *
 * Implements the ASHRAE simplified psychrometric equation set as published
 * in ASHRAE Handbook of Fundamentals 2021, Chapter 1: Psychrometrics. All
 * equations are unit-explicit (IP units throughout — °F, psia, BTU/lb dry air,
 * grains H₂O / lb dry air) with comments showing the SI equivalents.
 *
 * Saturation vapor pressure uses the August–Roche–Magnus formulation
 * (the simpler relative of Hyland–Wexler 1983):
 *   Pws_kPa = 0.61078 * exp(17.27 * T_C / (T_C + 237.3))
 * Accuracy: ±0.3% in the HVAC operating range (-20°C to +60°C / 0°F to 140°F).
 * This is the form most widely used in HVAC calculators and is the basis
 * for psychrometric chart software including PsyCalc, Psychrometric+, and
 * the embedded calculator in Carrier HAP.
 *
 * Wet-bulb temperature is solved iteratively (bisection) because the
 * psychrometric equation linking WB to DB and W has no closed form. All
 * other quantities are direct algebraic derivations.
 */

// ────────────────────────────────────────────────────────────────────
// Unit conversions
// ────────────────────────────────────────────────────────────────────

export const fToC = (f: number) => (f - 32) * 5 / 9;
export const cToF = (c: number) => c * 9 / 5 + 32;
export const psiToKpa = (psi: number) => psi * 6.894757;
export const kpaToPsi = (kpa: number) => kpa / 6.894757;
export const inHgToKpa = (inHg: number) => inHg * 3.38639;

/** Atmospheric pressure at altitude (feet above sea level), in psia.
 *  ASHRAE Handbook of Fundamentals 2021, Equation 3, Chapter 1. */
export function atmPressureAtAltitudeFt(ftAboveSeaLevel: number): number {
  const p_kPa = 101.325 * Math.pow(1 - 2.25577e-5 * (ftAboveSeaLevel * 0.3048), 5.2559);
  return kpaToPsi(p_kPa);
}

// ────────────────────────────────────────────────────────────────────
// Saturation vapor pressure (Pws)
// ────────────────────────────────────────────────────────────────────

/** Saturation vapor pressure over liquid water, psia, given dry-bulb °F.
 *  Magnus formula; ±0.3% accuracy in HVAC range. */
export function satVaporPressurePsia(tempF: number): number {
  const tC = fToC(tempF);
  const pws_kPa = 0.61078 * Math.exp((17.27 * tC) / (tC + 237.3));
  return kpaToPsi(pws_kPa);
}

/** Inverse: dew-point °F such that Pws(Tdp) = pVapor_psia.
 *  Direct algebraic inverse of the Magnus form. */
export function dewPointFromVaporPressureF(pVaporPsia: number): number {
  const pws_kPa = psiToKpa(pVaporPsia);
  if (pws_kPa <= 0) return Number.NaN;
  const ln = Math.log(pws_kPa / 0.61078);
  const tC = (237.3 * ln) / (17.27 - ln);
  return cToF(tC);
}

// ────────────────────────────────────────────────────────────────────
// Humidity ratio (W), enthalpy (h), specific volume (v)
// ────────────────────────────────────────────────────────────────────

/** Humidity ratio W [lb water / lb dry air] from vapor pressure and total pressure.
 *  Mass ratio of dry air molecular weight (28.966) to water (18.015) = 0.621945.
 *  ASHRAE Handbook Fundamentals 2021, Equation 22, Chapter 1. */
export function humidityRatio(pVaporPsia: number, pAtmPsia: number): number {
  if (pVaporPsia >= pAtmPsia) return Number.POSITIVE_INFINITY;
  return 0.621945 * (pVaporPsia / (pAtmPsia - pVaporPsia));
}

/** Grains of moisture per pound dry air = W * 7000. */
export const wToGrains = (w: number) => w * 7000;

/** Enthalpy of moist air [BTU per lb dry air] given dry-bulb °F and humidity ratio W.
 *  h = 0.240 * Tdb + W * (1061 + 0.444 * Tdb)
 *  ASHRAE Handbook Fundamentals 2021, Equation 32, Chapter 1. */
export function enthalpyBtuPerLb(tempF: number, w: number): number {
  return 0.240 * tempF + w * (1061 + 0.444 * tempF);
}

/** Specific volume of moist air [ft³ per lb dry air] at given DB, W, and pressure.
 *  v = (R_da * T) / (Pa * (1 + 1.6078 * W))^(-1) ... simplified form:
 *  ASHRAE Handbook Fundamentals 2021, Equation 26, Chapter 1. */
export function specificVolumeFt3PerLb(tempF: number, w: number, pAtmPsia: number): number {
  const tR = tempF + 459.67; // absolute Rankine
  // R_da = 53.352 ft·lbf/(lbm·°R) for dry air; pressure in psf
  const pPsf = pAtmPsia * 144;
  return (53.352 * tR * (1 + 1.6078 * w)) / pPsf;
}

// ────────────────────────────────────────────────────────────────────
// Wet-bulb temperature (iterative)
// ────────────────────────────────────────────────────────────────────

/** Given DB °F and humidity ratio W [lb/lb], find WB °F by bisection.
 *  Solves the psychrometric equation:
 *    W = ((1093 - 0.556*Twb) * W_s(Twb) - 0.240*(Tdb - Twb)) / (1093 + 0.444*Tdb - Twb)
 *  ASHRAE Handbook Fundamentals 2021, Equation 33, Chapter 1.
 *  Returns NaN if no convergence in 60 iterations (shouldn't happen in HVAC range). */
export function wetBulbF(tempF: number, w: number, pAtmPsia: number): number {
  // WB is bounded by dew point (lower) and DB (upper)
  let lo = -50;
  let hi = tempF;
  // f(Twb) = predicted W from Twb - actual W. We want f(Twb) = 0.
  const f = (twb: number) => {
    const pwsWb = satVaporPressurePsia(twb);
    const wsWb = humidityRatio(pwsWb, pAtmPsia);
    const predicted = ((1093 - 0.556 * twb) * wsWb - 0.240 * (tempF - twb)) / (1093 + 0.444 * tempF - twb);
    return predicted - w;
  };
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const fm = f(mid);
    if (Math.abs(fm) < 1e-7 || hi - lo < 1e-3) return mid;
    if (fm > 0) hi = mid;
    else lo = mid;
  }
  return Number.NaN;
}

// ────────────────────────────────────────────────────────────────────
// Top-level: compute the full property set from any 2 of {DB, WB, RH, DP}
// ────────────────────────────────────────────────────────────────────

export interface PsychrometricState {
  /** Dry-bulb temperature, °F */
  tempDbF: number;
  /** Wet-bulb temperature, °F */
  tempWbF: number;
  /** Dew-point temperature, °F */
  tempDpF: number;
  /** Relative humidity, % (0-100) */
  rhPercent: number;
  /** Humidity ratio, lb water / lb dry air */
  humidityRatio: number;
  /** Humidity in grains H₂O / lb dry air (commonly used IP unit) */
  grainsPerLb: number;
  /** Vapor pressure, psia */
  vaporPressurePsia: number;
  /** Saturation vapor pressure at DB, psia */
  satVaporPressurePsia: number;
  /** Enthalpy, BTU per lb dry air */
  enthalpyBtuPerLb: number;
  /** Specific volume, ft³ per lb dry air */
  specificVolumeFt3PerLb: number;
  /** Atmospheric pressure used, psia */
  pAtmPsia: number;
}

export type PsychrometricInputMode = "DB_RH" | "DB_WB" | "DB_DP" | "WB_DP";

export interface PsychrometricInputs {
  mode: PsychrometricInputMode;
  tempDbF?: number;
  tempWbF?: number;
  rhPercent?: number;
  tempDpF?: number;
  pAtmPsia?: number;
}

export function computePsychrometricState(inputs: PsychrometricInputs): PsychrometricState | null {
  const pAtm = inputs.pAtmPsia ?? 14.696;
  let tempDbF: number;
  let pVapor: number;

  switch (inputs.mode) {
    case "DB_RH": {
      if (inputs.tempDbF === undefined || inputs.rhPercent === undefined) return null;
      tempDbF = inputs.tempDbF;
      const pws = satVaporPressurePsia(tempDbF);
      pVapor = (inputs.rhPercent / 100) * pws;
      break;
    }
    case "DB_WB": {
      if (inputs.tempDbF === undefined || inputs.tempWbF === undefined) return null;
      tempDbF = inputs.tempDbF;
      const tempWbF = inputs.tempWbF;
      const pwsWb = satVaporPressurePsia(tempWbF);
      const wsWb = humidityRatio(pwsWb, pAtm);
      const w = ((1093 - 0.556 * tempWbF) * wsWb - 0.240 * (tempDbF - tempWbF)) / (1093 + 0.444 * tempDbF - tempWbF);
      pVapor = (w * pAtm) / (0.621945 + w);
      break;
    }
    case "DB_DP": {
      if (inputs.tempDbF === undefined || inputs.tempDpF === undefined) return null;
      tempDbF = inputs.tempDbF;
      pVapor = satVaporPressurePsia(inputs.tempDpF);
      break;
    }
    case "WB_DP": {
      if (inputs.tempWbF === undefined || inputs.tempDpF === undefined) return null;
      // Iterate to find DB consistent with given WB and DP
      // (rare input combination but supported for completeness)
      const targetDp = inputs.tempDpF;
      let lo = inputs.tempWbF;
      let hi = inputs.tempWbF + 80;
      const targetPv = satVaporPressurePsia(targetDp);
      let converged = false;
      for (let i = 0; i < 60; i++) {
        const dbTry = (lo + hi) / 2;
        const pwsWb = satVaporPressurePsia(inputs.tempWbF);
        const wsWb = humidityRatio(pwsWb, pAtm);
        const wTry = ((1093 - 0.556 * inputs.tempWbF) * wsWb - 0.240 * (dbTry - inputs.tempWbF)) / (1093 + 0.444 * dbTry - inputs.tempWbF);
        const pvTry = (wTry * pAtm) / (0.621945 + wTry);
        if (Math.abs(pvTry - targetPv) < 1e-7) {
          tempDbF = dbTry;
          pVapor = targetPv;
          converged = true;
          break;
        }
        if (pvTry > targetPv) lo = dbTry;
        else hi = dbTry;
      }
      if (!converged) return null;
      tempDbF = (lo + hi) / 2;
      pVapor = targetPv;
      break;
    }
  }

  // Now derive all remaining properties from (tempDbF, pVapor, pAtm)
  const pwsDb = satVaporPressurePsia(tempDbF);
  if (pVapor > pwsDb) pVapor = pwsDb; // saturated; clamp
  const w = humidityRatio(pVapor, pAtm);
  const rh = (pVapor / pwsDb) * 100;
  const tempDpF = pVapor > 0 ? dewPointFromVaporPressureF(pVapor) : Number.NEGATIVE_INFINITY;
  const tempWbF = wetBulbF(tempDbF, w, pAtm);
  const h = enthalpyBtuPerLb(tempDbF, w);
  const v = specificVolumeFt3PerLb(tempDbF, w, pAtm);

  return {
    tempDbF,
    tempWbF,
    tempDpF,
    rhPercent: rh,
    humidityRatio: w,
    grainsPerLb: wToGrains(w),
    vaporPressurePsia: pVapor,
    satVaporPressurePsia: pwsDb,
    enthalpyBtuPerLb: h,
    specificVolumeFt3PerLb: v,
    pAtmPsia: pAtm,
  };
}
