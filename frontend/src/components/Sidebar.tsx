import { useApp } from '../contexts/AppContext'

interface SidebarProps {
  currentPage: string
  onNavigate: (page: string) => void
  onLogout: () => void
  userName: string
  userEmail: string
  userPicture?: string
  isAdmin?: boolean
  isOpen: boolean
  onClose: () => void
}

function Sidebar({ currentPage, onNavigate, onLogout, userName, userEmail, userPicture = 'https://www.pngkey.com/png/detail/230-2302656_34kib-420x420-oof-roblox-noob-avatar.png', isAdmin = true, isOpen, onClose }: SidebarProps) {
  const { t } = useApp()
  
  const menuItems = [
    { id: 'events', label: t('nav.events'), icon: '📅' },
    { id: 'certificates', label: t('nav.certificates'), icon: '🎓' },
    { id: 'profile', label: t('nav.profile'), icon: '👤' },
    { id: 'settings', label: t('nav.settings'), icon: '⚙️' },
  ]

  if (isAdmin) {
    menuItems.push({ id: 'admin', label: t('nav.admin'), icon: '🛡️' })
  }

  const handleNavigate = (page: string) => {
    onNavigate(page)
    onClose()
  }

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-128 bg-gray-800 min-h-screen flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">{t('app.name')}</h2>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            {userPicture ? (
              <img
                src={userPicture}
                alt={userName}
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-700"
              />
            ) : (
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{userName}</p>
              <p className="text-gray-400 text-sm truncate">{userEmail}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    currentPage === item.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={() => {
              onLogout()
              onClose()
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
          >
            <span>🚪</span>
            <span>{t('nav.logout')}</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
