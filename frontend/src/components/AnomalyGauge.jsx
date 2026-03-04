import React from "react"

export function AnomalyGauge({ score }) {
  const radius = 38
  const circumference = 2 * Math.PI * radius
  const normalized = Math.min(Math.max(score || 0, 0), 1)
  const offset = circumference - normalized * circumference

  const color = normalized < 0.3
    ? "var(--color-status-ok)"
    : normalized < 0.7
      ? "var(--color-status-warn)"
      : "var(--color-status-crit)"

  return (
    <div style={{ position: "relative", width: 88, height: 88, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
        <circle cx="44" cy="44" r={radius} fill="none" stroke="var(--color-bg-elevated)" strokeWidth="6" />
        <circle
          cx="44" cy="44" r={radius} fill="none"
          stroke={color} strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(.16,1,.3,1), stroke 0.3s" }}
        />
      </svg>
      <div style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "17px", fontWeight: 800, color: "var(--color-text-primary)", letterSpacing: "-0.04em", lineHeight: 1 }}>
          {normalized.toFixed(2)}
        </span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "8px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text-muted)", marginTop: "2px" }}>
          Score
        </span>
      </div>
    </div>
  )
}
