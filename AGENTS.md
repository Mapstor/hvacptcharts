<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Content dates & commits

Page dates come from `data/content-dates.json` (generated from git by
`scripts/update-content-dates.mjs`); the build never calls git or file mtimes.
After changing a page's visible content, update its date in the SAME commit
(`pnpm run update-content-dates`, or `--touch /route/`) and stage the JSON.
Put `[no-date]` in the message of mechanical commits (refactors/infra/formatting)
so they don't bump any page's "Updated" date. See CLAUDE.md for details.
