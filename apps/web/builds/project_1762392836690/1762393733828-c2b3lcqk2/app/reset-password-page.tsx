'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ResetPasswordFormData {
  email: string
  password: string
  confirmPassword: string
}

interface ResetPasswordPageProps {
  token?: string
  onSuccess?: () => void
}

export function ResetPasswordPage({
  token = '',
  onSuccess = () => {}
}: ResetPasswordPageProps = {}) {
  const router = useRouter()
  const [formData, setFormData] = useState<ResetPasswordFormData>({
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      setIsSuccess(true)
      onSuccess()
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err) {
      setError('Failed to reset password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-[#F8F7F4] dark:bg-[#1A1D1A] flex items-center justify-center p-4 font-sans"
    >
      <motion.div
        className="w-full max-w-md bg-white dark:bg-[#242824] rounded-lg shadow-lg p-8 border border-[#D2D0C8] dark:border-[#D2D0C8]/20"
        whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgba(45, 90, 39, 0.1)" }}
        transition={{ duration: 0.3 }}
      >
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <h2 className="text-2xl font-semibold text-[#2D5A27] dark:text-[#E5E7E5] mb-4">
                Password Reset Successful!
              </h2>
              <p className="text-[#6B7280] dark:text-[#E6E4DE] mb-4">
                Redirecting you to login...
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h1 className="text-2xl font-bold text-[#2D5A27] dark:text-[#E5E7E5] mb-6">
                Reset Your Password
              </h1>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#1A1D1A] dark:text-[#E5E7E5] mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] h-5 w-5" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#242824] border border-[#D2D0C8] dark:border-[#D2D0C8]/20 rounded-lg focus:ring-2 focus:ring-[#2D5A27]/30 focus:border-[#2D5A27] dark:focus:border-[#2D5A27] transition-all duration-200 text-[#1A1D1A] dark:text-[#E5E7E5]"
                      placeholder="Enter your email"
                      aria-label="Email address"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1A1D1A] dark:text-[#E5E7E5] mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] h-5 w-5" />
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#242824] border border-[#D2D0C8] dark:border-[#D2D0C8]/20 rounded-lg focus:ring-2 focus:ring-[#2D5A27]/30 focus:border-[#2D5A27] dark:focus:border-[#2D5A27] transition-all duration-200 text-[#1A1D1A] dark:text-[#E5E7E5]"
                      placeholder="Enter new password"
                      aria-label="New password"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1A1D1A] dark:text-[#E5E7E5] mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] h-5 w-5" />
                    <input
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#242824] border border-[#D2D0C8] dark:border-[#D2D0C8]/20 rounded-lg focus:ring-2 focus:ring-[#2D5A27]/30 focus:border-[#2D5A27] dark:focus:border-[#2D5A27] transition-all duration-200 text-[#1A1D1A] dark:text-[#E5E7E5]"
                      placeholder="Confirm new password"
                      aria-label="Confirm password"
                    />
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg bg-[#DC2626]/10 dark:bg-[#DC2626]/20 border border-[#DC2626]/20 dark:border-[#DC2626]/30 p-4 flex items-center gap-2"
                  >
                    <AlertCircle className="h-4 w-4 text-[#DC2626]" />
                    <p className="text-sm text-[#DC2626]">{error}</p>
                  </motion.div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isLoading}
                  className={`w-full flex items-center justify-center gap-2 bg-[#2D5A27] text-white rounded-lg py-3 font-medium transition-all duration-150
                    ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#2D5A27]/90 focus:ring-2 focus:ring-[#2D5A27]/30 focus:outline-none'}`}
                  aria-label="Reset password"
                >
                  {isLoading ? (
                    'Resetting Password...'
                  ) : (
                    <>
                      Reset Password
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

export default function ResetPasswordPageDemo() {
  return <ResetPasswordPage />
}