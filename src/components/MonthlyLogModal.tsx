import { useState } from 'react'
import { X, Fuel, Zap, Plug } from 'lucide-react'
import type { Trip, VehicleType } from '../types'

interface Props {
  onAdd: (trips: Omit<Trip, 'id'>[]) => void
  onClose: () => void
}

export default function MonthlyLogModal({ onAdd, onClose }: Props) {
  const now = new Date()
  const [monthYear, setMonthYear] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  )
  const [vehicleType, setVehicleType] = useState<VehicleType>('electric')
  const [km, setKm] = useState('')
  const [electricKm, setElectricKm] = useState('')
  const [hybridKm, setHybridKm] = useState('')

  const kmVal = parseFloat(km) || 0
  const electricKmVal = parseFloat(electricKm) || 0
  const hybridKmVal = parseFloat(hybridKm) || 0
  const isPhev = vehicleType === 'phev'
  const phevTotal = electricKmVal + hybridKmVal
  const isValid = kmVal > 0 && (!isPhev || phevTotal <= kmVal)

  const handleSubmit = () => {
    if (!isValid) return
    const date = `${monthYear}-01`
    onAdd([{
      date,
      km: kmVal,
      vehicleType,
      entryType: 'monthly',
      ...(isPhev ? { electricKm: electricKmVal, hybridKm: hybridKmVal } : {}),
    }])
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Dati mensili</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mese di riferimento</label>
            <input
              type="month"
              value={monthYear}
              onChange={(e) => setMonthYear(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Tipo di veicolo</label>
            <div className="grid grid-cols-3 gap-2">
              {(['thermal', 'electric', 'phev'] as VehicleType[]).map((t) => (
                <VehicleBtn key={t} type={t} selected={vehicleType === t} onClick={() => setVehicleType(t)} />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Km totali nel mese</label>
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
              <input
                type="number" min="0" step="1" placeholder="0" value={km}
                onChange={(e) => setKm(e.target.value)}
                className="flex-1 px-4 py-3 text-sm text-gray-800 outline-none"
                autoFocus
              />
              <span className="pr-4 text-sm text-gray-400 font-medium">km</span>
            </div>
          </div>

          {isPhev && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Di cui in modalità EV</label>
                <div className="flex items-center border border-blue-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-400 bg-blue-50">
                  <input type="number" min="0" step="1" placeholder="0" value={electricKm}
                    onChange={(e) => setElectricKm(e.target.value)}
                    className="flex-1 px-4 py-3 text-sm text-gray-800 outline-none bg-transparent" />
                  <span className="pr-4 text-sm text-blue-400 font-medium">km</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Di cui in full-hybrid</label>
                <div className="flex items-center border border-purple-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-purple-400 bg-purple-50">
                  <input type="number" min="0" step="1" placeholder="0" value={hybridKm}
                    onChange={(e) => setHybridKm(e.target.value)}
                    className="flex-1 px-4 py-3 text-sm text-gray-800 outline-none bg-transparent" />
                  <span className="pr-4 text-sm text-purple-400 font-medium">km</span>
                </div>
              </div>
              {kmVal > 0 && phevTotal > kmVal && (
                <p className="text-xs text-red-500 ml-1">La somma supera i km totali del mese</p>
              )}
              {kmVal > 0 && phevTotal < kmVal && (
                <p className="text-xs text-gray-400 ml-1">Benzina pura: {(kmVal - phevTotal).toFixed(0)} km</p>
              )}
            </div>
          )}
        </div>

        <div className="p-6 pt-0">
          <button onClick={handleSubmit} disabled={!isValid}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-xl transition-colors">
            Salva dati mensili
          </button>
        </div>
      </div>
    </div>
  )
}

function VehicleBtn({ type, selected, onClick }: { type: VehicleType; selected: boolean; onClick: () => void }) {
  const cfg = {
    thermal: { active: 'border-orange-500 bg-orange-50 text-orange-700', icon: <Fuel className="w-5 h-5" />, label: 'Termica' },
    electric: { active: 'border-blue-500 bg-blue-50 text-blue-700', icon: <Zap className="w-5 h-5" />, label: 'Elettrica' },
    phev: { active: 'border-purple-500 bg-purple-50 text-purple-700', icon: <Plug className="w-5 h-5" />, label: 'Plug-in' },
  }[type]
  return (
    <button onClick={onClick}
      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${selected ? cfg.active : 'border-gray-200 text-gray-400 hover:border-gray-300'}`}>
      {cfg.icon}
      <span className="text-xs font-semibold">{cfg.label}</span>
    </button>
  )
}
