import { NextResponse } from "next/server";
import { GitHubApiError } from "@/lib/github/api";
import { listPullsForRepo } from "@/lib/github/listPulls";
import { requireGitHubAccessToken } from "@/lib/github/session";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ owner: string; repo: string }>;
}

export async function GET(_request: Request, context: RouteContext): Promise<NextResponse> {
  try {
    const { owner, repo } = await context.params;
    const token = await requireGitHubAccessToken();
    const { pulls, includesClosed } = await listPullsForRepo(owner, repo, token);
    return NextResponse.json({ pulls, includesClosed });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load pull requests";
    const status = error instanceof GitHubApiError ? error.status : 500;
    return NextResponse.json({ error: message }, { status: status === 401 || status === 403 || status === 404 ? status : 500 });
  }
}
