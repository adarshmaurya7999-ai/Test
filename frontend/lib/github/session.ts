import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { GITHUB_TOKEN_COOKIE } from "@/lib/github/tokenCookie";

const TOKEN_SETUP_HINT =
  "Grant GitHub access when prompted after sign-in, or open /api/auth/github/connect while logged in.";

/**
 * GitHub access token for server routes: httpOnly cookie (set at OAuth callback) first,
 * then Supabase session.provider_token. Do not call refreshSession() — it drops provider_token.
 */
export async function getGitHubAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(GITHUB_TOKEN_COOKIE)?.value;
  if (fromCookie?.length) {
    return fromCookie;
  }

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.provider_token;
  return typeof token === "string" && token.length > 0 ? token : null;
}

export async function requireGitHubAccessToken(): Promise<string> {
  const token = await getGitHubAccessToken();
  if (!token) {
    throw new Error(`GitHub token not available. ${TOKEN_SETUP_HINT}`);
  }
  return token;
}
