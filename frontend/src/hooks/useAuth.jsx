import { useState, useEffect, useCallback, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import authService from '../services/authService'
import { parseError } from '../utils/helpers'

export const useAuth = () => {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}

export const useAuthState = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const initializeAuth = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const currentUser = await authService.initializeAuth()
      
      if (currentUser) {
        setUser(currentUser)
        setIsAuthenticated(true)
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('Auth initialization failed:', error)
      setError(parseError(error))
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  return {
    user,
    loading,
    error,
    isAuthenticated,
    initializeAuth
  }
}

export const useLogin = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { login: contextLogin } = useAuth()

  const login = useCallback(async (credentials) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await authService.login(credentials)
      
      if (result.success) {
        contextLogin(result.user, result.token)
        return result
      }
      
      throw new Error('Login failed')
    } catch (error) {
      const errorMessage = parseError(error)
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [contextLogin])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    login,
    loading,
    error,
    clearError
  }
}

export const useRegister = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { login: contextLogin } = useAuth()

  const register = useCallback(async (userData) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await authService.register(userData)
      
      if (result.success) {
        contextLogin(result.user, result.token)
        return result
      }
      
      throw new Error('Registration failed')
    } catch (error) {
      const errorMessage = parseError(error)
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [contextLogin])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    register,
    loading,
    error,
    clearError
  }
}

export const useLogout = () => {
  const [loading, setLoading] = useState(false)
  const { logout: contextLogout } = useAuth()

  const logout = useCallback(async () => {
    try {
      setLoading(true)
      await authService.logout()
      contextLogout()
    } catch (error) {
      console.error('Logout error:', error)
      contextLogout()
    } finally {
      setLoading(false)
    }
  }, [contextLogout])

  return {
    logout,
    loading
  }
}

export const useProfile = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { user, updateUser } = useAuth()

  const updateProfile = useCallback(async (profileData) => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await authService.updateProfile(profileData)
      
      if (result.success) {
        updateUser(result.user)
        return result
      }
      
      throw new Error('Profile update failed')
    } catch (error) {
      const errorMessage = parseError(error)
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [updateUser])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    user,
    updateProfile,
    loading,
    error,
    clearError
  }
}

export const usePasswordChange = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const changePassword = useCallback(async (passwordData) => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(false)
      
      const result = await authService.changePassword(passwordData)
      
      if (result.success) {
        setSuccess(true)
        return result
      }
      
      throw new Error('Password change failed')
    } catch (error) {
      const errorMessage = parseError(error)
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const clearMessages = useCallback(() => {
    setError(null)
    setSuccess(false)
  }, [])

  return {
    changePassword,
    loading,
    error,
    success,
    clearMessages
  }
}

export const usePasswordReset = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const requestReset = useCallback(async (email) => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(false)
      
      const result = await authService.requestPasswordReset(email)
      
      if (result.success) {
        setSuccess(true)
        return result
      }
      
      throw new Error('Password reset request failed')
    } catch (error) {
      const errorMessage = parseError(error)
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const resetPassword = useCallback(async (token, newPassword) => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(false)
      
      const result = await authService.resetPassword(token, newPassword)
      
      if (result.success) {
        setSuccess(true)
        return result
      }
      
      throw new Error('Password reset failed')
    } catch (error) {
      const errorMessage = parseError(error)
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const clearMessages = useCallback(() => {
    setError(null)
    setSuccess(false)
  }, [])

  return {
    requestReset,
    resetPassword,
    loading,
    error,
    success,
    clearMessages
  }
}

export const useEmailVerification = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const verifyEmail = useCallback(async (token) => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(false)
      
      const result = await authService.verifyEmail(token)
      
      if (result.success) {
        setSuccess(true)
        return result
      }
      
      throw new Error('Email verification failed')
    } catch (error) {
      const errorMessage = parseError(error)
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const resendVerification = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(false)
      
      const result = await authService.resendVerificationEmail()
      
      if (result.success) {
        setSuccess(true)
        return result
      }
      
      throw new Error('Failed to resend verification email')
    } catch (error) {
      const errorMessage = parseError(error)
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const clearMessages = useCallback(() => {
    setError(null)
    setSuccess(false)
  }, [])

  return {
    verifyEmail,
    resendVerification,
    loading,
    error,
    success,
    clearMessages
  }
}

export const useAuthGuard = (requiredRole = null) => {
  const { user, isAuthenticated, loading } = useAuth()
  const [canAccess, setCanAccess] = useState(false)

  useEffect(() => {
    if (loading) return

    if (!isAuthenticated) {
      setCanAccess(false)
      return
    }

    if (!requiredRole) {
      setCanAccess(true)
      return
    }

    if (Array.isArray(requiredRole)) {
      setCanAccess(requiredRole.includes(user?.role))
    } else {
      setCanAccess(user?.role === requiredRole)
    }
  }, [user, isAuthenticated, loading, requiredRole])

  return {
    canAccess,
    isAuthenticated,
    loading,
    user
  }
}

export const useAuthListener = () => {
  const [authEvents, setAuthEvents] = useState([])

  useEffect(() => {
    const unsubscribe = authService.addAuthListener((event, user) => {
      setAuthEvents(prev => [...prev.slice(-9), { event, user, timestamp: Date.now() }])
    })

    return unsubscribe
  }, [])

  const clearEvents = useCallback(() => {
    setAuthEvents([])
  }, [])

  return {
    authEvents,
    clearEvents
  }
}

export const useTokenRefresh = () => {
  const [refreshing, setRefreshing] = useState(false)
  const { logout } = useAuth()

  const refreshToken = useCallback(async () => {
    try {
      setRefreshing(true)
      await authService.refreshSession()
    } catch (error) {
      console.error('Token refresh failed:', error)
      logout()
    } finally {
      setRefreshing(false)
    }
  }, [logout])

  useEffect(() => {
    authService.setupTokenRefresh()
  }, [])

  return {
    refreshToken,
    refreshing
  }
}

export const useAuthRedirect = (redirectTo = '/login') => {
  const { isAuthenticated, loading } = useAuth()
  const [shouldRedirect, setShouldRedirect] = useState(false)

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setShouldRedirect(true)
    } else {
      setShouldRedirect(false)
    }
  }, [isAuthenticated, loading])

  return {
    shouldRedirect,
    redirectTo
  }
}

