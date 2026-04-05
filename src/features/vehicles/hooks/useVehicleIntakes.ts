import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../../db";
import type { VehicleIntake } from "../../vehicles/types";
import { v4 as uuid } from "uuid";
import { useMemo } from "react";

export const useVehicleIntakes = () => {

  // Fetch all intakes ordered by datetime (latest first)
  const allIntakes = useLiveQuery<VehicleIntake[]>(async () =>
    db.vehicleIntakes.orderBy("datetime").reverse().toArray(), [])

  // Groups all records by plateNumber
  const groupedByPlate = useMemo(() => {
    if (!allIntakes) return new Map<string, VehicleIntake[]>();
    return groupByPlate(allIntakes)
  }, [allIntakes])

  // Extracts the most recent record for each plate
  const vehiclesLastIntake = useMemo(() => {
    return Array.from(groupedByPlate.values())
      .map(getLatestIntake)
      .sort((a, b) => b.datetime - a.datetime);
  }, [groupedByPlate])

  // Filters vehicles that are close to oil change threshold
  const nextToOilChange = useMemo(() => {
    return Array.from(vehiclesLastIntake.values())
      .filter(intake => intake.kmToNextOilChange !== null && intake.kmToNextOilChange <= 1000)
  }, [vehiclesLastIntake])

  // Keeps only vehicles whose last intake contains a description (issue)
  const latestVehicleIssues = useMemo(() => {
    return Array.from(vehiclesLastIntake.values())
      .filter(v => v.description !== null)
  }, [vehiclesLastIntake])

  // Groups all intakes by calendar day (local timezone)
  const groupedByDay = useMemo(() => {
    if (!allIntakes) return new Map<string, VehicleIntake[]>();
    return groupByDay(allIntakes)
  }, [allIntakes])

  const last7DaysIntakesCount = useMemo(() => {
    const result: { date: string, count: number }[] = [];

    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(today.getDate() - i)
      const key = d.toISOString().slice(0, 10);

      result.push({
        date: key,
        count: groupedByDay.get(key)?.length ?? 0
      })
    }

    return result;
  }, [groupedByDay])

  const addVehicleIntake = async (vehicleIntake: Omit<VehicleIntake, 'id'>) => {
    await db.vehicleIntakes.add({ ...vehicleIntake, id: uuid() });
  }

  const clearVehicleIntakes = async () => {
    await db.vehicleIntakes.clear();
  }

  const getIntakesByPlate = (plate: string): VehicleIntake[] => {
    return groupedByPlate.get(plate) ?? []
  } 

  return {
    intakesCount: allIntakes?.length ?? 0,
    nextToOilChange: nextToOilChange ?? [],
    latestVehicleIssues: latestVehicleIssues ?? [],
    vehiclesLastIntake: vehiclesLastIntake ?? [],
    last7DaysIntakesCount: last7DaysIntakesCount ?? [],
    addVehicleIntake,
    clearVehicleIntakes,
    getIntakesByPlate
  };
}


/**
 * Groups vehicle intake records by plate number.
 *
 * Creates a Map where each key is a vehicle plate number and
 * the value is an array of all intake records associated with that plate.
 *
 * @param {VehicleIntake[]} intakes - List of vehicle intake records
 * @returns {Map<string, VehicleIntake[]>} A map of plateNumber → intake list
 *
 * @example
 * const grouped = groupByPlate(intakes);
 * const vehicleIntakes = grouped.get("ABC1234");
 */
function groupByPlate(intakes: VehicleIntake[]): Map<string, VehicleIntake[]> {
  const map = new Map<string, VehicleIntake[]>()

  for (const intake of intakes) {
    if (intake.plateNumber) {
      if (!map.has(intake.plateNumber)) map.set(intake.plateNumber, [])

      map.get(intake.plateNumber)!.push(intake)
    }
  }

  return map;
}

/**
 * Returns the most recent vehicle intake from a list.
 *
 * Compares intake records based on the `datetime` field and
 * returns the one with the highest (most recent) value.
 *
 * @param {VehicleIntake[]} intakes - Array of intake records (must not be empty)
 * @returns {VehicleIntake} The latest intake record
 *
 * @example
 * const latest = getLatestIntake(intakes);
 * console.log(latest.datetime);
 */
function getLatestIntake(intakes: VehicleIntake[]): VehicleIntake {
  return intakes.reduce((latest, current) => current.datetime > latest.datetime ? current : latest)
}


/**
 * Groups vehicle intake records by calendar day.
 *
 * Each record is grouped using a date key in the format `YYYY-MM-DD`.
 * This function uses the **local timezone** to avoid issues with UTC shifts.
 *
 * @param {VehicleIntake[]} intakes - Array of vehicle intake records
 * @returns {Map<string, VehicleIntake[]>} A map where:
 *   - key: date string in format `YYYY-MM-DD`
 *   - value: array of intakes that occurred on that day
 *
 * @example
 * const grouped = groupByDay(intakes);
 * const today = grouped.get("2026-04-03");
 *
 * @remarks
 * - Uses local date (not UTC) to ensure correct grouping by day in the user's timezone
 * - If you need UTC-based grouping, use `toISOString().slice(0, 10)` instead
 */
function groupByDay(intakes: VehicleIntake[]) {
  const map = new Map<string, VehicleIntake[]>();

  for (const intake of intakes) {
    const date = new Date(intake.datetime);

    const key = date.toISOString().slice(0, 10); // "2026-04-03"

    const group = map.get(key);

    if (group) {
      group.push(intake);
    } else {
      map.set(key, [intake]);
    }
  }

  return map;
}