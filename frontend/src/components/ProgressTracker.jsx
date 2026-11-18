// components/SafeProgressTracker.jsx - Complete Fixed Version
import { useState, useRef, useEffect } from 'react'
import { Clock, TrendingUp, Calendar, Target, Plus, Edit3, X, ChevronDown, ChevronRight, Timer, BarChart3, PieChart, Activity, CheckCircle, AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next';

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
    <div className={`w-full rounded-full ${sizeClasses[size] || sizeClasses.default} ${className}`} style={{ background: 'var(--royal-light)' }}>
      <div
        className="rounded-full transition-all duration-500"
        style={{ width: `${progressValue}%`, height: '100%', background: progressValue >= 100 ? 'var(--gold)' : 'var(--royal)' }}
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
        <label htmlFor="progress-slider" className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
          {safeString(label, 'Progress')}
        </label>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium" style={{ color: 'var(--text)' }} aria-live="polite">
            {localProgress}%
          </span>
          {loading && (
            <div className="animate-spin rounded-full h-3 w-3 border-t" style={{ borderColor: 'var(--royal)' }}></div>
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
          className="w-full h-2 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{
            background: `linear-gradient(to right, var(--royal) 0%, var(--royal) ${localProgress}%, var(--royal-light) ${localProgress}%, var(--royal-light) 100%)`
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
          <label htmlFor="hours-input" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
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
            className="w-full rounded-lg px-3 py-2 transition-all focus:outline-none"
            style={{
              background: 'var(--surface-2)',
              border: errors.hours ? '1px solid #ef4444' : '1px solid var(--border)',
              color: 'var(--text)'
            }}
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
          <label htmlFor="description-input" className="block text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
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
              className="flex-1 rounded-lg px-3 py-2 transition-all focus:outline-none"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
              disabled={loading}
              maxLength={200}
            />
            <button
              onClick={handleSubmit}
              disabled={loading || !hours}
              className="text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 focus:outline-none min-w-[100px] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: loading || !hours ? 'var(--text-muted)' : 'var(--royal)' }}
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
        <div className="flex space-x-1 rounded-lg p-1" style={{ background: 'var(--surface-2)' }}>
          <div className="flex-1 py-2 px-3 rounded-md animate-pulse" style={{ background: 'var(--royal-light)' }}></div>
          <div className="flex-1 py-2 px-3 rounded-md animate-pulse" style={{ background: 'var(--border)' }}></div>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-3 rounded-lg animate-pulse" style={{ background: 'var(--surface-2)' }}>
              <div className="h-4 rounded w-3/4 mb-2" style={{ background: 'var(--royal-light)' }}></div>
              <div className="h-3 rounded w-1/2" style={{ background: 'var(--border)' }}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        className="flex space-x-1 rounded-lg p-1"
        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
        role="tablist"
        aria-label="Progress history tabs"
      >
        <button
          onClick={() => setActiveTab('progress')}
          className={`flex-1 py-2 px-3 rounded-md text-sm transition-colors focus:outline-none font-medium`}
          style={activeTab === 'progress' ? { background: 'var(--royal)', color: '#fff' } : { color: 'var(--text-muted)' }}
          role="tab"
          aria-selected={activeTab === 'progress'}
          aria-controls="progress-panel"
        >
          Progress History ({safeProgressHistory.length})
        </button>
        <button
          onClick={() => setActiveTab('time')}
          className={`flex-1 py-2 px-3 rounded-md text-sm transition-colors focus:outline-none font-medium`}
          style={activeTab === 'time' ? { background: 'var(--royal)', color: '#fff' } : { color: 'var(--text-muted)' }}
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
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg" style={{ background: 'var(--surface-2)' }}>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'var(--royal-light)' }}>
                    <TrendingUp className="w-5 h-5" style={{ color: 'var(--royal)' }} aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium" style={{ color: 'var(--royal)' }}>{progress}%</span>
                      <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        <span>{safeFormatDate(date)}</span>
                        {safeFormatTime(date) && (
                          <span className="ml-1 text-xs">at {safeFormatTime(date)}</span>
                        )}
                      </div>
                    </div>
                    {note && (
                      <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{note}</p>
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
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg" style={{ background: 'var(--surface-2)' }}>
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'var(--gold-light)' }}>
                    <Clock className="w-5 h-5" style={{ color: 'var(--gold-dark)' }} aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium" style={{ color: 'var(--gold-dark)' }}>{hours}h</span>
                      <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        <span>{safeFormatDate(date)}</span>
                        {safeFormatTime(date) && (
                          <span className="ml-1 text-xs">at {safeFormatTime(date)}</span>
                        )}
                      </div>
                    </div>
                    {description && (
                      <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{description}</p>
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
  const { t } = useTranslation();
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

  // Safe stats calculation — always produce numeric fields regardless of analytics shape
  const calculatedStats = (() => {
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
      return { totalTasks: 0, completedTasks: 0, inProgressTasks: 0, totalHours: 0, averageProgress: 0 };
    }
  })();

  const stats = {
    ...calculatedStats,
    ...(analytics || {}),
    // Always ensure numeric fields even if analytics object has them as undefined
    totalHours: Number((analytics || {}).totalHours ?? calculatedStats.totalHours) || 0,
    averageProgress: Number((analytics || {}).averageProgress ?? calculatedStats.averageProgress) || 0,
  };

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
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'transparent' }}>
        <div className="text-center" role="status" aria-label="Loading progress analytics">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--royal)' }}></div>
          <div className="text-xl font-semibold" style={{ color: 'var(--text)' }}>Loading Progress Analytics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ background: 'transparent' }}>
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text)' }}>Progress Analytics</h1>
              <p style={{ color: 'var(--text-muted)' }}>Track your daily progress and performance</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading || Object.values(actionLoading || {}).some(Boolean)}
              className="text-white py-2 px-4 rounded-lg transition-colors flex items-center space-x-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'var(--royal)' }}
              onMouseEnter={e => !loading && (e.currentTarget.style.background = 'var(--royal-dark)')}
              onMouseLeave={e => !loading && (e.currentTarget.style.background = 'var(--royal)')}
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
          <div className="p-4 rounded-lg shadow-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="text-3xl font-bold" style={{ color: 'var(--royal)' }} role="img" aria-label={`${stats.totalTasks} total tasks`}>
              {stats.totalTasks}
            </div>
            <div className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{t('dashboard.totalTasks')}</div>
          </div>
          <div className="p-4 rounded-lg shadow-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="text-3xl font-bold text-green-600" role="img" aria-label={`${stats.completedTasks} completed tasks`}>
              {stats.completedTasks}
            </div>
            <div className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{t('dashboard.completed')}</div>
          </div>
          <div className="p-4 rounded-lg shadow-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="text-3xl font-bold" style={{ color: 'var(--royal)' }} role="img" aria-label={`${stats.inProgressTasks} in progress tasks`}>
              {stats.inProgressTasks}
            </div>
            <div className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{t('dashboard.inProgress')}</div>
          </div>
          {/* Gold card for time — premium/achievement metric */}
          <div className="p-4 rounded-lg shadow-sm" style={{ background: 'var(--gold-light)', border: '2px solid var(--gold)' }}>
            <div className="text-3xl font-bold" style={{ color: 'var(--gold-dark)' }} role="img" aria-label={`${stats.totalHours.toFixed(1)} total hours`}>
              {stats.totalHours.toFixed(1)}h
            </div>
            <div className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{t('dashboard.timeTracked')}</div>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="p-4 rounded-lg mb-8 shadow-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="task-search" className="sr-only">Search tasks</label>
              <input
                id="task-search"
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg px-3 py-2 focus:outline-none transition-all"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                aria-describedby="search-help"
              />
              <p id="search-help" className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Search by task title or description
              </p>
            </div>
            <div>
              <label htmlFor="sort-select" className="sr-only">Sort tasks by</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-lg px-3 py-2 focus:outline-none"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
              >
                <option value="progress">{t('dashboard.sortByProgress')}</option>
                <option value="title">{t('dashboard.sortByTitle')}</option>
                <option value="lastWorked">{t('dashboard.sortByLastWorked')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Average Progress */}
        <div className="p-6 rounded-lg mb-8 shadow-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>{t('dashboard.averageProgress')}</h2>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <ProgressBar
                progress={stats.averageProgress}
                size="large"
                ariaLabel={`${t('dashboard.averageProgressAcrossAllTasks')}: ${stats.averageProgress.toFixed(1)}%`}
              />
            </div>
            <div className="text-2xl font-bold" style={{ color: 'var(--royal)' }}>{stats.averageProgress.toFixed(1)}%</div>
          </div>
        </div>

        {/* Task Progress List */}
        <div className="p-6 rounded-lg shadow-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>{t('dashboard.taskProgress')}</h2>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {t('dashboard.showing')} {filteredTasks.length} {t('dashboard.of')} {safeTasks.length} {t('dashboard.tasks')}
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
                  <div key={taskId} className="p-4 rounded-lg" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium" style={{ color: 'var(--text)' }}>{taskTitle}</h3>
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
                          className="text-sm disabled:opacity-50 focus:outline-none rounded px-2 py-1 font-medium"
                          style={{ color: 'var(--royal)' }}
                          aria-label={`${t('dashboard.openDailyCheckInFor')} ${taskTitle}`}
                        >
                          {t('dashboard.checkIn')}
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span style={{ color: 'var(--text-muted)' }}>{t('dashboard.progress')}</span>
                          <span className="font-medium" style={{ color: 'var(--royal)' }}>{taskProgress}%</span>
                        </div>
                        <ProgressBar 
                          progress={taskProgress} 
                          ariaLabel={`${taskTitle} ${t('dashboard.progress')}: ${taskProgress}%`}
                        />
                      </div>
                      
                      {taskTotalHours > 0 && (
                        <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                          <span>{t('dashboard.timeLogged')}: {taskTotalHours.toFixed(1)} {t('dashboard.hours')}</span>
                          {taskLastWorkedOn && (
                            <span>{t('dashboard.lastWorked')}: {safeFormatDate(taskLastWorkedOn)}</span>
                          )}
                        </div>
                      )}

                      {taskDescription && (
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{taskDescription}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" aria-hidden="true" />
              <h3 className="text-lg font-medium mb-2">{t('dashboard.noTasksFound')}</h3>
              <p className="text-sm">
                {searchTerm 
                  ? `${t('dashboard.noTasksMatch')} "${searchTerm}". ${t('dashboard.tryAdjustingSearch')}`
                  : `${t('dashboard.noTasksAvailable')}. ${t('dashboard.createSomeTasks')} ${t('dashboard.toSeeProgressAnalytics')}`
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
    <div className="space-y-4 p-4 rounded-lg" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between">
        <h3 className="font-medium" style={{ color: 'var(--text)' }}>{t('dashboard.quickProgressUpdate')}</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{t('dashboard.current')}: {safeNumber(task?.progress, 0)}%</span>
          {loading && (
            <div className="animate-spin rounded-full h-3 w-3 border-t" style={{ borderColor: 'var(--royal)' }}></div>
          )}
        </div>
      </div>
      
      <ProgressSlider 
        progress={progress} 
        onChange={setProgress}
        disabled={loading}
        label={`${t('dashboard.updateProgressFor')} ${safeString(task?.title, 'this task')}`}
      />
      
      <input
        type="text"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={t('dashboard.addNoteAboutProgress')}
        className="w-full rounded-lg px-3 py-2 focus:outline-none transition-all"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
        disabled={loading}
        maxLength={100}
        aria-label={t('dashboard.progressUpdateNote')}
      />

      <button
        onClick={handleUpdate}
        disabled={loading || !hasChanges}
        className="w-full text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: 'var(--royal)' }}
        aria-describedby="update-help"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
            <span>{t('dashboard.updating')}</span>
          </>
        ) : (
          <>
            <Target className="w-4 h-4" aria-hidden="true" />
            <span>{t('dashboard.updateProgress')}</span>
          </>
        )}
      </button>
      <p id="update-help" className="text-xs text-gray-500">{t('dashboard.updateHelp')}</p>
    </div>
  );
};