import { useState } from 'react'
import { Plug } from 'lucide-react'
import { supabase } from '../lib/supabase'

type Mode = 'login' | 'signup'

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async () => {
    if (!email || !password) return
    setLoading(true)
    setError('')
    setSuccess('')

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setSuccess('Controlla la tua email per confermare la registrazione.')
    }
    setLoading(false)
  }

  const toggle = () => {
    setMode(m => m === 'login' ? 'signup' : 'login')
    setError('')
    setSuccess('')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-sm p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 bg-purple-100 rounded-xl">
            <Plug className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">PHEV Tracker</h1>
            <p className="text-xs text-gray-400">Confronto consumi</p>
          </div>
        </div>

        <h2 className="text-base font-semibold text-gray-800 mb-5">
          {mode === 'login' ? 'Accedi al tuo account' : 'Crea un account'}
        </h2>

        <div className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {error && <p className="text-xs text-red-500 mt-3">{error}</p>}
        {success && <p className="text-xs text-green-600 mt-3">{success}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading || !email || !password}
          className="w-full mt-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
        >
          {loading ? 'Caricamento...' : mode === 'login' ? 'Accedi' : 'Registrati'}
        </button>

        <button
          onClick={toggle}
          className="w-full mt-3 text-sm text-gray-400 hover:text-gray-600 transition-colors py-1"
        >
          {mode === 'login' ? 'Non hai un account? Registrati' : 'Hai già un account? Accedi'}
        </button>
      </div>
    </div>
  )
}
