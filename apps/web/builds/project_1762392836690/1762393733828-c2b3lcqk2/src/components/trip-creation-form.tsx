'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, MapPin, Users, Clock, Utensils, MessageSquare } from 'lucide-react'
import { format } from 'date-fns'

interface TripFormData {
  title: string
  location: string
  startDate: Date
  endDate: Date
  description: string
  maxParticipants: number
}

interface TripCreationFormProps {
  onSubmit?: (data: TripFormData) => void
  initialData?: Partial<TripFormData>
  isLoading?: boolean
}

const defaultFormData: TripFormData = {
  title: '',
  location: '',
  startDate: new Date(),
  endDate: new Date(),
  description: '',
  maxParticipants: 8
}

export function TripCreationForm({
  onSubmit = () => {},
  initialData = {},
  isLoading = false
}: TripCreationFormProps = {}) {
  const [formData, setFormData] = useState<TripFormData>({
    ...defaultFormData,
    ...initialData
  })
  const [step, setStep] = useState(1)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await onSubmit(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
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
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark p-8">
        <div className="max-w-2xl mx-auto space-y-4 animate-pulse">
          <div className="h-12 bg-muted dark:bg-surface-dark rounded-lg"></div>
          <div className="h-12 bg-muted dark:bg-surface-dark rounded-lg"></div>
          <div className="h-12 bg-muted dark:bg-surface-dark rounded-lg w-3/4"></div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background-light dark:bg-background-dark p-8"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-2xl mx-auto bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg p-6"
      >
        {error && (
          <div className="mb-6 rounded-lg bg-destructive/10 border border-destructive p-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                variants={itemVariants}
                className="space-y-4"
                exit={{ opacity: 0 }}
              >
                <div>
                  <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                    Trip Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-4 py-2.5 bg-surface-light dark:bg-surface-dark border border-border rounded-lg text-foreground-light dark:text-foreground-dark focus:border-primary focus:ring-2 focus:ring-ring transition-all duration-200"
                    placeholder="Weekend Mountain Adventure"
                    required
                    aria-label="Trip title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-mutedForeground" />
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="w-full pl-10 pr-4 py-2.5 bg-surface-light dark:bg-surface-dark border border-border rounded-lg text-foreground-light dark:text-foreground-dark focus:border-primary focus:ring-2 focus:ring-ring transition-all duration-200"
                      placeholder="Search location..."
                      required
                      aria-label="Location"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                variants={itemVariants}
                className="space-y-4"
                exit={{ opacity: 0 }}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={format(formData.startDate, 'yyyy-MM-dd')}
                      onChange={(e) => setFormData({...formData, startDate: new Date(e.target.value)})}
                      className="w-full px-4 py-2.5 bg-surface-light dark:bg-surface-dark border border-border rounded-lg text-foreground-light dark:text-foreground-dark focus:border-primary focus:ring-2 focus:ring-ring transition-all duration-200"
                      required
                      aria-label="Start date"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={format(formData.endDate, 'yyyy-MM-dd')}
                      onChange={(e) => setFormData({...formData, endDate: new Date(e.target.value)})}
                      className="w-full px-4 py-2.5 bg-surface-light dark:bg-surface-dark border border-border rounded-lg text-foreground-light dark:text-foreground-dark focus:border-primary focus:ring-2 focus:ring-ring transition-all duration-200"
                      required
                      aria-label="End date"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
                    Max Participants
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData({...formData, maxParticipants: parseInt(e.target.value)})}
                    className="w-full px-4 py-2.5 bg-surface-light dark:bg-surface-dark border border-border rounded-lg text-foreground-light dark:text-foreground-dark focus:border-primary focus:ring-2 focus:ring-ring transition-all duration-200"
                    required
                    aria-label="Maximum participants"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between pt-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setStep(step > 1 ? step - 1 : 1)}
              className="px-6 py-2.5 bg-surface-light dark:bg-surface-dark text-primary border border-primary rounded-lg font-medium text-sm hover:bg-primary/5 focus:ring-2 focus:ring-ring focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              disabled={step === 1}
              aria-label="Go back"
            >
              Back
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type={step === 2 ? 'submit' : 'button'}
              onClick={() => step === 1 && setStep(2)}
              className="px-6 py-2.5 bg-primary text-primaryForeground rounded-lg font-medium text-sm hover:bg-primary/90 focus:ring-2 focus:ring-ring focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
              aria-label={step === 2 ? 'Create trip' : 'Next step'}
            >
              {step === 2 ? 'Create Trip' : 'Next'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default function TripCreationFormDemo() {
  return <TripCreationForm />
}