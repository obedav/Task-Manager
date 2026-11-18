import { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react'
import api from '../services/api'

const Login = ({ onLogin, onRegister, loading, error }) => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotStatus, setForgotStatus] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isSignUp) {
      onRegister(formData)
    } else {
      onLogin({ email: formData.email, password: formData.password })
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setForgotLoading(true)
    setForgotStatus('')
    try {
      await api.post('/auth/forgot-password', { email: forgotEmail })
      setForgotStatus('success')
    } catch {
      setForgotStatus('success') // Always show success to prevent enumeration
    } finally {
      setForgotLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (isForgotPassword) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
        <div className="w-full max-w-md p-8 rounded-2xl border border-line" style={{ background: 'var(--surface)' }}>
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>Reset your password</h2>
          <p className="mb-6 text-sm" style={{ color: 'var(--text-muted)' }}>
            Enter your email and we'll send you a reset link if an account exists.
          </p>
          {forgotStatus === 'success' ? (
            <div className="p-4 rounded-lg" style={{ background: 'var(--success-bg)', border: '1px solid var(--success)', color: 'var(--success)' }}>
              Check your email for a password reset link. The link expires in 1 hour.
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label htmlFor="forgot-email" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Email address</label>
                <input
                  id="forgot-email" type="email" required value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  style={{ background: 'var(--surface-2)', color: 'var(--text)' }}
                />
              </div>
              <button type="submit" disabled={forgotLoading}
                className="w-full py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: 'var(--royal)' }}>
                {forgotLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}
          <button onClick={() => setIsForgotPassword(false)} className="mt-6 text-sm font-medium" style={{ color: 'var(--royal)' }}>
            ← Back to Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 login-container" style={{ background: 'var(--bg)' }}>
      {/* Subtle decorative blobs in brand colors */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20" style={{ background: 'var(--royal)' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-10" style={{ background: 'var(--gold)' }}></div>
      </div>

      <div className="relative w-full max-w-md mx-auto">
        <div className="rounded-3xl p-6 sm:p-8 shadow-2xl login-card" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--royal), var(--gold))' }}>
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>

            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--royal)' }}>
              TaskFlow
            </h1>

            <p style={{ color: 'var(--text-muted)' }}>
              {isSignUp ? 'Create your account to get started' : 'Welcome back! Sign in to continue'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <div>
                <label htmlFor="login-name" className="sr-only">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} aria-hidden="true" />
                  <input
                    id="login-name" type="text" name="name" placeholder="Full Name"
                    value={formData.name} onChange={handleChange} required
                    autoComplete="name"
                    className="w-full rounded-xl pl-12 pr-4 py-3 transition-all focus:outline-none"
                    style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    onFocus={e => { e.target.style.borderColor = 'var(--royal)'; e.target.style.boxShadow = '0 0 0 3px rgba(30,64,175,0.12)' }}
                    onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="login-email" className="sr-only">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} aria-hidden="true" />
                <input
                  id="login-email" type="email" name="email" placeholder="Email Address"
                  value={formData.email} onChange={handleChange} required
                  autoComplete="email"
                  className="w-full rounded-xl pl-12 pr-4 py-3 transition-all focus:outline-none"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  onFocus={e => { e.target.style.borderColor = 'var(--royal)'; e.target.style.boxShadow = '0 0 0 3px rgba(30,64,175,0.12)' }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="sr-only">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} aria-hidden="true" />
                <input
                  id="login-password" type={showPassword ? 'text' : 'password'} name="password"
                  placeholder="Password" value={formData.password} onChange={handleChange} required
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  className="w-full rounded-xl pl-12 pr-12 py-3 transition-all focus:outline-none"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  onFocus={e => { e.target.style.borderColor = 'var(--royal)'; e.target.style.boxShadow = '0 0 0 3px rgba(30,64,175,0.12)' }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl p-3" style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger)' }}>
                <p className="text-sm text-center" style={{ color: 'var(--danger)' }}>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-semibold py-3 px-6 rounded-xl transition-all transform hover:scale-105 disabled:scale-100 flex items-center justify-center space-x-2 disabled:opacity-60"
              style={{ background: 'var(--royal)' }}
              onMouseEnter={e => !loading && (e.currentTarget.style.background = 'var(--royal-dark)')}
              onMouseLeave={e => !loading && (e.currentTarget.style.background = 'var(--royal)')}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="text-center">
              <p className="mb-4" style={{ color: 'var(--text-muted)' }}>
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              {!isSignUp && (
                <button onClick={() => setIsForgotPassword(true)} className="ml-4 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                  Forgot password?
                </button>
              )}
              </p>

              <button
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setFormData({ name: '', email: '', password: '' })
                }}
                className="font-semibold transition-colors"
                style={{ color: 'var(--royal)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--royal-dark)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--royal)'}
              >
                {isSignUp ? 'Sign In' : 'Create Account'}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 text-center login-footer">
          <div className="flex items-center justify-center space-x-4 text-sm" style={{ color: 'var(--text-muted)' }}>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full" style={{ background: 'var(--success)' }}></div>
              <span>Secure</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full" style={{ background: 'var(--royal)' }}></div>
              <span>Fast</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full" style={{ background: 'var(--gold)' }}></div>
              <span>Modern</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login