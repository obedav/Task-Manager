import { useState, useEffect } from 'react'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './hooks/useAuth'
import Header from './components/Header'
import TaskList from './components/TaskList'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Tasks from './pages/Task'
import taskService from './services/taskService'
import authService from './services/authService'
import { parseError } from './utils/helpers'
import { TASK_STATUS } from './utils/constants'

// Import progress tracking components
import { DailyCheckInModal, ProgressTracker } from './components/ProgressTracker'

import './index.css'
import './App.css'

const AppContent = () => {
  const { user, isAuthenticated, loading: authLoading, login, logout } = useAuth()
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showTaskModal, setShowTaskModal] = useState(false)
  
  // Progress tracking state
  const [checkInModal, setCheckInModal] = useState({ isOpen: false, task: null })
  const [analytics, setAnalytics] = useState(null)
  const [progressLoading, setProgressLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      loadTasks()
      loadAnalytics()
    }
  }, [isAuthenticated])

  const loadTasks = async () => {
    try {
      setLoading(true)
      setError(null)
      const tasksData = await taskService.getAllTasks()
      // Extract the tasks array from the API response
      setTasks(tasksData?.tasks || [])
    } catch (error) {
      setError(parseError(error))
      console.error('Failed to load tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAnalytics = async () => {
    try {
      setProgressLoading(true)
      const analyticsData = await taskService.getAnalytics()
      setAnalytics(analyticsData?.analytics || null)
    } catch (error) {
      console.error('Failed to load analytics:', error)
      // Don't show error for analytics, just log it
    } finally {
      setProgressLoading(false)
    }
  }

  const refreshData = async () => {
    await Promise.all([loadTasks(), loadAnalytics()])
  }

  const handleLogin = async (credentials) => {
    try {
      await login(credentials)
    } catch (error) {
      throw error
    }
  }

  const handleRegister = async (userData) => {
    try {
      const result = await authService.register(userData)
      if (result.success) {
        await login({ email: userData.email, password: userData.password })
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
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleAddTask = async (taskData) => {
    try {
      // Add default progress tracking fields
      const enhancedTaskData = {
        ...taskData,
        progress: 0,
        timeEntries: [],
        dailyUpdates: [],
        progressHistory: []
      }

      const result = await taskService.createTask(enhancedTaskData)
      // Extract the task from the API response
      const newTask = result?.task || result
      setTasks(prev => [newTask, ...prev])
      setShowTaskModal(false)
      
      // Refresh analytics
      await loadAnalytics()
    } catch (error) {
      setError(parseError(error))
      throw error
    }
  }

  const handleEditTask = async (taskId, taskData) => {
    try {
      const result = await taskService.updateTask(taskId, taskData)
      // Extract the task from the API response
      const updatedTask = result?.task || result
      setTasks(prev => prev.map(task => 
        (task.id || task._id) === taskId ? updatedTask : task
      ))
      
      // Refresh analytics
      await loadAnalytics()
    } catch (error) {
      setError(parseError(error))
      throw error
    }
  }

  const handleDeleteTask = async (taskId) => {
    try {
      await taskService.deleteTask(taskId)
      setTasks(prev => prev.filter(task => (task.id || task._id) !== taskId))
      
      // Refresh analytics
      await loadAnalytics()
    } catch (error) {
      setError(parseError(error))
      throw error
    }
  }

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const result = await taskService.updateTaskStatus(taskId, newStatus)
      // Extract the task from the API response
      const updatedTask = result?.task || result
      setTasks(prev => prev.map(task => 
        (task.id || task._id) === taskId ? updatedTask : task
      ))
      
      // Refresh analytics
      await loadAnalytics()
    } catch (error) {
      setError(parseError(error))
      throw error
    }
  }

  // NEW PROGRESS TRACKING HANDLERS
  const handleProgressUpdate = async (taskId, progress, note = '') => {
    try {
      setProgressLoading(true)
      const result = await taskService.updateProgress(taskId, progress, note)
      const updatedTask = result?.task || result
      
      setTasks(prev => prev.map(task => 
        (task.id || task._id) === taskId ? updatedTask : task
      ))
      
      await loadAnalytics()
    } catch (error) {
      setError(parseError(error))
      throw error
    } finally {
      setProgressLoading(false)
    }
  }

  const handleTimeLog = async (taskId, timeData) => {
    try {
      setProgressLoading(true)
      const result = await taskService.addTimeEntry(taskId, timeData.hours, timeData.description)
      const updatedTask = result?.task || result
      
      setTasks(prev => prev.map(task => 
        (task.id || task._id) === taskId ? updatedTask : task
      ))
      
      await loadAnalytics()
    } catch (error) {
      setError(parseError(error))
      throw error
    } finally {
      setProgressLoading(false)
    }
  }

  const handleDailyCheckIn = (task) => {
    setCheckInModal({ isOpen: true, task })
  }

  const handleCheckInSubmit = async (checkInData) => {
    try {
      setProgressLoading(true)
      const taskId = checkInModal.task?.id || checkInModal.task?._id
      const result = await taskService.addDailyUpdate(taskId, checkInData)
      const updatedTask = result?.task || result
      
      setTasks(prev => prev.map(task => 
        (task.id || task._id) === taskId ? updatedTask : task
      ))
      
      setCheckInModal({ isOpen: false, task: null })
      await loadAnalytics()
    } catch (error) {
      setError(parseError(error))
      console.error('Error submitting daily check-in:', error)
    } finally {
      setProgressLoading(false)
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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white mb-2">Loading TaskFlow</h2>
          <p className="text-gray-400">Initializing your workspace...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <Login 
        onLogin={handleLogin}
        onRegister={handleRegister}
        loading={loading}
        error={error}
      />
    )
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'tasks':
        return (
          <Tasks
            tasks={tasks}
            onAddTask={handleAddTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onStatusChange={handleStatusChange}
            onProgressUpdate={handleProgressUpdate}
            onTimeLog={handleTimeLog}
            onDailyCheckIn={handleDailyCheckIn}
            loading={loading}
            progressLoading={progressLoading}
          />
        )
      case 'progress':
        return (
          <ProgressTracker
            tasks={tasks}
            analytics={analytics}
            onProgressUpdate={handleProgressUpdate}
            onTimeLog={handleTimeLog}
            onDailyCheckIn={handleDailyCheckIn}
            onRefresh={refreshData}
            loading={progressLoading}
          />
        )
      case 'dashboard':
      default:
        return (
          <Dashboard
            tasks={tasks}
            analytics={analytics}
            user={user}
            onAddTask={openTaskModal}
            onNavigateToTasks={navigateToTasks}
            onProgressUpdate={handleProgressUpdate}
            onTimeLog={handleTimeLog}
            onDailyCheckIn={handleDailyCheckIn}
            progressLoading={progressLoading}
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header
        onAddTask={openTaskModal}
        user={user}
        onLogout={handleLogout}
      />

      <nav className="bg-slate-800/40 backdrop-blur-sm border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8">
            <button
              onClick={navigateToDashboard}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                currentPage === 'dashboard'
                  ? 'border-purple-500 text-purple-300'
                  : 'border-transparent text-gray-400 hover:text-white hover:border-gray-300'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={navigateToTasks}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                currentPage === 'tasks'
                  ? 'border-purple-500 text-purple-300'
                  : 'border-transparent text-gray-400 hover:text-white hover:border-gray-300'
              }`}
            >
              Tasks
            </button>
            <button
              onClick={navigateToProgress}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                currentPage === 'progress'
                  ? 'border-purple-500 text-purple-300'
                  : 'border-transparent text-gray-400 hover:text-white hover:border-gray-300'
              }`}
            >
              Progress Analytics
            </button>
          </div>
        </div>
      </nav>

      {error && (
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-red-300 hover:text-red-200 text-xs underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {progressLoading && (
        <div className="max-w-7xl mx-auto px-6 py-2">
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-purple-500"></div>
              <p className="text-purple-400 text-sm">Updating progress...</p>
            </div>
          </div>
        </div>
      )}

      <main>
        {renderCurrentPage()}
      </main>

      {/* Enhanced Task Creation Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">Create New Task</h2>
              <button
                onClick={() => setShowTaskModal(false)}
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"
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
                  title: formData.get('title'),
                  description: formData.get('description'),
                  priority: formData.get('priority'),
                  dueDate: formData.get('dueDate') || null,
                  category: formData.get('category'),
                  estimatedHours: formData.get('estimatedHours') ? parseFloat(formData.get('estimatedHours')) : null
                }
                handleAddTask(taskData)
              }}
              className="p-6 space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="Enter task title..."
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Add task description..."
                  className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    name="priority"
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    name="category"
                    placeholder="e.g., Work, Personal..."
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Due Date
                  </label>
                  <input
                    type="datetime-local"
                    name="dueDate"
                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Estimated Hours
                  </label>
                  <input
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
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 px-4 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-slate-600 disabled:to-slate-600 text-white py-3 px-4 rounded-xl transition-all transform hover:scale-105 disabled:transform-none"
                >
                  {loading ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Daily Check-in Modal */}
      <DailyCheckInModal
        isOpen={checkInModal.isOpen}
        onClose={() => setCheckInModal({ isOpen: false, task: null })}
        task={checkInModal.task}
        onSubmit={handleCheckInSubmit}
      />
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