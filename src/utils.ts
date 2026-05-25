import type { Config, Trip, TripWithSavings } from './types'

export function calcThermalCost(km: number, cfg: Config): number {
  return (km / cfg.thermalConsumptionKmL) * cfg.gasPricePerLiter
}

export function calcElectricCost(km: number, cfg: Config): number {
  return (km / 100) * cfg.electricConsumptionKwh100 * cfg.electricityPriceKwh
}

export function calcPhevCost(trip: Trip, cfg: Config): number {
  const electricKm = trip.electricKm ?? 0
  const gasKm = trip.km - electricKm
  const gasCost = (gasKm / cfg.thermalConsumptionKmL) * cfg.gasPricePerLiter
  const elCost = (electricKm / (cfg.phevElectricKmPerKwh ?? 4.4)) * cfg.electricityPriceKwh
  return gasCost + elCost
}

export function enrichTrip(trip: Trip, cfg: Config): TripWithSavings {
  const thermalCost = calcThermalCost(trip.km, cfg)
  let actualCost: number
  if (trip.vehicleType === 'electric') {
    actualCost = calcElectricCost(trip.km, cfg)
  } else if (trip.vehicleType === 'phev') {
    actualCost = calcPhevCost(trip, cfg)
  } else {
    actualCost = thermalCost
  }
  return { ...trip, thermalCost, actualCost, saving: thermalCost - actualCost }
}

export function totalSavings(trips: Trip[], cfg: Config): number {
  return trips
    .filter((t) => t.vehicleType !== 'thermal')
    .reduce((acc, t) => acc + enrichTrip(t, cfg).saving, 0)
}

export function formatEur(value: number): string {
  return value.toLocaleString('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 })
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}
