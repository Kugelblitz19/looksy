/**
 * Hot-metal typesetting: renders text so each letter drops and settles into
 * place on load, like a line set on a printing press. Decorative only — the
 * full word stays accessible via aria-label.
 */
export default function Typeset({
  text,
  className = "",
  delay = 0,
}: {
  text: string;
  className?: string;
  /** Seconds before the line starts setting. */
  delay?: number;
}) {
  return (
    <span className={className} aria-label={text}>
      {Array.from(text).map((ch, i) => (
        <span
          key={i}
          aria-hidden
          className="animate-typeset"
          style={{ animationDelay: `${delay + i * 0.045}s` }}
        >
          {ch === " " ? " " : ch}
        </span>
      ))}
    </span>
  );
}
