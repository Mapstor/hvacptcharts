import { getRefrigerant } from "@/data/refrigerants";
import { PTCurveInteractive } from "@/components/svg/PTCurveInteractive";

export interface RefrigerantPTCurveProps {
  slug: string;
  /** Optional highlight temperature in °F. Defaults to 70°F (the field-tech default). */
  highlightTempF?: number;
  className?: string;
}

export function RefrigerantPTCurve({ slug, highlightTempF = 70, className }: RefrigerantPTCurveProps) {
  const r = getRefrigerant(slug);
  if (!r) {
    return (
      <div className="rounded-md border border-dashed border-zinc-300 p-6 text-sm text-zinc-500 dark:border-zinc-700">
        Refrigerant <code>{slug}</code> not found in the dataset.
      </div>
    );
  }
  if (r.ptChart.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-zinc-300 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
        <p className="font-medium">PT chart pending datasheet transcription</p>
        <p className="mt-1">
          {r.displayName} is a manufacturer blend that CoolProp 7.2.0 does not model. The PT chart is transcribed from
          the named source: <code>{r.dataSource.ptChartSource}</code>.
        </p>
      </div>
    );
  }
  return (
    <PTCurveInteractive
      points={r.ptChart}
      hasGlide={r.physical.hasSignificantGlide}
      highlightTempF={highlightTempF}
      ariaLabel={`Saturation pressure-temperature chart for ${r.displayName}, ${r.ptChart.length} points from ${r.ptChart[0].tempF}°F to ${r.ptChart[r.ptChart.length - 1].tempF}°F`}
      className={className}
    />
  );
}
