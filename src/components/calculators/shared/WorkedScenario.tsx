/**
 * Renders one worked-scenario card from a ComputedScenario. Every number shown
 * here is computed by computeScenario() from the scenario's inputs (never hand-
 * typed), so the card cannot drift from the dataset or the classifier. The
 * measured/lookup/derived panels reuse the data-src="dataset" sub-components from
 * ServiceProblem, so the numeric-consistency gate treats them as dataset values.
 */
import { Activity, Calculator as CalcIcon, Gauge, Table as TableIcon } from "lucide-react";
import {
  ComparisonTable,
  Derived,
  FixCallout,
  Gauges,
  Lookups,
  Panel,
  ServiceProblem,
  VerdictBanner,
  type GaugeItem,
  type LookupRow,
  type DerivedRow,
  type Verdict as VerdictSeverity,
} from "@/components/calculators/shared/ServiceProblem";
import {
  computeScenario,
  RESIDENTIAL_CONDENSER_APPROACH_F,
  type ComputedScenario,
  type Scenario,
} from "@/lib/scenarios";
import { RESIDENTIAL_EVAPORATOR_APPROACH_F, COMMERCIAL_EVAPORATOR_APPROACH_F } from "@/lib/fault-patterns";
import { satPressure, getRefrigerant } from "@/data/refrigerants";

const f1 = (x: number | null | undefined) => (x == null ? "—" : x.toFixed(1));
const f0 = (x: number | null | undefined) => (x == null ? "—" : Math.round(x).toString());

function rangeBadge(v: number | null, range: [number, number]): VerdictSeverity {
  if (v === null) return "info";
  if (v < 0) return "bad";
  if (v < range[0] || v > range[1]) return "warn";
  return "ok";
}
function rangeNote(v: number | null, range: [number, number], unit = "°F"): string {
  if (v === null) return "";
  if (v < 0) return `negative — re-check (physically ≥0${unit})`;
  if (v < range[0]) return `below target ${range[0]}-${range[1]}${unit}`;
  if (v > range[1]) return `above target ${range[0]}-${range[1]}${unit}`;
  return `in target ${range[0]}-${range[1]}${unit}`;
}

