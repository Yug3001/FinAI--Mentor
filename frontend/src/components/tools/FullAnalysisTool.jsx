import { useState } from 'react'
import axios from 'axios'
import { LayoutGrid, Loader2, Download } from 'lucide-react'
import ToolShell from './ToolShell'
import Dashboard from '../Dashboard'
import { API } from '../../App'
import { downloadPDF } from '../../utils/pdfDownload'

const FullAnalysisTool = () => {
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
    setLoading(true)
    setError(null)

    try {
      const r = await axios.post(`${API}/api/analyze`, form)
      setResult(r.data)
    } catch (err) {
      console.error(err)
      setError('Failed to reach backend. Please try again.')
    } finally {
      setLoading(false)
    }
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Monthly Income</label>
                <input type="number" value={form.monthly_income} onChange={e => set('monthly_income', e.target.value)} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white" placeholder="₹0" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Monthly Expenses</label>
                <input type="number" value={form.monthly_expenses} onChange={e => set('monthly_expenses', e.target.value)} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white" placeholder="₹0" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Total Debt</label>
                <input type="number" value={form.total_debt} onChange={e => set('total_debt', e.target.value)} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white" placeholder="₹0" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Total Investments</label>
                <input type="number" value={form.total_investments} onChange={e => set('total_investments', e.target.value)} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white" placeholder="₹0" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Emergency Fund</label>
                <input type="number" value={form.emergency_fund} onChange={e => set('emergency_fund', e.target.value)} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white" placeholder="₹0" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Retirement Target</label>
                <input type="number" value={form.retirement_target} onChange={e => set('retirement_target', e.target.value)} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white" placeholder="₹0" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Annual Income</label>
                <input type="number" value={form.annual_income} onChange={e => set('annual_income', e.target.value)} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white" placeholder="₹0" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Section 80C Deduction</label>
                <input type="number" value={form.deduction_80c} onChange={e => set('deduction_80c', e.target.value)} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white" placeholder="₹0" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Section 80D (Medical)</label>
                <input type="number" value={form.deduction_80d} onChange={e => set('deduction_80d', e.target.value)} className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white" placeholder="₹0" />
              </div>
            </div>

          </div>

          <button type="submit" disabled={loading} className="w-full py-4 bg-orange-500 text-white rounded-xl">
            {loading ? <Loader2 className="animate-spin" /> : 'Generate Plan'}
          </button>

        </form>
      ) : (
        <>
          <button
            onClick={() => downloadPDF(
              `${API}/api/download/full-analysis-pdf`,
              { data: result },
              'FinAI_Complete_Analysis_Report.pdf'
            )}
            className="mb-6 flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl transition-colors font-semibold"
          >
            <Download size={18} />
            Download Full Report
          </button>
          <Dashboard data={result} onReset={() => setResult(null)} />
        </>
      )}
    </ToolShell>
  )
}

export default FullAnalysisTool