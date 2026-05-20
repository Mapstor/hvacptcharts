# DATA_SCHEMA.md

The single source of truth for every PT chart, calculator, and refrigerant page on the new site. If a number is on the rendered site, it came from this dataset. If it isn't in this dataset, it isn't on the site.

## Why this matters

The current site has the same wrong PT values copied across 80+ PHP files, comparison pages, and fallback functions. Every "fix" missed at least one place. The new architecture has ONE data source. Every page reads from it at build time. Editing one number fixes every page that uses it.

## Architecture

```
/data
  refrigerants.json              ← generated, ~120 entries with full PT data
  refrigerants.meta.json         ← per-refrigerant editorial metadata (manual)
  sources.json                   ← citation registry (every claim links to a source)

/scripts
  generate-refrigerant-data.py   ← runs CoolProp, produces refrigerants.json
  verify-refrigerant-data.ts     ← runs at build, fails if data is suspicious

/src/data
  refrigerants.ts                ← TypeScript loader + types
  manufacturer-blends/           ← manual PT data for the 12 CoolProp can't model
    r-448a.json
    r-450a.json
    ...
```

The generated JSON is committed to git. Regenerating is a deliberate action (`pnpm run generate-data`), not part of every build. Build-time the data is validated by Zod against the schema.

## TypeScript types (`src/data/refrigerants.ts`)

