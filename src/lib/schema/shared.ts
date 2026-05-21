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
    url: `${SITE_URL}/logo.png`,
    width: 512,
    height: 512,
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
