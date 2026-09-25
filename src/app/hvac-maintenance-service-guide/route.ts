export const dynamic = "force-dynamic";

// This guide was removed (task 4A) as off-topic for a PT-chart site and low/erroneous
// quality. Serve 410 Gone (not 404) so search engines drop it promptly, with a noindex
// header and links back to the parts of the site worth keeping.
export function GET() {
  const body = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>This guide has been removed</title>
</head>
<body style="font-family:system-ui,-apple-system,sans-serif;max-width:40rem;margin:4rem auto;padding:0 1rem;line-height:1.6;color:#18181b">
<h1>This guide has been removed.</h1>
<p>This page is no longer available. Try one of these instead:</p>
<ul>
<li><a href="/pt-charts-tools-hub/">PT charts &amp; tools</a></li>
<li><a href="/calculators-hub/">HVAC calculators</a></li>
<li><a href="/">Home</a></li>
</ul>
</body>
</html>`;
  return new Response(body, {
    status: 410,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Robots-Tag": "noindex",
    },
  });
}
