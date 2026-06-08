/**
 * Application-based comparison groups for GWP bar charts and the comparison tool.
 *
 * These are editorial groupings: "what refrigerants does a buyer or installer
 * realistically compare against each other?". They are intentionally NOT a field
 * on the core refrigerant record (which is for thermodynamic + regulatory data
 * only). Groupings are display logic.
 *
 * A refrigerant can belong to multiple groups (the listed order is the
 * preferred "primary" group for that refrigerant — used by per-refrigerant
 * pages when rendering "alternatives at a glance").
 */

export type GroupId =
  | "residential-ac"
  | "commercial-refrigeration-medium-temp"
  | "commercial-refrigeration-low-temp"
  | "centrifugal-chillers-low-pressure"
  | "centrifugal-chillers-medium-pressure"
  | "mobile-ac"
  | "industrial-refrigeration"
  | "domestic-refrigeration"
  | "r-22-retrofits";

export interface GroupInfo {
  label: string;
  /** Slugs of refrigerants in this group, in a defensible display order. */
  members: string[];
}

export const GROUP_INFO: Record<GroupId, GroupInfo> = {
  "residential-ac": {
    label: "Residential air conditioning",
    members: ["r-22", "r-410a", "r-407c", "r-32", "r-452b", "r-454b"],
  },
  "commercial-refrigeration-medium-temp": {
    label: "Commercial refrigeration — medium temperature",
    members: ["r-22", "r-404a", "r-407a", "r-407c", "r-407f", "r-448a", "r-449a", "r-450a", "r-513a", "r-454c", "r-455a", "r-516a", "r-744"],
  },
  "commercial-refrigeration-low-temp": {
    label: "Commercial refrigeration — low temperature",
    members: ["r-22", "r-404a", "r-507a", "r-448a", "r-449a", "r-454c", "r-455a", "r-744"],
  },
  "centrifugal-chillers-low-pressure": {
    label: "Low-pressure centrifugal chillers",
    members: ["r-11", "r-123", "r-1233zd-e", "r-1224yd-z", "r-514a", "r-1336mzz-z"],
  },
  "centrifugal-chillers-medium-pressure": {
    label: "Medium-pressure centrifugal & screw chillers",
    members: ["r-134a", "r-1234ze", "r-1234ze-e", "r-450a", "r-513a", "r-515a", "r-515b"],
  },
  "mobile-ac": {
    label: "Mobile air conditioning",
    members: ["r-12", "r-134a", "r-1234yf"],
  },
  "industrial-refrigeration": {
    label: "Industrial refrigeration & cascade systems",
    members: ["r-717", "r-744", "r-290", "r-1270", "r-1150", "r-13"],
  },
  "domestic-refrigeration": {
    label: "Household refrigeration",
    members: ["r-12", "r-134a", "r-600a", "r-290"],
  },
  "r-22-retrofits": {
    label: "R-22 retrofit blends",
    members: ["r-22", "r-407c", "r-417a", "r-421a", "r-422a", "r-422b", "r-422d", "r-427a", "r-438a"],
  },
};

/**
 * Per-refrigerant primary group(s). Listed in order of relevance for that
 * refrigerant; first entry is the "default" comparison set the refrigerant
 * detail page shows.
 */
export const PRIMARY_GROUPS: Record<string, GroupId[]> = {
  "r-22": ["residential-ac", "r-22-retrofits"],
  "r-410a": ["residential-ac"],
  "r-32": ["residential-ac"],
  "r-407c": ["residential-ac", "r-22-retrofits"],
  "r-452b": ["residential-ac"],
  "r-454b": ["residential-ac"],
  "r-404a": ["commercial-refrigeration-low-temp"],
  "r-407a": ["commercial-refrigeration-medium-temp"],
  "r-407f": ["commercial-refrigeration-medium-temp"],
  "r-417a": ["r-22-retrofits"],
  "r-421a": ["r-22-retrofits"],
  "r-422a": ["r-22-retrofits"],
  "r-422b": ["r-22-retrofits"],
  "r-422d": ["r-22-retrofits"],
  "r-427a": ["r-22-retrofits"],
  "r-438a": ["r-22-retrofits"],
  "r-448a": ["commercial-refrigeration-medium-temp"],
  "r-449a": ["commercial-refrigeration-medium-temp"],
  "r-450a": ["commercial-refrigeration-medium-temp", "centrifugal-chillers-medium-pressure"],
  "r-452a": ["commercial-refrigeration-medium-temp"],
  "r-454c": ["commercial-refrigeration-medium-temp"],
  "r-455a": ["commercial-refrigeration-medium-temp"],
  "r-457a": ["commercial-refrigeration-medium-temp"],
  "r-507a": ["commercial-refrigeration-low-temp"],
  "r-513a": ["commercial-refrigeration-medium-temp", "centrifugal-chillers-medium-pressure"],
  "r-516a": ["commercial-refrigeration-medium-temp"],
  "r-11": ["centrifugal-chillers-low-pressure"],
  "r-123": ["centrifugal-chillers-low-pressure"],
  "r-1233zd-e": ["centrifugal-chillers-low-pressure"],
  "r-1224yd-z": ["centrifugal-chillers-low-pressure"],
  "r-514a": ["centrifugal-chillers-low-pressure"],
  "r-1336mzz-z": ["centrifugal-chillers-low-pressure"],
  "r-134a": ["centrifugal-chillers-medium-pressure", "mobile-ac"],
  "r-1234yf": ["mobile-ac"],
  "r-1234ze": ["centrifugal-chillers-medium-pressure"],
  "r-1234ze-e": ["centrifugal-chillers-medium-pressure"],
  "r-515a": ["centrifugal-chillers-medium-pressure"],
  "r-515b": ["centrifugal-chillers-medium-pressure"],
  "r-12": ["mobile-ac", "domestic-refrigeration"],
  "r-600a": ["domestic-refrigeration"],
  "r-290": ["domestic-refrigeration", "industrial-refrigeration"],
  "r-717": ["industrial-refrigeration"],
  "r-744": ["industrial-refrigeration", "commercial-refrigeration-low-temp"],
  "r-1150": ["industrial-refrigeration"],
  "r-1270": ["industrial-refrigeration"],
  "r-13": ["industrial-refrigeration"],
};

/** Find the primary group for a refrigerant (the first entry). */
export function getPrimaryGroupForSlug(slug: string): GroupId | null {
  const groups = PRIMARY_GROUPS[slug];
  return groups?.[0] ?? null;
}

/** Regulatory thresholds to render as reference lines on GWP charts. */
export const REGULATORY_THRESHOLDS: Array<{ value: number; label: string; source: string }> = [
  { value: 150, label: "EU F-Gas", source: "EU Regulation 517/2014 Annex III (stationary refrigeration)" },
  { value: 700, label: "EPA AIM Act", source: "US EPA AIM Act Subsection (i) (new residential AC, 2025+)" },
];
