// routes/taskRoutes.js - Enhanced with progress tracking
const express = require('express');
const jwt = require('jsonwebtoken');
const { userStore, taskStore, debug } = require('../data/store');
const router = express.Router();

// JWT Secret
// TODO: Set JWT_SECRET in environment for production. Do NOT use default in production.
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('🔐 Auth middleware - Token received:', token ? 'Yes' : 'No');

  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'Access token required' 
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log('❌ Token verification failed:', err.message);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid or expired token' 
      });
    }
    
    console.log('✅ Token decoded successfully:', decoded);
    
    const user = userStore.findById(decoded.id);
    if (!user) {
      console.log('❌ User not found for ID:', decoded.id);
      console.log('📊 Available users:', userStore.getAll().map(u => ({ id: u.id, email: u.email })));
      return res.status(401).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    console.log('✅ User found:', user.email);
    req.user = user;
    next();
  });
};

// @route   GET /api/tasks/health
router.get('/health', (req, res) => {
  console.log('🔍 Task health check requested');
  const counts = debug.getCounts();
  res.json({
    success: true,
    message: 'Task service is healthy',
    timestamp: new Date().toISOString(),
    totalTasks: counts.tasks,
    totalUsers: counts.users,
    service: 'TaskService',
    version: '2.0.0',
    features: ['progress-tracking', 'time-tracking', 'daily-updates', 'analytics']
  });
});

// @route   GET /api/tasks
router.get('/', authenticateToken, (req, res) => {
  try {
    const { status, priority, search, limit, sortBy, sortOrder } = req.query;
    
    console.log(`📋 Getting tasks for user: ${req.user.email} (ID: ${req.user.id})`);
    
    let userTasks = taskStore.findByUserId(req.user.id);
    
    console.log(`Found ${userTasks.length} tasks before filtering`);
    
    // Apply filters
    if (status) {
      const statusArray = status.split(',').map(s => s.trim());
      userTasks = userTasks.filter(task => statusArray.includes(task.status));
    }
    
    if (priority) {
      userTasks = userTasks.filter(task => task.priority === priority);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      userTasks = userTasks.filter(task => 
        task.title.toLowerCase().includes(searchLower) ||
        (task.description && task.description.toLowerCase().includes(searchLower))
      );
    }
    
    // Sorting
    if (sortBy) {
      userTasks.sort((a, b) => {
        let aVal = a[sortBy];
        let bVal = b[sortBy];
        
        if (sortBy.includes('date') || sortBy.includes('At')) {
          aVal = new Date(aVal);
          bVal = new Date(bVal);
        }
        
        if (sortOrder === 'desc') {
          return bVal > aVal ? 1 : -1;
        } else {
          return aVal > bVal ? 1 : -1;
        }
      });
    }
    
    // Limit results
    if (limit) {
      userTasks = userTasks.slice(0, parseInt(limit));
    }

    res.json({
      success: true,
      tasks: userTasks,
      total: userTasks.length,
      message: 'Tasks retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error fetching tasks'
    });
  }
});

// @route   GET /api/tasks/stats
router.get('/stats', authenticateToken, (req, res) => {
  try {
    console.log(`📊 Getting stats for user: ${req.user.email}`);
    
    const stats = taskStore.getStats(req.user.id);

    res.json({
      success: true,
      stats,
      message: 'Statistics retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error fetching statistics'
    });
  }
});

// @route   GET /api/tasks/analytics
// @desc    Get detailed progress analytics
router.get('/analytics', authenticateToken, (req, res) => {
  try {
    console.log(`📈 Getting analytics for user: ${req.user.email}`);
    
    const analytics = taskStore.getProgressAnalytics(req.user.id);

    res.json({
      success: true,
      analytics,
      message: 'Analytics retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error fetching analytics'
    });
  }
});

// @route   POST /api/tasks
router.post('/', authenticateToken, (req, res) => {
  try {
    const { title, description, priority, dueDate, status, estimatedHours } = req.body;
    
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required'
      });
    }
    
    const newTask = taskStore.create(req.body, req.user.id);
    
    res.status(201).json({
      success: true,
      task: newTask,
      message: 'Task created successfully'
    });
  } catch (error) {
    console.error('❌ Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error creating task'
    });
  }
});

