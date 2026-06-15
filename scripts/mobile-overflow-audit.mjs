#!/usr/bin/env node
/**
 * Static mobile-overflow analyzer.
 *
 * Reads every prerendered .next/server/app/*.html and scans for elements that
 * are LIKELY to overflow at a mobile viewport (default 375px wide). Does not
 * run a real browser — uses HTML attribute + class + style heuristics that
 * catch the most common stationary culprits:
 *
 *   - SVGs with width="N" where N > viewport AND no responsive sizing class
 *   - Inline style="width:Npx" / "min-width:Npx" > viewport
 *   - Tailwind hardcoded w-[Npx] / min-w-[Npx] > viewport
 *   - <table> elements not wrapped in an overflow-x-{auto,scroll} ancestor
 *   - <pre> / <code> blocks with very long lines and no overflow rule
 *   - <img> / <iframe> with width="N" > viewport and no responsive class
 *   - Long unbreakable strings in text nodes (URLs, hex, no whitespace) > 60 chars
 *
 * Does NOT catch: layout-computed overflow (e.g., flex/grid that pushes out
 * because of intrinsic content sizes). Those need a real browser.
 *
 * Usage:
 *   node scripts/mobile-overflow-audit.mjs            # report all
 *   node scripts/mobile-overflow-audit.mjs --route /  # only homepage
 *   node scripts/mobile-overflow-audit.mjs --width 320  # tighter viewport
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as cheerio from "cheerio";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const APP_DIR = path.join(ROOT, ".next", "server", "app");

// --- CLI ---
const args = process.argv.slice(2);
const widthIdx = args.indexOf("--width");
const VIEWPORT = widthIdx >= 0 ? parseInt(args[widthIdx + 1], 10) : 375;
const routeIdx = args.indexOf("--route");
const ROUTE_FILTER = routeIdx >= 0 ? args[routeIdx + 1] : null;

// --- helpers ---
function* walkHtml(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walkHtml(p);
    else if (e.isFile() && e.name.endsWith(".html")) yield p;
  }
}

function pathToRoute(p) {
  const rel = path.relative(APP_DIR, p);
  const route = "/" + rel.replace(/\.html$/, "").replace(/\\/g, "/").replace(/\/index$/, "");
  return route === "" ? "/" : route;
}

function describe(node) {
  const tag = node.tagName || node.name || "node";
  const id = node.attribs?.id ? `#${node.attribs.id}` : "";
  const cls = node.attribs?.class
    ? `.${node.attribs.class.split(/\s+/).slice(0, 3).join(".")}`
    : "";
  return `${tag}${id}${cls}`;
}

function selectorPath($, node, depth = 4) {
  const parts = [];
  let cur = node;
  while (cur && parts.length < depth) {
    parts.unshift(describe(cur));
    cur = cur.parent && cur.parent.type === "tag" ? cur.parent : null;
  }
  return parts.join(" > ");
}

// --- checks ---
function checkInlineStyle($, page, findings) {
  $("[style]").each((_, el) => {
    const s = el.attribs.style || "";
    const wMatch = s.match(/(?:^|;|\s)(min-)?width\s*:\s*(\d+(?:\.\d+)?)\s*px/i);
    if (wMatch) {
      const px = parseFloat(wMatch[2]);
      if (px > VIEWPORT) {
        findings.push({
          page,
          type: `inline-${wMatch[1] ? "min-width" : "width"}`,
          value: `${px}px`,
          selector: selectorPath($, el),
        });
      }
    }
  });
}

function checkTailwindHardcoded($, page, findings) {
  $("[class]").each((_, el) => {
    const cls = el.attribs.class || "";
    // w-[NNNpx], min-w-[NNNpx]
    const m = cls.match(/\b(min-w|w)-\[(\d+)px\]/);
    if (m) {
      const px = parseInt(m[2], 10);
      if (px > VIEWPORT) {
        // Suppress if element or any ancestor already has overflow-x scrolling
        // — that's the correct pattern for a wide table in a scroll container.
        if (classesIncludeOverflowX(cls) || ancestorHasOverflowX($, el)) return;
        findings.push({
          page,
          type: `tailwind-${m[1]}`,
          value: `${px}px`,
          selector: selectorPath($, el),
        });
      }
    }
  });
}

function checkSvgWidth($, page, findings) {
  $("svg[width]").each((_, el) => {
    const w = parseInt(el.attribs.width, 10);
    if (Number.isFinite(w) && w > VIEWPORT) {
      // Responsive-sizing escape hatches that override the width attr:
      const cls = el.attribs.class || "";
      const hasResponsiveClass = /\b(w-full|w-auto|w-\d+\/\d+|max-w-|h-auto)/.test(cls);
      const style = el.attribs.style || "";
      const hasResponsiveStyle = /width\s*:\s*(100%|auto|max-content|min-content)/i.test(style);
      if (!hasResponsiveClass && !hasResponsiveStyle) {
        findings.push({
          page,
          type: "svg-width-attr",
          value: `${w}px`,
          selector: selectorPath($, el),
        });
      }
    }
  });
}

function checkImgIframeWidth($, page, findings) {
  $("img[width], iframe[width]").each((_, el) => {
    const w = parseInt(el.attribs.width, 10);
    if (Number.isFinite(w) && w > VIEWPORT) {
      const cls = el.attribs.class || "";
      const hasResponsiveClass = /\b(w-full|w-auto|max-w-)/.test(cls);
      if (!hasResponsiveClass) {
        findings.push({
          page,
          type: `${el.tagName}-width-attr`,
          value: `${w}px`,
          selector: selectorPath($, el),
        });
      }
    }
  });
}

function classesIncludeOverflowX(cls) {
  return /\boverflow-(x-)?(auto|scroll|clip|hidden)\b/.test(cls);
}

function ancestorHasOverflowX($, node) {
  let cur = node.parent;
  while (cur && cur.type === "tag") {
    const cls = cur.attribs?.class || "";
    if (classesIncludeOverflowX(cls)) return true;
    const style = cur.attribs?.style || "";
    if (/overflow(-x)?\s*:\s*(auto|scroll|clip|hidden)/i.test(style)) return true;
    cur = cur.parent;
  }
  return false;
}

function checkUnwrappedTables($, page, findings) {
  $("table").each((_, el) => {
    if (!ancestorHasOverflowX($, el)) {
      findings.push({
        page,
        type: "table-not-wrapped",
        value: "no overflow-x ancestor",
        selector: selectorPath($, el),
      });
    }
  });
}

function checkUnwrappedPreCode($, page, findings) {
  $("pre").each((_, el) => {
    // <pre> has implicit overflow-x:auto via Tailwind prose; only flag if NO
    // ancestor and the <pre> itself has no overflow class
    const cls = el.attribs.class || "";
    if (classesIncludeOverflowX(cls)) return;
    if (ancestorHasOverflowX($, el)) return;
    // Only flag if there's actual long content
    const text = $(el).text();
    const longestLine = text.split(/\n/).reduce((m, l) => Math.max(m, l.length), 0);
    if (longestLine > 80) {
      findings.push({
        page,
        type: "pre-no-overflow",
        value: `longest line ${longestLine} chars`,
        selector: selectorPath($, el),
      });
    }
  });
}

/**
 * Estimate text width given a string + (rough) font-size in pixels and whether
 * it's uppercase or has wide letter-spacing. Pure heuristic — wins about 70%
 * of the time vs. measuring in a real browser, but enough for triage.
 */
