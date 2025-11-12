'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Shield, 
  Calendar, 
  DollarSign, 
  FileText, 
  Download, 
  Eye, 
  MoreVertical,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  User,
  Building,
  Car,
  Heart,
  Loader2,
  Info
} from 'lucide-react'

interface PolicyCoverage {
  type: string
  limit: string
  deductible: string
}

interface Policy {
  id: string
  policyNumber: string
  type: 'health' | 'auto' | 'liability' | 'equipment'
  status: 'active' | 'pending' | 'expiring'
  provider: string
  startDate: string
  endDate: string
  premium: number
  billingCycle: 'monthly' | 'quarterly' | 'annual'
  coverage: PolicyCoverage[]
  nextPayment: string
  documents: number
}

interface ActivePoliciesProps {
  policies?: Policy[]
  onViewPolicy?: (policyId: string) => void
  onDownloadDocument?: (policyId: string) => void
  onRenewPolicy?: (policyId: string) => void
  isLoading?: boolean
  error?: string | null
}

const defaultPolicies: Policy[] = [
  {
    id: '1',
    policyNumber: 'GIG-2024-001234',
    type: 'liability',
    status: 'active',
    provider: 'SafeGuard Insurance',
    startDate: '2024-01-15',
    endDate: '2025-01-15',
    premium: 89.99,
    billingCycle: 'monthly',
    coverage: [
      { type: 'General Liability', limit: '$1,000,000', deductible: '$500' },
      { type: 'Professional Liability', limit: '$500,000', deductible: '$1,000' }
    ],
    nextPayment: '2024-02-15',
    documents: 3
  },
  {
    id: '2',
    policyNumber: 'GIG-2024-001235',
    type: 'health',
    status: 'active',
    provider: 'HealthFirst',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    premium: 245.00,
    billingCycle: 'monthly',
    coverage: [
      { type: 'Medical', limit: '$5,000 deductible', deductible: '$5,000' },
      { type: 'Dental', limit: '$1,500/year', deductible: '$50' },
      { type: 'Vision', limit: '$300/year', deductible: '$25' }
    ],
    nextPayment: '2024-02-01',
    documents: 5
  },
  {
    id: '3',
    policyNumber: 'GIG-2024-001236',
    type: 'auto',
    status: 'expiring',
    provider: 'DriveSecure',
    startDate: '2023-02-20',
    endDate: '2024-02-20',
    premium: 156.50,
    billingCycle: 'monthly',
    coverage: [
      { type: 'Liability', limit: '$100,000/$300,000', deductible: '$500' },
      { type: 'Collision', limit: 'Actual Cash Value', deductible: '$1,000' },
      { type: 'Comprehensive', limit: 'Actual Cash Value', deductible: '$500' }
    ],
    nextPayment: '2024-02-20',
    documents: 2
  },
  {
    id: '4',
    policyNumber: 'GIG-2024-001237',
    type: 'equipment',
    status: 'pending',
    provider: 'TechProtect',
    startDate: '2024-02-01',
    endDate: '2025-02-01',
    premium: 45.00,
    billingCycle: 'quarterly',
    coverage: [
      { type: 'Equipment Damage', limit: '$10,000', deductible: '$250' },
      { type: 'Theft Protection', limit: '$10,000', deductible: '$500' }
    ],
    nextPayment: '2024-05-01',
    documents: 1
  }
]

const policyIcons = {
  health: Heart,
  auto: Car,
  liability: Shield,
  equipment: Building
}

const statusColors = {
  active: 'bg-secondary/10 text-secondary dark:bg-secondary/10 dark:text-secondary border-secondary/20 dark:border-secondary/20',
  pending: 'bg-accent/10 text-accent dark:bg-accent/10 dark:text-accent border-accent/20 dark:border-accent/20',
  expiring: 'bg-destructive/10 text-destructive dark:bg-destructive/10 dark:text-destructive border-destructive/20 dark:border-destructive/20'
}

const statusIcons = {
  active: CheckCircle,
  pending: Clock,
  expiring: AlertCircle
}

