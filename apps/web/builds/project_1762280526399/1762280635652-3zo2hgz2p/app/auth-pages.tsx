'use client'

import { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, User, Mountain, Calendar, Users, MessageCircle } from 'lucide-react'

interface AuthPagesProps {
  onAuthSuccess?: (user: User) => void;
  initialMode?: 'login' | 'register';
}

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface FormData {
  email: string;
  password: string;
  name?: string;
  confirmPassword?: string;
}

export function AuthPages({
  onAuthSuccess = () => console.log('Auth success'),
  initialMode = 'login'
}: AuthPagesProps = {}) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  })

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError('')
  }

  const validateForm = (): boolean => {
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields')
      return false
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address')
      return false
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return false
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
    setError('')

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const user: User = {
        id: '1',
        email: formData.email,
        name: formData.name || formData.email.split('@')[0]
      }
      
      onAuthSuccess(user)
    } catch (err) {
      setError('Authentication failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const features = [
    {
      icon: <Mountain className="w-6 h-6" />,
      title: "Location Planning",
      description: "Save and organize your favorite off-road destinations"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Group Management",
      description: "Assign tasks and coordinate with your adventure crew"
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Smart Scheduling",
      description: "Weather integration and calendar sync for perfect timing"
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Group Chat",
      description: "Stay connected with your team before, during, and after trips"
    }
  ]

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Left Panel - Features */}
      <div className="lg:w-1/2 p-6 lg:p-12 flex flex-col justify-center" style={{ backgroundColor: 'rgb(34, 139, 34)' }}>
        <div className="max-w-md mx-auto lg:mx-0">
          <div className="flex items-center gap-3 mb-8">
            <Mountain className="w-8 h-8" style={{ color: 'rgb(255, 255, 255)' }} />
            <h1 className="text-2xl font-bold" style={{ color: 'rgb(255, 255, 255)' }}>
              TrailPlan
            </h1>
          </div>
          
          <h2 className="text-3xl lg:text-4xl font-bold mb-6" style={{ color: 'rgb(255, 255, 255)' }}>
            Plan Epic Off-Road Adventures
          </h2>
          
          <p className="text-lg mb-8 opacity-90" style={{ color: 'rgb(255, 255, 255)' }}>
            Organize locations, coordinate your crew, and make every trail ride unforgettable.
          </p>

          <div className="space-y-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                  <div style={{ color: 'rgb(255, 255, 255)' }}>
                    {feature.icon}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-1" style={{ color: 'rgb(255, 255, 255)' }}>
                    {feature.title}
                  </h3>
                  <p className="text-sm opacity-80" style={{ color: 'rgb(255, 255, 255)' }}>
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="lg:w-1/2 p-6 lg:p-12 flex flex-col justify-center" style={{ backgroundColor: 'rgb(255, 255, 255)' }}>
        <div className="max-w-md mx-auto w-full">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2" style={{ color: 'rgb(15, 23, 42)' }}>
              {mode === 'login' ? 'Welcome Back' : 'Join TrailPlan'}
            </h2>
            <p style={{ color: 'rgb(100, 116, 139)' }}>
              {mode === 'login' 
                ? 'Sign in to access your adventure dashboard' 
                : 'Create your account to start planning adventures'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'register' && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2" style={{ color: 'rgb(15, 23, 42)' }}>
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'rgb(100, 116, 139)' }} />
                  <input
                    id="name"
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
                    style={{ 
                      borderColor: 'rgb(226, 232, 240)',
                      backgroundColor: 'rgb(255, 255, 255)',
                      color: 'rgb(15, 23, 42)'
                    }}
                    placeholder="Enter your full name"
                    aria-label="Full name"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: 'rgb(15, 23, 42)' }}>
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'rgb(100, 116, 139)' }} />
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
                  aria-label="Email address"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: 'rgb(15, 23, 42)' }}>
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'rgb(100, 116, 139)' }} />
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
                  aria-label="Password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{ color: 'rgb(100, 116, 139)' }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2" style={{ color: 'rgb(15, 23, 42)' }}>
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'rgb(100, 116, 139)' }} />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword || ''}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="w-full pl-10 pr-12 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
                    style={{ 
                      borderColor: 'rgb(226, 232, 240)',
                      backgroundColor: 'rgb(255, 255, 255)',
                      color: 'rgb(15, 23, 42)'
                    }}
                    placeholder="Confirm your password"
                    aria-label="Confirm password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded focus:outline-none focus:ring-2 focus:ring-offset-2"
                    style={{ color: 'rgb(100, 116, 139)' }}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div 
                className="p-3 rounded-lg text-sm font-medium"
                style={{ 
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: 'rgb(239, 68, 68)',
                  border: '1px solid rgba(239, 68, 68, 0.2)'
                }}
                role="alert"
                aria-live="polite"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: isLoading ? 'rgb(100, 116, 139)' : 'rgb(34, 139, 34)',
                color: 'rgb(255, 255, 255)'
              }}
              aria-label={mode === 'login' ? 'Sign in to account' : 'Create new account'}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {mode === 'login' ? 'Signing In...' : 'Creating Account...'}
                </div>
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p style={{ color: 'rgb(100, 116, 139)' }}>
              {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login')
                  setError('')
                  setFormData({ email: '', password: '', name: '', confirmPassword: '' })
                }}
                className="font-semibold hover:underline focus:outline-none focus:underline"
                style={{ color: 'rgb(34, 139, 34)' }}
                aria-label={mode === 'login' ? 'Switch to registration' : 'Switch to login'}
              >
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthPagesDemo() {
  return <AuthPages />
}