export type VehicleType = 'thermal' | 'electric'

export interface Config {
  gasPricePerLiter: number        // €/l
  thermalConsumptionKmL: number   // km/l
  electricityPriceKwh: number     // €/kWh
  electricConsumptionKwh100: number // kWh/100km
  investmentCost: number          // € costo investimento auto elettrica
}

export interface Trip {
  id: string
  date: string       // ISO date string
  km: number
  vehicleType: VehicleType
}

export interface TripWithSavings extends Trip {
  thermalCost: number
  electricCost: number
  saving: number
}
