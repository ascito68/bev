import type { Config, Trip, TripWithSavings } from './types'

export function calcThermalCost(km: number, cfg: Config): number {
  return (km / cfg.thermalConsumptionKmL) * cfg.gasPricePerLiter
}

export function calcElectricCost(km: number, cfg: Config): number {
  return (km / 100) * cfg.electricConsumptionKwh100 * cfg.electricityPriceKwh
}

export function enrichTrip(trip: Trip, cfg: Config): TripWithSavings {
  const thermalCost = calcThermalCost(trip.km, cfg)
  const electricCost = calcElectricCost(trip.km, cfg)
  return {
    ...trip,
    thermalCost,
    electricCost,
    saving: thermalCost - electricCost,
  }
}

export function totalSavings(trips: Trip[], cfg: Config): number {
  return trips
    .filter((t) => t.vehicleType === 'electric')
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
