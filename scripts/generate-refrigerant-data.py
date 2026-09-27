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
PRECOMPUTED_PATH = ROOT / "data" / "precomputed" / "coolprop8-pt.json"
OUTPUT_PATH = ROOT / "data" / "refrigerants.json"
GWP_REF_PATH = ROOT / "data" / "reference" / "gwp-reference.json"

# ── GWP (headline on the US EPA basis + IPCC AR4/AR5/AR6) ────────────────────
# Mirrors scripts/reference/compute_gwp.mjs. Blends sum massFraction × constituent
# GWP per 40 CFR 84.64(b): '<1' counts as 1, a column exists only when every
# constituent has it, rounded half-up to an integer.
GWP_REF = json.loads(GWP_REF_PATH.read_text())
SLUG_TO_COMPONENT = {
    "r-11": "R-11", "r-12": "R-12", "r-13": "R-13", "r-22": "R-22", "r-23": "R-23",
    "r-32": "R-32", "r-115": "R-115", "r-123": "R-123", "r-124": "R-124", "r-125": "R-125",
    "r-134a": "R-134a", "r-143a": "R-143a", "r-152a": "R-152a", "r-218": "R-218",
    "r-227ea": "R-227ea", "r-236ea": "R-236ea", "r-236fa": "R-236fa", "r-245fa": "R-245fa",
    "r-365mfc": "R-365mfc", "r-c318": "R-C318", "r-290": "R-290", "r-600": "R-600",
    "r-600a": "R-600a", "r-601a": "R-601a", "r-1150": "R-1150", "r-1270": "R-1270",
    "r-717": "R-717", "r-744": "R-744", "r-1234yf": "R-1234yf",
    "r-1234ze": "R-1234ze(E)", "r-1234ze-e": "R-1234ze(E)", "r-1234ze-z": "R-1234ze(Z)",
    "r-1233zd-e": "R-1233zd(E)", "r-1224yd-z": "R-1224yd(Z)", "r-1336mzz-z": "R-1336mzz(Z)",
    "r-1130-e": "R-1130(E)",
}
COMPONENT_ALIAS = {"CO2": "R-744", "R-744": "R-744"}


def _gwp_num(cell):
    if cell is None:
        return None
    v = cell["value"] if isinstance(cell, dict) else cell
    return 1.0 if v == "<1" else float(v)


def _blend_column(comp, col):
    total = 0.0
    for part in comp:
        cid = COMPONENT_ALIAS.get(part["component"], part["component"])
        c = GWP_REF["components"][cid]
        cell = c.get(col)
        if cell is None:
            return None
        total += part["massFraction"] * _gwp_num(cell)
    from decimal import Decimal, ROUND_HALF_UP
    return int(Decimal(str(total)).quantize(Decimal(1), rounding=ROUND_HALF_UP))


GWP_SOURCE_LABEL = {
    "aim_app_a": "AIM Act exchange value = IPCC AR4 (40 CFR 84 Appendix A)",
    "cfr_84_64b": "US EPA, 40 CFR 84.64(b)",
    "ipcc_ar4": "IPCC AR4 Table 2.14",
    "ipcc_ar5": "IPCC AR5 Table 8.A.1",
}


def gwp_source_label(slug, info):
    src = gwp_for_slug(slug, info)["headline"]["source"]
    return f'{GWP_SOURCE_LABEL.get(src, "US EPA basis")} (100-yr); AR4/AR5/AR6 in the gwp object'


def gwp_for_slug(slug, info):
    comp = info.get("composition", []) or []
    if not comp:
        c = GWP_REF["components"][SLUG_TO_COMPONENT[slug]]
        g = {"headline": c["headline"], "ar4": c["ar4"], "ar5": c["ar5"], "ar6": c["ar6"]}
        if "note" in c:
            g["note"] = c["note"]
        return g
    g = {}
    for col in ("headline", "ar4", "ar5", "ar6"):
        v = _blend_column(comp, col)
        g[col] = None if v is None else {"value": v, "source": "cfr_84_64b" if col == "headline" else f"ipcc_{col}"}
    return g

# CoolProp component identifiers -> site display designations, for the
# "precomputed" strategy's EOS / mixture-model reference labels.
COMP_DISPLAY = {
    "R1234ze(E)": "R-1234ze(E)", "R227EA": "R-227ea", "R134a": "R-134a",
    "R1336mzz(Z)": "R-1336mzz(Z)", "R1130(E)": "R-1130(E)", "R1224YDZ": "R-1224yd(Z)",
}


def pretty_comp(s):
    return "/".join(COMP_DISPLAY.get(x, x) for x in s.split("/"))

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
        # Glide = (dew - bubble) at a fixed pressure, a non-negative magnitude.
        # t0 is the bubble temperature at p_bub_0; the dew temperature there is >= t0.
        t_dew_at_pbub = CP.PropsSI("T", "P", p_bub_0, "Q", 1, cp_identifier)
        glide_k = abs(t_dew_at_pbub - t0)
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


# ----------------------- "precomputed" strategy -----------------------
# Fluids computed out-of-band with CoolProp 8.0.0 (EOS / mixture models not in
# the CoolProp build this generator links against): R-515B, R-515A, R-514A,
# R-450A, R-1336mzz(Z), R-1224yd(Z). Table read from
# data/precomputed/coolprop8-pt.json (bubble/dew in psia) and converted to the
# site's PSIG/kPag shape with the SAME constants + rounding as generate_pt_chart.

