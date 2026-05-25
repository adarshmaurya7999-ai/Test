"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

/**
 * After Supabase login, ensures we have a GitHub API token via direct OAuth
 * (Supabase does not expose a "store provider tokens" toggle on all projects).
 */
export function GitHubTokenSync() {
  const searchParams = useSearchParams();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    if (searchParams.get("github_token") === "error") return;

    started.current = true;

    void (async () => {
      try {
        const res = await fetch("/api/github/token-status");
        const { hasToken } = (await res.json()) as { hasToken?: boolean };
        if (!hasToken) {
          const next = `${window.location.pathname}${window.location.search}`;
          window.location.href = `/api/auth/github/connect?next=${encodeURIComponent(next)}`;
        }
      } catch {
        /* ignore — PR modal will show API error */
      }
    })();
  }, [searchParams]);

  return null;
}
