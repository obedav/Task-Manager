// routes/taskRoutes.js - Proper Express Router
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// JWT Secret (use environment variable in production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// In-memory user storage (MUST match authRoutes.js exactly)
let users = [
  {
    id: '1',
    email: 'test@example.com',
    password: '$2a$10$4V5z6fNbZQU4GQIjDZ5fAu1tWJ.2H5rNqnGqV4YgJ3mPR8Q7K3zOm', // password123
    name: 'Test User',
    role: 'user',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    email: 'admin@example.com',
    password: '$2a$10$4V5z6fNbZQU4GQIjDZ5fAu1tWJ.2H5rNqnGqV4YgJ3mPR8Q7K3zOm', // password123
    name: 'Admin User',
    role: 'admin',
    createdAt: new Date().toISOString()
  }
];

// In-memory task storage (replace with real database)
let tasks = [
  {
    id: '1',
    title: 'Complete project setup',
    description: 'Set up the TaskFlow application with authentication',
    status: 'completed',
    priority: 'high',
    dueDate: new Date().toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    completedAt: new Date().toISOString(),
    userId: '1'
  },
  {
    id: '2',
    title: 'Design user interface',
    description: 'Create beautiful mockups and wireframes for the app',
    status: 'in-progress',
    priority: 'medium',
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    userId: '1'
  },
  {
    id: '3',
    title: 'Implement task management',
    description: 'Add CRUD operations for tasks',
    status: 'pending',
    priority: 'high',
    dueDate: new Date(Date.now() + 172800000).toISOString(),
    createdAt: new Date(Date.now() - 21600000).toISOString(),
    userId: '1'
  }
];

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
    
    // Find user
    const user = users.find(u => u.id === decoded.id);
    if (!user) {
      console.log('❌ User not found for ID:', decoded.id);
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
// @desc    Health check for task service
// @access  Public
router.get('/health', (req, res) => {
  console.log('🔍 Task health check requested');
  res.json({
    success: true,
    message: 'Task service is healthy',
    timestamp: new Date().toISOString(),
    totalTasks: tasks.length,
    totalUsers: users.length,
    service: 'TaskService',
    version: '1.0.0'
  });
});

// @route   GET /api/tasks
// @desc    Get all tasks for authenticated user
// @access  Private
router.get('/', authenticateToken, (req, res) => {
  try {
    const { status, priority, search, limit, sortBy, sortOrder } = req.query;
    
    console.log(`📋 Getting tasks for user: ${req.user.email} (ID: ${req.user.id})`);
    
    // Filter tasks for current user
    let userTasks = tasks.filter(task => task.userId === req.user.id);
    
    console.log(`Found ${userTasks.length} tasks before filtering`);
    
    // Apply filters
    if (status) {
      const statusArray = status.split(',').map(s => s.trim());
      userTasks = userTasks.filter(task => statusArray.includes(task.status));
      console.log(`After status filter: ${userTasks.length} tasks`);
    }
    
    if (priority) {
      userTasks = userTasks.filter(task => task.priority === priority);
      console.log(`After priority filter: ${userTasks.length} tasks`);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      userTasks = userTasks.filter(task => 
        task.title.toLowerCase().includes(searchLower) ||
        (task.description && task.description.toLowerCase().includes(searchLower))
      );
      console.log(`After search filter: ${userTasks.length} tasks`);
    }
    
    // Sorting
    if (sortBy) {
      userTasks.sort((a, b) => {
        let aVal = a[sortBy];
        let bVal = b[sortBy];
        
        // Handle date sorting
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
      console.log(`After limit: ${userTasks.length} tasks`);
    }

    console.log(`✅ Final result: ${userTasks.length} tasks for user ${req.user.email}`);

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
// @desc    Get task statistics for authenticated user
// @access  Private
router.get('/stats', authenticateToken, (req, res) => {
  try {
    console.log(`📊 Getting stats for user: ${req.user.email}`);
    
    const userTasks = tasks.filter(task => task.userId === req.user.id);
    
    const stats = {
      total: userTasks.length,
      completed: userTasks.filter(t => t.status === 'completed').length,
      'in-progress': userTasks.filter(t => t.status === 'in-progress').length,
      pending: userTasks.filter(t => t.status === 'pending').length,
      overdue: userTasks.filter(t => 
        t.status !== 'completed' && t.dueDate && new Date(t.dueDate) < new Date()
      ).length
    };

    console.log(`✅ Task stats for user ${req.user.email}:`, stats);

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

// @route   POST /api/tasks
// @desc    Create new task
// @access  Private
router.post('/', authenticateToken, (req, res) => {
  try {
    const { title, description, priority = 'medium', dueDate, status = 'pending' } = req.body;
    
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required'
      });
    }
    
    const newTask = {
      id: Date.now().toString(),
      title,
      description: description || '',
      status,
      priority,
      dueDate: dueDate || null,
      createdAt: new Date().toISOString(),
      userId: req.user.id
    };
    
    tasks.push(newTask);
    
    console.log(`✅ Task created for user ${req.user.email}:`, newTask);
    
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

// @route   GET /api/tasks/:id
// @desc    Get single task
// @access  Private
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const taskId = req.params.id;
    const task = tasks.find(t => t.id === taskId && t.userId === req.user.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    console.log(`✅ Task ${taskId} retrieved for user ${req.user.email}`);
    
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
// @desc    Update task
// @access  Private
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const taskId = req.params.id;
    const taskIndex = tasks.findIndex(t => t.id === taskId && t.userId === req.user.id);
    
    if (taskIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    const { title, description, priority, dueDate, status } = req.body;
    
    // Update task fields
    if (title !== undefined) tasks[taskIndex].title = title;
    if (description !== undefined) tasks[taskIndex].description = description;
    if (priority !== undefined) tasks[taskIndex].priority = priority;
    if (dueDate !== undefined) tasks[taskIndex].dueDate = dueDate;
    if (status !== undefined) {
      tasks[taskIndex].status = status;
      if (status === 'completed' && !tasks[taskIndex].completedAt) {
        tasks[taskIndex].completedAt = new Date().toISOString();
      }
    }
    
    tasks[taskIndex].updatedAt = new Date().toISOString();
    
    console.log(`✅ Task ${taskId} updated for user ${req.user.email}`);
    
    res.json({
      success: true,
      task: tasks[taskIndex],
      message: 'Task updated successfully'
    });
  } catch (error) {
    console.error('❌ Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error updating task'
    });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Private
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const taskId = req.params.id;
    const taskIndex = tasks.findIndex(t => t.id === taskId && t.userId === req.user.id);
    
    if (taskIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    const deletedTask = tasks.splice(taskIndex, 1)[0];
    
    console.log(`✅ Task ${taskId} deleted for user ${req.user.email}`);
    
    res.json({
      success: true,
      message: 'Task deleted successfully',
      task: deletedTask
    });
  } catch (error) {
    console.error('❌ Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error deleting task'
    });
  }
});

module.exports = router;