import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import type { Trip, Config } from '../types'
import { calcThermalCost, calcElectricCost, enrichTrip, formatEntryLabel } from '../utils'

interface Props {
  trips: Trip[]
  config: Config
}

export default function ConsumptionChart({ trips, config }: Props) {
  const sorted = [...trips].sort((a, b) => a.date.localeCompare(b.date))

  let cumThermal = 0, cumBev = 0, cumPhev = 0

  const data = sorted.map((t) => {
    cumThermal += calcThermalCost(t.km, config)
    cumBev += calcElectricCost(t.km, config)
    cumPhev += enrichTrip(t, config).actualCost
    return {
      label: formatEntryLabel(t),
      Termica: parseFloat(cumThermal.toFixed(2)),
      BEV: parseFloat(cumBev.toFixed(2)),
      PHEV: parseFloat(cumPhev.toFixed(2)),
    }
  })

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Nessun dato registrato
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="gThermal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f97316" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gBev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gPhev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="label" tick={{ fontSize: 10 }} tickLine={false} />
        <YAxis tick={{ fontSize: 11 }} tickLine={false} tickFormatter={(v) => `€${v}`} />
        <Tooltip formatter={(v: number) => [`€${v.toFixed(2)}`, undefined]} />
        <Legend />
        <Area type="monotone" dataKey="Termica" stroke="#f97316" strokeWidth={2} strokeDasharray="5 3" fill="url(#gThermal)" />
        <Area type="monotone" dataKey="BEV" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 3" fill="url(#gBev)" />
        <Area type="monotone" dataKey="PHEV" stroke="#a855f7" strokeWidth={2.5} fill="url(#gPhev)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
