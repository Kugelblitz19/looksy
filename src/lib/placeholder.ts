import { getAesthetic } from "./aesthetics";

const GRADIENTS: [string, string][] = [
  ["#ff6b6b", "#5f27cd"],
  ["#0abde3", "#341f97"],
  ["#1dd1a1", "#10ac84"],
  ["#feca57", "#ee5253"],
];

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, (c) =>
    c === "<"
      ? "&lt;"
      : c === ">"
        ? "&gt;"
        : c === "&"
          ? "&amp;"
          : c === "'"
            ? "&apos;"
            : "&quot;",
  );
}

/**
 * Builds a styled SVG placeholder so the full generate -> feed flow is
 * demonstrable even before an API key is configured. Clearly marked DEMO.
 */
export function placeholderDataUrl(aestheticIds: string[], i: number): string {
  const [c1, c2] = GRADIENTS[i % GRADIENTS.length];
  const labels =
    aestheticIds
      .map(getAesthetic)
      .filter(Boolean)
      .map((a) => `${a!.emoji} ${a!.label}`)
      .join("   ") || "✨ Your Look";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="768" height="1024" viewBox="0 0 768 1024">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${c1}"/>
      <stop offset="100%" stop-color="${c2}"/>
    </linearGradient>
  </defs>
  <rect width="768" height="1024" fill="url(#g)"/>
  <circle cx="384" cy="380" r="150" fill="rgba(255,255,255,0.14)"/>
  <text x="384" y="405" font-family="system-ui, sans-serif" font-size="120" text-anchor="middle">🧍</text>
  <text x="384" y="640" font-family="system-ui, sans-serif" font-size="40" font-weight="700" fill="white" text-anchor="middle">${escapeXml(labels)}</text>
  <text x="384" y="700" font-family="system-ui, sans-serif" font-size="24" fill="rgba(255,255,255,0.85)" text-anchor="middle">DEMO MODE</text>
  <text x="384" y="738" font-family="system-ui, sans-serif" font-size="20" fill="rgba(255,255,255,0.7)" text-anchor="middle">Add GEMINI_API_KEY for real generation</text>
</svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}
