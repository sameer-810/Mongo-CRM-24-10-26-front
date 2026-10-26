import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { canAccessRoute, getDefaultRoute, protectedRoutes } from "./lib/rbac";

// Define public routes that should redirect to dashboard if authenticated
const authRoutes = ["/login", "/register"];
// Define public routes that don't require authentication and shouldn't redirect if authenticated
const publicRoutes = ["/reset-password"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Check if the current route is an auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Check if the current route is a public route (like reset-password)
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Allow public routes to pass through without authentication checks
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Get session token
  const sessionToken =
    request.cookies.get("next-auth.session-token") ||
    request.cookies.get("__Secure-next-auth.session-token");

  // For protected routes
  if (isProtectedRoute) {
    // If no session, redirect to login
    if (!sessionToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Get user role from JWT token
    try {
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
      });

      if (!token || (token as any).error === "RefreshAccessTokenError") {
        // No token found or token expired/invalid, redirect to login
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
      }

      const userRoleRaw = token.role as string;
      const userRole = userRoleRaw?.toLowerCase();
      const isPasswordChanged = (token as any).isPasswordChanged as boolean;

      // If no role, redirect to login
      if (!userRole) {
        const loginUrl = new URL("/login", request.url);
        return NextResponse.redirect(loginUrl);
      }

      // Force redirect to profile if password not changed (except Admin)
      if (
        isPasswordChanged === false &&
        userRole !== "admin" &&
        pathname !== "/profile"
      ) {
        return NextResponse.redirect(new URL("/profile", request.url));
      }

      // Check if user has access to this route based on role
      if (!canAccessRoute(userRole, pathname)) {
        // Redirect to default route for their role
        const defaultRoute = getDefaultRoute(userRole);
        const redirectUrl = new URL(defaultRoute, request.url);
        return NextResponse.redirect(redirectUrl);
      }
    } catch (error) {
      // If token parsing fails, redirect to login
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // For auth routes, redirect to dashboard if session exists
  if (isAuthRoute) {
    if (sessionToken) {
      try {
        const token = await getToken({
          req: request,
          secret: process.env.NEXTAUTH_SECRET,
        });

        if (token) {
          const userRole = (token.role as string)?.toLowerCase();
          const isPasswordChanged = (token as any).isPasswordChanged as boolean;

          // If password not changed (for non-admin/manager), always go to profile
          if (!isPasswordChanged && userRole !== "admin") {
            return NextResponse.redirect(new URL("/profile", request.url));
          }

          // Otherwise use the default route for the role
          const defaultRoute = getDefaultRoute(userRole);
          return NextResponse.redirect(new URL(defaultRoute, request.url));
        }
      } catch (error) {
        console.error("Middleware auth redirect error:", error);
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
