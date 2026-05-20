# SITEMAP_MIGRATION.md

The new site preserves every public URL from the live WordPress install. Same paths, same trailing slashes, same canonical structure. Where there are duplicate hub URLs in the current site, we pick one canonical and 301 the other. Where there are dead URLs (404s) that the current site links to internally, we remove the internal links and skip rebuilding the dead pages until phase 2.

## Migration principle

The current site has ~13,400 impressions per 90 days from 1,000+ unique queries. We are not losing any of that. Every indexed URL gets either:

1. **Preserved exactly** — same path, rebuilt page underneath.
2. **301 redirected** — for canonical-duplicate URLs only.
3. **Removed** — only when a URL currently 404s (so removing it is a no-op for users and search engines).

Nothing is renamed. Nothing moves to a "better" path. SEO equity stays.

## URL inventory (preserved)

### Refrigerant PT chart pages (61, all preserved exactly)

Pattern: `/refrigerant/{slug}/`

| slug | impressions (90d) | clicks (90d) | priority |
|---|---|---|---|
| r-22 | 918 | 0 | TIER 1 — top traffic |
| r-410a | 1422 | 1 | TIER 1 — top traffic, position 63 (huge upside) |
| r-134a | 755 | 0 | TIER 1 |
| r-123 | 513 | 5 | TIER 1 — earns clicks |
| r-454b | 518 | 2 | TIER 1 |
| r-516a | 407 | 2 | TIER 1 — position 7.67 (close to page 1) |
| r-32 | 328 | 1 | TIER 1 |
| r-12 | 356 | 0 | TIER 2 |
| r-407c | 275 | 0 | TIER 2 |
| r-407f | 257 | 2 | TIER 2 |
| r-507a | 205 | 2 | TIER 2 |
| r-11 | 168 | 1 | TIER 2 |
| r-1234ze | 137 | 1 | TIER 2 |
| r-422a | 117 | 0 | TIER 2 |
| r-422d | 115 | 0 | TIER 2 |
| r-1234yf | 123 (var. URL) | 0 | TIER 2 |
| r-1336mzz-z | 71 | 2 | TIER 2 — high CTR |
| r-744 | 71 | 0 | TIER 2 |
| r-452a | 66 | 1 | TIER 3 |
| r-450a | 26 | 0 | TIER 3 |
| r-455a | 10 | 1 | TIER 3 |
| r-236fa | 7 | 1 | TIER 3 |
| r-218 | 4 | 1 | TIER 3 |
| r-245fa | 2 | 1 | TIER 3 |

All 61 refrigerants in alphabetical order (full list):

```
r-11, r-1150, r-12, r-1224yd-z, r-123, r-1233zd-e, r-1233zd-z, r-1234yf,
r-1234ze, r-1234ze-e, r-1234ze-z, r-124, r-125, r-1270, r-13, r-1336mzz-z,
r-134a, r-143a, r-152a, r-218, r-22, r-236ea, r-236fa, r-245fa, r-290, r-32,
r-365mfc, r-404a, r-407a, r-407c, r-407f, r-410a, r-417a, r-421a, r-422a,
r-422b, r-422d, r-427a, r-438a, r-448a, r-449a, r-450a, r-452a, r-452b,
r-454b, r-454c, r-455a, r-457a, r-500, r-502, r-503, r-507a, r-513a, r-514a,
r-515a, r-515b, r-516a, r-600a, r-717, r-744, r-c318
```

**Note on slug edge cases:**
- `r-c318` (lowercase c) per existing live URL
- `r-1224yd-z`, `r-1233zd-e`, `r-1233zd-z`, `r-1234ze-e`, `r-1234ze-z`, `r-1336mzz-z` — all use hyphenated form for the parenthesized isomer (e.g. R-1234ze(E) → `/refrigerant/r-1234ze-e/`). Preserve this convention.

### Calculator pages (12, all preserved exactly)

