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
  const label = src ? `${src.publisher} ${src.year}` : id;
  const href = src?.url ?? `/sources/#${id}`;
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
