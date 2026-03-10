import React, { useState } from "react"
import { useApi } from "../hooks/useApi"
import { useEvents } from "../context/EventContext"
import { TimelineItem } from "../components/TimelineItem"
import { Search, Download, Filter } from "lucide-react"

export function TimelineAudit() {
   const { events: liveEvents, isConnected } = useEvents()
   const { data: auditData } = useApi("/api/audit-log")
   const [activeTab, setActiveTab] = useState("live")

   const auditEntries = Array.isArray(auditData) ? auditData : (auditData?.entries || [])

   const handleExport = (data, prefix) => {
      if (!data || data.length === 0) {
         alert("No data available to export.")
         return
      }

      const keys = Object.keys(data[0])
      const csvContent = [
         keys.join(','),
         ...data.map(row =>
            keys.map(k => {
               const val = row[k]
               const strVal = typeof val === 'object' ? JSON.stringify(val) : String(val || '')
               return `"${strVal.replace(/"/g, '""')}"`
            }).join(',')
         )
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `${prefix}_export_${Date.now()}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
   }

   return (
      <div className="flex flex-col gap-6">

         {/* Heading */}
         <div className="flex items-end justify-between">
            <div>
               <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-1">
                  Timeline & Forensic Audit
               </h1>
               <p className="text-sm font-medium text-gray-500">
                  Immutable log of Merkle proofs and reconciliation actions
               </p>
            </div>
            <div className="flex items-center gap-2">
               <span
                  className={`block w-2 h-2 rounded-full shrink-0 ${isConnected ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"}`}
               />
               <span className={`text-[10px] font-bold tracking-widest uppercase ${isConnected ? "text-emerald-600" : "text-red-600"}`}>
                  {isConnected ? "LIVE STREAM" : "DISCONNECTED"}
               </span>
            </div>
         </div>

         {/* Tabs */}
         <div className="flex gap-2 border-b border-gray-200">
            {[
               { id: "live", label: "Live Events" },
               { id: "audit", label: "Audit Log" },
            ].map(tab => (
               <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-4 py-3 text-xs font-bold tracking-widest uppercase transition-colors ${activeTab === tab.id ? "text-blue-600" : "text-gray-500 hover:text-gray-800"
                     }`}
               >
                  {tab.label}
                  {activeTab === tab.id && (
                     <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
                  )}
               </button>
            ))}
         </div>

         {activeTab === "live" ? (
            <div className="card overflow-hidden flex flex-col h-[600px]">
               <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Recent Activity · Last 100</span>
                  <div className="flex gap-2">
                     <button className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"><Filter size={14} /></button>
                     <button onClick={() => handleExport(liveEvents, "live_events")} className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"><Download size={14} /></button>
                  </div>
               </div>

               <div className="flex flex-col flex-1 overflow-y-auto">
                  {liveEvents.length > 0 ? (
                     liveEvents.map((ev, i) => <TimelineItem key={i} event={ev} />)
                  ) : (
                     <div className="flex-1 flex flex-col items-center justify-center p-12 text-gray-400 space-y-2">
                        <span className="text-sm font-medium">Awaiting consensus events…</span>
                     </div>
                  )}
               </div>
            </div>
         ) : (
            <div className="card overflow-hidden">
               {/* Audit toolbar */}
               <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <div className="relative">
                     <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                     <input
                        type="text"
                        placeholder="Search node ID or root hash…"
                        className="bg-white border border-gray-200 rounded-md py-1.5 pl-9 pr-3 text-sm text-gray-900 focus:outline-none focus:ring-2 ring-blue-500/20 focus:border-blue-500 w-64 transition-all"
                     />
                  </div>
                  <button onClick={() => handleExport(auditEntries, "audit_log")} className="btn-secondary text-xs py-1.5 px-3">
                     <Download size={14} />Export CSV
                  </button>
               </div>

               {/* Table */}
               <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                     <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 uppercase text-[10px] font-bold tracking-wider text-gray-400">
                           <th className="px-4 py-3 align-middle">Timestamp</th>
                           <th className="px-4 py-3 align-middle">Event Type</th>
                           <th className="px-4 py-3 align-middle">Node ID</th>
                           <th className="px-4 py-3 align-middle">Before Root</th>
                           <th className="px-4 py-3 align-middle">After Root</th>
                           <th className="px-4 py-3 align-middle">Details</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50 text-sm">
                        {auditEntries.map(entry => (
                           <tr
                              key={entry.id}
                              className="hover:bg-gray-50/50 transition-colors"
                           >
                              <td className="px-4 py-3 font-mono text-[11px] text-gray-500 whitespace-nowrap">
                                 {new Date(entry.created_at).toLocaleString()}
                              </td>
                              <td className="px-4 py-3">
                                 <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600">
                                    {entry.event_type}
                                 </span>
                              </td>
                              <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-600">{entry.node_id}</td>
                              <td className="px-4 py-3 font-mono text-[11px] text-gray-400">{entry.before_root ? entry.before_root.substring(0, 12) + "…" : "—"}</td>
                              <td className="px-4 py-3 font-mono text-[11px] text-gray-400">{entry.after_root ? entry.after_root.substring(0, 12) + "…" : "—"}</td>
                              <td className="px-4 py-3 text-[11px] text-gray-500 max-w-[200px] truncate">
                                 {JSON.stringify(entry.meta || {})}
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>

                  {auditEntries.length === 0 && (
                     <div className="flex items-center justify-center p-16 text-gray-400">
                        <span className="text-sm font-medium">No audit records found.</span>
                     </div>
                  )}
               </div>
            </div>
         )}
      </div>
   )
}
