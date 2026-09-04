import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePWA } from '../../hooks/usePWA'
import { OnlineStatus, InstallAppButton, NotificationButton } from '../PWAComponents'

const NAV_ITEMS = [
  { path: '/',         key: 'navigation.dashboard'  },
  { path: '/tasks',    key: 'navigation.tasks'       },
  { path: '/progress', key: 'navigation.analytics'   },
  { path: '/settings', key: 'navigation.settings'    }
]

const Navigation = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const { isOnline, hasOfflineTasks } = usePWA()

  return (
    <nav
      className="bg-slate-800/40 backdrop-blur-sm border-b border-slate-700/50"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between">
          <div className="flex space-x-1">
            {NAV_ITEMS.map(({ path, key }) => {
              const active = location.pathname === path
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className={`py-4 px-3 border-b-2 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800 ${
                    active
                      ? 'border-purple-500 text-purple-300'
                      : 'border-transparent text-gray-400 hover:text-white hover:border-gray-300'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  {t(key)}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-3">
            <OnlineStatus />
            {!isOnline && hasOfflineTasks && (
              <span className="text-xs text-yellow-400">Offline tasks pending</span>
            )}
            <InstallAppButton />
            <NotificationButton className="hidden sm:flex" />
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation
