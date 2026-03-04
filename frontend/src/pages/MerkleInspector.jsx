import React, { useState, useEffect } from "react"
import { useEvents } from "../context/EventContext"
import { MerkleTreeD3 } from "../components/MerkleTreeD3"
import { StatusBadge } from "../components/StatusBadge"
import { PolicyCompare } from "../components/PolicyCompare"
import { client } from "../api/client"
import { AlertCircle, Info } from "lucide-react"

const monoLabel = { fontFamily: "var(--font-mono)", fontSize: "9.5px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text-muted)" }

export function MerkleInspector() {
   const { nodes, nodeStatuses } = useEvents()
   const [selectedNodeId, setSelectedNodeId] = useState(null)
   const [merkleData, setMerkleData] = useState(null)
   const [loading, setLoading] = useState(false)

   const nodesWithUpdates = nodes.map(n => ({ ...n, status: nodeStatuses?.[n.id] || n.status }))

   useEffect(() => {
      if (nodes.length > 0 && !selectedNodeId) setSelectedNodeId(nodes[0].id)
   }, [nodes, selectedNodeId])

   useEffect(() => {
      if (!selectedNodeId) return
      const fetch = async () => {
         setLoading(true)
         try {
            const result = await client.get(`/api/nodes/${selectedNodeId}/merkle`)
            setMerkleData(result)
         } catch (err) { console.error(err) }
         finally { setLoading(false) }
      }
      fetch()
   }, [selectedNodeId])

   const selectedNode = nodesWithUpdates.find(n => n.id === selectedNodeId)

   return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

         {/* Heading */}
         <div>
            <h1 style={{ fontFamily: "var(--font-sans)", fontSize: "22px", fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: "-0.03em", lineHeight: 1, marginBottom: "6px" }}>
               Merkle Inspector
            </h1>
            <p style={{ ...monoLabel }}>Hierarchical cryptographic verification & drift localization</p>
         </div>

         {/* Node pill selector */}
         <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "4px" }}>
            {nodesWithUpdates.map(node => {
               const isSel = selectedNodeId === node.id
               const borderColor = node.status === "critical" ? "rgba(240,75,75,0.4)" : node.status === "drifted" ? "rgba(245,158,11,0.4)" : "var(--color-border-default)"
               const color = node.status === "critical" ? "var(--color-status-crit)" : node.status === "drifted" ? "var(--color-status-warn)" : "var(--color-text-muted)"
               return (
                  <button
                     key={node.id}
                     onClick={() => setSelectedNodeId(node.id)}
                     style={{
                        display: "inline-flex", alignItems: "center", gap: "5px",
                        padding: "5px 12px", borderRadius: "6px", cursor: "pointer",
                        fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700,
                        letterSpacing: "0.04em", whiteSpace: "nowrap",
                        background: isSel ? "var(--color-cyan-dim)" : "var(--color-bg-surface)",
                        border: `1px solid ${isSel ? "rgba(0,210,255,0.3)" : borderColor}`,
                        color: isSel ? "var(--color-cyan-500)" : color,
                        transition: "all 0.15s",
                     }}
                  >
                     {node.name.split("-").slice(0, 2).join("-")}
                     {node.status !== "compliant" && <AlertCircle size={9} strokeWidth={2.5} />}
                  </button>
               )
            })}
         </div>

         {selectedNode && (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }} className="animate-mg-fadeIn">

               {/* Info bar */}
               <div
                  className="mg-card"
                  style={{ padding: "14px 20px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px" }}
               >
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                     <StatusBadge status={selectedNode.status} />
                     <div>
                        <span style={{ ...monoLabel, display: "block", marginBottom: "2px" }}>Merkle Root</span>
                        <span
                           style={{
                              fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: 700,
                              color: selectedNode.status === "compliant"
                                 ? "var(--color-cyan-500)"
                                 : selectedNode.status === "critical"
                                    ? "var(--color-status-crit)"
                                    : "var(--color-status-warn)",
                              letterSpacing: "0.03em",
                           }}
                        >
                           {(selectedNode.current_merkle_root || selectedNode.merkle_root || "").substring(0, 32)}…
                        </span>
                     </div>
                  </div>
                  <div style={{ display: "flex", gap: "24px" }}>
                     {[
                        { label: "Reconciliations", value: selectedNode.reconcile_count, color: "var(--color-cyan-500)" },
                        { label: "Online Since", value: new Date(selectedNode.uptime_start).toLocaleDateString(), color: "var(--color-text-secondary)" },
                     ].map(row => (
                        <div key={row.label}>
                           <span style={{ ...monoLabel, display: "block", marginBottom: "2px" }}>{row.label}</span>
                           <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 700, color: row.color }}>{row.value}</span>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Merkle tree vis */}
               <div className="mg-card" style={{ padding: "20px 24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                     <div>
                        <span style={{ ...monoLabel }}>Merkle Graph Visualizer</span>
                        <p style={{ fontFamily: "var(--font-sans)", fontSize: "11px", color: "var(--color-text-muted)", marginTop: "4px" }}>
                           O(log n) traversal path for drift localization. Click nodes to inspect.
                        </p>
                     </div>
                     <div style={{ display: "flex", gap: "14px" }}>
                        {[
                           { color: "var(--color-bg-elevated)", border: "var(--color-border-default)", label: "Verified" },
                           { color: "var(--color-status-warn-dim)", border: "rgba(245,158,11,0.4)", label: "Affected Path", textColor: "var(--color-status-warn)" },
                           { color: "var(--color-status-crit-dim)", border: "rgba(240,75,75,0.4)", label: "Drift Source", textColor: "var(--color-status-crit)" },
                        ].map(item => (
                           <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                              <div style={{ width: 9, height: 9, borderRadius: "3px", background: item.color, border: `1px solid ${item.border}` }} />
                              <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", fontWeight: 600, letterSpacing: "0.06em", color: item.textColor || "var(--color-text-muted)" }}>
                                 {item.label}
                              </span>
                           </div>
                        ))}
                     </div>
                  </div>
                  <MerkleTreeD3 treeData={merkleData?.tree} driftIndices={merkleData?.drift_indices} onNodeClick={(d) => console.log("Node clicked", d)} />
               </div>

               {/* Policy + Metadata */}
               <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: "16px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                     <span style={{ ...monoLabel }}>Policy Reconstruction</span>
                     <PolicyCompare policies={selectedNode.policy_state} driftedCategories={selectedNode.drifted_categories || []} />
                  </div>

                  <div className="mg-card" style={{ padding: "18px 20px" }}>
                     <span style={{ ...monoLabel, display: "block", marginBottom: "14px" }}>Verification Metadata</span>
                     <div style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: "14px" }}>
                        <div style={{ width: 28, height: 28, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "6px", background: "var(--color-cyan-dim)", border: "1px solid rgba(0,210,255,0.2)", color: "var(--color-cyan-500)" }}>
                           <Info size={13} strokeWidth={2} />
                        </div>
                        <p style={{ fontFamily: "var(--font-sans)", fontSize: "11px", color: "var(--color-text-muted)", lineHeight: 1.5 }}>
                           Traversed {merkleData?.tree?.levels?.length ?? "—"} hierarchy levels to localize drift.
                        </p>
                     </div>

                     <div style={{ borderTop: "1px solid var(--color-border-default)", paddingTop: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
                        {[
                           { label: "ALGORITHM", value: "SHA-256" },
                           { label: "LEAVES", value: "64" },
                           { label: "DEPTH", value: "6" },
                        ].map(row => (
                           <div key={row.label} style={{ display: "flex", justifyContent: "space-between" }}>
                              <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", fontWeight: 600, letterSpacing: "0.1em", color: "var(--color-text-muted)" }}>{row.label}</span>
                              <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: 700, color: "var(--color-text-secondary)" }}>{row.value}</span>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   )
}
