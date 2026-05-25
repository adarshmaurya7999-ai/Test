const GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";

export const GITHUB_OAUTH_STATE_COOKIE = "github_oauth_state";
export const GITHUB_OAUTH_NEXT_COOKIE = "github_oauth_next";

export const GITHUB_OAUTH_SCOPES = "read:user user:email repo";

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing ${name} in environment (use the same GitHub OAuth App as Supabase).`);
  }
  return value;
}

export function getGitHubOAuthCredentials() {
  return {
    clientId: requireEnv("GITHUB_OAUTH_CLIENT_ID"),
    clientSecret: requireEnv("GITHUB_OAUTH_CLIENT_SECRET"),
  };
}

export function buildGitHubAuthorizeUrl(redirectUri: string, state: string): string {
  const { clientId } = getGitHubOAuthCredentials();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: GITHUB_OAUTH_SCOPES,
    state,
  });
  return `${GITHUB_AUTHORIZE_URL}?${params.toString()}`;
}

export async function exchangeGitHubCode(
  code: string,
  redirectUri: string,
): Promise<string> {
  const { clientId, clientSecret } = getGitHubOAuthCredentials();

  const response = await fetch(GITHUB_TOKEN_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  });

  const data = (await response.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };

  if (!response.ok || data.error || !data.access_token) {
    throw new Error(
      data.error_description ?? data.error ?? "GitHub token exchange failed",
    );
  }

  return data.access_token;
}
