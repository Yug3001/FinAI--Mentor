import { useState } from 'react'
import axios from 'axios'
import { UploadCloud, CheckCircle2, AlertTriangle, FileText, Loader2, ArrowRight, Sparkles } from 'lucide-react'
import { API } from '../../App'

export default function PortfolioXRayTool() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload")
      return
    }
    
    setLoading(true)
    setError(null)

    try {
      // Convert file to base64
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const base64 = e.target.result.split(',')[1]
          const payload = { 
            statement_base64: base64,
            file_name: file.name 
          }
          const { data } = await axios.post(`${API}/api/portfolio-xray`, payload)
          setResult(data)
        } catch (err) {
          console.error(err)
          setError("Failed to process portfolio statement.")
        } finally {
          setLoading(false)
        }
      }
      reader.readAsDataURL(file)
    } catch (err) {
      console.error(err)
      setError("Failed to read file.")
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">

      {!result ? (
        <div className="space-y-6">

          <div className="border-2 border-dashed border-indigo-500/50 rounded-xl p-8 text-center">
            <UploadCloud className="mx-auto mb-4 text-indigo-400" size={48} />
            <input
              type="file"
              accept=".pdf,.csv,.xlsx"
              onChange={e => {
                setFile(e.target.files[0])
                setError(null)
              }}
              className="text-center cursor-pointer"
            />
            <p className="text-slate-400 text-sm mt-2">PDF, CSV, or XLSX formats supported</p>
          </div>

          {error && <div className="text-red-400 bg-red-500/10 p-3 rounded">{error}</div>}

          <button
            onClick={handleUpload}
            disabled={loading || !file}
            className="w-full py-3 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? <Loader2 className="inline animate-spin mr-2" /> : <ArrowRight className="inline mr-2" size={18} />}
            {loading ? "Processing..." : "Run X-Ray Analysis"}
          </button>

        </div>
      ) : (
        <div className="space-y-6">

          <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-6">
            <h3 className="text-lg font-bold text-indigo-400 mb-4">Portfolio Analysis Results</h3>
            
            {result.metrics && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 text-sm">True XIRR</p>
                  <p className="text-2xl font-bold text-green-400">{(result.metrics.true_xirr_percent || 0).toFixed(2)}%</p>
                </div>
                {result.metrics.total_invested && (
                  <div>
                    <p className="text-slate-400 text-sm">Total Invested</p>
                    <p className="text-2xl font-bold">₹{(result.metrics.total_invested || 0).toLocaleString('en-IN')}</p>
                  </div>
                )}
              </div>
            )}
            
            {result.analysis && (
              <div className="mt-4 text-slate-300 text-sm">
                <p>{result.analysis}</p>
              </div>
            )}
          </div>

          <button
            onClick={() => setResult(null)}
            className="w-full border border-indigo-500/50 px-4 py-3 rounded hover:bg-slate-700"
          >
            Analyze Another Portfolio
          </button>

        </div>
      )}

    </div>
  )
}