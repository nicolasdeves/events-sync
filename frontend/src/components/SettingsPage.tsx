import { useApp } from '../contexts/AppContext'

function SettingsPage() {
  const { language, notifications, setLanguage, setNotifications, t } = useApp()

  return (
    <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">
        {t('settings.title')}
      </h1>

      <div className="space-y-4 sm:space-y-6">
        {/* Language */}
        <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            {t('settings.language')}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('settings.language')}
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'pt' | 'en')}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pt">{t('settings.language.pt')}</option>
                <option value="en">{t('settings.language.en')}</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
