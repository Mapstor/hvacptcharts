/**
 * Glue between an operating-page's frontmatter (src/lib/mdx-operating.ts) and
 * the pressure module (src/data/operating-pressures.ts). Produces, from ONE
 * computation: the {slot} map (for meta/answer/FAQ/prose interpolation), the
 * per-section rendered data, and the flat set of every psig string on the page
 * (the verify-operating-pages gate checks page text against it). Template and
 * gate both call buildOperatingData, so they cannot diverge.
 */
import type { OperatingFrontmatter, OperatingSection } from "./mdx-operating";
import * as OP from "@/data/operating-pressures";
import { getRefrigerant, satPressure, satTemp } from "@/data/refrigerants";
import { FAULT_PATTERNS, type FaultPatternId } from "./fault-patterns";

export type PageKind = "residential" | "commercial" | "co2";

/**
 * Gauge-reading direction (suction / head) for each charge-and-system fault the
 * shared SH×SC engine (src/lib/fault-patterns.ts) classifies. Superheat and
 * subcooling directions come from the engine's signature; these two columns are
 * the standard low-side/high-side fingerprints that go with them.
 */
export interface FaultRow {
  id: FaultPatternId;
  label: string;
  suction: string;
  head: string;
  superheat: string;
  subcooling: string;
  firstCheck: string;
}
const FAULT_DIRECTIONS: Partial<Record<FaultPatternId, { suction: string; head: string; superheat: string; subcooling: string; check: string }>> = {
  undercharge: { suction: "low", head: "low", superheat: "high", subcooling: "low", check: "Find and fix the leak, then recharge by weight" },
  overcharge: { suction: "high", head: "high", superheat: "low", subcooling: "high", check: "Verify condenser airflow, then recover to target" },
  restriction: { suction: "low", head: "normal–low", superheat: "high", subcooling: "high", check: "Look for a temperature drop across the filter-drier or liquid line, then check the metering device." },
  "airflow-metering": { suction: "high", head: "low", superheat: "low", subcooling: "low", check: "A TXV or EEV stuck open or with a loose sensing bulb; on a fixed-orifice system, the piston size." },
};
/** Ordered fault rows for the "readings that point to a problem" table. */
export const FAULT_ROWS: FaultRow[] = (["undercharge", "overcharge", "restriction", "airflow-metering"] as FaultPatternId[]).map((id) => {
  const d = FAULT_DIRECTIONS[id]!;
  const p = FAULT_PATTERNS[id];
  return { id, label: p.label, suction: d.suction, head: d.head, superheat: d.superheat, subcooling: d.subcooling, firstCheck: d.check };
});

export interface RenderedSection {
  h2: string;
  kind: OperatingSection["kind"];
  body?: string; // slot-filled
  note?: string; // slot-filled
  residentialChart?: { low: OP.Band; rows: OP.HighRow[] };
  headChart?: { rows: OP.HighRow[] };
  applicationSuction?: { cooler: OP.Band; freezer: OP.Band };
  standing?: { mode: OP.StandingMode; rows: OP.StandingRow[]; showBar: boolean };
  comparisonAnchor?: { rows: { slug: string; name: string; low: OP.Band; high: OP.Band }[] };
  comparisonChart?: {
    selfName: string;
    otherSlug: string;
    otherName: string;
    selfLow: OP.Band;
    otherLow: OP.Band;
    rows: { outdoorF: number; outdoorC: string; self: OP.Band; other: OP.Band }[];
  };
  co2Suction?: { cooler: OP.Band; freezer: OP.Band };
  co2HighSide?: { rows: OP.Co2Row[]; critical: OP.Co2Critical | null };
  co2Standstill?: { rows: OP.Co2Row[] };
  faultTable?: { rows: FaultRow[]; normalLine: string };
  /** Footnote text for a table that has out-of-range "—" cells. */
  gapNote?: string;
  showBar?: boolean;
}

export interface OperatingPageData {
  slug: string;
  kind: PageKind;
  slots: Record<string, string>;
  sections: RenderedSection[];
  valueSet: Set<string>;
  coolpropSource: string;
  gaps: string[];
}

const displayName = (slug: string): string => getRefrigerant(slug)?.displayName ?? slug.toUpperCase();

/** Footnote for a chart with out-of-range "—" cells (e.g. R-454B above 134°F). */
function gapNoteFor(slug: string): string {
  const maxT = OP.ptMaxTempF(slug);
  return `outside the calculated range: the ${displayName(slug)} data used here stop at a ${maxT}°F condensing temperature.`;
}

