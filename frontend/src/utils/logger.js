// utils/logger.js - Production-ready logging utility
class Logger {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development'
    this.isProduction = process.env.NODE_ENV === 'production'
  }

  // Development-only logging
  dev(...args) {
    if (this.isDevelopment) {
      console.log('[DEV]', ...args)
    }
  }

  // Info logging (appears in production)
  info(...args) {
    console.info('[INFO]', ...args)
  }

  // Warning logging
  warn(...args) {
    console.warn('[WARN]', ...args)
  }

  // Error logging (always appears)
  error(...args) {
    console.error('[ERROR]', ...args)
    
    // In production, you might want to send errors to a service
    if (this.isProduction) {
      this.sendToErrorService(args)
    }
  }

  // Send errors to external service (implement as needed)
  sendToErrorService(errorData) {
    // Example: send to Sentry, LogRocket, etc.
    // sentry.captureException(errorData)
  }

  // Performance timing
  time(label) {
    if (this.isDevelopment) {
      console.time(`[PERF] ${label}`)
    }
  }

  timeEnd(label) {
    if (this.isDevelopment) {
      console.timeEnd(`[PERF] ${label}`)
    }
  }
}

export const logger = new Logger()

// utils/accessibility.js - Accessibility utilities
export const a11y = {
  // Generate unique IDs for form elements
  generateId: (prefix = 'element') => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  },

  // Announce content to screen readers
  announce: (message, priority = 'polite') => {
    const announcer = document.createElement('div')
    announcer.setAttribute('aria-live', priority)
    announcer.setAttribute('aria-atomic', 'true')
    announcer.setAttribute('class', 'sr-only')
    announcer.textContent = message
    
    document.body.appendChild(announcer)
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcer)
    }, 1000)
  },

  // Focus management
  focusElement: (element, options = {}) => {
    if (!element) return false
    
    try {
      element.focus(options)
      return true
    } catch (error) {
      logger.warn('Failed to focus element:', error)
      return false
    }
  },

  // Trap focus within container
  trapFocus: (container) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    if (focusableElements.length === 0) return null
    
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]
    
    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }
    
    container.addEventListener('keydown', handleTabKey)
    firstElement.focus()
    
    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleTabKey)
    }
  }
}

// utils/validation.js - Form validation utilities
export const validation = {
  // Email validation
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  // Password strength validation
  validatePassword: (password) => {
    const errors = []
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number')
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      strength: this.calculatePasswordStrength(password)
    }
  },

  calculatePasswordStrength: (password) => {
    let score = 0
    
    if (password.length >= 8) score += 1
    if (password.length >= 12) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[a-z]/.test(password)) score += 1
    if (/\d/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1
    
    if (score >= 5) return 'strong'
    if (score >= 3) return 'medium'
    return 'weak'
  },

  // Task validation
  validateTask: (taskData) => {
    const errors = {}
    
    if (!taskData.title || taskData.title.trim().length === 0) {
      errors.title = 'Task title is required'
    } else if (taskData.title.length > 100) {
      errors.title = 'Task title must be less than 100 characters'
    }
    
    if (taskData.description && taskData.description.length > 500) {
      errors.description = 'Description must be less than 500 characters'
    }
    
    if (taskData.estimatedHours && (taskData.estimatedHours < 0 || taskData.estimatedHours > 1000)) {
      errors.estimatedHours = 'Estimated hours must be between 0 and 1000'
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  },

  // Progress validation
  validateProgress: (progress) => {
    const numProgress = Number(progress)
    
    if (isNaN(numProgress)) {
      return { isValid: false, error: 'Progress must be a number' }
    }
    
    if (numProgress < 0 || numProgress > 100) {
      return { isValid: false, error: 'Progress must be between 0 and 100' }
    }
    
    return { isValid: true, value: numProgress }
  },

  // Time entry validation
  validateTimeEntry: (hours, description = '') => {
    const errors = {}
    
    const numHours = Number(hours)
    
    if (!hours || isNaN(numHours)) {
      errors.hours = 'Hours is required and must be a number'
    } else if (numHours <= 0) {
      errors.hours = 'Hours must be greater than 0'
    } else if (numHours > 24) {
      errors.hours = 'Hours cannot exceed 24 per entry'
    }
    
    if (description && description.length > 200) {
      errors.description = 'Description must be less than 200 characters'
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }
}

// utils/performance.js - Performance monitoring utilities
export const performance = {
  // Debounce function for search/input
  debounce: (func, wait) => {
    let timeout
    
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  },

  // Throttle function for scroll/resize events
  throttle: (func, limit) => {
    let inThrottle
    
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  },

  // Measure component render time
  measureRender: (componentName, renderFunction) => {
    if (process.env.NODE_ENV === 'development') {
      const start = performance.now()
      const result = renderFunction()
      const end = performance.now()
      
      if (end - start > 16) { // More than one frame (16ms)
        logger.warn(`Slow render detected in ${componentName}: ${(end - start).toFixed(2)}ms`)
      }
      
      return result
    }
    
    return renderFunction()
  },

  // Check if user prefers reduced motion
  prefersReducedMotion: () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }
}

