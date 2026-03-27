import { useState, useRef } from 'react'
import axios from 'axios'
import { UploadCloud, CheckCircle2, AlertTriangle, FileText, Loader2, ArrowRight, Sparkles, X } from 'lucide-react'
import { API } from '../../App'

export default function PortfolioXRayTool() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [validationWarning, setValidationWarning] = useState(null)
  const fileInputRef = useRef(null)

  // File validation function
  const validateFile = (selectedFile) => {
    setError(null)
    setValidationWarning(null)

    if (!selectedFile) {
      setError("❌ No file selected")
      return false
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (selectedFile.size > maxSize) {
      setError("❌ File size exceeds 10MB limit")
      return false
    }

    // Check file extension
    const validExtensions = ['pdf', 'csv', 'xlsx', 'xls']
    const fileExtension = selectedFile.name.split('.').pop().toLowerCase()
    
    if (!validExtensions.includes(fileExtension)) {
      setError("❌ Invalid file format. Please upload PDF, CSV, or XLSX file")
      return false
    }

    // Check minimum file size (avoid empty files)
    if (selectedFile.size < 100) {
      setError("❌ File is too small. Please upload a valid portfolio statement")
      return false
    }

    // For CSV files, do basic content validation
    if (fileExtension === 'csv') {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target.result
        const lines = content.split('\n')
        
        // Check if file has portfolio-like headers
        const portfolioKeywords = ['fund', 'investment', 'holdings', 'scheme', 'amount', 'quantity', 'nav', 'value']
        const headerLine = lines[0].toLowerCase()
        
        const hasPortfolioData = portfolioKeywords.some(keyword => headerLine.includes(keyword))
        
        if (!hasPortfolioData && lines.length < 2) {
          setValidationWarning("⚠️ Warning: This might not be a valid portfolio statement. It lacks expected portfolio data. Continue anyway?")
          return false
        }
      }
      reader.readAsText(selectedFile)
    }

    // For XLSX, we can't validate content here without a library, but we can warn
    if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      setValidationWarning("ℹ️ Please ensure this is a mutual fund/portfolio statement file for accurate analysis")
    }

    return true
  }

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile)
    } else {
      setFile(null)
      fileInputRef.current.value = ''
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError("❌ Please select a file to upload")
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
            file_name: file.name,
            file_size: file.size
          }
          
          console.log(`📤 Uploading file: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`)
          const { data } = await axios.post(`${API}/api/portfolio-xray`, payload, {
            timeout: 30000
          })
          
          // Check if request was successful
          if (data.status === "error") {
            setError(`❌ ${data.message}`)
            setLoading(false)
            return
          }
          
          // Validate response has expected fields
          if (!data.metrics || !data.portfolio) {
            setError("❌ Invalid response from server. The file might not be a valid portfolio statement.")
            setLoading(false)
            return
          }
          
          console.log("✅ Analysis complete")
          setResult(data)
        } catch (err) {
          console.error("Upload error:", err)
          // Handle validation error from backend
          if (err.response?.status === 400 && err.response?.data?.message) {
            setError(`❌ ${err.response.data.message}`)
          } else if (err.response?.data?.error) {
            setError(`❌ ${err.response.data.error}`)
          } else if (err.message === "timeout of 30000ms exceeded") {
            setError("❌ Analysis took too long. The file might be too large or complex.")
          } else {
            setError("❌ Failed to process portfolio statement. Please ensure it's a valid mutual fund statement.")
          }
        } finally {
          setLoading(false)
        }
      }
      reader.readAsDataURL(file)
    } catch (err) {
      console.error("File read error:", err)
      setError("❌ Failed to read file. Please try again.")
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setError(null)
    setValidationWarning(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="max-w-4xl mx-auto">

      {!result ? (
        <div className="space-y-6">

          <div style={{
            border: '2px dashed #6366f1',
            borderRadius: '16px',
            padding: '32px',
            textAlign: 'center',
            backgroundColor: 'rgba(99, 102, 241, 0.05)'
          }}>
            <UploadCloud style={{ margin: '0 auto 16px', color: '#818cf8' }} size={56} />
            
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#e2e8f0', marginBottom: '8px' }}>
              📁 Upload Your Portfolio Statement
            </h3>
            
            <p style={{ color: '#94a3b8', marginBottom: '20px', fontSize: '14px' }}>
              Supported formats: PDF, CSV, XLSX from CAMS, KFintech, or your mutual fund portal
            </p>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.csv,.xlsx,.xls"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />

            {/* Custom styled button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: '12px 32px',
                backgroundColor: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background-color 0.3s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#4338ca'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#4f46e5'}
            >
              <FileText size={20} />
              Choose File
            </button>

            {file && (
              <div style={{
                marginTop: '20px',
                padding: '12px',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: '#86efac'
              }}>
                <span>
                  ✅ <strong>{file.name}</strong> ({(file.size / 1024).toFixed(2)} KB)
                </span>
                <button
                  onClick={handleReset}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#86efac',
                    cursor: 'pointer',
                    fontSize: '18px'
                  }}
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {validationWarning && (
            <div style={{
              backgroundColor: 'rgba(251, 146, 60, 0.1)',
              border: '1px solid rgba(251, 146, 60, 0.3)',
              color: '#fed7aa',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '14px'
            }}>
              ℹ️ {validationWarning}
            </div>
          )}

          {error && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={loading || !file}
            style={{
              width: '100%',
              padding: '14px 20px',
              backgroundColor: file && !loading ? '#4f46e5' : '#64748b',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: file && !loading ? 'pointer' : 'not-allowed',
              opacity: loading || !file ? 0.5 : 1,
              transition: 'background-color 0.3s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              if (file && !loading) e.target.style.backgroundColor = '#4338ca'
            }}
            onMouseLeave={(e) => {
              if (file && !loading) e.target.style.backgroundColor = '#4f46e5'
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                Analyzing Portfolio...
              </>
            ) : (
              <>
                <ArrowRight size={18} />
                Run X-Ray Analysis
              </>
            )}
          </button>

        </div>
      ) : (
        <div className="space-y-6">

          <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-6">
            <h3 className="text-lg font-bold text-indigo-400 mb-6">📊 Portfolio X-Ray Results</h3>
            
            {result.metrics && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-800/50 p-4 rounded-lg">
                  <p className="text-slate-400 text-sm mb-1">True XIRR</p>
                  <p className="text-2xl font-bold text-green-400">{(result.metrics.true_xirr_percent || 0).toFixed(2)}%</p>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-lg">
                  <p className="text-slate-400 text-sm mb-1">vs Nifty 50</p>
                  <p className="text-2xl font-bold text-blue-400">{(result.metrics.benchmark_xirr_percent || 0).toFixed(2)}%</p>
                </div>
                {result.metrics.avg_expense_ratio && (
                  <div className="bg-slate-800/50 p-4 rounded-lg">
                    <p className="text-slate-400 text-sm mb-1">Avg Expense Ratio</p>
                    <p className="text-xl font-bold text-orange-400">{result.metrics.avg_expense_ratio.toFixed(2)}%</p>
                  </div>
                )}
              </div>
            )}
            
            {result.overlap_warnings && result.overlap_warnings.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-yellow-400 text-sm mb-2">⚠️ Overlap Warnings:</h4>
                <ul className="text-slate-300 text-sm space-y-1">
                  {result.overlap_warnings.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>
            )}
            
            {result.rebalancing_plan && result.rebalancing_plan.length > 0 && (
              <div>
                <h4 className="font-semibold text-green-400 text-sm mb-2">✅ Rebalancing Strategy:</h4>
                <ul className="text-slate-300 text-sm space-y-1">
                  {result.rebalancing_plan.map((p, i) => <li key={i}>→ {p}</li>)}
                </ul>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setResult(null)
              handleReset()
            }}
            className="w-full border border-indigo-500/50 px-4 py-3 rounded hover:bg-slate-700"
          >
            🔄 Analyze Another Portfolio
          </button>

        </div>
      )}

    </div>
  )
}