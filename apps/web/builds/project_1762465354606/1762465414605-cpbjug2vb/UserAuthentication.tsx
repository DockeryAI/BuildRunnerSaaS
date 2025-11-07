'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, Eye, EyeOff, Zap, ArrowRight, CheckCircle2 } from 'lucide-react'

interface UserAuthenticationProps {
  onAuthSuccess?: (user: User) => void
  redirectUrl?: string
  mode?: 'signin' | 'signup'
}

interface User {
  id: string
  email: string
  name: string
  role: 'host' | 'driver'
}

interface FormData {
  email: string
  password: string
  name: string
  role: 'host' | 'driver'
}

interface FormErrors {
  email?: string
  password?: string
  name?: string
  apiError?: string
}

export function UserAuthentication({
  onAuthSuccess = (user) => console.log('Auth success:', user),
  redirectUrl = '/dashboard',
  mode = 'signin'
}: UserAuthenticationProps = {}) {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>(mode)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    name: '',
    role: 'driver'
  })

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    if (authMode === 'signup' && !formData.name) {
      newErrors.name = 'Name is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      const user: User = {
        id: Math.random().toString(36).substr(2, 9),
        email: formData.email,
        name: formData.name || formData.email.split('@')[0],
        role: formData.role
      }

      onAuthSuccess(user)
      // In a real app, you might redirect here or store user session
      if (redirectUrl) {
        // window.location.href = redirectUrl; // Uncomment for actual redirect
      }
    } catch (error) {
      setErrors({ apiError: 'Authentication failed. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field as keyof FormErrors] || errors.apiError) {
      setErrors(prev => ({ ...prev, [field]: undefined, apiError: undefined }))
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen bg-background dark:bg-surface flex items-center justify-center p-4 font-inter">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full max-w-md"
      >
        {/* Logo & Header */}
        <motion.div
          variants={itemVariants}
          className="text-center mb-8"
        >
          <motion.div
            whileHover={{ rotate: 5, scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-[#3B82F6] rounded-2xl mb-4 shadow-lg"
          >
            <Zap className="w-8 h-8 text-foreground" />
          </motion.div>
          <h1 className="text-3xl font-bold text-muted-foreground dark:text-foreground mb-2">
            {authMode === 'signin' ? 'Welcome Back' : 'Join ChargeShare'}
          </h1>
          <p className="text-muted-foreground dark:text-muted-foreground">
            {authMode === 'signin'
              ? 'Sign in to access your charging network'
              : 'Create an account to start charging or hosting'}
          </p>
        </motion.div>

        {/* Auth Card */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="bg-background dark:bg-surface border border-[#E5E7EB] dark:border-border rounded-2xl shadow-lg p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.apiError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-destructive dark:bg-destructive/20 border border-destructive dark:border-destructive p-4"
              >
                <p className="text-sm text-destructive dark:text-destructive">{errors.apiError}</p>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {authMode === 'signup' && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label htmlFor="name" className="block text-sm font-medium text-muted-foreground dark:text-foreground mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-background dark:bg-surface border border-[#E5E7EB] dark:border-border rounded-lg text-muted-foreground dark:text-foreground placeholder-gray-500 dark:placeholder-gray-400 focus:border-[#3B82F6] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 transition-all duration-200"
                      placeholder="John Doe"
                      aria-label="Full name"
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? 'name-error' : undefined}
                    />
                  </div>
                  {errors.name && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      id="name-error"
                      className="mt-2 text-sm text-destructive dark:text-destructive"
                    >
                      {errors.name}
                    </motion.p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div variants={itemVariants}>
              <label htmlFor="email" className="block text-sm font-medium text-muted-foreground dark:text-foreground mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-background dark:bg-surface border border-[#E5E7EB] dark:border-border rounded-lg text-muted-foreground dark:text-foreground placeholder-gray-500 dark:placeholder-gray-400 focus:border-[#3B82F6] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 transition-all duration-200"
                  placeholder="you@example.com"
                  aria-label="Email address"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  id="email-error"
                  className="mt-2 text-sm text-destructive dark:text-destructive"
                >
                  {errors.email}
                </motion.p>
              )}
            </motion.div>

            <motion.div variants={itemVariants}>
              <label htmlFor="password" className="block text-sm font-medium text-muted-foreground dark:text-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full pl-11 pr-12 py-3 bg-background dark:bg-surface border border-[#E5E7EB] dark:border-border rounded-lg text-muted-foreground dark:text-foreground placeholder-gray-500 dark:placeholder-gray-400 focus:border-[#3B82F6] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 transition-all duration-200"
                  placeholder="••••••••"
                  aria-label="Password"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground dark:hover:text-muted-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50 rounded-full p-1 -m-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </motion.button>
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  id="password-error"
                  className="mt-2 text-sm text-destructive dark:text-destructive"
                >
                  {errors.password}
                </motion.p>
              )}
            </motion.div>

            <AnimatePresence mode="wait">
              {authMode === 'signup' && (
                <motion.div
                  key="role"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="block text-sm font-medium text-muted-foreground dark:text-foreground mb-3">
                    I want to
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      type="button"
                      onClick={() => handleInputChange('role', 'driver')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50 ${
                        formData.role === 'driver'
                          ? 'border-[#3B82F6] bg-[#3B82F6]/5 dark:bg-[#3B82F6]/10'
                          : 'border-[#E5E7EB] bg-background dark:bg-surface hover:border-[#3B82F6]/50 dark:border-border'
                      }`}
                      aria-pressed={formData.role === 'driver'}
                      aria-label="Select role as driver to find charging"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Zap className={`w-5 h-5 ${formData.role === 'driver' ? 'text-[#3B82F6]' : 'text-muted-foreground'}`} />
                        {formData.role === 'driver' && (
                          <CheckCircle2 className="w-5 h-5 text-[#3B82F6]" />
                        )}
                      </div>
                      <div className="text-left">
                        <p className={`font-medium ${formData.role === 'driver' ? 'text-muted-foreground dark:text-foreground' : 'text-muted-foreground dark:text-muted-foreground'}`}>
                          Find Charging
                        </p>
                        <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-1">
                          Locate nearby stations
                        </p>
                      </div>
                    </motion.button>

                    <motion.button
                      type="button"
                      onClick={() => handleInputChange('role', 'host')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50 ${
                        formData.role === 'host'
                          ? 'border-[#3B82F6] bg-[#3B82F6]/5 dark:bg-[#3B82F6]/10'
                          : 'border-[#E5E7EB] bg-background dark:bg-surface hover:border-[#3B82F6]/50 dark:border-border'
                      }`}
                      aria-pressed={formData.role === 'host'}
                      aria-label="Select role as host to host a station"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Zap className={`w-5 h-5 ${formData.role === 'host' ? 'text-[#3B82F6]' : 'text-muted-foreground'}`} />
                        {formData.role === 'host' && (
                          <CheckCircle2 className="w-5 h-5 text-[#3B82F6]" />
                        )}
                      </div>
                      <div className="text-left">
                        <p className={`font-medium ${formData.role === 'host' ? 'text-muted-foreground dark:text-foreground' : 'text-muted-foreground dark:text-muted-foreground'}`}>
                          Host Station
                        </p>
                        <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-1">
                          Earn from your charger
                        </p>
                      </div>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {authMode === 'signin' && (
              <motion.div variants={itemVariants} className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-[#3B82F6] bg-background dark:bg-surface border-[#E5E7EB] dark:border-border rounded focus:ring-2 focus:ring-[#3B82F6]/50 focus:outline-none"
                    aria-label="Remember me"
                  />
                  <span className="ml-2 text-sm text-muted-foreground dark:text-muted-foreground">Remember me</span>
                </label>
                <motion.button
                  type="button"
                  whileHover={{ x: 2 }}
                  className="text-sm text-[#3B82F6] hover:text-[#3B82F6]/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50 rounded-md p-1 -m-1"
                  aria-label="Forgot password"
                >
                  Forgot password?
                </motion.button>
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 px-4 bg-[#3B82F6] text-foreground rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50"
              aria-label={authMode === 'signin' ? 'Sign in' : 'Create account'}
            >
              {isLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-background border-t-transparent rounded-full"
                  />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{authMode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>

          <motion.div variants={itemVariants} className="mt-6 text-center">
            <p className="text-sm text-muted-foreground dark:text-muted-foreground">
              {authMode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              <motion.button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === 'signin' ? 'signup' : 'signin')
                  setErrors({}) // Clear errors on mode switch
                }}
                whileHover={{ x: 2 }}
                className="text-[#3B82F6] hover:text-[#3B82F6]/80 font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50 rounded-md p-1 -m-1"
                aria-label={authMode === 'signin' ? 'Switch to sign up' : 'Switch to sign in'}
              >
                {authMode === 'signin' ? 'Sign up' : 'Sign in'}
              </motion.button>
            </p>
          </motion.div>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground dark:text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-secondary dark:text-secondary" />
            <span>Secure & Encrypted</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-secondary dark:text-secondary" />
            <span>GDPR Compliant</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default function UserAuthenticationDemo() {
  return <UserAuthentication />
}