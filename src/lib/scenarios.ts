/**
 * Worked-scenario data model — the single source of truth for every
 * "Measured → PT lookup → Derived → verdict" card on the calculator pages
 * (/pt-calculator/, /system-pressure-diagnostic-calculator/, /superheat-calculator/,
 * /subcooling-calculator/, /pt-superheat-subcooling-calculator/).
 *
 * Each scenario stores INPUTS ONLY. Every derived number (saturation temps,
 * superheat, subcooling, condenser/evaporator approach, target superheat) and
 * the verdict/severity badge are COMPUTED here at build time with the exact
 * lib functions the live calculators use — getSaturationTempAtPsigF,
 * classifyShSc, diagnose, targetSuperheat — so a card can never drift from the
 * dataset or from the classifier. scripts/verify-scenarios.ts validates the
 * physics of every scenario and that the printed verdict equals the classifier.
 */

import { getRefrigerant, getSaturationTempAtPsigF } from "@/data/refrigerants";
import {
  classifyShSc,
  round1,
  RESIDENTIAL_CONDENSER_APPROACH_F,
  type FaultPattern,
  type FlagSeverity,
  type ShScTargets,
} from "@/lib/fault-patterns";
import { diagnose, type DiagnosticFlag, type SystemType } from "@/lib/diagnostic";
import { targetSuperheat, MIN_RELIABLE_TSH_F } from "@/lib/target-superheat";

export type ScenarioKind = "charge-diagnostic" | "pressure-comparison" | "compatibility-info";
export type Metering = "txv" | "exv" | "fixed-orifice" | "none";
export type CoolingMedium = "air" | "water" | "none";
export type Mode = "cooling" | "heating" | "refrigeration" | "none";
export type VerdictStatus = "ok" | "warn" | "bad" | "info";

export interface Scenario {
  /** Stable id, e.g. "pt-2". */
  id: string;
  /** Route the card renders on, e.g. "/pt-calculator/". */
  page: string;
  number: number;
  /** Display name for the card header (verbatim). */
  refrigerantDisplay: string;
  slug: string;
  title: string;
  /** Setup narrative (prose, no derived numbers). */
  scenario: string;
  kind: ScenarioKind;

  metering?: Metering;
  coolingMedium?: CoolingMedium;
  mode?: Mode;

  /** Outdoor air (air-cooled condenser in cooling; the evaporator air in heating). */
  ambientF?: number;
  /** Indoor return air (AC) or box/case temp (refrigeration) — the evaporator air in
   *  cooling/refrigeration; the condenser air in heat-pump heating. */
  indoorAirF?: number;
  /** Entering condenser-water temp for water-cooled equipment. */
  enteringWaterF?: number;

  /** Measured manifold readings. */
  suctionPsig?: number;
  suctionLineF?: number;
  liquidPsig?: number;
  liquidLineF?: number;

  /** Fixed-orifice target-superheat inputs. */
  indoorWB?: number;
  outdoorDB?: number;

  /** SPD cards run the full diagnose() engine; set the system type to opt in. */
  systemType?: SystemType;

  /** Verdict-body teaching prose. Must be CONSISTENT with the computed pattern
   *  (the gate checks severity/id; the numeric gate checks any numbers). */
  teaching: string;
  /** Optional recommended-action prose; falls back to the pattern's recommendations. */
  fix?: string;

  /** For pressure-comparison cards. */
  comparisonSlugs?: string[];
  comparisonTemps?: number[];

  /** Extra PT lookups for multi-circuit cards (e.g. R-744 MT/LT/gas-cooler). Each
   *  is validated by the gate and rendered as a lookup row. */
  pressures?: { label: string; psig: number; curve?: "bubble" | "dew" }[];

  /**
   * Escape hatch: a card that DELIBERATELY shows physically-impossible inputs to
   * teach what they mean. Must be a visible, human-readable reason. Target: none.
   */
  teachingCase?: string;
}

export interface ScenarioVerdict {
  status: VerdictStatus;
  title: string;
  severity: FlagSeverity;
  /** Classifier pattern id when this is a charge diagnostic. */
  patternId?: string;
}

