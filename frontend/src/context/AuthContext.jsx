import React, { createContext, useReducer, useEffect, useCallback } from 'react'
import authService from '../services/authService'

const AuthContext = createContext(null)

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  initialized: false
}

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_LOADING':
      return { ...state, loading: true, error: null }
    case 'AUTH_SUCCESS':
      return { ...state, user: action.payload, isAuthenticated: true, loading: false, error: null, initialized: true }
    case 'AUTH_ERROR':
      return { ...state, user: null, isAuthenticated: false, loading: false, error: action.payload, initialized: true }
    case 'AUTH_LOGOUT':
      return { ...state, user: null, isAuthenticated: false, loading: false, error: null, initialized: true }
    case 'UPDATE_USER':
      return { ...state, user: action.payload }
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    case 'SET_INITIALIZED':
      return { ...state, initialized: true, loading: false }
    default:
      return state
  }
}

const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // On mount: ask the server if we have a valid session (cookie-based)
  useEffect(() => {
    let cancelled = false
    authService.initializeAuth().then((user) => {
      if (cancelled) return
      if (user) {
        dispatch({ type: 'AUTH_SUCCESS', payload: user })
      } else {
        dispatch({ type: 'SET_INITIALIZED' })
      }
    })
    return () => { cancelled = true }
  }, [])

  // When API fires auth:failure, clear the session
  useEffect(() => {
    const handle = () => {
      if (state.isAuthenticated) dispatch({ type: 'AUTH_LOGOUT' })
    }
    window.addEventListener('auth:failure', handle)
    return () => window.removeEventListener('auth:failure', handle)
  }, [state.isAuthenticated])

  const login = useCallback(async (credentials) => {
    dispatch({ type: 'AUTH_LOADING' })
    try {
      const result = await authService.login(credentials)
      dispatch({ type: 'AUTH_SUCCESS', payload: result.user })
      return result
    } catch (err) {
      const msg = err?.message ?? 'Login failed'
      dispatch({ type: 'AUTH_ERROR', payload: msg })
      throw new Error(msg)
    }
  }, [])

  const register = useCallback(async (userData) => {
    dispatch({ type: 'AUTH_LOADING' })
    try {
      const result = await authService.register(userData)
      dispatch({ type: 'AUTH_SUCCESS', payload: result.user })
      return result
    } catch (err) {
      const msg = err?.message ?? 'Registration failed'
      dispatch({ type: 'AUTH_ERROR', payload: msg })
      throw new Error(msg)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } finally {
      dispatch({ type: 'AUTH_LOGOUT' })
    }
  }, [])

  const updateUser = useCallback((userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData })
  }, [])

  const clearError = useCallback(() => dispatch({ type: 'CLEAR_ERROR' }), [])

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateUser, clearError }}>
      {children}
    </AuthContext.Provider>
  )
}

const useAuthContext = () => {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within an AuthProvider')
  return ctx
}

export { AuthContext, AuthProvider, useAuthContext }
