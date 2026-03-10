import React from "react"
import { ShieldOff, Lock, Users, Radio } from "lucide-react"

const ICON_MAP = {
  firewall_bypass: ShieldOff,
  encryption_downgrade: Lock,
  acl_escalation: Users,
  coordinated_attack: Radio,
}

export function AttackCard({ attack, isSelected, onClick }) {
  const Icon = ICON_MAP[attack.id] || ShieldOff
  const isCrit = attack.severity === "CRITICAL"

  return (
    <div
      onClick={onClick}
      className={`card p-4 transition-all cursor-pointer relative overflow-hidden border ${isSelected
          ? "border-red-300 ring-2 ring-red-500/20 bg-red-50/50"
          : "border-gray-100 hover:border-gray-300 hover:shadow-sm bg-white"
        }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div
          className={`w-8 h-8 flex items-center justify-center rounded-lg border ${isSelected
              ? "bg-red-100 border-red-200 text-red-600"
              : "bg-gray-50 border-gray-200 text-gray-500"
            }`}
        >
          <Icon size={16} strokeWidth={2} />
        </div>
        <span
          className={`font-mono text-[9px] font-bold tracking-widest px-2 py-0.5 rounded border ${isCrit
              ? "bg-red-50 border-red-200 text-red-600"
              : "bg-amber-50 border-amber-200 text-amber-600"
            }`}
        >
          {attack.severity}
        </span>
      </div>

      <h4 className="font-semibold text-sm text-gray-900 mb-1">
        {attack.name}
      </h4>
      <p className="text-xs font-medium text-gray-500 leading-relaxed line-clamp-2">
        {attack.description}
      </p>

      {isSelected && (
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-red-500/10 blur-xl pointer-events-none" />
      )}
    </div>
  )
}
