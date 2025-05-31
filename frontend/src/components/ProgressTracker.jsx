// components/ProgressTracker.jsx - Enhanced with accessibility and UX improvements
import { useState, useRef, useEffect } from 'react'
import { Clock, TrendingUp, Calendar, Target, Plus, Edit3, X, ChevronDown, ChevronRight, Timer, BarChart3, PieChart, Activity, CheckCircle, AlertTriangle } from 'lucide-react'

// Enhanced Progress Bar Component with accessibility
export const ProgressBar = ({ progress, className = "", size = "default", showLabel = true, ariaLabel }) => {
  const sizeClasses = {
    small: "h-1",
    default: "h-2", 
    large: "h-4"
  }

  const progressValue = Math.min(Math.max(progress || 0, 0), 100)

  return (
    <div className={`w-full bg-slate-700 rounded-full ${sizeClasses[size]} ${className}`}>
      <div 
        className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
        style={{ width: `${progressValue}%`, height: '100%' }}
        role="progressbar"
        aria-valuenow={progressValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel || `Progress: ${progressValue}%`}
      />
      {showLabel && size === "large" && (
        <div className="flex justify-end mt-1">
          <span className="text-xs text-gray-400">{progressValue}%</span>
        </div>
      )}
    </div>
  )
}

// Enhanced Progress Slider Component
export const ProgressSlider = ({ progress, onChange, disabled = false, loading = false, label = "Progress" }) => {
  const [localProgress, setLocalProgress] = useState(progress || 0)
  const [isDragging, setIsDragging] = useState(false)
  const sliderRef = useRef(null)

  useEffect(() => {
    if (!isDragging) {
      setLocalProgress(progress || 0)
    }
  }, [progress, isDragging])

  const handleChange = (e) => {
    const newProgress = parseInt(e.target.value)
    setLocalProgress(newProgress)
    if (onChange && !disabled && !loading) {
      onChange(newProgress)
    }
  }

  const handleMouseDown = () => setIsDragging(true)
  const handleMouseUp = () => setIsDragging(false)

  const getProgressColor = (value) => {
    if (value >= 75) return "from-green-500 to-emerald-500"
    if (value >= 50) return "from-blue-500 to-cyan-500"
    if (value >= 25) return "from-yellow-500 to-orange-500"
    return "from-red-500 to-pink-500"
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label htmlFor="progress-slider" className="text-sm font-medium text-gray-300">
          {label}
        </label>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-white" aria-live="polite">
            {localProgress}%
          </span>
          {loading && (
            <div className="animate-spin rounded-full h-3 w-3 border-t border-purple-500"></div>
          )}
        </div>
      </div>
      
      <div className="relative">
        <input
          id="progress-slider"
          ref={sliderRef}
          type="range"
          min="0"
          max="100"
          value={localProgress}
          onChange={handleChange}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
          disabled={disabled || loading}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800"
          style={{
            background: `linear-gradient(to right, rgb(139, 92, 246) 0%, rgb(236, 72, 153) ${localProgress}%, rgb(55, 65, 81) ${localProgress}%, rgb(55, 65, 81) 100%)`
          }}
          aria-describedby="progress-help"
        />
        <p id="progress-help" className="sr-only">
          Use arrow keys or drag to adjust progress from 0 to 100 percent
        </p>
      </div>
      
      {/* Visual progress indicator */}
      <div className="flex items-center space-x-2 text-xs text-gray-400">
        <div className="flex items-center space-x-1">
          {localProgress === 100 ? (
            <CheckCircle className="w-3 h-3 text-green-400" />
          ) : localProgress >= 75 ? (
            <Target className="w-3 h-3 text-blue-400" />
          ) : localProgress >= 25 ? (
            <Clock className="w-3 h-3 text-yellow-400" />
          ) : (
            <AlertTriangle className="w-3 h-3 text-red-400" />
          )}
          <span>
            {localProgress === 100 ? "Complete!" : 
             localProgress >= 75 ? "Almost there" :
             localProgress >= 25 ? "In progress" : "Getting started"}
          </span>
        </div>
      </div>
    </div>
  )
}

