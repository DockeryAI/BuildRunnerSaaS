'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Info, ShieldCheck, Clock } from 'lucide-react'
import { useState } from 'react'

interface Policy {
  id: string
  title: string
  description: string
  coverageAmount: number
  startDate: string
  endDate: string
  status: 'active' | 'expired' | 'pending'
}

interface PolicyDetailsProps {
  policy?: Policy
  onRenew?: (id: string) => void
  onCancel?: (id: string) => void
}

const DEFAULT_POLICY: Policy = {
  id: '1',
  title: 'Professional Liability Insurance',
  description: 'Protects against claims of negligence or harm caused by professional services.',
  coverageAmount: 1000000,
  startDate: '2023-01-01',
  endDate: '2023-12-31',
  status: 'active'
}

export function PolicyDetails({
  policy = DEFAULT_POLICY,
  onRenew = () => {},
  onCancel = () => {}
}: PolicyDetailsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getStatusClasses = (status: Policy['status']) => {
    switch (status) {
      case 'active':
        return 'text-secondary dark:text-secondary bg-secondary dark:bg-secondary/20 border-secondary dark:border-secondary'
      case 'expired':
        return 'text-destructive dark:text-destructive bg-destructive dark:bg-destructive/20 border-destructive dark:border-destructive'
      case 'pending':
        return 'text-accent dark:text-accent bg-accent dark:bg-accent/20 border-accent dark:border-accent'
      default:
        return 'text-muted-foreground dark:text-muted-foreground bg-surface dark:bg-surface/20 border-border dark:border-border'
    }
  }

  return (
    <motion.div
      className="bg-background dark:bg-surface rounded-xl border border-border dark:border-border p-6 font-inter"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -4, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-[#3B82F6]" />
            <h2 className="text-lg font-medium text-muted-foreground dark:text-foreground leading-tight">{policy.title}</h2>
          </div>
          <motion.button
            className="text-muted-foreground dark:text-muted-foreground hover:text-muted-foreground dark:hover:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50 rounded-md p-1 -m-1"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? "Collapse policy details" : "Expand policy details"}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Info className="w-5 h-5" />
          </motion.button>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="space-y-4 overflow-hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-sm text-muted-foreground dark:text-muted-foreground leading-relaxed">{policy.description}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground dark:text-muted-foreground uppercase tracking-wide">Coverage Amount</p>
                  <p className="text-sm font-medium text-muted-foreground dark:text-foreground leading-normal">
                    ${policy.coverageAmount.toLocaleString()}
                  </p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground dark:text-muted-foreground uppercase tracking-wide">Policy Period</p>
                  <p className="text-sm font-medium text-muted-foreground dark:text-foreground leading-normal">
                    {new Date(policy.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} - {' '}
                    {new Date(policy.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground dark:text-muted-foreground" />
            <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getStatusClasses(policy.status)}`}>
              {policy.status.charAt(0).toUpperCase() + policy.status.slice(1)}
            </span>
          </div>

          <div className="flex gap-2">
            <motion.button
              className="px-4 py-2 bg-[#3B82F6] text-foreground rounded-md text-sm font-medium hover:bg-[#3B82F6]/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onRenew(policy.id)}
              aria-label={`Renew ${policy.title}`}
              disabled={policy.status === 'pending'}
            >
              Renew
            </motion.button>
            <motion.button
              className="px-4 py-2 bg-surface dark:bg-surface text-muted-foreground dark:text-muted-foreground rounded-md text-sm font-medium hover:bg-surface dark:hover:bg-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onCancel(policy.id)}
              aria-label={`Cancel ${policy.title}`}
              disabled={policy.status === 'expired'}
            >
              Cancel
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function PolicyDetailsDemo() {
  return (
    <div className="p-8 bg-surface dark:bg-surface min-h-screen flex items-center justify-center">
      <PolicyDetails />
    </div>
  )
}