export function ActivePolicies({
  policies = defaultPolicies,
  onViewPolicy = (id) => console.log('View policy:', id),
  onDownloadDocument = (id) => console.log('Download document:', id),
  onRenewPolicy = (id) => console.log('Renew policy:', id),
  isLoading = false,
  error = null
}: ActivePoliciesProps = {}) {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'expiring' | 'pending'>('all')
  const [selectedPolicy, setSelectedPolicy] = useState<string | null>(null)
  const [showMenu, setShowMenu] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const filteredPolicies = policies.filter(policy => {
    if (selectedFilter === 'all') return true
    return policy.status === selectedFilter
  })

  const totalPremium = policies.reduce((sum, policy) => {
    const multiplier = policy.billingCycle === 'monthly' ? 1 : 
                      policy.billingCycle === 'quarterly' ? 0.33 : 0.083
    return sum + (policy.premium * multiplier)
  }, 0)

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const PolicyCardSkeleton = () => (
    <div className="bg-background dark:bg-surface border border-border dark:border-border rounded-xl shadow-sm p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-surface dark:bg-surface rounded-lg w-12 h-12"></div>
          <div>
            <div className="h-5 bg-surface dark:bg-surface rounded w-48 mb-1"></div>
            <div className="h-4 bg-surface dark:bg-surface rounded w-32"></div>
            <div className="h-3 bg-surface dark:bg-surface rounded w-24 mt-1"></div>
          </div>
        </div>
        <div className="h-6 bg-surface dark:bg-surface rounded-full w-24"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="h-4 bg-surface dark:bg-surface rounded w-24"></div>
        <div className="h-4 bg-surface dark:bg-surface rounded w-32"></div>
        <div className="h-4 bg-surface dark:bg-surface rounded w-28"></div>
      </div>
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="min-h-screen bg-background dark:bg-surface font-inter text-muted-foreground dark:text-muted-foreground"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-muted-foreground dark:text-muted-foreground mb-2">Active Policies</h1>
          <p className="text-muted-foreground dark:text-muted-foreground">Manage and review your insurance coverage</p>
        </div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg bg-destructive dark:bg-destructive/20 border border-destructive dark:border-destructive p-4 mb-6 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-destructive dark:text-destructive" />
            <p className="text-sm text-destructive dark:text-destructive">{error}</p>
          </motion.div>
        )}

        {/* Summary Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
            className="bg-background dark:bg-surface border border-border dark:border-border rounded-xl p-6 shadow-sm transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <TrendingUp className="w-5 h-5 text-secondary" />
            </div>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground mb-1">Total Policies</p>
            <p className="text-2xl font-semibold text-muted-foreground dark:text-muted-foreground">{isLoading ? <Loader2 className="animate-spin w-6 h-6" /> : policies.length}</p>
            <p className="text-xs text-secondary dark:text-secondary mt-2">All coverage active</p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
            className="bg-background dark:bg-surface border border-border dark:border-border rounded-xl p-6 shadow-sm transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-secondary/10 rounded-lg">
                <DollarSign className="w-6 h-6 text-secondary" />
              </div>
              <Calendar className="w-5 h-5 text-muted-foreground dark:text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground mb-1">Monthly Premium</p>
            <p className="text-2xl font-semibold text-muted-foreground dark:text-muted-foreground">{isLoading ? <Loader2 className="animate-spin w-6 h-6" /> : `$${totalPremium.toFixed(2)}`}</p>
            <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-2">Next payment in 5 days</p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
            className="bg-background dark:bg-surface border border-border dark:border-border rounded-xl p-6 shadow-sm transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-secondary/10 rounded-lg">
                <FileText className="w-6 h-6 text-secondary" />
              </div>
              <Download className="w-5 h-5 text-muted-foreground dark:text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground dark:text-muted-foreground mb-1">Documents</p>
            <p className="text-2xl font-semibold text-muted-foreground dark:text-muted-foreground">
              {isLoading ? <Loader2 className="animate-spin w-6 h-6" /> : policies.reduce((sum, p) => sum + p.documents, 0)}
            </p>
            <p className="text-xs text-secondary dark:text-secondary mt-2">All documents available</p>
          </motion.div>
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {(['all', 'active', 'expiring', 'pending'] as const).map((filter) => (
            <motion.button
              key={filter}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedFilter(filter)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 ${
                selectedFilter === filter
                  ? 'bg-primary text-foreground shadow-md'
                  : 'bg-surface dark:bg-surface text-muted-foreground dark:text-muted-foreground hover:bg-surface dark:hover:bg-surface border border-border dark:border-border'
              }`}
              aria-label={`Filter policies by ${filter}`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
              {filter !== 'all' && !isLoading && (
                <span className="ml-2 text-xs">
                  ({policies.filter(p => p.status === filter).length})
                </span>
              )}
            </motion.button>
          ))}
        </div>

        {/* Policies List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <PolicyCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            <AnimatePresence mode="wait">
              {filteredPolicies.length > 0 ? (
                filteredPolicies.map((policy) => {
                  const Icon = policyIcons[policy.type]
                  const StatusIcon = statusIcons[policy.status]
                  
                  return (
                    <motion.div
                      key={policy.id}
                      variants={itemVariants}
                      layout
                      whileHover={{ y: -2, boxShadow: "0 5px 10px -2px rgba(0, 0, 0, 0.05)" }}
                      onClick={() => setSelectedPolicy(selectedPolicy === policy.id ? null : policy.id)}
                      className="bg-background dark:bg-surface border border-border dark:border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
                      tabIndex={0}
                      role="button"
                      aria-expanded={selectedPolicy === policy.id}
                      aria-controls={`policy-details-${policy.id}`}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-4">
                            <motion.div
                              whileHover={{ rotate: 5 }}
                              className="p-3 bg-surface dark:bg-surface rounded-lg"
                            >
                              <Icon className="w-6 h-6 text-primary" />
                            </motion.div>
                            <div>
                              <h3 className="text-lg font-semibold text-muted-foreground dark:text-muted-foreground mb-1">
                                {policy.type.charAt(0).toUpperCase() + policy.type.slice(1)} Insurance
                              </h3>
                              <p className="text-sm text-muted-foreground dark:text-muted-foreground">{policy.provider}</p>
                              <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-1">
                                Policy #{policy.policyNumber}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusColors[policy.status]}`}>
                              <StatusIcon className="w-3.5 h-3.5" />
                              {policy.status.charAt(0).toUpperCase() + policy.status.slice(1)}
                            </span>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowMenu(showMenu === policy.id ? null : policy.id)
                              }}
                              className="p-2 hover:bg-surface dark:hover:bg-surface rounded-lg transition-colors relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800"
                              aria-label={`More options for policy ${policy.policyNumber}`}
                            >
                              <MoreVertical className="w-4 h-4 text-muted-foreground dark:text-muted-foreground" />
                              <AnimatePresence>
                                {showMenu === policy.id && (
                                  <motion.div
                                    ref={menuRef}
                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 top-10 bg-background dark:bg-surface border border-border dark:border-border rounded-lg shadow-lg py-2 w-48 z-10 origin-top-right"
                                    role="menu"
                                    aria-orientation="vertical"
                                    aria-labelledby={`policy-menu-button-${policy.id}`}
                                  >
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        onViewPolicy(policy.id)
                                        setShowMenu(null)
                                      }}
                                      className="w-full px-4 py-2 text-sm text-muted-foreground dark:text-muted-foreground hover:bg-surface dark:hover:bg-surface text-left flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-700"
                                      role="menuitem"
                                    >
                                      <Eye className="w-4 h-4" />
                                      View Details
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        onDownloadDocument(policy.id)
                                        setShowMenu(null)
                                      }}
                                      className="w-full px-4 py-2 text-sm text-muted-foreground dark:text-muted-foreground hover:bg-surface dark:hover:bg-surface text-left flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-700"
                                      role="menuitem"
                                    >
                                      <Download className="w-4 h-4" />
                                      Download Documents
                                    </button>
                                    {policy.status === 'expiring' && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          onRenewPolicy(policy.id)
                                          setShowMenu(null)
                                        }}
                                        className="w-full px-4 py-2 text-sm text-primary hover:bg-primary/10 dark:hover:bg-primary/20 text-left flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-700"
                                        role="menuitem"
                                      >
                                        <Shield className="w-4 h-4" />
                                        Renew Policy
                                      </button>
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-muted-foreground dark:text-muted-foreground mb-1">Premium</p>
                            <p className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                              ${policy.premium}/{policy.billingCycle}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground dark:text-muted-foreground mb-1">Coverage Period</p>
                            <p className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                              {new Date(policy.startDate).toLocaleDateString()} - {new Date(policy.endDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground dark:text-muted-foreground mb-1">Next Payment</p>
                            <p className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                              {new Date(policy.nextPayment).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <AnimatePresence>
                          {selectedPolicy === policy.id && (
                            <motion.div
                              id={`policy-details-${policy.id}`}
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                              className="border-t border-border dark:border-border pt-4 mt-4"
                            >
                              <h4 className="text-sm font-medium text-muted-foreground dark:text-muted-foreground mb-3">Coverage Details</h4>
                              <div className="space-y-2">
                                {policy.coverage.map((coverage, index) => (
                                  <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center justify-between p-3 bg-surface dark:bg-surface rounded-lg"
                                  >
                                    <div>
                                      <p className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">{coverage.type}</p>
                                      <p className="text-xs text-muted-foreground dark:text-muted-foreground">Deductible: {coverage.deductible}</p>
                                    </div>
                                    <p className="text-sm font-medium text-primary">{coverage.limit}</p>
                                  </motion.div>
                                ))}
                              </div>
                              <div className="flex gap-3 mt-4">
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onViewPolicy(policy.id)
                                  }}
                                  className="flex-1 px-4 py-2 bg-primary text-foreground rounded-lg hover:bg-primary transition-colors font-medium text-sm shadow-md hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
                                  aria-label={`View full details for policy ${policy.policyNumber}`}
                                >
                                  View Full Policy
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onDownloadDocument(policy.id)
                                  }}
                                  className="px-4 py-2 bg-background dark:bg-surface text-muted-foreground dark:text-muted-foreground rounded-lg hover:bg-surface dark:hover:bg-surface transition-colors font-medium text-sm border border-border dark:border-border flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
                                  aria-label={`Download documents for policy ${policy.policyNumber}`}
                                >
                                  <Download className="w-4 h-4" />
                                  Documents
                                </motion.button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )
                })
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 bg-background dark:bg-surface border border-border dark:border-border rounded-xl shadow-sm"
                >
                  <Info className="w-12 h-12 text-muted-foreground dark:text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground dark:text-muted-foreground mb-2">No policies found</h3>
                  <p className="text-muted-foreground dark:text-muted-foreground">
                    {selectedFilter === 'all' 
                      ? "You don't have any policies yet."
                      : `You don't have any ${selectedFilter} policies.`}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default function ActivePoliciesDemo() {
  const [loading, setLoading] = useState(true);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPolicies(defaultPolicies);
      setLoading(false);
    }, 1500); // Simulate API call
    return () => clearTimeout(timer);
  }, []);

  return <ActivePolicies policies={policies} isLoading={loading} error={error} />
}