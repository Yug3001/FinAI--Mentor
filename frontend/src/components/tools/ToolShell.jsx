/* Shared wrapper for all tool pages */
import { ArrowLeft, AlertCircle } from 'lucide-react'

const ToolShell = ({ title, subtitle, icon: Icon, iconColor, error, onBack, children }) => (
  <div className="max-w-5xl mx-auto space-y-8 py-6">
    {/* Tool header */}
    <div className="flex items-start gap-4">
      <div className="p-3 rounded-2xl border border-white/10 shrink-0" style={{ background: iconColor + '20' }}>
        <Icon size={26} style={{ color: iconColor }} />
      </div>
      <div>
        <h2 className="text-3xl font-extrabold text-white">{title}</h2>
        <p className="text-slate-400 mt-0.5">{subtitle}</p>
      </div>
    </div>

    {/* Error */}
    {error && (
      <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-300 text-sm">
        <AlertCircle size={18} className="shrink-0" />
        {error}
      </div>
    )}

    {children}
  </div>
)

export default ToolShell
