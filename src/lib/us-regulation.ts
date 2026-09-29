/**
 * US (and EU/Kigali) regulatory engine — the ONE derivation layer for every
 * regulatory fact rendered on the site. Every value here comes from
 * `data/reference/regulatory.json` (verified against primary text) plus the
 * refrigerant dataset. No page may state a US ban/limit that this engine did
 * not produce.
 *
 * Core rules implemented:
 *   - isRegulated: the refrigerant is (or a blend containing) one of the 18 AIM
 *     Act regulated HFCs (42 U.S.C. 7675(c)).
 *   - gwp8464: 40 CFR 84.64 — constituent GWP x nominal mass fraction, CFC/HCFC/
 *     PFC constituents EXCLUDED (84.64(c)). Used for every 84.54 threshold.
 *   - restrictions: every applicable 84.54 entry (gwpAtLeast / named / tiered).
 *   - allowedUntil / notRestricted: per mapped subsector.
 *   - ods / eu: ozone (class I/II) and EU 517/2014 facts.
 */
import regulatory from "../../data/reference/regulatory.json";
import { refrigerants, getRefrigerant, gwpNum, type Refrigerant } from "@/data/refrigerants";

/* ─────────────────────────── typed view of the JSON ─────────────────────── */

type GwpRule = { gwpAtLeast: number };
type NamedRule = { named: string[] };
export type Tier = { condition: string; gwpAtLeast: number };
type TieredRule = { tiered: Tier[] };
type Rule = GwpRule | NamedRule | TieredRule;
export type Sector = "refrigeration_ac" | "mvac" | "foam" | "aerosol";
interface RawEntry {
  cfr: string;
  type: "manufacture_import" | "installation";
  subsector: string;
  effective: string | null; // null for model-year entries (see effectiveModelYear)
  rule: Rule;
  note?: string;
  sector: Sector;
  effectiveModelYear?: number;
}
const TT = regulatory.us.technologyTransitions as unknown as {
  title: string;
  currentThrough: string;
  sourceUrl: string;
  regulatedSubstances: string[];
  installationDefinition: string;
  servicing: string;
  entries: RawEntry[];
  phasedown: { source: string; schedule: { years: string; percentOfBaseline: number }[] };
};
const ODS = regulatory.us.ods as unknown as {
  entries: { substances: string; event: string; date: string; source: string; url: string }[];
  servicingNote: string;
};
const EU = regulatory.eu as unknown as {
  regulation517_2014: {
    name: string;
    status: string;
    annexIII: { row: number; product: string; condition: string; gwpAtLeast: number; date: string }[];
    annexIIIType: string;
    article13_3: { gwpAtLeast: number; date: string; text: string };
    url: string;
  };
  regulation2024_573: { name: string; applies: string; summary: string; gwpBasisNote?: string; url: string };
  macDirective: {
    name: string;
    rule: string;
    newVehicleTypes: string;
    allNewVehicles: string;
    text: string;
    url: string;
  };
};
const SECTION608 = regulatory.us.section608 as unknown as {
  usedRefrigerantSale: { cfr: string; text: string; url: string };
  recoveryEquipmentStandards: { cfr: string; heading: string; url: string };
  evacuationLevels: { cfr: string; title: string; note: string; url: string };
  leakRepairNote: string;
};
const AIMACT = regulatory.us.aimAct as unknown as {
  citation: string;
  phasedownRegulation: { cfr: string; heading: string; url: string };
  note: string;
};
const SNAP = regulatory.us.snap as unknown as {
  note: string;
  entries: {
    endUse: string;
    substances: string[];
    status: string;
    detail?: string;
    equipment?: string;
    fr?: string;
    url: string;
  }[];
};
const MONTREAL = regulatory.montrealProtocol as unknown as {
  kigaliAnnexF: string;
  cfcDevelopingCountries: string;
  ozoneRecovery: string;
  urls: string[];
};
const KIGALI = regulatory.kigali as unknown as {
  montrealProtocolParties: number;
  kigaliRatifications: number;
  asOf: string;
  source: string;
};

export const AIM_SOURCE_LINE = `40 CFR 84.54, current through 91 FR 31329 (May 26, 2026)`;
export const AIM_SOURCE_URL = TT.sourceUrl;
export const AIM_ACT_CITE = "AIM Act, 42 U.S.C. 7675";
export const INSTALLATION_DEFINITION = TT.installationDefinition;
export const SERVICING_NOTE = TT.servicing;
export const PHASEDOWN = TT.phasedown;

