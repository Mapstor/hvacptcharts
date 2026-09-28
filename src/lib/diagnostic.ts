/**
 * System pressure diagnostic engine.
 *
 * Given suction + discharge pressures, line temperatures, ambient, and system
 * type, produces a structured set of diagnostic flags. Each flag carries
 * severity, evidence (the specific measurements that triggered it), and
 * recommendations in order of action priority.
 *
 * The superheat/subcooling charge fingerprints and the residential condenser-
 * approach target come from the shared fault-pattern module (fault-patterns.ts)
 * so the wording and thresholds match the combined SH/SC calculator exactly.
 * Every range check compares the value ROUNDED to the displayed precision, so a
 * reading shown as 15.0°F reads as inside an 8–15°F target (not above it).
 *
 * This is decision-support material drawing on the patterns documented in
 * /superheat-subcooling-fundamentals/ and /high-head-pressure-causes/. Not a
 * substitute for hands-on equipment verification and equipment OEM service
 * literature.
 */
import { getRefrigerant, getSaturationTempAtPsigF } from "@/data/refrigerants";
import {
  classifyShSc,
  round1,
  RESIDENTIAL_CONDENSER_APPROACH_F,
  CONDENSER_APPROACH_ALARM_DELTA_F,
  RESIDENTIAL_EVAPORATOR_APPROACH_F,
  COMMERCIAL_EVAPORATOR_APPROACH_F,
  type FlagSeverity,
  type ShScTargets,
} from "@/lib/fault-patterns";

export type SystemType = "txv-residential" | "fixed-orifice-residential" | "exv-residential" | "commercial-refrig-medium" | "commercial-refrig-low";

export type { FlagSeverity };

export interface DiagnosticFlag {
  severity: FlagSeverity;
  label: string;
  evidence: string[];
  recommendations: string[];
}

export interface DiagnosticInputs {
  slug: string;
  ambientF: number;
  returnAirF: number;
  suctionPsig: number;
  suctionLineF: number;
  liquidPsig: number;
  liquidLineF: number;
  systemType: SystemType;
}

export interface DiagnosticOutput {
  /** Sorted by severity (alarm first). */
  flags: DiagnosticFlag[];
  /** Computed derived values surfaced for the UI — rounded to displayed precision. */
  derived: {
    superheatF: number | null;
    subcoolingF: number | null;
    suctionSatF: number | null;
    dischargeSatF: number | null;
    /** Discharge sat T minus ambient — typical 15-25°F for residential AC; higher = condenser problem. */
    condenserApproachF: number | null;
    /** Return-air T minus suction sat T — typical 20-40°F. */
    evaporatorApproachF: number | null;
  };
  /** Targets used for interpretation (varies by system type). */
  targets: ShScTargets & {
    condenserApproachF: [number, number];
    evaporatorApproachF: [number, number];
  };
}

const TARGETS_BY_TYPE: Record<SystemType, DiagnosticOutput["targets"]> = {
  "txv-residential": {
    superheatF: [8, 15],
    subcoolingF: [8, 12],
    condenserApproachF: RESIDENTIAL_CONDENSER_APPROACH_F,
    evaporatorApproachF: RESIDENTIAL_EVAPORATOR_APPROACH_F,
  },
  "fixed-orifice-residential": {
    superheatF: [8, 25],
    subcoolingF: [8, 14],
    condenserApproachF: RESIDENTIAL_CONDENSER_APPROACH_F,
    evaporatorApproachF: RESIDENTIAL_EVAPORATOR_APPROACH_F,
  },
  "exv-residential": {
    superheatF: [8, 15],
    subcoolingF: [8, 14],
    condenserApproachF: RESIDENTIAL_CONDENSER_APPROACH_F,
    evaporatorApproachF: RESIDENTIAL_EVAPORATOR_APPROACH_F,
  },
  "commercial-refrig-medium": {
    superheatF: [10, 20],
    subcoolingF: [5, 15],
    condenserApproachF: RESIDENTIAL_CONDENSER_APPROACH_F,
    evaporatorApproachF: COMMERCIAL_EVAPORATOR_APPROACH_F,
  },
  "commercial-refrig-low": {
    superheatF: [10, 20],
    subcoolingF: [5, 12],
    condenserApproachF: RESIDENTIAL_CONDENSER_APPROACH_F,
    evaporatorApproachF: COMMERCIAL_EVAPORATOR_APPROACH_F,
  },
};

