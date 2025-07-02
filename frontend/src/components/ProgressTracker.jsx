// components/SafeProgressTracker.jsx - Complete Fixed Version
import { useState, useRef, useEffect } from 'react'
import { Clock, TrendingUp, Calendar, Target, Plus, Edit3, X, ChevronDown, ChevronRight, Timer, BarChart3, PieChart, Activity, CheckCircle, AlertTriangle } from 'lucide-react'

// Safe utility functions to prevent object conversion errors
const safeString = (value, fallback = '') => {
  try {
    if (value === null || value === undefined) return fallback;
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    return fallback;
  } catch (e) {
    return fallback;
  }
};

const safeNumber = (value, fallback = 0) => {
  try {
    if (value === null || value === undefined) return fallback;
    const num = Number(value);
    return isNaN(num) ? fallback : num;
  } catch (e) {
    return fallback;
  }
};

const safeDate = (dateValue, fallback = null) => {
  try {
    if (!dateValue) return fallback;
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? fallback : date;
  } catch (e) {
    return fallback;
  }
};

const safeFormatDate = (dateValue) => {
  try {
    const date = safeDate(dateValue);
    if (!date) return 'Unknown date';
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  } catch (e) {
    return 'Invalid date';
  }
};

const safeFormatTime = (dateValue) => {
  try {
    const date = safeDate(dateValue);
    if (!date) return '';
    
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric',
      minute: '2-digit'
    });
  } catch (e) {
    return '';
  }
};

// Safe logging function
const safeLog = (...args) => {
  try {
    const safeArgs = args.map(arg => {
      if (typeof arg === 'object' && arg !== null) {
        try {
          return JSON.stringify(arg, (key, value) => {
            if (typeof value === 'object' && value !== null) {
              return '[Object]';
            }
            return value;
          });
        } catch (e) {
          return '[Unserializable Object]';
        }
      }
      return arg;
    });
    console.log(...safeArgs);
  } catch (e) {
    console.log('Safe log error');
  }
};