| URL | priority | notes |
|---|---|---|
| `/pt-calculator/` | TIER 1 | 402 imp, 10 clicks |
| `/superheat-calculator/` | TIER 1 | **Highest-clicking page: 18 clicks / 718 imp.** Prioritize. |
| `/pt-superheat-subcooling-calculator/` | TIER 1 | 673 imp, 3 clicks |
| `/saturation-properties-calculator/` | TIER 2 | 281 imp, 2 clicks |
| `/refrigerant-charge-calculator/` | TIER 2 | 267 imp, 2 clicks |
| `/subcooling-calculator/` | TIER 2 | 391 imp, 2 clicks |
| `/psychrometric-calculator/` | TIER 3 | 411 imp, 0 clicks; leave as-is per scope |
| `/duct-size-calculator/` | TIER 3 | 66 imp; leave as-is per scope |
| `/hvac-load-calculator/` | TIER 3 | leave as-is per scope |
| `/system-pressure-diagnostic-calculator/` | TIER 3 | 27 imp; full rebuild |
| `/refrigerant-pt-comparison-tool/` | TIER 2 | 99 imp; full rebuild |
| `/refrigerant-retrofit-compatibility-calculator/` | TIER 3 | full rebuild |

Note: `/pressure-diagnostic-tool/` exists as a WP page (29146 chars) but the same functionality is in `/system-pressure-diagnostic-calculator/`. Audit which has more traffic. Keep both URLs live but consolidate the actual page content under one, 301 the other.

### "What pressure should" pages (6, all preserved)

```
/what-pressure-should-410a-be/
/what-pressure-should-r22-be/
/what-pressure-should-r32-be/
/what-pressure-should-r134a-be/
/what-pressure-should-r404a-be/
/what-pressure-should-r454b-be/
```

### HVAC guides (17, all preserved)

```
/hvac-building-automation-guide/
/hvac-commissioning-guide/                 ← 802 imp, 1 click
/hvac-controls-automation-guide/
/hvac-duct-design-guide/
/hvac-energy-efficiency-guide/
/hvac-energy-management-guide/
/hvac-indoor-air-quality-guide/
/hvac-installation-guide/
/hvac-load-calculation-guide/
/hvac-maintenance-service-guide/           ← 61 imp
/hvac-mechanical-ventilation-guide/
/hvac-refrigerant-recovery-guide/
/hvac-retrofitting-upgrades-guide/
/hvac-safety-procedures-guide/             ← 20 imp
/hvac-system-design-guide/                 ← 94 imp
/hvac-tools-equipment-guide/
/hvac-troubleshooting-guide/
```

### Comparison pages (4 live, all preserved)

```
/r-32-vs-r-410a/         ← 61 imp
/r-32-vs-r-454b/         ← 16 imp
/r-410a-vs-r-32/         ← 8 imp
/r-410a-vs-r-454b/       ← (low/zero imp)
```

Note that `/r-32-vs-r-410a/` and `/r-410a-vs-r-32/` are both live as separate pages — duplicate content. Recommendation: **canonical is `/r-32-vs-r-410a/`** (slightly more traffic), 301 `/r-410a-vs-r-32/` to it. Update internal links.

Same for `/r-32-vs-r-454b/` vs `/r-410a-vs-r-454b/`: these are different pairs so both stay.

### Other content pages (preserved exactly)

```
/                                                ← homepage
/pt-chart-guide/                                 ← 264 imp
/refrigerant-comparison-guide/                   ← 97 imp
/refrigerant-safety-classifications/             ← 187 imp
/refrigerant-gwp-rankings/
/refrigerant-prices-guide/                       ← 50 imp
/superheat-subcooling-fundamentals/              ← 680 imp (high)
/high-head-pressure-causes/                      ← 16 imp
/carrier-410a-charging-chart/                    ← 1 imp
/about-us/                                       ← 19 imp
/contact-us/                                     ← 17 imp
/privacy-policy/
/terms-of-service/
```

### Hub pages (CANONICALIZATION REQUIRED)

