import Papa from "papaparse"
import { db } from "../../../db"
import { parseBRDateToTimestamp, parseVehicle } from "../../../helpers"

import { v4 as uuid } from "uuid";

const VEHICLE_INTAKES_URL =
  'https://docs.google.com/spreadsheets/d/1Cxy54jbBfgDS5w2w3TkmzUWeyVs4A0JulchBAtD54dA/export?format=csv#gid=1703470295'


/**
 * Checks if the vehicle intakes have changed by comparing their size with the saved size.
 * @returns A promise resolving to true if the size has changed, false otherwise.
 */
export const hasChangedBySize = async (): Promise<boolean> => {
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


export const importVehicleIntakesData = async () => {
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