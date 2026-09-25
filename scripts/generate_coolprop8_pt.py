#!/usr/bin/env python3
"""Saturation pressure-temperature tables for six refrigerants that CoolProp 7.2 cannot compute.

CoolProp 8.0.0 (released 2026-06-27) added the equations of state for R-1336mzz(Z),
R-1224yd(Z) and R-1130(E), and the mixture models for R-134a/R-1234ze(E),
R-1234ze(E)/R-227ea and R-1336mzz(Z)/R-1130(E). This script computes bubble and dew
pressures from -40 to 150 F in 1 F steps and writes one JSON file.

Usage:
    pip install CoolProp==8.0.0
    python3 scripts/generate_coolprop8_pt.py > data/precomputed/coolprop8-pt.json

Blend compositions are nominal ASHRAE 34 mass fractions.
Pressures: psia is exact output; psig = psia - 14.6959 (1 standard atmosphere).
"""
import datetime
import json
import sys

import CoolProp
import CoolProp.CoolProp as CP
from CoolProp.CoolProp import AbstractState, get_fluid_param_string

PSI_PA = 6894.757293168
ATM_PA = 101325.0
ATM_PSIA = ATM_PA / PSI_PA  # 14.6959...

FLUIDS = {
    "r-515b": {
        "name": "R-515B",
        "components": ["R1234ze(E)", "R227EA"],
        "massFractions": [0.911, 0.089],
    },
    "r-515a": {
        "name": "R-515A",
        "components": ["R1234ze(E)", "R227EA"],
        "massFractions": [0.88, 0.12],
    },
    "r-514a": {
        "name": "R-514A",
        "components": ["R1336mzz(Z)", "R1130(E)"],
        "massFractions": [0.747, 0.253],
    },
    "r-450a": {
        "name": "R-450A",
        "components": ["R134a", "R1234ze(E)"],
        "massFractions": [0.42, 0.58],
    },
    "r-1336mzz-z": {
        "name": "R-1336mzz(Z)",
        "components": ["R1336mzz(Z)"],
        "massFractions": None,
    },
    "r-1224yd-z": {
        "name": "R-1224yd(Z)",
        "components": ["R1224YDZ"],
        "massFractions": None,
    },
}


# Human-readable citations for the BibTeX keys CoolProp reports (from CoolProp's CoolPropBibTeXLibrary.bib, v8.0.0).
REFERENCES = {
    "Thol-IJT-2016-R1234zeE": "Thol, M.; Lemmon, E. W. Equation of State for the Thermodynamic Properties of "
        "trans-1,3,3,3-Tetrafluoropropene [R-1234ze(E)]. Int. J. Thermophys. 37, 28 (2016). doi:10.1007/s10765-016-2040-6",
    "Lemmon-JCED-2016-365227": "Lemmon, E. W.; Span, R. Thermodynamic Properties of R-227ea, R-365mfc, R-115, and "
        "R-13I1. J. Chem. Eng. Data. doi:10.1021/acs.jced.5b00684",
    "TillnerRoth-JPCRD-1994": "Tillner-Roth, R.; Baehr, H. D. An International Standard Formulation for the "
        "Thermodynamic Properties of 1,1,1,2-Tetrafluoroethane (HFC-134a) for Temperatures from 170 K to 455 K and "
        "Pressures up to 70 MPa. J. Phys. Chem. Ref. Data 23, 657-729 (1994). doi:10.1063/1.555958",
    "McLinden-JCED-2020-R1336mzzZ": "McLinden, M. O.; Akasaka, R. Thermodynamic Properties of "
        "cis-1,1,1,4,4,4-Hexafluorobutene [R-1336mzz(Z)]: Vapor Pressure, (p, rho, T) Behavior, and Speed of Sound "
        "Measurements and Equation of State. J. Chem. Eng. Data 65, 4201-4214 (2020). doi:10.1021/acs.jced.9b01198",
    "Akasaka-IJT-2023-R1224ydZ": "Akasaka, R.; Lemmon, E. W. A Helmholtz Energy Equation of State for "
        "cis-1-Chloro-2,3,3,3-tetrafluoro-1-propene [R-1224yd(Z)]. Int. J. Thermophys. 44, 166 (2023). "
        "doi:10.1007/s10765-023-03266-3",
    "Huber-IJT-2025-R1130E": "Huber, M. L.; Kazakov, A. F.; Lemmon, E. W. Equation of State for the Thermodynamic "
        "Properties of trans-1,2-Dichloroethene [R-1130(E)]. Int. J. Thermophys. 46, 76 (2025). "
        "doi:10.1007/s10765-025-03535-3",
    "Bell-JPCRD-2022": "Bell, I. H. Mixture Models for Refrigerants R-1234yf/134a, R-1234yf/1234ze(E), and "
        "R-134a/1234ze(E) and Interim Models for R-125/1234yf, R-1234ze(E)/227ea, and R-1234yf/152a. "
        "J. Phys. Chem. Ref. Data 51, 013103 (2022). doi:10.1063/5.0086060",
    "Bell-JPCRD-2023": "Bell, I. H. Mixture Model for Refrigerant Pairs R-32/1234yf, R-32/1234ze(E), "
        "R-1234ze(E)/227ea, R-1234yf/152a, and R-125/1234yf. J. Phys. Chem. Ref. Data 52, 013101 (2023). "
        "doi:10.1063/5.0135368",
    "McLinden-NISTIR-8570": "McLinden, M. O. et al. Refrigerant Properties Development R&D: Final Report to the "
        "U.S. Department of Energy. NIST IR 8570 (2025). doi:10.6028/NIST.IR.8570",
}

