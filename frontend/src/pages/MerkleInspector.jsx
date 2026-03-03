import React, { useState, useEffect } from "react"
import { useApi } from "../hooks/useApi"
import { MerkleTreeD3 } from "../components/MerkleTreeD3"
import { StatusBadge } from "../components/StatusBadge"
import { PolicyCompare } from "../components/PolicyCompare"
import { client } from "../api/client"
import { clsx } from "clsx"
import { Info, AlertCircle } from "lucide-react"

export function MerkleInspector() {
  const { nodes, nodeStatuses } = useEvents()
  const [selectedNodeId, setSelectedNodeId] = useState(null)
  const [merkleData, setMerkleData] = useState(null)
  const [loading, setLoading] = useState(false)

  const nodesWithUpdates = nodes.map(n => ({
    ...n,
    status: nodeStatuses[n.id] || n.status
  }))
  
  useEffect(() => {
    if (nodes.length > 0 && !selectedNodeId) {
      setSelectedNodeId(nodes[0].id)
    }
  }, [nodes, selectedNodeId])

  useEffect(() => {
    if (selectedNodeId) {
      const fetchMerkle = async () => {
        setLoading(true)
        try {
          const result = await client.get(`/api/nodes/${selectedNodeId}/merkle`)
          setMerkleData(result)
        } catch (err) {
          console.error(err)
        } finally {
          setLoading(false)
        }
      }
      fetchMerkle()
    }
  }, [selectedNodeId])

  const selectedNode = nodesWithUpdates.find(n => n.id === selectedNodeId)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Merkle Integrity Inspector</h1>
        <p className="text-xs text-text-muted font-bold uppercase tracking-widest mt-1">Hierarchical Cryptographic Verification & Drift Localization</p>
      </div>

      {/* Node Selector Strip */}
      <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar">
        {nodes.map(node => (
          <button
            key={node.id}
            onClick={() => setSelectedNodeId(node.id)}
            className={clsx(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-bold transition-all duration-200 border whitespace-nowrap",
              selectedNodeId === node.id
                ? "bg-accent-cyan/10 border-accent-cyan text-accent-cyan"
                : clsx(
                    "bg-bg-surface hover:bg-bg-surface-alt",
                    node.status === 'compliant' ? "border-border-default text-text-muted" : (node.status === 'critical' ? "border-mg-red/40 text-mg-red" : "border-mg-amber/40 text-mg-amber")
                  )
            )}
          >
            <span className="font-mono">{node.name.split('-').slice(0, 2).join('-')}</span>
            {node.status !== 'compliant' && <AlertCircle size={10} />}
          </button>
        ))}
      </div>

      {selectedNode && (
        <div className="flex flex-col gap-6 animate-mg-fadeIn">
          {/* Info Bar */}
          <div className="mg-card p-4 flex flex-wrap items-center justify-between gap-4">
             <div className="flex items-center gap-4">
                <StatusBadge status={selectedNode.status} />
                <div className="flex flex-col">
                   <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Full Merkle Root</span>
                   <span className={clsx("text-xs font-mono font-bold", 
                     selectedNode.status === 'compliant' ? "text-accent-cyan" : (selectedNode.status === 'critical' ? "text-mg-red" : "text-mg-amber")
                   )}>
                     {selectedNode.merkle_root}
                   </span>
                </div>
             </div>
             
             <div className="flex gap-6">
                <div className="flex flex-col items-center">
                   <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Reconciliations</span>
                   <span className="text-sm font-bold text-text-primary font-mono">{selectedNode.reconcile_count}</span>
                </div>
                <div className="flex flex-col items-center">
                   <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Uptime</span>
                   <span className="text-sm font-bold text-text-primary font-mono">{selectedNode.uptime}</span>
                </div>
             </div>
          </div>

          {/* Merkle Tree (D3.js) */}
          <div className="mg-card p-6 flex flex-col gap-6">
             <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                   <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest">Merkle Graph Visualizer</h3>
                   <p className="text-[10px] text-text-dim">Log(n) traversal path for drift localization. Click nodes to view proofs.</p>
                </div>
                <div className="flex gap-4">
                   <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-sm bg-bg-surface-alt border border-border-default" />
                      <span className="text-[9px] font-bold text-text-muted uppercase">Verified</span>
                   </div>
                   <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-sm bg-mg-amber-dim border border-mg-amber" />
                      <span className="text-[9px] font-bold text-mg-amber uppercase">Affected Path</span>
                   </div>
                   <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-sm bg-mg-red-dim border border-mg-red" />
                      <span className="text-[9px] font-bold text-mg-red uppercase">Drift Source</span>
                   </div>
                </div>
             </div>

             <MerkleTreeD3 
               treeData={merkleData?.tree} 
               driftIndices={merkleData?.drift_indices}
               onNodeClick={(d) => console.log("Node clicked", d)}
             />
          </div>

          {/* Policy Detail Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             <div className="lg:col-span-2">
                <div className="flex flex-col gap-4">
                   <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest px-1">Policy Reconstruction</h3>
                   <PolicyCompare policies={selectedNode.policy_state} />
                </div>
             </div>
             
             <div className="flex flex-col gap-4">
                <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest px-1">Verification Metadata</h3>
                <div className="mg-card p-4 flex flex-col gap-4">
                   <div className="flex gap-3 items-start">
                      <div className="p-2 rounded bg-accent-cyan/10 text-accent-cyan">
                         <Info size={16} />
                      </div>
                      <div className="flex flex-col gap-1">
                         <span className="text-[10px] font-bold text-text-primary uppercase tracking-wider">Proof Level</span>
                         <p className="text-[10px] text-text-muted leading-relaxed">System successfully traversed {merkleData?.tree?.levels?.length} hierarchy levels to localize this drift.</p>
                      </div>
                   </div>
                   
                   <div className="h-px bg-border-default" />
                   
                   <div className="flex flex-col gap-3 font-mono text-[10px]">
                      <div className="flex justify-between">
                         <span className="text-text-dim">ALGORITHM</span>
                         <span className="text-text-primary font-bold">SHA-256</span>
                      </div>
                      <div className="flex justify-between">
                         <span className="text-text-dim">LEAVES</span>
                         <span className="text-text-primary font-bold">64</span>
                      </div>
                      <div className="flex justify-between">
                         <span className="text-text-dim">TREE DEPTH</span>
                         <span className="text-text-primary font-bold">6</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  )
}
