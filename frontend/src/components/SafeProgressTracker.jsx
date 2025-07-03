// Fixed SafeProgressTracker.jsx - Ensuring proper exports
import React, { useState, useRef, useEffect } from 'react'
import { Clock, TrendingUp, Calendar, Target, Plus, Edit3, X, ChevronDown, ChevronRight, Timer, BarChart3, PieChart, Activity, CheckCircle, AlertTriangle, Search, Filter } from 'lucide-react'

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-xl font-bold text-white">Daily Check-in</h2>
            <p className="text-gray-400 text-sm">
              {safeString(task?.title, 'Unknown Task')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-slate-700 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Progress Update */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Update Progress
            </label>
            <div className="space-y-3">
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, rgb(139, 92, 246) 0%, rgb(236, 72, 153) ${progress}%, rgb(55, 65, 81) ${progress}%, rgb(55, 65, 81) 100%)`
                }}
              />
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">0%</span>
                <span className="text-white font-medium">{progress}%</span>
                <span className="text-gray-400">100%</span>
              </div>
            </div>
          </div>

          {/* Hours Worked */}
          <div>
            <label htmlFor="hours-worked" className="block text-sm font-medium text-gray-300 mb-2">
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
              className={`w-full bg-slate-700 border rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                errors.hoursWorked ? 'border-red-500' : 'border-slate-600'
              }`}
            />
            {errors.hoursWorked && (
              <p className="text-red-400 text-xs mt-1">{errors.hoursWorked}</p>
            )}
          </div>

          {/* Accomplishments */}
          <div>
            <label htmlFor="accomplishments" className="block text-sm font-medium text-gray-300 mb-2">
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
              className={`w-full bg-slate-700 border rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none ${
                errors.accomplishments ? 'border-red-500' : 'border-slate-600'
              }`}
              required
            />
            {errors.accomplishments && (
              <p className="text-red-400 text-xs mt-1">{errors.accomplishments}</p>
            )}
          </div>

          {/* Challenges */}
          <div>
            <label htmlFor="challenges" className="block text-sm font-medium text-gray-300 mb-2">
              Any challenges or blockers? (Optional)
            </label>
            <textarea
              id="challenges"
              value={challenges}
              onChange={(e) => setChallenges(e.target.value)}
              placeholder="What obstacles did you encounter?"
              rows={2}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Next Steps */}
          <div>
            <label htmlFor="next-steps" className="block text-sm font-medium text-gray-300 mb-2">
              What's next? (Optional)
            </label>
            <textarea
              id="next-steps"
              value={nextSteps}
              onChange={(e) => setNextSteps(e.target.value)}
              placeholder="What will you work on next?"
              rows={2}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Mood */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
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
                  className={`p-3 rounded-lg border transition-colors text-center ${
                    mood === option.value
                      ? 'border-purple-500 bg-purple-500/20 text-white'
                      : 'border-slate-600 bg-slate-700/50 text-gray-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  <div className="text-2xl mb-1">{option.emoji}</div>
                  <div className="text-xs">{option.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-slate-700">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-purple-500 hover:bg-purple-600 disabled:bg-purple-700 disabled:cursor-not-allowed text-white py-2 px-6 rounded-lg transition-colors flex items-center space-x-2"
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
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                id="task-search"
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-10 pr-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                aria-describedby="search-help"
              />
              <p id="search-help" className="text-xs text-gray-500 mt-1">
                Search by task title or description
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
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
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Average Progress
          </h2>
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
            <h2 className="text-lg font-semibold text-white flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Task Progress
            </h2>
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
                  <div key={taskId} className="p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/40 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-white">{taskTitle}</h3>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          taskProgress === 100 ? 'bg-green-500/20 text-green-400' :
                          taskProgress >= 75 ? 'bg-blue-500/20 text-blue-400' :
                          taskProgress >= 25 ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {taskProgress === 100 ? 'Complete' :
                           taskProgress >= 75 ? 'Nearly Done' :
                           taskProgress >= 25 ? 'In Progress' :
                           'Just Started'}
                        </span>
                        <button
                          onClick={() => handleCheckInClick(task)}
                          disabled={actionLoading?.dailyCheckIn}
                          className="text-purple-400 hover:text-purple-300 text-sm disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded px-2 py-1 transition-colors"
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
                          <span className="text-white font-medium">{taskProgress}%</span>
                        </div>
                        <ProgressBar 
                          progress={taskProgress} 
                          ariaLabel={`${taskTitle} progress: ${taskProgress}%`}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-400">
                        {taskTotalHours > 0 && (
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>Time logged: {taskTotalHours.toFixed(1)} hours</span>
                          </div>
                        )}
                        {taskLastWorkedOn && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>Last worked: {safeFormatDate(taskLastWorkedOn)}</span>
                          </div>
                        )}
                      </div>
                      
                      {taskDescription && (
                        <p className="text-gray-300 text-sm bg-slate-800/30 p-2 rounded">
                          {taskDescription}
                        </p>
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