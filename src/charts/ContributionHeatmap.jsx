import React from 'react'
import { heatLevel } from '../utils/helpers'

const LEVEL_CLASSES = [
  'bg-surface-3',
  'bg-emerald-900/60',
  'bg-emerald-700/70',
  'bg-emerald-500/80',
  'bg-emerald-400',
]

/**
 * ContributionHeatmap
 * Renders a 52-week GitHub-style contribution grid.
 * Each cell is a day; colour intensity maps to commit count.
 *
 * @param {Array} grid  — array of { date: 'YYYY-MM-DD', count: number } (364 items)
 */
export default function ContributionHeatmap({ grid = [] }) {
  // Pad the grid so it starts on a Sunday
  const padded = []
  if (grid.length > 0) {
    const startDay = new Date(grid[0].date).getDay() // 0=Sun
    for (let i = 0; i < startDay; i++) padded.push(null)
  }
  padded.push(...grid)

  // Split into weeks (columns)
  const weeks = []
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7))
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-[3px] min-w-max">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((day, di) => (
              <div
                key={di}
                title={day ? `${day.date}: ${day.count} commit${day.count !== 1 ? 's' : ''}` : ''}
                className={`w-[10px] h-[10px] rounded-[2px] transition-transform hover:scale-125 cursor-default
                  ${day ? LEVEL_CLASSES[heatLevel(day.count)] : 'bg-transparent'}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1 mt-2">
        <span className="text-[10px] text-gray-600 font-mono mr-1">less</span>
        {LEVEL_CLASSES.map((cls, i) => (
          <div key={i} className={`w-[10px] h-[10px] rounded-[2px] ${cls}`} />
        ))}
        <span className="text-[10px] text-gray-600 font-mono ml-1">more</span>
      </div>
    </div>
  )
}
