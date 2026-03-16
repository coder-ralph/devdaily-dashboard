import { getWakatimeKey } from '../utils/credentialStorage'

/**
 * WakaTime API Service
 *
 * All requests go through the Vercel serverless proxy at /api/wakatime.
 * Direct browser requests to wakatime.com are blocked by CORS — the proxy
 * is the only viable path for browser-originated WakaTime requests.
 *
 * Key resolution (handled by the proxy, not the browser):
 *  1. If a user key exists in localStorage, it is forwarded to the proxy
 *     as the x-wakatime-key request header. The proxy uses it first.
 *  2. If no user key is present, the request is sent with no header and
 *     the proxy falls back to its WAKATIME_API_KEY environment variable.
 *
 * The key is never used directly in the browser for API calls.
 * It travels over HTTPS to our own proxy endpoint only.
 */

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

export function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

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

/**
 * Fetch today's WakaTime coding summary via the server-side proxy.
 *
 * If a user key exists in localStorage, it is forwarded to the proxy
 * as x-wakatime-key so the proxy can use it instead of its env var.
 *
 * Always resolves — never rejects.
 * Returns live data on success, MOCK_DATA on any failure.
 */
export async function fetchTodaySummary() {
  try {
    // Read user-saved key from localStorage at call time.
    // getWakatimeKey() returns a string or null.
    const userKey = getWakatimeKey()

    // Build request headers.
    // Only add x-wakatime-key when a non-empty user key is present.
    const headers = {}
    if (userKey) {
      headers['x-wakatime-key'] = userKey
    }

    const res = await fetch('/api/wakatime', { headers })

    if (!res.ok) {
      console.warn('[WakaTime] Proxy responded with', res.status)
      return MOCK_DATA
    }

    const contentType = res.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      console.warn('[WakaTime] Proxy returned non-JSON response')
      return MOCK_DATA
    }

    const json = await res.json()

    if (json.error) {
      console.warn('[WakaTime] Proxy error:', json.error)
      return MOCK_DATA
    }

    const summary = json.data?.[0]

    if (!summary) {
      // Proxy is working but no coding activity recorded yet today
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
    console.warn('[WakaTime] Failed to reach proxy — showing fallback data')
    return MOCK_DATA
  }
}
