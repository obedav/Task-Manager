// services/api.js - Production Ready API Service with Object Conversion Fixes
class ApiService {
  constructor() {
    // Use environment variables with fallback to existing URL
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    this.isProduction = import.meta.env.VITE_ENVIRONMENT === 'production'
    this.isDevelopment = import.meta.env.DEV
    this.timeout = 30000 // 30 seconds
    
    this.log('API Service initialized', {
      baseURL: this.baseURL,
      environment: import.meta.env.VITE_ENVIRONMENT,
      isProduction: this.isProduction
    })
  }

  // Safe stringify helper to prevent object conversion errors
  safeStringify(obj, fallback = 'Unable to serialize') {
    try {
      if (obj === null || obj === undefined) return 'null'
      if (typeof obj === 'string') return obj
      if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj)
      return JSON.stringify(obj, (key, value) => {
        // Handle circular references and complex objects
        if (typeof value === 'object' && value !== null) {
          if (value.constructor?.name && !['Object', 'Array'].includes(value.constructor.name)) {
            return `[${value.constructor.name}]`
          }
        }
        return value
      }, 2)
    } catch (e) {
      return fallback
    }
  }

  // Safe argument processing for logging
  processSafeArgs(...args) {
    return args.map(arg => {
      if (typeof arg === 'object' && arg !== null) {
        return this.safeStringify(arg)
      }
      return arg
    })
  }

  // Fixed logging methods
  log(...args) {
    if (this.isDevelopment) {
      const safeArgs = this.processSafeArgs(...args)
      console.log('🌐 [ApiService]', ...safeArgs)
    }
  }

  error(...args) {
    const safeArgs = this.processSafeArgs(...args)
    console.error('❌ [ApiService]', ...safeArgs)
  }

  warn(...args) {
    if (this.isDevelopment) {
      const safeArgs = this.processSafeArgs(...args)
      console.warn('⚠️ [ApiService]', ...safeArgs)
    }
  }

  // Enhanced token management with production security
  getToken() {
    if (this.isProduction) {
      // In production, we'll rely on httpOnly cookies for security
      // But still support localStorage for backward compatibility
      return localStorage.getItem('taskflow_auth_token')
    }
    return localStorage.getItem('taskflow_auth_token')
  }

  getRefreshToken() {
    return localStorage.getItem('taskflow_refresh_token')
  }

  // Enhanced headers with security
  getHeaders(isFormData = false) {
    const headers = {}
    
    if (!isFormData) {
      headers['Content-Type'] = 'application/json'
    }
    
    // Add security headers in production
    if (this.isProduction) {
      headers['X-Requested-With'] = 'XMLHttpRequest'
      headers['X-Content-Type-Options'] = 'nosniff'
    }
    
    const token = this.getToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    
    return headers
  }

  // Enhanced response handling with better error messages
  async handleResponse(response) {
    const contentType = response.headers.get('content-type')
    let data = {}
    
    try {
      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      } else {
        const textResponse = await response.text()
        data = { message: textResponse || response.statusText }
      }
    } catch (parseError) {
      this.error('Failed to parse response:', parseError.message)
      data = { message: 'Invalid response format from server' }
    }

    if (!response.ok) {
      let errorMessage = data?.message || `HTTP ${response.status}: ${response.statusText}`
      
      // User-friendly error messages
      if (response.status === 401) {
        errorMessage = 'Your session has expired. Please log in again.'
      } else if (response.status === 403) {
        errorMessage = 'You don\'t have permission to perform this action.'
      } else if (response.status === 404) {
        errorMessage = 'The requested resource was not found.'
      } else if (response.status === 500) {
        errorMessage = this.isProduction 
          ? 'Something went wrong on our end. Please try again later.'
          : data?.message || 'Internal server error'
      } else if (response.status >= 500) {
        errorMessage = 'Server is temporarily unavailable. Please try again later.'
      }
      
      const error = new Error(errorMessage)
      error.status = response.status
      error.data = this.safeStringify(data) // Use safe stringify
      error.originalMessage = data?.message || 'Unknown error'
      throw error
    }

    return data
  }

  // Enhanced timeout handling
  async requestWithTimeout(url, options) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        credentials: this.isProduction ? 'include' : 'same-origin' // Include cookies in production
      })
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please check your connection and try again.')
      }
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        const serverUrl = this.baseURL.replace('/api', '')
        throw new Error(`Unable to connect to server. Please check if the backend is running on ${serverUrl}`)
      }
      throw error
    }
  }

  // Check if endpoint is auth-related
  isAuthEndpoint(endpoint) {
    return endpoint.includes('/auth/login') || 
           endpoint.includes('/auth/register') || 
           endpoint.includes('/auth/refresh') ||
           endpoint.includes('/auth/logout')
  }

  // Enhanced request method with better error handling and logging
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      headers: this.getHeaders(options.isFormData),
      ...options,
    }

    try {
      this.log(`${options.method || 'GET'} ${endpoint}`)
      const response = await this.requestWithTimeout(url, config)
      const data = await this.handleResponse(response)
      this.log(`✅ ${options.method || 'GET'} ${endpoint} - Success`)
      return data
    } catch (error) {
      this.error(`${options.method || 'GET'} ${endpoint} - Failed:`, error.message)
      
      // Enhanced network error handling
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        const friendlyError = new Error('Network error: Please check your internet connection and try again.')
        friendlyError.originalError = error
        throw friendlyError
      }
      
      // Handle 401 errors (token expired) - but NOT for auth endpoints
      if (error.status === 401 && !this.isAuthEndpoint(endpoint)) {
        const refreshToken = this.getRefreshToken()
        if (refreshToken && this.getToken()) {
          try {
            this.log('🔄 Token expired, attempting refresh...')
            await this.refreshAuthToken()
            
            // Retry the original request with new token
            const retryConfig = {
              ...config,
              headers: this.getHeaders(options.isFormData)
            }
            this.log('🔄 Retrying original request with new token...')
            const retryResponse = await this.requestWithTimeout(url, retryConfig)
            const retryData = await this.handleResponse(retryResponse)
            this.log(`✅ ${options.method || 'GET'} ${endpoint} - Success after retry`)
            return retryData
          } catch (refreshError) {
            this.error('Token refresh failed:', refreshError.message)
            this.handleAuthFailure()
            throw new Error('Your session has expired. Please log in again.')
          }
        } else {
          this.handleAuthFailure()
          throw new Error('Please log in to continue.')
        }
      }
      
      throw error
    }
  }

  // Enhanced auth failure handling
  handleAuthFailure() {
    this.log('Handling authentication failure')
    
    // Clear all auth data
    localStorage.removeItem('taskflow_auth_token')
    localStorage.removeItem('taskflow_refresh_token')
    localStorage.removeItem('taskflow_user_data')
    
    // Dispatch custom event for auth failure
    window.dispatchEvent(new CustomEvent('auth:failure', {
      detail: { 
        message: 'Authentication failed',
        timestamp: new Date().toISOString()
      }
    }))
  }

  // Enhanced token refresh with better error handling
  async refreshAuthToken() {
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.isProduction && {
            'X-Requested-With': 'XMLHttpRequest',
            'X-Content-Type-Options': 'nosniff'
          })
        },
        credentials: this.isProduction ? 'include' : 'same-origin',
        body: JSON.stringify({ refreshToken }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to refresh authentication token')
      }

      const data = await response.json()
      
      if (data.token) {
        localStorage.setItem('taskflow_auth_token', data.token)
        if (data.refreshToken) {
          localStorage.setItem('taskflow_refresh_token', data.refreshToken)
        }
        this.log('✅ Token refreshed successfully')
      } else {
        throw new Error('Invalid refresh response')
      }

      return data
    } catch (error) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        throw new Error('Token refresh timed out')
      }
      throw error
    }
  }

  // HTTP Methods (unchanged but with enhanced logging)
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' })
  }

  async getWithQuery(endpoint, params = {}) {
    const queryString = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => queryString.append(key, String(v))) // Ensure string conversion
        } else {
          queryString.append(key, String(value)) // Ensure string conversion
        }
      }
    })
    
    const fullEndpoint = queryString.toString() ? `${endpoint}?${queryString.toString()}` : endpoint
    return this.request(fullEndpoint, { method: 'GET' })
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' })
  }

  async upload(endpoint, formData) {
    return this.request(endpoint, {
      method: 'POST',
      body: formData,
      isFormData: true
    })
  }

  // Enhanced health check
  async healthCheck() {
    try {
      const response = await this.get('/health')
      return {
        ...response,
        status: 'healthy',
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        status: 'error',
        message: this.isProduction 
          ? 'Service temporarily unavailable'
          : error.message,
        timestamp: new Date().toISOString(),
        details: this.isDevelopment ? error.message : undefined
      }
    }
  }

  // Enhanced connection test
  async testConnection() {
    try {
      const baseUrl = this.baseURL.replace('/api', '')
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // Shorter timeout for connection test

      const response = await fetch(baseUrl, {
        method: 'GET',
        signal: controller.signal,
        credentials: this.isProduction ? 'include' : 'same-origin'
      })
      
      clearTimeout(timeoutId)
      
      let data = { message: 'Server is running' }
      try {
        data = await response.json()
      } catch (e) {
        // Server might not return JSON for root endpoint
      }
      
      this.log('🚀 Backend connection successful')
      return { 
        success: true, 
        data,
        status: 'connected',
        baseURL: this.baseURL
      }
    } catch (error) {
      const errorMessage = this.isProduction
        ? 'Unable to connect to server. Please try again later.'
        : `Cannot connect to backend server at ${this.baseURL.replace('/api', '')}. Make sure it's running.`
      
      this.error('Backend connection failed:', error.message)
      return { 
        success: false, 
        error: errorMessage,
        details: this.isDevelopment ? error.message : undefined,
        baseURL: this.baseURL
      }
    }
  }

  // Enhanced authentication check
  isAuthenticated() {
    const token = this.getToken()
    if (!token) return false

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const now = Date.now() / 1000
      const isValid = payload.exp > now
      
      if (!isValid) {
        this.log('Token has expired')
      }
      
      return isValid
    } catch (error) {
      this.warn('Invalid token format:', error.message)
      return false
    }
  }

  // Environment-aware base URL setting
  setBaseURL(url) {
    this.log('Changing base URL from', this.baseURL, 'to', url)
    this.baseURL = url
  }

  getBaseURL() {
    return this.baseURL
  }

  // Enhanced auth clearing
  clearAuth() {
    this.log('Clearing authentication data')
    localStorage.removeItem('taskflow_auth_token')
    localStorage.removeItem('taskflow_refresh_token')
    localStorage.removeItem('taskflow_user_data')
    
    // In production, also call logout endpoint to clear httpOnly cookies
    if (this.isProduction) {
      this.post('/auth/logout', {}).catch(() => {
        // Ignore errors when clearing auth
      })
    }
  }

  // Get current user info from token
  getCurrentUser() {
    const token = this.getToken()
    if (!token) return null

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return {
        id: payload.id || payload.userId,
        email: payload.email,
        name: payload.name,
        exp: payload.exp
      }
    } catch (error) {
      this.warn('Cannot parse user from token:', error.message)
      return null
    }
  }

  // Fixed error reporting
  reportError(error, context = {}) {
    const errorData = {
      message: error?.message || 'Unknown error',
      stack: error?.stack || 'No stack trace',
      context: this.safeStringify(context),
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    }

    if (this.isProduction) {
      console.error('API Error:', this.safeStringify(errorData))
      // In production, you might want to send errors to a service like Sentry
    } else {
      console.error('API Error:', errorData)
    }
  }
}

// Create and export singleton instance
const apiService = new ApiService()

// Enhanced global auth failure handling
window.addEventListener('auth:failure', (event) => {
  const message = event.detail?.message || 'Authentication failed'
  console.warn(`🔐 ${message} - User needs to log in again`)
  
  // In production, you might want to show a user-friendly notification
  if (apiService.isProduction) {
    // Could dispatch to a global notification system
    window.dispatchEvent(new CustomEvent('notification:show', {
      detail: {
        type: 'warning',
        message: 'Your session has expired. Please log in again.',
        persistent: true
      }
    }))
  }
})

// Test backend connection on startup (only in development)
if (apiService.isDevelopment) {
  apiService.testConnection().then(result => {
    if (result.success) {
      console.log('✅ Backend connection established')
    } else {
      console.warn('⚠️ Backend connection failed:', result.error)
    }
  }).catch(error => {
    console.error('❌ Connection test failed:', error.message)
  })
}

export default apiService