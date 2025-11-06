'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Settings, LogOut, Moon, Sun, User } from 'lucide-react'

interface UserSettings {
  id: string
  email: string
  displayName: string
  notifications: boolean
  darkMode: boolean
  timezone: string
}

interface UserSettingsProps {
  initialSettings?: UserSettings
  onSave?: (settings: UserSettings) => Promise<void>
}

const defaultSettings: UserSettings = {
  id: '1',
  email: 'user@example.com',
  displayName: 'Trail Blazer',
  notifications: true,
  darkMode: false,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
}

export function UserSettings({
  initialSettings = defaultSettings,
  onSave = async () => console.log('Saving settings...')
}: UserSettingsProps) {
  const [settings, setSettings] = useState<UserSettings>(initialSettings)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000)
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    setSaveError('')
    try {
      await onSave(settings)
    } catch (error) {
      setSaveError('Failed to save settings. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#F8F7F4] dark:bg-[#1A1D1A] p-6 font-sans"
    >
      <div className="max-w-2xl mx-auto">
        <motion.div
          className="bg-[#FFFFFF] dark:bg-[#242824] rounded-lg shadow-md p-8 space-y-8 transition-all duration-300 hover:shadow-xl"
          whileHover={{ y: -4 }}
        >
          {isLoading ? (
            <div className="space-y-6 animate-pulse">
              <div className="h-8 bg-[#E6E4DE] dark:bg-gray-700 rounded w-3/4"></div>
              <div className="space-y-4">
                <div className="h-12 bg-[#E6E4DE] dark:bg-gray-700 rounded"></div>
                <div className="h-12 bg-[#E6E4DE] dark:bg-gray-700 rounded"></div>
                <div className="h-12 bg-[#E6E4DE] dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-[#2D5A27] dark:text-white">
                  Account Settings
                </h1>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-full bg-[#E6E4DE] dark:bg-[#242824] hover:bg-[#D2D0C8] dark:hover:bg-gray-700 transition-colors duration-200"
                  aria-label="Settings menu"
                >
                  <Settings className="w-5 h-5 text-[#2D5A27] dark:text-white" />
                </motion.button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-[#1A1D1A] dark:text-[#E5E7E5] mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={settings.displayName}
                    onChange={(e) => setSettings({...settings, displayName: e.target.value})}
                    className="w-full px-4 py-2 rounded-md border border-[#D2D0C8] bg-white dark:bg-[#242824] text-[#1A1D1A] dark:text-[#E5E7E5] focus:ring-2 focus:ring-[#2D5A27] focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1A1D1A] dark:text-[#E5E7E5] mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({...settings, email: e.target.value})}
                    className="w-full px-4 py-2 rounded-md border border-[#D2D0C8] bg-white dark:bg-[#242824] text-[#1A1D1A] dark:text-[#E5E7E5] focus:ring-2 focus:ring-[#2D5A27] focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-[#2D5A27] dark:text-white" />
                    <span className="text-sm font-medium text-[#1A1D1A] dark:text-[#E5E7E5]">
                      Notifications
                    </span>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSettings({...settings, notifications: !settings.notifications})}
                    className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                      settings.notifications ? 'bg-[#2D5A27]' : 'bg-[#D2D0C8]'
                    }`}
                    aria-label="Toggle notifications"
                  >
                    <motion.div
                      className="w-4 h-4 bg-white rounded-full mx-1"
                      animate={{ x: settings.notifications ? 24 : 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </motion.button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {settings.darkMode ? (
                      <Moon className="w-5 h-5 text-[#2D5A27] dark:text-white" />
                    ) : (
                      <Sun className="w-5 h-5 text-[#2D5A27] dark:text-white" />
                    )}
                    <span className="text-sm font-medium text-[#1A1D1A] dark:text-[#E5E7E5]">
                      Dark Mode
                    </span>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSettings({...settings, darkMode: !settings.darkMode})}
                    className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                      settings.darkMode ? 'bg-[#2D5A27]' : 'bg-[#D2D0C8]'
                    }`}
                    aria-label="Toggle dark mode"
                  >
                    <motion.div
                      className="w-4 h-4 bg-white rounded-full mx-1"
                      animate={{ x: settings.darkMode ? 24 : 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </motion.button>
                </div>
              </div>

              {saveError && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 mt-6"
                >
                  <p className="text-sm text-[#DC2626] dark:text-red-200">{saveError}</p>
                </motion.div>
              )}

              <div className="flex gap-4 pt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 bg-[#2D5A27] text-white rounded-md font-medium hover:bg-[#234420] disabled:opacity-50 transition-all duration-200 focus:ring-2 focus:ring-[#2D5A27] focus:ring-offset-2"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 text-[#DC2626] bg-white dark:bg-[#242824] border border-[#DC2626] rounded-md font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 focus:ring-2 focus:ring-[#DC2626] focus:ring-offset-2"
                  aria-label="Log out"
                >
                  <LogOut className="w-5 h-5" />
                </motion.button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}

export default function UserSettingsDemo() {
  return <UserSettings />
}