import { authConfig } from "@/auth.config";
import NextAuth from "next-auth";
import { NextRequest, NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);


const PUBLIC_FILE = /\.(.*)$/;
const SUPPORTED_LOCALES = ["en-US", "hi-IN", "en-GB", "en-IN", "en-NG", "en-CA", "en-AU", "en-JP", "en-DE", "en-FR", "en-BR"];

// Map country codes from IP geolocation to locales
const COUNTRY_TO_LOCALE: Record<string, string> = {
  IN: "en-IN", GB: "en-GB", NG: "en-NG", CA: "en-CA", AU: "en-AU",
  JP: "en-JP", DE: "en-DE", FR: "en-FR", BR: "en-BR", US: "en-US",
};
const COUNTRY_TO_CURRENCY: Record<string, string> = {
  IN: "INR", GB: "GBP", NG: "NGN", CA: "CAD", AU: "AUD",
  JP: "JPY", DE: "EUR", FR: "EUR", BR: "BRL", US: "USD",
};

function detectCountry(): string {
  return "IN";
}

import { rateLimit, getClientIp } from "@/lib/rate-limit";

export default auth(async (request) => {
   console.log("MIDDLEWARE HIT:", request.nextUrl.pathname);

  const { pathname } = request.nextUrl;
  const user = request.auth?.user as any;

  // 1. SKIP STATIC & API & IMAGES
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/images/") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 2. DISTRIBUTED RATE LIMITING (Upstash Redis)
  // Protect AI chat and other sensitive endpoints from abuse
  if (pathname.startsWith("/api/chat")) {
    const ip = getClientIp(request);
    const rl = await rateLimit(`middleware:chat:${ip}`, 20, 60_000);
    
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment." }, 
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } }
      );
    }
  }

// const detectedCountry = "IN";
const detectedLocale = "en-IN";
const detectedCurrency = "INR";

  // 3. ADMIN / SUPPORT ROUTES
  if (pathname.startsWith("/admin")) {
    const loginRedirect = `/${detectedLocale}/auth/login?redirect=${encodeURIComponent(pathname)}`;
    const isSupportPortal = pathname.startsWith("/admin/support");

    if (!user) {
      return NextResponse.redirect(new URL(loginRedirect, request.url));
    }

    if (isSupportPortal) {
      const canAccessSupport = user.role === "admin" || user.role === "support";
      if (!canAccessSupport) {
        return NextResponse.redirect(new URL(loginRedirect, request.url));
      }
    } else if (user.role !== "admin") {
      if (user.role === "support") {
        return NextResponse.redirect(new URL("/admin/support", request.url));
      }
      return NextResponse.redirect(new URL(loginRedirect, request.url));
    }

    const adminResponse = NextResponse.next();
    adminResponse.headers.set("x-detected-locale", detectedLocale);
    adminResponse.headers.set("x-detected-currency", detectedCurrency);
    return adminResponse;
  }

  // 4. DETECT COUNTRY + CURRENCY
  const locale = detectedLocale;
  let currency = detectedCurrency;

  const pathnameHasLocale = SUPPORTED_LOCALES.some(
    (l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`
  );

  if (!pathnameHasLocale) {
    const url = new URL(`/${locale}${pathname === "/" ? "" : pathname}`, request.url);
    const response = NextResponse.redirect(url);
    response.headers.set("x-detected-locale", locale);
    response.headers.set("x-detected-currency", currency);
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://api.razorpay.com https://generativelanguage.googleapis.com;");
    return response;
  }

  const pathLocale = SUPPORTED_LOCALES.find(l => pathname.startsWith(`/${l}`));
  if (pathLocale) {
    const cc = Object.entries(COUNTRY_TO_LOCALE).find(([, v]) => v === pathLocale);
    if (cc) currency = COUNTRY_TO_CURRENCY[cc[0]] || "USD";
  }

  const response = NextResponse.next();
  response.headers.set("x-detected-locale", pathLocale || locale);
  response.headers.set("x-detected-currency", currency);
const detectedCountry = detectCountry();

response.headers.set("x-debug-detected-country", detectedCountry);
response.headers.set("x-debug-accept-language",
  request.headers.get("accept-language") || "NONE"
);
  if ((pathname.includes("/auth/login") || pathname.includes("/auth/signup")) && user) {
    const redirectTarget = request.nextUrl.searchParams.get("redirect") || "";

    if (redirectTarget.startsWith("/admin/support")) {
      if (user.role === "admin" || user.role === "support") {
        return NextResponse.redirect(new URL("/admin/support", request.url));
      }
      return response;
    }

    if (redirectTarget.startsWith("/admin")) {
      if (user.role === "admin") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return response;
    }

    return NextResponse.redirect(new URL(`/${pathLocale || locale}/`, request.url));
  }

  return response;
});



export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images/).*)",
  ],
};
