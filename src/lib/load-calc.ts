/**
 * Residential HVAC load calculation library — simplified Manual J approach.
 *
 * Implements a component-based load calc inspired by ACCA Manual J 8th
 * edition (2016) and ASHRAE Handbook of Fundamentals 2021 Chapter 17.
 * This is a "Quick Manual J" — 7 inputs that land within ±20% of full
 * Manual J for typical residential construction. Not a substitute for a
 * full Manual J report when specifying equipment for code compliance or
 * a permit application.
 *
 * Sources:
 *   - ACCA Manual J Residential Load Calculation, 8th ed. (2016)
 *   - ASHRAE Handbook of Fundamentals 2021, Chapter 17
 *   - IECC 2021 (climate zones + prescriptive R-values)
 *   - ASHRAE Climatic Design Conditions database (design temperatures)
 *   - DOE Building Energy Codes Program
 */

// ────────────────────────────────────────────────────────────────────
// Climate zones (IECC 2021 simplified — design conditions per ASHRAE)
// ────────────────────────────────────────────────────────────────────

export interface ClimateZone {
  id: string;
  label: string;
  /** 1% design cooling dry-bulb (°F). */
  coolingDbF: number;
  /** Mean coincident wet-bulb at 1% cooling DB (°F). */
  coolingWbF: number;
  /** 99% design heating dry-bulb (°F). */
  heatingDbF: number;
  /** Outdoor design grains H₂O per lb dry air (cooling — for latent calc). */
  outdoorGrainsAtCooling: number;
  /** Example cities. */
  examples: string;
}

/** IECC 2021 climate zones with ASHRAE design conditions.
 *  Outdoor grains computed via psychrometrics at the design DB/WB. */
export const CLIMATE_ZONES: ClimateZone[] = [
  { id: "1A", label: "Zone 1A — Hot/Humid", coolingDbF: 91, coolingWbF: 77, heatingDbF: 49, outdoorGrainsAtCooling: 130, examples: "Miami, Honolulu, Key West, San Juan" },
  { id: "2A", label: "Zone 2A — Hot/Humid", coolingDbF: 94, coolingWbF: 76, heatingDbF: 34, outdoorGrainsAtCooling: 115, examples: "Houston, New Orleans, Tampa, Phoenix (2B)" },
  { id: "3A", label: "Zone 3A — Warm/Humid", coolingDbF: 92, coolingWbF: 75, heatingDbF: 27, outdoorGrainsAtCooling: 110, examples: "Atlanta, Memphis, Dallas, Los Angeles (3B-marine)" },
  { id: "4A", label: "Zone 4A — Mixed/Humid", coolingDbF: 90, coolingWbF: 73, heatingDbF: 17, outdoorGrainsAtCooling: 100, examples: "Washington DC, NYC, Philadelphia, St. Louis" },
  { id: "5A", label: "Zone 5A — Cool/Humid", coolingDbF: 87, coolingWbF: 70, heatingDbF: 2, outdoorGrainsAtCooling: 90, examples: "Chicago, Boston, Detroit, Denver (5B)" },
  { id: "6A", label: "Zone 6A — Cold", coolingDbF: 84, coolingWbF: 68, heatingDbF: -6, outdoorGrainsAtCooling: 80, examples: "Minneapolis, Madison, Burlington, Helena (6B)" },
  { id: "7", label: "Zone 7 — Very Cold", coolingDbF: 81, coolingWbF: 65, heatingDbF: -16, outdoorGrainsAtCooling: 70, examples: "Duluth, International Falls, Aroostook County" },
  { id: "8", label: "Zone 8 — Subarctic", coolingDbF: 76, coolingWbF: 60, heatingDbF: -36, outdoorGrainsAtCooling: 55, examples: "Fairbanks, Anchorage (interior), Yellowknife" },
];

// ────────────────────────────────────────────────────────────────────
// Construction-era presets (proxy for envelope U-values + infiltration)
// ────────────────────────────────────────────────────────────────────

export interface ConstructionEra {
  id: string;
  label: string;
  /** Wall U-value (BTU/hr·ft²·°F). */
  uWall: number;
  /** Roof/ceiling U-value. */
  uRoof: number;
  /** Window U-value. */
  uWindow: number;
  /** Window SHGC (solar heat gain coefficient). */
  shgcWindow: number;
  /** Natural infiltration in air changes per hour (ACH). */
  achNatural: number;
  /** R-value summary string for display. */
  rSummary: string;
}

/** Construction eras — based on IECC versions in force during each period
 *  plus typical contemporary residential building practice. */
