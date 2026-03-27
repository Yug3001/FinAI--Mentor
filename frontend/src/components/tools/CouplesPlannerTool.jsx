import { useState } from 'react'
import axios from 'axios'
import { Users, ArrowRight, Loader2, Sparkles, TrendingUp, ShieldAlert, HeartHandshake } from 'lucide-react'
import { InputsSummary } from './HealthScoreTool'
import { API } from '../../App' // ✅ IMPORTANT FIX

export default function CouplesPlannerTool({ onBack }) {
  const [partnerA, setPartnerA] = useState({ income: '', savings: '', net_worth: '', sip_target: '' })
  const [partnerB, setPartnerB] = useState({ income: '', savings: '', net_worth: '', sip_target: '' })
  
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleAnalyze = async () => {
    setLoading(true)
    setError(null)

    try {
      const payload = {
        partner_a: {
          income: Number(partnerA.income) || 0,
          savings: Number(partnerA.savings) || 0,
          net_worth: Number(partnerA.net_worth) || 0,
          sip_target: Number(partnerA.sip_target) || 0,
        },
        partner_b: {
          income: Number(partnerB.income) || 0,
          savings: Number(partnerB.savings) || 0,
          net_worth: Number(partnerB.net_worth) || 0,
          sip_target: Number(partnerB.sip_target) || 0,
        }
      }

      const { data } = await axios.post(`${API}/api/couples-plan`, payload) // ✅ FIXED

      setResult({ ...data, _inputs: payload })

    } catch (err) {
      console.error(err)
      setError("❌ Failed to connect to backend. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const PartnerInput = ({ title, state, setState, color }) => (
    <div className={`p-6 rounded-3xl border border-${color}-500/20 bg-${color}-500/5`}>
      <h3 className={`text-xl font-bold text-${color}-400 mb-6 flex items-center gap-2`}>
        <UserIcon color={color} /> {title}
      </h3>

      <div className="space-y-4">
        <input type="number" value={state.income}
          onChange={e => setState({...state, income: e.target.value})}
          className="w-full input" placeholder="Income" />

        <input type="number" value={state.savings}
          onChange={e => setState({...state, savings: e.target.value})}
          className="w-full input" placeholder="Savings" />

        <input type="number" value={state.net_worth}
          onChange={e => setState({...state, net_worth: e.target.value})}
          className="w-full input" placeholder="Net Worth" />

        <input type="number" value={state.sip_target}
          onChange={e => setState({...state, sip_target: e.target.value})}
          className="w-full input" placeholder="SIP Target" />
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto">

      <h2 className="text-3xl font-bold text-center mb-6">💑 Couple Planner</h2>

      {!result ? (
        <>
          <div className="grid grid-cols-2 gap-6">
            <PartnerInput title="Partner A" state={partnerA} setState={setPartnerA} color="blue" />
            <PartnerInput title="Partner B" state={partnerB} setState={setPartnerB} color="pink" />
          </div>

          {error && <div className="text-red-400 mt-4 text-center">{error}</div>}

          <button
            onClick={handleAnalyze}
            className="mt-6 w-full py-3 bg-pink-600 rounded-xl"
          >
            {loading ? "Loading..." : "Generate Plan"}
          </button>
        </>
      ) : (
        <>
          <InputsSummary fields={[
            { label: 'Partner A Income', value: result._inputs.partner_a.income },
            { label: 'Partner B Income', value: result._inputs.partner_b.income },
          ]} />

          <button onClick={() => setResult(null)} className="mt-6 w-full border py-3 rounded-xl">
            Recalculate
          </button>
        </>
      )}

    </div>
  )
}

const UserIcon = ({ color }) => (
  <div className={`p-2 rounded-xl bg-${color}-500/20`}>
    <Users size={18} className={`text-${color}-400`} />
  </div>
)