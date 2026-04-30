import type { VehicleIntake } from "../types";

/**
 * Compares two vehicle intakes by timestamp in descending order.
 *
 * @param left - First vehicle intake to compare.
 * @param right - Second vehicle intake to compare.
 * @returns A negative number when `left` is newer than `right`.
 */
export const compareIntakesByNewestDate = (
  left: VehicleIntake,
  right: VehicleIntake,
) => right.datetime - left.datetime;

/**
 * Returns a newest-first copy of the provided intake list.
 *
 * Keeping this as a pure function avoids mutating the source array returned by
 * the intake hook and makes the page data transformation easier to test.
 *
 * @param intakes - Vehicle intakes in any order.
 * @returns A new array ordered from newest to oldest.
 */
export const sortIntakesByNewestDate = (intakes: VehicleIntake[]) =>
  intakes.toSorted(compareIntakesByNewestDate);

/**
 * Selects every intake for a vehicle plate and normalizes its display order.
 *
 * @param plate - Current route plate. Empty values produce an empty result.
 * @param getIntakesByPlate - Lookup function provided by the intake data hook.
 * @returns A newest-first list of intakes for the current vehicle.
 */
export const selectVehicleIntakes = (
  plate: string | undefined,
  getIntakesByPlate: (plate: string) => VehicleIntake[],
) => (plate ? sortIntakesByNewestDate(getIntakesByPlate(plate)) : []);
