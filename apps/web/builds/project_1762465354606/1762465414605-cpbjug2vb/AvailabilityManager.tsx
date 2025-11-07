'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarDays, Clock, Plus, X, Check, Loader2, AlertTriangle, Info } from 'lucide-react'

// Helper to generate time slots
const generateTimeSlots = (intervalMinutes: number = 30) => {
  const slots = []
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += intervalMinutes) {
      const hour = String(h).padStart(2, '0')
      const minute = String(m).padStart(2, '0')
      slots.push(`${hour}:${minute}`)
    }
  }
  return slots
}

interface AvailabilitySlot {
  id: string
  day: string // e.g., 'Monday', 'Tuesday'
  startTime: string // e.g., '09:00'
  endTime: string // e.g., '17:00'
  pricePerHour: number
}

interface AvailabilityManagerProps {
  initialAvailability?: AvailabilitySlot[]
  onSave?: (availability: AvailabilitySlot[]) => Promise<void> | void
  isLoading?: boolean
  error?: string | null
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const TIME_SLOTS = generateTimeSlots(30)

const DEFAULT_AVAILABILITY: AvailabilitySlot[] = [
  { id: '1', day: 'Monday', startTime: '09:00', endTime: '17:00', pricePerHour: 5.00 },
  { id: '2', day: 'Wednesday', startTime: '10:00', endTime: '18:00', pricePerHour: 5.50 },
]

export function AvailabilityManager({
  initialAvailability = DEFAULT_AVAILABILITY,
  onSave = async (availability) => {
    console.log('Saving availability:', availability)
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
  },
  isLoading = false,
  error = null,
}: AvailabilityManagerProps = {}) {
  const [availability, setAvailability] = useState<AvailabilitySlot[]>(initialAvailability)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [localError, setLocalError] = useState<string | null>(error)

  useEffect(() => {
    setAvailability(initialAvailability)
  }, [initialAvailability])

  useEffect(() => {
    setLocalError(error)
  }, [error])

  const handleAddSlot = useCallback(() => {
    setAvailability((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        day: 'Monday',
        startTime: '09:00',
        endTime: '17:00',
        pricePerHour: 5.00,
      },
    ])
  }, [])

  const handleRemoveSlot = useCallback((id: string) => {
    setAvailability((prev) => prev.filter((slot) => slot.id !== id))
  }, [])

  const handleSlotChange = useCallback(
    (id: string, field: keyof AvailabilitySlot, value: string | number) => {
      setAvailability((prev) =>
        prev.map((slot) => (slot.id === id ? { ...slot, [field]: value } : slot))
      )
    },
    []
  )

  const validateSlots = useMemo(() => {
    const errors: string[] = []
    availability.forEach((slot, index) => {
      if (!slot.day || !slot.startTime || !slot.endTime) {
        errors.push(`Slot ${index + 1}: All fields must be selected.`)
      }
      if (slot.startTime >= slot.endTime) {
        errors.push(`Slot ${index + 1}: Start time must be before end time.`)
      }
      if (slot.pricePerHour <= 0) {
        errors.push(`Slot ${index + 1}: Price per hour must be positive.`)
      }
    })
    return errors
  }, [availability])

