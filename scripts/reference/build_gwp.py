import json, math, sys
from decimal import Decimal, ROUND_HALF_UP

def rhu(x, nd=0):
    q = Decimal(1) if nd == 0 else Decimal(1).scaleb(-nd)
    return float(Decimal(str(x)).quantize(q, rounding=ROUND_HALF_UP))

SOURCES = {
  "ipcc_ar4": {"title": "IPCC AR4 WG1 (2007), Chapter 2, Table 2.14 (GWP 100-yr)", "url": "https://archive.ipcc.ch/publications_and_data/ar4/wg1/en/ch2s2-10-2.html"},
  "ipcc_ar4_errata": {"title": "IPCC AR4 WG1 Errata (2012), Table 2.14 (Errata)", "url": "https://www.ipcc.ch/site/assets/uploads/2018/05/ar4-wg1-errata.pdf"},
  "ipcc_ar4_indirect": {"title": "IPCC AR4 WG1 (2007), Chapter 2, Table 2.15 (indirect GWPs of NMVOCs)", "url": "https://archive.ipcc.ch/publications_and_data/ar4/wg1/en/ch2s2-10-3-2.html"},
  "ipcc_ar5": {"title": "IPCC AR5 WG1 (2013), Chapter 8, Appendix 8.A, Table 8.A.1 (GWP 100-yr)", "url": "https://www.ipcc.ch/report/ar5/wg1/"},
  "ipcc_ar6": {"title": "IPCC AR6 WG1 (2021), Chapter 7 Supplementary Material, Table 7.SM.7 (GWP-100)", "url": "https://www.ipcc.ch/report/ar6/wg1/downloads/report/IPCC_AR6_WGI_Chapter07_SM.pdf"},
  "aim_app_a": {"title": "40 CFR Part 84, Appendix A — Regulated Substances (AIM Act exchange values, equal to IPCC AR4)", "url": "https://www.ecfr.gov/current/title-40/chapter-I/subchapter-C/part-84/appendix-Appendix%20A%20to%20Part%2084"},
  "cfr_84_64b": {"title": "40 CFR 84.64(b), Table 1 — GWP of blend constituents that are not regulated HFCs", "url": "https://www.ecfr.gov/current/title-40/chapter-I/subchapter-C/part-84/subpart-B/section-84.64"},
  "epa_tt_table": {"title": "US EPA, Technology Transitions GWP Reference Table (updated April 2, 2026)", "url": "https://www.epa.gov/hfcs/technology-transitions-gwp-reference-table"},
}

