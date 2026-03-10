import React from "react"
import { Scan, CheckCircle2, Activity, Wrench, AlertOctagon, Network, Zap, RefreshCw } from "lucide-react"

const TYPE_CONFIG = {
  snapshot_round: { icon: Scan, text: "text-blue-500", bg: "bg-blue-50", border: "border-blue-200" },
  consensus_round: { icon: Network, text: "text-indigo-500", bg: "bg-indigo-50", border: "border-indigo-200" },
  drift_detected: { icon: Activity, text: "text-amber-500", bg: "bg-amber-50", border: "border-amber-200" },
  auto_remediate: { icon: CheckCircle2, text: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-200" },
  escalate_alert: { icon: AlertOctagon, text: "text-red-500", bg: "bg-red-50", border: "border-red-200" },
  flag_for_review: { icon: Wrench, text: "text-amber-500", bg: "bg-amber-50", border: "border-amber-200" },
  attack_injected: { icon: Zap, text: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200" },
  manual_reconcile: { icon: RefreshCw, text: "text-blue-500", bg: "bg-blue-50", border: "border-blue-200" },
  baseline_updated: { icon: CheckCircle2, text: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-200" },
  // legacy
  snapshot: { icon: Scan, text: "text-blue-500", bg: "bg-blue-50", border: "border-blue-200" },
  reconcile: { icon: CheckCircle2, text: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-200" },
  drift: { icon: Activity, text: "text-amber-500", bg: "bg-amber-50", border: "border-amber-200" },
  resolve: { icon: Wrench, text: "text-blue-500", bg: "bg-blue-50", border: "border-blue-200" },
  alert: { icon: AlertOctagon, text: "text-red-500", bg: "bg-red-50", border: "border-red-200" },
  consensus: { icon: Network, text: "text-indigo-500", bg: "bg-indigo-50", border: "border-indigo-200" },
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
  if (event.category) return `Policy drift in [${event.category}] — score ${event.anomaly_score?.toFixed(3) ?? "N/A"}`
  if (event.categories) return `Categories affected: ${event.categories.join(", ")}`
  if (event.description) return event.description
  if (event.stats) return `Agreement: ${(event.stats.agreement_rate * 100).toFixed(0)}% across ${event.stats.total} verifications`
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
    <div className="flex gap-4 p-4 border-b border-gray-100 hover:bg-gray-50/80 transition-colors group items-start">
      {/* Time column */}
      <div className="w-16 pt-1 text-right shrink-0">
        <span className="text-[10px] uppercase font-semibold text-gray-400 font-mono tracking-wider">{time}</span>
      </div>

      {/* Icon node */}
      <div className="shrink-0 relative">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center border shadow-sm transition-transform group-hover:scale-110 ${config.bg} ${config.text} ${config.border}`}>
          <Icon size={14} strokeWidth={2.5} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center min-w-0 pr-4 mt-1">
        <div className="flex items-center gap-2 mb-1 hidden-scrollbar">
          <span className="text-sm font-semibold text-gray-900 truncate">
            {label}
          </span>
          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest hidden sm:inline-block">
            {event.type.replace(/_/g, " ")}
          </span>
        </div>

        <div className="text-xs text-gray-500 font-medium truncate leading-relaxed">
          {detail}
        </div>

        {/* Actionables */}
        {score !== null && (
          <div className="mt-2 text-[10px] font-mono font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded inline-flex border border-amber-100 self-start">
            Severity Score: {score.toFixed(3)}
          </div>
        )}
      </div>
    </div>
  )
}
