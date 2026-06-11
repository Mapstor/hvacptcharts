/**
 * Shared schema entities — defined once, referenced by @id from every page.
 * Per docs/spec/06-SCHEMA_INVENTORY.md §Shared entities.
 */

export const SITE_URL = "https://hvacptcharts.com";

export const ORG = {
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "HVAC PT Charts",
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    // Served by Next.js metadata route at src/app/apple-icon.tsx (180x180 PNG).
    // Schema.org requires Organization.logo to be a real image URL; using
    // /logo.png would 404 and break the Organization entity.
    url: `${SITE_URL}/apple-icon`,
    width: 180,
    height: 180,
    encodingFormat: "image/png",
  },
};

/**
 * Build-time timestamp used as dateModified on every TechArticle.
 * Refreshed on each production build — signals to Google + AI engines
 * that content is actively maintained.
 *
 * Distinct from datePublished (original publication; tied to refrigerant
 * dataset generation timestamp for refrigerant + calculator pages).
 */
export const BUILD_DATE = new Date().toISOString();

/**
 * Article enrichment helper — adds dateModified + wordCount + articleSection
 * properties to a TechArticle schema. Section helps Google understand the
 * page's topical category; wordCount is a quality signal AI engines use.
 */
export function enrichArticle(
  baseArticle: Record<string, unknown>,
  opts: {
    /** Topical section for Google + AI engine classification */
    articleSection?: string;
    /** Approximate word count of the article body */
    wordCount?: number;
    /** Override dateModified (default: BUILD_DATE) */
    dateModified?: string;
  } = {},
): Record<string, unknown> {
  return {
    ...baseArticle,
    dateModified: opts.dateModified ?? BUILD_DATE,
    ...(opts.articleSection && { articleSection: opts.articleSection }),
    ...(opts.wordCount && { wordCount: opts.wordCount }),
  };
}

export const WEBSITE = {
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: "HVAC PT Charts",
  url: SITE_URL,
  publisher: { "@id": `${SITE_URL}/#organization` },
  inLanguage: "en-US",
  /**
   * Sitelinks Search Box action. Backed by the homepage's `?q=` parameter,
   * which filters the refrigerant browser. Only safe to emit because the URL
   * actually returns useful results — Google penalizes false SearchAction
   * declarations.
   */
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};