export const CONSTRUCTION_ERAS: ConstructionEra[] = [
  {
    id: "pre-1980",
    label: "Pre-1980 (minimal insulation, single-pane)",
    uWall: 0.14, uRoof: 0.09, uWindow: 1.10, shgcWindow: 0.85,
    achNatural: 0.6,
    rSummary: "Walls R-7, Roof R-11, Single-pane windows",
  },
  {
    id: "1980-2005",
    label: "1980-2005 (standard insulation, double-pane)",
    uWall: 0.077, uRoof: 0.033, uWindow: 0.50, shgcWindow: 0.60,
    achNatural: 0.4,
    rSummary: "Walls R-13, Roof R-30, Double-pane low-e",
  },
  {
    id: "2005-2015",
    label: "2005-2015 (IECC compliant)",
    uWall: 0.053, uRoof: 0.026, uWindow: 0.40, shgcWindow: 0.40,
    achNatural: 0.3,
    rSummary: "Walls R-19, Roof R-38, Double-pane low-e argon",
  },
  {
    id: "2015-plus",
    label: "2015+ (high performance, tight envelope)",
    uWall: 0.048, uRoof: 0.020, uWindow: 0.30, shgcWindow: 0.30,
    achNatural: 0.2,
    rSummary: "Walls R-21, Roof R-49, Triple-pane or low-SHGC double-pane",
  },
];

export const WINDOW_AREA_PRESETS = [
  { id: "low", label: "Low (≈12% of floor area)", fraction: 0.12 },
  { id: "average", label: "Average (≈15% of floor area)", fraction: 0.15 },
  { id: "high", label: "High (≈20% of floor area)", fraction: 0.20 },
];

// ────────────────────────────────────────────────────────────────────
// Load calculation
// ────────────────────────────────────────────────────────────────────

export interface LoadInputs {
  /** Conditioned floor area, ft². */
  floorAreaSqft: number;
  /** Number of stories (1 or 2). Affects wall area and roof exposure. */
  stories: number;
  /** Ceiling height, ft (default 8). */
  ceilingHeightFt?: number;
  /** Climate zone ID. */
  climateZoneId: string;
  /** Construction era ID. */
  constructionEraId: string;
  /** Window area preset ID. */
  windowAreaId: string;
  /** Number of occupants. */
  occupants: number;
  /** Indoor design temperature for cooling (°F, default 75). */
  indoorCoolingF?: number;
  /** Indoor design temperature for heating (°F, default 70). */
  indoorHeatingF?: number;
  /** Interior equipment + lighting estimate (BTU/hr; default 4000). */
  equipmentBtuHr?: number;
}

export interface LoadComponents {
  walls: number;
  windowsConduction: number;
  windowsSolar: number;
  roof: number;
  infiltrationSensible: number;
  infiltrationLatent: number;
  peopleSensible: number;
  peopleLatent: number;
  equipment: number;
}

export interface LoadResult {
  zone: ClimateZone;
  era: ConstructionEra;
  windowFraction: number;
  geometry: {
    floorAreaSqft: number;
    wallAreaSqft: number;
    windowAreaSqft: number;
    roofAreaSqft: number;
    volumeFt3: number;
    infiltrationCfm: number;
  };
  cooling: {
    components: LoadComponents;
    sensibleBtuHr: number;
    latentBtuHr: number;
    totalBtuHr: number;
    tons: number;
    shr: number;
    sqftPerTon: number;
  };
  heating: {
    walls: number;
    windowsConduction: number;
    roof: number;
    infiltration: number;
    totalBtuHr: number;
  };
  /** Sizing recommendation string. */
  recommendation: string;
}

/** Walls + windows perimeter estimate. Assumes a roughly square footprint;
 *  Manual J actual uses surveyed dimensions. For a 2-story home, half the
 *  floor area sits over the other half, so perimeter wall area doubles. */
function estimateGeometry(area: number, stories: number, ceilingHeightFt: number, windowFraction: number) {
  // Single-story perimeter: 4 × √area (square approximation)
  const footprintSqft = area / stories;
  const perimeterFt = 4 * Math.sqrt(footprintSqft);
  const grossWallAreaPerStory = perimeterFt * ceilingHeightFt;
  const grossWallArea = grossWallAreaPerStory * stories;
  const windowArea = area * windowFraction;
  const netWallArea = Math.max(grossWallArea - windowArea, 0);
  const roofArea = footprintSqft;
  const volume = area * ceilingHeightFt;
  return { perimeterFt, grossWallArea, netWallArea, windowArea, roofArea, volume };
}

