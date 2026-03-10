import React from "react"
import { useEvents } from "../context/EventContext"

export function ComplianceDonut({ stats: propStats, nodes: propNodes }) {
  const { stats: ctxStats, nodes: ctxNodes } = useEvents()

  const actualStats = propStats || ctxStats
  const actualNodes = propNodes || ctxNodes || []

  // Compute from nodes if stats missing
  let compliant = actualStats?.compliant_count || 0
  let drifted = actualStats?.drifted_count || 0
  let critical = actualStats?.critical_count || 0

  if (!actualStats?.compliant_count && actualNodes.length > 0) {
    compliant = actualNodes.filter(n => n.status === 'secure').length
    drifted = actualNodes.filter(n => n.status === 'drifted' || n.status === 'warning').length
    critical = actualNodes.filter(n => n.status === 'compromised' || n.status === 'critical').length
  }

  const total = compliant + drifted + critical || 1

  const radius = 68
  const strokeWidth = 14
  const circumference = 2 * Math.PI * radius

  // No gap for cleaner look
  const gap = 0

  const cPct = (compliant / total) * circumference - gap
  const dPct = (drifted / total) * circumference - gap
  const rPct = (critical / total) * circumference - gap

  const cOffset = 0
  const dOffset = -(compliant / total) * circumference
  const rOffset = -((compliant + drifted) / total) * circumference

  const compliantPct = Math.round((compliant / total) * 100) || 0

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* SVG Donut */}
      <div className="relative w-40 h-40 shrink-0">
        <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90 drop-shadow-sm">
          {/* Track */}
          <circle cx="100" cy="100" r={radius} fill="none" className="stroke-gray-100" strokeWidth={strokeWidth} />

          {/* Compliant */}
          <circle cx="100" cy="100" r={radius} fill="none"
            className="stroke-emerald-500 transition-all duration-1000 ease-out" strokeWidth={strokeWidth}
            strokeDasharray={`${Math.max(0, cPct)} ${circumference}`}
            strokeDashoffset={cOffset}
            strokeLinecap="round"
          />

          {/* Drifted */}
          <circle cx="100" cy="100" r={radius} fill="none"
            className="stroke-amber-400 transition-all duration-1000 ease-out" strokeWidth={strokeWidth}
            strokeDasharray={`${Math.max(0, dPct)} ${circumference}`}
            strokeDashoffset={dOffset}
            strokeLinecap="round"
          />

          {/* Critical */}
          <circle cx="100" cy="100" r={radius} fill="none"
            className="stroke-red-500 transition-all duration-1000 ease-out" strokeWidth={strokeWidth}
            strokeDasharray={`${Math.max(0, rPct)} ${circumference}`}
            strokeDashoffset={rOffset}
            strokeLinecap="round"
          />
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-gray-900 tracking-tight leading-none">
            {compliantPct}%
          </span>
          <span className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 mt-1">
            Secure
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center flex-wrap gap-x-6 gap-y-3 w-full px-2">
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm" />
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Secure</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">{compliant}</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-400 shadow-sm" />
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Drifted</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">{drifted}</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500 shadow-sm" />
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Critical</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">{critical}</span>
        </div>
      </div>
    </div>
  )
}
