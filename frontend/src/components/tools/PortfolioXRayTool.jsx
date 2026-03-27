import { useState } from 'react'
import axios from 'axios'
import { UploadCloud, CheckCircle2, AlertTriangle, FileText, Loader2, ArrowRight, Sparkles } from 'lucide-react'

export default function PortfolioXRayTool({ apiBase }) {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleUpload = async () => {
    setLoading(true)
    setError(null)
    try {
      // Assuming mock parsing. We just pass a basic payload.
      const payload = { statement_base64: "mock_base_64_content" }
      const { data } = await axios.post(`${apiBase}/api/portfolio-xray`, payload)
      setResult(data)
    } catch (err) {
      setError("Failed to process mutual fund statement.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-indigo-500/20 mb-4 border border-indigo-500/30">
          <FileText size={28} className="text-indigo-400" />
        </div>
        <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-3">Mutual Fund X-Ray</h2>
        <p className="text-slate-400 max-w-xl mx-auto text-sm lg:text-base">
          Upload your CAMS or KFintech statement (PDF) to run an advanced 10-second diagnostic. Find hidden overlaps, true XIRR, and expense ratio drains.
        </p>
      </div>

      {!result ? (
        <div className="space-y-6">
          <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500/50 rounded-3xl p-10 flex flex-col items-center justify-center text-center transition-colors bg-slate-900/50">
            <UploadCloud size={48} className="text-indigo-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Upload Statement</h3>
            <p className="text-slate-400 text-sm mb-6 max-w-sm">
              We securely parse your CAMS/KFintech CAS in memory. No data is stored beyond this session.
            </p>
            <input 
              type="file" 
              accept=".pdf, .csv" 
              onChange={e => setFile(e.target.files[0])}
              className="block w-full max-w-xs text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20 cursor-pointer"
            />
          </div>

          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex flex-col items-center text-center">
            <span className="text-xs text-blue-400 font-bold uppercase tracking-wider mb-2">Demo Mode Available</span>
            <span className="text-sm text-slate-300">Don't have a statement handy? Just hit Analyze below to load a sample CAMS statement X-Ray.</span>
          </div>

          {error && <div className="text-red-400 text-sm text-center bg-red-500/10 py-3 rounded-xl border border-red-500/20">{error}</div>}

          <button 
            onClick={handleUpload} disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold tracking-wide rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-70"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <><Sparkles size={20} /> Run Deep X-Ray Analysis <ArrowRight size={18} /></>}
          </button>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-up">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card p-4 rounded-2xl border border-emerald-500/20">
              <div className="text-emerald-400 text-[10px] font-bold uppercase mb-1 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">True XIRR</div>
              <div className="text-2xl font-black text-white">{result.metrics.true_xirr_percent}%</div>
            </div>
            <div className="glass-card p-4 rounded-2xl border border-slate-700">
              <div className="text-slate-400 text-[10px] font-bold uppercase mb-1">vs Nifty 50</div>
              <div className="text-2xl font-black text-white">+{result.metrics.outperformance}%</div>
            </div>
            <div className="glass-card p-4 rounded-2xl border border-red-500/20">
              <div className="text-red-400 text-[10px] font-bold uppercase mb-1 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]">Expense Ratio</div>
              <div className="text-2xl font-black text-white">{result.metrics.avg_expense_ratio}%</div>
            </div>
             <div className="glass-card p-4 rounded-2xl border border-orange-500/20">
              <div className="text-orange-400 text-[10px] font-bold uppercase mb-1">10y Fee Loss</div>
              <div className="text-2xl font-black text-amber-200">₹{(result.metrics.projected_expense_drag_10yr/100000).toFixed(2)}L</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Reconstruction */}
            <div className="glass-card p-6 rounded-3xl border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4">Reconstructed Portfolio</h3>
              <div className="space-y-3">
                {result.portfolio.map((fund, i) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div>
                      <div className="text-white text-sm font-bold">{fund.fund}</div>
                      <div className="text-xs text-slate-500">{fund.category}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-indigo-400 font-bold">{fund.allocation}%</div>
                      <div className="text-xs text-emerald-500">{fund.xirr}% XIRR</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Overlap & Actions */}
            <div className="space-y-6">
              <div className="glass-card p-6 rounded-3xl border border-amber-500/20">
                <h3 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2">
                  <AlertTriangle size={18} /> Overlap & Risk Analysis
                </h3>
                <ul className="space-y-2">
                  {result.overlap_analysis.map((o, i) => (
                    <li key={i} className="text-sm text-amber-200 leading-relaxed bg-amber-500/10 p-3 rounded-lg border border-amber-500/10">{o}</li>
                  ))}
                </ul>
              </div>

              <div className="glass-card p-6 rounded-3xl border border-blue-500/20">
                <h3 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-2">
                  <CheckCircle2 size={18} /> Recommended Actions
                </h3>
                <ul className="space-y-2">
                  {result.rebalancing_plan.map((r, i) => (
                    <li key={i} className="text-sm text-slate-300 flex gap-2 items-start">
                      <div className="text-blue-500 mt-1">✓</div>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <button onClick={() => setResult(null)} className="w-full py-4 mt-4 border border-white/10 hover:bg-white/5 rounded-2xl text-slate-300 font-medium transition-colors">
            Analyze Another Statement
          </button>
        </div>
      )}
    </div>
  )
}
