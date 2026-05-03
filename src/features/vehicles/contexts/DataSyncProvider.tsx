import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { DataSyncContext } from './DataSyncContext'
import type { SyncStatus, SyncType } from './DataSyncContext'
import { checkIntakesSize, importVehicleIntakesData } from '../services/sync/intakesSyncService'
import { checkMaintenanceSize, importVehicleMaintenanceData } from '../services/sync/maintenancesSyncService'
import { checkVehiclesSize, importVehiclesData } from '../services/sync/vehiclesSyncService'

/**
 * Default polling interval used when no user-defined sync interval is stored.
 */
const DEFAULT_SYNC_INTERVAL = 5 * 60 * 1000 // 5 minutes

/**
 * Generates a localStorage key for a specific sync type interval.
 */
const syncIntervalKey = (type: string) => `2bbm_sync_interval_${type}`

interface SyncConfig {
  type: SyncType
  checkFunction: () => Promise<boolean>
  importFunction: () => Promise<void>
  storageKey: string
}

/**
 * Configuration for each sync type used by the provider.
 *
 * Defines the type, change detection function, data import function,
 * and the storage key used for last sync timestamp persistence.
 */
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
  const readSavedInterval = (type: SyncType) => {
    const savedValue = localStorage.getItem(syncIntervalKey(type))
    const parsed = Number(savedValue)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_SYNC_INTERVAL
  }

  const [syncIntervals, setSyncIntervals] = useState<Record<SyncType, number>>({
    intakes: readSavedInterval('intakes'),
    maintenance: readSavedInterval('maintenance'),
    vehicles: readSavedInterval('vehicles'),
  })

  const [syncStatus, setSyncStatus] = useState<Record<SyncType, SyncStatus>>({
    intakes: { lastSyncTime: null, timeUntilNextSync: syncIntervals.intakes, isLoading: false },
    maintenance: { lastSyncTime: null, timeUntilNextSync: syncIntervals.maintenance, isLoading: false },
    vehicles: { lastSyncTime: null, timeUntilNextSync: syncIntervals.vehicles, isLoading: false },
  })

  const isRefreshing = useRef<Partial<Record<SyncType, boolean>>>({})

  // Initialize sync times from localStorage
  useEffect(() => {
    const initialized: Record<SyncType, SyncStatus> = {
      intakes: { lastSyncTime: null, timeUntilNextSync: DEFAULT_SYNC_INTERVAL, isLoading: false },
      maintenance: { lastSyncTime: null, timeUntilNextSync: DEFAULT_SYNC_INTERVAL, isLoading: false },
      vehicles: { lastSyncTime: null, timeUntilNextSync: DEFAULT_SYNC_INTERVAL, isLoading: false },
    }

    SYNC_CONFIGS.forEach((config) => {
      const saved = localStorage.getItem(config.storageKey)
      if (saved) {
        initialized[config.type].lastSyncTime = Number(saved)
      }
    })

    setSyncStatus(initialized)
  }, [])

  // Persist sync interval and update countdown timers.
  useEffect(() => {
    Object.entries(syncIntervals).forEach(([type, interval]) => {
      localStorage.setItem(syncIntervalKey(type), String(interval))
    })
  }, [syncIntervals])

  useEffect(() => {
    const updateCountdowns = () => {
      setSyncStatus((prev) => {
        const updated = { ...prev }

        Object.keys(updated).forEach((typeKey) => {
          const type = typeKey as SyncType
          const status = updated[type]
          const baseTime = status.lastSyncTime || Date.now()
          const interval = syncIntervals[type]

          const elapsed = Date.now() - baseTime
          const remaining = Math.max(0, interval - elapsed)

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
  }, [syncIntervals])

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
          timeUntilNextSync: syncIntervals[config.type],
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
  }, [syncIntervals])

  // Setup polling for each sync type
  useEffect(() => {
    const intervals = SYNC_CONFIGS.map((config) => {
      // Initial sync
      performSync(config)

      // Periodic sync
      return setInterval(() => performSync(config), syncIntervals[config.type])
    })

    return () => {
      intervals.forEach((interval) => clearInterval(interval))
    }
  }, [performSync, syncIntervals])

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

  const setSyncInterval = useCallback((type: SyncType, interval: number) => {
    setSyncIntervals((current) => ({
      ...current,
      [type]: interval,
    }))
  }, [])

  return (
    <DataSyncContext.Provider
      value={{
        syncStatus,
        refreshSync,
        syncIntervals,
        setSyncInterval,
      }}
    >
      {children}
    </DataSyncContext.Provider>
  )
}
