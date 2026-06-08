/**
 * System pressure diagnostic engine.
 *
 * Given suction + discharge pressures, line temperatures, ambient, and system
 * type, produces a structured set of diagnostic flags. Each flag carries
 * severity, evidence (the specific measurements that triggered it), and
 * recommendations in order of action priority.
 *
 * This is decision-support material drawing on the patterns documented in
 * /superheat-subcooling-fundamentals/ and /high-head-pressure-causes/. Not a
 * substitute for hands-on equipment verification and equipment OEM service
 * literature.
 */
import { getRefrigerant, getSaturationTempAtPsigF } from "@/data/refrigerants";

export type SystemType = "txv-residential" | "fixed-orifice-residential" | "exv-residential" | "commercial-refrig-medium" | "commercial-refrig-low";

export type FlagSeverity = "info" | "caution" | "concern" | "alarm";

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
  /** Computed derived values surfaced for the UI. */
  derived: {
    superheatF: number | null;
    subcoolingF: number | null;
    suctionSatF: number | null;
    dischargeSatF: number | null;
    /** Discharge sat T minus ambient — typical 20-30°F for residential AC; higher = condenser problem. */
    condenserApproachF: number | null;
    /** Return-air T minus suction sat T — typical 35-40°F. */
    evaporatorApproachF: number | null;
  };
  /** Targets used for interpretation (varies by system type). */
  targets: {
    superheatF: [number, number];
    subcoolingF: [number, number];
    condenserApproachF: [number, number];
  };
}

