/**
 * Retrofit compatibility evaluation.
 *
 * Encodes the structural questions an HVAC professional asks before
 * considering a refrigerant swap on existing equipment, drawing on the
 * typed fields of two refrigerant records.
 *
 * Per project skill rule 9: the decision logic cites named sources for
 * each criterion — ACCA Manual T (charging), UL 60335-2-40 (A2L charge
 * limits), ASHRAE 15 (machine room), ASHRAE 34 (safety class), and
 * manufacturer service literature.
 */
import { getPressureAtTempF, type Refrigerant, type SafetyClass } from "@/data/refrigerants";
import { GROUP_INFO, PRIMARY_GROUPS, type GroupId } from "@/data/comparison-groups";

/**
 * All groups a refrigerant appears in, derived from both PRIMARY_GROUPS (the
 * primary association per slug) AND GROUP_INFO.members (the per-group listings).
 * Either source can include a slug; we union them.
 */
function allGroupsForSlug(slug: string): GroupId[] {
  const primaries = new Set<GroupId>(PRIMARY_GROUPS[slug] ?? []);
  for (const [groupId, info] of Object.entries(GROUP_INFO) as Array<[GroupId, typeof GROUP_INFO[GroupId]]>) {
    if (info.members.includes(slug)) primaries.add(groupId);
  }
  return [...primaries];
}

export type Verdict =
  | "same-refrigerant"
  | "drop-in"
  | "retrofit-simple"
  | "retrofit-oil-change"
  | "equipment-mods-required"
  | "not-recommended"
  | "not-feasible";

export interface Check {
  ok: boolean;
  /** "warn" for borderline issues that don't block but raise concerns. */
  severity: "ok" | "warn" | "fail";
  note: string;
}

export interface RetrofitEvaluation {
  verdict: Verdict;
  verdictLabel: string;
  verdictTone: "good" | "ok" | "warn" | "bad" | "neutral";
  summary: string;
  checks: {
    lubricant: Check;
    safetyClass: Check;
    pressure: Check;
    glide: Check;
    application: Check;
  };
  recommendations: string[];
}

const SAFETY_ORDER: Record<SafetyClass, number> = {
  A1: 1, A2L: 2, A2: 3, A3: 4, B1: 5, B2L: 6, B2: 7, B3: 8,
};

/**
 * Evaluate a retrofit from refrigerant A (existing) to refrigerant B (target).
 * Returns a structured verdict with per-criterion details and recommendations.
 */
export function evaluateRetrofit(a: Refrigerant, b: Refrigerant): RetrofitEvaluation {
  if (a.slug === b.slug) {
    return {
      verdict: "same-refrigerant",
      verdictLabel: "Same refrigerant — no retrofit",
      verdictTone: "neutral",
      summary: `${a.displayName} is already the refrigerant in the system. No retrofit applies.`,
      checks: {
        lubricant: { ok: true, severity: "ok", note: "Same refrigerant; no change." },
        safetyClass: { ok: true, severity: "ok", note: `ASHRAE ${a.safetyClass} unchanged.` },
        pressure: { ok: true, severity: "ok", note: "Identical pressure envelope." },
        glide: { ok: true, severity: "ok", note: "Identical glide behavior." },
        application: { ok: true, severity: "ok", note: "Identical application coverage." },
      },
      recommendations: [],
    };
  }

  const lubricantCheck = checkLubricant(a, b);
  const safetyCheck = checkSafetyClass(a, b);
  const pressureCheck = checkPressure(a, b);
  const glideCheck = checkGlide(a, b);
  const applicationCheck = checkApplication(a, b);

  const { verdict, verdictLabel, verdictTone, summary } = synthesizeVerdict(
    a, b, lubricantCheck, safetyCheck, pressureCheck, glideCheck, applicationCheck
  );

  const recommendations = buildRecommendations(
    verdict, a, b, lubricantCheck, safetyCheck, pressureCheck, glideCheck, applicationCheck
  );

  return {
    verdict,
    verdictLabel,
    verdictTone,
    summary,
    checks: {
      lubricant: lubricantCheck,
      safetyClass: safetyCheck,
      pressure: pressureCheck,
      glide: glideCheck,
      application: applicationCheck,
    },
    recommendations,
  };
}

