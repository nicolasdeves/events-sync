import { useState, useEffect } from 'react'
import LoginForm from './components/LoginForm.tsx'
import Sidebar from './components/Sidebar.tsx'
import EventsPage from './components/EventsPage.tsx'
import CertificatesPage from './components/CertificatesPage.tsx'
import ProfilePage from './components/ProfilePage.tsx'
import SettingsPage from './components/SettingsPage.tsx'
import AdminPage from './components/AdminPage.tsx'
import { login, getToken, logout as authLogout } from './services/authentication.service.ts'

export interface UserInfo {
  name?: string
  email?: string
  picture?: string
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentPage, setCurrentPage] = useState('certificates')
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Dados do usuário (em produção viriam do contexto/auth)
  const userName = userInfo?.name || 'Alex Doe'
  const userEmail = userInfo?.email || 'alex.doe@email.com'
  const isAdmin = userInfo?.name == 'Nícolas Deves' 

  useEffect(() => {
    const token = getToken()
    if (token) {
      setIsAuthenticated(true)
      const savedUserInfo = localStorage.getItem('userInfo')
      if (savedUserInfo) {
        try {
          setUserInfo(JSON.parse(savedUserInfo))
        } catch (e) {
          console.error('Erro ao recuperar informações do usuário:', e)
        }
      }
    }
  }, [])

  const handleLogin = async (_token: string, userInfo?: UserInfo & { sub?: string }) => {
    if (userInfo && userInfo.sub) {
      try {
        await login({
          name: userInfo.name || '',
          email: userInfo.email || '',
          sub: userInfo.sub
        })
        
        setUserInfo({
          name: userInfo.name,
          email: userInfo.email,
          picture: userInfo.picture
        })
        localStorage.setItem('userInfo', JSON.stringify({
          name: userInfo.name,
          email: userInfo.email,
          picture: userInfo.picture
        }))
        
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Erro no login:', error)
        alert('Erro ao fazer login. Tente novamente.')
      }
    }
  }

  const handleLogout = () => {
    authLogout()
    setUserInfo(null)
    setIsAuthenticated(false)
    setCurrentPage('certificates')
    setSidebarOpen(false)
  }


  const renderPage = () => {
    switch (currentPage) {
      case 'events':
        return <EventsPage />
      case 'certificates':
        return <CertificatesPage />
      case 'profile':
        return <ProfilePage userInfo={userInfo} />
      case 'settings':
        return <SettingsPage />
      case 'admin':
        return <AdminPage />
      default:
        return <CertificatesPage />
    }
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />
  }

  return (
    <div className="flex min-h-screen bg-gray-900">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onLogout={handleLogout}
        userName={userName}
        userEmail={userEmail}
        userPicture={userInfo?.picture}
        isAdmin={isAdmin}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="flex-1 overflow-auto lg:ml-0">
        {/* Botão hambúrguer para mobile */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-30 p-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {renderPage()}
      </main>
    </div>
  )
}

export default App
