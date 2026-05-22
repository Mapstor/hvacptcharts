import type { MetadataRoute } from "next";
import { refrigerants } from "@/data/refrigerants";

/**
 * Sitemap generated at build time. Per docs/spec/03-SITEMAP_MIGRATION.md.
 *
 * Only includes URLs that actually return 200 in the current build. Pages
 * still planned (the 17 HVAC guides, /carrier-410a-charging-chart/,
 * /refrigerant-prices-guide/, etc.) are deliberately commented out below —
 * adding them to the sitemap before they exist would put 404s in front of
 * crawlers. Uncomment as pages land.
 *
 * Refrigerant page lastModified comes from the data layer
 * (r.dataSource.ptChartGeneratedAt) — when the dataset is regenerated, every
 * refrigerant URL gets a new lastModified, which Google's crawl scheduler
 * respects.
 */

const BASE_URL = "https://hvacptcharts.com";

interface StaticEntry {
  url: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
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
  // { url: "/refrigerant-charge-calculator/", priority: 0.7, changeFrequency: "monthly" }, // pending
  { url: "/refrigerant-retrofit-compatibility-calculator/", priority: 0.7, changeFrequency: "monthly" },
  // { url: "/system-pressure-diagnostic-calculator/", priority: 0.6, changeFrequency: "monthly" }, // pending
  // { url: "/psychrometric-calculator/", priority: 0.6, changeFrequency: "monthly" }, // port-as-is pending
  // { url: "/duct-size-calculator/", priority: 0.6, changeFrequency: "monthly" }, // port-as-is pending
  // { url: "/hvac-load-calculator/", priority: 0.6, changeFrequency: "monthly" }, // port-as-is pending

  // Reference / sortable
  { url: "/refrigerant-safety-classifications/", priority: 0.8, changeFrequency: "monthly" },
  { url: "/refrigerant-gwp-rankings/", priority: 0.8, changeFrequency: "monthly" },

  // Long-form guides
  { url: "/superheat-subcooling-fundamentals/", priority: 0.7, changeFrequency: "monthly" },
  { url: "/pt-chart-guide/", priority: 0.7, changeFrequency: "monthly" },
  { url: "/high-head-pressure-causes/", priority: 0.7, changeFrequency: "monthly" },
  // { url: "/refrigerant-comparison-guide/", priority: 0.7, changeFrequency: "monthly" }, // pending
  // { url: "/carrier-410a-charging-chart/", priority: 0.5, changeFrequency: "yearly" }, // pending
  // { url: "/refrigerant-prices-guide/", priority: 0.6, changeFrequency: "monthly" }, // pending

  // What-pressure pages (6)
  { url: "/what-pressure-should-410a-be/", priority: 0.7, changeFrequency: "monthly" },
  { url: "/what-pressure-should-r22-be/", priority: 0.7, changeFrequency: "monthly" },
  { url: "/what-pressure-should-r32-be/", priority: 0.7, changeFrequency: "monthly" },
  { url: "/what-pressure-should-r134a-be/", priority: 0.7, changeFrequency: "monthly" },
  { url: "/what-pressure-should-r404a-be/", priority: 0.6, changeFrequency: "monthly" },
  { url: "/what-pressure-should-r454b-be/", priority: 0.6, changeFrequency: "monthly" },

  // Comparison pages
  { url: "/r-32-vs-r-410a/", priority: 0.7, changeFrequency: "monthly" },
  { url: "/r-32-vs-r-454b/", priority: 0.6, changeFrequency: "monthly" },
  { url: "/r-410a-vs-r-454b/", priority: 0.6, changeFrequency: "monthly" },

  // HVAC guides — preserved from legacy; 17 pages port-as-is in Phase 7.
  // Uncomment as MDX files land in content/guides/.
  // { url: "/hvac-building-automation-guide/", priority: 0.5 },
  // { url: "/hvac-commissioning-guide/", priority: 0.6 },
  // ...

  // Site pages
  { url: "/about-us/", priority: 0.3, changeFrequency: "yearly" },
  { url: "/contact-us/", priority: 0.3, changeFrequency: "yearly" },
  { url: "/privacy-policy/", priority: 0.2, changeFrequency: "yearly" },
  { url: "/terms-of-service/", priority: 0.2, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries = STATIC_PAGES.map((p) => ({
    url: `${BASE_URL}${p.url}`,
    lastModified: now,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));

  const refrigerantEntries = refrigerants.map((r) => {
    // Tier-1 high-traffic refrigerants get a higher priority weight.
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
