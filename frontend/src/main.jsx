import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

// Generate a persistent anonymous session ID to track user flow in DB securely
let finaiSessionId = localStorage.getItem('finai_session_uid')
if (!finaiSessionId) {
  finaiSessionId = 'usr_' + Math.random().toString(36).substring(2, 11)
  localStorage.setItem('finai_session_uid', finaiSessionId)
}
axios.defaults.headers.common['X-User-Id'] = finaiSessionId

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
