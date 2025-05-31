import React, { createContext, useReducer, useEffect, useCallback } from 'react'
import authService from '../services/authService'

// Simple error parser function
const parseError = (error) => {
  if (typeof error === 'string') return error
  if (error?.message) return error.message
  if (error?.data?.message) return error.data.message
  return 'An unexpected error occurred'
}

const AuthContext = createContext(null)

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  initialized: false
}

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_LOADING':
      return {
        ...state,
        loading: true,
        error: null
      }

    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
        initialized: true
      }

    case 'AUTH_ERROR':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
        initialized: true
      }

    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        initialized: true
      }

    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload
      }

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      }

    case 'SET_INITIALIZED':
      return {
        ...state,
        initialized: true,
        loading: false
      }

    default:
      return state
  }
}

const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  const login = useCallback(async (credentials) => {
    try {
      dispatch({ type: 'AUTH_LOADING' })
      
      console.log('🔐 AuthContext: Attempting login...')
      const result = await authService.login(credentials)
      
      if (result.success) {
        console.log('✅ AuthContext: Login successful')
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: result.user,
            token: result.token
          }
        })
        return result
      }
      
      throw new Error('Login failed')
    } catch (error) {
      console.error('❌ AuthContext: Login error:', error)
      const errorMessage = parseError(error)
      dispatch({
        type: 'AUTH_ERROR',
        payload: errorMessage
      })
      throw new Error(errorMessage)
    }
  }, [])

  const register = useCallback(async (userData) => {
    try {
      dispatch({ type: 'AUTH_LOADING' })
      
      console.log('📝 AuthContext: Attempting registration...')
      const result = await authService.register(userData)
      
      if (result.success) {
        console.log('✅ AuthContext: Registration successful')
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: result.user,
            token: result.token
          }
        })
        return result
      }
      
      throw new Error('Registration failed')
    } catch (error) {
      console.error('❌ AuthContext: Registration error:', error)
      const errorMessage = parseError(error)
      dispatch({
        type: 'AUTH_ERROR',
        payload: errorMessage
      })
      throw new Error(errorMessage)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      console.log('👋 AuthContext: Logging out...')
      await authService.logout()
      console.log('✅ AuthContext: Logout successful')
    } catch (error) {
      console.error('⚠️ AuthContext: Logout error:', error)
    } finally {
      dispatch({ type: 'AUTH_LOGOUT' })
    }
  }, [])

  const updateUser = useCallback((userData) => {
    console.log('👤 AuthContext: Updating user data')
    dispatch({
      type: 'UPDATE_USER',
      payload: userData
    })
  }, [])

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' })
  }, [])

  const refreshAuth = useCallback(async () => {
    try {
      console.log('🔄 AuthContext: Refreshing auth...')
      const user = await authService.getCurrentUser()
      if (user) {
        console.log('✅ AuthContext: Auth refreshed successfully')
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user,
            token: authService.getToken()
          }
        })
      } else {
        console.log('ℹ️ AuthContext: No user found during refresh')
        dispatch({ type: 'SET_INITIALIZED' })
      }
    } catch (error) {
      console.error('❌ AuthContext: Auth refresh failed:', error)
      dispatch({ type: 'SET_INITIALIZED' })
    }
  }, [])

  const initializeAuth = useCallback(async () => {
    try {
      console.log('🚀 AuthContext: Initializing authentication...')
      const user = await authService.initializeAuth()
      
      if (user) {
        console.log('✅ AuthContext: Authentication initialized with user')
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user,
            token: authService.getToken()
          }
        })
      } else {
        console.log('ℹ️ AuthContext: No authenticated user found')
        dispatch({ type: 'SET_INITIALIZED' })
      }
    } catch (error) {
      console.error('❌ AuthContext: Auth initialization failed:', error)
      dispatch({
        type: 'AUTH_ERROR',
        payload: parseError(error)
      })
    }
  }, [])

  // Initialize auth on mount
  useEffect(() => {
    console.log('🔧 AuthContext: Setting up authentication...')
    initializeAuth()
  }, [initializeAuth])

  // Handle storage changes (multi-tab auth sync)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'taskflow_auth_token') {
        if (!e.newValue && state.isAuthenticated) {
          console.log('🔄 AuthContext: Token removed in another tab, logging out')
          dispatch({ type: 'AUTH_LOGOUT' })
        } else if (e.newValue && !state.isAuthenticated) {
          console.log('🔄 AuthContext: Token added in another tab, refreshing auth')
          refreshAuth()
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [state.isAuthenticated, refreshAuth])

  // Handle auth failures from API service
  useEffect(() => {
    const handleAuthFailure = (event) => {
      console.log('🚨 AuthContext: Auth failure detected:', event.detail)
      if (state.isAuthenticated) {
        dispatch({ type: 'AUTH_LOGOUT' })
      }
    }

    window.addEventListener('auth:failure', handleAuthFailure)
    return () => window.removeEventListener('auth:failure', handleAuthFailure)
  }, [state.isAuthenticated])

  // Check token expiry periodically
  useEffect(() => {
    let intervalId

    if (state.isAuthenticated && state.token) {
      const checkTokenExpiry = () => {
        if (!authService.isAuthenticated()) {
          console.log('⏰ AuthContext: Token expired, logging out')
          dispatch({ type: 'AUTH_LOGOUT' })
        }
      }

      intervalId = setInterval(checkTokenExpiry, 60000) // Check every minute
      console.log('⏰ AuthContext: Token expiry check started')
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
        console.log('⏰ AuthContext: Token expiry check stopped')
      }
    }
  }, [state.isAuthenticated, state.token])

  const contextValue = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    clearError,
    refreshAuth,
    initializeAuth
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

const useAuthContext = () => {
  const context = React.useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  
  return context
}

const AuthGuard = ({ children, requireAuth = true, fallback = null }) => {
  const { isAuthenticated, loading, error } = useAuthContext()

  if (loading) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white">Connecting to server...</p>
          <p className="text-gray-400 text-sm mt-2">Make sure your backend is running on port 5000</p>
        </div>
      </div>
    )
  }

  if (requireAuth && !isAuthenticated) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Authentication Required</h2>
          <p className="text-gray-400 mb-4">Please log in to access this content.</p>
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mt-4 max-w-md">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return children
}

console.log(`
🔗 USING REAL BACKEND SERVICES
🌐 API Base URL: http://localhost:5000/api
⚠️  Make sure your backend server is running!
`)

export {
  AuthContext,
  AuthProvider,
  useAuthContext,
  AuthGuard
}