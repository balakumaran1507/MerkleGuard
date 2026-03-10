import React from "react"
import { Check, X, ShieldCheck, Users, Lock, Wifi, Database, FileText } from "lucide-react"

const CATEGORIES = {
  firewall_rules: { label: "Firewall Rules", icon: ShieldCheck },
  acl: { label: "Access Control", icon: Users },
  encryption: { label: "Encryption", icon: Lock },
  network_segmentation: { label: "Network Seg.", icon: Wifi },
  auth_protocols: { label: "Authentication", icon: Database },
  audit_logging: { label: "Audit Logging", icon: FileText },
}

export function PolicyCompare({ policies, driftedCategories = [] }) {
  if (!policies) return null

  return (
    <div className="flex flex-col gap-2">
      {Object.entries(CATEGORIES).map(([key, config]) => {
        const policy = policies[key]
        const Icon = config.icon
        const isDrifted = driftedCategories.includes(key)
        const isOk = !isDrifted && !!policy?.config_hash

        return (
          <div
            key={key}
            className={`flex items-center gap-3 p-3 rounded-md border transition-all ${isOk
                ? "bg-white border-gray-100 shadow-sm"
                : "bg-red-50/50 border-red-100"
              }`}
          >
            {/* Icon */}
            <div
              className={`w-8 h-8 flex items-center justify-center rounded-md shrink-0 border ${isOk
                  ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                  : "bg-red-50 border-red-100 text-red-500"
                }`}
            >
              <Icon size={16} strokeWidth={2} />
            </div>

            {/* Label + hash */}
            <div className="flex-1 min-w-0">
              <div
                className="font-bold text-[10px] tracking-widest uppercase text-gray-500 mb-1"
              >
                {config.label}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-medium text-gray-600 truncate max-w-[120px] lg:max-w-[160px]">
                  {policy?.config_hash ? policy.config_hash.substring(0, 18) + "…" : "0x000000…"}
                </span>
                <div className="w-px h-3 bg-gray-200 shrink-0" />
                <span className="font-mono text-[10px] font-medium text-gray-400 shrink-0">
                  {policy?.rule_count ?? "—"} rules
                </span>
              </div>
            </div>

            {/* Status icon */}
            <div
              className={`w-6 h-6 flex items-center justify-center rounded-full shrink-0 border ${isOk
                  ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                  : "bg-red-50 border-red-100 text-red-500"
                }`}
            >
              {isOk ? <Check size={14} strokeWidth={2.5} /> : <X size={14} strokeWidth={2.5} />}
            </div>
          </div>
        )
      })}
    </div>
  )
}
