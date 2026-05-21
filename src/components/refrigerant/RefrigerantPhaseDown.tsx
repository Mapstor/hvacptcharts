import { getRefrigerant } from "@/data/refrigerants";
import { PhaseDownTimeline } from "@/components/svg/PhaseDownTimeline";
import { getMilestonesForSlug } from "@/data/phase-down-milestones";

export interface RefrigerantPhaseDownProps {
  slug: string;
  /** ISO date to render as "today" — used so SSG output is stable instead of
   *  changing every build. Defaults to the data layer's generation date. */
  asOfDate?: string;
  className?: string;
}

export function RefrigerantPhaseDown({ slug, asOfDate, className }: RefrigerantPhaseDownProps) {
  const r = getRefrigerant(slug);
  if (!r) return null;
  const milestones = getMilestonesForSlug(slug);
  if (milestones.length === 0) return null;

  const stable = asOfDate ?? r.dataSource.ptChartGeneratedAt.slice(0, 10);

  return (
    <PhaseDownTimeline
      refrigerantName={r.displayName}
      milestones={milestones}
      asOfDate={stable}
      ariaLabel={`Regulatory phase-down timeline for ${r.displayName}, ${milestones.length} milestones`}
      className={className}
    />
  );
}
