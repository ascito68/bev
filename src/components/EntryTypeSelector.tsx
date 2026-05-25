import { Car, CalendarDays, History, X } from 'lucide-react'

type EntryMode = 'trip' | 'monthly' | 'historical'

interface Props {
  onSelect: (mode: EntryMode) => void
  onClose: () => void
}

const options: { mode: EntryMode; icon: React.ReactNode; label: string; desc: string }[] = [
  {
    mode: 'trip',
    icon: <Car className="w-5 h-5" />,
    label: 'Viaggio singolo',
    desc: 'Inserisci un singolo percorso con data specifica',
  },
  {
    mode: 'monthly',
    icon: <CalendarDays className="w-5 h-5" />,
    label: 'Dati mensili',
    desc: 'Inserisci i km totali percorsi in un mese',
  },
  {
    mode: 'historical',
    icon: <History className="w-5 h-5" />,
    label: 'Km storici',
    desc: 'Importa i km già percorsi prima di iniziare il monitoraggio',
  },
]

export default function EntryTypeSelector({ onSelect, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-base font-semibold text-gray-800">Aggiungi dati</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-3 space-y-2">
          {options.map(({ mode, icon, label, desc }) => (
            <button
              key={mode}
              onClick={() => onSelect(mode)}
              className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors text-left"
            >
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0">{icon}</div>
              <div>
                <div className="text-sm font-semibold text-gray-800">{label}</div>
                <div className="text-xs text-gray-400 mt-0.5">{desc}</div>
              </div>
            </button>
          ))}
        </div>
        <div className="h-2" />
      </div>
    </div>
  )
}
