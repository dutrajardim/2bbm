import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../../db"
import type { VehicleMaintenance } from "../types";
import { useMemo } from "react";

export function useVehicleMaintenanceByPlate(plate: string) {

  const maintenances = useLiveQuery<VehicleMaintenance[]>(async () => {
    return await db.vehicleMaintenances
      .where('plateNumber')
      .equals(plate)
      .toArray()
  }, [plate])

  const vehicleStatus = maintenances?.[0]?.disabled ? "Indisponível" : "Disponível"

  const sortedMaintenances = useMemo(() => {
    if (!maintenances) return [];
    return [...maintenances].sort((a, b) => b.datetime - a.datetime)
  }, [maintenances])

  const groupedByDay = useMemo(() => {
    if (!maintenances) return new Map<string, VehicleMaintenance[]>();
    return groupByDay(maintenances)
  }, [maintenances])

  return { maintenances, vehicleStatus, groupedByDay, sortedMaintenances }
}

/**
 * Groups vehicle maintenance records by calendar day.
 *
 * Each record is grouped using a date key in the format `YYYY-MM-DD`.
 * This function uses the **local timezone** to avoid issues with UTC shifts.
 *
 * @param {VehicleMaintenance[]} maintenances - Array of vehicle maintenance records
 * @returns {Map<string, VehicleMaintenance[]>} A map where:
 *   - key: date string in format `YYYY-MM-DD`
 *   - value: array of maintenances that occurred on that day
 *
 * @example
 * const grouped = groupByDay(maintenances);
 * const today = grouped.get("2026-04-03");
 *
 * @remarks
 * - Uses local date (not UTC) to ensure correct grouping by day in the user's timezone
 * - If you need UTC-based grouping, use `toISOString().slice(0, 10)` instead
 */
function groupByDay(maintenances: VehicleMaintenance[]) {
  const map = new Map<string, VehicleMaintenance[]>();

  for (const maintenance of maintenances) {
    const date = new Date(maintenance.datetime);

    const key = date.toLocaleDateString("pt-BR")

    const group = map.get(key);

    if (group) {
      group.push(maintenance);
    } else {
      map.set(key, [maintenance]);
    }
  }

  return map;
}