import { NextResponse, type NextRequest } from "next/server";

/**
 * Forces every request onto HTTPS.
 * Works behind any reverse proxy / host that sets the standard
 * `x-forwarded-proto` header (Nginx, Cloudflare, Vercel, Render, etc).
 * Localhost is left alone so `npm run dev` keeps working over http.
 */
export function middleware(req: NextRequest) {
  const proto = req.headers.get("x-forwarded-proto");
  const host = req.headers.get("host") || "";
  const isLocalhost = host.startsWith("localhost") || host.startsWith("127.0.0.1");

  if (proto === "http" && !isLocalhost) {
    const httpsUrl = new URL(req.url);
    httpsUrl.protocol = "https:";
    httpsUrl.host = host;
    return NextResponse.redirect(httpsUrl, 308);
  }

  return NextResponse.next();
}

export const config = {
  // Run on every route except static assets/images, so redirects are fast.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
