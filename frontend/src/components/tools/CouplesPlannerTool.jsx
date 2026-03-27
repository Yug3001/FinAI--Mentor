import { useState } from 'react'
import axios from 'axios'
import { Users, ArrowRight, Loader2, Sparkles, TrendingUp, ShieldAlert, HeartHandshake } from 'lucide-react'
import { InputsSummary } from './HealthScoreTool'

export default function CouplesPlannerTool({ apiBase, onBack }) {
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
      const { data } = await axios.post(`${apiBase}/api/couples-plan`, payload)
      setResult({ ...data, _inputs: payload })
    } catch (err) {
      setError("Failed to run couple's analysis.")
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
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase">Annual Income (₹)</label>
          <input type="number" value={state.income} onChange={e => setState({...state, income: e.target.value === '' ? '' : Number(e.target.value)})} className="w-full bg-slate-900 border border-slate-700/50 rounded-xl px-4 py-3 mt-1.5 text-white" placeholder="e.g. 1500000" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase">Existing Savings (₹)</label>
          <input type="number" value={state.savings} onChange={e => setState({...state, savings: e.target.value === '' ? '' : Number(e.target.value)})} className="w-full bg-slate-900 border border-slate-700/50 rounded-xl px-4 py-3 mt-1.5 text-white" placeholder="e.g. 500000" />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase">Net Worth (₹)</label>
          <input type="number" value={state.net_worth} onChange={e => setState({...state, net_worth: e.target.value === '' ? '' : Number(e.target.value)})} className="w-full bg-slate-900 border border-slate-700/50 rounded-xl px-4 py-3 mt-1.5 text-white" placeholder="e.g. 2000000"/>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase">Monthly SIP Target (₹)</label>
          <input type="number" value={state.sip_target} onChange={e => setState({...state, sip_target: e.target.value === '' ? '' : Number(e.target.value)})} className="w-full bg-slate-900 border border-slate-700/50 rounded-xl px-4 py-3 mt-1.5 text-white" placeholder="e.g. 25000"/>
        </div>
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-pink-500/20 mb-4 border border-pink-500/30">
          <HeartHandshake size={28} className="text-pink-400" />
        </div>
        <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-3">Couple's Money Planner</h2>
        <p className="text-slate-400 max-w-xl mx-auto text-sm lg:text-base">
          Optimize your joint finances. Share tax burdens, calculate ideal SIP splits based on income ratio, and plan a unified path to financial independence.
        </p>
      </div>

      {!result ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PartnerInput title="Partner A" state={partnerA} setState={setPartnerA} color="blue" />
            <PartnerInput title="Partner B" state={partnerB} setState={setPartnerB} color="pink" />
          </div>

          {error && <div className="text-red-400 text-sm text-center bg-red-500/10 py-3 rounded-xl border border-red-500/20">{error}</div>}

          <button 
            onClick={handleAnalyze} disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold tracking-wide rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-pink-500/20 disabled:opacity-70"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <><Sparkles size={20} /> Generate Joint Master Plan <ArrowRight size={18} /></>}
          </button>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-up">
          <InputsSummary fields={[
            { label: 'Partner A Income', value: `₹${result._inputs.partner_a.income.toLocaleString()}` },
            { label: 'Partner B Income', value: `₹${result._inputs.partner_b.income.toLocaleString()}` },
            { label: 'Combined Target SIP', value: `₹${(result._inputs.partner_a.sip_target + result._inputs.partner_b.sip_target).toLocaleString()}/mo` },
          ]} />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-card p-5 rounded-2xl border border-white/5 bg-gradient-to-br from-blue-500/10 to-transparent">
              <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Combined Income</div>
              <div className="text-2xl font-black text-white">₹{result.combined_income.toLocaleString()}</div>
            </div>
            <div className="glass-card p-5 rounded-2xl border border-white/5 bg-gradient-to-br from-pink-500/10 to-transparent">
              <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Combined Net Worth</div>
              <div className="text-2xl font-black text-white">₹{result.combined_net_worth.toLocaleString()}</div>
            </div>
            <div className="glass-card p-5 rounded-2xl border border-white/5 bg-gradient-to-br from-purple-500/10 to-transparent">
              <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Higher Earner</div>
              <div className="text-2xl font-black text-purple-400">{result.higher_earner}</div>
            </div>
          </div>

          <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 space-y-8">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2 mb-4 text-white"><TrendingUp className="text-blue-400"/> Optimal SIP Split</h3>
              <p className="text-sm text-slate-400 mb-4">To ensure liquidity is maintained proportionally per partner without forcing one partner to exhaust their savings.</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-900 border border-blue-500/20">
                  <span className="text-sm text-blue-400 font-semibold mb-1 block">Partner A Contribution</span>
                  <span className="text-2xl font-bold text-white">₹{result.optimal_sip_split.partner_a.toLocaleString()} / mo</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-pink-500/20">
                  <span className="text-sm text-pink-400 font-semibold mb-1 block">Partner B Contribution</span>
                  <span className="text-2xl font-bold text-white">₹{result.optimal_sip_split.partner_b.toLocaleString()} / mo</span>
                </div>
              </div>
            </div>

            <div className="h-px w-full bg-white/5" />

            <div>
              <h3 className="text-xl font-bold flex items-center gap-2 mb-4 text-white"><ShieldAlert className="text-emerald-400"/> Tax & Insurance Strategy</h3>
              <ul className="space-y-3">
                {result.tax_strategy.map((strat, i) => (
                  <li key={i} className="flex flex-col gap-1 p-3 rounded-xl bg-slate-900/50 border border-emerald-500/10">
                    <span className="text-emerald-400 font-bold text-xs uppercase tracking-wider">Strategy {i+1}</span>
                    <span className="text-sm text-slate-300">{strat}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-200">
                <strong>Insurance Note:</strong> {result.insurance_suggestion}
              </div>
            </div>
          </div>

          <button onClick={() => setResult(null)} className="w-full py-3 border border-white/10 hover:bg-white/5 rounded-2xl text-slate-300 transition-colors">
            Recalculate
          </button>
        </div>
      )}
    </div>
  )
}

const UserIcon = ({ color }) => (
  <div className={`p-2 rounded-xl bg-${color}-500/20`}>
    <Users size={18} className={`text-${color}-400`} />
  </div>
)
