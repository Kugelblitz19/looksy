import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  uploadDataUrl,
  toDisplayUrl,
  removeStored,
  SELFIES_BUCKET,
} from "@/lib/supabase/storage";

export const runtime = "nodejs";

async function getUser() {
  if (!isSupabaseConfigured) return { supabase: null, user: null };
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

/** Current user's persisted selfie (signed URL), if any. */
export async function GET() {
  const { supabase, user } = await getUser();
  if (!supabase || !user) return NextResponse.json({ path: null, url: null });

  const { data } = await supabase
    .from("profiles")
    .select("selfie_path")
    .eq("id", user.id)
    .single();
  const path = data?.selfie_path as string | undefined;
  if (!path) return NextResponse.json({ path: null, url: null });

  return NextResponse.json({ path, url: await toDisplayUrl(path, SELFIES_BUCKET) });
}

/** Persist a selfie (data URL) to the private bucket + profiles.selfie_path. */
export async function POST(req: NextRequest) {
  const { supabase, user } = await getUser();
  if (!supabase || !user)
    return NextResponse.json({ error: "Please log in." }, { status: 401 });

  const body = await req.json();
  const imageUrl = body?.imageUrl;
  if (typeof imageUrl !== "string" || !imageUrl.startsWith("data:")) {
    return NextResponse.json({ error: "Missing image." }, { status: 400 });
  }

  const { data: prev } = await supabase
    .from("profiles")
    .select("selfie_path")
    .eq("id", user.id)
    .single();

  let path: string;
  try {
    path = await uploadDataUrl(user.id, imageUrl, SELFIES_BUCKET);
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof Error
            ? `Upload failed (${e.message}). Is the 'selfies' bucket created?`
            : "Upload failed.",
      },
      { status: 500 },
    );
  }

  const { error } = await supabase
    .from("profiles")
    .update({ selfie_path: path })
    .eq("id", user.id);
  if (error) {
    await removeStored(path, SELFIES_BUCKET);
    return NextResponse.json(
      { error: `Couldn't save selfie: ${error.message}` },
      { status: 500 },
    );
  }

  if (prev?.selfie_path)
    await removeStored(prev.selfie_path as string, SELFIES_BUCKET);

  return NextResponse.json({ path, url: await toDisplayUrl(path, SELFIES_BUCKET) });
}

export async function DELETE() {
  const { supabase, user } = await getUser();
  if (!supabase || !user)
    return NextResponse.json({ error: "Please log in." }, { status: 401 });

  const { data: prev } = await supabase
    .from("profiles")
    .select("selfie_path")
    .eq("id", user.id)
    .single();
  await supabase.from("profiles").update({ selfie_path: null }).eq("id", user.id);
  if (prev?.selfie_path)
    await removeStored(prev.selfie_path as string, SELFIES_BUCKET);

  return NextResponse.json({ ok: true });
}
