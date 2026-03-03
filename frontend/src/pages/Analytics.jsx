import React from "react"
import { useApi } from "../hooks/useApi"
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from "recharts"
import { StatCard } from "../components/StatCard"
import { Clock, CheckCircle2, AlertTriangle, Zap, Share2 } from "lucide-react"

export function Analytics() {
  const { data: metrics } = useApi("/api/metrics")
  
  const m = metrics || {}

  const stats = [
    { label: "MTTD", value: `${(m.mean_time_to_detection_ms / 1000 || 0).toFixed(2)}s`, sub: "Mean Time to Detection", icon: Clock, color: "cyan" },
    { label: "MTTR", value: `${(m.mean_time_to_reconciliation_ms / 1000 || 0).toFixed(2)}s`, sub: "Mean Time to Reconcile", icon: Zap, color: "purple" },
    { label: "FPR", value: `${(m.false_positive_rate || 0).toFixed(2)}%`, sub: "False Positive Rate", icon: CheckCircle2, color: "green" },
    { label: "Localization", value: `${(m.drift_localization_accuracy || 0).toFixed(1)}%`, sub: "Detection Accuracy", icon: AlertTriangle, color: "amber" },
    { label: "Consensus", value: `${(m.consensus_agreement_rate || 0).toFixed(1)}%`, sub: "Agreement Success", icon: Share2, color: "white" },
  ]

  // Mock historical data for charts
  const historyData = [
    { time: "10:00", drifts: 2, score: 0.12 },
    { time: "11:00", drifts: 5, score: 0.25 },
    { time: "12:00", drifts: 3, score: 0.18 },
    { time: "13:00", drifts: 8, score: 0.45 },
    { time: "14:00", drifts: 4, score: 0.22 },
    { time: "15:00", drifts: 6, score: 0.35 },
  ]

  const efficiencyData = [
    { name: "Naive (O(n))", value: m.comparison_naive_vs_merkle?.naive_comparisons_per_cycle || 96, color: "#475569" },
    { name: "Merkle (O(log n))", value: m.comparison_naive_vs_merkle?.merkle_avg_comparisons_per_cycle || 24, color: "#06b6d4" },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">System Performance Analytics</h1>
        <p className="text-xs text-text-muted font-bold uppercase tracking-widest mt-1">Quantifying Efficiency and Reliability of the Consensus Protocol</p>
      </div>

      <div className="flex flex-wrap gap-4">
         {stats.map((s, i) => (
           <StatCard key={i} label={s.label} value={s.value} subtitle={s.sub} icon={s.icon} color={s.color} />
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="mg-card p-6 flex flex-col gap-6">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest">Drift Frequency Over Time</h3>
            <div className="h-64 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historyData}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                     <XAxis dataKey="time" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                     <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                     <Tooltip 
                        contentStyle={{ backgroundColor: "#111827", border: "1px solid #1e293b", borderRadius: "8px" }}
                        itemStyle={{ fontSize: "12px" }}
                     />
                     <Line type="monotone" dataKey="drifts" stroke="#06b6d4" strokeWidth={2} dot={{ fill: "#06b6d4", r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="mg-card p-6 flex flex-col gap-6">
            <div className="flex justify-between items-start">
               <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest">Comparison Efficiency Gain</h3>
               <span className="text-[10px] font-bold text-mg-green bg-mg-green/10 px-1.5 py-0.5 rounded">
                  {m.comparison_naive_vs_merkle?.efficiency_gain_percent || 0}% FASTER
               </span>
            </div>
            <div className="h-64 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={efficiencyData} layout="vertical">
                     <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                     <XAxis type="number" hide />
                     <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} width={100} />
                     <Tooltip 
                        cursor={{ fill: "transparent" }}
                        contentStyle={{ backgroundColor: "#111827", border: "1px solid #1e293b", borderRadius: "8px" }}
                     />
                     <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                        {efficiencyData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="mg-card p-6 lg:col-span-1">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-6">Total Cycle Telemetry</h3>
            <div className="flex flex-col gap-4">
               {[
                 { label: "Total Cycles", value: m.totals?.cycles_completed, color: "text-text-primary" },
                 { label: "Drifts Detected", value: m.totals?.drifts_detected, color: "text-mg-amber" },
                 { label: "Attacks Neutralized", value: m.totals?.attacks_detected, color: "text-mg-red" },
                 { label: "Auto-Remediations", value: m.totals?.auto_remediations, color: "text-mg-green" },
                 { label: "Admin Escalations", value: m.totals?.escalations, color: "text-mg-purple" },
               ].map((item, i) => (
                 <div key={i} className="flex justify-between items-center border-b border-border-default/50 pb-3 last:border-0 last:pb-0">
                    <span className="text-xs text-text-muted font-medium">{item.label}</span>
                    <span className={clsx("text-sm font-mono font-bold", item.color)}>{item.value || 0}</span>
                 </div>
               ))}
            </div>
         </div>

         <div className="mg-card p-6 lg:col-span-2">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-6">Consensus Latency Heatmap</h3>
            <div className="grid grid-cols-6 gap-2">
               {Array.from({ length: 48 }).map((_, i) => {
                 const intensity = Math.random()
                 return (
                   <div 
                     key={i} 
                     className="aspect-square rounded-sm transition-all duration-500 hover:scale-110 cursor-pointer" 
                     style={{ 
                       backgroundColor: "#06b6d4", 
                       opacity: intensity < 0.2 ? 0.1 : intensity 
                     }}
                     title={`Latency: ${Math.round(intensity * 100)}ms`}
                   />
                 )
               })}
            </div>
            <div className="flex justify-between items-center mt-4">
               <span className="text-[9px] font-bold text-text-muted uppercase">10ms</span>
               <div className="flex-1 h-1 mx-4 rounded-full bg-gradient-to-r from-accent-cyan/10 to-accent-cyan" />
               <span className="text-[9px] font-bold text-text-muted uppercase">500ms</span>
            </div>
         </div>
      </div>
    </div>
  )
}
