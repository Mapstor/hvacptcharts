"use client";

import { useMemo } from "react";
import { refrigerants } from "@/data/refrigerants";

export interface RefrigerantSelectorProps {
  value: string;
  onChange: (slug: string) => void;
  /** Restrict to slugs with a populated PT chart. Default true. */
  onlyWithPtData?: boolean;
  id?: string;
  className?: string;
}

const TYPE_GROUPS: Array<{ label: string; types: string[] }> = [
  { label: "HFC pure", types: ["hfc-pure"] },
  { label: "HFC blend", types: ["hfc-blend"] },
  { label: "HFO pure / blend", types: ["hfo-pure", "hfo-blend"] },
  { label: "HCFC (legacy)", types: ["hcfc"] },
  { label: "CFC (banned)", types: ["cfc"] },
  { label: "Natural", types: ["natural"] },
  { label: "Hydrocarbon (flammable)", types: ["hc"] },
];

export function RefrigerantSelector({
  value,
  onChange,
  onlyWithPtData = true,
  id = "refrigerant-selector",
  className = "",
}: RefrigerantSelectorProps) {
  const grouped = useMemo(() => {
    const filtered = onlyWithPtData ? refrigerants.filter((r) => r.ptChart.length > 0) : refrigerants;
    return TYPE_GROUPS.map((g) => ({
      label: g.label,
      items: filtered
        .filter((r) => g.types.includes(r.type))
        .sort((a, b) => a.displayName.localeCompare(b.displayName, "en", { numeric: true })),
    })).filter((g) => g.items.length > 0);
  }, [onlyWithPtData]);

  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-900 ${className}`}
      aria-label="Refrigerant"
    >
      {grouped.map((g) => (
        <optgroup key={g.label} label={g.label}>
          {g.items.map((r) => (
            <option key={r.slug} value={r.slug}>
              {r.displayName} ({r.safetyClass})
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
