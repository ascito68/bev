import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface Props {
  defaultGasPrice: number
  defaultElectricityPrice: number
  gasPrice: string
  electricityPrice: string
  onGasChange: (v: string) => void
  onElectricityChange: (v: string) => void
}

export default function PriceOverrides({
  defaultGasPrice, defaultElectricityPrice,
  gasPrice, electricityPrice,
  onGasChange, onElectricityChange,
}: Props) {
  const [open, setOpen] = useState(false)
  const hasOverride = gasPrice.trim() !== '' || electricityPrice.trim() !== ''

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
      >
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        Prezzi personalizzati
        {hasOverride && !open && (
          <span className="text-violet-500 font-semibold">· modificati</span>
        )}
      </button>

      {open && (
        <div className="mt-3 p-3 bg-gray-50 rounded-xl space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Benzina (€/l)</label>
              <PriceField
                value={gasPrice}
                onChange={onGasChange}
                placeholder={defaultGasPrice.toFixed(2)}
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Elettricità (€/kWh)</label>
              <PriceField
                value={electricityPrice}
                onChange={onElectricityChange}
                placeholder={defaultElectricityPrice.toFixed(3)}
                step="0.001"
              />
            </div>
          </div>
          <p className="text-xs text-gray-400">Lascia vuoto per usare il prezzo dalla configurazione</p>
        </div>
      )}
    </div>
  )
}

function PriceField({ value, onChange, placeholder, step }: {
  value: string; onChange: (v: string) => void; placeholder: string; step: string
}) {
  return (
    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-violet-400 bg-white">
      <input
        type="number"
        min="0"
        step={step}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="flex-1 px-3 py-2 text-sm text-gray-800 outline-none bg-transparent"
      />
      <span className="pr-2.5 text-xs text-gray-400">€</span>
    </div>
  )
}

export function parsePriceOverride(s: string): number | undefined {
  const v = parseFloat(s)
  return s.trim() !== '' && !isNaN(v) && v > 0 ? v : undefined
}
