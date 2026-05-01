import Dexie, { type Table } from "dexie";
import type { Vehicle, VehicleIntake, VehicleMaintenance } from "../features/vehicles/types";

/**
 * Configures the application's IndexedDB database using Dexie.
 *
 * Dexie requires class extension to declare typed tables and schema versions,
 * so this module intentionally keeps the class-based shape.
 */
export class AppDatabase extends Dexie {
  vehicleIntakes!: Table<VehicleIntake, number>;
  vehicleMaintenances!: Table<VehicleMaintenance, number>;
  vehicles!: Table<Vehicle, number>;

  /**
   * Initializes the local database and registers vehicle table indexes.
   */
  constructor() {
    super("AppDatabase");
    this.version(3).stores({
      vehicleIntakes: "id, datetime, plateNumber, [plateNumber+datetime]",
      vehicleMaintenances: "id, datetime, plateNumber, [plateNumber+datetime]",
      vehicles: "id, plateNumber"
    })
  }
}

export const db = new AppDatabase();
