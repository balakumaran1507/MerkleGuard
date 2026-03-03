import React from "react"
import { clsx } from "clsx"

export function StatCard({ label, value, subtitle, color = "cyan", icon: Icon }) {
  const colorMap = {
    cyan: "text-accent-cyan bg-accent-cyan/10",
    green: "text-mg-green bg-mg-green/10",
    amber: "text-mg-amber bg-mg-amber/10",
    red: "text-mg-red bg-mg-red/10",
    purple: "text-mg-purple bg-mg-purple/10",
    white: "text-text-primary bg-text-primary/10",
  }

  return (
    <div className="mg-card p-4 flex flex-col gap-1 min-w-[160px] flex-1">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{label}</span>
        {Icon && (
          <div className={clsx("p-1.5 rounded-lg opacity-80", colorMap[color])}>
             <Icon size={14} />
          </div>
        )}
      </div>
      <div className="text-2xl font-bold font-mono text-text-primary">{value}</div>
      <div className="text-[10px] text-text-dim truncate">{subtitle}</div>
    </div>
  )
}
