import { useState } from 'react'
import { Plus, Settings, Fuel, Zap, TrendingDown, Plug } from 'lucide-react'
import { useLocalStorage } from './hooks/useLocalStorage'
import type { Config, Trip } from './types'
import { totalSavings, calcThermalCost, calcPhevCost, formatEur } from './utils'
import ConsumptionChart from './components/ConsumptionChart'
import BreakevenBar from './components/BreakevenBar'
import QuickLogModal from './components/QuickLogModal'
import MonthlyLogModal from './components/MonthlyLogModal'
import HistoricalLogModal from './components/HistoricalLogModal'
import EntryTypeSelector from './components/EntryTypeSelector'
import SettingsPanel from './components/SettingsPanel'
import TripList from './components/TripList'

const DEFAULT_CONFIG: Config = {
  gasPricePerLiter: 1.85,
  thermalConsumptionKmL: 15,
  electricityPriceKwh: 0.22,
  electricConsumptionKwh100: 18,
  phevElectricKmPerKwh: 4.4,
  phevHybridConsumptionKmL: 20,
  investmentCost: 8000,
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

type Tab = 'dashboard' | 'trips'

export default function App() {
  const [config, setConfig] = useLocalStorage<Config>('bev-config', DEFAULT_CONFIG)
  const [trips, setTrips] = useLocalStorage<Trip[]>('bev-trips', [])
  const [showSelector, setShowSelector] = useState(false)
  const [showLog, setShowLog] = useState(false)
  const [showMonthly, setShowMonthly] = useState(false)
  const [showHistorical, setShowHistorical] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [tab, setTab] = useState<Tab>('dashboard')

  // merge defaults for any missing config fields (e.g. phevElectricKmPerKwh on old installs)
  const cfg: Config = { ...DEFAULT_CONFIG, ...config }

  const savings = totalSavings(trips, cfg)
  const electricTrips = trips.filter((t) => t.vehicleType === 'electric')
  const phevTrips = trips.filter((t) => t.vehicleType === 'phev')
  const thermalTrips = trips.filter((t) => t.vehicleType === 'thermal')

  const totalElectricKm = electricTrips.reduce((a, t) => a + t.km, 0)
  const totalPhevKm = phevTrips.reduce((a, t) => a + t.km, 0)
  const totalThermalKm = thermalTrips.reduce((a, t) => a + t.km, 0)

  const costPer100Thermal = (100 / cfg.thermalConsumptionKmL) * cfg.gasPricePerLiter
  const costPer100Electric = cfg.electricConsumptionKwh100 * cfg.electricityPriceKwh
  const costPer100Phev = (100 / cfg.phevElectricKmPerKwh) * cfg.electricityPriceKwh

  const savingTrips = [...electricTrips, ...phevTrips]

  const addTrips = (entries: Omit<Trip, 'id'>[]) => {
    setTrips((prev) => [...prev, ...entries.map((e) => ({ ...e, id: generateId() }))])
  }

  const addTrip = (trip: Omit<Trip, 'id'>) => addTrips([trip])

  const deleteTrip = (id: string) => {
    setTrips((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
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
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-1 opacity-80">
                <TrendingDown className="w-4 h-4" />
                <span className="text-sm font-medium">Risparmio totale maturato</span>
              </div>
              <div className="text-4xl font-bold tracking-tight">{formatEur(savings)}</div>
              <div className="mt-3 text-sm opacity-70">
                {electricTrips.length} viaggi EV · {phevTrips.length} viaggi PHEV · {savingTrips.length} totale
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <CostCard
                icon={<Fuel className="w-4 h-4 text-orange-500" />}
                label="Termica"
                labelColor="text-orange-500"
                cost={costPer100Thermal}
                km={totalThermalKm}
              />
              <CostCard
                icon={<Zap className="w-4 h-4 text-blue-500" />}
                label="Elettrica"
                labelColor="text-blue-500"
                cost={costPer100Electric}
                km={totalElectricKm}
              />
              <CostCard
                icon={<Plug className="w-4 h-4 text-purple-500" />}
                label="Plug-in"
                labelColor="text-purple-500"
                cost={costPer100Phev}
                km={totalPhevKm}
                subtitle="solo EV"
              />
            </div>

            <BreakevenBar savings={savings} investmentCost={cfg.investmentCost} />

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Costi cumulativi nel tempo</h3>
              <ConsumptionChart trips={trips} config={cfg} />
            </div>

            {trips.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Statistiche rapide</h3>
                <div className="space-y-3">
                  <StatRow
                    label="Costo totale termica"
                    value={formatEur(thermalTrips.reduce((a, t) => a + calcThermalCost(t.km, cfg), 0))}
                    color="text-orange-600"
                  />
                  <StatRow
                    label="Costo totale elettrica"
                    value={formatEur(electricTrips.reduce((a, t) => a + (t.km / 100) * cfg.electricConsumptionKwh100 * cfg.electricityPriceKwh, 0))}
                    color="text-blue-600"
                  />
                  <StatRow
                    label="Costo totale plug-in"
                    value={formatEur(phevTrips.reduce((a, t) => a + calcPhevCost(t, cfg), 0))}
                    color="text-purple-600"
                  />
                  <StatRow
                    label="Risparmio medio per viaggio"
                    value={savingTrips.length > 0 ? formatEur(savings / savingTrips.length) : '—'}
                    color="text-green-600"
                  />
                  <StatRow
                    label="Km totali percorsi"
                    value={`${(totalElectricKm + totalThermalKm + totalPhevKm).toFixed(0)} km`}
                    color="text-gray-800"
                  />
                </div>
              </div>
            )}
          </>
        )}

        {tab === 'trips' && (
          <TripList trips={trips} config={cfg} onDelete={deleteTrip} />
        )}
      </div>

      <button
        onClick={() => setShowSelector(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all active:scale-95"
        aria-label="Aggiungi dati"
      >
        <Plus className="w-7 h-7" />
      </button>

      {showSelector && (
        <EntryTypeSelector
          onSelect={(mode) => {
            setShowSelector(false)
            if (mode === 'trip') setShowLog(true)
            else if (mode === 'monthly') setShowMonthly(true)
            else setShowHistorical(true)
          }}
          onClose={() => setShowSelector(false)}
        />
      )}
      {showLog && <QuickLogModal onAdd={addTrip} onClose={() => setShowLog(false)} />}
      {showMonthly && <MonthlyLogModal onAdd={addTrips} onClose={() => setShowMonthly(false)} />}
      {showHistorical && <HistoricalLogModal onAdd={addTrips} onClose={() => setShowHistorical(false)} />}
      {showSettings && <SettingsPanel config={cfg} onSave={setConfig} onClose={() => setShowSettings(false)} />}
    </div>
  )
}

function CostCard({ icon, label, labelColor, cost, km, subtitle }: {
  icon: React.ReactNode; label: string; labelColor: string
  cost: number; km: number; subtitle?: string
}) {
  return (
    <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-1.5 mb-2">
        {icon}
        <span className={`text-xs font-semibold uppercase tracking-wide ${labelColor}`}>{label}</span>
      </div>
      <div className="text-base font-bold text-gray-800">{formatEur(cost)}</div>
      <div className="text-xs text-gray-400">/100 km{subtitle ? ` ${subtitle}` : ''}</div>
      <div className="text-xs text-gray-400 mt-0.5">{km.toFixed(0)} km</div>
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
