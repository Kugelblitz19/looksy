import { ImageResponse } from "next/og";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const alt = "A look made with Looksy";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function LookOgImage({
  params,
}: {
  params: { token: string };
}) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("saved_looks")
    .select("public_image_url")
    .eq("share_token", params.token)
    .eq("is_public", true)
    .single();
  const img = data?.public_image_url as string | undefined;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "linear-gradient(135deg, #1a0b2e 0%, #0a0a0f 55%, #07223a 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        {img && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt="" width={504} height={630} style={{ width: 504, height: 630, objectFit: "cover" }} />
        )}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: 64,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #d946ef, #4f46e5)",
              }}
            >
              <svg width="38" height="38" viewBox="0 0 48 48">
                <path d="M24 6 L27.5 20.5 L42 24 L27.5 27.5 L24 42 L20.5 27.5 L6 24 L20.5 20.5 Z" fill="#fff" />
              </svg>
            </div>
            <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: -1 }}>Looksy</div>
          </div>
          <div style={{ fontSize: 40, fontWeight: 600 }}>Make your own on Looksy.</div>
          <div style={{ fontSize: 24, marginTop: 14, color: "rgba(255,255,255,0.55)" }}>
            AI-styled & instantly shoppable.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
