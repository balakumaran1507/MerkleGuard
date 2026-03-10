import React, { useState, useEffect } from "react"
import { RotateCcw, PlayCircle, ShieldCheck, ShieldX, Bell } from "lucide-react"
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
      await client.post("/api/reconcile", {})
      checkBaseline()
    } catch (err) {
      console.error(err)
    } finally {
      setReconciling(false)
    }
  }

  const isOk = baselineStatus?.valid

  return (
    <header
      className="flex items-center justify-between px-6 h-14 flex-shrink-0"
      style={{
        background: "var(--color-bg-surface)",
        borderBottom: "1px solid var(--color-border-default)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Left cluster */}
      <div className="flex items-center gap-5">
        {/* Live connection */}
        <div className="flex flex-col gap-0.5">
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "9px",
              fontWeight: 600,
              color: "var(--color-text-dim)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Stream
          </span>
          <ConnectionStatus />
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 28, background: "var(--color-border-default)" }} />

        {/* Baseline authority */}
        <div className="flex flex-col gap-0.5">
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "9px",
              fontWeight: 600,
              color: "var(--color-text-dim)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Baseline
          </span>
          <div className="flex items-center gap-1.5">
            {isOk ? (
              <ShieldCheck size={12} strokeWidth={2} style={{ color: "var(--color-status-ok)" }} />
            ) : (
              <ShieldX size={12} strokeWidth={2} style={{ color: "var(--color-status-crit)" }} />
            )}
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.06em",
                color: isOk ? "var(--color-status-ok)" : "var(--color-status-crit)",
              }}
            >
              {isOk ? "VERIFIED" : "TAMPER DETECTED"}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 28, background: "var(--color-border-default)" }} />

        {/* Policy version */}
        <div className="flex flex-col gap-0.5">
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "9px",
              fontWeight: 600,
              color: "var(--color-text-dim)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Policy
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              fontWeight: 600,
              color: "var(--color-text-secondary)",
            }}
          >
            v1.0.4-signed
          </span>
        </div>
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-2">
        {/* Ghost notify placeholder */}
        <button className="mg-btn-ghost" style={{ padding: "6px" }}>
          <Bell size={14} strokeWidth={1.75} />
        </button>

        {/* Reconcile */}
        <button
          onClick={handleReconcile}
          disabled={reconciling}
          className="mg-btn-primary relative overflow-hidden"
        >
          {reconciling ? (
            <RotateCcw size={13} strokeWidth={2} className="animate-mg-spin" />
          ) : (
            <PlayCircle size={13} strokeWidth={2} />
          )}
          <span>
            {reconciling ? "Reconciling…" : "Run Reconciliation"}
          </span>
          {reconciling && (
            <div
              className="absolute inset-0 animate-mg-sweep"
              style={{ background: "rgba(255,255,255,0.08)" }}
            />
          )}
        </button>
      </div>
    </header>
  )
}