export const usePermissions = () => {
  const { user } = useAuth()

  const hasPermission = useCallback((permission) => {
    if (!user) return false
    
    const rolePermissions = {
      admin: ['read', 'write', 'delete', 'manage_users', 'manage_system'],
      manager: ['read', 'write', 'delete', 'manage_team'],
      user: ['read', 'write']
    }

    return rolePermissions[user.role]?.includes(permission) || false
  }, [user])

  const hasRole = useCallback((role) => {
    if (!user) return false
    return user.role === role
  }, [user])

  const hasAnyRole = useCallback((roles) => {
    if (!user) return false
    return roles.includes(user.role)
  }, [user])

  return {
    hasPermission,
    hasRole,
    hasAnyRole,
    userRole: user?.role
  }
}

export const useAuthPersistence = () => {
  const { user, token, isAuthenticated } = useAuth()
  const [persistenceEnabled, setPersistenceEnabled] = useState(true)

  const saveToPersistence = useCallback((key, data) => {
    if (!persistenceEnabled) return
    
    try {
      if (data === null || data === undefined) {
        localStorage.removeItem(key)
      } else {
        localStorage.setItem(key, JSON.stringify(data))
      }
    } catch (error) {
      console.warn('Failed to save to persistence:', error)
    }
  }, [persistenceEnabled])

  const loadFromPersistence = useCallback((key, defaultValue = null) => {
    if (!persistenceEnabled) return defaultValue
    
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.warn('Failed to load from persistence:', error)
      return defaultValue
    }
  }, [persistenceEnabled])

  const clearPersistence = useCallback(() => {
    try {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('preferences')
    } catch (error) {
      console.warn('Failed to clear persistence:', error)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      saveToPersistence('user', user)
      saveToPersistence('token', token)
    } else {
      clearPersistence()
    }
  }, [user, token, isAuthenticated, saveToPersistence, clearPersistence])

  return {
    saveToPersistence,
    loadFromPersistence,
    clearPersistence,
    persistenceEnabled,
    setPersistenceEnabled
  }
}

export const useAuthSession = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const [sessionData, setSessionData] = useState({
    startTime: null,
    lastActivity: null,
    isActive: false
  })

  const updateActivity = useCallback(() => {
    setSessionData(prev => ({
      ...prev,
      lastActivity: Date.now(),
      isActive: true
    }))
  }, [])

  const startSession = useCallback(() => {
    const now = Date.now()
    setSessionData({
      startTime: now,
      lastActivity: now,
      isActive: true
    })
  }, [])

  const endSession = useCallback(() => {
    setSessionData({
      startTime: null,
      lastActivity: null,
      isActive: false
    })
  }, [])

  const getSessionDuration = useCallback(() => {
    if (!sessionData.startTime) return 0
    return Date.now() - sessionData.startTime
  }, [sessionData.startTime])

  const getIdleTime = useCallback(() => {
    if (!sessionData.lastActivity) return 0
    return Date.now() - sessionData.lastActivity
  }, [sessionData.lastActivity])

  useEffect(() => {
    if (isAuthenticated && !sessionData.isActive) {
      startSession()
    } else if (!isAuthenticated && sessionData.isActive) {
      endSession()
    }
  }, [isAuthenticated, sessionData.isActive, startSession, endSession])

  useEffect(() => {
    if (!isAuthenticated) return

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    
    const handleActivity = () => {
      updateActivity()
    }

    events.forEach(event => {
      document.addEventListener(event, handleActivity, true)
    })

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true)
      })
    }
  }, [isAuthenticated, updateActivity])

  useEffect(() => {
    if (!isAuthenticated) return

    const checkIdleTimeout = () => {
      const idleTime = getIdleTime()
      const maxIdleTime = 30 * 60 * 1000 // 30 minutes

      if (idleTime > maxIdleTime) {
        logout()
      }
    }

    const intervalId = setInterval(checkIdleTimeout, 60000) // Check every minute

    return () => clearInterval(intervalId)
  }, [isAuthenticated, getIdleTime, logout])

  return {
    sessionData,
    updateActivity,
    getSessionDuration,
    getIdleTime,
    isSessionActive: sessionData.isActive
  }
}

