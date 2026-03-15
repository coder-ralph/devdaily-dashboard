import React, { useEffect, useState } from 'react'
import { Code2 } from 'lucide-react'
import WidgetCard from '../components/WidgetCard'
import LoadingSpinner from '../components/LoadingSpinner'
import LCDoughnut from '../charts/LCDoughnut'
import LCProgressLine from '../charts/LCProgressLine'
import { fetchLeetCodeStats } from '../services/leetcodeApi'

function DiffBar({ label, solved, total, color }) {
  const pct = total > 0 ? Math.round((solved / total) * 100) : 0
  return (
    <div className="flex items-center gap-2">
      <span className={`text-[10px] font-mono w-10 ${color}`}>{label}</span>
      <div className="flex-1 h-1.5 bg-gray-200 dark:bg-surface-3 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color.replace('text-', 'bg-')}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono w-16 text-right">
        {solved}/{total}
      </span>
    </div>
  )
}

export default function LeetCodeProgress({ username }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchLeetCodeStats(username)
      .then(setData)
      .finally(() => setLoading(false))
  }, [username])

  return (
    <WidgetCard
      icon={<Code2 size={13} className="text-amber-400" />}
      title="LeetCode Progress"
      badge="mock data"
    >
      {loading && <LoadingSpinner text="Loading LeetCode stats..." />}

      {data && !loading && (
        <>
          {/* Top row: doughnut + difficulty bars */}
          <div className="flex items-start gap-4 mb-4">
            <LCDoughnut easy={data.easy.solved} medium={data.medium.solved} hard={data.hard.solved} />
            <div className="flex flex-col justify-center flex-1 gap-2 pt-2">
              <DiffBar label="Easy" solved={data.easy.solved}   total={data.easy.total}   color="text-green-500 dark:text-green-400" />
              <DiffBar label="Med"  solved={data.medium.solved} total={data.medium.total} color="text-amber-500 dark:text-amber-400" />
              <DiffBar label="Hard" solved={data.hard.solved}   total={data.hard.total}   color="text-red-500   dark:text-red-400"   />
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="stat-card">
              <span className="text-lg text-gray-900 stat-value dark:text-white">
                {data.totalSolved}
              </span>
              <span className="stat-label">problems solved</span>
            </div>
            <div className="stat-card">
              <span className="text-lg stat-value text-amber-400">{data.streak}d</span>
              <span className="stat-label">lc streak</span>
            </div>
          </div>

          {/* Monthly progress */}
          <div className="text-[10px] text-gray-500 font-mono mb-2">Monthly solved</div>
          <LCProgressLine monthly={data.monthlyProgress} />

          {/* Recent submissions */}
          <div className="mt-3 space-y-1">
            <div className="text-[10px] text-gray-500 font-mono mb-1">Recent submissions</div>
            {data.recentActivity.slice(0, 3).map((a, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg border
                bg-gray-50 dark:bg-surface-2
                border-gray-200 dark:border-white/[0.05]">
                <span className="text-xs text-gray-700 truncate dark:text-gray-300">{a.title}</span>
                <span className={`text-[10px] font-mono ml-2 flex-shrink-0
                  ${a.difficulty === 'easy'
                    ? 'text-green-500 dark:text-green-400'
                    : a.difficulty === 'medium'
                      ? 'text-amber-500 dark:text-amber-400'
                      : 'text-red-500 dark:text-red-400'}`}>
                  {a.difficulty}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </WidgetCard>
  )
}
