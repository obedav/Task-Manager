// pages/Task.jsx - Enhanced Tasks page with progress tracking
import { useState } from 'react'
import { Clock, TrendingUp, Calendar, Target, Plus, Edit3, ChevronDown, ChevronRight, Timer, X, Search, Filter, MoreVertical } from 'lucide-react'
import { ProgressBar, ProgressSlider, TimeEntry } from '../components/ProgressTracker'

const TaskCard = ({ task, onEdit, onDelete, onStatusChange, onProgressUpdate, onTimeLog, onDailyCheckIn, progressLoading }) => {
  const [expanded, setExpanded] = useState(false)
  const [showTimeEntry, setShowTimeEntry] = useState(false)
  const [showProgressUpdate, setShowProgressUpdate] = useState(false)
  const [showActions, setShowActions] = useState(false)

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-500/10'
      case 'medium': return 'border-yellow-500 bg-yellow-500/10'
      case 'low': return 'border-green-500 bg-green-500/10'
      default: return 'border-slate-600 bg-slate-800/50'
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      'pending': 'bg-gray-500 text-gray-100',
      'in-progress': 'bg-blue-500 text-blue-100',
      'completed': 'bg-green-500 text-green-100'
    }
    return badges[status] || badges.pending
  }

  const handleProgressUpdate = async (progress) => {
    try {
      await onProgressUpdate(task.id || task._id, progress, 'Quick update from tasks page')
      setShowProgressUpdate(false)
    } catch (error) {
      console.error('Error updating progress:', error)
    }
  }

  const handleTimeLog = async (timeData) => {
    try {
      await onTimeLog(task.id || task._id, timeData)
      setShowTimeEntry(false)
    } catch (error) {
      console.error('Error logging time:', error)
    }
  }

  const handleStatusChange = async (newStatus) => {
    try {
      await onStatusChange(task.id || task._id, newStatus)
      setShowActions(false)
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const totalHours = task.totalHours || 0
  const lastWorked = task.lastWorkedOn ? new Date(task.lastWorkedOn).toLocaleDateString() : 'Never'

  return (
    <div className={`rounded-lg border-2 p-6 transition-all hover:border-purple-500/50 ${getPriorityColor(task.priority)}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-white">{task.title}</h3>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(task.status)}`}>
                {task.status?.replace('-', ' ') || 'pending'}
              </span>
              <div className="relative">
                <button
                  onClick={() => setShowActions(!showActions)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                {showActions && (
                  <div className="absolute right-0 top-8 bg-slate-800 border border-slate-600 rounded-lg shadow-lg z-10 min-w-32">
                    <button
                      onClick={() => handleStatusChange('pending')}
                      className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-slate-700 first:rounded-t-lg"
                    >
                      Mark Pending
                    </button>
                    <button
                      onClick={() => handleStatusChange('in-progress')}
                      className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-slate-700"
                    >
                      Mark In Progress
                    </button>
                    <button
                      onClick={() => handleStatusChange('completed')}
                      className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-slate-700"
                    >
                      Mark Completed
                    </button>
                    <hr className="border-slate-600" />
                    <button
                      onClick={() => onEdit(task)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-slate-700"
                    >
                      Edit Task
                    </button>
                    <button
                      onClick={() => onDelete(task.id || task._id)}
                      className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-slate-700 last:rounded-b-lg"
                    >
                      Delete Task
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <p className="text-gray-300 text-sm mb-3">{task.description}</p>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Progress</span>
              <span className="text-sm font-medium text-white">{task.progress || 0}%</span>
            </div>
            <ProgressBar progress={task.progress || 0} />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm text-gray-400 mb-4">
            <div>
              <span className="block">Priority</span>
              <span className="text-white capitalize">{task.priority}</span>
            </div>
            <div>
              <span className="block">Time Logged</span>
              <span className="text-white">{totalHours.toFixed(1)}h</span>
            </div>
            <div>
              <span className="block">Last Worked</span>
              <span className="text-white">{lastWorked}</span>
            </div>
            <div>
              <span className="block">Due Date</span>
              <span className="text-white">
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
              </span>
            </div>
          </div>
        </div>
        
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-gray-400 hover:text-white ml-4"
        >
          {expanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => onDailyCheckIn(task)}
          disabled={progressLoading}
          className="bg-purple-500 hover:bg-purple-600 disabled:bg-purple-700 text-white py-2 px-3 rounded-lg text-sm transition-colors flex items-center space-x-1"
        >
          <Calendar className="w-4 h-4" />
          <span>Daily Check-in</span>
        </button>
        <button
          onClick={() => setShowTimeEntry(!showTimeEntry)}
          disabled={progressLoading}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm transition-colors flex items-center space-x-1"
        >
          <Timer className="w-4 h-4" />
          <span>Log Time</span>
        </button>
        <button
          onClick={() => setShowProgressUpdate(!showProgressUpdate)}
          disabled={progressLoading}
          className="bg-green-500 hover:bg-green-600 disabled:bg-green-700 text-white py-2 px-3 rounded-lg text-sm transition-colors flex items-center space-x-1"
        >
          <Target className="w-4 h-4" />
          <span>Update Progress</span>
        </button>
      </div>

      {showTimeEntry && (
        <div className="mb-4 p-4 bg-slate-700/30 rounded-lg border border-slate-600">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-white">Log Time</h4>
            <button
              onClick={() => setShowTimeEntry(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <TimeEntry onSubmit={handleTimeLog} loading={progressLoading} />
        </div>
      )}

      {showProgressUpdate && (
        <div className="mb-4 p-4 bg-slate-700/30 rounded-lg border border-slate-600">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-white">Update Progress</h4>
            <button
              onClick={() => setShowProgressUpdate(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            <ProgressSlider 
              progress={task.progress || 0} 
              onChange={handleProgressUpdate}
              disabled={progressLoading}
            />
          </div>
        </div>
      )}

      {expanded && (
        <div className="space-y-4 pt-4 border-t border-slate-700">
          {/* Recent Daily Updates */}
          {task.dailyUpdates && task.dailyUpdates.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">Recent Updates</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {task.dailyUpdates.slice(-3).reverse().map((update, index) => (
                  <div key={index} className="p-3 bg-slate-800/30 rounded-lg text-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-purple-400">Progress: {update.progress}%</span>
                      <span className="text-gray-400">{new Date(update.date).toLocaleDateString()}</span>
                    </div>
                    {update.accomplishments && update.accomplishments.length > 0 && (
                      <div className="text-gray-300">
                        <strong>Done:</strong> {update.accomplishments.join(', ')}
                      </div>
                    )}
                    {update.mood && (
                      <div className="text-gray-400 text-xs mt-1">
                        Mood: <span className="capitalize">{update.mood}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Time Entries */}
          {task.timeEntries && task.timeEntries.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-2">Recent Time Logs</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {task.timeEntries.slice(-5).reverse().map((entry, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-300">{entry.description || 'Work session'}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400">{entry.hours}h</span>
                      <span className="text-gray-500 text-xs">
                        {new Date(entry.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const Tasks = ({ 
  tasks = [], 
  onAddTask, 
  onEditTask, 
  onDeleteTask, 
  onStatusChange, 
  onProgressUpdate, 
  onTimeLog, 
  onDailyCheckIn, 
  loading = false, 
  progressLoading = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [sortBy, setSortBy] = useState('createdAt')
  const [showFilters, setShowFilters] = useState(false)

  // Filter and sort tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  }).sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title)
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      case 'progress':
        return (b.progress || 0) - (a.progress || 0)
      case 'dueDate':
        if (!a.dueDate && !b.dueDate) return 0
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return new Date(a.dueDate) - new Date(b.dueDate)
      case 'createdAt':
      default:
        return new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt)
    }
  })

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed' || t.progress === 100).length,
    inProgress: tasks.filter(t => t.status === 'in-progress' || (t.progress > 0 && t.progress < 100)).length,
    pending: tasks.filter(t => t.status === 'pending' || t.progress === 0).length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading tasks...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Tasks</h1>
              <p className="text-gray-400">Manage and track your tasks with progress monitoring</p>
            </div>
            <button
              onClick={onAddTask}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-2 px-4 rounded-lg transition-all flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Task</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-lg border border-slate-700/50">
              <div className="text-2xl font-bold text-white">{taskStats.total}</div>
              <div className="text-gray-400 text-sm">Total Tasks</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-lg border border-slate-700/50">
              <div className="text-2xl font-bold text-green-400">{taskStats.completed}</div>
              <div className="text-gray-400 text-sm">Completed</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-lg border border-slate-700/50">
              <div className="text-2xl font-bold text-blue-400">{taskStats.inProgress}</div>
              <div className="text-gray-400 text-sm">In Progress</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-lg border border-slate-700/50">
              <div className="text-2xl font-bold text-gray-400">{taskStats.pending}</div>
              <div className="text-gray-400 text-sm">Pending</div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-slate-800 border border-slate-600 text-white py-3 px-4 rounded-lg hover:bg-slate-700 transition-colors flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
            </div>

            {showFilters && (
              <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-lg border border-slate-700/50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="all">All Priorities</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="createdAt">Created Date</option>
                      <option value="title">Title</option>
                      <option value="priority">Priority</option>
                      <option value="progress">Progress</option>
                      <option value="dueDate">Due Date</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Tasks Grid */}
        {filteredTasks.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTasks.map(task => (
              <TaskCard
                key={task.id || task._id}
                task={task}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onStatusChange={onStatusChange}
                onProgressUpdate={onProgressUpdate}
                onTimeLog={onTimeLog}
                onDailyCheckIn={onDailyCheckIn}
                progressLoading={progressLoading}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' 
                  ? 'No tasks match your filters' 
                  : 'No tasks yet'
                }
              </h3>
              <p>
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Create your first task to get started'
                }
              </p>
            </div>
            {!searchTerm && statusFilter === 'all' && priorityFilter === 'all' && (
              <button
                onClick={onAddTask}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 px-6 rounded-lg transition-all"
              >
                Create Your First Task
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Tasks