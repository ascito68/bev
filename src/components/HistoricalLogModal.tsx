import { useState } from 'react'
import { X, Fuel, Zap, Plug } from 'lucide-react'
import type { Trip } from '../types'
import { todayISO } from '../utils'

interface Props {
  onAdd: (trips: Omit<Trip, 'id'>[]) => void
  onClose: () => void
}

export default function HistoricalLogModal({ onAdd, onClose }: Props) {
  const [date, setDate] = useState(todayISO())
  const [thermalKm, setThermalKm] = useState('')
  const [electricKm, setElectricKm] = useState('')
  const [phevKm, setPhevKm] = useState('')
  const [phevEvKm, setPhevEvKm] = useState('')
  const [phevHybridKm, setPhevHybridKm] = useState('')

  const thermalVal = parseFloat(thermalKm) || 0
  const electricVal = parseFloat(electricKm) || 0
  const phevVal = parseFloat(phevKm) || 0
  const phevEvVal = parseFloat(phevEvKm) || 0
  const phevHybridVal = parseFloat(phevHybridKm) || 0
  const phevSubTotal = phevEvVal + phevHybridVal

  const hasAny = thermalVal > 0 || electricVal > 0 || phevVal > 0
  const phevValid = phevVal === 0 || phevSubTotal <= phevVal

  const handleSubmit = () => {
    if (!hasAny || !phevValid) return
    const entries: Omit<Trip, 'id'>[] = []
    if (thermalVal > 0) entries.push({ date, km: thermalVal, vehicleType: 'thermal', entryType: 'historical' })
    if (electricVal > 0) entries.push({ date, km: electricVal, vehicleType: 'electric', entryType: 'historical' })
    if (phevVal > 0) entries.push({
      date, km: phevVal, vehicleType: 'phev', entryType: 'historical',
      electricKm: phevEvVal, hybridKm: phevHybridVal,
    })
    onAdd(entries)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Km storici</h2>
            <p className="text-xs text-gray-400 mt-0.5">Inserisci i km già percorsi prima del monitoraggio</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Data di riferimento</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* Thermal */}
          <Section icon={<Fuel className="w-4 h-4 text-orange-500" />} label="Auto Termica" color="text-orange-600">
            <KmInput label="Km totali percorsi" value={thermalKm} onChange={setThermalKm} />
          </Section>

          {/* Electric */}
          <Section icon={<Zap className="w-4 h-4 text-blue-500" />} label="Auto Elettrica" color="text-blue-600">
            <KmInput label="Km totali percorsi" value={electricKm} onChange={setElectricKm} />
          </Section>

          {/* PHEV */}
          <Section icon={<Plug className="w-4 h-4 text-purple-500" />} label="Plug-in Hybrid" color="text-purple-600">
            <div className="space-y-3">
              <KmInput label="Km totali percorsi" value={phevKm} onChange={setPhevKm} />
              {phevVal > 0 && (
                <>
                  <KmInput label="Di cui in modalità EV" value={phevEvKm} onChange={setPhevEvKm} accent="blue" />
                  <KmInput label="Di cui in full-hybrid" value={phevHybridKm} onChange={setPhevHybridKm} accent="purple" />
                  {phevSubTotal > phevVal && (
                    <p className="text-xs text-red-500 ml-1">La somma supera i km totali PHEV</p>
                  )}
                  {phevSubTotal <= phevVal && phevSubTotal < phevVal && (
                    <p className="text-xs text-gray-400 ml-1">Benzina pura: {(phevVal - phevSubTotal).toFixed(0)} km</p>
                  )}
                </>
              )}
            </div>
          </Section>
        </div>

        <div className="p-6 pt-0">
          <button onClick={handleSubmit} disabled={!hasAny || !phevValid}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-xl transition-colors">
            Importa km storici
          </button>
        </div>
      </div>
    </div>
  )
}

function Section({ icon, label, color, children }: {
  icon: React.ReactNode; label: string; color: string; children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <span className={`text-sm font-semibold ${color}`}>{label}</span>
      </div>
      {children}
    </div>
  )
}

function KmInput({ label, value, onChange, accent }: {
  label: string; value: string; onChange: (v: string) => void; accent?: 'blue' | 'purple'
}) {
  const borderClass = accent === 'blue'
    ? 'border-blue-200 bg-blue-50 focus-within:ring-blue-400'
    : accent === 'purple'
      ? 'border-purple-200 bg-purple-50 focus-within:ring-purple-400'
      : 'border-gray-200 focus-within:ring-blue-500'
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1.5">{label}</label>
      <div className={`flex items-center border rounded-xl overflow-hidden focus-within:ring-2 ${borderClass}`}>
        <input type="number" min="0" step="1" placeholder="0" value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-4 py-2.5 text-sm text-gray-800 outline-none bg-transparent" />
        <span className="pr-4 text-sm text-gray-400 font-medium">km</span>
      </div>
    </div>
  )
}
