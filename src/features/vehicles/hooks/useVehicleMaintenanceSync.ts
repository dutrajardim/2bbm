import { usePolling } from "../../../helpers/hooks/usePolling"

import Papa from "papaparse"
import { db } from "../../../db"
import { parseBRDateToTimestamp } from "../../../helpers"

import { v4 as uuid } from "uuid";

/**
 * URL for the published Google Sheets CSV export that contains the latest vehicle maintenance records.
 */
const VEHICLE_MAINTENANCE_URL =
  'https://docs.google.com/spreadsheets/d/1y5GyOpMPrN0tQ48FFZ32hMkjhWc-2XmD0GWlV9EUELo/export?format=csv&gid=1046510535'

/**
 * Checks whether the remote vehicle intake CSV source has changed since the last import.
 *
 * This is determined by requesting the resource headers and comparing the current
 * Content-Length with the previously saved size in localStorage.
 *
 * @returns Promise resolving to true when the source has changed or no saved size exists,
 *   otherwise false.
 */
const hasChangedBySize = async (): Promise<boolean> => {
  const res = await fetch(VEHICLE_MAINTENANCE_URL, { method: 'HEAD' })
  const size = res.headers.get('Content-Length')

  const saved = localStorage.getItem('vehicle_maintenance_size')

  if (!size) return true

  if (size !== saved) {
    localStorage.setItem('vehicle_maintenance_size', size)
    return true
  }

  return false
}

/**
 * Imports the latest vehicle maintenance records from the CSV source into the local database.
 *
 * This clears the existing `vehicleMaintenances` table before parsing and inserting each
 * valid row from the downloaded CSV. Invalid records are skipped and logged.
 */
const importVehicleMaintenancesData = async () => {
  const response = await fetch(VEHICLE_MAINTENANCE_URL)
  const csv = await response.text()

  await db.vehicleMaintenances.clear()

  Papa.parse<Record<string, string>>(csv, {
    header: true,
    delimiter: ',',
    skipEmptyLines: true,
    step: async (row) => {
      const data = row.data
      const datetime = parseBRDateToTimestamp(data['DATA_HORA'])

      await db.vehicleMaintenances.add({
        id: uuid(),
        datetime,
        type: data["TIPO"]?.trim() as "REQUISICAO_DE_REPARO" | "ATUALIZACAO_DE_REPARO" | "REPARO_COMPLETO",
        plateNumber: data["PLACA"]?.trim().toUpperCase(),
        reasonDescription: data["MOTIVO_DESCRIÇÃO"]?.trim(),
        name: data["NOME"]?.trim(),
        disabled: data["STATUS"]?.trim().toUpperCase() === 'INDISPONIVEL',
        bmNumber: data["NUMERO_BM"]?.trim()
      })

    }
  })
}

export const useVehicleMaintenancesSync = () => {
  usePolling(async () => {
    const changed = await hasChangedBySize()
    console.log(changed ? "Vehicle maintenances have changed, syncing..." : "No changes detected in vehicle maintenances.")
    if (!changed) return

    await importVehicleMaintenancesData()
  }, 5 * 60 * 1000) // A cada 5 minutos
}