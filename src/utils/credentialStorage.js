/**
 * credentialStorage.js
 *
 * Centralised helpers for reading/writing user-supplied API credentials
 * from/to localStorage. All keys live here so they never drift out of sync
 * between the dialog components and the API service files.
 *
 * Security notes:
 *  - Credentials are stored only in the user's own browser localStorage.
 *  - They are never logged, never sent to any server other than the
 *    respective API endpoint (GitHub / WakaTime).
 *  - Clearing browser data / localStorage removes them instantly.
 *  - We deliberately do NOT export raw keys in log statements.
 */

export const STORAGE_KEYS = {
  wakatime: 'devDashboard.wakatimeApiKey',
  github:   'devDashboard.githubToken',
}

// ─── WakaTime ────────────────────────────────────────────────────────────────

/** Returns the stored WakaTime API key, or null if not set. */
export function getWakatimeKey() {
  try { return localStorage.getItem(STORAGE_KEYS.wakatime) || null }
  catch { return null }
}

/** Persists a WakaTime API key. Pass null / empty string to clear. */
export function setWakatimeKey(key) {
  try {
    if (key && key.trim()) {
      localStorage.setItem(STORAGE_KEYS.wakatime, key.trim())
    } else {
      localStorage.removeItem(STORAGE_KEYS.wakatime)
    }
  } catch { /* storage full / unavailable */ }
}

/** Remove the stored WakaTime key entirely. */
export function clearWakatimeKey() {
  try { localStorage.removeItem(STORAGE_KEYS.wakatime) } catch { /* noop */ }
}

// ─── GitHub ───────────────────────────────────────────────────────────────────

/** Returns the stored GitHub personal access token, or null if not set. */
export function getGithubToken() {
  try { return localStorage.getItem(STORAGE_KEYS.github) || null }
  catch { return null }
}

/** Persists a GitHub token. Pass null / empty string to clear. */
export function setGithubToken(token) {
  try {
    if (token && token.trim()) {
      localStorage.setItem(STORAGE_KEYS.github, token.trim())
    } else {
      localStorage.removeItem(STORAGE_KEYS.github)
    }
  } catch { /* noop */ }
}

/** Remove the stored GitHub token entirely. */
export function clearGithubToken() {
  try { localStorage.removeItem(STORAGE_KEYS.github) } catch { /* noop */ }
}

// ─── Display helpers ─────────────────────────────────────────────────────────

/**
 * Masks a credential for safe display.
 * Shows first 6 chars, then asterisks, then last 4 chars.
 * e.g.  "ghp_Ab••••••••••••••1234"
 */
export function maskCredential(value) {
  if (!value || value.length < 12) return '••••••••••••'
  return value.slice(0, 6) + '••••••••••••' + value.slice(-4)
}