export function WorkedScenario({ scenario }: { scenario: Scenario }) {
  const c = computeScenario(scenario);
  const s = scenario;

  if (s.kind === "pressure-comparison" && s.comparisonSlugs && s.comparisonTemps) {
    return <ComparisonCard c={c} />;
  }
  if (s.kind === "compatibility-info") {
    return (
      <ServiceProblem number={s.number} refrigerant={s.refrigerantDisplay} title={s.title} scenario={s.scenario}>
        {(s.pressures?.length || s.suctionPsig != null) ? (
          <Panel title="PT chart lookup" icon={CalcIcon}>
            <Lookups rows={lookupRows(c)} />
          </Panel>
        ) : null}
        <VerdictBanner status="info" title={c.verdict.title}>{s.teaching}</VerdictBanner>
        {s.fix ? <FixCallout>{s.fix}</FixCallout> : null}
      </ServiceProblem>
    );
  }

  // charge-diagnostic
  const showApproaches = !!s.systemType || s.coolingMedium === "water" || s.mode === "heating";
  const evapTarget: [number, number] = s.mode === "refrigeration" ? COMMERCIAL_EVAPORATOR_APPROACH_F : RESIDENTIAL_EVAPORATOR_APPROACH_F;
  const derivedRows: DerivedRow[] = [];
  if (c.superheatF !== null && c.targets) {
    derivedRows.push({ formula: `Superheat = ${f1(s.suctionLineF)} − ${f1(c.suctionSatDewF)} (dew) = ${f1(c.superheatF)}°F`, verdict: rangeBadge(c.superheatF, c.targets.superheatF), note: rangeNote(c.superheatF, c.targets.superheatF) });
  }
  if (c.targetSuperheatF !== null) {
    const delta = c.superheatF !== null ? Math.abs(c.superheatF - c.targetSuperheatF) : null;
    derivedRows.push({ formula: `Target superheat (${f0(s.indoorWB)}°F WB / ${f0(s.outdoorDB)}°F DB) = ${c.targetSuperheatF}°F`, verdict: delta === null ? "info" : delta <= 3 ? "ok" : "warn", note: "fixed-orifice charging-chart target" });
  }
  if (c.subcoolingF !== null && c.targets) {
    derivedRows.push({ formula: `Subcooling = ${f1(c.dischargeSatBubbleF)} (bubble) − ${f1(s.liquidLineF)} = ${f1(c.subcoolingF)}°F`, verdict: rangeBadge(c.subcoolingF, c.targets.subcoolingF), note: rangeNote(c.subcoolingF, c.targets.subcoolingF) });
  }
  if (showApproaches && c.condenserApproachF !== null) {
    const airLabel = s.coolingMedium === "water" ? "entering water" : s.mode === "heating" ? "return air" : "ambient";
    derivedRows.push({ formula: `Condenser approach = ${f1(c.dischargeSatBubbleF)} − ${f1(c.condenserAirF)} (${airLabel}) = ${f1(c.condenserApproachF)}°F`, verdict: s.mode === "heating" ? "info" : rangeBadge(c.condenserApproachF, RESIDENTIAL_CONDENSER_APPROACH_F), note: s.mode === "heating" ? "the temperature lift into the indoor coil" : rangeNote(c.condenserApproachF, RESIDENTIAL_CONDENSER_APPROACH_F) });
  }
  if (showApproaches && c.evaporatorApproachF !== null) {
    const airLabel = s.mode === "heating" ? "outdoor" : s.mode === "refrigeration" ? "box" : "return air";
    derivedRows.push({ formula: `Evaporator approach = ${f1(c.evaporatorAirF)} (${airLabel}) − ${f1(c.suctionSatDewF)} = ${f1(c.evaporatorApproachF)}°F`, verdict: s.mode === "heating" ? "info" : rangeBadge(c.evaporatorApproachF, evapTarget), note: s.mode === "heating" ? "outdoor coil runs below ambient to absorb heat" : rangeNote(c.evaporatorApproachF, evapTarget) });
  }

  return (
    <ServiceProblem number={s.number} refrigerant={s.refrigerantDisplay} title={s.title} scenario={s.scenario}>
      <Panel title="Measured at the manifold" icon={Gauge}>
        <Gauges items={measuredGauges(s)} />
      </Panel>
      <Panel title={`PT chart lookup (${c.refrigerantName})`} icon={CalcIcon}>
        <Lookups rows={lookupRows(c)} />
      </Panel>
      {derivedRows.length > 0 ? (
        <Panel title="Derived" icon={Activity}>
          <Derived rows={derivedRows} />
        </Panel>
      ) : null}
      <VerdictBanner status={c.verdict.status} title={c.verdict.title}>{s.teaching}</VerdictBanner>
      {s.fix ? <FixCallout>{s.fix}</FixCallout> : null}
    </ServiceProblem>
  );
}

function measuredGauges(s: Scenario): GaugeItem[] {
  const g: GaugeItem[] = [];
  if (s.suctionPsig != null) g.push({ label: "Suction P", value: `${s.suctionPsig} PSIG`, side: "low" });
  if (s.suctionLineF != null) g.push({ label: "Suction line", value: `${s.suctionLineF}°F`, side: "low" });
  if (s.liquidPsig != null) g.push({ label: s.mode === "heating" ? "Discharge P" : "Discharge P", value: `${s.liquidPsig} PSIG`, side: "high" });
  if (s.liquidLineF != null) g.push({ label: "Liquid line", value: `${s.liquidLineF}°F`, side: "high" });
  if (s.coolingMedium === "water" && s.enteringWaterF != null) g.push({ label: "Entering water", value: `${s.enteringWaterF}°F` });
  else if (s.ambientF != null) g.push({ label: s.mode === "heating" ? "Outdoor temp" : "Ambient", value: `${s.ambientF}°F`, side: s.mode === "heating" ? "low" : "high" });
  if (s.indoorAirF != null) g.push({ label: s.mode === "refrigeration" ? "Box temp" : "Return air", value: `${s.indoorAirF}°F` });
  return g;
}

