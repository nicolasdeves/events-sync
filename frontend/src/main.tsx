import React from 'react'
import ReactDOM from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AppProvider } from './contexts/AppContext.tsx'
import App from './App.tsx'
import './index.css'

const googleClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID as string | undefined

if (!googleClientId) {
  console.error('VITE_GOOGLE_CLIENT_ID não está definido no arquivo .env')
}

const savedLanguage = localStorage.getItem('language') || 'pt'
document.documentElement.lang = savedLanguage === 'pt' ? 'pt-BR' : 'en-US'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={googleClientId || ''}>
      <AppProvider>
        <App />
      </AppProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>,
)
