/**
 * Pressroom — the print-craft background, mounted once globally.
 * A paper-fibre grain over the whole page plus printer's crop marks at the
 * four page corners, so every screen reads like a proof fresh off the press.
 * Purely decorative, colourless, non-blocking.
 */
function CropMark({ corner }: { corner: "tl" | "tr" | "bl" | "br" }) {
  const pos = {
    tl: "left-4 top-4",
    tr: "right-4 top-4",
    bl: "left-4 bottom-4",
    br: "right-4 bottom-4",
  }[corner];
  return (
    <span className={`absolute ${pos}`}>
      {/* the two arms of the L meet at the trim corner */}
      <span
        className={`absolute h-px w-4 bg-ink/30 ${corner.includes("r") ? "right-0" : "left-0"} ${corner.includes("b") ? "bottom-0" : "top-0"}`}
      />
      <span
        className={`absolute w-px h-4 bg-ink/30 ${corner.includes("r") ? "right-0" : "left-0"} ${corner.includes("b") ? "bottom-0" : "top-0"}`}
      />
    </span>
  );
}

export default function Pressroom() {
  return (
    <>
      <div aria-hidden className="paper-grain" />
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[45]">
        <CropMark corner="tl" />
        <CropMark corner="tr" />
        <CropMark corner="bl" />
        <CropMark corner="br" />
      </div>
    </>
  );
}