function estimateTextWidth(text, fontSizePx, opts = {}) {
  const { upper = false, monospace = false, bold = false, trackingEm = 0 } = opts;
  const baseCharW = monospace ? 0.6 : upper ? 0.65 : 0.55;
  const widthPerChar = baseCharW * fontSizePx * (bold ? 1.05 : 1);
  const trackingPx = trackingEm * fontSizePx;
  return text.length * (widthPerChar + trackingPx);
}

const TW_SIZE_PX = {
  "text-xs": 12, "text-sm": 14, "text-base": 16, "text-lg": 18,
  "text-xl": 20, "text-2xl": 24, "text-3xl": 30, "text-4xl": 36,
  "text-5xl": 48,
};
function classFontSize(cls) {
  // text-[Npx] takes precedence
  const m = cls.match(/text-\[(\d+(?:\.\d+)?)px\]/);
  if (m) return parseFloat(m[1]);
  for (const k of Object.keys(TW_SIZE_PX)) if (new RegExp(`\\b${k}\\b`).test(cls)) return TW_SIZE_PX[k];
  return 16;
}
function classIsUpper(cls) { return /\buppercase\b/.test(cls); }
function classIsBold(cls) { return /\bfont-(bold|semibold|black)\b/.test(cls); }
function classIsMono(cls) { return /\bfont-mono\b/.test(cls); }
function classTracking(cls) {
  if (/\btracking-widest\b/.test(cls)) return 0.1;
  if (/\btracking-wider\b/.test(cls)) return 0.05;
  if (/\btracking-wide\b/.test(cls)) return 0.025;
  if (/\btracking-tight\b/.test(cls)) return -0.025;
  return 0;
}

