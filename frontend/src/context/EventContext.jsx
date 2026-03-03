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
      const nodesList = result.nodes || []
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
    if (msg.type === "drift" || msg.type === "reconcile" || msg.type === "resolve" || msg.type === "alert") {
       refreshStats()
       refreshNodes()
    }
    if (msg.node && msg.type === "drift") {
      setNodeStatuses(prev => ({ ...prev, [msg.node]: "drifted" }))
    }
    if (msg.node && (msg.type === "reconcile" || msg.type === "resolve")) {
      setNodeStatuses(prev => ({ ...prev, [msg.node]: "compliant" }))
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