The site has duplicate hub URLs. Pick one canonical per hub, 301 the other.

| Canonical (keep) | 301 from (kill) | Reason |
|---|---|---|
| `/calculators-hub/` | `/calculators/` | Header nav uses `-hub/` form; preserve nav |
| `/pt-charts-tools-hub/` | `/pt-charts-tools/` | Same |
| `/guides-hub/` | `/guides/` | 87 imp on `-hub/`, footer uses bare form |

Internal links currently mix these. Cleanup task: replace all internal links to point to the canonical version.

GSC data shows `/calculators-hub/` at 156 imp / 1 click, `/guides-hub/` at 87 imp / 0 clicks. Negligible loss from a 301.

## URL Removal (current 404s — safe to drop)

The current site has dead internal links to:

```
/refrigerant/{slug}/pressure-at-{N}-degrees/   ← all variants, all currently 404
```

These are linked from the refrigerant detail pages and the Carrier charging chart page. Confirmed dead via testing in the audit phase.

**Action:** In the new build:
- Do NOT generate these URLs.
- Remove the internal links from refrigerant pages.
- The URL pattern is reserved for a future pSEO expansion (phase 2: curated set of ~120 pages = ~10 refrigerants × ~12 common temperatures, each with verified data and unique troubleshooting context).

## Migration mechanism

### DNS / hosting cutover

WordPress site stays on SiteGround. New Next.js site deploys to Vercel. Migration path:

1. **Build new site on Vercel** with `hvacptcharts.vercel.app` (or a staging subdomain).
2. **Verify every URL renders correctly** by crawling the staging deploy with Screaming Frog. Compare to expected URL list (this file).
3. **Set up the redirect map** in `next.config.js` (see below).
4. **DNS cutover:** Change A/AAAA/CNAME records to point at Vercel. TTL down to 5 minutes 24 hours before; revert to 1h after cutover.
5. **Verify in production** with `curl -I` on every URL from the inventory.
6. **Submit new sitemap.xml** to Google Search Console.
7. **Monitor Search Console "Coverage" report** for unexpected 404s over the following 2-4 weeks.

### Next.js redirects (`next.config.js`)

```javascript
module.exports = {
  async redirects() {
    return [
      // Hub canonicalization
      {
        source: '/calculators',
        destination: '/calculators-hub',
        permanent: true,
      },
      {
        source: '/pt-charts-tools',
        destination: '/pt-charts-tools-hub',
        permanent: true,
      },
      {
        source: '/guides',
        destination: '/guides-hub',
        permanent: true,
      },

      // Comparison page consolidation
      {
        source: '/r-410a-vs-r-32',
        destination: '/r-32-vs-r-410a',
        permanent: true,
      },

      // Prices guide canonical mismatch (current canonical points to /refrigerant-prices-guide/ but URL is /refrigerant-prices/)
      // Decision: live URL is /refrigerant-prices-guide/ (matches canonical). 301 /refrigerant-prices/ to it if WP serves both.
      {
        source: '/refrigerant-prices',
        destination: '/refrigerant-prices-guide',
        permanent: true,
      },

      // Pressure-diagnostic-tool / system-pressure-diagnostic-calculator consolidation
      // Decision: /system-pressure-diagnostic-calculator/ is the canonical (longer, matches naming of other calcs).
      {
        source: '/pressure-diagnostic-tool',
        destination: '/system-pressure-diagnostic-calculator',
        permanent: true,
      },

      // Cleanup: trailing slash policy
      // Next.js can be configured to use trailing slashes OR not. Current WP site uses trailing slashes
      // everywhere. Match it.
    ];
  },

  trailingSlash: true,
};
```

### Sitemap.xml (auto-generated)

Generated at build time by Next.js (`app/sitemap.ts`):

