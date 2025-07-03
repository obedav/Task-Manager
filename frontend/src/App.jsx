import { useState, useEffect } from 'react'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './hooks/useAuth'
import { usePWA } from './hooks/usePWA'
import Header from './components/Header'
import TaskList from './components/TaskList'
import Login from './pages/Login'
import taskService from './services/taskService'
import authService from './services/authService'
import { parseError } from './utils/helpers'
import { TASK_STATUS } from './utils/constants'

// FIXED: Use regular imports instead of lazy loading
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Task'

// For progress tracker, create a simple fallback component to avoid import issues
const ProgressTracker = ({ tasks = [], analytics, onRefresh, loading = false }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Progress Analytics</h1>
          <p className="text-gray-400 mb-8">Track your daily progress and performance</p>
          
          {/* Simple stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-lg border border-slate-700/50">
              <div className="text-3xl font-bold text-white">{tasks.length}</div>
              <div className="text-gray-400 text-sm">Total Tasks</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-lg border border-slate-700/50">
              <div className="text-3xl font-bold text-green-400">
                {tasks.filter(t => t.status === 'completed' || t.progress === 100).length}
              </div>
              <div className="text-gray-400 text-sm">Completed</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-lg border border-slate-700/50">
              <div className="text-3xl font-bold text-purple-400">
                {tasks.filter(t => t.status === 'in-progress' || (t.progress > 0 && t.progress < 100)).length}
              </div>
              <div className="text-gray-400 text-sm">In Progress</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-lg border border-slate-700/50">
              <div className="text-3xl font-bold text-blue-400">
                {tasks.reduce((sum, task) => sum + (task.totalHours || 0), 0).toFixed(1)}h
              </div>
              <div className="text-gray-400 text-sm">Total Time</div>
            </div>
          </div>

          {/* Task list */}
          <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-lg border border-slate-700/50">
            <h2 className="text-lg font-semibold text-white mb-4">All Tasks</h2>
            {tasks.length > 0 ? (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div key={task._id || task.id} className="p-3 bg-slate-700/30 rounded-lg text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">{task.title}</span>
                      <span className="text-purple-400">{task.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${task.progress || 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No tasks available</p>
            )}
          </div>

          {loading && (
            <div className="mt-4 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-purple-500"></div>
              <span className="ml-2 text-gray-400">Loading...</span>
            </div>
          )}
          
          <button
            onClick={onRefresh}
            className="mt-6 bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  )
}

// Simple Daily Check-in Modal component to avoid import issues
const DailyCheckInModal = ({ isOpen, onClose, task, onSubmit, loading = false }) => {
  const [progress, setProgress] = useState(0)
  const [accomplishments, setAccomplishments] = useState('')

  useEffect(() => {
    if (task && isOpen) {
      setProgress(Number(task?.progress) || 0)
      setAccomplishments('')
    }
  }, [task, isOpen])

  const handleSubmit = async () => {
    if (!accomplishments.trim()) return

    try {
      const checkInData = {
        taskId: task?.id || task?._id,
        progress: progress,
        accomplishments: accomplishments.trim(),
        date: new Date().toISOString()
      }

      await onSubmit(checkInData)
      onClose()
    } catch (error) {
      console.error('Daily check-in submission error:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Daily Check-in</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-slate-700 transition-colors"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Update Progress: {progress}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              What did you accomplish? *
            </label>
            <textarea
              value={accomplishments}
              onChange={(e) => setAccomplishments(e.target.value)}
              placeholder="Describe what you worked on..."
              rows={3}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              required
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !accomplishments.trim()}
            className="bg-purple-500 hover:bg-purple-600 disabled:bg-purple-700 text-white py-2 px-6 rounded-lg transition-colors flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Check-in</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// Import PWA components
import { 
  InstallAppButton, 
  NotificationButton, 
  OnlineStatus, 
  UpdateBanner, 
  OfflineTasksIndicator,
  PWAInstallPrompt 
} from './components/PWAComponents'

import './index.css'
import './App.css'

// Create optimized loading component
const OptimizedLoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-purple-500"></div>
  </div>
)

// Enhanced Toast Notification System
const ToastContainer = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null

  return (
    <div 
      className="fixed top-4 right-4 z-50 space-y-2"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`max-w-sm p-4 rounded-lg shadow-lg border transform transition-all duration-300 ${
            toast.type === 'success' 
              ? 'bg-green-900/90 border-green-500 text-green-100' 
              : toast.type === 'error'
              ? 'bg-red-900/90 border-red-500 text-red-100'
              : 'bg-blue-900/90 border-blue-500 text-blue-100'
          }`}
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <p className="font-medium">{toast.title}</p>
                {toast.message && (
                  <p className="text-sm opacity-90">{toast.message}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-3 text-current opacity-70 hover:opacity-100"
              aria-label="Close notification"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

// Enhanced Loading Overlay Component
const AppLoadingOverlay = ({ isVisible, message = "Loading..." }) => {
  if (!isVisible) return null

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40"
      role="dialog"
      aria-modal="true"
      aria-label="Loading"
    >
      <div className="bg-slate-800 rounded-xl p-6 flex items-center space-x-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
        <span className="text-white font-medium">{message}</span>
      </div>
    </div>
  )
}

const AppContent = () => {
  const { user, isAuthenticated, loading: authLoading, login, logout } = useAuth()
  const { 
    isOnline, 
    createOfflineTask, 
    hasOfflineTasks,
    canInstall,
    updateAvailable 
  } = usePWA()
  
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  
  // Progress tracking state
  const [checkInModal, setCheckInModal] = useState({ isOpen: false, task: null })
  const [analytics, setAnalytics] = useState(null)
  const [progressLoading, setProgressLoading] = useState(false)
  
  // Enhanced UX state
  const [toasts, setToasts] = useState([])
  const [actionLoading, setActionLoading] = useState({
    createTask: false,
    updateTask: false,
    deleteTask: false,
    updateProgress: false,
    logTime: false,
    dailyCheckIn: false
  })

  // Toast management
  const addToast = (toast) => {
    const id = Date.now() + Math.random()
    const newToast = { id, ...toast }
    setToasts(prev => [...prev, newToast])
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeToast(id)
    }, 5000)
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  // Enhanced loading state management
  const setActionLoadingState = (action, isLoading) => {
    setActionLoading(prev => ({
      ...prev,
      [action]: isLoading
    }))
  }

  // PWA event listeners
  useEffect(() => {
    const handleNewTaskShortcut = () => {
      if (isAuthenticated) {
        setShowTaskModal(true)
      }
    }

    // Show install prompt after some time if installable
    const installPromptTimer = setTimeout(() => {
      if (canInstall && !localStorage.getItem('install-prompt-dismissed')) {
        setShowInstallPrompt(true)
      }
    }, 30000) // Show after 30 seconds

    window.addEventListener('pwa-new-task', handleNewTaskShortcut)

    return () => {
      window.removeEventListener('pwa-new-task', handleNewTaskShortcut)
      clearTimeout(installPromptTimer)
    }
  }, [isAuthenticated, canInstall])

  useEffect(() => {
    if (isAuthenticated) {
      loadTasks()
      loadAnalytics()
    }
  }, [isAuthenticated])

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Escape key to close modals
      if (e.key === 'Escape') {
        if (showTaskModal) {
          setShowTaskModal(false)
        }
        if (checkInModal.isOpen) {
          setCheckInModal({ isOpen: false, task: null })
        }
      }
      
      // Ctrl+N to create new task
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault()
        if (isAuthenticated) {
          setShowTaskModal(true)
        }
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [showTaskModal, checkInModal.isOpen, isAuthenticated])

  const loadTasks = async () => {
    try {
      setLoading(true)
      setError(null)
      const tasksData = await taskService.getAllTasks()
      setTasks(tasksData?.tasks || [])
      
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Tasks loaded successfully')
      }
    } catch (error) {
      const errorMessage = parseError(error)
      setError(errorMessage)
      addToast({
        type: 'error',
        title: 'Failed to load tasks',
        message: errorMessage
      })
      
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to load tasks:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  const loadAnalytics = async () => {
    try {
      setProgressLoading(true)
      const analyticsData = await taskService.getAnalytics()
      setAnalytics(analyticsData?.analytics || null)
      
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Analytics loaded')
      }
    } catch (error) {
      // Analytics failures are non-critical - just log them
      if (process.env.NODE_ENV === 'development') {
        console.warn('Analytics failed (non-critical):', error)
      }
    } finally {
      setProgressLoading(false)
    }
  }

  const refreshData = async () => {
    try {
      await Promise.all([loadTasks(), loadAnalytics()])
      addToast({
        type: 'success',
        title: 'Data refreshed',
        message: 'All data has been updated'
      })
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Refresh failed',
        message: 'Could not refresh all data'
      })
    }
  }

  const handleLogin = async (credentials) => {
    try {
      await login(credentials)
      addToast({
        type: 'success',
        title: 'Welcome back!',
        message: 'You have successfully logged in'
      })
    } catch (error) {
      throw error
    }
  }

  const handleRegister = async (userData) => {
    try {
      const result = await authService.register(userData)
      if (result.success) {
        await login({ email: userData.email, password: userData.password })
        addToast({
          type: 'success',
          title: 'Welcome to TaskFlow!',
          message: 'Your account has been created successfully'
        })
      }
    } catch (error) {
      throw error
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      setTasks([])
      setAnalytics(null)
      setCurrentPage('dashboard')
      addToast({
        type: 'success',
        title: 'Logged out',
        message: 'You have been successfully logged out'
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Logout failed:', error)
      }
    }
  }

  const handleAddTask = async (taskData) => {
    try {
      setActionLoadingState('createTask', true)
      
      const cleanTaskData = {
        title: String(taskData.title || '').trim(),
        description: String(taskData.description || '').trim(),
        priority: String(taskData.priority || 'medium'),
        dueDate: taskData.dueDate ? String(taskData.dueDate) : null,
        category: String(taskData.category || '').trim(),
        estimatedHours: taskData.estimatedHours ? Number(taskData.estimatedHours) : null
      }
      
      const enhancedTaskData = {
        ...cleanTaskData,
        progress: 0,
        timeEntries: [],
        dailyUpdates: [],
        progressHistory: []
      }

      let result
      let newTask

      if (!isOnline) {
        newTask = await createOfflineTask(enhancedTaskData)
        addToast({
          type: 'info',
          title: 'Task created offline',
          message: `"${cleanTaskData.title}" will sync when you're back online`
        })
      } else {
        result = await taskService.createTask(enhancedTaskData)
        newTask = result?.task || result
        addToast({
          type: 'success',
          title: 'Task created',
          message: `"${cleanTaskData.title}" has been added to your tasks`
        })
      }

      setTasks(prev => [newTask, ...prev])
      setShowTaskModal(false)
      
      if (isOnline) {
        loadAnalytics()
      }
    } catch (error) {
      const errorMessage = parseError(error)
      setError(errorMessage)
      addToast({
        type: 'error',
        title: 'Failed to create task',
        message: errorMessage
      })
      console.error('handleAddTask error:', error)
      throw error
    } finally {
      setActionLoadingState('createTask', false)
    }
  }

  const handleEditTask = async (taskId, taskData) => {
    try {
      setActionLoadingState('updateTask', true)
      
      const result = await taskService.updateTask(taskId, taskData)
      const updatedTask = result?.task || result
      setTasks(prev => prev.map(task => 
        (task.id || task._id) === taskId ? updatedTask : task
      ))
      
      addToast({
        type: 'success',
        title: 'Task updated',
        message: 'Your changes have been saved'
      })
      
      loadAnalytics()
    } catch (error) {
      const errorMessage = parseError(error)
      setError(errorMessage)
      addToast({
        type: 'error',
        title: 'Failed to update task',
        message: errorMessage
      })
      throw error
    } finally {
      setActionLoadingState('updateTask', false)
    }
  }

  const handleDeleteTask = async (taskId) => {
    try {
      setActionLoadingState('deleteTask', true)
      
      const taskToDelete = tasks.find(t => (t.id || t._id) === taskId)
      await taskService.deleteTask(taskId)
      setTasks(prev => prev.filter(task => (task.id || task._id) !== taskId))
      
      addToast({
        type: 'success',
        title: 'Task deleted',
        message: `"${taskToDelete?.title || 'Task'}" has been removed`
      })
      
      loadAnalytics()
    } catch (error) {
      const errorMessage = parseError(error)
      setError(errorMessage)
      addToast({
        type: 'error',
        title: 'Failed to delete task',
        message: errorMessage
      })
      throw error
    } finally {
      setActionLoadingState('deleteTask', false)
    }
  }

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      setActionLoadingState('updateTask', true)
      
      const result = await taskService.updateTaskStatus(taskId, newStatus)
      const updatedTask = result?.task || result
      setTasks(prev => prev.map(task => 
        (task.id || task._id) === taskId ? updatedTask : task
      ))
      
      const statusMessages = {
        'pending': 'Task marked as pending',
        'in-progress': 'Task marked as in progress',
        'completed': 'Task completed! 🎉'
      }
      
      addToast({
        type: newStatus === 'completed' ? 'success' : 'info',
        title: 'Status updated',
        message: statusMessages[newStatus] || 'Task status updated'
      })
      
      loadAnalytics()
    } catch (error) {
      const errorMessage = parseError(error)
      setError(errorMessage)
      addToast({
        type: 'error',
        title: 'Failed to update status',
        message: errorMessage
      })
      throw error
    } finally {
      setActionLoadingState('updateTask', false)
    }
  }

  const handleProgressUpdate = async (taskId, progress, note = '') => {
    try {
      setActionLoadingState('updateProgress', true)
      
      const result = await taskService.updateProgress(taskId, progress, note)
      const updatedTask = result?.task || result
      
      setTasks(prev => prev.map(task => 
        (task.id || task._id) === taskId ? updatedTask : task
      ))
      
      addToast({
        type: 'success',
        title: 'Progress updated',
        message: `Progress set to ${progress}%`
      })
      
      loadAnalytics()
    } catch (error) {
      const errorMessage = parseError(error)
      setError(errorMessage)
      addToast({
        type: 'error',
        title: 'Failed to update progress',
        message: errorMessage
      })
      throw error
    } finally {
      setActionLoadingState('updateProgress', false)
    }
  }

  const handleTimeLog = async (taskId, timeData) => {
    try {
      setActionLoadingState('logTime', true)
      
      const result = await taskService.addTimeEntry(taskId, timeData.hours, timeData.description)
      const updatedTask = result?.task || result
      
      setTasks(prev => prev.map(task => 
        (task.id || task._id) === taskId ? updatedTask : task
      ))
      
      addToast({
        type: 'success',
        title: 'Time logged',
        message: `${timeData.hours} hours recorded`
      })
      
      loadAnalytics()
    } catch (error) {
      const errorMessage = parseError(error)
      setError(errorMessage)
      addToast({
        type: 'error',
        title: 'Failed to log time',
        message: errorMessage
      })
      throw error
    } finally {
      setActionLoadingState('logTime', false)
    }
  }

  const handleDailyCheckIn = (task) => {
    setCheckInModal({ isOpen: true, task })
  }

  const handleCheckInSubmit = async (checkInData) => {
    try {
      setActionLoadingState('dailyCheckIn', true)
      
      const taskId = checkInModal.task?.id || checkInModal.task?._id
      const result = await taskService.addDailyUpdate(taskId, checkInData)
      const updatedTask = result?.task || result
      
      setTasks(prev => prev.map(task => 
        (task.id || task._id) === taskId ? updatedTask : task
      ))
      
      setCheckInModal({ isOpen: false, task: null })
      
      addToast({
        type: 'success',
        title: 'Check-in saved',
        message: 'Your daily update has been recorded'
      })
      
      loadAnalytics()
    } catch (error) {
      const errorMessage = parseError(error)
      setError(errorMessage)
      addToast({
        type: 'error',
        title: 'Failed to save check-in',
        message: errorMessage
      })
    } finally {
      setActionLoadingState('dailyCheckIn', false)
    }
  }

  const openTaskModal = () => {
    setShowTaskModal(true)
  }

  const navigateToTasks = () => {
    setCurrentPage('tasks')
  }

  const navigateToDashboard = () => {
    setCurrentPage('dashboard')
  }

  const navigateToProgress = () => {
    setCurrentPage('progress')
  }

  // FIXED: Remove Suspense and lazy loading - use direct rendering
  const renderCurrentPage = () => {
    const commonProps = {
      tasks,
      onProgressUpdate: handleProgressUpdate,
      onTimeLog: handleTimeLog,
      onDailyCheckIn: handleDailyCheckIn,
      progressLoading: Object.values(actionLoading).some(Boolean),
      actionLoading
    }

    switch (currentPage) {
      case 'tasks':
        return (
          <Tasks
            {...commonProps}
            onAddTask={openTaskModal}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onStatusChange={handleStatusChange}
            loading={loading}
          />
        )
      case 'progress':
        return (
          <ProgressTracker
            {...commonProps}
            analytics={analytics}
            onRefresh={refreshData}
            loading={progressLoading}
          />
        )
      case 'dashboard':
      default:
        return (
          <Dashboard
            {...commonProps}
            analytics={analytics}
            user={user}
            onAddTask={openTaskModal}
            onNavigateToTasks={navigateToTasks}
          />
        )
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center" role="status" aria-label="Loading application">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white mb-2">Loading TaskFlow</h2>
          <p className="text-gray-400">Initializing your workspace...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <>
        <Login 
          onLogin={handleLogin}
          onRegister={handleRegister}
          loading={loading}
          error={error}
        />
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* PWA Update Banner */}
      <UpdateBanner />
      
      <Header
        onAddTask={openTaskModal}
        user={user}
        onLogout={handleLogout}
      />

      <nav 
        className="bg-slate-800/40 backdrop-blur-sm border-b border-slate-700/50"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex space-x-8">
              <button
                onClick={navigateToDashboard}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800 ${
                  currentPage === 'dashboard'
                    ? 'border-purple-500 text-purple-300'
                    : 'border-transparent text-gray-400 hover:text-white hover:border-gray-300'
                }`}
                aria-current={currentPage === 'dashboard' ? 'page' : undefined}
              >
                Dashboard
              </button>
              <button
                onClick={navigateToTasks}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800 ${
                  currentPage === 'tasks'
                    ? 'border-purple-500 text-purple-300'
                    : 'border-transparent text-gray-400 hover:text-white hover:border-gray-300'
                }`}
                aria-current={currentPage === 'tasks' ? 'page' : undefined}
              >
                Tasks
              </button>
              <button
                onClick={navigateToProgress}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800 ${
                  currentPage === 'progress'
                    ? 'border-purple-500 text-purple-300'
                    : 'border-transparent text-gray-400 hover:text-white hover:border-gray-300'
                }`}
                aria-current={currentPage === 'progress' ? 'page' : undefined}
              >
                Progress Analytics
              </button>
            </div>
            
            {/* PWA Status Indicators */}
            <div className="flex items-center space-x-4">
              <OnlineStatus />
              {!isOnline && hasOfflineTasks && (
                <span className="text-xs text-yellow-400">
                  Offline tasks pending
                </span>
              )}
              <InstallAppButton className="hidden sm:flex" />
              <NotificationButton className="hidden sm:flex" />
            </div>
          </div>
        </div>
      </nav>

      <main role="main">
        {renderCurrentPage()}
      </main>

      {/* Enhanced Task Creation Modal */}
      {showTaskModal && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h2 id="modal-title" className="text-xl font-bold text-white">Create New Task</h2>
              <button
                onClick={() => setShowTaskModal(false)}
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                aria-label="Close dialog"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault()
                
                const formData = new FormData(e.target)
                
                const taskData = {
                  title: (formData.get('title') || '').toString().trim(),
                  description: (formData.get('description') || '').toString().trim(),
                  priority: (formData.get('priority') || 'medium').toString(),
                  dueDate: formData.get('dueDate') ? formData.get('dueDate').toString() : null,
                  category: (formData.get('category') || '').toString().trim(),
                  estimatedHours: formData.get('estimatedHours') ? parseFloat(formData.get('estimatedHours').toString()) : null
                }
                
                handleAddTask(taskData)
              }}
              className="p-6 space-y-6"
            >
              <div>
                <label htmlFor="task-title" className="block text-sm font-medium text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  id="task-title"
                  type="text"
                  name="title"
                  required
                  placeholder="Enter task title..."
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  aria-describedby="title-help"
                />
                <p id="title-help" className="text-xs text-gray-400 mt-1">Give your task a clear, descriptive name</p>
              </div>

              <div>
                <label htmlFor="task-description" className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  id="task-description"
                  name="description"
                  rows={3}
                  placeholder="Add task description..."
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="task-priority" className="block text-sm font-medium text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    id="task-priority"
                    name="priority"
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="task-category" className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <input
                    id="task-category"
                    type="text"
                    name="category"
                    placeholder="e.g., Work, Personal..."
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="task-due-date" className="block text-sm font-medium text-gray-300 mb-2">
                    Due Date
                  </label>
                  <input
                    id="task-due-date"
                    type="datetime-local"
                    name="dueDate"
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="task-estimated-hours" className="block text-sm font-medium text-gray-300 mb-2">
                    Estimated Hours
                  </label>
                  <input
                    id="task-estimated-hours"
                    type="number"
                    step="0.5"
                    min="0"
                    name="estimatedHours"
                    placeholder="e.g., 5"
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 px-4 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
                  disabled={actionLoading.createTask}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading.createTask}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-slate-600 disabled:to-slate-600 text-white py-3 px-4 rounded-xl transition-all transform hover:scale-105 disabled:transform-none focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center justify-center space-x-2"
                >
                  {actionLoading.createTask ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Task</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Daily Check-in Modal - NO SUSPENSE */}
      <DailyCheckInModal
        isOpen={checkInModal.isOpen}
        onClose={() => setCheckInModal({ isOpen: false, task: null })}
        task={checkInModal.task}
        onSubmit={handleCheckInSubmit}
        loading={actionLoading.dailyCheckIn}
      />

      {/* Loading Overlay */}
      <AppLoadingOverlay 
        isVisible={Object.values(actionLoading).some(Boolean)} 
        message="Processing your request..."
      />

      {/* PWA Install Prompt */}
      <PWAInstallPrompt 
        isOpen={showInstallPrompt} 
        onClose={() => {
          setShowInstallPrompt(false)
          localStorage.setItem('install-prompt-dismissed', 'true')
        }} 
      />

      {/* Offline Tasks Indicator */}
      <OfflineTasksIndicator />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <AppContent />
      </div>
    </AuthProvider>
  )
}

export default App