#!/usr/bin/env node
/**
 * Wagner-form ancillary vapor-pressure equation → PT chart generator.
 *
 * Used for refrigerants where a published Helmholtz EOS exists but the CoolProp
 * WASM build does not include it. The Wagner ancillary equation form is:
 *
 *   ln(p_sat / p_c) = (T_c / T) * Σᵢ Nᵢ * τ^tᵢ      where τ = 1 − T/T_c
 *
 * Coefficients (N_i, t_i, T_c, p_c) come from the primary source paper for
 * that refrigerant. Examples:
 *   - R-1224yd(Z): Akasaka & Lemmon (2023), International Journal of
 *     Thermophysics 44, 166. doi:10.1007/s10765-023-03266-3
 *   - R-1234ze(Z): Akasaka et al. (2019), J. Chem. Eng. Data 64(11), 4679-4691.
 *
 * Per project policy: this script generates values from PUBLISHED coefficients
 * only. It does not invent or interpolate from incomplete data sources.
 *
 * USAGE:
 *   node scripts/wagner-eos-to-pt.mjs <refrigerant-slug>
 *
 * The script reads coefficient definitions from data/manufacturer-blends/<slug>.json
 * (looks for a "wagnerEos" object) and writes the computed ptChart back to the
 * same file.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const MANUAL_DIR = path.join(ROOT, "data", "manufacturer-blends");

const PSI_PER_PA = 1 / 6894.757;
const KPA_PER_PA = 1 / 1000;
const PSIG_OFFSET = 14.696;
const KPAG_OFFSET = 101.325;
const TEMP_F_MIN = -40;
const TEMP_F_MAX = 150;

const fToK = (f) => ((f - 32) * 5) / 9 + 273.15;
const kToC = (k) => k - 273.15;
const paToPsig = (p) => p * PSI_PER_PA - PSIG_OFFSET;
const paToKpag = (p) => p * KPA_PER_PA - KPAG_OFFSET;
const round = (n, d) => {
  if (n === null || n === undefined || !Number.isFinite(n)) return null;
  const f = 10 ** d;
  return Math.round(n * f) / f;
};

/**
 * Wagner-form vapor pressure ancillary equation.
 * Returns pressure in Pa for given temperature in K.
 */
function wagnerPsat(T_K, eos) {
  const { Tc_K, pc_Pa, N, t } = eos;
  if (T_K >= Tc_K) return null;
  const tau = 1 - T_K / Tc_K;
  let sum = 0;
  for (let i = 0; i < N.length; i++) {
    sum += N[i] * Math.pow(tau, t[i]);
  }
  const ratio = (Tc_K / T_K) * sum;
  return pc_Pa * Math.exp(ratio);
}

function generatePtChart(eos, tMinFOverride) {
  const points = [];
  const tMinF = tMinFOverride ?? TEMP_F_MIN;
  for (let tempF = tMinF; tempF <= TEMP_F_MAX; tempF++) {
    const tempK = fToK(tempF);
    if (tempK >= eos.Tc_K) break;
    const pPa = wagnerPsat(tempK, eos);
    if (!pPa || !Number.isFinite(pPa) || pPa <= 0) continue;
    const bubPsig = paToPsig(pPa);
    const bubKpag = paToKpag(pPa);
    points.push({
      tempF,
      tempC: round(kToC(tempK), 1),
      bubblePsig: round(bubPsig, 2),
      dewPsig: round(bubPsig, 2),
      bubbleKpag: round(bubKpag, 1),
      dewKpag: round(bubKpag, 1),
      displayPsig: round(bubPsig, 2),
      displayKpag: round(bubKpag, 1),
    });
  }
  return points;
}

function main() {
  const slug = process.argv[2];
  if (!slug) {
    console.error("Usage: node scripts/wagner-eos-to-pt.mjs <slug>");
    process.exit(1);
  }
  const filePath = path.join(MANUAL_DIR, `${slug}.json`);
  if (!fs.existsSync(filePath)) {
    console.error(`No manufacturer-blend file at ${filePath}`);
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const eos = data.wagnerEos;
  if (!eos) {
    console.error(
      `No "wagnerEos" object in ${filePath}. Required fields:\n` +
        `  Tc_K (number)\n  pc_Pa (number)\n  N (number[])\n  t (number[])\n` +
        `  reference (citation string)\n  tMinF (optional number)`,
    );
    process.exit(1);
  }
  if (!eos.Tc_K || !eos.pc_Pa || !Array.isArray(eos.N) || !Array.isArray(eos.t) || eos.N.length !== eos.t.length) {
    console.error("Invalid wagnerEos object: needs Tc_K, pc_Pa, N[], t[] with matching length");
    process.exit(1);
  }
  const points = generatePtChart(eos, eos.tMinF);
  if (points.length === 0) {
    console.error("Generator produced 0 points — check coefficients and Tc_K");
    process.exit(1);
  }
  data.ptChart = points;
  data.ptSource = eos.reference;
  data.ptSourceUrl = eos.referenceUrl ?? data.ptSourceUrl;
  data.verifiedBy = `Computed from published Wagner-form ancillary equation in ${eos.reference}`;
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
  console.log(`✓ ${slug}: ${points.length} PT points written to ${filePath}`);
  console.log(`  Range: ${points[0].tempF}°F (${points[0].bubblePsig} PSIG) → ${points[points.length - 1].tempF}°F (${points[points.length - 1].bubblePsig} PSIG)`);
  console.log(`  Source: ${eos.reference}`);
}

main();
