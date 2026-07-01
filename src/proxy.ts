import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

const PROTECTED_PATHS = [
  "/tutor",
  "/student",
  "/dashboard",
  "/wallet",
  "/messages",
  "/profile",
  "/book-session",
  "/connect",
  "/notes",
  "/skillswap",
  "/history",
  "/search",
];

const PUBLIC_PREFIXES = ["/api/auth", "/_next", "/favicon", "/login", "/signup", "/"];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return;
  }

  const isProtected = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (isProtected && !req.auth) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return Response.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