// Enhanced Time Entry Component
export const TimeEntry = ({ onSubmit, loading = false, taskTitle = "" }) => {
  const [hours, setHours] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}
    
    if (!hours || parseFloat(hours) <= 0) {
      newErrors.hours = 'Please enter valid hours (greater than 0)'
    }
    
    if (parseFloat(hours) > 24) {
      newErrors.hours = 'Hours cannot exceed 24 per entry'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) return
    
    onSubmit({
      hours: parseFloat(hours),
      description: description.trim()
    })
    
    setHours('')
    setDescription('')
    setErrors({})
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="space-y-4" role="form" aria-labelledby="time-entry-title">
      <h3 id="time-entry-title" className="sr-only">
        Log time for {taskTitle || "task"}
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-1">
          <label htmlFor="hours-input" className="block text-sm font-medium text-gray-300 mb-1">
            Hours Worked *
          </label>
          <input
            id="hours-input"
            type="number"
            step="0.5"
            min="0.5"
            max="24"
            value={hours}
            onChange={(e) => {
              setHours(e.target.value)
              if (errors.hours) {
                setErrors(prev => ({ ...prev, hours: null }))
              }
            }}
            onKeyPress={handleKeyPress}
            placeholder="2.5"
            className={`w-full bg-slate-700 border rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
              errors.hours ? 'border-red-500' : 'border-slate-600'
            }`}
            aria-describedby={errors.hours ? "hours-error" : "hours-help"}
            aria-invalid={!!errors.hours}
            disabled={loading}
            required
          />
          {errors.hours && (
            <p id="hours-error" className="text-red-400 text-xs mt-1" role="alert">
              {errors.hours}
            </p>
          )}
          {!errors.hours && (
            <p id="hours-help" className="text-gray-500 text-xs mt-1">
              Enter hours worked (0.5 - 24)
            </p>
          )}
        </div>
        
        <div className="sm:col-span-2">
          <label htmlFor="description-input" className="block text-sm font-medium text-gray-300 mb-1">
            Description (Optional)
          </label>
          <div className="flex space-x-2">
            <input
              id="description-input"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="What did you work on?"
              className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              disabled={loading}
              maxLength={200}
            />
            <button
              onClick={handleSubmit}
              disabled={loading || !hours}
              className="bg-purple-500 hover:bg-purple-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800 min-w-[100px]"
              aria-describedby="log-time-help"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  <span className="sr-only">Logging time...</span>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4" aria-hidden="true" />
                  <span>Log Time</span>
                </>
              )}
            </button>
          </div>
          <p id="log-time-help" className="text-gray-500 text-xs mt-1">
            Press Enter to log time quickly
          </p>
        </div>
      </div>
    </div>
  )
}