```typescript
import { MetadataRoute } from 'next';
import { refrigerants } from '@/data/refrigerants';

const BASE_URL = 'https://hvacptcharts.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Static pages
  const staticPages = [
    { url: '/', priority: 1.0, changeFrequency: 'monthly' as const },
    { url: '/calculators-hub/', priority: 0.9 },
    { url: '/pt-charts-tools-hub/', priority: 0.9 },
    { url: '/guides-hub/', priority: 0.7 },
    { url: '/pt-calculator/', priority: 0.9 },
    { url: '/superheat-calculator/', priority: 0.9 },
    { url: '/subcooling-calculator/', priority: 0.8 },
    { url: '/pt-superheat-subcooling-calculator/', priority: 0.8 },
    { url: '/refrigerant-charge-calculator/', priority: 0.7 },
    { url: '/saturation-properties-calculator/', priority: 0.7 },
    { url: '/refrigerant-pt-comparison-tool/', priority: 0.7 },
    { url: '/refrigerant-retrofit-compatibility-calculator/', priority: 0.7 },
    { url: '/system-pressure-diagnostic-calculator/', priority: 0.6 },
    { url: '/psychrometric-calculator/', priority: 0.6 },
    { url: '/hvac-load-calculator/', priority: 0.6 },
    { url: '/duct-size-calculator/', priority: 0.6 },
    { url: '/pt-chart-guide/', priority: 0.7 },
    { url: '/refrigerant-comparison-guide/', priority: 0.7 },
    { url: '/refrigerant-safety-classifications/', priority: 0.7 },
    { url: '/refrigerant-gwp-rankings/', priority: 0.7 },
    { url: '/refrigerant-prices-guide/', priority: 0.6 },
    { url: '/superheat-subcooling-fundamentals/', priority: 0.7 },
    { url: '/high-head-pressure-causes/', priority: 0.7 },
    { url: '/carrier-410a-charging-chart/', priority: 0.5 },
    // What-pressure-should pages
    { url: '/what-pressure-should-410a-be/', priority: 0.7 },
    { url: '/what-pressure-should-r22-be/', priority: 0.7 },
    { url: '/what-pressure-should-r32-be/', priority: 0.7 },
    { url: '/what-pressure-should-r134a-be/', priority: 0.7 },
    { url: '/what-pressure-should-r404a-be/', priority: 0.6 },
    { url: '/what-pressure-should-r454b-be/', priority: 0.6 },
    // Comparison pages
    { url: '/r-32-vs-r-410a/', priority: 0.7 },
    { url: '/r-32-vs-r-454b/', priority: 0.6 },
    { url: '/r-410a-vs-r-454b/', priority: 0.6 },
    // HVAC guides (all 17)
    { url: '/hvac-building-automation-guide/', priority: 0.5 },
    { url: '/hvac-commissioning-guide/', priority: 0.6 },
    { url: '/hvac-controls-automation-guide/', priority: 0.5 },
    { url: '/hvac-duct-design-guide/', priority: 0.5 },
    { url: '/hvac-energy-efficiency-guide/', priority: 0.5 },
    { url: '/hvac-energy-management-guide/', priority: 0.5 },
    { url: '/hvac-indoor-air-quality-guide/', priority: 0.5 },
    { url: '/hvac-installation-guide/', priority: 0.5 },
    { url: '/hvac-load-calculation-guide/', priority: 0.5 },
    { url: '/hvac-maintenance-service-guide/', priority: 0.5 },
    { url: '/hvac-mechanical-ventilation-guide/', priority: 0.5 },
    { url: '/hvac-refrigerant-recovery-guide/', priority: 0.5 },
    { url: '/hvac-retrofitting-upgrades-guide/', priority: 0.5 },
    { url: '/hvac-safety-procedures-guide/', priority: 0.5 },
    { url: '/hvac-system-design-guide/', priority: 0.5 },
    { url: '/hvac-tools-equipment-guide/', priority: 0.5 },
    { url: '/hvac-troubleshooting-guide/', priority: 0.5 },
    // Site pages
    { url: '/about-us/', priority: 0.3 },
    { url: '/contact-us/', priority: 0.3 },
    { url: '/privacy-policy/', priority: 0.2 },
    { url: '/terms-of-service/', priority: 0.2 },
  ];

  // Refrigerant pages (auto-generated from data)
  const refrigerantPages = refrigerants.map(r => ({
    url: `/refrigerant/${r.slug}/`,
    priority: 0.8,
    lastModified: new Date(r.dataSource.ptChartGeneratedAt),
  }));

  return [...staticPages, ...refrigerantPages].map(p => ({
    url: `${BASE_URL}${p.url}`,
    lastModified: p.lastModified ?? now,
    changeFrequency: p.changeFrequency ?? 'monthly',
    priority: p.priority,
  }));
}
```

