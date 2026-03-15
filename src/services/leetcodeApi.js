/**
 * LeetCode API Service
 *
 * LeetCode does not provide a public REST API with CORS headers,
 * so direct browser calls are blocked. Options are:
 *   1. A proxy/backend that calls their GraphQL endpoint server-side.
 *   2. A third-party wrapper API (e.g., alfa-leetcode-api on RapidAPI).
 *   3. Mock data (used here) — easy to swap when a real API is available.
 *
 * To connect a real API: replace `fetchLeetCodeStats` body with your
 * fetch call and keep the same return shape.
 */

// ---------------------------------------------------------------------------
// Mock data — reflects a realistic developer profile
// ---------------------------------------------------------------------------
const MOCK_STATS = {
  username: 'dev_user',
  totalSolved: 254,
  easy: { solved: 142, total: 359 },
  medium: { solved: 89, total: 374 },
  hard: { solved: 23, total: 162 },
  ranking: 148302,
  streak: 7,
  recentActivity: [
    { title: 'Two Sum', difficulty: 'easy', date: '2024-06-10' },
    { title: 'Longest Substring Without Repeating Chars', difficulty: 'medium', date: '2024-06-10' },
    { title: 'Median of Two Sorted Arrays', difficulty: 'hard', date: '2024-06-09' },
    { title: 'Container With Most Water', difficulty: 'medium', date: '2024-06-09' },
    { title: 'Valid Parentheses', difficulty: 'easy', date: '2024-06-08' },
  ],
  // Progress over last 6 months (month label → problems solved that month)
  monthlyProgress: [
    { month: 'Jan', solved: 18 },
    { month: 'Feb', solved: 24 },
    { month: 'Mar', solved: 31 },
    { month: 'Apr', solved: 27 },
    { month: 'May', solved: 39 },
    { month: 'Jun', solved: 22 },
  ],
}

/** Fetch LeetCode stats. Swap body for a real API call when available. */
export async function fetchLeetCodeStats(username) {
  // Simulate network delay
  await new Promise(r => setTimeout(r, 300))
  return { ...MOCK_STATS, username: username || MOCK_STATS.username }
}
