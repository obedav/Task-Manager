// services/taskService.js - Production Ready with Environment Variables and Error Handling
import apiService from './api'

// Production Logger - Only logs in development
class Logger {
  constructor() {
    this.isDevelopment = import.meta.env.DEV
    this.isProduction = import.meta.env.VITE_ENVIRONMENT === 'production'
  }

  log(...args) {
    if (this.isDevelopment) {
      console.log('[TaskService]', ...args)
    }
  }

  error(...args) {
    // Always log errors, but with user-friendly messages in production
    if (this.isProduction) {
      console.error('[TaskService Error]', ...args)
    } else {
      console.error('[TaskService]', ...args)
    }
  }

  warn(...args) {
    if (this.isDevelopment) {
      console.warn('[TaskService]', ...args)
    }
  }
}

const logger = new Logger()

// Error Handler for User-Friendly Messages
class ErrorHandler {
  static getErrorMessage(error, action = 'perform this action') {
    const errorMessages = {
      'Network Error': 'Unable to connect to our servers. Please check your internet connection.',
      'Unauthorized': 'Your session has expired. Please log in again.',
      'Forbidden': 'You don\'t have permission to perform this action.',
      'Not Found': 'The requested resource was not found.',
      'Internal Server Error': 'Something went wrong on our end. Please try again later.',
      'Bad Request': 'There was an issue with your request. Please check your input.',
      'Conflict': 'This action conflicts with existing data. Please refresh and try again.',
      'Timeout': 'The request timed out. Please try again.',
      'Service Unavailable': 'Our service is temporarily unavailable. Please try again in a few minutes.'
    }

    let message = `Unable to ${action}. Please try again.`
    
    if (error?.message) {
      for (const [key, friendlyMessage] of Object.entries(errorMessages)) {
        if (error.message.includes(key) || error.message.includes(key.toLowerCase())) {
          message = friendlyMessage
          break
        }
      }
    }

    return {
      title: 'Action Failed',
      message,
      technical: import.meta.env.DEV ? error?.message : undefined,
      shouldRetry: !['Unauthorized', 'Forbidden', 'Not Found'].some(err => 
        error?.message?.includes(err) || error?.message?.includes(err.toLowerCase())
      )
    }
  }
}

class TaskService {
  constructor() {
    this.taskCache = new Map()
    this.cacheExpiry = 5 * 60 * 1000 // 5 minutes
    this.retryAttempts = 3
    this.retryDelay = 1000
    
    logger.log('TaskService initialized', {
      environment: import.meta.env.VITE_ENVIRONMENT,
      apiUrl: import.meta.env.VITE_API_URL
    })
  }

