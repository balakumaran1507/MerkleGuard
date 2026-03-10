import React from "react"
import { clsx } from "clsx"

export function StatCard({
  label,
  value,
  subtitle,
  trend,
  trendDir,
  icon: Icon,
  colorConfig
}) {
  const cfg = colorConfig || {
    icon: "text-gray-600",
    iconBg: "bg-gray-100",
    iconBorder: "border-gray-200",
    accent: "bg-gray-400"
  }

  return (
    <div className="card flex-1 min-w-[150px] p-5 flex flex-col hover:-translate-y-0.5 transition-transform duration-200 cursor-default group">
      {/* Top row: label + icon */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-500">
          {label}
        </span>
        {Icon && (
          <div className={clsx(
            "w-9 h-9 rounded-lg flex items-center justify-center border transition-colors",
            cfg.iconBg, cfg.iconBorder, cfg.icon
          )}>
            <Icon size={18} strokeWidth={2} />
          </div>
        )}
      </div>

      {/* Value */}
      <div className="text-3xl font-bold text-gray-900 tracking-tight leading-none mb-2">
        {value}
      </div>

      {/* Subtitle / Trend */}
      <div className="flex items-center gap-2 mt-auto pt-2">
        {trend && (
          <span className={clsx(
            "text-xs font-semibold px-2 py-0.5 rounded-full flex items-center justify-center",
            trendDir === 'up' ? "bg-emerald-50 text-emerald-600" :
              trendDir === 'down' ? "bg-red-50 text-red-600" :
                "bg-gray-100 text-gray-600"
          )}>
            {trend}
          </span>
        )}
        {subtitle && (
          <span className="text-xs text-gray-400 truncate w-full">
            {subtitle}
          </span>
        )}
      </div>

      {/* Subtle bottom indicator line (hover) */}
      <div className="opacity-0 group-hover:opacity-100 mt-4 h-1 w-12 rounded-full transition-all duration-300 left-0 bottom-0 absolute mb-0 ml-5 data-accent" />
    </div>
  )
}
