import React from "react"
import { useApi } from "../hooks/useApi"
import {
   LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts"
import { StatCard } from "../components/StatCard"
import { Clock, CheckCircle2, AlertTriangle, Zap, Share2 } from "lucide-react"

const monoLabel = { fontFamily: "var(--font-mono)", fontSize: "9.5px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text-muted)" }

const tooltipStyle = {
   contentStyle: { backgroundColor: "var(--color-bg-elevated)", border: "1px solid var(--color-border-default)", borderRadius: "8px", fontSize: "11px", fontFamily: "'Geist Mono', monospace" },
   itemStyle: { color: "var(--color-text-secondary)" },
   labelStyle: { color: "var(--color-text-muted)", fontSize: "10px" },
}

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

   const historyData = [
      { time: "10:00", drifts: 2, score: 0.12 },
      { time: "11:00", drifts: 5, score: 0.25 },
      { time: "12:00", drifts: 3, score: 0.18 },
      { time: "13:00", drifts: 8, score: 0.45 },
      { time: "14:00", drifts: 4, score: 0.22 },
      { time: "15:00", drifts: 6, score: 0.35 },
   ]

   const efficiencyData = [
      { name: "Naive  O(n)", value: m.comparison_naive_vs_merkle?.naive_comparisons_per_cycle || 96, color: "#2d3748" },
      { name: "Merkle O(log n)", value: m.comparison_naive_vs_merkle?.merkle_avg_comparisons_per_cycle || 24, color: "#00d2ff" },
   ]

   const telemetry = [
      { label: "Total Cycles", key: "cycles_completed", color: "var(--color-text-primary)" },
      { label: "Drifts Detected", key: "drifts_detected", color: "var(--color-status-warn)" },
      { label: "Attacks Neutralized", key: "attacks_detected", color: "var(--color-status-crit)" },
      { label: "Auto-Remediations", key: "auto_remediations", color: "var(--color-status-ok)" },
      { label: "Admin Escalations", key: "escalations", color: "var(--color-violet-400)" },
   ]

   return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

         {/* Heading */}
         <div>
            <h1 style={{ fontFamily: "var(--font-sans)", fontSize: "22px", fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: "-0.03em", lineHeight: 1, marginBottom: "6px" }}>
               Performance Analytics
            </h1>
            <p style={{ ...monoLabel }}>Consensus protocol efficiency and reliability metrics</p>
         </div>

         {/* Stat cards */}
         <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
            {stats.map((s, i) => <StatCard key={i} label={s.label} value={s.value} subtitle={s.sub} icon={s.icon} color={s.color} />)}
         </div>

         {/* Charts row */}
         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>

            {/* Drift frequency */}
            <div className="mg-card" style={{ padding: "20px 24px" }}>
               <span style={{ ...monoLabel, display: "block", marginBottom: "16px" }}>Drift Frequency Over Time</span>
               <div style={{ height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                     <LineChart data={historyData}>
                        <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
                        <XAxis dataKey="time" stroke="var(--color-text-dim)" fontSize={10} axisLine={false} tickLine={false} fontFamily="'Geist Mono', monospace" />
                        <YAxis stroke="var(--color-text-dim)" fontSize={10} axisLine={false} tickLine={false} fontFamily="'Geist Mono', monospace" />
                        <Tooltip {...tooltipStyle} />
                        <Line type="monotone" dataKey="drifts" stroke="var(--color-cyan-500)" strokeWidth={2} dot={{ fill: "var(--color-cyan-500)", r: 3 }} activeDot={{ r: 5 }} />
                     </LineChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* Efficiency bar */}
            <div className="mg-card" style={{ padding: "20px 24px" }}>
               <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                  <span style={{ ...monoLabel }}>Comparison Efficiency</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", fontWeight: 700, padding: "2px 7px", borderRadius: "4px", background: "var(--color-status-ok-dim)", border: "1px solid rgba(16,212,140,0.2)", color: "var(--color-status-ok)" }}>
                     {m.comparison_naive_vs_merkle?.efficiency_gain_percent || 0}% FASTER
                  </span>
               </div>
               <div style={{ height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={efficiencyData} layout="vertical">
                        <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" stroke="var(--color-text-dim)" fontSize={10} axisLine={false} tickLine={false} width={110} fontFamily="'Geist Mono', monospace" />
                        <Tooltip cursor={{ fill: "rgba(255,255,255,0.03)" }} {...tooltipStyle} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={28}>
                           {efficiencyData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Bar>
                     </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>
         </div>

         {/* Bottom row */}
         <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: "16px" }}>

            {/* Telemetry */}
            <div className="mg-card" style={{ padding: "20px 24px" }}>
               <span style={{ ...monoLabel, display: "block", marginBottom: "16px" }}>Cycle Telemetry</span>
               <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                  {telemetry.map((item, i) => (
                     <div
                        key={i}
                        style={{
                           display: "flex", justifyContent: "space-between", alignItems: "center",
                           padding: "10px 0",
                           borderBottom: i < telemetry.length - 1 ? "1px solid var(--color-border-subtle)" : "none",
                        }}
                     >
                        <span style={{ fontFamily: "var(--font-sans)", fontSize: "11.5px", color: "var(--color-text-muted)" }}>{item.label}</span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 700, color: item.color }}>
                           {m.totals?.[item.key] ?? 0}
                        </span>
                     </div>
                  ))}
               </div>
            </div>

            {/* Latency heatmap */}
            <div className="mg-card" style={{ padding: "20px 24px" }}>
               <span style={{ ...monoLabel, display: "block", marginBottom: "16px" }}>Consensus Latency Heatmap</span>
               <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: "5px" }}>
                  {Array.from({ length: 48 }).map((_, i) => {
                     const intensity = 0.1 + Math.random() * 0.9
                     return (
                        <div
                           key={i}
                           title={`${Math.round(intensity * 490 + 10)}ms`}
                           style={{
                              aspectRatio: "1", borderRadius: "4px", cursor: "pointer",
                              background: `rgba(0, 210, 255, ${intensity * 0.9})`,
                              transition: "transform 0.15s",
                           }}
                           onMouseEnter={e => e.currentTarget.style.transform = "scale(1.15)"}
                           onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                        />
                     )
                  })}
               </div>
               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--color-text-dim)" }}>10ms</span>
                  <div style={{ flex: 1, height: "2px", margin: "0 12px", borderRadius: "1px", background: "linear-gradient(90deg, rgba(0,210,255,0.1), var(--color-cyan-500))" }} />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "var(--color-text-dim)" }}>500ms</span>
               </div>
            </div>
         </div>
      </div>
   )
}
