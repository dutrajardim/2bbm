import { useState, useEffect, useCallback, useRef } from 'react'
import { hasChangedBySize, importVehicleIntakesData } from './useVehicleIntakesSync'

const SYNC_INTERVAL = 5 * 60 * 1000 // 5 minutes
const STORAGE_KEY = 'vehicle_intakes_last_sync_time'

/**
 * Hook to manage and track vehicle intakes synchronization status.
 *
 * Tracks when the last sync occurred, calculates time until next sync,
 * and provides a manual refresh function.
 *
 * @returns Object with sync status, time info, and refresh function
 */
export const useVehicleIntakesSyncStatus = () => {
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(() => {
    // Initialize from localStorage immediately
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? Number(saved) : null
  })
  const [lastPollingStart, setLastPollingStart] = useState<number>(() => {
    // Initialize with current time - this represents when polling started
    const saved = localStorage.getItem('vehicle_intakes_polling_start')
    return saved ? Number(saved) : Date.now()
  })
  const [timeUntilNextSync, setTimeUntilNextSync] = useState<number>(SYNC_INTERVAL)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isRefreshing = useRef(false)

  // Update countdown timer
  useEffect(() => {
    // Determine the base time from which to calculate countdown
    // Prefer lastSyncTime if exists, otherwise use lastPollingStart
    const baseTime = lastSyncTime || lastPollingStart

    const updateCountdown = () => {
      const elapsed = Date.now() - baseTime
      const remaining = Math.max(0, SYNC_INTERVAL - elapsed)
      setTimeUntilNextSync(remaining)
    }

    updateCountdown()

    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [lastSyncTime, lastPollingStart])

  // Function to refresh intakes manually
  const refreshIntakes = useCallback(async () => {
    // Prevent concurrent refreshes
    if (isRefreshing.current) return

    isRefreshing.current = true
    setIsLoading(true)
    setError(null)

    try {
      const changed = await hasChangedBySize()

      // Always register as synchronized, whether data changed or not
      const newTime = Date.now()
      setLastSyncTime(newTime)
      setLastPollingStart(newTime)
      localStorage.setItem(STORAGE_KEY, String(newTime))
      localStorage.setItem('vehicle_intakes_polling_start', String(newTime))
      setTimeUntilNextSync(SYNC_INTERVAL)

      // Only download if there's new data
      if (changed) {
        await importVehicleIntakesData()
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao verificar dados'
      setError(message)
      console.error('Failed to refresh intakes:', err)
      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000)
    } finally {
      setIsLoading(false)
      isRefreshing.current = false
    }
  }, [])

  // Record sync time whenever it happens (from the polling mechanism)
  useEffect(() => {
    const recordSync = () => {
      const newTime = Date.now()
      setLastSyncTime(newTime)
      setTimeUntilNextSync(SYNC_INTERVAL)
      setLastPollingStart(newTime)
      localStorage.setItem(STORAGE_KEY, String(newTime))
      localStorage.setItem('vehicle_intakes_polling_start', String(newTime))
      setError(null)
    }

    // Listen for sync completion (we'll dispatch a custom event from the sync hook)
    window.addEventListener('vehicle-intakes-synced', recordSync as EventListener)
    return () => window.removeEventListener('vehicle-intakes-synced', recordSync as EventListener)
  }, [])

  return {
    lastSyncTime,
    timeUntilNextSync,
    isLoading,
    error,
    refreshIntakes
  }
}
