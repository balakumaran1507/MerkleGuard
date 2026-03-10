import React from "react"
import { useApi } from "../hooks/useApi"
import {
   LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts"
import { StatCard } from "../components/StatCard"
import { Clock, CheckCircle2, AlertTriangle, Zap, Share2 } from "lucide-react"

const CustomTooltip = ({ active, payload, label }) => {
   if (active && payload && payload.length) {
      return (
         <div className="bg-white border border-gray-100 p-3 rounded-lg shadow-sm">
            <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1">{label}</p>
            <p className="text-sm font-mono font-bold text-gray-900">
               {`${payload[0].value} Drifts`}
            </p>
         </div>
      );
   }
   return null;
};

const CustomBarTooltip = ({ active, payload }) => {
   if (active && payload && payload.length) {
      return (
         <div className="bg-white border border-gray-100 p-3 rounded-lg shadow-sm">
            <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1">{payload[0].payload.name}</p>
            <p className="text-sm font-mono font-bold text-gray-900">
               {`${payload[0].value} Comparisons`}
            </p>
         </div>
      );
   }
   return null;
};

export function Analytics() {
   const { data: metrics } = useApi("/api/metrics")
   const m = metrics || {}

   const stats = [
      { label: "MTTD", value: `${(m.mean_time_to_detection_ms / 1000 || 0).toFixed(2)}s`, sub: "Mean Time to Detection", icon: Clock, colorConfig: { icon: "text-blue-600", iconBg: "bg-blue-50", iconBorder: "border-blue-100", accent: "bg-blue-600" } },
      { label: "MTTR", value: `${(m.mean_time_to_reconciliation_ms / 1000 || 0).toFixed(2)}s`, sub: "Mean Time to Reconcile", icon: Zap, colorConfig: { icon: "text-indigo-600", iconBg: "bg-indigo-50", iconBorder: "border-indigo-100", accent: "bg-indigo-600" } },
      { label: "FPR", value: `${(m.false_positive_rate || 0).toFixed(2)}%`, sub: "False Positive Rate", icon: CheckCircle2, colorConfig: { icon: "text-emerald-600", iconBg: "bg-emerald-50", iconBorder: "border-emerald-100", accent: "bg-emerald-600" } },
      { label: "Localization", value: `${(m.drift_localization_accuracy || 0).toFixed(1)}%`, sub: "Detection Accuracy", icon: AlertTriangle, colorConfig: { icon: "text-amber-600", iconBg: "bg-amber-50", iconBorder: "border-amber-100", accent: "bg-amber-600" } },
      { label: "Consensus", value: `${(m.consensus_agreement_rate || 0).toFixed(1)}%`, sub: "Agreement Success", icon: Share2, colorConfig: { icon: "text-gray-600", iconBg: "bg-gray-100", iconBorder: "border-gray-200", accent: "bg-gray-600" } },
   ]

   const historyData = [
      { time: "10:00", drifts: 2, score: 0.12 },
      { time: "11:00", drifts: 5, score: 0.25 },
      { time: "12:00", drifts: 3, score: 0.18 },
      { time: "13:00", drifts: 8, score: 0.45 },
      { time: "14:00", drifts: 4, score: 0.22 },
      { time: "15:00", drifts: 6, score: 0.35 },
   ]

   const efficiencyData = [
      { name: "Naive  O(n)", value: m.comparison_naive_vs_merkle?.naive_comparisons_per_cycle || 96, color: "#9ca3af" },
      { name: "Merkle O(log n)", value: m.comparison_naive_vs_merkle?.merkle_avg_comparisons_per_cycle || 24, color: "#2563eb" },
   ]

   const telemetry = [
      { label: "Total Cycles", key: "cycles_completed", color: "text-gray-900" },
      { label: "Drifts Detected", key: "drifts_detected", color: "text-amber-600" },
      { label: "Attacks Neutralized", key: "attacks_detected", color: "text-red-500" },
      { label: "Auto-Remediations", key: "auto_remediations", color: "text-emerald-600" },
      { label: "Admin Escalations", key: "escalations", color: "text-indigo-500" },
   ]

   return (
      <div className="flex flex-col gap-6">

         {/* Heading */}
         <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-1">
               Performance Analytics
            </h1>
            <p className="text-sm font-medium text-gray-500">
               Consensus protocol efficiency and reliability metrics
            </p>
         </div>

         {/* Stat cards */}
         <div className="flex flex-wrap gap-4">
            {stats.map((s, i) => <StatCard key={i} label={s.label} value={s.value} subtitle={s.sub} icon={s.icon} colorConfig={s.colorConfig} />)}
         </div>

         {/* Charts row */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Drift frequency */}
            <div className="card p-6 min-h-[300px] flex flex-col">
               <div className="mb-4">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Drift Frequency Over Time</span>
               </div>
               <div className="flex-1 w-full min-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                     <LineChart data={historyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                        <XAxis dataKey="time" stroke="#9ca3af" fontSize={11} axisLine={false} tickLine={false} fontFamily="Geist Mono" />
                        <YAxis stroke="#9ca3af" fontSize={11} axisLine={false} tickLine={false} fontFamily="Geist Mono" />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey="drifts" stroke="#2563eb" strokeWidth={3} dot={{ fill: '#2563eb', strokeWidth: 0, r: 4 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                     </LineChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* Efficiency bar */}
            <div className="card p-6 min-h-[300px] flex flex-col">
               <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Comparison Efficiency</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
                     {m.comparison_naive_vs_merkle?.efficiency_gain_percent || 0}% FASTER
                  </span>
               </div>
               <div className="flex-1 w-full min-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={efficiencyData} layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={11} axisLine={false} tickLine={false} fontFamily="Geist Mono" />
                        <Tooltip content={<CustomBarTooltip />} cursor={{ fill: '#f9fafb' }} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                           {efficiencyData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Bar>
                     </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>
         </div>

         {/* Bottom row */}
         <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">

            {/* Telemetry */}
            <div className="card p-5">
               <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-4 block">Cycle Telemetry</span>
               <div className="flex flex-col gap-0 font-mono text-xs">
                  {telemetry.map((item, i) => (
                     <div
                        key={i}
                        className={`flex justify-between items-center py-2.5 ${i < telemetry.length - 1 ? "border-b border-gray-100" : ""}`}
                     >
                        <span className="font-sans font-medium text-gray-500">{item.label}</span>
                        <span className={`font-bold ${item.color}`}>
                           {m.totals?.[item.key] ?? 0}
                        </span>
                     </div>
                  ))}
               </div>
            </div>

            {/* Latency heatmap */}
            <div className="card p-6">
               <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-4 block">Consensus Latency Heatmap</span>

               <div className="grid grid-cols-8 sm:grid-cols-12 md:grid-cols-16 gap-1.5 mb-4">
                  {Array.from({ length: 96 }).map((_, i) => {
                     const intensity = 0.1 + Math.random() * 0.9
                     const latency = Math.round(intensity * 490 + 10)
                     return (
                        <div
                           key={i}
                           title={`${latency}ms`}
                           className="aspect-square rounded-sm cursor-pointer hover:scale-110 transition-transform hover:ring-2 hover:ring-blue-300 ring-offset-1"
                           style={{ backgroundColor: `rgba(59, 130, 246, ${intensity * 0.8 + 0.1})` }}
                        />
                     )
                  })}
               </div>

               <div className="flex justify-between items-center px-1">
                  <span className="font-mono text-[10px] font-semibold tracking-widest text-gray-400">10ms</span>
                  <div className="flex-1 h-1 mx-4 rounded-full bg-gradient-to-r from-blue-50 to-blue-600" />
                  <span className="font-mono text-[10px] font-semibold tracking-widest text-gray-400">500ms</span>
               </div>
            </div>
         </div>
      </div>
   )
}
