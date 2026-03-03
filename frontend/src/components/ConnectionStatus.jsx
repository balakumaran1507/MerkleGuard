import React from "react"
import { useEvents } from "../context/EventContext"
import { clsx } from "clsx"

export function ConnectionStatus() {
  const { isConnected } = useEvents()

  return (
    <div className="flex items-center gap-2">
      <div className={clsx("w-1.5 h-1.5 rounded-full", isConnected ? "bg-mg-green shadow-sm shadow-mg-green/50 animate-mg-pulse" : "bg-mg-red")} />
      <span className={clsx("text-[10px] font-mono font-bold tracking-widest", isConnected ? "text-mg-green" : "text-mg-red")}>
        {isConnected ? "LIVE" : "DISCONNECTED"}
      </span>
    </div>
  )
}
