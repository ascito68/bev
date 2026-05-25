import { useState } from 'react'
import { X, Fuel, Zap } from 'lucide-react'
import type { Trip, VehicleType } from '../types'
import { todayISO } from '../utils'

interface Props {
  onAdd: (trip: Omit<Trip, 'id'>) => void
  onClose: () => void
}

export default function QuickLogModal({ onAdd, onClose }: Props) {
  const [km, setKm] = useState('')
  const [date, setDate] = useState(todayISO())
  const [vehicleType, setVehicleType] = useState<VehicleType>('electric')

  const handleSubmit = () => {
    const kmVal = parseFloat(km)
    if (!kmVal || kmVal <= 0) return
    onAdd({ date, km: kmVal, vehicleType })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Aggiungi Viaggio</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Km percorsi</label>
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
              <input
                type="number"
                min="0"
                step="0.1"
                placeholder="0"
                value={km}
                onChange={(e) => setKm(e.target.value)}
                className="flex-1 px-4 py-3 text-sm text-gray-800 outline-none"
                autoFocus
              />
              <span className="pr-4 text-sm text-gray-400 font-medium">km</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Tipo di veicolo</label>
            <div className="grid grid-cols-2 gap-3">
              <VehicleToggle
                type="thermal"
                selected={vehicleType === 'thermal'}
                onClick={() => setVehicleType('thermal')}
              />
              <VehicleToggle
                type="electric"
                selected={vehicleType === 'electric'}
                onClick={() => setVehicleType('electric')}
              />
            </div>
          </div>
        </div>

        <div className="p-6 pt-0">
          <button
            onClick={handleSubmit}
            disabled={!km || parseFloat(km) <= 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Salva viaggio
          </button>
        </div>
      </div>
    </div>
  )
}

function VehicleToggle({ type, selected, onClick }: {
  type: VehicleType; selected: boolean; onClick: () => void
}) {
  const isElectric = type === 'electric'
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
        selected
          ? isElectric
            ? 'border-blue-500 bg-blue-50 text-blue-700'
            : 'border-orange-500 bg-orange-50 text-orange-700'
          : 'border-gray-200 text-gray-400 hover:border-gray-300'
      }`}
    >
      {isElectric ? <Zap className="w-6 h-6" /> : <Fuel className="w-6 h-6" />}
      <span className="text-xs font-semibold">{isElectric ? 'Elettrica' : 'Termica'}</span>
    </button>
  )
}
