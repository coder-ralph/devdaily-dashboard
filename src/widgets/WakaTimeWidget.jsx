import React, { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import WidgetCard from '../components/WidgetCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { fetchTodaySummary, formatDuration } from '../services/wakatimeApi'

// Language dot colors — unlisted languages fall back to accent-blue
const LANG_COLORS = {
  JavaScript:  '#f7df1e',
  TypeScript:  '#3178c6',
  Python:      '#3776ab',
  Rust:        '#ce412b',
  Go:          '#00add8',
  CSS:         '#264de4',
  HTML:        '#e44d26',
  JSON:        '#8bc34a',
  Markdown:    '#083fa1',
  Shell:       '#89e051',
}
const DEFAULT_LANG_COLOR = '#3b82f6'

function langColor(name) {
  return LANG_COLORS[name] || DEFAULT_LANG_COLOR
}

// ---------------------------------------------------------------------------
// Sub-component: single language row with proportional fill bar
// ---------------------------------------------------------------------------
function LangBar({ name, totalSeconds, percent, maxSeconds }) {
  // Use proportion against the top language rather than the raw percent,
  // so the first bar always reaches 100% and smaller bars scale from it.
  const barWidth = maxSeconds > 0
    ? Math.round((totalSeconds / maxSeconds) * 100)
    : percent

  const color = langColor(name)

  return (
    <div className="flex items-center gap-2">
      {/* Language name + dot */}
      <div className="flex items-center gap-1.5 w-24 flex-shrink-0">
        <span
          className="flex-shrink-0 w-2 h-2 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="text-xs text-gray-900 truncate dark:text-white">{name}</span>
      </div>

      {/* Fill bar */}
      <div className="flex-1 h-1.5 bg-gray-200 dark:bg-surface-3 rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-700 rounded-full"
          style={{ width: `${barWidth}%`, backgroundColor: color }}
        />
      </div>

      {/* Duration label */}
      <span className="text-[10px] font-mono text-gray-400 w-14 text-right flex-shrink-0">
        {formatDuration(totalSeconds)}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main widget
// ---------------------------------------------------------------------------
export default function WakaTimeWidget({ refreshKey = 0 }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isActive = true

    setLoading(true)

    fetchTodaySummary()
      .then((result) => {
        if (isActive) setData(result)
      })
      .finally(() => {
        if (isActive) setLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [refreshKey])

  // The top language drives the proportional bar widths
  const maxSeconds = data?.languages?.[0]?.totalSeconds || 1

  // Badge: "live" when proxy returned real data, "mock data" as fallback
  const badge = !data ? 'loading' : data.isMock ? 'mock data' : 'live'

  return (
    <WidgetCard
      icon={<Clock size={13} className="text-accent-blue" />}
      title="WakaTime"
      badge={badge}
    >
      {/* Loading state */}
      {loading && <LoadingSpinner text="Loading coding time..." />}

      {/* Data state — covers both live and fallback */}
      {data && !loading && (
        <>
          {/* Fallback notice — only shown when proxy could not be reached */}
          {data.isMock && (
            <div className="mb-3 px-2.5 py-2 rounded-lg text-[10px] font-mono
              bg-amber-500/10 border border-amber-500/20 text-amber-500">
              Showing fallback data — live stats unavailable
            </div>
          )}

          {/* Total coding time */}
          <div className="mb-4">
            <div className="mb-1 stat-label">today&apos;s coding time</div>
            <div className="text-3xl font-bold tracking-tight text-accent-blue">
              {data.totalHuman}
            </div>
          </div>

          {/* Language breakdown */}
          {data.languages.length > 0 ? (
            <div>
              <div className="mb-2 stat-label">languages</div>
              <div className="space-y-2">
                {data.languages.map(lang => (
                  <LangBar
                    key={lang.name}
                    name={lang.name}
                    totalSeconds={lang.totalSeconds}
                    percent={lang.percent}
                    maxSeconds={maxSeconds}
                  />
                ))}
              </div>
            </div>
          ) : (
            // Empty state — proxy is live but no coding recorded yet today
            !data.isMock && (
              <p className="py-2 font-mono text-xs text-center text-gray-500">
                No coding activity recorded yet today.
              </p>
            )
          )}

          {/* Editor chips */}
          {data.editors.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-white/[0.06]">
              <div className="stat-label mb-1.5">editors</div>
              <div className="flex flex-wrap gap-2">
                {data.editors.map(editor => (
                  <span
                    key={editor.name}
                    className="text-[10px] font-mono px-2 py-0.5 rounded
                      bg-gray-100 dark:bg-surface-3 text-gray-500"
                  >
                    {editor.name} {editor.percent}%
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </WidgetCard>
  )
}
