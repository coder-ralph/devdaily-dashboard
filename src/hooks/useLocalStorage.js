import { useState, useEffect } from 'react'

/**
 * useLocalStorage
 * Drop-in replacement for useState that persists to localStorage.
 * On first load it reads from storage; on change it writes back.
 *
 * @param {string} key       localStorage key
 * @param {*}      initial   default value if key is absent
 */
export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored !== null ? JSON.parse(stored) : initial
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Silently ignore quota errors
    }
  }, [key, value])

  return [value, setValue]
}
