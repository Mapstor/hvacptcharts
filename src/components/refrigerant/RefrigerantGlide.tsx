import { getRefrigerant, getPressureAtTempF } from "@/data/refrigerants";
import { GlideVisualization } from "@/components/svg/GlideVisualization";

export interface RefrigerantGlideProps {
  slug: string;
  /** Saturation temperature at which to evaluate the glide. Defaults to 40°F
   *  (typical residential evaporator). The glide is computed from the chart's
   *  bubble and dew pressures at this point. */
  atTempF?: number;
  className?: string;
}

/**
 * Renders the glide visualization for refrigerants where it matters. Returns
 * null for pures and near-azeotropes, since the chart and text would be
 * misleading at sub-1°F differences.
 */
export function RefrigerantGlide({ slug, atTempF = 40, className }: RefrigerantGlideProps) {
  const r = getRefrigerant(slug);
  if (!r || !r.physical.hasSignificantGlide || r.ptChart.length === 0) return null;

  // Compute the actual bubble/dew temperatures at a fixed pressure.
  // We pick a representative pressure: the bubble pressure at atTempF.
  const ref = getPressureAtTempF(slug, atTempF);
  if (!ref) return null;

  // The bubble temp at this pressure is atTempF (by construction). The dew
  // temp at the same pressure is what we need from inverse-lookup on the dew
  // column. Simplest: scan ptChart for the row whose dewPsig matches ref.bubble.
  const sortedByDew = [...r.ptChart].sort((a, b) => a.dewPsig - b.dewPsig);
  let dewTempAtBubblePressure: number | null = null;
  for (let i = 0; i < sortedByDew.length - 1; i++) {
    const a = sortedByDew[i];
    const b = sortedByDew[i + 1];
    if (a.dewPsig <= ref.bubble && ref.bubble <= b.dewPsig) {
      const t = b.dewPsig === a.dewPsig ? 0 : (ref.bubble - a.dewPsig) / (b.dewPsig - a.dewPsig);
      dewTempAtBubblePressure = a.tempF + t * (b.tempF - a.tempF);
      break;
    }
  }
  if (dewTempAtBubblePressure === null) return null;

  return (
    <GlideVisualization
      refrigerantName={r.displayName}
      pressurePsig={ref.bubble}
      bubbleTempF={atTempF}
      dewTempF={dewTempAtBubblePressure}
      ariaLabel={`Temperature glide visualization for ${r.displayName} showing the bubble-to-dew temperature spread across an evaporator at constant pressure`}
      className={className}
    />
  );
}
