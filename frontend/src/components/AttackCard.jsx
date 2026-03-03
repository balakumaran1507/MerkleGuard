import React from "react"
import { Shield, Lock, Users, Network } from "lucide-react"
import { clsx } from "clsx"

const ICON_MAP = {
  firewall_bypass: Shield,
  encryption_downgrade: Lock,
  acl_escalation: Users,
  coordinated_attack: Network,
}

export function AttackCard({ attack, isSelected, onClick }) {
  const Icon = ICON_MAP[attack.id]

  return (
    <div 
      onClick={onClick}
      className={clsx(
        "mg-card p-4 cursor-pointer relative overflow-hidden",
        isSelected ? "border-accent-cyan ring-1 ring-accent-cyan/40 bg-accent-cyan/5 shadow-lg shadow-accent-cyan/5" : "hover:border-border-light"
      )}
    >
      <div className="flex justify-between items-start mb-3 relative z-10">
        <div className={clsx("p-2 rounded-lg", isSelected ? "bg-accent-cyan text-bg-primary" : "bg-bg-surface-alt text-text-muted")}>
           <Icon size={20} />
        </div>
        <span className={clsx("text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-widest", 
          attack.severity === "CRITICAL" ? "bg-mg-red/20 text-mg-red" : "bg-mg-amber/20 text-mg-amber"
        )}>
           {attack.severity}
        </span>
      </div>
      
      <div className="relative z-10">
        <h4 className="text-sm font-bold text-text-primary mb-1">{attack.name}</h4>
        <p className="text-xs text-text-muted leading-relaxed line-clamp-2">{attack.description}</p>
      </div>

      {isSelected && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-accent-cyan/10 blur-3xl -mr-12 -mt-12 rounded-full" />
      )}
    </div>
  )
}
