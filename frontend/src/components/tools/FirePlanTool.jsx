import { useState } from 'react'
import axios from 'axios'
import { TrendingUp, Loader2, Target, Wallet, Clock } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import ToolShell from './ToolShell'
import { InputsSummary } from './HealthScoreTool'

const fmt = (n) => Number(n || 0).toLocaleString('en-IN')

const FIELDS = [
  { key: 'current_age',       label: 'Current Age' },
  { key: 'retirement_age',    label: 'Target Retirement Age' },
  { key: 'annual_income',     label: 'Annual Gross Salary' },
  { key: 'monthly_expenses',  label: 'Monthly Ret. Corpus Draw (Today\'s Value)' },
  { key: 'total_investments_mf', label: 'Current MF Investments' },
  { key: 'total_investments_ppf', label: 'Current PPF/Debt' },
  { key: 'monthly_savings',   label: 'Monthly Investable Savings' },
]

const FirePlanTool = ({ apiBase }) => {
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
    setLoading(true); setError(null)
    try {
      const r = await axios.post(`${apiBase}/api/fire-plan`, form)
      setResult(r.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reach backend. Is Flask running?')
    } finally { setLoading(false) }
  }

  const fire = result?.fire_plan || {}

  return (
    <ToolShell title="FIRE Path Planner" subtitle="Month-by-month roadmap to Financial Independence & Early Retirement"
      icon={TrendingUp} iconColor="#3b82f6" error={error}>

      {!result ? (
        <form onSubmit={run} className="glass-card rounded-3xl p-7 border border-white/5 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {FIELDS.map(({ key, label }) => (
              <div key={key} className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</label>
                <div className="relative">
                  {!(key.includes('age')) && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">₹</span>}
                  <input type="number" min={0} value={form[key]} onChange={e => set(key, e.target.value)}
                    className={`w-full bg-slate-900/70 border border-slate-700/50 rounded-xl py-3 pr-4 text-white text-sm font-mono-custom
                      outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/15 transition-all hover:border-slate-600 ${key.includes('age') ? 'pl-4' : 'pl-8'}`} />
                </div>
              </div>
            ))}
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500
              text-white font-bold rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20 transition-all disabled:opacity-60 text-base">
            {loading ? <><Loader2 size={20} className="animate-spin" /> Simulating Paths…</> : '🔥 Run Detailed FIRE Simulation'}
          </button>
        </form>
      ) : (
        <div className="space-y-6 animate-fade-up">

          {/* Confirm Inputs */}
          <InputsSummary form={form} fields={FIELDS} />

          {/* Core FIRE Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`col-span-1 lg:col-span-2 rounded-2xl p-5 border ${fire.is_on_track ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
              <p className="text-xs text-slate-400 mb-2 uppercase tracking-wide">Target Corpus Details</p>
              <h3 className="text-3xl font-extrabold text-white font-mono-custom mb-3">₹{fmt(fire.target_corpus)}</h3>
              <div className="flex gap-4 text-sm text-slate-400 border-t border-white/10 pt-3">
                <span><span className="text-white">₹{fmt(fire.fire_number_4pct_rule)}</span> 4% Rule target</span>
                <span><span className="text-white">₹{fmt(fire.inflation_adjusted_target)}</span> 6% Inflation target</span>
              </div>
            </div>

            <div className="glass-card border border-white/5 rounded-2xl p-5">
              <p className="text-xs text-slate-400 mb-1">Required Monthly SIP</p>
              <p className="text-2xl font-bold font-mono-custom text-blue-400">₹{fmt(fire.monthly_sip_required)}</p>
              <p className="text-xs text-slate-500 mt-1.5">To reach target in {form.retirement_age - form.current_age}y</p>
            </div>

            <div className="glass-card border border-white/5 rounded-2xl p-5">
              <p className="text-xs text-slate-400 mb-1">Investable Surplus</p>
              <p className={`text-2xl font-bold font-mono-custom ${fire.investable_surplus >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {fire.investable_surplus >= 0 ? '+' : '-'}₹{fmt(Math.abs(fire.investable_surplus))}
              </p>
              <p className="text-xs text-slate-500 mt-1.5">{fire.investable_surplus >= 0 ? 'Monthly surplus available' : 'Monthly deficit to goal'}</p>
            </div>
          </div>

          {/* Aggressive FIRE scenarios */}
          {fire.years_to_fire_at_current_pace && (
            <div className="glass-card rounded-2xl p-5 border border-indigo-500/20 bg-indigo-500/5">
              <p className="text-indigo-400 text-sm font-semibold flex items-center gap-2">
                <TrendingUp size={16} /> Fast-Track Projection
              </p>
              <p className="text-white mt-1">If you continuously invest your current monthly savings (₹{fmt(form.monthly_savings)}), you will hit your FIRE number in <span className="text-emerald-400 font-bold">{fire.years_to_fire_at_current_pace} years</span>.</p>
            </div>
          )}

          {/* SIP Categories */}
          {fire.sip_by_category && (
            <div className="glass-card rounded-2xl p-5 border border-white/5 bg-slate-900/40">
              <h4 className="font-semibold text-white mb-4">📊 SIP Allocation by Asset Class</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {fire.sip_by_category.map((cat, i) => (
                  <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3">
                    <p className="text-slate-400 text-xs mb-1">{cat.category}</p>
                    <p className="text-emerald-400 font-bold font-mono-custom">₹{fmt(cat.amount)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Insurance Gap */}
          {fire.insurance_gap && (
            <div className="glass-card rounded-2xl p-5 border border-amber-500/20 bg-amber-500/5">
              <h4 className="font-semibold text-amber-300 mb-3">🛡️ Insurance Gap Analysis</h4>
              <p className="text-sm text-amber-100/80 mb-4">{fire.insurance_gap.rationale}</p>
              <div className="flex gap-6">
                <div>
                  <p className="text-xs text-amber-200/50 uppercase">Recommended Term Cover</p>
                  <p className="text-xl font-bold text-amber-400">₹{fmt(fire.insurance_gap.recommended_term_cover)}</p>
                </div>
                <div>
                  <p className="text-xs text-amber-200/50 uppercase">Recommended Health Cover</p>
                  <p className="text-xl font-bold text-amber-400">₹{fmt(fire.insurance_gap.recommended_health_cover)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Glidepath */}
          {fire.asset_allocation_glidepath && (
            <div className="glass-card rounded-2xl p-5 border border-white/5">
              <h4 className="font-semibold text-white mb-3">📉 Asset Allocation Glidepath (Equity % to Debt %)</h4>
              <div className="flex flex-wrap gap-2 text-sm text-center">
                {fire.asset_allocation_glidepath.map((gl, i) => (
                  <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-2 min-w-[80px]">
                    <div className="text-slate-400 text-xs mb-1">Age {gl.age}</div>
                    <div className="flex bg-slate-900 rounded-full h-2 overflow-hidden mb-1">
                      <div className="bg-blue-500 h-full" style={{ width: `${gl.equity}%` }}></div>
                      <div className="bg-orange-500 h-full" style={{ width: `${gl.debt}%` }}></div>
                    </div>
                    <div className="text-[10px] text-slate-300">{gl.equity} / {gl.debt}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chart */}
          <div className="glass-card rounded-3xl p-7 border border-white/5">
            <h3 className="font-bold text-white mb-1 flex items-center gap-2"><TrendingUp size={18} className="text-blue-400" />Year-by-Year Cohort Projection (12% Return)</h3>
            <p className="text-xs text-slate-500 mb-5">Compound interest exponential growth curve vs. linear target goal progression.</p>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={fire.year_by_year} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gPort" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="year" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `Yr ${v}`} />
                  <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', fontSize: '13px' }}
                    formatter={(v, n) => [`₹${fmt(v)}`, n === 'corpus' ? 'Projected Corp' : 'Linear Tgt']} />
                  <Area type="monotone" dataKey="corpus" stroke="#3b82f6" strokeWidth={2.5} fill="url(#gPort)" dot={false} />
                  <Area type="monotone" dataKey="target" stroke="#10b981" strokeWidth={2} strokeDasharray="4 4" fill="none" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <button onClick={() => setResult(null)} className="text-sm text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 px-5 py-2.5 rounded-xl transition-all">
            ← Edit Inputs & Recalculate
          </button>
        </div>
      )}
    </ToolShell>
  )
}

export default FirePlanTool
