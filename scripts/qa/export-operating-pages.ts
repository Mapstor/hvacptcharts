#!/usr/bin/env tsx
/**
 * Review export for the 9 operating-pressure pages. Writes
 * scripts/qa/reports/operating-pages-export.tsv — every computed cell, from the
 * module (no hand-typed values). The full rendered-text export
 * (operating-pages-text.md) is produced from the BUILT HTML by
 * scripts/qa/export-operating-text.mjs.
 */
import fs from "node:fs";
import path from "node:path";
import { loadOperating } from "../../src/lib/mdx-operating";
import { buildOperatingData, type RenderedSection } from "../../src/lib/operating-page-data";
import * as OP from "../../src/data/operating-pressures";

const IDS = ["410a", "r22", "r32", "r454b", "r407c", "r404a", "r449a", "r454c", "r744"];
const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, "scripts", "qa", "reports");
fs.mkdirSync(OUT_DIR, { recursive: true });

const COOLPROP = "CoolProp 7.2.0";
const AHRI = "AHRI 1250-2020 Tables 16/17";

interface Row {
  route: string;
  section: string;
  caption: string;
  label: string;
  f: string;
  c: string;
  psigLo: string;
  psigHi: string;
  kpaLo: string;
  kpaHi: string;
  basis: string;
  assumption: string;
  source: string;
}

const tsvRows: Row[] = [];
const push = (r: Row) => tsvRows.push(r);

function bandRow(route: string, section: string, caption: string, label: string, f: string, c: string, b: OP.Band, basis: string, assumption: string, source: string) {
  push({ route, section, caption, label, f, c, psigLo: b.lo.psigStr, psigHi: b.hi.psigStr, kpaLo: b.lo.kpaStr, kpaHi: b.hi.kpaStr, basis, assumption, source });
}
function cellRow(route: string, section: string, caption: string, label: string, f: string, c: string, cell: OP.Cell, basis: string, assumption: string, source: string) {
  push({ route, section, caption, label, f, c, psigLo: cell.psigStr, psigHi: cell.psigStr, kpaLo: cell.kpaStr, kpaHi: cell.kpaStr, basis, assumption, source });
}

const captions: Record<string, string> = {
  "residential-chart": "Operating pressure by outdoor temperature (65–115°F)",
  "commercial-head-chart": "Head (discharge) pressure by outdoor temperature (65–115°F)",
  "application-suction": "Suction pressure by application (AHRI 1250 walk-in coil temperatures)",
  "standing": "Standing pressure, system off and equalized",
  "comparison-anchor": "Side by side at 95°F outdoors",
  "comparison-chart": "High side by outdoor temperature (65–115°F)",
  "co2-suction": "CO₂ suction pressure by application (AHRI 1250 walk-in coil temperatures)",
  "co2-highside": "Subcritical high-side (condensing) pressure, 40–85°F",
  "co2-standstill": "Standstill saturation pressure, 65–85°F",
  "prose": "",
};

