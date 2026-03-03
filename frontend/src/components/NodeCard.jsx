import React from "react"
import { StatusBadge } from "./StatusBadge"
import { clsx } from "clsx"

export function NodeCard({ node, isSelected, onClick }) {
  const statusColors = {
    compliant: "bg-mg-green",
    drifted: "bg-mg-amber",
    critical: "bg-mg-red",
  }

  const compliancePct = node.policy_state 
    ? (Object.values(node.policy_state).filter(p => !p.drifted).length / Object.keys(node.policy_state).length) * 100 
    : 100

  return (
    <div 
      onClick={onClick}
      className={clsx(
        "mg-card mg-card-hover p-4 cursor-pointer",
        isSelected && "border-accent-cyan shadow-accent-cyan/10 ring-1 ring-accent-cyan/20"
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-mono font-bold text-text-primary text-sm truncate max-w-[120px]">{node.name}</h3>
        <StatusBadge status={node.status} />
      </div>

      <div className="flex flex-col gap-3 mb-4">
        <div className="flex justify-between items-center text-[10px]">
          <span className="text-text-muted uppercase font-bold tracking-widest">Zone</span>
          <span className="text-text-primary">{node.zone}</span>
        </div>
        <div className="flex justify-between items-center text-[10px]">
          <span className="text-text-muted uppercase font-bold tracking-widest">Merkle Root</span>
          <span className="text-accent-cyan font-mono">{node.merkle_root.substring(0, 8)}</span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center text-[9px] text-text-muted font-bold uppercase tracking-widest">
           <span>Compliance</span>
           <span>{Math.round(compliancePct)}%</span>
        </div>
        <div className="h-1 bg-bg-surface-alt rounded-full overflow-hidden">
          <div 
            className={clsx("h-full transition-all duration-500", statusColors[node.status])} 
            style={{ width: `${compliancePct}%` }}
          />
        </div>
      </div>
    </div>
  )
}
