import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import type { Trip, Config } from '../types'
import { enrichTrip, formatDate } from '../utils'

interface Props {
  trips: Trip[]
  config: Config
}

export default function ConsumptionChart({ trips, config }: Props) {
  const sorted = [...trips].sort((a, b) => a.date.localeCompare(b.date))

  let cumThermal = 0, cumElectric = 0, cumPhev = 0

  const data = sorted.map((t) => {
    const { actualCost } = enrichTrip(t, config)
    if (t.vehicleType === 'thermal') cumThermal += actualCost
    else if (t.vehicleType === 'electric') cumElectric += actualCost
    else cumPhev += actualCost
    return {
      date: formatDate(t.date),
      Termica: parseFloat(cumThermal.toFixed(2)),
      Elettrica: cumElectric > 0 ? parseFloat(cumElectric.toFixed(2)) : undefined,
      'Plug-in': cumPhev > 0 ? parseFloat(cumPhev.toFixed(2)) : undefined,
    }
  })

  const hasElectric = trips.some((t) => t.vehicleType === 'electric')
  const hasPhev = trips.some((t) => t.vehicleType === 'phev')

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Nessun viaggio registrato
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="colorThermal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorElectric" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorPhev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
        <YAxis tick={{ fontSize: 11 }} tickLine={false} tickFormatter={(v) => `€${v}`} />
        <Tooltip formatter={(v: number) => [`€${v.toFixed(2)}`, undefined]} />
        <Legend />
        <Area type="monotone" dataKey="Termica" stroke="#f97316" strokeWidth={2} fill="url(#colorThermal)" connectNulls />
        {hasElectric && <Area type="monotone" dataKey="Elettrica" stroke="#3b82f6" strokeWidth={2} fill="url(#colorElectric)" connectNulls />}
        {hasPhev && <Area type="monotone" dataKey="Plug-in" stroke="#a855f7" strokeWidth={2} fill="url(#colorPhev)" connectNulls />}
      </AreaChart>
    </ResponsiveContainer>
  )
}
