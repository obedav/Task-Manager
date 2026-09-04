import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react'
import { Calendar, Clock, TrendingUp, Target, CheckCircle, AlertCircle, Plus, ArrowRight, BarChart3, Timer, AlertTriangle, WifiOff } from 'lucide-react'
import { useTranslation } from 'react-i18next';

const ProgressBar = lazy(() =>
  import('../components/SafeProgressTracker').then(module => ({ default: module.ProgressBar }))
)

// Error Boundary Component
class DashboardErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Dashboard Error:', error, errorInfo)
    
   
    if (import.meta.env.VITE_ENVIRONMENT === 'production') {
     
      console.error('Dashboard crashed:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      })
    }
  }

  render() {
   // const { t } = useTranslation();
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg)' }}>
          <div className="rounded-2xl p-8 max-w-md w-full text-center shadow-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>{t('dashboard.errorTitle', 'Something went wrong')}</h2>
            <p className="mb-6" style={{ color: 'var(--text-muted)' }}>
              {t('dashboard.errorMessage', "We're sorry, but the dashboard encountered an error. Please try refreshing the page.")}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full text-white py-2 px-4 rounded-lg transition-colors"
                style={{ background: 'var(--royal)' }}
              >
                {t('dashboard.refresh', 'Refresh Dashboard')}
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null })
                  if (this.props.onRetry) this.props.onRetry()
                }}
                className="w-full py-2 px-4 rounded-lg transition-colors"
                style={{ background: 'var(--surface-2)', color: 'var(--text)' }}
              >
                {t('dashboard.tryAgain', 'Try Again')}
              </button>
            </div>
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="text-red-400 cursor-pointer text-sm">Technical Details</summary>
                <pre className="text-xs text-gray-400 mt-2 overflow-auto max-h-32">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Loading Component
const LoadingSpinner = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--royal)' }}></div>
        <div className="text-xl font-semibold" style={{ color: 'var(--text)' }}>{t('dashboard.loading', 'Loading dashboard...')}</div>
      </div>
    </div>
  )
}

// Network Status Hook (CORRECTED)
const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}

