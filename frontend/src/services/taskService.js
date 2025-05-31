// services/taskService.js - Enhanced with progress tracking (compatible with existing routes)
import apiService from './api'

class TaskService {
  constructor() {
    this.taskCache = new Map()
    this.cacheExpiry = 5 * 60 * 1000 // 5 minutes
    console.log('Enhanced TaskService initialized with progress tracking')
  }

  // EXISTING METHODS (Enhanced)
  async getAllTasks(filters = {}) {
    try {
      console.log('Getting all tasks with filters:', filters)
      
      const cacheKey = JSON.stringify(filters)
      const cached = this.taskCache.get(cacheKey)
      
      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
        console.log('Returning cached tasks')
        return cached.data
      }

      const response = await apiService.getWithQuery('/tasks', filters)
      
      const tasks = response.tasks || response.data || response || []
      const result = {
        success: true,
        tasks: Array.isArray(tasks) ? tasks : [],
        total: response.total || tasks.length,
        message: response.message || 'Tasks retrieved successfully'
      }
      
      this.taskCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      })
      
      console.log('Tasks loaded:', result)
      return result
    } catch (error) {
      console.error('Failed to get tasks:', error)
      throw new Error(error.message || 'Failed to fetch tasks')
    }
  }

  async getTask(taskId) {
    try {
      console.log('Getting task:', taskId)
      
      const cacheKey = `task_${taskId}`
      const cached = this.taskCache.get(cacheKey)
      
      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
        console.log('Returning cached task')
        return cached.data
      }

      const response = await apiService.get(`/tasks/${taskId}`)
      const task = response.task || response.data || response
      
      const result = {
        success: true,
        task,
        message: response.message || 'Task retrieved successfully'
      }
      
      this.taskCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      })
      
      console.log('Task loaded:', result)
      return result
    } catch (error) {
      console.error('Failed to get task:', error)
      throw new Error(error.message || 'Failed to fetch task')
    }
  }

  async createTask(taskData) {
    try {
      console.log('Creating task:', taskData)
      
      // Add default progress tracking fields
      const enhancedTaskData = {
        ...taskData,
        progress: 0,
        timeEntries: [],
        dailyUpdates: [],
        progressHistory: [],
        totalHours: 0
      }
      
      const response = await apiService.post('/tasks', enhancedTaskData)
      const task = response.task || response.data || response
      
      this.invalidateCache()
      
      const result = {
        success: true,
        task,
        message: response.message || 'Task created successfully'
      }
      
      console.log('Task created:', result)
      return result
    } catch (error) {
      console.error('Failed to create task:', error)
      throw new Error(error.message || 'Failed to create task')
    }
  }

  async updateTask(taskId, taskData) {
    try {
      console.log('Updating task:', taskId, taskData)
      
      const response = await apiService.put(`/tasks/${taskId}`, taskData)
      const task = response.task || response.data || response
      
      this.invalidateCache()
      
      const result = {
        success: true,
        task,
        message: response.message || 'Task updated successfully'
      }
      
      console.log('Task updated:', result)
      return result
    } catch (error) {
      console.error('Failed to update task:', error)
      throw new Error(error.message || 'Failed to update task')
    }
  }

  async deleteTask(taskId) {
    try {
      console.log('Deleting task:', taskId)
      
      const response = await apiService.delete(`/tasks/${taskId}`)
      this.invalidateCache()
      
      const result = {
        success: true,
        message: response.message || 'Task deleted successfully'
      }
      
      console.log('Task deleted:', result)
      return result
    } catch (error) {
      console.error('Failed to delete task:', error)
      throw new Error(error.message || 'Failed to delete task')
    }
  }

  async updateTaskStatus(taskId, status) {
    try {
      console.log('Updating task status:', taskId, status)
      
      const updateData = { status }
      if (status === 'completed') {
        updateData.completedAt = new Date().toISOString()
        updateData.progress = 100
      }
      
      const response = await apiService.put(`/tasks/${taskId}`, updateData)
      const task = response.task || response.data || response
      
      this.invalidateCache()
      
      const result = {
        success: true,
        task,
        message: response.message || 'Task status updated successfully'
      }
      
      console.log('Task status updated:', result)
      return result
    } catch (error) {
      console.error('Failed to update task status:', error)
      throw new Error(error.message || 'Failed to update task status')
    }
  }

  // NEW PROGRESS TRACKING METHODS
  async updateProgress(taskId, progress, note = '') {
    try {
      console.log('Updating task progress:', taskId, progress, '%')
      
      if (progress < 0 || progress > 100) {
        throw new Error('Progress must be between 0 and 100')
      }
      
      // Try the new progress endpoint first
      try {
        const response = await apiService.patch(`/tasks/${taskId}/progress`, { 
          progress: Number(progress), 
          note: String(note || '') 
        })
        const task = response.task || response.data || response
        
        this.invalidateCache()
        
        const result = {
          success: true,
          task,
          message: response.message || 'Progress updated successfully'
        }
        
        console.log('Progress updated via new endpoint:', result)
        return result
      } catch (error) {
        // Fallback to regular update endpoint
        console.log('New progress endpoint not available, using fallback')
        const updateData = { 
          progress: Number(progress),
          lastWorkedOn: new Date().toISOString()
        }
        
        const response = await apiService.put(`/tasks/${taskId}`, updateData)
        const task = response.task || response.data || response
        
        this.invalidateCache()
        
        const result = {
          success: true,
          task,
          message: 'Progress updated successfully (fallback)'
        }
        
        console.log('Progress updated via fallback:', result)
        return result
      }
    } catch (error) {
      console.error('Failed to update progress:', error)
      throw new Error(error.message || 'Failed to update progress')
    }
  }

  async addTimeEntry(taskId, hours, description = '') {
    try {
      console.log('Adding time entry:', taskId, hours, 'hours')
      
      if (!hours || hours <= 0) {
        throw new Error('Hours must be greater than 0')
      }
      
      // Try the new time endpoint first
      try {
        const response = await apiService.post(`/tasks/${taskId}/time`, {
          hours: Number(hours),
          description: String(description || '')
        })
        const task = response.task || response.data || response
        
        this.invalidateCache()
        
        const result = {
          success: true,
          task,
          timeEntry: {
            hours: Number(hours),
            description: description,
            date: new Date().toISOString()
          },
          message: response.message || 'Time entry added successfully'
        }
        
        console.log('Time entry added via new endpoint:', result)
        return result
      } catch (error) {
        // Fallback to regular update endpoint
        console.log('New time endpoint not available, using fallback')
        
        // Get current task to update time entries
        const currentTask = await this.getTask(taskId)
        const task = currentTask.task
        
        const timeEntries = task.timeEntries || []
        timeEntries.push({
          hours: Number(hours),
          description: String(description || ''),
          date: new Date().toISOString()
        })
        
        const totalHours = timeEntries.reduce((sum, entry) => sum + entry.hours, 0)
        
        const updateData = {
          timeEntries,
          totalHours,
          lastWorkedOn: new Date().toISOString()
        }
        
        const response = await apiService.put(`/tasks/${taskId}`, updateData)
        const updatedTask = response.task || response.data || response
        
        this.invalidateCache()
        
        const result = {
          success: true,
          task: updatedTask,
          timeEntry: {
            hours: Number(hours),
            description: description,
            date: new Date().toISOString()
          },
          message: 'Time entry added successfully (fallback)'
        }
        
        console.log('Time entry added via fallback:', result)
        return result
      }
    } catch (error) {
      console.error('Failed to add time entry:', error)
      throw new Error(error.message || 'Failed to add time entry')
    }
  }

  async addDailyUpdate(taskId, updateData) {
    try {
      console.log('Adding daily update:', taskId, updateData)
      
      const sanitizedData = {
        progress: updateData.progress !== undefined ? Number(updateData.progress) : undefined,
        workedOn: Boolean(updateData.workedOn),
        accomplishments: Array.isArray(updateData.accomplishments) 
          ? updateData.accomplishments.filter(a => a && a.trim()) 
          : [],
        blockers: Array.isArray(updateData.blockers) 
          ? updateData.blockers.filter(b => b && b.trim()) 
          : [],
        nextSteps: Array.isArray(updateData.nextSteps) 
          ? updateData.nextSteps.filter(n => n && n.trim()) 
          : [],
        mood: updateData.mood || 'neutral'
      }
      
      // Try the new daily update endpoint first
      try {
        const response = await apiService.post(`/tasks/${taskId}/daily-update`, sanitizedData)
        const task = response.task || response.data || response
        
        this.invalidateCache()
        
        const result = {
          success: true,
          task,
          dailyUpdate: sanitizedData,
          message: response.message || 'Daily update added successfully'
        }
        
        console.log('Daily update added via new endpoint:', result)
        return result
      } catch (error) {
        // Fallback to regular update endpoint
        console.log('New daily update endpoint not available, using fallback')
        
        // Get current task to update daily updates
        const currentTask = await this.getTask(taskId)
        const task = currentTask.task
        
        const dailyUpdates = task.dailyUpdates || []
        const newUpdate = {
          ...sanitizedData,
          date: new Date().toISOString()
        }
        dailyUpdates.push(newUpdate)
        
        const taskUpdateData = {
          dailyUpdates,
          lastWorkedOn: new Date().toISOString()
        }
        
        // Update progress if provided
        if (sanitizedData.progress !== undefined) {
          taskUpdateData.progress = sanitizedData.progress
        }
        
        const response = await apiService.put(`/tasks/${taskId}`, taskUpdateData)
        const updatedTask = response.task || response.data || response
        
        this.invalidateCache()
        
        const result = {
          success: true,
          task: updatedTask,
          dailyUpdate: newUpdate,
          message: 'Daily update added successfully (fallback)'
        }
        
        console.log('Daily update added via fallback:', result)
        return result
      }
    } catch (error) {
      console.error('Failed to add daily update:', error)
      throw new Error(error.message || 'Failed to add daily update')
    }
  }

  async getTaskStats() {
    try {
      console.log('Getting task statistics')
      
      const cacheKey = 'task_stats'
      const cached = this.taskCache.get(cacheKey)
      
      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
        console.log('Returning cached stats')
        return cached.data
      }

      const response = await apiService.get('/tasks/stats')
      const stats = response.stats || response.data || response
      
      const result = {
        success: true,
        stats,
        message: response.message || 'Statistics retrieved successfully'
      }
      
      this.taskCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      })
      
      console.log('Task stats loaded:', result)
      return result
    } catch (error) {
      console.error('Failed to get task statistics:', error)
      
      const defaultStats = {
        success: true,
        stats: {
          total: 0,
          completed: 0,
          'in-progress': 0,
          pending: 0,
          overdue: 0,
          averageProgress: 0,
          totalTimeSpent: 0
        },
        message: 'Using default statistics (backend unavailable)'
      }
      
      return defaultStats
    }
  }