// @route   PATCH /api/tasks/:id/progress
// @desc    Update task progress
router.patch('/:id/progress', authenticateToken, (req, res) => {
  try {
    const taskId = req.params.id;
    const { progress, note } = req.body;
    
    if (progress < 0 || progress > 100) {
      return res.status(400).json({
        success: false,
        message: 'Progress must be between 0 and 100'
      });
    }
    
    const updatedTask = taskStore.addProgressUpdate(taskId, req.user.id, { progress, note });
    
    console.log(`✅ Progress updated for task ${taskId}: ${progress}%`);
    
    res.json({
      success: true,
      task: updatedTask,
      message: 'Progress updated successfully'
    });
  } catch (error) {
    console.error('❌ Update progress error:', error);
    
    if (error.message === 'Task not found') {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error updating progress'
    });
  }
});

// @route   POST /api/tasks/:id/time
// @desc    Add time entry to task
router.post('/:id/time', authenticateToken, (req, res) => {
  try {
    const taskId = req.params.id;
    const { hours, description } = req.body;
    
    if (!hours || hours <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Hours must be greater than 0'
      });
    }
    
    const updatedTask = taskStore.addTimeEntry(taskId, req.user.id, { hours, description });
    
    console.log(`✅ Time entry added for task ${taskId}: ${hours} hours`);
    
    res.json({
      success: true,
      task: updatedTask,
      message: 'Time entry added successfully'
    });
  } catch (error) {
    console.error('❌ Add time entry error:', error);
    
    if (error.message === 'Task not found') {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error adding time entry'
    });
  }
});

// @route   POST /api/tasks/:id/daily-update
// @desc    Add daily update to task
router.post('/:id/daily-update', authenticateToken, (req, res) => {
  try {
    const taskId = req.params.id;
    const { workedOn, accomplishments, blockers, nextSteps, mood } = req.body;
    
    const updatedTask = taskStore.addDailyUpdate(taskId, req.user.id, {
      workedOn,
      accomplishments,
      blockers,
      nextSteps,
      mood
    });
    
    console.log(`✅ Daily update added for task ${taskId}`);
    
    res.json({
      success: true,
      task: updatedTask,
      message: 'Daily update added successfully'
    });
  } catch (error) {
    console.error('❌ Add daily update error:', error);
    
    if (error.message === 'Task not found') {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error adding daily update'
    });
  }
});

// @route   GET /api/tasks/:id
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const taskId = req.params.id;
    const task = taskStore.findByIdAndUserId(taskId, req.user.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    res.json({
      success: true,
      task,
      message: 'Task retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Get task error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error fetching task'
    });
  }
});

// @route   PUT /api/tasks/:id
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const taskId = req.params.id;
    const updatedTask = taskStore.update(taskId, req.user.id, req.body);
    
    res.json({
      success: true,
      task: updatedTask,
      message: 'Task updated successfully'
    });
  } catch (error) {
    console.error('❌ Update task error:', error);
    
    if (error.message === 'Task not found') {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error updating task'
    });
  }
});

// @route   PATCH /api/tasks/:id
router.patch('/:id', authenticateToken, (req, res) => {
  try {
    const taskId = req.params.id;
    const updatedTask = taskStore.update(taskId, req.user.id, req.body);
    
    res.json({
      success: true,
      task: updatedTask,
      message: 'Task updated successfully'
    });
  } catch (error) {
    console.error('❌ Patch task error:', error);
    
    if (error.message === 'Task not found') {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error updating task'
    });
  }
});

// @route   DELETE /api/tasks/:id
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const taskId = req.params.id;
    const deletedTask = taskStore.delete(taskId, req.user.id);
    
    res.json({
      success: true,
      message: 'Task deleted successfully',
      task: deletedTask
    });
  } catch (error) {
    console.error('❌ Delete task error:', error);
    
    if (error.message === 'Task not found') {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error deleting task'
    });
  }
});

module.exports = router;