import React from "react"
import { Scan, CheckCircle2, Activity, Wrench, AlertOctagon, Network, Zap, RefreshCw } from "lucide-react"

const TYPE_CONFIG = {
  snapshot_round: { icon: Scan, color: "var(--color-cyan-500)", bg: "var(--color-cyan-dim)", border: "rgba(0,210,255,0.18)" },
  consensus_round: { icon: Network, color: "var(--color-violet-400)", bg: "var(--color-violet-dim)", border: "rgba(123,47,255,0.2)" },
  drift_detected: { icon: Activity, color: "var(--color-status-warn)", bg: "var(--color-status-warn-dim)", border: "rgba(245,158,11,0.2)" },
  auto_remediate: { icon: CheckCircle2, color: "var(--color-status-ok)", bg: "var(--color-status-ok-dim)", border: "rgba(16,212,140,0.2)" },
  escalate_alert: { icon: AlertOctagon, color: "var(--color-status-crit)", bg: "var(--color-status-crit-dim)", border: "rgba(240,75,75,0.2)" },
  flag_for_review: { icon: Wrench, color: "var(--color-status-warn)", bg: "var(--color-status-warn-dim)", border: "rgba(245,158,11,0.2)" },
  attack_injected: { icon: Zap, color: "var(--color-status-crit)", bg: "var(--color-status-crit-dim)", border: "rgba(240,75,75,0.2)" },
  manual_reconcile: { icon: RefreshCw, color: "var(--color-cyan-500)", bg: "var(--color-cyan-dim)", border: "rgba(0,210,255,0.18)" },
  baseline_updated: { icon: CheckCircle2, color: "var(--color-status-ok)", bg: "var(--color-status-ok-dim)", border: "rgba(16,212,140,0.2)" },
  // legacy
  snapshot: { icon: Scan, color: "var(--color-cyan-500)", bg: "var(--color-cyan-dim)", border: "rgba(0,210,255,0.18)" },
  reconcile: { icon: CheckCircle2, color: "var(--color-status-ok)", bg: "var(--color-status-ok-dim)", border: "rgba(16,212,140,0.2)" },
  drift: { icon: Activity, color: "var(--color-status-warn)", bg: "var(--color-status-warn-dim)", border: "rgba(245,158,11,0.2)" },
  resolve: { icon: Wrench, color: "var(--color-cyan-500)", bg: "var(--color-cyan-dim)", border: "rgba(0,210,255,0.18)" },
  alert: { icon: AlertOctagon, color: "var(--color-status-crit)", bg: "var(--color-status-crit-dim)", border: "rgba(240,75,75,0.2)" },
  consensus: { icon: Network, color: "var(--color-violet-400)", bg: "var(--color-violet-dim)", border: "rgba(123,47,255,0.2)" },
}

function buildLabel(event) {
  if (event.node_name) return event.node_name
  if (event.node_id) return event.node_id
  if (event.node) return event.node
  if (event.attack_type) return `ATTACK: ${event.attack_type}`
  if (event.round) return `Round #${event.round}`
  return event.type
}

function buildDetail(event) {
  if (event.detail) return event.detail
  if (event.category) return `Policy drift in [${event.category}] — anomaly score ${event.anomaly_score?.toFixed(3) ?? "N/A"}`
  if (event.categories) return `Categories affected: ${event.categories.join(", ")}`
  if (event.description) return event.description
  if (event.stats) return `Agreement rate: ${(event.stats.agreement_rate * 100).toFixed(1)}% across ${event.stats.total} peer verifications`
  if (event.nodes) return `${event.nodes.length} nodes captured state snapshot`
  return `Event type: ${event.type}`
}

export function TimelineItem({ event }) {
  const config = TYPE_CONFIG[event.type] || TYPE_CONFIG.snapshot
  const Icon = config.icon
  const label = buildLabel(event)
  const detail = buildDetail(event)
  const score = event.anomaly_score ?? null
  const time = event.timestamp ? new Date(event.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : ""

  return (
    <div
      className="flex gap-3 group"
      style={{
        padding: "12px 16px",
        borderBottom: "1px solid var(--color-border-subtle)",
        transition: "background 0.15s",
      }}
      onMouseEnter={e => e.currentTarget.style.background = "var(--color-bg-elevated)"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    >
      {/* Icon badge */}
      <div
        style={{
          width: 30,
          height: 30,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "6px",
          background: config.bg,
          border: `1px solid ${config.border}`,
          color: config.color,
          flexShrink: 0,
          marginTop: "1px",
        }}
      >
        <Icon size={14} strokeWidth={2} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-0.5">
          <div className="flex items-center gap-2 min-w-0">
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                fontWeight: 700,
                color: config.color,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "9px",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--color-text-dim)",
                flexShrink: 0,
              }}
            >
              {event.type}
            </span>
          </div>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              color: "var(--color-text-dim)",
              flexShrink: 0,
            }}
          >
            {time}
          </span>
        </div>

        <p
          style={{
            fontSize: "11px",
            color: "var(--color-text-secondary)",
            lineHeight: 1.5,
          }}
        >
          {detail}
        </p>

        {score !== null && (
          <div
            className="inline-flex items-center gap-2 mt-1.5"
            style={{
              padding: "2px 8px",
              borderRadius: "4px",
              background: "var(--color-bg-elevated)",
              border: "1px solid var(--color-border-default)",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "9px",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--color-text-muted)",
              }}
            >
              Anomaly
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                fontWeight: 700,
                color: score > 0.7 ? "var(--color-status-crit)" : "var(--color-status-warn)",
              }}
            >
              {score.toFixed(3)}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
