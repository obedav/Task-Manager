// Fixed SafeProgressTracker.jsx - Ensuring proper exports
import React, { useState, useRef, useEffect } from 'react'
import { Clock, TrendingUp, Calendar, Target, Plus, Edit3, X, ChevronDown, ChevronRight, Timer, BarChart3, PieChart, Activity, CheckCircle, AlertTriangle, Search, Filter } from 'lucide-react'
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

// Daily Check-in Modal Component
const DailyCheckInModal = ({ 
  isOpen, 
  onClose, 
  task, 
  onSubmit, 
  loading = false 
}) => {
  const [progress, setProgress] = useState(0);
  const [hoursWorked, setHoursWorked] = useState('');
  const [accomplishments, setAccomplishments] = useState('');
  const [challenges, setChallenges] = useState('');
  const [nextSteps, setNextSteps] = useState('');
  const [mood, setMood] = useState('neutral');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (task && isOpen) {
      setProgress(safeNumber(task?.progress, 0));
      // Reset form when modal opens
      setHoursWorked('');
      setAccomplishments('');
      setChallenges('');
      setNextSteps('');
      setMood('neutral');
      setErrors({});
    }
  }, [task, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!accomplishments.trim()) {
      newErrors.accomplishments = 'Please describe what you accomplished';
    }
    
    const hours = safeNumber(hoursWorked, 0);
    if (hoursWorked && (hours <= 0 || hours > 24)) {
      newErrors.hoursWorked = 'Hours must be between 0.1 and 24';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const checkInData = {
        taskId: task?.id || task?._id,
        progress: progress,
        hoursWorked: hoursWorked ? safeNumber(hoursWorked, 0) : null,
        accomplishments: accomplishments.trim(),
        challenges: challenges.trim() || null,
        nextSteps: nextSteps.trim() || null,
        mood: mood,
        date: new Date().toISOString()
      };

      await onSubmit(checkInData);
      onClose();
    } catch (error) {
      safeLog('Daily check-in submission error:', error.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{ background: 'var(--surface, #FFFFFF)' }}>
        <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid var(--border, #D1D9EC)' }}>
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text, #0F1F3D)' }}>Daily Check-in</h2>
            <p className="text-sm" style={{ color: 'var(--text-muted, #4A5568)' }}>
              {safeString(task?.title, 'Unknown Task')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:bg-[#EEF3FB]"
            style={{ color: 'var(--text-muted, #4A5568)' }}
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Progress Update */}
          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-muted, #4A5568)' }}>
              Update Progress
            </label>
            <div className="space-y-3">
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #2451A3 0%, #2451A3 ${progress}%, #D6E4F7 ${progress}%, #D6E4F7 100%)`
                }}
              />
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--text-muted, #4A5568)' }}>0%</span>
                <span className="font-medium" style={{ color: 'var(--royal, #2451A3)' }}>{progress}%</span>
                <span style={{ color: 'var(--text-muted, #4A5568)' }}>100%</span>
              </div>
            </div>
          </div>

          {/* Hours Worked */}
          <div>
            <label htmlFor="hours-worked" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted, #4A5568)' }}>
              Hours Worked Today (Optional)
            </label>
            <input
              id="hours-worked"
              type="number"
              step="0.5"
              min="0.1"
              max="24"
              value={hoursWorked}
              onChange={(e) => {
                setHoursWorked(e.target.value);
                if (errors.hoursWorked) {
                  setErrors(prev => ({ ...prev, hoursWorked: null }));
                }
              }}
              placeholder="2.5"
              className="w-full rounded-lg px-3 py-2 focus:outline-none transition-all"
              style={{
                background: 'var(--surface-2, #EEF3FB)',
                border: errors.hoursWorked ? '1px solid #ef4444' : '1px solid var(--border, #D1D9EC)',
                color: 'var(--text, #0F1F3D)'
              }}
            />
            {errors.hoursWorked && (
              <p className="text-red-500 text-xs mt-1">{errors.hoursWorked}</p>
            )}
          </div>

          {/* Accomplishments */}
          <div>
            <label htmlFor="accomplishments" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted, #4A5568)' }}>
              What did you accomplish today? *
            </label>
            <textarea
              id="accomplishments"
              value={accomplishments}
              onChange={(e) => {
                setAccomplishments(e.target.value);
                if (errors.accomplishments) {
                  setErrors(prev => ({ ...prev, accomplishments: null }));
                }
              }}
              placeholder="Describe what you worked on and completed..."
              rows={3}
              className="w-full rounded-lg px-3 py-2 focus:outline-none resize-none transition-all"
              style={{
                background: 'var(--surface-2, #EEF3FB)',
                border: errors.accomplishments ? '1px solid #ef4444' : '1px solid var(--border, #D1D9EC)',
                color: 'var(--text, #0F1F3D)'
              }}
              required
            />
            {errors.accomplishments && (
              <p className="text-red-500 text-xs mt-1">{errors.accomplishments}</p>
            )}
          </div>

          {/* Challenges */}
          <div>
            <label htmlFor="challenges" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted, #4A5568)' }}>
              Any challenges or blockers? (Optional)
            </label>
            <textarea
              id="challenges"
              value={challenges}
              onChange={(e) => setChallenges(e.target.value)}
              placeholder="What obstacles did you encounter?"
              rows={2}
              className="w-full rounded-lg px-3 py-2 focus:outline-none resize-none"
              style={{ background: 'var(--surface-2, #EEF3FB)', border: '1px solid var(--border, #D1D9EC)', color: 'var(--text, #0F1F3D)' }}
            />
          </div>

          {/* Next Steps */}
          <div>
            <label htmlFor="next-steps" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted, #4A5568)' }}>
              What's next? (Optional)
            </label>
            <textarea
              id="next-steps"
              value={nextSteps}
              onChange={(e) => setNextSteps(e.target.value)}
              placeholder="What will you work on next?"
              rows={2}
              className="w-full rounded-lg px-3 py-2 focus:outline-none resize-none"
              style={{ background: 'var(--surface-2, #EEF3FB)', border: '1px solid var(--border, #D1D9EC)', color: 'var(--text, #0F1F3D)' }}
            />
          </div>

          {/* Mood */}
          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-muted, #4A5568)' }}>
              How are you feeling about this task?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { value: 'frustrated', emoji: '😤', label: 'Frustrated' },
                { value: 'neutral', emoji: '😐', label: 'Neutral' },
                { value: 'good', emoji: '😊', label: 'Good' },
                { value: 'excited', emoji: '🚀', label: 'Excited' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMood(option.value)}
                  className="p-3 rounded-lg transition-colors text-center"
                  style={
                    mood === option.value
                      ? { border: '2px solid var(--royal, #2451A3)', background: 'var(--royal-light, #D6E4F7)', color: 'var(--royal, #2451A3)' }
                      : { border: '1px solid var(--border, #D1D9EC)', background: 'var(--surface-2, #EEF3FB)', color: 'var(--text-muted, #4A5568)' }
                  }
                >
                  <div className="text-2xl mb-1">{option.emoji}</div>
                  <div className="text-xs">{option.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-6" style={{ borderTop: '1px solid var(--border, #D1D9EC)' }}>
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 transition-colors disabled:opacity-50 rounded-lg"
            style={{ color: 'var(--text-muted, #4A5568)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="text-white py-2 px-6 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            style={{ background: 'var(--royal, #2451A3)' }}
            onMouseEnter={e => !loading && (e.currentTarget.style.background = 'var(--royal-dark, #1B3D7A)')}
            onMouseLeave={e => !loading && (e.currentTarget.style.background = 'var(--royal, #2451A3)')}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Save Check-in</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Enhanced Progress Bar Component
const ProgressBar = ({ progress, className = "", size = "default", showLabel = true, ariaLabel }) => {
  const sizeClasses = {
    small: "h-1",
    default: "h-2", 
    large: "h-4"
  };

  const progressValue = Math.min(Math.max(safeNumber(progress, 0), 0), 100);

  return (
    <div className={`w-full rounded-full ${sizeClasses[size] || sizeClasses.default} ${className}`} style={{ background: 'var(--royal-light, #D6E4F7)' }}>
      <div
        className="rounded-full transition-all duration-500"
        style={{ width: `${progressValue}%`, height: '100%', background: progressValue >= 100 ? 'var(--gold, #C9973C)' : 'var(--royal, #2451A3)' }}
        role="progressbar"
        aria-valuenow={progressValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={safeString(ariaLabel, `Progress: ${progressValue}%`)}
      />
      {showLabel && size === "large" && (
        <div className="flex justify-end mt-1">
          <span className="text-xs" style={{ color: 'var(--text-muted, #4A5568)' }}>{progressValue}%</span>
        </div>
      )}
    </div>
  );
};

// Main Progress Tracker Dashboard Component
const ProgressTracker = ({ 
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
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

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

  const handleCheckInClick = (task) => {
    setSelectedTask(task);
    setCheckInModalOpen(true);
  };

  const handleCheckInSubmit = async (checkInData) => {
    try {
      if (onDailyCheckIn) {
        await onDailyCheckIn(checkInData);
      }
    } catch (error) {
      safeLog('Check-in submission error:', error.message);
      throw error; // Re-throw to let modal handle the error
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'transparent' }}>
        <div className="text-center" role="status" aria-label="Loading progress analytics">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--royal, #2451A3)' }}></div>
          <div className="text-xl font-semibold" style={{ color: 'var(--text, #0F1F3D)' }}>Loading Progress Analytics...</div>
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
              <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text, #0F1F3D)' }}>Progress Analytics</h1>
              <p style={{ color: 'var(--text-muted, #4A5568)' }}>Track your daily progress and performance</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading || Object.values(actionLoading || {}).some(Boolean)}
              className="text-white py-2 px-4 rounded-lg transition-colors flex items-center space-x-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'var(--royal, #2451A3)' }}
              onMouseEnter={e => !loading && (e.currentTarget.style.background = 'var(--royal-dark, #1B3D7A)')}
              onMouseLeave={e => !loading && (e.currentTarget.style.background = 'var(--royal, #2451A3)')}
              aria-describedby="refresh-help"
            >
              <TrendingUp className="w-4 h-4" aria-hidden="true" />
              <span>{loading ? 'Refreshing...' : 'Refresh Data'}</span>
            </button>
          </div>
        </header>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="p-4 rounded-lg shadow-sm" style={{ background: 'var(--surface, #FFFFFF)', border: '1px solid var(--border, #D1D9EC)' }}>
            <div className="text-3xl font-bold" style={{ color: 'var(--royal, #2451A3)' }} role="img" aria-label={`${stats.totalTasks} total tasks`}>
              {stats.totalTasks}
            </div>
            <div className="text-sm mt-1" style={{ color: 'var(--text-muted, #4A5568)' }}>{t('dashboard.totalTasks')}</div>
          </div>
          <div className="p-4 rounded-lg shadow-sm" style={{ background: 'var(--surface, #FFFFFF)', border: '1px solid var(--border, #D1D9EC)' }}>
            <div className="text-3xl font-bold text-green-600" role="img" aria-label={`${stats.completedTasks} completed tasks`}>
              {stats.completedTasks}
            </div>
            <div className="text-sm mt-1" style={{ color: 'var(--text-muted, #4A5568)' }}>{t('dashboard.completed')}</div>
          </div>
          <div className="p-4 rounded-lg shadow-sm" style={{ background: 'var(--surface, #FFFFFF)', border: '1px solid var(--border, #D1D9EC)' }}>
            <div className="text-3xl font-bold" style={{ color: 'var(--royal, #2451A3)' }} role="img" aria-label={`${stats.inProgressTasks} in progress tasks`}>
              {stats.inProgressTasks}
            </div>
            <div className="text-sm mt-1" style={{ color: 'var(--text-muted, #4A5568)' }}>{t('dashboard.inProgress')}</div>
          </div>
          <div className="p-4 rounded-lg shadow-sm" style={{ background: 'var(--gold-light, #F9EDCB)', border: '2px solid var(--gold, #C9973C)' }}>
            <div className="text-3xl font-bold" style={{ color: 'var(--gold-dark, #9E6E1C)' }} role="img" aria-label={`${stats.totalHours.toFixed(1)} total hours`}>
              {stats.totalHours.toFixed(1)}h
            </div>
            <div className="text-sm mt-1" style={{ color: 'var(--text-muted, #4A5568)' }}>{t('dashboard.timeTracked')}</div>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="p-4 rounded-lg mb-8 shadow-sm" style={{ background: 'var(--surface, #FFFFFF)', border: '1px solid var(--border, #D1D9EC)' }}>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted, #4A5568)' }} />
              <input
                id="task-search"
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg pl-10 pr-3 py-2 focus:outline-none transition-all"
                style={{ background: 'var(--surface-2, #EEF3FB)', border: '1px solid var(--border, #D1D9EC)', color: 'var(--text, #0F1F3D)' }}
                aria-describedby="search-help"
              />
              <p id="search-help" className="text-xs mt-1" style={{ color: 'var(--text-muted, #4A5568)' }}>
                {t('dashboard.searchHelp')}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4" style={{ color: 'var(--text-muted, #4A5568)' }} />
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-lg px-3 py-2 focus:outline-none"
                style={{ background: 'var(--surface-2, #EEF3FB)', border: '1px solid var(--border, #D1D9EC)', color: 'var(--text, #0F1F3D)' }}
              >
                <option value="progress">{t('dashboard.sortByProgress')}</option>
                <option value="title">{t('dashboard.sortByTitle')}</option>
                <option value="lastWorked">{t('dashboard.sortByLastWorked')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Average Progress */}
        <div className="p-6 rounded-lg mb-8 shadow-sm" style={{ background: 'var(--surface, #FFFFFF)', border: '1px solid var(--border, #D1D9EC)' }}>
          <h2 className="text-lg font-semibold mb-4 flex items-center" style={{ color: 'var(--text, #0F1F3D)' }}>
            <BarChart3 className="w-5 h-5 mr-2" style={{ color: 'var(--royal, #2451A3)' }} />
            {t('dashboard.progressOverview')}
          </h2>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <ProgressBar
                progress={stats.averageProgress}
                size="large"
                ariaLabel={`${t('dashboard.averageProgressAcrossAllTasks')}: ${stats.averageProgress.toFixed(1)}%`}
              />
            </div>
            <div className="text-2xl font-bold" style={{ color: 'var(--royal, #2451A3)' }}>{stats.averageProgress.toFixed(1)}%</div>
          </div>
        </div>

        {/* Task Progress List */}
        <div className="p-6 rounded-lg shadow-sm" style={{ background: 'var(--surface, #FFFFFF)', border: '1px solid var(--border, #D1D9EC)' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center" style={{ color: 'var(--text, #0F1F3D)' }}>
              <Activity className="w-5 h-5 mr-2" style={{ color: 'var(--royal, #2451A3)' }} />
              {t('dashboard.taskProgress')}
            </h2>
            <span className="text-sm" style={{ color: 'var(--text-muted, #4A5568)' }}>
              {t('dashboard.showingTasks', { count: filteredTasks.length, total: safeTasks.length })}
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
                  <div key={taskId} className="p-4 rounded-lg transition-colors" style={{ background: 'var(--surface-2, #EEF3FB)', border: '1px solid var(--border, #D1D9EC)' }}>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium" style={{ color: 'var(--text, #0F1F3D)' }}>{taskTitle}</h3>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 rounded-full text-xs font-medium"
                          style={
                            taskProgress === 100
                              ? { background: 'var(--gold-light, #F9EDCB)', color: 'var(--gold-dark, #9E6E1C)' }
                              : taskProgress >= 75
                              ? { background: 'var(--royal-light, #D6E4F7)', color: 'var(--royal, #2451A3)' }
                              : taskProgress >= 25
                              ? { background: '#FEF9C3', color: '#854D0E' }
                              : { background: '#FEE2E2', color: '#B91C1C' }
                          }>
                          {taskProgress === 100 ? 'Complete' :
                           taskProgress >= 75 ? 'Nearly Done' :
                           taskProgress >= 25 ? 'In Progress' :
                           'Just Started'}
                        </span>
                        <button
                          onClick={() => handleCheckInClick(task)}
                          disabled={actionLoading?.dailyCheckIn}
                          className="text-sm disabled:opacity-50 focus:outline-none rounded px-2 py-1 transition-colors font-medium"
                          style={{ color: 'var(--royal, #2451A3)' }}
                          aria-label={`${t('dashboard.openDailyCheckInFor', { taskTitle: taskTitle })}`}
                        >
                          {t('dashboard.checkIn')}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span style={{ color: 'var(--text-muted, #4A5568)' }}>{t('dashboard.progress')}</span>
                          <span className="font-medium" style={{ color: 'var(--royal, #2451A3)' }}>{taskProgress}%</span>
                        </div>
                        <ProgressBar
                          progress={taskProgress}
                          ariaLabel={`${taskTitle} ${t('dashboard.progress')}: ${taskProgress}%`}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs" style={{ color: 'var(--text-muted, #4A5568)' }}>
                        {taskTotalHours > 0 && (
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" style={{ color: 'var(--gold-dark, #9E6E1C)' }} />
                            <span>{t('dashboard.timeLogged')}: {taskTotalHours.toFixed(1)} {t('dashboard.hours')}</span>
                          </div>
                        )}
                        {taskLastWorkedOn && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" style={{ color: 'var(--royal, #2451A3)' }} />
                            <span>{t('dashboard.lastWorked')}: {safeFormatDate(taskLastWorkedOn)}</span>
                          </div>
                        )}
                      </div>

                      {taskDescription && (
                        <p className="text-sm p-2 rounded" style={{ color: 'var(--text-muted, #4A5568)', background: 'var(--surface, #FFFFFF)' }}>
                          {taskDescription}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12" style={{ color: 'var(--text-muted, #4A5568)' }}>
              <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-40" style={{ color: 'var(--royal, #2451A3)' }} aria-hidden="true" />
              <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text, #0F1F3D)' }}>{t('dashboard.noTasksFound')}</h3>
              <p className="text-sm">
                {searchTerm
                  ? `${t('dashboard.noTasksMatchSearch', { searchTerm: searchTerm })}`
                  : `${t('dashboard.noTasksAvailable')}. ${t('dashboard.createTasks')}`
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Daily Check-in Modal */}
      <DailyCheckInModal
        isOpen={checkInModalOpen}
        onClose={() => {
          setCheckInModalOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onSubmit={handleCheckInSubmit}
        loading={actionLoading?.dailyCheckIn}
      />
    </div>
  );
};

// Export the main component as default
export default ProgressTracker;

// Add these lines for named exports:
export { DailyCheckInModal, ProgressBar };