"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { refrigerants, gwpNum, gwpText, type Refrigerant, type SafetyClass, type RefrigerantType } from "@/data/refrigerants";
import { basisLabel } from "@/lib/gwp";
import { regulatoryClass } from "@/lib/us-regulation";
import { SafetyClassChip } from "@/components/svg/SafetyClassChip";
import { typeLabel } from "@/components/refrigerant/TypeChip";

// A CFC/HCFC-containing blend's headline is a mass-weighted AR4 figure that
// includes the CFC/HCFC constituents; the "US EPA value" (84.64(b)) basis does
// not apply to it because 84.64(c) excludes those constituents for US thresholds.
function basisForRow(r: Refrigerant): string {
  if (r.type === "cfc-blend" || r.type === "hcfc-blend") {
    return "IPCC AR4, mass-weighted (incl. CFC/HCFC constituents)";
  }
  return basisLabel(r.environmental.gwp.headline.source);
}

type SortKey = "displayName" | "gwpHeadline" | "odp" | "safetyClass" | "type";
type SortDir = "asc" | "desc";

const TYPE_OPTIONS: Array<{ id: RefrigerantType | "all"; label: string }> = [
  { id: "all", label: "All types" },
  { id: "hfc-pure", label: "HFC pure" },
  { id: "hfc-blend", label: "HFC blend" },
  { id: "hfo-pure", label: "HFO pure" },
  { id: "hfo-blend", label: "HFO blend" },
  { id: "hcfo", label: "HCFO" },
  { id: "pfc", label: "PFC" },
  { id: "hcfc", label: "HCFC" },
  { id: "cfc", label: "CFC" },
  { id: "hc", label: "Hydrocarbon" },
  { id: "natural", label: "Natural" },
];

const GWP_BUCKETS: Array<{ id: string; label: string; min: number; max: number }> = [
  { id: "all", label: "All", min: -1, max: Infinity },
  { id: "u150", label: "GWP < 150", min: -1, max: 150 },
  { id: "u700", label: "GWP < 700", min: -1, max: 700 },
  { id: "150-2000", label: "150–2000", min: 150, max: 2000 },
  { id: "2000+", label: "> 2000", min: 2000, max: Infinity },
];

const SAFETY_ORDER: Record<SafetyClass, number> = { A1: 1, A2L: 2, A2: 3, A3: 4, B1: 5, B2L: 6, B2: 7, B3: 8 };

const FILTER_BTN = "rounded-full border px-3 py-1 text-xs font-medium transition-colors";
const FILTER_BTN_ACTIVE = "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900";
const FILTER_BTN_IDLE = "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800";