// Enhanced Progress Bar Component with safety checks
export const ProgressBar = ({ progress, className = "", size = "default", showLabel = true, ariaLabel }) => {
  const sizeClasses = {
    small: "h-1",
    default: "h-2", 
    large: "h-4"
  };

  const progressValue = Math.min(Math.max(safeNumber(progress, 0), 0), 100);

  return (
    <div className={`w-full bg-slate-700 rounded-full ${sizeClasses[size] || sizeClasses.default} ${className}`}>
      <div 
        className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
        style={{ width: `${progressValue}%`, height: '100%' }}
        role="progressbar"
        aria-valuenow={progressValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={safeString(ariaLabel, `Progress: ${progressValue}%`)}
      />
      {showLabel && size === "large" && (
        <div className="flex justify-end mt-1">
          <span className="text-xs text-gray-400">{progressValue}%</span>
        </div>
      )}
    </div>
  );
};

// Enhanced Progress Slider Component with safety
export const ProgressSlider = ({ progress, onChange, disabled = false, loading = false, label = "Progress" }) => {
  const [localProgress, setLocalProgress] = useState(safeNumber(progress, 0));
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef(null);

  useEffect(() => {
    if (!isDragging) {
      setLocalProgress(safeNumber(progress, 0));
    }
  }, [progress, isDragging]);

  const handleChange = (e) => {
    try {
      const newProgress = safeNumber(e.target?.value, 0);
      setLocalProgress(newProgress);
      if (onChange && !disabled && !loading) {
        onChange(newProgress);
      }
    } catch (e) {
      safeLog('Progress slider change error:', e.message);
    }
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label htmlFor="progress-slider" className="text-sm font-medium text-gray-300">
          {safeString(label, 'Progress')}
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
  );
};

// Safe Time Entry Component
export const TimeEntry = ({ onSubmit, loading = false, taskTitle = "" }) => {
  const [hours, setHours] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    const hoursNum = safeNumber(hours, 0);
    
    if (!hours || hoursNum <= 0) {
      newErrors.hours = 'Please enter valid hours (greater than 0)';
    }
    
    if (hoursNum > 24) {
      newErrors.hours = 'Hours cannot exceed 24 per entry';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    try {
      if (!validateForm()) return;
      
      onSubmit({
        hours: safeNumber(hours, 0),
        description: safeString(description).trim()
      });
      
      setHours('');
      setDescription('');
      setErrors({});
    } catch (e) {
      safeLog('Time entry submit error:', e.message);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-4" role="form" aria-labelledby="time-entry-title">
      <h3 id="time-entry-title" className="sr-only">
        Log time for {safeString(taskTitle, 'task')}
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
              setHours(e.target.value);
              if (errors.hours) {
                setErrors(prev => ({ ...prev, hours: null }));
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
  );
};

// Safe Progress History Component
export const ProgressHistory = ({ progressHistory = [], timeEntries = [], loading = false }) => {
  const [activeTab, setActiveTab] = useState('progress');

  // Safely process arrays
  const safeProgressHistory = Array.isArray(progressHistory) ? progressHistory : [];
  const safeTimeEntries = Array.isArray(timeEntries) ? timeEntries : [];

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
    );
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
          Progress History ({safeProgressHistory.length})
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
          Time Entries ({safeTimeEntries.length})
        </button>
      </div>

      <div
        id="progress-panel"
        role="tabpanel"
        aria-labelledby="progress-tab"
        className={activeTab === 'progress' ? 'block' : 'hidden'}
      >
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {safeProgressHistory.length > 0 ? (
            safeProgressHistory.slice().reverse().map((entry, index) => {
              const progress = safeNumber(entry?.progress, 0);
              const date = safeString(entry?.date, '');
              const note = safeString(entry?.note, '');
              
              return (
                <div key={index} className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-lg">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-purple-400" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">{progress}%</span>
                      <div className="text-gray-400 text-sm">
                        <span>{safeFormatDate(date)}</span>
                        {safeFormatTime(date) && (
                          <span className="ml-1 text-xs">at {safeFormatTime(date)}</span>
                        )}
                      </div>
                    </div>
                    {note && (
                      <p className="text-gray-300 text-sm mt-1">{note}</p>
                    )}
                  </div>
                </div>
              );
            })
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
          {safeTimeEntries.length > 0 ? (
            safeTimeEntries.slice().reverse().map((entry, index) => {
              const hours = safeNumber(entry?.hours, 0);
              const date = safeString(entry?.date, '');
              const description = safeString(entry?.description, '');
              
              return (
                <div key={index} className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-lg">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-400" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">{hours}h</span>
                      <div className="text-gray-400 text-sm">
                        <span>{safeFormatDate(date)}</span>
                        {safeFormatTime(date) && (
                          <span className="ml-1 text-xs">at {safeFormatTime(date)}</span>
                        )}
                      </div>
                    </div>
                    {description && (
                      <p className="text-gray-300 text-sm mt-1">{description}</p>
                    )}
                  </div>
                </div>
              );
            })
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
  );
};

// Main Progress Tracker Dashboard Component with enhanced safety
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
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('progress');

  // Safely process tasks array
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  // Filter and sort tasks safely
  const filteredTasks = safeTasks
    .filter(task => {
      try {
        const title = safeString(task?.title, '').toLowerCase();
        const description = safeString(task?.description, '').toLowerCase();
        const searchLower = safeString(searchTerm, '').toLowerCase();
        return title.includes(searchLower) || description.includes(searchLower);
      } catch (e) {
        return false;
      }
    })
    .sort((a, b) => {
      try {
        switch (sortBy) {
          case 'progress':
            return safeNumber(b?.progress, 0) - safeNumber(a?.progress, 0);
          case 'title':
            return safeString(a?.title, '').localeCompare(safeString(b?.title, ''));
          case 'lastWorked':
            const aDate = safeDate(a?.lastWorkedOn, new Date(0));
            const bDate = safeDate(b?.lastWorkedOn, new Date(0));
            return bDate.getTime() - aDate.getTime();
          default:
            return 0;
        }
      } catch (e) {
        return 0;
      }
    });

  // Safe stats calculation
  const stats = analytics || (() => {
    try {
      return {
        totalTasks: safeTasks.length,
        completedTasks: safeTasks.filter(t => safeNumber(t?.progress, 0) === 100).length,
        inProgressTasks: safeTasks.filter(t => {
          const progress = safeNumber(t?.progress, 0);
          return progress > 0 && progress < 100;
        }).length,
        totalHours: safeTasks.reduce((sum, task) => sum + safeNumber(task?.totalHours, 0), 0),
        averageProgress: safeTasks.length > 0 
          ? safeTasks.reduce((sum, task) => sum + safeNumber(task?.progress, 0), 0) / safeTasks.length 
          : 0
      };
    } catch (e) {
      safeLog('Error calculating stats:', e.message);
      return {
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        totalHours: 0,
        averageProgress: 0
      };
    }
  })();

  const handleRefresh = async () => {
    try {
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      safeLog('Failed to refresh data:', error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 flex items-center justify-center">
        <div className="text-center" role="status" aria-label="Loading progress analytics">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <div className="text-white text-xl">Loading Progress Analytics...</div>
        </div>
      </div>
    );
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
              disabled={loading || Object.values(actionLoading || {}).some(Boolean)}
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
              Showing {filteredTasks.length} of {safeTasks.length} tasks
            </span>
          </div>
          
          {filteredTasks.length > 0 ? (
            <div className="space-y-4">
              {filteredTasks.map((task, index) => {
                // Safe task data extraction
                const taskId = safeString(task?.id || task?._id, `task-${index}`);
                const taskTitle = safeString(task?.title, 'Untitled Task');
                const taskDescription = safeString(task?.description, '');
                const taskProgress = safeNumber(task?.progress, 0);
                const taskTotalHours = safeNumber(task?.totalHours, 0);
                const taskLastWorkedOn = task?.lastWorkedOn;
                
                return (
                  <div key={taskId} className="p-4 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-white">{taskTitle}</h3>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            try {
                              if (onDailyCheckIn) {
                                onDailyCheckIn(task);
                              }
                            } catch (e) {
                              safeLog('Daily check-in error:', e.message);
                            }
                          }}
                          disabled={actionLoading?.dailyCheckIn}
                          className="text-purple-400 hover:text-purple-300 text-sm disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded px-2 py-1"
                          aria-label={`Open daily check-in for ${taskTitle}`}
                        >
                          Check-in
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-400">Progress</span>
                          <span className="text-white">{taskProgress}%</span>
                        </div>
                        <ProgressBar 
                          progress={taskProgress} 
                          ariaLabel={`${taskTitle} progress: ${taskProgress}%`}
                        />
                      </div>
                      
                      {taskTotalHours > 0 && (
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>Time logged: {taskTotalHours.toFixed(1)} hours</span>
                          {taskLastWorkedOn && (
                            <span>Last worked: {safeFormatDate(taskLastWorkedOn)}</span>
                          )}
                        </div>
                      )}
                      
                      {taskDescription && (
                        <p className="text-gray-300 text-sm">{taskDescription}</p>
                      )}
                    </div>
                  </div>
                );
              })}
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
  );
};

// Quick Progress Update Component with enhanced UX
export const QuickProgressUpdate = ({ task, onUpdate, loading = false }) => {
  const [progress, setProgress] = useState(safeNumber(task?.progress, 0));
  const [note, setNote] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setProgress(safeNumber(task?.progress, 0));
    setHasChanges(false);
  }, [task?.progress]);

  useEffect(() => {
    setHasChanges(progress !== safeNumber(task?.progress, 0) || note.trim().length > 0);
  }, [progress, note, task?.progress]);

  const handleUpdate = async () => {
    if (!hasChanges) return;
    
    try {
      await onUpdate(progress, note.trim());
      setNote('');
      setHasChanges(false);
    } catch (error) {
      safeLog('Failed to update progress:', error.message);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleUpdate();
    }
  };

  return (
    <div className="space-y-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-white">Quick Progress Update</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">Current: {safeNumber(task?.progress, 0)}%</span>
          {loading && (
            <div className="animate-spin rounded-full h-3 w-3 border-t border-purple-500"></div>
          )}
        </div>
      </div>
      
      <ProgressSlider 
        progress={progress} 
        onChange={setProgress}
        disabled={loading}
        label={`Update progress for ${safeString(task?.title, 'this task')}`}
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
  );
};