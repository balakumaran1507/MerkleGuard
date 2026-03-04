import React, { useState } from "react"
import { useApi } from "../hooks/useApi"
import {
   LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts"

const monoLabel = { fontFamily: "var(--font-mono)", fontSize: "9.5px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text-muted)" }

const tooltipStyle = {
   contentStyle: { backgroundColor: "var(--color-bg-elevated)", border: "1px solid var(--color-border-default)", borderRadius: "8px", fontSize: "11px", fontFamily: "'Geist Mono', monospace" },
   itemStyle: { color: "var(--color-text-secondary)" },
   labelStyle: { color: "var(--color-text-muted)", fontSize: "10px" },
}

function RangeSlider({ label, value, min, max, onChange }) {
   return (
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
         <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: "12px", fontWeight: 500, color: "var(--color-text-secondary)" }}>{label}</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: 700, color: "var(--color-cyan-500)" }}>{value}</span>
         </div>
         <input
            type="range" min={min} max={max} value={value}
            onChange={e => onChange(parseInt(e.target.value))}
            style={{ width: "100%", height: "3px", accentColor: "var(--color-cyan-500)", cursor: "pointer" }}
         />
      </div>
   )
}

export function NetworkAnalysis() {
   const [n, setN] = useState(16)
   const [k, setK] = useState(3)
   const [rounds, setRounds] = useState(1)
   const { data: scalabilityData } = useApi("/api/analysis/scalability")

   const calculateBandwidth = () => {
      const bytes = n * k * rounds * 256
      if (bytes < 1024) return `${bytes} B`
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
   }

   const detectionProb = (1 - Math.pow(1 - k / n, rounds)) * 100

   const projections = [
      { label: "Messages / Round", value: n * k, suffix: "" },
      { label: "Bandwidth Overhead", value: calculateBandwidth(), suffix: "" },
      { label: "Detection Probability", value: detectionProb.toFixed(2), suffix: "%" },
      { label: "Max Compromised (BFT)", value: Math.floor(n / 3), suffix: "" },
   ]

   const tableHeaders = ["Nodes", "k", "Messages", "Bandwidth", "Det. Prob", "BFT Limit"]

   return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

         {/* Heading */}
         <div>
            <h1 style={{ fontFamily: "var(--font-sans)", fontSize: "22px", fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: "-0.03em", lineHeight: 1, marginBottom: "6px" }}>
               Network Analysis
            </h1>
            <p style={{ ...monoLabel }}>Gossip protocol scalability and communication overhead</p>
         </div>

         <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "16px" }}>

            {/* Left: Controls + Projections */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

               {/* Sliders */}
               <div className="mg-card" style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: "20px" }}>
                  <span style={{ ...monoLabel }}>Protocol Parameters</span>
                  <RangeSlider label="Nodes (n)" value={n} min={2} max={1000} onChange={setN} />
                  <RangeSlider label="Peers per round (k)" value={k} min={1} max={10} onChange={setK} />
                  <RangeSlider label="Rounds" value={rounds} min={1} max={10} onChange={setRounds} />
               </div>

               {/* Projections */}
               <div
                  className="mg-card"
                  style={{
                     padding: "20px 24px", display: "flex", flexDirection: "column", gap: "0",
                     background: "var(--color-cyan-dim)",
                     borderColor: "rgba(0,210,255,0.18)",
                  }}
               >
                  <span style={{ ...monoLabel, display: "block", marginBottom: "14px", color: "var(--color-cyan-400)" }}>
                     Real-time Projections
                  </span>
                  {projections.map((item, i) => (
                     <div
                        key={i}
                        style={{
                           display: "flex", justifyContent: "space-between", alignItems: "center",
                           padding: "10px 0",
                           borderBottom: i < projections.length - 1 ? "1px solid rgba(0,210,255,0.1)" : "none",
                        }}
                     >
                        <span style={{ fontFamily: "var(--font-sans)", fontSize: "11px", color: "var(--color-text-secondary)" }}>{item.label}</span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 700, color: "var(--color-cyan-500)" }}>
                           {item.value}{item.suffix}
                        </span>
                     </div>
                  ))}
               </div>
            </div>

            {/* Right: Table + Chart */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

               {/* Scalability table */}
               <div className="mg-card" style={{ overflow: "hidden" }}>
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-border-default)", background: "var(--color-bg-elevated)" }}>
                     <span style={{ ...monoLabel }}>Scalability Analysis</span>
                  </div>
                  <div style={{ overflowX: "auto" }}>
                     <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                           <tr style={{ borderBottom: "1px solid var(--color-border-default)" }}>
                              {tableHeaders.map(th => (
                                 <th key={th} style={{ padding: "10px 16px", textAlign: "left", fontFamily: "var(--font-mono)", fontSize: "9px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>
                                    {th}
                                 </th>
                              ))}
                           </tr>
                        </thead>
                        <tbody>
                           {(scalabilityData?.table || []).map((row, i) => (
                              <tr
                                 key={i}
                                 style={{ borderBottom: "1px solid var(--color-border-subtle)", transition: "background 0.1s" }}
                                 onMouseEnter={e => e.currentTarget.style.background = "var(--color-bg-elevated)"}
                                 onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                              >
                                 <td style={{ padding: "9px 16px", fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: 700, color: "var(--color-text-primary)" }}>{row.nodes}</td>
                                 <td style={{ padding: "9px 16px", fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--color-text-muted)" }}>{row.k_peers}</td>
                                 <td style={{ padding: "9px 16px", fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--color-text-secondary)" }}>{row.messages_per_round}</td>
                                 <td style={{ padding: "9px 16px", fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--color-text-secondary)" }}>{row.bandwidth_human}</td>
                                 <td style={{ padding: "9px 16px" }}>
                                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: 700, color: "var(--color-status-ok)" }}>
                                       {(row.detection_probability * 100).toFixed(1)}%
                                    </span>
                                 </td>
                                 <td style={{ padding: "9px 16px", fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--color-text-muted)" }}>{row.max_compromised_f}</td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>

               {/* Chart */}
               <div className="mg-card" style={{ padding: "20px 24px" }}>
                  <span style={{ ...monoLabel, display: "block", marginBottom: "16px" }}>Messages vs Network Size</span>
                  <div style={{ height: 200 }}>
                     <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={scalabilityData?.table || []}>
                           <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
                           <XAxis dataKey="nodes" stroke="var(--color-text-dim)" fontSize={10} axisLine={false} tickLine={false} fontFamily="'Geist Mono', monospace" />
                           <YAxis stroke="var(--color-text-dim)" fontSize={10} axisLine={false} tickLine={false} fontFamily="'Geist Mono', monospace" />
                           <Tooltip {...tooltipStyle} />
                           <Line type="monotone" dataKey="messages_per_round" stroke="var(--color-cyan-500)" strokeWidth={2} dot={false} />
                        </LineChart>
                     </ResponsiveContainer>
                  </div>
               </div>
            </div>
         </div>
      </div>
   )
}
