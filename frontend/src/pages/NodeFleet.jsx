import React, { useState } from "react"
import { useEvents } from "../context/EventContext"
import { NodeCard } from "../components/NodeCard"
import { PolicyCompare } from "../components/PolicyCompare"
import { clsx } from "clsx"

export function NodeFleet() {
  const { nodes, nodeStatuses } = useEvents()
  const [filter, setFilter] = useState("all")
  const [selectedNodeId, setSelectedNodeId] = useState(null)

  const nodesWithUpdates = nodes.map(n => ({
    ...n,
    status: nodeStatuses[n.id] || n.status
  }))

  const filteredNodes = nodesWithUpdates.filter(n => filter === "all" || n.status === filter)
  const selectedNode = nodesWithUpdates.find(n => n.id === selectedNodeId)

  const counts = {
    all: nodesWithUpdates.length,
    compliant: nodesWithUpdates.filter(n => n.status === "compliant").length,
    drifted: nodesWithUpdates.filter(n => n.status === "drifted").length,
    critical: nodesWithUpdates.filter(n => n.status === "critical").length,
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Node Fleet Management</h1>
        <p className="text-xs text-text-muted font-bold uppercase tracking-widest mt-1">Distributed Integrity Verification Across 16 Endpoints</p>
      </div>

      <div className="flex gap-2">
        {["all", "compliant", "drifted", "critical"].map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={clsx(
              "px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 border",
              filter === type 
                ? "bg-bg-surface-alt border-accent-cyan text-accent-cyan" 
                : "bg-bg-surface border-border-default text-text-muted hover:text-text-primary hover:border-border-light"
            )}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)} ({counts[type]})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredNodes.map(node => (
          <NodeCard 
            key={node.id} 
            node={node} 
            isSelected={selectedNodeId === node.id}
            onClick={() => setSelectedNodeId(node.id)}
          />
        ))}
      </div>

      {selectedNode && (
        <div className="mg-card p-6 flex flex-col gap-6 mt-4 animate-mg-fadeIn">
          <div className="flex flex-col gap-1">
             <h2 className="text-lg font-bold text-text-primary">Policy Compliance Detail — {selectedNode.name}</h2>
             <p className="text-xs text-text-muted">Comparing expected baseline cryptographic proof against current snapshot telemetry.</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="lg:col-span-2">
                <PolicyCompare policies={selectedNode.policies} />
             </div>
             
             <div className="flex flex-col gap-6">
                <div className="mg-card bg-bg-surface-alt/50 p-4 border-dashed">
                   <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Node Telemetry</h4>
                   <div className="flex flex-col gap-2 font-mono text-xs">
                      <div className="flex justify-between">
                         <span className="text-text-dim">Uptime</span>
                         <span className="text-mg-green">{selectedNode.uptime}</span>
                      </div>
                      <div className="flex justify-between">
                         <span className="text-text-dim">Reconciliations</span>
                         <span className="text-accent-cyan">{selectedNode.reconcile_count}</span>
                      </div>
                      <div className="flex justify-between">
                         <span className="text-text-dim">Last Snapshot</span>
                         <span className="text-text-primary">{new Date(selectedNode.last_snapshot).toLocaleString()}</span>
                      </div>
                   </div>
                </div>

                <div className="flex flex-col gap-2">
                   <button className="mg-btn-primary text-xs w-full">Force Snapshot Re-Capture</button>
                   <button className="mg-btn-secondary text-xs w-full">Export Integrity Proof</button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  )
}
