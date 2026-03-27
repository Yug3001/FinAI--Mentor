import { useState } from 'react'
import axios from 'axios'
import { FileText, Loader2 } from 'lucide-react'
import ToolShell from './ToolShell'
import { InputsSummary } from './HealthScoreTool'
import { API } from '../../App'

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
            <input
              key={f.key}
              type="number"
              value={form[f.key]}
              onChange={e => set(f.key, e.target.value)}
              className="w-full p-2 border rounded"
              placeholder={f.label}
            />
          ))}

          <button type="submit" className="w-full py-3 bg-purple-600 text-white rounded">
            {loading ? <Loader2 className="animate-spin" /> : 'Calculate Tax'}
          </button>

        </form>
      ) : (
        <div>

          <InputsSummary form={form} fields={FIELDS} />

          <div>Best Regime: {result.better_regime}</div>

          <button onClick={() => setResult(null)} className="mt-4 border px-4 py-2">
            Recalculate
          </button>

        </div>
      )}

    </ToolShell>
  )
}

export default TaxWizardTool