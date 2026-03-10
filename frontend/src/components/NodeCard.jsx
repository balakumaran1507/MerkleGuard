import React from "react"
import { StatusBadge } from "./StatusBadge"

export function NodeCard({ node, isSelected, onClick }) {
  const isOk = node.status === 'secure' || node.status === 'compliant'
  const isWarn = node.status === 'warning' || node.status === 'drifted'
  const isCrit = node.status === 'compromised' || node.status === 'critical'

  const totalCats = 6
  const driftedCount = (node.drifted_categories || []).length
  const compliancePct = ((totalCats - driftedCount) / totalCats) * 100
  const merkleRoot = node.current_merkle_root || node.merkle_root || ""

  const barColor = isCrit ? "bg-red-500" : isWarn ? "bg-amber-500" : "bg-emerald-500"
  const barTextColor = isCrit ? "text-red-600" : isWarn ? "text-amber-600" : "text-emerald-600"

  return (
    <div
      onClick={onClick}
      className={`card p-4 transition-all cursor-pointer border ${isSelected
          ? "border-blue-300 ring-2 ring-blue-500/20 shadow-[0_4px_20px_-4px_rgba(59,130,246,0.15)]"
          : "border-gray-100 hover:border-gray-300 hover:shadow-sm"
        }`}
    >
      {/* Name + Badge */}
      <div className="flex items-start justify-between mb-4 gap-2">
        <span className="font-mono text-xs font-bold text-gray-900 truncate max-w-[120px]" title={node.name || node.hostname}>
          {node.name || node.hostname}
        </span>
        <StatusBadge status={node.status} />
      </div>

      {/* Meta rows */}
      <div className="flex flex-col gap-2.5 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">
            Zone
          </span>
          <span className="text-xs font-medium text-gray-600">
            {node.zone || "us-east-1"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">
            Root Hash
          </span>
          <span className="font-mono text-[10px] font-bold text-blue-600 tracking-wide">
            {merkleRoot ? `${merkleRoot.substring(0, 10)}…` : "Pending..."}
          </span>
        </div>
      </div>

      {/* Compliance bar */}
      <div className="pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[9px] font-bold tracking-widest uppercase text-gray-400">
            Compliance
          </span>
          <span className={`font-mono text-[10px] font-bold ${barTextColor}`}>
            {Math.round(compliancePct)}%
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${compliancePct}%` }}
          />
        </div>
      </div>
    </div>
  )
}
