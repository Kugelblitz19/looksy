import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const runtime = "nodejs";

/** Saved looks live in Supabase, so this feature requires it to be configured. */
async function getSupabaseUser() {
  if (!isSupabaseConfigured) return { supabase: null, user: null };
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function GET() {
  const { supabase, user } = await getSupabaseUser();
  if (!supabase) return NextResponse.json({ looks: [] });
  if (!user) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  const { data, error } = await supabase
    .from("saved_looks")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ looks: data });
}

export async function POST(req: NextRequest) {
  const { supabase, user } = await getSupabaseUser();
  if (!supabase) {
    return NextResponse.json(
      { error: "Saving looks needs Supabase connected." },
      { status: 400 },
    );
  }
  if (!user) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  const body = await req.json();
  const imageUrl = body?.imageUrl;
  if (typeof imageUrl !== "string" || !imageUrl) {
    return NextResponse.json({ error: "Missing image." }, { status: 400 });
  }

  // NOTE: stores the image as a data URL for now. Upgrade: upload to Supabase
  // Storage and persist the public URL instead, to keep rows small.
  const { data, error } = await supabase
    .from("saved_looks")
    .insert({
      user_id: user.id,
      image_url: imageUrl,
      prompt: typeof body?.prompt === "string" ? body.prompt : null,
      aesthetics: Array.isArray(body?.aesthetics) ? body.aesthetics : [],
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ look: data });
}
