import { createContext, useContext } from "react"
import { useVehicleIntakesSync } from "../hooks/useVehicleIntakesSync"
import { useVehicleMaintenancesSync } from "../hooks/useVehicleMaintenanceSync"

const SyncContext = createContext({})

export const useSync = () => useContext(SyncContext)

export const SyncProvider = ({ children }: { children: React.ReactNode }) => {
  useVehicleIntakesSync()
  useVehicleMaintenancesSync()

  return (
    <SyncContext.Provider value={{}}>
      {children}
    </SyncContext.Provider>
  )
}