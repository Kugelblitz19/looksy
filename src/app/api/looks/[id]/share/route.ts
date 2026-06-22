import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { copyToPublic } from "@/lib/supabase/storage";

export const runtime = "nodejs";

/** Make a saved look public: copy its image to the public bucket + mint a token. */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  if (!isSupabaseConfigured)
    return NextResponse.json({ error: "Supabase not configured." }, { status: 400 });

  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  const { data: row, error: rowErr } = await supabase
    .from("saved_looks")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();
  if (rowErr || !row)
    return NextResponse.json({ error: "Look not found." }, { status: 404 });

  const origin = new URL(req.url).origin;

  // Already shared — return the existing link.
  if (row.is_public && row.share_token) {
    return NextResponse.json({
      token: row.share_token,
      url: `${origin}/look/${row.share_token}`,
    });
  }

  let publicImageUrl: string;
  try {
    publicImageUrl = await copyToPublic(row.image_url as string);
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof Error
            ? `Couldn't publish image (${e.message}). Is the 'public-looks' bucket created?`
            : "Publish failed.",
      },
      { status: 500 },
    );
  }

  const token = randomUUID().replace(/-/g, "").slice(0, 12);
  const { error } = await supabase
    .from("saved_looks")
    .update({
      is_public: true,
      share_token: token,
      public_image_url: publicImageUrl,
    })
    .eq("id", params.id)
    .eq("user_id", user.id);
  if (error)
    return NextResponse.json(
      { error: `Couldn't publish: ${error.message}` },
      { status: 500 },
    );

  return NextResponse.json({ token, url: `${origin}/look/${token}` });
}
