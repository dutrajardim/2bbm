import Dexie, { type Table } from "dexie";
import type { VehicleIntake, VehicleMaintenance } from "../features/vehicles/types";

export class AppDatabase extends Dexie {
  vehicleIntakes!: Table<VehicleIntake, number>;
  vehicleMaintenances!: Table<VehicleMaintenance, number>;

  constructor() {
    super("AppDatabase");
    this.version(2).stores({
      vehicleIntakes: "id, datetime, plateNumber, [plateNumber+datetime]",
      vehicleMaintenances: "id, datetime, plateNumber, [plateNumber+datetime]"
    })
  }
}

export const db = new AppDatabase();