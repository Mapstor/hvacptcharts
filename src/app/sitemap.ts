import type { MetadataRoute } from "next";
import { refrigerants } from "@/data/refrigerants";
import { getFileGitDates } from "@/lib/git-dates";

/**
 * Sitemap generated at build time. Per docs/spec/03-SITEMAP_MIGRATION.md.
 *
 * Only includes URLs that actually return 200 in the current build.
 *
 * Refrigerant page lastModified comes from the data layer
 * (r.dataSource.ptChartGeneratedAt) — when the dataset is regenerated, every
 * refrigerant URL gets a new lastModified, which Google's crawl scheduler
 * respects.
 *
 * Guide and comparison URLs derive lastModified from the git log of their
 * content file (page.tsx for guides, .mdx for comparisons). This matches the
 * TechArticle dateModified emitted on the same pages, so the sitemap and the
 * JSON-LD tell Google the same story about freshness.
 */

const BASE_URL = "https://hvacptcharts.com";

interface StaticEntry {
  url: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  /** Path (relative to repo root) whose git log drives lastModified. */
  sourceFile?: string;
}

const STATIC_PAGES: StaticEntry[] = [
  // Top-level
  { url: "/", priority: 1.0, changeFrequency: "weekly" },

  // Hubs
  { url: "/pt-charts-tools-hub/", priority: 0.9, changeFrequency: "weekly" },
  { url: "/calculators-hub/", priority: 0.9, changeFrequency: "weekly" },
  { url: "/guides-hub/", priority: 0.7, changeFrequency: "weekly" },

  // Calculators
  { url: "/pt-calculator/", priority: 0.9, changeFrequency: "monthly" },
  { url: "/superheat-calculator/", priority: 0.9, changeFrequency: "monthly" },
  { url: "/subcooling-calculator/", priority: 0.8, changeFrequency: "monthly" },
  { url: "/pt-superheat-subcooling-calculator/", priority: 0.8, changeFrequency: "monthly" },
  { url: "/saturation-properties-calculator/", priority: 0.7, changeFrequency: "monthly" },
  { url: "/refrigerant-pt-comparison-tool/", priority: 0.7, changeFrequency: "monthly" },
  { url: "/refrigerant-charge-calculator/", priority: 0.7, changeFrequency: "monthly" },
  { url: "/refrigerant-retrofit-compatibility-calculator/", priority: 0.7, changeFrequency: "monthly" },
  { url: "/system-pressure-diagnostic-calculator/", priority: 0.7, changeFrequency: "monthly" },
  { url: "/psychrometric-calculator/", priority: 0.7, changeFrequency: "monthly" },
  { url: "/duct-size-calculator/", priority: 0.7, changeFrequency: "monthly" },
  { url: "/hvac-load-calculator/", priority: 0.7, changeFrequency: "monthly" },

  // Reference / sortable
  { url: "/refrigerant-safety-classifications/", priority: 0.8, changeFrequency: "monthly" },
  { url: "/refrigerant-gwp-rankings/", priority: 0.8, changeFrequency: "monthly" },

  // Long-form guides
  { url: "/superheat-subcooling-fundamentals/", priority: 0.7, changeFrequency: "monthly" },
  { url: "/pt-chart-guide/", priority: 0.7, changeFrequency: "monthly" },
  { url: "/high-head-pressure-causes/", priority: 0.7, changeFrequency: "monthly" },
  { url: "/high-suction-low-head-pressure/", priority: 0.7, changeFrequency: "monthly" },
  { url: "/ac-low-side-pressure-too-high/", priority: 0.7, changeFrequency: "monthly" },
  { url: "/low-suction-pressure/", priority: 0.7, changeFrequency: "monthly" },
  { url: "/ac-compressor-short-cycling/", priority: 0.7, changeFrequency: "monthly" },
  { url: "/overcharged-ac-symptoms/", priority: 0.7, changeFrequency: "monthly" },
  { url: "/refrigerant-comparison-guide/", priority: 0.8, changeFrequency: "monthly" },
  // Charging charts — universal target-superheat + R-410A / R-22 fluid-specific + two-method R-410A chart.
  { url: "/target-superheat-chart/", priority: 0.7, changeFrequency: "yearly" },
  { url: "/r410a-superheat-chart/", priority: 0.8, changeFrequency: "yearly" },
  { url: "/r22-superheat-chart/", priority: 0.7, changeFrequency: "yearly" },
  { url: "/r410a-charging-chart/", priority: 0.8, changeFrequency: "yearly" },
  { url: "/carrier-410a-charging-chart/", priority: 0.7, changeFrequency: "yearly" },
  { url: "/refrigerant-prices-guide/", priority: 0.7, changeFrequency: "monthly" },

  // What-pressure pages
  { url: "/what-pressure-should-410a/", priority: 0.7, changeFrequency: "monthly" },
  { url: "/what-pressure-should-r22/", priority: 0.7, changeFrequency: "monthly" },
  { url: "/what-pressure-should-r32/", priority: 0.7, changeFrequency: "monthly" },
  { url: "/what-pressure-should-r134a/", priority: 0.7, changeFrequency: "monthly" },
  { url: "/what-pressure-should-r404a/", priority: 0.6, changeFrequency: "monthly" },
  { url: "/what-pressure-should-r454b/", priority: 0.6, changeFrequency: "monthly" },
  { url: "/what-pressure-should-r407c/", priority: 0.7, changeFrequency: "monthly" },
  { url: "/what-pressure-should-r454c/", priority: 0.6, changeFrequency: "monthly" },
  { url: "/what-pressure-should-r744/", priority: 0.6, changeFrequency: "monthly" },
  { url: "/what-pressure-should-r1234yf/", priority: 0.7, changeFrequency: "monthly" },
  { url: "/what-pressure-should-r449a/", priority: 0.7, changeFrequency: "monthly" },

  // Comparison pages
  { url: "/r-32-vs-r-410a/", priority: 0.7, changeFrequency: "monthly" },
  { url: "/r-32-vs-r-454b/", priority: 0.6, changeFrequency: "monthly" },
  { url: "/r-410a-vs-r-454b/", priority: 0.6, changeFrequency: "monthly" },
  { url: "/r-22-vs-r-410a/", priority: 0.8, changeFrequency: "monthly" },
  { url: "/r-22-vs-r-407c/", priority: 0.7, changeFrequency: "monthly" },
  { url: "/r-404a-vs-r-449a/", priority: 0.7, changeFrequency: "monthly" },
  { url: "/r-134a-vs-r-513a/", priority: 0.7, changeFrequency: "monthly" },
  { url: "/r-454c-vs-r-455a/", priority: 0.6, changeFrequency: "monthly" },
  { url: "/r-22-vs-r-32/", priority: 0.7, changeFrequency: "monthly" },
  { url: "/r-407c-vs-r-410a/", priority: 0.6, changeFrequency: "monthly" },
  { url: "/r-22-vs-r-454b/", priority: 0.7, changeFrequency: "monthly" },
  { url: "/r-1234yf-vs-r-134a/", priority: 0.6, changeFrequency: "monthly" },
  { url: "/r-744-vs-r-290/", priority: 0.6, changeFrequency: "monthly" },
  { url: "/r-12-vs-r-134a/", priority: 0.7, changeFrequency: "yearly" },
  // Wave 1.6 — four KW-validated comparisons.
  { url: "/r-290-vs-r-600a/", priority: 0.7, changeFrequency: "yearly" },
  { url: "/r-454b-vs-r-454c/", priority: 0.7, changeFrequency: "yearly" },
  { url: "/r-404a-vs-r-452a/", priority: 0.7, changeFrequency: "yearly" },
  { url: "/r-134a-vs-r-1234ze/", priority: 0.7, changeFrequency: "yearly" },
  // Wave 1.6b — three MO99 / N40 / XP40 comparisons enabled by manufacturer PT transcription.
  { url: "/r-22-vs-r-438a/", priority: 0.7, changeFrequency: "yearly" },
  { url: "/r-448a-vs-r-449a/", priority: 0.7, changeFrequency: "yearly" },
  { url: "/r-404a-vs-r-448a/", priority: 0.7, changeFrequency: "yearly" },

  // HVAC long-form guides — being ported one at a time with full content depth.
  { url: "/hvac-troubleshooting-guide/", priority: 0.7, changeFrequency: "monthly" },
  { url: "/hvac-load-calculation-guide/", priority: 0.7, changeFrequency: "monthly" },
  { url: "/hvac-duct-design-guide/", priority: 0.7, changeFrequency: "monthly" },
  { url: "/hvac-refrigerant-recovery-guide/", priority: 0.7, changeFrequency: "monthly" },
  { url: "/hvac-energy-efficiency-guide/", priority: 0.7, changeFrequency: "monthly" },
  { url: "/hvac-commissioning-guide/", priority: 0.7, changeFrequency: "monthly" },
  { url: "/hvac-maintenance-service-guide/", priority: 0.7, changeFrequency: "monthly" },
  { url: "/hvac-indoor-air-quality-guide/", priority: 0.7, changeFrequency: "monthly" },
  { url: "/hvac-mechanical-ventilation-guide/", priority: 0.7, changeFrequency: "monthly" },
  { url: "/hvac-system-design-guide/", priority: 0.7, changeFrequency: "monthly" },
  { url: "/hvac-controls-automation-guide/", priority: 0.7, changeFrequency: "monthly" },
  { url: "/hvac-safety-procedures-guide/", priority: 0.7, changeFrequency: "monthly" },
  { url: "/hvac-tools-equipment-guide/", priority: 0.7, changeFrequency: "monthly" },
  { url: "/hvac-retrofitting-upgrades-guide/", priority: 0.7, changeFrequency: "monthly" },
  { url: "/hvac-energy-management-guide/", priority: 0.7, changeFrequency: "monthly" },
  { url: "/hvac-building-automation-guide/", priority: 0.7, changeFrequency: "monthly" },
  { url: "/hvac-ductless-mini-split-guide/", priority: 0.7, changeFrequency: "monthly" },
  // { url: "/hvac-building-automation-guide/", priority: 0.5 },
  // { url: "/hvac-commissioning-guide/", priority: 0.6 },
  // ...

  // Site pages
  { url: "/about-us/", priority: 0.3, changeFrequency: "yearly" },
  { url: "/contact-us/", priority: 0.3, changeFrequency: "yearly" },
  { url: "/privacy-policy/", priority: 0.2, changeFrequency: "yearly" },
  { url: "/terms-of-service/", priority: 0.2, changeFrequency: "yearly" },
];

