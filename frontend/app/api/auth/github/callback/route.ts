import { NextResponse, type NextRequest } from "next/server";
import {
  exchangeGitHubCode,
  GITHUB_OAUTH_NEXT_COOKIE,
  GITHUB_OAUTH_STATE_COOKIE,
} from "@/lib/github/oauth";
import {
  githubTokenCookieOptions,
  GITHUB_TOKEN_COOKIE,
} from "@/lib/github/tokenCookie";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const oauthError = searchParams.get("error_description") ?? searchParams.get("error");

  const storedState = request.cookies.get(GITHUB_OAUTH_STATE_COOKIE)?.value;
  const next = request.cookies.get(GITHUB_OAUTH_NEXT_COOKIE)?.value ?? "/dashboard";
  const safeNext =
    next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  const clearOAuthCookies = (response: NextResponse) => {
    response.cookies.set(GITHUB_OAUTH_STATE_COOKIE, "", { path: "/", maxAge: 0 });
    response.cookies.set(GITHUB_OAUTH_NEXT_COOKIE, "", { path: "/", maxAge: 0 });
    return response;
  };

  if (oauthError) {
    const reason = encodeURIComponent(oauthError);
    return clearOAuthCookies(
      NextResponse.redirect(`${origin}/dashboard?github_token=error&reason=${reason}`),
    );
  }

  if (!code || !state || !storedState || state !== storedState) {
    return clearOAuthCookies(
      NextResponse.redirect(`${origin}/dashboard?github_token=error&reason=invalid_state`),
    );
  }

  try {
    const redirectUri = `${origin}/api/auth/github/callback`;
    const accessToken = await exchangeGitHubCode(code, redirectUri);

    const response = clearOAuthCookies(
      NextResponse.redirect(`${origin}${safeNext}`),
    );
    response.cookies.set(GITHUB_TOKEN_COOKIE, accessToken, githubTokenCookieOptions());
    return response;
  } catch (error) {
    const reason = encodeURIComponent(
      error instanceof Error ? error.message : "token_exchange_failed",
    );
    return clearOAuthCookies(
      NextResponse.redirect(`${origin}/dashboard?github_token=error&reason=${reason}`),
    );
  }
}
