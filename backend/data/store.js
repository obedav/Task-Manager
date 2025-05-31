// data/store.js - Enhanced data store with progress tracking
const bcrypt = require('bcryptjs');

// Shared users array - single source of truth
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

// Enhanced tasks array with progress tracking
let tasks = [
  {
    _id: '1',
    title: 'Complete project setup',
    description: 'Set up the TaskFlow application with authentication',
    status: 'completed',
    priority: 'high',
    progress: 100,
    dueDate: new Date().toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    completedAt: new Date().toISOString(),
    userId: '1',
    totalTimeSpent: 8.5,
    estimatedHours: 8,
    progressHistory: [
      { date: '2025-05-30', progress: 30, note: 'Initial setup and planning' },
      { date: '2025-05-31', progress: 100, note: 'Completed authentication system' }
    ],
    timeEntries: [
      { date: '2025-05-30', hours: 4, description: 'Project scaffolding and initial setup' },
      { date: '2025-05-31', hours: 4.5, description: 'Authentication implementation and testing' }
    ],
    dailyUpdates: [
      {
        date: '2025-05-30',
        workedOn: true,
        status: 'in-progress',
        accomplishments: ['Set up project structure', 'Configured build tools'],
        blockers: [],
        nextSteps: ['Implement user authentication'],
        mood: 'productive'
      },
      {
        date: '2025-05-31',
        workedOn: true,
        status: 'completed',
        accomplishments: ['Completed authentication', 'Added login/register forms'],
        blockers: [],
        nextSteps: ['Move to next task'],
        mood: 'satisfied'
      }
    ]
  },
  {
    _id: '2',
    title: 'Design user interface',
    description: 'Create beautiful mockups and wireframes for the app',
    status: 'in-progress',
    priority: 'medium',
    progress: 65,
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    userId: '1',
    totalTimeSpent: 5.5,
    estimatedHours: 12,
    progressHistory: [
      { date: '2025-05-30', progress: 25, note: 'Created initial wireframes' },
      { date: '2025-05-31', progress: 65, note: 'Finished dashboard design' }
    ],
    timeEntries: [
      { date: '2025-05-30', hours: 3, description: 'Wireframe creation and user flow mapping' },
      { date: '2025-05-31', hours: 2.5, description: 'Dashboard UI design and component library' }
    ],
    dailyUpdates: [
      {
        date: '2025-05-31',
        workedOn: true,
        status: 'in-progress',
        accomplishments: ['Completed dashboard mockups', 'Created component library'],
        blockers: ['Waiting for feedback on color scheme'],
        nextSteps: ['Design task management interface'],
        mood: 'creative'
      }
    ]
  }
];

// User methods
const userStore = {
  getAll: () => users,
  findById: (id) => users.find(u => u.id === id),
  findByEmail: (email) => users.find(u => u.email.toLowerCase() === email.toLowerCase()),
  
  create: async (userData) => {
    const { email, password, name } = userData;
    
    if (userStore.findByEmail(email)) {
      throw new Error('User already exists with this email');
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = {
      id: Date.now().toString(),
      email: email.toLowerCase(),
      password: hashedPassword,
      name: name || email.split('@')[0],
      role: 'user',
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    console.log('✅ User created in store:', { id: newUser.id, email: newUser.email });
    
    return newUser;
  },
  
  update: (id, updateData) => {
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        users[userIndex][key] = updateData[key];
      }
    });
    
    users[userIndex].updatedAt = new Date().toISOString();
    return users[userIndex];
  },
  
  verifyPassword: async (user, password) => {
    return await bcrypt.compare(password, user.password);
  }
};

