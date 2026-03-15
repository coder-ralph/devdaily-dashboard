import React, { useState } from 'react'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'

const DEFAULT_USERNAME = import.meta.env.VITE_DEFAULT_GITHUB_USERNAME || ''

function AppInner() {
  const [searchUsername, setSearchUsername] = useState(DEFAULT_USERNAME)
  const { theme } = useTheme()

  return (
    // Root bg adapts to theme — dark uses surface-0, light uses a warm near-white
    <div className={`min-h-screen transition-colors duration-200 ${
      theme === 'dark' ? 'bg-surface-0' : 'bg-light-0'
    }`}>
      <Navbar onSearch={setSearchUsername} defaultUsername={DEFAULT_USERNAME} />
      <Dashboard searchUsername={searchUsername} />
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  )
}
