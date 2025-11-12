'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sliders, Bell, Save } from 'lucide-react'

interface UserPreferencesProps {
  initialCalories?: number
  initialNotifications?: boolean
  onSave?: (calories: number, notifications: boolean) => void
}

export function UserPreferences({
  initialCalories = 2000,
  initialNotifications = true,
  onSave = () => {}
}: UserPreferencesProps) {
  const [calories, setCalories] = useState(initialCalories)
  const [notifications, setNotifications] = useState(initialNotifications)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      onSave(calories, notifications)
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 2000)
    } catch (err) {
      setError("Failed to save preferences. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <motion.div
      className="bg-background dark:bg-surface rounded-xl border border-border dark:border-border p-6 space-y-6 font-inter"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="space-y-2">
        <h2 className="text-lg font-medium text-muted-foreground dark:text-foreground flex items-center gap-2">
          <Sliders className="w-5 h-5 text-muted-foreground dark:text-muted-foreground" aria-hidden="true" />
          Preferences
        </h2>
        <p className="text-sm text-muted-foreground dark:text-muted-foreground leading-relaxed">
          Manage your daily goals and notification settings.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="calorie-goal" className="text-sm font-medium text-muted-foreground dark:text-foreground block">
            Daily Calorie Goal
          </label>
          <input
            id="calorie-goal"
            type="number"
            value={calories}
            onChange={(e) => setCalories(Number(e.target.value))}
            className="w-full px-4 py-2 bg-surface dark:bg-surface border border-border dark:border-border rounded-lg text-muted-foreground dark:text-foreground focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent focus:outline-none transition-all duration-200"
            aria-label="Daily Calorie Goal"
          />
        </div>

        <div className="flex items-center justify-between py-1">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground dark:text-foreground">
              Notifications
            </p>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground leading-relaxed">
              Receive daily reminders for your goals.
            </p>
          </div>
          <button
            onClick={() => setNotifications(!notifications)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2 ${
              notifications ? 'bg-[#3B82F6]' : 'bg-surface dark:bg-surface'
            }`}
            role="switch"
            aria-checked={notifications}
            aria-label={notifications ? "Disable notifications" : "Enable notifications"}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out ${
                notifications ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive dark:bg-destructive/20 border border-destructive dark:border-destructive p-4">
          <p className="text-sm text-destructive dark:text-destructive">{error}</p>
        </div>
      )}

      <motion.button
        onClick={handleSave}
        className="w-full px-4 py-2 bg-[#3B82F6] text-foreground rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-150
                   hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2
                   disabled:opacity-60 disabled:cursor-not-allowed"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={isSaving}
        aria-label="Save Preferences"
      >
        <AnimatePresence mode="wait">
          {isSaving ? (
            <motion.span
              key="saving"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              <svg className="animate-spin h-4 w-4 text-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </motion.span>
          ) : isSaved ? (
            <motion.span
              key="saved"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" aria-hidden="true" />
              Saved!
            </motion.span>
          ) : (
            <motion.span
              key="save-button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" aria-hidden="true" />
              Save Preferences
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </motion.div>
  )
}

export default function UserPreferencesDemo() {
  return (
    <div className="p-8 bg-surface dark:bg-surface min-h-screen flex items-center justify-center">
      <UserPreferences />
    </div>
  )
}