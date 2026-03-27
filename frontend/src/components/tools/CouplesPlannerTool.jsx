import { useState } from 'react'
import axios from 'axios'
import { Users, ArrowRight, Loader2, Sparkles, TrendingUp, ShieldAlert, HeartHandshake } from 'lucide-react'
import { API } from '../../App'

export default function CouplesPlannerTool({ onBack }) {
  const [partnerA, setPartnerA] = useState({ income: '500000', savings: '100000', net_worth: '800000', sip_target: '50000' })
  const [partnerB, setPartnerB] = useState({ income: '450000', savings: '75000', net_worth: '600000', sip_target: '40000' })
  
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

      console.log('Sending payload:', payload)
      console.log('API URL:', `${API}/api/couples-plan`)
      
      const { data } = await axios.post(`${API}/api/couples-plan`, payload, {
        headers: { 'Content-Type': 'application/json' }
      })

      console.log('Received response:', data)
      setResult({ ...data, _inputs: payload })

    } catch (err) {
      console.error('Full error:', err)
      console.error('Error response:', err.response?.data)
      const message = err.response?.data?.error || err.message || "Failed to connect to backend"
      setError(`❌ ${message}`)
    } finally {
      setLoading(false)
    }
  }

  const PartnerInput = ({ title, state, setState, color, icon: Icon }) => {
    const borderColor = color === 'blue' ? '#3b82f6' : '#ec4899'
    const bgColor = color === 'blue' ? 'rgba(59, 130, 246, 0.05)' : 'rgba(236, 72, 153, 0.05)'
    const textColor = color === 'blue' ? '#60a5fa' : '#f472b6'
    
    return (
      <div style={{ 
        padding: '24px', 
        borderRadius: '24px', 
        border: `2px solid ${borderColor}30`,
        backgroundColor: bgColor
      }}>
        <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: textColor, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={20} /> {title}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Income</label>
            <input 
              type="number" 
              value={state.income}
              onChange={e => setState({...state, income: e.target.value})}
              style={{
                width: '100%',
                padding: '10px 12px',
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px'
              }}
              placeholder="Enter income" 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Savings</label>
            <input 
              type="number" 
              value={state.savings}
              onChange={e => setState({...state, savings: e.target.value})}
              style={{
                width: '100%',
                padding: '10px 12px',
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px'
              }}
              placeholder="Enter savings" 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>Net Worth</label>
            <input 
              type="number" 
              value={state.net_worth}
              onChange={e => setState({...state, net_worth: e.target.value})}
              style={{
                width: '100%',
                padding: '10px 12px',
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px'
              }}
              placeholder="Enter net worth" 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>SIP Target</label>
            <input 
              type="number" 
              value={state.sip_target}
              onChange={e => setState({...state, sip_target: e.target.value})}
              style={{
                width: '100%',
                padding: '10px 12px',
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px'
              }}
              placeholder="Enter SIP target" 
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1024px', margin: '0 auto' }}>

      <h2 style={{ fontSize: '32px', fontWeight: 'bold', textAlign: 'center', marginBottom: '24px' }}>💑 Couple Planner</h2>

      {!result ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
            <PartnerInput title="Partner A" state={partnerA} setState={setPartnerA} color="blue" icon={Users} />
            <PartnerInput title="Partner B" state={partnerB} setState={setPartnerB} color="pink" icon={Users} />
          </div>

          {error && <div style={{ color: '#ff6b6b', marginTop: '16px', textAlign: 'center', backgroundColor: '#ff6b6b15', padding: '12px', borderRadius: '8px' }}>{error}</div>}

          <button
            onClick={handleAnalyze}
            style={{
              marginTop: '24px',
              width: '100%',
              padding: '16px 20px',
              backgroundColor: '#ec4899',
              color: 'white',
              borderRadius: '12px',
              border: 'none',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'opacity 0.2s'
            }}
            disabled={loading}
          >
            {loading ? '⏳ Analyzing...' : '🚀 Generate Plan'}
          </button>
        </>
      ) : (
        <>
          <div style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
            <h3 style={{ fontWeight: 'bold', color: '#60a5fa', marginBottom: '12px' }}>Partner A Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px', color: '#cbd5e1' }}>
              <div>💰 Income: ₹{result._inputs.partner_a.income.toLocaleString('en-IN')}</div>
              <div>🏦 Savings: ₹{result._inputs.partner_a.savings.toLocaleString('en-IN')}</div>
              <div>📊 Net Worth: ₹{result._inputs.partner_a.net_worth.toLocaleString('en-IN')}</div>
              <div>📈 SIP Target: ₹{result._inputs.partner_a.sip_target.toLocaleString('en-IN')}</div>
            </div>
          </div>

          <div style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '12px', marginBottom: '24px' }}>
            <h3 style={{ fontWeight: 'bold', color: '#f472b6', marginBottom: '12px' }}>Partner B Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px', color: '#cbd5e1' }}>
              <div>💰 Income: ₹{result._inputs.partner_b.income.toLocaleString('en-IN')}</div>
              <div>🏦 Savings: ₹{result._inputs.partner_b.savings.toLocaleString('en-IN')}</div>
              <div>📊 Net Worth: ₹{result._inputs.partner_b.net_worth.toLocaleString('en-IN')}</div>
              <div>📈 SIP Target: ₹{result._inputs.partner_b.sip_target.toLocaleString('en-IN')}</div>
            </div>
          </div>

          {result.recommendations && (
            <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
              <h3 style={{ fontWeight: 'bold', color: '#22c55e', marginBottom: '8px' }}>💡 Recommendations</h3>
              <p style={{ color: '#cbd5e1', fontSize: '14px' }}>{result.recommendations}</p>
            </div>
          )}

          <button
            onClick={() => setResult(null)}
            style={{
              marginTop: '24px',
              width: '100%',
              padding: '12px',
              border: '1px solid #475569',
              backgroundColor: 'transparent',
              color: '#cbd5e1',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🔄 Recalculate
          </button>
        </>
      )}

    </div>
  )
}