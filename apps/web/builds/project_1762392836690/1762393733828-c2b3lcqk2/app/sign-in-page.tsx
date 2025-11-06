'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, ArrowRight, Github } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface SignInPageProps {
  onSignIn?: (email: string, password: string) => void
  isLoading?: boolean
  error?: string
}

export function SignInPage({
  onSignIn = async () => console.log('Sign in'),
  isLoading = false,
  error = ''
}: SignInPageProps = {}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSignIn(email, password)
  }

  return (
    <motion.div 
      className="min-h-screen bg-[#F8F7F4] dark:bg-[#1A1D1A] font-sans"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto px-4 py-8 max-w-md">
        <motion.div
          className="text-center mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Image
            src="/logo.png"
            alt="OffRoad Planner Logo"
            width={64}
            height={64}
            className="mx-auto mb-4 transition-transform hover:scale-105"
          />
          <h1 className="text-[2.25rem] font-bold text-[#1A1D1A] dark:text-[#E5E7E5]">Welcome Back</h1>
          <p className="text-[#6B7280] dark:text-[#E6E4DE] mt-2">Sign in to plan your next adventure</p>
        </motion.div>

        <motion.div
          className="bg-white dark:bg-[#242824] rounded-lg shadow-lg p-6 space-y-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1A1D1A] dark:text-[#E5E7E5] mb-1" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] h-5 w-5" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={cn(
                    "w-full pl-10 pr-4 py-2.5 border border-[#D2D0C8] rounded-lg",
                    "focus:ring-2 focus:ring-[#2D5A2733] focus:border-[#2D5A27]",
                    "dark:bg-[#1A1D1A] dark:border-[#242824] dark:text-[#E5E7E5]",
                    "transition-all duration-200"
                  )}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A1D1A] dark:text-[#E5E7E5] mb-1" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] h-5 w-5" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={cn(
                    "w-full pl-10 pr-4 py-2.5 border border-[#D2D0C8] rounded-lg",
                    "focus:ring-2 focus:ring-[#2D5A2733] focus:border-[#2D5A27]",
                    "dark:bg-[#1A1D1A] dark:border-[#242824] dark:text-[#E5E7E5]",
                    "transition-all duration-200"
                  )}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4"
                >
                  <p className="text-sm text-[#DC2626] dark:text-red-200">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full bg-[#2D5A27] text-white py-2.5 rounded-lg font-medium",
                "flex items-center justify-center gap-2",
                "hover:bg-[#2D5A27]/90 focus:ring-2 focus:ring-[#2D5A2733]",
                "disabled:opacity-50 transition-all duration-200"
              )}
              aria-label="Sign in"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </motion.button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#D2D0C8] dark:border-[#242824]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-[#242824] text-[#6B7280]">Or continue with</span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "w-full border border-[#D2D0C8] text-[#1A1D1A] dark:text-[#E5E7E5]",
              "py-2.5 rounded-lg font-medium flex items-center justify-center gap-2",
              "hover:bg-[#F8F7F4] dark:hover:bg-[#1A1D1A]",
              "focus:ring-2 focus:ring-[#2D5A2733] transition-all duration-200"
            )}
            aria-label="Sign in with GitHub"
          >
            <Github className="h-5 w-5" />
            GitHub
          </motion.button>
        </motion.div>

        <motion.p 
          className="mt-8 text-center text-sm text-[#6B7280] dark:text-[#E6E4DE]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Don't have an account?{' '}
          <a 
            href="/signup" 
            className="font-medium text-[#2D5A27] hover:underline focus:outline-none focus:ring-2 focus:ring-[#2D5A2733] rounded"
          >
            Sign up
          </a>
        </motion.p>
      </div>
    </motion.div>
  )
}

export default function SignInPageDemo() {
  return <SignInPage />
}