'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, ShieldOff, Clock } from 'lucide-react'

interface InsurancePackage {
  id: string
  title: string
  description: string
  price: number
  features: string[]
  recommended?: boolean
}

interface InsurancePackagesProps {
  packages?: InsurancePackage[]
  onSelect?: (id: string) => void
}

const DEFAULT_PACKAGES: InsurancePackage[] = [
  {
    id: 'basic',
    title: 'Basic Coverage',
    description: 'Essential protection for your gig work',
    price: 19,
    features: ['$50,000 liability', '24/7 support', 'Basic equipment coverage'],
  },
  {
    id: 'standard',
    title: 'Standard Coverage',
    description: 'Enhanced protection for peace of mind',
    price: 39,
    features: ['$100,000 liability', '24/7 support', 'Equipment coverage', 'Income protection'],
    recommended: true,
  },
  {
    id: 'premium',
    title: 'Premium Coverage',
    description: 'Comprehensive protection for professionals',
    price: 59,
    features: ['$250,000 liability', '24/7 support', 'Full equipment coverage', 'Income protection', 'Health benefits'],
  },
]

export function InsurancePackages({
  packages = DEFAULT_PACKAGES,
  onSelect = (id) => console.log(`Selected package: ${id}`),
}: InsurancePackagesProps) {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)

  return (
    <motion.div
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-inter"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <motion.div
            key={pkg.id}
            className="bg-background dark:bg-surface rounded-xl border border-border dark:border-border p-6 relative flex flex-col transition-all duration-300 ease-in-out"
            whileHover={{ y: -4, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
          >
            {pkg.recommended && (
              <div className="absolute top-0 right-0 bg-[#3B82F6] text-foreground px-3 py-1 rounded-bl-xl rounded-tr-xl text-sm font-medium">
                Recommended
              </div>
            )}
            <div className="flex flex-col h-full">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {pkg.recommended ? (
                    <ShieldCheck className="w-6 h-6 text-[#3B82F6]" />
                  ) : (
                    <ShieldOff className="w-6 h-6 text-muted-foreground dark:text-muted-foreground" />
                  )}
                  <h3 className="text-xl font-semibold text-muted-foreground dark:text-foreground">{pkg.title}</h3>
                </div>
                <p className="text-muted-foreground dark:text-muted-foreground mt-2 text-base leading-relaxed">{pkg.description}</p>
                <div className="mt-6 space-y-3">
                  {pkg.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground dark:text-muted-foreground flex-shrink-0" />
                      <span className="text-sm text-muted-foreground dark:text-muted-foreground leading-tight">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-border dark:border-border">
                <div className="text-3xl font-bold text-muted-foreground dark:text-foreground">
                  ${pkg.price}<span className="text-lg font-medium text-muted-foreground dark:text-muted-foreground">/mo</span>
                </div>
                <motion.button
                  className="w-full mt-4 px-5 py-3 bg-[#3B82F6] text-foreground rounded-lg font-medium text-base
                             focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:ring-offset-2 dark:focus:ring-offset-gray-800
                             hover:bg-primary active:bg-primary transition-all duration-150 ease-in-out"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedPackage(pkg.id)
                    onSelect(pkg.id)
                  }}
                  aria-label={`Select ${pkg.title} plan`}
                >
                  Select Plan
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export default function InsurancePackagesDemo() {
  return <InsurancePackages />
}