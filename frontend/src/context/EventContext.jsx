import React, { createContext, useContext, useState, useEffect } from "react"
import { useWebSocket } from "../hooks/useWebSocket"
import { client } from "../api/client"

const EventContext = createContext(null)

export function EventProvider({ children }) {
  const [nodeStatuses, setNodeStatuses] = useState({})
  const [stats, setStats] = useState(null)
  const [nodes, setNodes] = useState([])

  const refreshNodes = async () => {
    try {
      const result = await client.get("/api/nodes")
      // API returns a plain array directly
      const nodesList = Array.isArray(result) ? result : (result.nodes || [])
      setNodes(nodesList)

      const statusMap = {}
      nodesList.forEach(node => {
        statusMap[node.id] = node.status
      })
      setNodeStatuses(statusMap)
    } catch (err) {
      console.error("Failed to refresh nodes", err)
    }
  }

  const refreshStats = async () => {
    try {
      const result = await client.get("/api/stats")
      setStats(result)
    } catch (err) {
      console.error("Failed to refresh stats", err)
    }
  }

  const { isConnected, lastEvent, events } = useWebSocket((msg) => {
    // Refresh on any meaningful event type from the engine
    const refreshTriggers = [
      "drift", "reconcile", "resolve", "alert",
      "drift_detected", "auto_remediate", "escalate_alert",
      "flag_for_review", "attack_injected", "manual_reconcile",
      "snapshot_round", "consensus_round"
    ]
    if (refreshTriggers.includes(msg.type)) {
      refreshStats()
      refreshNodes()
    }
    if (msg.node_id && msg.type === "drift_detected") {
      setNodeStatuses(prev => ({ ...prev, [msg.node_id]: "drifted" }))
    }
    if (msg.node_id && msg.type === "auto_remediate") {
      setNodeStatuses(prev => ({ ...prev, [msg.node_id]: "compliant" }))
    }
  })

  useEffect(() => {
    refreshStats()
    refreshNodes()
  }, [])

  return (
    <EventContext.Provider value={{ isConnected, lastEvent, events, nodeStatuses, nodes, stats, refreshStats, refreshNodes }}>
      {children}
    </EventContext.Provider>
  )
}

export const useEvents = () => useContext(EventContext)
