import React from "react"

const STATUS = {
  compliant: {
    dot: "var(--color-status-ok)",
    glow: "rgba(16,212,140,0.5)",
    text: "var(--color-status-ok)",
    bg: "var(--color-status-ok-dim)",
    border: "rgba(16,212,140,0.2)",
    label: "Compliant",
    pulse: false,
  },
  drifted: {
    dot: "var(--color-status-warn)",
    glow: "rgba(245,158,11,0.5)",
    text: "var(--color-status-warn)",
    bg: "var(--color-status-warn-dim)",
    border: "rgba(245,158,11,0.25)",
    label: "Drifted",
    pulse: true,
  },
  critical: {
    dot: "var(--color-status-crit)",
    glow: "rgba(240,75,75,0.5)",
    text: "var(--color-status-crit)",
    bg: "var(--color-status-crit-dim)",
    border: "rgba(240,75,75,0.25)",
    label: "Critical",
    pulse: true,
  },
}

export function StatusBadge({ status }) {
  const c = STATUS[status] || STATUS.compliant

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        padding: "2px 8px",
        borderRadius: "4px",
        fontSize: "10px",
        fontWeight: 600,
        fontFamily: "var(--font-mono)",
        letterSpacing: "0.06em",
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.text,
      }}
    >
      <span
        className={c.pulse ? "animate-mg-pulse" : ""}
        style={{
          display: "block",
          width: "5px",
          height: "5px",
          borderRadius: "50%",
          background: c.dot,
          boxShadow: `0 0 5px ${c.glow}`,
          flexShrink: 0,
        }}
      />
      {c.label}
    </div>
  )
}