// Error Toast Component
const ErrorToast = ({ error, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  if (!error) return null

  return (
    <div className="fixed top-4 right-4 z-50 bg-red-500/90 backdrop-blur-sm text-white p-4 rounded-lg shadow-lg max-w-md">
      <div className="flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-red-200 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-medium text-sm">Error</p>
          <p className="text-sm opacity-90">{error}</p>
        </div>
        <button
          onClick={onDismiss}
          className="text-red-200 hover:text-white transition-colors"
        >
          ×
        </button>
      </div>
    </div>
  )
}

// Main Dashboard Component
const Dashboard = ({ tasks: propTasks = [], analytics, loading, user, onAddTask, onDailyCheckIn, onProgressUpdate, onRefresh, onNavigateToTasks }) => {
  const [error, setError] = useState(null)
  const [timeOfDay, setTimeOfDay] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  const isOnline = useNetworkStatus()
  const { t, i18n } = useTranslation();

  const tasksArray = useMemo(() => {
    return Array.isArray(propTasks) ? propTasks : (propTasks?.tasks || [])
  }, [propTasks])

  useEffect(() => {
    const h = new Date().getHours()
    setTimeOfDay(h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening')
  }, [])

  const handleDailyCheckIn = useCallback((task) => {
    onDailyCheckIn(task)
  }, [onDailyCheckIn])

  // Memoized statistics calculation
  const stats = useMemo(() => {
    const total = tasksArray.length
    const completed = tasksArray.filter(t => t.status === 'completed' || t.progress === 100).length
    const inProgress = tasksArray.filter(t => t.status === 'in-progress' || (t.progress > 0 && t.progress < 100)).length
    const pending = tasksArray.filter(t => t.status === 'pending' || t.progress === 0).length
    const overdue = tasksArray.filter(t => 
      t.dueDate && 
      new Date(t.dueDate) < new Date() && 
      t.status !== 'completed' &&
      t.progress !== 100
    ).length
    const todayTasks = tasksArray.filter(t => {
      if (!t.dueDate) return false
      const today = new Date().toDateString()
      return new Date(t.dueDate).toDateString() === today
    }).length
    const totalHours = Number(analytics?.totalHours) || tasksArray.reduce((sum, task) => sum + (task.totalHours || 0), 0)
    const averageProgress = Number(analytics?.averageProgress) || (
      total > 0
        ? tasksArray.reduce((sum, task) => sum + (task.progress || 0), 0) / total
        : 0
    )

    return {
      total,
      completed,
      inProgress,
      pending,
      overdue,
      todayTasks,
      totalHours,
      averageProgress
    }
  }, [tasksArray, analytics])

  const completionRate = useMemo(() => {
    return stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
  }, [stats.total, stats.completed])

  // Memoized task lists
  const recentTasks = useMemo(() => {
    return tasksArray
      .sort((a, b) => {
        const aDate = new Date(a.lastWorkedOn || a.updatedAt || a.createdAt)
        const bDate = new Date(b.lastWorkedOn || b.updatedAt || b.createdAt)
        return bDate - aDate
      })
      .slice(0, 5)
  }, [tasksArray])

  const upcomingTasks = useMemo(() => {
    return tasksArray
      .filter(t => t.dueDate && t.status !== 'completed' && t.progress !== 100)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5)
  }, [tasksArray])

  const priorityStats = useMemo(() => ({
    high: tasksArray.filter(t => t.priority === 'high' && t.status !== 'completed' && t.progress !== 100).length,
    medium: tasksArray.filter(t => t.priority === 'medium' && t.status !== 'completed' && t.progress !== 100).length,
    low: tasksArray.filter(t => t.priority === 'low' && t.status !== 'completed' && t.progress !== 100).length
  }), [tasksArray])

  const progressDistribution = useMemo(() => {
    return analytics?.progressDistribution || {
      notStarted: tasksArray.filter(t => (t.progress || 0) === 0).length,
      early: tasksArray.filter(t => (t.progress || 0) > 0 && (t.progress || 0) <= 25).length,
      quarter: tasksArray.filter(t => (t.progress || 0) > 25 && (t.progress || 0) <= 50).length,
      half: tasksArray.filter(t => (t.progress || 0) > 50 && (t.progress || 0) <= 75).length,
      mostlyDone: tasksArray.filter(t => (t.progress || 0) > 75 && (t.progress || 0) < 100).length,
      completed: tasksArray.filter(t => (t.progress || 0) === 100).length
    }
  }, [analytics?.progressDistribution, tasksArray])

  // Error dismissal
  const dismissError = useCallback(() => {
    setError(null)
  }, [])

  if (loading && tasksArray.length === 0) {
    return <LoadingSpinner />
  }

  return (
    <DashboardErrorBoundary onRetry={onRefresh}>
      <div className="min-h-screen p-6" style={{ background: 'transparent' }}>
        {/* Error Toast */}
        <ErrorToast error={error} onDismiss={dismissError} />
        
        {/* Offline Indicator */}
        {!isOnline && (
          <div className="fixed top-4 left-4 z-50 bg-orange-500/90 backdrop-blur-sm text-white p-3 rounded-lg shadow-lg flex items-center space-x-2">
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">{t('dashboard.offline', 'You\'re offline')}</span>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 dashboard-container">
          {/* Header */}
          <div className="text-center mb-12 px-4 dashboard-header">
            <h1 className="text-4xl md:text-6xl font-bold mb-4" style={{ color: 'var(--text)' }}>
              {t('dashboard.greeting', { name: user?.name || 'there' })}
            </h1>
            <p className="text-xl" style={{ color: 'var(--text-muted)' }}>
              {stats.todayTasks > 0
                ? `${t('dashboard.todayTasks')} ${stats.todayTasks} ${t('dashboard.task')}${stats.todayTasks > 1 ? 's' : ''} ${t('dashboard.dueToday')}`
                : t('dashboard.clearSchedule')
              }
            </p>
            <div className="mt-4" style={{ color: 'var(--text-muted)' }}>
              {stats.totalHours > 0 && (
                <span>{t('dashboard.totalTimeTracked')}: <strong style={{ color: 'var(--gold)' }}>{stats.totalHours.toFixed(1)} {t('dashboard.hours')}</strong></span>
              )}
            </div>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8 justify-items-center max-w-5xl mx-auto dashboard-stats-grid dashboard-grid">
            <div className="rounded-2xl p-4 sm:p-6 w-full dashboard-stats-card shadow-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between mb-4">
                <Target className="w-8 h-8" style={{ color: 'var(--royal)' }} />
                <span className="text-3xl font-bold" style={{ color: 'var(--royal)' }}>{stats.total}</span>
              </div>
              <h3 className="font-medium" style={{ color: 'var(--text)' }}>{t('dashboard.totalTasks', 'Total Tasks')}</h3>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{t('dashboard.allTime', 'All time')}</p>
            </div>

            <div className="rounded-2xl p-4 sm:p-6 w-full dashboard-stats-card shadow-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between mb-4">
                <CheckCircle className="w-8 h-8" style={{ color: 'var(--royal)' }} />
                <span className="text-3xl font-bold" style={{ color: 'var(--royal)' }}>{stats.completed}</span>
              </div>
              <h3 className="font-medium" style={{ color: 'var(--text)' }}>{t('dashboard.completed', 'Completed')}</h3>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{t('dashboard.completionRate', `${completionRate}% completion rate`)}</p>
            </div>

            <div className="rounded-2xl p-4 sm:p-6 w-full dashboard-stats-card shadow-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between mb-4">
                <Clock className="w-8 h-8" style={{ color: 'var(--royal)' }} />
                <span className="text-3xl font-bold" style={{ color: 'var(--royal)' }}>{stats.inProgress}</span>
              </div>
              <h3 className="font-medium" style={{ color: 'var(--text)' }}>{t('dashboard.inProgress', 'In Progress')}</h3>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{t('dashboard.activeTasks', 'Active tasks')}</p>
            </div>

            {/* Gold premium card for Time Tracked */}
            <div className="rounded-2xl p-4 sm:p-6 w-full dashboard-stats-card shadow-sm" style={{ background: 'var(--gold-light)', border: '2px solid var(--gold)' }}>
              <div className="flex items-center justify-between mb-4">
                <Timer className="w-8 h-8" style={{ color: 'var(--gold-dark)' }} />
                <span className="text-3xl font-bold" style={{ color: 'var(--gold-dark)' }}>{stats.totalHours.toFixed(1)}h</span>
              </div>
              <h3 className="font-medium" style={{ color: 'var(--text)' }}>{t('dashboard.timeTracked', 'Time Tracked')}</h3>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{t('dashboard.totalHours', 'Total hours')}</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 rounded-lg p-1 mb-8 max-w-md mx-auto dashboard-tabs" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-2 px-4 rounded-md text-sm transition-colors focus:outline-none font-medium ${
                activeTab === 'overview'
                  ? 'text-white shadow-sm'
                  : ''
              }`}
              style={activeTab === 'overview' ? { background: 'var(--royal)', color: '#fff' } : { color: 'var(--text-muted)' }}
            >
              {t('dashboard.overview', 'Overview')}
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`flex-1 py-2 px-4 rounded-md text-sm transition-colors focus:outline-none font-medium ${
                activeTab === 'progress'
                  ? 'text-white shadow-sm'
                  : ''
              }`}
              style={activeTab === 'progress' ? { background: 'var(--royal)', color: '#fff' } : { color: 'var(--text-muted)' }}
            >
              {t('dashboard.progressAnalytics', 'Progress Analytics')}
            </button>
          </div>

          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              <div className="lg:col-span-2 space-y-6">
                {/* Progress Overview */}
                <div className="rounded-2xl p-6 shadow-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold flex items-center space-x-2" style={{ color: 'var(--text)' }}>
                      <TrendingUp className="w-6 h-6" style={{ color: 'var(--royal)' }} />
                      <span>{t('dashboard.progressOverview', 'Progress Overview')}</span>
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span style={{ color: 'var(--text-muted)' }}>{t('dashboard.overallCompletionRate', 'Overall Completion Rate')}</span>
                      <span className="font-semibold" style={{ color: 'var(--royal)' }}>{completionRate}%</span>
                    </div>
                    <Suspense fallback={<div className="h-4 rounded animate-pulse" style={{ background: 'var(--surface-2)' }}></div>}>
                      <ProgressBar progress={completionRate} className="h-4" />
                    </Suspense>

                    <div className="flex items-center justify-between mt-4">
                      <span style={{ color: 'var(--text-muted)' }}>{t('dashboard.averageProgress', 'Average Progress')}</span>
                      <span className="font-semibold" style={{ color: 'var(--royal)' }}>{stats.averageProgress.toFixed(1)}%</span>
                    </div>
                    <Suspense fallback={<div className="h-4 rounded animate-pulse" style={{ background: 'var(--surface-2)' }}></div>}>
                      <ProgressBar progress={stats.averageProgress} className="h-4" />
                    </Suspense>

                    <div className="grid grid-cols-3 gap-4 mt-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-500">{priorityStats.high}</div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('dashboard.highPriority', 'High Priority')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold" style={{ color: 'var(--gold)' }}>{priorityStats.medium}</div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('dashboard.mediumPriority', 'Medium Priority')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{priorityStats.low}</div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('dashboard.lowPriority', 'Low Priority')}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Tasks */}
                <div className="rounded-2xl p-6 shadow-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>{t('dashboard.recentTasks', 'Recent Tasks')}</h2>
                    <button
                      onClick={onNavigateToTasks}
                      className="flex items-center space-x-1 text-sm transition-colors focus:outline-none rounded px-2 py-1"
                      style={{ color: 'var(--royal)' }}
                    >
                      <span>{t('dashboard.viewAll', 'View All')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {recentTasks.length > 0 ? recentTasks.map((task) => (
                      <div
                        key={task._id || task.id}
                        className="p-4 rounded-xl"
                        style={{
                          background: 'var(--surface-2)',
                          borderLeft: task.priority === 'high' ? '4px solid var(--gold)' : '4px solid transparent'
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className={`font-medium ${task.status === 'completed' || task.progress === 100 ? 'line-through' : ''}`}
                            style={{ color: task.status === 'completed' || task.progress === 100 ? 'var(--text-muted)' : 'var(--text)' }}>
                            {task.title}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              task.priority === 'high' ? 'bg-red-100 text-red-700' :
                              task.priority === 'medium' ? 'text-white' :
                              'bg-green-100 text-green-700'
                            }`}
                              style={task.priority === 'medium' ? { background: 'var(--gold-light)', color: 'var(--gold-dark)' } : {}}>
                              {task.priority || t('dashboard.mediumPriority', 'medium')}
                            </span>
                            <button
                              onClick={() => handleDailyCheckIn(task)}
                              className="text-xs transition-colors focus:outline-none rounded px-2 py-1 font-medium"
                              style={{ color: 'var(--royal)' }}
                              aria-label={`${t('dashboard.checkIn', 'Check in')} for task: ${task.title}`}
                            >
                              {t('dashboard.checkIn', 'Check-in')}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span style={{ color: 'var(--text-muted)' }}>{t('dashboard.progress', 'Progress')}</span>
                            <span className="font-medium" style={{ color: 'var(--text)' }}>{task.progress || 0}%</span>
                          </div>
                          <Suspense fallback={<div className="h-2 rounded animate-pulse" style={{ background: 'var(--royal-light)' }}></div>}>
                            <ProgressBar progress={task.progress || 0} />
                          </Suspense>

                          {(task.totalHours > 0) && (
                            <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                              <span>{t('dashboard.timeLogged', 'Time logged')}: {(task.totalHours || 0).toFixed(1)}h</span>
                              {task.lastWorkedOn && (
                                <span>{t('dashboard.lastWorked', 'Last')}: {new Date(task.lastWorkedOn).toLocaleDateString()}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                        <p>{t('dashboard.noTasksYet', 'No tasks yet')}</p>
                        <button
                          onClick={onAddTask}
                          className="mt-2 text-sm transition-colors focus:outline-none rounded px-2 py-1 font-medium"
                          style={{ color: 'var(--royal)' }}
                        >
                          {t('dashboard.createFirstTask', 'Create your first task')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Upcoming Tasks */}
                <div className="rounded-2xl p-6 shadow-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <h2 className="text-xl font-bold mb-6 flex items-center space-x-2" style={{ color: 'var(--text)' }}>
                    <Calendar className="w-5 h-5" style={{ color: 'var(--royal)' }} />
                    <span>{t('dashboard.upcoming', 'Upcoming')}</span>
                  </h2>

                  <div className="space-y-3">
                    {upcomingTasks.length > 0 ? upcomingTasks.map((task) => (
                      <div key={task._id || task.id} className="p-3 rounded-xl" style={{ background: 'var(--surface-2)', borderLeft: task.priority === 'high' ? '3px solid var(--gold)' : '3px solid var(--royal-light)' }}>
                        <h4 className="font-medium text-sm mb-1" style={{ color: 'var(--text)' }}>{task.title}</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              task.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                            }`}
                              style={task.priority === 'medium' ? { background: 'var(--gold-light)', color: 'var(--gold-dark)' } : {}}>
                              {task.priority || t('dashboard.mediumPriority', 'medium')}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                              <span>{t('dashboard.progress', 'Progress')}</span>
                              <span>{task.progress || 0}%</span>
                            </div>
                            <Suspense fallback={<div className="h-2 rounded animate-pulse" style={{ background: 'var(--royal-light)' }}></div>}>
                              <ProgressBar progress={task.progress || 0} />
                            </Suspense>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                        <p>{t('dashboard.noUpcomingTasks', 'No upcoming tasks')}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="rounded-2xl p-4 sm:p-6 shadow-sm" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                  <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text)' }}>{t('dashboard.quickActions', 'Quick Actions')}</h2>

                  <div className="space-y-3">
                    <button
                      onClick={onAddTask}
                      className="w-full text-white p-3 rounded-xl flex items-center justify-center space-x-2 transition-all transform hover:scale-105 focus:outline-none font-semibold"
                      style={{ background: 'var(--royal)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--royal-dark)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'var(--royal)'}
                    >
                      <Plus className="w-4 h-4" />
                      <span>{t('dashboard.createNewTask', 'Create New Task')}</span>
                    </button>

                    <button
                      onClick={onNavigateToTasks}
                      className="w-full p-3 rounded-xl transition-colors focus:outline-none border font-medium"
                      style={{ background: 'var(--surface)', color: 'var(--text)', borderColor: 'var(--border)' }}
                    >
                      {t('dashboard.viewAllTasks', 'View All Tasks')}
                    </button>

                    <button
                      onClick={() => setActiveTab('progress')}
                      className="w-full p-3 rounded-xl transition-colors flex items-center justify-center space-x-2 focus:outline-none font-medium"
                      style={{ background: 'var(--gold-light)', color: 'var(--gold-dark)', border: '1px solid var(--gold)' }}
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span>{t('dashboard.viewAnalytics', 'View Analytics')}</span>
                    </button>

                    {/* Refresh Button */}
                    <button
                      onClick={onRefresh}
                      disabled={loading}
                      className="w-full disabled:opacity-50 disabled:cursor-not-allowed p-3 rounded-xl transition-colors flex items-center justify-center space-x-2 focus:outline-none font-medium border"
                      style={{ color: 'var(--text-muted)', borderColor: 'var(--border)', background: 'var(--surface)' }}
                    >
                      <TrendingUp className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                      <span>{loading ? t('dashboard.refreshing', 'Refreshing...') : t('dashboard.refreshData', 'Refresh Data')}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="space-y-6 lg:space-y-8">
              {/* Analytics Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 justify-items-center max-w-4xl mx-auto dashboard-stats-grid dashboard-grid">
                <div className="p-6 rounded-xl shadow-sm w-full" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div className="text-3xl font-bold" style={{ color: 'var(--royal)' }}>{stats.total}</div>
                  <div className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{t('dashboard.totalTasks', 'Total Tasks')}</div>
                </div>
                <div className="p-6 rounded-xl shadow-sm w-full" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
                  <div className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{t('dashboard.completed', 'Completed')}</div>
                </div>
                <div className="p-6 rounded-xl shadow-sm w-full" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div className="text-3xl font-bold" style={{ color: 'var(--royal)' }}>{stats.inProgress}</div>
                  <div className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{t('dashboard.inProgress', 'In Progress')}</div>
                </div>
                <div className="p-6 rounded-xl shadow-sm w-full" style={{ background: 'var(--gold-light)', border: '2px solid var(--gold)' }}>
                  <div className="text-3xl font-bold" style={{ color: 'var(--gold-dark)' }}>{stats.totalHours.toFixed(1)}h</div>
                  <div className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{t('dashboard.totalTime', 'Total Time')}</div>
                </div>
              </div>

              {/* Progress Distribution */}
              <div className="p-6 rounded-xl shadow-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>{t('dashboard.progressDistribution', 'Progress Distribution')}</h3>
                <div className="space-y-3">
                  {[
                    { range: `${t('dashboard.notStarted', 'Not Started (0%)')}`, count: progressDistribution.notStarted, color: 'bg-red-400' },
                    { range: `${t('dashboard.gettingStarted', 'Getting Started (1-25%)')}`, count: progressDistribution.early, color: 'bg-orange-400' },
                    { range: `${t('dashboard.makingProgress', 'Making Progress (26-50%)')}`, count: progressDistribution.quarter, color: 'bg-yellow-400' },
                    { range: `${t('dashboard.halfwayThere', 'Halfway There (51-75%)')}`, count: progressDistribution.half, color: 'bg-[#2451A3]' },
                    { range: `${t('dashboard.almostDone', 'Almost Done (76-99%)')}`, count: progressDistribution.mostlyDone, color: 'bg-[#C9973C]' },
                    { range: `${t('dashboard.completed', 'Completed (100%)')}`, count: progressDistribution.completed, color: 'bg-green-500' }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-24 text-sm" style={{ color: 'var(--text-muted)' }}>{item.range}</div>
                      <div className="flex-1 rounded-full h-6 relative" style={{ background: 'var(--surface-2)' }}>
                        <div
                          className={`${item.color} h-6 rounded-full transition-all duration-500 flex items-center justify-end px-2`}
                          style={{ width: `${stats.total > 0 ? (item.count / stats.total) * 100 : 0}%` }}
                        >
                          {item.count > 0 && (
                            <span className="text-white text-xs font-medium">{item.count}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Average Progress */}
              <div className="p-6 rounded-xl shadow-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>{t('dashboard.averageProgress', 'Average Progress')}</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Suspense fallback={<div className="h-4 rounded animate-pulse" style={{ background: 'var(--surface-2)' }}></div>}>
                      <ProgressBar progress={stats.averageProgress} className="h-4" />
                    </Suspense>
                  </div>
                  <div className="text-2xl font-bold" style={{ color: 'var(--royal)' }}>{stats.averageProgress.toFixed(1)}%</div>
                </div>
              </div>

              {/* Recent Activity */}
              {analytics?.recentActivity && analytics.recentActivity.length > 0 && (
                <div className="p-6 rounded-xl shadow-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>{t('dashboard.recentActivity', 'Recent Activity')}</h3>
                  <div className="space-y-3">
                    {analytics.recentActivity.slice(0, 5).map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--surface-2)' }}>
                        <div>
                          <div className="font-medium" style={{ color: 'var(--text)' }}>{activity.title}</div>
                          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                            {t('dashboard.lastWorked', 'Last worked')}: {new Date(activity.lastWorkedOn).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium" style={{ color: 'var(--royal)' }}>{activity.progress}%</div>
                          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{(activity.totalHours || 0).toFixed(1)}h</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </DashboardErrorBoundary>
  )
}

export default Dashboard