/** Round to whole °F and format with a Unicode minus for negatives. */
function fmtTempF(t: number | null): string {
  if (t === null) return OP.EM_DASH;
  const r = Math.round(t);
  return r < 0 ? `−${Math.abs(r)}°F` : `${r}°F`;
}

/** Replace every {slot}; throw on any leftover so authoring gaps fail the build. */
export function fill(template: string, slots: Record<string, string>): string {
  const out = template.replace(/\{([a-z0-9_]+)\}/gi, (_, key: string) => {
    if (!(key in slots)) throw new Error(`operating page: unknown slot {${key}}`);
    return slots[key];
  });
  const leftover = out.match(/\{[a-z0-9_]+\}/i);
  if (leftover) throw new Error(`operating page: unfilled slot ${leftover[0]}`);
  return out;
}

/** Low/high anchor bands by page kind (low = suction/low side; high = head/high side). */
function anchorBands(slug: string, kind: PageKind): { low: OP.Band; high: OP.Band } {
  if (kind === "commercial") {
    const a = OP.commercialAnchor(slug);
    return { low: a.cooler, high: a.head };
  }
  // residential (co2 doesn't use anchorBands for comparison)
  return OP.residentialAnchor(slug);
}

/**
 * "about N% lower/higher" (or "about N–M% …" when the two band ends round
 * differently) for slug A vs slug B across a saturation band. Whole percent.
 */
function compareDesc(slugA: string, slugB: string, t1: number, t2: number, curve: "dew" | "bubble", asRange: boolean): string | null {
  const a1 = satPressure(slugA, t1, curve), a2 = satPressure(slugA, t2, curve);
  const b1 = satPressure(slugB, t1, curve), b2 = satPressure(slugB, t2, curve);
  if (a1 === null || a2 === null || b1 === null || b2 === null) return null;
  const p1 = ((a1 - b1) / b1) * 100;
  const p2 = ((a2 - b2) / b2) * 100;
  const dir = (p1 + p2) / 2 >= 0 ? "higher" : "lower";
  if (!asRange) {
    // Single whole-percent from the band average.
    return `about ${Math.round(Math.abs((p1 + p2) / 2))}% ${dir}`;
  }
  const n1 = Math.round(Math.abs(p1));
  const n2 = Math.round(Math.abs(p2));
  const lo = Math.min(n1, n2), hi = Math.max(n1, n2);
  return `about ${lo === hi ? lo : `${lo}–${hi}`}% ${dir}`;
}

/** Method-block prose (shared by the template and the review export). */
export function methodParagraphs(kind: PageKind, coolprop: string, refName: string): string[] {
  const p1 =
    `Every pressure here is ${refName}'s saturation pressure at the stated temperature, calculated with ${coolprop}. ` +
    `Suction (low side) uses the saturated-vapor (dew) pressure; head (high side) uses the saturated-liquid (bubble) pressure.`;
  let p2: string;
  if (kind === "residential") {
    p2 =
      "For the low side we read a 38–45°F indoor evaporator coil: the low side depends mainly on the indoor coil (indoor temperature and airflow) and moves far less than the high side, which we take as a condenser running 15–25°F above the outdoor air. " +
      "We use 95°F as the reference because it is the outdoor temperature in the AHRI 210/240 A2 rating test (95°F outdoors, 80°F/67°F indoors).";
  } else if (kind === "commercial") {
    p2 =
      "Suction uses the AHRI 1250-2020 walk-in coil temperatures — 25°F for a cooler, −20°F for a freezer — read on the dew curve at the coil ±3°F; head is a condenser running 15–30°F above the outdoor air. " +
      "We use 95°F as the reference because it is one of the AHRI 1250 outdoor rating temperatures for condensing units.";
  } else {
    p2 =
      "CO₂ suction uses the AHRI 1250-2020 walk-in coil temperatures (25°F cooler, −20°F freezer). " +
      "Below the critical temperature the high side is a saturation (condensing) pressure; above it the system is transcritical and the high-pressure control valve sets the gas-cooler pressure.";
  }
  return [p1, p2];
}