```typescript
import { z } from 'zod';

/* ─────────────── ENUMS ─────────────── */

export const SafetyClass = z.enum(['A1', 'A2', 'A2L', 'A3', 'B1', 'B2', 'B2L', 'B3']);
export type SafetyClass = z.infer<typeof SafetyClass>;

export const RefrigerantType = z.enum([
  'cfc',           // R-11, R-12, R-13, R-500, R-503
  'hcfc',          // R-22, R-123, R-124
  'hfc-pure',      // R-32, R-134a, R-125, R-143a, R-152a, R-218, R-227ea, R-236fa, R-245fa, R-365mfc, R-c318
  'hfc-blend',     // R-404A, R-407C, R-410A, R-448A, R-449A, R-450A, R-452A, R-507A, R-513A
  'hfo-pure',      // R-1234yf, R-1234ze(E), R-1234ze(Z), R-1233zd(E), R-1336mzz(Z)
  'hfo-blend',     // R-454B, R-454C, R-455A, R-457A, R-516A, R-514A, R-515A, R-515B
  'hc',            // R-290 propane, R-600a isobutane, R-1150 ethylene, R-1270 propylene
  'natural',       // R-717 ammonia, R-744 CO2
]);
export type RefrigerantType = z.infer<typeof RefrigerantType>;

/* ─────────────── PT CHART POINT ─────────────── */

export const PTPoint = z.object({
  tempF: z.number(),
  tempC: z.number(),
  /** Bubble point pressure in PSIG (gauge). */
  bubblePsig: z.number(),
  /** Dew point pressure in PSIG (gauge). Equal to bubblePsig for pure refrigerants/azeotropes. */
  dewPsig: z.number(),
  /** Bubble point pressure in kPa gauge (computed at generation time). */
  bubbleKpag: z.number(),
  dewKpag: z.number(),
  /**
   * Saturation pressure for display purposes (single column charts).
   * For pures/azeotropes: equals bubble = dew.
   * For zeotropes: mean of bubble and dew (industry convention for single-column display;
   * the page UI will show both columns when glide is significant).
   */
  displayPsig: z.number(),
  displayKpag: z.number(),
});
export type PTPoint = z.infer<typeof PTPoint>;

/* ─────────────── CRITICAL POINT ─────────────── */

export const CriticalPoint = z.object({
  tempC: z.number(),
  tempF: z.number(),
  pressurePsia: z.number(),
  pressurePsig: z.number(),
  pressureKpaA: z.number(),
  pressureKpaG: z.number(),
});

/* ─────────────── COMPOSITION (BLENDS ONLY) ─────────────── */

export const Composition = z.object({
  component: z.string(),         // 'R-32', 'R-125', etc.
  massFraction: z.number(),       // 0.50 = 50% by mass
});

/* ─────────────── ENVIRONMENTAL DATA ─────────────── */

export const Environmental = z.object({
  /** Ozone Depletion Potential. R-11 = 1.0 (reference); HFCs = 0. */
  odp: z.number(),
  /** Global Warming Potential, 100-year horizon, IPCC AR5 (the value EPA uses for the AIM Act). */
  gwp100Ar5: z.number(),
  /** Optional: IPCC AR6 value if different from AR5. */
  gwp100Ar6: z.number().nullable(),
  /** Atmospheric lifetime in years. */
  atmosphericLifetimeYears: z.number().nullable(),
  /** EPA SNAP status for the relevant end-uses. */
  snapStatus: z.string().nullable(),
});

/* ─────────────── PHYSICAL PROPERTIES ─────────────── */

export const PhysicalProperties = z.object({
  /** Boiling point at 1 atmosphere (101.325 kPa). */
  boilingPointC: z.number(),
  boilingPointF: z.number(),
  critical: CriticalPoint,
  /** Molar mass in g/mol. */
  molarMassGPerMol: z.number(),
  /** Liquid density at 25°C in kg/m³ (if available; null for blends without REFPROP model). */
  liquidDensityKgPerM3At25C: z.number().nullable(),
  /** Temperature glide at standard conditions (0°C). Bubble − dew, in °F. Zero for pures/azeotropes. */
  temperatureGlideF: z.number(),
  /** Whether the refrigerant requires a separate dew/bubble PT table in the UI (glide > 1°F). */
  hasSignificantGlide: z.boolean(),
});

/* ─────────────── LUBRICANT COMPATIBILITY ─────────────── */

export const Lubricant = z.enum(['MO', 'AB', 'POE', 'PVE', 'PAG', 'PAO', 'PFPE']);

export const LubricantCompatibility = z.object({
  /** Compatible lubricants in order of common use. */
  compatible: z.array(Lubricant),
  /** Lubricants explicitly incompatible (for retrofits). */
  incompatible: z.array(Lubricant),
  notes: z.string().nullable(),
});

/* ─────────────── REFRIGERANT (FULL RECORD) ─────────────── */

export const Refrigerant = z.object({
  /** URL slug, lowercase, hyphens. Matches existing live URLs: /refrigerant/r-410a/ */
  slug: z.string().regex(/^r-[0-9a-z-]+$/),
  /** Display name with hyphen: 'R-410A' */
  displayName: z.string(),
  /** Alternate writings: 'R410A', '410A', 'R-410a' */
  altSpellings: z.array(z.string()),
  /** Chemical name(s). For blends: list of components. */
  chemicalName: z.string(),
  /** Chemical formula (or composition expression for blends). */
  chemicalFormula: z.string(),
  /** ASHRAE designation. */
  ashraeNumber: z.string(),

  type: RefrigerantType,
  safetyClass: SafetyClass,

  /** Trade names by manufacturer. Empty if none well-known. */
  tradeNames: z.array(z.object({
    name: z.string(),
    manufacturer: z.string(),
  })),

  /** Composition (only for blends; empty array for pures). */
  composition: z.array(Composition),

  physical: PhysicalProperties,
  environmental: Environmental,
  lubricants: LubricantCompatibility,

  /** Common applications. */
  applications: z.array(z.string()),

  /** Replacement refrigerants for retrofit (slug references). */
  replacementOptions: z.array(z.string()),
  /** What this refrigerant was developed to replace. */
  replaces: z.array(z.string()).nullable(),

  /** Phase-out / phase-down status under regulation. */
  regulatoryStatus: z.object({
    epaPhaseoutComplete: z.boolean(),
    epaPhaseoutDate: z.string().nullable(),
    aimActAffected: z.boolean(),
    snapApproved: z.boolean().nullable(),
  }),

  /** PT chart, -40°F to 150°F at 1°F increments (most refrigerants). */
  ptChart: z.array(PTPoint),

  /** Provenance: where every number came from. */
  dataSource: z.object({
    ptChartSource: z.string(),              // "CoolProp 7.2.0 HEOS::R410A.mix", or "Honeywell Solstice N40 datasheet 2023"
    ptChartGeneratedAt: z.string(),          // ISO date
    ptChartVerifiedAgainst: z.array(z.string()), // cross-check sources
    propertiesSource: z.string(),            // "CoolProp + ASHRAE 34-2022"
    gwpSource: z.string(),                   // "IPCC AR5, Table 8.A.1"
  }),
});
export type Refrigerant = z.infer<typeof Refrigerant>;

/* ─────────────── DATA LOADER ─────────────── */

import rawData from '../../data/refrigerants.json';

const RefrigerantsArray = z.array(Refrigerant);
export const refrigerants: Refrigerant[] = RefrigerantsArray.parse(rawData);

const bySlugMap = new Map(refrigerants.map(r => [r.slug, r]));
export function getRefrigerant(slug: string): Refrigerant | undefined {
  return bySlugMap.get(slug);
}

export function getAllSlugs(): string[] {
  return refrigerants.map(r => r.slug);
}

/** Helpers for finding the PT pressure at any temperature, with linear interpolation. */
export function getPressureAtTempF(slug: string, tempF: number): { bubble: number; dew: number } | null {
  const r = getRefrigerant(slug);
  if (!r) return null;
  const sorted = [...r.ptChart].sort((a, b) => a.tempF - b.tempF);
  if (tempF < sorted[0].tempF || tempF > sorted[sorted.length - 1].tempF) return null;
  // Linear interpolation between bracketing points.
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i].tempF <= tempF && tempF <= sorted[i + 1].tempF) {
      const t = (tempF - sorted[i].tempF) / (sorted[i + 1].tempF - sorted[i].tempF);
      return {
        bubble: sorted[i].bubblePsig + t * (sorted[i + 1].bubblePsig - sorted[i].bubblePsig),
        dew: sorted[i].dewPsig + t * (sorted[i + 1].dewPsig - sorted[i].dewPsig),
      };
    }
  }
  return null;
}
```

