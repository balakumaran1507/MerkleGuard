import React from "react"
import { Camera, Check, AlertTriangle, Wrench, Siren, Share2 } from "lucide-react"
import { clsx } from "clsx"

const TYPE_CONFIG = {
  snapshot: { icon: Camera, color: "text-accent-cyan bg-accent-cyan/10", border: "border-accent-cyan/20" },
  reconcile: { icon: Check, color: "text-mg-green bg-mg-green/10", border: "border-mg-green/20" },
  drift: { icon: AlertTriangle, color: "text-mg-amber bg-mg-amber/10", border: "border-mg-amber/20" },
  resolve: { icon: Wrench, color: "text-accent-cyan bg-accent-cyan/10", border: "border-accent-cyan/20" },
  alert: { icon: Siren, color: "text-mg-red bg-mg-red/10", border: "border-mg-red/20" },
  consensus: { icon: Share2, color: "text-mg-purple bg-mg-purple/10", border: "border-mg-purple/20" },
}

export function TimelineItem({ event }) {
  const config = TYPE_CONFIG[event.type] || TYPE_CONFIG.snapshot
  const Icon = config.icon

  return (
    <div className="flex gap-4 p-4 border-b border-border-default/50 hover:bg-bg-surface-alt/30 transition-colors group animate-mg-fadeIn">
      <div className={clsx("p-2 rounded-lg h-fit", config.color)}>
        <Icon size={18} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <div className="flex items-center gap-2">
            <span className={clsx("text-xs font-mono font-bold", config.color.split(" ")[0])}>{event.node}</span>
            <span className="w-1 h-1 rounded-full bg-text-dim" />
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest">{event.type}</span>
          </div>
          <span className="text-[10px] text-text-dim font-mono">{new Date(event.timestamp).toLocaleTimeString()}</span>
        </div>
        
        <p className="text-xs text-text-primary leading-relaxed">{event.detail}</p>
        
        {event.anomaly_score !== null && (
          <div className="mt-2 inline-flex items-center gap-2 px-2 py-0.5 rounded bg-bg-surface-alt border border-border-default">
             <span className="text-[9px] font-bold text-text-muted uppercase tracking-tighter">Anomaly Score</span>
             <span className={clsx("text-[10px] font-mono font-bold", event.anomaly_score > 0.7 ? "text-mg-red" : "text-mg-amber")}>
               {event.anomaly_score.toFixed(3)}
             </span>
          </div>
        )}
      </div>
    </div>
  )
}
