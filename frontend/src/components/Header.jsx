import React, { useState, useEffect } from "react"
import { Play, RotateCcw, ShieldCheck, ShieldAlert } from "lucide-react"
import { ConnectionStatus } from "./ConnectionStatus"
import { client } from "../api/client"
import { clsx } from "clsx"

export function Header() {
  const [reconciling, setReconciling] = useState(false)
  const [baselineStatus, setBaselineStatus] = useState(null)

  const checkBaseline = async () => {
    try {
      const result = await client.get("/api/baseline/verify")
      setBaselineStatus(result)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    checkBaseline()
    const interval = setInterval(checkBaseline, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleReconcile = async () => {
    setReconciling(true)
    try {
      await client.post("/api/reconcile")
      checkBaseline()
    } catch (err) {
      console.error(err)
    } finally {
      setReconciling(false)
    }
  }

  return (
    <header className="h-16 border-b border-border-default bg-bg-surface flex items-center justify-between px-8 sticky top-0 z-50">
      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Platform Integrity</span>
          <ConnectionStatus />
        </div>
        
        <div className="w-px h-8 bg-border-default" />
        
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Baseline Authority</span>
          <div className="flex items-center gap-2">
             {baselineStatus?.valid ? (
               <ShieldCheck size={12} className="text-mg-green" />
             ) : (
               <ShieldAlert size={12} className="text-mg-red" />
             )}
             <span className={clsx("text-[10px] font-mono font-bold tracking-widest", baselineStatus?.valid ? "text-mg-green" : "text-mg-red")}>
               {baselineStatus?.valid ? "CRYPTOGRAPHICALLY VERIFIED" : "TAMPER DETECTED"}
             </span>
          </div>
        </div>

        <div className="w-px h-8 bg-border-default" />

        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Policy Version</span>
          <span className="text-xs font-mono text-text-primary">v1.0.4-SIGNED</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={handleReconcile}
          disabled={reconciling}
          className="mg-btn-primary flex items-center gap-2 relative overflow-hidden group"
        >
          {reconciling ? <RotateCcw size={16} className="animate-spin" /> : <Play size={16} />}
          <span className="text-xs">Run Global Reconciliation</span>
          {reconciling && (
            <div className="absolute inset-0 bg-white/10 animate-mg-sweep" />
          )}
        </button>
      </div>
    </header>
  )
}
