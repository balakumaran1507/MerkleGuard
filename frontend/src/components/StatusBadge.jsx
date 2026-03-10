import React from "react"

const STATUS = {
  compliant: {
    dot: "bg-emerald-500",
    glow: "shadow-[0_0_8px_rgba(16,185,129,0.5)]",
    text: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    label: "Compliant",
    pulse: false,
  },
  drifted: {
    dot: "bg-amber-500",
    glow: "shadow-[0_0_8px_rgba(245,158,11,0.5)]",
    text: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    label: "Drifted",
    pulse: true,
  },
  critical: {
    dot: "bg-red-500",
    glow: "shadow-[0_0_8px_rgba(239,68,68,0.5)]",
    text: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    label: "Critical",
    pulse: true,
  },
}

export function StatusBadge({ status }) {
  // Normalize status names from old versions to new versions if needed
  const normalizedStatus = status === 'secure' ? 'compliant' : status === 'warning' ? 'drifted' : status === 'compromised' ? 'critical' : status;
  const c = STATUS[normalizedStatus] || STATUS.compliant

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold tracking-widest uppercase border ${c.bg} ${c.border} ${c.text}`}>
      <span className={`block w-1.5 h-1.5 rounded-full shrink-0 ${c.dot} ${c.glow} ${c.pulse ? "animate-pulse" : ""}`} />
      {c.label}
    </div>
  )
}
