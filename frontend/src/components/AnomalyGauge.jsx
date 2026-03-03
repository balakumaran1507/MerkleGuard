import React from "react"

export function AnomalyGauge({ score }) {
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const normalizedScore = Math.min(Math.max(score || 0, 0), 1)
  const offset = circumference - normalizedScore * circumference

  const getColor = (s) => {
    if (s < 0.3) return "#10b981"
    if (s < 0.7) return "#f59e0b"
    return "#ef4444"
  }

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="48" cy="48" r={radius}
          fill="none" stroke="#1e293b" strokeWidth="6"
        />
        <circle
          cx="48" cy="48" r={radius}
          fill="none" stroke={getColor(normalizedScore)} strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-xl font-bold font-mono text-text-primary">{normalizedScore.toFixed(2)}</span>
        <span className="text-[8px] font-bold text-text-muted uppercase tracking-widest">Score</span>
      </div>
    </div>
  )
}