// Enhanced Daily Check-in Modal Component
export const DailyCheckInModal = ({ isOpen, onClose, task, onSubmit, loading = false }) => {
  const [formData, setFormData] = useState({
    workedOn: false,
    accomplishments: [''],
    blockers: [''],
    nextSteps: [''],
    mood: 'neutral',
    progress: task?.progress || 0
  })
  
  const modalRef = useRef(null)
  const firstInputRef = useRef(null)

  // Reset form when task changes
  useEffect(() => {
    if (task) {
      setFormData(prev => ({
        ...prev,
        progress: task.progress || 0
      }))
    }
  }, [task])

  // Focus management
  useEffect(() => {
    if (isOpen && firstInputRef.current) {
      firstInputRef.current.focus()
    }
  }, [isOpen])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return

      if (e.key === 'Escape') {
        onClose()
      }
      
      if (e.key === 'Tab') {
        // Trap focus within modal
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        
        if (focusableElements?.length) {
          const firstElement = focusableElements[0]
          const lastElement = focusableElements[focusableElements.length - 1]
          
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault()
            lastElement.focus()
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

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
    const submitData = {
      ...formData,
      accomplishments: formData.accomplishments.filter(a => a.trim()),
      blockers: formData.blockers.filter(b => b.trim()),
      nextSteps: formData.nextSteps.filter(n => n.trim())
    }
    
    onSubmit(submitData)
  }

  const renderFieldList = (title, field, placeholder, icon) => (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        <span className="flex items-center space-x-2">
          {icon}
          <span>{title}</span>
        </span>
      </label>
      {formData[field].map((value, index) => (
        <div key={index} className="flex items-center space-x-2 mb-2">
          <input
            type="text"
            value={value}
            onChange={(e) => updateArrayField(field, index, e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            disabled={loading}
            maxLength={200}
            aria-label={`${title} item ${index + 1}`}
          />
          {formData[field].length > 1 && (
            <button
              type="button"
              onClick={() => removeArrayField(field, index)}
              disabled={loading}
              className="text-red-400 hover:text-red-300 p-1 rounded disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label={`Remove ${title.toLowerCase()} item ${index + 1}`}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => addArrayField(field)}
        disabled={loading}
        className="text-purple-400 hover:text-purple-300 text-sm flex items-center space-x-1 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded"
      >
        <Plus className="w-3 h-3" />
        <span>Add {title.slice(0, -1)}</span>
      </button>
    </div>
  )

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkin-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        ref={modalRef}
        className="bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-slate-800 p-6 border-b border-slate-700 flex items-center justify-between">
          <h2 id="checkin-title" className="text-xl font-bold text-white">
            Daily Check-in: {task?.title}
          </h2>
          <button 
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-white disabled:opacity-50 p-1 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label="Close check-in dialog"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="bg-slate-700/30 p-4 rounded-lg">
            <h3 className="font-medium text-white mb-3">Update Progress</h3>
            <ProgressSlider 
              progress={formData.progress} 
              onChange={(value) => updateField('progress', value)}
              disabled={loading}
              label={`Progress for ${task?.title || 'this task'}`}
            />
          </div>

          <div className="flex items-center space-x-3">
            <input
              ref={firstInputRef}
              type="checkbox"
              id="workedOn"
              checked={formData.workedOn}
              onChange={(e) => updateField('workedOn', e.target.checked)}
              disabled={loading}
              className="w-4 h-4 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500 focus:ring-2 disabled:opacity-50"
            />
            <label htmlFor="workedOn" className="text-gray-300 select-none cursor-pointer">
              I worked on this task today
            </label>
          </div>

          {renderFieldList(
            'Accomplishments', 
            'accomplishments', 
            'What did you accomplish?',
            <CheckCircle className="w-4 h-4 text-green-400" />
          )}
          
          {renderFieldList(
            'Blockers', 
            'blockers', 
            'What blocked your progress?',
            <AlertTriangle className="w-4 h-4 text-red-400" />
          )}
          
          {renderFieldList(
            'Next Steps', 
            'nextSteps', 
            'What will you do next?',
            <Target className="w-4 h-4 text-blue-400" />
          )}

          <div>
            <label htmlFor="mood-select" className="block text-sm font-medium text-gray-300 mb-2">
              How are you feeling about this task?
            </label>
            <select
              id="mood-select"
              value={formData.mood}
              onChange={(e) => updateField('mood', e.target.value)}
              disabled={loading}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
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
              disabled={loading}
              className="flex-1 bg-slate-600 hover:bg-slate-500 disabled:bg-slate-700 disabled:opacity-50 text-white py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-slate-600 disabled:to-slate-600 text-white py-3 px-4 rounded-lg transition-all flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4" />
                  <span>Save Check-in</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Enhanced Progress History Component
export const ProgressHistory = ({ progressHistory = [], timeEntries = [], loading = false }) => {
  const [activeTab, setActiveTab] = useState('progress')

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: new Date(dateStr).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
      })
    } catch {
      return 'Invalid date'
    }
  }

  const formatTime = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleTimeString('en-US', { 
        hour: 'numeric',
        minute: '2-digit'
      })
    } catch {
      return ''
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex space-x-1 bg-slate-800 rounded-lg p-1">
          <div className="flex-1 py-2 px-3 bg-slate-600 rounded-md animate-pulse"></div>
          <div className="flex-1 py-2 px-3 bg-slate-700 rounded-md animate-pulse"></div>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-3 bg-slate-800/50 rounded-lg animate-pulse">
              <div className="h-4 bg-slate-600 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-slate-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div 
        className="flex space-x-1 bg-slate-800 rounded-lg p-1" 
        role="tablist"
        aria-label="Progress history tabs"
      >
        <button
          onClick={() => setActiveTab('progress')}
          className={`flex-1 py-2 px-3 rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 ${
            activeTab === 'progress' 
              ? 'bg-purple-500 text-white' 
              : 'text-gray-400 hover:text-white'
          }`}
          role="tab"
          aria-selected={activeTab === 'progress'}
          aria-controls="progress-panel"
        >
          Progress History ({progressHistory.length})
        </button>
        <button
          onClick={() => setActiveTab('time')}
          className={`flex-1 py-2 px-3 rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 ${
            activeTab === 'time' 
              ? 'bg-purple-500 text-white' 
              : 'text-gray-400 hover:text-white'
          }`}
          role="tab"
          aria-selected={activeTab === 'time'}
          aria-controls="time-panel"
        >
          Time Entries ({timeEntries.length})
        </button>
      </div>

      <div
        id="progress-panel"
        role="tabpanel"
        aria-labelledby="progress-tab"
        className={activeTab === 'progress' ? 'block' : 'hidden'}
      >
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {progressHistory.length > 0 ? (
            progressHistory.slice().reverse().map((entry, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-lg">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-400" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">{entry.progress}%</span>
                    <div className="text-gray-400 text-sm">
                      <span>{formatDate(entry.date)}</span>
                      {formatTime(entry.date) && (
                        <span className="ml-1 text-xs">at {formatTime(entry.date)}</span>
                      )}
                    </div>
                  </div>
                  {entry.note && (
                    <p className="text-gray-300 text-sm mt-1">{entry.note}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" aria-hidden="true" />
              <p>No progress history yet</p>
              <p className="text-sm">Start updating your progress to see history here</p>
            </div>
          )}
        </div>
      </div>

      <div
        id="time-panel"
        role="tabpanel"
        aria-labelledby="time-tab"
        className={activeTab === 'time' ? 'block' : 'hidden'}
      >
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {timeEntries.length > 0 ? (
            timeEntries.slice().reverse().map((entry, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-lg">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-400" aria-hidden="true" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">{entry.hours}h</span>
                    <div className="text-gray-400 text-sm">
                      <span>{formatDate(entry.date)}</span>
                      {formatTime(entry.date) && (
                        <span className="ml-1 text-xs">at {formatTime(entry.date)}</span>
                      )}
                    </div>
                  </div>
                  {entry.description && (
                    <p className="text-gray-300 text-sm mt-1">{entry.description}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" aria-hidden="true" />
              <p>No time entries yet</p>
              <p className="text-sm">Start logging time to see entries here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Quick Progress Update Component with enhanced UX
export const QuickProgressUpdate = ({ task, onUpdate, loading = false }) => {
  const [progress, setProgress] = useState(task.progress || 0)
  const [note, setNote] = useState('')
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    setProgress(task.progress || 0)
    setHasChanges(false)
  }, [task.progress])

  useEffect(() => {
    setHasChanges(progress !== (task.progress || 0) || note.trim().length > 0)
  }, [progress, note, task.progress])

  const handleUpdate = async () => {
    if (!hasChanges) return
    
    try {
      await onUpdate(progress, note.trim())
      setNote('')
      setHasChanges(false)
    } catch (error) {
      console.error('Failed to update progress:', error)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleUpdate()
    }
  }

  return (
    <div className="space-y-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-white">Quick Progress Update</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">Current: {task.progress || 0}%</span>
          {loading && (
            <div className="animate-spin rounded-full h-3 w-3 border-t border-purple-500"></div>
          )}
        </div>
      </div>
      
      <ProgressSlider 
        progress={progress} 
        onChange={setProgress}
        disabled={loading}
        label={`Update progress for ${task.title}`}
      />
      
      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Add a note about your progress..."
        className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        disabled={loading}
        maxLength={100}
        aria-label="Progress update note"
      />
      
      <button
        onClick={handleUpdate}
        disabled={loading || !hasChanges}
        className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800"
        aria-describedby="update-help"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
            <span>Updating...</span>
          </>
        ) : (
          <>
            <Target className="w-4 h-4" aria-hidden="true" />
            <span>Update Progress</span>
          </>
        )}
      </button>
      <p id="update-help" className="text-xs text-gray-500">
        {hasChanges ? 'Click to save changes' : 'Make changes to enable update'}
      </p>
    </div>
  )
}

// Main Progress Tracker Dashboard Component with enhanced accessibility
export const ProgressTracker = ({ 
  tasks = [], 
  analytics = null, 
  onProgressUpdate, 
  onTimeLog, 
  onDailyCheckIn, 
  onRefresh, 
  loading = false,
  actionLoading = {}
}) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedTask, setSelectedTask] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('progress')

  // Filter and sort tasks
  const filteredTasks = tasks
    .filter(task => 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'progress':
          return (b.progress || 0) - (a.progress || 0)
        case 'title':
          return a.title.localeCompare(b.title)
        case 'lastWorked':
          const aDate = new Date(a.lastWorkedOn || 0)
          const bDate = new Date(b.lastWorkedOn || 0)
          return bDate - aDate
        default:
          return 0
      }
    })

  const stats = analytics || {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.progress === 100).length,
    inProgressTasks: tasks.filter(t => t.progress > 0 && t.progress < 100).length,
    totalHours: tasks.reduce((sum, task) => sum + (task.totalHours || 0), 0),
    averageProgress: tasks.length > 0 
      ? tasks.reduce((sum, task) => sum + (task.progress || 0), 0) / tasks.length 
      : 0
  }

  const handleRefresh = async () => {
    try {
      await onRefresh()
    } catch (error) {
      console.error('Failed to refresh data:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
        <div className="text-center" role="status" aria-label="Loading progress analytics">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <div className="text-white text-xl">Loading Progress Analytics...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Progress Analytics</h1>
              <p className="text-gray-400">Track your daily progress and performance</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading || Object.values(actionLoading).some(Boolean)}
              className="bg-purple-500 hover:bg-purple-600 disabled:bg-purple-700 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              aria-describedby="refresh-help"
            >
              <TrendingUp className="w-4 h-4" aria-hidden="true" />
              <span>{loading ? 'Refreshing...' : 'Refresh Data'}</span>
            </button>
            <p id="refresh-help" className="sr-only">
              Refresh all progress data and analytics
            </p>
          </div>
        </header>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-lg border border-slate-700/50">
            <div className="text-3xl font-bold text-white" role="img" aria-label={`${stats.totalTasks} total tasks`}>
              {stats.totalTasks}
            </div>
            <div className="text-gray-400 text-sm">Total Tasks</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-lg border border-slate-700/50">
            <div className="text-3xl font-bold text-green-400" role="img" aria-label={`${stats.completedTasks} completed tasks`}>
              {stats.completedTasks}
            </div>
            <div className="text-gray-400 text-sm">Completed</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-lg border border-slate-700/50">
            <div className="text-3xl font-bold text-purple-400" role="img" aria-label={`${stats.inProgressTasks} in progress tasks`}>
              {stats.inProgressTasks}
            </div>
            <div className="text-gray-400 text-sm">In Progress</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-lg border border-slate-700/50">
            <div className="text-3xl font-bold text-blue-400" role="img" aria-label={`${stats.totalHours.toFixed(1)} total hours`}>
              {stats.totalHours.toFixed(1)}h
            </div>
            <div className="text-gray-400 text-sm">Total Time</div>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-lg border border-slate-700/50 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="task-search" className="sr-only">Search tasks</label>
              <input
                id="task-search"
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                aria-describedby="search-help"
              />
              <p id="search-help" className="text-xs text-gray-500 mt-1">
                Search by task title or description
              </p>
            </div>
            <div>
              <label htmlFor="sort-select" className="sr-only">Sort tasks by</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="progress">Sort by Progress</option>
                <option value="title">Sort by Title</option>
                <option value="lastWorked">Sort by Last Worked</option>
              </select>
            </div>
          </div>
        </div>

        {/* Average Progress */}
        <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-lg border border-slate-700/50 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Average Progress</h2>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <ProgressBar 
                progress={stats.averageProgress} 
                size="large" 
                ariaLabel={`Average progress across all tasks: ${stats.averageProgress.toFixed(1)}%`}
              />
            </div>
            <div className="text-2xl font-bold text-white">{stats.averageProgress.toFixed(1)}%</div>
          </div>
        </div>

        {/* Task Progress List */}
        <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-lg border border-slate-700/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Task Progress</h2>
            <span className="text-sm text-gray-400">
              Showing {filteredTasks.length} of {tasks.length} tasks
            </span>
          </div>
          
          {filteredTasks.length > 0 ? (
            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <div key={task.id || task._id} className="p-4 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-white">{task.title}</h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onDailyCheckIn(task)}
                        disabled={actionLoading.dailyCheckIn}
                        className="text-purple-400 hover:text-purple-300 text-sm disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded px-2 py-1"
                        aria-label={`Open daily check-in for ${task.title}`}
                      >
                        Check-in
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-white">{task.progress || 0}%</span>
                      </div>
                      <ProgressBar 
                        progress={task.progress || 0} 
                        ariaLabel={`${task.title} progress: ${task.progress || 0}%`}
                      />
                    </div>
                    
                    {task.totalHours > 0 && (
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>Time logged: {(task.totalHours || 0).toFixed(1)} hours</span>
                        {task.lastWorkedOn && (
                          <span>Last worked: {new Date(task.lastWorkedOn).toLocaleDateString()}</span>
                        )}
                      </div>
                    )}
                    
                    {task.description && (
                      <p className="text-gray-300 text-sm">{task.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" aria-hidden="true" />
              <h3 className="text-lg font-medium mb-2">No tasks found</h3>
              <p className="text-sm">
                {searchTerm 
                  ? `No tasks match "${searchTerm}". Try adjusting your search.`
                  : 'No tasks available. Create some tasks to see progress analytics.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}