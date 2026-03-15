/**
 * Productivity Score Service
 *
 * Calculates a 0–100 developer productivity score.
 * The formula is intentionally transparent and easy to adjust.
 *
 * Inputs
 *   githubCommits  — number of commits today (from events)
 *   streak         — current coding streak in days
 *   tasksCompleted — tasks marked done today
 *   pomosCompleted — Pomodoro work sessions completed today
 *   lcSolvedToday  — LeetCode problems solved today (mock)
 *
 * Weights (must sum to 1.0 for clarity, though score is clamped to 100)
 *   GitHub activity  → 30%
 *   Coding streak    → 20%
 *   Tasks done       → 25%
 *   Pomodoros        → 15%
 *   LeetCode         → 10%
 */

const WEIGHTS = {
  github: 0.30,
  streak: 0.20,
  tasks: 0.25,
  pomodoro: 0.15,
  leetcode: 0.10,
}

// Max values used to normalise each metric to 0–100 before weighting
const MAXES = {
  github: 10,    // 10 commits = 100% on that dimension
  streak: 30,    // 30-day streak = 100%
  tasks: 5,      // 5 tasks done = 100%
  pomodoro: 4,   // 4 pomodoro sessions = 100%
  leetcode: 3,   // 3 problems solved = 100%
}

/**
 * Calculate score and breakdown.
 * @returns {{ score: number, breakdown: object, label: string }}
 */
export function calculateProductivityScore({
  githubCommits = 0,
  streak = 0,
  tasksCompleted = 0,
  pomosCompleted = 0,
  lcSolvedToday = 0,
}) {
  const normalise = (val, max) => Math.min(val / max, 1) * 100

  const scores = {
    github: normalise(githubCommits, MAXES.github),
    streak: normalise(streak, MAXES.streak),
    tasks: normalise(tasksCompleted, MAXES.tasks),
    pomodoro: normalise(pomosCompleted, MAXES.pomodoro),
    leetcode: normalise(lcSolvedToday, MAXES.leetcode),
  }

  const total = Math.round(
    scores.github   * WEIGHTS.github   +
    scores.streak   * WEIGHTS.streak   +
    scores.tasks    * WEIGHTS.tasks    +
    scores.pomodoro * WEIGHTS.pomodoro +
    scores.leetcode * WEIGHTS.leetcode
  )

  const label =
    total >= 80 ? 'Exceptional' :
    total >= 60 ? 'Productive'  :
    total >= 40 ? 'Building Momentum' :
    total >= 20 ? 'Getting Started' :
    'Rest Day'

  return {
    score: Math.min(total, 100),
    breakdown: scores,
    label,
    weights: WEIGHTS,
  }
}
