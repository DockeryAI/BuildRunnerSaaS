'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calculator,
  Shield,
  TrendingUp,
  AlertCircle,
  Check,
  ChevronRight,
  Info,
  Zap,
  Users,
  Car,
  Briefcase,
  Loader2,
  XCircle,
} from 'lucide-react'

// Design System Colors (Tailwind CSS compatible)
// Primary: #3B82F6 (blue-500)
// Background: #FFFFFF (white) / dark: #1A1A1A (gray-900)
// Foreground: #1A1A1A (gray-900) / dark: #FFFFFF (white)
// Muted Foreground: #6B7280 (gray-500) / dark: #A0A0A0 (gray-400)
// Border: #E5E7EB (gray-200) / dark: #333333 (gray-700)
// Accent: #F3F4F6 (gray-100) / dark: #2A2A2A (gray-800)
// Accent Foreground: #1A1A1A (gray-900) / dark: #FFFFFF (white)
// Destructive: #EF4444 (red-500) / dark: #DC2626 (red-600)

interface RiskFactor {
  id: string
  label: string
  value: number
  min: number
  max: number
  step: number
  unit?: string
  description: string
  icon: React.ReactNode
  impact: 'low' | 'medium' | 'high'
}

interface InsurancePackage {
  id: string
  name: string
  basePrice: number
  coverage: string[]
  recommended?: boolean
}

interface PricingCalculatorProps {
  packages?: InsurancePackage[]
  onCalculate?: (price: number, factors: Record<string, number>) => void
  currency?: string
}

const DEFAULT_PACKAGES: InsurancePackage[] = [
  {
    id: 'basic',
    name: 'Basic Protection',
    basePrice: 29,
    coverage: ['Liability up to $50,000', 'Property damage', 'Legal defense']
  },
  {
    id: 'professional',
    name: 'Professional',
    basePrice: 59,
    coverage: ['Liability up to $100,000', 'Equipment protection', 'Business interruption', 'Legal defense'],
    recommended: true
  },
  {
    id: 'comprehensive',
    name: 'Comprehensive',
    basePrice: 99,
    coverage: ['Liability up to $250,000', 'Full equipment coverage', 'Business interruption', 'Cyber liability', 'Legal defense']
  }
]

const RISK_FACTORS: RiskFactor[] = [
  {
    id: 'experience',
    label: 'Years of Experience',
    value: 2,
    min: 0,
    max: 10,
    step: 1,
    unit: 'years',
    description: 'More experience typically means lower risk',
    icon: <Briefcase className="w-5 h-5" />,
    impact: 'high'
  },
  {
    id: 'revenue',
    label: 'Annual Revenue',
    value: 50000,
    min: 0,
    max: 500000,
    step: 10000,
    unit: '$',
    description: 'Higher revenue may require more coverage',
    icon: <TrendingUp className="w-5 h-5" />,
    impact: 'medium'
  },
  {
    id: 'employees',
    label: 'Number of Employees',
    value: 1,
    min: 1,
    max: 50,
    step: 1,
    description: 'More employees increase liability exposure',
    icon: <Users className="w-5 h-5" />,
    impact: 'medium'
  },
  {
    id: 'vehicles',
    label: 'Commercial Vehicles',
    value: 0,
    min: 0,
    max: 10,
    step: 1,
    description: 'Vehicle usage affects premium rates',
    icon: <Car className="w-5 h-5" />,
    impact: 'high'
  }
]

