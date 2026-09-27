import Link from "next/link";
import { refrigerants, type RefrigerantType } from "@/data/refrigerants";

/**
 * Server-rendered A–Z index of every refrigerant, grouped by chemical family.
 * Purpose is crawlability: it puts a plain <a href="/refrigerant/{slug}/"> for
 * ALL 60 refrigerants (indexable and not) into the static server HTML, with the
 * ASHRAE designation + "PT chart" as the anchor text. Rendered on the homepage
 * and the PT-charts hub.
 *
 * The wrapping element carries data-crawl-block so scripts/qa/crawl.mjs can scope
 * its "every link resolves 200-in-one-hop" check to these navigation blocks.
 */

// Group order + labels per the site taxonomy (Task 8). The dataset `type` enum
// maps 1:1 onto these; only the display label differs.
const GROUPS: Array<{ type: RefrigerantType; label: string }> = [
  { type: "hfc-pure", label: "HFC" },
  { type: "hfc-blend", label: "HFC blend" },
  { type: "hfo-pure", label: "HFO" },
  { type: "hfo-blend", label: "HFO blend" },
  { type: "hcfo", label: "HCFO" },
  { type: "hcfc", label: "HCFC" },
  { type: "cfc", label: "CFC" },
  { type: "pfc", label: "PFC" },
  { type: "hc", label: "hydrocarbon" },
  { type: "natural", label: "natural" },
];

const byName = (a: { displayName: string }, b: { displayName: string }) =>
  a.displayName.localeCompare(b.displayName, "en", { numeric: true });

export function RefrigerantAZList({ className }: { className?: string }) {
  return (
    <div data-crawl-block className={className}>
      <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
        {GROUPS.map(({ type, label }) => {
          const group = refrigerants.filter((r) => r.type === type).sort(byName);
          if (group.length === 0) return null;
          return (
            <section key={type} aria-label={`${label} refrigerants`}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                {label} <span className="font-normal normal-case">({group.length})</span>
              </h3>
              <ul className="mt-2 space-y-1">
                {group.map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={`/refrigerant/${r.slug}/`}
                      className="text-sm text-blue-700 hover:underline dark:text-blue-300"
                    >
                      {r.displayName} PT chart
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
