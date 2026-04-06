import { usePolling } from "../../../helpers/hooks/usePolling"
import { hasChangedBySize, importVehicleIntakesData } from "../services/vehicleIntakesSyncService"

export const useVehicleIntakesSync = () => {
  usePolling(async () => {
    const changed = await hasChangedBySize()
    console.log(changed ? "Vehicle intakes have changed, syncing..." : "No changes detected in vehicle intakes.")
    if (!changed) return

    await importVehicleIntakesData()
  }, 5 * 60 * 1000) // A cada 5 minutos
}