export function PricingCalculator({
  packages = DEFAULT_PACKAGES,
  onCalculate = () => { },
  currency = '$'
}: PricingCalculatorProps = {}) {
  const [factors, setFactors] = useState<Record<string, number>>(
    RISK_FACTORS.reduce((acc, factor) => ({ ...acc, [factor.id]: factor.value }), {})
  )
  const [selectedPackage, setSelectedPackage] = useState<string>('professional')
  const [isCalculating, setIsCalculating] = useState(false)
  const [isLoading, setIsLoading] = useState(true); // For initial data load simulation
  const [error, setError] = useState<string | null>(null); // For API errors

  useEffect(() => {
    // Simulate initial data loading
    const loadData = setTimeout(() => {
      setIsLoading(false);
      // Simulate an error sometimes
      // if (Math.random() > 0.8) {
      //   setError("Failed to load calculator data. Please try again.");
      // }
    }, 1000);
    return () => clearTimeout(loadData);
  }, []);

  const calculatePrice = useMemo(() => {
    const basePackage = packages.find(p => p.id === selectedPackage) || packages[0]
    let price = basePackage.basePrice

    // Experience factor (lower price for more experience)
    const experienceFactor = 1 - (factors.experience * 0.03)
    price *= Math.max(0.7, experienceFactor)

    // Revenue factor
    const revenueFactor = 1 + (factors.revenue / 1000000)
    price *= revenueFactor

    // Employee factor
    const employeeFactor = 1 + ((factors.employees - 1) * 0.05)
    price *= employeeFactor

    // Vehicle factor
    const vehicleFactor = 1 + (factors.vehicles * 0.15)
    price *= vehicleFactor

    return Math.round(price * 100) / 100
  }, [factors, selectedPackage, packages])

  useEffect(() => {
    const timer = setTimeout(() => {
      onCalculate(calculatePrice, factors)
    }, 300)
    return () => clearTimeout(timer)
  }, [calculatePrice, factors, onCalculate])

  const handleFactorChange = useCallback((factorId: string, value: number) => {
    setIsCalculating(true)
    setFactors(prev => ({ ...prev, [factorId]: value }))
    setTimeout(() => setIsCalculating(false), 300)
  }, [])

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
      <div className="w-full max-w-6xl mx-auto p-8 bg-background dark:bg-surface rounded-2xl border border-border dark:border-border shadow-lg animate-pulse">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary/10 rounded-xl">
            <div className="w-6 h-6 bg-primary/30 rounded-full"></div>
          </div>
          <div>
            <div className="h-6 bg-surface dark:bg-surface rounded w-64 mb-2"></div>
            <div className="h-4 bg-surface dark:bg-surface rounded w-96"></div>
          </div>
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-surface dark:bg-surface rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-surface dark:bg-surface">
                      <div className="w-5 h-5"></div>
                    </div>
                    <div>
                      <div className="h-4 bg-surface dark:bg-surface rounded w-48 mb-1"></div>
                      <div className="h-3 bg-surface dark:bg-surface rounded w-64"></div>
                    </div>
                  </div>
                  <div className="h-6 bg-surface dark:bg-surface rounded-full w-24"></div>
                </div>
                <div className="h-2 bg-surface dark:bg-surface rounded-lg w-full mb-3"></div>
                <div className="flex justify-between text-xs">
                  <div className="h-3 bg-surface dark:bg-surface rounded w-12"></div>
                  <div className="h-3 bg-surface dark:bg-surface rounded w-12"></div>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-6">
            <div className="bg-surface dark:bg-surface rounded-2xl p-6">
              <div className="h-4 bg-surface dark:bg-surface rounded w-32 mb-6"></div>
              <div className="h-12 bg-surface dark:bg-surface rounded w-48 mx-auto mb-6"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-surface dark:bg-surface rounded-xl"></div>
                ))}
              </div>
              <div className="h-12 bg-surface dark:bg-surface rounded-xl mt-6"></div>
              <div className="h-20 bg-surface dark:bg-surface rounded-lg mt-4"></div>
            </div>
            <div className="bg-surface dark:bg-surface rounded-xl p-6">
              <div className="h-4 bg-surface dark:bg-surface rounded w-48 mb-4"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-4 bg-surface dark:bg-surface rounded w-full"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto p-8 bg-destructive dark:bg-destructive/20 rounded-2xl border border-destructive dark:border-destructive shadow-lg text-center">
        <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-destructive dark:text-destructive mb-2">Error Loading Calculator</h3>
        <p className="text-destructive dark:text-destructive mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-foreground bg-destructive hover:bg-destructive focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-destructive transition-all duration-150"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="w-full max-w-6xl mx-auto font-inter"
    >
      <div className="bg-background dark:bg-surface rounded-2xl border border-border dark:border-border shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-primary/5 dark:bg-primary/10 border-b border-border dark:border-border px-8 py-6">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 5, scale: 1.05 }}
              className="p-3 bg-primary/10 rounded-xl"
            >
              <Calculator className="w-6 h-6 text-primary" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-semibold text-muted-foreground dark:text-foreground">Insurance Calculator</h2>
              <p className="text-muted-foreground dark:text-muted-foreground mt-1">Get an instant quote based on your business profile</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 p-8">
          {/* Risk Factors */}
          <motion.div
            className="lg:col-span-2 space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            <div className="flex items-center gap-2 mb-6">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-medium text-muted-foreground dark:text-foreground">Risk Assessment</h3>
            </div>

            {RISK_FACTORS.map((factor) => (
              <motion.div
                key={factor.id}
                variants={itemVariants}
                className="bg-background dark:bg-surface rounded-xl border border-border dark:border-border p-6 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      factor.impact === 'high' ? 'bg-destructive/10' :
                        factor.impact === 'medium' ? 'bg-surface dark:bg-surface' :
                          'bg-primary/10'
                      }`}>
                      {factor.icon}
                    </div>
                    <div>
                      <label htmlFor={`slider-${factor.id}`} className="font-medium text-muted-foreground dark:text-foreground">{factor.label}</label>
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-0.5">{factor.description}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    factor.impact === 'high' ? 'bg-destructive/10 text-destructive' :
                      factor.impact === 'medium' ? 'bg-surface dark:bg-surface text-muted-foreground dark:text-foreground' :
                        'bg-primary/10 text-primary'
                    }`}>
                    {factor.impact} impact
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-semibold text-muted-foreground dark:text-foreground">
                      {factor.unit && factor.unit === '$' && factor.unit}
                      {factors[factor.id].toLocaleString()}
                      {factor.unit && factor.unit !== '$' && ` ${factor.unit}`}
                    </span>
                  </div>

                  <input
                    id={`slider-${factor.id}`}
                    type="range"
                    min={factor.min}
                    max={factor.max}
                    step={factor.step}
                    value={factors[factor.id]}
                    onChange={(e) => handleFactorChange(factor.id, Number(e.target.value))}
                    className="w-full h-2 bg-surface dark:bg-surface rounded-lg appearance-none cursor-pointer slider focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all duration-200"
                    style={{
                      background: `linear-gradient(to right, var(--primary-color) 0%, var(--primary-color) ${
                        ((factors[factor.id] - factor.min) / (factor.max - factor.min)) * 100
                      }%, var(--muted-bg) ${
                        ((factors[factor.id] - factor.min) / (factor.max - factor.min)) * 100
                      }%, var(--muted-bg) 100%)`
                    }}
                    aria-label={`${factor.label} slider`}
                  />

                  <div className="flex justify-between text-xs text-muted-foreground dark:text-muted-foreground">
                    <span>{factor.unit === '$' ? `${factor.unit}${factor.min / 1000}K` : `${factor.min}${factor.unit || ''}`}</span>
                    <span>{factor.unit === '$' ? `${factor.unit}${factor.max / 1000}K` : `${factor.max}${factor.unit || ''}`}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Pricing Summary */}
          <div className="space-y-6">
            <div className="sticky top-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/20 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-muted-foreground dark:text-foreground">Your Quote</h3>
                  <AnimatePresence mode="wait">
                    {isCalculating && (
                      <motion.div
                        initial={{ opacity: 0, rotate: 0 }}
                        animate={{ opacity: 1, rotate: 360 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
                        aria-label="Calculating price"
                      >
                        <Zap className="w-5 h-5 text-primary" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <motion.div
                  key={calculatePrice}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  className="text-center py-6"
                >
                  <div className="text-5xl font-bold text-primary">
                    {currency}{calculatePrice}
                  </div>
                  <div className="text-muted-foreground dark:text-muted-foreground mt-2">per month</div>
                </motion.div>

                <div className="space-y-3 mt-6">
                  {packages.map((pkg) => (
                    <motion.button
                      key={pkg.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedPackage(pkg.id)}
                      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                        selectedPackage === pkg.id
                          ? 'bg-primary/10 border-primary'
                          : 'bg-background dark:bg-surface border-border dark:border-border hover:border-primary/30'
                      }`}
                      aria-pressed={selectedPackage === pkg.id}
                      aria-label={`Select ${pkg.name} package`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-muted-foreground dark:text-foreground flex items-center gap-2">
                            {pkg.name}
                            {pkg.recommended && (
                              <span className="text-xs bg-surface dark:bg-surface text-muted-foreground dark:text-foreground px-2 py-0.5 rounded-full">
                                Recommended
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground dark:text-muted-foreground mt-1">
                            Base: {currency}{pkg.basePrice}/mo
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedPackage === pkg.id
                            ? 'border-primary bg-primary'
                            : 'border-border dark:border-border'
                        }`}>
                          {selectedPackage === pkg.id && (
                            <Check className="w-3 h-3 text-foreground" />
                          )}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-6 bg-primary text-foreground py-3 px-6 rounded-xl font-medium hover:bg-primary transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  aria-label="Get Started with selected package"
                >
                  Get Started
                  <ChevronRight className="w-4 h-4" />
                </motion.button>

                <div className="mt-4 p-4 bg-surface dark:bg-surface rounded-lg border border-border dark:border-border">
                  <div className="flex gap-2">
                    <Info className="w-4 h-4 text-muted-foreground dark:text-muted-foreground mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                      This quote is an estimate. Final pricing may vary based on additional underwriting factors.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Coverage Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6 bg-background dark:bg-surface rounded-xl border border-border dark:border-border p-6"
              >
                <h4 className="font-medium text-muted-foreground dark:text-foreground mb-4">Coverage Includes:</h4>
                <ul className="space-y-3">
                  {packages.find(p => p.id === selectedPackage)?.coverage.map((item, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                      className="flex items-start gap-2 text-sm text-muted-foreground dark:text-muted-foreground"
                    >
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        :root {
          --primary-color: #3B82F6; /* blue-500 */
          --muted-bg: #E5E7EB; /* gray-200 */
        }

        .dark {
          --muted-bg: #333333; /* gray-700 */
        }

        .font-inter {
          font-family: 'Inter', system-ui, sans-serif;
        }

        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          background: var(--primary-color);
          cursor: pointer;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          transition: all 0.2s;
        }

        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        }

        .slider::-webkit-slider-thumb:focus-visible {
          outline: none;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5); /* blue-500 with 50% opacity */
        }

        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: var(--primary-color);
          cursor: pointer;
          border-radius: 50%;
          border: none;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          transition: all 0.2s;
        }

        .slider::-moz-range-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        }

        .slider::-moz-range-thumb:focus-visible {
          outline: none;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5); /* blue-500 with 50% opacity */
        }
      `}</style>
    </motion.div>
  )
}

export default function PricingCalculatorDemo() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <div className={`min-h-screen p-8 ${isDarkMode ? 'dark bg-surface' : 'bg-background'}`}>
      <PricingCalculator />
    </div>
  )
}