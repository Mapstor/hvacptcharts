/**
 * Shared schema entities — defined once, referenced by @id from every page.
 * Per docs/spec/06-SCHEMA_INVENTORY.md §Shared entities.
 */

import type { Metadata } from "next";

export const SITE_URL = "https://hvacptcharts.com";
export const SITE_NAME = "HVAC PT Charts";

/**
 * SEO-facing name: unhyphenated designation for titles/descriptions/H1s.
 * "R-410A" → "R410A", "R-1234ze(E)" → "R1234ze(E)", "R-744" → "R744".
 * Body prose, schema, and dataset displayNames keep the hyphenated form.
 * See Task 3 §0 (2026-07): the assertion in scripts/verify-metadata.ts
 * rejects "R-\d" patterns in SERP surfaces exactly to force this.
 *
 * Special-case: ASHRAE "cyclic" designations carry a "C" prefix before the
 * number (R-C318 is a cyclobutane). The dataset stores those with the
 * lowercase "c" in the displayName, but the SERP-facing form is uppercase
 * ("RC318"). This regex uppercases any leading letters between "R-" and
 * the first digit so the fix also applies to any future R-Cxxx entries
 * added to the dataset — no per-slug allowlist required.
 */
export function seoName(displayName: string): string {
  return displayName.replace(
    /^R-([a-z]+)?/,
    (_match, letters) => "R" + (letters ? letters.toUpperCase() : ""),
  );
}

/**
 * Trade / common name annotations for the four natural refrigerants where
 * "R744 (CO2)" etc. still fits the ≤68-char title budget. Everything else
 * uses the bare seoName.
 */
export const COMMON_NAME: Record<string, string> = {
  "r-744": "CO2",
  "r-290": "Propane",
  "r-600a": "Isobutane",
  "r-717": "Ammonia",
};

/**
 * Refrigerant page metadata generator. Task 3 (2026-07) makes the 61
 * refrigerant page titles/descriptions fully deterministic from the dataset
 * so future refrigerants added to the config auto-get compliant SERP
 * surfaces without hand-editing MDX. Common-name variant is appended when
 * the fluid appears in COMMON_NAME AND the combined title still fits.
 *
 * MDX may still provide `metaDescription` as an escape hatch for curated
 * copy on specific fluids (r-516a is the seed case).
 */
export interface RefrigerantMetadataInput {
  slug: string;
  displayName: string;
  minTempF: number;
  maxTempF: number;
  pressure70F: number | null;
  /** MDX override — used verbatim when present, ignored otherwise. */
  metaDescriptionOverride?: string;
}

export function buildRefrigerantMetadata(input: RefrigerantMetadataInput): {
  title: string;
  description: string;
  h1: string;
} {
  const seo = seoName(input.displayName);
  const common = COMMON_NAME[input.slug];

  const baseTitle = common
    ? `${seo} (${common}) PT Chart: Full °F/PSIG Table (Free PDF Printable)`
    : `${seo} PT Chart: Full °F/PSIG Table (Free PDF Printable)`;
  // If the "Printable" tail pushes us past 68c (long designations like
  // R1336mzz(Z)), drop that word for the short variant. Common-name form
  // always gets the shorter variant to stay in budget.
  const title = baseTitle.length <= 68
    ? baseTitle
    : common
      ? `${seo} (${common}) PT Chart: Full °F/PSIG Table (Free PDF)`
      : `${seo} PT Chart: Full °F/PSIG Table (Free PDF)`;

  const h1 = common ? `${seo} (${common}) PT Chart` : `${seo} PT Chart`;

  // r-22 gets the phase-down nuance instead of the chart-vocab tail so
  // reclaim-legal techs don't read the description as "all use banned".
  // Everything else uses the mechanical "1°F steps" pattern with an
  // anchored 70°F saturation value from the dataset.
  let description: string;
  if (input.metaDescriptionOverride) {
    description = input.metaDescriptionOverride;
  } else if (input.slug === "r-22") {
    description = `Complete ${seo} saturation pressure-temperature chart from ${input.minTempF} to ${input.maxTempF}°F in 1°F steps. Production banned 2020 — reclaimed supply legal for service.`;
  } else if (input.pressure70F !== null) {
    description = `${seo} saturation pressure-temperature chart, 1°F steps from ${input.minTempF} to ${input.maxTempF}°F. 70°F = ${input.pressure70F.toFixed(1)} PSIG. Interactive lookup, °C/kPa toggle, free printable PDF.`;
  } else {
    description = `Complete ${seo} saturation pressure-temperature chart, 1°F steps from ${input.minTempF} to ${input.maxTempF}°F. Free interactive lookup with °C/kPa toggle, printable shop PDF table.`;
  }

  return { title, description, h1 };
}

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
 * Per-page metadata helper — the fix for the openGraph/twitter inheritance
 * trap. Setting only `metadata.title/description/canonical` in a page.tsx
 * causes openGraph.title / og:url / og:description / twitter:* to inherit
 * from the root layout (i.e. every page emits the homepage OG tags). Next.js
 * does NOT auto-mirror `metadata.title` into `metadata.openGraph.title` when
 * the parent layout has an explicit openGraph block — that trap is why 46
 * pages leaked homepage OG. See refrigerant/[slug]/page.tsx code comment.
 *
 * Task 1 (2026-07): use everywhere except the homepage (deliberate inherit)
 * and the refrigerant [slug] template + 22 pages that had bespoke separate
 * og/twitter copy — those are handled in Task 3 alongside the CTR rewrite.
 *
 * `title.absolute` explicitly overrides the root layout's `title.template`
 * so the returned title is the exact string passed in — no " | HVAC PT
 * Charts" suffix. Sitename appears as `og:site_name` instead.
 */
export interface PageMetadataInput {
  /** Page title — used verbatim (no template suffix). Aim ≤60 rendered chars. */
  title: string;
  /** Meta description. Aim 150-160 chars for SERP display. */
  description: string;
  /** Absolute path from origin. Must start and end with "/". Example: "/pt-calculator/". */
  path: string;
  /** OpenGraph type. Defaults to "article"; use "website" for hubs and homepage-like pages. */
  ogType?: "website" | "article";
  /** OG image path or URL. Defaults to the Next.js metadata route "/opengraph-image". */
  ogImage?: string;
  /** Twitter image path or URL. Defaults to the Next.js metadata route "/twitter-image". */
  twitterImage?: string;
  /** Set true to noindex/nofollow (e.g. internal preview routes). */
  noIndex?: boolean;
}

export function pageMetadata(input: PageMetadataInput): Metadata {
  if (!input.path.startsWith("/") || !input.path.endsWith("/")) {
    throw new Error(
      `pageMetadata: path must start and end with "/", got "${input.path}". ` +
        `Site uses trailingSlash: true so paths are always "/foo/" form.`,
    );
  }
  const url = `${SITE_URL}${input.path}`;
  const ogImage = input.ogImage ?? "/opengraph-image";
  const twitterImage = input.twitterImage ?? "/twitter-image";
  return {
    title: { absolute: input.title },
    description: input.description,
    alternates: { canonical: url },
    openGraph: {
      title: input.title,
      description: input.description,
      url,
      type: input.ogType ?? "article",
      siteName: SITE_NAME,
      locale: "en_US",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [twitterImage],
    },
    ...(input.noIndex ? { robots: { index: false, follow: false } } : {}),
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
