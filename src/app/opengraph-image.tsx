import { ImageResponse } from "next/og";

export const alt = "Looksy — See yourself in any look";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
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
          background:
            "linear-gradient(135deg, #1a0b2e 0%, #0a0a0f 48%, #07223a 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #d946ef, #4f46e5)",
            }}
          >
            <svg width="54" height="54" viewBox="0 0 48 48">
              <path
                d="M24 6 L27.5 20.5 L42 24 L27.5 27.5 L24 42 L20.5 27.5 L6 24 L20.5 20.5 Z"
                fill="#ffffff"
              />
            </svg>
          </div>
          <div style={{ fontSize: 92, fontWeight: 800, letterSpacing: -2 }}>
            Looksy
          </div>
        </div>
        <div
          style={{
            fontSize: 42,
            fontWeight: 600,
            color: "rgba(255,255,255,0.92)",
          }}
        >
          See yourself in any look.
        </div>
        <div
          style={{
            fontSize: 26,
            marginTop: 16,
            color: "rgba(255,255,255,0.55)",
          }}
        >
          Your selfie, restyled by AI — and instantly shoppable.
        </div>
      </div>
    ),
    { ...size },
  );
}
