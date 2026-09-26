import sources from "../../../data/sources.json";

type SourceRecord = {
  title: string;
  publisher: string;
  year: number;
  url: string;
  accessed: string;
};

const SOURCES = sources as Record<string, SourceRecord>;

export function Cite({ id }: { id: string }) {
  const src = SOURCES[id];
  // Render a compact, consistent citation marker — the standard's short name
  // (the part of the title before the colon), not the full publisher name.
  // Previously this printed the sprawling "[Air-Conditioning, Heating, and
  // Refrigeration Institute (AHRI) 2017]" inline in the cylinder caption; the
  // short form reads like the other bracketed citation markers on the page.
  const label = src ? `${src.title.split(":")[0].trim()}` : id;
  const href = src?.url ?? `#src-${id}`;
  return (
    <sup className="ml-0.5">
      <a
        href={href}
        title={src ? `${src.title} (${src.publisher}, ${src.year})` : `Source: ${id}`}
        className="text-xs text-blue-700 hover:underline dark:text-blue-300"
        rel="nofollow"
      >
        [{label}]
      </a>
    </sup>
  );
}