export function GwpTable() {
  const [typeFilter, setTypeFilter] = useState<RefrigerantType | "all">("all");
  const [bucketFilter, setBucketFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("gwpHeadline");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const filteredSorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    const bucket = GWP_BUCKETS.find((b) => b.id === bucketFilter) ?? GWP_BUCKETS[0];
    const filtered = refrigerants.filter((r) => {
      if (typeFilter !== "all" && r.type !== typeFilter) return false;
      const gwp = gwpNum(r.environmental.gwp.headline);
      if (bucket.id !== "all") {
        if (gwp === null) return false;
        if (gwp < bucket.min || gwp > bucket.max) return false;
      }
      if (q) {
        const hay = `${r.displayName} ${r.altSpellings.join(" ")} ${r.tradeNames.map((t) => t.name).join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    return filtered.sort(compareRows(sortKey, sortDir));
  }, [typeFilter, bucketFilter, query, sortKey, sortDir]);

  const toggleSort = (k: SortKey) => {
    if (k === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(k);
      setSortDir(k === "displayName" || k === "safetyClass" || k === "type" ? "asc" : "asc");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search refrigerants…"
          className="flex-1 min-w-[200px] rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          aria-label="Search refrigerants"
        />
        <span className="text-xs text-zinc-500">{filteredSorted.length} of {refrigerants.length}</span>
      </div>

      <fieldset className="space-y-2">
        <legend className="sr-only">Type filter</legend>
        <div className="flex flex-wrap gap-2">
          {TYPE_OPTIONS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTypeFilter(t.id)}
              aria-pressed={typeFilter === t.id}
              className={`${FILTER_BTN} ${typeFilter === t.id ? FILTER_BTN_ACTIVE : FILTER_BTN_IDLE}`}
            >{t.label}</button>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="sr-only">GWP bucket</legend>
        <div className="flex flex-wrap gap-2">
          {GWP_BUCKETS.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setBucketFilter(b.id)}
              aria-pressed={bucketFilter === b.id}
              className={`${FILTER_BTN} ${bucketFilter === b.id ? FILTER_BTN_ACTIVE : FILTER_BTN_IDLE}`}
            >{b.label}</button>
          ))}
        </div>
      </fieldset>

      <div className="overflow-x-auto rounded-md border border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900">
            <tr>
              <Th label="Refrigerant" k="displayName" sortKey={sortKey} sortDir={sortDir} toggleSort={toggleSort} />
              <Th label="Type" k="type" sortKey={sortKey} sortDir={sortDir} toggleSort={toggleSort} />
              <Th label="Class" k="safetyClass" sortKey={sortKey} sortDir={sortDir} toggleSort={toggleSort} />
              <Th label="ODP" k="odp" sortKey={sortKey} sortDir={sortDir} toggleSort={toggleSort} align="right" />
              <Th label="GWP (100-yr, US EPA basis)" k="gwpHeadline" sortKey={sortKey} sortDir={sortDir} toggleSort={toggleSort} align="right" />
              <th className="px-3 py-2 font-medium text-right">AR4</th>
              <th className="px-3 py-2 font-medium text-right">AR5</th>
              <th className="px-3 py-2 font-medium text-right">AR6</th>
              <th className="px-3 py-2 font-medium text-left">Basis</th>
              <th className="px-3 py-2 font-medium text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredSorted.map((r) => (
              <tr key={r.slug} className={`border-t border-zinc-100 hover:bg-zinc-50/50 dark:border-zinc-800 dark:hover:bg-zinc-900/50 ${rowTone(r)}`}>
                <td className="px-3 py-2">
                  <Link href={`/refrigerant/${r.slug}/`} className="font-medium text-blue-700 hover:underline dark:text-blue-300">
                    {r.displayName}
                  </Link>
                </td>
                <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400 text-xs">{typeLabel(r.type)}</td>
                <td className="px-3 py-2"><SafetyClassChip safetyClass={r.safetyClass} size="sm" /></td>
                <td className="px-3 py-2 text-right font-mono">{r.environmental.odp === null ? "—" : r.environmental.odp}</td>
                <td className="px-3 py-2 text-right font-mono font-semibold">
                  {gwpText(r.environmental.gwp.headline)}
                </td>
                <td className="px-3 py-2 text-right font-mono text-xs text-zinc-600 dark:text-zinc-400">
                  {gwpText(r.environmental.gwp.ar4)}
                </td>
                <td className="px-3 py-2 text-right font-mono text-xs text-zinc-600 dark:text-zinc-400">
                  {gwpText(r.environmental.gwp.ar5)}
                </td>
                <td className="px-3 py-2 text-right font-mono text-xs text-zinc-600 dark:text-zinc-400">
                  {gwpText(r.environmental.gwp.ar6)}
                </td>
                <td className="px-3 py-2 text-xs text-zinc-600 dark:text-zinc-400">
                  {basisForRow(r)}
                </td>
                <td className="px-3 py-2 text-xs">
                  <StatusBadges r={r} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-zinc-500">
        Amber: GWP ≥ 700, the US limit for new residential/light-commercial AC and heat pumps
        (40 CFR 84.54(a)(1), (c)(1)). Green: GWP &lt; 150. The 0 (CO2 reference) and
        natural-refrigerant tier dominates the bottom of the table; the CFC/HCFC legacy refrigerants dominate the top.
      </p>
      <p className="text-xs text-zinc-500">
        Status is derived: an AIM Act HFC is one of the 18 regulated HFCs (42 U.S.C. 7675(c)) or a blend containing one.
        For US 40 CFR 84.54 thresholds the blend GWP is recomputed under 84.64(c), which excludes CFC/HCFC/PFC
        constituents — so a CFC/HCFC blend&apos;s headline (mass-weighted IPCC AR4) is not the value used against those limits.
      </p>
    </div>
  );
}

// Derived from the regulatory engine: AIM Act HFC (regulated substance / blend
// containing one), ODS — CFC, ODS — HCFC, or — (none).
const STATUS_META: Record<string, { label: string; tone: string }> = {
  "aim-hfc": { label: "AIM Act HFC", tone: "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-200" },
  "ods-cfc": { label: "ODS — CFC", tone: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300" },
  "ods-hcfc": { label: "ODS — HCFC", tone: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300" },
};
function StatusBadges({ r }: { r: Refrigerant }) {
  const k = regulatoryClass(r);
  if (k === "none") return <span className="text-zinc-400">—</span>;
  const m = STATUS_META[k];
  return <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${m.tone}`}>{m.label}</span>;
}

function rowTone(r: Refrigerant): string {
  const g = gwpNum(r.environmental.gwp.headline);
  if (g === null) return "";
  if (g <= 150) return "bg-emerald-50/30 dark:bg-emerald-950/10";
  if (g > 700) return "bg-amber-50/30 dark:bg-amber-950/10";
  return "";
}

function Th({
  label,
  k,
  sortKey,
  sortDir,
  toggleSort,
  align = "left",
}: {
  label: string;
  k: SortKey;
  sortKey: SortKey;
  sortDir: SortDir;
  toggleSort: (k: SortKey) => void;
  align?: "left" | "right";
}) {
  const active = sortKey === k;
  const arrow = active ? (sortDir === "asc" ? "↑" : "↓") : "";
  return (
    <th className={`px-3 py-2 font-medium ${align === "right" ? "text-right" : ""}`}>
      <button
        type="button"
        onClick={() => toggleSort(k)}
        className="inline-flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-100"
        aria-sort={active ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
      >
        {label} <span className="text-[10px]">{arrow}</span>
      </button>
    </th>
  );
}

function compareRows(key: SortKey, dir: SortDir) {
  const mul = dir === "asc" ? 1 : -1;
  return (a: Refrigerant, b: Refrigerant) => {
    switch (key) {
      case "displayName":
        return mul * a.displayName.localeCompare(b.displayName, "en", { numeric: true });
      case "type":
        return mul * a.type.localeCompare(b.type);
      case "safetyClass":
        return mul * (SAFETY_ORDER[a.safetyClass] - SAFETY_ORDER[b.safetyClass]);
      case "odp": {
        const av = a.environmental.odp ?? -1;
        const bv = b.environmental.odp ?? -1;
        return mul * (av - bv);
      }
      case "gwpHeadline": {
        const av = gwpNum(a.environmental.gwp.headline) ?? -1;
        const bv = gwpNum(b.environmental.gwp.headline) ?? -1;
        return mul * (av - bv);
      }
    }
  };
}
