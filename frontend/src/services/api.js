class ApiService {
  constructor() {
    this.baseURL = 'http://localhost:5000/api'
    this.timeout = 30000 // 30 seconds
  }

  // Get authentication token
  getToken() {
    return localStorage.getItem('taskflow_auth_token')
  }

  // Get refresh token
  getRefreshToken() {
    return localStorage.getItem('taskflow_refresh_token')
  }

  // Get default headers
  getHeaders(isFormData = false) {
    const headers = {}
    
    if (!isFormData) {
      headers['Content-Type'] = 'application/json'
    }
    
    const token = this.getToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    
    return headers
  }

  // Handle response
  async handleResponse(response) {
    const contentType = response.headers.get('content-type')
    let data = {}
    
    // Try to parse JSON response
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json()
      } catch (e) {
        data = { message: 'Invalid JSON response' }
      }
    } else {
      data = { message: await response.text() || response.statusText }
    }

    if (!response.ok) {
      const error = new Error(data.message || `HTTP ${response.status}: ${response.statusText}`)
      error.status = response.status
      error.data = data
      throw error
    }

    return data
  }

  // Create request with timeout
  async requestWithTimeout(url, options) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        throw new Error('Request timeout')
      }
      throw error
    }
  }

  // Check if endpoint is auth-related (don't retry these)
  isAuthEndpoint(endpoint) {
    return endpoint.includes('/auth/login') || 
           endpoint.includes('/auth/register') || 
           endpoint.includes('/auth/refresh')
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      headers: this.getHeaders(options.isFormData),
      ...options,
    }

    try {
      console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`)
      const response = await this.requestWithTimeout(url, config)
      const data = await this.handleResponse(response)
      console.log(`✅ API Response:`, data)
      return data
    } catch (error) {
      console.error(`❌ API Error:`, error)
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to server. Make sure your backend is running on http://localhost:5000')
      }
      
      // Handle 401 errors (token expired) - but NOT for auth endpoints
      if (error.status === 401 && !this.isAuthEndpoint(endpoint)) {
        const refreshToken = this.getRefreshToken()
        if (refreshToken && this.getToken()) { // Only retry if we have both tokens
          try {
            console.log('🔄 Token expired, attempting refresh...')
            await this.refreshAuthToken()
            // Retry the original request with new token
            const retryConfig = {
              ...config,
              headers: this.getHeaders(options.isFormData)
            }
            console.log('🔄 Retrying original request with new token...')
            const retryResponse = await this.requestWithTimeout(url, retryConfig)
            return await this.handleResponse(retryResponse)
          } catch (refreshError) {
            console.error('❌ Token refresh failed:', refreshError)
            // Refresh failed, redirect to login
            this.handleAuthFailure()
            throw new Error('Authentication failed. Please log in again.')
          }
        } else {
          // No refresh token or no access token, just handle auth failure
          this.handleAuthFailure()
          throw new Error('Authentication required. Please log in.')
        }
      }
      
      throw error
    }
  }

  // Handle authentication failure
  handleAuthFailure() {
    localStorage.removeItem('taskflow_auth_token')
    localStorage.removeItem('taskflow_refresh_token')
    localStorage.removeItem('taskflow_user_data')
    
    // Dispatch custom event for auth failure
    window.dispatchEvent(new CustomEvent('auth:failure'))
  }

  // Refresh authentication token
  async refreshAuthToken() {
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await fetch(`${this.baseURL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken })
    })

    if (!response.ok) {
      throw new Error('Token refresh failed')
    }

    const data = await response.json()
    
    if (data.token) {
      localStorage.setItem('taskflow_auth_token', data.token)
      if (data.refreshToken) {
        localStorage.setItem('taskflow_refresh_token', data.refreshToken)
      }
      console.log('✅ Token refreshed successfully')
    }

    return data
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' })
  }

  // GET request with query parameters
  async getWithQuery(endpoint, params = {}) {
    const queryString = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => queryString.append(key, v))
        } else {
          queryString.append(key, value)
        }
      }
    })
    
    const fullEndpoint = queryString.toString() ? `${endpoint}?${queryString.toString()}` : endpoint
    return this.request(fullEndpoint, { method: 'GET' })
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // PATCH request
  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' })
  }

  // Upload file (FormData)
  async upload(endpoint, formData) {
    return this.request(endpoint, {
      method: 'POST',
      body: formData,
      isFormData: true
    })
  }

  // Health check
  async healthCheck() {
    try {
      const response = await this.get('/health')
      return response
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      }
    }
  }

  // Test connection to backend
  async testConnection() {
    try {
      const response = await fetch(`${this.baseURL.replace('/api', '')}`)
      const data = await response.json()
      console.log('🚀 Backend connection successful:', data)
      return { success: true, data }
    } catch (error) {
      console.error('❌ Backend connection failed:', error)
      return { 
        success: false, 
        error: 'Cannot connect to backend server. Make sure it\'s running on http://localhost:5000' 
      }
    }
  }

  // Utility method to check if user is authenticated
  isAuthenticated() {
    const token = this.getToken()
    if (!token) return false

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const now = Date.now() / 1000
      return payload.exp > now
    } catch (error) {
      return false
    }
  }

  // Set base URL (useful for environment switching)
  setBaseURL(url) {
    this.baseURL = url
  }

  // Get current base URL
  getBaseURL() {
    return this.baseURL
  }

  // Clear all tokens and user data
  clearAuth() {
    localStorage.removeItem('taskflow_auth_token')
    localStorage.removeItem('taskflow_refresh_token')
    localStorage.removeItem('taskflow_user_data')
  }
}

// Create and export singleton instance
const apiService = new ApiService()

// Handle global auth failures
window.addEventListener('auth:failure', () => {
  console.warn('Authentication failed - user needs to log in again')
})

// Test backend connection on startup
apiService.testConnection()

export default apiService