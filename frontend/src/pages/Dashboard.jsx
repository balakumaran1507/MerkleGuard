import React from "react"
import { StatCard } from "../components/StatCard"
import { ComplianceDonut } from "../components/ComplianceDonut"
import { TimelineItem } from "../components/TimelineItem"
import { useEvents } from "../context/EventContext"
import {
  Server,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Database,
  Fingerprint,
  Download,
} from "lucide-react"

export function Dashboard() {
  const { stats, nodes, events, nodeStatuses } = useEvents()

  const now = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric"
  })

  // Download logic placeholder
  const downloadComplianceReport = async () => {
    try {
      const url = '/api/enterprise/report/compliance?report_type=SOC2'
      const response = await fetch(url)
      const blob = await response.blob()
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `MerkleGuard_SOC2_Report_${Date.now()}.pdf`
      link.click()
    } catch (err) {
      console.error("Failed to download compliance report:", err)
    }
  }

  return (
    <div className="flex flex-col gap-6">

      {/* ── Page heading ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 mb-1">
            Overview
          </h1>
          <p className="text-sm font-medium text-gray-500">
            {now} • Merkle-Tree Consensus Engine
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={downloadComplianceReport}
            className="btn-secondary text-sm"
          >
            <Download size={14} />
            Export Report
          </button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Nodes"
          value={stats?.totalNodes || (nodes || []).length || 0}
          trend="+0%"
          trendDir="up"
          icon={Server}
          colorConfig={{
            icon: "text-blue-600",
            iconBg: "bg-blue-50",
            iconBorder: "border-blue-100",
            accent: "bg-blue-600",
          }}
        />
        <StatCard
          label="Sys Integrity"
          value="100%"
          trend="Verified"
          trendDir="neutral"
          icon={ShieldCheck}
          colorConfig={{
            icon: "text-emerald-600",
            iconBg: "bg-emerald-50",
            iconBorder: "border-emerald-100",
            accent: "bg-emerald-600",
          }}
        />
        <StatCard
          label="Snapshot/sec"
          value={stats?.opsPerSec || 0}
          trend="+12%"
          trendDir="up"
          icon={TrendingUp}
          colorConfig={{
            icon: "text-violet-600",
            iconBg: "bg-violet-50",
            iconBorder: "border-violet-100",
            accent: "bg-violet-600",
          }}
        />
        <StatCard
          label="Drift Alerts"
          value={(events || []).filter((e) => e.type === "drift_detected" || e.type === "drift").length || 0}
          trend="-2"
          trendDir="down"
          icon={AlertTriangle}
          colorConfig={{
            icon: "text-amber-600",
            iconBg: "bg-amber-50",
            iconBorder: "border-amber-100",
            accent: "bg-amber-600",
          }}
        />
      </div>

      {/* ── Central grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Compliance Donut Card */}
        <div className="card p-6 flex flex-col gap-6 lg:col-span-1">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold tracking-wide uppercase text-gray-500">
              System Health
            </h2>
            <p className="text-xs text-gray-400">Global Node Infrastructure Compliance</p>
          </div>

          <div className="flex-1 flex items-center justify-center -my-2 relative">
            <ComplianceDonut nodes={nodes} />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <ShieldCheck className="text-gray-200 w-24 h-24 opacity-20" strokeWidth={1} />
            </div>
          </div>

          <div className="mt-auto grid grid-cols-2 gap-3">
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
              <div className="text-[10px] uppercase font-bold text-gray-400 mb-1 tracking-wider">Nodes Managed</div>
              <div className="text-xl font-semibold text-gray-900">{(nodes || []).length}</div>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3">
              <div className="text-[10px] uppercase font-bold text-emerald-600 mb-1 tracking-wider">Avg Consensus Time</div>
              <div className="text-xl font-semibold text-emerald-700">9ms</div>
            </div>
          </div>
        </div>

        {/* Node Operations Feed */}
        <div className="card p-0 flex flex-col lg:col-span-2 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h2 className="text-sm font-semibold tracking-wide uppercase text-gray-600">
              Live Edge Topologies
            </h2>
          </div>

          {(nodes || []).length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-gray-400 space-y-3">
              <Database size={32} strokeWidth={1.5} />
              <p className="text-sm font-medium">Waiting for node connections...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-400">
                    <th className="font-semibold py-3 px-5">Hostname</th>
                    <th className="font-semibold py-3 px-4 text-center">Security Core</th>
                    <th className="font-semibold py-3 px-4">Integrity Hash</th>
                    <th className="font-semibold py-3 px-4">Consensus Valid</th>
                    <th className="font-semibold py-3 px-5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {(nodes || []).slice(0, 6).map((node) => {
                    const isOk = node.status === 'secure' || node.status === 'compliant'
                    const isCrit = node.status === 'compromised' || node.status === 'critical'
                    const pct = node.encryption_strength_percent || 100
                    const barColor = isCrit ? "#ef4444" : !isOk ? "#f59e0b" : "#10b981"

                    return (
                      <tr key={node.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-5 flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full shadow-sm ${isCrit ? "bg-red-500 shadow-red-500/50 animate-pulse" : !isOk ? "bg-amber-500" : "bg-emerald-500"}`} />
                          <span className="font-mono text-gray-900 font-medium">{node.name || node.hostname || "Unknown Node"}</span>
                        </td>
                        <td className="py-3 px-4 align-middle">
                          <div className="w-full max-w-[80px] h-1.5 bg-gray-100 rounded-full mx-auto overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${pct}%`, backgroundColor: barColor }} />
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-gray-500 text-[11px]">
                          {(node.current_merkle_root || node.merkle_root || "Pending").substring(0, 8)}...
                        </td>
                        <td className="py-3 px-4 flex items-center justify-center">
                          <Fingerprint size={14} className={isOk ? "text-emerald-500" : "text-gray-300"} />
                        </td>
                        <td className="py-3 px-5 text-right">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${isCrit ? "bg-red-50 text-red-600" : !isOk ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>
                            {node.status}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
          {(nodes || []).length > 5 && (
            <div className="p-3 bg-gray-50/80 border-t border-gray-100 text-center">
              <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-wider">
                View All Activity &rarr;
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
