import { Plug, Trash2, Zap, Fuel, Pencil } from 'lucide-react'
import type { Trip, Config } from '../types'
import { enrichTrip, formatEntryLabel, formatEur } from '../utils'

interface Props {
  trips: Trip[]
  config: Config
  onDelete: (id: string) => void
  onEdit: (trip: Trip) => void
}

export default function TripList({ trips, config, onDelete, onEdit }: Props) {
  const sorted = [...trips].sort((a, b) => b.date.localeCompare(a.date))

  if (sorted.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400">
        <div className="text-4xl mb-3">🔌</div>
        <p className="text-sm">Nessun dato registrato.<br />Premi + per aggiungerne uno!</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {sorted.map((trip) => {
        const { thermalCost, actualCost, saving } = enrichTrip(trip, config)
        const evKm = trip.electricKm ?? 0
        const hybKm = trip.hybridKm ?? 0
        const gasKm = Math.max(trip.km - evKm - hybKm, 0)

        return (
          <div key={trip.id} className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-50 rounded-xl shrink-0">
                <Plug className="w-4 h-4 text-purple-500" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-gray-800">{trip.km} km</span>
                  <span className="text-xs text-gray-400">{formatEntryLabel(trip)}</span>
                  {trip.entryType === 'monthly' && (
                    <span className="text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full font-medium">Mensile</span>
                  )}
                  {trip.entryType === 'historical' && (
                    <span className="text-xs bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full font-medium">Storico</span>
                  )}
                </div>

                {/* Mode breakdown */}
                <div className="flex items-center gap-3 mt-1.5">
                  {evKm > 0 && (
                    <span className="flex items-center gap-1 text-xs text-blue-600">
                      <Zap className="w-3 h-3" />{evKm} km EV
                    </span>
                  )}
                  {hybKm > 0 && (
                    <span className="flex items-center gap-1 text-xs text-purple-600">
                      <Plug className="w-3 h-3" />{hybKm} km hybrid
                    </span>
                  )}
                  {gasKm > 0 && (
                    <span className="flex items-center gap-1 text-xs text-orange-600">
                      <Fuel className="w-3 h-3" />{gasKm.toFixed(0)} km benz.
                    </span>
                  )}
                </div>

                {/* Cost row */}
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                  <span>PHEV: <span className="text-purple-600 font-medium">{formatEur(actualCost)}</span></span>
                  <span>vs termica: <span className="text-orange-500">{formatEur(thermalCost)}</span></span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-sm font-semibold text-green-600">+{formatEur(saving)}</div>
                <div className="text-xs text-gray-400">risparmio</div>
              </div>
            </div>

            <button onClick={() => onDelete(trip.id)}
              className="absolute right-3 bottom-3 p-1.5 hover:bg-red-50 rounded-lg transition-colors text-gray-200 hover:text-red-400 hidden" />

            <div className="flex justify-end gap-1 mt-2">
              <button onClick={() => onEdit(trip)}
                className="p-1.5 hover:bg-purple-50 rounded-lg transition-colors text-gray-300 hover:text-purple-500">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => onDelete(trip.id)}
                className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-gray-300 hover:text-red-400">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
