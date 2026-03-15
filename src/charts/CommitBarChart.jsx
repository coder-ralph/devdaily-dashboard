import React from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, Tooltip,
} from 'chart.js'
import { useChartTheme } from '../hooks/useChartTheme'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

export default function CommitBarChart({ data = [] }) {
  const ct = useChartTheme()

  const labels = data.map(d => new Date(d.date).toLocaleDateString('en', { weekday: 'short' }))
  const counts = data.map(d => d.count)

  const chartData = {
    labels,
    datasets: [{
      data: counts,
      backgroundColor: counts.map(c => c > 0 ? ct.barFill : ct.barEmpty),
      borderColor:     counts.map(c => c > 0 ? ct.barBorder : ct.barEmpty),
      borderWidth: 1,
      borderRadius: 4,
    }],
  }

  const options = {
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
        callbacks: { label: ctx => ` ${ctx.parsed.y} commit${ctx.parsed.y !== 1 ? 's' : ''}` },
      },
    },
    scales: {
      x: {
        ticks: { color: ct.tickColor, font: { family: 'JetBrains Mono', size: 10 } },
        grid: { color: ct.gridColor },
      },
      y: {
        beginAtZero: true,
        ticks: { color: ct.tickColor, font: { family: 'JetBrains Mono', size: 10 }, stepSize: 1 },
        grid: { color: ct.gridColor },
      },
    },
  }

  return (
    <div style={{ position: 'relative', height: '150px', width: '100%' }}>
      <Bar data={chartData} options={options} />
    </div>
  )
}
