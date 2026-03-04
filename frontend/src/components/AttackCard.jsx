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
      style={{
        padding: "14px 16px",
        borderRadius: "8px",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        background: isSelected ? "rgba(240,75,75,0.06)" : "var(--color-bg-surface)",
        border: `1px solid ${isSelected ? "rgba(240,75,75,0.35)" : "var(--color-border-default)"}`,
        boxShadow: isSelected ? "0 0 20px rgba(240,75,75,0.1)" : "none",
        transition: "all 0.2s",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
        <div
          style={{
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "7px",
            background: isSelected ? "rgba(240,75,75,0.15)" : "var(--color-bg-elevated)",
            border: `1px solid ${isSelected ? "rgba(240,75,75,0.3)" : "var(--color-border-default)"}`,
            color: isSelected ? "var(--color-status-crit)" : "var(--color-text-muted)",
          }}
        >
          <Icon size={15} strokeWidth={1.75} />
        </div>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "9px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            padding: "2px 7px",
            borderRadius: "4px",
            background: isCrit ? "var(--color-status-crit-dim)" : "var(--color-status-warn-dim)",
            border: `1px solid ${isCrit ? "rgba(240,75,75,0.25)" : "rgba(245,158,11,0.25)"}`,
            color: isCrit ? "var(--color-status-crit)" : "var(--color-status-warn)",
          }}
        >
          {attack.severity}
        </span>
      </div>

      <h4
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "13px",
          fontWeight: 600,
          color: "var(--color-text-primary)",
          marginBottom: "4px",
        }}
      >
        {attack.name}
      </h4>
      <p
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "11px",
          color: "var(--color-text-muted)",
          lineHeight: 1.55,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {attack.description}
      </p>

      {isSelected && (
        <div
          style={{
            position: "absolute",
            top: -20,
            right: -20,
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "rgba(240,75,75,0.12)",
            filter: "blur(24px)",
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  )
}
