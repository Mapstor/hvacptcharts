import { Info } from "lucide-react";
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
    const r = currentSlug ? getRefrigerant(currentSlug) : null;
    const gwp = r?.environmental.gwp100Ar5;
    return (
      <div className="rounded-md border border-zinc-200 bg-zinc-50/60 p-4 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-300">
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
          <div className="space-y-2">
            <p>
              <strong>No peer-comparison group is defined for {r?.displayName ?? "this refrigerant"}.</strong>{" "}
              {gwp !== null && gwp !== undefined ? (
                <>
                  Its 100-year GWP per IPCC AR5 is <strong>{gwp}</strong>
                  {gwp < 150
                    ? " — below both the EU F-Gas 150 GWP cap and the EPA AIM Act 700 GWP cap."
                    : gwp < 700
                      ? " — between the EU F-Gas 150 cap and the EPA AIM Act 700 cap (AIM Act-compliant but not EU F-Gas-compliant for new stationary refrigeration in most categories)."
                      : ` — above the EPA AIM Act 700 GWP cap${gwp > 1500 ? " and well above the EU F-Gas 150 cap" : ""}.`}
                </>
              ) : (
                <>The refrigerant&apos;s GWP is not published in this dataset.</>
              )}
            </p>
            <p className="text-xs opacity-80">
              Peer-comparison groups are defined for refrigerants that compete in the same
              application sector (residential AC, commercial MT/LT, chillers, mobile AC).
              Specialty or research-grade refrigerants without a clear peer set don&apos;t
              appear in any group; their GWP is shown above in absolute terms instead.
            </p>
          </div>
        </div>
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
