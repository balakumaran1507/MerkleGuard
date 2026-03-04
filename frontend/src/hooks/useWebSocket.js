import { useState, useEffect, useCallback, useRef } from "react"

const RECONNECT_DELAY = 1000
const MAX_RECONNECT_DELAY = 30000

export function useWebSocket(onMessage) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastEvent, setLastEvent] = useState(null)
  const [events, setEvents] = useState([])
  const ws = useRef(null)
  const reconnectDelay = useRef(RECONNECT_DELAY)
  const reconnectTimer = useRef(null)
  const onMessageRef = useRef(onMessage)

  useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  const connect = useCallback(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
    const host = window.location.host
    const wsUrl = `${protocol}//${host}/api/ws/events`

    ws.current = new WebSocket(wsUrl)

    ws.current.onopen = () => {
      console.log("WebSocket connected")
      setIsConnected(true)
      reconnectDelay.current = RECONNECT_DELAY
    }

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        setLastEvent(data)
        setEvents((prev) => [data, ...prev].slice(0, 100))
        if (onMessageRef.current) onMessageRef.current(data)
      } catch (err) {
        console.error("WebSocket message parse error", err)
      }
    }

    ws.current.onclose = () => {
      console.log("WebSocket disconnected")
      setIsConnected(false)
      ws.current = null

      reconnectTimer.current = setTimeout(() => {
        reconnectDelay.current = Math.min(reconnectDelay.current * 2, MAX_RECONNECT_DELAY)
        connect()
      }, reconnectDelay.current)
    }

    ws.current.onerror = (err) => {
      console.error("WebSocket error", err)
      ws.current.close()
    }
  }, [])

  useEffect(() => {
    connect()
    return () => {
      if (ws.current) {
        ws.current.close()
      }
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current)
      }
    }
  }, [connect])

  return { isConnected, lastEvent, events }
}
