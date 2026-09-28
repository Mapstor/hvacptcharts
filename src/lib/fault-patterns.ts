/**
 * Shared SH × SC fault-pattern classifier, condenser-approach target, and the
 * reference-table rows — the single source of truth for BOTH the combined
 * SH/SC calculator (/pt-superheat-subcooling-calculator/) and the system
 * pressure diagnostic (/system-pressure-diagnostic-calculator/). Previously each
 * carried its own thresholds, wording, and a near-duplicate fault-pattern table.
 */

export type FlagSeverity = "info" | "caution" | "concern" | "alarm";

export type ShScTargets = {
  superheatF: [number, number];
  subcoolingF: [number, number];
};

/**
 * Round to the one-decimal precision the calculators DISPLAY. Range checks use
 * this so they compare the exact value shown to the user: a raw superheat of
 * 15.04 displays "15.0" and must read as inside an 8–15°F target, not above it.
 */
export function round1(x: number): number {
  return Math.round(x * 10) / 10;
}

/**
 * Condenser approach = discharge saturation temperature − outdoor air temperature.
 * For residential AC the condensing temperature runs 15–25°F above outdoor air,
 * with high-efficiency units near the low end. This is the one shared target —
 * it matches the operating-pressure ("what pressure should X be") pages, which
 * compute head as the bubble pressure from ambient+15°F to ambient+25°F.
 */
export const RESIDENTIAL_CONDENSER_APPROACH_F: [number, number] = [15, 25];

/** Plain-words description of the shared approach target, for diagnostic prose. */
export const RESIDENTIAL_CONDENSER_APPROACH_TEXT =
  "condensing temperature 15–25°F above outdoor air (high-efficiency units near the low end)";

/**
 * A condenser approach this many °F above the target max is an ALARM (heat-
 * rejection failure / high-pressure-cutout risk). The single source for the
 * alarm threshold rendered in the severity table and the approach figure so the
 * page can never print a different number than the classifier uses.
 */
export const CONDENSER_APPROACH_ALARM_DELTA_F = 15;
/** Absolute alarm threshold for residential condenser approach (target max + delta). */
export const RESIDENTIAL_CONDENSER_APPROACH_ALARM_F =
  RESIDENTIAL_CONDENSER_APPROACH_F[1] + CONDENSER_APPROACH_ALARM_DELTA_F;

/**
 * Evaporator approach = return-air (or box) temperature − suction saturation
 * temperature. Residential AC runs 20–40°F depending on indoor humidity. A HIGH
 * approach means the coil can't pull the air temperature down toward the
 * refrigerant (low indoor airflow, dirty filter, failed blower, or evaporator
 * starvation from undercharge/restriction); a LOW approach means the air is over
 * the coil too briefly relative to the boiling refrigerant (high airflow,
 * overcharge, high load, or a compressor not pumping).
 */
export const RESIDENTIAL_EVAPORATOR_APPROACH_F: [number, number] = [20, 40];
export const COMMERCIAL_EVAPORATOR_APPROACH_F: [number, number] = [5, 20];

export type FaultPatternId =
  | "normal"
  | "overcharge"
  | "undercharge"
  | "restriction"
  | "airflow-metering"
  | "ambiguous"
  | "slugging-alarm";

export interface FaultPattern {
  id: FaultPatternId;
  label: string;
  severity: FlagSeverity;
  /** SH/SC signature for the reference table, e.g. "Low SH + high SC". */
  signature: string;
  /** One-line interpretation for the combined-calculator banner. */
  note: string;
  /** Ordered action steps for the diagnostic. */
  recommendations: string[];
}

/**
 * The canonical fault patterns. Order is the reference-table order (most-actionable
 * charge faults first, then the "both-in-range" normal case). The slugging alarm
 * is handled separately (negative SH or SC) and is not a row in the SH×SC grid.
 */
