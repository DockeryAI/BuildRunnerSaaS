'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface AuthFormData {
  email: string
  password: string
  name?: string
}

interface AuthSystemProps {
  onAuthSuccess?: (user: any) => void
  defaultView?: 'login' | 'signup'
}

export function AuthSystem({
  onAuthSuccess = () => {},
  defaultView = 'login'
}: AuthSystemProps = {}) {
  const [view, setView] = useState<'login' | 'signup'>(defaultView)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    name: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      onAuthSuccess({ email: formData.email })
      router.push('/dashboard')
    } catch (err) {
      setError('Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  const inputClasses = "w-full pl-10 pr-4 py-2 bg-background dark:bg-surface border border-[#E5E7EB] dark:border-border rounded-lg focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] focus:outline-none text-muted-foreground dark:text-foreground transition-all duration-200"
  const buttonClasses = "w-full bg-[#3B82F6] text-foreground font-medium py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#2563EB] focus:ring-2 focus:ring-[#3B82F6]/50 focus:outline-none active:scale-[0.98] transition-all duration-150"

  return (
    <motion.div 
      className="min-h-screen bg-background dark:bg-surface flex items-center justify-center p-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="w-full max-w-md">
        <motion.div
          className="bg-background dark:bg-surface rounded-xl shadow-lg hover:shadow-2xl p-8 border border-[#E5E7EB] dark:border-border transition-all duration-300"
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
        >
          <h1 className="text-2xl font-semibold text-muted-foreground dark:text-foreground mb-6 text-center font-inter">
            {view === 'login' ? 'Welcome Back' : 'Create Account'}
          </h1>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-secondary dark:bg-secondary/20 border border-secondary dark:border-secondary text-secondary dark:text-secondary text-sm p-4 rounded-lg mb-4"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            {view === 'signup' && (
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground dark:text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Full Name"
                  className={inputClasses}
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  aria-label="Full Name"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground dark:text-muted-foreground" />
              <input
                type="email"
                placeholder="Email"
                className={inputClasses}
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                aria-label="Email Address"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground dark:text-muted-foreground" />
              <input
                type="password"
                placeholder="Password"
                className={inputClasses}
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                aria-label="Password"
              />
            </div>

            <motion.button
              type="submit"
              className={buttonClasses}
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-label={view === 'login' ? 'Sign In' : 'Create Account'}
            >
              {loading ? (
                <motion.div
                  className="h-5 w-5 border-2 border-background border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              ) : (
                <>
                  {view === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setView(view === 'login' ? 'signup' : 'login')}
              className="text-sm text-[#3B82F6] hover:text-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 rounded-lg px-2 py-1 transition-all duration-150"
              aria-label={view === 'login' ? 'Switch to Sign Up' : 'Switch to Sign In'}
            >
              {view === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default function AuthSystemDemo() {
  return <AuthSystem />
}