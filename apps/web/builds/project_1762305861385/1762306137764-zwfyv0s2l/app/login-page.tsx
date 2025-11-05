'use client'

import { useState } from 'react'
import { Eye, EyeOff, Mountain, Mail, Lock, User, ArrowRight } from 'lucide-react'

interface LoginPageProps {
  onLogin?: (email: string, password: string) => void;
  onSignup?: (name: string, email: string, password: string) => void;
  onForgotPassword?: (email: string) => void;
}

export function LoginPage({
  onLogin = (email, password) => console.log('Login:', { email, password }),
  onSignup = (name, email, password) => console.log('Signup:', { name, email, password }),
  onForgotPassword = (email) => console.log('Forgot password:', email)
}: LoginPageProps = {}) {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

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

    if (!isLogin && !formData.name) {
      newErrors.name = 'Name is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      if (isLogin) {
        onLogin(formData.email, formData.password)
      } else {
        onSignup(formData.name, formData.email, formData.password)
      }
    } catch (error) {
      setErrors({ general: 'Something went wrong. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = () => {
    if (!formData.email) {
      setErrors({ email: 'Please enter your email first' })
      return
    }
    onForgotPassword(formData.email)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.02"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>

      <div className="w-full max-w-md relative">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[rgb(34,139,34)] rounded-2xl mb-4 shadow-lg">
            <Mountain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">TrailPlan</h1>
          <p className="text-slate-400 text-base">
            {isLogin ? 'Welcome back, adventurer!' : 'Start your off-road journey'}
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-white/[0.08] backdrop-blur-sm border border-white/[0.12] rounded-2xl p-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field (Signup only) */}
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-200 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-white/[0.05] border border-white/[0.12] rounded-xl text-white placeholder-slate-400 focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)]/20 transition-all duration-200"
                    placeholder="Enter your full name"
                    aria-describedby={errors.name ? "name-error" : undefined}
                  />
                </div>
                {errors.name && (
                  <p id="name-error" className="mt-1 text-sm text-[rgb(220,38,38)]" role="alert">
                    {errors.name}
                  </p>
                )}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-200 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-white/[0.05] border border-white/[0.12] rounded-xl text-white placeholder-slate-400 focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)]/20 transition-all duration-200"
                  placeholder="Enter your email"
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
              </div>
              {errors.email && (
                <p id="email-error" className="mt-1 text-sm text-[rgb(220,38,38)]" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 bg-white/[0.05] border border-white/[0.12] rounded-xl text-white placeholder-slate-400 focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)]/20 transition-all duration-200"
                  placeholder="Enter your password"
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors duration-200 p-1"
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

            {/* Forgot Password Link (Login only) */}
            {isLogin && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-[rgb(34,139,34)] hover:text-[rgb(34,139,34)]/80 transition-colors duration-200 font-medium"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* General Error */}
            {errors.general && (
              <div className="p-3 bg-[rgb(220,38,38)]/10 border border-[rgb(220,38,38)]/20 rounded-lg">
                <p className="text-sm text-[rgb(220,38,38)]" role="alert">
                  {errors.general}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[rgb(34,139,34)] text-white py-3 px-4 rounded-xl font-semibold text-base hover:bg-[rgb(34,139,34)]/90 focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)]/50 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-[0.98] min-h-[48px]"
              aria-label={isLogin ? 'Sign in to your account' : 'Create new account'}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Auth Mode */}
          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin)
                  setErrors({})
                  setFormData({ name: '', email: '', password: '' })
                }}
                className="ml-2 text-[rgb(34,139,34)] hover:text-[rgb(34,139,34)]/80 transition-colors duration-200 font-medium"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>

        {/* Features Preview */}
        <div className="mt-8 text-center">
          <div className="grid grid-cols-3 gap-4 text-xs text-slate-400">
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 bg-white/[0.08] rounded-lg flex items-center justify-center">
                <Mountain className="w-4 h-4" />
              </div>
              <span>Plan Trips</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 bg-white/[0.08] rounded-lg flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <span>Manage Groups</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 bg-white/[0.08] rounded-lg flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </div>
              <span>Stay Connected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPageDemo() {
  return <LoginPage />
}