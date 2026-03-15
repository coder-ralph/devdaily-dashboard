import React from 'react'
import { Flame } from 'lucide-react'
import WidgetCard from '../components/WidgetCard'
import { today } from '../utils/helpers'

/**
 * StreakCalendar – last 28 days mini calendar
 */
function StreakCalendar({ grid }) {
  const last28 = grid.slice(-28)
  const todayStr = today()

  return (
    <div className="grid gap-[3px]" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
      {['S','M','T','W','T','F','S'].map((d, i) => (
        <div key={i} className="text-[9px] text-gray-600 font-mono text-center pb-1">{d}</div>
      ))}
      {last28.map((day, i) => {
        const isToday = day.date === todayStr
        const coded = day.count > 0
        return (
          <div
            key={i}
            title={`${day.date}: ${day.count} commits`}
            className={`
              aspect-square rounded-[3px] flex items-center justify-center text-[8px] font-mono
              transition-transform hover:scale-110 cursor-default
              ${coded
                ? isToday ? 'bg-emerald-400 text-emerald-900' : 'bg-emerald-600/70 text-emerald-100'
                : isToday ? 'bg-surface-3 outline outline-1 outline-accent-blue text-gray-500' : 'bg-surface-3 text-gray-700'}
            `}
          >
            {new Date(day.date).getDate()}
          </div>
        )
      })}
    </div>
  )
}

export default function CodingStreak({ streak, grid = [] }) {
  const { current = 0, longest = 0 } = streak || {}
  const active = current > 0

  return (
    <WidgetCard
      icon={<Flame size={13} className={active ? 'text-amber-400' : 'text-gray-600'} />}
      title="Coding Streak"
      badge={`${current}d streak`}
    >
      {/* Streak numbers */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="stat-card">
          <span className={`stat-value text-2xl ${active ? 'text-amber-400' : 'text-gray-600'}`}>
            {current}
          </span>
          <span className="stat-label">current streak</span>
        </div>
        <div className="stat-card">
          <span className="stat-value text-2xl text-accent-blue">{longest}</span>
          <span className="stat-label">longest streak</span>
        </div>
      </div>

      {/* Status badge */}
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mb-4
        ${active ? 'bg-amber-500/10 text-amber-400' : 'bg-surface-3 text-gray-500'}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-amber-400' : 'bg-gray-600'}`} />
        {active ? `${current} day${current !== 1 ? 's' : ''} in a row` : 'No activity today'}
      </div>

      {/* Calendar */}
      {grid.length > 0 && (
        <>
          <div className="text-[10px] text-gray-600 font-mono mb-2">Last 28 days</div>
          <StreakCalendar grid={grid} />
        </>
      )}

      {grid.length === 0 && (
        <p className="text-xs text-gray-600 font-mono text-center py-2">
          Load GitHub data to compute streak.
        </p>
      )}
    </WidgetCard>
  )
}
