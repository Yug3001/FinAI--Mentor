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
  landing: Landing,
  'health-score': HealthScoreTool,
  'fire-plan': FirePlanTool,
  'tax-wizard': TaxWizardTool,
  'life-event': LifeEventTool,
  'couples-plan': CouplesPlannerTool,
  'portfolio-xray': PortfolioXRayTool,
  'full': FullAnalysisTool,
}

function App() {
  const [activeTool, setActiveTool] = useState('landing')
  const [backendOk, setBackendOk] = useState(null)

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('finai_auth_user')
    return saved ? JSON.parse(saved) : null
  })

  // ✅ Backend health check
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
    setActiveTool('landing')
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('finai_auth_user')

    const freshSession = 'usr_' + Math.random().toString(36).substring(2, 11)
    localStorage.setItem('finai_session_uid', freshSession)
    axios.defaults.headers.common['X-User-Id'] = freshSession

    setActiveTool('landing')
  }

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be < 2MB")
      return
    }

    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64 = reader.result
      try {
        await axios.post(`${API}/api/auth/profile-pic`, {
          user_id: user.user_id,
          profile_pic: base64
        })

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

  // ✅ SAFE COMPONENT RENDERING
  const ToolComponent = TOOLS[activeTool]

  return (
    <div className="min-h-screen bg-[#080c18] text-slate-100">

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0f1f]">
        <div className="max-w-7xl mx-auto px-5 py-3 flex justify-between items-center">

          <div className="flex items-center gap-3">
            {activeTool !== 'landing' && (
              <button onClick={() => setActiveTool('landing')}>
                <ArrowLeft size={18} />
              </button>
            )}

            <button onClick={() => setActiveTool('landing')} className="flex items-center gap-2">
              <BrainCircuit size={20} />
              <span className="font-bold">FinAI Mentor</span>
            </button>
          </div>

          <div className="flex items-center gap-4">

            {activeTool !== 'landing' && (
              <span className="text-xs capitalize">
                {activeTool.replace('-', ' ')}
              </span>
            )}

            <label>
              <input type="file" hidden onChange={handleProfilePicUpload} />
              {user.profile_pic ? (
                <img src={user.profile_pic} className="w-8 h-8 rounded-full" />
              ) : (
                <User size={18} />
              )}
            </label>

            <button onClick={handleLogout}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </nav>

      {/* MAIN */}
      <main className="pt-20 px-6">

        {/* ✅ SAFE RENDER */}
        {ToolComponent ? (
          <ToolComponent
            apiBase={API}
            onBack={() => setActiveTool('landing')}
            backendOk={backendOk}
          />
        ) : (
          <Landing
            onSelect={setActiveTool}
            backendOk={backendOk}
          />
        )}

      </main>

      {/* CHAT */}
      <ChatWidget apiBase={API} />

    </div>
  )
}

export default App