function checkLubricant(a: Refrigerant, b: Refrigerant): Check {
  const aLubs = new Set(a.lubricants.compatible);
  const bLubs = new Set(b.lubricants.compatible);
  const intersection = [...aLubs].filter((l) => bLubs.has(l));

  if (intersection.length > 0) {
    return {
      ok: true,
      severity: "ok",
      note: `Shared lubricant(s): ${intersection.join(", ")}. No oil change required if existing system already uses one of these.`,
    };
  }

  // No intersection — would need an oil change.
  // Special case: B-class (ammonia) doesn't mix with synthetic-refrigerant lubricants.
  const aIsB = a.safetyClass.startsWith("B");
  const bIsB = b.safetyClass.startsWith("B");
  if (aIsB || bIsB) {
    return {
      ok: false,
      severity: "fail",
      note: `Lubricant systems are fundamentally different. ${a.displayName} uses ${a.lubricants.compatible.join("/")}; ${b.displayName} uses ${b.lubricants.compatible.join("/")}. B-class refrigerants (ammonia) use steel-system lubricants incompatible with HFC POE.`,
    };
  }

  return {
    ok: true,
    severity: "warn",
    note: `Oil change required. ${a.displayName} uses ${a.lubricants.compatible.join("/")}; ${b.displayName} uses ${b.lubricants.compatible.join("/")}. Drain existing oil, flush with new lubricant, change filter-drier.`,
  };
}

function checkSafetyClass(a: Refrigerant, b: Refrigerant): Check {
  if (a.safetyClass === b.safetyClass) {
    return {
      ok: true,
      severity: "ok",
      note: `Both are ASHRAE class ${a.safetyClass}. No safety-class-driven equipment changes required.`,
    };
  }

  // Specific high-impact transitions
  if (a.safetyClass === "A1" && b.safetyClass === "A2L") {
    return {
      ok: false,
      severity: "fail",
      note: `A1 → A2L safety class change. Existing A1 equipment lacks A2L-rated compressor electrical, integrated refrigerant leak detection, charge limits per UL 60335-2-40, and machine-room ventilation per ASHRAE 15. Effectively requires new equipment, not refrigerant swap.`,
    };
  }
  if (a.safetyClass === "A2L" && b.safetyClass === "A1") {
    return {
      ok: true,
      severity: "warn",
      note: `A2L → A1 safety class — a downgrade in flammability classification. Existing A2L equipment is over-engineered for A1 service; the change is generally acceptable from a safety standpoint, though OEM compatibility verification is required.`,
    };
  }
  if (b.safetyClass === "A3" || b.safetyClass === "B3") {
    return {
      ok: false,
      severity: "fail",
      note: `→ ${b.safetyClass} requires HC-rated or higher-class equipment (sealed electrical, explosion-rated enclosures, EPA SNAP charge limits). Not a refrigerant-swap retrofit; full equipment replacement.`,
    };
  }
  if (a.safetyClass.startsWith("B") || b.safetyClass.startsWith("B")) {
    return {
      ok: false,
      severity: "fail",
      note: `Cross-class B/A transition. B-class refrigerants (ammonia) use purpose-built equipment (steel piping, specific lubricants, machine-room safety) incompatible with A-class HVAC equipment design. No realistic refrigerant-swap path.`,
    };
  }

  // Generic class change
  const delta = Math.abs(SAFETY_ORDER[a.safetyClass] - SAFETY_ORDER[b.safetyClass]);
  if (delta >= 2) {
    return {
      ok: false,
      severity: "fail",
      note: `Significant safety class change (${a.safetyClass} → ${b.safetyClass}). Equipment is not designed for this transition.`,
    };
  }
  return {
    ok: false,
    severity: "warn",
    note: `Safety class change (${a.safetyClass} → ${b.safetyClass}). Equipment design and service procedures must accommodate the change; consult equipment OEM for compatibility.`,
  };
}

function checkPressure(a: Refrigerant, b: Refrigerant): Check {
  const pA = getPressureAtTempF(a.slug, 70);
  const pB = getPressureAtTempF(b.slug, 70);
  if (!pA || !pB) {
    return {
      ok: true,
      severity: "warn",
      note: "Insufficient PT data on one or both refrigerants to compute pressure delta. Verify pressure ratings manually.",
    };
  }
  const aP = pA.bubble;
  const bP = pB.bubble;
  const ratio = bP / aP;
  const pctChange = (ratio - 1) * 100;

  if (Math.abs(pctChange) <= 10) {
    return {
      ok: true,
      severity: "ok",
      note: `${b.displayName} at 70°F = ${bP.toFixed(1)} PSIG vs ${a.displayName} ${aP.toFixed(1)} PSIG (${pctChange >= 0 ? "+" : ""}${pctChange.toFixed(1)}%). Within typical component pressure-rating margin.`,
    };
  }
  if (Math.abs(pctChange) <= 25) {
    return {
      ok: false,
      severity: "warn",
      note: `${b.displayName} at 70°F = ${bP.toFixed(1)} PSIG vs ${a.displayName} ${aP.toFixed(1)} PSIG (${pctChange >= 0 ? "+" : ""}${pctChange.toFixed(1)}%). Pressure-rating verification required; some components may need replacement.`,
    };
  }
  return {
    ok: false,
    severity: "fail",
    note: `${b.displayName} at 70°F = ${bP.toFixed(1)} PSIG vs ${a.displayName} ${aP.toFixed(1)} PSIG (${pctChange >= 0 ? "+" : ""}${pctChange.toFixed(1)}%). Substantially exceeds existing component pressure ratings — equipment-level changes required.`,
  };
}

