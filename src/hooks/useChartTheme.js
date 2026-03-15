import { useTheme } from '../context/ThemeContext'

/**
 * useChartTheme
 * Returns Chart.js-safe (no CSS variables) color values
 * that adapt to the current dark/light theme.
 *
 * Chart.js canvases cannot resolve CSS variables, so we
 * must supply resolved hex/rgba values directly.
 */
export function useChartTheme() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return {
    isDark,
    tickColor:    isDark ? '#6b7280' : '#9ca3af',
    gridColor:    isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.07)',
    tooltipBg:    isDark ? '#1f2430' : '#ffffff',
    tooltipBorder:isDark ? '#262d3d' : '#e5e7eb',
    tooltipText:  isDark ? '#f0f2f5' : '#111318',
    barEmpty:     isDark ? 'rgba(38,45,61,0.8)' : 'rgba(229,231,235,0.9)',
    barFill:      'rgba(59,130,246,0.75)',
    barBorder:    'rgba(59,130,246,1)',
    borderColor:  isDark ? '#1f2430' : '#f3f4f6',
  }
}