/**
 * WakaTime API Service
 *
 * All requests go through the Vercel proxy endpoint:
 *    GET /api/wakatime
 *
 * This keeps the WakaTime API key server-side and avoids CORS issues.
 *
 * Flow:
 * Widget → fetchTodaySummary() → /api/wakatime → WakaTime API
 *
 * Required server variable:
 * WAKATIME_API_KEY (configured in Vercel Environment Variables)
 */

// Mock fallback used if the proxy fails
const MOCK_DATA = {
  isMock: true,
  totalSeconds: 12600,
  totalHuman: '3h 30m',
  languages: [
    { name: 'JavaScript', totalSeconds: 6600, percent: 52.4 },
    { name: 'TypeScript', totalSeconds: 2700, percent: 21.4 },
    { name: 'CSS',        totalSeconds: 1800, percent: 14.3 },
    { name: 'HTML',       totalSeconds:  900, percent:  7.1 },
    { name: 'JSON',       totalSeconds:  600, percent:  4.8 },
  ],
  editors: [
    { name: 'VS Code', totalSeconds: 11400, percent: 90.5 },
    { name: 'Vim',     totalSeconds:  1200, percent:  9.5 },
  ],
}

// Helpers
/**
 * Convert a raw seconds value to a compact human-readable string.
 * formatDuration(3660) → "1h 1m"
 * formatDuration(45)   → "0m"
 */
export function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

/**
 * Normalise a raw WakaTime summary object into the shape the widget expects.
 * Returns a consistent structure regardless of how the upstream API responds.
 */
function normaliseSummary(summary) {
  const totalSeconds = summary.grand_total?.total_seconds || 0

  const languages = (summary.languages || [])
    .slice(0, 6)
    .map(lang => ({
      name: lang.name,
      totalSeconds: lang.total_seconds,
      percent: Math.round(lang.percent * 10) / 10,
    }))

  const editors = (summary.editors || [])
    .map(editor => ({
      name: editor.name,
      totalSeconds: editor.total_seconds,
      percent: Math.round(editor.percent * 10) / 10,
    }))

  return {
    isMock: false,
    totalSeconds,
    totalHuman: summary.grand_total?.text || formatDuration(totalSeconds),
    languages,
    editors,
  }
}

// Main API call
/**
 * Fetch today's coding summary via the /api/wakatime proxy.
 * Returns live data on success, or MOCK_DATA on failure.
 */
export async function fetchTodaySummary() {
  try {
    const res = await fetch('/api/wakatime')

    // Non-2xx responses (proxy error, missing key, WakaTime down)
    if (!res.ok) {
      console.warn('[WakaTime] Proxy responded with', res.status)
      return MOCK_DATA
    }

    // Guard against the proxy returning HTML instead of JSON
    // (e.g., a Vercel 404 page if the function is not deployed)
    const contentType = res.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      console.warn('[WakaTime] Proxy returned non-JSON response')
      return MOCK_DATA
    }

    const json = await res.json()

    // The proxy may itself return an error object
    if (json.error) {
      console.warn('[WakaTime] Proxy error:', json.error)
      return MOCK_DATA
    }

    // WakaTime returns summaries as an array; today is always index 0
    const summary = json.data?.[0]

    if (!summary) {
      // Proxy is working but no data for today (e.g., no coding yet)
      return {
        isMock: false,
        totalSeconds: 0,
        totalHuman: '0m',
        languages: [],
        editors: [],
      }
    }

    return normaliseSummary(summary)

  } catch {
    // Network failure, parse error, or AbortError
    console.warn('[WakaTime] Failed to reach proxy — showing fallback data')
    return MOCK_DATA
  }
}
