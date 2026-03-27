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
    setLoading(true)
    setError(null)

    try {
      const payload = { statement_base64: "mock_base_64_content" }
      const { data } = await axios.post(`${API}/api/portfolio-xray`, payload)
      setResult(data)
    } catch (err) {
      console.error(err)
      setError("Failed to process mutual fund statement.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">

      {!result ? (
        <div className="space-y-6">

          <input
            type="file"
            accept=".pdf, .csv"
            onChange={e => setFile(e.target.files[0])}
          />

          {error && <div className="text-red-400">{error}</div>}

          <button
            onClick={handleUpload}
            className="w-full py-3 bg-indigo-600 text-white rounded"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Run X-Ray"}
          </button>

        </div>
      ) : (
        <div className="space-y-4">

          <div>XIRR: {result.metrics?.true_xirr_percent}%</div>

          <button
            onClick={() => setResult(null)}
            className="border px-4 py-2 rounded"
          >
            Reset
          </button>

        </div>
      )}

    </div>
  )
}