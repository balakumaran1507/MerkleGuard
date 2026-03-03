import React, { useState } from "react"
import { useApi } from "../hooks/useApi"
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts"

export function NetworkAnalysis() {
  const [n, setN] = useState(16)
  const [k, setK] = useState(3)
  const [rounds, setRounds] = useState(1)

  const { data: scalabilityData } = useApi("/api/analysis/scalability")

  const calculateBandwidth = () => {
    const bytesPerMsg = 256
    const totalMsgs = n * k * rounds
    const bytes = totalMsgs * bytesPerMsg
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const detectionProb = (1 - Math.pow(1 - k/n, rounds)) * 100

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Consensus Network Analysis</h1>
        <p className="text-xs text-text-muted font-bold uppercase tracking-widest mt-1">Quantifying Scalability and Communication Overhead of Gossip Protocol</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Calculator */}
        <div className="lg:col-span-1 flex flex-col gap-6">
           <div className="mg-card p-6 flex flex-col gap-8">
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest">Protocol Parameters</h3>
              
              <div className="flex flex-col gap-4">
                 <div className="flex flex-col gap-2">
                    <div className="flex justify-between">
                       <label className="text-xs font-bold text-text-primary">Nodes (n)</label>
                       <span className="text-xs font-mono text-accent-cyan font-bold">{n}</span>
                    </div>
                    <input 
                      type="range" min="2" max="1000" value={n} 
                      onChange={(e) => setN(parseInt(e.target.value))}
                      className="w-full accent-accent-cyan h-1 bg-bg-surface-alt rounded-lg appearance-none cursor-pointer"
                    />
                 </div>

                 <div className="flex flex-col gap-2">
                    <div className="flex justify-between">
                       <label className="text-xs font-bold text-text-primary">Peers per round (k)</label>
                       <span className="text-xs font-mono text-accent-cyan font-bold">{k}</span>
                    </div>
                    <input 
                      type="range" min="1" max="10" value={k} 
                      onChange={(e) => setK(parseInt(e.target.value))}
                      className="w-full accent-accent-cyan h-1 bg-bg-surface-alt rounded-lg appearance-none cursor-pointer"
                    />
                 </div>

                 <div className="flex flex-col gap-2">
                    <div className="flex justify-between">
                       <label className="text-xs font-bold text-text-primary">Rounds</label>
                       <span className="text-xs font-mono text-accent-cyan font-bold">{rounds}</span>
                    </div>
                    <input 
                      type="range" min="1" max="10" value={rounds} 
                      onChange={(e) => setRounds(parseInt(e.target.value))}
                      className="w-full accent-accent-cyan h-1 bg-bg-surface-alt rounded-lg appearance-none cursor-pointer"
                    />
                 </div>
              </div>
           </div>

           <div className="mg-card p-6 bg-accent-cyan/5 border-accent-cyan/20">
              <h3 className="text-xs font-bold text-accent-cyan uppercase tracking-widest mb-6">Real-time Projections</h3>
              <div className="flex flex-col gap-4">
                 {[
                   { label: "Messages per round", value: n * k, sub: "O(n*k)" },
                   { label: "Bandwidth Overhead", value: calculateBandwidth(), sub: "Total Bytes" },
                   { label: "Detection Probability", value: `${detectionProb.toFixed(2)}%`, sub: "Consensus Reliability" },
                   { label: "Max Compromised", value: Math.floor(n / 3), sub: "Byzantine Fault Tolerance" },
                 ].map((item, i) => (
                   <div key={i} className="flex justify-between items-start">
                      <div className="flex flex-col">
                         <span className="text-xs text-text-primary font-bold">{item.label}</span>
                         <span className="text-[9px] text-text-dim uppercase font-bold tracking-tighter">{item.sub}</span>
                      </div>
                      <span className="text-sm font-mono font-bold text-accent-cyan">{item.value}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Scalability Table & Chart */}
        <div className="lg:col-span-2 flex flex-col gap-6">
           <div className="mg-card overflow-hidden">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-bg-surface-alt/30 border-b border-border-default">
                       <th className="p-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Nodes</th>
                       <th className="p-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">k</th>
                       <th className="p-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Messages</th>
                       <th className="p-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Bandwidth</th>
                       <th className="p-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Detection Prob</th>
                       <th className="p-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">BFT Limit</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-border-default/50">
                    {(scalabilityData?.table || []).map((row, i) => (
                      <tr key={i} className="hover:bg-bg-surface-alt/30 transition-colors">
                         <td className="p-4 text-xs font-mono font-bold text-text-primary">{row.nodes}</td>
                         <td className="p-4 text-xs font-mono text-text-muted">{row.k_peers}</td>
                         <td className="p-4 text-xs font-mono text-text-muted">{row.messages_per_round}</td>
                         <td className="p-4 text-xs font-mono text-text-muted">{row.bandwidth_human}</td>
                         <td className="p-4">
                            <span className="text-xs font-mono font-bold text-mg-green">{(row.detection_probability * 100).toFixed(1)}%</span>
                         </td>
                         <td className="p-4 text-xs font-mono text-text-muted">{row.max_compromised_f}</td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </div>

           <div className="mg-card p-6">
              <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-6">Messages vs Network Size</h3>
              <div className="h-64 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={scalabilityData?.table || []}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                       <XAxis dataKey="nodes" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                       <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                       <Tooltip 
                          contentStyle={{ backgroundColor: "#111827", border: "1px solid #1e293b", borderRadius: "8px" }}
                          itemStyle={{ fontSize: "12px" }}
                       />
                       <Line type="monotone" dataKey="messages_per_round" stroke="#06b6d4" strokeWidth={2} dot={false} />
                    </LineChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
