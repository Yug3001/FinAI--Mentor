import { useState } from 'react'
import axios from 'axios'
import { Sparkles, Mail, Lock, User, Loader2, ArrowRight } from 'lucide-react'

export default function Auth({ onLogin, apiBase }) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const endpoint = isSignUp ? '/api/auth/signup' : '/api/auth/signin'
      const { data } = await axios.post(`${apiBase}${endpoint}`, form)

      if (isSignUp) {
        setSuccess("Account created successfully! Please sign in.")
        // Redirect to sign in flow immediately
        setIsSignUp(false)
        setForm(p => ({ ...p, password: '' })) // clear password
      } else {
        // Logged in
        onLogin(data.user)
      }
    } catch (err) {
      setError(err.response?.data?.error || "Authentication failed. Server unreachable.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-4">
      {/* Brand */}
      <div className="flex items-center gap-3 mb-10">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Sparkles size={24} className="text-white" />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-white leading-none">
          Fin<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">AI</span> Mentor
        </h1>
      </div>

      {/* Glass Card */}
      <div className="glass-card w-full max-w-md p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden animate-fade-up">
        {/* Decorative blur */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
        
        <h2 className="text-2xl font-bold text-white mb-2">
          {isSignUp ? "Create an Account" : "Welcome Back"}
        </h2>
        <p className="text-slate-400 text-sm mb-8">
          {isSignUp ? "Start your journey to financial independence." : "Sign in to access your personalized financial plans."}
        </p>

        {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">{error}</div>}
        {success && <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm text-center">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {isSignUp && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Username</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text" required
                  value={form.username} onChange={e => setForm({...form, username: e.target.value})}
                  className="w-full bg-slate-900/60 border border-slate-700/50 rounded-2xl py-3.5 pl-11 pr-4 text-white text-sm outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder-slate-600"
                  placeholder="John Doe"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="email" required
                value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-2xl py-3.5 pl-11 pr-4 text-white text-sm outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder-slate-600"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="password" required
                value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-2xl py-3.5 pl-11 pr-4 text-white text-sm outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder-slate-600"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full py-4 mt-6 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-70 group"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : (
              <>
                {isSignUp ? 'Create Account' : 'Sign In'}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center relative z-10">
          <button 
            type="button" 
            onClick={() => { setIsSignUp(!isSignUp); setError(null); setSuccess(null); }}
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  )
}
