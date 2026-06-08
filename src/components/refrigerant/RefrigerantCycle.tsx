import { Info } from "lucide-react";
import { getRefrigerant, getPressureAtTempF } from "@/data/refrigerants";
import { CycleDiagram } from "@/components/svg/CycleDiagram";

export interface RefrigerantCycleProps {
  slug: string;
  className?: string;
}

/**
 * Renders the 4-stage cycle for a refrigerant under typical residential cooling
 * conditions: 40°F evaporator saturation, 110°F condenser saturation, 10°F
 * superheat at suction, 10°F subcooling at liquid line, and a representative
 * compressor discharge temperature of 180°F.
 *
 * When standard residential conditions do not apply (no PT data, or 110°F is
 * above the refrigerant's critical temperature), an honest disclosure is
 * rendered instead of a missing/blank diagram. Fabricated values are never
 * shown to fill gaps.
 */
export function RefrigerantCycle({ slug, className }: RefrigerantCycleProps) {
  const r = getRefrigerant(slug);
  if (!r) return null;

  if (r.ptChart.length === 0) {
    return <CycleNotApplicable reason="no-pt-data" slug={slug} />;
  }

  const suctionSat = getPressureAtTempF(slug, 40);
  const dischargeSat = getPressureAtTempF(slug, 110);
  if (!suctionSat || !dischargeSat) {
    const critF = r.physical.critical.tempF;
    if (critF !== null && critF < 110) {
      return <CycleNotApplicable reason="above-critical" slug={slug} criticalF={critF} />;
    }
    if (!suctionSat) {
      return <CycleNotApplicable reason="below-range" slug={slug} />;
    }
    return <CycleNotApplicable reason="above-critical" slug={slug} criticalF={critF ?? null} />;
  }

  return (
    <CycleDiagram
      refrigerantName={r.displayName}
      conditions={{
        suctionPsig: suctionSat.bubble,
        suctionTempF: 50, // 40 + 10°F superheat
        dischargePsig: dischargeSat.bubble,
        dischargeTempF: 180,
        liquidPsig: dischargeSat.bubble,
        liquidTempF: 100, // 110 − 10°F subcooling
        evapInletPsig: suctionSat.bubble,
        evapInletTempF: 40,
      }}
      ariaLabel={`Refrigeration cycle diagram for ${r.displayName} with typical residential operating conditions`}
      className={className}
    />
  );
}

type Reason = "no-pt-data" | "above-critical" | "below-range";

function CycleNotApplicable({
  reason,
  slug,
  criticalF,
}: {
  reason: Reason;
  slug: string;
  criticalF?: number | null;
}) {
  const r = getRefrigerant(slug);
  if (!r) return null;

  const applications = r.applications.length > 0 ? r.applications.slice(0, 3).join(", ") : null;

  let body: React.ReactNode;
  switch (reason) {
    case "no-pt-data":
      body = (
        <>
          <strong>No cycle diagram can be drawn for {r.displayName}.</strong> The PT chart for
          this refrigerant is not in this build (see the &quot;Saturation pressure-temperature
          curve&quot; section above for the primary source citation). Without saturation data,
          the suction and discharge points of the cycle cannot be computed without fabrication.
        </>
      );
      break;
    case "above-critical":
      body = (
        <>
          <strong>Standard residential cycle (40°F evap / 110°F condenser) does not apply to {r.displayName}.</strong>{" "}
          {criticalF !== null && criticalF !== undefined ? (
            <>
              Its critical temperature is {criticalF.toFixed(1)}°F — below the typical 110°F
              residential condensing point. Above the critical temperature no saturation state
              exists, so the high side would operate transcritically rather than condensing.
              A standard 4-stage cycle diagram is not meaningful here.
            </>
          ) : (
            <>
              The 110°F condensing point falls outside this refrigerant&apos;s subcritical
              envelope. A standard 4-stage cycle diagram is not meaningful.
            </>
          )}{" "}
          {applications ? (
            <>
              <br />
              <span className="text-xs opacity-80">
                {r.displayName} is used in: {applications} — applications with much lower
                condensing temperatures than residential AC.
              </span>
            </>
          ) : null}
        </>
      );
      break;
    case "below-range":
      body = (
        <>
          <strong>40°F evaporator falls outside the published PT chart for {r.displayName}.</strong>{" "}
          This refrigerant operates outside standard residential cooling envelopes. Refer to
          its application-specific operating range above. Fabricating values to fill the
          standard-cycle template would misrepresent its actual operation.
        </>
      );
      break;
  }

  return (
    <div className="rounded-md border border-zinc-200 bg-zinc-50/60 p-4 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-300">
      <div className="flex items-start gap-2">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
        <div>{body}</div>
      </div>
    </div>
  );
}
