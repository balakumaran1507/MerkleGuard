import React from "react"
import { clsx } from "clsx"

export function StatusBadge({ status }) {
  const config = {
    compliant: { dot: "bg-mg-green", pill: "border-mg-green-dim text-mg-green bg-mg-green/5", pulse: false },
    drifted: { dot: "bg-mg-amber", pill: "border-mg-amber-dim text-mg-amber bg-mg-amber/5", pulse: true },
    critical: { dot: "bg-mg-red", pill: "border-mg-red-dim text-mg-red bg-mg-red/5", pulse: true },
  }

  const { dot, pill, pulse } = config[status] || config.compliant

  return (
    <div className={clsx("mg-pill", pill)}>
      <span className={clsx("w-1.5 h-1.5 rounded-full", dot, pulse && "animate-mg-pulse")} />
      <span className="capitalize">{status}</span>
    </div>
  )
}
