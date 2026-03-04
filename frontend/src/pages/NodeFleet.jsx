import React, { useState } from "react"
import { useApi } from "../hooks/useApi"
import { useEvents } from "../context/EventContext"
import { NodeCard } from "../components/NodeCard"
import { PolicyCompare } from "../components/PolicyCompare"

const monoLabel = { fontFamily: "var(--font-mono)", fontSize: "9.5px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text-muted)" }

const FILTERS = ["all", "compliant", "drifted", "critical"]

const filterColors = {
  all: { active: "var(--color-cyan-500)", activeBg: "var(--color-cyan-dim)", activeBorder: "rgba(0,210,255,0.25)" },
  compliant: { active: "var(--color-status-ok)", activeBg: "var(--color-status-ok-dim)", activeBorder: "rgba(16,212,140,0.25)" },
  drifted: { active: "var(--color-status-warn)", activeBg: "var(--color-status-warn-dim)", activeBorder: "rgba(245,158,11,0.25)" },
  critical: { active: "var(--color-status-crit)", activeBg: "var(--color-status-crit-dim)", activeBorder: "rgba(240,75,75,0.25)" },
}

export function NodeFleet() {
  const { nodes, nodeStatuses } = useEvents()
  const [filter, setFilter] = useState("all")
  const [selectedNodeId, setSelectedNodeId] = useState(null)

  const nodesWithUpdates = nodes.map(n => ({ ...n, status: nodeStatuses?.[n.id] || n.status }))
  const filteredNodes = nodesWithUpdates.filter(n => filter === "all" || n.status === filter)
  const selectedNode = nodesWithUpdates.find(n => n.id === selectedNodeId)

  const counts = {
    all: nodesWithUpdates.length,
    compliant: nodesWithUpdates.filter(n => n.status === "compliant").length,
    drifted: nodesWithUpdates.filter(n => n.status === "drifted").length,
    critical: nodesWithUpdates.filter(n => n.status === "critical").length,
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

      {/* Heading */}
      <div>
        <h1 style={{ fontFamily: "var(--font-sans)", fontSize: "22px", fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: "-0.03em", lineHeight: 1, marginBottom: "6px" }}>
          Node Fleet
        </h1>
        <p style={{ ...monoLabel }}>Distributed integrity verification across {nodesWithUpdates.length} endpoints</p>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "6px" }}>
        {FILTERS.map(f => {
          const active = filter === f
          const c = filterColors[f]
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "6px 14px", borderRadius: "6px", cursor: "pointer",
                fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.06em",
                background: active ? c.activeBg : "var(--color-bg-surface)",
                border: `1px solid ${active ? c.activeBorder : "var(--color-border-default)"}`,
                color: active ? c.active : "var(--color-text-muted)",
                transition: "all 0.15s",
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)} · {counts[f]}
            </button>
          )
        })}
      </div>

      {/* Node grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(195px, 1fr))", gap: "10px" }}>
        {filteredNodes.map(node => (
          <NodeCard
            key={node.id}
            node={node}
            isSelected={selectedNodeId === node.id}
            onClick={() => setSelectedNodeId(node.id === selectedNodeId ? null : node.id)}
          />
        ))}
      </div>

      {/* Detail panel */}
      {selectedNode && (
        <div className="mg-card animate-mg-fadeIn" style={{ padding: "24px 28px" }}>
          <div style={{ marginBottom: "20px" }}>
            <h2 style={{ fontFamily: "var(--font-sans)", fontSize: "16px", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "4px" }}>
              Policy Detail — {selectedNode.name}
            </h2>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: "11px", color: "var(--color-text-muted)" }}>
              Comparing cryptographic baseline proof against current snapshot telemetry.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: "24px" }}>
            <PolicyCompare policies={selectedNode.policy_state} driftedCategories={selectedNode.drifted_categories || []} />

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* Telemetry */}
              <div
                style={{
                  padding: "14px 16px", borderRadius: "8px",
                  background: "var(--color-bg-elevated)",
                  border: "1px solid var(--color-border-default)",
                }}
              >
                <span style={{ ...monoLabel, display: "block", marginBottom: "12px" }}>Node Telemetry</span>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontFamily: "var(--font-mono)", fontSize: "11px" }}>
                  {[
                    { label: "Uptime Since", value: new Date(selectedNode.uptime_start).toLocaleDateString(), color: "var(--color-status-ok)" },
                    { label: "Reconciliations", value: selectedNode.reconcile_count, color: "var(--color-cyan-500)" },
                    { label: "Snapshots", value: selectedNode.snapshot_count, color: "var(--color-text-secondary)" },
                  ].map((row, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--color-text-muted)" }}>{row.label}</span>
                      <span style={{ fontWeight: 700, color: row.color }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <button className="mg-btn-primary" style={{ width: "100%", justifyContent: "center" }}>
                Force Snapshot Re-Capture
              </button>
              <button className="mg-btn-secondary" style={{ width: "100%", justifyContent: "center" }}>
                Export Integrity Proof
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
