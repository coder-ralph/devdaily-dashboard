import React, { useState, useMemo } from 'react'
import { Target, Settings } from 'lucide-react'
import WidgetCard from '../components/WidgetCard'
import { useLocalStorage } from '../hooks/useLocalStorage'

/**
 * GithubGoalTracker
 *
 * Tracks progress toward a monthly commit goal using the GitHub
 * events data provided by the useGitHub hook.
 *
 * The goal value is stored in localStorage so it persists across refreshes.
 */
export default function GithubGoalTracker({ events = [], username }) {
  const [goal, setGoal]         = useLocalStorage('ddd-commit-goal', 100)
  const [editingGoal, setEditing] = useState(false)
  const [draftGoal, setDraft]   = useState(String(goal))

  // Count commits in the current calendar month from PushEvents
  const { monthCommits, dailyBreakdown } = useMemo(() => {
    const now  = new Date()
    const year = now.getFullYear()
    const mon  = now.getMonth()       // 0-indexed

    const dailyMap = {}
    let total = 0

    events
      .filter(e => {
        if (e.type !== 'PushEvent') return false
        const d = new Date(e.created_at)
        return d.getFullYear() === year && d.getMonth() === mon
      })
      .forEach(e => {
        const day = e.created_at.slice(0, 10)
        const n   = e.payload?.commits?.length || 1
        dailyMap[day] = (dailyMap[day] || 0) + n
        total += n
      })

    // Top 5 days for mini bar chart
    const breakdown = Object.entries(dailyMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([date, count]) => ({ date, count }))

    return { monthCommits: total, dailyBreakdown: breakdown }
  }, [events])

  const pct        = goal > 0 ? Math.min(Math.round((monthCommits / goal) * 100), 100) : 0
  const remaining  = Math.max(0, goal - monthCommits)
  const done       = monthCommits >= goal
  const monthName  = new Date().toLocaleString('en', { month: 'long' })
  const maxDaily   = dailyBreakdown[0]?.count || 1

  function saveGoal() {
    const parsed = parseInt(draftGoal, 10)
    if (!isNaN(parsed) && parsed > 0) setGoal(parsed)
    setEditing(false)
  }

  // Progress bar color
  const barColor =
    pct >= 100 ? 'bg-emerald-500' :
    pct >= 60  ? 'bg-accent-blue' :
    pct >= 30  ? 'bg-amber-400'   : 'bg-red-400'

  return (
    <WidgetCard
      icon={<Target size={13} className="text-accent-green" />}
      title="GitHub Goal Tracker"
      badge={monthName}
      headerRight={
        <button
          onClick={() => { setDraft(String(goal)); setEditing(e => !e) }}
          className="p-1 text-gray-500 transition-colors hover:text-gray-300"
          title="Edit goal"
        >
          <Settings size={11} />
        </button>
      }
    >
      {/* Goal editor */}
      {editingGoal && (
        <div className="flex items-center gap-2 mb-3">
          <input
            type="number"
            min="1"
            className="w-24 text-xs input-base"
            value={draftGoal}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && saveGoal()}
            autoFocus
          />
          <button onClick={saveGoal} className="btn-primary text-xs py-1.5">
            Save
          </button>
          <button onClick={() => setEditing(false)} className="btn-ghost text-xs py-1.5">
            Cancel
          </button>
        </div>
      )}

      {/* No data state */}
      {!username && events.length === 0 && (
        <p className="py-3 font-mono text-xs text-center text-gray-500">
          Load GitHub data to track your commit goal.
        </p>
      )}

      {/* Main content */}
      {(username || events.length > 0) && (
        <>
          {/* Score */}
          <div className="flex items-baseline gap-2 mb-1">
            <span className={`text-3xl font-bold leading-none ${done ? 'text-emerald-400' : ''}`}>
              {monthCommits}
            </span>
            <span className="text-sm text-gray-500">/ {goal} commits</span>
          </div>

          <div className="mb-3 text-xs text-gray-500">
            {done
              ? `🎉 Goal reached! ${monthCommits - goal} over target`
              : `${remaining} commit${remaining !== 1 ? 's' : ''} to reach your ${monthName} goal`}
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-[10px] font-mono text-gray-500 mb-1">
              <span>{pct}% complete</span>
              <span>{monthName} goal: {goal}</span>
            </div>
            <div className="h-2.5 bg-gray-200 dark:bg-surface-3 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="text-center stat-card">
              <span className="text-base stat-value">{monthCommits}</span>
              <span className="stat-label">this month</span>
            </div>
            <div className="text-center stat-card">
              <span className="text-base stat-value">{remaining}</span>
              <span className="stat-label">remaining</span>
            </div>
            <div className="text-center stat-card">
              <span className={`stat-value text-base ${done ? 'text-emerald-400' : 'text-amber-400'}`}>
                {pct}%
              </span>
              <span className="stat-label">progress</span>
            </div>
          </div>

          {/* Top days mini chart */}
          {dailyBreakdown.length > 0 && (
            <>
              <div className="mb-2 stat-label">top days this month</div>
              <div className="space-y-1.5">
                {dailyBreakdown.map(d => (
                  <div key={d.date} className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-gray-500 w-20 flex-shrink-0">
                      {new Date(d.date + 'T00:00:00').toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                    </span>
                    <div className="flex-1 h-1.5 bg-gray-200 dark:bg-surface-3 rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-500 rounded-full bg-accent-blue"
                        style={{ width: `${Math.round((d.count / maxDaily) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-gray-400 w-8 text-right">
                      {d.count}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {dailyBreakdown.length === 0 && (
            <p className="py-2 font-mono text-xs text-center text-gray-600">
              No commits found in {monthName} yet.
            </p>
          )}
        </>
      )}
    </WidgetCard>
  )
}
