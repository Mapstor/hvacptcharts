import { getRefrigerant, gwpNum } from "@/data/refrigerants";
import { GROUP_INFO, getPrimaryGroupForSlug, type GroupId } from "@/data/comparison-groups";
import { GWPComparisonBar, type GWPBar } from "@/components/svg/GWPComparisonBar";

export interface RefrigerantGWPComparisonProps {
  /** Slug of the refrigerant being viewed — its bar is highlighted. */
  currentSlug?: string;
  /** Explicit group; overrides currentSlug's primary group lookup. */
  groupId?: GroupId;
  /**
   * Optional regulatory reference lines. Default is none: GWP limits differ by
   * equipment type and the US limits were revised in 2026, so a single "700" or
   * "150" line on the chart would misrepresent the rule (task 7).
   */
  referenceLines?: Array<{ value: number; label: string }>;
  className?: string;
}

export function RefrigerantGWPComparison({
  currentSlug,
  groupId,
  referenceLines = [],
  className,
}: RefrigerantGWPComparisonProps) {
  const resolvedGroup = groupId ?? (currentSlug ? getPrimaryGroupForSlug(currentSlug) : null);
  if (!resolvedGroup) {
    // No peer-comparison group for this fluid — render nothing rather than an
    // empty-state notice (the absolute GWP is shown elsewhere on the page).
    return null;
  }

  const group = GROUP_INFO[resolvedGroup];
  const bars: GWPBar[] = [];
  for (const slug of group.members) {
    const r = getRefrigerant(slug);
    const gwp = r ? gwpNum(r.environmental.gwp.headline) : null;
    if (!r || gwp === null) continue;
    bars.push({
      name: r.displayName,
      gwp,
      safetyClass: r.safetyClass,
      isCurrent: slug === currentSlug,
    });
  }

  return (
    <div className={className}>
      <p className="mb-2 text-xs uppercase tracking-wide text-zinc-500">{group.label}</p>
      <GWPComparisonBar
        bars={bars}
        referenceLines={referenceLines}
        ariaLabel={`Global Warming Potential comparison for ${group.label}, 100-year values on the US EPA basis, ${bars.length} refrigerants${currentSlug ? `, current selection ${currentSlug}` : ""}`}
      />
    </div>
  );
}
