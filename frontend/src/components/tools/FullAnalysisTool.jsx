import { useState } from 'react'
import axios from 'axios'
import { LayoutGrid, Loader2 } from 'lucide-react'
import ToolShell from './ToolShell'
import Dashboard from '../Dashboard'

const FullAnalysisTool = ({ apiBase }) => {
  const [form, setForm] = useState({
    monthly_income:      150000,
    monthly_expenses:    80000,
    total_debt:          200000,
    total_investments:   500000,
    emergency_fund:      100000,
    retirement_target:   50000000,
    years_to_retire:     20,
    annual_income:       1800000,
    deduction_80c:       150000,
    deduction_80d:       25000,
    hra_exemption:       120000,
    home_loan_interest:  0,
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v === '' ? '' : Number(v) }))

  const run = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const r = await axios.post(`${apiBase}/api/analyze`, form)
      setResult(r.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reach backend. Is Flask running?')
    } finally { setLoading(false) }
  }

  return (
    <ToolShell
      title="Complete Master Plan"
      subtitle="All 5 AI agents run simultaneously — your comprehensive financial report"
      icon={LayoutGrid}
      iconColor="#f59e0b"
      error={error}
    >
      {!result ? (
        <form onSubmit={run} className="glass-card rounded-3xl p-7 md:p-9 border border-white/5 space-y-8">
          <p className="text-slate-400 text-sm">Fill in all sections to get the complete FinAI analysis: Health Score + FIRE Plan + Tax Optimization + AI Recommendations in one unified report.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Cash Flow */}
            <div className="space-y-4 p-5 rounded-2xl bg-slate-900/40 border border-blue-500/10">
              <h4 className="text-sm font-semibold text-blue-400 uppercase tracking-wider flex items-center gap-2">💰 Cash Flow</h4>
              {[
                { k: 'monthly_income',   l: 'Monthly Income' },
                { k: 'monthly_expenses', l: 'Monthly Expenses' },
                { k: 'total_debt',       l: 'Total Debt' },
              ].map(({ k, l }) => (
                <div key={k} className="space-y-1">
                  <label className="text-xs text-slate-400">{l}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">₹</span>
                    <input type="number" min={0} value={form[k]} onChange={e => set(k, e.target.value)}
                      className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl py-2.5 pl-7 pr-3 text-white text-sm font-mono-custom outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all" />
                  </div>
                </div>
              ))}
            </div>

            {/* Assets & FIRE */}
            <div className="space-y-4 p-5 rounded-2xl bg-slate-900/40 border border-emerald-500/10">
              <h4 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">🔥 Assets & FIRE</h4>
              {[
                { k: 'total_investments', l: 'Total Investments' },
                { k: 'emergency_fund',   l: 'Emergency Fund' },
                { k: 'retirement_target',l: 'Retirement Target' },
              ].map(({ k, l }) => (
                <div key={k} className="space-y-1">
                  <label className="text-xs text-slate-400">{l}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">₹</span>
                    <input type="number" min={0} value={form[k]} onChange={e => set(k, e.target.value)}
                      className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl py-2.5 pl-7 pr-3 text-white text-sm font-mono-custom outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all" />
                  </div>
                </div>
              ))}
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Years to Retire</label>
                <input type="number" min={1} max={50} value={form.years_to_retire} onChange={e => set('years_to_retire', e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl py-2.5 px-3 text-white text-sm font-mono-custom outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all" />
              </div>
            </div>

            {/* Taxes */}
            <div className="space-y-4 p-5 rounded-2xl bg-slate-900/40 border border-purple-500/10">
              <h4 className="text-sm font-semibold text-purple-400 uppercase tracking-wider">🧾 Tax Details</h4>
              {[
                { k: 'annual_income',      l: 'Annual Gross Salary' },
                { k: 'deduction_80c',      l: '80C Investments' },
                { k: 'deduction_80d',      l: '80D Medical Premium' },
                { k: 'hra_exemption',      l: 'HRA Exemption' },
                { k: 'home_loan_interest', l: 'Home Loan Interest' },
              ].map(({ k, l }) => (
                <div key={k} className="space-y-1">
                  <label className="text-xs text-slate-400">{l}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">₹</span>
                    <input type="number" min={0} value={form[k]} onChange={e => set(k, e.target.value)}
                      className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl py-2.5 pl-7 pr-3 text-white text-sm font-mono-custom outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400
              text-white font-bold rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-60 text-base">
            {loading
              ? <><Loader2 size={20} className="animate-spin" />Running All 5 Agents…</>
              : '⚡ Generate Complete Master Plan'}
          </button>
        </form>
      ) : (
        <div className="animate-fade-up">
          <Dashboard data={result} onReset={() => setResult(null)} />
        </div>
      )}
    </ToolShell>
  )
}

export default FullAnalysisTool
