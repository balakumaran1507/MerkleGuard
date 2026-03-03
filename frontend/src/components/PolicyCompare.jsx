import React from "react"
import { Check, X, Shield, Lock, Users, Network, FileText, Database } from "lucide-react"
import { clsx } from "clsx"

const CATEGORIES = {
  firewall_rules: { label: "Firewall Rules", icon: Shield },
  acl: { label: "Access Control", icon: Users },
  encryption: { label: "Encryption", icon: Lock },
  network_segmentation: { label: "Network Seg.", icon: Network },
  auth_protocols: { label: "Authentication", icon: Database },
  audit_logging: { label: "Audit Logging", icon: FileText },
}

export function PolicyCompare({ policies }) {
  if (!policies) return null

  return (
    <div className="flex flex-col gap-2">
      {Object.entries(CATEGORIES).map(([key, config]) => {
        const policy = policies[key]
        const Icon = config.icon
        const isCompliant = !policy?.drifted

        return (
          <div key={key} className="flex items-center gap-4 p-3 rounded-lg bg-bg-surface-alt border border-border-default hover:border-border-light transition-colors">
            <div className={clsx("p-2 rounded-lg", isCompliant ? "bg-mg-green/10 text-mg-green" : "bg-mg-red/10 text-mg-red")}>
               <Icon size={16} />
            </div>
            
            <div className="flex-1 min-w-0">
               <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">{config.label}</div>
               <div className="flex items-center gap-3">
                  <div className="flex flex-col flex-1 min-w-0">
                     <span className="text-[9px] text-text-dim uppercase font-bold tracking-tighter">Current Snapshot</span>
                     <span className="text-xs font-mono text-text-primary truncate">{policy?.config_hash || "0x00000000..."}</span>
                  </div>
                  <div className="w-px h-6 bg-border-default" />
                  <div className="flex flex-col flex-1 min-w-0 opacity-50">
                     <span className="text-[9px] text-text-dim uppercase font-bold tracking-tighter">Expected Baseline</span>
                     <span className="text-xs font-mono text-text-muted truncate">Verified Policy v1.0</span>
                  </div>
               </div>
            </div>

            <div className={clsx("p-1.5 rounded-full border", isCompliant ? "border-mg-green-dim text-mg-green" : "border-mg-red-dim text-mg-red")}>
               {isCompliant ? <Check size={14} /> : <X size={14} />}
            </div>
          </div>
        )
      })}
    </div>
  )
}
