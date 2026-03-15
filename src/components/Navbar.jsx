import React, { useState } from 'react'
import { Search, Github, Sun, Moon, Terminal } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function Navbar({ onSearch, defaultUsername = '' }) {
  const [username, setUsername] = useState(defaultUsername)
  const { theme, toggle } = useTheme()

  function handleSearch(e) {
    e.preventDefault()
    if (username.trim()) onSearch(username.trim())
  }

  const isDark = theme === 'dark'

  return (
    <header className={`sticky top-0 z-50 backdrop-blur border-b transition-colors duration-200 ${
      isDark
        ? 'bg-surface-1/90 border-white/[0.07]'
        : 'bg-white/90 border-gray-200'
    }`}>
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14 gap-4">

        {/* Brand */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-6 h-6 rounded-md bg-accent-blue flex items-center justify-center">
            <Terminal size={13} className="text-white" />
          </div>
          <span className={`font-semibold text-sm tracking-tight hidden sm:block ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            dev daily
          </span>
        </div>

        {/* GitHub search */}
        <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative flex-1">
            <Github size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${
              isDark ? 'text-gray-500' : 'text-gray-400'
            }`} />
            <input
              className="input-base w-full pl-8 py-1.5 text-xs font-mono"
              placeholder="github username"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary py-1.5">
            <Search size={12} />
          </button>
        </form>

        {/* Theme toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="btn-ghost p-2 rounded-md"
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            {isDark
              ? <Sun size={14} className="text-amber-400" />
              : <Moon size={14} className="text-blue-500" />}
          </button>
        </div>

      </div>
    </header>
  )
}
