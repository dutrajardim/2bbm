import { usePolling } from "../../../helpers/hooks/usePolling"

import Papa from "papaparse"
import { db } from "../../../db"
import { parseBRDateToTimestamp, parseVehicle } from "../../../helpers"

import { v4 as uuid } from "uuid";

/**
 * URL for the published Google Sheets CSV export that contains the latest vehicle intake records.
 */
const VEHICLE_INTAKES_URL =
  'https://docs.google.com/spreadsheets/d/1Cxy54jbBfgDS5w2w3TkmzUWeyVs4A0JulchBAtD54dA/export?format=csv&gid=1703470295'

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
  const res = await fetch(VEHICLE_INTAKES_URL, { method: 'HEAD' })
  const size = res.headers.get('Content-Length')

  const saved = localStorage.getItem('vehicle_intakes_size')

  if (!size) return true

  if (size !== saved) {
    localStorage.setItem('vehicle_intakes_size', size)
    return true
  }

  return false
}

/**
 * Imports the latest vehicle intake records from the CSV source into the local database.
 *
 * This clears the existing `vehicleIntakes` table before parsing and inserting each
 * valid row from the downloaded CSV. Invalid records are skipped and logged.
 */
const importVehicleIntakesData = async () => {
  const response = await fetch(VEHICLE_INTAKES_URL)
  const csv = await response.text()

  await db.vehicleIntakes.clear()

  Papa.parse<Record<string, string>>(csv, {
    header: true,
    delimiter: ',',
    skipEmptyLines: true,
    transformHeader: (header, index) => `${header.normalize("NFD").replace(/[^\w\s]/g, "").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_").toLowerCase()}_${index}`,
    step: async (row) => {
      const data = row.data

      const datetime = parseBRDateToTimestamp(data.carimbo_de_datahora_0_0)
      const vehicle = parseVehicle(data.marque_a_viatura_7_7)

      const photos: string | null = data.insira_as_4_fotos_do_veiculo_conforme_exemplo_abaixo_107_107?.trim() || null

      if (vehicle?.plate && !/^(ABT|ABTS|TLP|REF|ASL|ASM|ASF|APF|UR|AJ|AMA)/.test(vehicle?.plate))
        await db.vehicleIntakes.add({
          id: uuid(),
          datetime,
          receivingUnit: data.qual_a_sua_unidade_3_3?.trim() || null,
          prefix: vehicle?.prefix || null,
          plateNumber: vehicle?.plate || null,
          odometer: /^\d+$/.test(data.insira_o_hodometro_atual_100_100)
            ? Number(data.insira_o_hodometro_atual_100_100)
            : null,
          kmToNextOilChange: /^\d+$/.test(
            data.quantos_quilometros_faltam_para_proxima_troca_de_oleo_9_9
          )
            ? Number(data.quantos_quilometros_faltam_para_proxima_troca_de_oleo_9_9)
            : null,
          description: data.descricao_de_itens_opcional_67_67?.trim() || null,
          photos
        })
      else console.warn(`Skipping invalid vehicle intake record with plate: ${vehicle?.plate} and prefix: ${vehicle?.prefix} (vehicle: ${data.marque_a_viatura_7_7})`)

    }
  })
}


export const useVehicleIntakesSync = () => {
  usePolling(async () => {
    const changed = await hasChangedBySize()
    console.log(changed ? "Vehicle intakes have changed, syncing..." : "No changes detected in vehicle intakes.")
    if (!changed) return

    await importVehicleIntakesData()
  }, 5 * 60 * 1000) // A cada 5 minutos
}