def precomputed_pt_chart(table):
    rows = []
    for row in table:
        bub_psig = row["bubblePsia"] - PSIG_OFFSET  # gauge = absolute - atmospheric
        dew_psig = row["dewPsia"] - PSIG_OFFSET
        bub_kpag = row["bubblePsia"] * 6894.757 * KPA_PER_PA - KPAG_OFFSET
        dew_kpag = row["dewPsia"] * 6894.757 * KPA_PER_PA - KPAG_OFFSET
        rows.append({
            "tempF": row["tempF"],
            "tempC": round((row["tempF"] - 32) * 5 / 9, 1),
            "bubblePsig": round(bub_psig, 2),
            "dewPsig": round(dew_psig, 2),
            "bubbleKpag": round(bub_kpag, 1),
            "dewKpag": round(dew_kpag, 1),
            "displayPsig": round((bub_psig + dew_psig) / 2, 2),
            "displayKpag": round((bub_kpag + dew_kpag) / 2, 1),
        })
    return rows


def precomputed_references(fluid, ref_map):
    out = []
    for e in fluid.get("eosReferences", []):
        out.append({"kind": "eos", "label": pretty_comp(e["fluid"]), "citation": ref_map.get(e["bibtexKey"])})
    for m in fluid.get("mixtureReferences", []):
        out.append({"kind": "mixture", "label": pretty_comp(m["pair"]), "citation": ref_map.get(m["bibtexKey"])})
    return out


def precomputed_physical(fluid, info):
    bf = fluid["normalBoilingPointF"]["bubble"]
    if fluid.get("criticalTemperatureF") is not None and fluid.get("criticalPressurePsia") is not None:
        t_f = fluid["criticalTemperatureF"]
        p_psia = fluid["criticalPressurePsia"]
        critical = {
            "tempC": round((t_f - 32) * 5 / 9, 2), "tempF": round(t_f, 2),
            "pressurePsia": round(p_psia, 1), "pressurePsig": round(p_psia - PSIG_OFFSET, 1),
            "pressureKpaA": round(p_psia * 6894.757 * KPA_PER_PA, 1),
            "pressureKpaG": round(p_psia * 6894.757 * KPA_PER_PA - KPAG_OFFSET, 1),
        }
    else:
        critical = {"tempC": None, "tempF": None, "pressurePsia": None,
                    "pressurePsig": None, "pressureKpaA": None, "pressureKpaG": None}
    p = info.get("physical", {})
    return {
        "boilingPointC": round((bf - 32) * 5 / 9, 2),
        "boilingPointF": round(bf, 2),
        "critical": critical,
        "molarMassGPerMol": p.get("molarMassGPerMol"),
        "liquidDensityKgPerM3At25C": p.get("liquidDensityKgPerM3At25C"),
        "temperatureGlideF": p.get("temperatureGlideF", 0),
        "hasSignificantGlide": p.get("hasSignificantGlide", False),
    }


def main():
    config = json.loads(CONFIG_PATH.read_text())
    precomputed = (json.loads(PRECOMPUTED_PATH.read_text())
                   if PRECOMPUTED_PATH.exists()
                   else {"fluids": {}, "references": {}, "engineVersion": "8.0.0"})
    output = []
    errors = []

    for slug, info in config.items():
        try:
            print(f"Processing {slug}...", end=" ", flush=True)
            manual = None
            manual_path = MANUAL_DIR / f"{slug}.json"
            if manual_path.exists():
                manual = json.loads(manual_path.read_text())

            precomputed_data_source = None
            if info["strategy"] == "manual":
                pt_chart, pt_source = load_manual_pt_chart(slug)
                physical = compute_physical(None, manual)
            elif info["strategy"] == "precomputed":
                pc = precomputed["fluids"].get(slug)
                if pc is None:
                    raise ValueError(f'strategy "precomputed" for {slug} but no entry in data/precomputed/coolprop8-pt.json')
                pt_chart = precomputed_pt_chart(pc["table"])
                pt_source = "Computed with CoolProp 8.0.0"
                physical = precomputed_physical(pc, info)
                precomputed_data_source = {
                    "ptChartSource": pt_source,
                    "ptChartGeneratedAt": datetime.now(timezone.utc).isoformat(),
                    "ptChartVerifiedAgainst": info.get("verifiedAgainst", []),
                    "propertiesSource": info.get("propertiesSource", "CoolProp 8.0.0"),
                    "gwpSource": gwp_source_label(slug, info),
                    "dataStatus": "complete",
                    "engine": "CoolProp",
                    "engineVersion": precomputed.get("engineVersion", "8.0.0"),
                    "references": precomputed_references(pc, precomputed.get("references", {})),
                    "crossChecks": info.get("crossChecks", []),
                }
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
                "environmental": {
                    "odp": info["environmental"]["odp"],
                    "gwp": gwp_for_slug(slug, info),
                    "atmosphericLifetimeYears": info["environmental"]["atmosphericLifetimeYears"],
                    "snapStatus": info["environmental"]["snapStatus"],
                },
                "lubricants": info["lubricants"],
                "applications": info["applications"],
                "replacementOptions": info.get("replacementOptions", []),
                "replaces": info.get("replaces"),
                "indexable": info.get("indexable", True),
                **({"noindexReason": info["noindexReason"]} if info.get("noindexReason") else {}),
                "regulatoryStatus": info["regulatoryStatus"],
                "ptChart": pt_chart,
                "dataSource": precomputed_data_source if precomputed_data_source else {
                    "ptChartSource": pt_source,
                    "ptChartGeneratedAt": datetime.now(timezone.utc).isoformat(),
                    "ptChartVerifiedAgainst": info.get("verifiedAgainst", []),
                    "propertiesSource": info.get("propertiesSource", "CoolProp + ASHRAE 34"),
                    "gwpSource": gwp_source_label(slug, info),
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
