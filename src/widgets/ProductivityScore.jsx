import React from 'react'
import { BarChart3 } from 'lucide-react'
import WidgetCard from '../components/WidgetCard'
import { calculateProductivityScore } from '../services/productivityService'

const SCORE_COLOR = (s) =>
  s >= 80 ? 'text-accent-green' :
  s >= 60 ? 'text-accent-blue' :
  s >= 40 ? 'text-amber-400' :
  s >= 20 ? 'text-orange-400' : 'text-gray-500'

const SCORE_BG = (s) =>
  s >= 80 ? 'bg-accent-green' :
  s >= 60 ? 'bg-accent-blue' :
  s >= 40 ? 'bg-amber-400' :
  s >= 20 ? 'bg-orange-400' : 'bg-gray-600'

const DIMENSIONS = [
  { key: 'github',   label: 'GitHub Activity', weight: '30%', color: 'bg-accent-blue'  },
  { key: 'streak',   label: 'Coding Streak',   weight: '20%', color: 'bg-amber-400'    },
  { key: 'tasks',    label: 'Tasks Done',       weight: '25%', color: 'bg-accent-green' },
  { key: 'pomodoro', label: 'Pomodoros',        weight: '15%', color: 'bg-red-400'      },
  { key: 'leetcode', label: 'LeetCode',         weight: '10%', color: 'bg-purple-400'   },
]

export default function ProductivityScore({ githubCommits, streak, tasksCompleted, pomosCompleted }) {
  const result = calculateProductivityScore({
    githubCommits,
    streak,
    tasksCompleted,
    pomosCompleted,
    lcSolvedToday: 1, // mock — replace with real LC daily count
  })

  const { score, breakdown, label } = result

  return (
    <WidgetCard
      icon={<BarChart3 size={13} className="text-accent-blue" />}
      title="Productivity Score"
      badge="today"
    >
      {/* Score display */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex flex-col items-center">
          <span className={`text-5xl font-bold leading-none ${SCORE_COLOR(score)}`}>{score}</span>
          <span className="text-[10px] text-gray-500 font-mono mt-1">/ 100</span>
        </div>
        <div className="flex-1">
          <div className={`text-sm font-semibold mb-2 ${SCORE_COLOR(score)}`}>{label}</div>
          {/* Master bar */}
          <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${SCORE_BG(score)}`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="space-y-2">
        {DIMENSIONS.map(d => {
          const val = Math.round(breakdown[d.key])
          return (
            <div key={d.key} className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500 w-28 flex-shrink-0">{d.label}</span>
              <div className="flex-1 h-1.5 bg-surface-3 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${d.color}`}
                  style={{ width: `${val}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-gray-600 w-8 text-right">{val}</span>
              <span className="text-[10px] font-mono text-gray-700 w-8 text-right">{d.weight}</span>
            </div>
          )
        })}
      </div>

      {/* Inputs summary */}
      <div className="grid grid-cols-4 gap-2 mt-4">
        {[
          { label: 'commits', value: githubCommits },
          { label: 'streak',  value: `${streak}d`  },
          { label: 'tasks',   value: tasksCompleted },
          { label: 'pomos',   value: pomosCompleted },
        ].map(s => (
          <div key={s.label} className="stat-card text-center">
            <span className="stat-value text-sm">{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div>
    </WidgetCard>
  )
}
