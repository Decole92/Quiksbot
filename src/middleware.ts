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
]);

// Custom middleware function
async function middleware(request: NextRequest, event: any) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/chatbot")) {
    const response = NextResponse.next();
    response.headers.set("Content-Security-Policy", "frame-ancestors 'self' *");
    response.headers.set("X-Frame-Options", "SAMEORIGIN");
    return response;
  }

  return clerkMiddleware((auth) => {
    if (isProtectedRoute(request)) {
      auth().protect();
    } else if (!isPublicRoute(request)) {
      auth().protect();
    }
  })(request, event);
}

export default middleware;

export const config = {
  matcher: [
    "/((?!.*\\..*|_next).*)", // Match all pages except files and _next paths
    "/", // Match the root path
    "/(api|trpc)(.*)", // Match API and TRPC routes
    "/webhook", // Ensure the webhook route is matched
  ],
};
