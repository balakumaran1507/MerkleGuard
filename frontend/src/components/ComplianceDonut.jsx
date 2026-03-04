import React from "react"

export function ComplianceDonut({ stats }) {
  const compliant = stats?.compliant_count || stats?.compliant || 0
  const drifted = stats?.drifted_count || stats?.drifted || 0
  const critical = stats?.critical_count || stats?.critical || 0
  const total = compliant + drifted + critical || 1

  const radius = 68
  const strokeWidth = 16
  const circumference = 2 * Math.PI * radius
  const gap = 3

  const cPct = (compliant / total) * circumference - gap
  const dPct = (drifted / total) * circumference - gap
  const rPct = (critical / total) * circumference - gap

  const cOffset = 0
  const dOffset = -(compliant / total) * circumference
  const rOffset = -((compliant + drifted) / total) * circumference

  const compliantPct = Math.round((compliant / total) * 100)

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
      {/* SVG Donut */}
      <div style={{ position: "relative", width: 160, height: 160, flexShrink: 0 }}>
        <svg viewBox="0 0 200 200" style={{ transform: "rotate(-90deg)", width: "100%", height: "100%" }}>
          {/* Track */}
          <circle cx="100" cy="100" r={radius} fill="none" stroke="var(--color-bg-elevated)" strokeWidth={strokeWidth} />

          {/* Compliant */}
          <circle cx="100" cy="100" r={radius} fill="none"
            stroke="var(--color-status-ok)" strokeWidth={strokeWidth}
            strokeDasharray={`${Math.max(0, cPct)} ${circumference}`}
            strokeDashoffset={cOffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 1s cubic-bezier(.16,1,.3,1)" }}
          />

          {/* Drifted */}
          <circle cx="100" cy="100" r={radius} fill="none"
            stroke="var(--color-status-warn)" strokeWidth={strokeWidth}
            strokeDasharray={`${Math.max(0, dPct)} ${circumference}`}
            strokeDashoffset={dOffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 1s cubic-bezier(.16,1,.3,1)" }}
          />

          {/* Critical */}
          <circle cx="100" cy="100" r={radius} fill="none"
            stroke="var(--color-status-crit)" strokeWidth={strokeWidth}
            strokeDasharray={`${Math.max(0, rPct)} ${circumference}`}
            strokeDashoffset={rOffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 1s cubic-bezier(.16,1,.3,1)" }}
          />
        </svg>

        {/* Center label */}
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "28px", fontWeight: 800, color: "var(--color-text-primary)", letterSpacing: "-0.04em", lineHeight: 1 }}>
            {compliantPct}%
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text-muted)", marginTop: "3px" }}>
            Compliant
          </span>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {[
          { color: "var(--color-status-ok)", label: "Compliant", count: compliant },
          { color: "var(--color-status-warn)", label: "Drifted", count: drifted },
          { color: "var(--color-status-crit)", label: "Critical", count: critical },
        ].map(({ color, label, count }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: 8, height: 8, borderRadius: "3px", background: color, flexShrink: 0, boxShadow: `0 0 6px ${color}80` }} />
            <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text-muted)" }}>
                {label}
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "15px", fontWeight: 700, color: "var(--color-text-primary)", lineHeight: 1 }}>
                {count} <span style={{ fontSize: "10px", fontWeight: 500, color: "var(--color-text-muted)" }}>nodes</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
