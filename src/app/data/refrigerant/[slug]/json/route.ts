import { getRefrigerant, getAllSlugs } from "@/data/refrigerants";

export const dynamic = "force-static";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const r = getRefrigerant(slug);
  if (!r) return new Response("Not found", { status: 404 });

  return new Response(JSON.stringify(r, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug}.json"`,
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