// Tags that the site-wide globals.css gives `overflow-wrap: anywhere` to
// (see globals.css `p, li, dd` rule). Anything wrapping content in these
// tags can rely on character-level breaking, so we can treat them as having
// a break helper on themselves AND on any ancestor of those tags.
const SITE_BREAK_TAGS = new Set(["p", "li", "dd"]);

function hasBreakHelperUp($, el) {
  // Walk up the tree looking for break-all / break-words / overflow-wrap.
  // Also treat `.prose` and `p`/`li`/`dd` (site-wide rule) as break helpers.
  let cur = el;
  while (cur && cur.type === "tag") {
    if (SITE_BREAK_TAGS.has(cur.tagName)) return true;
    const cls = cur.attribs?.class || "";
    if (/\b(break-all|break-words|prose)\b/.test(cls)) return true;
    const style = cur.attribs?.style || "";
    if (/word-break\s*:\s*break-all/i.test(style)) return true;
    if (/overflow-wrap\s*:\s*(break-word|anywhere)/i.test(style)) return true;
    cur = cur.parent;
  }
  return false;
}

function checkOverwideText($, page, findings) {
  // Walk every element with direct text content; estimate width assuming no
  // wrapping. Flag if estimated width > VIEWPORT and there's no wrap helper
  // (or the parent is a flex/grid item that wouldn't wrap).
  $("body *:not(script):not(style)").each((_, el) => {
    if (el.tagName === "svg" || el.tagName === "path" || el.tagName === "circle") return;
    const directText = $(el).contents().filter((__, n) => n.type === "text").text().trim();
    if (directText.length < 10) return;
    const cls = el.attribs?.class || "";
    const longestWord = directText.split(/\s+/).reduce((m, w) => w.length > m.length ? w : m, "");
    const isNowrap = /\bwhitespace-nowrap\b/.test(cls) || /\btruncate\b/.test(cls);
    const measuredChunk = isNowrap ? directText : longestWord;
    if (measuredChunk.length < 6 && !isNowrap) return;
    // If text wrapping isn't disabled AND any ancestor has a character-level
    // break helper, the word will break char-by-char and won't overflow.
    if (!isNowrap && hasBreakHelperUp($, el)) return;
    const w = estimateTextWidth(measuredChunk, classFontSize(cls), {
      upper: classIsUpper(cls),
      monospace: classIsMono(cls),
      bold: classIsBold(cls),
      trackingEm: classTracking(cls),
    });
    if (w > VIEWPORT) {
      findings.push({
        page,
        type: isNowrap ? "nowrap-text-too-wide" : "intrinsic-word-too-wide",
        value: `~${Math.round(w)}px (${measuredChunk.length}ch: "${measuredChunk.slice(0, 40)}")`,
        selector: selectorPath($, el),
      });
    }
  });
}

