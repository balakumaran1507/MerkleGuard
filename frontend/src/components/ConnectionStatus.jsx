import React from "react"
import { useEvents } from "../context/EventContext"

export function ConnectionStatus() {
  const { isConnected } = useEvents()

  return (
    <div className="flex items-center gap-1.5">
      <span
        className={isConnected ? "animate-mg-pulse" : ""}
        style={{
          display: "block",
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: isConnected ? "var(--color-status-ok)" : "var(--color-status-crit)",
          boxShadow: isConnected ? "0 0 6px var(--color-status-ok)" : "none",
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "0.06em",
          color: isConnected ? "var(--color-status-ok)" : "var(--color-status-crit)",
        }}
      >
        {isConnected ? "LIVE" : "OFFLINE"}
      </span>
    </div>
  )
}