This generates an authoritative sitemap with **real `lastModified` dates** from the data layer — when the PT data is regenerated, the timestamp updates, which Google's crawl algorithms respect.

## Robots.txt (`app/robots.ts`)

```typescript
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/', '/admin/'],
      },
    ],
    sitemap: 'https://hvacptcharts.com/sitemap.xml',
    host: 'https://hvacptcharts.com',
  };
}
```

No special LLM-bot blocking. Per the AI content policy skill: don't create an `llms.txt` — Google has confirmed those aren't a factor.

## Verification checklist (post-deploy)

After the DNS cutover, verify these specific URLs return HTTP 200 (or expected 301):

```bash
# Run this script against the live domain post-cutover.
URLS=(
  https://hvacptcharts.com/
  https://hvacptcharts.com/refrigerant/r-410a/
  https://hvacptcharts.com/refrigerant/r-22/
  https://hvacptcharts.com/refrigerant/r-134a/
  https://hvacptcharts.com/refrigerant/r-32/
  https://hvacptcharts.com/refrigerant/r-404a/
  https://hvacptcharts.com/refrigerant/r-407c/
  https://hvacptcharts.com/refrigerant/r-454b/
  https://hvacptcharts.com/refrigerant/r-123/  # earns clicks
  https://hvacptcharts.com/refrigerant/r-516a/
  https://hvacptcharts.com/refrigerant/r-744/
  https://hvacptcharts.com/refrigerant/r-717/
  https://hvacptcharts.com/refrigerant/r-1234yf/
  https://hvacptcharts.com/refrigerant/r-1234ze/
  https://hvacptcharts.com/superheat-calculator/  # highest clicks
  https://hvacptcharts.com/pt-calculator/
  https://hvacptcharts.com/pt-superheat-subcooling-calculator/
  https://hvacptcharts.com/superheat-subcooling-fundamentals/
  https://hvacptcharts.com/refrigerant-pt-comparison-tool/
  https://hvacptcharts.com/refrigerant-safety-classifications/
  https://hvacptcharts.com/refrigerant-gwp-rankings/
  https://hvacptcharts.com/pt-chart-guide/
  https://hvacptcharts.com/what-pressure-should-410a-be/
  https://hvacptcharts.com/what-pressure-should-r22-be/
  https://hvacptcharts.com/hvac-commissioning-guide/
  https://hvacptcharts.com/calculators-hub/
  https://hvacptcharts.com/pt-charts-tools-hub/
  https://hvacptcharts.com/guides-hub/
  https://hvacptcharts.com/r-32-vs-r-410a/
  https://hvacptcharts.com/sitemap.xml
  https://hvacptcharts.com/robots.txt
)
for u in "${URLS[@]}"; do
  CODE=$(curl -sI -o /dev/null -w "%{http_code}" "$u")
  echo "$CODE  $u"
done
```

And verify the 301s:

```bash
REDIRECTS=(
  "https://hvacptcharts.com/calculators/|/calculators-hub/"
  "https://hvacptcharts.com/guides/|/guides-hub/"
  "https://hvacptcharts.com/pt-charts-tools/|/pt-charts-tools-hub/"
  "https://hvacptcharts.com/r-410a-vs-r-32/|/r-32-vs-r-410a/"
)
for spec in "${REDIRECTS[@]}"; do
  IFS="|" read -r FROM EXPECTED <<< "$spec"
  RESULT=$(curl -sI "$FROM" | grep -i "^location:" | awk '{print $2}' | tr -d '\r')
  echo "$FROM → $RESULT (expected $EXPECTED)"
done
```

