/**
 * Per-refrigerant regulatory milestones for the PhaseDownTimeline component.
 *
 * Add new entries here when a refrigerant has well-documented EPA, Montreal
 * Protocol, AIM Act, or other regulatory milestones. Refrigerants without a
 * meaningful timeline (no phase-out activity, no AIM Act impact) are omitted.
 *
 * Every milestone cites a source by ID from data/sources.json.
 */
import type { PhaseDownMilestone } from "@/components/svg/PhaseDownTimeline";

export const PHASE_DOWN_MILESTONES: Record<string, PhaseDownMilestone[]> = {
  "r-22": [
    { date: "2010-01-01", label: "New equipment production banned in US (HCFC phase-out)", severity: "warning", citation: "epa-section-608" },
    { date: "2020-01-01", label: "Virgin R-22 production banned in US", severity: "critical", citation: "epa-section-608" },
  ],
  "r-11": [
    { date: "1996-01-01", label: "US production banned (Montreal Protocol)", severity: "critical", citation: "montreal-protocol" },
  ],
  "r-12": [
    { date: "1996-01-01", label: "US production banned (Montreal Protocol)", severity: "critical", citation: "montreal-protocol" },
  ],
  "r-13": [
    { date: "1996-01-01", label: "US production banned (Montreal Protocol)", severity: "critical", citation: "montreal-protocol" },
  ],
  "r-500": [
    { date: "1996-01-01", label: "US production banned (Montreal Protocol)", severity: "critical", citation: "montreal-protocol" },
  ],
  "r-502": [
    { date: "1996-01-01", label: "US production banned (Montreal Protocol)", severity: "critical", citation: "montreal-protocol" },
  ],
  "r-503": [
    { date: "1996-01-01", label: "US production banned (Montreal Protocol)", severity: "critical", citation: "montreal-protocol" },
  ],
  "r-410a": [
    { date: "2025-01-01", label: "AIM Act: new residential AC equipment transitions to A2L refrigerants (R-32, R-454B)", severity: "warning", citation: "epa-aim-act" },
    { date: "2029-01-01", label: "AIM Act phase-down: 70% reduction baseline", severity: "warning", citation: "epa-aim-act" },
    { date: "2036-01-01", label: "AIM Act phase-down: 85% reduction baseline", severity: "critical", citation: "epa-aim-act" },
  ],
  "r-404a": [
    { date: "2025-01-01", label: "AIM Act: most new commercial refrigeration uses prohibited (GWP > 700)", severity: "critical", citation: "epa-aim-act" },
    { date: "2029-01-01", label: "AIM Act phase-down: 70% reduction baseline", severity: "warning", citation: "epa-aim-act" },
    { date: "2036-01-01", label: "AIM Act phase-down: 85% reduction baseline", severity: "critical", citation: "epa-aim-act" },
  ],
  "r-134a": [
    { date: "2021-01-01", label: "EPA SNAP delisting of R-134a in new mobile AC (per 2015 rule, after MVAC industry transition)", severity: "warning", citation: "epa-snap" },
    { date: "2029-01-01", label: "AIM Act phase-down: 70% reduction baseline", severity: "warning", citation: "epa-aim-act" },
  ],
  "r-507a": [
    { date: "2025-01-01", label: "AIM Act: most new commercial refrigeration uses prohibited", severity: "critical", citation: "epa-aim-act" },
    { date: "2036-01-01", label: "AIM Act phase-down: 85% reduction baseline", severity: "critical", citation: "epa-aim-act" },
  ],
};

export function getMilestonesForSlug(slug: string): PhaseDownMilestone[] {
  return PHASE_DOWN_MILESTONES[slug] ?? [];
}
