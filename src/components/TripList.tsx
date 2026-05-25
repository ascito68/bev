import { Fuel, Zap, Trash2 } from 'lucide-react'
import type { Trip } from '../types'
import type { Config } from '../types'
import { enrichTrip, formatDate, formatEur } from '../utils'

interface Props {
  trips: Trip[]
  config: Config
  onDelete: (id: string) => void
}

export default function TripList({ trips, config, onDelete }: Props) {
  const sorted = [...trips].sort((a, b) => b.date.localeCompare(a.date))

  if (sorted.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400">
        <div className="text-4xl mb-3">🚗</div>
        <p className="text-sm">Nessun viaggio registrato.<br />Premi + per aggiungerne uno!</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {sorted.map((trip) => {
        const { thermalCost, electricCost, saving } = enrichTrip(trip, config)
        const isElectric = trip.vehicleType === 'electric'
        return (
          <div key={trip.id} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className={`p-2 rounded-xl ${isElectric ? 'bg-blue-50' : 'bg-orange-50'}`}>
              {isElectric
                ? <Zap className="w-4 h-4 text-blue-500" />
                : <Fuel className="w-4 h-4 text-orange-500" />
              }
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-800">{trip.km} km</span>
                <span className="text-xs text-gray-400">{formatDate(trip.date)}</span>
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                {isElectric
                  ? `Costo: ${formatEur(electricCost)} · Equivalente termica: ${formatEur(thermalCost)}`
                  : `Costo: ${formatEur(thermalCost)}`
                }
              </div>
            </div>

            {isElectric && (
              <div className="text-right">
                <div className="text-sm font-semibold text-green-600">+{formatEur(saving)}</div>
                <div className="text-xs text-gray-400">risparmio</div>
              </div>
            )}

            <button
              onClick={() => onDelete(trip.id)}
              className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-gray-300 hover:text-red-400"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
