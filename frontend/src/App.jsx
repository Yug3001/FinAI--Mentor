import Landing from './components/Landing'
import { useState, useEffect } from 'react'
import axios from 'axios'
import ChatWidget from './components/ChatWidget'
import TaxWizardTool from './components/tools/TaxWizardTool'
import LifeEventTool from './components/tools/LifeEventTool'
import FullAnalysisTool from './components/tools/FullAnalysisTool'
import CouplesPlannerTool from './components/tools/CouplesPlannerTool'
import PortfolioXRayTool from './components/tools/PortfolioXRayTool'
import HealthScoreTool from './components/tools/HealthScoreTool'
import FirePlanTool from './components/tools/FirePlanTool'
import Auth from './components/Auth'
import { BrainCircuit, ArrowLeft, Sparkles, LogOut, User, ShieldAlert } from 'lucide-react'
import './App.css'

export const API = 'https://finai-mentor.onrender.com'

const TOOLS = {
  landing:       Landing,
  'health-score': HealthScoreTool,
  'fire-plan':    FirePlanTool,
  'tax-wizard':   TaxWizardTool,
  'life-event':   LifeEventTool,
  'couples-plan': CouplesPlannerTool,
  'portfolio-xray': PortfolioXRayTool,
  'full':         FullAnalysisTool,
}

function App() {
  const [activeTool, setActiveTool] = useState('landing')
  const [backendOk, setBackendOk] = useState(null)   // null=checking, true/false
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('finai_auth_user')
    return saved ? JSON.parse(saved) : null
  })

  // Check backend health on mount
  useEffect(() => {
    axios.get(`${API}/health`, { timeout: 3000 })
      .then(() => setBackendOk(true))
      .catch(() => setBackendOk(false))
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
    localStorage.setItem('finai_auth_user', JSON.stringify(userData))
    localStorage.setItem('finai_session_uid', userData.user_id)
    axios.defaults.headers.common['X-User-Id'] = userData.user_id
    setActiveTool('landing') // enforce redirect to landing page
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('finai_auth_user')
    // Generate new anonymous session
    const freshSession = 'usr_' + Math.random().toString(36).substring(2, 11)
    localStorage.setItem('finai_session_uid', freshSession)
    axios.defaults.headers.common['X-User-Id'] = freshSession
    setActiveTool('landing')
  }

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) return alert("Please upload an image smaller than 2MB.")

    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64 = reader.result
      try {
        await axios.post(`${API}/api/auth/profile-pic`, { user_id: user.user_id, profile_pic: base64 })
        const updatedUser = { ...user, profile_pic: base64 }
        setUser(updatedUser)
        localStorage.setItem('finai_auth_user', JSON.stringify(updatedUser))
      } catch (err) {
        console.error("Upload failed", err)
      }
    }
    reader.readAsDataURL(file)
  }

  if (!user) {
    return <Auth onLogin={handleLogin} apiBase={API} />
  }

  const ToolComponent = TOOLS[activeTool] || null

  return (
    <div className="min-h-screen bg-[#080c18] text-slate-100 overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Ambient blobs ── */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-15%] w-[60%] h-[60%] rounded-full bg-blue-700/10 blur-[150px]" />
        <div className="absolute bottom-[-15%] right-[-15%] w-[55%] h-[50%] rounded-full bg-indigo-600/10 blur-[130px]" />
        <div className="absolute top-[45%] left-[35%] w-[35%] h-[35%] rounded-full bg-emerald-700/8 blur-[110px]" />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-5 md:px-10 py-3.5 flex justify-between items-center">
          {/* Logo / Back */}
          <div className="flex items-center gap-3">
            {activeTool !== 'landing' && (
              <button
                onClick={() => setActiveTool('landing')}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors mr-1 text-slate-400 hover:text-white"
                title="Back to home"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <button onClick={() => setActiveTool('landing')} className="flex items-center gap-2.5 group">
              <div className="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/30">
                <BrainCircuit size={20} className="text-white" />
              </div>
              <div className="leading-none">
                <span className="text-lg font-bold text-white">FinAI</span>
                <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400"> Mentor</span>
              </div>
            </button>
          </div>

          {/* Status indicators */}
          <div className="flex items-center gap-4">
            {activeTool !== 'landing' && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-blue-300 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full font-medium capitalize">
                <Sparkles size={11} />
                {activeTool.replace('-', ' ')}
              </div>
            )}
            
            <div className="flex items-center gap-3 border-l border-white/5 pl-4 ml-1">
              {/* Profile Picture Upload */}
              <label className="relative cursor-pointer group shrink-0">
                <input type="file" accept="image/*" onChange={handleProfilePicUpload} className="hidden" />
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-indigo-500/30 overflow-hidden bg-slate-800 flex items-center justify-center group-hover:border-indigo-400 transition-colors shadow-lg shadow-indigo-500/10 shrink-0">
                  {user.profile_pic ? (
                    <img src={user.profile_pic} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={18} className="text-slate-400 group-hover:text-white transition-colors" />
                  )}
                </div>
                {/* Mobile absolute badge */}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold border border-slate-900 group-hover:scale-110 transition-transform">
                  +
                </div>
              </label>

              <div className="hidden sm:flex flex-col justify-center">
                <span className="text-sm font-bold text-white leading-none mb-1">{user.username}</span>
                <span className="text-[10px] text-slate-500 leading-none">{user.email}</span>
              </div>
              <button onClick={handleLogout} className="p-2 sm:p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-red-400 shrink-0 group" title="Sign Out">
                <LogOut size={16} className="group-hover:scale-105 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Content ── */}
      <main className="pt-20 pb-20 px-4 sm:px-6 md:px-10 max-w-7xl mx-auto">
        {ToolComponent ? (
          <div className="animate-fade-up">
            <ToolComponent apiBase={API} onBack={() => setActiveTool('landing')} backendOk={backendOk} />
          </div>
        ) : (
          <div className="animate-fade-up">
            <Landing onSelect={setActiveTool} backendOk={backendOk} />
          </div>
        )}
        
        {/* Global Regulatory Disclaimer */}
        <div className="mt-16 text-center text-xs text-slate-500/80 border-t border-white/5 pt-8 max-w-4xl mx-auto">
          <p className="font-bold flex items-center justify-center gap-1.5 text-slate-400 mb-2 uppercase tracking-widest text-[10px]">
            <ShieldAlert size={12} className="text-amber-500" /> Important Regulatory Disclaimer
          </p>
          <p className="leading-relaxed">
            FinAI Mentor provides AI-generated financial guidance and educational information based on computational models. 
            <strong className="text-slate-400 font-semibold"> This is NOT licensed financial advice, nor is it registered under SEBI, RBI, IRDAI, or any other financial regulatory body. </strong> 
            Calculations and strategies (including tax, investments, and insurance) are highly dependent on user inputs and market assumptions which carry inherent risks. 
            Before making critical financial decisions, executing trades, or restructuring portfolios, please consult a SEBI-registered Investment Advisor (RIA) or a certified tax professional.
          </p>
        </div>
      </main>

      {/* ── Floating Chat ── */}
      <ChatWidget apiBase={API} />
    </div>
  )
}

export default App