// utils/storage.js - Secure storage utilities
export const storage = {
  // Set item with expiration
  setItem: (key, value, expirationHours = 24) => {
    try {
      const item = {
        value,
        expiration: Date.now() + (expirationHours * 60 * 60 * 1000)
      }
      localStorage.setItem(key, JSON.stringify(item))
      return true
    } catch (error) {
      logger.error('Failed to save to localStorage:', error)
      return false
    }
  },

  // Get item with expiration check
  getItem: (key) => {
    try {
      const itemStr = localStorage.getItem(key)
      if (!itemStr) return null
      
      const item = JSON.parse(itemStr)
      
      // Check if expired
      if (Date.now() > item.expiration) {
        localStorage.removeItem(key)
        return null
      }
      
      return item.value
    } catch (error) {
      logger.error('Failed to read from localStorage:', error)
      return null
    }
  },

  // Remove item
  removeItem: (key) => {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      logger.error('Failed to remove from localStorage:', error)
      return false
    }
  },

  // Clear all expired items
  clearExpired: () => {
    try {
      const keys = Object.keys(localStorage)
      let cleared = 0
      
      keys.forEach(key => {
        try {
          const itemStr = localStorage.getItem(key)
          if (itemStr) {
            const item = JSON.parse(itemStr)
            if (item.expiration && Date.now() > item.expiration) {
              localStorage.removeItem(key)
              cleared++
            }
          }
        } catch {
          // Invalid JSON, remove it
          localStorage.removeItem(key)
          cleared++
        }
      })
      
      if (cleared > 0) {
        logger.dev(`Cleared ${cleared} expired localStorage items`)
      }
      
      return cleared
    } catch (error) {
      logger.error('Failed to clear expired items:', error)
      return 0
    }
  }
}

