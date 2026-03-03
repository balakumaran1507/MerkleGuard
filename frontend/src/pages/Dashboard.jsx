import React from "react"
import { StatCard } from "../components/StatCard"
import { ComplianceDonut } from "../components/ComplianceDonut"
import { TimelineItem } from "../components/TimelineItem"
import { useApi } from "../hooks/useApi"
import { useEvents } from "../context/EventContext"
import { 
  Server, 
  ShieldCheck, 
  AlertTriangle, 
  Siren, 
  Camera, 
  Binary
} from "lucide-react"

export function Dashboard() {
  const { stats, nodes, events, nodeStatuses } = useEvents()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Security Posture Dashboard</h1>
          <p className="text-xs text-text-muted font-bold uppercase tracking-widest mt-1">Real-time Merkle-Tree Consensus Engine</p>
        </div>
      </div>

      {/* Top section: 6 stat cards */}
      <div className="flex flex-wrap gap-4">
        <StatCard 
          label="Total Nodes" 
          value={stats?.total_nodes || 0} 
          subtitle="Enterprise Infrastructure" 
          color="white" 
          icon={Server} 
        />
        <StatCard 
          label="Compliant" 
          value={stats?.compliant || 0} 
          subtitle="Verified Baseline" 
          color="green" 
          icon={ShieldCheck} 
        />
        <StatCard 
          label="Drifted" 
          value={stats?.drifted || 0} 
          subtitle="Non-Critical Drift" 
          color="amber" 
          icon={AlertTriangle} 
        />
        <StatCard 
          label="Critical" 
          value={stats?.critical || 0} 
          subtitle="High-Severity Policy Breach" 
          color="red" 
          icon={Siren} 
        />
        <StatCard 
          label="Snapshots" 
          value={stats?.total_snapshots || 0} 
          subtitle="Platform State Captures" 
          color="cyan" 
          icon={Camera} 
        />
        <StatCard 
          label="Avg Anomaly" 
          value={(stats?.avg_anomaly_score || 0).toFixed(3)} 
          subtitle="Global Integrity Variance" 
          color="purple" 
          icon={Binary} 
        />
      </div>

      {/* Middle section: Donut + Merkle Root Registry */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="mg-card p-6 flex flex-col gap-6">
          <div className="flex justify-between items-start">
             <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest">Compliance Distribution</h3>
          </div>
          <div className="flex-1 flex items-center justify-center py-4">
             <ComplianceDonut stats={stats} />
          </div>
        </div>

        <div className="mg-card p-6 flex flex-col gap-4">
          <div className="flex justify-between items-start">
             <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest">Merkle Root Registry</h3>
             <span className="text-[9px] font-mono text-accent-cyan bg-accent-cyan/10 px-1.5 py-0.5 rounded">AUTO-REFRESHING</span>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[280px] custom-scrollbar pr-2 flex flex-col gap-1.5">
            {nodes.map(node => {
              const status = nodeStatuses[node.id] || node.status
              return (
                <div 
                  key={node.id} 
                  className={`flex items-center justify-between p-2 rounded bg-bg-surface-alt/50 border border-transparent hover:border-border-default transition-all ${
                    status !== 'compliant' ? (status === 'critical' ? 'bg-mg-red/5 border-mg-red/20' : 'bg-mg-amber/5 border-mg-amber/20') : ''
                  }`}
                >
                  <span className="font-mono text-xs font-bold text-text-primary">{node.name}</span>
                  <span className={`font-mono text-[10px] font-bold ${
                    status === 'compliant' ? 'text-accent-cyan' : (status === 'critical' ? 'text-mg-red' : 'text-mg-amber')
                  }`}>
                    {node.merkle_root.substring(0, 16)}...
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Bottom section: Zones + Event Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-4">
           <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest">Network Zone Integrity</h3>
           <div className="grid grid-cols-2 gap-4">
              {['DMZ', 'Internal', 'Edge', 'Cloud'].map(zone => {
                const zoneNodes = nodes.filter(n => n.zone === zone)
                const compliantCount = zoneNodes.filter(n => n.status === 'compliant').length
                const total = zoneNodes.length || 1
                const pct = (compliantCount / total) * 100

                return (
                  <div key={zone} className="mg-card p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-text-primary">{zone}</span>
                      <span className="text-[10px] text-text-muted font-mono">{compliantCount}/{zoneNodes.length} Nodes</span>
                    </div>
                    <div className="h-1 bg-bg-surface-alt rounded-full overflow-hidden">
                       <div className="h-full bg-accent-cyan transition-all duration-1000" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
           </div>
        </div>

        <div className="mg-card overflow-hidden flex flex-col h-[400px]">
          <div className="p-4 border-b border-border-default flex justify-between items-center">
             <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest">Live Event Infrastructure</h3>
             <div className="flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-mg-green animate-mg-pulse" />
               <span className="text-[9px] font-bold text-mg-green uppercase tracking-widest">Consensus Stream</span>
             </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {events.length > 0 ? (
              events.map((ev, i) => <TimelineItem key={i} event={ev} />)
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-2 opacity-30 italic text-sm text-text-dim">
                 <span>Listening for Merkle Proofs...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
