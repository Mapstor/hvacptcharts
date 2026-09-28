"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { refrigerants, gwpNum, gwpText, type RefrigerantType, type SafetyClass } from "@/data/refrigerants";
import { SafetyClassChip } from "@/components/svg/SafetyClassChip";
import { typeLabel } from "@/components/refrigerant/TypeChip";

const TYPE_OPTIONS: Array<{ id: RefrigerantType | "all"; label: string }> = [
  { id: "all", label: "All types" },
  { id: "hfc-pure", label: "HFC pure" },
  { id: "hfc-blend", label: "HFC blend" },
  { id: "hfo-pure", label: "HFO pure" },
  { id: "hfo-blend", label: "HFO blend" },
  { id: "hcfo", label: "HCFO" },
  { id: "pfc", label: "PFC" },
  { id: "hcfc", label: "HCFC (legacy)" },
  { id: "hcfc-blend", label: "HCFC blend" },
  { id: "cfc", label: "CFC (production ended)" },
  { id: "cfc-blend", label: "CFC blend (azeotrope)" },
  { id: "hc", label: "Hydrocarbon" },
  { id: "natural", label: "Natural" },
];

const SAFETY_OPTIONS: Array<{ id: SafetyClass | "all"; label: string }> = [
  { id: "all", label: "All classes" },
  { id: "A1", label: "A1" },
  { id: "A2L", label: "A2L" },
  { id: "A3", label: "A3" },
  { id: "B1", label: "B1" },
  { id: "B2L", label: "B2L" },
];

const GWP_OPTIONS = [
  { id: "all", label: "Any GWP" },
  { id: "u150", label: "GWP < 150", min: -1, max: 150 },
  { id: "u700", label: "GWP < 700", min: -1, max: 700 },
  { id: "g700", label: "GWP ≥ 700", min: 700, max: Infinity },
] as const;

const FILTER_BTN = "rounded-full border px-3 py-1 text-xs font-medium transition-colors";
const FILTER_BTN_ACTIVE = "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900";
const FILTER_BTN_IDLE = "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800";

export function RefrigerantBrowser() {
  const router = useRouter();

  // Default (server + first client render) shows all refrigerants, so every
  // link ships in the static HTML. The ?q= deep-link is read AFTER mount from
  // window.location — reading it via useSearchParams() would force this subtree
  // to bail out of static prerendering and ship an empty skeleton to crawlers.
  const [query, setQuery] = useState("");
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) setQuery(q);
  }, []);
  const [typeFilter, setTypeFilter] = useState<RefrigerantType | "all">("all");
  const [safetyFilter, setSafetyFilter] = useState<SafetyClass | "all">("all");
  const [gwpFilter, setGwpFilter] = useState<typeof GWP_OPTIONS[number]["id"]>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const gwpBucket = GWP_OPTIONS.find((b) => b.id === gwpFilter);
    const minGwp = gwpBucket && "min" in gwpBucket ? gwpBucket.min : -Infinity;
    const maxGwp = gwpBucket && "max" in gwpBucket ? gwpBucket.max : Infinity;
    return refrigerants.filter((r) => {
      if (typeFilter !== "all" && r.type !== typeFilter) return false;
      if (safetyFilter !== "all" && r.safetyClass !== safetyFilter) return false;
      if (gwpBucket && gwpBucket.id !== "all") {
        const g = gwpNum(r.environmental.gwp.headline);
        if (g === null) return false;
        if (g < minGwp || g > maxGwp) return false;
      }
      if (q) {
        const hay = `${r.displayName} ${r.altSpellings.join(" ")} ${r.chemicalName} ${r.tradeNames.map((t) => t.name).join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [query, typeFilter, safetyFilter, gwpFilter]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const url = query.trim() ? `/?q=${encodeURIComponent(query.trim())}` : "/";
    router.replace(url);
  };

  return (
    <div className="space-y-5">
      <form onSubmit={onSubmit} className="flex gap-2" role="search">
        <input
          type="search"
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search refrigerants — by name, trade name, or chemistry"
          className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          aria-label="Search refrigerants"
        />
        <button type="submit" className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
          Search
        </button>
      </form>

      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {TYPE_OPTIONS.map((t) => (
            <button key={t.id} type="button" onClick={() => setTypeFilter(t.id)} aria-pressed={typeFilter === t.id}
              className={`${FILTER_BTN} ${typeFilter === t.id ? FILTER_BTN_ACTIVE : FILTER_BTN_IDLE}`}>{t.label}</button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {SAFETY_OPTIONS.map((s) => (
            <button key={s.id} type="button" onClick={() => setSafetyFilter(s.id)} aria-pressed={safetyFilter === s.id}
              className={`${FILTER_BTN} ${safetyFilter === s.id ? FILTER_BTN_ACTIVE : FILTER_BTN_IDLE}`}>{s.label}</button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {GWP_OPTIONS.map((g) => (
            <button key={g.id} type="button" onClick={() => setGwpFilter(g.id)} aria-pressed={gwpFilter === g.id}
              className={`${FILTER_BTN} ${gwpFilter === g.id ? FILTER_BTN_ACTIVE : FILTER_BTN_IDLE}`}>{g.label}</button>
          ))}
        </div>
      </div>

      <p className="text-xs text-zinc-500">
        {filtered.length} of {refrigerants.length} refrigerants{query ? <> matching <code>{query}</code></> : null}.
      </p>

      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((r) => (
          <li key={r.slug}>
            <Link
              href={`/refrigerant/${r.slug}/`}
              className="block rounded-lg border border-zinc-200 p-3 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{r.displayName}</span>
                <SafetyClassChip safetyClass={r.safetyClass} size="sm" />
              </div>
              <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400 truncate">{r.chemicalName}</p>
              <p className="mt-1 text-xs text-zinc-500">
                {typeLabel(r.type)} · GWP {gwpText(r.environmental.gwp.headline)}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      {filtered.length === 0 ? (
        <p className="text-sm text-zinc-500">No refrigerants match these filters.</p>
      ) : null}
    </div>
  );
}
