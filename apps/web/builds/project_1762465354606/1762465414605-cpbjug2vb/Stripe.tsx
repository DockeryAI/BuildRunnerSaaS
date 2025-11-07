'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CreditCard, Banknote, CheckCircle, XCircle, Loader2 } from 'lucide-react'

interface PaymentMethod {
  id: string
  type: 'card' | 'bank_account'
  last4: string
  brand?: string // For cards
  bankName?: string // For bank accounts
  isDefault: boolean
}

interface StripePaymentSetupProps {
  userId?: string
  initialPaymentMethods?: PaymentMethod[]
  onPaymentMethodAdded?: (method: PaymentMethod) => void
  onPaymentMethodRemoved?: (methodId: string) => void
  onDefaultPaymentMethodChanged?: (methodId: string) => void
  isLoading?: boolean
  error?: string | null
}

const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'card_1', type: 'card', last4: '4242', brand: 'Visa', isDefault: true },
  { id: 'bank_1', type: 'bank_account', last4: '6789', bankName: 'Chase', isDefault: false },
]

export function StripePaymentSetup({
  userId = 'user_123',
  initialPaymentMethods = DEFAULT_PAYMENT_METHODS,
  onPaymentMethodAdded = (method) => console.log('Payment method added:', method),
  onPaymentMethodRemoved = (methodId) => console.log('Payment method removed:', methodId),
  onDefaultPaymentMethodChanged = (methodId) => console.log('Default payment method changed:', methodId),
  isLoading: propIsLoading = false,
  error: propError = null,
}: StripePaymentSetupProps = {}) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(initialPaymentMethods)
  const [isAddingMethod, setIsAddingMethod] = useState(false)
  const [newMethodType, setNewMethodType] = useState<'card' | 'bank_account'>('card')
  const [inputLast4, setInputLast4] = useState('')
  const [inputBrand, setInputBrand] = useState('')
  const [inputBankName, setInputBankName] = useState('')
  const [localLoading, setLocalLoading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const isLoading = propIsLoading || localLoading
  const error = propError || localError

  useEffect(() => {
    setPaymentMethods(initialPaymentMethods)
  }, [initialPaymentMethods])

  const showFeedback = useCallback((message: string, isError: boolean = false) => {
    if (isError) {
      setLocalError(message)
      setSuccessMessage(null)
    } else {
      setSuccessMessage(message)
      setLocalError(null)
    }
    const timer = setTimeout(() => {
      setSuccessMessage(null)
      setLocalError(null)
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleAddMethod = async () => {
    setLocalLoading(true)
    setLocalError(null)
    setSuccessMessage(null)

    if (!inputLast4 || (newMethodType === 'card' && !inputBrand) || (newMethodType === 'bank_account' && !inputBankName)) {
      showFeedback('Please fill in all details for the new payment method.', true)
      setLocalLoading(false)
      return
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))

      const newMethod: PaymentMethod = {
        id: `temp_${Date.now()}`,
        type: newMethodType,
        last4: inputLast4,
        brand: newMethodType === 'card' ? inputBrand : undefined,
        bankName: newMethodType === 'bank_account' ? inputBankName : undefined,
        isDefault: paymentMethods.length === 0, // First method added becomes default
      }

      setPaymentMethods((prev) => {
        const updatedMethods = prev.map(m => ({ ...m, isDefault: false })); // Ensure only one default
        return newMethod.isDefault ? [newMethod, ...updatedMethods] : [...updatedMethods, newMethod];
      });
      onPaymentMethodAdded(newMethod)
      setIsAddingMethod(false)
      setInputLast4('')
      setInputBrand('')
      setInputBankName('')
      showFeedback('Payment method added successfully!')
    } catch (err) {
      showFeedback('Failed to add payment method. Please try again.', true)
    } finally {
      setLocalLoading(false)
    }
  }

  const handleRemoveMethod = async (methodId: string) => {
    setLocalLoading(true)
    setLocalError(null)
    setSuccessMessage(null)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setPaymentMethods((prev) => {
        const updatedMethods = prev.filter((m) => m.id !== methodId);
        if (updatedMethods.length > 0 && !updatedMethods.some(m => m.isDefault)) {
          // If default was removed, set the first remaining as default
          updatedMethods[0].isDefault = true;
          onDefaultPaymentMethodChanged(updatedMethods[0].id);
        }
        return updatedMethods;
      });
      onPaymentMethodRemoved(methodId)
      showFeedback('Payment method removed.')
    } catch (err) {
      showFeedback('Failed to remove payment method. Please try again.', true)
    } finally {
      setLocalLoading(false)
    }
  }

  const handleSetDefault = async (methodId: string) => {
    setLocalLoading(true)
    setLocalError(null)
    setSuccessMessage(null)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      setPaymentMethods((prev) =>
        prev.map((m) => ({ ...m, isDefault: m.id === methodId }))
      )
      onDefaultPaymentMethodChanged(methodId)
      showFeedback('Default payment method updated.')
    } catch (err) {
      showFeedback('Failed to set default payment method. Please try again.', true)
    } finally {
      setLocalLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="w-full max-w-2xl mx-auto p-6 md:p-8 bg-background dark:bg-surface rounded-xl shadow-lg border border-border dark:border-border font-inter"
    >
      <h2 className="text-2xl font-semibold text-muted-foreground dark:text-foreground mb-6">Payment Methods</h2>

      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center py-8 text-muted-foreground dark:text-muted-foreground"
          >
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading...
          </motion.div>
        )}
        {!isLoading && error && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center p-3 mb-4 bg-destructive dark:bg-destructive/20 text-destructive dark:text-destructive rounded-lg text-sm"
          >
            <XCircle className="h-4 w-4 mr-2" />
            {error}
          </motion.div>
        )}
        {!isLoading && successMessage && (
          <motion.div
            key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center p-3 mb-4 bg-secondary dark:bg-secondary/20 text-secondary dark:text-secondary rounded-lg text-sm"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {!isLoading && paymentMethods.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center py-10 text-muted-foreground dark:text-muted-foreground"
        >
          <CreditCard className="mx-auto h-12 w-12 mb-4" />
          <p className="text-lg">No payment methods added yet.</p>
          <p className="text-sm mt-2">Add a card or bank account to get started.</p>
        </motion.div>
      )}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-4 mb-6"
      >
        {paymentMethods.map((method) => (
          <motion.div
            key={method.id}
            variants={itemVariants}
            whileHover={{ y: -2, boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)" }}
            className="flex items-center justify-between p-4 bg-surface dark:bg-surface rounded-lg border border-border dark:border-border transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              {method.type === 'card' ? (
                <CreditCard className="h-5 w-5 text-muted-foreground dark:text-muted-foreground" />
              ) : (
                <Banknote className="h-5 w-5 text-muted-foreground dark:text-muted-foreground" />
              )}
              <div>
                <p className="text-muted-foreground dark:text-foreground font-medium">
                  {method.type === 'card' ? `${method.brand} ending in ${method.last4}` : `${method.bankName} (Bank Account) ending in ${method.last4}`}
                </p>
                {method.isDefault && (
                  <span className="px-2 py-0.5 mt-1 inline-flex items-center rounded-full text-xs font-medium bg-primary dark:bg-primary/20 text-primary dark:text-primary border border-primary dark:border-primary">
                    <CheckCircle className="h-3 w-3 mr-1" /> Default
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!method.isDefault && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSetDefault(method.id)}
                  className="px-3 py-1.5 text-sm font-medium text-[#3B82F6] hover:text-primary dark:text-primary dark:hover:text-primary transition-colors duration-150 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={`Set ${method.type} ending in ${method.last4} as default`}
                  disabled={isLoading}
                >
                  Set Default
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleRemoveMethod(method.id)}
                className="px-3 py-1.5 text-sm font-medium text-destructive hover:text-destructive dark:text-destructive dark:hover:text-destructive transition-colors duration-150 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-destructive/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={`Remove ${method.type} ending in ${method.last4}`}
                disabled={isLoading}
              >
                Remove
              </motion.button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {isAddingMethod ? (
          <motion.div
            key="add-form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6 bg-surface dark:bg-surface rounded-lg border border-border dark:border-border space-y-4"
          >
            <h3 className="text-lg font-medium text-muted-foreground dark:text-foreground">Add New Payment Method</h3>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setNewMethodType('card')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed ${
                  newMethodType === 'card'
                    ? 'bg-[#3B82F6] text-foreground'
                    : 'bg-background dark:bg-surface text-muted-foreground dark:text-foreground border border-border dark:border-border hover:bg-surface dark:hover:bg-surface'
                }`}
                aria-pressed={newMethodType === 'card'}
                disabled={isLoading}
              >
                <CreditCard className="inline-block h-4 w-4 mr-2" /> Add Card
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setNewMethodType('bank_account')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed ${
                  newMethodType === 'bank_account'
                    ? 'bg-[#3B82F6] text-foreground'
                    : 'bg-background dark:bg-surface text-muted-foreground dark:text-foreground border border-border dark:border-border hover:bg-surface dark:hover:bg-surface'
                }`}
                aria-pressed={newMethodType === 'bank_account'}
                disabled={isLoading}
              >
                <Banknote className="inline-block h-4 w-4 mr-2" /> Add Bank Account
              </motion.button>
            </div>

            <input
              type="text"
              placeholder="Last 4 digits (e.g., 4242)"
              value={inputLast4}
              onChange={(e) => setInputLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
              className="w-full px-4 py-2.5 bg-background dark:bg-surface border border-border dark:border-border rounded-lg text-muted-foreground dark:text-foreground placeholder-gray-500 dark:placeholder-gray-400 focus:border-[#3B82F6] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#3B82F6]/50 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Last 4 digits of payment method"
              maxLength={4}
              disabled={isLoading}
            />
            {newMethodType === 'card' && (
              <input
                type="text"
                placeholder="Card Brand (e.g., Visa, Mastercard)"
                value={inputBrand}
                onChange={(e) => setInputBrand(e.target.value)}
                className="w-full px-4 py-2.5 bg-background dark:bg-surface border border-border dark:border-border rounded-lg text-muted-foreground dark:text-foreground placeholder-gray-500 dark:placeholder-gray-400 focus:border-[#3B82F6] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#3B82F6]/50 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Card brand"
                disabled={isLoading}
              />
            )}
            {newMethodType === 'bank_account' && (
              <input
                type="text"
                placeholder="Bank Name (e.g., Chase, Wells Fargo)"
                value={inputBankName}
                onChange={(e) => setInputBankName(e.target.value)}
                className="w-full px-4 py-2.5 bg-background dark:bg-surface border border-border dark:border-border rounded-lg text-muted-foreground dark:text-foreground placeholder-gray-500 dark:placeholder-gray-400 focus:border-[#3B82F6] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#3B82F6]/50 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Bank name"
                disabled={isLoading}
              />
            )}

            <div className="flex gap-3 justify-end">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsAddingMethod(false)}
                className="px-5 py-2.5 bg-background dark:bg-surface text-muted-foreground dark:text-foreground rounded-lg hover:bg-surface dark:hover:bg-surface border border-border dark:border-border transition-colors duration-150 font-medium text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-muted/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddMethod}
                className="px-5 py-2.5 bg-[#3B82F6] text-foreground rounded-lg hover:bg-primary transition-colors duration-150 font-medium text-sm shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Add Method
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="add-button"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsAddingMethod(true)}
            className="w-full px-5 py-2.5 bg-[#3B82F6] text-foreground rounded-lg hover:bg-primary transition-colors duration-150 font-medium text-sm shadow-md hover:shadow-lg active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
            aria-label="Add new payment method"
          >
            Add New Payment Method
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function StripePaymentSetupDemo() {
  return (
    <div className="min-h-screen bg-background dark:bg-surface p-4 flex items-center justify-center font-inter">
      <StripePaymentSetup />
    </div>
  )
}