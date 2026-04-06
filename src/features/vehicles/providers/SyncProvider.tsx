import { createContext, useContext } from "react"
import { useVehicleIntakesSync } from "../hooks/useVehicleIntakesSync"

const SyncContext = createContext({})

export const useSync = () => useContext(SyncContext)

export const SyncProvider = ({ children }: { children: React.ReactNode }) => {
  useVehicleIntakesSync()

  return (
    <SyncContext.Provider value={{}}>
      {children}
    </SyncContext.Provider>
  )
}