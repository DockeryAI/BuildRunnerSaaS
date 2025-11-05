'use client'

import { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, User, MapPin } from 'lucide-react'

interface AuthFormsProps {
  onAuthSuccess?: (user: User) => void;
  defaultMode?: 'login' | 'register';
}

interface User {
  id: string;
  email: string;
  name: string;
  location?: string;
}

interface FormData {
  email: string;
  password: string;
  name?: string;
  location?: string;
}

export function AuthForms({
  onAuthSuccess = () => console.log('Auth success'),
  defaultMode = 'login'
}: AuthFormsProps = {}) {
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    name: '',
    location: ''
  })
  const [errors, setErrors] = useState<Partial<FormData>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (mode === 'register') {
      if (!formData.name) {
        newErrors.name = 'Name is required'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      const user: User = {
        id: Math.random().toString(36).substr(2, 9),
        email: formData.email,
        name: formData.name || formData.email.split('@')[0],
        location: formData.location
      }
      
      onAuthSuccess(user)
      setIsLoading(false)
    }, 1500)
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const toggleMode = () => {
    setMode(prev => prev === 'login' ? 'register' : 'login')
    setErrors({})
    setFormData({ email: '', password: '', name: '', location: '' })
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[rgb(34,139,34)] rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[rgb(15,23,42)] mb-2">
            {mode === 'login' ? 'Welcome Back' : 'Join the Adventure'}
          </h1>
          <p className="text-[rgb(100,116,139)] text-sm">
            {mode === 'login' 
              ? 'Sign in to plan your next off-road adventure'
              : 'Create your account to start exploring'
            }
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[rgb(100,116,139)]" />
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg text-[rgb(15,23,42)] placeholder-[rgb(148,163,184)] focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent transition-all duration-200 ${
                    errors.name ? 'border-[rgb(220,38,38)]' : 'border-[rgb(226,232,240)]'
                  }`}
                  placeholder="Enter your full name"
                  aria-describedby={errors.name ? 'name-error' : undefined}
                />
              </div>
              {errors.name && (
                <p id="name-error" className="mt-1 text-sm text-[rgb(220,38,38)]" role="alert">
                  {errors.name}
                </p>
              )}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[rgb(100,116,139)]" />
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg text-[rgb(15,23,42)] placeholder-[rgb(148,163,184)] focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent transition-all duration-200 ${
                  errors.email ? 'border-[rgb(220,38,38)]' : 'border-[rgb(226,232,240)]'
                }`}
                placeholder="Enter your email"
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
            </div>
            {errors.email && (
              <p id="email-error" className="mt-1 text-sm text-[rgb(220,38,38)]" role="alert">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[rgb(100,116,139)]" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`w-full pl-10 pr-12 py-3 border rounded-lg text-[rgb(15,23,42)] placeholder-[rgb(148,163,184)] focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent transition-all duration-200 ${
                  errors.password ? 'border-[rgb(220,38,38)]' : 'border-[rgb(226,232,240)]'
                }`}
                placeholder="Enter your password"
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-[rgb(100,116,139)] hover:text-[rgb(15,23,42)] transition-colors duration-200"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="mt-1 text-sm text-[rgb(220,38,38)]" role="alert">
                {errors.password}
              </p>
            )}
          </div>

          {mode === 'register' && (
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                Location (Optional)
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[rgb(100,116,139)]" />
                <input
                  id="location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] placeholder-[rgb(148,163,184)] focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent transition-all duration-200"
                  placeholder="City, State"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[rgb(34,139,34)] text-white py-3 px-4 rounded-lg font-medium hover:bg-[rgb(46,125,50)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(34,139,34)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg active:scale-95"
            style={{ minHeight: '48px' }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                {mode === 'login' ? 'Signing In...' : 'Creating Account...'}
              </div>
            ) : (
              mode === 'login' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-6 text-center">
          <p className="text-[rgb(100,116,139)] text-sm">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
            <button
              onClick={toggleMode}
              className="ml-1 text-[rgb(34,139,34)] font-medium hover:text-[rgb(46,125,50)] focus:outline-none focus:underline transition-colors duration-200"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        {/* Demo Notice */}
        <div className="mt-8 p-4 bg-[rgb(248,250,252)] border border-[rgb(226,232,240)] rounded-lg">
          <p className="text-xs text-[rgb(100,116,139)] text-center">
            Demo mode: Use any email and password (6+ characters)
          </p>
        </div>
      </div>
    </div>
  )
}

// Demo component for page.tsx
export default function AuthFormsDemo() {
  const handleAuthSuccess = (user: User) => {
    console.log('User authenticated:', user)
    alert(`Welcome ${user.name}! Authentication successful.`)
  }

  return <AuthForms onAuthSuccess={handleAuthSuccess} />
}