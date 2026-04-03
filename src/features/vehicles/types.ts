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