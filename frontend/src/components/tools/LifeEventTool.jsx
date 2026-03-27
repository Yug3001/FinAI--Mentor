import { useState } from 'react'
import axios from 'axios'
import { Activity, Loader2, ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react'
import ToolShell from './ToolShell'
import { InputsSummary } from './HealthScoreTool'
import { API } from '../../App'

const EVENTS = [
  { id: 'bonus', label: '💰 Received a Bonus' },
  { id: 'marriage', label: '💍 Getting Married' },
  { id: 'new_baby', label: '👶 New Baby Arriving' },
  { id: 'inheritance', label: '🏠 Received an Inheritance' },
  { id: 'retirement', label: '🌅 Approaching Retirement' },
]

const LifeEventTool = () => {
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [form, setForm] = useState({
    monthly_income: 100000,
    monthly_expenses: 55000,
    total_debt: 200000,
    total_investments: 500000,
    annual_income: 1200000,
    retirement_target: 30000000,
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
      const r = await axios.post(`${API}/api/life-event`, { ...form, event: selectedEvent })
      setResult(r.data)
    } catch (err) {
      console.error(err)
      setError('Failed to reach backend. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ToolShell title="Life Event Advisor" icon={Activity} error={error}>

      {!selectedEvent ? (
        <div className="grid gap-4">
          {EVENTS.map(ev => (
            <button key={ev.id} onClick={() => setSelectedEvent(ev.id)} className="border p-4 rounded">
              {ev.label}
            </button>
          ))}
        </div>
      ) : !result ? (
        <form onSubmit={run} className="space-y-4">

          {Object.keys(form).map(k => (
            <input
              key={k}
              type="number"
              value={form[k]}
              onChange={e => set(k, e.target.value)}
              className="w-full p-2 border rounded"
              placeholder={k}
            />
          ))}

          <button type="submit" className="w-full py-3 bg-green-600 text-white rounded">
            {loading ? <Loader2 className="animate-spin" /> : 'Get Advice'}
          </button>

        </form>
      ) : (
        <div>

          <InputsSummary form={form} fields={Object.keys(form).map(k => ({ key: k, label: k }))} />

          <div>{result.recommendations?.event_tip}</div>

          <button onClick={() => setResult(null)} className="mt-4 border px-4 py-2">
            Recalculate
          </button>

        </div>
      )}

    </ToolShell>
  )
}

export default LifeEventTool