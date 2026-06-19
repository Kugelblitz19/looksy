import { NextRequest, NextResponse } from "next/server";
import { findUser, verifyPassword } from "@/lib/auth/users";
import { signToken, sessionCookie } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const emailNorm = String(email ?? "").trim().toLowerCase();

    if (!emailNorm || typeof password !== "string" || !password) {
      return NextResponse.json(
        { error: "Enter your email and password." },
        { status: 400 },
      );
    }

    const user = await findUser(emailNorm);
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { error: "Incorrect email or password." },
        { status: 401 },
      );
    }

    const res = NextResponse.json({
      ok: true,
      user: { email: user.email, name: user.name },
    });
    res.cookies.set(sessionCookie(signToken({ email: user.email, name: user.name })));
    return res;
  } catch {
    return NextResponse.json({ error: "Could not log you in." }, { status: 500 });
  }
}