  const handleSave = async () => {
    const validationErrors = validateSlots
    if (validationErrors.length > 0) {
      setLocalError(validationErrors.join(' '))
      setSaveSuccess(false)
      return
    }

    setLocalError(null)
    setIsSaving(true)
    setSaveSuccess(false)
    try {
      await onSave(availability)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000) // Hide success message after 3 seconds
    } catch (err) {
      setLocalError('Failed to save availability. Please try again.')
      setSaveSuccess(false)
    } finally {
      setIsSaving(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="min-h-screen bg-background dark:bg-surface text-muted-foreground dark:text-foreground p-8 font-inter"
    >
      <div className="max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="text-3xl font-bold mb-8 text-muted-foreground dark:text-foreground"
        >
          Manage Charging Availability
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.3 }}
          className="text-muted-foreground dark:text-muted-foreground mb-10 text-lg leading-relaxed"
        >
          Define when your charging station is available for others to use. Set specific days, times, and your desired hourly rate.
        </motion.p>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center p-8 bg-surface dark:bg-surface rounded-lg mb-8 shadow-sm"
          >
            <Loader2 className="h-6 w-6 animate-spin text-[#3B82F6] mr-3" />
            <span className="text-muted-foreground dark:text-muted-foreground">Loading availability...</span>
          </motion.div>
        )}

        {!isLoading && availability.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-surface dark:bg-surface border border-[#E5E7EB] dark:border-border rounded-lg p-12 text-center mb-8 shadow-sm"
          >
            <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground dark:text-foreground mb-2">No availability set yet</h3>
            <p className="text-muted-foreground dark:text-muted-foreground mb-8">
              Add your first time slot to start sharing your charger.
            </p>
            <motion.button
              onClick={handleAddSlot}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center px-8 py-4 bg-[#3B82F6] text-foreground rounded-lg font-medium text-base shadow-md hover:bg-primary transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900"
              aria-label="Add Availability Slot"
            >
              <Plus className="h-5 w-5 mr-2" /> Add Availability Slot
            </motion.button>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {!isLoading && availability.length > 0 && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-4 mb-8"
            >
              {availability.map((slot) => (
                <motion.div
                  key={slot.id}
                  variants={itemVariants}
                  whileHover={{ y: -2, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)" }}
                  className="bg-background dark:bg-surface border border-[#E5E7EB] dark:border-border rounded-lg p-6 flex flex-col md:flex-row items-start md:items-center gap-6 shadow-sm transition-all duration-200"
                >
                  <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                    <div className="flex flex-col">
                      <label htmlFor={`day-${slot.id}`} className="text-sm font-medium text-muted-foreground dark:text-muted-foreground mb-2">
                        Day
                      </label>
                      <div className="relative">
                        <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <select
                          id={`day-${slot.id}`}
                          value={slot.day}
                          onChange={(e) => handleSlotChange(slot.id, 'day', e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-surface dark:bg-surface border border-[#E5E7EB] dark:border-border rounded-lg text-muted-foreground dark:text-foreground placeholder-gray-400 focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]/50 transition-all duration-150 appearance-none"
                          aria-label="Select day of the week"
                        >
                          {DAYS_OF_WEEK.map((day) => (
                            <option key={day} value={day}>
                              {day}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <label htmlFor={`start-${slot.id}`} className="text-sm font-medium text-muted-foreground dark:text-muted-foreground mb-2">
                        Start Time
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <select
                          id={`start-${slot.id}`}
                          value={slot.startTime}
                          onChange={(e) => handleSlotChange(slot.id, 'startTime', e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-surface dark:bg-surface border border-[#E5E7EB] dark:border-border rounded-lg text-muted-foreground dark:text-foreground placeholder-gray-400 focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]/50 transition-all duration-150 appearance-none"
                          aria-label="Select start time"
                        >
                          {TIME_SLOTS.map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <label htmlFor={`end-${slot.id}`} className="text-sm font-medium text-muted-foreground dark:text-muted-foreground mb-2">
                        End Time
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <select
                          id={`end-${slot.id}`}
                          value={slot.endTime}
                          onChange={(e) => handleSlotChange(slot.id, 'endTime', e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-surface dark:bg-surface border border-[#E5E7EB] dark:border-border rounded-lg text-muted-foreground dark:text-foreground placeholder-gray-400 focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]/50 transition-all duration-150 appearance-none"
                          aria-label="Select end time"
                        >
                          {TIME_SLOTS.map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <label htmlFor={`price-${slot.id}`} className="text-sm font-medium text-muted-foreground dark:text-muted-foreground mb-2">
                        Price per hour ($)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <input
                          id={`price-${slot.id}`}
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={slot.pricePerHour.toFixed(2)}
                          onChange={(e) => handleSlotChange(slot.id, 'pricePerHour', parseFloat(e.target.value))}
                          className="w-full pl-8 pr-4 py-2.5 bg-surface dark:bg-surface border border-[#E5E7EB] dark:border-border rounded-lg text-muted-foreground dark:text-foreground placeholder-gray-400 focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]/50 transition-all duration-150"
                          aria-label="Price per hour"
                        />
                      </div>
                    </div>
                  </div>

                  <motion.button
                    onClick={() => handleRemoveSlot(slot.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-full text-muted-foreground hover:text-destructive hover:bg-surface dark:hover:bg-surface transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900"
                    aria-label={`Remove availability slot for ${slot.day}`}
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {!isLoading && availability.length > 0 && (
          <motion.button
            onClick={handleAddSlot}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full inline-flex items-center justify-center px-8 py-4 bg-surface dark:bg-surface text-muted-foreground dark:text-foreground rounded-lg font-medium text-base shadow-sm hover:bg-surface dark:hover:bg-surface transition-all duration-150 border border-[#E5E7EB] dark:border-border focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 mb-8"
            aria-label="Add another availability slot"
          >
            <Plus className="h-5 w-5 mr-2" /> Add Another Slot
          </motion.button>
        )}

        {(localError || error) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg bg-destructive dark:bg-destructive/20 border border-destructive dark:border-destructive p-4 flex items-center mb-8 shadow-sm"
            role="alert"
          >
            <AlertTriangle className="h-5 w-5 mr-3 text-destructive dark:text-destructive" />
            <span className="text-sm text-destructive dark:text-destructive">{localError || error}</span>
          </motion.div>
        )}

        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg bg-secondary dark:bg-secondary/20 border border-secondary dark:border-secondary p-4 flex items-center mb-8 shadow-sm"
            role="status"
          >
            <Check className="h-5 w-5 mr-3 text-secondary dark:text-secondary" />
            <span className="text-sm text-secondary dark:text-secondary">Availability saved successfully!</span>
          </motion.div>
        )}

        <motion.button
          onClick={handleSave}
          disabled={isSaving || isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full inline-flex items-center justify-center px-8 py-4 bg-[#3B82F6] text-foreground rounded-lg font-medium text-base shadow-md hover:bg-primary transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Save all availability changes"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Saving...
            </>
          ) : (
            <>
              <Check className="h-5 w-5 mr-2" /> Save Availability
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  )
}

export default function AvailabilityManagerDemo() {
  const [demoAvailability, setDemoAvailability] = useState<AvailabilitySlot[]>(DEFAULT_AVAILABILITY)
  const [demoLoading, setDemoLoading] = useState(false)
  const [demoError, setDemoError] = useState<string | null>(null)

  const handleDemoSave = async (availability: AvailabilitySlot[]) => {
    setDemoLoading(true)
    setDemoError(null)
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      console.log('Demo save successful:', availability)
      setDemoAvailability(availability) // Update local state with saved data
      // Simulate a random error for demonstration
      if (Math.random() < 0.2) {
        throw new Error('Simulated network error.')
      }
    } catch (err: any) {
      setDemoError(err.message || 'An unknown error occurred during save.')
      throw err // Re-throw to trigger error state in component
    } finally {
      setDemoLoading(false)
    }
  }

  return (
    <div className="bg-background dark:bg-surface min-h-screen">
      <AvailabilityManager
        initialAvailability={demoAvailability}
        onSave={handleDemoSave}
        isLoading={demoLoading}
        error={demoError}
      />
    </div>
  )
}