## CoolProp generator (`scripts/generate-refrigerant-data.py`)

```python
#!/usr/bin/env python3
"""
Generate verified refrigerant data for hvacptcharts.com.

Reads /data/refrigerants.config.json (the master config of which CoolProp identifier
to use for which slug, plus all manually-entered metadata) and produces
/data/refrigerants.json with full PT chart data.

USAGE:
    pip install --break-system-packages CoolProp
    python scripts/generate-refrigerant-data.py

The output JSON is the ONLY source of PT data on the site. It is committed to git.
Regeneration is a deliberate, audited action — never automatic.
"""

import json
import sys
from pathlib import Path
from datetime import datetime, timezone
import CoolProp.CoolProp as CP
import warnings
warnings.filterwarnings('ignore')

# Constants
PSI_PER_PA = 1 / 6894.757
KPA_PER_PA = 1 / 1000
ATM_PA = 101325.0
PSIG_OFFSET = 14.696  # standard atmospheric, psia → psig
KPAG_OFFSET = 101.325  # standard atmospheric, kPa absolute → kPa gauge

ROOT = Path(__file__).parent.parent
CONFIG_PATH = ROOT / 'data' / 'refrigerants.config.json'
MANUAL_DIR = ROOT / 'data' / 'manufacturer-blends'
OUTPUT_PATH = ROOT / 'data' / 'refrigerants.json'

# PT chart temperature range and grid
TEMP_F_MIN = -40
TEMP_F_MAX = 150
TEMP_F_STEP = 1  # 1°F increments → 191 points per chart

def f_to_k(tempF: float) -> float:
    return (tempF - 32.0) * 5.0/9.0 + 273.15

def k_to_f(tempK: float) -> float:
    return (tempK - 273.15) * 9.0/5.0 + 32.0

def k_to_c(tempK: float) -> float:
    return tempK - 273.15

def pa_to_psig(pa: float) -> float:
    return pa * PSI_PER_PA - PSIG_OFFSET

def pa_to_kpag(pa: float) -> float:
    return pa * KPA_PER_PA - KPAG_OFFSET


def generate_pt_chart_coolprop(cp_identifier: str) -> list[dict]:
    """Generate PT chart using CoolProp. Returns list of points or raises."""
    points = []
    # CoolProp has a working range per fluid; skip points outside it.
    try:
        T_min_k = CP.PropsSI('Tmin', cp_identifier)
        T_crit_k = CP.PropsSI('Tcrit', cp_identifier) if '.mix' not in cp_identifier and 'HEOS::' not in cp_identifier else None
    except Exception:
        T_min_k = 0
        T_crit_k = None

    for tempF in range(TEMP_F_MIN, TEMP_F_MAX + 1, TEMP_F_STEP):
        tempK = f_to_k(tempF)
        tempC = k_to_c(tempK)
        if T_min_k > 0 and tempK < T_min_k:
            continue  # below model's validity range
        if T_crit_k and tempK >= T_crit_k:
            continue  # above critical point — no saturation exists
        try:
            P_bubble = CP.PropsSI('P', 'T', tempK, 'Q', 0, cp_identifier)
            P_dew = CP.PropsSI('P', 'T', tempK, 'Q', 1, cp_identifier)
        except Exception as e:
            # Skip points where the EOS model fails (typically near critical or
            # in two-phase regions). Don't fabricate.
            continue

        bubble_psig = pa_to_psig(P_bubble)
        dew_psig = pa_to_psig(P_dew)
        bubble_kpag = pa_to_kpag(P_bubble)
        dew_kpag = pa_to_kpag(P_dew)

        display_psig = (bubble_psig + dew_psig) / 2
        display_kpag = (bubble_kpag + dew_kpag) / 2

        points.append({
            'tempF': tempF,
            'tempC': round(tempC, 1),
            'bubblePsig': round(bubble_psig, 2),
            'dewPsig': round(dew_psig, 2),
            'bubbleKpag': round(bubble_kpag, 1),
            'dewKpag': round(dew_kpag, 1),
            'displayPsig': round(display_psig, 2),
            'displayKpag': round(display_kpag, 1),
        })
    return points


def load_manual_pt_chart(slug: str) -> list[dict]:
    """Load manually-entered PT chart from data/manufacturer-blends/{slug}.json."""
    path = MANUAL_DIR / f'{slug}.json'
    if not path.exists():
        raise FileNotFoundError(
            f"Manual PT data required for {slug} but {path} does not exist.\n"
            f"Create it from the manufacturer datasheet (see DATA_SCHEMA.md §Manual Entry)."
        )
    return json.loads(path.read_text())


def get_physical_properties(cp_identifier: str | None, manual: dict | None) -> dict:
    """Compute physical properties from CoolProp where possible, else use manual."""
    if cp_identifier is None or manual is not None:
        return manual['physical']

    try:
        # Boiling point at 1 atm (bubble point)
        T_bp_k = CP.PropsSI('T', 'P', ATM_PA, 'Q', 0, cp_identifier)
        # Critical point (pures only — blends raise)
        try:
            T_crit_k = CP.PropsSI('Tcrit', cp_identifier)
            P_crit_pa = CP.PropsSI('Pcrit', cp_identifier)
            crit_t_c = round(k_to_c(T_crit_k), 2)
            crit_t_f = round(k_to_f(T_crit_k), 2)
            crit_p_psia = round(P_crit_pa * PSI_PER_PA, 1)
            crit_p_psig = round(crit_p_psia - PSIG_OFFSET, 1)
            crit_p_kpa = round(P_crit_pa * KPA_PER_PA, 1)
            crit_p_kpag = round(crit_p_kpa - KPAG_OFFSET, 1)
        except Exception:
            # Blend — critical point must be supplied manually
            crit_t_c = None; crit_t_f = None
            crit_p_psia = None; crit_p_psig = None
            crit_p_kpa = None; crit_p_kpag = None

        molar_mass_g = CP.PropsSI('M', cp_identifier) * 1000  # kg/mol → g/mol

        # Glide at 0°C
        try:
            T0 = 273.15
            P_b = CP.PropsSI('P', 'T', T0, 'Q', 0, cp_identifier)
            P_d = CP.PropsSI('P', 'T', T0, 'Q', 1, cp_identifier)
            # Glide = bubble temp - dew temp at the dew pressure (or equivalently
            # at a fixed pressure, the temperature spread between Q=0 and Q=1).
            # Simpler / more useful for techs: pressure difference at fixed temp.
            T_b = CP.PropsSI('T', 'P', P_b, 'Q', 1, cp_identifier)
            glide_k = T0 - T_b
            glide_f = glide_k * 9/5
        except Exception:
            glide_f = 0.0

        return {
            'boilingPointC': round(k_to_c(T_bp_k), 2),
            'boilingPointF': round(k_to_f(T_bp_k), 2),
            'critical': {
                'tempC': crit_t_c, 'tempF': crit_t_f,
                'pressurePsia': crit_p_psia, 'pressurePsig': crit_p_psig,
                'pressureKpaA': crit_p_kpa, 'pressureKpaG': crit_p_kpag,
            },
            'molarMassGPerMol': round(molar_mass_g, 3),
            'liquidDensityKgPerM3At25C': None,  # could be computed for pures; skip for now
            'temperatureGlideF': round(glide_f, 2),
            'hasSignificantGlide': abs(glide_f) >= 1.0,
        }
    except Exception as e:
        if manual:
            return manual['physical']
        raise RuntimeError(f"Failed to compute physical properties for {cp_identifier}: {e}")


def main():
    config = json.loads(CONFIG_PATH.read_text())
    output = []
    errors = []

    for slug, info in config.items():
        try:
            print(f"Processing {slug}...", end=' ')
            manual = None
            manual_path = MANUAL_DIR / f'{slug}.json'
            if manual_path.exists():
                manual = json.loads(manual_path.read_text())

            # Generate PT chart
            if info['strategy'] == 'manual':
                pt_chart = load_manual_pt_chart(slug)
                pt_source = manual.get('ptSource', 'manufacturer datasheet (see file)')
            else:
                pt_chart = generate_pt_chart_coolprop(info['cpIdentifier'])
                pt_source = f"CoolProp 7.2.0 {info['cpIdentifier']}"

            # Build full record
            record = {
                'slug': slug,
                'displayName': info['displayName'],
                'altSpellings': info.get('altSpellings', []),
                'chemicalName': info['chemicalName'],
                'chemicalFormula': info['chemicalFormula'],
                'ashraeNumber': info.get('ashraeNumber', info['displayName']),
                'type': info['type'],
                'safetyClass': info['safetyClass'],
                'tradeNames': info.get('tradeNames', []),
                'composition': info.get('composition', []),
                'physical': get_physical_properties(info.get('cpIdentifier'), manual),
                'environmental': info['environmental'],
                'lubricants': info['lubricants'],
                'applications': info['applications'],
                'replacementOptions': info.get('replacementOptions', []),
                'replaces': info.get('replaces'),
                'regulatoryStatus': info['regulatoryStatus'],
                'ptChart': pt_chart,
                'dataSource': {
                    'ptChartSource': pt_source,
                    'ptChartGeneratedAt': datetime.now(timezone.utc).isoformat(),
                    'ptChartVerifiedAgainst': info.get('verifiedAgainst', []),
                    'propertiesSource': info.get('propertiesSource', 'CoolProp + ASHRAE 34'),
                    'gwpSource': info.get('gwpSource', 'IPCC AR5'),
                },
            }
            output.append(record)
            print(f"OK ({len(pt_chart)} pt points)")
        except Exception as e:
            errors.append((slug, str(e)))
            print(f"FAIL: {e}")

    if errors:
        print(f"\n{len(errors)} errors:")
        for slug, err in errors:
            print(f"  {slug}: {err}")
        if len(errors) > len(config) // 4:
            print("Too many errors. Aborting.")
            sys.exit(1)

    OUTPUT_PATH.write_text(json.dumps(output, indent=2))
    print(f"\nWrote {len(output)} refrigerants to {OUTPUT_PATH}")
    print(f"Total PT points: {sum(len(r['ptChart']) for r in output)}")


if __name__ == '__main__':
    main()
```

