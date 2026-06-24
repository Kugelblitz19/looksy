import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/** Store a post-use rating (1–5) + optional one-liner. Anonymous is allowed;
 *  the user is attached when signed in. Writes via the service role. */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rating = Number(body?.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be 1–5." }, { status: 400 });
    }
    const comment =
      typeof body?.comment === "string" && body.comment.trim()
        ? body.comment.trim().slice(0, 500)
        : null;

    if (!isSupabaseConfigured) {
      return NextResponse.json({ ok: true, stored: false });
    }

    let userId: string | null = null;
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      userId = user?.id ?? null;
    } catch {
      /* anonymous rating */
    }

    const admin = createAdminClient();
    const { error } = await admin
      .from("feedback")
      .insert({ user_id: userId, rating, comment });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, stored: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 },
    );
  }
}