/**
 * Given a sitemap URL path, return the repo-relative file whose git log
 * drives lastModified. Comparison pages are MDX; everything else is the
 * page.tsx that renders that route. Called at build time only.
 */
function inferSourceFile(url: string): string {
  // Comparison pages: /r-32-vs-r-410a/ → content/comparisons/r-32-vs-r-410a.mdx
  if (/^\/r-[a-z0-9-]+-vs-r-[a-z0-9-]+\/$/.test(url)) {
    const slug = url.slice(1, -1);
    return `content/comparisons/${slug}.mdx`;
  }
  if (url === "/") return "src/app/page.tsx";
  return `src/app${url}page.tsx`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const datasetGeneratedAt = new Date(
    refrigerants[0]?.dataSource.ptChartGeneratedAt ?? Date.now(),
  );

  const staticEntries = STATIC_PAGES.map((p) => {
    const src = p.sourceFile ?? inferSourceFile(p.url);
    let lastModified: Date;
    try {
      lastModified = new Date(getFileGitDates(src).modified);
    } catch {
      // File resolution failed (e.g. dynamic route with no direct source);
      // fall back to dataset-regen timestamp so the entry still ships.
      lastModified = datasetGeneratedAt;
    }
    return {
      url: `${BASE_URL}${p.url}`,
      lastModified,
      changeFrequency: p.changeFrequency,
      priority: p.priority,
    };
  });

  const refrigerantEntries = refrigerants.map((r) => {
    const tier1 = ["r-22", "r-410a", "r-134a", "r-32", "r-404a", "r-454b", "r-407c", "r-1234yf", "r-1234ze", "r-744", "r-717", "r-290", "r-600a", "r-123"];
    const priority = tier1.includes(r.slug) ? 0.85 : 0.6;
    return {
      url: `${BASE_URL}/refrigerant/${r.slug}/`,
      lastModified: new Date(r.dataSource.ptChartGeneratedAt),
      changeFrequency: "monthly" as const,
      priority,
    };
  });

  return [...staticEntries, ...refrigerantEntries];
}
