import { useState } from 'react'
import axios from 'axios'
import { Heart, Loader2, ShieldCheck, AlertTriangle, Wallet, Info } from 'lucide-react'
import ToolShell from './ToolShell'
import { API } from '../../App'

const FIELDS = [
  { key: 'monthly_income', label: 'Monthly Income', def: 120000 },
  { key: 'monthly_expenses', label: 'Monthly Expenses', def: 60000 },
  { key: 'total_debt', label: 'Total Outstanding Debt', def: 300000 },
  { key: 'emergency_fund', label: 'Emergency Fund', def: 180000 },
  { key: 'total_investments', label: 'Total Investments', def: 500000 },
]

export const InputsSummary = ({ form, fields }) => (
  <div className="flex flex-wrap gap-2 p-4 bg-slate-800 rounded-xl text-sm">
    {fields.map(f => (
      <span key={f.key}>
        {f.label}: ₹{form[f.key]?.toLocaleString('en-IN') || 0}
      </span>
    ))}
  </div>
)

const HealthScoreTool = () => {
  const [form, setForm] = useState(() => Object.fromEntries(FIELDS.map(f => [f.key, f.def])))
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v === '' ? '' : Number(v) }))

  const run = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const r = await axios.post(`${API}/api/health-score`, form)
      setResult(r.data.result || r.data)
    } catch (err) {
      console.error(err)
      setError('Failed to reach backend. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ToolShell title="Money Health Score" icon={Heart} error={error}>
      {!result ? (
        <form onSubmit={run} className="space-y-4">
          {FIELDS.map(f => (
            <input
              key={f.key}
              type="number"
              value={form[f.key]}
              onChange={e => set(f.key, e.target.value)}
              className="w-full p-2 border rounded"
              placeholder={f.label}
            />
          ))}

          <button type="submit" className="w-full py-3 bg-red-500 text-white rounded">
            {loading ? <Loader2 className="animate-spin" /> : 'Check Score'}
          </button>
        </form>
      ) : (
        <div>
          <InputsSummary form={form} fields={FIELDS} />

          <div>Score: {result.health_score}</div>

          <button onClick={() => setResult(null)} className="mt-4 border px-4 py-2">
            Recalculate
          </button>
        </div>
      )}
    </ToolShell>
  )
}

export default HealthScoreTool