import React from 'react'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js'
import { useChartTheme } from '../hooks/useChartTheme'

ChartJS.register(ArcElement, Tooltip)

export default function LCDoughnut({ easy = 0, medium = 0, hard = 0 }) {
  const ct = useChartTheme()

  const chartData = {
    labels: ['Easy', 'Medium', 'Hard'],
    datasets: [{
      data: [easy, medium, hard],
      backgroundColor: [
        'rgba(34,197,94,0.8)',
        'rgba(245,158,11,0.8)',
        'rgba(239,68,68,0.8)',
      ],
      borderColor: ct.borderColor,
      borderWidth: 2,
    }],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: ct.tooltipBg,
        borderColor: ct.tooltipBorder,
        borderWidth: 1,
        titleColor: ct.tooltipText,
        bodyColor: ct.tooltipText,
        callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed}` },
      },
    },
  }

  return (
    <div style={{ position: 'relative', height: '110px', width: '110px' }}>
      <Doughnut data={chartData} options={options} />
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-lg font-bold leading-none text-gray-900 dark:text-white">
          {easy + medium + hard}
        </span>
        <span className="text-[9px] text-gray-500 dark:text-gray-400 font-mono">solved</span>
      </div>
    </div>
  )
}
