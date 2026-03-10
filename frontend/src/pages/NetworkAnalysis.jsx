import React, { useState } from "react"
import { useApi } from "../hooks/useApi"
import {
   LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts"
import { Activity } from "lucide-react"

function RangeSlider({ label, value, min, max, onChange }) {
   return (
      <div className="flex flex-col gap-2">
         <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-700">{label}</span>
            <span className="font-mono text-sm font-bold text-blue-600">{value}</span>
         </div>
         <input
            type="range" min={min} max={max} value={value}
            onChange={e => onChange(parseInt(e.target.value))}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
         />
      </div>
   )
}

const CustomTooltip = ({ active, payload, label }) => {
   if (active && payload && payload.length) {
      return (
         <div className="bg-white border border-gray-100 p-3 rounded-lg shadow-sm">
            <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1">{`Nodes: ${label}`}</p>
            <p className="text-sm font-mono font-bold text-blue-600">
               {`${payload[0].value} Messages`}
            </p>
         </div>
      );
   }
   return null;
};

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
      { label: "Detection Probability", value: detectionProb.toFixed(2), suffix: "%", highlight: true },
      { label: "Max Compromised (BFT)", value: Math.floor(n / 3), suffix: "" },
   ]

   const tableHeaders = ["Nodes", "k", "Messages", "Bandwidth", "Det. Prob", "BFT Limit"]

   return (
      <div className="flex flex-col gap-6">

         {/* Heading */}
         <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-1">
               Network Analysis
            </h1>
            <p className="text-sm font-medium text-gray-500">
               Gossip protocol scalability and communication overhead
            </p>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">

            {/* Left: Controls + Projections */}
            <div className="flex flex-col gap-6">

               {/* Sliders */}
               <div className="card p-6 flex flex-col gap-6">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Protocol Parameters</span>
                  <RangeSlider label="Nodes (n)" value={n} min={2} max={1000} onChange={setN} />
                  <RangeSlider label="Peers per round (k)" value={k} min={1} max={10} onChange={setK} />
                  <RangeSlider label="Rounds" value={rounds} min={1} max={10} onChange={setRounds} />
               </div>

               {/* Projections */}
               <div className="card p-6 border-blue-100 bg-blue-50/50 flex flex-col gap-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500 flex items-center gap-1.5">
                     <Activity size={14} /> Real-time Projections
                  </span>
                  <div className="flex flex-col gap-3">
                     {projections.map((item, i) => (
                        <div
                           key={i}
                           className={`flex justify-between items-center pb-3 ${i < projections.length - 1 ? "border-b border-blue-100/50" : ""}`}
                        >
                           <span className="text-xs font-semibold text-gray-600">{item.label}</span>
                           <span className={`font-mono text-sm font-bold ${item.highlight ? "text-emerald-600" : "text-blue-700"}`}>
                              {item.value}{item.suffix}
                           </span>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* Right: Table + Chart */}
            <div className="flex flex-col gap-6">

               {/* Scalability table */}
               <div className="card overflow-hidden">
                  <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
                     <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Scalability Analysis</span>
                  </div>
                  <div className="overflow-x-auto">
                     <table className="w-full text-left border-collapse">
                        <thead>
                           <tr className="border-b border-gray-100 bg-gray-50/30">
                              {tableHeaders.map(th => (
                                 <th key={th} className="px-5 py-3 text-[10px] font-bold tracking-widest uppercase text-gray-400 whitespace-nowrap">
                                    {th}
                                 </th>
                              ))}
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                           {(scalabilityData?.table || []).map((row, i) => (
                              <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                 <td className="px-5 py-3 font-mono text-xs font-bold text-gray-900">{row.nodes}</td>
                                 <td className="px-5 py-3 font-mono text-xs text-gray-500">{row.k_peers}</td>
                                 <td className="px-5 py-3 font-mono text-xs font-semibold text-blue-600">{row.messages_per_round}</td>
                                 <td className="px-5 py-3 font-mono text-xs text-gray-600">{row.bandwidth_human}</td>
                                 <td className="px-5 py-3">
                                    <span className="font-mono text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                                       {(row.detection_probability * 100).toFixed(1)}%
                                    </span>
                                 </td>
                                 <td className="px-5 py-3 font-mono text-xs text-gray-400">{row.max_compromised_f}</td>
                              </tr>
                           ))}
                           {!(scalabilityData?.table) && (
                              <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-400">Loading analysis data...</td></tr>
                           )}
                        </tbody>
                     </table>
                  </div>
               </div>

               {/* Chart */}
               <div className="card p-6">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-6 block">Messages vs Network Size</span>
                  <div className="h-[240px] w-full">
                     <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={scalabilityData?.table || []} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                           <XAxis dataKey="nodes" stroke="#9ca3af" fontSize={11} axisLine={false} tickLine={false} tickMargin={10} fontFamily="Geist Mono" />
                           <YAxis stroke="#9ca3af" fontSize={11} axisLine={false} tickLine={false} tickMargin={10} fontFamily="Geist Mono" />
                           <Tooltip content={<CustomTooltip />} />
                           <Line type="monotone" dataKey="messages_per_round" stroke="#2563eb" strokeWidth={3} dot={{ r: 3, fill: '#2563eb', strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} />
                        </LineChart>
                     </ResponsiveContainer>
                  </div>
               </div>
            </div>
         </div>
      </div>
   )
}
