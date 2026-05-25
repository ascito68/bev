import { useState } from 'react'
import { X, Zap, Plug } from 'lucide-react'
import type { Trip } from '../types'
import { todayISO } from '../utils'

interface Props {
  onAdd: (trip: Omit<Trip, 'id'>) => void
  onClose: () => void
}

export default function QuickLogModal({ onAdd, onClose }: Props) {
  const [date, setDate] = useState(todayISO())
  const [km, setKm] = useState('')
  const [electricKm, setElectricKm] = useState('')
  const [hybridKm, setHybridKm] = useState('')

  const kmVal = parseFloat(km) || 0
  const evVal = parseFloat(electricKm) || 0
  const hybVal = parseFloat(hybridKm) || 0
  const total = evVal + hybVal
  const gasKm = Math.max(kmVal - total, 0)
  const isValid = kmVal > 0 && total <= kmVal

  const handleSubmit = () => {
    if (!isValid) return
    onAdd({ date, km: kmVal, vehicleType: 'phev', electricKm: evVal, hybridKm: hybVal })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Plug className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-semibold text-gray-800">Aggiungi Viaggio PHEV</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Km totali percorsi</label>
            <KmField value={km} onChange={setKm} placeholder="0" autoFocus />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-blue-600 mb-1.5 flex items-center gap-1">
                <Zap className="w-3 h-3" /> Modalità EV
              </label>
              <KmField value={electricKm} onChange={setElectricKm} accent="blue" />
            </div>
            <div>
              <label className="block text-xs font-medium text-purple-600 mb-1.5 flex items-center gap-1">
                <Plug className="w-3 h-3" /> Full-hybrid
              </label>
              <KmField value={hybridKm} onChange={setHybridKm} accent="purple" />
            </div>
          </div>

          {kmVal > 0 && (
            <div className="bg-gray-50 rounded-xl p-3 grid grid-cols-3 gap-2 text-center text-xs">
              <Pill label="EV" value={evVal} color="text-blue-600" />
              <Pill label="Hybrid" value={hybVal} color="text-purple-600" />
              <Pill label="Benzina" value={gasKm} color="text-orange-600" />
            </div>
          )}

          {total > kmVal && kmVal > 0 && (
            <p className="text-xs text-red-500">La somma EV+Hybrid supera i km totali</p>
          )}
        </div>

        <div className="p-6 pt-0">
          <button onClick={handleSubmit} disabled={!isValid}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-xl transition-colors">
            Salva viaggio
          </button>
        </div>
      </div>
    </div>
  )
}

function KmField({ value, onChange, accent, placeholder = '0', autoFocus }: {
  value: string; onChange: (v: string) => void; accent?: 'blue' | 'purple'; placeholder?: string; autoFocus?: boolean
}) {
  const cls = accent === 'blue'
    ? 'border-blue-200 bg-blue-50 focus-within:ring-blue-400'
    : accent === 'purple'
      ? 'border-purple-200 bg-purple-50 focus-within:ring-purple-400'
      : 'border-gray-200 focus-within:ring-blue-500'
  return (
    <div className={`flex items-center border rounded-xl overflow-hidden focus-within:ring-2 ${cls}`}>
      <input type="number" min="0" step="0.1" placeholder={placeholder} value={value}
        onChange={(e) => onChange(e.target.value)} autoFocus={autoFocus}
        className="flex-1 px-3 py-2.5 text-sm text-gray-800 outline-none bg-transparent" />
      <span className="pr-3 text-xs text-gray-400 font-medium">km</span>
    </div>
  )
}

function Pill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className={`font-semibold ${color}`}>{value.toFixed(0)}</div>
      <div className="text-gray-400 text-xs">{label}</div>
    </div>
  )
}
