import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";

// Define route matchers for protected and public routes
const isProtectedRoute = createRouteMatcher([
  "(admin)/(.*)",
  "/create-chatbot(.*)",
  "/dashboard(.*)",
  "/edit-chatbot(.*)",
  "/review-session(.*)",
  "/analytic(.*)",
  "/chatlogs(.*)",
  "/pricing(.*)",
  "/settings(.*)",
  "/integration(.*)",
  "/email-compaign(.*)",
]);

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/(.*)",
  "/chatbot/(.*)",
  "/",
  "/appointmentToken/(.*)",
  "/webhook",
  "/whatsapp",
  "/server.js",
  "/send-notification",
]);

// Custom middleware function
async function middleware(request: NextRequest, event: any) {
  const { pathname } = request.nextUrl;

  if (request.url.includes("/api/socket")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/chatbot")) {
    const response = NextResponse.next();
    response.headers.set("Content-Security-Policy", "frame-ancestors 'self' *");
    response.headers.set("X-Frame-Options", "SAMEORIGIN");
    return response;
  }

  return clerkMiddleware(async (auth, req) => {
    if (isProtectedRoute(req) || !isPublicRoute(req)) {
      await auth.protect();
    }
  })(request, event);
}

export default middleware;

export const config = {
  matcher: [
    "/((?!.*\\..*|_next).*)", // Match all pages except files and _next paths
    "/", // Match the root path
    "/(api|trpc)(.*)", // Match API and TRPC routes
    "/webhook",
    "/whatsapp",
    "/server.js",
    "/api/socket/:path*",
    "/send-notification",
    // Ensure the webhook route is matched
  ],
};
