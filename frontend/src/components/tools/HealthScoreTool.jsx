import { useState } from 'react'
import axios from 'axios'
import { Heart, Loader2, Download } from 'lucide-react'
import ToolShell from './ToolShell'
import { API } from '../../App'
import { downloadPDF } from '../../utils/pdfDownload'

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
        <div className="space-y-6">
          <InputsSummary form={form} fields={FIELDS} />

          <div className="glass-card rounded-2xl p-6 border border-white/5">
            <div className="text-center">
              <p className="text-slate-400 text-sm mb-2">Overall Health Score</p>
              <p className="text-4xl font-bold text-white font-mono-custom">{result.health_score}/100</p>
              <p className="text-emerald-400 font-semibold mt-1">{result.grade}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => downloadPDF(
                `${API}/api/download/health-score-pdf`,
                { result, input_data: form },
                'FinAI_Health_Score_Report.pdf'
              )}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors"
            >
              <Download size={18} />
              Download Report
            </button>
            <button onClick={() => setResult(null)} className="flex-1 border border-slate-700 hover:border-slate-500 px-4 py-3 rounded-xl text-slate-300 transition-colors">
              Recalculate
            </button>
          </div>
        </div>
      )}
    </ToolShell>
  )
}

export default HealthScoreTool