function lookupRows(c: ComputedScenario): LookupRow[] {
  const s = c.s;
  const rows: LookupRow[] = [];
  const blend = c.hasGlide;
  if (s.suctionPsig != null) {
    rows.push({ input: `${s.suctionPsig} PSIG${blend ? " dew" : ""}`, output: c.suctionSatDewF === null ? "out of range" : `${f1(c.suctionSatDewF)}°F sat`, note: blend ? "evap outlet — use for superheat" : "evaporator saturation" });
    if (blend && c.suctionSatBubbleF !== null) rows.push({ input: `${s.suctionPsig} PSIG bubble`, output: `${f1(c.suctionSatBubbleF)}°F sat`, note: "evap inlet — reference only" });
  }
  if (s.liquidPsig != null) {
    rows.push({ input: `${s.liquidPsig} PSIG${blend ? " bubble" : ""}`, output: c.dischargeSatBubbleF === null ? "out of range" : `${f1(c.dischargeSatBubbleF)}°F sat`, note: blend ? "cond outlet — use for subcooling" : "condenser saturation" });
    if (blend && c.dischargeSatDewF !== null) rows.push({ input: `${s.liquidPsig} PSIG dew`, output: `${f1(c.dischargeSatDewF)}°F sat`, note: "cond inlet — reference only" });
  }
  for (const p of s.pressures ?? []) {
    const t = p.curve === "bubble" ? satTempSafe(s.slug, p.psig, "bubble") : satTempSafe(s.slug, p.psig, "dew");
    rows.push({ input: `${p.psig} PSIG`, output: t === null ? "out of range" : `${f1(t)}°F sat`, note: p.label });
  }
  return rows;
}

import { getSaturationTempAtPsigF } from "@/data/refrigerants";
function satTempSafe(slug: string, psig: number, curve: "bubble" | "dew") {
  return getSaturationTempAtPsigF(slug, psig, curve);
}

function ComparisonCard({ c }: { c: ComputedScenario }) {
  const s = c.s;
  const slugs = s.comparisonSlugs!;
  const temps = s.comparisonTemps!;
  const base = slugs[0];
  const headers = ["Refrigerant", ...temps.map((t) => `${t}°F`), `Δ vs ${getRefrigerant(base)?.displayName ?? base}`];
  const rows = slugs.flatMap((slug) => {
    const r = getRefrigerant(slug);
    const name = r?.displayName ?? slug;
    const curves: Array<"bubble" | "dew"> = r?.physical.hasSignificantGlide ? ["bubble", "dew"] : ["bubble"];
    return curves.map((curve) => {
      const cells = temps.map((t) => f0(satPressure(slug, t, curve)));
      const baseP = satPressure(base, temps[temps.length - 1], "bubble");
      const thisP = satPressure(slug, temps[temps.length - 1], curve);
      const delta = baseP && thisP ? Math.round(((thisP - baseP) / baseP) * 100) : null;
      const label = curves.length > 1 ? `${name} ${curve}` : `${name}`;
      return {
        label,
        cells: [...cells, slug === base && curve === "bubble" ? "baseline" : delta === null ? "—" : `${delta > 0 ? "+" : ""}${delta}%`],
        tone: (slug === base ? "baseline" : "delta") as "baseline" | "delta",
      };
    });
  });
  return (
    <ServiceProblem number={s.number} refrigerant={s.refrigerantDisplay} title={s.title} scenario={s.scenario}>
      <Panel title="PT chart comparison (PSIG)" icon={TableIcon}>
        <ComparisonTable headers={headers} rows={rows} />
      </Panel>
      <VerdictBanner status="info" title={c.verdict.title}>{s.teaching}</VerdictBanner>
      {s.fix ? <FixCallout>{s.fix}</FixCallout> : null}
    </ServiceProblem>
  );
}
