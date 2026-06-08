import { Info } from "lucide-react";
import { getRefrigerant } from "@/data/refrigerants";
import { PhaseDownTimeline } from "@/components/svg/PhaseDownTimeline";
import { getMilestonesForSlug } from "@/data/phase-down-milestones";

export interface RefrigerantPhaseDownProps {
  slug: string;
  /** ISO date fallback for SSR — client overrides with current date on hydration. */
  asOfDate?: string;
  className?: string;
}

export function RefrigerantPhaseDown({ slug, asOfDate, className }: RefrigerantPhaseDownProps) {
  const r = getRefrigerant(slug);
  if (!r) return null;
  const milestones = getMilestonesForSlug(slug);

  if (milestones.length === 0) {
    return <NoMilestonesNotice slug={slug} />;
  }

  return (
    <PhaseDownTimeline
      refrigerantName={r.displayName}
      milestones={milestones}
      asOfDate={asOfDate ?? r.dataSource.ptChartGeneratedAt.slice(0, 10)}
      ariaLabel={`Regulatory phase-down timeline for ${r.displayName}, ${milestones.length} milestones`}
      className={className}
    />
  );
}

function NoMilestonesNotice({ slug }: { slug: string }) {
  const r = getRefrigerant(slug);
  if (!r) return null;

  const gwp = r.environmental.gwp100Ar5;
  const odp = r.environmental.odp;
  const aimAct = r.regulatoryStatus.aimActAffected;
  const type = r.type;
  const isHfo = type === "hfo-pure" || type === "hfo-blend";
  const isHydrocarbon = type === "natural";

  let reason: React.ReactNode;
  let category: "low-gwp" | "natural" | "not-yet-regulated" | "pending-documentation";

  if (gwp !== null && gwp <= 10 && (isHydrocarbon || isHfo)) {
    category = isHydrocarbon ? "natural" : "low-gwp";
    reason = (
      <>
        <strong>{r.displayName} is not subject to AIM Act or EU F-Gas phase-down regulation.</strong>{" "}
        With a 100-year GWP of {gwp} ({isHydrocarbon ? "hydrocarbon / natural refrigerant" : "HFO"})
        and {odp === 0 ? "zero ozone-depletion potential" : "low ozone-depletion potential"}, it
        sits below both the EU F-Gas 150 GWP cap and the EPA AIM Act 700 GWP cap. No phase-down
        schedule applies — it is one of the refrigerants <em>chosen for</em> the transition away
        from high-GWP HFCs.
      </>
    );
  } else if (type === "natural") {
    category = "natural";
    reason = (
      <>
        <strong>{r.displayName} is a natural refrigerant not subject to climate-driven phase-down.</strong>{" "}
        With {odp === 0 ? "zero ODP" : "low ODP"} and{" "}
        {gwp !== null ? `GWP of ${gwp}` : "negligible direct climate impact"}, it sits outside the
        EPA AIM Act (40 CFR Part 84) and EU F-Gas Regulation phase-down schedules. Its
        availability is governed by ordinary commodity dynamics and equipment-specific
        installation standards (e.g., IIAR 2/9 for ammonia, IEC 60335-2-89 for hydrocarbons).
      </>
    );
  } else if (aimAct === false && (gwp === null || gwp < 150)) {
    category = "low-gwp";
    reason = (
      <>
        <strong>{r.displayName} is not currently regulated by AIM Act or EU F-Gas phase-down.</strong>{" "}
        Its very low GWP ({gwp ?? "<1"}) places it below regulatory thresholds. No published
        phase-down milestones exist for this refrigerant — it is a forward-compatible option
        for the current low-GWP transition rather than a refrigerant being phased out.
      </>
    );
  } else {
    category = "pending-documentation";
    reason = (
      <>
        <strong>No phase-down milestones documented for {r.displayName} in this build.</strong>{" "}
        This may mean: (a) no regulatory phase-down currently published; (b) the refrigerant has
        local regulatory schedules not yet transcribed into the site dataset; or (c) it is a
        specialty refrigerant outside the main regulatory frameworks. For authoritative current
        status, consult the EPA AIM Act allocations (40 CFR Part 84), EU F-Gas Regulation
        517/2014 + 2024/573, and the relevant national implementations of the Kigali Amendment.
      </>
    );
  }

  const toneClasses =
    category === "natural" || category === "low-gwp"
      ? "border-emerald-200 bg-emerald-50/40 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-200"
      : "border-zinc-200 bg-zinc-50/60 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-300";

  return (
    <div className={`rounded-md border p-4 text-sm ${toneClasses}`}>
      <div className="flex items-start gap-2">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="space-y-2">
          <p>{reason}</p>
          <div className="text-xs opacity-80">
            <strong>Properties:</strong>{" "}
            {gwp !== null ? `GWP (AR5) ${gwp}` : "GWP not published"} ·{" "}
            {odp !== null ? `ODP ${odp}` : "ODP not published"} ·{" "}
            {aimAct ? "AIM Act affected" : "Not AIM Act-affected"} ·{" "}
            type: {type}
          </div>
        </div>
      </div>
    </div>
  );
}
