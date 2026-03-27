import { Activity, TrendingUp, FileText, Heart, Briefcase, LayoutGrid, ArrowRight, Star, HeartHandshake, Eye } from 'lucide-react'

const TOOLS = [
  {
    id: 'health-score',
    icon: Heart,
    color: '#ef4444',
    gradient: 'from-red-500/20 to-rose-600/10',
    border: 'border-red-500/20',
    label: 'Money Health Score',
    badge: 'Most Popular',
    badgeColor: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    desc: '5-minute onboarding. Get a score across 6 dimensions: emergency fund, insurance, investments, debt, tax, and retirement.',
    time: '~2 min',
    agents: ['Financial Agent'],
  },
  {
    id: 'fire-plan',
    icon: TrendingUp,
    color: '#3b82f6',
    gradient: 'from-blue-500/20 to-indigo-600/10',
    border: 'border-blue-500/20',
    label: 'FIRE Path Planner',
    badge: 'AI Powered',
    badgeColor: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    desc: 'Build a month-by-month roadmap to financial independence. Get SIP targets, asset allocation shifts, and retirement timelines.',
    time: '~3 min',
    agents: ['Financial Agent', 'Planning Agent'],
  },
  {
    id: 'tax-wizard',
    icon: FileText,
    color: '#8b5cf6',
    gradient: 'from-purple-500/20 to-violet-600/10',
    border: 'border-purple-500/20',
    label: 'Tax Wizard',
    badge: 'Save More',
    badgeColor: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
    desc: 'Old vs. New regime comparison with your real numbers. Find every deduction you\'re missing. Ranked by risk and liquidity.',
    time: '~2 min',
    agents: ['Tax Agent'],
  },
  {
    id: 'life-event',
    icon: Activity,
    color: '#10b981',
    gradient: 'from-emerald-500/20 to-teal-600/10',
    border: 'border-emerald-500/20',
    label: 'Life Event Advisor',
    badge: 'Personalized',
    badgeColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    desc: 'Got a bonus? Getting married? New baby? AI advisor handles life-event-triggered financial decisions customized to your profile.',
    time: '~2 min',
    agents: ['Financial Agent', 'Recommendation Agent'],
  },
  {
    id: 'couples-plan',
    icon: HeartHandshake,
    color: '#ec4899',
    gradient: 'from-pink-500/20 to-fuchsia-600/10',
    border: 'border-pink-500/20',
    label: "Couple's Money Planner",
    badge: 'Joint Finance',
    badgeColor: 'text-pink-400 bg-pink-400/10 border-pink-400/20',
    desc: 'India\'s first AI joint planner. Optimize HRA across incomes, match NPS, and efficiently split SIPs for maximum household wealth.',
    time: '~4 min',
    agents: ['Couples Agent', 'Tax Agent'],
  },
  {
    id: 'portfolio-xray',
    icon: Eye,
    color: '#6366f1',
    gradient: 'from-indigo-500/20 to-blue-600/10',
    border: 'border-indigo-500/20',
    label: 'MF Portfolio X-Ray',
    badge: 'Deep Scan',
    badgeColor: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
    desc: 'Upload your CAMS/KFintech CAS statement to instantly detect overlapping stocks, expense ratio drain, and true portfolio XIRR.',
    time: '< 10 sec',
    agents: ['Portfolio Agent'],
  },
  {
    id: 'full',
    icon: LayoutGrid,
    color: '#f59e0b',
    gradient: 'from-amber-500/20 to-orange-600/10',
    border: 'border-amber-500/20',
    label: 'Complete Master Plan',
    badge: 'All-in-One',
    badgeColor: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    desc: 'Run all specialized AI agents simultaneously to get a holistic view of your financial life from every possible angle.',
    time: '~5 min',
    agents: ['All Agents'],
  },
]


const Landing = ({ onSelect, backendOk }) => {
  return (
    <div className="space-y-20 py-10">

      {/* ── Hero ── */}
      <div className="text-center space-y-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-300 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full tracking-widest uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse inline-block" />
          Multi-Agent AI System · 5 Specialists
        </div>
        <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.08]">
          Your Personal<br />
          <span className="gradient-text">AI Wealth Mentor</span>
        </h1>
        <p className="text-xl text-slate-400 leading-relaxed max-w-xl mx-auto">
          Expert-level financial planning, once exclusive to HNIs — now free for every Indian.
          Choose a tool below and let our AI agents go to work.
        </p>

        {/* Backend offline warning */}
        {backendOk === false && (
          <div className="inline-flex items-center gap-2 text-sm text-red-300 bg-red-500/10 border border-red-500/20 px-5 py-3 rounded-2xl">
            ⚠️ Backend offline — start Flask server: <code className="font-mono bg-red-500/10 px-2 py-0.5 rounded text-xs">python app.py</code>
          </div>
        )}
      </div>


      {/* ── Tool Cards ── */}
      <div>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-2">Choose Your AI Tool</h2>
          <p className="text-slate-400">Each tool runs dedicated AI agents specialized for that task. Pick what you need.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TOOLS.map((tool) => {
            const Icon = tool.icon
            return (
              <button
                key={tool.id}
                onClick={() => onSelect(tool.id)}
                className={`group relative text-left p-6 rounded-3xl border bg-gradient-to-br ${tool.gradient} ${tool.border}
                  hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 overflow-hidden
                  ${tool.id === 'full' ? 'md:col-span-2 lg:col-span-1' : ''}`}
              >
                {/* Glow on hover */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ boxShadow: `inset 0 0 60px ${tool.color}15` }} />

                {/* Badge */}
                <div className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border mb-4 ${tool.badgeColor}`}>
                  <Star size={9} />
                  {tool.badge}
                </div>

                {/* Icon + Label */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="p-2.5 rounded-2xl mb-3 w-fit border border-white/10" style={{ background: tool.color + '20' }}>
                      <Icon size={22} style={{ color: tool.color }} />
                    </div>
                    <h3 className="text-xl font-bold text-white leading-snug">{tool.label}</h3>
                  </div>
                  <ArrowRight size={20} className="text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all mt-1 shrink-0" />
                </div>

                <p className="text-sm text-slate-400 leading-relaxed mb-5">{tool.desc}</p>

                {/* Footer row */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex flex-wrap gap-1.5">
                    {tool.agents.map(a => (
                      <span key={a} className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-slate-400">{a}</span>
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium shrink-0">{tool.time}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

    </div>
  )
}

export default Landing