export interface ComputedScenario {
  s: Scenario;
  refrigerantName: string;
  /** Saturation temps at the measured pressures (both curves where relevant). */
  suctionSatDewF: number | null;
  suctionSatBubbleF: number | null;
  dischargeSatBubbleF: number | null;
  dischargeSatDewF: number | null;
  hasGlide: boolean;
  superheatF: number | null;
  subcoolingF: number | null;
  /** Air the condenser rejects to (outdoor in cooling/refrig, indoor in heating,
   *  entering water for water-cooled). */
  condenserAirF: number | null;
  evaporatorAirF: number | null;
  condenserApproachF: number | null;
  evaporatorApproachF: number | null;
  targetSuperheatF: number | null;
  targets: ShScTargets | null;
  pattern: FaultPattern | null;
  flags: DiagnosticFlag[];
  verdict: ScenarioVerdict;
}

const SEVERITY_TO_STATUS: Record<FlagSeverity, VerdictStatus> = {
  alarm: "bad",
  concern: "warn",
  caution: "warn",
  info: "ok",
};

/** SH/SC targets by metering + mode — same numbers the calculators/diagnostic use. */
export function targetsFor(metering: Metering | undefined, mode: Mode | undefined): ShScTargets {
  if (mode === "refrigeration") return { superheatF: [10, 20], subcoolingF: [5, 15] };
  switch (metering) {
    case "txv":
      return { superheatF: [8, 15], subcoolingF: [8, 12] };
    case "exv":
      return { superheatF: [8, 15], subcoolingF: [8, 14] };
    case "fixed-orifice":
      return { superheatF: [8, 25], subcoolingF: [8, 14] };
    default:
      return { superheatF: [8, 25], subcoolingF: [3, 15] };
  }
}

const satDew = (slug: string, psig: number | undefined) =>
  psig === undefined ? null : getSaturationTempAtPsigF(slug, psig, "dew");
const satBub = (slug: string, psig: number | undefined) =>
  psig === undefined ? null : getSaturationTempAtPsigF(slug, psig, "bubble");

