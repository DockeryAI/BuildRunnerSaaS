'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react'

interface AuthFormData {
  email: string
  password: string
  name?: string
}

interface AuthSystemProps {
  onSubmit?: (data: AuthFormData) => void
  initialView?: 'login' | 'signup'
  isLoading?: boolean
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 }
}

export function AuthSystem({
  onSubmit = () => {},
  initialView = 'login',
  isLoading = false
}: AuthSystemProps = {}) {
  const [view, setView] = useState<'login' | 'signup'>(initialView)
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    name: ''
  })
  const [error, setError] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await onSubmit(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="min-h-screen bg-background dark:bg-surface p-8 flex items-center justify-center font-inter"
    >
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-muted-foreground dark:text-foreground mb-2">
            {view === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-muted-foreground dark:text-muted-foreground">
            {view === 'login' 
              ? 'Sign in to continue planning your adventures'
              : 'Join the off-road community'}
          </p>
        </div>

        <motion.div
          variants={itemVariants}
          className="bg-background dark:bg-surface border border-border dark:border-border rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
        >
          {error && (
            <div className="mb-4 rounded-lg bg-secondary dark:bg-secondary/20 border border-secondary dark:border-secondary p-4">
              <p className="text-sm text-secondary dark:text-secondary">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {view === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="relative"
                >
                  <div className="flex items-center border border-border dark:border-border rounded-lg px-3 focus-within:ring-2 focus-within:ring-primary/50 transition-all duration-200">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      name="name"
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full p-2 bg-transparent focus:outline-none text-muted-foreground dark:text-foreground placeholder-gray-400"
                      aria-label="Full Name"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <div className="flex items-center border border-border dark:border-border rounded-lg px-3 focus-within:ring-2 focus-within:ring-primary/50 transition-all duration-200">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-transparent focus:outline-none text-muted-foreground dark:text-foreground placeholder-gray-400"
                  required
                  aria-label="Email"
                />
              </div>
            </div>

            <div className="relative">
              <div className="flex items-center border border-border dark:border-border rounded-lg px-3 focus-within:ring-2 focus-within:ring-primary/50 transition-all duration-200">
                <Lock className="w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-transparent focus:outline-none text-muted-foreground dark:text-foreground placeholder-gray-400"
                  required
                  aria-label="Password"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary text-foreground rounded-lg p-2 font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              aria-label={view === 'login' ? 'Sign In' : 'Create Account'}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {view === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <motion.button
              whileHover={{ scale: 1.02 }}
              onClick={() => setView(view === 'login' ? 'signup' : 'login')}
              className="text-primary hover:text-primary font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded transition-colors duration-200"
              aria-label={view === 'login' ? 'Switch to Sign Up' : 'Switch to Sign In'}
            >
              {view === 'login' 
                ? "Don't have an account? Sign up" 
                : 'Already have an account? Sign in'}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export default function AuthSystemDemo() {
  return <AuthSystem />
}