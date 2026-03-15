import { useState, useEffect, useRef, useCallback } from 'react'

const WORK_SECONDS = 25 * 60
const BREAK_SECONDS = 5 * 60

/**
 * usePomodoro
 * Full Pomodoro timer logic — work / break cycles with session tracking.
 * Fires an optional callback when a work session completes.
 */
export function usePomodoro({ onSessionComplete } = {}) {
  const [mode, setMode] = useState('work')       // 'work' | 'break'
  const [timeLeft, setTimeLeft] = useState(WORK_SECONDS)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState(0)    // completed work sessions today

  const timerRef = useRef(null)
  const modeRef = useRef(mode)
  modeRef.current = mode

  const total = mode === 'work' ? WORK_SECONDS : BREAK_SECONDS
  const progress = (total - timeLeft) / total    // 0 → 1

  const clearTimer = () => clearInterval(timerRef.current)

  const tick = useCallback(() => {
    setTimeLeft(prev => {
      if (prev <= 1) {
        clearTimer()
        setRunning(false)
        if (modeRef.current === 'work') {
          setSessions(s => s + 1)
          onSessionComplete?.()
          // Attempt browser notification
          if (Notification.permission === 'granted') {
            new Notification('Pomodoro complete! Take a 5-minute break.')
          }
        }
        // Switch mode and reset timer
        const nextMode = modeRef.current === 'work' ? 'break' : 'work'
        setMode(nextMode)
        return nextMode === 'work' ? WORK_SECONDS : BREAK_SECONDS
      }
      return prev - 1
    })
  }, [onSessionComplete])

  const start = useCallback(() => {
    if (running) return
    setRunning(true)
    timerRef.current = setInterval(tick, 1000)

    // Request notification permission on first start
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [running, tick])

  const pause = useCallback(() => {
    clearTimer()
    setRunning(false)
  }, [])

  const reset = useCallback(() => {
    clearTimer()
    setRunning(false)
    setMode('work')
    setTimeLeft(WORK_SECONDS)
  }, [])

  const skip = useCallback(() => {
    clearTimer()
    setRunning(false)
    const nextMode = mode === 'work' ? 'break' : 'work'
    setMode(nextMode)
    setTimeLeft(nextMode === 'work' ? WORK_SECONDS : BREAK_SECONDS)
  }, [mode])

  // Clean up on unmount
  useEffect(() => () => clearTimer(), [])

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const ss = String(timeLeft % 60).padStart(2, '0')

  return { mode, timeLeft, running, sessions, progress, display: `${mm}:${ss}`, start, pause, reset, skip }
}
