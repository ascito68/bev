import { useState } from 'react'
import { Settings, X, Fuel, Zap, TrendingDown, Plug } from 'lucide-react'
import type { Config } from '../types'

interface Props {
  config: Config
  onSave: (c: Config) => void
  onClose: () => void
}

export default function SettingsPanel({ config, onSave, onClose }: Props) {
  const [form, setForm] = useState<Config>(config)

  const set = (key: keyof Config, val: string) =>
    setForm((f) => ({ ...f, [key]: parseFloat(val) || 0 }))

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">Configurazione</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Fuel className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Auto Termica</span>
            </div>
            <div className="space-y-3">
              <Field label="Costo benzina" unit="€/l" value={form.gasPricePerLiter} onChange={(v) => set('gasPricePerLiter', v)} step="0.01" />
              <Field label="Consumo" unit="km/l" value={form.thermalConsumptionKmL} onChange={(v) => set('thermalConsumptionKmL', v)} step="0.1" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Auto Elettrica</span>
            </div>
            <div className="space-y-3">
              <Field label="Costo elettricità" unit="€/kWh" value={form.electricityPriceKwh} onChange={(v) => set('electricityPriceKwh', v)} step="0.01" />
              <Field label="Consumo" unit="kWh/100km" value={form.electricConsumptionKwh100} onChange={(v) => set('electricConsumptionKwh100', v)} step="0.1" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Plug className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Plug-in Hybrid (PHEV)</span>
            </div>
            <div className="space-y-3">
              <p className="text-xs text-gray-400 -mt-1">Benzina: stessi valori del termico</p>
              <Field
                label="Efficienza elettrica"
                unit="km/kWh"
                value={form.phevElectricKmPerKwh ?? 4.4}
                onChange={(v) => set('phevElectricKmPerKwh', v)}
                step="0.1"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="w-4 h-4 text-green-500" />
              <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Investimento</span>
            </div>
            <Field label="Costo extra auto elettrica" unit="€" value={form.investmentCost} onChange={(v) => set('investmentCost', v)} step="100" />
            <p className="text-xs text-gray-400 mt-1 ml-1">Differenza di prezzo rispetto all'auto termica</p>
          </div>
        </div>

        <div className="p-6 pt-0">
          <button
            onClick={() => { onSave(form); onClose() }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Salva configurazione
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, unit, value, onChange, step }: {
  label: string; unit: string; value: number; onChange: (v: string) => void; step: string
}) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm text-gray-600 flex-1">{label}</label>
      <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
        <input
          type="number"
          min="0"
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-24 text-right bg-transparent text-sm font-medium text-gray-800 outline-none"
        />
        <span className="text-xs text-gray-400 whitespace-nowrap">{unit}</span>
      </div>
    </div>
  )
}
