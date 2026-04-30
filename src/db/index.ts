import Dexie, { type Table } from "dexie";
import type { VehicleIntake, VehicleMaintenance } from "../features/vehicles/types";

/**
 * Configures the application's IndexedDB database using Dexie.
 *
 * Dexie requires class extension to declare typed tables and schema versions,
 * so this module intentionally keeps the class-based shape.
 */
export class AppDatabase extends Dexie {
  vehicleIntakes!: Table<VehicleIntake, number>;
  vehicleMaintenances!: Table<VehicleMaintenance, number>;

  /**
   * Initializes the local database and registers vehicle table indexes.
   */
  constructor() {
    super("AppDatabase");
    this.version(2).stores({
      vehicleIntakes: "id, datetime, plateNumber, [plateNumber+datetime]",
      vehicleMaintenances: "id, datetime, plateNumber, [plateNumber+datetime]"
    })
  }
}

export const db = new AppDatabase();