// utils/constants.js - Application constants
export const CONSTANTS = {
  // API
  API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  API_TIMEOUT: 30000, // 30 seconds
  
  // Storage keys
  STORAGE_KEYS: {
    AUTH_TOKEN: 'taskflow_auth_token',
    USER_PREFERENCES: 'taskflow_user_prefs',
    THEME: 'taskflow_theme',
    ONBOARDING_COMPLETED: 'taskflow_onboarding'
  },
  
  // Task limits
  TASK_LIMITS: {
    TITLE_MAX_LENGTH: 100,
    DESCRIPTION_MAX_LENGTH: 500,
    CATEGORY_MAX_LENGTH: 50,
    MAX_TIME_ENTRY_HOURS: 24,
    MAX_ACCOMPLISHMENTS: 10,
    MAX_BLOCKERS: 10,
    MAX_NEXT_STEPS: 10
  },
  
  // UI
  TOAST_DURATION: 5000,
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 200,
  
  // Breakpoints (matching Tailwind)
  BREAKPOINTS: {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    '2XL': 1536
  },
  
  // Progress statuses
  PROGRESS_STATUSES: {
    NOT_STARTED: 0,
    IN_PROGRESS: { min: 1, max: 99 },
    COMPLETED: 100
  },
  
  // Priority levels
  PRIORITY_LEVELS: ['low', 'medium', 'high'],
  
  // Task statuses
  TASK_STATUSES: ['pending', 'in-progress', 'completed'],
  
  // Mood options for daily check-ins
  MOOD_OPTIONS: [
    { value: 'frustrated', label: '😤 Frustrated', color: 'red' },
    { value: 'blocked', label: '🚧 Blocked', color: 'orange' },
    { value: 'neutral', label: '😐 Neutral', color: 'gray' },
    { value: 'productive', label: '🚀 Productive', color: 'blue' },
    { value: 'creative', label: '🎨 Creative', color: 'purple' },
    { value: 'satisfied', label: '😊 Satisfied', color: 'green' },
    { value: 'excited', label: '🔥 Excited', color: 'yellow' }
  ]
}

// public/manifest.json - PWA Manifest
export const PWA_MANIFEST = {
  "name": "TaskFlow - Daily Progress Tracker",
  "short_name": "TaskFlow",
  "description": "Track your daily progress and manage tasks efficiently",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "#8B5CF6",
  "background_color": "#0F172A",
  "categories": ["productivity", "utilities"],
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/desktop.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    },
    {
      "src": "/screenshots/mobile.png", 
      "sizes": "375x667",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ]
}

// index.html meta tags for SEO and PWA
export const HTML_META_TAGS = `
<!-- Primary Meta Tags -->
<title>TaskFlow - Daily Progress Tracker</title>
<meta name="title" content="TaskFlow - Daily Progress Tracker">
<meta name="description" content="Track your daily progress, manage tasks efficiently, and boost productivity with TaskFlow's intuitive interface and progress analytics.">
<meta name="keywords" content="task management, progress tracking, productivity, daily tracker, time management">
<meta name="author" content="TaskFlow">
<meta name="robots" content="index, follow">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://yourapp.com/">
<meta property="og:title" content="TaskFlow - Daily Progress Tracker">
<meta property="og:description" content="Track your daily progress, manage tasks efficiently, and boost productivity with TaskFlow's intuitive interface and progress analytics.">
<meta property="og:image" content="https://yourapp.com/og-image.png">

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="https://yourapp.com/">
<meta property="twitter:title" content="TaskFlow - Daily Progress Tracker">
<meta property="twitter:description" content="Track your daily progress, manage tasks efficiently, and boost productivity with TaskFlow's intuitive interface and progress analytics.">
<meta property="twitter:image" content="https://yourapp.com/twitter-image.png">

<!-- Favicon -->
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">

<!-- PWA -->
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#8B5CF6">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="TaskFlow">

<!-- Viewport -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">

<!-- Preconnect to external domains -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
`

