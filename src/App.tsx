import { useState } from 'react'
import { Plus, Settings, Fuel, Zap, TrendingDown } from 'lucide-react'
import { useLocalStorage } from './hooks/useLocalStorage'
import type { Config, Trip } from './types'
import { totalSavings, calcThermalCost, formatEur } from './utils'
import ConsumptionChart from './components/ConsumptionChart'
import BreakevenBar from './components/BreakevenBar'
import QuickLogModal from './components/QuickLogModal'
import SettingsPanel from './components/SettingsPanel'
import TripList from './components/TripList'

const DEFAULT_CONFIG: Config = {
  gasPricePerLiter: 1.85,
  thermalConsumptionKmL: 15,
  electricityPriceKwh: 0.22,
  electricConsumptionKwh100: 18,
  investmentCost: 8000,
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

type Tab = 'dashboard' | 'trips'

export default function App() {
  const [config, setConfig] = useLocalStorage<Config>('bev-config', DEFAULT_CONFIG)
  const [trips, setTrips] = useLocalStorage<Trip[]>('bev-trips', [])
  const [showLog, setShowLog] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [tab, setTab] = useState<Tab>('dashboard')

  const savings = totalSavings(trips, config)
  const electricTrips = trips.filter((t) => t.vehicleType === 'electric')
  const thermalTrips = trips.filter((t) => t.vehicleType === 'thermal')

  const totalElectricKm = electricTrips.reduce((a, t) => a + t.km, 0)
  const totalThermalKm = thermalTrips.reduce((a, t) => a + t.km, 0)

  const avgElectricCostPer100km = config.electricConsumptionKwh100 * config.electricityPriceKwh
  const avgThermalCostPer100km = (100 / config.thermalConsumptionKmL) * config.gasPricePerLiter

  const addTrip = (trip: Omit<Trip, 'id'>) => {
    setTrips((prev) => [...prev, { ...trip, id: generateId() }])
  }

  const deleteTrip = (id: string) => {
    setTrips((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">BEV Tracker</h1>
            <p className="text-xs text-gray-400">Monitoraggio consumi</p>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Tabs */}
        <div className="max-w-lg mx-auto px-4 pb-0 flex gap-1">
          <TabBtn active={tab === 'dashboard'} onClick={() => setTab('dashboard')}>Dashboard</TabBtn>
          <TabBtn active={tab === 'trips'} onClick={() => setTab('trips')}>
            Viaggi {trips.length > 0 && <span className="ml-1 text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">{trips.length}</span>}
          </TabBtn>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-5 space-y-4">
        {tab === 'dashboard' && (
          <>
            {/* Savings hero card */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-1 opacity-80">
                <TrendingDown className="w-4 h-4" />
                <span className="text-sm font-medium">Risparmio totale maturato</span>
              </div>
              <div className="text-4xl font-bold tracking-tight">{formatEur(savings)}</div>
              <div className="mt-3 text-sm opacity-70">
                {electricTrips.length} viaggi elettrici · {totalElectricKm.toFixed(0)} km
              </div>
            </div>

            {/* Cost comparison pills */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Fuel className="w-4 h-4 text-orange-500" />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Termica</span>
                </div>
                <div className="text-xl font-bold text-gray-800">{formatEur(avgThermalCostPer100km)}</div>
                <div className="text-xs text-gray-400">ogni 100 km</div>
                <div className="text-xs text-gray-400 mt-1">{totalThermalKm.toFixed(0)} km percorsi</div>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Elettrica</span>
                </div>
                <div className="text-xl font-bold text-gray-800">{formatEur(avgElectricCostPer100km)}</div>
                <div className="text-xs text-gray-400">ogni 100 km</div>
                <div className="text-xs text-gray-400 mt-1">{totalElectricKm.toFixed(0)} km percorsi</div>
              </div>
            </div>

            {/* Breakeven bar */}
            <BreakevenBar savings={savings} investmentCost={config.investmentCost} />

            {/* Chart */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Costi cumulativi nel tempo</h3>
              <ConsumptionChart trips={trips} config={config} />
            </div>

            {/* Quick stats */}
            {trips.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Statistiche rapide</h3>
                <div className="space-y-3">
                  <StatRow
                    label="Costo totale termica (storico)"
                    value={formatEur(trips.filter(t => t.vehicleType === 'thermal').reduce((a, t) => a + calcThermalCost(t.km, config), 0))}
                    color="text-orange-600"
                  />
                  <StatRow
                    label="Costo totale elettrica (reale)"
                    value={formatEur(trips.filter(t => t.vehicleType === 'electric').reduce((a, t) => a + (t.km / 100) * config.electricConsumptionKwh100 * config.electricityPriceKwh, 0))}
                    color="text-blue-600"
                  />
                  <StatRow
                    label="Risparmio medio per viaggio"
                    value={electricTrips.length > 0 ? formatEur(savings / electricTrips.length) : '—'}
                    color="text-green-600"
                  />
                  <StatRow
                    label="Km totali percorsi"
                    value={`${(totalElectricKm + totalThermalKm).toFixed(0)} km`}
                    color="text-gray-800"
                  />
                </div>
              </div>
            )}
          </>
        )}

        {tab === 'trips' && (
          <TripList trips={trips} config={config} onDelete={deleteTrip} />
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowLog(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all active:scale-95"
        aria-label="Aggiungi viaggio"
      >
        <Plus className="w-7 h-7" />
      </button>

      {showLog && <QuickLogModal onAdd={addTrip} onClose={() => setShowLog(false)} />}
      {showSettings && <SettingsPanel config={config} onSave={setConfig} onClose={() => setShowSettings(false)} />}
    </div>
  )
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-1 ${
        active ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'
      }`}
    >
      {children}
    </button>
  )
}

function StatRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm font-semibold ${color}`}>{value}</span>
    </div>
  )
}
