// pages/Dashboard.jsx - Enhanced with better error handling
import { useState, useEffect } from 'react'
import { Calendar, Clock, TrendingUp, Target, CheckCircle, AlertCircle, Plus, ArrowRight, BarChart3, Timer } from 'lucide-react'
import taskService from '../services/taskService'

// Import your existing progress components (place these in your components folder)
import { ProgressBar, DailyCheckInModal } from '../components/ProgressTracker'

const Dashboard = ({ user, onAddTask, onNavigateToTasks }) => {
  const [tasks, setTasks] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [timeOfDay, setTimeOfDay] = useState('')
  const [checkInModal, setCheckInModal] = useState({ isOpen: false, task: null })
  const [activeTab, setActiveTab] = useState('overview')

  // Extract the tasks array from the API response
  const tasksArray = Array.isArray(tasks) ? tasks : (tasks?.tasks || [])

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setTimeOfDay('morning')
    else if (hour < 17) setTimeOfDay('afternoon')
    else setTimeOfDay('evening')
    
    fetchDashboardData()
  }, [])

  const loadAnalytics = async () => {
    try {
      setAnalyticsLoading(true)
      console.log('Loading analytics...')
      
      const analyticsData = await taskService.getAnalytics()
      
      if (analyticsData && analyticsData.success) {
        setAnalytics(analyticsData.analytics || null)
        console.log('✅ Analytics loaded successfully:', analyticsData.message)
      } else {
        console.warn('Analytics request succeeded but returned no data')
        setAnalytics(null)
      }
    } catch (error) {
      console.error('Failed to load analytics:', error)
      
      // Don't show error to user for analytics - it's not critical
      // Just log it and continue with basic functionality
      setAnalytics(null)
      
      // Calculate basic analytics from existing tasks as fallback
      if (tasksArray.length > 0) {
        const basicAnalytics = calculateBasicAnalytics(tasksArray)
        setAnalytics(basicAnalytics)
        console.log('✅ Using calculated analytics as fallback')
      }
    } finally {
      setAnalyticsLoading(false)
    }
  }

  const calculateBasicAnalytics = (tasks) => {
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(t => t.status === 'completed' || t.progress === 100).length
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress' || (t.progress > 0 && t.progress < 100)).length
    const notStartedTasks = tasks.filter(t => (t.progress || 0) === 0).length
    const totalHours = tasks.reduce((sum, task) => sum + (task.totalHours || 0), 0)
    const averageProgress = totalTasks > 0 
      ? tasks.reduce((sum, task) => sum + (task.progress || 0), 0) / totalTasks 
      : 0

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      notStartedTasks,
      totalHours,
      averageProgress,
      progressDistribution: {
        notStarted: tasks.filter(t => (t.progress || 0) === 0).length,
        early: tasks.filter(t => (t.progress || 0) > 0 && (t.progress || 0) <= 25).length,
        quarter: tasks.filter(t => (t.progress || 0) > 25 && (t.progress || 0) <= 50).length,
        half: tasks.filter(t => (t.progress || 0) > 50 && (t.progress || 0) <= 75).length,
        mostlyDone: tasks.filter(t => (t.progress || 0) > 75 && (t.progress || 0) < 100).length,
        completed: tasks.filter(t => (t.progress || 0) === 100).length
      },
      recentActivity: tasks
        .filter(t => t.lastWorkedOn)
        .sort((a, b) => new Date(b.lastWorkedOn) - new Date(a.lastWorkedOn))
        .slice(0, 10)
        .map(t => ({
          taskId: t._id || t.id,
          title: t.title,
          lastWorkedOn: t.lastWorkedOn,
          progress: t.progress || 0,
          totalHours: t.totalHours || 0
        }))
    }
  }

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      console.log('Fetching dashboard data...')
      
      // Load tasks first - this is critical
      const tasksResponse = await taskService.getAllTasks({ 
        limit: 20, 
        sortBy: 'lastWorkedOn', 
        sortOrder: 'desc' 
      })
      
      if (tasksResponse && tasksResponse.success) {
        setTasks(tasksResponse.tasks || [])
        console.log('✅ Tasks loaded successfully')
        
        // After tasks are loaded, try to load analytics separately
        // This way if analytics fails, we still have tasks
        setTimeout(() => {
          loadAnalytics()
        }, 100) // Small delay to prevent overwhelming the API
        
      } else {
        console.error('Failed to load tasks - no success flag')
        setTasks([])
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setTasks([]) // Set empty array as fallback
    } finally {
      setLoading(false)
    }
  }

  const handleDailyCheckIn = (task) => {
    setCheckInModal({ isOpen: true, task })
  }

  const handleCheckInSubmit = async (checkInData) => {
    try {
      await taskService.addDailyUpdate(checkInModal.task._id || checkInModal.task.id, checkInData)
      await fetchDashboardData() // Refresh data
      setCheckInModal({ isOpen: false, task: null })
    } catch (error) {
      console.error('Error submitting daily check-in:', error)
    }
  }

  const handleProgressUpdate = async (taskId, progress) => {
    try {
      await taskService.updateProgress(taskId, progress, 'Quick update from dashboard')
      await fetchDashboardData() // Refresh data
    } catch (error) {
      console.error('Error updating progress:', error)
    }
  }

  // Calculate stats from tasks and analytics
  const stats = {
    total: tasksArray.length,
    completed: tasksArray.filter(t => t.status === 'completed' || t.progress === 100).length,
    inProgress: tasksArray.filter(t => t.status === 'in-progress' || (t.progress > 0 && t.progress < 100)).length,
    pending: tasksArray.filter(t => t.status === 'pending' || t.progress === 0).length,
    overdue: tasksArray.filter(t => 
      t.dueDate && 
      new Date(t.dueDate) < new Date() && 
      t.status !== 'completed' &&
      t.progress !== 100
    ).length,
    todayTasks: tasksArray.filter(t => {
      if (!t.dueDate) return false
      const today = new Date().toDateString()
      return new Date(t.dueDate).toDateString() === today
    }).length,
    totalHours: analytics?.totalHours || tasksArray.reduce((sum, task) => sum + (task.totalHours || 0), 0),
    averageProgress: analytics?.averageProgress || (
      tasksArray.length > 0 
        ? tasksArray.reduce((sum, task) => sum + (task.progress || 0), 0) / tasksArray.length 
        : 0
    )
  }

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

  const recentTasks = tasksArray
    .sort((a, b) => {
      const aDate = new Date(a.lastWorkedOn || a.updatedAt || a.createdAt)
      const bDate = new Date(b.lastWorkedOn || b.updatedAt || b.createdAt)
      return bDate - aDate
    })
    .slice(0, 5)

  const upcomingTasks = tasksArray
    .filter(t => t.dueDate && t.status !== 'completed' && t.progress !== 100)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5)

  const priorityStats = {
    high: tasksArray.filter(t => t.priority === 'high' && t.status !== 'completed' && t.progress !== 100).length,
    medium: tasksArray.filter(t => t.priority === 'medium' && t.status !== 'completed' && t.progress !== 100).length,
    low: tasksArray.filter(t => t.priority === 'low' && t.status !== 'completed' && t.progress !== 100).length
  }

  const progressDistribution = analytics?.progressDistribution || {
    notStarted: tasksArray.filter(t => (t.progress || 0) === 0).length,
    early: tasksArray.filter(t => (t.progress || 0) > 0 && (t.progress || 0) <= 25).length,
    quarter: tasksArray.filter(t => (t.progress || 0) > 25 && (t.progress || 0) <= 50).length,
    half: tasksArray.filter(t => (t.progress || 0) > 50 && (t.progress || 0) <= 75).length,
    mostlyDone: tasksArray.filter(t => (t.progress || 0) > 75 && (t.progress || 0) < 100).length,
    completed: tasksArray.filter(t => (t.progress || 0) === 100).length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <div className="text-white text-xl">Loading dashboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent mb-4">
            Good {timeOfDay}, {user?.name}
          </h1>
          <p className="text-xl text-gray-300">
            {stats.todayTasks > 0 
              ? `You have ${stats.todayTasks} task${stats.todayTasks > 1 ? 's' : ''} due today`
              : 'Your schedule is clear for today'
            }
          </p>
          <div className="mt-4 text-gray-400">
            {stats.totalHours > 0 && (
              <span>Total time tracked: {stats.totalHours.toFixed(1)} hours</span>
            )}
            {analyticsLoading && (
              <div className="mt-2 text-purple-400 text-sm">
                <span>Loading analytics...</span>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Target className="w-8 h-8 text-blue-400" />
              <span className="text-3xl font-bold text-white">{stats.total}</span>
            </div>
            <h3 className="text-blue-300 font-medium">Total Tasks</h3>
            <p className="text-gray-400 text-sm mt-1">All time</p>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-sm border border-green-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <span className="text-3xl font-bold text-white">{stats.completed}</span>
            </div>
            <h3 className="text-green-300 font-medium">Completed</h3>
            <p className="text-gray-400 text-sm mt-1">{completionRate}% completion rate</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 backdrop-blur-sm border border-yellow-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 text-yellow-400" />
              <span className="text-3xl font-bold text-white">{stats.inProgress}</span>
            </div>
            <h3 className="text-yellow-300 font-medium">In Progress</h3>
            <p className="text-gray-400 text-sm mt-1">Active tasks</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Timer className="w-8 h-8 text-purple-400" />
              <span className="text-3xl font-bold text-white">{stats.totalHours.toFixed(1)}h</span>
            </div>
            <h3 className="text-purple-300 font-medium">Time Tracked</h3>
            <p className="text-gray-400 text-sm mt-1">Total hours</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-slate-800/50 rounded-lg p-1 mb-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2 px-4 rounded-md text-sm transition-colors ${
              activeTab === 'overview' 
                ? 'bg-purple-500 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`flex-1 py-2 px-4 rounded-md text-sm transition-colors ${
              activeTab === 'progress' 
                ? 'bg-purple-500 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Progress Analytics
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                    <TrendingUp className="w-6 h-6 text-purple-400" />
                    <span>Progress Overview</span>
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Overall Completion Rate</span>
                    <span className="text-white font-semibold">{completionRate}%</span>
                  </div>
                  <ProgressBar progress={completionRate} className="h-4" />

                  <div className="flex items-center justify-between mt-4">
                    <span className="text-gray-300">Average Progress</span>
                    <span className="text-white font-semibold">{stats.averageProgress.toFixed(1)}%</span>
                  </div>
                  <ProgressBar progress={stats.averageProgress} className="h-4" />

                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-400">{priorityStats.high}</div>
                      <div className="text-xs text-gray-400">High Priority</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400">{priorityStats.medium}</div>
                      <div className="text-xs text-gray-400">Medium Priority</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">{priorityStats.low}</div>
                      <div className="text-xs text-gray-400">Low Priority</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Recent Tasks</h2>
                  <button 
                    onClick={onNavigateToTasks}
                    className="text-purple-400 hover:text-purple-300 flex items-center space-x-1 text-sm"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  {recentTasks.length > 0 ? recentTasks.map((task) => (
                    <div key={task._id || task.id} className="p-4 bg-slate-700/30 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={`font-medium ${task.status === 'completed' || task.progress === 100 ? 'line-through text-gray-400' : 'text-white'}`}>
                          {task.title}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            task.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                            task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-green-500/20 text-green-300'
                          }`}>
                            {task.priority}
                          </span>
                          <button
                            onClick={() => handleDailyCheckIn(task)}
                            className="text-purple-400 hover:text-purple-300 text-xs"
                          >
                            Check-in
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Progress</span>
                          <span className="text-white">{task.progress || 0}%</span>
                        </div>
                        <ProgressBar progress={task.progress || 0} />
                        
                        {(task.totalHours > 0) && (
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>Time logged: {(task.totalHours || 0).toFixed(1)}h</span>
                            {task.lastWorkedOn && (
                              <span>Last: {new Date(task.lastWorkedOn).toLocaleDateString()}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-gray-400">
                      <p>No tasks yet</p>
                      <button
                        onClick={onAddTask}
                        className="mt-2 text-purple-400 hover:text-purple-300 text-sm"
                      >
                        Create your first task
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-purple-400" />
                  <span>Upcoming</span>
                </h2>

                <div className="space-y-3">
                  {upcomingTasks.length > 0 ? upcomingTasks.map((task) => (
                    <div key={task._id || task.id} className="p-3 bg-slate-700/30 rounded-xl">
                      <h4 className="font-medium text-white text-sm mb-1">{task.title}</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-xs">
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            task.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                            task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-green-500/20 text-green-300'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>Progress</span>
                            <span>{task.progress || 0}%</span>
                          </div>
                          <ProgressBar progress={task.progress || 0} />
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-gray-400">
                      <p>No upcoming tasks</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
                
                <div className="space-y-3">
                  <button
                    onClick={onAddTask}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-3 rounded-xl flex items-center justify-center space-x-2 transition-all transform hover:scale-105"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create New Task</span>
                  </button>

                  <button
                    onClick={onNavigateToTasks}
                    className="w-full bg-slate-700/50 hover:bg-slate-600/50 text-white p-3 rounded-xl transition-colors"
                  >
                    View All Tasks
                  </button>

                  <button
                    onClick={() => setActiveTab('progress')}
                    className="w-full bg-blue-600/50 hover:bg-blue-500/50 text-white p-3 rounded-xl transition-colors flex items-center justify-center space-x-2"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>View Analytics</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-800/50 p-6 rounded-xl">
                <div className="text-3xl font-bold text-white">{stats.total}</div>
                <div className="text-gray-400 text-sm">Total Tasks</div>
              </div>
              <div className="bg-slate-800/50 p-6 rounded-xl">
                <div className="text-3xl font-bold text-green-400">{stats.completed}</div>
                <div className="text-gray-400 text-sm">Completed</div>
              </div>
              <div className="bg-slate-800/50 p-6 rounded-xl">
                <div className="text-3xl font-bold text-purple-400">{stats.inProgress}</div>
                <div className="text-gray-400 text-sm">In Progress</div>
              </div>
              <div className="bg-slate-800/50 p-6 rounded-xl">
                <div className="text-3xl font-bold text-blue-400">{stats.totalHours.toFixed(1)}h</div>
                <div className="text-gray-400 text-sm">Total Time</div>
              </div>
            </div>

            <div className="bg-slate-800/50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-white mb-4">Progress Distribution</h3>
              <div className="space-y-3">
                {[
                  { range: 'Not Started (0%)', count: progressDistribution.notStarted, color: 'bg-red-500' },
                  { range: 'Getting Started (1-25%)', count: progressDistribution.early, color: 'bg-orange-500' },
                  { range: 'Making Progress (26-50%)', count: progressDistribution.quarter, color: 'bg-yellow-500' },
                  { range: 'Halfway There (51-75%)', count: progressDistribution.half, color: 'bg-blue-500' },
                  { range: 'Almost Done (76-99%)', count: progressDistribution.mostlyDone, color: 'bg-purple-500' },
                  { range: 'Completed (100%)', count: progressDistribution.completed, color: 'bg-green-500' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-24 text-sm text-gray-300">{item.range}</div>
                    <div className="flex-1 bg-slate-700 rounded-full h-6 relative">
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

            <div className="bg-slate-800/50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-white mb-4">Average Progress</h3>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <ProgressBar progress={stats.averageProgress} className="h-4" />
                </div>
                <div className="text-2xl font-bold text-white">{stats.averageProgress.toFixed(1)}%</div>
              </div>
            </div>

            {analytics?.recentActivity && analytics.recentActivity.length > 0 && (
              <div className="bg-slate-800/50 p-6 rounded-xl">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {analytics.recentActivity.slice(0, 5).map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                      <div>
                        <div className="text-white font-medium">{activity.title}</div>
                        <div className="text-gray-400 text-sm">
                          Last worked: {new Date(activity.lastWorkedOn).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-purple-400 font-medium">{activity.progress}%</div>
                        <div className="text-gray-400 text-sm">{activity.totalHours.toFixed(1)}h</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
    </div>
  )
}

export default Dashboard