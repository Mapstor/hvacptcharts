import type { PTTableRow, PrimaryDatasheet } from "@/data/refrigerants";

export interface PTDatasheetTableProps {
  displayName: string;
  rows: PTTableRow[];
  primaryDatasheet?: PrimaryDatasheet;
}

/**
 * Renders a pressure-indexed PT table transcribed at datasheet-native
 * resolution (irregular pressure steps). Used for fluids whose PT data
 * comes from a manufacturer datasheet — R-448A (Honeywell Solstice N40)
 * and R-438A (Chemours Freon MO99) as of Wave 1.6b — rather than from
 * CoolProp's 1°F-step chart.
 *
 * The sourcing footnote is required: unlike the CoolProp-generated tables,
 * every row here is a direct reproduction of a published datasheet cell.
 * Do not interpolate rows or add synthetic intermediate points to storage.
 */
export function PTDatasheetTable({ displayName, rows, primaryDatasheet }: PTDatasheetTableProps) {
  const sorted = [...rows].sort((a, b) => a.psig - b.psig);
  const range = sorted.length > 0
    ? `${sorted[0].psig} to ${sorted[sorted.length - 1].psig} psig`
    : "empty";
  return (
    <div>
      <div className="mb-3 rounded-md border border-emerald-200 bg-emerald-50/50 p-3 text-sm dark:border-emerald-900/40 dark:bg-emerald-950/20">
        <p className="text-emerald-900 dark:text-emerald-100">
          <strong>Reproduced at datasheet resolution</strong> from the
          {primaryDatasheet ? (
            <>
              {" "}published {primaryDatasheet.manufacturer}{primaryDatasheet.tradeName ? ` ${primaryDatasheet.tradeName}` : ""} table
              {primaryDatasheet.url ? (
                <>
                  {" "}
                  (<a href={primaryDatasheet.url} target="_blank" rel="noopener noreferrer" className="underline">datasheet</a>).
                </>
              ) : "."}
            </>
          ) : (
            <> manufacturer&apos;s published PT chart.</>
          )}{" "}
          Native pressure-indexed rows with irregular steps preserved — no interpolation to 1°F intervals in storage.
        </p>
      </div>
      <div className="overflow-x-auto rounded-md border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm font-mono tabular-nums">
          <thead className="bg-zinc-50 dark:bg-zinc-900">
            <tr>
              <th className="px-3 py-2 text-right text-[10px] uppercase tracking-wider text-zinc-500">Pressure (psig)</th>
              <th className="px-3 py-2 text-right text-[10px] uppercase tracking-wider text-zinc-500">Bubble °F (saturated liquid)</th>
              <th className="px-3 py-2 text-right text-[10px] uppercase tracking-wider text-zinc-500">Dew °F (saturated vapor)</th>
              <th className="px-3 py-2 text-right text-[10px] uppercase tracking-wider text-zinc-500">Glide °F</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr key={row.psig} className="border-t border-zinc-100 dark:border-zinc-900">
                <td className="px-3 py-1.5 text-right">{row.psig.toFixed(1)}</td>
                <td className="px-3 py-1.5 text-right">{row.bubbleF.toFixed(1)}</td>
                <td className="px-3 py-1.5 text-right">{row.dewF.toFixed(1)}</td>
                <td className="px-3 py-1.5 text-right text-zinc-500">{Math.abs(row.dewF - row.bubbleF).toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
        {displayName} — {sorted.length} rows, {range}. Bubble = saturated liquid (use for subcooling); dew = saturated vapor (use for superheat on zeotropic blends). Runtime lookups for values between rows use linear interpolation and are marked as interpolated in the calculators.
      </p>
    </div>
  );
}
