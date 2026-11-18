import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { usePWA } from '../../hooks/usePWA'
import { useAuthContext } from '../../context/AuthContext'
import { OnlineStatus, InstallAppButton, NotificationButton } from '../PWAComponents'

const BASE_NAV_ITEMS = [
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
  const { user } = useAuthContext()

  const NAV_ITEMS = user?.role === 'admin'
    ? [...BASE_NAV_ITEMS, { path: '/admin', key: 'Admin' }]
    : BASE_NAV_ITEMS

  return (
    <nav
      style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between">
          <div className="flex space-x-1">
            {NAV_ITEMS.map(({ path, key }) => {
              const active = location.pathname === path
              const label  = key.startsWith('navigation.') ? t(key) : key
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className={`py-4 px-3 border-b-2 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 relative ${
                    active
                      ? 'border-primary text-primary'
                      : 'border-transparent hover:border-line'
                  }`}
                  style={active ? {} : { color: 'var(--text-muted)' }}
                  aria-current={active ? 'page' : undefined}
                >
                  {label}
                  {active && (
                    <span
                      className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                      style={{ background: 'var(--gold)' }}
                    />
                  )}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-3">
            <OnlineStatus />
            {!isOnline && hasOfflineTasks && (
              <span className="text-xs font-medium" style={{ color: 'var(--gold)' }}>Offline tasks pending</span>
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
