import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";

// On initialise NextAuth uniquement avec la config Edge (sans Bcrypt/Prisma)
const { auth } = NextAuth(authConfig);

const ipMap = new Map<string, { count: number; lastReset: number }>();

export default auth((req: any) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";

  if (nextUrl.pathname.startsWith("/api/auth") || nextUrl.pathname === "/connexion") {
    const rateLimit = ipMap.get(ip) || { count: 0, lastReset: Date.now() };
    if (Date.now() - rateLimit.lastReset > 60000) {
      rateLimit.count = 0;
      rateLimit.lastReset = Date.now();
    }
    if (rateLimit.count > 10) return new NextResponse("Too Many Requests", { status: 429 });
    rateLimit.count++;
    ipMap.set(ip, rateLimit);
  }

  if (nextUrl.pathname.startsWith("/admin")) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/connexion", nextUrl));
    if (role !== "ADMIN") return NextResponse.redirect(new URL("/", nextUrl));
  }

  if (nextUrl.pathname.startsWith("/espace-client")) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/connexion", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images).*)"],
};