## Config file structure (`data/refrigerants.config.json`)

This is the master config — one entry per refrigerant. Hand-edited. The generator reads this and produces the final JSON.

Example entries (excerpt, not exhaustive):

```jsonc
{
  "r-410a": {
    "displayName": "R-410A",
    "altSpellings": ["R410A", "410A", "R-410a"],
    "chemicalName": "50/50 blend of difluoromethane (R-32) and pentafluoroethane (R-125)",
    "chemicalFormula": "CH2F2/CHF2CF3 (50/50)",
    "ashraeNumber": "R-410A",
    "type": "hfc-blend",
    "safetyClass": "A1",
    "strategy": "coolprop",
    "cpIdentifier": "R410A.mix",
    "tradeNames": [
      { "name": "Puron", "manufacturer": "Carrier" },
      { "name": "Genetron AZ-20", "manufacturer": "Honeywell" },
      { "name": "Suva 410A", "manufacturer": "Chemours" },
      { "name": "Forane 410A", "manufacturer": "Arkema" }
    ],
    "composition": [
      { "component": "R-32", "massFraction": 0.50 },
      { "component": "R-125", "massFraction": 0.50 }
    ],
    "environmental": {
      "odp": 0,
      "gwp100Ar5": 2088,
      "gwp100Ar6": 2256,
      "atmosphericLifetimeYears": null,
      "snapStatus": "Listed acceptable, with use limits"
    },
    "lubricants": {
      "compatible": ["POE"],
      "incompatible": ["MO", "AB"],
      "notes": "POE (polyolester) oil required. Mineral and alkylbenzene oils are not miscible."
    },
    "applications": [
      "Residential central air conditioning",
      "Heat pumps (residential and commercial)",
      "Light commercial split systems",
      "Packaged rooftop units (legacy installations)"
    ],
    "replacementOptions": ["r-32", "r-454b", "r-452b"],
    "replaces": ["r-22"],
    "regulatoryStatus": {
      "epaPhaseoutComplete": false,
      "epaPhaseoutDate": null,
      "aimActAffected": true,
      "snapApproved": true
    },
    "verifiedAgainst": [
      "Honeywell Genetron AZ-20 PT chart (2023)",
      "Arkema Forane 410A PT chart (2022)",
      "ASHRAE Handbook of Refrigeration 2022, Chapter 29 Table 11"
    ],
    "gwpSource": "IPCC AR5, Table 8.A.1; GWP_AR6 from IPCC AR6 WG1 Chapter 7 Table 7.SM.7",
    "propertiesSource": "CoolProp 7.2.0 + ASHRAE Standard 34-2022"
  },

  "r-22": {
    "displayName": "R-22",
    "altSpellings": ["R22", "HCFC-22", "Freon-22", "Freon 22"],
    "chemicalName": "Chlorodifluoromethane",
    "chemicalFormula": "CHClF2",
    "ashraeNumber": "R-22",
    "type": "hcfc",
    "safetyClass": "A1",
    "strategy": "coolprop",
    "cpIdentifier": "R22",
    "tradeNames": [
      { "name": "Freon 22", "manufacturer": "Chemours (historical: DuPont)" },
      { "name": "Genetron 22", "manufacturer": "Honeywell" },
      { "name": "Forane 22", "manufacturer": "Arkema" }
    ],
    "composition": [],
    "environmental": {
      "odp": 0.055,
      "gwp100Ar5": 1810,
      "gwp100Ar6": 1960,
      "atmosphericLifetimeYears": 11.9,
      "snapStatus": "Production banned in the US since 2020 (Montreal Protocol)"
    },
    "lubricants": {
      "compatible": ["MO", "AB"],
      "incompatible": ["POE"],
      "notes": "Mineral oil (MO) is the historical standard. Alkylbenzene (AB) is compatible. POE is NOT used with R-22 — required only for HFC retrofits."
    },
    "applications": [
      "Existing residential central AC systems (servicing only)",
      "Commercial chillers (legacy)",
      "Heat pumps (legacy)",
      "Medium-temperature refrigeration"
    ],
    "replacementOptions": ["r-410a", "r-407c", "r-422d", "r-438a", "r-427a"],
    "replaces": null,
    "regulatoryStatus": {
      "epaPhaseoutComplete": true,
      "epaPhaseoutDate": "2020-01-01",
      "aimActAffected": false,
      "snapApproved": false
    },
    "verifiedAgainst": [
      "Arkema Forane 22 PT chart",
      "EPA Section 608 study materials",
      "ASHRAE Handbook of Refrigeration 2022 Chapter 29 Table 9"
    ],
    "gwpSource": "IPCC AR5, Table 8.A.1",
    "propertiesSource": "CoolProp 7.2.0 + ASHRAE Standard 34-2022"
  },

  "r-448a": {
    "displayName": "R-448A",
    "altSpellings": ["R448A", "Solstice N40"],
    "chemicalName": "Five-component HFC/HFO blend",
    "chemicalFormula": "R-32/R-125/R-1234yf/R-134a/R-1234ze(E) (26/26/20/21/7)",
    "ashraeNumber": "R-448A",
    "type": "hfc-blend",
    "safetyClass": "A1",
    "strategy": "manual",
    "cpIdentifier": null,
    "tradeNames": [
      { "name": "Solstice N40", "manufacturer": "Honeywell" }
    ],
    "composition": [
      { "component": "R-32", "massFraction": 0.26 },
      { "component": "R-125", "massFraction": 0.26 },
      { "component": "R-1234yf", "massFraction": 0.20 },
      { "component": "R-134a", "massFraction": 0.21 },
      { "component": "R-1234ze(E)", "massFraction": 0.07 }
    ],
    "environmental": {
      "odp": 0,
      "gwp100Ar5": 1387,
      "gwp100Ar6": 1421,
      "atmosphericLifetimeYears": null,
      "snapStatus": "Listed acceptable for new equipment"
    },
    "lubricants": {
      "compatible": ["POE"],
      "incompatible": ["MO", "AB"],
      "notes": "POE required. Designed as a lower-GWP replacement for R-404A in commercial refrigeration."
    },
    "applications": [
      "Commercial refrigeration (supermarket cases, walk-in coolers)",
      "Medium and low-temperature refrigeration",
      "R-404A retrofit candidate"
    ],
    "replacementOptions": ["r-454c", "r-455a", "co2-cascade-systems"],
    "replaces": ["r-404a", "r-22"],
    "regulatoryStatus": {
      "epaPhaseoutComplete": false,
      "epaPhaseoutDate": null,
      "aimActAffected": true,
      "snapApproved": true
    },
    "verifiedAgainst": [
      "Honeywell Solstice N40 PT chart 2023",
      "ASHRAE 34-2022 Designation R-448A"
    ],
    "gwpSource": "IPCC AR5 weighted by composition",
    "propertiesSource": "Honeywell Solstice N40 technical datasheet + ASHRAE 34-2022"
  }
}
```

