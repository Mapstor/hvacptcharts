#!/usr/bin/env python3
"""
Generate verified refrigerant data for hvacptcharts.com.

Reads /data/refrigerants.config.json (the master config of which CoolProp identifier
to use for which slug, plus all manually-entered metadata) and produces
/data/refrigerants.json with full PT chart data.

USAGE:
    pip install --break-system-packages CoolProp
    python3 scripts/generate-refrigerant-data.py

The output JSON is the ONLY source of PT data on the site. It is committed to git.
Regeneration is a deliberate, audited action — never automatic.

This script is the canonical path per docs/spec/01-DATA_SCHEMA.md. A Node-based
equivalent (scripts/generate-refrigerant-data.mjs) exists for environments where
PyPI is not reachable; both produce the same JSON.
"""

import json
import sys
from pathlib import Path
from datetime import datetime, timezone
import CoolProp.CoolProp as CP
import warnings
warnings.filterwarnings("ignore")

PSI_PER_PA = 1 / 6894.757
KPA_PER_PA = 1 / 1000
ATM_PA = 101325.0
PSIG_OFFSET = 14.696
KPAG_OFFSET = 101.325

ROOT = Path(__file__).parent.parent
CONFIG_PATH = ROOT / "data" / "refrigerants.config.json"
MANUAL_DIR = ROOT / "data" / "manufacturer-blends"
OUTPUT_PATH = ROOT / "data" / "refrigerants.json"

TEMP_F_MIN = -40
TEMP_F_MAX = 150
TEMP_F_STEP = 1


def f_to_k(t_f): return (t_f - 32.0) * 5.0 / 9.0 + 273.15
def k_to_f(t_k): return (t_k - 273.15) * 9.0 / 5.0 + 32.0
def k_to_c(t_k): return t_k - 273.15
def pa_to_psig(p): return p * PSI_PER_PA - PSIG_OFFSET
def pa_to_kpag(p): return p * KPA_PER_PA - KPAG_OFFSET


def generate_pt_chart(cp_identifier: str) -> list[dict]:
    """Generate PT chart from CoolProp. Skips points outside the model's range
    and points above the critical temperature."""
    points = []
    try:
        t_min_k = CP.PropsSI("Tmin", cp_identifier)
    except Exception:
        t_min_k = 0
    try:
        t_crit_k = CP.PropsSI("Tcrit", cp_identifier)
    except Exception:
        t_crit_k = None  # blends raise; fall through

    for temp_f in range(TEMP_F_MIN, TEMP_F_MAX + 1, TEMP_F_STEP):
        temp_k = f_to_k(temp_f)
        if t_min_k and temp_k < t_min_k:
            continue
        if t_crit_k and temp_k >= t_crit_k:
            continue
        try:
            p_bub = CP.PropsSI("P", "T", temp_k, "Q", 0, cp_identifier)
            p_dew = CP.PropsSI("P", "T", temp_k, "Q", 1, cp_identifier)
        except Exception:
            continue  # near critical, EOS may fail; skip, never fabricate

        bub_psig = pa_to_psig(p_bub)
        dew_psig = pa_to_psig(p_dew)
        bub_kpag = pa_to_kpag(p_bub)
        dew_kpag = pa_to_kpag(p_dew)

        points.append({
            "tempF": temp_f,
            "tempC": round(k_to_c(temp_k), 1),
            "bubblePsig": round(bub_psig, 2),
            "dewPsig": round(dew_psig, 2),
            "bubbleKpag": round(bub_kpag, 1),
            "dewKpag": round(dew_kpag, 1),
            "displayPsig": round((bub_psig + dew_psig) / 2, 2),
            "displayKpag": round((bub_kpag + dew_kpag) / 2, 1),
        })
    return points


def load_manual_pt_chart(slug: str) -> tuple[list[dict], str]:
    path = MANUAL_DIR / f"{slug}.json"
    if not path.exists():
        raise FileNotFoundError(
            f"Manual PT data required for {slug} but {path} does not exist. "
            f"Create it from the named manufacturer datasheet (see docs/spec/01-DATA_SCHEMA.md §Manual Entry)."
        )
    data = json.loads(path.read_text())
    return data.get("ptChart", []), data.get("ptSource", "manufacturer datasheet (TBD)")


def get_critical_point(cp_identifier: str) -> dict | None:
    try:
        t_crit_k = CP.PropsSI("Tcrit", cp_identifier)
        p_crit_pa = CP.PropsSI("Pcrit", cp_identifier)
        return {
            "tempC": round(k_to_c(t_crit_k), 2),
            "tempF": round(k_to_f(t_crit_k), 2),
            "pressurePsia": round(p_crit_pa * PSI_PER_PA, 1),
            "pressurePsig": round(p_crit_pa * PSI_PER_PA - PSIG_OFFSET, 1),
            "pressureKpaA": round(p_crit_pa * KPA_PER_PA, 1),
            "pressureKpaG": round(p_crit_pa * KPA_PER_PA - KPAG_OFFSET, 1),
        }
    except Exception:
        return None


