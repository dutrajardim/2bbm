export interface VehicleIntake {
  id: string
  datetime: number
  receivingUnit: string | null
  plateNumber: string | null
  prefix: string | null
  odometer: number | null
  photos: string | null
  description: string | null
  kmToNextOilChange: number | null
}

export interface VehicleMaintenance {
  id: string
  datetime: number
  type: "REQUISICAO_DE_REPARO" | "ATUALIZACAO_DE_REPARO" | "REPARO_COMPLETO"
  plateNumber: string
  reasonDescription: string
  name: string
  disabled: boolean
  bmNumber: string
}