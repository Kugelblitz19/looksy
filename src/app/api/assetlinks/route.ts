import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Digital Asset Links — lets Android verify the Play Store TWA so it opens
 * full-screen with no browser URL bar. Served at /.well-known/assetlinks.json
 * via a rewrite. Fill TWA_PACKAGE_NAME + TWA_CERT_SHA256 (comma-separated
 * SHA-256 fingerprints from Play Console → App integrity, and/or the one
 * PWABuilder gives you) in the host env. Until set, returns an empty list —
 * harmless, just means the TWA isn't verified yet.
 */
export function GET() {
  const pkg = process.env.TWA_PACKAGE_NAME;
  const fingerprints = (process.env.TWA_CERT_SHA256 || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const body =
    pkg && fingerprints.length
      ? [
          {
            relation: ["delegate_permission/common.handle_all_urls"],
            target: {
              namespace: "android_app",
              package_name: pkg,
              sha256_cert_fingerprints: fingerprints,
            },
          },
        ]
      : [];

  return NextResponse.json(body, {
    headers: { "cache-control": "public, max-age=3600" },
  });
}
