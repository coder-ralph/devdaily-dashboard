import React from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Filler, Tooltip,
} from 'chart.js'
import { useChartTheme } from '../hooks/useChartTheme'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

export default function LCProgressLine({ monthly = [] }) {
  const ct = useChartTheme()

  const chartData = {
    labels: monthly.map(m => m.month),
    datasets: [{
      data: monthly.map(m => m.solved),
      borderColor: '#f59e0b',
      backgroundColor: 'rgba(245,158,11,0.08)',
      borderWidth: 2,
      pointRadius: 3,
      pointBackgroundColor: '#f59e0b',
      tension: 0.4,
      fill: true,
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
      },
    },
    scales: {
      x: {
        ticks: { color: ct.tickColor, font: { size: 10 } },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: { color: ct.tickColor, font: { size: 10 }, stepSize: 10 },
        grid: { color: ct.gridColor },
      },
    },
  }

  return (
    <div style={{ position: 'relative', height: '100px', width: '100%' }}>
      <Line data={chartData} options={options} />
    </div>
  )
}
