import { useState } from 'react'
import axios from 'axios'
import { TrendingUp, Loader2 } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import ToolShell from './ToolShell'
import { InputsSummary } from './HealthScoreTool'
import { API } from '../../App'

const fmt = (n) => Number(n || 0).toLocaleString('en-IN')

const FIELDS = [
  { key: 'current_age', label: 'Current Age' },
  { key: 'retirement_age', label: 'Target Retirement Age' },
  { key: 'annual_income', label: 'Annual Gross Salary' },
  { key: 'monthly_expenses', label: 'Monthly Ret. Corpus Draw (Today\'s Value)' },
  { key: 'total_investments_mf', label: 'Current MF Investments' },
  { key: 'total_investments_ppf', label: 'Current PPF/Debt' },
  { key: 'monthly_savings', label: 'Monthly Investable Savings' },
]

const FirePlanTool = () => {
  const [form, setForm] = useState({
    current_age: 34,
    retirement_age: 50,
    annual_income: 2400000,
    monthly_expenses: 150000,
    total_investments_mf: 1800000,
    total_investments_ppf: 600000,
    monthly_savings: 50000,
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v === '' ? '' : Number(v) }))

  const run = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const r = await axios.post(`${API}/api/fire-plan`, form)
      setResult(r.data)
    } catch (err) {
      console.error(err)
      setError('Failed to reach backend. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fire = result?.fire_plan || {}

  return (
    <ToolShell
      title="FIRE Path Planner"
      subtitle="Month-by-month roadmap to Financial Independence & Early Retirement"
      icon={TrendingUp}
      iconColor="#3b82f6"
      error={error}
    >
      {!result ? (
        <form onSubmit={run} className="glass-card rounded-3xl p-7 border border-white/5 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {FIELDS.map(({ key, label }) => (
              <div key={key} className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400 uppercase">{label}</label>
                <input
                  type="number"
                  min={0}
                  value={form[key]}
                  onChange={e => set(key, e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white"
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 text-white rounded-xl"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Run FIRE Simulation'}
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          <InputsSummary form={form} fields={FIELDS} />

          <div className="text-white">
            Target Corpus: ₹{fmt(fire.target_corpus)}
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={fire.year_by_year}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="corpus" stroke="#3b82f6" fill="#3b82f6" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <button onClick={() => setResult(null)} className="border px-4 py-2 rounded-xl">
            Recalculate
          </button>
        </div>
      )}
    </ToolShell>
  )
}

export default FirePlanTool