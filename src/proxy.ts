import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for session cookies — better-auth uses better-auth.session_token (or __Secure- prefix on HTTPS)
  const hasSession =
    request.cookies.has("better-auth.session_token") ||
    request.cookies.has("__Secure-better-auth.session_token") ||
    request.cookies.has("auth.session_token") ||
    request.cookies.has("session_token");

  // Public/auth routes
  const isAuthRoute = pathname === "/login" || pathname === "/register";
  const isProtectedRoute =
    pathname.startsWith("/home") ||
    pathname.startsWith("/belajar") ||
    pathname.startsWith("/profile");

  // If user is already authenticated and visits login or register, redirect to /home
  if (hasSession && isAuthRoute) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  // If user is not authenticated and visits protected route, redirect to /login
  if (!hasSession && isProtectedRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images and icons (.svg, .png, .jpg, .jpeg, .webp, .ico)
     * - api routes
     */
    "/((?!api|_next/static|_next/image|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)",
  ],
};
