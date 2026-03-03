import { useState, useEffect, useCallback } from "react"
import { client } from "../api/client"

export function useApi(url, options = { immediate: true }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(options.immediate)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const result = await client.get(url)
      setData(result)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [url])

  useEffect(() => {
    if (options.immediate) {
      fetch()
    }
  }, [fetch, options.immediate])

  return { data, loading, error, refetch: fetch }
}