export function diagnose(inputs: DiagnosticInputs): DiagnosticOutput {
  const r = getRefrigerant(inputs.slug);
  const targets = TARGETS_BY_TYPE[inputs.systemType];

  const derived: DiagnosticOutput["derived"] = {
    superheatF: null,
    subcoolingF: null,
    suctionSatF: null,
    dischargeSatF: null,
    condenserApproachF: null,
    evaporatorApproachF: null,
  };

  const flags: DiagnosticFlag[] = [];

  if (!r || r.ptChart.length === 0) {
    flags.push({
      severity: "info",
      label: "No PT data available for this refrigerant",
      evidence: [`${inputs.slug} has no PT chart in the dataset (manual blend pending datasheet transcription).`],
      recommendations: ["Diagnostic interpretation requires saturation data. Use a different refrigerant or consult the manufacturer datasheet directly."],
    });
    return { flags, derived, targets };
  }

  // Compute saturation temperatures and derived values. Everything surfaced to
  // the UI and compared against a target is rounded to one decimal — the same
  // value the page displays — so boundary readings read as in-range.
  const suctionSatF = getSaturationTempAtPsigF(inputs.slug, inputs.suctionPsig, "dew");
  const dischargeSatF = getSaturationTempAtPsigF(inputs.slug, inputs.liquidPsig, "bubble");
  derived.suctionSatF = suctionSatF === null ? null : round1(suctionSatF);
  derived.dischargeSatF = dischargeSatF === null ? null : round1(dischargeSatF);
  const superheatF = suctionSatF !== null ? round1(inputs.suctionLineF - suctionSatF) : null;
  const subcoolingF = dischargeSatF !== null ? round1(dischargeSatF - inputs.liquidLineF) : null;
  derived.superheatF = superheatF;
  derived.subcoolingF = subcoolingF;
  derived.condenserApproachF = dischargeSatF !== null ? round1(dischargeSatF - inputs.ambientF) : null;
  derived.evaporatorApproachF = suctionSatF !== null ? round1(inputs.returnAirF - suctionSatF) : null;

  // Out-of-range warnings
  if (suctionSatF === null) {
    flags.push({
      severity: "alarm",
      label: "Suction pressure outside chart range",
      evidence: [`${inputs.suctionPsig} PSIG is outside the PT chart range for ${r.displayName}.`],
      recommendations: [
        "Verify the manifold gauge reading and pressure-rating compatibility with the refrigerant.",
        "Severe undercharge or unusually low evaporator setpoint may produce out-of-range suction pressure.",
      ],
    });
  }
  if (dischargeSatF === null) {
    flags.push({
      severity: "alarm",
      label: "Discharge pressure outside chart range",
      evidence: [`${inputs.liquidPsig} PSIG is outside the PT chart range for ${r.displayName}.`],
      recommendations: [
        "If pressure is above the refrigerant's critical pressure, the system is operating in an unusual state — stop and diagnose before continuing.",
        "Verify pressure rating of the manifold gauge.",
      ],
    });
  }

  // The hard-stop alarms first (negative superheat / subcooling handled separately
  // so each gets its own targeted evidence and recommendations).
  if (superheatF !== null && superheatF < 0) {
    flags.push({
      severity: "alarm",
      label: "Negative superheat — check the reading, then slugging risk",
      evidence: [
        `Superheat is ${superheatF.toFixed(1)}°F. Superheat is physically ≥0°F at steady state — a negative result means a reading error (wrong line, poor probe contact), the wrong refrigerant selected, or the wrong saturation curve (use the dew curve for suction-side superheat).`,
        `Suction-line temperature ${inputs.suctionLineF}°F is below the dew saturation temperature ${derived.suctionSatF?.toFixed(1)}°F at the measured suction pressure.`,
        "If the reading is correct, liquid refrigerant is reaching the compressor.",
      ],
      recommendations: [
        "Re-verify the measurement first: insulated suction-line probe, correct refrigerant, dew curve.",
        "If genuine: stop the system — continued operation damages compressor valves and bearings.",
        "Verify charge with subcooling — overcharge or a stuck-open TXV/flooded evaporator are the common causes.",
      ],
    });
  }

  if (subcoolingF !== null && subcoolingF < 0) {
    flags.push({
      severity: "alarm",
      label: "Negative subcooling — check the reading, then vapor in liquid line",
      evidence: [
        `Subcooling is ${subcoolingF.toFixed(1)}°F. Subcooling is physically ≥0°F at steady state — a negative result means a reading error, the wrong refrigerant selected, or the wrong saturation curve (use the bubble curve for liquid-side subcooling).`,
        `Liquid-line temperature ${inputs.liquidLineF}°F is above the bubble saturation temperature ${derived.dischargeSatF?.toFixed(1)}°F at the measured discharge pressure.`,
        "If the reading is correct, vapor bubbles are forming in the liquid line.",
      ],
      recommendations: [
        "Re-verify the measurement first: insulated liquid-line probe, correct refrigerant, bubble curve.",
        "If genuine: severe undercharge or a restriction at the filter-drier/expansion device is the typical cause.",
        "Do not add refrigerant until the leak or restriction is identified; high superheat alongside negative subcooling is the strong undercharge fingerprint.",
      ],
    });
  }

  // SH × SC charge fingerprint — thresholds + wording from the shared module.
  // classifyShSc rounds and compares inclusively, so a value shown as exactly
  // the boundary reads as in-range.
  if (superheatF !== null && subcoolingF !== null && superheatF >= 0 && subcoolingF >= 0) {
    const [shMin, shMax] = targets.superheatF;
    const [scMin, scMax] = targets.subcoolingF;
    const pattern = classifyShSc(superheatF, subcoolingF, targets);
    const actionable = ["overcharge", "undercharge", "restriction", "airflow-metering"] as const;
    if ((actionable as readonly string[]).includes(pattern.id)) {
      const shWord = superheatF < shMin ? `below target range ${shMin}-${shMax}°F` : superheatF > shMax ? `above target range ${shMin}-${shMax}°F` : `within target range ${shMin}-${shMax}°F`;
      const scWord = subcoolingF < scMin ? `below target range ${scMin}-${scMax}°F` : subcoolingF > scMax ? `above target range ${scMin}-${scMax}°F` : `within target range ${scMin}-${scMax}°F`;
      flags.push({
        severity: pattern.severity,
        label: pattern.label,
        evidence: [
          `Superheat ${superheatF.toFixed(1)}°F is ${shWord}.`,
          `Subcooling ${subcoolingF.toFixed(1)}°F is ${scWord}.`,
          `${pattern.signature} — ${pattern.note}`,
        ],
        recommendations: pattern.recommendations,
      });
    } else if (subcoolingF > scMax && superheatF >= shMin) {
      // SC high with SH in/above range isn't the clean overcharge fingerprint
      // (which needs LOW SH), but elevated subcooling is still a chargeable
      // finding — surface it so a "dirty filter + overcharge" reading shows both
      // the airflow and the charge cause.
      flags.push({
        severity: "concern",
        label: "Elevated subcooling — overcharge or condenser-side restriction",
        evidence: [
          `Subcooling ${subcoolingF.toFixed(1)}°F is above target range ${scMin}-${scMax}°F while superheat is within or above target.`,
          "Liquid is backing up in the condenser — most often overcharge, sometimes a condenser-side restriction.",
        ],
        recommendations: [
          "Verify condenser airflow and coil cleanliness first — both raise subcooling without excess charge.",
          "If airflow and cleanliness are good, recover refrigerant in measured amounts and re-check subcooling.",
          "Confirm the reading in steady state before adjusting charge.",
        ],
      });
    } else if (superheatF > shMax && subcoolingF >= scMin && subcoolingF <= scMax) {
      // High SH with SC in range — evaporator starvation short of the full
      // undercharge fingerprint (undercharge also needs LOW SC).
      flags.push({
        severity: "concern",
        label: "Elevated superheat — evaporator starvation",
        evidence: [
          `Superheat ${superheatF.toFixed(1)}°F is above target range ${shMin}-${shMax}°F while subcooling is within target.`,
          "The evaporator is being underfed — low indoor airflow, a metering-device restriction, or the early stage of undercharge.",
        ],
        recommendations: [
          "Check indoor airflow (filter, blower, coil) and the metering device before touching the charge.",
          "Cross-check evaporator approach and subcooling; a developing leak will drop subcooling next.",
        ],
      });
    }
  }

  // Condenser approach analysis (uses the shared residential-AC approach target).
  if (derived.condenserApproachF !== null) {
    const [caMin, caMax] = targets.condenserApproachF;
    const ca = derived.condenserApproachF;
    if (ca < 0) {
      flags.push({
        severity: "alarm",
        label: "Check readings — condensing saturation below outdoor air",
        evidence: [
          `Discharge saturation ${derived.dischargeSatF?.toFixed(1)}°F is BELOW outdoor air ${inputs.ambientF}°F (approach ${ca.toFixed(1)}°F).`,
          "A condenser cannot reject heat while running colder than the air. This is only possible if the condenser outlet is vapor (severe undercharge) or a reading / refrigerant selection is wrong.",
        ],
        recommendations: [
          "Re-verify the discharge pressure, the ambient reading, and the selected refrigerant.",
          "If correct, suspect severe undercharge (no liquid in the condenser) — leak-search before adding refrigerant.",
        ],
      });
    } else if (ca > caMax + CONDENSER_APPROACH_ALARM_DELTA_F) {
      flags.push({
        severity: "alarm",
        label: "Very high condenser approach — heat rejection failure",
        evidence: [
          `Discharge saturation ${derived.dischargeSatF?.toFixed(1)}°F is ${ca.toFixed(1)}°F above ambient ${inputs.ambientF}°F.`,
          `Target approach for this system type: ${caMin}-${caMax}°F.`,
        ],
        recommendations: [
          "System is unable to reject heat to ambient. Common causes: severely dirty/blocked condenser, non-condensables, slow or failed condenser fan.",
          "Risk of high-pressure cutout trip or compressor damage. Stop continuous operation.",
          "Cleaning the condenser and verifying fan operation are the first interventions; if pressures don't drop, evacuate the system to remove non-condensables.",
        ],
      });
    } else if (ca > caMax) {
      flags.push({
        severity: "concern",
        label: "High condenser approach",
        evidence: [
          `Discharge saturation ${derived.dischargeSatF?.toFixed(1)}°F is ${ca.toFixed(1)}°F above ambient ${inputs.ambientF}°F.`,
          `Target approach for this system type: ${caMin}-${caMax}°F.`,
        ],
        recommendations: [
          "Check condenser airflow first — dirt, leaves, blocked fins, recirculation, slow fan. Most common cause of high head.",
          "If airflow is good and pressure remains high, check for overcharge (high subcooling) or non-condensables.",
          "See /high-head-pressure-causes/ for the full decision tree.",
        ],
      });
    } else if (ca < caMin - 10) {
      flags.push({
        severity: "caution",
        label: "Low condenser approach",
        evidence: [
          `Discharge saturation ${derived.dischargeSatF?.toFixed(1)}°F is only ${ca.toFixed(1)}°F above ambient ${inputs.ambientF}°F.`,
          `Target approach for this system type: ${caMin}-${caMax}°F.`,
        ],
        recommendations: [
          "Low approach can indicate undercharge or low ambient operation.",
          "Verify with subcooling — low subcooling alongside low approach reinforces undercharge.",
          "If subcooling is normal, the low ambient condition is the likely cause — no action needed.",
        ],
      });
    }
  }

  // Evaporator approach analysis. HIGH approach = the coil can't pull the air
  // down to the refrigerant (low indoor airflow, dirty filter, blower fault, or
  // evaporator starvation from undercharge/restriction). LOW approach = air over
  // the coil too briefly relative to the boiling refrigerant (high airflow,
  // overcharge, high indoor load, or a compressor not pumping).
  if (derived.evaporatorApproachF !== null) {
    const [eaMin, eaMax] = targets.evaporatorApproachF;
    const ea = derived.evaporatorApproachF;
    if (ea > eaMax) {
      flags.push({
        severity: "concern",
        label: "High evaporator approach — low airflow or evaporator starvation",
        evidence: [
          `Return air ${inputs.returnAirF}°F is ${ea.toFixed(1)}°F above suction saturation ${derived.suctionSatF?.toFixed(1)}°F (target ${eaMin}-${eaMax}°F).`,
          "The evaporator cannot pull the air temperature down toward the refrigerant — the air is either not moving enough over the coil, or the coil is being underfed.",
        ],
        recommendations: [
          "Check indoor airflow first: dirty filter, blocked return, closed dampers, or a slow/failed blower.",
          "If airflow is good, check for evaporator starvation — undercharge or a liquid-line/metering restriction (cross-check superheat and subcooling).",
        ],
      });
    } else if (ea < eaMin) {
      flags.push({
        severity: "caution",
        label: "Low evaporator approach — high airflow, overcharge, or load",
        evidence: [
          `Return air ${inputs.returnAirF}°F is only ${ea.toFixed(1)}°F above suction saturation ${derived.suctionSatF?.toFixed(1)}°F (target ${eaMin}-${eaMax}°F).`,
          "The air is spending too little time over the coil relative to the boiling refrigerant, or the evaporator is flooded.",
        ],
        recommendations: [
          "Check for excessive indoor airflow (oversized blower, ductwork changes) or unusually high indoor load.",
          "Consider overcharge (flooded evaporator) or a compressor not pumping to capacity — cross-check subcooling and discharge pressure.",
        ],
      });
    }
  }

  // If we have valid SH+SC+approach all in range, surface a positive info flag
  if (
    flags.filter((f) => f.severity !== "info").length === 0 &&
    superheatF !== null &&
    subcoolingF !== null &&
    derived.condenserApproachF !== null
  ) {
    flags.push({
      severity: "info",
      label: "Operating within expected ranges",
      evidence: [
        `Superheat ${superheatF.toFixed(1)}°F within target ${targets.superheatF[0]}-${targets.superheatF[1]}°F.`,
        `Subcooling ${subcoolingF.toFixed(1)}°F within target ${targets.subcoolingF[0]}-${targets.subcoolingF[1]}°F.`,
        `Condenser approach ${derived.condenserApproachF.toFixed(1)}°F within target ${targets.condenserApproachF[0]}-${targets.condenserApproachF[1]}°F.`,
      ],
      recommendations: ["No diagnostic action required. Continue with planned service work."],
    });
  }

  // Sort: alarm > concern > caution > info
  const severityOrder: Record<FlagSeverity, number> = { alarm: 0, concern: 1, caution: 2, info: 3 };
  flags.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return { flags, derived, targets };
}
