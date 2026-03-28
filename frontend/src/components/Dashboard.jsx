import {
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  AreaChart, Area, BarChart, Bar, Cell
} from 'recharts'
import {
  ShieldCheck, TrendingUp, AlertTriangle, ShieldAlert,
  Sparkles, Receipt, RefreshCw, Target, Wallet, Clock, Info
} from 'lucide-react'

/* ─── helpers ─────────────────────────────────────── */
const fmt = (n) => Number(n || 0).toLocaleString('en-IN')

const scoreInfo = (score) => {
  if (score >= 80) return { label: 'Excellent', color: '#10b981', ring: '#10b981', text: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20' }
  if (score >= 65) return { label: 'Good',      color: '#f59e0b', ring: '#f59e0b', text: 'text-amber-400',   bg: 'bg-amber-400/10 border-amber-400/20' }
  if (score >= 45) return { label: 'Fair',      color: '#eab308', ring: '#eab308', text: 'text-yellow-400',  bg: 'bg-yellow-400/10 border-yellow-400/20' }
  return               { label: 'Needs Work',   color: '#ef4444', ring: '#ef4444', text: 'text-red-400',     bg: 'bg-red-400/10 border-red-400/20' }
}

/* ─── sub-components ──────────────────────────────── */
const MetricCard = ({ title, value, sub, icon: Icon, accent }) => (
  <div className="relative glass-card rounded-2xl p-6 overflow-hidden group hover:scale-[1.02] transition-transform duration-200">
    <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-10 blur-xl" style={{ background: accent }} />
    <div className="flex justify-between items-start mb-5">
      <p className="text-slate-400 text-sm font-medium">{title}</p>
      <div className="p-2 rounded-xl border border-white/10" style={{ background: accent + '20' }}>
        <Icon size={18} style={{ color: accent }} />
      </div>
    </div>
    <h3 className="text-2xl font-bold font-mono-custom text-white mb-1">{value}</h3>
    {sub && <p className="text-xs text-slate-500">{sub}</p>}
  </div>
)

const InsightBadge = ({ msg, type }) => {
  const styles = {
    success:  { bg: 'bg-emerald-500/10 border-emerald-500/20', icon: <ShieldCheck size={16} className="text-emerald-400 shrink-0 mt-0.5" />, text: 'text-emerald-100' },
    warning:  { bg: 'bg-red-500/10     border-red-500/20',     icon: <ShieldAlert  size={16} className="text-red-400     shrink-0 mt-0.5" />, text: 'text-red-200' },
    improve:  { bg: 'bg-amber-500/10   border-amber-500/20',   icon: <AlertTriangle size={16} className="text-amber-400     shrink-0 mt-0.5" />, text: 'text-amber-200' },
  }
  const s = styles[type]
  return (
    <div className={`flex gap-3 p-3 rounded-xl border text-sm leading-relaxed ${s.bg}`}>
      {s.icon}
      <span className={s.text}>{msg}</span>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card border border-white/10 rounded-xl px-4 py-3 text-sm shadow-xl">
        <p className="text-slate-400 mb-1">{label}</p>
        <p className="text-white font-bold font-mono-custom">₹{fmt(payload[0].value)}</p>
      </div>
    )
  }
  return null
}

const ALL_FIELDS = [
  { key: 'monthly_income',   label: 'Income' },
  { key: 'monthly_expenses', label: 'Expenses' },
  { key: 'total_investments',label: 'Investments' },
  { key: 'total_debt',       label: 'Debt' },
  { key: 'emergency_fund',   label: 'Emg Fund' },
  { key: 'annual_income',    label: 'Annual Sal' },
  { key: 'deduction_80c',    label: '80C' },
  { key: 'years_to_retire',  label: 'Yrs Retire' },
]