export function buildOperatingData(fm: OperatingFrontmatter): OperatingPageData {
  const slug = fm.refrigerantSlug;
  const kind = fm.pageKind as PageKind;
  const valueSet = new Set<string>();
  const gaps: string[] = [];

  /* ── slots ── */
  const slots: Record<string, string> = {};
  if (kind === "residential") {
    const a = OP.residentialAnchor(slug);
    slots.low = a.low.psigStr;
    slots.low_kpa = a.low.kpaStr;
    slots.low_bar = a.low.barStr;
    slots.high = a.high.psigStr;
    slots.high_kpa = a.high.kpaStr;
    slots.high_bar = a.high.barStr;
    OP.collectBand(valueSet, a.low, a.high);
    slots.t28_dew = fmtTempF(satTemp(slug, 28, "dew"));
    slots.t28_bubble = fmtTempF(satTemp(slug, 28, "bubble"));
    // High side at individual outdoor points, for FAQ answers.
    for (const o of [70, 80, 90, 100] as const) {
      const b = OP.band(slug, o + OP.RES_HEAD_LO_OFFSET, o + OP.RES_HEAD_HI_OFFSET, "bubble");
      slots[`high${o}`] = b.psigStr;
      OP.collectBand(valueSet, b);
    }
  } else if (kind === "commercial") {
    const a = OP.commercialAnchor(slug);
    slots.mt = a.cooler.psigStr;
    slots.mt_kpa = a.cooler.kpaStr;
    slots.lt = a.freezer.psigStr;
    slots.lt_kpa = a.freezer.kpaStr;
    slots.high = a.head.psigStr;
    slots.high_kpa = a.head.kpaStr;
    OP.collectBand(valueSet, a.cooler, a.freezer, a.head);
    const s68 = OP.standingRows(slug, "range", [68])[0];
    slots.stand68 = s68.psigStr;
    OP.collectCell(valueSet, ...s68.cells);
  } else {
    // co2
    const sc = OP.co2Suction(slug);
    slots.mt = sc.cooler.psigStr;
    slots.mt_kpa = sc.cooler.kpaStr;
    slots.lt = sc.freezer.psigStr;
    slots.lt_kpa = sc.freezer.kpaStr;
    OP.collectBand(valueSet, sc.cooler, sc.freezer);
    const crit = OP.co2Critical(slug);
    if (crit) {
      slots.tcrit = crit.tempFStr;
      slots.crit = crit.psigStr;
      valueSet.add(crit.psigStr);
    }
    const sat70 = OP.satAt(slug, 70, "dew");
    slots.sat70 = sat70.psigStr;
    OP.collectCell(valueSet, sat70);
  }

  /* ── narrative comparison slots: "about N% lower/higher" per fm.compares ── */
  // Commercial "on the same box" compares at the single cooler coil temperature;
  // residential compares across the 38–45°F coil band.
  const lowT: [number, number] = kind === "commercial"
    ? [OP.COOLER_COIL_F, OP.COOLER_COIL_F]
    : [OP.RES_COIL_LO_F, OP.RES_COIL_HI_F];
  const highT: [number, number] = kind === "commercial"
    ? [OP.ANCHOR_OUTDOOR_F + OP.COM_HEAD_LO_OFFSET, OP.ANCHOR_OUTDOOR_F + OP.COM_HEAD_HI_OFFSET]
    : [OP.ANCHOR_OUTDOOR_F + OP.RES_HEAD_LO_OFFSET, OP.ANCHOR_OUTDOOR_F + OP.RES_HEAD_HI_OFFSET];
  for (const c of fm.compares ?? []) {
    const low = compareDesc(slug, c.slug, lowT[0], lowT[1], "dew", !!c.range);
    const high = compareDesc(slug, c.slug, highT[0], highT[1], "bubble", !!c.range);
    if (low) slots[`cmp_${c.key}_low`] = low;
    if (high) slots[`cmp_${c.key}_high`] = high;
    slots[`cmp_${c.key}_name`] = displayName(c.slug);
  }

  // Standing-pressure anchors at room-temperature references, using the page's
  // own standing mode (68°F = 20°C, 70°F, 75°F, 86°F = 30°C).
  const standingSection = fm.sections.find((s) => s.kind === "standing");
  if (standingSection) {
    const mode = (standingSection.mode ?? "sat") as OP.StandingMode;
    for (const t of [68, 70, 75, 86] as const) {
      const row = OP.standingRows(slug, mode, [t])[0];
      slots[`stand${t}`] = row.psigStr;
      OP.collectCell(valueSet, ...row.cells);
    }
  }

  slots.coolprop = OP.ptDatasetSource(slug);

  /* ── sections ── */
  const sections: RenderedSection[] = fm.sections.map((sec) => {
    const rs: RenderedSection = {
      h2: sec.h2,
      kind: sec.kind,
      body: sec.body ? fill(sec.body, slots) : undefined,
      note: sec.note ? fill(sec.note, slots) : undefined,
      showBar: sec.showBar,
    };
    switch (sec.kind) {
      case "residential-chart": {
        const low = OP.residentialLowBand(slug);
        const rows = OP.residentialHighRows(slug);
        OP.collectBand(valueSet, low, ...rows.map((r) => r.band));
        rows.forEach((r) => { if (r.band.gap) gaps.push(`${slug} residential high side, outdoor ${r.outdoorF}°F: ${OP.GAP_NOTE}`); });
        rs.residentialChart = { low, rows };
        if (rows.some((r) => r.band.gap)) rs.gapNote = gapNoteFor(slug);
        break;
      }
      case "commercial-head-chart": {
        const rows = OP.commercialHeadRows(slug);
        OP.collectBand(valueSet, ...rows.map((r) => r.band));
        rows.forEach((r) => { if (r.band.gap) gaps.push(`${slug} head, outdoor ${r.outdoorF}°F: ${OP.GAP_NOTE}`); });
        rs.headChart = { rows };
        break;
      }
      case "application-suction": {
        const s = OP.commercialSuction(slug);
        OP.collectBand(valueSet, s.cooler, s.freezer);
        rs.applicationSuction = s;
        break;
      }
      case "standing": {
        const mode = (sec.mode ?? "sat") as OP.StandingMode;
        const temps = [...OP.STANDING_ROWS_F, ...(sec.extraTempsF ?? [])].sort((a, b) => a - b);
        const rows = OP.standingRows(slug, mode, temps);
        rows.forEach((r) => OP.collectCell(valueSet, ...r.cells));
        rs.standing = { mode, rows, showBar: !!sec.showBar };
        break;
      }
      case "comparison-anchor": {
        const slugs = sec.compareSlugs ?? [slug];
        const rows = slugs.map((s) => {
          const ab = anchorBands(s, kind);
          OP.collectBand(valueSet, ab.low, ab.high);
          return { slug: s, name: displayName(s), low: ab.low, high: ab.high };
        });
        rs.comparisonAnchor = { rows };
        break;
      }
      case "comparison-chart": {
        const other = sec.compareSlug!;
        const selfRows = OP.residentialHighRows(slug);
        const otherRows = OP.residentialHighRows(other);
        const selfLow = OP.residentialLowBand(slug);
        const otherLow = OP.residentialLowBand(other);
        OP.collectBand(valueSet, selfLow, otherLow, ...selfRows.map((r) => r.band), ...otherRows.map((r) => r.band));
        rs.comparisonChart = {
          selfName: displayName(slug),
          otherSlug: other,
          otherName: displayName(other),
          selfLow,
          otherLow,
          rows: selfRows.map((r, i) => ({
            outdoorF: r.outdoorF,
            outdoorC: r.outdoorC,
            self: r.band,
            other: otherRows[i].band,
          })),
        };
        if (selfRows.some((r) => r.band.gap) || otherRows.some((r) => r.band.gap)) rs.gapNote = gapNoteFor(slug);
        break;
      }
      case "co2-suction": {
        const s = OP.co2Suction(slug);
        OP.collectBand(valueSet, s.cooler, s.freezer);
        rs.co2Suction = s;
        break;
      }
      case "co2-highside": {
        const rows = OP.co2CondensingRows(slug);
        rows.forEach((r) => OP.collectCell(valueSet, r.cell));
        const critical = OP.co2Critical(slug);
        if (critical) valueSet.add(critical.psigStr);
        rs.co2HighSide = { rows, critical };
        break;
      }
      case "co2-standstill": {
        const rows = OP.co2StandstillRows(slug);
        rows.forEach((r) => OP.collectCell(valueSet, r.cell));
        rs.co2Standstill = { rows };
        break;
      }
      case "fault-table": {
        const normalLine = kind === "commercial"
          ? `A healthy ${displayName(slug)} system at 95°F outdoors reads about ${slots.mt} psig suction on a 25°F cooler coil, ${slots.lt} psig on a −20°F freezer coil, and ${slots.high} psig head.`
          : `A healthy ${displayName(slug)} system at 95°F outdoors reads about ${slots.low} psig on the low side and ${slots.high} psig on the high side.`;
        rs.faultTable = { rows: FAULT_ROWS, normalLine };
        break;
      }
      case "prose":
        break;
    }
    return rs;
  });

  return {
    slug,
    kind,
    slots,
    sections,
    valueSet,
    coolpropSource: OP.ptDatasetSource(slug),
    gaps,
  };
}