// Enhanced task methods with progress tracking
const taskStore = {
  getAll: () => tasks,
  findByUserId: (userId) => tasks.filter(t => t.userId === userId),
  findByIdAndUserId: (id, userId) => tasks.find(t => t._id === id && t.userId === userId),
  
  create: (taskData, userId) => {
    const newTask = {
      _id: Date.now().toString(),
      title: taskData.title,
      description: taskData.description || '',
      status: taskData.status || 'pending',
      priority: taskData.priority || 'medium',
      progress: taskData.progress || 0,
      dueDate: taskData.dueDate || null,
      estimatedHours: taskData.estimatedHours || null,
      createdAt: new Date().toISOString(),
      userId: userId,
      totalTimeSpent: 0,
      progressHistory: [],
      timeEntries: [],
      dailyUpdates: []
    };
    
    tasks.push(newTask);
    console.log('✅ Task created in store:', { _id: newTask._id, title: newTask.title, userId });
    
    return newTask;
  },
  
  update: (id, userId, updateData) => {
    const taskIndex = tasks.findIndex(t => t._id === id && t.userId === userId);
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }
    
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        tasks[taskIndex][key] = updateData[key];
      }
    });
    
    if (updateData.status === 'completed' && !tasks[taskIndex].completedAt) {
      tasks[taskIndex].completedAt = new Date().toISOString();
      tasks[taskIndex].progress = 100;
    }
    
    tasks[taskIndex].updatedAt = new Date().toISOString();
    return tasks[taskIndex];
  },
  
  // Add progress update
  addProgressUpdate: (id, userId, progressData) => {
    const taskIndex = tasks.findIndex(t => t._id === id && t.userId === userId);
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    // Update progress
    if (progressData.progress !== undefined) {
      tasks[taskIndex].progress = progressData.progress;
      
      // Add to progress history
      const existingHistoryIndex = tasks[taskIndex].progressHistory.findIndex(h => h.date === today);
      if (existingHistoryIndex >= 0) {
        tasks[taskIndex].progressHistory[existingHistoryIndex] = {
          date: today,
          progress: progressData.progress,
          note: progressData.note || ''
        };
      } else {
        tasks[taskIndex].progressHistory.push({
          date: today,
          progress: progressData.progress,
          note: progressData.note || ''
        });
      }
    }
    
    tasks[taskIndex].updatedAt = new Date().toISOString();
    return tasks[taskIndex];
  },
  
  // Add time entry
  addTimeEntry: (id, userId, timeData) => {
    const taskIndex = tasks.findIndex(t => t._id === id && t.userId === userId);
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    // Add time entry
    const existingEntryIndex = tasks[taskIndex].timeEntries.findIndex(t => t.date === today);
    if (existingEntryIndex >= 0) {
      tasks[taskIndex].timeEntries[existingEntryIndex] = {
        date: today,
        hours: timeData.hours,
        description: timeData.description || ''
      };
    } else {
      tasks[taskIndex].timeEntries.push({
        date: today,
        hours: timeData.hours,
        description: timeData.description || ''
      });
    }
    
    // Recalculate total time spent
    tasks[taskIndex].totalTimeSpent = tasks[taskIndex].timeEntries.reduce((total, entry) => total + entry.hours, 0);
    
    tasks[taskIndex].updatedAt = new Date().toISOString();
    return tasks[taskIndex];
  },
  
  // Add daily update
  addDailyUpdate: (id, userId, updateData) => {
    const taskIndex = tasks.findIndex(t => t._id === id && t.userId === userId);
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    // Add daily update
    const existingUpdateIndex = tasks[taskIndex].dailyUpdates.findIndex(u => u.date === today);
    const dailyUpdate = {
      date: today,
      workedOn: updateData.workedOn || false,
      status: updateData.status || tasks[taskIndex].status,
      accomplishments: updateData.accomplishments || [],
      blockers: updateData.blockers || [],
      nextSteps: updateData.nextSteps || [],
      mood: updateData.mood || 'neutral'
    };
    
    if (existingUpdateIndex >= 0) {
      tasks[taskIndex].dailyUpdates[existingUpdateIndex] = dailyUpdate;
    } else {
      tasks[taskIndex].dailyUpdates.push(dailyUpdate);
    }
    
    tasks[taskIndex].updatedAt = new Date().toISOString();
    return tasks[taskIndex];
  },
  
  // Get progress analytics
  getProgressAnalytics: (userId, taskId = null) => {
    const userTasks = taskId 
      ? tasks.filter(t => t.userId === userId && t._id === taskId)
      : tasks.filter(t => t.userId === userId);
    
    const analytics = {
      totalTasks: userTasks.length,
      averageProgress: userTasks.reduce((sum, t) => sum + t.progress, 0) / userTasks.length || 0,
      totalTimeSpent: userTasks.reduce((sum, t) => sum + t.totalTimeSpent, 0),
      totalEstimatedHours: userTasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0),
      productivityByDay: {},
      progressTrend: [],
      timeByDay: {}
    };
    
    // Calculate daily productivity
    userTasks.forEach(task => {
      task.dailyUpdates.forEach(update => {
        if (!analytics.productivityByDay[update.date]) {
          analytics.productivityByDay[update.date] = {
            tasksWorkedOn: 0,
            totalProgress: 0,
            accomplishments: 0,
            blockers: 0
          };
        }
        
        if (update.workedOn) {
          analytics.productivityByDay[update.date].tasksWorkedOn++;
          analytics.productivityByDay[update.date].accomplishments += update.accomplishments.length;
          analytics.productivityByDay[update.date].blockers += update.blockers.length;
        }
      });
      
      task.timeEntries.forEach(entry => {
        if (!analytics.timeByDay[entry.date]) {
          analytics.timeByDay[entry.date] = 0;
        }
        analytics.timeByDay[entry.date] += entry.hours;
      });
    });
    
    return analytics;
  },
  
  delete: (id, userId) => {
    const taskIndex = tasks.findIndex(t => t._id === id && t.userId === userId);
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }
    
    const deletedTask = tasks.splice(taskIndex, 1)[0];
    console.log('✅ Task deleted from store:', { _id: id, userId });
    
    return deletedTask;
  },
  
  getStats: (userId) => {
    const userTasks = taskStore.findByUserId(userId);
    
    return {
      total: userTasks.length,
      completed: userTasks.filter(t => t.status === 'completed').length,
      'in-progress': userTasks.filter(t => t.status === 'in-progress').length,
      pending: userTasks.filter(t => t.status === 'pending').length,
      overdue: userTasks.filter(t => 
        t.status !== 'completed' && t.dueDate && new Date(t.dueDate) < new Date()
      ).length,
      averageProgress: userTasks.reduce((sum, t) => sum + t.progress, 0) / userTasks.length || 0,
      totalTimeSpent: userTasks.reduce((sum, t) => sum + t.totalTimeSpent, 0)
    };
  }
};

// Debug methods
const debug = {
  printState: () => {
    console.log('📊 Current Store State:');
    console.log('Users:', users.map(u => ({ id: u.id, email: u.email, name: u.name })));
    console.log('Tasks:', tasks.map(t => ({ 
      _id: t._id, 
      title: t.title, 
      progress: t.progress,
      totalTimeSpent: t.totalTimeSpent,
      userId: t.userId 
    })));
  },
  
  getCounts: () => ({
    users: users.length,
    tasks: tasks.length
  })
};

module.exports = {
  userStore,
  taskStore,
  debug
};