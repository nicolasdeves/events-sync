import { useState } from 'react'
import { useApp } from '../contexts/AppContext'

interface UserInfo {
  name?: string
  email?: string
  picture?: string
}

interface ProfilePageProps {
  userInfo: UserInfo | null
}

function ProfilePage({ userInfo }: ProfilePageProps) {
  const { t } = useApp()

  const displayName = userInfo?.name || t('profile.defaultUser')
  const displayEmail = userInfo?.email || 'email@example.com'
  const displayPicture = 'https://www.pngkey.com/png/detail/230-2302656_34kib-420x420-oof-roblox-noob-avatar.png'

  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">{t('profile.title')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Informações do Perfil */}
        <div className="lg:col-span-3 space-y-6">
          {/* Card Principal */}
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-xl font-semibold text-white">{t('profile.personalInfo')}</h2>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                {displayPicture ? (
                  <img
                    src={displayPicture}
                    alt={displayName}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-gray-700"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="text-center sm:text-left">
                  <h3 className="text-lg sm:text-xl font-semibold text-white">{displayName}</h3>
                  <p className="text-gray-400 text-sm sm:text-base">{displayEmail}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{t('profile.fullName')}</label>
                  <p className="text-white bg-gray-700 px-4 py-2 rounded-lg">{displayName}</p>
                  <p className="text-gray-500 text-xs mt-1">{t('profile.fromGoogle')}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">{t('profile.email')}</label>
                  <p className="text-white bg-gray-700 px-4 py-2 rounded-lg">{displayEmail}</p>
                  <p className="text-gray-500 text-xs mt-1">{t('profile.fromGoogle')}</p>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
