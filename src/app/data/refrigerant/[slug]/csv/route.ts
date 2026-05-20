import { getRefrigerant, getAllSlugs } from "@/data/refrigerants";

export const dynamic = "force-static";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

const CSV_HEADER = "tempF,tempC,bubblePsig,dewPsig,bubbleKpag,dewKpag,displayPsig,displayKpag";

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const r = getRefrigerant(slug);
  if (!r) return new Response("Not found", { status: 404 });

  const rows = r.ptChart.map(
    (p) =>
      `${p.tempF},${p.tempC},${p.bubblePsig},${p.dewPsig},${p.bubbleKpag},${p.dewKpag},${p.displayPsig},${p.displayKpag}`
  );
  const body = [CSV_HEADER, ...rows].join("\n") + "\n";

  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug}-pt-chart.csv"`,
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
