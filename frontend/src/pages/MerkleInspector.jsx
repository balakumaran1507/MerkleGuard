import React, { useState, useEffect } from "react"
import { useEvents } from "../context/EventContext"
import { MerkleTreeD3 } from "../components/MerkleTreeD3"
import { StatusBadge } from "../components/StatusBadge"
import { PolicyCompare } from "../components/PolicyCompare"
import { client } from "../api/client"
import { AlertCircle, Info } from "lucide-react"

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
      <div className="flex flex-col gap-6">

         {/* Heading */}
         <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-1">
               Merkle Inspector
            </h1>
            <p className="text-sm font-medium text-gray-500">
               Hierarchical cryptographic verification & drift localization
            </p>
         </div>

         {/* Node pill selector */}
         <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {nodesWithUpdates.map(node => {
               const isSel = selectedNodeId === node.id
               const isCritical = node.status === "critical" || node.status === "compromised"
               const isWarning = node.status === "drifted" || node.status === "warning"

               const borderColor = isCritical ? "border-red-200" : isWarning ? "border-amber-200" : "border-gray-200"
               const textColor = isCritical ? "text-red-600" : isWarning ? "text-amber-600" : "text-gray-500"
               const bg = isCritical ? "bg-red-50" : isWarning ? "bg-amber-50" : "bg-white"

               return (
                  <button
                     key={node.id}
                     onClick={() => setSelectedNodeId(node.id)}
                     className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase whitespace-nowrap transition-all border ${isSel ? "bg-blue-50 border-blue-200 text-blue-600 ring-1 ring-blue-500/20" : `${bg} ${borderColor} ${textColor} hover:bg-gray-50`
                        }`}
                  >
                     {(node.name || node.hostname).split("-").slice(0, 2).join("-")}
                     {(isCritical || isWarning) && <AlertCircle size={10} strokeWidth={2.5} />}
                  </button>
               )
            })}
         </div>

         {selectedNode && (
            <div className="flex flex-col gap-4 animate-fade-in">

               {/* Info bar */}
               <div className="card p-4 px-5 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                     <StatusBadge status={selectedNode.status} />
                     <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">Merkle Root</span>
                        <span className={`font-mono text-xs font-bold tracking-tight ${selectedNode.status === "compliant" || selectedNode.status === "secure" ? "text-emerald-600" :
                              selectedNode.status === "critical" || selectedNode.status === "compromised" ? "text-red-600" : "text-amber-600"
                           }`}>
                           {(selectedNode.current_merkle_root || selectedNode.merkle_root || "").substring(0, 32)}…
                        </span>
                     </div>
                  </div>
                  <div className="flex gap-6">
                     {[
                        { label: "Reconciliations", value: selectedNode.reconcile_count, color: "text-blue-600" },
                        { label: "Online Since", value: new Date(selectedNode.uptime_start).toLocaleDateString(), color: "text-gray-900" },
                     ].map(row => (
                        <div key={row.label}>
                           <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">{row.label}</span>
                           <span className={`font-mono text-sm font-bold ${row.color}`}>{row.value}</span>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Merkle tree vis */}
               <div className="card p-6 min-h-[400px]">
                  <div className="flex justify-between items-start mb-4">
                     <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Merkle Graph Visualizer</span>
                        <p className="text-xs font-medium text-gray-500 mt-1">
                           O(log n) traversal path for drift localization. Click nodes to inspect.
                        </p>
                     </div>
                     <div className="flex gap-4">
                        {[
                           { color: "bg-gray-100", border: "border-gray-200", label: "Verified", textColor: "text-gray-500" },
                           { color: "bg-amber-100", border: "border-amber-200", label: "Affected Path", textColor: "text-amber-600" },
                           { color: "bg-red-100", border: "border-red-200", label: "Drift Source", textColor: "text-red-600" },
                        ].map(item => (
                           <div key={item.label} className="flex items-center gap-1.5">
                              <div className={`w-2.5 h-2.5 rounded-sm border ${item.color} ${item.border}`} />
                              <span className={`text-[10px] font-bold uppercase tracking-widest ${item.textColor}`}>
                                 {item.label}
                              </span>
                           </div>
                        ))}
                     </div>
                  </div>
                  <MerkleTreeD3 treeData={merkleData} driftIndices={merkleData?.drifted_leaf_indices || []} onNodeClick={(d) => console.log("Node clicked", d)} />
               </div>

               {/* Policy + Metadata */}
               <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4">
                  <div className="flex flex-col gap-3">
                     <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 pl-1">Policy Reconstruction</span>
                     <div className="card bg-gray-50/50 p-0 border-transparent">
                        <PolicyCompare policies={selectedNode.policy_state} driftedCategories={selectedNode.drifted_categories || []} />
                     </div>
                  </div>

                  <div className="card p-5">
                     <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-4">Verification Metadata</span>

                     <div className="flex gap-3 items-start mb-4">
                        <div className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100 shadow-sm">
                           <Info size={16} strokeWidth={2.5} />
                        </div>
                        <p className="text-xs font-medium text-gray-500 leading-relaxed pt-1">
                           Traversed {merkleData?.tree?.levels?.length ?? "—"} hierarchy levels to localize drift.
                        </p>
                     </div>

                     <div className="border-t border-gray-100 pt-4 flex flex-col gap-3">
                        {[
                           { label: "ALGORITHM", value: "SHA-256" },
                           { label: "LEAVES", value: "64" },
                           { label: "DEPTH", value: "6" },
                        ].map(row => (
                           <div key={row.label} className="flex justify-between items-center">
                              <span className="font-mono text-[10px] font-semibold tracking-widest text-gray-400">{row.label}</span>
                              <span className="font-mono text-xs font-bold text-gray-900">{row.value}</span>
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
