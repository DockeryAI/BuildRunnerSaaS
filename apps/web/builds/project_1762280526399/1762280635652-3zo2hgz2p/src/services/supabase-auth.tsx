'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff, Mail, Lock, User, Mountain } from 'lucide-react'

interface AuthUser {
  id: string
  email: string
  name: string
  avatar?: string
}

interface AuthState {
  user: AuthUser | null
  loading: boolean
  error: string | null
}

interface SupabaseAuthProps {
  onAuthStateChange?: (user: AuthUser | null) => void
  redirectTo?: string
  showSignUp?: boolean
}

export function SupabaseAuth({
  onAuthStateChange = () => {},
  redirectTo = '/dashboard',
  showSignUp = true
}: SupabaseAuthProps = {}) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: false,
    error: null
  })
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  })

  // Simulate auth state check on mount
  useEffect(() => {
    const checkAuthState = async () => {
      setAuthState(prev => ({ ...prev, loading: true }))
      
      // Simulate checking for existing session
      setTimeout(() => {
        const savedUser = localStorage.getItem('auth_user')
        if (savedUser) {
          const user = JSON.parse(savedUser)
          setAuthState({ user, loading: false, error: null })
          onAuthStateChange(user)
        } else {
          setAuthState(prev => ({ ...prev, loading: false }))
        }
      }, 1000)
    }

    checkAuthState()
  }, [onAuthStateChange])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (authState.error) {
      setAuthState(prev => ({ ...prev, error: null }))
    }
  }

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      return 'Email and password are required'
    }
    
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      return 'Please enter a valid email address'
    }
    
    if (formData.password.length < 6) {
      return 'Password must be at least 6 characters'
    }
    
    if (isSignUp) {
      if (!formData.name.trim()) {
        return 'Name is required for sign up'
      }
      if (formData.password !== formData.confirmPassword) {
        return 'Passwords do not match'
      }
    }
    
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationError = validateForm()
    if (validationError) {
      setAuthState(prev => ({ ...prev, error: validationError }))
      return
    }

    setAuthState(prev => ({ ...prev, loading: true, error: null }))

    // Simulate API call
    setTimeout(() => {
      try {
        // Simulate different outcomes
        const shouldSucceed = Math.random() > 0.2 // 80% success rate for demo
        
        if (!shouldSucceed) {
          throw new Error(isSignUp ? 'Email already exists' : 'Invalid credentials')
        }

        const user: AuthUser = {
          id: `user_${Date.now()}`,
          email: formData.email,
          name: isSignUp ? formData.name : formData.email.split('@')[0],
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.email}`
        }

        localStorage.setItem('auth_user', JSON.stringify(user))
        setAuthState({ user, loading: false, error: null })
        onAuthStateChange(user)
        
        // Simulate redirect
        console.log(`Redirecting to ${redirectTo}`)
      } catch (error) {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Authentication failed'
        }))
      }
    }, 1500)
  }

  const handleSignOut = () => {
    localStorage.removeItem('auth_user')
    setAuthState({ user: null, loading: false, error: null })
    setFormData({ email: '', password: '', name: '', confirmPassword: '' })
    onAuthStateChange(null)
  }

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp)
    setAuthState(prev => ({ ...prev, error: null }))
    setFormData(prev => ({ ...prev, confirmPassword: '', name: '' }))
  }

  // Loading skeleton
  if (authState.loading && !authState.user) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md border border-[rgb(226,232,240)]">
        <div className="flex items-center justify-center mb-6">
          <div className="w-8 h-8 bg-[rgb(241,245,249)] rounded animate-pulse"></div>
          <div className="ml-2 w-24 h-6 bg-[rgb(241,245,249)] rounded animate-pulse"></div>
        </div>
        <div className="space-y-4">
          <div className="w-full h-10 bg-[rgb(241,245,249)] rounded animate-pulse"></div>
          <div className="w-full h-10 bg-[rgb(241,245,249)] rounded animate-pulse"></div>
          <div className="w-full h-10 bg-[rgb(241,245,249)] rounded animate-pulse"></div>
        </div>
      </div>
    )
  }

  // Authenticated state
  if (authState.user) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md border border-[rgb(226,232,240)]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden bg-[rgb(241,245,249)]">
            {authState.user.avatar ? (
              <img 
                src={authState.user.avatar} 
                alt={authState.user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-8 h-8 text-[rgb(15,23,42)]" />
              </div>
            )}
          </div>
          <h2 className="text-xl font-semibold text-[rgb(15,23,42)] mb-1">
            Welcome back!
          </h2>
          <p className="text-sm text-[rgb(15,23,42)] opacity-70 mb-2">
            {authState.user.name}
          </p>
          <p className="text-xs text-[rgb(15,23,42)] opacity-50 mb-6">
            {authState.user.email}
          </p>
          <button
            onClick={handleSignOut}
            className="w-full px-4 py-2 bg-[rgb(239,68,68)] text-white rounded-md hover:bg-[rgb(220,38,38)] transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(239,68,68)]"
            aria-label="Sign out of your account"
          >
            Sign Out
          </button>
        </div>
      </div>
    )
  }

  // Authentication form
  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md border border-[rgb(226,232,240)]">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-4">
          <Mountain className="w-8 h-8 text-[rgb(34,139,34)]" />
          <span className="ml-2 text-xl font-bold text-[rgb(15,23,42)]">
            TrailPlan
          </span>
        </div>
        <h1 className="text-2xl font-semibold text-[rgb(15,23,42)] mb-2">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h1>
        <p className="text-sm text-[rgb(15,23,42)] opacity-70">
          {isSignUp 
            ? 'Join the adventure and start planning your off-road trips'
            : 'Sign in to continue planning your adventures'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignUp && (
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[rgb(15,23,42)] mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[rgb(15,23,42)] opacity-50" />
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-[rgb(226,232,240)] rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent font-medium"
                placeholder="Enter your full name"
                aria-describedby={authState.error ? 'auth-error' : undefined}
              />
            </div>
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[rgb(15,23,42)] mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[rgb(15,23,42)] opacity-50" />
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-[rgb(226,232,240)] rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent font-medium"
              placeholder="Enter your email"
              aria-describedby={authState.error ? 'auth-error' : undefined}
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[rgb(15,23,42)] mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[rgb(15,23,42)] opacity-50" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-[rgb(226,232,240)] rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent font-medium"
              placeholder="Enter your password"
              aria-describedby={authState.error ? 'auth-error' : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[rgb(15,23,42)] opacity-50 hover:opacity-70 focus:outline-none"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {isSignUp && (
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-[rgb(15,23,42)] mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[rgb(15,23,42)] opacity-50" />
              <input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-[rgb(226,232,240)] rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent font-medium"
                placeholder="Confirm your password"
                aria-describedby={authState.error ? 'auth-error' : undefined}
              />
            </div>
          </div>
        )}

        {authState.error && (
          <div 
            id="auth-error"
            className="p-3 bg-red-50 border border-red-200 rounded-md"
            role="alert"
            aria-live="polite"
          >
            <p className="text-sm text-[rgb(239,68,68)] font-medium">
              {authState.error}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={authState.loading}
          className="w-full px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-md hover:bg-[rgb(22,101,22)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(34,139,34)] min-h-[44px] flex items-center justify-center"
          aria-label={isSignUp ? 'Create your account' : 'Sign in to your account'}
        >
          {authState.loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            isSignUp ? 'Create Account' : 'Sign In'
          )}
        </button>
      </form>

      {showSignUp && (
        <div className="mt-6 text-center">
          <p className="text-sm text-[rgb(15,23,42)] opacity-70">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button
              onClick={toggleAuthMode}
              className="ml-1 text-[rgb(34,139,34)] hover:text-[rgb(22,101,22)] font-medium focus:outline-none focus:underline"
              aria-label={isSignUp ? 'Switch to sign in' : 'Switch to sign up'}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      )}
    </div>
  )
}

// Demo component for page.tsx
export default function SupabaseAuthDemo() {
  const handleAuthStateChange = (user: AuthUser | null) => {
    console.log('Auth state changed:', user)
  }

  return (
    <div className="min-h-screen bg-[rgb(248,250,252)] py-12 px-4">
      <SupabaseAuth 
        onAuthStateChange={handleAuthStateChange}
        redirectTo="/dashboard"
        showSignUp={true}
      />
    </div>
  )
}