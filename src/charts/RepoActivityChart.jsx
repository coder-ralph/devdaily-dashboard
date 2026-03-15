import React from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip,
} from 'chart.js'
import { useChartTheme } from '../hooks/useChartTheme'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

const COLORS = [
  'rgba(59,130,246,0.75)',
  'rgba(16,185,129,0.75)',
  'rgba(245,158,11,0.75)',
  'rgba(139,92,246,0.75)',
  'rgba(239,68,68,0.75)',
]

export default function RepoActivityChart({ repos = [] }) {
  const ct = useChartTheme()
  const top = repos.slice(0, 5)

  const chartData = {
    labels: top.map(r => r.name),
    datasets: [{
      data: top.map(r => r.stargazers_count || 0),
      backgroundColor: COLORS.slice(0, top.length),
      borderRadius: 4,
    }],
  }

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: ct.tooltipBg,
        borderColor: ct.tooltipBorder,
        borderWidth: 1,
        titleColor: ct.tooltipText,
        bodyColor: ct.tooltipText,
        callbacks: { label: ctx => ` ★ ${ctx.parsed.x.toLocaleString()}` },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { color: ct.tickColor, font: { size: 10 } },
        grid: { color: ct.gridColor },
      },
      y: {
        ticks: { color: ct.tickColor, font: { family: 'JetBrains Mono', size: 11 } },
        grid: { display: false },
      },
    },
  }

  const height = Math.max(top.length * 38 + 40, 120)
  return (
    <div style={{ position: 'relative', height: `${height}px`, width: '100%' }}>
      <Bar data={chartData} options={options} />
    </div>
  )
}