# Usage: python3 scripts/reference/build_gwp.py [output.json]
# headline ("US EPA / AR4 basis"), ar4, ar5, ar6 for pure components. None = not listed; "<1" kept as string.
C = {
 # id: (name, headline, headline_src, ar4, ar4_src, ar5, ar6)
 "R-11":   ("CFC-11", 4750, "ipcc_ar4", 4750, "ipcc_ar4", 4660, 6230),
 "R-12":   ("CFC-12", 10900, "ipcc_ar4", 10900, "ipcc_ar4", 10200, 12500),
 "R-13":   ("CFC-13", 14400, "ipcc_ar4", 14400, "ipcc_ar4", 13900, 16200),
 "R-115":  ("CFC-115", 7370, "ipcc_ar4", 7370, "ipcc_ar4", 7670, 9600),
 "R-22":   ("HCFC-22", 1810, "ipcc_ar4", 1810, "ipcc_ar4", 1760, 1960),
 "R-123":  ("HCFC-123", 77, "ipcc_ar4", 77, "ipcc_ar4", 79, 90.4),
 "R-124":  ("HCFC-124", 609, "ipcc_ar4", 609, "ipcc_ar4", 527, 597),
 "R-23":   ("HFC-23", 14800, "aim_app_a", 14800, "ipcc_ar4", 12400, 14600),
 "R-32":   ("HFC-32", 675, "aim_app_a", 675, "ipcc_ar4", 677, 771),
 "R-125":  ("HFC-125", 3500, "aim_app_a", 3500, "ipcc_ar4", 3170, 3740),
 "R-134a": ("HFC-134a", 1430, "aim_app_a", 1430, "ipcc_ar4", 1300, 1530),
 "R-143a": ("HFC-143a", 4470, "aim_app_a", 4470, "ipcc_ar4", 4800, 5810),
 "R-152a": ("HFC-152a", 124, "aim_app_a", 124, "ipcc_ar4", 138, 164),
 "R-227ea":("HFC-227ea", 3220, "aim_app_a", 3220, "ipcc_ar4", 3350, 3600),
 "R-236ea":("HFC-236ea", 1370, "aim_app_a", 1370, "ipcc_ar4_errata", 1330, 1500),
 "R-236fa":("HFC-236fa", 9810, "aim_app_a", 9810, "ipcc_ar4", 8060, 8690),
 "R-245fa":("HFC-245fa", 1030, "aim_app_a", 1030, "ipcc_ar4", 858, 962),
 "R-365mfc":("HFC-365mfc", 794, "aim_app_a", 794, "ipcc_ar4", 804, 914),
 "R-218":  ("PFC-218 (C3F8)", 8830, "ipcc_ar4", 8830, "ipcc_ar4", 8900, 9290),
 "R-C318": ("PFC-C318 (c-C4F8)", 10300, "ipcc_ar4", 10300, "ipcc_ar4", 9540, 10200),
 "R-1234yf":("HFO-1234yf", 1, "cfr_84_64b", None, None, "<1", 0.501),
 "R-1234ze(E)":("HFO-1234ze(E)", 1, "cfr_84_64b", None, None, "<1", 1.37),
 "R-1234ze(Z)":("HFO-1234ze(Z)", "<1", "ipcc_ar5", None, None, "<1", 0.315),
 "R-1233zd(E)":("HCFO-1233zd(E)", 4, "cfr_84_64b", None, None, 1, 3.88),
 "R-1224yd(Z)":("HCFO-1224yd(Z)", 1, "cfr_84_64b", None, None, None, None),
 "R-1336mzz(Z)":("HFO-1336mzz(Z)", 2, "cfr_84_64b", None, None, 2, 2.08),
 "R-1130(E)":("trans-1,2-dichloroethene (HCO-1130(E))", 5, "cfr_84_64b", None, None, None, None),
 "R-290":  ("propane", 3.3, "cfr_84_64b", None, None, None, 0.02),
 "R-600":  ("n-butane", 4, "cfr_84_64b", None, None, None, 0.006),
 "R-600a": ("isobutane", 1, "cfr_84_64b", None, None, None, None),
 "R-601a": ("isopentane", 1, "cfr_84_64b", None, None, None, None),
 "R-1270": ("propylene", 1.8, "cfr_84_64b", None, None, None, None),
 "R-1150": ("ethylene", 3.7, "cfr_84_64b", None, None, None, None),
 "R-717":  ("ammonia", 1, "cfr_84_64b", None, None, None, None),
 "R-744":  ("carbon dioxide", 1, "cfr_84_64b", 1, "ipcc_ar4", 1, 1),
}
NOTES = {
 "R-290": "40 CFR 84.64(b) uses 3.3, the AR4 indirect GWP (Table 2.15); AR6 lists only the direct GWP (0.02).",
 "R-600": "40 CFR 84.64(b) uses 4, the AR4 indirect GWP (Table 2.15); AR6 lists only the direct GWP (0.006).",
 "R-1270": "40 CFR 84.64(b) uses 1.8, the AR4 indirect GWP (Table 2.15).",
 "R-1150": "40 CFR 84.64(b) uses 3.7, the AR4 indirect GWP (Table 2.15).",
 "R-601a": "Not listed by name; 40 CFR 84.64(b) gives 1–4 for saturated light hydrocarbons (C3–C6). Only used as a 0.6% component of R-438A, where it cannot change the rounded result.",
 "R-236ea": "Not in the original AR4 Table 2.14; value from the 2012 AR4 errata table, identical to the AIM Act exchange value.",
 "R-11": "AR6 final Table 7.SM.7 value (a pre-final draft printed 5560).",
 "R-12": "AR6 final Table 7.SM.7 value (a pre-final draft printed 11200).",
 "R-1234ze(Z)": "Not in 40 CFR 84.64(b) or AR4; headline shows the AR5 value.",
 "R-717": "IPCC does not assess ammonia as a greenhouse gas; 40 CFR 84.64(b) lists 1.",
}
BLENDS = {
 "R-404A": {"R-125":44.0,"R-143a":52.0,"R-134a":4.0},
 "R-407A": {"R-32":20.0,"R-125":40.0,"R-134a":40.0},
 "R-407C": {"R-32":23.0,"R-125":25.0,"R-134a":52.0},
 "R-407F": {"R-32":30.0,"R-125":30.0,"R-134a":40.0},
 "R-410A": {"R-32":50.0,"R-125":50.0},
 "R-417A": {"R-125":46.6,"R-134a":50.0,"R-600":3.4},
 "R-421A": {"R-125":58.0,"R-134a":42.0},
 "R-422A": {"R-125":85.1,"R-134a":11.5,"R-600a":3.4},
 "R-422B": {"R-125":55.0,"R-134a":42.0,"R-600a":3.0},
 "R-422D": {"R-125":65.1,"R-134a":31.5,"R-600a":3.4},
 "R-427A": {"R-32":15.0,"R-125":25.0,"R-143a":10.0,"R-134a":50.0},
 "R-438A": {"R-32":8.5,"R-125":45.0,"R-134a":44.2,"R-600":1.7,"R-601a":0.6},
 "R-448A": {"R-32":26.0,"R-125":26.0,"R-1234yf":20.0,"R-134a":21.0,"R-1234ze(E)":7.0},
 "R-449A": {"R-32":24.3,"R-125":24.7,"R-1234yf":25.3,"R-134a":25.7},
 "R-450A": {"R-134a":42.0,"R-1234ze(E)":58.0},
 "R-452A": {"R-32":11.0,"R-125":59.0,"R-1234yf":30.0},
 "R-452B": {"R-32":67.0,"R-125":7.0,"R-1234yf":26.0},
 "R-454B": {"R-32":68.9,"R-1234yf":31.1},
 "R-454C": {"R-32":21.5,"R-1234yf":78.5},
 "R-455A": {"R-744":3.0,"R-32":21.5,"R-1234yf":75.5},
 "R-457A": {"R-32":18.0,"R-1234yf":70.0,"R-152a":12.0},
 "R-500": {"R-12":73.8,"R-152a":26.2},
 "R-502": {"R-22":48.8,"R-115":51.2},
 "R-503": {"R-23":40.1,"R-13":59.9},
 "R-507A": {"R-125":50.0,"R-143a":50.0},
 "R-513A": {"R-1234yf":56.0,"R-134a":44.0},
 "R-514A": {"R-1336mzz(Z)":74.7,"R-1130(E)":25.3},
 "R-515A": {"R-1234ze(E)":88.0,"R-227ea":12.0},
 "R-515B": {"R-1234ze(E)":91.1,"R-227ea":8.9},
 "R-516A": {"R-1234yf":77.5,"R-134a":8.5,"R-152a":14.0},
}
EPA_PUBLISHED = {"R-404A":3922,"R-407C":1774,"R-410A":2088,"R-448A":1386,"R-449A":1396,"R-450A":601,"R-452A":2140,
                 "R-452B":698,"R-454B":465,"R-454C":146,"R-455A":146,"R-457A":137,"R-507A":3985,"R-513A":630,
                 "R-514A":3,"R-515B":287,"R-516A":140}

