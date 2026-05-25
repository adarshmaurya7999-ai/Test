import { NextResponse } from "next/server";
import { GitHubApiError } from "@/lib/github/api";
import { listUserOpenPulls } from "@/lib/github/listPulls";
import { requireGitHubAccessToken } from "@/lib/github/session";

export const runtime = "nodejs";

export async function GET(): Promise<NextResponse> {
  try {
    const token = await requireGitHubAccessToken();
    const pulls = await listUserOpenPulls(token);
    return NextResponse.json({ pulls });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load your pull requests";
    const status = error instanceof GitHubApiError ? error.status : 500;
    return NextResponse.json({ error: message }, { status: status === 401 || status === 403 ? status : 500 });
  }
}
