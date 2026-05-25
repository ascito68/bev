import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { Trip } from '../types'
import type { Config } from '../types'
import { enrichTrip, formatDate } from '../utils'

interface Props {
  trips: Trip[]
  config: Config
}

export default function ConsumptionChart({ trips, config }: Props) {
  const sorted = [...trips].sort((a, b) => a.date.localeCompare(b.date))

  let cumulativeThermal = 0
  let cumulativeElectric = 0

  const data = sorted.map((t) => {
    const { thermalCost, electricCost } = enrichTrip(t, config)
    if (t.vehicleType === 'thermal') {
      cumulativeThermal += thermalCost
    } else {
      cumulativeElectric += electricCost
    }
    return {
      date: formatDate(t.date),
      Termica: parseFloat(cumulativeThermal.toFixed(2)),
      Elettrica: parseFloat(cumulativeElectric.toFixed(2)),
    }
  })

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
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
        <YAxis tick={{ fontSize: 11 }} tickLine={false} tickFormatter={(v) => `€${v}`} />
        <Tooltip formatter={(v: number) => [`€${v.toFixed(2)}`, undefined]} />
        <Legend />
        <Area type="monotone" dataKey="Termica" stroke="#f97316" strokeWidth={2} fill="url(#colorThermal)" />
        <Area type="monotone" dataKey="Elettrica" stroke="#3b82f6" strokeWidth={2} fill="url(#colorElectric)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
