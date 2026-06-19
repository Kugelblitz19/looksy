import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { removeStored } from "@/lib/supabase/storage";

export const runtime = "nodejs";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: "Supabase not configured." }, { status: 400 });
  }
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  // Look up the row (RLS-scoped) so we can also clean up its stored image.
  const { data: row } = await supabase
    .from("saved_looks")
    .select("image_url")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  // RLS already restricts deletes to the owner; eq(user_id) is belt-and-braces.
  const { error } = await supabase
    .from("saved_looks")
    .delete()
    .eq("id", params.id)
    .eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (row?.image_url) await removeStored(row.image_url as string);
  return NextResponse.json({ ok: true });
}
