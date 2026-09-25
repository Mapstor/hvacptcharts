import rawDates from "../../data/content-dates.json";

/**
 * Honest per-route content dates, generated once from full git history by
 * scripts/update-content-dates.mjs into data/content-dates.json. The build
 * reads ONLY this file — it never calls git or reads file mtimes, so a shallow
 * Vercel clone can't make every page look modified today.
 *
 * `updated`  = latest commit that changed the page's own content (page.tsx /
 *              MDX / that slug's data record), excluding [no-date] commits.
 * `published` = first commit that created the page's source.
 */
export interface ContentDates {
  updated: string; // YYYY-MM-DD
  published: string; // YYYY-MM-DD
}

const DATES = rawDates as Record<string, ContentDates>;

/**
 * Look up a route's dates. Throws at build time if the route has no entry so
 * the omission can never ship silently (verify-content-dates.ts also gates it).
 */
export function contentDates(route: string): ContentDates {
  const e = DATES[route];
  if (!e) {
    throw new Error(
      `content-dates: no entry for route "${route}". Add it by running ` +
        `\`node scripts/update-content-dates.mjs\` (or --touch "${route}").`,
    );
  }
  return e;
}

/** Format a YYYY-MM-DD date as en-US long form, e.g. "September 25, 2026". */
export function longDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * The single visible freshness line rendered just under a page's H1:
 * "Updated September 25, 2026". No "Reviewed by" — there is no reviewer yet.
 * Omit on the homepage and legal/about/contact pages.
 */
export function UpdatedLine({ route, className }: { route: string; className?: string }) {
  const { updated } = contentDates(route);
  return (
    <p className={className ?? "mt-2 text-sm text-zinc-500 dark:text-zinc-400"}>
      Updated {longDate(updated)}
    </p>
  );
}