// utils/testing.js - Testing utilities and helpers
export const testing = {
  // Create mock task data
  createMockTask: (overrides = {}) => ({
    id: `task-${Date.now()}`,
    title: 'Test Task',
    description: 'This is a test task description',
    status: 'pending',
    priority: 'medium',
    progress: 0,
    totalHours: 0,
    timeEntries: [],
    dailyUpdates: [],
    progressHistory: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  }),

  // Create mock user data
  createMockUser: (overrides = {}) => ({
    id: `user-${Date.now()}`,
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    createdAt: new Date().toISOString(),
    ...overrides
  }),

  // Create mock analytics data
  createMockAnalytics: (tasks = []) => ({
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.progress === 100).length,
    inProgressTasks: tasks.filter(t => t.progress > 0 && t.progress < 100).length,
    notStartedTasks: tasks.filter(t => t.progress === 0).length,
    totalHours: tasks.reduce((sum, task) => sum + (task.totalHours || 0), 0),
    averageProgress: tasks.length > 0 
      ? tasks.reduce((sum, task) => sum + (task.progress || 0), 0) / tasks.length 
      : 0,
    progressDistribution: {
      notStarted: tasks.filter(t => t.progress === 0).length,
      early: tasks.filter(t => t.progress > 0 && t.progress <= 25).length,
      quarter: tasks.filter(t => t.progress > 25 && t.progress <= 50).length,
      half: tasks.filter(t => t.progress > 50 && t.progress <= 75).length,
      mostlyDone: tasks.filter(t => t.progress > 75 && t.progress < 100).length,
      completed: tasks.filter(t => t.progress === 100).length
    },
    recentActivity: tasks
      .filter(t => t.lastWorkedOn)
      .sort((a, b) => new Date(b.lastWorkedOn) - new Date(a.lastWorkedOn))
      .slice(0, 10)
  }),

  // Wait for async operations in tests
  waitFor: (condition, timeout = 5000) => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now()
      
      const check = () => {
        if (condition()) {
          resolve()
        } else if (Date.now() - startTime > timeout) {
          reject(new Error('Timeout waiting for condition'))
        } else {
          setTimeout(check, 100)
        }
      }
      
      check()
    })
  },

  // Simulate user interactions
  simulateClick: (element) => {
    const event = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    })
    element.dispatchEvent(event)
  },

  simulateKeyPress: (element, key) => {
    const event = new KeyboardEvent('keydown', {
      key,
      bubbles: true,
      cancelable: true
    })
    element.dispatchEvent(event)
  }
}

// utils/errorBoundary.jsx - Enhanced Error Boundary
import React from 'react'

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      eventId: null
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error, errorInfo)
    }

    // In production, send to error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to Sentry
      // const eventId = Sentry.captureException(error, {
      //   contexts: { react: { componentStack: errorInfo.componentStack } }
      // })
      // this.setState({ eventId })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-800 rounded-xl p-6 text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h1 className="text-xl font-bold text-white mb-2">Something went wrong</h1>
            <p className="text-gray-400 mb-6">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800"
              >
                Refresh Page
              </button>
              
              <button
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                className="w-full bg-slate-600 hover:bg-slate-500 text-white py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-800"
              >
                Try Again
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-sm text-gray-400 cursor-pointer">Error Details (Development)</summary>
                <pre className="mt-2 text-xs text-red-300 bg-slate-900 p-3 rounded overflow-auto max-h-40">
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// utils/serviceWorker.js - Service Worker registration
export const serviceWorker = {
  register: () => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      const swUrl = '/sw.js'
      
      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          logger.info('SW registered: ', registration)
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New version available
                  if (window.confirm('A new version is available. Refresh to update?')) {
                    window.location.reload()
                  }
                }
              })
            }
          })
        })
        .catch((error) => {
          logger.error('SW registration failed: ', error)
        })
    }
  },

  unregister: () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then((registration) => {
          registration.unregister()
        })
        .catch((error) => {
          logger.error('SW unregistration failed: ', error)
        })
    }
  }
}

// Enhanced API service with better error handling
export const enhancedApiService = {
  // Enhanced request with retry logic
  request: async (url, options = {}, retries = 3) => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), CONSTANTS.API_TIMEOUT)
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      return await response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      
      // Retry on network errors (but not on HTTP errors)
      if (retries > 0 && (error.name === 'AbortError' || error.name === 'TypeError')) {
        logger.warn(`Request failed, retrying... (${retries} attempts left)`)
        await new Promise(resolve => setTimeout(resolve, 1000))
        return this.request(url, options, retries - 1)
      }
      
      throw error
    }
  },

  // Check network connectivity
  isOnline: () => {
    return navigator.onLine
  },

  // Setup offline/online event listeners
  setupConnectivityListeners: (onOnline, onOffline) => {
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }
}

// Export all utilities
export * from './logger'
export * from './accessibility'
export * from './validation'
export * from './performance'
export * from './storage'