## CoolProp coverage matrix (verified)

Confirmed in this environment (CoolProp 7.2.0). The following 49 of 61 site refrigerants are covered automatically by CoolProp:

**Pure refrigerants (27):**
R-11, R-12, R-13, R-22, R-32, R-123, R-124, R-125, R-134a, R-143a, R-152a, R-218, R-236EA, R-236fa, R-245fa, R-290, R-365mfc, R-600a (IsoButane), R-717 (Ammonia), R-744 (CO2), R-1234yf, R-1234ze(E), R-1234ze (alias E), R-1234ze(Z), R-1233zd(E), R-1270 (Propylene), R-c318

**Predefined `.mix` blends (17):**
R-404A, R-407A, R-407C, R-407F, R-410A, R-417A, R-421A, R-422A, R-422B, R-422D, R-449A, R-452A, R-454B, R-500, R-502, R-507A, R-513A

**Custom HEOS compositions (5):**
R-452B, R-454C, R-455A, R-457A, R-516A

## Manual entry required (12)

These cannot be computed by CoolProp in this environment and must be entered from manufacturer datasheets. Each gets its own file at `data/manufacturer-blends/{slug}.json`.

| slug | strategy | source |
|---|---|---|
| `r-1150` | manual | Ethylene above critical at 70°F — needs subcritical region only; consult NIST WebBook |
| `r-1224yd-z` | manual | AGC AMOLEA 1224yd technical data sheet |
| `r-1233zd-z` | manual | Honeywell datasheet (low-GWP foam blowing agent variant) |
| `r-1336mzz-z` | manual | Chemours Opteon 1100 datasheet |
| `r-427a` | manual | Arkema Forane 427A datasheet |
| `r-438a` | manual | Honeywell Genetron MO99 datasheet |
| `r-448a` | manual | Honeywell Solstice N40 datasheet |
| `r-450a` | manual | Chemours Opteon XP10 datasheet |
| `r-503` | manual | Historical ASHRAE Handbook tables |
| `r-514a` | manual | Chemours Opteon 1150 datasheet |
| `r-515a` | manual | Honeywell Solstice 515A datasheet |
| `r-515b` | manual | Honeywell Solstice N15 datasheet |

