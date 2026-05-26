import { useState, useEffect } from 'react'
import { Plus, Settings, Fuel, Zap, Plug, TrendingDown, TrendingUp, LogOut } from 'lucide-react'
import { supabase } from './lib/supabase'
import type { Config, Trip } from './types'
import { calcThermalCost, calcElectricCost, enrichTrip, formatEur } from './utils'
import ConsumptionChart from './components/ConsumptionChart'
import BreakevenBar from './components/BreakevenBar'
import QuickLogModal from './components/QuickLogModal'
import MonthlyLogModal from './components/MonthlyLogModal'
import HistoricalLogModal from './components/HistoricalLogModal'
import EntryTypeSelector from './components/EntryTypeSelector'
import EditTripModal from './components/EditTripModal'
import SettingsPanel from './components/SettingsPanel'
import TripList from './components/TripList'
import AuthPage from './components/AuthPage'

const DEFAULT_CONFIG: Config = {
  gasPricePerLiter: 1.85,
  thermalConsumptionKmL: 15,
  electricityPriceKwh: 0.22,
  electricConsumptionKwh100: 18,
  phevElectricKmPerKwh: 4.4,
  phevHybridConsumptionKmL: 16.5,
  investmentCost: 8000,
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dbToTrip(row: any): Trip {
  return {
    id: row.id,
    date: row.date,
    km: row.km,
    vehicleType: row.vehicle_type,
    entryType: row.entry_type,
    electricKm: Number(row.electric_km ?? 0),
    hybridKm: Number(row.hybrid_km ?? 0),
  }
}

function tripToDb(trip: Omit<Trip, 'id'>, userId: string, id: string) {
  return {
    id,
    user_id: userId,
    date: trip.date,
    km: trip.km,
    vehicle_type: trip.vehicleType,
    entry_type: trip.entryType ?? 'trip',
    electric_km: trip.electricKm ?? 0,
    hybrid_km: trip.hybridKm ?? 0,
  }
}

type Tab = 'dashboard' | 'trips'

export default function App() {
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState('')
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user.id ?? null)
      setUserEmail(session?.user.email ?? '')
      setAuthLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null)
      setUserEmail(session?.user.email ?? '')
    })
    return () => subscription.unsubscribe()
  }, [])

  if (authLoading) return <Spinner />
  if (!userId) return <AuthPage />
  return <MainApp userId={userId} userEmail={userEmail} />
}

