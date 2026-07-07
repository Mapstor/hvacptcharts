#!/usr/bin/env node
/**
 * Node-based equivalent of scripts/generate-refrigerant-data.py.
 *
 * Uses the coolprop-node WebAssembly build of CoolProp 7.2.0 rather than the
 * Python wrapper. Output JSON is identical in shape and value to the Python
 * generator. Use this in environments where PyPI is unreachable.
 *
 * USAGE:
 *   pnpm add -D coolprop-node      (one-time)
 *   pnpm run generate-data         (runs this script)
 *
 * Reads:  data/refrigerants.config.json
 * Writes: data/refrigerants.json
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cp from "coolprop-node/src/cp.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CONFIG_PATH = path.join(ROOT, "data", "refrigerants.config.json");
const MANUAL_DIR = path.join(ROOT, "data", "manufacturer-blends");
const OUTPUT_PATH = path.join(ROOT, "data", "refrigerants.json");

const PSI_PER_PA = 1 / 6894.757;
const KPA_PER_PA = 1 / 1000;
const ATM_PA = 101325.0;
const PSIG_OFFSET = 14.696;
const KPAG_OFFSET = 101.325;

const TEMP_F_MIN = -40;
const TEMP_F_MAX = 150;
const TEMP_F_STEP = 1;

const fToK = (f) => ((f - 32) * 5) / 9 + 273.15;
const kToF = (k) => ((k - 273.15) * 9) / 5 + 32;
const kToC = (k) => k - 273.15;
const paToPsig = (p) => p * PSI_PER_PA - PSIG_OFFSET;
const paToKpag = (p) => p * KPA_PER_PA - KPAG_OFFSET;

const round = (n, d) => {
  if (n === null || n === undefined || !Number.isFinite(n)) return null;
  const f = 10 ** d;
  return Math.round(n * f) / f;
};

function safePropsSI(...args) {
  try {
    const v = cp.PropsSI(...args);
    if (!Number.isFinite(v)) return null;
    return v;
  } catch {
    return null;
  }
}

// Trivial properties (Tcrit, Pcrit, M, Tmin, Ttriple) take the 6-arg form
// in this CoolProp WASM build. Blends return Infinity (no single critical point
// along the critical locus) — we treat that as null.
function trivial(propName, fluid) {
  return safePropsSI(propName, "", 0, "", 0, fluid);
}

function generatePtChart(identifier) {
  const tMin = trivial("Tmin", identifier) ?? 0;
  const tCrit = trivial("Tcrit", identifier); // null for blends (no single critical point)

  // Pass 1: query CoolProp at every 1°F; collect (tempF, pBubPa, pDewPa) triples
  // where the call succeeded. For zeotropic .mix identifiers (R-407C, R-410A,
  // R-507A, etc.) the mixture Helmholtz solver periodically fails to converge
  // in the middle of the operating range even though it converges above AND
  // below — leaving 5-25-row middle-of-range holes that used to just drop
  // rows from the output (Task 2, 2026-07). We now record valid points and
  // interpolate the gaps in pass 2.
  const raw = [];
  for (let tempF = TEMP_F_MIN; tempF <= TEMP_F_MAX; tempF += TEMP_F_STEP) {
    const tempK = fToK(tempF);
    if (tMin && tempK < tMin) { raw.push({ tempF, tempK, valid: false }); continue; }
    if (tCrit && tempK >= tCrit) { raw.push({ tempF, tempK, valid: false }); continue; }
    const pBub = safePropsSI("P", "T", tempK, "Q", 0, identifier);
    const pDew = safePropsSI("P", "T", tempK, "Q", 1, identifier);
    if (pBub === null || pDew === null) { raw.push({ tempF, tempK, valid: false }); continue; }
    raw.push({ tempF, tempK, valid: true, pBub, pDew });
  }

  // Pass 2: linearly interpolate MIDDLE-OF-RANGE gaps between the last valid
  // point before the gap and the first valid point after. Leading gaps (below
  // the lowest valid temp) and trailing gaps (above the highest valid temp,
  // i.e. approaching the critical locus) stay dropped — extrapolation past a
  // phase-envelope discontinuity would fabricate values.
  const validIndices = raw.map((r, i) => (r.valid ? i : -1)).filter((i) => i >= 0);
  if (validIndices.length === 0) return [];
  const firstValid = validIndices[0];
  const lastValid = validIndices[validIndices.length - 1];

  const points = [];
  for (let i = firstValid; i <= lastValid; i++) {
    const r = raw[i];
    let pBub, pDew, interpolated = false;
    if (r.valid) {
      pBub = r.pBub;
      pDew = r.pDew;
    } else {
      // Find surrounding valid neighbors
      let before = i - 1;
      while (before >= 0 && !raw[before].valid) before--;
      let after = i + 1;
      while (after < raw.length && !raw[after].valid) after++;
      if (before < 0 || after >= raw.length) continue; // safety
      const b = raw[before];
      const a = raw[after];
      const frac = (r.tempF - b.tempF) / (a.tempF - b.tempF);
      pBub = b.pBub + (a.pBub - b.pBub) * frac;
      pDew = b.pDew + (a.pDew - b.pDew) * frac;
      interpolated = true;
    }
    const bubPsig = paToPsig(pBub);
    const dewPsig = paToPsig(pDew);
    const bubKpag = paToKpag(pBub);
    const dewKpag = paToKpag(pDew);
    const point = {
      tempF: r.tempF,
      tempC: round(kToC(r.tempK), 1),
      bubblePsig: round(bubPsig, 2),
      dewPsig: round(dewPsig, 2),
      bubbleKpag: round(bubKpag, 1),
      dewKpag: round(dewKpag, 1),
      displayPsig: round((bubPsig + dewPsig) / 2, 2),
      displayKpag: round((bubKpag + dewKpag) / 2, 1),
    };
    if (interpolated) point.interpolated = true;
    points.push(point);
  }
  return points;
}

function loadManualPtChart(slug) {
  const p = path.join(MANUAL_DIR, `${slug}.json`);
  if (!fs.existsSync(p)) {
    throw new Error(
      `Manual PT data required for ${slug} but ${p} does not exist. ` +
        `Create it from the named manufacturer datasheet (see docs/spec/01-DATA_SCHEMA.md §Manual Entry).`
    );
  }
  const data = JSON.parse(fs.readFileSync(p, "utf8"));
  return {
    ptChart: data.ptChart ?? [],
    ptSource: data.ptSource ?? "manufacturer datasheet (TBD)",
    manual: data,
  };
}

function nullCritical() {
  return {
    tempC: null, tempF: null,
    pressurePsia: null, pressurePsig: null,
    pressureKpaA: null, pressureKpaG: null,
  };
}

function computeCritical(identifier) {
  const tK = trivial("Tcrit", identifier);
  const pPa = trivial("Pcrit", identifier);
  if (tK === null || pPa === null) return null;
  return {
    tempC: round(kToC(tK), 2),
    tempF: round(kToF(tK), 2),
    pressurePsia: round(pPa * PSI_PER_PA, 1),
    pressurePsig: round(pPa * PSI_PER_PA - PSIG_OFFSET, 1),
    pressureKpaA: round(pPa * KPA_PER_PA, 1),
    pressureKpaG: round(pPa * KPA_PER_PA - KPAG_OFFSET, 1),
  };
}

function computePhysical(identifier, manual) {
  if (identifier === null || identifier === undefined) {
    if (manual?.physical) return manual.physical;
    return {
      boilingPointC: null, boilingPointF: null,
      critical: nullCritical(),
      molarMassGPerMol: null, liquidDensityKgPerM3At25C: null,
      temperatureGlideF: 0.0, hasSignificantGlide: false,
    };
  }

  const tBp = safePropsSI("T", "P", ATM_PA, "Q", 0, identifier);
  const boilingC = tBp !== null ? round(kToC(tBp), 2) : null;
  const boilingF = tBp !== null ? round(kToF(tBp), 2) : null;
  const critical = computeCritical(identifier) ?? nullCritical();
  const molarMass = trivial("M", identifier);
  const molarG = molarMass !== null ? round(molarMass * 1000, 3) : null;

  // Glide at 0°C (273.15K). For pures and azeotropes, this is ~0.
  const T0 = 273.15;
  const pBub0 = safePropsSI("P", "T", T0, "Q", 0, identifier);
  let glideF = 0.0;
  if (pBub0 !== null) {
    const tDew = safePropsSI("T", "P", pBub0, "Q", 1, identifier);
    if (tDew !== null) {
      const glideK = T0 - tDew;
      glideF = (glideK * 9) / 5;
    }
  }

  return {
    boilingPointC: boilingC,
    boilingPointF: boilingF,
    critical,
    molarMassGPerMol: molarG,
    liquidDensityKgPerM3At25C: null,
    temperatureGlideF: round(glideF, 2),
    hasSignificantGlide: Math.abs(glideF) >= 1.0,
  };
}

async function main() {
  await cp.init();

  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  const slugs = Object.keys(config);
  const out = [];
  const errors = [];

  for (const slug of slugs) {
    const info = config[slug];
    try {
      process.stdout.write(`Processing ${slug}... `);

      const manualPath = path.join(MANUAL_DIR, `${slug}.json`);
      const manual = fs.existsSync(manualPath) ? JSON.parse(fs.readFileSync(manualPath, "utf8")) : null;

      let ptChart, ptSource, physical;
      if (info.strategy === "manual") {
        const m = loadManualPtChart(slug);
        ptChart = m.ptChart;
        ptSource = m.ptSource;
        physical = computePhysical(null, manual);
      } else {
        ptChart = generatePtChart(info.cpIdentifier);
        ptSource = `CoolProp 7.2.0 ${info.cpIdentifier}`;
        physical = computePhysical(info.cpIdentifier, manual);
      }

      // Pass through dataStatus and primarySources from manufacturer-blends file
      const dataStatus = manual?.dataStatus ?? (ptChart.length > 0 ? "complete" : undefined);
      const primarySources = manual?.primarySources ?? undefined;

      out.push({
        slug,
        displayName: info.displayName,
        altSpellings: info.altSpellings ?? [],
        chemicalName: info.chemicalName,
        chemicalFormula: info.chemicalFormula,
        ashraeNumber: info.ashraeNumber ?? info.displayName,
        type: info.type,
        safetyClass: info.safetyClass,
        tradeNames: info.tradeNames ?? [],
        composition: info.composition ?? [],
        physical,
        environmental: info.environmental,
        lubricants: info.lubricants,
        applications: info.applications,
        replacementOptions: info.replacementOptions ?? [],
        replaces: info.replaces ?? null,
        regulatoryStatus: info.regulatoryStatus,
        ptChart,
        dataSource: {
          ptChartSource: ptSource,
          ptChartGeneratedAt: new Date().toISOString(),
          ptChartVerifiedAgainst: info.verifiedAgainst ?? [],
          propertiesSource: info.propertiesSource ?? "CoolProp + ASHRAE 34",
          gwpSource: info.gwpSource ?? "IPCC AR5",
          ...(dataStatus && { dataStatus }),
          ...(primarySources && { primarySources }),
        },
      });

      console.log(`OK (${ptChart.length} pt points)`);
    } catch (e) {
      errors.push([slug, e.message ?? String(e)]);
      console.log(`FAIL: ${e.message ?? e}`);
    }
  }

  if (errors.length) {
    console.log(`\n${errors.length} errors:`);
    for (const [slug, err] of errors) console.log(`  ${slug}: ${err}`);
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(out, null, 2));
  console.log(`\nWrote ${out.length} refrigerants to ${OUTPUT_PATH}`);
  console.log(`Total PT points: ${out.reduce((s, r) => s + r.ptChart.length, 0)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