function checkGlide(a: Refrigerant, b: Refrigerant): Check {
  const aGlide = Math.abs(a.physical.temperatureGlideF);
  const bGlide = Math.abs(b.physical.temperatureGlideF);
  const aZeo = a.physical.hasSignificantGlide;
  const bZeo = b.physical.hasSignificantGlide;

  if (!aZeo && !bZeo) {
    return {
      ok: true,
      severity: "ok",
      note: "Both refrigerants are pure or near-azeotropic. TXV operation and superheat measurement use the same procedures.",
    };
  }
  if (aZeo && bZeo) {
    return {
      ok: true,
      severity: "ok",
      note: `Both have temperature glide (${a.displayName} ${aGlide.toFixed(1)}°F, ${b.displayName} ${bGlide.toFixed(1)}°F). Same dew-curve / bubble-curve service procedures apply.`,
    };
  }
  if (!aZeo && bZeo) {
    return {
      ok: false,
      severity: "warn",
      note: `${a.displayName} is azeotropic; ${b.displayName} has ${bGlide.toFixed(1)}°F glide. Existing TXV may not control superheat correctly across the glide range; expansion valve adjustment or replacement may be required.`,
    };
  }
  // aZeo && !bZeo
  return {
    ok: true,
    severity: "ok",
    note: `${a.displayName} has ${aGlide.toFixed(1)}°F glide; ${b.displayName} is azeotropic. Service simpler for the new refrigerant; existing TXV will operate fine.`,
  };
}

function checkApplication(a: Refrigerant, b: Refrigerant): Check {
  const aGroups = new Set(allGroupsForSlug(a.slug));
  const bGroups = new Set(allGroupsForSlug(b.slug));
  const overlap = [...aGroups].filter((g) => bGroups.has(g));

  if (overlap.length > 0) {
    const labels = overlap.map((id) => GROUP_INFO[id].label);
    return {
      ok: true,
      severity: "ok",
      note: `Both used in: ${labels.join("; ")}. Application overlap supports a realistic retrofit.`,
    };
  }
  if (aGroups.size === 0 || bGroups.size === 0) {
    return {
      ok: true,
      severity: "warn",
      note: "Application overlap data not available for one or both refrigerants. Verify the new refrigerant is appropriate for the equipment type.",
    };
  }
  const aLabels = [...aGroups].map((id) => GROUP_INFO[id].label);
  const bLabels = [...bGroups].map((id) => GROUP_INFO[id].label);
  return {
    ok: false,
    severity: "fail",
    note: `Different application families. ${a.displayName}: ${aLabels.join("; ")}. ${b.displayName}: ${bLabels.join("; ")}. Refrigerants designed for different equipment types rarely swap successfully.`,
  };
}