# Manufacturer anchor values used only to cross-check the computed tables (never published as data).
# kind: "T->psig" (temp F -> gauge psi), "T->psia", "C->kPa" (temp C -> kPa abs), "C->MPa",
#       "psig->F" (gauge psi -> bubble/dew temps F), "kPa->C" (kPa abs -> bubble/dew temps C)
CROSS_CHECKS = {
    "r-515b": [{
        "source": "Solstice N15 (R-515B) P-T Chart, Solstice Advanced Materials, doc 90350 (7/26)",
        "url": "https://prod-edam.solstice.com/content/dam/honeywell-edam/pmt/oneam/en-us/refrigerants/documents/90350-ras-otr-usmetric-R515B-ltr-en.pdf",
        "kind": "T->psig",
        "points": [[0, 0.7], [40, 22.1], [100, 89.7], [170, 255.7]],
    }],
    "r-514a": [{
        "source": "Opteon XP30 Thermodynamic Properties, English units, Chemours (REFPROP 9.1 with Chemours interaction parameters)",
        "url": "https://www.opteon.com/en/-/media/files/opteon/opteon-xp30-thermo-properties-eng.pdf",
        "kind": "T->psia",
        "points": [[40, 5.475], [100, 19.977]],
    }, {
        "source": "Opteon XP30 Thermodynamic Properties, SI units, Chemours",
        "url": "https://www.opteon.com/en/-/media/files/opteon/opteon-xp30-thermodynamic-properties-si.pdf",
        "kind": "C->kPa",
        "points": [[0, 30.892], [40, 148.482], [100, 777.824]],
    }],
    "r-450a": [{
        "source": "PT Chart for Solstice N13, Honeywell G525-712 (August 2017), pressure-indexed",
        "url": "https://prod-edam.honeywell.com/content/dam/honeywell-edam/pmt/oneam/en-us/refrigerants/documents/pmt-am-solstice-n13-pressure-temp-chart-tech-tool1.pdf",
        "kind": "psig->F",
        "points": [[0, -10.1, -9.0], [20, 28.0, 29.2], [40, 51.4, 52.6], [100, 95.3, 96.5]],
    }],
    "r-1336mzz-z": [{
        "source": "Opteon SF33 Technical Information C-11069 (10/25), Chemours (same molecule as Opteon MZ)",
        "url": "https://www.opteon.com/en/-/media/files/opteon/opteon-sf33-specialty-fluid-technical-bulletin.pdf",
        "kind": "C->MPa",
        "points": [[0, 0.024582], [20, 0.060278], [25, 0.073686]],
    }],
    "r-1224yd-z": [{
        "source": "Physical properties of AMOLEA 1224yd, AGC (2020.06)",
        "url": "https://www.agc-chemicals.com/file.jsp?id=32141",
        "kind": "C->kPa",
        "points": [[0, 55.78], [20, 124.0], [40, 245.0], [100, 1162.0]],
    }],
}


