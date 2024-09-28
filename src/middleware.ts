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
]);

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/(.*)",
  "/chatbot/(.*)",
  "/",
  "/api/webhook",
]);

// Function to check if the request is from a crawler
function isCrawler(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") || "";
  return /bot|crawler|spider|crawling/i.test(userAgent);
}

// Custom middleware function
async function middleware(request: NextRequest, event: any) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/chatbot")) {
    const response = NextResponse.next();
    response.headers.set("Content-Security-Policy", "frame-ancestors 'self' *");
    response.headers.set("X-Frame-Options", "SAMEORIGIN");
    return response;
  }

  // Allow crawlers to access all routes
  if (isCrawler(request)) {
    return NextResponse.next();
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
  ],
};
