import { NextRequest, NextResponse } from "next/server";
import { createUser, findUser } from "@/lib/auth/users";
import { signToken, sessionCookie } from "@/lib/auth/session";

export const runtime = "nodejs";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

    const emailNorm = String(email ?? "").trim().toLowerCase();
    if (!EMAIL_RE.test(emailNorm)) {
      return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
    }
    if (typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 },
      );
    }
    if (await findUser(emailNorm)) {
      return NextResponse.json(
        { error: "An account with this email already exists. Try logging in." },
        { status: 409 },
      );
    }

    const user = await createUser(
      emailNorm,
      password,
      name ? String(name).trim() : undefined,
    );

    const res = NextResponse.json({
      ok: true,
      user: { email: user.email, name: user.name },
    });
    res.cookies.set(sessionCookie(signToken({ email: user.email, name: user.name })));
    return res;
  } catch {
    return NextResponse.json({ error: "Could not create your account." }, { status: 500 });
  }
}
