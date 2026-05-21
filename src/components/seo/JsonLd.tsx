/**
 * Renders a JSON-LD `@graph` payload as a single `<script type="application/ld+json">`.
 *
 * Per the Next.js docs, `<` is escaped to `<` to prevent XSS injection
 * from user/data values. We don't currently render any user-submitted strings
 * inside schema, but the escape is cheap insurance against, e.g., a manufacturer
 * trade name containing a `<` that breaks out of the script tag.
 */
export function JsonLd({ graph }: { graph: object[] }) {
  const payload = { "@context": "https://schema.org", "@graph": graph };
  const serialized = JSON.stringify(payload).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serialized }}
    />
  );
}