function checkLongUnbreakableStrings($, page, findings) {
  // Walk text nodes; flag tokens > 60 chars with no whitespace/hyphen/dot/slash
  // (those wouldn't break at the line boundary on mobile)
  $("body *:not(script):not(style):not(pre):not(code)").each((_, el) => {
    const directText = $(el)
      .contents()
      .filter((__, n) => n.type === "text")
      .text();
    if (!directText) return;
    const tokens = directText.split(/\s+/);
    for (const tok of tokens) {
      if (tok.length > 60 && !/[\s\-./_,:;]/.test(tok)) {
        const cls = el.attribs?.class || "";
        const hasBreak = /\b(break-all|break-words|whitespace-(normal|pre-wrap))\b/.test(cls);
        if (!hasBreak) {
          findings.push({
            page,
            type: "long-unbreakable-string",
            value: `${tok.length} chars: "${tok.slice(0, 50)}..."`,
            selector: selectorPath($, el),
          });
          return; // one per element is enough
        }
      }
    }
  });
}

// --- main ---
function scanPage(filepath) {
  const html = fs.readFileSync(filepath, "utf8");
  const $ = cheerio.load(html);
  const route = pathToRoute(filepath);
  const findings = [];

  checkInlineStyle($, route, findings);
  checkTailwindHardcoded($, route, findings);
  checkSvgWidth($, route, findings);
  checkImgIframeWidth($, route, findings);
  checkUnwrappedTables($, route, findings);
  checkUnwrappedPreCode($, route, findings);
  checkOverwideText($, route, findings);
  checkLongUnbreakableStrings($, route, findings);

  return findings;
}

function main() {
  if (!fs.existsSync(APP_DIR)) {
    console.error(`No build output at ${APP_DIR}. Run \`pnpm build\` first.`);
    process.exit(1);
  }

  const all = [];
  for (const p of walkHtml(APP_DIR)) {
    const route = pathToRoute(p);
    if (ROUTE_FILTER && route !== ROUTE_FILTER) continue;
    all.push(...scanPage(p));
  }

  // Group by type and by page for the report
  const byType = new Map();
  const byPage = new Map();
  for (const f of all) {
    byType.set(f.type, (byType.get(f.type) ?? 0) + 1);
    if (!byPage.has(f.page)) byPage.set(f.page, []);
    byPage.get(f.page).push(f);
  }

  const totalPages = new Set(all.map((f) => f.page)).size;
  console.log(`\nMobile overflow audit @ ${VIEWPORT}px viewport`);
  console.log(`Pages with findings: ${totalPages}    Total findings: ${all.length}`);
  console.log("");
  console.log("=== BY TYPE ===");
  for (const [type, count] of [...byType.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${type.padEnd(28)} ${count}`);
  }

  console.log("\n=== BY PAGE (top 25) ===");
  const ranked = [...byPage.entries()]
    .map(([p, fs]) => ({ page: p, count: fs.length, findings: fs }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 25);
  for (const { page, count, findings } of ranked) {
    console.log(`\n${page}  (${count})`);
    // Show first 5 unique selectors per type
    const seen = new Set();
    for (const f of findings) {
      const key = `${f.type}::${f.selector}`;
      if (seen.has(key)) continue;
      seen.add(key);
      console.log(`  [${f.type}] ${f.value}`);
      console.log(`     ${f.selector}`);
      if (seen.size >= 8) break;
    }
  }

  // Also write JSON for downstream tooling
  const outPath = path.join(ROOT, "mobile-overflow-report.json");
  fs.writeFileSync(outPath, JSON.stringify({ viewport: VIEWPORT, totals: { pages: totalPages, findings: all.length }, byType: Object.fromEntries(byType), findings: all }, null, 2));
  console.log(`\nFull report written to ${outPath}`);
}

main();
