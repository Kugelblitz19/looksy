import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Public paths that an unauthenticated visitor may load. */
function isPublicPath(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/look") ||
    // Metadata image routes must be reachable by social/crawler bots (no auth).
    pathname.startsWith("/opengraph-image") ||
    pathname.startsWith("/twitter-image") ||
    pathname.startsWith("/icon") ||
    // PWA: the manifest + service worker must load without auth.
    pathname === "/manifest.webmanifest" ||
    pathname === "/sw.js" ||
    // Android TWA verification file (Play Store).
    pathname.startsWith("/.well-known")
  );
}

/**
 * Refreshes the Supabase session on every request and redirects unauthenticated
 * visitors to /login. The request/response cookie handshake here is load-bearing
 * — do not insert logic between createServerClient() and getUser().
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // A Supabase outage must not throw here and 500 every request — treat a
  // failed lookup as signed out (page-level guards still gate protected pages).
  let user = null;
  try {
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch {
    user = null;
  }

  if (!user && !isPublicPath(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Must be returned unmodified so refreshed cookies reach the browser.
  return supabaseResponse;
}
