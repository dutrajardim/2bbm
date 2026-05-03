import Papa from "papaparse"
import { db } from "../../../../db"

import { v4 as uuid } from "uuid";

/**
 * URL for the published Google Sheets CSV export that contains the latest vehicles records.
 */

const VEHICLES_URL =
  'https://docs.google.com/spreadsheets/d/1y5GyOpMPrN0tQ48FFZ32hMkjhWc-2XmD0GWlV9EUELo/export?format=csv&gid=0'



export const checkVehiclesSize = async (): Promise<boolean> => {
  const res = await fetch(VEHICLES_URL, { method: 'HEAD' })
  const size = res.headers.get('Content-Length')

  const saved = localStorage.getItem('vehicle_size')

  if (!size) return true

  if (size !== saved) {
    localStorage.setItem('vehicle_size', size)
    return true
  }

  return false
}

export const importVehiclesData = async () => {
  const response = await fetch(VEHICLES_URL)
  const csv = await response.text()

  await db.vehicles.clear()

  Papa.parse<Record<string, string>>(csv, {
    header: true,
    delimiter: ',',
    skipEmptyLines: true,
    step: async (row) => {
      const data = row.data

      await db.vehicles.add({
        id: uuid(),
        plateNumber: data['PLACA'],
        prefix: data['PREFIXO'],
        status: data['STATUS'] as "DISPONÍVEL" | "BAIXADA" | "DESCARGA" | "MANUTENÇÃO" | "TRANSFERIDA",
        category: data['CATEGORIA'] as "SOCORRO" | "RESGATE" | "SALVAMENTO" | "ADMINISTRATIVO" | "NÃO POSSUI",
        location: data['LOCAL ONDE A VIATURA SE ENCONTRA'],
        model: data['MARCA/MODELO'],
        cardNumber: data['NÚMERO CARTÃO']
      });
    }
  })
}
