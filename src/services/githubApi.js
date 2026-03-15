import { getGithubToken } from '../utils/credentialStorage'

/**
 * GitHub API Service
 *
 * Token priority:
 * - localStorage token
 * - VITE_GITHUB_TOKEN
 * - unauthenticated REST only
 *
 * Contribution heatmap:
 * - GraphQL contributionCalendar (primary)
 * - REST /events/public fallback
 *
 * GraphQL requires an authenticated token.
 * If unavailable, the service falls back to the REST approximation.
 */

const REST_BASE   = 'https://api.github.com'
const GRAPHQL_URL = 'https://api.github.com/graphql'

// Token resolution

function resolveToken() {
  return getGithubToken() || import.meta.env.VITE_GITHUB_TOKEN || null
}

// REST helpers

function restHeaders() {
  const token = resolveToken()
  const headers = { Accept: 'application/vnd.github+json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

async function restFetch(path) {
  const res = await fetch(`${REST_BASE}${path}`, { headers: restHeaders() })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `GitHub REST error: ${res.status}`)
  }
  return res.json()
}

// GraphQL helper

async function graphqlFetch(query, variables = {}) {
  const token = resolveToken()

  // GraphQL requires authentication — throw immediately so the caller
  // can fall back to REST without making a doomed 401 request.
  if (!token) throw new Error('GitHub token required for GraphQL API')

  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  })

  if (!res.ok) throw new Error(`GitHub GraphQL HTTP error: ${res.status}`)

  const json = await res.json()

  // GraphQL surfaces errors in the body with a 200 status
  if (json.errors?.length) throw new Error(json.errors[0].message)

  return json.data
}

// REST exports

export async function fetchUser(username) {
  return restFetch(`/users/${username}`)
}

export async function fetchRepos(username, limit = 10) {
  return restFetch(`/users/${username}/repos?sort=pushed&per_page=${limit}`)
}

/**
 * Fetches recent public events.
 * Still used for:
 *  - extractRecentCommits  (Commits tab)
 *  - fallback contribution grid when GraphQL is unavailable
 * No longer the primary heatmap source.
 */
export async function fetchEvents(username) {
  return restFetch(`/users/${username}/events/public?per_page=100`)
}

export async function fetchRepoCommits(owner, repo, limit = 10) {
  return restFetch(`/repos/${owner}/${repo}/commits?per_page=${limit}`)
}

// GraphQL: contribution calendar

const CONTRIBUTION_CALENDAR_QUERY = `
  query ContributionCalendar($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
  }
`

/**
 * Fetch a full-year contribution calendar via GitHub GraphQL.
 * Returns a normalized grid plus total contributions.
 * Throws if GraphQL is unavailable so callers can fall back to REST events.
 */

export async function fetchContributionCalendar(username) {
  const data = await graphqlFetch(CONTRIBUTION_CALENDAR_QUERY, { login: username })

  const calendar = data?.user?.contributionsCollection?.contributionCalendar
  if (!calendar) throw new Error('No contribution calendar in GraphQL response')

  // Flatten weeks → days and sort oldest → newest
  const grid = calendar.weeks
    .flatMap(week => week.contributionDays)
    .map(day => ({
      date: day.date,
      count: day.contributionCount,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))

  return {
    grid,
    totalContributions: calendar.totalContributions,
  }
}

// Derived data helpers

/**
 * Build a contribution grid from REST public events.
 * Used as a fallback when GraphQL is unavailable.
 */

export function buildContributionGrid(events) {
  const commitsByDay = {}
  events
    .filter(e => e.type === 'PushEvent')
    .forEach(e => {
      const date = e.created_at.slice(0, 10)
      const count = e.payload?.commits?.length || 1
      commitsByDay[date] = (commitsByDay[date] || 0) + count
    })

  const grid = []
  for (let i = 363; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    grid.push({ date: key, count: commitsByDay[key] || 0 })
  }
  return grid
}

/** Calculate current and longest coding streak from a contribution grid. */
export function calculateStreak(grid) {
  let current = 0, longest = 0, run = 0
  for (let i = grid.length - 1; i >= 0; i--) {
    if (grid[i].count > 0) current++
    else break
  }
  for (const day of grid) {
    if (day.count > 0) { run++; longest = Math.max(longest, run) }
    else run = 0
  }
  return { current, longest }
}

/** Extract recent commit messages from PushEvents for the Commits tab. */
export function extractRecentCommits(events, limit = 8) {
  const commits = []
  for (const e of events) {
    if (e.type !== 'PushEvent') continue
    const repo = e.repo?.name || 'unknown'
    for (const c of (e.payload?.commits || [])) {
      commits.push({
        sha: c.sha?.slice(0, 7) || '???????',
        message: c.message?.split('\n')[0]?.slice(0, 72) || '',
        repo: repo.split('/')[1] || repo,
        date: e.created_at,
      })
      if (commits.length >= limit) return commits
    }
  }
  return commits
}

/** Slice the last 7 days from a contribution grid for the bar chart. */
export function getWeeklyActivity(grid) {
  return grid.slice(-7)
}