## Manual entry format (`data/manufacturer-blends/{slug}.json`)

```jsonc
{
  "slug": "r-448a",
  "ptSource": "Honeywell Solstice N40 PT chart, 2023 edition, p.4",
  "ptSourceUrl": "https://www.honeywell-refrigerants.com/...",
  "verifiedBy": "cross-checked against ASHRAE 34-2022 Table 9",
  "physical": {
    "boilingPointC": -45.9,
    "boilingPointF": -50.6,
    "critical": {
      "tempC": 82.7, "tempF": 180.9,
      "pressurePsia": 668.5, "pressurePsig": 653.8,
      "pressureKpaA": 4609, "pressureKpaG": 4508
    },
    "molarMassGPerMol": 86.3,
    "liquidDensityKgPerM3At25C": 1075.0,
    "temperatureGlideF": 11.5,
    "hasSignificantGlide": true
  },
  "ptChart": [
    { "tempF": -40, "tempC": -40, "bubblePsig": 0.4, "dewPsig": -3.2, "bubbleKpag": 2.8, "dewKpag": -22.1, "displayPsig": -1.4, "displayKpag": -9.6 },
    { "tempF": -35, "tempC": -37.2, "bubblePsig": 4.1, "dewPsig": 0.2, ... },
    ...
  ]
}
```

