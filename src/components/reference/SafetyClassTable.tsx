"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { refrigerants, type Refrigerant, type SafetyClass, type RefrigerantType } from "@/data/refrigerants";
import { SafetyClassChip } from "@/components/svg/SafetyClassChip";

type SortKey = "displayName" | "safetyClass" | "type" | "gwp";
type SortDir = "asc" | "desc";

const TYPE_OPTIONS: Array<{ id: RefrigerantType | "all"; label: string }> = [
  { id: "all", label: "All types" },
  { id: "hfc-pure", label: "HFC pure" },
  { id: "hfc-blend", label: "HFC blend" },
  { id: "hfo-pure", label: "HFO pure" },
  { id: "hfo-blend", label: "HFO blend" },
  { id: "hcfc", label: "HCFC (legacy)" },
  { id: "cfc", label: "CFC (banned)" },
  { id: "hc", label: "Hydrocarbon" },
  { id: "natural", label: "Natural" },
];

const SAFETY_OPTIONS: Array<{ id: SafetyClass | "all"; label: string }> = [
  { id: "all", label: "All classes" },
  { id: "A1", label: "A1" },
  { id: "A2L", label: "A2L" },
  { id: "A2", label: "A2" },
  { id: "A3", label: "A3" },
  { id: "B1", label: "B1" },
  { id: "B2L", label: "B2L" },
];

const SAFETY_ORDER: Record<SafetyClass, number> = { A1: 1, A2L: 2, A2: 3, A3: 4, B1: 5, B2L: 6, B2: 7, B3: 8 };

const FILTER_BTN = "rounded-full border px-3 py-1 text-xs font-medium transition-colors";
const FILTER_BTN_ACTIVE = "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900";
const FILTER_BTN_IDLE = "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800";

export function SafetyClassTable() {
  const [typeFilter, setTypeFilter] = useState<RefrigerantType | "all">("all");
  const [safetyFilter, setSafetyFilter] = useState<SafetyClass | "all">("all");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("safetyClass");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const filteredSorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = refrigerants.filter((r) => {
      if (typeFilter !== "all" && r.type !== typeFilter) return false;
      if (safetyFilter !== "all" && r.safetyClass !== safetyFilter) return false;
      if (q) {
        const hay = `${r.displayName} ${r.altSpellings.join(" ")} ${r.chemicalName} ${r.tradeNames.map((t) => t.name).join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    return filtered.sort(compareRows(sortKey, sortDir));
  }, [typeFilter, safetyFilter, query, sortKey, sortDir]);

  const toggleSort = (k: SortKey) => {
    if (k === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(k);
      setSortDir("asc");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, trade name, or chemical…"
          className="flex-1 min-w-[200px] rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          aria-label="Search refrigerants"
        />
        <span className="text-xs text-zinc-500">
          {filteredSorted.length} of {refrigerants.length}
        </span>
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
            >
              {t.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="sr-only">Safety class filter</legend>
        <div className="flex flex-wrap gap-2">
          {SAFETY_OPTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSafetyFilter(s.id)}
              aria-pressed={safetyFilter === s.id}
              className={`${FILTER_BTN} ${safetyFilter === s.id ? FILTER_BTN_ACTIVE : FILTER_BTN_IDLE}`}
            >
              {s.label}
            </button>
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
              <th className="px-3 py-2 font-medium">Chemistry</th>
              <Th label="GWP (AR5)" k="gwp" sortKey={sortKey} sortDir={sortDir} toggleSort={toggleSort} align="right" />
            </tr>
          </thead>
          <tbody>
            {filteredSorted.map((r) => (
              <tr key={r.slug} className="border-t border-zinc-100 hover:bg-zinc-50/50 dark:border-zinc-800 dark:hover:bg-zinc-900/50">
                <td className="px-3 py-2">
                  <Link href={`/refrigerant/${r.slug}/`} className="font-medium text-blue-700 hover:underline dark:text-blue-300">
                    {r.displayName}
                  </Link>
                </td>
                <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400 text-xs uppercase">{r.type.replace("-", " ")}</td>
                <td className="px-3 py-2">
                  <SafetyClassChip safetyClass={r.safetyClass} size="sm" />
                </td>
                <td className="px-3 py-2 text-xs text-zinc-600 dark:text-zinc-400 font-mono">{r.chemicalFormula}</td>
                <td className="px-3 py-2 text-right font-mono">
                  {r.environmental.gwp100Ar5 === null ? <span className="text-zinc-400">—</span> : r.environmental.gwp100Ar5.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredSorted.length === 0 ? (
        <p className="text-sm text-zinc-500">No refrigerants match these filters.</p>
      ) : null}
    </div>
  );
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
      case "gwp": {
        const av = a.environmental.gwp100Ar5 ?? -1;
        const bv = b.environmental.gwp100Ar5 ?? -1;
        return mul * (av - bv);
      }
    }
  };
}
