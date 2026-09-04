import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { AuthProvider } from './context/AuthContext'
import { useAuth } from './hooks/useAuth'
import { usePWA } from './hooks/usePWA'
import { useToast } from './hooks/useToast'

import Header from './components/Header'
import Navigation from './components/layout/Navigation'
import ToastContainer from './components/ui/ToastContainer'
import AppLoadingOverlay from './components/ui/AppLoadingOverlay'
import DailyCheckInModal from './components/tasks/DailyCheckInModal'
import CreateTaskModal from './components/tasks/CreateTaskModal'
import { UpdateBanner, OfflineTasksIndicator, PWAInstallPrompt } from './components/PWAComponents'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Task'
import Settings from './pages/Settings'
import { ProgressTracker } from './components/ProgressTracker'

import taskService from './services/taskService'
import { parseError } from './utils/helpers'

import './index.css'
import './App.css'

// ── AppContent ───────────────────────────────────────────────────────────────
const AppContent = () => {
  const { user, isAuthenticated, loading: authLoading, login, logout, register } = useAuth()
  const { isOnline, createOfflineTask, canInstall } = usePWA()
  const { toasts, addToast, removeToast } = useToast()

  const [tasks,           setTasks]           = useState([])
  const [analytics,       setAnalytics]       = useState(null)
  const [loading,         setLoading]         = useState(false)
  const [progressLoading, setProgressLoading] = useState(false)
  const [actionLoading,   setActionLoading]   = useState({})
  const [showTaskModal,   setShowTaskModal]   = useState(false)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [checkInModal,    setCheckInModal]    = useState({ isOpen: false, task: null })

  const busy = (key) => setActionLoading((p) => ({ ...p, [key]: true }))
  const idle = (key) => setActionLoading((p) => ({ ...p, [key]: false }))
  const isAnyBusy = Object.values(actionLoading).some(Boolean)

  // ── Data loading ─────────────────────────────────────────────────────────
  const loadTasks = async () => {
    setLoading(true)
    try {
      const data = await taskService.getAllTasks()
      setTasks(data?.tasks ?? [])
    } catch (err) {
      addToast({ type: 'error', title: 'Failed to load tasks', message: parseError(err) })
    } finally {
      setLoading(false)
    }
  }

  const loadAnalytics = async () => {
    setProgressLoading(true)
    try {
      setAnalytics(await taskService.getAnalytics())
    } catch {
      // non-critical
    } finally {
      setProgressLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadTasks()
      loadAnalytics()
    }
  }, [isAuthenticated])

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setShowTaskModal(false)
        setCheckInModal({ isOpen: false, task: null })
      }
      if (e.ctrlKey && e.key === 'n' && isAuthenticated) {
        e.preventDefault()
        setShowTaskModal(true)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isAuthenticated])

  // ── PWA install prompt ────────────────────────────────────────────────────
  useEffect(() => {
    if (!canInstall || localStorage.getItem('install-prompt-dismissed')) return
    const t = setTimeout(() => setShowInstallPrompt(true), 30_000)
    return () => clearTimeout(t)
  }, [canInstall])

  // ── Auth handlers ─────────────────────────────────────────────────────────
  const handleLogin = async (credentials) => {
    await login(credentials)
    addToast({ type: 'success', title: 'Welcome back!' })
  }

  const handleRegister = async (userData) => {
    await register(userData)
    addToast({ type: 'success', title: 'Welcome to TaskFlow!' })
  }

  const handleLogout = async () => {
    await logout()
    setTasks([])
    setAnalytics(null)
    addToast({ type: 'success', title: 'Logged out' })
  }

  // ── Task handlers ─────────────────────────────────────────────────────────
  const handleAddTask = async (taskData) => {
    busy('createTask')
    try {
      let newTask
      if (!isOnline) {
        newTask = await createOfflineTask(taskData)
        addToast({ type: 'info', title: 'Task saved offline', message: 'Will sync when back online' })
      } else {
        newTask = await taskService.createTask(taskData)
        addToast({ type: 'success', title: 'Task created', message: `"${taskData.title}" added` })
      }
      setTasks((prev) => [newTask, ...prev])
      setShowTaskModal(false)
      if (isOnline) loadAnalytics()
    } catch (err) {
      addToast({ type: 'error', title: 'Failed to create task', message: parseError(err) })
      throw err
    } finally {
      idle('createTask')
    }
  }

  const handleEditTask = async (taskId, data) => {
    busy('updateTask')
    try {
      const updated = await taskService.updateTask(taskId, data)
      setTasks((prev) => prev.map((t) => (t._id === taskId || t.id === taskId) ? updated : t))
      addToast({ type: 'success', title: 'Task updated' })
      loadAnalytics()
    } catch (err) {
      addToast({ type: 'error', title: 'Failed to update task', message: parseError(err) })
      throw err
    } finally {
      idle('updateTask')
    }
  }

  const handleDeleteTask = async (taskId) => {
    busy('deleteTask')
    try {
      const gone = tasks.find((t) => t._id === taskId || t.id === taskId)
      await taskService.deleteTask(taskId)
      setTasks((prev) => prev.filter((t) => t._id !== taskId && t.id !== taskId))
      addToast({ type: 'success', title: 'Task deleted', message: `"${gone?.title}" removed` })
      loadAnalytics()
    } catch (err) {
      addToast({ type: 'error', title: 'Failed to delete task', message: parseError(err) })
      throw err
    } finally {
      idle('deleteTask')
    }
  }

  const handleStatusChange = async (taskId, status) => {
    busy('updateTask')
    try {
      const updated = await taskService.updateTaskStatus(taskId, status)
      setTasks((prev) => prev.map((t) => (t._id === taskId || t.id === taskId) ? updated : t))
      addToast({ type: status === 'completed' ? 'success' : 'info', title: 'Status updated', message: status === 'completed' ? 'Task completed! 🎉' : `Marked as ${status}` })
      loadAnalytics()
    } catch (err) {
      addToast({ type: 'error', title: 'Failed to update status', message: parseError(err) })
      throw err
    } finally {
      idle('updateTask')
    }
  }

  const handleProgressUpdate = async (taskId, progress, note = '') => {
    busy('updateProgress')
    try {
      const updated = await taskService.updateProgress(taskId, progress, note)
      setTasks((prev) => prev.map((t) => (t._id === taskId || t.id === taskId) ? updated : t))
      addToast({ type: 'success', title: 'Progress updated', message: `${progress}%` })
      loadAnalytics()
    } catch (err) {
      addToast({ type: 'error', title: 'Failed to update progress', message: parseError(err) })
      throw err
    } finally {
      idle('updateProgress')
    }
  }

  const handleTimeLog = async (taskId, { hours, description }) => {
    busy('logTime')
    try {
      const updated = await taskService.addTimeEntry(taskId, hours, description)
      setTasks((prev) => prev.map((t) => (t._id === taskId || t.id === taskId) ? updated : t))
      addToast({ type: 'success', title: 'Time logged', message: `${hours}h recorded` })
      loadAnalytics()
    } catch (err) {
      addToast({ type: 'error', title: 'Failed to log time', message: parseError(err) })
      throw err
    } finally {
      idle('logTime')
    }
  }

  const handleCheckInSubmit = async (data) => {
    busy('dailyCheckIn')
    try {
      const taskId = checkInModal.task?._id || checkInModal.task?.id
      const updated = await taskService.addDailyUpdate(taskId, data)
      setTasks((prev) => prev.map((t) => (t._id === taskId || t.id === taskId) ? updated : t))
      setCheckInModal({ isOpen: false, task: null })
      addToast({ type: 'success', title: 'Check-in saved' })
      loadAnalytics()
    } catch (err) {
      addToast({ type: 'error', title: 'Failed to save check-in', message: parseError(err) })
    } finally {
      idle('dailyCheckIn')
    }
  }

  const refreshData = async () => {
    await Promise.all([loadTasks(), loadAnalytics()])
    addToast({ type: 'success', title: 'Data refreshed' })
  }

  // ── Render ────────────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="text-center" role="status">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--royal)' }} />
          <p className="font-semibold" style={{ color: 'var(--text)' }}>Loading TaskFlow…</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <>
        <Login onLogin={handleLogin} onRegister={handleRegister} loading={loading} />
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </>
    )
  }

  const commonProps = {
    tasks, analytics, user,
    loading: loading || progressLoading,
    actionLoading,
    onAddTask:       () => setShowTaskModal(true),
    onEditTask:      handleEditTask,
    onDeleteTask:    handleDeleteTask,
    onStatusChange:  handleStatusChange,
    onProgressUpdate: handleProgressUpdate,
    onTimeLog:       handleTimeLog,
    onDailyCheckIn:  (task) => setCheckInModal({ isOpen: true, task }),
    onRefresh:       refreshData
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <UpdateBanner />

      <Header onAddTask={() => setShowTaskModal(true)} user={user} onLogout={handleLogout} />
      <Navigation />

      <main role="main">
        <Routes>
          <Route path="/"         element={<Dashboard      {...commonProps} />} />
          <Route path="/tasks"    element={<Tasks          {...commonProps} />} />
          <Route path="/progress" element={<ProgressTracker {...commonProps} />} />
          <Route path="/settings" element={<Settings       {...commonProps} />} />
        </Routes>
      </main>

      <CreateTaskModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onSubmit={handleAddTask}
        loading={actionLoading.createTask}
      />

      <DailyCheckInModal
        isOpen={checkInModal.isOpen}
        onClose={() => setCheckInModal({ isOpen: false, task: null })}
        task={checkInModal.task}
        onSubmit={handleCheckInSubmit}
        loading={actionLoading.dailyCheckIn}
      />

      <AppLoadingOverlay isVisible={isAnyBusy} message="Processing…" />

      <PWAInstallPrompt
        isOpen={showInstallPrompt}
        onClose={() => {
          setShowInstallPrompt(false)
          localStorage.setItem('install-prompt-dismissed', 'true')
        }}
      />

      <OfflineTasksIndicator />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}

// ── Root App ─────────────────────────────────────────────────────────────────
function App() {
  const { i18n } = useTranslation()
  const [langKey, setLangKey] = useState(i18n.language)

  useEffect(() => {
    const onChange = (lng) => {
      setLangKey(lng)
      document.documentElement.lang = lng
    }
    i18n.on('languageChanged', onChange)
    document.documentElement.lang = i18n.language
    return () => i18n.off('languageChanged', onChange)
  }, [i18n])

  return (
    <Router>
      <AuthProvider>
        <div className="App" key={langKey}>
          <AppContent />
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
