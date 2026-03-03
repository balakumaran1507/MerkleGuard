import React from "react"

export function ComplianceDonut({ stats }) {
  const total = (stats?.compliant || 0) + (stats?.drifted || 0) + (stats?.critical || 0) || 1
  const compliantPct = ((stats?.compliant || 0) / total) * 100
  const driftedPct = ((stats?.drifted || 0) / total) * 100
  const criticalPct = ((stats?.critical || 0) / total) * 100

  const radius = 70
  const circumference = 2 * Math.PI * radius
  
  const compliantOffset = 0
  const driftedOffset = (compliantPct / 100) * circumference
  const criticalOffset = ((compliantPct + driftedPct) / 100) * circumference

  return (
    <div className="flex items-center gap-8">
      <div className="relative w-40 h-40">
        <svg viewBox="0 0 200 200" className="transform -rotate-90">
          {/* Background circle */}
          <circle cx="100" cy="100" r={radius} fill="none" stroke="#1e293b" strokeWidth="20" />
          
          {/* Compliant segment */}
          <circle 
            cx="100" cy="100" r={radius} fill="none" 
            stroke="#10b981" strokeWidth="20" 
            strokeDasharray={`${(compliantPct / 100) * circumference} ${circumference}`}
            strokeDashoffset={-compliantOffset}
            className="transition-all duration-1000"
          />
          
          {/* Drifted segment */}
          <circle 
            cx="100" cy="100" r={radius} fill="none" 
            stroke="#f59e0b" strokeWidth="20" 
            strokeDasharray={`${(driftedPct / 100) * circumference} ${circumference}`}
            strokeDashoffset={-driftedOffset}
            className="transition-all duration-1000"
          />
          
          {/* Critical segment */}
          <circle 
            cx="100" cy="100" r={radius} fill="none" 
            stroke="#ef4444" strokeWidth="20" 
            strokeDasharray={`${(criticalPct / 100) * circumference} ${circumference}`}
            strokeDashoffset={-criticalOffset}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
           <span className="text-3xl font-bold text-text-primary">{Math.round(compliantPct)}%</span>
           <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Compliant</span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
         <LegendItem color="bg-mg-green" label="Compliant" count={stats?.compliant || 0} />
         <LegendItem color="bg-mg-amber" label="Drifted" count={stats?.drifted || 0} />
         <LegendItem color="bg-mg-red" label="Critical" count={stats?.critical || 0} />
      </div>
    </div>
  )
}

function LegendItem({ color, label, count }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-3 h-3 rounded-sm ${color}`} />
      <div className="flex flex-col">
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{label}</span>
        <span className="text-sm font-bold text-text-primary">{count} Nodes</span>
      </div>
    </div>
  )
}
