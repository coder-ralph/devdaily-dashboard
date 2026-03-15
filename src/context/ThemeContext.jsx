import React, { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

/**
 * ThemeProvider
 * Wraps the entire app. Reads persisted theme from localStorage,
 * applies the 'dark' class to <html>, and exposes toggle().
 *
 * Usage:  const { theme, toggle } = useTheme()
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('ddd-theme') || 'dark'
    } catch {
      return 'dark'
    }
  })

  // Keep <html class="dark"> in sync whenever theme changes
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    try {
      localStorage.setItem('ddd-theme', theme)
    } catch { /* quota */ }
  }, [theme])

  function toggle() {
    setTheme(t => (t === 'dark' ? 'light' : 'dark'))
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
