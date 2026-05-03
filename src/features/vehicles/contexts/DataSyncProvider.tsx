import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { DataSyncContext } from './DataSyncContext'
import type { SyncStatus, SyncType } from './DataSyncContext'
import { checkIntakesSize, importVehicleIntakesData } from '../services/sync/intakesSyncService'
import { checkMaintenanceSize, importVehicleMaintenanceData } from '../services/sync/maintenancesSyncService'
import { checkVehiclesSize, importVehiclesData } from '../services/sync/vehiclesSyncService'

const SYNC_INTERVAL = 5 * 60 * 1000 // 5 minutes

interface SyncConfig {
  type: SyncType
  checkFunction: () => Promise<boolean>
  importFunction: () => Promise<void>
  storageKey: string
}

const SYNC_CONFIGS: SyncConfig[] = [
  {
    type: 'intakes',
    checkFunction: checkIntakesSize,
    importFunction: importVehicleIntakesData,
    storageKey: 'vehicle_intakes_last_sync',
  },
  {
    type: 'maintenance',
    checkFunction: checkMaintenanceSize,
    importFunction: importVehicleMaintenanceData,
    storageKey: 'vehicle_maintenance_last_sync',
  },
  {
    type: 'vehicles',
    checkFunction: checkVehiclesSize,
    importFunction: importVehiclesData,
    storageKey: 'vehicles_last_sync',
  },
]

/**
 * Provider that manages centralized data synchronization.
 *
 * Handle syncing for intakes, maintenance, and vehicles data.
 * Provides sync status to consumers and allows manual refresh.
 *
 * @param props.children - Child components that will use the sync context
 * @returns Provider component
 */
export const DataSyncProvider = ({ children }: { children: ReactNode }) => {
  const [syncStatus, setSyncStatus] = useState<Record<SyncType, SyncStatus>>({
    intakes: { lastSyncTime: null, timeUntilNextSync: SYNC_INTERVAL, isLoading: false },
    maintenance: { lastSyncTime: null, timeUntilNextSync: SYNC_INTERVAL, isLoading: false },
    vehicles: { lastSyncTime: null, timeUntilNextSync: SYNC_INTERVAL, isLoading: false },
  })

  const isRefreshing = useRef<Partial<Record<SyncType, boolean>>>({})

  // Initialize sync times from localStorage
  useEffect(() => {
    const initialized: Record<SyncType, SyncStatus> = {
      intakes: { lastSyncTime: null, timeUntilNextSync: SYNC_INTERVAL, isLoading: false },
      maintenance: { lastSyncTime: null, timeUntilNextSync: SYNC_INTERVAL, isLoading: false },
      vehicles: { lastSyncTime: null, timeUntilNextSync: SYNC_INTERVAL, isLoading: false },
    }

    SYNC_CONFIGS.forEach((config) => {
      const saved = localStorage.getItem(config.storageKey)
      if (saved) {
        initialized[config.type].lastSyncTime = Number(saved)
      }
    })

    setSyncStatus(initialized)
  }, [])

  // Update countdown timers
  useEffect(() => {
    const updateCountdowns = () => {
      setSyncStatus((prev) => {
        const updated = { ...prev }

        Object.keys(updated).forEach((typeKey) => {
          const type = typeKey as SyncType
          const status = updated[type]
          const baseTime = status.lastSyncTime || Date.now()

          const elapsed = Date.now() - baseTime
          const remaining = Math.max(0, SYNC_INTERVAL - elapsed)

          updated[type] = {
            ...status,
            timeUntilNextSync: remaining,
          }
        })

        return updated
      })
    }

    updateCountdowns()
    const interval = setInterval(updateCountdowns, 1000)
    return () => clearInterval(interval)
  }, [])

  // Perform sync for a specific type
  const performSync = useCallback(async (config: SyncConfig) => {
    if (isRefreshing.current[config.type]) return

    isRefreshing.current[config.type] = true
    setSyncStatus((prev) => ({
      ...prev,
      [config.type]: {
        ...prev[config.type],
        isLoading: true,
      },
    }))

    try {
      const changed = await config.checkFunction()

      if (changed) {
        await config.importFunction()
      }

      // Always update last sync time, whether data changed or not
      const newTime = Date.now()
      localStorage.setItem(config.storageKey, String(newTime))

      setSyncStatus((prev) => ({
        ...prev,
        [config.type]: {
          lastSyncTime: newTime,
          timeUntilNextSync: SYNC_INTERVAL,
          isLoading: false,
        },
      }))
    } catch (err) {
      console.error(`Failed to sync ${config.type}:`, err)
      setSyncStatus((prev) => ({
        ...prev,
        [config.type]: {
          ...prev[config.type],
          isLoading: false,
        },
      }))
    } finally {
      isRefreshing.current[config.type] = false
    }
  }, [])

  // Setup polling for each sync type
  useEffect(() => {
    const intervals = SYNC_CONFIGS.map((config) => {
      // Initial sync
      performSync(config)

      // Periodic sync
      return setInterval(() => performSync(config), SYNC_INTERVAL)
    })

    return () => {
      intervals.forEach((interval) => clearInterval(interval))
    }
  }, [performSync])

  // Listen for manual sync events from UI components
  useEffect(() => {
    const handleIntakesSync = () => {
      const config = SYNC_CONFIGS.find((c) => c.type === 'intakes')
      if (config) performSync(config)
    }

    const handleMaintenanceSync = () => {
      const config = SYNC_CONFIGS.find((c) => c.type === 'maintenance')
      if (config) performSync(config)
    }

    const handleVehiclesSync = () => {
      const config = SYNC_CONFIGS.find((c) => c.type === 'vehicles')
      if (config) performSync(config)
    }

    window.addEventListener('sync-intakes', handleIntakesSync as EventListener)
    window.addEventListener('sync-maintenance', handleMaintenanceSync as EventListener)
    window.addEventListener('sync-vehicles', handleVehiclesSync as EventListener)

    return () => {
      window.removeEventListener('sync-intakes', handleIntakesSync as EventListener)
      window.removeEventListener('sync-maintenance', handleMaintenanceSync as EventListener)
      window.removeEventListener('sync-vehicles', handleVehiclesSync as EventListener)
    }
  }, [performSync])

  const refreshSync = useCallback(
    async (type: SyncType) => {
      const config = SYNC_CONFIGS.find((c) => c.type === type)
      if (config) {
        await performSync(config)
      }
    },
    [performSync]
  )

  return (
    <DataSyncContext.Provider value={{ syncStatus, refreshSync }}>
      {children}
    </DataSyncContext.Provider>
  )
}
