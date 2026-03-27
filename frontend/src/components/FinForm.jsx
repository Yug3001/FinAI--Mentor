import { useState } from 'react'
import { ArrowRight, Activity, PiggyBank, Briefcase, FileText, Loader2 } from 'lucide-react'

const SectionHeader = ({ icon: Icon, title, color }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="p-2 rounded-xl border border-white/10" style={{ background: color + '20' }}>
      <Icon size={18} style={{ color }} />
    </div>
    <h3 className="font-semibold text-white text-base">{title}</h3>
  </div>
)

const Field = ({ label, field, value, onChange, prefix = '₹', min = 0 }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</label>
    <div className="relative">
      {prefix && (
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm select-none">{prefix}</span>
      )}
      <input
        type="number"
        min={min}
        value={value}
        onChange={(e) => onChange(field, Number(e.target.value))}
        className="w-full bg-slate-900/70 border border-slate-700/60 rounded-xl py-3 pr-4 text-white text-sm font-mono-custom outline-none
          focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all
          placeholder:text-slate-600 hover:border-slate-600"
        style={{ paddingLeft: prefix ? '2rem' : '1rem' }}
        required
      />
    </div>
  </div>
)

const INITIAL = {
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
}

const FinForm = ({ onSubmit, loading }) => {
  const [data, setData] = useState(INITIAL)

  const set = (field, val) => setData(prev => ({ ...prev, [field]: val }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Section header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Build Your Financial Plan</h2>
        <p className="text-slate-400 text-sm mt-1">Fill in your details. Our AI agents will analyze all 6 dimensions of your financial health.</p>
      </div>

      {/* Input grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* ── Cash Flow ── */}
        <div className="space-y-5 p-5 rounded-2xl bg-slate-800/30 border border-slate-700/30">
          <SectionHeader icon={Activity} title="Cash Flow" color="#3b82f6" />
          <Field label="Monthly Income"   field="monthly_income"   value={data.monthly_income}   onChange={set} />
          <Field label="Monthly Expenses" field="monthly_expenses" value={data.monthly_expenses} onChange={set} />
          <Field label="Total Debt"       field="total_debt"       value={data.total_debt}       onChange={set} />
        </div>

        {/* ── Wealth & FIRE ── */}
        <div className="space-y-5 p-5 rounded-2xl bg-slate-800/30 border border-slate-700/30">
          <SectionHeader icon={PiggyBank} title="Assets & Goals" color="#10b981" />
          <Field label="Total Investments"  field="total_investments"  value={data.total_investments}  onChange={set} />
          <Field label="Emergency Fund"     field="emergency_fund"     value={data.emergency_fund}     onChange={set} />
          <Field label="Retirement Target"  field="retirement_target"  value={data.retirement_target}  onChange={set} />
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Years to Retire</label>
            <input
              type="number" min={1} max={50}
              value={data.years_to_retire}
              onChange={(e) => set('years_to_retire', Number(e.target.value))}
              className="w-full bg-slate-900/70 border border-slate-700/60 rounded-xl py-3 px-4 text-white text-sm font-mono-custom outline-none
                focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all hover:border-slate-600"
              required
            />
          </div>
        </div>

        {/* ── Tax Details ── */}
        <div className="space-y-5 p-5 rounded-2xl bg-slate-800/30 border border-slate-700/30">
          <SectionHeader icon={FileText} title="Tax Details" color="#8b5cf6" />
          <Field label="Annual Gross Salary"   field="annual_income"       value={data.annual_income}       onChange={set} />
          <Field label="80C Deductions (Max 1.5L)" field="deduction_80c"  value={data.deduction_80c}       onChange={set} />
          <Field label="80D Medical (Max 50K)"     field="deduction_80d"  value={data.deduction_80d}       onChange={set} />
          <Field label="HRA Exemption"         field="hra_exemption"   value={data.hra_exemption}       onChange={set} />
          <Field label="Home Loan Interest"    field="home_loan_interest" value={data.home_loan_interest} onChange={set} />
        </div>
      </div>

      {/* Info strip */}
      <div className="mt-6 px-5 py-3 bg-blue-500/5 border border-blue-500/15 rounded-2xl flex items-center gap-3 text-xs text-slate-400">
        <Briefcase size={14} className="text-blue-400 shrink-0" />
        All data stays on your device. Our multi-agent AI analyzes your numbers locally — no data is stored without your consent.
      </div>

      {/* Submit */}
      <div className="mt-8 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="relative group overflow-hidden flex items-center gap-3 px-10 py-4 rounded-2xl font-bold text-white
            bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500
            disabled:opacity-60 disabled:cursor-not-allowed
            shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40
            transition-all duration-300 text-base"
        >
          <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          {loading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Analyzing with 5 AI Agents…
            </>
          ) : (
            <>
              Generate Master Financial Plan
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </div>
    </form>
  )
}

export default FinForm