export const SECTOR_LABEL: Record<Sector, string> = {
  refrigeration_ac: "Refrigeration, air conditioning & heat pumps",
  mvac: "Motor vehicle air conditioning",
  foam: "Foam blowing agents",
  aerosol: "Aerosol propellants / solvents",
};
export const SECTOR_ORDER: Sector[] = ["refrigeration_ac", "mvac", "foam", "aerosol"];

/* ─────────────────────────── designation resolver ───────────────────────── */

const norm = (s: string): string =>
  String(s)
    .toLowerCase()
    .replace(/^hfc-/, "r-")
    .replace(/^cfc-/, "r-")
    .replace(/^hcfc-/, "r-")
    .replace(/^pfc-/, "r-")
    .replace(/[\s‑]/g, "")
    .replace(/^co₂$/, "r-744")
    .replace(/^co2$/, "r-744");

const BY_DESIG = new Map<string, Refrigerant>();
for (const r of refrigerants) {
  const forms = [r.displayName, ...(r.altSpellings ?? []), r.ashraeNumber ? `R-${r.ashraeNumber}` : ""].filter(Boolean);
  for (const f of forms) BY_DESIG.set(norm(f), r);
  BY_DESIG.set(r.slug, r);
}
function resolve(designation: string): Refrigerant | null {
  return BY_DESIG.get(norm(designation)) ?? getRefrigerant(norm(designation)) ?? null;
}

/* ─────────────────────────── regulated-substance test ───────────────────── */

const REGULATED = new Set(TT.regulatedSubstances.map(norm));

/** 84.54 appliesTo: the refrigerant is a regulated HFC, or a blend containing one. */
export function isRegulated(r: Refrigerant): boolean {
  if (REGULATED.has(norm(r.displayName))) return true;
  for (const c of r.composition ?? []) if (REGULATED.has(norm(c.component))) return true;
  return false;
}

/* ─────────────────────────── gwp8464 (40 CFR 84.64) ─────────────────────── */

// 84.64(c): CFC, HCFC and PFC constituents are excluded from the blend GWP.
const EXCLUDED_CONSTITUENT_TYPES = new Set(["cfc", "hcfc", "pfc", "cfc-blend", "hcfc-blend"]);

// AIM Act appendix A exchange values (= IPCC AR4 GWPs) for the 18 regulated HFCs.
// Used as the constituent GWP when a blend component (a regulated HFC) is not a
// standalone entry in the refrigerant dataset (e.g. HFC-23 in R-503, HFC-227ea
// in R-515A/R-515B), so 84.64 GWP is not undercounted.
const AIM_EXCHANGE_VALUES: Record<string, number> = {
  "r-23": 14800, "r-32": 675, "r-41": 92, "r-125": 3500, "r-134": 1100, "r-134a": 1430,
  "r-143": 328, "r-143a": 4470, "r-152": 53, "r-152a": 124, "r-227ea": 3220,
  "r-236cb": 1340, "r-236ea": 1370, "r-236fa": 9810, "r-245ca": 693, "r-245fa": 1030,
  "r-365mfc": 794, "r-43-10mee": 1640,
};

/**
 * 40 CFR 84.64 GWP: sum of each constituent's GWP (its AIM exchange value / the
 * dataset headline value) times nominal mass fraction, EXCLUDING CFC/HCFC/PFC
 * constituents (84.64(c)). For a pure regulated HFC this is its own value.
 */
export function gwp8464(r: Refrigerant): number {
  const comp = r.composition ?? [];
  if (comp.length === 0) {
    if (EXCLUDED_CONSTITUENT_TYPES.has(r.type)) return 0;
    return gwpNum(r.environmental.gwp.headline) ?? 0;
  }
  let sum = 0;
  for (const c of comp) {
    const cx = resolve(c.component);
    if (!cx) {
      // Constituent not a standalone dataset entry. If it is a regulated HFC,
      // use its AIM exchange value; otherwise it has no listed GWP → excluded
      // (this correctly drops CFC/HCFC components like R-13/R-115 not in the set).
      const ev = AIM_EXCHANGE_VALUES[norm(c.component)];
      if (ev != null) sum += ev * c.massFraction;
      continue;
    }
    if (EXCLUDED_CONSTITUENT_TYPES.has(cx.type)) continue; // 84.64(c)
    sum += (gwpNum(cx.environmental.gwp.headline) ?? 0) * c.massFraction;
  }
  return sum;
}

