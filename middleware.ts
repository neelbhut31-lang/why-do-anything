import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "development-only-secret-change-before-production",
);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("wda_session")?.value;
  if (!token) return NextResponse.redirect(new URL("/admin/login", request.url));
  try {
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
}

export const config = {
  matcher: ["/admin/((?!login).*)", "/api/upload/:path*"],
};