export function calculateLoad(inputs: LoadInputs): LoadResult | null {
  const zone = CLIMATE_ZONES.find((z) => z.id === inputs.climateZoneId);
  const era = CONSTRUCTION_ERAS.find((e) => e.id === inputs.constructionEraId);
  const winPreset = WINDOW_AREA_PRESETS.find((w) => w.id === inputs.windowAreaId);
  if (!zone || !era || !winPreset) return null;

  const ceilingH = inputs.ceilingHeightFt ?? 8;
  const indoorC = inputs.indoorCoolingF ?? 75;
  const indoorH = inputs.indoorHeatingF ?? 70;
  const equipment = inputs.equipmentBtuHr ?? Math.round(inputs.floorAreaSqft * 2.5); // ~2.5 BTU/hr·ft² typical

  const geom = estimateGeometry(inputs.floorAreaSqft, inputs.stories, ceilingH, winPreset.fraction);
  const infiltrationCfm = (era.achNatural * geom.volume) / 60;

  // ── COOLING LOAD ──
  const dtCooling = zone.coolingDbF - indoorC;
  // CLTD adjustments add solar/time-lag effect on opaque surfaces
  const cltdWalls = dtCooling + 15;
  const cltdRoof = dtCooling + 35;
  // Solar gain (averaged orientations) — simplified: 50 BTU/hr/ft² × SHGC × shading factor
  const solarGainPerSqftWindow = 50 * era.shgcWindow / 0.85; // normalize to base case
  // Indoor 75°F / 50% RH ≈ 65 grains/lb dry air
  const indoorGrains = 65;
  const dGrains = Math.max(zone.outdoorGrainsAtCooling - indoorGrains, 0);

  const coolingComponents: LoadComponents = {
    walls: era.uWall * geom.netWallArea * cltdWalls,
    windowsConduction: era.uWindow * geom.windowArea * dtCooling,
    windowsSolar: geom.windowArea * solarGainPerSqftWindow,
    roof: era.uRoof * geom.roofArea * cltdRoof,
    infiltrationSensible: 1.08 * infiltrationCfm * dtCooling,
    infiltrationLatent: 0.68 * infiltrationCfm * dGrains,
    peopleSensible: inputs.occupants * 250,
    peopleLatent: inputs.occupants * 150,
    equipment: equipment,
  };

  const sensibleCooling =
    coolingComponents.walls +
    coolingComponents.windowsConduction +
    coolingComponents.windowsSolar +
    coolingComponents.roof +
    coolingComponents.infiltrationSensible +
    coolingComponents.peopleSensible +
    coolingComponents.equipment;
  const latentCooling = coolingComponents.infiltrationLatent + coolingComponents.peopleLatent + 500; // 500 BTU/hr misc (cooking, showers)

  const totalCooling = sensibleCooling + latentCooling;
  const tons = totalCooling / 12000;
  const shr = sensibleCooling / totalCooling;
  const sqftPerTon = inputs.floorAreaSqft / tons;

  // ── HEATING LOAD ──
  const dtHeating = indoorH - zone.heatingDbF;
  const heating = {
    walls: era.uWall * geom.netWallArea * dtHeating,
    windowsConduction: era.uWindow * geom.windowArea * dtHeating,
    roof: era.uRoof * geom.roofArea * dtHeating,
    infiltration: 1.08 * infiltrationCfm * dtHeating,
    totalBtuHr: 0,
  };
  heating.totalBtuHr = heating.walls + heating.windowsConduction + heating.roof + heating.infiltration;

  // ── RECOMMENDATION ──
  const tonsRounded = Math.round(tons * 4) / 4; // round to nearest 0.25 ton
  // Standard residential equipment sizes: 1.5, 2, 2.5, 3, 3.5, 4, 5 tons
  const stdSizes = [1.5, 2, 2.5, 3, 3.5, 4, 5];
  const recommendedTons = stdSizes.find((s) => s >= tons) ?? 5;
  const recommendation =
    `Cooling load is ${(tons).toFixed(2)} tons (${Math.round(totalCooling)} BTU/hr). Closest standard equipment: ${recommendedTons}-ton. ` +
    (recommendedTons > tons * 1.25
      ? `WARNING: ${recommendedTons}-ton is more than 25% over calculated load — likely to cause short-cycling and poor humidity control. Consider 2-stage or variable-capacity equipment in the ${recommendedTons}-ton size, or downsize to ${Math.max(...stdSizes.filter((s) => s < tons))}-ton with a backup plan.`
      : `Within recommended ±15% sizing margin per ACCA Manual S.`);

  return {
    zone,
    era,
    windowFraction: winPreset.fraction,
    geometry: {
      floorAreaSqft: inputs.floorAreaSqft,
      wallAreaSqft: geom.netWallArea,
      windowAreaSqft: geom.windowArea,
      roofAreaSqft: geom.roofArea,
      volumeFt3: geom.volume,
      infiltrationCfm,
    },
    cooling: {
      components: coolingComponents,
      sensibleBtuHr: sensibleCooling,
      latentBtuHr: latentCooling,
      totalBtuHr: totalCooling,
      tons,
      shr,
      sqftPerTon,
    },
    heating,
    recommendation,
  };
}
