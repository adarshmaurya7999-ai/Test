"use client";

import { useSearchParams } from "next/navigation";

export function GitHubTokenBanner() {
  const searchParams = useSearchParams();
  const status = searchParams.get("github_token");
  const reason = searchParams.get("reason");

  if (status !== "missing" && status !== "error") return null;

  return (
    <div
      className="mx-4 mt-2 flex flex-wrap items-center justify-between gap-3 rounded-md border border-[rgba(255,71,87,0.35)] bg-[rgba(255,71,87,0.1)] px-4 py-2.5 text-[12px] text-[var(--critical)]"
      role="alert"
    >
      <span>
        {status === "error"
          ? `GitHub access failed${reason ? `: ${decodeURIComponent(reason)}` : ""}.`
          : "GitHub API access is required to list repositories and pull requests."}{" "}
        Add{" "}
        <code className="text-[var(--accent)]">
          http://localhost:3000/api/auth/github/callback
        </code>{" "}
        to your GitHub OAuth App callback URLs, set GITHUB_OAUTH_CLIENT_ID/SECRET in .env.local,
        then grant access again.
      </span>
      <a
        href="/api/auth/github/connect?next=/dashboard"
        className="shrink-0 rounded-md border border-[var(--border-bright)] bg-[var(--bg-surface)] px-3 py-1.5 text-[12px] font-medium text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
      >
        Connect GitHub
      </a>
    </div>
  );
}
