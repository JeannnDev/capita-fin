import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
    const allCookies = request.cookies.getAll();
    const { pathname } = request.nextUrl;

    // Procura por qualquer cookie que contenha "session_token" ou "session-token"
    const sessionCookie = allCookies.find(c => 
        c.name.includes("session-token") || 
        c.name.includes("session_token")
    );

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
