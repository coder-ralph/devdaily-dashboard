import React, { useState } from 'react'
import { Zap, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react'
import WidgetCard from '../components/WidgetCard'
import { XP_RULES, XP_PER_LEVEL } from '../hooks/useXP'

/**
 * Developer level title based on level number.
 * Feel free to customise these.
 */
function levelTitle(level) {
  if (level >= 50) return 'Principal Engineer'
  if (level >= 40) return 'Staff Engineer'
  if (level >= 30) return 'Senior Engineer'
  if (level >= 20) return 'Mid-Level Engineer'
  if (level >= 10) return 'Junior Engineer'
  if (level >= 5)  return 'Developer'
  if (level >= 2)  return 'Apprentice'
  return 'Newcomer'
}

/** XP bar gradient color based on level */
function barColor(level) {
  if (level >= 30) return 'from-purple-500 to-pink-500'
  if (level >= 20) return 'from-blue-500 to-cyan-400'
  if (level >= 10) return 'from-emerald-500 to-teal-400'
  if (level >= 5)  return 'from-amber-400 to-orange-400'
  return 'from-accent-blue to-blue-400'
}

export default function XPLevelWidget({
  totalXP,
  level,
  progress,      // 0–99 XP within current level
  history,       // { commits, pomodoro, tasks }
  daily,         // { commitsAwarded, pomosAwarded, tasksAwarded }
  onReset,
}) {
  const [showReset, setShowReset] = useState(false)
  const [showBreakdown, setShowBreakdown] = useState(false)

  const pct = Math.round((progress / XP_PER_LEVEL) * 100)
  const title = levelTitle(level)
  const gradient = barColor(level)

  // XP earned today from each source
  const todayCommitXP  = (daily?.commitsAwarded  || 0) * XP_RULES.commit
  const todayPomoXP    = (daily?.pomosAwarded    || 0) * XP_RULES.pomodoro
  const todayTaskXP    = (daily?.tasksAwarded    || 0) * XP_RULES.task
  const todayTotal     = todayCommitXP + todayPomoXP + todayTaskXP

  return (
    <WidgetCard
      icon={<Zap size={13} className="text-amber-400" />}
      title="XP Level"
      badge={`Lv. ${level}`}
      headerRight={
        <button
          onClick={() => setShowReset(s => !s)}
          className="text-gray-600 hover:text-gray-400 transition-colors p-1"
          title="Reset options"
        >
          <RotateCcw size={11} />
        </button>
      }
    >
      {/* Reset confirmation */}
      {showReset && (
        <div className="mb-3 p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg
          flex items-center justify-between gap-2">
          <span className="text-[11px] text-red-400">Reset all XP? This cannot be undone.</span>
          <div className="flex gap-1.5">
            <button
              onClick={() => { onReset?.(); setShowReset(false) }}
              className="text-[10px] px-2 py-0.5 bg-red-500 text-white rounded"
            >
              Reset
            </button>
            <button
              onClick={() => setShowReset(false)}
              className="text-[10px] px-2 py-0.5 btn-ghost rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Level display */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-2xl font-bold leading-none">Level {level}</div>
          <div className="text-xs text-gray-400 mt-1">{title}</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-mono font-semibold">
            <span className="text-amber-400">{progress}</span>
            <span className="text-gray-500"> / {XP_PER_LEVEL} XP</span>
          </div>
          <div className="text-[10px] text-gray-500 font-mono mt-0.5">
            {totalXP} total XP
          </div>
        </div>
      </div>

      {/* XP progress bar */}
      <div className="mb-4">
        <div className="h-3 bg-gray-200 dark:bg-surface-3 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-1000`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[9px] text-gray-500 font-mono">Lv. {level}</span>
          <span className="text-[9px] text-gray-500 font-mono">Lv. {level + 1}</span>
        </div>
      </div>

      {/* Today's XP summary */}
      <div className="mb-3">
        <div className="stat-label mb-2">earned today</div>
        {todayTotal === 0 ? (
          <p className="text-xs text-gray-500 font-mono">
            No XP yet today — commit code, complete tasks, or finish a Pomodoro.
          </p>
        ) : (
          <div className="space-y-1.5">
            {todayCommitXP > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">
                  +{daily.commitsAwarded} commit{daily.commitsAwarded !== 1 ? 's' : ''}
                </span>
                <span className="font-mono text-emerald-400">+{todayCommitXP} XP</span>
              </div>
            )}
            {todayPomoXP > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">
                  +{daily.pomosAwarded} Pomodoro{daily.pomosAwarded !== 1 ? 's' : ''}
                </span>
                <span className="font-mono text-red-400">+{todayPomoXP} XP</span>
              </div>
            )}
            {todayTaskXP > 0 && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">
                  +{daily.tasksAwarded} task{daily.tasksAwarded !== 1 ? 's' : ''}
                </span>
                <span className="font-mono text-blue-400">+{todayTaskXP} XP</span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-200 dark:border-white/[0.06]">
              <span className="text-gray-500">total today</span>
              <span className="font-mono font-semibold text-amber-400">+{todayTotal} XP</span>
            </div>
          </div>
        )}
      </div>

      {/* Lifetime breakdown — collapsible */}
      <button
        onClick={() => setShowBreakdown(s => !s)}
        className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-300 transition-colors"
      >
        {showBreakdown ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        lifetime activity
      </button>

      {showBreakdown && (
        <div className="mt-2 space-y-1">
          {[
            { label: 'Commits (×5 XP)',   value: history?.commits  || 0, color: 'text-emerald-400' },
            { label: 'Pomodoros (×15 XP)', value: history?.pomodoro || 0, color: 'text-red-400'     },
            { label: 'Tasks (×5 XP)',      value: history?.tasks    || 0, color: 'text-blue-400'    },
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between text-[11px]">
              <span className="text-gray-500">{row.label}</span>
              <span className={`font-mono ${row.color}`}>{row.value}</span>
            </div>
          ))}
        </div>
      )}
    </WidgetCard>
  )
}
