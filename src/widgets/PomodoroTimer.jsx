import React from 'react'
import { Timer, Play, Pause, RotateCcw, SkipForward } from 'lucide-react'
import WidgetCard from '../components/WidgetCard'
import { usePomodoro } from '../hooks/usePomodoro'

const CIRCUMFERENCE = 2 * Math.PI * 52

export default function PomodoroTimer({ onSessionComplete }) {
  const { mode, running, sessions, progress, display, start, pause, reset, skip } =
    usePomodoro({ onSessionComplete })

  const strokeDash = CIRCUMFERENCE * (1 - progress)
  const isWork = mode === 'work'

  return (
    <WidgetCard
      icon={<Timer size={13} className={isWork ? 'text-red-400' : 'text-accent-green'} />}
      title="Pomodoro Timer"
      badge={`${sessions} session${sessions !== 1 ? 's' : ''} today`}
    >
      <div className="flex flex-col items-center gap-4 py-2">

        {/* ── Ring ── */}
        <div className="relative w-32 h-32">
          <svg className="-rotate-90" width="128" height="128" viewBox="0 0 128 128">
            <circle
              cx="64" cy="64" r="52"
              fill="none"
              stroke="currentColor"
              strokeWidth="7"
              className="text-gray-200 dark:text-surface-3"
            />
            <circle
              cx="64" cy="64" r="52"
              fill="none"
              stroke={isWork ? '#ef4444' : '#10b981'}
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDash}
              style={{ transition: 'stroke-dashoffset 0.6s linear, stroke 0.4s' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-2xl font-bold leading-none tracking-tight text-gray-900 dark:text-white">
              {display}
            </span>
            <span className={`text-[10px] uppercase tracking-widest mt-1 font-medium
              ${isWork ? 'text-red-400' : 'text-accent-green'}`}>
              {isWork ? 'focus' : 'break'}
            </span>
          </div>
        </div>

        {/* ── Controls ── */}
        <div className="flex items-center gap-2">
          {running ? (
            <button onClick={pause} className="flex items-center gap-1.5 btn-ghost text-xs">
              <Pause size={12} /> Pause
            </button>
          ) : (
            <button onClick={start} className="flex items-center gap-1.5 btn-primary text-xs">
              <Play size={12} /> {progress > 0 ? 'Resume' : 'Start'}
            </button>
          )}
          <button onClick={reset} className="p-2 btn-ghost" title="Reset">
            <RotateCcw size={12} />
          </button>
          <button onClick={skip} className="p-2 btn-ghost" title="Skip">
            <SkipForward size={12} />
          </button>
        </div>

        {/* ── Session dots ── */}
        <div className="flex items-center gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i < sessions % 4
                  ? 'bg-red-400'
                  : 'bg-gray-300 dark:bg-surface-3 border border-gray-300 dark:border-white/10'
              }`}
            />
          ))}
          <span className="text-[10px] text-gray-500 font-mono ml-1">
            {sessions} total
          </span>
        </div>

        {/* ── Tip ── */}
        <p className="text-[10px] text-gray-500 font-mono text-center">
          {isWork ? '25 min focus · 5 min break' : 'Rest up — next session soon'}
        </p>

      </div>
    </WidgetCard>
  )
}