const TARGETS_BY_TYPE: Record<SystemType, DiagnosticOutput["targets"]> = {
  "txv-residential": {
    superheatF: [8, 15],
    subcoolingF: [8, 12],
    condenserApproachF: [20, 30],
  },
  "fixed-orifice-residential": {
    superheatF: [8, 25],
    subcoolingF: [8, 14],
    condenserApproachF: [20, 30],
  },
  "exv-residential": {
    superheatF: [8, 15],
    subcoolingF: [8, 14],
    condenserApproachF: [20, 30],
  },
  "commercial-refrig-medium": {
    superheatF: [10, 20],
    subcoolingF: [5, 15],
    condenserApproachF: [15, 25],
  },
  "commercial-refrig-low": {
    superheatF: [10, 20],
    subcoolingF: [5, 12],
    condenserApproachF: [15, 25],
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

  // Compute saturation temperatures and derived values
  const suctionSatF = getSaturationTempAtPsigF(inputs.slug, inputs.suctionPsig, "dew");
  const dischargeSatF = getSaturationTempAtPsigF(inputs.slug, inputs.liquidPsig, "bubble");
  derived.suctionSatF = suctionSatF;
  derived.dischargeSatF = dischargeSatF;
  const superheatF = suctionSatF !== null ? inputs.suctionLineF - suctionSatF : null;
  const subcoolingF = dischargeSatF !== null ? dischargeSatF - inputs.liquidLineF : null;
  derived.superheatF = superheatF;
  derived.subcoolingF = subcoolingF;
  derived.condenserApproachF = dischargeSatF !== null ? dischargeSatF - inputs.ambientF : null;
  derived.evaporatorApproachF = suctionSatF !== null ? inputs.returnAirF - suctionSatF : null;

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

  // The hard-stop alarms first
  if (superheatF !== null && superheatF < 0) {
    flags.push({
      severity: "alarm",
      label: "Negative superheat — slugging risk",
      evidence: [
        `Suction-line temperature ${inputs.suctionLineF}°F is below saturation temperature ${suctionSatF?.toFixed(1)}°F at the measured suction pressure.`,
        "Liquid refrigerant is reaching the compressor.",
      ],
      recommendations: [
        "Stop the system. Continued operation damages compressor valves and bearings.",
        "Verify charge with subcooling — overcharge is a common cause.",
        "Check for stuck-open TXV or flooded evaporator.",
      ],
    });
  }

  if (subcoolingF !== null && subcoolingF < 0) {
    flags.push({
      severity: "alarm",
      label: "Negative subcooling — vapor in liquid line",
      evidence: [
        `Liquid-line temperature ${inputs.liquidLineF}°F is above saturation temperature ${dischargeSatF?.toFixed(1)}°F at the measured discharge pressure.`,
        "Vapor bubbles are forming in the liquid line.",
      ],
      recommendations: [
        "Severe undercharge or restriction at the filter-drier/expansion device is the typical cause.",
        "Do not add refrigerant until the leak or restriction is identified.",
        "Verify with superheat — high superheat alongside negative subcooling is the strong undercharge fingerprint.",
      ],
    });
  }

  // Pattern matching — overcharge / undercharge / restriction
  if (superheatF !== null && subcoolingF !== null) {
    const [shMin, shMax] = targets.superheatF;
    const [scMin, scMax] = targets.subcoolingF;
    const shLow = superheatF < shMin;
    const shHigh = superheatF > shMax;
    const scLow = subcoolingF < scMin;
    const scHigh = subcoolingF > scMax;

    if (shLow && scHigh) {
      flags.push({
        severity: "concern",
        label: "Likely overcharge",
        evidence: [
          `Superheat ${superheatF.toFixed(1)}°F is below target range ${shMin}-${shMax}°F.`,
          `Subcooling ${subcoolingF.toFixed(1)}°F is above target range ${scMin}-${scMax}°F.`,
          "Low SH + high SC is the classic overcharge fingerprint.",
        ],
        recommendations: [
          "Verify condenser airflow and coil cleanliness first — both will mimic overcharge symptoms.",
          "If airflow and cleanliness are confirmed good, recover refrigerant in measured amounts.",
          "Re-check superheat and subcooling after each removal to find the correct charge.",
        ],
      });
    } else if (shHigh && scLow) {
      flags.push({
        severity: "concern",
        label: "Likely undercharge",
        evidence: [
          `Superheat ${superheatF.toFixed(1)}°F is above target range ${shMin}-${shMax}°F.`,
          `Subcooling ${subcoolingF.toFixed(1)}°F is below target range ${scMin}-${scMax}°F.`,
          "High SH + low SC is the classic undercharge fingerprint.",
        ],
        recommendations: [
          "Check for leaks before adding refrigerant — pressure-add without leak repair is an EPA Section 608 violation and the refrigerant will be lost again.",
          "Find the leak using an electronic detector, UV dye, or soap bubbles on accessible joints.",
          "Repair the leak, evacuate to 500 microns, charge by weight to the system's specified amount.",
        ],
      });
    } else if (shHigh && scHigh) {
      flags.push({
        severity: "concern",
        label: "Likely restriction or low evaporator airflow",
        evidence: [
          `Superheat ${superheatF.toFixed(1)}°F is above target range ${shMin}-${shMax}°F.`,
          `Subcooling ${subcoolingF.toFixed(1)}°F is above target range ${scMin}-${scMax}°F.`,
          "Both abnormal-high suggests refrigerant isn't reaching the evaporator at full mass flow.",
        ],
        recommendations: [
          "Check filter-drier for restriction: touch both sides — significant temperature drop indicates a clog. Replace if cold downstream.",
          "Check indoor evaporator airflow: dirty filter, blocked return, blower motor speed.",
          "Check expansion device for partial restriction or stuck-partially-closed TXV.",
        ],
      });
    } else if (shLow && scLow) {
      flags.push({
        severity: "caution",
        label: "Possible airflow or metering device issue",
        evidence: [
          `Superheat ${superheatF.toFixed(1)}°F is below target range ${shMin}-${shMax}°F.`,
          `Subcooling ${subcoolingF.toFixed(1)}°F is below target range ${scMin}-${scMax}°F.`,
          "Both abnormal-low is less common; usually indicates a stuck-open TXV plus low condenser performance.",
        ],
        recommendations: [
          "Check TXV operation — stuck-open valves flood the evaporator (low SH) without backing up liquid in the condenser (low SC).",
          "Check condenser airflow and cleanliness.",
          "Verify the system is in steady-state operation — readings during cycling can produce this pattern transiently.",
        ],
      });
    }
  }

  // Condenser approach analysis
  if (derived.condenserApproachF !== null) {
    const [caMin, caMax] = targets.condenserApproachF;
    const ca = derived.condenserApproachF;
    if (ca > caMax + 15) {
      flags.push({
        severity: "alarm",
        label: "Very high condenser approach — heat rejection failure",
        evidence: [
          `Discharge saturation ${dischargeSatF?.toFixed(1)}°F is ${ca.toFixed(1)}°F above ambient ${inputs.ambientF}°F.`,
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
          `Discharge saturation ${dischargeSatF?.toFixed(1)}°F is ${ca.toFixed(1)}°F above ambient ${inputs.ambientF}°F.`,
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
          `Discharge saturation ${dischargeSatF?.toFixed(1)}°F is only ${ca.toFixed(1)}°F above ambient ${inputs.ambientF}°F.`,
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