def compute_physical(cp_identifier: str | None, manual: dict | None) -> dict:
    """Compute physical properties from CoolProp where possible; fall back to manual."""
    if cp_identifier is None:
        if manual and "physical" in manual:
            return manual["physical"]
        # Skeleton with nulls so the Zod loader doesn't blow up.
        return {
            "boilingPointC": None, "boilingPointF": None,
            "critical": {
                "tempC": None, "tempF": None,
                "pressurePsia": None, "pressurePsig": None,
                "pressureKpaA": None, "pressureKpaG": None,
            },
            "molarMassGPerMol": None, "liquidDensityKgPerM3At25C": None,
            "temperatureGlideF": 0.0, "hasSignificantGlide": False,
        }

    try:
        t_bp_k = CP.PropsSI("T", "P", ATM_PA, "Q", 0, cp_identifier)
        boiling_c = round(k_to_c(t_bp_k), 2)
        boiling_f = round(k_to_f(t_bp_k), 2)
    except Exception:
        boiling_c = boiling_f = None

    critical = get_critical_point(cp_identifier) or {
        "tempC": None, "tempF": None,
        "pressurePsia": None, "pressurePsig": None,
        "pressureKpaA": None, "pressureKpaG": None,
    }

    try:
        molar_mass = CP.PropsSI("M", cp_identifier) * 1000  # kg/mol → g/mol
    except Exception:
        molar_mass = None

    # Glide at 0°C; for pures and azeotropes this is ~0.
    try:
        t0 = 273.15
        p_bub_0 = CP.PropsSI("P", "T", t0, "Q", 0, cp_identifier)
        # Temperature at the bubble-pressure dew curve = bubble-temp shift across glide.
        t_dew_at_pbub = CP.PropsSI("T", "P", p_bub_0, "Q", 1, cp_identifier)
        glide_k = t0 - t_dew_at_pbub
        glide_f = glide_k * 9.0 / 5.0
    except Exception:
        glide_f = 0.0

    return {
        "boilingPointC": boiling_c,
        "boilingPointF": boiling_f,
        "critical": critical,
        "molarMassGPerMol": round(molar_mass, 3) if molar_mass is not None else None,
        "liquidDensityKgPerM3At25C": None,
        "temperatureGlideF": round(glide_f, 2),
        "hasSignificantGlide": abs(glide_f) >= 1.0,
    }


def main():
    config = json.loads(CONFIG_PATH.read_text())
    output = []
    errors = []

    for slug, info in config.items():
        try:
            print(f"Processing {slug}...", end=" ", flush=True)
            manual = None
            manual_path = MANUAL_DIR / f"{slug}.json"
            if manual_path.exists():
                manual = json.loads(manual_path.read_text())

            if info["strategy"] == "manual":
                pt_chart, pt_source = load_manual_pt_chart(slug)
                physical = compute_physical(None, manual)
            else:
                pt_chart = generate_pt_chart(info["cpIdentifier"])
                pt_source = f"CoolProp 7.2.0 {info['cpIdentifier']}"
                physical = compute_physical(info["cpIdentifier"], manual)

            record = {
                "slug": slug,
                "displayName": info["displayName"],
                "altSpellings": info.get("altSpellings", []),
                "chemicalName": info["chemicalName"],
                "chemicalFormula": info["chemicalFormula"],
                "ashraeNumber": info.get("ashraeNumber", info["displayName"]),
                "type": info["type"],
                "safetyClass": info["safetyClass"],
                "tradeNames": info.get("tradeNames", []),
                "composition": info.get("composition", []),
                "physical": physical,
                "environmental": info["environmental"],
                "lubricants": info["lubricants"],
                "applications": info["applications"],
                "replacementOptions": info.get("replacementOptions", []),
                "replaces": info.get("replaces"),
                "regulatoryStatus": info["regulatoryStatus"],
                "ptChart": pt_chart,
                "dataSource": {
                    "ptChartSource": pt_source,
                    "ptChartGeneratedAt": datetime.now(timezone.utc).isoformat(),
                    "ptChartVerifiedAgainst": info.get("verifiedAgainst", []),
                    "propertiesSource": info.get("propertiesSource", "CoolProp + ASHRAE 34"),
                    "gwpSource": info.get("gwpSource", "IPCC AR5"),
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

    OUTPUT_PATH.write_text(json.dumps(output, indent=2))
    print(f"\nWrote {len(output)} refrigerants to {OUTPUT_PATH}")
    print(f"Total PT points: {sum(len(r['ptChart']) for r in output)}")


if __name__ == "__main__":
    main()
