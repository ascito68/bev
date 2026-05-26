export type VehicleType = 'thermal' | 'electric' | 'phev'
export type EntryType = 'trip' | 'monthly' | 'historical'

export interface Config {
  gasPricePerLiter: number           // €/l
  thermalConsumptionKmL: number      // km/l
  electricityPriceKwh: number        // €/kWh
  electricConsumptionKmKwh: number   // km/kWh (BEV)
  phevElectricKmPerKwh: number       // km/kWh in modalità EV pura (PHEV)
  phevHybridConsumptionKmL: number   // km/l in modalità full-hybrid (PHEV)
  investmentCost: number             // € costo investimento
}

export interface Trip {
  id: string
  date: string          // ISO date; monthly → YYYY-MM-01
  km: number
  vehicleType: VehicleType
  electricKm?: number   // PHEV: km in modalità EV pura
  hybridKm?: number     // PHEV: km in modalità full-hybrid
  entryType?: EntryType // undefined = 'trip'
}

export interface TripWithSavings extends Trip {
  thermalCost: number  // costo equivalente se fosse tutto termico
  actualCost: number   // costo reale del viaggio
  saving: number       // thermalCost - actualCost
}
