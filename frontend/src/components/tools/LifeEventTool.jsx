import { useState } from 'react'
import axios from 'axios'
import { Activity, Loader2, ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react'
import ToolShell from './ToolShell'
import { InputsSummary } from './HealthScoreTool'

const EVENTS = [
  { id: 'bonus',       label: '💰 Received a Bonus',         desc: 'Windfall income allocation' },
  { id: 'marriage',    label: '💍 Getting Married',           desc: 'Joint financial planning' },
  { id: 'new_baby',    label: '👶 New Baby Arriving',         desc: 'Child planning & insurance' },
  { id: 'inheritance', label: '🏠 Received an Inheritance',   desc: 'Lump sum management' },
  { id: 'retirement',  label: '🌅 Approaching Retirement',    desc: 'Portfolio de-risking' },
]

const FIELDS = [
  { key: 'monthly_income',    label: 'Monthly Income' },
  { key: 'monthly_expenses',  label: 'Monthly Expenses' },
  { key: 'total_investments', l: 'Current Investments' },
  { key: 'total_debt',        label: 'Total Debt' },
  { key: 'annual_income',     label: 'Annual Gross Income' },
  { key: 'retirement_target', label: 'Retirement Target' },
]

const LifeEventTool = ({ apiBase }) => {
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [form, setForm] = useState({
    monthly_income: 100000,
    monthly_expenses: 55000,
    total_debt: 200000,
    total_investments: 500000,
    emergency_fund: 150000,
    annual_income: 1200000,
    deduction_80c: 100000,
    retirement_target: 30000000,
    years_to_retire: 20,
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v === '' ? '' : Number(v) }))

  const run = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const r = await axios.post(`${apiBase}/api/life-event`, { ...form, event: selectedEvent })
      setResult(r.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reach backend. Is Flask running?')
    } finally { setLoading(false) }
  }

  return (
    <ToolShell title="Life Event Financial Advisor" subtitle="AI advice tailored to your biggest financial life moments"
      icon={Activity} iconColor="#10b981" error={error}>

      {!selectedEvent ? (
        <div className="space-y-4 animate-fade-up">
          <p className="text-slate-400 text-sm">Which life event are you navigating? Our AI will tailor financial advice specifically for your situation.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {EVENTS.map(ev => (
              <button key={ev.id} onClick={() => setSelectedEvent(ev.id)}
                className="group glass-card rounded-2xl p-5 border border-white/5 hover:border-emerald-500/30 text-left
                  hover:bg-emerald-500/5 transition-all hover:scale-[1.02] duration-200">
                <span className="text-3xl block mb-3">{ev.label.split(' ')[0]}</span>
                <h4 className="font-bold text-white">{ev.label.slice(2)}</h4>
                <p className="text-xs text-slate-500 mt-1">{ev.desc}</p>
              </button>
            ))}
          </div>
        </div>
      ) : !result ? (
        <form onSubmit={run} className="glass-card rounded-3xl p-7 border border-white/5 space-y-6 animate-fade-up">
          {/* Selected event banner */}
          <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
            <div>
              <p className="text-xs text-slate-400">Selected Event</p>
              <p className="font-bold text-white">{EVENTS.find(e => e.id === selectedEvent)?.label}</p>
            </div>
            <button type="button" onClick={() => setSelectedEvent(null)}
              className="text-xs text-slate-400 hover:text-white border border-slate-700 px-3 py-1.5 rounded-lg transition-all">Change</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { k: 'monthly_income',    l: 'Monthly Income' },
              { k: 'monthly_expenses',  l: 'Monthly Expenses' },
              { k: 'total_investments', l: 'Current Investments' },
              { k: 'total_debt',        l: 'Total Debt' },
              { k: 'annual_income',     l: 'Annual Gross Income' },
              { k: 'retirement_target', l: 'Retirement Target' },
            ].map(({ k, l }) => (
              <div key={k} className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">{l}</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">₹</span>
                  <input type="number" min={0} value={form[k]} onChange={e => set(k, e.target.value)}
                    className="w-full bg-slate-900/70 border border-slate-700/50 rounded-xl py-3 pl-8 pr-4 text-white text-sm font-mono-custom
                      outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/15 transition-all hover:border-slate-600" />
                </div>
              </div>
            ))}
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500
              text-white font-bold rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-60">
            {loading ? <><Loader2 size={20} className="animate-spin" /> Getting Advice…</> : '🤖 Get My Personalized Advice'}
          </button>
        </form>
      ) : (
        <div className="space-y-6 animate-fade-up">
          <InputsSummary form={form} fields={FIELDS.map(f => ({ key: f.key, label: f.label || f.l }))} />

          {/* Event Tip highlight */}
          <div className="p-6 bg-gradient-to-br from-emerald-900/40 to-teal-900/30 border border-emerald-500/20 rounded-3xl">
            <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-2">
              🎯 AI Tip for: {EVENTS.find(e => e.id === result.recommendations?.event)?.label}
            </p>
            <p className="text-white leading-relaxed">{result.recommendations?.event_tip}</p>
          </div>

          {/* Health snapshot */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="glass-card rounded-2xl p-4 border border-white/5">
              <p className="text-xs text-slate-400 mb-1">Monthly Savings</p>
              <p className="text-xl font-bold font-mono-custom text-white">₹{result.financial_health?.monthly_savings?.toLocaleString('en-IN')}</p>
            </div>
            <div className="glass-card rounded-2xl p-4 border border-white/5">
              <p className="text-xs text-slate-400 mb-1">Health Score</p>
              <p className="text-xl font-bold font-mono-custom text-emerald-400">{result.financial_health?.health_score}/100</p>
            </div>
            <div className="glass-card rounded-2xl p-4 border border-white/5">
              <p className="text-xs text-slate-400 mb-1">Best Tax Regime</p>
              <p className="text-xl font-bold font-mono-custom text-purple-400">{result.tax_optimization?.better_regime}</p>
            </div>
          </div>

          {/* Recommendations */}
          <div className="glass-card rounded-3xl p-6 border border-white/5 space-y-3">
            <h4 className="font-bold text-white mb-4">AI Recommendations</h4>
            {result.recommendations?.suggestions?.map((m, i) => (
              <div key={i} className="flex gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm">
                <ShieldCheck size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                <span className="text-emerald-100">{m}</span>
              </div>
            ))}
            {result.recommendations?.warnings?.map((m, i) => (
              <div key={i} className="flex gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm">
                <ShieldAlert size={16} className="text-red-400 mt-0.5 shrink-0" />
                <span className="text-red-200">{m}</span>
              </div>
            ))}
            {result.recommendations?.improvements?.map((m, i) => (
              <div key={i} className="flex gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm">
                <AlertTriangle size={16} className="text-amber-400 mt-0.5 shrink-0" />
                <span className="text-amber-200">{m}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setResult(null)} className="text-sm text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 px-4 py-2 rounded-xl transition-all">
              ← Recalculate
            </button>
            <button onClick={() => { setResult(null); setSelectedEvent(null) }}
              className="text-sm text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 px-4 py-2 rounded-xl transition-all">
              Change Event
            </button>
          </div>
        </div>
      )}
    </ToolShell>
  )
}

export default LifeEventTool
