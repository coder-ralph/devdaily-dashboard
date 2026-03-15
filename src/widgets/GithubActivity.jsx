import React, { useState } from 'react'
import { Github, Star, GitFork, ExternalLink, Zap, GitCommit } from 'lucide-react'
import WidgetCard from '../components/WidgetCard'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import ContributionHeatmap from '../charts/ContributionHeatmap'
import CommitBarChart from '../charts/CommitBarChart'
import RepoActivityChart from '../charts/RepoActivityChart'
import { fmtNum, timeAgo } from '../utils/helpers'

const TABS = ['overview', 'commits', 'repos']

/**
 * GithubActivity
 *
 * Displays GitHub profile statistics, contribution heatmap,
 * recent commits, and repository activity.
 *
 * Data is provided by the useGitHub hook, which combines:
 * - REST API (profile, repos, commits)
 * - GraphQL contributionCalendar (primary heatmap source)
 * - REST events fallback when GraphQL is unavailable
 */

export default function GithubActivity({
  loading,
  error,
  user,
  repos,
  grid,
  gridSource,
  totalContributions,
  recentCommits,
  weeklyActivity,
}) {
  const [tab, setTab] = useState('overview')

  const empty = !loading && !error && !user

  const statCards = [
    { label: 'Repos',     value: fmtNum(user?.public_repos) },
    { label: 'Followers', value: fmtNum(user?.followers)    },
    { label: 'Following', value: fmtNum(user?.following)    },
    ...(totalContributions != null
      ? [{ label: 'Contributions', value: fmtNum(totalContributions), highlight: true }]
      : []),
  ]

  const heatmapCaption = gridSource === 'graphql'
    ? `Full year · GitHub GraphQL · ${totalContributions != null ? totalContributions.toLocaleString() + ' contributions' : ''}`
    : gridSource === 'events'
      ? '~90 days · REST events (add a GitHub token for the full year)'
      : 'Contribution heatmap'

  return (
    <WidgetCard
      icon={<Github size={13} />}
      title="GitHub Activity"
      badge={user ? `@${user.login}` : 'not loaded'}
      headerRight={
        <div className="tab-bar">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`tab-btn ${tab === t ? 'active' : ''}`}
            >
              {t}
            </button>
          ))}
        </div>
      }
    >
      {loading && <LoadingSpinner text="Fetching GitHub data..." />}
      {error && <ErrorMessage message={error} />}
      {empty && (
        <p className="py-4 font-mono text-xs text-center text-gray-500">
          Enter a GitHub username above to load data.
        </p>
      )}

      {user && !loading && (
        <>
          {/* ── Profile strip ── */}
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100 dark:border-white/[0.06]">
            <img
              src={user.avatar_url}
              alt={user.login}
              className="w-10 h-10 border border-gray-200 rounded-full dark:border-white/10"
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-900 truncate dark:text-white">
                {user.name || user.login}
              </div>
              <div className="font-mono text-xs text-gray-500 truncate">
                {user.bio || `github.com/${user.login}`}
              </div>
            </div>
            {gridSource === 'graphql' && (
              <span className="hidden sm:flex items-center gap-1 text-[9px] font-mono
                px-2 py-0.5 rounded-full flex-shrink-0
                bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                <Zap size={9} />
                GraphQL
              </span>
            )}
            <a
              href={`https://github.com/${user.login}`}
              target="_blank"
              rel="noreferrer"
              className="flex-shrink-0 text-gray-400 transition-colors hover:text-accent-blue"
            >
              <ExternalLink size={13} />
            </a>
          </div>

          {/* ── Stats row ── */}
          <div className={`grid gap-2 mb-4 ${statCards.length === 4 ? 'grid-cols-4' : 'grid-cols-3'}`}>
            {statCards.map(s => (
              <div key={s.label} className="text-center stat-card">
                <span className={`stat-value text-base ${
                  s.highlight
                    ? 'text-accent-green'
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {s.value}
                </span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>

          {/* ── Overview tab ── */}
          {tab === 'overview' && (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-gray-500 font-mono">{heatmapCaption}</span>
                {gridSource === 'events' && (
                  <span className="text-[9px] text-amber-500 font-mono">approx.</span>
                )}
              </div>
              <ContributionHeatmap grid={grid} />
              <div className="mt-4">
                <div className="text-[10px] text-gray-500 font-mono mb-2">
                  Activity · last 7 days
                </div>
                <CommitBarChart data={weeklyActivity} />
              </div>
            </>
          )}

          {/* ── Commits tab ── */}
          {tab === 'commits' && (
            <div className="space-y-2">
              {recentCommits.length === 0 ? (
                <p className="py-4 font-mono text-xs text-center text-gray-500">
                  No recent push events found.
                </p>
              ) : (
                recentCommits.map((c, i) => (
                  <div key={i} className="item-row">
                    <GitCommit size={11} className="text-accent-green mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-800 truncate dark:text-gray-200">
                        {c.message}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                        {c.sha} · {c.repo} · {timeAgo(c.date)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── Repos tab ── */}
          {tab === 'repos' && (
            <>
              <div className="mb-3">
                <div className="text-[10px] text-gray-500 font-mono mb-2">Top repos by stars</div>
                <RepoActivityChart repos={repos} />
              </div>
              <div className="space-y-1.5 mt-3">
                {repos.slice(0, 5).map(r => (
                  <div key={r.id} className="item-row">
                    <span className="flex-1 font-mono text-xs truncate text-accent-blue">{r.name}</span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">{r.language || '—'}</span>
                    <span className="flex items-center gap-1 text-[10px] text-amber-500 dark:text-amber-400">
                      <Star size={10} />
                      {fmtNum(r.stargazers_count)}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500">
                      <GitFork size={10} />
                      {fmtNum(r.forks_count)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </WidgetCard>
  )
}
