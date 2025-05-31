// components/ProgressTracker.jsx
import { useState } from 'react'
import { Clock, TrendingUp, Calendar, Target, Plus, Edit3, X, ChevronDown, ChevronRight, Timer, BarChart3, PieChart, Activity } from 'lucide-react'

// Progress Bar Component
export const ProgressBar = ({ progress, className = "" }) => {
  return (
    <div className={`w-full bg-slate-700 rounded-full h-2 ${className}`}>
      <div 
        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

// Progress Slider Component
export const ProgressSlider = ({ progress, onChange, disabled = false }) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm text-gray-300">Progress</label>
        <span className="text-sm font-medium text-white">{progress}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={progress}
        onChange={(e) => onChange(parseInt(e.target.value))}
        disabled={disabled}
        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
        style={{
          background: `linear-gradient(to right, #8B5CF6 0%, #EC4899 ${progress}%, #374151 ${progress}%, #374151 100%)`
        }}
      />
    </div>
  )
}

// Time Entry Component
export const TimeEntry = ({ onSubmit, loading = false }) => {
  const [hours, setHours] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = () => {
    if (!hours || parseFloat(hours) <= 0) return
    
    onSubmit({
      hours: parseFloat(hours),
      description: description.trim()
    })
    
    setHours('')
    setDescription('')
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Hours Worked
          </label>
          <input
            type="number"
            step="0.5"
            min="0.5"
            max="24"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            placeholder="2.5"
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={handleSubmit}
            disabled={loading || !hours}
            className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-slate-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <Clock className="w-4 h-4" />
            <span>Log Time</span>
          </button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Description (Optional)
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What did you work on?"
          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>
    </div>
  )
}

