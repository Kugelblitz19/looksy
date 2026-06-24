import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Until Supabase keys are set, do nothing here — the app falls back to the
  // built-in auth (which gates pages itself), so the app keeps working.
  if (!isSupabaseConfigured) {
    return NextResponse.next();
  }
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Run on every path except static assets, image/font files, and the heavy
     * API routes that already enforce auth themselves (avoids a second
     * getUser() on the hot path).
     */
    "/((?!_next/static|_next/image|favicon.ico|api/generate|api/shop|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2|ttf)$).*)",
  ],
};