async getAnalytics() {
  try {
    console.log('Getting progress analytics')
    
    const cacheKey = 'task_analytics'
    const cached = this.taskCache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      console.log('Returning cached analytics')
      return cached.data
    }

    // Try the new analytics endpoint first
    try {
      const response = await apiService.get('/tasks/analytics')
      const analytics = response.analytics || response.data || response
      
      const result = {
        success: true,
        analytics,
        message: response.message || 'Analytics retrieved successfully'
      }
      
      this.taskCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      })
      
      console.log('Analytics loaded via new endpoint:', result)
      return result
    } catch (error) {
      // Check if it's a 404 (endpoint doesn't exist) vs other errors
      if (error.message && (error.message.includes('404') || error.message.includes('Not Found') || error.message.includes('Cannot GET'))) {
        console.log('Analytics endpoint not available (404), calculating from tasks')
      } else {
        console.log('Analytics endpoint error (not 404):', error.message)
      }
      
      // Fallback to calculating from tasks regardless of error type
      console.log('Calculating analytics from existing tasks')
      
      const tasksResponse = await this.getAllTasks()
      const tasks = tasksResponse.tasks || []
      
      const analytics = this.calculateAnalyticsFromTasks(tasks)
      
      const result = {
        success: true,
        analytics,
        message: 'Analytics calculated from tasks (endpoint unavailable)'
      }
      
      this.taskCache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      })
      
      console.log('Analytics calculated via fallback:', result)
      return result
    }
  } catch (error) {
    console.error('Failed to get analytics:', error)
    
    // Return default analytics if everything fails
    const defaultAnalytics = {
      success: true,
      analytics: {
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
      },
      message: 'Using default analytics (all systems unavailable)'
    }
    
    console.log('Using default analytics due to complete failure')
    return defaultAnalytics
  }
}

  async getRecentActivity(limit = 10) {
    try {
      console.log('Getting recent activity, limit:', limit)
      
      const response = await apiService.getWithQuery('/tasks', {
        limit,
        sortBy: 'lastWorkedOn',
        sortOrder: 'desc'
      })
      
      const tasks = response.tasks || response.data || response || []
      
      const result = {
        success: true,
        tasks: Array.isArray(tasks) ? tasks : [],
        total: response.total || tasks.length,
        message: response.message || 'Recent activity retrieved successfully'
      }
      
      console.log('Recent activity loaded:', result)
      return result
    } catch (error) {
      console.error('Failed to get recent activity:', error)
      throw new Error(error.message || 'Failed to fetch recent activity')
    }
  }

  async getOverdueTasks() {
    try {
      console.log('Getting overdue tasks')
      
      const now = new Date().toISOString()
      const response = await apiService.getWithQuery('/tasks', {
        status: 'pending,in-progress',
        sortBy: 'dueDate',
        sortOrder: 'asc'
      })
      
      const allTasks = response.tasks || response.data || response || []
      const overdueTasks = allTasks.filter(task => 
        task.dueDate && 
        new Date(task.dueDate) < new Date() && 
        task.status !== 'completed'
      )
      
      const result = {
        success: true,
        tasks: overdueTasks,
        total: overdueTasks.length,
        message: response.message || 'Overdue tasks retrieved successfully'
      }
      
      console.log('Overdue tasks loaded:', result)
      return result
    } catch (error) {
      console.error('Failed to get overdue tasks:', error)
      throw new Error(error.message || 'Failed to fetch overdue tasks')
    }
  }

  async searchTasks(query, filters = {}) {
    try {
      console.log('Searching tasks with query:', query, 'filters:', filters)
      
      const searchParams = {
        search: query,
        ...filters
      }
      
      const response = await apiService.getWithQuery('/tasks', searchParams)
      const tasks = response.tasks || response.data || response || []
      
      const result = {
        success: true,
        tasks: Array.isArray(tasks) ? tasks : [],
        total: response.total || tasks.length,
        message: response.message || 'Search completed successfully'
      }
      
      console.log('Search results:', result)
      return result
    } catch (error) {
      console.error('Failed to search tasks:', error)
      throw new Error(error.message || 'Failed to search tasks')
    }
  }

  // UTILITY METHODS
  calculateAnalyticsFromTasks(tasks) {
    if (!Array.isArray(tasks)) {
      tasks = []
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
      weeklyProgress: [] // Would need more complex calculation
    }
  }

  calculateTaskStats(tasks) {
    if (!Array.isArray(tasks)) {
      tasks = []
    }
    
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.progress === 100 || t.status === 'completed').length,
      inProgress: tasks.filter(t => t.progress > 0 && t.progress < 100).length,
      notStarted: tasks.filter(t => (t.progress || 0) === 0).length,
      totalHours: tasks.reduce((sum, task) => sum + (task.totalHours || 0), 0),
      averageProgress: tasks.length > 0 
        ? tasks.reduce((sum, task) => sum + (task.progress || 0), 0) / tasks.length 
        : 0
    }
  }

  getProgressDistribution(tasks) {
    if (!Array.isArray(tasks)) {
      tasks = []
    }
    
    return {
      notStarted: tasks.filter(t => (t.progress || 0) === 0).length,
      early: tasks.filter(t => (t.progress || 0) > 0 && (t.progress || 0) <= 25).length,
      quarter: tasks.filter(t => (t.progress || 0) > 25 && (t.progress || 0) <= 50).length,
      half: tasks.filter(t => (t.progress || 0) > 50 && (t.progress || 0) <= 75).length,
      mostlyDone: tasks.filter(t => (t.progress || 0) > 75 && (t.progress || 0) < 100).length,
      completed: tasks.filter(t => (t.progress || 0) === 100).length
    }
  }

  formatTimeEntry(timeData) {
    return {
      hours: Number(timeData.hours) || 0,
      description: String(timeData.description || '').trim(),
      date: timeData.date || new Date().toISOString()
    }
  }

  validateProgress(progress) {
    const num = Number(progress)
    if (isNaN(num) || num < 0 || num > 100) {
      throw new Error('Progress must be a number between 0 and 100')
    }
    return num
  }

  // CACHE MANAGEMENT
  invalidateCache() {
    console.log('Invalidating all cache')
    this.taskCache.clear()
  }

  invalidateTaskCache(taskId) {
    console.log('Invalidating cache for task:', taskId)
    const keysToDelete = []
    for (const key of this.taskCache.keys()) {
      if (key.includes(taskId) || key.includes('task_stats') || key.includes('task_analytics')) {
        keysToDelete.push(key)
      }
    }
    keysToDelete.forEach(key => this.taskCache.delete(key))
  }

  clearCache() {
    console.log('Clearing all cache')
    this.taskCache.clear()
  }

  getCacheStats() {
    return {
      size: this.taskCache.size,
      keys: Array.from(this.taskCache.keys()),
      expiry: this.cacheExpiry
    }
  }

  // CONNECTION TEST
  async testConnection() {
    try {
      console.log('Testing backend connection...')
      const response = await apiService.get('/tasks/health')
      console.log('Backend connection successful:', response)
      return { success: true, data: response }
    } catch (error) {
      console.error('Backend connection failed:', error)
      return { 
        success: false, 
        error: 'Cannot connect to task service. Make sure your backend is running.',
        details: error.message
      }
    }
  }
}

// Create and export singleton instance
const taskService = new TaskService()

// Test connection on startup
taskService.testConnection().then(result => {
  if (result.success) {
    console.log('✅ Task service connected successfully')
  } else {
    console.warn('⚠️ Task service connection failed:', result.error)
  }
})

export default taskService