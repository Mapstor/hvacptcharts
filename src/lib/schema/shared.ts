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