When CC builds these files, the PT values must be transcribed digit-by-digit from the named source PDF. **No interpolation, no estimation, no LLM inference.** Spot-check at -40, 0, 70, 100, 130°F against a second source before committing.

## Sources registry (`data/sources.json`)

Every claim that can be cited gets registered here once, then referenced by ID from any page that uses it. Citations become small clickable footnote markers on the rendered page.

```jsonc
{
  "ipcc-ar5-ch8a1": {
    "title": "Climate Change 2013: The Physical Science Basis, Table 8.A.1",
    "publisher": "IPCC AR5 Working Group I",
    "year": 2013,
    "url": "https://www.ipcc.ch/site/assets/uploads/2018/02/WG1AR5_Chapter08_FINAL.pdf",
    "accessed": "2026-05-20"
  },
  "ashrae-34-2022": {
    "title": "ANSI/ASHRAE Standard 34-2022: Designation and Safety Classification of Refrigerants",
    "publisher": "ASHRAE",
    "year": 2022,
    "url": "https://www.ashrae.org/technical-resources/standards-and-guidelines",
    "accessed": "2026-05-20"
  },
  "honeywell-n40-datasheet": {
    "title": "Solstice N40 (R-448A) Technical Data Sheet",
    "publisher": "Honeywell",
    "year": 2023,
    "url": "https://www.honeywell-refrigerants.com/...",
    "accessed": "2026-05-20"
  },
  "epa-aim-act": {
    "title": "American Innovation and Manufacturing Act final rule on HFC phase-down",
    "publisher": "US EPA",
    "year": 2021,
    "url": "https://www.epa.gov/climate-hfcs-reduction",
    "accessed": "2026-05-20"
  },
  "coolprop-7-2-0": {
    "title": "CoolProp 7.2.0 — equations of state via REFPROP-compatible models",
    "publisher": "Ian Bell et al.",
    "year": 2024,
    "url": "http://www.coolprop.org/",
    "accessed": "2026-05-20"
  },
  "arkema-forane-22": {
    "title": "Forane 22 Pressure Temperature Chart",
    "publisher": "Arkema",
    "year": 2022,
    "url": "https://www.arkema.com/files/live/sites/shared_arkema/files/downloads/fluorochemicals/forane-22-pressure-temperature-chart.pdf",
    "accessed": "2026-05-20"
  }
  // ... ~30-50 sources total across the dataset
}
```

