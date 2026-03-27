import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { MessageSquare, X, Send, Bot, Sparkles } from 'lucide-react'

const SUGGESTIONS = [
  'Should I buy a car now?',
  'Where should I invest ₹10,000?',
  'How to reduce tax legally?',
  'What is the best SIP amount?',
]

const ChatWidget = ({ apiBase = 'http://localhost:5000' }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your AI Financial Mentor 👋\nAsk me anything about SIPs, tax saving, FIRE planning, or any financial decision!"
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isOpen])

  const send = async (text) => {
    const msg = text || input.trim()
    if (!msg) return

    setMessages(prev => [...prev, { role: 'user', content: msg }])
    setInput('')
    setIsLoading(true)
    setShowSuggestions(false)

    try {
      const res = await axios.post(`${apiBase}/api/chat`, { message: msg })
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble reaching the server right now. Please check that the backend is running and try again."
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e) => { e.preventDefault(); send() }

  return (
    <div className="fixed bottom-6 right-6 z-50 select-none">

      {/* ── Chat Window ── */}
      {isOpen && (
        <div
          className="absolute bottom-[72px] right-0 w-[360px] h-[520px] glass rounded-3xl shadow-2xl shadow-black/60 flex flex-col overflow-hidden border border-white/10"
          style={{ animation: 'scaleIn 0.25s ease-out' }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 to-indigo-700 p-4 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <Bot size={20} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">AI Financial Mentor</p>
                <p className="text-[11px] text-blue-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                  Always online
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/15 rounded-full transition-colors">
              <X size={18} className="text-white" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/50">

            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0 mt-1">
                    <Bot size={14} className="text-blue-400" />
                  </div>
                )}
                <div className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-slate-800/80 text-slate-200 rounded-bl-sm border border-white/5'
                }`}>
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            ))}

            {/* Quick suggestions */}
            {showSuggestions && (
              <div className="space-y-2">
                <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">Quick questions</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-blue-500/40 text-slate-300 px-3 py-1.5 rounded-full transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                  <Bot size={14} className="text-blue-400 animate-pulse" />
                </div>
                <div className="bg-slate-800/80 border border-white/5 px-4 py-2.5 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 bg-slate-900/80 border-t border-white/5 shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask me anything financial…"
                value={input}
                onChange={e => setInput(e.target.value)}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 text-sm text-white placeholder:text-slate-500 outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 rounded-xl flex items-center justify-center transition-colors shrink-0"
              >
                <Send size={16} className="text-white" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── FAB ── */}
      <button
        onClick={() => setIsOpen(v => !v)}
        className="relative w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/40 hover:scale-110 transition-transform duration-200"
        aria-label="Open AI Chat"
      >
        {isOpen ? <X size={22} className="text-white" /> : <MessageSquare size={22} className="text-white" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#0a0f1e] flex items-center justify-center">
            <Sparkles size={8} className="text-white" />
          </span>
        )}
      </button>
    </div>
  )
}

export default ChatWidget
