import { useState } from 'react'
import axios from 'axios'
import { Activity, Loader2, ShieldCheck, ShieldAlert, AlertTriangle, Download } from 'lucide-react'
import ToolShell from './ToolShell'
import { API } from '../../App'
import { downloadPDF } from '../../utils/pdfDownload'

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
        <div className="space-y-4">

          <div className="bg-slate-800 p-4 rounded-xl">
            <h3 className="font-bold text-green-400 mb-3">📋 Your Financial Event Analysis</h3>
            {result.suggestions && result.suggestions.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-green-300 text-sm mb-2">✅ Suggestions:</h4>
                <ul className="text-slate-300 text-sm space-y-1">
                  {result.suggestions.map((s, i) => <li key={i}>• {s}</li>)}
                </ul>
              </div>
            )}
            {result.warnings && result.warnings.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-yellow-400 text-sm mb-2">⚠️ Warnings:</h4>
                <ul className="text-slate-300 text-sm space-y-1">
                  {result.warnings.map((w, i) => <li key={i}>• {w}</li>)}
                </ul>
              </div>
            )}
            {result.improvements && result.improvements.length > 0 && (
              <div>
                <h4 className="font-semibold text-blue-300 text-sm mb-2">💡 Improvements:</h4>
                <ul className="text-slate-300 text-sm space-y-1">
                  {result.improvements.map((im, i) => <li key={i}>• {im}</li>)}
                </ul>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => downloadPDF(
                `${API}/api/download/life-event-pdf`,
                { result },
                'FinAI_Life_Event_Report.pdf'
              )}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl transition-colors font-semibold"
            >
              <Download size={18} />
              Download Report
            </button>
            <button 
              onClick={() => setResult(null)}
              className="flex-1 border border-slate-400 hover:border-slate-300 px-4 py-3 rounded-xl text-slate-300 font-semibold transition-colors"
            >
              🔄 Analyze Another Event
            </button>
          </div>

        </div>
      )}

    </ToolShell>
  )
}

export default LifeEventTool