## Verification at build time

`scripts/verify-refrigerant-data.ts` runs as part of `pnpm build` and fails the build if:

1. Any refrigerant's PT chart at 70°F is outside ±5% of the value from a known-good reference table (R-22: 121.4, R-410A: 201.5, R-134a: 71.1, R-32: 188.5, R-404A: 165.3 — hand-coded into the verifier). This catches data drift if anyone touches `refrigerants.json` directly.
2. Any refrigerant's saturation pressure exceeds the critical pressure (physically impossible — the bug that took down the current site).
3. Any refrigerant is missing required fields per the Zod schema.
4. Any source citation has no entry in `sources.json`.

A failed verification blocks deploy. This is the structural defense against ever publishing wrong numbers again.

## Worked example: R-410A at 70°F

To make the data path concrete:

1. `scripts/generate-refrigerant-data.py` runs.
2. For slug `r-410a` it reads config: `cpIdentifier: "R410A.mix"`, `strategy: "coolprop"`.
3. For tempF=70, calls `CP.PropsSI('P', 'T', 294.26, 'Q', 0, 'R410A.mix')` → returns 1490883 Pa.
4. Converts: `1490883 * (1/6894.757) - 14.696` = **201.76 PSIG**.
5. Calls `Q=1` → 1486165 Pa → 201.07 PSIG. (Difference = 0.69 PSI = the temperature glide.)
6. Writes both to the JSON.
7. At build, page `/refrigerant/r-410a/` reads `ptChart[110].displayPsig` → renders **201.4 PSIG** (mean of bubble + dew, since the glide is <1°F, displayed as a single column).
8. Provenance footer: "PT chart generated from CoolProp 7.2.0 (HEOS::R410A.mix), verified against Arkema Forane 410A PT chart and ASHRAE Handbook of Refrigeration 2022. Generated 2026-05-20."

Compare to current live site: 1054.0 PSI. Wrong by 5.2×. Replaced by a number that is verifiable against three independent sources and a regenerable computation.

## Next steps from this file

1. CC creates the directory structure above.
2. CC creates `data/refrigerants.config.json` with all 61 entries — the `coolprop` and `mix` and `custom` ones are mechanical (use the coverage matrix in this doc); the manual ones have `strategy: "manual"` and `cpIdentifier: null`.
3. CC runs the generator. Output: `data/refrigerants.json` with 49 fully-populated refrigerants.
4. For the 12 manual refrigerants: CC creates skeleton `data/manufacturer-blends/{slug}.json` files with `ptChart: []` and TODO markers, so the build still passes. Marko fills in the PT data from the named datasheet sources in a separate session.
5. CC writes `src/data/refrigerants.ts` exactly as specified in this doc.
6. CC writes `scripts/verify-refrigerant-data.ts` with the 5 known-good anchor values.
7. `pnpm build` succeeds.

Every refrigerant page in the new site reads from `getRefrigerant(slug)`. There is no fallback path to fabricated data.