export const FAULT_PATTERNS: Record<FaultPatternId, FaultPattern> = {
  "slugging-alarm": {
    id: "slugging-alarm",
    label: "Negative superheat or subcooling — stop and diagnose",
    severity: "alarm",
    signature: "SH < 0 or SC < 0",
    note: "Negative superheat (liquid reaching the compressor — slugging) or negative subcooling (vapor in the liquid line). Stop the system and diagnose before continuing.",
    recommendations: [
      "Stop the system — continued operation risks compressor damage from liquid slugging.",
      "Verify charge with subcooling; overcharge or a stuck-open TXV are common causes of negative superheat.",
      "Negative subcooling points to severe undercharge or a liquid-line restriction — find the cause before adding refrigerant.",
    ],
  },
  overcharge: {
    id: "overcharge",
    label: "Likely overcharge",
    severity: "concern",
    signature: "Low SH + high SC",
    note: "Low superheat + high subcooling is the classic overcharge fingerprint. Verify condenser airflow and coil cleanliness first, then recover refrigerant in measured amounts.",
    recommendations: [
      "Verify condenser airflow and coil cleanliness first — both mimic overcharge symptoms.",
      "If airflow and cleanliness are good, recover refrigerant in measured amounts.",
      "Re-check superheat and subcooling after each removal to converge on the correct charge.",
    ],
  },
  undercharge: {
    id: "undercharge",
    label: "Likely undercharge",
    severity: "concern",
    signature: "High SH + low SC",
    note: "High superheat + low subcooling is the classic undercharge fingerprint. Check for leaks before adding refrigerant.",
    recommendations: [
      "Check for leaks before adding refrigerant — topping off without repair is an EPA Section 608 violation and the charge will be lost again.",
      "Find the leak with an electronic detector, UV dye, or soap bubbles on accessible joints.",
      "Repair the leak, evacuate to 500 microns, then charge by weight to the nameplate amount.",
    ],
  },
  restriction: {
    id: "restriction",
    label: "Likely restriction or low evaporator airflow",
    severity: "concern",
    signature: "High SH + high SC",
    note: "High superheat + high subcooling suggests refrigerant is not reaching the evaporator at full mass flow — a liquid-line restriction or low evaporator airflow.",
    recommendations: [
      "Check the filter-drier for restriction: a significant temperature drop across it indicates a clog — replace if the downstream side is cold.",
      "Check indoor evaporator airflow: dirty filter, blocked return, or slow blower motor.",
      "Check the expansion device for a partial restriction or a stuck-partially-closed TXV.",
    ],
  },
  "airflow-metering": {
    id: "airflow-metering",
    label: "Possible airflow or metering-device issue",
    severity: "caution",
    signature: "Low SH + low SC",
    note: "Both low is less common — usually a stuck-open TXV flooding the evaporator alongside low condenser performance.",
    recommendations: [
      "Check TXV operation — a stuck-open valve floods the evaporator (low SH) without backing liquid up in the condenser (low SC).",
      "Check condenser airflow and cleanliness.",
      "Confirm the system is in steady state — readings taken during cycling can produce this pattern transiently.",
    ],
  },
  ambiguous: {
    id: "ambiguous",
    label: "No classic charge fingerprint",
    severity: "caution",
    signature: "One value in range, one out (mixed)",
    note: "Neither the overcharge nor undercharge fingerprint. Consider system-side factors: low indoor airflow (raises superheat), a restricted condenser (raises subcooling without overcharge), or an incorrectly sized metering device.",
    recommendations: [
      "Cross-check indoor and outdoor airflow before touching the charge.",
      "Re-verify the readings with insulated thermocouples in steady-state operation.",
      "If one value is only marginally out of range, treat it as within measurement tolerance.",
    ],
  },
  normal: {
    id: "normal",
    label: "Within target ranges",
    severity: "info",
    signature: "SH and SC both in target",
    note: "Both superheat and subcooling fall in their target ranges. Cross-check against the equipment manufacturer's charging spec for the specific setpoint.",
    recommendations: ["No charge action required — document the baseline and continue planned work."],
  },
};

/** Ordered rows for the fault-pattern reference table on both calculator pages. */
export const FAULT_PATTERN_TABLE: FaultPatternId[] = [
  "normal",
  "overcharge",
  "undercharge",
  "restriction",
  "airflow-metering",
  "slugging-alarm",
];

/**
 * The number of SH×SC fingerprints the combined calculator classifies and shows
 * in its reference table — the single source for the "N-pattern" copy so the
 * page can't say both "eight-pattern" and "four-pattern". Derived from the table.
 */
export const SHSC_PATTERN_COUNT = FAULT_PATTERN_TABLE.length;

/**
 * Classify a superheat/subcooling pair against the given targets. Values are
 * rounded to the displayed precision first and every comparison is inclusive,
 * so a value shown as exactly the boundary (e.g. 8.0 or 15.0) reads as in-range.
 */
export function classifyShSc(superheatF: number, subcoolingF: number, targets: ShScTargets): FaultPattern {
  const sh = round1(superheatF);
  const sc = round1(subcoolingF);
  if (sh < 0 || sc < 0) return FAULT_PATTERNS["slugging-alarm"];
  const [shMin, shMax] = targets.superheatF;
  const [scMin, scMax] = targets.subcoolingF;
  const shLow = sh < shMin;
  const shHigh = sh > shMax;
  const scLow = sc < scMin;
  const scHigh = sc > scMax;
  if (!shLow && !shHigh && !scLow && !scHigh) return FAULT_PATTERNS.normal;
  if (shLow && scHigh) return FAULT_PATTERNS.overcharge;
  if (shHigh && scLow) return FAULT_PATTERNS.undercharge;
  if (shHigh && scHigh) return FAULT_PATTERNS.restriction;
  if (shLow && scLow) return FAULT_PATTERNS["airflow-metering"];
  return FAULT_PATTERNS.ambiguous;
}

/** Generic residential-AC envelope for the combined calculator (no system-type selector). */
export const GENERIC_SH_SC_TARGETS: ShScTargets = {
  superheatF: [8, 25],
  subcoolingF: [3, 15],
};

/**
 * Is a displayed value inside an inclusive [min,max] target? Rounds to the
 * displayed precision first so the check matches what the page shows.
 */
export function inTargetRange(value: number, target: [number, number]): boolean {
  const v = round1(value);
  return v >= target[0] && v <= target[1];
}
