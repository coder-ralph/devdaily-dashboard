import { useState, useCallback } from 'react'
import {
  fetchUser,
  fetchRepos,
  fetchEvents,
  fetchContributionCalendar,
  buildContributionGrid,
  calculateStreak,
  extractRecentCommits,
  getWeeklyActivity,
} from '../services/githubApi'

/**
 * useGitHub
 *
 * Data strategy:
 * - Profile, repos, recent commits → REST API
 * - Contribution heatmap           → GraphQL (primary), REST fallback
 *
 * GraphQL requires an authenticated token.
 * If unavailable, the hook gracefully falls back to REST events.
 */
export function useGitHub() {
  const [state, setState] = useState({
    loading: false,
    error: null,
    user: null,
    repos: [],
    grid: [],
    gridSource: null,          // 'graphql' | 'events'
    totalContributions: null,  // only available from GraphQL
    streak: null,
    recentCommits: [],
    weeklyActivity: [],
    events: [],
  })

  const load = useCallback(async (username) => {
    if (!username.trim()) return
    setState(s => ({ ...s, loading: true, error: null }))

    try {
      // REST calls run in parallel — always available, no token needed
      const [user, repos, events] = await Promise.all([
        fetchUser(username),
        fetchRepos(username, 8),
        fetchEvents(username),
      ])

      // ── Contribution grid: GraphQL primary, REST fallback ──
      let grid, gridSource, totalContributions

      try {
        const calendar    = await fetchContributionCalendar(username)
        grid              = calendar.grid
        totalContributions = calendar.totalContributions
        gridSource        = 'graphql'
      } catch (graphqlErr) {
        // Token absent or GraphQL unavailable — degrade gracefully
        console.warn('[GitHub] GraphQL unavailable, using REST fallback:', graphqlErr.message)
        grid              = buildContributionGrid(events)
        totalContributions = null
        gridSource        = 'events'
      }

      const streak         = calculateStreak(grid)
      const recentCommits  = extractRecentCommits(events)
      const weeklyActivity = getWeeklyActivity(grid)

      setState({
        loading: false,
        error: null,
        user,
        repos,
        grid,
        gridSource,
        totalContributions,
        streak,
        recentCommits,
        weeklyActivity,
        events,
      })
    } catch (err) {
      setState(s => ({ ...s, loading: false, error: err.message }))
    }
  }, [])

  return { ...state, load }
}
