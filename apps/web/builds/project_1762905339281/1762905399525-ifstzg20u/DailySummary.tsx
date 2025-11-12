'use client'

import { motion } from 'framer-motion'
import { Activity, Flame, Goal } from 'lucide-react'
import { useState } from 'react'

interface DailySummaryProps {
  consumed?: number
  goal?: number
  burned?: number
  onAddEntry?: () => void
}

export function DailySummary({
  consumed = 1200,
  goal = 2000,
  burned = 300,
  onAddEntry = () => {}
}: DailySummaryProps) {
  const remaining = goal - consumed + burned
  const progress = Math.min((consumed / goal) * 100, 100)

  return (
    <motion.div
      className="bg-background dark:bg-surface rounded-lg border border-border dark:border-border p-6 space-y-6 shadow-sm hover:shadow-md transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-muted-foreground dark:text-foreground font-inter">Daily Summary</h2>
          <motion.button
            className="text-sm font-medium text-[#3B82F6] hover:text-primary dark:text-[#3B82F6] dark:hover:text-primary
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50 focus-visible:ring-offset-2
                       transition-all duration-150 ease-in-out"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onAddEntry}
            aria-label="Add new entry"
          >
            Add Entry
          </motion.button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground dark:text-muted-foreground">
              <Flame className="w-4 h-4" aria-hidden="true" />
              <span className="font-inter">Consumed</span>
            </div>
            <span className="text-muted-foreground dark:text-foreground font-inter">{consumed} kcal</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground dark:text-muted-foreground">
              <Activity className="w-4 h-4" aria-hidden="true" />
              <span className="font-inter">Burned</span>
            </div>
            <span className="text-muted-foreground dark:text-foreground font-inter">{burned} kcal</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground dark:text-muted-foreground">
              <Goal className="w-4 h-4" aria-hidden="true" />
              <span className="font-inter">Remaining</span>
            </div>
            <span className="text-muted-foreground dark:text-foreground font-inter">{remaining} kcal</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground dark:text-muted-foreground font-inter">Progress</span>
          <span className="text-muted-foreground dark:text-foreground font-inter">{Math.round(progress)}%</span>
        </div>
        <div className="relative h-2 rounded-full bg-surface dark:bg-surface overflow-hidden" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <motion.div
            className="absolute inset-0 bg-[#3B82F6]"
            style={{ width: `${progress}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          />
        </div>
      </div>
    </motion.div>
  )
}

export default function DailySummaryDemo() {
  return <DailySummary />
}