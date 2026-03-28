import { useState } from 'react'
import axios from 'axios'
import { FileText, Loader2, Download } from 'lucide-react'
import ToolShell from './ToolShell'
import { InputsSummary } from './HealthScoreTool'
import { API } from '../../App'
import { downloadPDF } from '../../utils/pdfDownload'

const FIELDS = [
  { key: 'annual_income', label: 'Annual Gross Income' },
  { key: 'deduction_80c', label: '80C Deduction' },
  { key: 'deduction_80d', label: '80D Medical' },
  { key: 'hra_exemption', label: 'HRA Exemption' },
  { key: 'home_loan_interest', label: 'Home Loan Interest' },
  { key: 'nps_80ccd1b', label: 'NPS 80CCD(1B)' },
]

const TaxWizardTool = () => {
  const [form, setForm] = useState({
    annual_income: 1500000,
    deduction_80c: 100000,
    deduction_80d: 0,
    hra_exemption: 0,
    home_loan_interest: 0,
    nps_80ccd1b: 0,
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
      const r = await axios.post(`${API}/api/tax`, form)
      setResult(r.data.result || r.data)
    } catch (err) {
      console.error(err)
      setError('Failed to reach backend. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ToolShell title="Tax Wizard" icon={FileText} error={error}>

      {!result ? (
        <form onSubmit={run} className="space-y-4">

          {FIELDS.map(f => (
            <div key={f.key} className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">{f.label}</label>
              <input
                type="number"
                value={form[f.key]}
                onChange={e => set(f.key, e.target.value)}
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500"
                placeholder={`Enter ${f.label.toLowerCase()}`}
              />
            </div>
          ))}

          <button type="submit" className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold transition-colors">
            {loading ? <Loader2 className="animate-spin inline mr-2" /> : '💰 Calculate Tax'}
          </button>

        </form>
      ) : (
        <div className="space-y-6">
          <InputsSummary form={form} fields={FIELDS} />

          <div className="glass-card rounded-2xl p-6 border border-white/5">
            <p className="text-slate-400 text-sm mb-2">Best Tax Regime</p>
            <p className="text-3xl font-bold text-white font-mono-custom">{result.better_regime} Regime</p>
            <p className="text-sm text-emerald-400 mt-2">Annual Savings: ₹{(result.savings_with_better || 0).toLocaleString('en-IN')}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
              <p className="text-slate-400 text-xs mb-1">Old Regime Tax</p>
              <p className="text-xl font-bold text-red-400">₹{(result.old_tax || 0).toLocaleString('en-IN')}</p>
            </div>
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4">
              <p className="text-slate-400 text-xs mb-1">New Regime Tax</p>
              <p className="text-xl font-bold text-emerald-400">₹{(result.new_tax || 0).toLocaleString('en-IN')}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => downloadPDF(
                `${API}/api/download/tax-plan-pdf`,
                { result, input_data: form },
                'FinAI_Tax_Plan_Report.pdf'
              )}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-colors"
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

export default TaxWizardTool