  // Retry wrapper for API calls
  async withRetry(operation, actionName) {
    let lastError
    
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error
        logger.warn(`Attempt ${attempt} failed for ${actionName}:`, error.message)
        
        // Don't retry for client errors (4xx)
        if (error.message?.includes('4')) {
          break
        }
        
        if (attempt < this.retryAttempts) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt))
        }
      }
    }
    
    throw lastError
  }

  // EXISTING METHODS (Enhanced with Production Error Handling)
  async getAllTasks(filters = {}) {
    try {
      logger.log('Getting all tasks with filters:', filters)
      
      const cacheKey = JSON.stringify(filters)
      const cached = this.taskCache.get(cacheKey)
      
      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
        logger.log('Returning cached tasks')
        return cached.data
      }

      const result = await this.withRetry(async () => {
        const response = await apiService.getWithQuery('/tasks', filters)
        const tasks = response.tasks || response.data || response || []
        
        return {
          success: true,
          tasks: Array.isArray(tasks) ? tasks : [],
          total: response.total || tasks.length,
          message: response.message || 'Tasks retrieved successfully'
        }
      }, 'getAllTasks')
      
      this.taskCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      })
      
      logger.log('Tasks loaded successfully')
      return result
    } catch (error) {
      logger.error('Failed to get tasks:', error)
      const errorInfo = ErrorHandler.getErrorMessage(error, 'load tasks')
      throw new Error(errorInfo.message)
    }
  }

  async getTask(taskId) {
    try {
      logger.log('Getting task:', taskId)
      
      if (!taskId) {
        throw new Error('Task ID is required')
      }
      
      const cacheKey = `task_${taskId}`
      const cached = this.taskCache.get(cacheKey)
      
      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
        logger.log('Returning cached task')
        return cached.data
      }

      const result = await this.withRetry(async () => {
        const response = await apiService.get(`/tasks/${taskId}`)
        const task = response.task || response.data || response
        
        return {
          success: true,
          task,
          message: response.message || 'Task retrieved successfully'
        }
      }, 'getTask')
      
      this.taskCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      })
      
      logger.log('Task loaded successfully')
      return result
    } catch (error) {
      logger.error('Failed to get task:', error)
      const errorInfo = ErrorHandler.getErrorMessage(error, 'load task')
      throw new Error(errorInfo.message)
    }
  }

  async createTask(taskData) {
    try {
      logger.log('Creating task')
      
      if (!taskData?.title?.trim()) {
        throw new Error('Task title is required')
      }
      
      // Add default progress tracking fields
      const enhancedTaskData = {
        ...taskData,
        title: taskData.title.trim(),
        progress: 0,
        timeEntries: [],
        dailyUpdates: [],
        progressHistory: [],
        totalHours: 0,
        createdAt: new Date().toISOString()
      }
      
      const result = await this.withRetry(async () => {
        const response = await apiService.post('/tasks', enhancedTaskData)
        const task = response.task || response.data || response
        
        return {
          success: true,
          task,
          message: response.message || 'Task created successfully'
        }
      }, 'createTask')
      
      this.invalidateCache()
      
      logger.log('Task created successfully')
      return result
    } catch (error) {
      logger.error('Failed to create task:', error)
      const errorInfo = ErrorHandler.getErrorMessage(error, 'create task')
      throw new Error(errorInfo.message)
    }
  }

  async updateTask(taskId, taskData) {
    try {
      logger.log('Updating task:', taskId)
      
      if (!taskId) {
        throw new Error('Task ID is required')
      }
      
      const sanitizedData = {
        ...taskData,
        updatedAt: new Date().toISOString()
      }
      
      const result = await this.withRetry(async () => {
        const response = await apiService.put(`/tasks/${taskId}`, sanitizedData)
        const task = response.task || response.data || response
        
        return {
          success: true,
          task,
          message: response.message || 'Task updated successfully'
        }
      }, 'updateTask')
      
      this.invalidateTaskCache(taskId)
      
      logger.log('Task updated successfully')
      return result
    } catch (error) {
      logger.error('Failed to update task:', error)
      const errorInfo = ErrorHandler.getErrorMessage(error, 'update task')
      throw new Error(errorInfo.message)
    }
  }

  async deleteTask(taskId) {
    try {
      logger.log('Deleting task:', taskId)
      
      if (!taskId) {
        throw new Error('Task ID is required')
      }
      
      const result = await this.withRetry(async () => {
        const response = await apiService.delete(`/tasks/${taskId}`)
        return {
          success: true,
          message: response.message || 'Task deleted successfully'
        }
      }, 'deleteTask')
      
      this.invalidateCache()
      
      logger.log('Task deleted successfully')
      return result
    } catch (error) {
      logger.error('Failed to delete task:', error)
      const errorInfo = ErrorHandler.getErrorMessage(error, 'delete task')
      throw new Error(errorInfo.message)
    }
  }

  async updateTaskStatus(taskId, status) {
    try {
      logger.log('Updating task status:', taskId, status)
      
      if (!taskId || !status) {
        throw new Error('Task ID and status are required')
      }
      
      const validStatuses = ['pending', 'in-progress', 'completed', 'cancelled']
      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`)
      }
      
      const updateData = { 
        status,
        updatedAt: new Date().toISOString()
      }
      
      if (status === 'completed') {
        updateData.completedAt = new Date().toISOString()
        updateData.progress = 100
      }
      
      const result = await this.withRetry(async () => {
        const response = await apiService.put(`/tasks/${taskId}`, updateData)
        const task = response.task || response.data || response
        
        return {
          success: true,
          task,
          message: response.message || 'Task status updated successfully'
        }
      }, 'updateTaskStatus')
      
      this.invalidateTaskCache(taskId)
      
      logger.log('Task status updated successfully')
      return result
    } catch (error) {
      logger.error('Failed to update task status:', error)
      const errorInfo = ErrorHandler.getErrorMessage(error, 'update task status')
      throw new Error(errorInfo.message)
    }
  }

  // PROGRESS TRACKING METHODS (Enhanced)
  async updateProgress(taskId, progress, note = '') {
    try {
      logger.log('Updating task progress:', taskId, progress, '%')
      
      if (!taskId) {
        throw new Error('Task ID is required')
      }
      
      const validatedProgress = this.validateProgress(progress)
      
      // Try the new progress endpoint first
      try {
        const result = await this.withRetry(async () => {
          const response = await apiService.patch(`/tasks/${taskId}/progress`, { 
            progress: validatedProgress, 
            note: String(note || '').trim()
          })
          const task = response.task || response.data || response
          
          return {
            success: true,
            task,
            message: response.message || 'Progress updated successfully'
          }
        }, 'updateProgress')
        
        this.invalidateTaskCache(taskId)
        logger.log('Progress updated via new endpoint')
        return result
      } catch (error) {
        // Fallback to regular update endpoint
        logger.warn('Progress endpoint unavailable, using fallback')
        
        const updateData = { 
          progress: validatedProgress,
          lastWorkedOn: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        const result = await this.withRetry(async () => {
          const response = await apiService.put(`/tasks/${taskId}`, updateData)
          const task = response.task || response.data || response
          
          return {
            success: true,
            task,
            message: 'Progress updated successfully'
          }
        }, 'updateProgress_fallback')
        
        this.invalidateTaskCache(taskId)
        logger.log('Progress updated via fallback')
        return result
      }
    } catch (error) {
      logger.error('Failed to update progress:', error)
      const errorInfo = ErrorHandler.getErrorMessage(error, 'update progress')
      throw new Error(errorInfo.message)
    }
  }

  async addTimeEntry(taskId, hours, description = '') {
    try {
      logger.log('Adding time entry:', taskId, hours, 'hours')
      
      if (!taskId) {
        throw new Error('Task ID is required')
      }
      
      const validatedHours = this.validateHours(hours)
      const sanitizedDescription = String(description || '').trim()
      
      // Try the new time endpoint first
      try {
        const result = await this.withRetry(async () => {
          const response = await apiService.post(`/tasks/${taskId}/time`, {
            hours: validatedHours,
            description: sanitizedDescription
          })
          const task = response.task || response.data || response
          
          return {
            success: true,
            task,
            timeEntry: {
              hours: validatedHours,
              description: sanitizedDescription,
              date: new Date().toISOString()
            },
            message: response.message || 'Time entry added successfully'
          }
        }, 'addTimeEntry')
        
        this.invalidateTaskCache(taskId)
        logger.log('Time entry added via new endpoint')
        return result
      } catch (error) {
        // Fallback to regular update endpoint
        logger.warn('Time endpoint unavailable, using fallback')
        
        // Get current task to update time entries
        const currentTask = await this.getTask(taskId)
        const task = currentTask.task
        
        const timeEntries = Array.isArray(task.timeEntries) ? [...task.timeEntries] : []
        const newEntry = {
          hours: validatedHours,
          description: sanitizedDescription,
          date: new Date().toISOString()
        }
        timeEntries.push(newEntry)
        
        const totalHours = timeEntries.reduce((sum, entry) => sum + (entry.hours || 0), 0)
        
        const updateData = {
          timeEntries,
          totalHours,
          lastWorkedOn: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        const result = await this.withRetry(async () => {
          const response = await apiService.put(`/tasks/${taskId}`, updateData)
          const updatedTask = response.task || response.data || response
          
          return {
            success: true,
            task: updatedTask,
            timeEntry: newEntry,
            message: 'Time entry added successfully'
          }
        }, 'addTimeEntry_fallback')
        
        this.invalidateTaskCache(taskId)
        logger.log('Time entry added via fallback')
        return result
      }
    } catch (error) {
      logger.error('Failed to add time entry:', error)
      const errorInfo = ErrorHandler.getErrorMessage(error, 'add time entry')
      throw new Error(errorInfo.message)
    }
  }

  async addDailyUpdate(taskId, updateData) {
    try {
      logger.log('Adding daily update:', taskId)
      
      if (!taskId) {
        throw new Error('Task ID is required')
      }
      
      const sanitizedData = this.sanitizeDailyUpdateData(updateData)
      
      // Try the new daily update endpoint first
      try {
        const result = await this.withRetry(async () => {
          const response = await apiService.post(`/tasks/${taskId}/daily-update`, sanitizedData)
          const task = response.task || response.data || response
          
          return {
            success: true,
            task,
            dailyUpdate: sanitizedData,
            message: response.message || 'Daily update added successfully'
          }
        }, 'addDailyUpdate')
        
        this.invalidateTaskCache(taskId)
        logger.log('Daily update added via new endpoint')
        return result
      } catch (error) {
        // Fallback to regular update endpoint
        logger.warn('Daily update endpoint unavailable, using fallback')
        
        // Get current task to update daily updates
        const currentTask = await this.getTask(taskId)
        const task = currentTask.task
        
        const dailyUpdates = Array.isArray(task.dailyUpdates) ? [...task.dailyUpdates] : []
        const newUpdate = {
          ...sanitizedData,
          date: new Date().toISOString()
        }
        dailyUpdates.push(newUpdate)
        
        const taskUpdateData = {
          dailyUpdates,
          lastWorkedOn: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        // Update progress if provided
        if (sanitizedData.progress !== undefined) {
          taskUpdateData.progress = sanitizedData.progress
        }
        
        const result = await this.withRetry(async () => {
          const response = await apiService.put(`/tasks/${taskId}`, taskUpdateData)
          const updatedTask = response.task || response.data || response
          
          return {
            success: true,
            task: updatedTask,
            dailyUpdate: newUpdate,
            message: 'Daily update added successfully'
          }
        }, 'addDailyUpdate_fallback')
        
        this.invalidateTaskCache(taskId)
        logger.log('Daily update added via fallback')
        return result
      }
    } catch (error) {
      logger.error('Failed to add daily update:', error)
      const errorInfo = ErrorHandler.getErrorMessage(error, 'add daily update')
      throw new Error(errorInfo.message)
    }
  }

  async getAnalytics() {
    try {
      logger.log('Getting progress analytics')
      
      const cacheKey = 'task_analytics'
      const cached = this.taskCache.get(cacheKey)
      
      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
        logger.log('Returning cached analytics')
        return cached.data
      }

      // Try the new analytics endpoint first
      try {
        const result = await this.withRetry(async () => {
          const response = await apiService.get('/tasks/analytics')
          const analytics = response.analytics || response.data || response
          
          return {
            success: true,
            analytics,
            message: response.message || 'Analytics retrieved successfully'
          }
        }, 'getAnalytics')
        
        this.taskCache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        })
        
        logger.log('Analytics loaded via new endpoint')
        return result
      } catch (error) {
        // Fallback to calculating from tasks
        logger.warn('Analytics endpoint unavailable, calculating from tasks')
        
        const tasksResponse = await this.getAllTasks()
        const tasks = tasksResponse.tasks || []
        
        const analytics = this.calculateAnalyticsFromTasks(tasks)
        
        const result = {
          success: true,
          analytics,
          message: 'Analytics calculated from tasks'
        }
        
        this.taskCache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        })
        
        logger.log('Analytics calculated via fallback')
        return result
      }
    } catch (error) {
      logger.error('Failed to get analytics:', error)
      
      // Return default analytics if everything fails
      const defaultAnalytics = {
        success: true,
        analytics: this.getDefaultAnalytics(),
        message: 'Using default analytics'
      }
      
      logger.warn('Using default analytics due to complete failure')
      return defaultAnalytics
    }
  }

  // UTILITY METHODS (Enhanced)
  validateProgress(progress) {
    const num = Number(progress)
    if (isNaN(num) || num < 0 || num > 100) {
      throw new Error('Progress must be a number between 0 and 100')
    }
    return num
  }

  validateHours(hours) {
    const num = Number(hours)
    if (isNaN(num) || num <= 0 || num > 24) {
      throw new Error('Hours must be a number between 0.1 and 24')
    }
    return num
  }

  sanitizeDailyUpdateData(updateData) {
    return {
      progress: updateData.progress !== undefined ? this.validateProgress(updateData.progress) : undefined,
      workedOn: Boolean(updateData.workedOn),
      accomplishments: Array.isArray(updateData.accomplishments) 
        ? updateData.accomplishments.filter(a => a && String(a).trim()).map(a => String(a).trim()) 
        : [],
      blockers: Array.isArray(updateData.blockers) 
        ? updateData.blockers.filter(b => b && String(b).trim()).map(b => String(b).trim()) 
        : [],
      nextSteps: Array.isArray(updateData.nextSteps) 
        ? updateData.nextSteps.filter(n => n && String(n).trim()).map(n => String(n).trim()) 
        : [],
      mood: ['frustrated', 'blocked', 'neutral', 'productive', 'creative', 'satisfied', 'excited'].includes(updateData.mood) 
        ? updateData.mood 
        : 'neutral'
    }
  }

  getDefaultAnalytics() {
    return {
      totalTasks: 0,
      completedTasks: 0,
      inProgressTasks: 0,
      notStartedTasks: 0,
      totalHours: 0,
      averageProgress: 0,
      progressDistribution: {
        notStarted: 0,
        early: 0,
        quarter: 0,
        half: 0,
        mostlyDone: 0,
        completed: 0
      },
      recentActivity: [],
      weeklyProgress: []
    }
  }

  calculateAnalyticsFromTasks(tasks) {
    if (!Array.isArray(tasks)) {
      return this.getDefaultAnalytics()
    }
    
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(t => t.progress === 100 || t.status === 'completed').length
    const inProgressTasks = tasks.filter(t => t.progress > 0 && t.progress < 100).length
    const notStartedTasks = tasks.filter(t => (t.progress || 0) === 0).length
    const totalHours = tasks.reduce((sum, task) => sum + (task.totalHours || 0), 0)
    const averageProgress = totalTasks > 0 
      ? tasks.reduce((sum, task) => sum + (task.progress || 0), 0) / totalTasks 
      : 0

    const progressDistribution = {
      notStarted: tasks.filter(t => (t.progress || 0) === 0).length,
      early: tasks.filter(t => (t.progress || 0) > 0 && (t.progress || 0) <= 25).length,
      quarter: tasks.filter(t => (t.progress || 0) > 25 && (t.progress || 0) <= 50).length,
      half: tasks.filter(t => (t.progress || 0) > 50 && (t.progress || 0) <= 75).length,
      mostlyDone: tasks.filter(t => (t.progress || 0) > 75 && (t.progress || 0) < 100).length,
      completed: tasks.filter(t => (t.progress || 0) === 100).length
    }

    const recentActivity = tasks
      .filter(t => t.lastWorkedOn)
      .sort((a, b) => new Date(b.lastWorkedOn) - new Date(a.lastWorkedOn))
      .slice(0, 10)
      .map(t => ({
        taskId: t.id || t._id,
        title: t.title,
        lastWorkedOn: t.lastWorkedOn,
        progress: t.progress || 0,
        totalHours: t.totalHours || 0
      }))

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      notStartedTasks,
      totalHours,
      averageProgress,
      progressDistribution,
      recentActivity,
      weeklyProgress: []
    }
  }

  // CACHE MANAGEMENT
  invalidateCache() {
    logger.log('Invalidating all cache')
    this.taskCache.clear()
  }

  invalidateTaskCache(taskId) {
    logger.log('Invalidating cache for task:', taskId)
    const keysToDelete = []
    for (const key of this.taskCache.keys()) {
      if (key.includes(taskId) || key.includes('task_stats') || key.includes('task_analytics')) {
        keysToDelete.push(key)
      }
    }
    keysToDelete.forEach(key => this.taskCache.delete(key))
  }

  // CONNECTION TEST
  async testConnection() {
    try {
      logger.log('Testing backend connection...')
      const response = await apiService.get('/tasks/health')
      logger.log('Backend connection successful')
      return { success: true, data: response }
    } catch (error) {
      logger.error('Backend connection failed:', error)
      return { 
        success: false, 
        error: 'Cannot connect to task service. Please check your internet connection.',
        details: import.meta.env.DEV ? error.message : undefined
      }
    }
  }
}

// Create and export singleton instance
const taskService = new TaskService()

// Test connection on startup in development only
if (import.meta.env.DEV) {
  taskService.testConnection().then(result => {
    if (result.success) {
      logger.log('✅ Task service connected successfully')
    } else {
      logger.warn('⚠️ Task service connection failed:', result.error)
    }
  })
}

export default taskService