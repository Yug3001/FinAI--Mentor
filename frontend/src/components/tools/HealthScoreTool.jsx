import { useState } from 'react'
import axios from 'axios'
import { Heart, Loader2, ShieldCheck, AlertTriangle, TrendingUp, Wallet, Clock, Info } from 'lucide-react'
import ToolShell from './ToolShell'

const FIELDS = [
  { key: 'monthly_income',   label: 'Monthly Income',         def: 120000 },
  { key: 'monthly_expenses', label: 'Monthly Expenses',        def: 60000 },
  { key: 'total_debt',       label: 'Total Outstanding Debt',  def: 300000 },
  { key: 'emergency_fund',   label: 'Emergency Fund',          def: 180000 },
  { key: 'total_investments',label: 'Total Investments',       def: 500000 },
]

export const InputsSummary = ({ form, fields }) => (
  <div className="flex flex-wrap items-center gap-3 p-4 bg-slate-800/40 border border-slate-700/50 rounded-2xl mb-6 text-sm">
    <div className="text-slate-500 font-medium flex items-center gap-1.5 mr-2">
      <Info size={14} /> Inputs Used:
    </div>
    {fields.map(f => (
      <div key={f.key} className="flex items-center gap-1.5 bg-slate-900/50 px-3 py-1.5 rounded-xl border border-white/5">
        <span className="text-slate-400">{f.label.split(' ')[0]}:</span>
        <span className="text-white font-mono-custom font-medium">₹{form[f.key]?.toLocaleString('en-IN') || 0}</span>
      </div>
    ))}
  </div>
)

const ScoreRing = ({ score, grade }) => {
  const r = 52, circ = 2 * Math.PI * r
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : score >= 40 ? '#ef4444' : '#b91c1c'
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-36 h-36">
        <svg viewBox="0 0 120 120" className="-rotate-90 w-full h-full">
          <circle cx="60" cy="60" r={r} strokeWidth="9" stroke="#1e293b" fill="transparent" />
          <circle cx="60" cy="60" r={r} strokeWidth="9" fill="transparent"
            stroke={color}
            strokeDasharray={circ}
            strokeDashoffset={circ - (circ * score) / 100}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.2s ease-in-out', filter: `drop-shadow(0 0 8px ${color}99)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-black font-mono-custom" style={{ color }}>{score}</span>
          <span className="text-xs text-slate-500">/100</span>
        </div>
      </div>
      <span className="text-sm font-semibold text-white">{grade}</span>
    </div>
  )
}

const Stat = ({ icon: Icon, label, value, sub, color }) => (
  <div className="glass-card rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-colors">
    <div className="flex justify-between items-start mb-3">
      <p className="text-slate-400 text-sm">{label}</p>
      <Icon size={17} style={{ color }} />
    </div>
    <p className="text-2xl font-bold font-mono-custom text-white">{value}</p>
    {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
  </div>
)

const HealthScoreTool = ({ apiBase }) => {
  const [form, setForm] = useState(() => Object.fromEntries(FIELDS.map(f => [f.key, f.def])))
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v === '' ? '' : Number(v) }))

  const run = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const r = await axios.post(`${apiBase}/api/health-score`, form)
      setResult(r.data.result || r.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reach backend. Is Flask running?')
    } finally { setLoading(false) }
  }

  return (
    <ToolShell
      title="Money Health Score"
      subtitle="Get a continuously-variable, 6-dimension financial wellness score tailored to your exact inputs"
      icon={Heart}
      iconColor="#ef4444"
      error={error}
    >
      {!result ? (
        <form onSubmit={run} className="glass-card rounded-3xl p-7 border border-white/5 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {FIELDS.map(f => (
              <div key={f.key} className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">{f.label}</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">₹</span>
                  <input type="number" min={0} value={form[f.key]}
                    onChange={e => set(f.key, e.target.value)}
                    className="w-full bg-slate-900/70 border border-slate-700/50 rounded-xl py-3 pl-8 pr-4 text-white text-sm font-mono-custom
                      outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/15 transition-all hover:border-slate-600" />
                </div>
              </div>
            ))}
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500
              text-white font-bold rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-red-500/20 transition-all disabled:opacity-60 text-base">
            {loading ? <><Loader2 size={20} className="animate-spin" /> Computing Multi-Dimensional Score…</> : '🩺 Check My Precise Health Score'}
          </button>
        </form>
      ) : (
        <div className="space-y-6 animate-fade-up">

          {/* Confirm Inputs Display */}
          <InputsSummary form={form} fields={FIELDS} />

          {/* Score ring & dimensions breakdown */}
          <div className="glass-card rounded-3xl p-8 border border-white/5 flex flex-col lg:flex-row gap-10">
            <div className="shrink-0 flex justify-center">
              <ScoreRing score={result.health_score} grade={result.grade} />
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-4">6-Dimension Breakdown</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                {[
                  { k: 'savings_rate',    l: 'Savings Rate (25%)',   v: result.dimensions.savings_rate },
                  { k: 'emergency_fund',  l: 'Emerg Fund (20%)',     v: result.dimensions.emergency_fund },
                  { k: 'debt_health',     l: 'Debt Health (20%)',    v: result.dimensions.debt_health },
                  { k: 'investment_rate', l: 'Invest Rate (15%)',    v: result.dimensions.investment_rate },
                  { k: 'income_cushion',  l: 'Income Cushion (10%)', v: result.dimensions.income_cushion },
                  { k: 'net_worth_proxy', l: 'Net Worth (10%)',      v: result.dimensions.net_worth_proxy },
                ].map(dim => (
                  <div key={dim.k} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">{dim.l}</span>
                      <span className="font-mono-custom font-medium text-slate-300">{dim.v}/100</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${dim.v}%`,
                          backgroundColor: dim.v >= 80 ? '#10b981' : dim.v >= 50 ? '#f59e0b' : '#ef4444'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat icon={Wallet}    label="Net Worth"        value={`₹${(result.net_worth / 100000).toFixed(2)}L`} sub="Investments + Savings - Debt" color="#8b5cf6" />
            <Stat icon={Wallet}    label="Monthly Savings"  value={`₹${result.monthly_savings?.toLocaleString('en-IN')}`} sub={`${result.savings_rate_percent}% of income`}  color="#3b82f6" />
            <Stat icon={AlertTriangle} label="Debt-to-Income" value={`${result.debt_ratio_percent}%`} sub={result.debt_ratio_percent > 35 ? 'Above safe limit' : 'Safe zone'} color={result.debt_ratio_percent > 35 ? '#ef4444' : '#10b981'} />
            <Stat icon={ShieldCheck}   label="Emergency Runway" value={`${result.emergency_preparedness_months} mo`} sub={`₹${result.monthly_emf_gap?.toLocaleString('en-IN')} shortfall`} color="#6366f1" />
          </div>

          <button onClick={() => setResult(null)}
            className="text-sm text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 px-5 py-2.5 rounded-xl transition-all">
            ← Edit Inputs & Recalculate
          </button>
        </div>
      )}
    </ToolShell>
  )
}

export default HealthScoreTool
