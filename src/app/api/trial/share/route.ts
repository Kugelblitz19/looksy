import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Grants the guest "share to unlock" bonus: sets an httpOnly cookie that lifts
 * the guest look allowance from 1 to 3. Called by the client when a guest taps
 * "Share to unlock". We can't verify the share was actually delivered, so this
 * grants on intent — the stakes (2 extra demo looks) are tiny, and the per-IP
 * rate limit on /api/generate remains the real backstop.
 */
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("looksy_shared", "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
