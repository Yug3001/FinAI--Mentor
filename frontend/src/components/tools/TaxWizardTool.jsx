import { useState } from 'react'
import axios from 'axios'
import { FileText, Loader2, ShieldCheck, Receipt } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import ToolShell from './ToolShell'
import { InputsSummary } from './HealthScoreTool'

const fmt = (n) => Number(n || 0).toLocaleString('en-IN')

const FIELDS = [
  { key: 'annual_income',       label: 'Annual Gross Income' },
  { key: 'deduction_80c',       label: '80C Deduction (Max 1.5L)' },
  { key: 'deduction_80d',       label: '80D Medical (Max 50K)' },
  { key: 'hra_exemption',       label: 'HRA Exemption' },
  { key: 'home_loan_interest',  label: 'Home Loan Interest' },
  { key: 'nps_80ccd1b',         label: 'NPS Tier-1 80CCD (Max 50K)' },
]

const TaxWizardTool = ({ apiBase }) => {
  const [form, setForm] = useState({
    annual_income:      1500000,
    deduction_80c:      100000,
    deduction_80d:      0,
    hra_exemption:      0,
    home_loan_interest: 0,
    nps_80ccd1b:        0,
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v === '' ? '' : Number(v) }))

  const run = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const r = await axios.post(`${apiBase}/api/tax`, form)
      setResult(r.data.result || r.data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reach backend. Is Flask running?')
    } finally { setLoading(false) }
  }

  const barData = result ? [
    { name: 'Old Regime', tax: result.old_tax, fill: '#ef4444' },
    { name: 'New Regime', tax: result.new_tax, fill: '#10b981' },
  ] : []

  return (
    <ToolShell title="Tax Wizard" subtitle="Interactive Old vs. New regime comparison highlighting unused section deductions"
      icon={FileText} iconColor="#8b5cf6" error={error}>

      {!result ? (
        <form onSubmit={run} className="glass-card rounded-3xl p-7 border border-white/5 space-y-6">
          <p className="text-slate-400 text-sm">Fill in every deduction. We'll show you mathematically if old or new regime is better for your case.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {FIELDS.map(({ key, label }) => (
              <div key={key} className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">₹</span>
                  <input type="number" min={0} value={form[key]} onChange={e => set(key, e.target.value)}
                    className="w-full bg-slate-900/70 border border-slate-700/50 rounded-xl py-3 pl-8 pr-4 text-white text-sm font-mono-custom
                      outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/15 transition-all hover:border-slate-600" />
                </div>
              </div>
            ))}
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500
              text-white font-bold rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-purple-500/20 transition-all disabled:opacity-60 text-base">
            {loading ? <><Loader2 size={20} className="animate-spin" /> Analyzing Slabs…</> : '🧙 Generate Tax Report'}
          </button>
        </form>
      ) : (
        <div className="space-y-6 animate-fade-up">

          <InputsSummary form={form} fields={FIELDS} />

          {/* Winner banner */}
          <div className={`rounded-3xl p-7 border flex flex-col sm:flex-row items-center justify-between gap-6
            ${result.better_regime === 'New' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-blue-500/10 border-blue-500/20'}`}>
            <div className="flex items-center gap-6">
              <div className="text-5xl">🏆</div>
              <div>
                <p className="text-sm text-slate-400 mb-1">Mathematically Optimal</p>
                <h3 className="text-3xl font-extrabold text-white">{result.better_regime} Tax Regime</h3>
                <p className={`text-lg font-bold mt-1 ${result.better_regime === 'New' ? 'text-emerald-400' : 'text-blue-400'}`}>
                  Saves you ₹{fmt(result.savings_with_better)} per year (₹{fmt(result.monthly_savings_better)}/mo)
                </p>
              </div>
            </div>
          </div>

          {/* Breakdown cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`rounded-3xl p-6 border ${result.better_regime === 'Old' ? 'bg-blue-500/15 border-blue-500/30 ring-2 ring-blue-500/30' : 'glass-card border-white/5'}`}>
              <div className="mb-4">
                <p className="text-xs text-slate-400 mb-1 uppercase tracking-widest font-semibold flex items-center justify-between">
                  Old Regime Tax <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded text-[10px]">{result.old_eff_rate}% Effective</span>
                </p>
                <p className="text-4xl font-bold font-mono-custom text-red-400">₹{fmt(result.old_tax)}</p>
              </div>
              <div className="space-y-2 text-sm text-slate-300 font-mono-custom">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-500">Gross Income:</span> <span>₹{fmt(form.annual_income)}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-500">Total Deductions:</span> <span className="text-emerald-400">-₹{fmt(result.old_deductions_total)}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-500">Taxable Income:</span> <span>₹{fmt(result.old_taxable_income)}</span>
                </div>
                <div className="flex justify-between font-bold pt-1">
                  <span className="text-slate-400 font-sans">Monthly TDS:</span> <span className="text-red-300">₹{fmt(result.old_monthly_tds)}</span>
                </div>
              </div>
            </div>

            <div className={`rounded-3xl p-6 border ${result.better_regime === 'New' ? 'bg-emerald-500/15 border-emerald-500/30 ring-2 ring-emerald-500/30' : 'glass-card border-white/5'}`}>
              <div className="mb-4">
                <p className="text-xs text-slate-400 mb-1 uppercase tracking-widest font-semibold flex items-center justify-between">
                  New Regime Tax <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[10px]">{result.new_eff_rate}% Effective</span>
                </p>
                <p className="text-4xl font-bold font-mono-custom text-emerald-400">₹{fmt(result.new_tax)}</p>
              </div>
              <div className="space-y-2 text-sm text-slate-300 font-mono-custom">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-500">Gross Income:</span> <span>₹{fmt(form.annual_income)}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-500">Total Deductions:</span> <span className="text-emerald-400">-₹{fmt(result.new_deductions_total)}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-500">Taxable Income:</span> <span>₹{fmt(result.new_taxable_income)}</span>
                </div>
                <div className="flex justify-between font-bold pt-1">
                  <span className="text-slate-400 font-sans">Monthly TDS:</span> <span className="text-red-300">₹{fmt(result.new_monthly_tds)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Deduction Gaps list */}
          {result.deduction_gaps?.length > 0 && result.better_regime === 'Old' && (
            <div className="glass-card rounded-3xl p-6 border border-amber-500/20 bg-amber-500/5">
              <h4 className="font-semibold text-amber-300 mb-4 flex items-center gap-2">💰 Unused Tax Shield Capacity</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.deduction_gaps.map((gap, i) => (
                  <div key={i} className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                    <p className="font-bold text-amber-200">{gap.section}</p>
                    <p className="text-amber-100/70 text-xs mb-3">{gap.description}</p>
                    <div className="flex justify-between font-mono-custom text-sm">
                      <span className="text-slate-400 font-sans">Unused Limit</span>
                      <span className="text-emerald-300">₹{fmt(gap.unused_limit)}</span>
                    </div>
                    <div className="flex justify-between font-mono-custom text-sm font-bold border-t border-amber-500/20 pt-2 mt-2">
                      <span className="text-slate-300 font-sans">Extra Tax Saved</span>
                      <span className="text-emerald-400">~ ₹{fmt(gap.potential_tax_saving)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ranked Tax Saving Suggestions */}
          {result.ranked_suggestions && (
            <div className="glass-card rounded-3xl p-6 border border-white/5 bg-slate-900/40">
              <h4 className="font-semibold text-white mb-4">🏆 Ranked Tax-Saving Instruments</h4>
              <div className="grid grid-cols-1 gap-4">
                {result.ranked_suggestions.map((sug, i) => (
                  <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-start">
                    <div className="bg-purple-500/20 text-purple-300 font-bold px-3 py-1 rounded-lg">#{sug.rank}</div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-200 mb-1">{sug.instrument}</p>
                      <p className="text-slate-400 text-sm">{sug.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded bg-slate-700 ${sug.liquidity.includes('High') || sug.liquidity.includes('Medium') ? 'text-amber-300' : 'text-slate-400'}`}>Liquidity: {sug.liquidity.split(' ')[0]}</span>
                      <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded bg-slate-700 ${sug.risk.includes('None') ? 'text-emerald-300' : 'text-red-300'}`}>Risk: {sug.risk.split(' ')[0]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step-by-Step Verifiable Calculation */}
          {result.step_by_step && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-card rounded-2xl p-6 border border-white/5">
                <h4 className="font-semibold text-slate-300 mb-3 text-sm tracking-wide">OLD REGIME (STEP-BY-STEP)</h4>
                <ul className="space-y-2 font-mono-custom text-xs text-slate-400">
                  {result.step_by_step.old_regime.map((step, i) => (
                    <li key={i} className={`flex ${step.includes('Total') || step.includes('Net') ? 'text-emerald-400 font-bold border-t border-white/10 pt-2 mt-2' : ''}`}>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="glass-card rounded-2xl p-6 border border-white/5">
                <h4 className="font-semibold text-slate-300 mb-3 text-sm tracking-wide">NEW REGIME (STEP-BY-STEP)</h4>
                <ul className="space-y-2 font-mono-custom text-xs text-slate-400">
                  {result.step_by_step.new_regime.map((step, i) => (
                    <li key={i} className={`flex ${step.includes('Total') || step.includes('Net') ? 'text-emerald-400 font-bold border-t border-white/10 pt-2 mt-2' : ''}`}>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <button onClick={() => setResult(null)} className="text-sm text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 px-5 py-2.5 rounded-xl transition-all">
            ← Edit Inputs & Recalculate
          </button>
        </div>
      )}
    </ToolShell>
  )
}

export default TaxWizardTool
