import type { ReactNode } from "react"
import { useVehicleIntakesSync } from "../hooks/useVehicleIntakesSync"
import { useVehicleMaintenancesSync } from "../hooks/useVehicleMaintenanceSync"
import { SyncContext } from "./SyncContext"

/**
 * Runs vehicle synchronization hooks and provides the sync boundary.
 *
 * @param props.children - Route content that depends on synchronized vehicles.
 * @returns A provider wrapping the synchronized route subtree.
 */
export const SyncProvider = ({ children }: { children: ReactNode }) => {
  useVehicleIntakesSync()
  useVehicleMaintenancesSync()

  return (
    <SyncContext.Provider value={{}}>
      {children}
    </SyncContext.Provider>
  )
}
