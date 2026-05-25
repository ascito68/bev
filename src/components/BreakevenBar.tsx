import { TrendingUp } from 'lucide-react'
import { formatEur } from '../utils'

interface Props {
  savings: number
  investmentCost: number
}

export default function BreakevenBar({ savings, investmentCost }: Props) {
  const pct = investmentCost > 0 ? Math.min((savings / investmentCost) * 100, 100) : 100
  const remaining = Math.max(investmentCost - savings, 0)
  const reached = savings >= investmentCost

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-500" />
          <span className="text-sm font-semibold text-gray-700">Punto di Pareggio</span>
        </div>
        <span className={`text-sm font-semibold ${reached ? 'text-green-600' : 'text-gray-500'}`}>
          {reached ? 'Raggiunto!' : `Mancano ${formatEur(remaining)}`}
        </span>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
        <div
          className={`h-3 rounded-full transition-all duration-700 ${reached ? 'bg-green-500' : 'bg-gradient-to-r from-blue-400 to-blue-600'}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex justify-between mt-2 text-xs text-gray-400">
        <span>{formatEur(savings)} risparmiati</span>
        <span>{formatEur(investmentCost)} obiettivo</span>
      </div>
    </div>
  )
}
