#!/usr/bin/env node
/**
 * Mobile-overflow QA (Task 10) — NOT a build gate. Self-contained: run from the
 * repo root AFTER `pnpm build` with:
 *
 *     node scripts/qa/check-360.mjs
 *
 * It starts `next start` from the existing build on the next free port, loads the
 * 9 operating-pressure routes at 360×800, and asserts
 * document.documentElement.scrollWidth ≤ 360 (no page-level horizontal overflow;
 * wide tables must scroll inside their own box). It launches Playwright with the
 * installed Google Chrome (channel "chrome") and falls back to Playwright's
 * bundled Chromium. It stops only the server it started.
 *
 * If Playwright (or any browser) is unavailable, it prints a notice and exits 0.
 */
import { spawn } from "node:child_process";
import net from "node:net";
import path from "node:path";
import fs from "node:fs";

const ROUTES = [
  "/what-pressure-should-r22/",
  "/what-pressure-should-410a/",
  "/what-pressure-should-r32/",
  "/what-pressure-should-r454b/",
  "/what-pressure-should-r407c/",
  "/what-pressure-should-r404a/",
  "/what-pressure-should-r449a/",
  "/what-pressure-should-r454c/",
  "/what-pressure-should-r744/",
];
const ROOT = process.cwd();
const VIEWPORT = { width: 360, height: 800 };

function portFree(p) {
  return new Promise((resolve) => {
    const srv = net.createServer();
    srv.once("error", () => resolve(false));
    srv.once("listening", () => srv.close(() => resolve(true)));
    srv.listen(p, "127.0.0.1");
  });
}
async function nextFreePort(start = 3200, end = 3260) {
  for (let p = start; p <= end; p++) if (await portFree(p)) return p;
  throw new Error("no free port in 3200-3260");
}
function waitFor200(url, timeoutMs = 60000) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    const tick = async () => {
      try {
        const r = await fetch(url);
        if (r.ok) return resolve(true);
      } catch { /* not up yet */ }
      if (Date.now() > deadline) return reject(new Error("server did not become ready"));
      setTimeout(tick, 500);
    };
    tick();
  });
}

if (!fs.existsSync(path.join(ROOT, ".next"))) {
  console.log("[check-360] no .next build found — run `pnpm build` first. Skipping.");
  process.exit(0);
}

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.log("[check-360] Playwright not installed — skipping 360px overflow check.");
  process.exit(0);
}

const port = await nextFreePort();
const base = `http://127.0.0.1:${port}`;
const nextBin = path.join(ROOT, "node_modules", ".bin", "next");
const server = spawn(nextBin, ["start", "-p", String(port)], { cwd: ROOT, stdio: "ignore" });

let stopped = false;
const stopServer = () => {
  if (stopped) return;
  stopped = true;
  try { server.kill("SIGTERM"); } catch { /* already gone */ }
};
process.on("exit", stopServer);
process.on("SIGINT", () => { stopServer(); process.exit(130); });

let exitCode = 0;
try {
  await waitFor200(base + ROUTES[0]);

  let browser;
  try {
    browser = await chromium.launch({ channel: "chrome" });
    console.log("[check-360] using Google Chrome (channel: chrome)");
  } catch {
    try {
      browser = await chromium.launch();
      console.log("[check-360] Chrome channel unavailable — using Playwright Chromium");
    } catch (e) {
      console.log(`[check-360] no browser available (${String(e).split("\n")[0]}) — skipping.`);
      stopServer();
      process.exit(0);
    }
  }

  const page = await browser.newPage({ viewport: VIEWPORT });
  console.log(`[check-360] viewport ${VIEWPORT.width}×${VIEWPORT.height} against ${base}`);
  let fails = 0;
  for (const route of ROUTES) {
    const resp = await page.goto(base + route, { waitUntil: "networkidle" }).catch((e) => ({ ok: () => false, _e: e }));
    if (!resp || !resp.ok?.()) {
      console.log(`  ✗ ${route} — failed to load`);
      fails++;
      continue;
    }
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    const ok = sw <= VIEWPORT.width;
    if (!ok) fails++;
    console.log(`  ${ok ? "✓" : "✗"} ${route} — scrollWidth ${sw}px ${ok ? "≤ 360" : "> 360 (OVERFLOW)"}`);
  }
  await browser.close();
  console.log(fails ? `[check-360] ${fails} route(s) overflow 360px` : "[check-360] OK — no route overflows 360px");
} catch (e) {
  console.log(`[check-360] error: ${String(e).split("\n")[0]}`);
} finally {
  stopServer();
}
process.exit(exitCode);
