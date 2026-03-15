import { useState, useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { today } from '../utils/helpers'

/**
 * XP Rules
 * All values are easily tweaked here.
 */
export const XP_RULES = {
  commit:   5,   // per commit pushed today
  pomodoro: 15,  // per completed work session
  task:     5,   // per task marked done
}

/**
 * Level formula
 * level = floor(totalXP / 100)
 * progressXP = totalXP % 100   (XP toward next level)
 * XP_PER_LEVEL = 100
 */
export const XP_PER_LEVEL = 100

export function xpToLevel(totalXP) {
  return Math.floor(totalXP / XP_PER_LEVEL)
}

export function xpProgress(totalXP) {
  return totalXP % XP_PER_LEVEL
}

/** Initial persisted XP state */
const INITIAL_XP_STATE = {
  totalXP: 0,
  history: {
    commits: 0,   // lifetime commit XP events
    pomodoro: 0,  // lifetime pomodoro XP events
    tasks: 0,     // lifetime task XP events
  },
  // Daily dedup counters — reset when date changes
  daily: {
    date: '',
    commitsAwarded: 0,   // number of commits we already gave XP for today
    pomosAwarded: 0,     // pomodoros already awarded today
    tasksAwarded: 0,     // tasks already awarded today
  },
}

/**
 * useXP
 *
 * Manages XP accumulation from GitHub commits, Pomodoro sessions,
 * and completed tasks.
 *
 * Deduplication strategy:
 *   Each activity type stores how many units have already been awarded
 *   for TODAY (date-keyed). On page reload the stored date is compared
 *   to today — if it matches, previously-awarded counts are respected
 *   so XP is never double-counted. If the date is different (new day),
 *   daily counters reset to 0.
 *
 *   GitHub commits: caller passes the TOTAL commits seen for today.
 *     We award XP only for the delta above what was already awarded.
 *   Pomodoro / tasks: caller calls awardPomodoro() / awardTask() once
 *     per completion event — the hook increments the daily counter.
 */
export function useXP() {
  const [xpState, setXpState] = useLocalStorage('devDashboardXP', INITIAL_XP_STATE)

  /** Ensure daily counters are for today; reset if stale. */
  function getFreshDaily(state) {
    const todayStr = today()
    if (state.daily.date === todayStr) return state.daily
    // New day — reset daily counters
    return { date: todayStr, commitsAwarded: 0, pomosAwarded: 0, tasksAwarded: 0 }
  }

  /**
   * Award XP for GitHub commits.
   * @param {number} totalCommitsToday — total commits seen for today (from GitHub events)
   *
   * We compare against daily.commitsAwarded to find the NEW commits,
   * then award XP_RULES.commit XP per new commit.
   */
  const awardCommits = useCallback((totalCommitsToday) => {
    setXpState(prev => {
      const daily = getFreshDaily(prev)
      const newCommits = Math.max(0, totalCommitsToday - daily.commitsAwarded)
      if (newCommits === 0) return prev  // nothing new to award

      const earned = newCommits * XP_RULES.commit
      return {
        totalXP: prev.totalXP + earned,
        history: { ...prev.history, commits: prev.history.commits + newCommits },
        daily: { ...daily, commitsAwarded: totalCommitsToday },
      }
    })
  }, [setXpState])

  /**
   * Award XP for one completed Pomodoro session.
   * Safe to call multiple times — each call awards exactly one session worth of XP.
   */
  const awardPomodoro = useCallback(() => {
    setXpState(prev => {
      const daily = getFreshDaily(prev)
      return {
        totalXP: prev.totalXP + XP_RULES.pomodoro,
        history: { ...prev.history, pomodoro: prev.history.pomodoro + 1 },
        daily: { ...daily, pomosAwarded: daily.pomosAwarded + 1 },
      }
    })
  }, [setXpState])

  /**
   * Award XP for one completed task.
   */
  const awardTask = useCallback(() => {
    setXpState(prev => {
      const daily = getFreshDaily(prev)
      return {
        totalXP: prev.totalXP + XP_RULES.task,
        history: { ...prev.history, tasks: prev.history.tasks + 1 },
        daily: { ...daily, tasksAwarded: daily.tasksAwarded + 1 },
      }
    })
  }, [setXpState])

  /** Hard reset — developer option only */
  const resetXP = useCallback(() => {
    setXpState(INITIAL_XP_STATE)
  }, [setXpState])

  const { totalXP, history, daily } = xpState
  const level = xpToLevel(totalXP)
  const progress = xpProgress(totalXP)  // 0–99

  return {
    totalXP,
    level,
    progress,          // XP within current level
    xpPerLevel: XP_PER_LEVEL,
    history,
    daily,
    awardCommits,
    awardPomodoro,
    awardTask,
    resetXP,
  }
}