function synthesizeVerdict(
  a: Refrigerant,
  b: Refrigerant,
  lub: Check,
  safety: Check,
  pressure: Check,
  glide: Check,
  app: Check
): { verdict: Verdict; verdictLabel: string; verdictTone: "good" | "ok" | "warn" | "bad" | "neutral"; summary: string } {
  // Hard fails first
  if (app.severity === "fail") {
    return {
      verdict: "not-feasible",
      verdictLabel: "Not feasible",
      verdictTone: "bad",
      summary: `${a.displayName} and ${b.displayName} are designed for different application families. A refrigerant swap is not a realistic path.`,
    };
  }
  if (safety.severity === "fail" && (b.safetyClass === "A3" || b.safetyClass === "B3" || b.safetyClass === "B2L")) {
    return {
      verdict: "not-feasible",
      verdictLabel: "Not feasible (safety class)",
      verdictTone: "bad",
      summary: `Existing equipment is not designed for ${b.safetyClass} refrigerants. The safety regime difference effectively requires new equipment, not retrofit.`,
    };
  }
  if (pressure.severity === "fail") {
    return {
      verdict: "not-recommended",
      verdictLabel: "Not recommended (pressure)",
      verdictTone: "bad",
      summary: `${b.displayName}'s pressures substantially exceed ${a.displayName}'s. Existing equipment is not rated for the higher pressures. Full equipment replacement is the realistic path.`,
    };
  }
  if (safety.severity === "fail" && a.safetyClass === "A1" && b.safetyClass === "A2L") {
    return {
      verdict: "equipment-mods-required",
      verdictLabel: "Equipment modifications required (A1 → A2L)",
      verdictTone: "warn",
      summary: `${a.displayName} is A1 (non-flammable); ${b.displayName} is A2L (mildly flammable). Equipment-level changes required — A2L-rated compressor electrical, integrated leak detection, charge limits per UL 60335-2-40. Effectively new equipment.`,
    };
  }
  if (lub.severity === "fail") {
    return {
      verdict: "not-feasible",
      verdictLabel: "Not feasible (lubricant incompatible)",
      verdictTone: "bad",
      summary: `Lubricant systems between ${a.displayName} and ${b.displayName} are fundamentally incompatible. Refrigerant swap is not realistic.`,
    };
  }

  // Lubricant warn = oil change needed
  if (lub.severity === "warn") {
    // Other conditions OK; this is a retrofit with oil change
    return {
      verdict: "retrofit-oil-change",
      verdictLabel: "Retrofit with oil change",
      verdictTone: "ok",
      summary: `${a.displayName} → ${b.displayName} is feasible with an oil change. Drain existing lubricant, replace with ${b.lubricants.compatible.join(" or ")}, replace filter-drier, pull vacuum, charge by weight.`,
    };
  }

  // Pressure or glide warn = retrofit with modifications
  if (pressure.severity === "warn" || glide.severity === "warn") {
    return {
      verdict: "retrofit-simple",
      verdictLabel: "Retrofit feasible — verify components",
      verdictTone: "ok",
      summary: `${a.displayName} → ${b.displayName} is feasible. Pressure or glide differences require component verification (expansion valve, pressure ratings) but the retrofit is realistic.`,
    };
  }

  // All OK
  return {
    verdict: "drop-in",
    verdictLabel: "Drop-in retrofit possible",
    verdictTone: "good",
    summary: `${a.displayName} → ${b.displayName}: same lubricant, same safety class, similar pressures, similar glide character. Drop-in retrofit is realistic with standard service procedures.`,
  };
}

function buildRecommendations(
  verdict: Verdict,
  a: Refrigerant,
  b: Refrigerant,
  lub: Check,
  safety: Check,
  pressure: Check,
  glide: Check,
  app: Check
): string[] {
  const recs: string[] = [];

  if (verdict === "same-refrigerant") return recs;

  if (verdict === "not-feasible" || verdict === "not-recommended") {
    recs.push(`Full equipment replacement is the realistic path. New equipment designed for ${b.displayName} addresses all the structural issues (safety class, pressure rating, lubricant, application fit).`);
    if (app.severity === "fail") {
      recs.push(`Cross-application retrofits typically fail because compressor sizing, heat exchanger geometry, and metering devices are tuned to the original application's pressure and capacity envelope.`);
    }
    return recs;
  }

  if (verdict === "equipment-mods-required") {
    recs.push(`A2L safety class change requires: A2L-rated compressor electrical components; integrated refrigerant leak detection per UL 60335-2-40; charge limits per the equipment's installation environment.`);
    recs.push(`Practical reality: in most cases the cost of A2L-compliant component replacement approaches the cost of a new ${b.displayName} system. Verify the economic case before retrofitting.`);
    if (b.lubricants.compatible.length > 0) {
      recs.push(`Lubricant: ${b.displayName} uses ${b.lubricants.compatible.join(" or ")}. ${lub.severity === "warn" ? "Oil change required." : "Existing lubricant may be compatible."}`);
    }
    return recs;
  }

  // Standard retrofit recommendations
  recs.push(`Recover all ${a.displayName} per EPA Section 608. Replace filter-drier with ${b.lubricants.compatible.join("/")}-compatible model.`);
  if (lub.severity === "warn") {
    recs.push(`Oil change: drain ${a.lubricants.compatible.join("/")} from the compressor and accessible low points; perform multiple complete ${b.lubricants.compatible.join("/")} oil changes or a triple flush; verify oil return at the compressor over the first weeks of operation.`);
  }
  if (b.physical.hasSignificantGlide) {
    recs.push(`${b.displayName} has ${Math.abs(b.physical.temperatureGlideF).toFixed(1)}°F temperature glide. Charge by weight per the system's calculated capacity (not by gauge). Use the dew curve for superheat math (the site's superheat calculator handles this automatically). TXV adjustment likely required.`);
  }
  recs.push(`Pull vacuum to 500 microns; verify the vacuum holds for 30+ minutes before charging.`);
  if (pressure.severity === "warn") {
    recs.push(`Pressure verification: ${b.displayName} pressures differ from ${a.displayName} enough to warrant checking component ratings (compressor working pressure, line set rating, expansion valve setpoint).`);
  }
  recs.push(`Verify cooling capacity output after retrofit; expect ~5-10% capacity change typical for HFC retrofit refrigerants.`);

  return recs;
}
