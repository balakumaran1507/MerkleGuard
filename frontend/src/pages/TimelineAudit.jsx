import React, { useState } from "react"
import { useApi } from "../hooks/useApi"
import { useEvents } from "../context/EventContext"
import { TimelineItem } from "../components/TimelineItem"
import { Search, Download, Filter } from "lucide-react"

const monoLabel = { fontFamily: "var(--font-mono)", fontSize: "9.5px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text-muted)" }

export function TimelineAudit() {
   const { events: liveEvents, isConnected } = useEvents()
   const { data: auditData } = useApi("/api/audit-log")
   const [activeTab, setActiveTab] = useState("live")

   const auditEntries = Array.isArray(auditData) ? auditData : (auditData?.entries || [])

   return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

         {/* Heading */}
         <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <div>
               <h1 style={{ fontFamily: "var(--font-sans)", fontSize: "22px", fontWeight: 700, color: "var(--color-text-primary)", letterSpacing: "-0.03em", lineHeight: 1, marginBottom: "6px" }}>
                  Timeline & Forensic Audit
               </h1>
               <p style={{ ...monoLabel }}>Immutable log of Merkle proofs and reconciliation actions</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
               <span
                  className={isConnected ? "animate-mg-pulse" : ""}
                  style={{ display: "block", width: "6px", height: "6px", borderRadius: "50%", background: isConnected ? "var(--color-status-ok)" : "var(--color-status-crit)", flexShrink: 0 }}
               />
               <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700, letterSpacing: "0.06em", color: isConnected ? "var(--color-status-ok)" : "var(--color-status-crit)" }}>
                  {isConnected ? "LIVE" : "DISCONNECTED"}
               </span>
            </div>
         </div>

         {/* Tabs */}
         <div style={{ display: "flex", gap: "0", borderBottom: "1px solid var(--color-border-default)" }}>
            {[
               { id: "live", label: "Live Events" },
               { id: "audit", label: "Audit Log" },
            ].map(tab => (
               <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                     position: "relative", padding: "10px 20px", cursor: "pointer",
                     fontFamily: "var(--font-mono)", fontSize: "10px", fontWeight: 700,
                     letterSpacing: "0.08em", textTransform: "uppercase",
                     background: "none", border: "none",
                     color: activeTab === tab.id ? "var(--color-cyan-500)" : "var(--color-text-muted)",
                     transition: "color 0.15s",
                  }}
               >
                  {tab.label}
                  {activeTab === tab.id && (
                     <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "2px", background: "var(--color-cyan-500)", boxShadow: "0 0 8px rgba(0,210,255,0.5)" }} />
                  )}
               </button>
            ))}
         </div>

         {activeTab === "live" ? (
            <div className="mg-card animate-mg-fadeIn" style={{ overflow: "hidden" }}>
               <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-border-default)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--color-bg-elevated)" }}>
                  <span style={{ ...monoLabel }}>Recent Activity · Last 100</span>
                  <div style={{ display: "flex", gap: "4px" }}>
                     <button className="mg-btn-ghost" style={{ padding: "5px 8px" }}><Filter size={13} /></button>
                     <button className="mg-btn-ghost" style={{ padding: "5px 8px" }}><Download size={13} /></button>
                  </div>
               </div>
               <div style={{ display: "flex", flexDirection: "column" }}>
                  {liveEvents.length > 0
                     ? liveEvents.map((ev, i) => <TimelineItem key={i} event={ev} />)
                     : (
                        <div style={{ padding: "60px 0", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.3 }}>
                           <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--color-text-dim)" }}>
                              Awaiting consensus events…
                           </span>
                        </div>
                     )
                  }
               </div>
            </div>
         ) : (
            <div className="mg-card animate-mg-fadeIn" style={{ overflow: "hidden" }}>
               {/* Audit toolbar */}
               <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-border-default)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--color-bg-elevated)" }}>
                  <div style={{ position: "relative" }}>
                     <Search size={12} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }} />
                     <input
                        type="text"
                        placeholder="Search node ID or root hash…"
                        style={{
                           background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)",
                           borderRadius: "6px", padding: "7px 12px 7px 30px", fontSize: "11px",
                           fontFamily: "var(--font-sans)", color: "var(--color-text-primary)", outline: "none", width: "240px",
                        }}
                        onFocus={e => e.target.style.borderColor = "var(--color-cyan-500)"}
                        onBlur={e => e.target.style.borderColor = "var(--color-border-default)"}
                     />
                  </div>
                  <button className="mg-btn-secondary" style={{ fontSize: "11px", gap: "6px" }}>
                     <Download size={12} />Export CSV
                  </button>
               </div>

               {/* Table */}
               <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                     <thead>
                        <tr style={{ background: "var(--color-bg-elevated)", borderBottom: "1px solid var(--color-border-default)" }}>
                           {["Timestamp", "Event Type", "Node ID", "Before Root", "After Root", "Details"].map(th => (
                              <th key={th} style={{ padding: "10px 16px", textAlign: "left", fontFamily: "var(--font-mono)", fontSize: "9px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>
                                 {th}
                              </th>
                           ))}
                        </tr>
                     </thead>
                     <tbody>
                        {auditEntries.map(entry => (
                           <tr
                              key={entry.id}
                              style={{ borderBottom: "1px solid var(--color-border-subtle)", transition: "background 0.1s" }}
                              onMouseEnter={e => e.currentTarget.style.background = "var(--color-bg-elevated)"}
                              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                           >
                              <td style={{ padding: "10px 16px", fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--color-text-dim)", whiteSpace: "nowrap" }}>
                                 {new Date(entry.created_at).toLocaleString()}
                              </td>
                              <td style={{ padding: "10px 16px" }}>
                                 <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", fontWeight: 700, letterSpacing: "0.08em", padding: "2px 7px", borderRadius: "4px", background: "var(--color-bg-elevated)", border: "1px solid var(--color-border-default)", color: "var(--color-text-secondary)", textTransform: "uppercase" }}>
                                    {entry.event_type}
                                 </span>
                              </td>
                              <td style={{ padding: "10px 16px", fontFamily: "var(--font-mono)", fontSize: "11px", fontWeight: 700, color: "var(--color-cyan-500)" }}>{entry.node_id}</td>
                              <td style={{ padding: "10px 16px", fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--color-text-muted)" }}>{entry.before_root ? entry.before_root.substring(0, 12) + "…" : "—"}</td>
                              <td style={{ padding: "10px 16px", fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--color-text-muted)" }}>{entry.after_root ? entry.after_root.substring(0, 12) + "…" : "—"}</td>
                              <td style={{ padding: "10px 16px", fontFamily: "var(--font-sans)", fontSize: "11px", color: "var(--color-text-secondary)", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                 {JSON.stringify(entry.meta || {})}
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
                  {auditEntries.length === 0 && (
                     <div style={{ padding: "60px 0", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.3 }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", color: "var(--color-text-dim)" }}>No audit records found.</span>
                     </div>
                  )}
               </div>
            </div>
         )}
      </div>
   )
}