def num(v):
    if v is None: return None
    if v == "<1": return 1.0   # AR5 '<1' counted as 1 (upper bound) in blend sums
    return float(v)

def blend_value(comp, idx):
    total = 0.0
    for c, pct in comp.items():
        v = C[c]
        val = v[1] if idx == "headline" else (v[3] if idx == "ar4" else (v[5] if idx == "ar5" else v[6]))
        n = num(val)
        if n is None: return None
        total += pct/100.0 * n
    return total

out = {"generatedBy": "scripts/reference/build_gwp.py (2026-09-27)",
       "method": {
         "headline": "GWP 100-yr on the basis US EPA uses: regulated HFCs = AIM Act exchange values (40 CFR 84 Appendix A, identical to IPCC AR4); HFOs, HCFOs, hydrocarbons, ammonia, CO2 = 40 CFR 84.64(b) Table 1; CFCs, HCFCs, PFCs = IPCC AR4 Table 2.14. Blends = sum of mass fraction x constituent GWP (40 CFR 84.64(b)), rounded half-up to an integer.",
         "ar4": "IPCC AR4 values only; blends computed only when every component has an AR4 value.",
         "ar5": "IPCC AR5 Table 8.A.1; '<1' is shown as '<1' for pure substances and counted as 1 in blend sums; blends computed only when every component is listed in AR5.",
         "ar6": "IPCC AR6 Table 7.SM.7; blends computed only when every component is listed in AR6.",
         "rounding": "Blends: integer, round half up. Pure substances: as published.",
       },
       "sources": SOURCES, "components": {}, "blends": {}, "epaPublishedBlendValues": EPA_PUBLISHED}
for cid, v in C.items():
    name, hv, hsrc, a4, a4src, a5, a6 = v
    out["components"][cid] = {"name": name,
        "headline": {"value": hv, "source": hsrc},
        "ar4": None if a4 is None else {"value": a4, "source": a4src},
        "ar5": None if a5 is None else {"value": a5, "source": "ipcc_ar5"},
        "ar6": None if a6 is None else {"value": a6, "source": "ipcc_ar6"},
        **({"note": NOTES[cid]} if cid in NOTES else {})}
problems = []
for b, comp in BLENDS.items():
    assert abs(sum(comp.values()) - 100.0) < 1e-9, (b, sum(comp.values()))
    rec = {"massPercent": comp}
    for idx in ("headline", "ar4", "ar5", "ar6"):
        v = blend_value(comp, idx)
        rec[idx] = None if v is None else {"exact": round(v, 4), "value": int(rhu(v))}
    if b in EPA_PUBLISHED:
        rec["epaPublished"] = EPA_PUBLISHED[b]
        if rec["headline"]["value"] != EPA_PUBLISHED[b]:
            problems.append((b, rec["headline"]["value"], EPA_PUBLISHED[b]))
    out["blends"][b] = rec
OUT = sys.argv[1] if len(sys.argv) > 1 else "data/reference/gwp-reference.json"
json.dump(out, open(OUT, "w"), indent=1, ensure_ascii=False)
print("mismatches vs EPA-published:", problems)
print(f"{'blend':8} {'headline':>9} {'AR4':>7} {'AR5':>7} {'AR6':>7}   exact-headline")
for b, r in out["blends"].items():
    f = lambda k: "—" if r[k] is None else str(r[k]["value"])
    print(f"{b:8} {f('headline'):>9} {f('ar4'):>7} {f('ar5'):>7} {f('ar6'):>7}   {r['headline']['exact']}")
