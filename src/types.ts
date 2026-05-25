export type VehicleType = 'thermal' | 'electric' | 'phev'

export interface Config {
  gasPricePerLiter: number          // €/l
  thermalConsumptionKmL: number     // km/l
  electricityPriceKwh: number       // €/kWh
  electricConsumptionKwh100: number // kWh/100km
  phevElectricKmPerKwh: number      // km/kWh in modalità elettrica PHEV
  investmentCost: number            // € costo investimento
}

export interface Trip {
  id: string
  date: string
  km: number
  vehicleType: VehicleType
  electricKm?: number  // solo per PHEV: km percorsi in modalità elettrica
}

export interface TripWithSavings extends Trip {
  thermalCost: number  // costo equivalente se fosse tutto termico
  actualCost: number   // costo reale del viaggio
  saving: number       // thermalCost - actualCost
}
