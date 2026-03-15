import React, { useState, useCallback, useEffect } from 'react'
import { useGitHub } from '../hooks/useGitHub'
import { useXP } from '../hooks/useXP'
import GithubActivity from '../widgets/GithubActivity'
import CodingStreak from '../widgets/CodingStreak'
import LeetCodeProgress from '../widgets/LeetCodeProgress'
import PomodoroTimer from '../widgets/PomodoroTimer'
import TaskManager from '../widgets/TaskManager'
import NotesWidget from '../widgets/NotesWidget'
import ProductivityScore from '../widgets/ProductivityScore'
import WakaTimeWidget from '../widgets/WakaTimeWidget'
import XPLevelWidget from '../widgets/XPLevelWidget'
import GithubGoalTracker from '../widgets/GithubGoalTracker'
import SettingsActionBar from '../components/SettingsActionBar'
import DashboardFooter from '../components/DashboardFooter'

export default function Dashboard({ searchUsername }) {
  const github = useGitHub()
  const xp = useXP()

  const [pomosCompleted, setPomos] = useState(0)
  const [tasksDoneToday, setTasksDone] = useState(0)

  useEffect(() => {
    if (searchUsername) github.load(searchUsername)
  }, [searchUsername]) // eslint-disable-line

  const todayStr = new Date().toISOString().slice(0, 10)
  const todayCommits = (github.events || [])
    .filter(e => e.type === 'PushEvent' && e.created_at?.slice(0, 10) === todayStr)
    .reduce((sum, e) => sum + (e.payload?.commits?.length || 1), 0)

  const currentStreak = github.streak?.current || 0

  useEffect(() => {
    if (todayCommits > 0) xp.awardCommits(todayCommits)
  }, [todayCommits]) // eslint-disable-line

  const handlePomoComplete = useCallback(() => {
    setPomos(p => p + 1)
    xp.awardPomodoro()
  }, [xp])

  const handleTaskComplete = useCallback(() => {
    setTasksDone(t => t + 1)
    xp.awardTask()
  }, [xp])

  return (
    <main className="px-4 py-6 mx-auto max-w-screen-2xl sm:px-6">

      {/* Welcome banner */}
      {!github.user && !github.loading && !github.error && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 mb-6 widget-card">
          <div>
            <h2 className="text-sm font-semibold">Welcome to Dev Daily Dashboard</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Enter a GitHub username in the nav bar to load live data.
              Tasks, notes, and XP persist in your browser automatically.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500 flex-wrap">
            {['DevDaily', 'GitHub API', 'Chart.js', 'WakaTime', 'React + Vite'].map(t => (
              <span key={t} className="px-2 py-1 bg-gray-100 rounded dark:bg-surface-3">{t}</span>
            ))}
          </div>
        </div>
      )}

      {/* ── Widget grid ── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">

        {/* Row 1: GitHub Activity (wide) + Streak */}
        <div className="md:col-span-2">
          <GithubActivity
            loading={github.loading}
            error={github.error}
            user={github.user}
            repos={github.repos}
            grid={github.grid}
            gridSource={github.gridSource}
            totalContributions={github.totalContributions}
            recentCommits={github.recentCommits}
            weeklyActivity={github.weeklyActivity}
          />
        </div>
        <CodingStreak streak={github.streak} grid={github.grid} />

        {/* Row 2: LeetCode + Pomodoro + Productivity */}
        <LeetCodeProgress username="dev_user" />
        <PomodoroTimer onSessionComplete={handlePomoComplete} />
        <ProductivityScore
          githubCommits={todayCommits}
          streak={currentStreak}
          tasksCompleted={tasksDoneToday}
          pomosCompleted={pomosCompleted}
        />

        {/* Row 3: Tasks (wide) + Notes */}
        <div className="md:col-span-2">
          <TaskManager onTaskComplete={handleTaskComplete} />
        </div>
        <NotesWidget />

        {/* Row 4: WakaTime + XP + Goal */}
        <WakaTimeWidget />
        <XPLevelWidget
          totalXP={xp.totalXP}
          level={xp.level}
          progress={xp.progress}
          history={xp.history}
          daily={xp.daily}
          onReset={xp.resetXP}
        />
        <GithubGoalTracker
          events={github.events || []}
          username={github.user?.login}
        />

      </div>

      {/* ── Bottom: credentials + footer ── */}
      <SettingsActionBar />
      <DashboardFooter />

    </main>
  )
}