function MainApp({ userId, userEmail }: { userId: string; userEmail: string }) {
  const [config, setConfigState] = useState<Config>(DEFAULT_CONFIG)
  const [trips, setTrips] = useState<Trip[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [showSelector, setShowSelector] = useState(false)
  const [showLog, setShowLog] = useState(false)
  const [showMonthly, setShowMonthly] = useState(false)
  const [showHistorical, setShowHistorical] = useState(false)
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [tab, setTab] = useState<Tab>('dashboard')

  useEffect(() => {
    Promise.all([fetchTrips(), fetchConfig()]).finally(() => setDataLoading(false))
  }, [userId])

  async function fetchTrips() {
    const { data } = await supabase.from('trips').select('*').eq('user_id', userId)
    if (data) setTrips(data.map(dbToTrip))
  }

  async function fetchConfig() {
    const { data } = await supabase.from('configs').select('data').eq('user_id', userId).single()
    if (data?.data) setConfigState({ ...DEFAULT_CONFIG, ...(data.data as Config) })
  }

  const cfg: Config = { ...DEFAULT_CONFIG, ...config }

  // ── Aggregates ──────────────────────────────────────────────
  const totalEvKm = trips.reduce((a, t) => a + (t.electricKm ?? 0), 0)
  const totalHybKm = trips.reduce((a, t) => a + (t.hybridKm ?? 0), 0)
  const totalKm = totalEvKm + totalHybKm

  const thermalEquiv = calcThermalCost(totalKm, cfg)
  const bevEquiv = calcElectricCost(totalKm, cfg)
  const phevActual = trips.reduce((a, t) => a + enrichTrip(t, cfg).actualCost, 0)
  const savingsVsThermal = thermalEquiv - phevActual
  const savingsVsBev = bevEquiv - phevActual

  // ── CRUD ───────────────────────────────────────────────────────────
  const addTrips = async (entries: Omit<Trip, 'id'>[]) => {
    const rows = entries.map(e => tripToDb(e, userId, generateId()))
    const { error } = await supabase.from('trips').insert(rows)
    if (!error) setTrips(prev => [...prev, ...rows.map(dbToTrip)])
  }

  const addTrip = (trip: Omit<Trip, 'id'>) => addTrips([trip])

  const deleteTrip = async (id: string) => {
    await supabase.from('trips').delete().eq('id', id).eq('user_id', userId)
    setTrips(prev => prev.filter(t => t.id !== id))
  }

  const updateTrip = async (id: string, updates: Omit<Trip, 'id'>) => {
    const row = tripToDb(updates, userId, id)
    await supabase.from('trips').update(row).eq('id', id).eq('user_id', userId)
    setTrips(prev => prev.map(t => t.id === id ? { ...updates, id } : t))
  }

  const saveConfig = async (newConfig: Config) => {
    setConfigState(newConfig)
    await supabase.from('configs').upsert({
      user_id: userId,
      data: newConfig,
      updated_at: new Date().toISOString(),
    })
  }

  if (dataLoading) return <Spinner />

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">PHEV Tracker</h1>
            <p className="text-xs text-gray-400">Confronto consumi</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowSettings(true)}
              className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
            <button onClick={() => supabase.auth.signOut()}
              className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              title={`Esci (${userEmail})`}>
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        <div className="max-w-lg mx-auto px-4 pb-0 flex gap-1">
          <TabBtn active={tab === 'dashboard'} onClick={() => setTab('dashboard')}>Dashboard</TabBtn>
          <TabBtn active={tab === 'trips'} onClick={() => setTab('trips')}>
            Dati {trips.length > 0 && (
              <span className="ml-1 text-xs bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full">{trips.length}</span>
            )}
          </TabBtn>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-5 space-y-4">
        {tab === 'dashboard' && (
          <>
            {/* Total km summary */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-700">Km totali monitorati</span>
                <span className="text-2xl font-bold text-gray-900">{totalKm.toLocaleString('it-IT')} km</span>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <ModeChip icon={<Zap className="w-3 h-3" />} label="EV" km={totalEvKm} color="text-blue-600 bg-blue-50" />
                <ModeChip icon={<Plug className="w-3 h-3" />} label="Hybrid" km={totalHybKm} color="text-purple-600 bg-purple-50" />
              </div>
            </div>

            {/* 3-way cost comparison */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 pt-4 pb-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Confronto costi su {totalKm.toLocaleString('it-IT')} km
                </p>
              </div>
              <div className="grid grid-cols-3 divide-x divide-gray-100">
                <ScenarioCol icon={<Fuel className="w-4 h-4 text-orange-500" />} label="Termica" sublabel="solo benzina" cost={thermalEquiv} variant="neutral" />
                <ScenarioCol icon={<Plug className="w-4 h-4 text-purple-600" />} label="PHEV" sublabel="costo reale" cost={phevActual} variant="highlight" />
                <ScenarioCol icon={<Zap className="w-4 h-4 text-blue-500" />} label="BEV" sublabel="solo elettrico" cost={bevEquiv} variant="neutral" />
              </div>
            </div>

            {/* Savings cards */}
            <div className="grid grid-cols-2 gap-3">
              <SavingsCard
                label="Risparmio vs Termica"
                value={savingsVsThermal}
                icon={<TrendingDown className="w-4 h-4" />}
                positiveGood
              />
              <SavingsCard
                label="Δ vs BEV"
                value={savingsVsBev}
                icon={savingsVsBev >= 0 ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                positiveGood
                note={savingsVsBev >= 0 ? 'PHEV più economico' : 'BEV sarebbe più economico'}
              />
            </div>

            {/* Breakeven bar */}
            <BreakevenBar savings={savingsVsThermal} investmentCost={cfg.investmentCost} />

            {/* Chart */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Costi cumulativi nel tempo</h3>
              <p className="text-xs text-gray-400 mb-4">Termica e BEV = scenari equivalenti · PHEV = costo reale</p>
              <ConsumptionChart trips={trips} config={cfg} />
            </div>

            {/* Stats */}
            {trips.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Ripartizione km</h3>
                <div className="space-y-3">
                  <StatRow label="Km in modalità EV" value={`${totalEvKm.toLocaleString('it-IT')} km`} pct={totalKm > 0 ? (totalEvKm / totalKm) * 100 : 0} color="bg-blue-500" />
                  <StatRow label="Km in full-hybrid" value={`${totalHybKm.toLocaleString('it-IT')} km`} pct={totalKm > 0 ? (totalHybKm / totalKm) * 100 : 0} color="bg-purple-500" />
                </div>
              </div>
            )}
          </>
        )}

        {tab === 'trips' && (
          <TripList trips={trips} config={cfg} onDelete={deleteTrip} onEdit={setEditingTrip} />
        )}
      </div>

      {/* FAB */}
      <button onClick={() => setShowSelector(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all active:scale-95"
        aria-label="Aggiungi dati">
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
      {editingTrip && (
        <EditTripModal
          trip={editingTrip}
          onSave={(updates) => { updateTrip(editingTrip.id, updates); setEditingTrip(null) }}
          onClose={() => setEditingTrip(null)}
        />
      )}
      {showSettings && <SettingsPanel config={cfg} onSave={saveConfig} onClose={() => setShowSettings(false)} />}
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────

function ModeChip({ icon, label, km, color }: { icon: React.ReactNode; label: string; km: number; color: string }) {
  return (
    <span className={`flex items-center gap-1 px-2 py-1 rounded-lg font-medium ${color}`}>
      {icon}{label}: {km.toLocaleString('it-IT')} km
    </span>
  )
}

function ScenarioCol({ icon, label, sublabel, cost, variant }: {
  icon: React.ReactNode; label: string; sublabel: string; cost: number; variant: 'neutral' | 'highlight'
}) {
  return (
    <div className={`flex flex-col items-center py-4 px-2 ${variant === 'highlight' ? 'bg-purple-50' : ''}`}>
      <div className="mb-1">{icon}</div>
      <div className={`text-xs font-semibold mb-0.5 ${variant === 'highlight' ? 'text-purple-700' : 'text-gray-500'}`}>{label}</div>
      <div className={`text-base font-bold ${variant === 'highlight' ? 'text-purple-800' : 'text-gray-700'}`}>{formatEur(cost)}</div>
      <div className="text-xs text-gray-400 mt-0.5">{sublabel}</div>
    </div>
  )
}

function SavingsCard({ label, value, icon, positiveGood, note }: {
  label: string; value: number; icon: React.ReactNode; positiveGood?: boolean; note?: string
}) {
  const good = positiveGood ? value >= 0 : value < 0
  return (
    <div className={`rounded-2xl p-4 border shadow-sm ${good ? 'bg-green-50 border-green-100' : 'bg-orange-50 border-orange-100'}`}>
      <div className={`flex items-center gap-1.5 mb-1 ${good ? 'text-green-600' : 'text-orange-500'}`}>
        {icon}
        <span className="text-xs font-semibold">{label}</span>
      </div>
      <div className={`text-xl font-bold ${good ? 'text-green-700' : 'text-orange-600'}`}>
        {value >= 0 ? '+' : ''}{formatEur(value)}
      </div>
      {note && <div className="text-xs text-gray-400 mt-0.5">{note}</div>}
    </div>
  )
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-1 ${active ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
      {children}
    </button>
  )
}

function StatRow({ label, value, pct, color }: { label: string; value: string; pct: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-500">{label}</span>
        <span className="text-xs font-semibold text-gray-700">{value} <span className="text-gray-400 font-normal">({pct.toFixed(0)}%)</span></span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5">
        <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
