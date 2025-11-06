'use client'

import { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, User, MapPin } from 'lucide-react'

interface AuthFormsProps {
  onLogin?: (email: string, password: string) => void;
  onSignup?: (userData: SignupData) => void;
  onForgotPassword?: (email: string) => void;
  initialMode?: 'login' | 'signup' | 'forgot';
}

interface SignupData {
  email: string;
  password: string;
  name: string;
  location: string;
}

export function AuthForms({
  onLogin = (email, password) => console.log('Login:', { email, password }),
  onSignup = (userData) => console.log('Signup:', userData),
  onForgotPassword = (email) => console.log('Forgot password:', email),
  initialMode = 'login'
}: AuthFormsProps = {}) {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    location: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePassword = (password: string) => {
    return password.length >= 8
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setIsLoading(true)

    const newErrors: Record<string, string> = {}
    
    if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (mode !== 'forgot') {
      if (!validatePassword(formData.password)) {
        newErrors.password = 'Password must be at least 8 characters'
      }
    }

    if (mode === 'signup') {
      if (!formData.name.trim()) {
        newErrors.name = 'Name is required'
      }
      if (!formData.location.trim()) {
        newErrors.location = 'Location is required'
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsLoading(false)
      return
    }

    await new Promise(resolve => setTimeout(resolve, 1500))

    try {
      if (mode === 'login') {
        onLogin(formData.email, formData.password)
      } else if (mode === 'signup') {
        onSignup({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          location: formData.location
        })
      } else {
        onForgotPassword(formData.email)
      }
    } catch (error) {
      setErrors({ general: 'Something went wrong. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="min-h-screen bg-background dark:bg-background flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        <div className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border p-8 shadow-lg">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/20 dark:bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-4 border border-primary/30 dark:border-primary/30">
              <MapPin className="w-8 h-8 text-primary dark:text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground dark:text-foreground mb-2">
              {mode === 'login' && 'Welcome Back'}
              {mode === 'signup' && 'Join the Adventure'}
              {mode === 'forgot' && 'Reset Password'}
            </h1>
            <p className="text-mutedForeground dark:text-mutedForeground text-sm">
              {mode === 'login' && 'Sign in to plan your next off-road adventure'}
              {mode === 'signup' && 'Create your account to start exploring'}
              {mode === 'forgot' && 'Enter your email to reset your password'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'signup' && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground dark:text-foreground mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-mutedForeground dark:text-mutedForeground" />
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full pl-11 pr-4 py-3 bg-background dark:bg-background border rounded-lg text-foreground dark:text-foreground placeholder-mutedForeground dark:placeholder-mutedForeground focus:outline-none focus:ring-2 focus:ring-ring/50 dark:focus:ring-ring/50 transition-all duration-150 hover:border-primary/50 dark:hover:border-primary/50 ${
                      errors.name ? 'border-destructive dark:border-destructive' : 'border-border dark:border-border focus:border-ring dark:focus:border-ring'
                    }`}
                    placeholder="Enter your full name"
                    aria-describedby={errors.name ? 'name-error' : undefined}
                  />
                </div>
                {errors.name && (
                  <p id="name-error" className="mt-2 text-sm text-destructive dark:text-destructive" role="alert">
                    {errors.name}
                  </p>
                )}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground dark:text-foreground mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-mutedForeground dark:text-mutedForeground" />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 bg-background dark:bg-background border rounded-lg text-foreground dark:text-foreground placeholder-mutedForeground dark:placeholder-mutedForeground focus:outline-none focus:ring-2 focus:ring-ring/50 dark:focus:ring-ring/50 transition-all duration-150 hover:border-primary/50 dark:hover:border-primary/50 ${
                    errors.email ? 'border-destructive dark:border-destructive' : 'border-border dark:border-border focus:border-ring dark:focus:border-ring'
                  }`}
                  placeholder="Enter your email"
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
              </div>
              {errors.email && (
                <p id="email-error" className="mt-2 text-sm text-destructive dark:text-destructive" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            {mode !== 'forgot' && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground dark:text-foreground mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-mutedForeground dark:text-mutedForeground" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full pl-11 pr-12 py-3 bg-background dark:bg-background border rounded-lg text-foreground dark:text-foreground placeholder-mutedForeground dark:placeholder-mutedForeground focus:outline-none focus:ring-2 focus:ring-ring/50 dark:focus:ring-ring/50 transition-all duration-150 hover:border-primary/50 dark:hover:border-primary/50 ${
                      errors.password ? 'border-destructive dark:border-destructive' : 'border-border dark:border-border focus:border-ring dark:focus:border-ring'
                    }`}
                    placeholder="Enter your password"
                    aria-describedby={errors.password ? 'password-error' : undefined}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-mutedForeground dark:text-mutedForeground hover:text-foreground dark:hover:text-foreground transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-ring/50 dark:focus:ring-ring/50 rounded p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p id="password-error" className="mt-2 text-sm text-destructive dark:text-destructive" role="alert">
                    {errors.password}
                  </p>
                )}
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-foreground dark:text-foreground mb-2">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-mutedForeground dark:text-mutedForeground" />
                  <input
                    id="location"
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className={`w-full pl-11 pr-4 py-3 bg-background dark:bg-background border rounded-lg text-foreground dark:text-foreground placeholder-mutedForeground dark:placeholder-mutedForeground focus:outline-none focus:ring-2 focus:ring-ring/50 dark:focus:ring-ring/50 transition-all duration-150 hover:border-primary/50 dark:hover:border-primary/50 ${
                      errors.location ? 'border-destructive dark:border-destructive' : 'border-border dark:border-border focus:border-ring dark:focus:border-ring'
                    }`}
                    placeholder="City, State"
                    aria-describedby={errors.location ? 'location-error' : undefined}
                  />
                </div>
                {errors.location && (
                  <p id="location-error" className="mt-2 text-sm text-destructive dark:text-destructive" role="alert">
                    {errors.location}
                  </p>
                )}
              </div>
            )}

            {errors.general && (
              <div className="p-3 bg-destructive/20 dark:bg-destructive/20 border border-destructive/30 dark:border-destructive/30 rounded-lg">
                <p className="text-sm text-destructive dark:text-destructive" role="alert">
                  {errors.general}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary dark:bg-primary text-primaryForeground dark:text-primaryForeground rounded-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-150 font-medium shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring/50 dark:focus:ring-ring/50 focus:ring-offset-2 focus:ring-offset-surface dark:focus:ring-offset-surface"
              style={{ minHeight: '48px' }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-primaryForeground/30 dark:border-primaryForeground/30 border-t-primaryForeground dark:border-t-primaryForeground rounded-full animate-spin mr-2"></div>
                  {mode === 'login' && 'Signing In...'}
                  {mode === 'signup' && 'Creating Account...'}
                  {mode === 'forgot' && 'Sending Reset Link...'}
                </div>
              ) : (
                <>
                  {mode === 'login' && 'Sign In'}
                  {mode === 'signup' && 'Create Account'}
                  {mode === 'forgot' && 'Send Reset Link'}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center space-y-3">
            {mode === 'login' && (
              <>
                <button
                  onClick={() => setMode('forgot')}
                  className="text-sm text-primary dark:text-primary hover:text-primary/80 dark:hover:text-primary/80 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-ring/50 dark:focus:ring-ring/50 rounded px-1 py-1"
                >
                  Forgot your password?
                </button>
                <div className="text-sm text-mutedForeground dark:text-mutedForeground">
                  Don't have an account?{' '}
                  <button
                    onClick={() => setMode('signup')}
                    className="text-primary dark:text-primary hover:text-primary/80 dark:hover:text-primary/80 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-ring/50 dark:focus:ring-ring/50 rounded px-1 py-1"
                  >
                    Sign up
                  </button>
                </div>
              </>
            )}

            {mode === 'signup' && (
              <div className="text-sm text-mutedForeground dark:text-mutedForeground">
                Already have an account?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="text-primary dark:text-primary hover:text-primary/80 dark:hover:text-primary/80 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-ring/50 dark:focus:ring-ring/50 rounded px-1 py-1"
                >
                  Sign in
                </button>
              </div>
            )}

            {mode === 'forgot' && (
              <div className="text-sm text-mutedForeground dark:text-mutedForeground">
                Remember your password?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="text-primary dark:text-primary hover:text-primary/80 dark:hover:text-primary/80 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-ring/50 dark:focus:ring-ring/50 rounded px-1 py-1"
                >
                  Sign in
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthFormsDemo() {
  return <AuthForms />
}