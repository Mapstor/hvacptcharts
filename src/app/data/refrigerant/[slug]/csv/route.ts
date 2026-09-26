import { getRefrigerant, getAllSlugs } from "@/data/refrigerants";

export const dynamic = "force-static";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

// CoolProp fluids carry a temperature-indexed `ptChart`; the manufacturer
// datasheet blends CoolProp can't model (e.g. R-438A, R-448A) carry a
// pressure-indexed `ptTable` instead. Serialise whichever one holds the data,
// each in its own native form, so the CSV download is never just a header.
const CHART_HEADER = "tempF,tempC,bubblePsig,dewPsig,bubbleKpag,dewKpag,displayPsig,displayKpag";
const TABLE_HEADER = "pressure_psig,bubble_temp_F,dew_temp_F";

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const r = getRefrigerant(slug);
  if (!r) return new Response("Not found", { status: 404 });

  let header: string;
  let rows: string[];
  if (r.ptChart.length > 0) {
    header = CHART_HEADER;
    rows = r.ptChart.map(
      (p) =>
        `${p.tempF},${p.tempC},${p.bubblePsig},${p.dewPsig},${p.bubbleKpag},${p.dewKpag},${p.displayPsig},${p.displayKpag}`
    );
  } else if (r.ptTable && r.ptTable.length > 0) {
    header = TABLE_HEADER;
    rows = r.ptTable.map((p) => `${p.psig},${p.bubbleF},${p.dewF}`);
  } else {
    // No PT dataset at all (e.g. R-503, discontinued/noindexed): header only.
    header = CHART_HEADER;
    rows = [];
  }
  const body = [header, ...rows].join("\n") + "\n";

  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug}-pt-chart.csv"`,
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
