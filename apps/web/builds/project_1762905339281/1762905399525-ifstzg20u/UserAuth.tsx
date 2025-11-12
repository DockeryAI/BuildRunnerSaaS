'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, AlertCircle, Check, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface UserAuthProps {
  onAuthSuccess?: (user: AuthUser) => void
  defaultMode?: 'login' | 'signup'
}

interface AuthUser {
  id: string
  email: string
  name?: string
}

interface FormData {
  email: string
  password: string
  confirmPassword?: string
  name?: string
}

interface FormErrors {
  email?: string
  password?: string
  confirmPassword?: string
  name?: string
  general?: string
}

export function UserAuth({
  onAuthSuccess = (user) => console.log('Auth success:', user),
  defaultMode = 'login'
}: UserAuthProps = {}) {
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  })

  const [errors, setErrors] = useState<FormErrors>({})

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateForm = useCallback((): boolean => {
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

    if (mode === 'signup') {
      if (!formData.name) {
        newErrors.name = 'Name is required'
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password'
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData, mode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Simulate successful authentication
      const mockUser: AuthUser = {
        id: Math.random().toString(36).substr(2, 9),
        email: formData.email,
        name: formData.name || undefined
      }

      setIsSuccess(true)

      setTimeout(() => {
        onAuthSuccess(mockUser)
      }, 1000)

    } catch (error) {
      setErrors({
        general: mode === 'login'
          ? 'Invalid email or password'
          : 'Failed to create account. Please try again.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const switchMode = useCallback(() => {
    setMode(prevMode => (prevMode === 'login' ? 'signup' : 'login'))
    setErrors({})
    setFormData(prev => ({
      email: prev.email, // Keep email when switching
      password: '',
      confirmPassword: '',
      name: ''
    }))
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="bg-background dark:bg-surface border-border dark:border-border shadow-lg hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
        <CardHeader className="space-y-1 pb-24">
          <CardTitle className="text-2xl font-semibold text-center text-muted-foreground dark:text-foreground">
            {mode === 'login' ? 'Welcome back' : 'Create an account'}
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground dark:text-muted-foreground">
            {mode === 'login'
              ? 'Track your calories and reach your goals'
              : 'Start your health journey today'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="py-48 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  className="w-40 h-40 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-16"
                >
                  <Check className="w-32 h-32 text-primary" />
                </motion.div>
                <h3 className="text-lg font-medium text-muted-foreground dark:text-foreground mb-8">
                  {mode === 'login' ? 'Welcome back!' : 'Account created!'}
                </h3>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                  Redirecting to your dashboard...
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                onSubmit={handleSubmit}
                className="space-y-16"
              >
                {errors.general && (
                  <motion.div variants={itemVariants}>
                    <Alert className="bg-destructive dark:bg-destructive/20 border-destructive dark:border-destructive">
                      <AlertCircle className="h-16 w-16 text-destructive dark:text-destructive" />
                      <AlertDescription className="text-destructive dark:text-destructive">
                        {errors.general}
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                {mode === 'signup' && (
                  <motion.div variants={itemVariants} className="space-y-8">
                    <Label htmlFor="name" className="text-muted-foreground dark:text-foreground">
                      Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-12 top-1/2 -translate-y-1/2 h-16 w-16 text-muted-foreground dark:text-muted-foreground" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleInputChange('name')}
                        className={`pl-40 bg-background dark:bg-surface border-border dark:border-border text-muted-foreground dark:text-foreground placeholder:text-muted-foreground dark:placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/50 transition-all duration-200 ${
                          errors.name ? 'border-destructive focus-visible:ring-destructive' : ''
                        }`}
                        disabled={isLoading}
                        aria-label="Name"
                      />
                    </div>
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name}</p>
                    )}
                  </motion.div>
                )}

                <motion.div variants={itemVariants} className="space-y-8">
                  <Label htmlFor="email" className="text-muted-foreground dark:text-foreground">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-12 top-1/2 -translate-y-1/2 h-16 w-16 text-muted-foreground dark:text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleInputChange('email')}
                      className={`pl-40 bg-background dark:bg-surface border-border dark:border-border text-muted-foreground dark:text-foreground placeholder:text-muted-foreground dark:placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/50 transition-all duration-200 ${
                        errors.email ? 'border-destructive focus-visible:ring-destructive' : ''
                      }`}
                      disabled={isLoading}
                      aria-label="Email address"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-8">
                  <Label htmlFor="password" className="text-muted-foreground dark:text-foreground">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-12 top-1/2 -translate-y-1/2 h-16 w-16 text-muted-foreground dark:text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange('password')}
                      className={`pl-40 pr-40 bg-background dark:bg-surface border-border dark:border-border text-muted-foreground dark:text-foreground placeholder:text-muted-foreground dark:placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/50 transition-all duration-200 ${
                        errors.password ? 'border-destructive focus-visible:ring-destructive' : ''
                      }`}
                      disabled={isLoading}
                      aria-label="Password"
                    />
                    <motion.button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-12 top-1/2 -translate-y-1/2 text-muted-foreground dark:text-muted-foreground hover:text-muted-foreground dark:hover:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-full"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="h-16 w-16" />
                      ) : (
                        <Eye className="h-16 w-16" />
                      )}
                    </motion.button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </motion.div>

                {mode === 'signup' && (
                  <motion.div variants={itemVariants} className="space-y-8">
                    <Label htmlFor="confirmPassword" className="text-muted-foreground dark:text-foreground">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-12 top-1/2 -translate-y-1/2 h-16 w-16 text-muted-foreground dark:text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleInputChange('confirmPassword')}
                        className={`pl-40 pr-40 bg-background dark:bg-surface border-border dark:border-border text-muted-foreground dark:text-foreground placeholder:text-muted-foreground dark:placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary/50 transition-all duration-200 ${
                          errors.confirmPassword ? 'border-destructive focus-visible:ring-destructive' : ''
                        }`}
                        disabled={isLoading}
                        aria-label="Confirm password"
                      />
                      <motion.button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-12 top-1/2 -translate-y-1/2 text-muted-foreground dark:text-muted-foreground hover:text-muted-foreground dark:hover:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-full"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-16 w-16" />
                        ) : (
                          <Eye className="h-16 w-16" />
                        )}
                      </motion.button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                    )}
                  </motion.div>
                )}

                <motion.div variants={itemVariants}>
                  <Button
                    type="submit"
                    className="w-full bg-primary text-foreground hover:bg-primary shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                    disabled={isLoading}
                    aria-label={mode === 'login' ? 'Sign In' : 'Create Account'}
                  >
                    <motion.span
                      initial={false}
                      animate={{ opacity: isLoading ? 0 : 1 }}
                    >
                      {mode === 'login' ? 'Sign In' : 'Create Account'}
                    </motion.span>
                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <div className="h-16 w-16 border-8 border-background border-t-transparent rounded-full animate-spin" />
                      </motion.div>
                    )}
                  </Button>
                </motion.div>
              </motion.form>
            )}
          </AnimatePresence>
        </CardContent>

        {!isSuccess && (
          <CardFooter className="flex flex-col space-y-16 pt-24">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border dark:border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background dark:bg-surface px-8 text-muted-foreground dark:text-muted-foreground">
                  {mode === 'login' ? 'New to the app?' : 'Already have an account?'}
                </span>
              </div>
            </div>

            <motion.button
              type="button"
              onClick={switchMode}
              className="text-sm text-primary hover:text-primary dark:hover:text-primary font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-md"
              whileHover={{ x: 16 }}
              whileTap={{ scale: 0.98 }}
              aria-label={mode === 'login' ? 'Create an account' : 'Sign in instead'}
            >
              {mode === 'login' ? 'Create an account' : 'Sign in instead'}
            </motion.button>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  )
}

export default function UserAuthDemo() {
  return (
    <div className="min-h-screen bg-background dark:bg-surface flex items-center justify-center p-16 font-inter">
      <UserAuth />
    </div>
  )
}