import React, { useState } from "react"
import { useApi } from "../hooks/useApi"
import { useEvents } from "../context/EventContext"
import { TimelineItem } from "../components/TimelineItem"
import { clsx } from "clsx"
import { Search, Filter, Download } from "lucide-react"

export function TimelineAudit() {
  const { events: liveEvents, isConnected } = useEvents()
  const { data: auditData } = useApi("/api/audit-log")
  const [activeTab, setActiveTab] = useState("live")

  const auditEntries = auditData?.entries || []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Timeline & Forensic Audit</h1>
          <p className="text-xs text-text-muted font-bold uppercase tracking-widest mt-1">Immutable Log of Merkle Proofs and Reconciliation Actions</p>
        </div>
        
        <div className="flex items-center gap-2">
           <div className={clsx("w-2 h-2 rounded-full animate-mg-pulse", isConnected ? "bg-mg-green" : "bg-mg-red")} />
           <span className={clsx("text-xs font-mono font-bold uppercase tracking-widest", isConnected ? "text-mg-green" : "text-mg-red")}>
             {isConnected ? "Live Feed Active" : "Stream Disconnected"}
           </span>
        </div>
      </div>

      <div className="flex border-b border-border-default gap-8">
         <button 
           onClick={() => setActiveTab("live")}
           className={clsx("pb-4 px-1 text-xs font-bold uppercase tracking-widest transition-all relative", 
             activeTab === "live" ? "text-accent-cyan" : "text-text-muted hover:text-text-primary"
           )}
         >
           Live Infrastructure Events
           {activeTab === "live" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-accent-cyan shadow-[0_0_8px_rgba(6,182,212,0.5)]" />}
         </button>
         <button 
           onClick={() => setActiveTab("audit")}
           className={clsx("pb-4 px-1 text-xs font-bold uppercase tracking-widest transition-all relative", 
             activeTab === "audit" ? "text-accent-cyan" : "text-text-muted hover:text-text-primary"
           )}
         >
           Historical Audit Log
           {activeTab === "audit" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-accent-cyan shadow-[0_0_8px_rgba(6,182,212,0.5)]" />}
         </button>
      </div>

      {activeTab === "live" ? (
        <div className="mg-card overflow-hidden animate-mg-fadeIn">
           <div className="p-4 bg-bg-surface-alt/50 border-b border-border-default flex justify-between items-center">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Recent System Activity (Last 100)</span>
              <div className="flex gap-2">
                 <button className="p-1.5 rounded hover:bg-bg-surface text-text-muted transition-colors"><Filter size={14} /></button>
                 <button className="p-1.5 rounded hover:bg-bg-surface text-text-muted transition-colors"><Download size={14} /></button>
              </div>
           </div>
           <div className="flex flex-col">
              {liveEvents.length > 0 ? (
                liveEvents.map((ev, i) => <TimelineItem key={i} event={ev} />)
              ) : (
                <div className="py-20 flex flex-col items-center justify-center opacity-30 italic text-sm text-text-dim">
                   <span>Awaiting consensus events from distributed nodes...</span>
                </div>
              )}
           </div>
        </div>
      ) : (
        <div className="mg-card overflow-hidden animate-mg-fadeIn">
           <div className="p-4 bg-bg-surface-alt/50 border-b border-border-default flex justify-between items-center">
              <div className="flex items-center gap-4">
                 <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
                    <input 
                      type="text" 
                      placeholder="Search by Node ID or Root Hash..." 
                      className="bg-bg-surface border border-border-default rounded-lg pl-9 pr-4 py-1.5 text-xs text-text-primary outline-none focus:border-accent-cyan transition-colors w-64"
                    />
                 </div>
              </div>
              <button className="mg-btn-secondary py-1.5 text-[10px] flex items-center gap-2">
                 <Download size={12} />
                 <span>Export CSV</span>
              </button>
           </div>
           
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-bg-surface-alt/30 border-b border-border-default">
                       <th className="p-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Timestamp</th>
                       <th className="p-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Event Type</th>
                       <th className="p-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Node ID</th>
                       <th className="p-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Before Root</th>
                       <th className="p-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">After Root</th>
                       <th className="p-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Details</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-border-default/50">
                    {auditEntries.map(entry => (
                      <tr key={entry.id} className="hover:bg-bg-surface-alt/30 transition-colors">
                         <td className="p-4 text-[10px] font-mono text-text-dim">{new Date(entry.created_at).toLocaleString()}</td>
                         <td className="p-4">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-bg-surface-alt border border-border-default text-text-primary uppercase tracking-tighter">
                               {entry.event_type}
                            </span>
                         </td>
                         <td className="p-4 text-xs font-mono font-bold text-accent-cyan">{entry.node_id}</td>
                         <td className="p-4 text-[10px] font-mono text-text-muted">{entry.before_root.substring(0, 12)}...</td>
                         <td className="p-4 text-[10px] font-mono text-text-muted">{entry.after_root.substring(0, 12)}...</td>
                         <td className="p-4 text-xs text-text-primary truncate max-w-[200px]">{JSON.stringify(entry.metadata)}</td>
                      </tr>
                    ))}
                 </tbody>
              </table>
              {auditEntries.length === 0 && (
                <div className="py-20 flex items-center justify-center opacity-30 italic text-sm text-text-dim">
                   <span>No historical audit records found.</span>
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  )
}