function emitSection(route: string, sec: RenderedSection) {
  const cap = captions[sec.kind] ?? "";
  if (sec.residentialChart) {
    const low = sec.residentialChart.low;
    bandRow(route, sec.h2, cap, "Low side (all outdoor temps)", `${OP.RES_COIL_LO_F}–${OP.RES_COIL_HI_F}`, `${OP.fmtC(OP.RES_COIL_LO_F)}–${OP.fmtC(OP.RES_COIL_HI_F)}`, low, "dew", "38–45°F indoor coil (constant)", COOLPROP);
    for (const r of sec.residentialChart.rows) {
      bandRow(route, sec.h2, cap, "High side", String(r.outdoorF), r.outdoorC, r.band, "bubble", "condenser 15–25°F above outdoor", COOLPROP);
    }
  } else if (sec.headChart) {
    for (const r of sec.headChart.rows) bandRow(route, sec.h2, cap, "Head", String(r.outdoorF), r.outdoorC, r.band, "bubble", "condenser 15–30°F above outdoor", COOLPROP);
  } else if (sec.applicationSuction) {
    bandRow(route, sec.h2, cap, `Walk-in cooler (${OP.COOLER_COIL_F}°F coil)`, String(OP.COOLER_COIL_F), OP.fmtC(OP.COOLER_COIL_F), sec.applicationSuction.cooler, "dew", "25°F cooler coil ±3°F (AHRI 1250 Table 16)", AHRI);
    bandRow(route, sec.h2, cap, `Walk-in freezer (${OP.FREEZER_COIL_F}°F coil)`, String(OP.FREEZER_COIL_F), OP.fmtC(OP.FREEZER_COIL_F), sec.applicationSuction.freezer, "dew", "−20°F freezer coil ±3°F (AHRI 1250 Table 17)", AHRI);
  } else if (sec.standing) {
    const basis = sec.standing.mode === "range" ? "dew–bubble" : sec.standing.mode === "bubble" ? "bubble" : "saturation";
    for (const r of sec.standing.rows) {
      const lo = r.cells[0];
      const hi = r.cells[r.cells.length - 1];
      push({ route, section: sec.h2, caption: cap, label: "Standing", f: String(r.tempF), c: r.tempC, psigLo: lo.psigStr, psigHi: hi.psigStr, kpaLo: lo.kpaStr, kpaHi: hi.kpaStr, basis, assumption: "system off, equalized", source: COOLPROP });
    }
  } else if (sec.comparisonAnchor) {
    for (const row of sec.comparisonAnchor.rows) {
      bandRow(route, sec.h2, cap, `${row.name} low side`, "95", OP.fmtC(95), row.low, "dew", "at 95°F outdoors", COOLPROP);
      bandRow(route, sec.h2, cap, `${row.name} high side`, "95", OP.fmtC(95), row.high, "bubble", "at 95°F outdoors", COOLPROP);
    }
  } else if (sec.comparisonChart) {
    const c = sec.comparisonChart;
    for (const r of c.rows) {
      bandRow(route, sec.h2, cap, `${c.selfName} high`, String(r.outdoorF), r.outdoorC, r.self, "bubble", "condenser 15–25°F above outdoor", COOLPROP);
      bandRow(route, sec.h2, cap, `${c.otherName} high`, String(r.outdoorF), r.outdoorC, r.other, "bubble", "condenser 15–25°F above outdoor", COOLPROP);
    }
  } else if (sec.co2Suction) {
    bandRow(route, sec.h2, cap, `Walk-in cooler (${OP.COOLER_COIL_F}°F coil)`, String(OP.COOLER_COIL_F), OP.fmtC(OP.COOLER_COIL_F), sec.co2Suction.cooler, "dew", "25°F cooler coil ±3°F (AHRI 1250 Table 16)", AHRI);
    bandRow(route, sec.h2, cap, `Walk-in freezer (${OP.FREEZER_COIL_F}°F coil)`, String(OP.FREEZER_COIL_F), OP.fmtC(OP.FREEZER_COIL_F), sec.co2Suction.freezer, "dew", "−20°F freezer coil ±3°F (AHRI 1250 Table 17)", AHRI);
  } else if (sec.co2HighSide) {
    for (const r of sec.co2HighSide.rows) cellRow(route, sec.h2, cap, "Condensing", String(r.tempF), r.tempC, r.cell, "bubble", "subcritical condensing", COOLPROP);
    if (sec.co2HighSide.critical) push({ route, section: sec.h2, caption: cap, label: "Critical point", f: sec.co2HighSide.critical.tempFStr, c: String(sec.co2HighSide.critical.tempC), psigLo: sec.co2HighSide.critical.psigStr, psigHi: sec.co2HighSide.critical.psigStr, kpaLo: "", kpaHi: "", basis: "dataset critical point", assumption: "no saturation above this point", source: COOLPROP });
  } else if (sec.co2Standstill) {
    for (const r of sec.co2Standstill.rows) cellRow(route, sec.h2, cap, "Standstill", String(r.tempF), r.tempC, r.cell, "saturation", "system off", COOLPROP);
  }
}

for (const id of IDS) {
  const loaded = loadOperating(id);
  if (!loaded) continue;
  const data = buildOperatingData(loaded.frontmatter);
  for (const sec of data.sections) emitSection(`/what-pressure-should-${id}/`, sec);
}

/* ── write TSV (every computed cell). The full rendered text export is written
 *    from the built HTML by scripts/qa/export-operating-text.mjs. ── */
const header = ["route", "section", "table_caption", "row_label", "°F", "°C", "psig_lo", "psig_hi", "kPa_lo", "kPa_hi", "basis", "assumption", "source"].join("\t");
const tsv = [header, ...tsvRows.map((r) => [r.route, r.section, r.caption, r.label, r.f, r.c, r.psigLo, r.psigHi, r.kpaLo, r.kpaHi, r.basis, r.assumption, r.source].join("\t"))].join("\n") + "\n";
fs.writeFileSync(path.join(OUT_DIR, "operating-pages-export.tsv"), tsv);
console.log(`[export-operating-pages] wrote ${tsvRows.length} TSV rows for ${IDS.length} pages`);