// Daily Check-in Modal Component - THIS WAS MISSING!
export const DailyCheckInModal = ({ isOpen, onClose, task, onSubmit }) => {
  const [formData, setFormData] = useState({
    workedOn: false,
    accomplishments: [''],
    blockers: [''],
    nextSteps: [''],
    mood: 'neutral',
    progress: task?.progress || 0
  })

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const updateArrayField = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }))
  }

  const addArrayField = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }))
  }

  const removeArrayField = (field, index) => {
    if (formData[field].length > 1) {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }))
    }
  }

  const handleSubmit = () => {
    onSubmit({
      ...formData,
      accomplishments: formData.accomplishments.filter(a => a.trim()),
      blockers: formData.blockers.filter(b => b.trim()),
      nextSteps: formData.nextSteps.filter(n => n.trim())
    })
    onClose()
  }

  if (!isOpen) return null

  const renderFieldList = (title, field, placeholder) => (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {title}
      </label>
      {formData[field].map((value, index) => (
        <div key={index} className="flex items-center space-x-2 mb-2">
          <input
            type="text"
            value={value}
            onChange={(e) => updateArrayField(field, index, e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          {formData[field].length > 1 && (
            <button
              type="button"
              onClick={() => removeArrayField(field, index)}
              className="text-red-400 hover:text-red-300 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => addArrayField(field)}
        className="text-purple-400 hover:text-purple-300 text-sm flex items-center space-x-1"
      >
        <Plus className="w-3 h-3" />
        <span>Add {title.slice(0, -1)}</span>
      </button>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-slate-800 p-6 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Daily Check-in</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="bg-slate-700/30 p-4 rounded-lg">
            <h3 className="font-medium text-white mb-2">{task?.title}</h3>
            <ProgressSlider 
              progress={formData.progress} 
              onChange={(value) => updateField('progress', value)}
            />
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="workedOn"
              checked={formData.workedOn}
              onChange={(e) => updateField('workedOn', e.target.checked)}
              className="w-4 h-4 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
            />
            <label htmlFor="workedOn" className="text-gray-300">
              I worked on this task today
            </label>
          </div>

          {renderFieldList('Accomplishments', 'accomplishments', 'What did you accomplish?')}
          {renderFieldList('Blockers', 'blockers', 'What blocked your progress?')}
          {renderFieldList('Next Steps', 'nextSteps', 'What will you do next?')}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              How are you feeling about this task?
            </label>
            <select
              value={formData.mood}
              onChange={(e) => updateField('mood', e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="frustrated">😤 Frustrated</option>
              <option value="blocked">🚧 Blocked</option>
              <option value="neutral">😐 Neutral</option>
              <option value="productive">🚀 Productive</option>
              <option value="creative">🎨 Creative</option>
              <option value="satisfied">😊 Satisfied</option>
              <option value="excited">🔥 Excited</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 bg-slate-600 hover:bg-slate-500 text-white py-3 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 px-4 rounded-lg transition-all flex items-center justify-center space-x-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Save Check-in</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Daily Update Form Component
export const DailyUpdateForm = ({ onSubmit, loading = false }) => {
  const [workedOn, setWorkedOn] = useState(false)
  const [accomplishments, setAccomplishments] = useState([''])
  const [blockers, setBlockers] = useState([''])
  const [nextSteps, setNextSteps] = useState([''])
  const [mood, setMood] = useState('neutral')

  const addField = (field, setter, values) => {
    setter([...values, ''])
  }

  const updateField = (field, setter, values, index, value) => {
    const newValues = [...values]
    newValues[index] = value
    setter(newValues)
  }

  const removeField = (field, setter, values, index) => {
    if (values.length > 1) {
      setter(values.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = () => {
    onSubmit({
      workedOn,
      accomplishments: accomplishments.filter(a => a.trim()),
      blockers: blockers.filter(b => b.trim()),
      nextSteps: nextSteps.filter(n => n.trim()),
      mood
    })
  }

  const renderFieldList = (title, values, setter, placeholder) => (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {title}
      </label>
      {values.map((value, index) => (
        <div key={index} className="flex items-center space-x-2 mb-2">
          <input
            type="text"
            value={value}
            onChange={(e) => updateField(title, setter, values, index, e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          {values.length > 1 && (
            <button
              type="button"
              onClick={() => removeField(title, setter, values, index)}
              className="text-red-400 hover:text-red-300"
            >
              ×
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => addField(title, setter, values)}
        className="text-purple-400 hover:text-purple-300 text-sm flex items-center space-x-1"
      >
        <Plus className="w-3 h-3" />
        <span>Add {title.slice(0, -1)}</span>
      </button>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="workedOn"
          checked={workedOn}
          onChange={(e) => setWorkedOn(e.target.checked)}
          className="w-4 h-4 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
        />
        <label htmlFor="workedOn" className="text-gray-300">
          I worked on this task today
        </label>
      </div>

      {renderFieldList('Accomplishments', accomplishments, setAccomplishments, 'What did you accomplish?')}
      {renderFieldList('Blockers', blockers, setBlockers, 'What blocked your progress?')}
      {renderFieldList('Next Steps', nextSteps, setNextSteps, 'What will you do next?')}

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          How are you feeling about this task?
        </label>
        <select
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="frustrated">😤 Frustrated</option>
          <option value="blocked">🚧 Blocked</option>
          <option value="neutral">😐 Neutral</option>
          <option value="productive">🚀 Productive</option>
          <option value="creative">🎨 Creative</option>
          <option value="satisfied">😊 Satisfied</option>
          <option value="excited">🔥 Excited</option>
        </select>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-slate-600 disabled:to-slate-600 text-white py-3 px-4 rounded-lg transition-all flex items-center justify-center space-x-2"
      >
        <Calendar className="w-4 h-4" />
        <span>Save Daily Update</span>
      </button>
    </div>
  )
}

// Progress History Component
export const ProgressHistory = ({ progressHistory = [], timeEntries = [] }) => {
  const [activeTab, setActiveTab] = useState('progress')

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex space-x-1 bg-slate-800 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('progress')}
          className={`flex-1 py-2 px-3 rounded-md text-sm transition-colors ${
            activeTab === 'progress' 
              ? 'bg-purple-500 text-white' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Progress History
        </button>
        <button
          onClick={() => setActiveTab('time')}
          className={`flex-1 py-2 px-3 rounded-md text-sm transition-colors ${
            activeTab === 'time' 
              ? 'bg-purple-500 text-white' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Time Entries
        </button>
      </div>

      {activeTab === 'progress' && (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {progressHistory.length > 0 ? (
            progressHistory.slice().reverse().map((entry, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-lg">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">{entry.progress}%</span>
                    <span className="text-gray-400 text-sm">{formatDate(entry.date)}</span>
                  </div>
                  {entry.note && (
                    <p className="text-gray-300 text-sm mt-1">{entry.note}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No progress history yet</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'time' && (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {timeEntries.length > 0 ? (
            timeEntries.slice().reverse().map((entry, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-lg">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">{entry.hours}h</span>
                    <span className="text-gray-400 text-sm">{formatDate(entry.date)}</span>
                  </div>
                  {entry.description && (
                    <p className="text-gray-300 text-sm mt-1">{entry.description}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No time entries yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Quick Progress Update Component
export const QuickProgressUpdate = ({ task, onUpdate, loading = false }) => {
  const [progress, setProgress] = useState(task.progress || 0)
  const [note, setNote] = useState('')

  const handleUpdate = async () => {
    await onUpdate(progress, note)
    setNote('')
  }

  return (
    <div className="space-y-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-white">Quick Progress Update</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">Current: {task.progress || 0}%</span>
        </div>
      </div>
      
      <ProgressSlider 
        progress={progress} 
        onChange={setProgress}
        disabled={loading}
      />
      
      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add a note about your progress..."
        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
      />
      
      <button
        onClick={handleUpdate}
        disabled={loading || progress === task.progress}
        className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-slate-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
      >
        <Target className="w-4 h-4" />
        <span>{loading ? 'Updating...' : 'Update Progress'}</span>
      </button>
    </div>
  )
}

// Main Progress Tracker Dashboard Component
export const ProgressTracker = ({ tasks = [], analytics = null, onProgressUpdate, onTimeLog, onDailyCheckIn, onRefresh, loading = false }) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedTask, setSelectedTask] = useState(null)

  const stats = analytics || {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.progress === 100).length,
    inProgressTasks: tasks.filter(t => t.progress > 0 && t.progress < 100).length,
    totalHours: tasks.reduce((sum, task) => sum + (task.totalHours || 0), 0),
    averageProgress: tasks.length > 0 
      ? tasks.reduce((sum, task) => sum + (task.progress || 0), 0) / tasks.length 
      : 0
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Progress Analytics</h1>
              <p className="text-gray-400">Track your daily progress and performance</p>
            </div>
            <button
              onClick={onRefresh}
              disabled={loading}
              className="bg-purple-500 hover:bg-purple-600 disabled:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
            >
              <TrendingUp className="w-4 h-4" />
              <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-lg border border-slate-700/50">
            <div className="text-2xl font-bold text-white">{stats.totalTasks}</div>
            <div className="text-gray-400 text-sm">Total Tasks</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-lg border border-slate-700/50">
            <div className="text-2xl font-bold text-green-400">{stats.completedTasks}</div>
            <div className="text-gray-400 text-sm">Completed</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-lg border border-slate-700/50">
            <div className="text-2xl font-bold text-purple-400">{stats.inProgressTasks}</div>
            <div className="text-gray-400 text-sm">In Progress</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-lg border border-slate-700/50">
            <div className="text-2xl font-bold text-blue-400">{stats.totalHours.toFixed(1)}h</div>
            <div className="text-gray-400 text-sm">Total Time</div>
          </div>
        </div>

        {/* Average Progress */}
        <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-lg border border-slate-700/50 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Average Progress</h3>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <ProgressBar progress={stats.averageProgress} className="h-4" />
            </div>
            <div className="text-2xl font-bold text-white">{stats.averageProgress.toFixed(1)}%</div>
          </div>
        </div>

        {/* Task List with Progress */}
        <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-lg border border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">Task Progress</h3>
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task.id || task._id} className="p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-white">{task.title}</h4>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onDailyCheckIn(task)}
                      className="text-purple-400 hover:text-purple-300 text-sm"
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
                  
                  {task.totalHours > 0 && (
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>Time logged: {(task.totalHours || 0).toFixed(1)}h</span>
                      {task.lastWorkedOn && (
                        <span>Last: {new Date(task.lastWorkedOn).toLocaleDateString()}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}