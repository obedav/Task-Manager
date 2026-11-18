// pages/Task.jsx - Enhanced Tasks page with progress tracking
import { useState } from 'react'
import { Clock, TrendingUp, Calendar, Target, Plus, Edit3, ChevronDown, ChevronRight, Timer, X, Search, Filter, MoreVertical } from 'lucide-react'
import { ProgressBar, ProgressSlider, TimeEntry } from '../components/ProgressTracker'
import { useTranslation } from 'react-i18next';

const TaskCard = ({ task, onEdit, onDelete, onStatusChange, onProgressUpdate, onTimeLog, onDailyCheckIn, progressLoading }) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false)
  const [showTimeEntry, setShowTimeEntry] = useState(false)
  const [showProgressUpdate, setShowProgressUpdate] = useState(false)
  const [showActions, setShowActions] = useState(false)

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':   return 'border-l-4 border-priority-high   bg-danger-bg'
      case 'medium': return 'border-l-4 border-priority-medium bg-warning-bg'
      case 'low':    return 'border-l-4 border-priority-low    bg-success-bg'
      default:       return 'border-l-4 border-line            bg-surface'
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      'pending':     'bg-surface-2  text-content-muted',
      'in-progress': 'bg-primary-light text-primary',
      'completed':   'bg-success-bg text-success'
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
  const lastWorked = task.lastWorkedOn ? new Date(task.lastWorkedOn).toLocaleDateString() : t('tasks.never');

  return (
    <div className={`rounded-lg p-6 transition-all shadow-sm hover:shadow-md ${getPriorityColor(task.priority)}`} style={{ border: '1px solid var(--border)' }}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>{task.title}</h3>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(task.status)}`}>
                {t(`tasks.status.${task.status?.replace('-', '') || 'pending'}`)}
              </span>
              <div className="relative">
                <button
                  onClick={() => setShowActions(!showActions)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                {showActions && (
                  <div className="absolute right-0 top-8 rounded-lg shadow-lg z-10 min-w-32" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <button
                      onClick={() => handleStatusChange('pending')}
                      className="w-full text-left px-3 py-2 text-sm first:rounded-t-lg hover:bg-surface-2 transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {t('tasks.markPending')}
                    </button>
                    <button
                      onClick={() => handleStatusChange('in-progress')}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-surface-2 transition-colors"
                      style={{ color: 'var(--royal)' }}
                    >
                      {t('tasks.markInProgress')}
                    </button>
                    <button
                      onClick={() => handleStatusChange('completed')}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-success-bg transition-colors"
                      style={{ color: 'var(--success)' }}
                    >
                      {t('tasks.markCompleted')}
                    </button>
                    <hr style={{ borderColor: 'var(--border)' }} />
                    <button
                      onClick={() => onEdit(task)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-surface-2 transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {t('tasks.editTask')}
                    </button>
                    <button
                      onClick={() => onDelete(task.id || task._id)}
                      className="w-full text-left px-3 py-2 text-sm last:rounded-b-lg transition-colors hover:bg-danger-bg"
                      style={{ color: 'var(--danger)' }}
                    >
                      {t('tasks.deleteTask')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>{task.description}</p>

          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{t('tasks.progress')}</span>
              <span className="text-sm font-medium" style={{ color: 'var(--royal)' }}>{task.progress || 0}%</span>
            </div>
            <ProgressBar progress={task.progress || 0} />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            <div>
              <span className="block">{t('tasks.priority')}</span>
              <span className="font-medium capitalize" style={{ color: 'var(--text)' }}>{t(`tasks.priorityLevels.${task.priority}`)}</span>
            </div>
            <div>
              <span className="block">{t('tasks.timeLogged')}</span>
              <span className="font-medium" style={{ color: 'var(--gold-dark)' }}>{totalHours.toFixed(1)}h</span>
            </div>
            <div>
              <span className="block">{t('tasks.lastWorked')}</span>
              <span className="font-medium" style={{ color: 'var(--text)' }}>{lastWorked}</span>
            </div>
            <div>
              <span className="block">{t('tasks.dueDate')}</span>
              <span className="font-medium" style={{ color: 'var(--text)' }}>
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : t('tasks.noDueDate')}
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
          className="text-white py-2 px-3 rounded-lg text-sm transition-colors flex items-center space-x-1 disabled:opacity-50"
          style={{ background: 'var(--royal)' }}
          onMouseEnter={e => !progressLoading && (e.currentTarget.style.background = 'var(--royal-dark)')}
          onMouseLeave={e => !progressLoading && (e.currentTarget.style.background = 'var(--royal)')}
        >
          <Calendar className="w-4 h-4" />
          <span>{t('tasks.dailyCheckIn')}</span>
        </button>
        <button
          onClick={() => setShowTimeEntry(!showTimeEntry)}
          disabled={progressLoading}
          className="py-2 px-3 rounded-lg text-sm transition-colors flex items-center space-x-1 disabled:opacity-50 font-medium"
          style={{ background: 'var(--gold-light)', color: 'var(--gold-dark)', border: '1px solid var(--gold)' }}
        >
          <Timer className="w-4 h-4" />
          <span>{t('tasks.logTime')}</span>
        </button>
        <button
          onClick={() => setShowProgressUpdate(!showProgressUpdate)}
          disabled={progressLoading}
          className="py-2 px-3 rounded-lg text-sm transition-colors flex items-center space-x-1 disabled:opacity-50 font-medium"
          style={{ background: 'var(--surface-2)', color: 'var(--royal)', border: '1px solid var(--border)' }}
        >
          <Target className="w-4 h-4" />
          <span>{t('tasks.updateProgress')}</span>
        </button>
      </div>

      {showTimeEntry && (
        <div className="mb-4 p-4 rounded-lg" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium" style={{ color: 'var(--text)' }}>{t('tasks.logTime')}</h4>
            <button
              onClick={() => setShowTimeEntry(false)}
              style={{ color: 'var(--text-muted)' }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <TimeEntry onSubmit={handleTimeLog} loading={progressLoading} />
        </div>
      )}

      {showProgressUpdate && (
        <div className="mb-4 p-4 rounded-lg" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium" style={{ color: 'var(--text)' }}>{t('tasks.updateProgress')}</h4>
            <button
              onClick={() => setShowProgressUpdate(false)}
              style={{ color: 'var(--text-muted)' }}
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
        <>
          {/* Recent Daily Updates */}
          {task.dailyUpdates && task.dailyUpdates.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>{t('tasks.recentUpdates')}</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {task.dailyUpdates.slice(-3).reverse().map((update, index) => (
                  <div key={index} className="p-3 rounded-lg text-sm" style={{ background: 'var(--surface-2)' }}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium" style={{ color: 'var(--royal)' }}>{t('tasks.progress')}: {update.progress}%</span>
                      <span style={{ color: 'var(--text-muted)' }}>{new Date(update.date).toLocaleDateString()}</span>
                    </div>
                    {update.accomplishments && update.accomplishments.length > 0 && (
                      <div style={{ color: 'var(--text-muted)' }}>
                        <strong>{t('tasks.done')}:</strong> {update.accomplishments.join(', ')}
                      </div>
                    )}
                    {update.mood && (
                      <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        {t('tasks.mood')}: <span className="capitalize">{t(`tasks.moods.${update.mood}`)}</span>
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
              <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>{t('tasks.recentTimeLogs')}</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {task.timeEntries.slice(-5).reverse().map((entry, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span style={{ color: 'var(--text-muted)' }}>{entry.description || t('tasks.workSession')}</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium" style={{ color: 'var(--gold-dark)' }}>{entry.hours}h</span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {new Date(entry.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
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
  const { t } = useTranslation();
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'transparent' }}>
        <div className="text-xl font-semibold" style={{ color: 'var(--text)' }}>{t('tasks.loading')}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6" style={{ background: 'transparent' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--text)' }}>{t('tasks.title')}</h1>
              <p style={{ color: 'var(--text-muted)' }}>{t('Manage and track your tasks with progress monitoring')}</p>
            </div>
            <button
              onClick={onAddTask}
              className="text-white py-2 px-4 rounded-lg transition-all flex items-center space-x-2 font-semibold"
              style={{ background: 'var(--royal)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--royal-dark)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--royal)'}
            >
              <Plus className="w-4 h-4" />
              <span>{t('New Task')}</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-lg shadow-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="text-2xl font-bold" style={{ color: 'var(--royal)' }}>{taskStats.total}</div>
              <div className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{t('Total Tasks')}</div>
            </div>
            <div className="p-4 rounded-lg shadow-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="text-2xl font-bold text-green-600">{taskStats.completed}</div>
              <div className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{t('Completed')}</div>
            </div>
            <div className="p-4 rounded-lg shadow-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="text-2xl font-bold" style={{ color: 'var(--royal)' }}>{taskStats.inProgress}</div>
              <div className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{t('In Progress')}</div>
            </div>
            <div className="p-4 rounded-lg shadow-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="text-2xl font-bold" style={{ color: 'var(--text-muted)' }}>{taskStats.pending}</div>
              <div className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{t('Pending')}</div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder={t('Search tasks...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg pl-10 pr-4 py-3 focus:outline-none transition-all"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  onFocus={e => e.target.style.borderColor = 'var(--royal)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="py-3 px-4 rounded-lg transition-colors flex items-center space-x-2 font-medium"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
              >
                <Filter className="w-4 h-4" />
                <span>{t('Filters')}</span>
              </button>
            </div>

            {showFilters && (
              <div className="p-4 rounded-lg shadow-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>{t('Status')}</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full rounded-lg px-3 py-2 focus:outline-none"
                      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    >
                      <option value="all">{t('All Statuses')}</option>
                      <option value="pending">{t('Pending')}</option>
                      <option value="in-progress">{t('In progress')}</option>
                      <option value="completed">{t('Completed')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>{t('Priority')}</label>
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      className="w-full rounded-lg px-3 py-2 focus:outline-none"
                      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    >
                      <option value="all">{t('All Priorities')}</option>
                      <option value="high">{t('High')}</option>
                      <option value="medium">{t('Medium')}</option>
                      <option value="low">{t('Low')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>{t('Sort By')}</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full rounded-lg px-3 py-2 focus:outline-none"
                      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    >
                      <option value="createdAt">{t('Created Date')}</option>
                      <option value="title">{t('Title')}</option>
                      <option value="priority">{t('Priority')}</option>
                      <option value="progress">{t('Progress')}</option>
                      <option value="dueDate">{t('Due Date')}</option>
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
            <div className="mb-4" style={{ color: 'var(--text-muted)' }}>
              <Target className="w-16 h-16 mx-auto mb-4 opacity-40" style={{ color: 'var(--royal)' }} />
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text)' }}>
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                  ? t('tasks.noTasksMatchFilters')
                  : t('tasks.noTasksYet')
                }
              </h3>
              <p>
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                  ? t('tasks.tryAdjustingFilters')
                  : t('tasks.createFirstTask')
                }
              </p>
            </div>
            {!searchTerm && statusFilter === 'all' && priorityFilter === 'all' && (
              <button
                onClick={onAddTask}
                className="text-white py-3 px-6 rounded-lg transition-all font-semibold"
                style={{ background: 'var(--royal)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--royal-dark)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--royal)'}
              >
                {t('tasks.createYourFirstTask')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Tasks