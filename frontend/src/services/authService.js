import apiService from './api'

class AuthService {
  constructor() {
    this.user = null
    this.token = null
    this.refreshTimer = null
    console.log('🔐 Real AuthService initialized - will connect to backend')
  }

  /**
   * Initialize authentication on app start
   * @returns {Promise<Object|null>} User object if authenticated, null otherwise
   */
  async initializeAuth() {
    try {
      console.log('🚀 Initializing authentication...')
      const token = this.getToken()
      const userData = this.getUserData()

      if (!token || !userData) {
        console.log('ℹ️ No stored auth data found')
        this.clearAuth()
        return null
      }

      // Check if token is expired
      if (!this.isTokenValid(token)) {
        console.log('⚠️ Token expired, attempting refresh...')
        try {
          await this.refreshToken()
          return this.getUserData()
        } catch (error) {
          console.log('❌ Token refresh failed')
          this.clearAuth()
          return null
        }
      }

      // Verify token with server
      try {
        const user = await this.getCurrentUser()
        this.user = user
        this.setupTokenRefresh()
        console.log('✅ Authentication initialized successfully')
        return user
      } catch (error) {
        console.log('⚠️ Server verification failed, trying refresh...')
        try {
          await this.refreshToken()
          const user = await this.getCurrentUser()
          this.user = user
          this.setupTokenRefresh()
          return user
        } catch (refreshError) {
          console.log('❌ Authentication failed completely')
          this.clearAuth()
          return null
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
      this.clearAuth()
      return null
    }
  }

  /**
   * Login user with credentials
   * @param {Object} credentials - Login credentials
   * @returns {Promise<Object>} Login response
   */
  async login(credentials) {
    try {
      console.log('🔐 Attempting login with backend...')
      const response = await apiService.post('/auth/login', credentials)

      if (response && (response.success || response.token)) {
        const user = response.user
        const token = response.token
        const refreshToken = response.refreshToken

        this.setAuthData(user, token, refreshToken)
        this.setupTokenRefresh()
        
        console.log('✅ Login successful')
        return {
          success: true,
          user,
          token,
          message: response.message || 'Login successful'
        }
      }

      throw new Error(response.message || 'Login failed - invalid response from server')
    } catch (error) {
      console.error('❌ Login failed:', error)
      throw new Error(this.parseError(error))
    }
  }

  /**
   * Register new user
   * @param {Object} userData - Registration data
   * @returns {Promise<Object>} Registration response
   */
  async register(userData) {
    try {
      console.log('📝 Attempting registration with backend...')
      const response = await apiService.post('/auth/register', userData)

      if (response && (response.success || response.token)) {
        const user = response.user
        const token = response.token
        const refreshToken = response.refreshToken

        this.setAuthData(user, token, refreshToken)
        this.setupTokenRefresh()
        
        console.log('✅ Registration successful')
        return {
          success: true,
          user,
          token,
          message: response.message || 'Registration successful'
        }
      }

      throw new Error(response.message || 'Registration failed - invalid response from server')
    } catch (error) {
      console.error('❌ Registration failed:', error)
      throw new Error(this.parseError(error))
    }
  }

  /**
   * Logout user
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      console.log('👋 Logging out...')
      const token = this.getToken()
      if (token) {
        await apiService.post('/auth/logout', {})
      }
      console.log('✅ Logout successful')
    } catch (error) {
      console.warn('⚠️ Logout request failed:', error)
    } finally {
      this.clearAuth()
      this.clearRefreshTimer()
    }
  }

  /**
   * Get current user profile
   * @returns {Promise<Object>} User profile
   */
  async getCurrentUser() {
    try {
      const response = await apiService.get('/auth/profile')
      
      if (response && response.user) {
        this.user = response.user
        this.setUserData(response.user)
        return response.user
      }

      // Handle different response formats
      if (response && response.id) {
        this.user = response
        this.setUserData(response)
        return response
      }

      throw new Error('Invalid user data received from server')
    } catch (error) {
      console.error('❌ Failed to get current user:', error)
      throw new Error(this.parseError(error))
    }
  }

  /**
   * Update user profile
   * @param {Object} userData - Updated user data
   * @returns {Promise<Object>} Updated user
   */
  async updateProfile(userData) {
    try {
      const response = await apiService.put('/auth/profile', userData)
      
      if (response && (response.user || response.success)) {
        const user = response.user || response
        this.user = user
        this.setUserData(user)
        return user
      }

      throw new Error('Failed to update profile')
    } catch (error) {
      throw new Error(this.parseError(error))
    }
  }

  /**
   * Change user password
   * @param {Object} passwordData - Password change data
   * @returns {Promise<Object>} Success response
   */
  async changePassword(passwordData) {
    try {
      const response = await apiService.post('/auth/change-password', passwordData)
      return response
    } catch (error) {
      throw new Error(this.parseError(error))
    }
  }

  /**
   * Refresh authentication token
   * @returns {Promise<string>} New token
   */
  async refreshToken() {
    try {
      const refreshToken = this.getRefreshToken()
      
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      const response = await apiService.post('/auth/refresh', {
        refreshToken
      })

      if (response && response.token) {
        this.setToken(response.token)
        
        if (response.refreshToken) {
          this.setRefreshToken(response.refreshToken)
        }

        if (response.user) {
          this.setUserData(response.user)
        }

        this.setupTokenRefresh()
        return response.token
      }

      throw new Error('Token refresh failed - invalid response')
    } catch (error) {
      this.clearAuth()
      throw new Error(this.parseError(error))
    }
  }

  /**
   * Parse error messages
   * @param {Error|Object|string} error 
   * @returns {string}
   */
  parseError(error) {
    if (typeof error === 'string') return error
    if (error?.message) return error.message
    if (error?.data?.message) return error.data.message
    return 'An unexpected error occurred'
  }

  /**
   * Set authentication data in localStorage
   * @param {Object} user - User data
   * @param {string} token - JWT token
   * @param {string} refreshToken - Refresh token
   */
  setAuthData(user, token, refreshToken) {
    this.user = user
    this.token = token

    localStorage.setItem('taskflow_auth_token', token)
    localStorage.setItem('taskflow_user_data', JSON.stringify(user))
    
    if (refreshToken) {
      localStorage.setItem('taskflow_refresh_token', refreshToken)
    }
  }

  /**
   * Get stored token
   * @returns {string|null} Stored token
   */
  getToken() {
    return this.token || localStorage.getItem('taskflow_auth_token')
  }

  /**
   * Set token in localStorage
   * @param {string} token - JWT token
   */
  setToken(token) {
    this.token = token
    localStorage.setItem('taskflow_auth_token', token)
  }

  /**
   * Get stored refresh token
   * @returns {string|null} Stored refresh token
   */
  getRefreshToken() {
    return localStorage.getItem('taskflow_refresh_token')
  }

  /**
   * Set refresh token in localStorage
   * @param {string} refreshToken - Refresh token
   */
  setRefreshToken(refreshToken) {
    localStorage.setItem('taskflow_refresh_token', refreshToken)
  }

  /**
   * Get stored user data
   * @returns {Object|null} Stored user data
   */
  getUserData() {
    try {
      const userData = localStorage.getItem('taskflow_user_data')
      return userData ? JSON.parse(userData) : null
    } catch (error) {
      console.error('Error parsing user data:', error)
      return null
    }
  }

  /**
   * Set user data in localStorage
   * @param {Object} user - User data
   */
  setUserData(user) {
    this.user = user
    localStorage.setItem('taskflow_user_data', JSON.stringify(user))
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    const token = this.getToken()
    return token && this.isTokenValid(token)
  }

  /**
   * Check if token is valid (not expired)
   * @param {string} token - JWT token
   * @returns {boolean} Token validity
   */
  isTokenValid(token) {
    if (!token) return false

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const now = Date.now() / 1000
      
      // Check if token expires within next 5 minutes
      return payload.exp > (now + 300)
    } catch (error) {
      return false
    }
  }

  /**
   * Setup automatic token refresh
   */
  setupTokenRefresh() {
    this.clearRefreshTimer()

    const token = this.getToken()
    if (!token) return

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const expiration = new Date(payload.exp * 1000)
      
      // Refresh token 5 minutes before expiration
      const refreshTime = expiration.getTime() - Date.now() - (5 * 60 * 1000)
      
      if (refreshTime > 0) {
        console.log(`⏰ Token refresh scheduled in ${Math.round(refreshTime / 1000 / 60)} minutes`)
        this.refreshTimer = setTimeout(async () => {
          try {
            await this.refreshToken()
          } catch (error) {
            console.error('Auto token refresh failed:', error)
            this.clearAuth()
            window.dispatchEvent(new CustomEvent('auth:failure', {
              detail: { reason: 'token_refresh_failed' }
            }))
          }
        }, refreshTime)
      }
    } catch (error) {
      console.error('Error setting up token refresh:', error)
    }
  }

  /**
   * Clear refresh timer
   */
  clearRefreshTimer() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
      this.refreshTimer = null
    }
  }

  /**
   * Clear all authentication data
   */
  clearAuth() {
    this.user = null
    this.token = null
    
    localStorage.removeItem('taskflow_auth_token')
    localStorage.removeItem('taskflow_refresh_token')
    localStorage.removeItem('taskflow_user_data')
    
    this.clearRefreshTimer()
  }
}

// Create and export singleton instance
const authService = new AuthService()

export default authService