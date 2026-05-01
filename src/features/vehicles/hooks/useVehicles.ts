import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../../db";
import type { Vehicle } from "../types";
import { useMemo } from "react";

/**
 * Custom hook for managing vehicle data.
 * Provides access to all vehicles and computed utilities.
 *
 * @returns {Object} An object containing:
 *   - vehicles: Array of all vehicles
 *   - vehiclesByLocation: Map of vehicles grouped by location
 *   - vehiclesByPlate: Map of vehicles indexed by plate number
 *   - getVehicleByPlate: Function to get a vehicle by plate number
 *   - locations: Array of all unique locations
 */
export const useVehicles = () => {
  // Fetch all vehicles
  const vehicles = useLiveQuery<Vehicle[]>(async () =>
    db.vehicles.toArray(), []
  )

  // Groups vehicles by location
  const vehiclesByLocation = useMemo(() => {
    if (!vehicles) return new Map<string, Vehicle[]>();

    const map = new Map<string, Vehicle[]>();
    vehicles.forEach(vehicle => {
      const location = vehicle.location || "Desconhecido";
      if (!map.has(location)) {
        map.set(location, []);
      }
      map.get(location)!.push(vehicle);
    });
    return map;
  }, [vehicles])

  // Creates a map of vehicles indexed by plate for quick lookup
  const vehiclesByPlate = useMemo(() => {
    if (!vehicles) return new Map<string, Vehicle>();

    const map = new Map<string, Vehicle>();
    vehicles.forEach(vehicle => {
      map.set(vehicle.plateNumber, vehicle);
    });
    return map;
  }, [vehicles])

  // Extracts all unique locations
  const locations = useMemo(() => {
    return Array.from(vehiclesByLocation.keys()).sort();
  }, [vehiclesByLocation])

  /**
   * Retrieves a single vehicle by plate number.
   *
   * @param plate - Plate number to search for.
   * @returns Vehicle object or undefined if not found.
   */
  const getVehicleByPlate = (plate: string): Vehicle | undefined => {
    return vehiclesByPlate.get(plate);
  };

  return {
    vehicles: vehicles ?? [],
    vehiclesByLocation,
    vehiclesByPlate,
    getVehicleByPlate,
    locations,
  };
};
