import { getRefrigerant } from "@/data/refrigerants";
import { GROUP_INFO, REGULATORY_THRESHOLDS, getPrimaryGroupForSlug, type GroupId } from "@/data/comparison-groups";
import { GWPComparisonBar, type GWPBar } from "@/components/svg/GWPComparisonBar";

export interface RefrigerantGWPComparisonProps {
  /** Slug of the refrigerant being viewed — its bar is highlighted. */
  currentSlug?: string;
  /** Explicit group; overrides currentSlug's primary group lookup. */
  groupId?: GroupId;
  /** Optional override for which regulatory reference lines to show. */
  referenceLines?: Array<{ value: number; label: string }>;
  className?: string;
}

export function RefrigerantGWPComparison({
  currentSlug,
  groupId,
  referenceLines = REGULATORY_THRESHOLDS,
  className,
}: RefrigerantGWPComparisonProps) {
  const resolvedGroup = groupId ?? (currentSlug ? getPrimaryGroupForSlug(currentSlug) : null);
  if (!resolvedGroup) {
    return (
      <div className="rounded-md border border-dashed border-zinc-300 p-4 text-sm text-zinc-500 dark:border-zinc-700">
        No comparison group defined for <code>{currentSlug ?? "(no slug)"}</code>.
      </div>
    );
  }

  const group = GROUP_INFO[resolvedGroup];
  const bars: GWPBar[] = [];
  for (const slug of group.members) {
    const r = getRefrigerant(slug);
    if (!r || r.environmental.gwp100Ar5 === null) continue;
    bars.push({
      name: r.displayName,
      gwp: r.environmental.gwp100Ar5,
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
        ariaLabel={`Global Warming Potential comparison for ${group.label}, IPCC AR5 100-year values, ${bars.length} refrigerants${currentSlug ? `, current selection ${currentSlug}` : ""}`}
      />
    </div>
  );
}
