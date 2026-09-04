import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

/** Primary hook – consumes the AuthContext */
export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}

export default useAuth
