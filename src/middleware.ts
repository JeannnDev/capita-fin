import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
    // Check for better-auth session cookie
    // It can be "better-auth.session-token" or "__Secure-better-auth.session-token"
    const sessionCookie = request.cookies.get("better-auth.session-token") || 
                          request.cookies.get("__Secure-better-auth.session-token");

    const { pathname } = request.nextUrl;

    // Public routes that don't require authentication
    const isPublicRoute = 
        pathname === "/login" || 
        pathname === "/forgot-password" || 
        pathname === "/reset-password" || 
        pathname.startsWith("/api/auth");

    if (!sessionCookie && !isPublicRoute) {
        // Redirect to login if not authenticated and trying to access a protected route
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (sessionCookie && (pathname === "/login" || pathname === "/forgot-password" || pathname === "/reset-password")) {
        // Redirect to dashboard if already authenticated and trying to access auth pages
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}

export const config = {
    // Match all routes except static files, api routes (except auth), and common files
    matcher: ["/((?!api/|static/|_next/static/|_next/image/|favicon.ico|.*\\.png|.*\\.jpg).*)"],
};
