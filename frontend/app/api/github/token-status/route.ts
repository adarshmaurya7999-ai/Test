import { NextResponse } from "next/server";
import { getGitHubAccessToken } from "@/lib/github/session";

export async function GET(): Promise<NextResponse> {
  const token = await getGitHubAccessToken();
  return NextResponse.json({ hasToken: Boolean(token) });
}
