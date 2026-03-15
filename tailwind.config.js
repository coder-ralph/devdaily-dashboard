/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        // Dark mode surfaces (used directly in dark: variants)
        surface: {
          0: '#0a0b0e',
          1: '#111318',
          2: '#181c23',
          3: '#1f2430',
          4: '#262d3d',
        },
        // Light mode surfaces
        light: {
          0: '#f4f5f7',
          1: '#ffffff',
          2: '#f1f2f4',
          3: '#e5e7eb',
          4: '#d1d5db',
        },
        accent: {
          blue: '#3b82f6',
          green: '#10b981',
          amber: '#f59e0b',
          red: '#ef4444',
          purple: '#8b5cf6',
        },
      },
    },
  },
  plugins: [],
}
