import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "./lib/auth/tokens";

export function proxy(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;
  const session = accessToken ? verifyAccessToken(accessToken) : null;

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!login|api/auth|api/public|_next/static|_next/image|favicon.ico).*)",
  ],
};