def run_cross_checks(st, checks):
    results = []
    for chk in checks:
        rows = []
        for pt in chk["points"]:
            kind = chk["kind"]
            if kind == "T->psig":
                calc = p_sat(st, f_to_k(pt[0]), 0) / PSI_PA - ATM_PSIA
                rows.append({"tempF": pt[0], "publishedPsig": pt[1], "computedPsig": round(calc, 2),
                             "diffPsi": round(calc - pt[1], 2)})
            elif kind == "T->psia":
                calc = p_sat(st, f_to_k(pt[0]), 0) / PSI_PA
                rows.append({"tempF": pt[0], "publishedPsia": pt[1], "computedPsia": round(calc, 3),
                             "diffPsi": round(calc - pt[1], 3)})
            elif kind == "C->kPa":
                calc = p_sat(st, pt[0] + 273.15, 0) / 1000.0
                rows.append({"tempC": pt[0], "publishedKPaAbs": pt[1], "computedKPaAbs": round(calc, 2),
                             "diffPercent": round(100.0 * (calc - pt[1]) / pt[1], 2),
                             "diffPsi": round((calc - pt[1]) * 1000.0 / PSI_PA, 3)})
            elif kind == "C->MPa":
                calc = p_sat(st, pt[0] + 273.15, 0) / 1e6
                rows.append({"tempC": pt[0], "publishedMPaAbs": pt[1], "computedMPaAbs": round(calc, 6),
                             "diffPercent": round(100.0 * (calc - pt[1]) / pt[1], 2),
                             "diffPsi": round((calc - pt[1]) * 1e6 / PSI_PA, 3)})
            elif kind == "psig->F":
                p_pa = (pt[0] + ATM_PSIA) * PSI_PA
                b = k_to_f(t_sat(st, p_pa, 0))
                d = k_to_f(t_sat(st, p_pa, 1))
                rows.append({"psig": pt[0], "publishedBubbleF": pt[1], "publishedDewF": pt[2],
                             "computedBubbleF": round(b, 2), "computedDewF": round(d, 2),
                             "diffBubbleF": round(b - pt[1], 2), "diffDewF": round(d - pt[2], 2)})
        results.append({"source": chk["source"], "url": chk["url"], "points": rows})
    return results


def f_to_k(f):
    return (f - 32.0) * 5.0 / 9.0 + 273.15


def k_to_f(k):
    return (k - 273.15) * 9.0 / 5.0 + 32.0


def state(spec):
    st = AbstractState("HEOS", "&".join(spec["components"]))
    if spec["massFractions"]:
        st.set_mass_fractions(spec["massFractions"])
    return st


def p_sat(st, t_k, q):
    st.update(CP.QT_INPUTS, q, t_k)
    return st.p()


def t_sat(st, p_pa, q):
    st.update(CP.PQ_INPUTS, p_pa, q)
    return st.T()


def mixture_refs(components):
    refs = []
    for i in range(len(components)):
        for j in range(i + 1, len(components)):
            a = get_fluid_param_string(components[i], "CAS")
            b = get_fluid_param_string(components[j], "CAS")
            try:
                key = CP.get_mixture_binary_pair_data(a, b, "BibTeX")
            except Exception:
                key = CP.get_mixture_binary_pair_data(b, a, "BibTeX")
            refs.append({"pair": f"{components[i]}/{components[j]}", "bibtexKey": key})
    return refs


def build():
    out = {
        "generatedBy": "scripts/generate_coolprop8_pt.py",
        "engine": "CoolProp",
        "engineVersion": CoolProp.__version__,
        "backend": "HEOS",
        "generatedOn": datetime.date.today().isoformat(),
        "units": {"temperature": "degF", "pressure": "psia and psig", "atmosphericPsia": round(ATM_PSIA, 4)},
        "range": {"fromF": -40, "toF": 150, "stepF": 1},
        "references": REFERENCES,
        "fluids": {},
    }
    for slug, spec in FLUIDS.items():
        st = state(spec)
        rows = []
        for t_f in range(-40, 151):
            t_k = f_to_k(t_f)
            bubble = p_sat(st, t_k, 0) / PSI_PA
            dew = p_sat(st, t_k, 1) / PSI_PA
            rows.append({
                "tempF": t_f,
                "bubblePsia": round(bubble, 4),
                "dewPsia": round(dew, 4),
                "bubblePsig": round(bubble - ATM_PSIA, 3),
                "dewPsig": round(dew - ATM_PSIA, 3),
            })
        nbp_bubble_f = k_to_f(t_sat(st, ATM_PA, 0))
        nbp_dew_f = k_to_f(t_sat(st, ATM_PA, 1))
        entry = {
            "name": spec["name"],
            "components": spec["components"],
            "massFractions": spec["massFractions"],
            "eosReferences": [
                {"fluid": c, "bibtexKey": get_fluid_param_string(c, "BibTeX-EOS")}
                for c in spec["components"]
            ],
            "mixtureReferences": mixture_refs(spec["components"]) if len(spec["components"]) > 1 else [],
            "normalBoilingPointF": {"bubble": round(nbp_bubble_f, 2), "dew": round(nbp_dew_f, 2)},
        }
        if len(spec["components"]) == 1:
            entry["criticalTemperatureF"] = round(k_to_f(st.T_critical()), 2)
            entry["criticalPressurePsia"] = round(st.p_critical() / PSI_PA, 2)
        entry["crossChecks"] = run_cross_checks(st, CROSS_CHECKS.get(slug, []))
        entry["table"] = rows
        out["fluids"][slug] = entry
    return out


if __name__ == "__main__":
    json.dump(build(), sys.stdout, indent=1)
    sys.stdout.write("\n")