export const InputsSummaryDashboard = ({ form }) => {
  if (!form) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-800/40 border border-slate-700/50 rounded-2xl mb-6 text-xs">
      <div className="text-slate-500 font-medium flex items-center gap-1.5 mr-2">
        <Info size={14} /> Global Inputs Provided:
      </div>
      {ALL_FIELDS.map(f => {
        if (form[f.key] === undefined || form[f.key] === null) return null;
        return (
          <div key={f.key} className="flex items-center gap-1.5 bg-slate-900/50 px-2.5 py-1 rounded-xl border border-white/5">
            <span className="text-slate-400">{f.label}:</span>
            <span className="text-white font-mono-custom font-medium">{f.key === 'years_to_retire' ? form[f.key] : '₹' + fmt(form[f.key])}</span>
          </div>
        )
      })}
    </div>
  )
}

/* ─── main component ──────────────────────────────── */
const Dashboard = ({ data, onReset }) => {
  const { financial_health, tax_optimization, fire_plan, recommendations, input_data } = data

  const score = financial_health.health_score || 0
  const si = scoreInfo(score)

  /* portfolio growth chart */
  const chartData = fire_plan.year_by_year || []

  /* tax comparison */
  const taxData = [
    { name: 'Old Regime', tax: Number(tax_optimization.old_tax) || 0, fill: '#ef4444' },
    { name: 'New Regime', tax: Number(tax_optimization.new_tax) || 0, fill: '#10b981' }
  ]

  const circumference = 2 * Math.PI * 42          // r=42
  const offset = circumference - (circumference * score) / 100

  return (
    <div className="space-y-7 animate-fade-up">

      {/* Confirm Inputs Display */}
      <InputsSummaryDashboard form={input_data} />

      {/* ── Top stats bar ── */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-5 glass rounded-3xl p-6 border border-white/5">

        {/* Score Ring */}
        <div className="flex items-center gap-6">
          <div className="relative w-28 h-28 shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="42" strokeWidth="8" stroke="#1e293b" fill="transparent" />
              <circle
                cx="50" cy="50" r="42" strokeWidth="8" fill="transparent"
                stroke={si.ring}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1.2s ease-in-out', filter: `drop-shadow(0 0 8px ${si.ring}88)` }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold font-mono-custom" style={{ color: si.ring }}>{score}</span>
              <span className="text-[10px] text-slate-400 font-medium">/100</span>
            </div>
          </div>
          <div>
            <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border mb-2 ${si.bg} ${si.text}`}>
              <Sparkles size={11} />
              {financial_health.grade || si.label}
            </div>
            <h2 className="text-2xl font-bold text-white">Money Health Score</h2>
            <p className="text-sm text-slate-400">Calculated specifically for your exact inputs across 6 factors.</p>
          </div>
        </div>

        <button
          onClick={onReset}
          className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl transition-colors border border-slate-700 text-sm"
        >
          <RefreshCw size={16} /> Edit Inputs
        </button>
      </div>

      {/* ── 4 Metric cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Net Worth"
          value={`₹${(financial_health.net_worth / 100000).toFixed(2)}L`}
          sub="Assets minus liabilities"
          icon={Wallet}
          accent="#8b5cf6"
        />
        <MetricCard
          title="Debt-to-Income"
          value={`${financial_health.debt_ratio_percent}%`}
          sub={financial_health.debt_ratio_percent > 35 ? '⚠️ High burden' : '✅ Within safe limit'}
          icon={AlertTriangle}
          accent={financial_health.debt_ratio_percent > 35 ? '#ef4444' : '#10b981'}
        />
        <MetricCard
          title="Emergency Fund"
          value={`${financial_health.emergency_preparedness_months} mo`}
          sub={`₹${fmt(financial_health.monthly_emf_gap)} shortfall`}
          icon={ShieldCheck}
          accent="#6366f1"
        />
        <MetricCard
          title="Best Tax Regime"
          value={tax_optimization.better_regime}
          sub={`Saves ₹${fmt(tax_optimization.savings_with_better)}`}
          icon={Receipt}
          accent="#8b5cf6"
        />
      </div>

      {/* ── Main two-column ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">

        {/* FIRE Chart */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-7 border border-white/5 flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-6">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <TrendingUp size={20} className="text-blue-400" />
                FIRE Growth Projection (12%)
              </h3>
              <p className="text-sm text-slate-400 mt-1">Projected compounding curve vs. target trajectory</p>
            </div>
            <div className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full border ${fire_plan.is_on_track ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
              <Target size={14} />
              {fire_plan.is_on_track ? 'On Track ✓' : 'Gap Detected'}
            </div>
          </div>

          {/* SIP Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-4">
              <p className="text-slate-400 text-xs mb-1">Target Corpus (Adj.)</p>
              <p className="text-white font-bold font-mono-custom text-lg">₹{fmt(fire_plan.inflation_adjusted_target || fire_plan.target_corpus)}</p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
              <p className="text-slate-400 text-xs mb-1">Present Value (FV)</p>
              <p className="text-blue-300 font-bold font-mono-custom text-lg">₹{fmt(fire_plan.current_investments_future_value)}</p>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 col-span-2 sm:col-span-1">
              <p className="text-slate-400 text-xs mb-1">Required Monthly SIP</p>
              <p className="text-emerald-400 font-bold font-mono-custom text-lg">₹{fmt(Math.ceil(fire_plan.monthly_sip_required))}</p>
            </div>
          </div>

          {/* Area Chart */}
          <div className="h-[220px] w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 15, left: 5, bottom: 0 }}>
                <defs>
                  <linearGradient id="colPort" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colTarget" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="year" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => 'Yr ' + v} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false}
                  tickFormatter={v => `₹${(v / 100000).toFixed(0)}L`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="corpus" stroke="#3b82f6" strokeWidth={2.5}
                  fill="url(#colPort)" name="Portfolio" dot={false} />
                <Area type="monotone" dataKey="target"    stroke="#10b981" strokeWidth={2}
                  fill="none" strokeDasharray="4 4" name="Target" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-6 mt-3 justify-center">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="w-4 h-0.5 bg-blue-500 rounded" /> Projected Portfolio
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="w-4 h-0.5 bg-emerald-500 rounded border-dashed" /> Target Path
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-6">

          {/* AI Insights */}
          <div className="relative glass-card rounded-3xl p-6 border border-white/5 overflow-hidden">
            <div className="absolute top-0 right-0 opacity-5 pointer-events-none">
              <Sparkles size={120} />
            </div>
            <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2 relative">
              <Sparkles size={18} className="text-yellow-400" />
              AI Synthesized Advice
            </h3>
            <div className="space-y-3 relative">
              {recommendations?.suggestions?.map((m, i) => <InsightBadge key={i} msg={m} type="success" />)}
              {recommendations?.warnings?.map((m, i)   => <InsightBadge key={i} msg={m} type="warning" />)}
              {recommendations?.improvements?.map((m, i)=> <InsightBadge key={i} msg={m} type="improve" />)}
              {!recommendations?.suggestions?.length && !recommendations?.warnings?.length && !recommendations?.improvements?.length && (
                <p className="text-slate-500 text-sm text-center py-4">No insights generated yet.</p>
              )}
            </div>
          </div>

          {/* Tax Breakdown */}
          <div className="glass-card rounded-3xl p-6 border border-white/5">
            <h3 className="font-semibold text-white mb-1 flex items-center gap-2">
              <Receipt size={17} className="text-purple-400" /> Tax Efficiency
            </h3>
            <p className="text-xs text-slate-500 mb-4">Old vs. New Regime</p>
            <div className="h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taxData} layout="vertical" margin={{ left: 10, right: 30 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={80} stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '10px', fontSize: '13px' }}
                    formatter={(v) => [`₹${fmt(v)}`, 'Tax']}
                  />
                  <Bar dataKey="tax" radius={[0, 6, 6, 0]} barSize={22}>
                    {taxData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className={`mt-4 p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${
              tax_optimization.better_regime === 'New'
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                : 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
            }`}>
              <ShieldCheck size={15} />
              {tax_optimization.better_regime} Regime saves you ₹{fmt(tax_optimization.savings_with_better)}/yr
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Dashboard
