import { formatDistanceToNow, parseISO } from 'date-fns'

/** Format a number: 1500 → "1.5k", 1200000 → "1.2M" */
export function fmtNum(n) {
  if (n == null) return '—'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`
  return String(n)
}

/** Relative time: "2 hours ago" */
export function timeAgo(dateStr) {
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true })
  } catch {
    return dateStr
  }
}

/** Clamp a value between min and max */
export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max)
}

/** Heatmap intensity level (0–4) based on commit count */
export function heatLevel(count) {
  if (count === 0) return 0
  if (count <= 1) return 1
  if (count <= 3) return 2
  if (count <= 7) return 3
  return 4
}

/** Today's date as YYYY-MM-DD */
export function today() {
  return new Date().toISOString().slice(0, 10)
}

/** Generate a unique ID */
export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}
