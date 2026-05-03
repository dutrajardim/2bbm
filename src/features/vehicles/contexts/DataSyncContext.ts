import { createContext, useContext } from 'react'

export type SyncType = 'intakes' | 'maintenance' | 'vehicles'

export interface SyncStatus {
  lastSyncTime: number | null
  timeUntilNextSync: number
  isLoading: boolean
}

export interface DataSyncContextValue {
  syncStatus: Record<SyncType, SyncStatus>
  refreshSync: (type: SyncType) => Promise<void>
}

/**
 * Context for managing data synchronization across the application.
 *
 * Provides a centralized way to track sync status for intakes, maintenance, and vehicles.
 */
export const DataSyncContext = createContext<DataSyncContextValue | undefined>(undefined)

/**
 * Hook to access data sync status and refresh functions.
 *
 * @param type - The type of data to sync (intakes, maintenance, vehicles)
 * @returns Sync status and refresh function
 */
export const useSyncStatus = (type: SyncType) => {
  const context = useContext(DataSyncContext)

  if (!context) {
    throw new Error(`useSyncStatus must be used within DataSyncProvider`)
  }

  return {
    ...context.syncStatus[type],
    refreshSync: () => context.refreshSync(type),
  }
}
