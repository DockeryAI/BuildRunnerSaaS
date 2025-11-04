'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff, Mail, Lock, User, Mountain, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react'

interface User {
  id: string
  email: string
  name: string
  avatar?: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
}

interface AuthSystemProps {
  onAuthSuccess?: (user: User) => void
  onAuthError?: (error: string) => void
  initialMode?: 'login' | 'register'
  redirectUrl?: string
}

export function AuthSystem({
  onAuthSuccess = () => console.log('Auth success'),
  onAuthError = () => console.log('Auth error'),
  initialMode = 'login',
  redirectUrl = '/dashboard'
}: AuthSystemProps = {}) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError(null)
  }

  const validateForm = () => {
    if (!formData.email) {
      setError('Email is required')
      return false
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address')
      return false
    }

    if (mode !== 'forgot') {
      if (!formData.password) {
        setError('Password is required')
        return false
      }
      
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters')
        return false
      }
    }

    if (mode === 'register') {
      if (!formData.name) {
        setError('Name is required')
        return false
      }
      
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    setError(null)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      if (mode === 'forgot') {
        setSuccess('Password reset link sent to your email')
        setMode('login')
      } else {
        const user: User = {
          id: '1',
          email: formData.email,
          name: formData.name || 'Trail Explorer'
        }
        
        onAuthSuccess(user)
        setSuccess(mode === 'login' ? 'Welcome back!' : 'Account created successfully!')
      }
    } catch (err) {
      const errorMessage = mode === 'login' 
        ? 'Invalid email or password' 
        : 'Failed to create account. Please try again.'
      setError(errorMessage)
      onAuthError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ email: '', password: '', name: '', confirmPassword: '' })
    setError(null)
    setSuccess(null)
  }

  const switchMode = (newMode: 'login' | 'register' | 'forgot') => {
    setMode(newMode)
    resetForm()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'rgb(248, 250, 252)' }}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div 
              className="p-3 rounded-xl shadow-md"
              style={{ backgroundColor: 'rgb(34, 139, 34)' }}
            >
              <Mountain className="h-8 w-8" style={{ color: 'rgb(255, 255, 255)' }} />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'rgb(15, 23, 42)' }}>
            Trail Planner
          </h1>
          <p className="text-base" style={{ color: 'rgb(100, 116, 139)' }}>
            {mode === 'login' && 'Welcome back, adventurer'}
            {mode === 'register' && 'Start your off-road journey'}
            {mode === 'forgot' && 'Reset your password'}
          </p>
        </div>

        {/* Auth Form */}
        <div 
          className="p-8 rounded-xl shadow-lg border"
          style={{ 
            backgroundColor: 'rgb(255, 255, 255)',
            borderColor: 'rgb(226, 232, 240)'
          }}
        >
          {/* Success Message */}
          {success && (
            <div 
              className="flex items-center gap-3 p-4 rounded-lg mb-6"
              style={{ backgroundColor: 'rgb(240, 253, 244)' }}
            >
              <CheckCircle className="h-5 w-5" style={{ color: 'rgb(34, 139, 34)' }} />
              <span className="text-sm font-medium" style={{ color: 'rgb(34, 139, 34)' }}>
                {success}
              </span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div 
              className="flex items-center gap-3 p-4 rounded-lg mb-6"
              style={{ backgroundColor: 'rgb(254, 242, 242)' }}
            >
              <AlertCircle className="h-5 w-5" style={{ color: 'rgb(239, 68, 68)' }} />
              <span className="text-sm font-medium" style={{ color: 'rgb(239, 68, 68)' }}>
                {error}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field (Register only) */}
            {mode === 'register' && (
              <div>
                <label 
                  htmlFor="name"
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'rgb(15, 23, 42)' }}
                >
                  Full Name
                </label>
                <div className="relative">
                  <User 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5"
                    style={{ color: 'rgb(100, 116, 139)' }}
                  />
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
                    style={{ 
                      borderColor: 'rgb(226, 232, 240)',
                      backgroundColor: 'rgb(255, 255, 255)',
                      color: 'rgb(15, 23, 42)'
                    }}
                    placeholder="Enter your full name"
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label 
                htmlFor="email"
                className="block text-sm font-medium mb-2"
                style={{ color: 'rgb(15, 23, 42)' }}
              >
                Email Address
              </label>
              <div className="relative">
                <Mail 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5"
                  style={{ color: 'rgb(100, 116, 139)' }}
                />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
                  style={{ 
                    borderColor: 'rgb(226, 232, 240)',
                    backgroundColor: 'rgb(255, 255, 255)',
                    color: 'rgb(15, 23, 42)'
                  }}
                  placeholder="Enter your email"
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            {mode !== 'forgot' && (
              <div>
                <label 
                  htmlFor="password"
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'rgb(15, 23, 42)' }}
                >
                  Password
                </label>
                <div className="relative">
                  <Lock 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5"
                    style={{ color: 'rgb(100, 116, 139)' }}
                  />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full pl-10 pr-12 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
                    style={{ 
                      borderColor: 'rgb(226, 232, 240)',
                      backgroundColor: 'rgb(255, 255, 255)',
                      color: 'rgb(15, 23, 42)'
                    }}
                    placeholder="Enter your password"
                    disabled={isLoading}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded focus:outline-none focus:ring-2 focus:ring-offset-2"
                    style={{ color: 'rgb(100, 116, 139)' }}
                    disabled={isLoading}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Confirm Password Field (Register only) */}
            {mode === 'register' && (
              <div>
                <label 
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium mb-2"
                  style={{ color: 'rgb(15, 23, 42)' }}
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5"
                    style={{ color: 'rgb(100, 116, 139)' }}
                  />
                  <input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
                    style={{ 
                      borderColor: 'rgb(226, 232, 240)',
                      backgroundColor: 'rgb(255, 255, 255)',
                      color: 'rgb(15, 23, 42)'
                    }}
                    placeholder="Confirm your password"
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: isLoading ? 'rgb(100, 116, 139)' : 'rgb(34, 139, 34)',
                color: 'rgb(255, 255, 255)'
              }}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  {mode === 'login' && 'Sign In'}
                  {mode === 'register' && 'Create Account'}
                  {mode === 'forgot' && 'Send Reset Link'}
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 space-y-4">
            {mode === 'login' && (
              <>
                <button
                  type="button"
                  onClick={() => switchMode('forgot')}
                  className="block w-full text-center text-sm font-medium transition-colors"
                  style={{ color: 'rgb(34, 139, 34)' }}
                  disabled={isLoading}
                >
                  Forgot your password?
                </button>
                <div className="text-center">
                  <span className="text-sm" style={{ color: 'rgb(100, 116, 139)' }}>
                    Don't have an account?{' '}
                  </span>
                  <button
                    type="button"
                    onClick={() => switchMode('register')}
                    className="text-sm font-medium transition-colors"
                    style={{ color: 'rgb(34, 139, 34)' }}
                    disabled={isLoading}
                  >
                    Sign up
                  </button>
                </div>
              </>
            )}

            {mode === 'register' && (
              <div className="text-center">
                <span className="text-sm" style={{ color: 'rgb(100, 116, 139)' }}>
                  Already have an account?{' '}
                </span>
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-sm font-medium transition-colors"
                  style={{ color: 'rgb(34, 139, 34)' }}
                  disabled={isLoading}
                >
                  Sign in
                </button>
              </div>
            )}

            {mode === 'forgot' && (
              <div className="text-center">
                <span className="text-sm" style={{ color: 'rgb(100, 116, 139)' }}>
                  Remember your password?{' '}
                </span>
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="text-sm font-medium transition-colors"
                  style={{ color: 'rgb(34, 139, 34)' }}
                  disabled={isLoading}
                >
                  Sign in
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Terms */}
        <p className="text-center text-xs mt-6" style={{ color: 'rgb(100, 116, 139)' }}>
          By continuing, you agree to our{' '}
          <a href="#" className="underline" style={{ color: 'rgb(34, 139, 34)' }}>
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="underline" style={{ color: 'rgb(34, 139, 34)' }}>
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  )
}

export default function AuthSystemDemo() {
  return <AuthSystem />
}