## Phase 2 expansion (not part of this rebuild)

After the rebuild is stable for 30 days, the following structural expansions are defensible per the Google AI content policy skill:

### Pressure-at-temperature pages (~120 pages)

Curated set: 10 most-trafficked refrigerants × 12 most-searched temperatures.

```
/refrigerant/r-410a/pressure-at-32-degrees/
/refrigerant/r-410a/pressure-at-40-degrees/
/refrigerant/r-410a/pressure-at-50-degrees/
/refrigerant/r-410a/pressure-at-60-degrees/
/refrigerant/r-410a/pressure-at-65-degrees/
/refrigerant/r-410a/pressure-at-70-degrees/
/refrigerant/r-410a/pressure-at-75-degrees/
/refrigerant/r-410a/pressure-at-80-degrees/
/refrigerant/r-410a/pressure-at-85-degrees/
/refrigerant/r-410a/pressure-at-90-degrees/
/refrigerant/r-410a/pressure-at-95-degrees/
/refrigerant/r-410a/pressure-at-100-degrees/
/refrigerant/r-410a/pressure-at-110-degrees/
... × 10 refrigerants
```

Each page contains: the specific PSIG value at that temperature, a 5-degree-range mini-table around it, what a deviation from that value means diagnostically, links to ±5°F pages, links to the full chart. Genuinely useful + differentiated per page = defensible.

### Comparison pages (~20 pages)

Pairwise comparisons for refrigerants that are actually compared by buyers:

```
/r-22-vs-r-410a/, /r-22-vs-r-407c/, /r-22-vs-r-438a/, /r-22-vs-r-407a/,
/r-410a-vs-r-454b/, /r-410a-vs-r-32/, /r-410a-vs-r-452b/,
/r-404a-vs-r-448a/, /r-404a-vs-r-449a/, /r-404a-vs-r-454c/,
/r-134a-vs-r-1234yf/, /r-134a-vs-r-513a/,
/r-32-vs-r-454b/, /r-32-vs-r-410a/ (already exists)
```

PHP templates for many of these already exist in the child theme but no pages were ever published. The data and structure are mostly there; v1 keeps the 3-4 published ones and the rest come in phase 2.

### Manufacturer charging charts (~10 pages)

Following the `/carrier-410a-charging-chart/` pattern:

```
/lennox-r-410a-charging-chart/
/trane-r-410a-charging-chart/
/goodman-r-410a-charging-chart/
/rheem-r-410a-charging-chart/
/daikin-r-32-charging-chart/
/daikin-r-454b-charging-chart/
```

Each cites the manufacturer's published values, credits the source. Tight scope, high commercial intent, fully defensible because the data is verifiable.

## What is NOT in scope for this rebuild

- The 17 long-form HVAC guides (`hvac-*-guide.php`) → preserved at existing URLs but their internal content audit/rewrite is its own project. v1 ports them as-is structurally; the editorial pass is phase 3.
- The HVAC Load Calculator (Manual J) — preserved, ported as-is.
- The Psychrometric Calculator — preserved, ported as-is.
- The Duct Size Calculator — preserved, ported as-is.

Total new-build scope:
- 61 refrigerant pages (full rebuild)
- 9 PT-dependent calculators (full rebuild)
- 6 "what pressure should" pages (full rebuild)
- 4 comparison pages (full rebuild)
- Homepage (full rebuild)
- 3 hubs (full rebuild)
- 8 explainer/reference pages (full rebuild)
- 17 HVAC guides (port as-is, light cleanup)
- 4 site pages (port as-is)

= **~110 pages of full rebuild** + ~25 port-as-is = ~135 pages total, matching the live inventory.
