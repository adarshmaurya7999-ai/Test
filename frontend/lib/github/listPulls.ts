import { githubFetch } from "@/lib/github/api";
import { mapPullRequest } from "@/lib/github/mapGithub";
import type { PullRequest, PullRequestWithRepo } from "@/lib/github/types";

interface GithubPullListItem {
  number: number;
  title: string;
  state: string;
  html_url: string;
  user: { login: string; avatar_url: string };
  head: { ref: string; sha: string };
  base: { ref: string; sha: string };
  created_at: string;
  changed_files?: number;
  additions?: number;
  deletions?: number;
}

interface SearchIssueItem {
  number: number;
  title: string;
  state: string;
  html_url: string;
  created_at: string;
  repository_url: string;
  user: { login: string; avatar_url: string };
  pull_request?: {
    url: string;
    merged_at?: string | null;
  };
}

function repoFullNameFromApiUrl(repositoryUrl: string): string | null {
  const match = repositoryUrl.match(/\/repos\/([^/]+)\/([^/]+)$/);
  if (!match) return null;
  return `${match[1]}/${match[2]}`;
}

async function listPullsFromApi(
  owner: string,
  repo: string,
  token: string,
  state: "open" | "closed" | "all",
): Promise<PullRequest[]> {
  const raw = await githubFetch<GithubPullListItem[]>(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls?state=${state}&sort=updated&direction=desc&per_page=30`,
    token,
  );
  return raw.map(mapPullRequest);
}

async function searchPullsInRepo(
  owner: string,
  repo: string,
  token: string,
  state: "open" | "closed",
): Promise<PullRequest[]> {
  const q = encodeURIComponent(`repo:${owner}/${repo} is:pr is:${state}`);
  const { items } = await githubFetch<{ items: SearchIssueItem[] }>(
    `/search/issues?q=${q}&sort=updated&order=desc&per_page=30`,
    token,
  );

  return items
    .filter((item) => item.pull_request != null)
    .map((item) => ({
      number: item.number,
      title: item.title,
      state: item.state,
      html_url: item.html_url,
      user: item.user,
      head: { ref: "", sha: "" },
      base: { ref: "", sha: "" },
      created_at: item.created_at,
      changed_files: 0,
      additions: 0,
      deletions: 0,
    }));
}

function dedupePulls(pulls: PullRequest[]): PullRequest[] {
  const seen = new Set<number>();
  return pulls.filter((p) => {
    if (seen.has(p.number)) return false;
    seen.add(p.number);
    return true;
  });
}

export type RepoPullsResult = {
  pulls: PullRequest[];
  /** Open PRs from list API; closed included only when no open PRs exist. */
  includesClosed: boolean;
};

/**
 * Lists PRs for a repository: open first, then search fallback, then recent closed.
 */
export async function listPullsForRepo(
  owner: string,
  repo: string,
  token: string,
): Promise<RepoPullsResult> {
  let open = await listPullsFromApi(owner, repo, token, "open");
  if (open.length === 0) {
    open = await searchPullsInRepo(owner, repo, token, "open");
  }
  open = dedupePulls(open);
  if (open.length > 0) {
    return { pulls: open, includesClosed: false };
  }

  let closed = await listPullsFromApi(owner, repo, token, "closed");
  if (closed.length === 0) {
    closed = await searchPullsInRepo(owner, repo, token, "closed");
  }
  closed = dedupePulls(closed);

  return { pulls: closed, includesClosed: closed.length > 0 };
}

/**
 * Open PRs across all repositories the user can access (author, assignee, or mentioned).
 */
export async function listUserOpenPulls(token: string): Promise<PullRequestWithRepo[]> {
  const { login } = await githubFetch<{ login: string }>("/user", token);

  const queries = [
    `is:pr is:open author:${login}`,
    `is:pr is:open assignee:${login}`,
    `is:pr is:open commenter:${login}`,
  ];

  const byKey = new Map<string, PullRequestWithRepo>();

  for (const q of queries) {
    const { items } = await githubFetch<{ items: SearchIssueItem[] }>(
      `/search/issues?q=${encodeURIComponent(q)}&sort=updated&order=desc&per_page=30`,
      token,
    );

    for (const item of items) {
      if (!item.pull_request) continue;
      const repository_full_name = repoFullNameFromApiUrl(item.repository_url);
      if (!repository_full_name) continue;

      const key = `${repository_full_name}#${item.number}`;
      if (byKey.has(key)) continue;

      byKey.set(key, {
        number: item.number,
        title: item.title,
        state: item.state,
        html_url: item.html_url,
        user: item.user,
        head: { ref: "", sha: "" },
        base: { ref: "", sha: "" },
        created_at: item.created_at,
        changed_files: 0,
        additions: 0,
        deletions: 0,
        repository_full_name,
      });
    }
  }

  return Array.from(byKey.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}
