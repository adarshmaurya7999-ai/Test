import { randomUUID } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import {
  buildGitHubAuthorizeUrl,
  GITHUB_OAUTH_NEXT_COOKIE,
  GITHUB_OAUTH_STATE_COOKIE,
} from "@/lib/github/oauth";

const OAUTH_COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 600,
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams, origin } = new URL(request.url);
    let next = searchParams.get("next") ?? "/dashboard";
    if (!next.startsWith("/") || next.startsWith("//")) {
      next = "/dashboard";
    }

    const state = randomUUID();
    const redirectUri = `${origin}/api/auth/github/callback`;

    const response = NextResponse.redirect(buildGitHubAuthorizeUrl(redirectUri, state));
    response.cookies.set(GITHUB_OAUTH_STATE_COOKIE, state, OAUTH_COOKIE_OPTS);
    response.cookies.set(GITHUB_OAUTH_NEXT_COOKIE, next, OAUTH_COOKIE_OPTS);

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "GitHub OAuth not configured";
    const reason = encodeURIComponent(message);
    return NextResponse.redirect(
      new URL(`/login?error=github_oauth&reason=${reason}`, request.url),
    );
  }
}
