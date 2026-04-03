import Dexie, { type Table } from "dexie";
import type { VehicleIntake } from "../features/vehicles/types";

export class AppDatabase extends Dexie {
  vehicleIntakes!: Table<VehicleIntake, number>;

  constructor() {
    super("AppDatabase");
    this.version(1).stores({
      vehicleIntakes: "id, datetime, plateNumber, [plateNumber+datetime]",
    })
  }
}

export const db = new AppDatabase();