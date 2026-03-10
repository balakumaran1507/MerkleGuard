import React, { useState } from "react"
import { useApi } from "../hooks/useApi"
import { useEvents } from "../context/EventContext"
import { NodeCard } from "../components/NodeCard"
import { PolicyCompare } from "../components/PolicyCompare"

const FILTERS = ["all", "compliant", "drifted", "critical"]

const filterColors = {
  all: { text: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  compliant: { text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  drifted: { text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  critical: { text: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
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
    compliant: nodesWithUpdates.filter(n => n.status === "compliant" || n.status === "secure").length, // Handling both names
    drifted: nodesWithUpdates.filter(n => n.status === "drifted" || n.status === "warning").length,
    critical: nodesWithUpdates.filter(n => n.status === "critical" || n.status === "compromised").length,
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Heading */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-1">
          Node Fleet
        </h1>
        <p className="text-sm font-medium text-gray-500">
          Distributed integrity verification across {nodesWithUpdates.length} endpoints
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map(f => {
          const active = filter === f
          const c = filterColors[f]
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all border ${active
                  ? `${c.bg} ${c.text} ${c.border} ring-1 ring-opacity-50 ring-${f === 'all' ? 'blue' : f === 'compliant' ? 'emerald' : f === 'drifted' ? 'amber' : 'red'}-500`
                  : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-900 shadow-sm"
                }`}
            >
              <span className="capitalize mr-1">{f}</span>
              <span className="opacity-70 px-1 bg-white/50 rounded-sm">{counts[f]}</span>
            </button>
          )
        })}
      </div>

      {/* Node grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredNodes.map(node => (
          <NodeCard
            key={node.id}
            node={node}
            isSelected={selectedNodeId === node.id}
            onClick={() => setSelectedNodeId(node.id === selectedNodeId ? null : node.id)}
          />
        ))}
        {filteredNodes.length === 0 && (
          <div className="col-span-full p-12 text-center flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <span className="text-sm font-medium">No nodes match the selected filter.</span>
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selectedNode && (
        <div className="card p-6 animate-fade-in scroll-mt-6" id="node-details">
          <div className="mb-6 flex flex-col">
            <h2 className="text-lg font-bold tracking-tight text-gray-900 mb-1">
              Policy Detail — {selectedNode.name || selectedNode.hostname}
            </h2>
            <p className="text-sm font-medium text-gray-500">
              Comparing cryptographic baseline proof against current snapshot telemetry.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
            <div className="card bg-gray-50/50 p-0 border-transparent">
              <PolicyCompare policies={selectedNode.policy_state} driftedCategories={selectedNode.drifted_categories || []} />
            </div>

            <div className="flex flex-col gap-4">
              {/* Telemetry */}
              <div className="card p-5 bg-white shadow-sm border-gray-100 flex flex-col">
                <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-4 block">Node Telemetry</span>
                <div className="flex flex-col gap-3 font-mono text-xs">
                  {[
                    { label: "Uptime Since", value: new Date(selectedNode.uptime_start).toLocaleDateString(), color: "text-gray-900" },
                    { label: "Reconciliations", value: selectedNode.reconcile_count, color: "text-blue-600" },
                    { label: "Snapshots", value: selectedNode.snapshot_count, color: "text-gray-600" },
                  ].map((row, i) => (
                    <div key={i} className="flex justify-between items-center border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                      <span className="text-gray-500 font-medium">{row.label}</span>
                      <span className={`font-bold ${row.color}`}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <button className="btn-primary w-full justify-center py-2.5">
                Force Snapshot Re-Capture
              </button>
              <button className="btn-secondary w-full justify-center py-2.5">
                Export Integrity Proof
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
