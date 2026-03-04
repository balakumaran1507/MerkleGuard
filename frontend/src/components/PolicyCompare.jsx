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
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {Object.entries(CATEGORIES).map(([key, config]) => {
        const policy = policies[key]
        const Icon = config.icon
        const isDrifted = driftedCategories.includes(key)
        const isOk = !isDrifted && !!policy?.config_hash

        return (
          <div
            key={key}
            style={{
              display: "flex", alignItems: "center", gap: "12px",
              padding: "10px 14px", borderRadius: "7px",
              background: isOk ? "var(--color-bg-elevated)" : "var(--color-status-crit-dim)",
              border: `1px solid ${isOk ? "var(--color-border-default)" : "rgba(240,75,75,0.2)"}`,
              transition: "border-color 0.15s",
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
                borderRadius: "7px", flexShrink: 0,
                background: isOk ? "var(--color-status-ok-dim)" : "var(--color-status-crit-dim)",
                border: isOk ? "1px solid rgba(16,212,140,0.2)" : "1px solid rgba(240,75,75,0.2)",
                color: isOk ? "var(--color-status-ok)" : "var(--color-status-crit)",
              }}
            >
              <Icon size={13} strokeWidth={1.75} />
            </div>

            {/* Label + hash */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{ fontFamily: "var(--font-mono)", fontSize: "9px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text-muted)", marginBottom: "3px" }}
              >
                {config.label}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--color-text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "150px" }}>
                  {policy?.config_hash ? policy.config_hash.substring(0, 18) + "…" : "0x000000…"}
                </span>
                <div style={{ width: 1, height: 14, background: "var(--color-border-default)", flexShrink: 0 }} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--color-text-muted)", flexShrink: 0 }}>
                  {policy?.rule_count ?? "—"} rules
                </span>
              </div>
            </div>

            {/* Status icon */}
            <div
              style={{
                width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center",
                borderRadius: "50%", flexShrink: 0,
                background: isOk ? "var(--color-status-ok-dim)" : "var(--color-status-crit-dim)",
                border: isOk ? "1px solid rgba(16,212,140,0.3)" : "1px solid rgba(240,75,75,0.3)",
                color: isOk ? "var(--color-status-ok)" : "var(--color-status-crit)",
              }}
            >
              {isOk ? <Check size={12} strokeWidth={2.5} /> : <X size={12} strokeWidth={2.5} />}
            </div>
          </div>
        )
      })}
    </div>
  )
}