/* ─────────────────────────── restrictions (84.54) ───────────────────────── */

export type RuleKind = "gwp" | "named" | "tiered";
export interface AppliedRestriction {
  cfr: string; // full CFR string, e.g. "40 CFR 84.54(c)(11)(i)"
  para: string; // paragraph key, e.g. "(c)(11)(i)"
  type: "manufacture_import" | "installation";
  action: string; // "Manufacture / import" | "Installation" | "Sale / distribution"
  subsector: string;
  effective: string | null; // ISO date, or null for model-year entries
  effectiveModelYear?: number; // set when effective is null (e.g. MY2028)
  sector: Sector;
  ruleKind: RuleKind;
  limit: number | null; // gwpAtLeast for gwp rules; null for named
  tiers?: Tier[]; // for tiered rules, the tiers that apply to this refrigerant
  note?: string;
  derived?: boolean; // true for the derived 84.54(b) sale/distribution rows
}

/** Paragraph key after "84.54", e.g. "(c)(11)(i)". */
function paraKey(cfr: string): string {
  const m = cfr.match(/84\.54(\(.+)$/);
  return m ? m[1] : cfr;
}

const ACTION_LABEL: Record<RawEntry["type"], string> = {
  manufacture_import: "Manufacture / import",
  installation: "Installation",
};

function entryApplies(entry: RawEntry, g8: number, r: Refrigerant): { applies: boolean; tiers?: Tier[] } {
  const rule = entry.rule;
  if ("gwpAtLeast" in rule) return { applies: rule.gwpAtLeast <= g8 };
  if ("named" in rule) {
    const set = new Set(rule.named.map(norm));
    return { applies: set.has(norm(r.displayName)) };
  }
  if ("tiered" in rule) {
    const tiers = rule.tiered.filter((t) => t.gwpAtLeast <= g8);
    return { applies: tiers.length > 0, tiers };
  }
  return { applies: false };
}

function toApplied(entry: RawEntry, tiers?: Tier[]): AppliedRestriction {
  const rule = entry.rule;
  const ruleKind: RuleKind = "gwpAtLeast" in rule ? "gwp" : "named" in rule ? "named" : "tiered";
  return {
    cfr: entry.cfr,
    para: paraKey(entry.cfr),
    type: entry.type,
    action: ACTION_LABEL[entry.type],
    subsector: entry.subsector,
    effective: entry.effective,
    effectiveModelYear: entry.effectiveModelYear,
    sector: entry.sector,
    ruleKind,
    limit: "gwpAtLeast" in rule ? rule.gwpAtLeast : null,
    tiers: ruleKind === "tiered" ? tiers ?? (rule as TieredRule).tiered : undefined,
    note: entry.note,
  };
}

/**
 * Every 84.54 entry that restricts this refrigerant (gwpAtLeast <= gwp8464, named
 * match, or any applicable tier). Base entries only — the derived 84.54(b) sale/
 * distribution rows are NOT included here (this is the count the gate asserts).
 */
export function restrictions(r: Refrigerant): AppliedRestriction[] {
  if (!isRegulated(r)) return [];
  // 84.54's refrigeration categories (incl. industrial process) have a −50 °C
  // scope floor; a refrigerant used only in ultra-low-temperature cascade /
  // cryogenic service falls below every category, so none list it (e.g. R-503).
  if (isUltraLowTempOnly(r)) return [];
  const g8 = gwp8464(r);
  const out: AppliedRestriction[] = [];
  for (const e of TT.entries) {
    const { applies, tiers } = entryApplies(e, g8, r);
    if (applies) out.push(toApplied(e, tiers));
  }
  return out;
}

/** Add derived 84.54(b) rows: sale/distribution ends 3 years after each (a) date. */
export function derivedSaleRows(applied: AppliedRestriction[]): AppliedRestriction[] {
  const out: AppliedRestriction[] = [];
  for (const a of applied) {
    if (a.type !== "manufacture_import") continue;
    if (a.effective === null) continue; // model-year entries create no derived (b) row
    const y = Number(a.effective.slice(0, 4));
    out.push({
      ...a,
      cfr: "40 CFR 84.54(b)",
      para: "(b)",
      type: "manufacture_import",
      action: "Sale / distribution",
      effective: `${y + 3}${a.effective.slice(4)}`,
      derived: true,
    });
  }
  return out;
}

/* ─────────────────────────── subsector mapping ──────────────────────────── */

export interface Subsector {
  id: string;
  label: string;
  keyword: RegExp;
  prefixes: string[]; // paragraph-key prefixes, e.g. "(c)(11)"
}

// Task 20 mapping: application keyword -> 84.54 subsector paragraph group.
export const SUBSECTORS: Subsector[] = [
  { id: "remote-condensing", label: "Retail food — remote condensing units", keyword: /walk-?in|remote condensing/i, prefixes: ["(c)(11)"] },
  { id: "supermarket", label: "Retail food — supermarket systems", keyword: /supermarket/i, prefixes: ["(c)(12)"] },
  { id: "standalone", label: "Retail food — stand-alone units", keyword: /stand-?alone/i, prefixes: ["(a)(4)"] },
  { id: "transport", label: "Refrigerated transport", keyword: /transport|reefer|intermodal/i, prefixes: ["(a)(6)", "(a)(7)", "(c)(7)", "(c)(8)"] },
  { id: "ice-machines", label: "Automatic commercial ice machines", keyword: /ice machine|ice maker|ice-making/i, prefixes: ["(a)(8)", "(c)(14)"] },
  { id: "cold-storage", label: "Cold storage warehouses", keyword: /cold storage/i, prefixes: ["(c)(9)"] },
  { id: "residential-ac", label: "Residential & light-commercial AC and heat pumps", keyword: /residential|light commercial|central air|air conditioning|heat pump|rooftop|split system|vrf|vrv/i, prefixes: ["(a)(1)", "(c)(1)", "(c)(2)"] },
  { id: "chillers", label: "Chillers", keyword: /chiller/i, prefixes: ["(a)(10)(i)", "(a)(10)(iii)", "(a)(10)(iv)", "(c)(3)", "(c)(5)", "(c)(6)"] },
  { id: "household", label: "Household refrigerators & freezers", keyword: /household/i, prefixes: ["(a)(3)"] },
  { id: "vending", label: "Vending machines", keyword: /vending/i, prefixes: ["(a)(5)"] },
  { id: "industrial", label: "Industrial process refrigeration", keyword: /industrial process/i, prefixes: ["(a)(12)", "(c)(10)"] },
  { id: "food-processing", label: "Refrigerated food processing & dispensing", keyword: /food processing|dispensing|food service/i, prefixes: ["(a)(9)", "(c)(15)"] },
  { id: "ice-rinks", label: "Ice rinks", keyword: /ice rink/i, prefixes: ["(a)(10)(ii)", "(c)(4)"] },
  // v2 additions
  { id: "vehicle-ac", label: "Motor vehicle air conditioning", keyword: /mobile air|mobile a\/?c|automotive|motor vehicle|vehicle air|car air|car a\/?c|passenger vehicle/i, prefixes: ["(a)(13)"] },
  { id: "dehumidifiers", label: "Residential dehumidifiers", keyword: /dehumidif/i, prefixes: ["(a)(2)"] },
  { id: "data-center", label: "Data center / IT / computer-room cooling", keyword: /data cent|information technology|computer[- ]room|\bIT equipment|it cooling/i, prefixes: ["(a)(11)", "(c)(13)"] },
  { id: "foam", label: "Foam blowing agents", keyword: /foam[- ]?blow|blowing agent|foam expansion|insulation foam|foam agent/i, prefixes: ["(a)(14)", "(a)(15)"] },
  { id: "aerosol", label: "Aerosol propellants / solvents", keyword: /aerosol|propellant/i, prefixes: ["(a)(16)"] },
];

/** Sort key for entries that may have a null effective date (model-year entries). */
export function effKey(e: { effective: string | null; effectiveModelYear?: number }): string {
  return e.effective ?? (e.effectiveModelYear ? `${e.effectiveModelYear}-01-01` : "9999-99-99");
}

/** Human label for an entry's effective timing (date or model year). */
export function effectiveLabel(a: { effective: string | null; effectiveModelYear?: number }): string {
  if (a.effective) return fmtDate(a.effective);
  if (a.effectiveModelYear) return `Model Year ${a.effectiveModelYear} and later`;
  return "—";
}

function prefixMatches(para: string, prefix: string): boolean {
  return para === prefix || para.startsWith(prefix + "(");
}

/** Mapped subsectors for a refrigerant, from its `applications` free text. */
export function usSubsectors(r: Refrigerant): Subsector[] {
  const hay = (r.applications ?? []).join(" • ");
  return SUBSECTORS.filter((s) => s.keyword.test(hay));
}

const ULTRA_LOW_RE = /ultra-?low|cryogenic|cascade low-stage/i;

/**
 * True when a refrigerant is used only in ultra-low-temperature / cryogenic /
 * cascade low-stage service (below 84.54's −50 °C industrial-process floor) and
 * maps to no in-scope 84.54 end-use. R-503 is the only regulated example.
 */
export function isUltraLowTempOnly(r: Refrigerant): boolean {
  const apps = (r.applications ?? []).join(" • ");
  if (!ULTRA_LOW_RE.test(apps)) return false;
  return usSubsectors(r).length === 0;
}

/** Exact ultra-low-temperature explanation sentence for the 84.54 section. */
export function ultraLowTempNote(r: Refrigerant): string {
  return `84.54's industrial-process categories cover −50 °C (−58 °F) and warmer; ${r.displayName}'s ultra-low-temperature cascade use is below that, so no 84.54 category lists it.`;
}

/** All 84.54 entries (any refrigerant) belonging to a subsector, date-sorted. */
function entriesForSubsector(s: Subsector): RawEntry[] {
  return TT.entries
    .filter((e) => s.prefixes.some((p) => prefixMatches(paraKey(e.cfr), p)))
    .sort((a, b) => effKey(a).localeCompare(effKey(b)));
}

export interface SubsectorStatus {
  subsector: Subsector;
  applied: AppliedRestriction[]; // entries in this subsector that restrict the refrigerant, date-sorted
  earliestRestricted: string | null; // ISO date of earliest applicable rule, or null
  allowedUntil: string | null; // date it becomes restricted while an EARLIER rule did not apply
  notRestricted: boolean; // no rule in this subsector applies
  limitAtEarliest: number | null;
}

/** Per-subsector regulatory status for one refrigerant. */
export function subsectorStatus(r: Refrigerant, s: Subsector): SubsectorStatus {
  const g8 = gwp8464(r);
  const reg = isRegulated(r);
  const rows = entriesForSubsector(s);
  const applied: AppliedRestriction[] = [];
  let hasEarlierNonApplicable = false;
  for (const e of rows) {
    const { applies, tiers } = reg ? entryApplies(e, g8, r) : { applies: false, tiers: undefined };
    if (applies) applied.push(toApplied(e, tiers));
    else hasEarlierNonApplicable = true;
  }
  applied.sort((a, b) => effKey(a).localeCompare(effKey(b)));
  const earliest = applied[0] ?? null;
  return {
    subsector: s,
    applied,
    earliestRestricted: earliest?.effective ?? null,
    // "allowed until" = a later rule catches it while an earlier rule did not.
    allowedUntil: earliest && hasEarlierNonApplicable ? earliest.effective : null,
    notRestricted: applied.length === 0,
    limitAtEarliest: earliest?.limit ?? null,
  };
}

/** allowedUntil(ref, subsectorId): the date a later rule restricts a refrigerant
 *  that an earlier rule in the same subsector did not. */
export function allowedUntil(r: Refrigerant, subsectorId: string): string | null {
  const s = SUBSECTORS.find((x) => x.id === subsectorId);
  return s ? subsectorStatus(r, s).allowedUntil : null;
}

/** notRestricted(ref, subsectorId): true when no rule in the subsector applies. */
export function notRestricted(r: Refrigerant, subsectorId: string): boolean {
  const s = SUBSECTORS.find((x) => x.id === subsectorId);
  return s ? subsectorStatus(r, s).notRestricted : true;
}

/* ─────────────────────────── ODS (class I / II) ─────────────────────────── */

export interface OdsMilestone { substances: string; event: string; date: string; source: string; url: string }

function containsType(r: Refrigerant, pred: (t: string) => boolean): boolean {
  if (pred(r.type)) return true;
  for (const c of r.composition ?? []) {
    const cx = resolve(c.component);
    if (cx && pred(cx.type)) return true;
  }
  return false;
}
function isOrContains(r: Refrigerant, designations: string[]): boolean {
  const set = new Set(designations.map(norm));
  if (set.has(norm(r.displayName))) return true;
  for (const c of r.composition ?? []) if (set.has(norm(c.component))) return true;
  return false;
}

/** us.ods milestones relevant to a refrigerant's CFC/HCFC chemistry. */
export function ods(r: Refrigerant): OdsMilestone[] {
  const out: OdsMilestone[] = [];
  const byDate = (a: OdsMilestone, b: OdsMilestone) => a.date.localeCompare(b.date);
  const hasCfc = containsType(r, (t) => t === "cfc" || t === "cfc-blend");
  const isHcfc22or142b = isOrContains(r, ["R-22", "R-142b"]);
  const otherHcfc = containsType(r, (t) => t === "hcfc" || t === "hcfc-blend") && !isHcfc22or142b;
  for (const e of ODS.entries) {
    const s = e.substances;
    if (hasCfc && /CFC/i.test(s) && !/HCFC/i.test(s)) out.push(e);
    else if (isHcfc22or142b && /HCFC-22/i.test(s)) out.push(e);
    // Other HCFCs (R-123, R-124): the 2015 "except for equipment made before 2020"
    // step and the 2030 all-HCFC end. Not the R-22/R-142b 2010/2020 rows.
    else if (otherHcfc && (/HCFCs other than/i.test(s) || /All HCFCs/i.test(s))) out.push(e);
  }
  return out.sort(byDate);
}
export const ODS_SERVICING_NOTE = ODS.servicingNote;

/**
 * Hero-badge label for an ODS refrigerant's US production/import status (O3),
 * derived from us.ods. CFC → "Production banned · 1996"; R-22/R-142b →
 * "Production/import ended · 2020"; other HCFCs (R-123, R-124) → the 2015 step
 * with the 2030 end. Returns null for non-ODS refrigerants.
 */
export function odsPhaseoutBadge(r: Refrigerant): string | null {
  const hasCfc = containsType(r, (t) => t === "cfc" || t === "cfc-blend");
  if (hasCfc) return "Production banned · 1996";
  const isHcfc22or142b = isOrContains(r, ["R-22", "R-142b"]);
  if (isHcfc22or142b) return "Production/import ended · 2020";
  const otherHcfc = containsType(r, (t) => t === "hcfc" || t === "hcfc-blend");
  if (otherHcfc) return "Since 2015: production/import only as refrigerant for equipment made before 2020 · ends January 1, 2030";
  return null;
}

/* ─────────────────────────── EU 517/2014 ────────────────────────────────── */

export interface EuRow { row: number; product: string; condition: string; gwpAtLeast: number; date: string; kind: "market" | "servicing" }
export const EU_FRAMING = "Regulation (EU) No 517/2014, since replaced by (EU) 2024/573, applying from 11 March 2024";
/** One-line EU framing (E2): 517/2014 replaced by 2024/573 + the 2024/573 GWP basis. */
export const EU_REGULATION_SUMMARY =
  "Regulation (EU) No 517/2014, replaced by (EU) 2024/573 (applying from 11 March 2024); 2024/573 uses AR4 GWPs for HFCs and AR6 for other fluorinated gases (recital 8).";
export const EU_URL = EU.regulation517_2014.url;
export const EU_2024_URL = EU.regulation2024_573.url;

/* ─────────────────────── EU mobile A/C directive (2006/40/EC) ────────────── */
export const MAC_DIRECTIVE = EU.macDirective;
/** E4 phrasing: new vehicle types 2011, all new vehicles 2017. */
export const MAC_DIRECTIVE_TEXT =
  "EU Directive 2006/40/EC restricts MVAC refrigerant above 150 GWP: from 1 January 2011 for new vehicle types, and from 1 January 2017 for all new vehicles put on the EU market.";

/* ─────────────────────── US Section 608 (40 CFR 82) ─────────────────────── */
export const SECTION_608 = SECTION608;
export const USED_REFRIGERANT_SALE_RULE = SECTION608.usedRefrigerantSale; // 40 CFR 82.154(d)
export const RECOVERY_EQUIPMENT_STANDARD = SECTION608.recoveryEquipmentStandards; // 40 CFR 82.158 heading
export const EVACUATION_LEVELS = SECTION608.evacuationLevels; // 40 CFR 82.156(a), Table 1
export const LEAK_REPAIR_NOTE = SECTION608.leakRepairNote; // no general "no top-off" rule; size-based duties

/* ─────────────────────────── AIM Act citation (v4) ──────────────────────── */
export const AIM_ACT = AIMACT;
export const AIM_ACT_CITATION = AIMACT.citation; // "AIM Act, 42 U.S.C. 7675 (Public Law 116-260 …)"
export const AIM_PHASEDOWN_CFR = AIMACT.phasedownRegulation; // 40 CFR 84.7 "Phasedown schedule."

/* ─────────────────────────── Montreal Protocol (v4) ─────────────────────── */
export const MONTREAL_PROTOCOL = MONTREAL;
export const MONTREAL_KIGALI_ANNEX_F = MONTREAL.kigaliAnnexF;
export const MONTREAL_CFC_DEVELOPING = MONTREAL.cfcDevelopingCountries;
export const MONTREAL_OZONE_RECOVERY = MONTREAL.ozoneRecovery;

/* ─────────────────────────── EPA SNAP (verified only, v4) ───────────────── */
export const SNAP_NOTE = SNAP.note;
export const SNAP_LISTINGS = SNAP.entries;
export type SnapEntry = (typeof SNAP.entries)[number];

/** Normalize a SNAP substance string ("HFO-1336mzz(Z)", "R-600a (isobutane)")
 *  to an R-designation for matching against the dataset. */
function snapDesig(s: string): string {
  return s
    .replace(/\b(?:HFO|HCFO|HFC|HCFC|CFC|PFC)-/i, "R-")
    .replace(/\s*\((?:isobutane|propane|CO₂|CO2|ammonia|propylene)\)/i, "")
    .trim();
}

/** Verified SNAP listings that name this refrigerant (the ONLY SNAP claims the
 *  site may state, per us.snap). Empty ⇒ no verified SNAP listing to cite. */
export function snapFor(r: Refrigerant): SnapEntry[] {
  const key = norm(r.displayName);
  return SNAP.entries.filter((e) => e.substances.some((s) => norm(snapDesig(s)) === key));
}

/* ─────────────────────────── EU 2024/573 summary (v4) ───────────────────── */
export const EU_2024_SUMMARY = EU.regulation2024_573.summary;

/** EU 517/2014 Annex III rows 11–13 + Art. 13(3) where the refrigerant's headline
 *  (AR4) GWP meets the threshold. Only meaningful for retail-food / cold-storage
 *  refrigerants (the caller gates on mapped subsectors). */
export function eu(r: Refrigerant): EuRow[] {
  // 517/2014 Annex III rows 11–12 apply to HFCs and row 13 to fluorinated
  // greenhouse gases; CFCs, HCFCs and pure HFOs are NOT covered (G7). Gate on
  // AIM-regulated status (i.e. is/contains an HFC) so R-12, R-22, R-1234yf etc.
  // get no EU rows.
  if (!isRegulated(r)) return [];
  const headline = gwpNum(r.environmental.gwp.headline);
  if (headline == null) return [];
  const out: EuRow[] = [];
  for (const row of EU.regulation517_2014.annexIII) {
    if (headline >= row.gwpAtLeast) out.push({ ...row, kind: "market" });
  }
  const a133 = EU.regulation517_2014.article13_3;
  if (headline >= a133.gwpAtLeast) out.push({ row: 0, product: "Servicing/maintenance of refrigeration with a ≥40 t CO₂e charge", condition: a133.text, gwpAtLeast: a133.gwpAtLeast, date: a133.date, kind: "servicing" });
  return out.sort((a, b) => a.date.localeCompare(b.date) || a.row - b.row);
}

/** eu(ref) only rendered when mapped subsectors include retail food / cold storage. */
export function euApplies(r: Refrigerant): boolean {
  const ids = new Set(usSubsectors(r).map((s) => s.id));
  return ["remote-condensing", "supermarket", "standalone", "cold-storage"].some((id) => ids.has(id));
}

/* ─────────────────────────── Kigali ─────────────────────────────────────── */
export const KIGALI_FACTS = KIGALI;

/* ─────────────────────────── high-level status ──────────────────────────── */

export type RegulatoryClass = "aim-hfc" | "ods-cfc" | "ods-hcfc" | "none";

/** Rankings "Status" column. */
export function regulatoryClass(r: Refrigerant): RegulatoryClass {
  if (isRegulated(r)) return "aim-hfc";
  if (r.type === "cfc" || r.type === "cfc-blend") return "ods-cfc";
  if (r.type === "hcfc" || r.type === "hcfc-blend") return "ods-hcfc";
  return "none";
}
export function regulatoryStatusLabel(r: Refrigerant): string {
  switch (regulatoryClass(r)) {
    case "aim-hfc": return "AIM Act HFC";
    case "ods-cfc": return "ODS — CFC";
    case "ods-hcfc": return "ODS — HCFC";
    default: return "—";
  }
}

/**
 * ODS-first status tags. Order: "ODS — CFC" if the refrigerant is or contains a
 * CFC; otherwise "ODS — HCFC" if it is or contains an HCFC; then "AIM Act HFC"
 * when the refrigerant is AIM Act regulated. A blend can carry both an ODS tag
 * and the AIM tag (e.g. R-500, R-503 = "ODS — CFC · AIM Act HFC").
 */
export function regulatoryStatusTags(r: Refrigerant): string[] {
  const tags: string[] = [];
  const hasCfc = containsType(r, (t) => t === "cfc" || t === "cfc-blend");
  const hasHcfc = containsType(r, (t) => t === "hcfc" || t === "hcfc-blend");
  if (hasCfc) tags.push("ODS — CFC");
  else if (hasHcfc) tags.push("ODS — HCFC");
  if (isRegulated(r)) tags.push("AIM Act HFC");
  return tags;
}

/** ODS-first status tags joined with " · " (or "—" when none apply). */
export function regulatoryStatusTagline(r: Refrigerant): string {
  const tags = regulatoryStatusTags(r);
  return tags.length ? tags.join(" · ") : "—";
}

/** True when the hero "AIM Act phase-down" badge should show (regulated HFCs only). */
export function showsAimBadge(r: Refrigerant): boolean {
  return isRegulated(r);
}

/* ─────────────────────────── new-equipment one-liner ────────────────────── */

const fmtDate = (iso: string): string => {
  const [y, m, d] = iso.split("-").map(Number);
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${months[m - 1]} ${d}, ${y}`;
};
export { fmtDate };

/** One-line "New-equipment status (US)" for the facts table. */
export function newEquipmentStatusLine(r: Refrigerant): string {
  if (!isRegulated(r)) {
    if (r.type === "cfc" || r.type === "cfc-blend") return "Not an AIM Act substance; class I ODS — US production/import ended 1996.";
    if (r.type === "hcfc" || r.type === "hcfc-blend") return "Not an AIM Act substance; class II ODS (HCFC) production/import phased out.";
    return "Not an AIM Act regulated substance; 40 CFR 84.54 GWP limits don't apply.";
  }
  const g8 = Math.round(gwp8464(r));
  if (isUltraLowTempOnly(r)) {
    return `AIM Act HFC (84.64 GWP ${g8}): its ultra-low-temperature cascade use is below the −50 °C floor of 84.54's industrial-process categories, so no 84.54 category lists it.`;
  }
  const applied = restrictions(r);
  if (applied.length === 0) {
    return `AIM Act HFC, but its 40 CFR 84.64 GWP (${g8}) is below every 84.54 limit — no new-equipment restriction applies.`;
  }
  const sorted = [...applied].sort((a, b) => effKey(a).localeCompare(effKey(b)));
  return `AIM Act HFC (84.64 GWP ${g8}): restricted in ${applied.length} new-equipment categories under 40 CFR 84.54, starting ${effectiveLabel(sorted[0])}.`;
}

/** Full evaluation bundle for a refrigerant (used by pages + the gate). */
export interface RegulationReport {
  slug: string;
  displayName: string;
  regulated: boolean;
  klass: RegulatoryClass;
  gwp8464: number;
  headlineGwp: number | null;
  restrictions: AppliedRestriction[];
  mappedSubsectors: { subsector: Subsector; status: SubsectorStatus }[];
  ods: OdsMilestone[];
  eu: EuRow[];
  euApplies: boolean;
}
export function evaluate(r: Refrigerant): RegulationReport {
  const mapped = usSubsectors(r).map((s) => ({ subsector: s, status: subsectorStatus(r, s) }));
  return {
    slug: r.slug,
    displayName: r.displayName,
    regulated: isRegulated(r),
    klass: regulatoryClass(r),
    gwp8464: gwp8464(r),
    headlineGwp: gwpNum(r.environmental.gwp.headline),
    restrictions: restrictions(r),
    mappedSubsectors: mapped,
    ods: ods(r),
    eu: eu(r),
    euApplies: euApplies(r),
  };
}
