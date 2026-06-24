import { ImageResponse } from "next/og";

/** The Looksy app icon — a bone "L" monogram with a vermilion underline on the
 *  warm-black brand stock. Rendered at request size for the PWA manifest. */
export function brandIcon(size: number) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0E0B08",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: Math.round(size * 0.56),
            lineHeight: 1,
            fontFamily: "Georgia, serif",
            fontWeight: 700,
            color: "#EDE8DF",
          }}
        >
          L
        </div>
        <div
          style={{
            marginTop: Math.round(size * 0.05),
            width: Math.round(size * 0.18),
            height: Math.round(size * 0.03),
            background: "#E5341B",
          }}
        />
      </div>
    ),
    { width: size, height: size },
  );
}