export function computeScenario(s: Scenario): ComputedScenario {
  const r = getRefrigerant(s.slug);
  const refrigerantName = r?.displayName ?? s.slug.toUpperCase();
  const hasGlide = !!r?.physical.hasSignificantGlide;

  const suctionSatDewF = round1n(satDew(s.slug, s.suctionPsig));
  const suctionSatBubbleF = round1n(satBub(s.slug, s.suctionPsig));
  const dischargeSatBubbleF = round1n(satBub(s.slug, s.liquidPsig));
  const dischargeSatDewF = round1n(satDew(s.slug, s.liquidPsig));

  const superheatF =
    s.suctionLineF !== undefined && suctionSatDewF !== null ? round1(s.suctionLineF - suctionSatDewF) : null;
  const subcoolingF =
    s.liquidLineF !== undefined && dischargeSatBubbleF !== null ? round1(dischargeSatBubbleF - s.liquidLineF) : null;

  // Which air stream cools the condenser and feeds the evaporator (roles swap in
  // heat-pump heating).
  let condenserAirF: number | null = null;
  let evaporatorAirF: number | null = null;
  if (s.coolingMedium === "water") condenserAirF = s.enteringWaterF ?? null;
  if (s.mode === "heating") {
    condenserAirF = condenserAirF ?? (s.indoorAirF ?? null);
    evaporatorAirF = s.ambientF ?? null;
  } else {
    condenserAirF = condenserAirF ?? (s.ambientF ?? null);
    evaporatorAirF = s.indoorAirF ?? null;
  }

  const condenserApproachF =
    dischargeSatBubbleF !== null && condenserAirF !== null ? round1(dischargeSatBubbleF - condenserAirF) : null;
  const evaporatorApproachF =
    suctionSatDewF !== null && evaporatorAirF !== null ? round1(evaporatorAirF - suctionSatDewF) : null;

  const targetSuperheatF =
    s.metering === "fixed-orifice" && s.indoorWB !== undefined && s.outdoorDB !== undefined
      ? targetSuperheat(s.indoorWB, s.outdoorDB)
      : null;

  const targets = s.kind === "charge-diagnostic" ? targetsFor(s.metering, s.mode) : null;

  // ── Verdict ─────────────────────────────────────────────────────────────
  let pattern: FaultPattern | null = null;
  let flags: DiagnosticFlag[] = [];
  let verdict: ScenarioVerdict;

  if (s.kind !== "charge-diagnostic") {
    verdict = { status: "info", title: s.title, severity: "info" };
  } else if (s.metering === "fixed-orifice" && targetSuperheatF !== null && superheatF !== null) {
    // Fixed-orifice charge is judged by superheat vs the WB/DB target, not by
    // subcooling or the diagnostic SH range — even on the diagnostic page.
    const delta = round1(superheatF - targetSuperheatF);
    if (Math.abs(delta) <= 3) verdict = { status: "ok", title: "Superheat on target — properly charged", severity: "info" };
    else if (delta > 3) verdict = { status: "warn", title: "Superheat above target — undercharged", severity: "concern" };
    else verdict = { status: "warn", title: "Superheat below target — overcharged", severity: "concern" };
  } else if (s.systemType) {
    // Full diagnostic engine (system-pressure-diagnostic scenarios).
    const diag = diagnose({
      slug: s.slug,
      ambientF: condenserAirF ?? s.ambientF ?? 95,
      returnAirF: evaporatorAirF ?? s.indoorAirF ?? 75,
      suctionPsig: s.suctionPsig ?? 0,
      suctionLineF: s.suctionLineF ?? 0,
      liquidPsig: s.liquidPsig ?? 0,
      liquidLineF: s.liquidLineF ?? 0,
      systemType: s.systemType,
    });
    flags = diag.flags;
    if (superheatF !== null && subcoolingF !== null && targets) pattern = classifyShSc(superheatF, subcoolingF, targets);
    const top = flags[0];
    verdict = top
      ? { status: SEVERITY_TO_STATUS[top.severity], title: top.label, severity: top.severity, patternId: pattern?.id }
      : { status: "info", title: "Operating within expected ranges", severity: "info" };
  } else if (superheatF !== null && subcoolingF !== null && targets) {
    pattern = classifyShSc(superheatF, subcoolingF, targets);
    verdict = { status: SEVERITY_TO_STATUS[pattern.severity], title: pattern.label, severity: pattern.severity, patternId: pattern.id };
  } else if (superheatF !== null && targets) {
    // Superheat-only card.
    const [lo, hi] = targets.superheatF;
    if (superheatF < 0) verdict = { status: "bad", title: "Negative superheat — liquid reaching the compressor", severity: "alarm" };
    else if (superheatF < lo) verdict = { status: "warn", title: "Low superheat", severity: "caution" };
    else if (superheatF > hi) verdict = { status: "warn", title: "High superheat", severity: "caution" };
    else verdict = { status: "ok", title: "Superheat in target range", severity: "info" };
  } else if (subcoolingF !== null && targets) {
    // Subcooling-only card.
    const [lo, hi] = targets.subcoolingF;
    if (subcoolingF < 0) verdict = { status: "bad", title: "Negative subcooling — vapor in the liquid line", severity: "alarm" };
    else if (subcoolingF < lo) verdict = { status: "warn", title: "Low subcooling", severity: "caution" };
    else if (subcoolingF > hi) verdict = { status: "warn", title: "High subcooling", severity: "caution" };
    else verdict = { status: "ok", title: "Subcooling in target range", severity: "info" };
  } else {
    verdict = { status: "info", title: s.title, severity: "info" };
  }

  return {
    s,
    refrigerantName,
    suctionSatDewF,
    suctionSatBubbleF,
    dischargeSatBubbleF,
    dischargeSatDewF,
    hasGlide,
    superheatF,
    subcoolingF,
    condenserAirF,
    evaporatorAirF,
    condenserApproachF,
    evaporatorApproachF,
    targetSuperheatF,
    targets,
    pattern,
    flags,
    verdict,
  };
}

function round1n(x: number | null): number | null {
  return x === null ? null : round1(x);
}

export { RESIDENTIAL_CONDENSER_APPROACH_F, MIN_RELIABLE_TSH_F };

// The scenario data lives in scenarios.data.ts (a plain array; it imports only
// the Scenario TYPE from here, so there is no runtime cycle).
import { SCENARIOS } from "@/lib/scenarios.data";
export { SCENARIOS };
export function scenariosForPage(page: string): Scenario[] {
  return SCENARIOS.filter((s) => s.page === page);
}
