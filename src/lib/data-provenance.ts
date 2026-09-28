import { refrigerants } from "@/data/refrigerants";

/**
 * PT saturation-data provenance, counted from the dataset at build time so the
 * "verified data" copy can never claim a source distribution the data doesn't
 * back. Buckets are mutually exclusive and taken from each record's
 * `dataSource`:
 *
 *   - manufacturer datasheet  → dataStatus === "manufacturer-datasheet"
 *   - CoolProp 8.0.0          → engine "CoolProp", engineVersion "8.0.0"
 *   - CoolProp 7.2.0          → ptChartSource names CoolProp 7.2.0
 *
 * r-503 (historical, retired, no PT table) carries no saturation data to
 * attribute and falls into none of the buckets — the counts describe only the
 * fluids that actually ship a chart.
 */
export interface PtProvenance {
  coolprop72: number;
  coolprop80: number;
  datasheet: number;
}

export function ptDataProvenance(): PtProvenance {
  let coolprop72 = 0;
  let coolprop80 = 0;
  let datasheet = 0;
  for (const r of refrigerants) {
    const ds = r.dataSource;
    if (ds.dataStatus === "manufacturer-datasheet") {
      datasheet++;
    } else if (ds.engine === "CoolProp" && ds.engineVersion === "8.0.0") {
      coolprop80++;
    } else if (/CoolProp 7\.2\.0/.test(ds.ptChartSource)) {
      coolprop72++;
    }
  }
  return { coolprop72, coolprop80, datasheet };
}

/**
 * One-line provenance sentence, e.g.
 * "CoolProp 7.2.0 (51 fluids), CoolProp 8.0.0 (6), manufacturer datasheets (2)".
 */
export function ptProvenanceSummary(): string {
  const p = ptDataProvenance();
  return `CoolProp 7.2.0 (${p.coolprop72} fluids), CoolProp 8.0.0 (${p.coolprop80}), manufacturer datasheets (${p.datasheet})`;
}