export const useAuthErrors = () => {
  const [errors, setErrors] = useState([])
  const [lastError, setLastError] = useState(null)

  const addError = useCallback((error, context = null) => {
    const errorObj = {
      id: Date.now(),
      message: parseError(error),
      context,
      timestamp: new Date().toISOString()
    }

    setErrors(prev => [...prev.slice(-9), errorObj])
    setLastError(errorObj)
  }, [])

  const removeError = useCallback((id) => {
    setErrors(prev => prev.filter(error => error.id !== id))
  }, [])

  const clearErrors = useCallback(() => {
    setErrors([])
    setLastError(null)
  }, [])

  const clearLastError = useCallback(() => {
    setLastError(null)
  }, [])

  return {
    errors,
    lastError,
    addError,
    removeError,
    clearErrors,
    clearLastError,
    hasErrors: errors.length > 0
  }
}

export const useAuthDevTools = () => {
  const { user, token, isAuthenticated, loading } = useAuth()
  const [devMode, setDevMode] = useState(false)

  useEffect(() => {
    setDevMode(import.meta.env.MODE === 'development')
  }, [])

  const getAuthDebugInfo = useCallback(() => {
    if (!devMode) return null

    return {
      user: user ? { ...user, __type: 'User' } : null,
      token: token ? `${token.slice(0, 20)}...` : null,
      isAuthenticated,
      loading,
      tokenValid: token ? authService.isAuthenticated() : false,
      storageKeys: Object.keys(localStorage).filter(key => 
        key.includes('token') || key.includes('user') || key.includes('auth')
      ),
      timestamp: new Date().toISOString()
    }
  }, [user, token, isAuthenticated, loading, devMode])

  const logAuthState = useCallback(() => {
    if (!devMode) return
    
    const debugInfo = getAuthDebugInfo()
    console.group('🔐 Auth Debug Info')
    console.table(debugInfo)
    console.groupEnd()
  }, [getAuthDebugInfo, devMode])

  const clearAuthStorage = useCallback(() => {
    if (!devMode) return
    
    try {
      const authKeys = Object.keys(localStorage).filter(key => 
        key.includes('token') || key.includes('user') || key.includes('auth')
      )
      
      authKeys.forEach(key => localStorage.removeItem(key))
      console.log('🧹 Cleared auth storage:', authKeys)
    } catch (error) {
      console.error('Failed to clear auth storage:', error)
    }
  }, [devMode])

  const exportAuthState = useCallback(() => {
    if (!devMode) return null
    
    const debugInfo = getAuthDebugInfo()
    const dataStr = JSON.stringify(debugInfo, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `auth-debug-${Date.now()}.json`
    link.click()
    
    URL.revokeObjectURL(url)
  }, [getAuthDebugInfo, devMode])

  return {
    devMode,
    getAuthDebugInfo,
    logAuthState,
    clearAuthStorage,
    exportAuthState
  }
}

export const useMultiAccountAuth = () => {
  const [accounts, setAccounts] = useState([])
  const [activeAccount, setActiveAccount] = useState(null)
  const { login, logout } = useAuth()

  const addAccount = useCallback(async (credentials) => {
    try {
      const result = await authService.login(credentials)
      
      if (result.success) {
        const newAccount = {
          id: result.user.id,
          user: result.user,
          token: result.token,
          lastLogin: new Date().toISOString()
        }

        setAccounts(prev => {
          const filtered = prev.filter(acc => acc.id !== newAccount.id)
          return [...filtered, newAccount]
        })

        return newAccount
      }
    } catch (error) {
      throw error
    }
  }, [])

  const switchAccount = useCallback(async (accountId) => {
    const account = accounts.find(acc => acc.id === accountId)
    
    if (account) {
      await logout()
      authService.setAuthToken(account.token)
      await login({ email: account.user.email, password: null })
      setActiveAccount(account)
    }
  }, [accounts, login, logout])

  const removeAccount = useCallback((accountId) => {
    setAccounts(prev => prev.filter(acc => acc.id !== accountId))
    
    if (activeAccount?.id === accountId) {
      setActiveAccount(null)
    }
  }, [activeAccount])

  const clearAllAccounts = useCallback(() => {
    setAccounts([])
    setActiveAccount(null)
  }, [])

  return {
    accounts,
    activeAccount,
    addAccount,
    switchAccount,
    removeAccount,
    clearAllAccounts,
    hasMultipleAccounts: accounts.length > 1
  }
}

export default useAuth