'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CreditCard, 
  Shield, 
  Lock, 
  Check, 
  AlertCircle,
  ChevronRight,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  FileText,
  Loader2
} from 'lucide-react'

interface InsuranceCheckoutProps {
  planId?: string
  planName?: string
  planPrice?: number
  planFeatures?: string[]
  onSuccess?: (paymentId: string) => void
  onCancel?: () => void
}

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  companyName: string
  businessType: string
  cardNumber: string
  expiryDate: string
  cvv: string
  cardholderName: string
}

interface FormErrors {
  [key: string]: string
}

export function InsuranceCheckout({
  planId = 'professional-plan',
  planName = 'Professional Coverage',
  planPrice = 149,
  planFeatures = [
    'General liability up to $2M',
    'Professional liability coverage',
    'Equipment protection up to $10K',
    'Legal expense coverage',
    '24/7 claims support'
  ],
  onSuccess = (id) => console.log('Payment successful:', id),
  onCancel = () => console.log('Checkout cancelled')
}: InsuranceCheckoutProps = {}) {
  const [step, setStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    companyName: '',
    businessType: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [paymentComplete, setPaymentComplete] = useState(false)

  const validateStep = (currentStep: number): boolean => {
    const newErrors: FormErrors = {}

    if (currentStep === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
      if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Valid email is required'
      }
      if (!formData.phone.trim() || !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
        newErrors.phone = 'Valid phone number is required'
      }
    }

    if (currentStep === 2) {
      if (!formData.address.trim()) newErrors.address = 'Address is required'
      if (!formData.city.trim()) newErrors.city = 'City is required'
      if (!formData.state.trim()) newErrors.state = 'State is required'
      if (!formData.zipCode.trim() || !/^\d{5}$/.test(formData.zipCode)) {
        newErrors.zipCode = 'Valid ZIP code is required'
      }
      if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required'
      if (!formData.businessType.trim()) newErrors.businessType = 'Business type is required'
    }

    if (currentStep === 3) {
      if (!formData.cardNumber.trim() || !/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
        newErrors.cardNumber = 'Valid card number is required'
      }
      if (!formData.expiryDate.trim() || !/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(formData.expiryDate)) {
        newErrors.expiryDate = 'Valid expiry date (MM/YY) is required'
      }
      if (!formData.cvv.trim() || !/^\d{3,4}$/.test(formData.cvv)) {
        newErrors.cvv = 'Valid CVV is required'
      }
      if (!formData.cardholderName.trim()) newErrors.cardholderName = 'Cardholder name is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    const chunks = cleaned.match(/.{1,4}/g) || []
    return chunks.join(' ').substr(0, 19)
  }

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4)
    }
    return cleaned
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    setStep(prev => prev - 1)
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) return

    setIsProcessing(true)
    
    // Simulate payment processing
    try {
      await new Promise(resolve => setTimeout(resolve, 3000))
      setPaymentComplete(true)
      const paymentId = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      setTimeout(() => {
        onSuccess(paymentId)
      }, 2000)
    } catch (error) {
      console.error('Payment failed:', error)
      setErrors({ payment: 'Payment processing failed. Please try again.' })
    } finally {
      setIsProcessing(false)
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
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="min-h-screen bg-background dark:bg-surface py-8 px-4 font-inter"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1 
            className="text-3xl font-bold text-muted-foreground dark:text-foreground mb-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Complete Your Insurance Purchase
          </motion.h1>
          <motion.p 
            className="text-muted-foreground dark:text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Secure checkout powered by Stripe
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            {/* Progress Steps */}
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center flex-1">
                    <motion.div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all duration-300 ${
                        step >= i 
                          ? 'bg-[#3B82F6] text-foreground' 
                          : 'bg-surface dark:bg-surface text-muted-foreground dark:text-muted-foreground'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {step > i ? <Check className="w-5 h-5" /> : i}
                    </motion.div>
                    {i < 3 && (
                      <div className={`flex-1 h-1 mx-2 transition-all duration-300 ${
                        step > i ? 'bg-[#3B82F6]' : 'bg-surface dark:bg-surface'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 px-1">
                <span className="text-sm text-muted-foreground dark:text-muted-foreground">Personal Info</span>
                <span className="text-sm text-muted-foreground dark:text-muted-foreground">Business Details</span>
                <span className="text-sm text-muted-foreground dark:text-muted-foreground">Payment</span>
              </div>
            </motion.div>

            <AnimatePresence mode="wait">
              {!paymentComplete ? (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                  className="bg-background dark:bg-surface border border-border dark:border-border rounded-xl p-6 shadow-sm"
                >
                  {/* Step 1: Personal Information */}
                  {step === 1 && (
                    <motion.div variants={containerVariants} initial="hidden" animate="show">
                      <h2 className="text-xl font-semibold text-muted-foreground dark:text-foreground mb-6 flex items-center gap-2">
                        <User className="w-5 h-5 text-[#3B82F6]" />
                        Personal Information
                      </h2>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <motion.div variants={itemVariants}>
                          <label htmlFor="firstName" className="block text-sm font-medium text-muted-foreground dark:text-foreground mb-2">
                            First Name
                          </label>
                          <input
                            id="firstName"
                            type="text"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            className={`w-full px-4 py-2.5 bg-background dark:bg-surface border rounded-lg text-muted-foreground dark:text-foreground placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]/50 transition-all duration-150 ${
                              errors.firstName ? 'border-destructive dark:border-destructive' : 'border-border dark:border-border'
                            }`}
                            placeholder="John"
                            aria-invalid={errors.firstName ? "true" : "false"}
                            aria-describedby={errors.firstName ? "firstName-error" : undefined}
                          />
                          {errors.firstName && (
                            <p id="firstName-error" className="text-destructive dark:text-destructive text-sm mt-1">{errors.firstName}</p>
                          )}
                        </motion.div>

                        <motion.div variants={itemVariants}>
                          <label htmlFor="lastName" className="block text-sm font-medium text-muted-foreground dark:text-foreground mb-2">
                            Last Name
                          </label>
                          <input
                            id="lastName"
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            className={`w-full px-4 py-2.5 bg-background dark:bg-surface border rounded-lg text-muted-foreground dark:text-foreground placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]/50 transition-all duration-150 ${
                              errors.lastName ? 'border-destructive dark:border-destructive' : 'border-border dark:border-border'
                            }`}
                            placeholder="Doe"
                            aria-invalid={errors.lastName ? "true" : "false"}
                            aria-describedby={errors.lastName ? "lastName-error" : undefined}
                          />
                          {errors.lastName && (
                            <p id="lastName-error" className="text-destructive dark:text-destructive text-sm mt-1">{errors.lastName}</p>
                          )}
                        </motion.div>

                        <motion.div variants={itemVariants}>
                          <label htmlFor="email" className="block text-sm font-medium text-muted-foreground dark:text-foreground mb-2">
                            <Mail className="w-4 h-4 inline mr-1" />
                            Email
                          </label>
                          <input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className={`w-full px-4 py-2.5 bg-background dark:bg-surface border rounded-lg text-muted-foreground dark:text-foreground placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]/50 transition-all duration-150 ${
                              errors.email ? 'border-destructive dark:border-destructive' : 'border-border dark:border-border'
                            }`}
                            placeholder="john@example.com"
                            aria-invalid={errors.email ? "true" : "false"}
                            aria-describedby={errors.email ? "email-error" : undefined}
                          />
                          {errors.email && (
                            <p id="email-error" className="text-destructive dark:text-destructive text-sm mt-1">{errors.email}</p>
                          )}
                        </motion.div>

                        <motion.div variants={itemVariants}>
                          <label htmlFor="phone" className="block text-sm font-medium text-muted-foreground dark:text-foreground mb-2">
                            <Phone className="w-4 h-4 inline mr-1" />
                            Phone
                          </label>
                          <input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            className={`w-full px-4 py-2.5 bg-background dark:bg-surface border rounded-lg text-muted-foreground dark:text-foreground placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]/50 transition-all duration-150 ${
                              errors.phone ? 'border-destructive dark:border-destructive' : 'border-border dark:border-border'
                            }`}
                            placeholder="(555) 123-4567"
                            aria-invalid={errors.phone ? "true" : "false"}
                            aria-describedby={errors.phone ? "phone-error" : undefined}
                          />
                          {errors.phone && (
                            <p id="phone-error" className="text-destructive dark:text-destructive text-sm mt-1">{errors.phone}</p>
                          )}
                        </motion.div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Business Details */}
                  {step === 2 && (
                    <motion.div variants={containerVariants} initial="hidden" animate="show">
                      <h2 className="text-xl font-semibold text-muted-foreground dark:text-foreground mb-6 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-[#3B82F6]" />
                        Business Details
                      </h2>
                      
                      <div className="space-y-4">
                        <motion.div variants={itemVariants}>
                          <label htmlFor="address" className="block text-sm font-medium text-muted-foreground dark:text-foreground mb-2">
                            <MapPin className="w-4 h-4 inline mr-1" />
                            Business Address
                          </label>
                          <input
                            id="address"
                            type="text"
                            value={formData.address}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            className={`w-full px-4 py-2.5 bg-background dark:bg-surface border rounded-lg text-muted-foreground dark:text-foreground placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]/50 transition-all duration-150 ${
                              errors.address ? 'border-destructive dark:border-destructive' : 'border-border dark:border-border'
                            }`}
                            placeholder="123 Main Street"
                            aria-invalid={errors.address ? "true" : "false"}
                            aria-describedby={errors.address ? "address-error" : undefined}
                          />
                          {errors.address && (
                            <p id="address-error" className="text-destructive dark:text-destructive text-sm mt-1">{errors.address}</p>
                          )}
                        </motion.div>

                        <div className="grid md:grid-cols-3 gap-4">
                          <motion.div variants={itemVariants}>
                            <label htmlFor="city" className="block text-sm font-medium text-muted-foreground dark:text-foreground mb-2">
                              City
                            </label>
                            <input
                              id="city"
                              type="text"
                              value={formData.city}
                              onChange={(e) => handleInputChange('city', e.target.value)}
                              className={`w-full px-4 py-2.5 bg-background dark:bg-surface border rounded-lg text-muted-foreground dark:text-foreground placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]/50 transition-all duration-150 ${
                                errors.city ? 'border-destructive dark:border-destructive' : 'border-border dark:border-border'
                              }`}
                              placeholder="New York"
                              aria-invalid={errors.city ? "true" : "false"}
                              aria-describedby={errors.city ? "city-error" : undefined}
                            />
                            {errors.city && (
                              <p id="city-error" className="text-destructive dark:text-destructive text-sm mt-1">{errors.city}</p>
                            )}
                          </motion.div>

                          <motion.div variants={itemVariants}>
                            <label htmlFor="state" className="block text-sm font-medium text-muted-foreground dark:text-foreground mb-2">
                              State
                            </label>
                            <input
                              id="state"
                              type="text"
                              value={formData.state}
                              onChange={(e) => handleInputChange('state', e.target.value)}
                              className={`w-full px-4 py-2.5 bg-background dark:bg-surface border rounded-lg text-muted-foreground dark:text-foreground placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]/50 transition-all duration-150 ${
                                errors.state ? 'border-destructive dark:border-destructive' : 'border-border dark:border-border'
                              }`}
                              placeholder="NY"
                              aria-invalid={errors.state ? "true" : "false"}
                              aria-describedby={errors.state ? "state-error" : undefined}
                            />
                            {errors.state && (
                              <p id="state-error" className="text-destructive dark:text-destructive text-sm mt-1">{errors.state}</p>
                            )}
                          </motion.div>

                          <motion.div variants={itemVariants}>
                            <label htmlFor="zipCode" className="block text-sm font-medium text-muted-foreground dark:text-foreground mb-2">
                              ZIP Code
                            </label>
                            <input
                              id="zipCode"
                              type="text"
                              value={formData.zipCode}
                              onChange={(e) => handleInputChange('zipCode', e.target.value)}
                              className={`w-full px-4 py-2.5 bg-background dark:bg-surface border rounded-lg text-muted-foreground dark:text-foreground placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]/50 transition-all duration-150 ${
                                errors.zipCode ? 'border-destructive dark:border-destructive' : 'border-border dark:border-border'
                              }`}
                              placeholder="10001"
                              aria-invalid={errors.zipCode ? "true" : "false"}
                              aria-describedby={errors.zipCode ? "zipCode-error" : undefined}
                            />
                            {errors.zipCode && (
                              <p id="zipCode-error" className="text-destructive dark:text-destructive text-sm mt-1">{errors.zipCode}</p>
                            )}
                          </motion.div>
                        </div>

                        <motion.div variants={itemVariants}>
                          <label htmlFor="companyName" className="block text-sm font-medium text-muted-foreground dark:text-foreground mb-2">
                            Company Name
                          </label>
                          <input
                            id="companyName"
                            type="text"
                            value={formData.companyName}
                            onChange={(e) => handleInputChange('companyName', e.target.value)}
                            className={`w-full px-4 py-2.5 bg-background dark:bg-surface border rounded-lg text-muted-foreground dark:text-foreground placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]/50 transition-all duration-150 ${
                              errors.companyName ? 'border-destructive dark:border-destructive' : 'border-border dark:border-border'
                            }`}
                            placeholder="Acme Freelance Services"
                            aria-invalid={errors.companyName ? "true" : "false"}
                            aria-describedby={errors.companyName ? "companyName-error" : undefined}
                          />
                          {errors.companyName && (
                            <p id="companyName-error" className="text-destructive dark:text-destructive text-sm mt-1">{errors.companyName}</p>
                          )}
                        </motion.div>

                        <motion.div variants={itemVariants}>
                          <label htmlFor="businessType" className="block text-sm font-medium text-muted-foreground dark:text-foreground mb-2">
                            <FileText className="w-4 h-4 inline mr-1" />
                            Business Type
                          </label>
                          <select
                            id="businessType"
                            value={formData.businessType}
                            onChange={(e) => handleInputChange('businessType', e.target.value)}
                            className={`w-full px-4 py-2.5 bg-background dark:bg-surface border rounded-lg text-muted-foreground dark:text-foreground focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]/50 transition-all duration-150 ${
                              errors.businessType ? 'border-destructive dark:border-destructive' : 'border-border dark:border-border'
                            }`}
                            aria-invalid={errors.businessType ? "true" : "false"}
                            aria-describedby={errors.businessType ? "businessType-error" : undefined}
                          >
                            <option value="">Select business type</option>
                            <option value="freelance">Freelance Professional</option>
                            <option value="consultant">Consultant</option>
                            <option value="contractor">Independent Contractor</option>
                            <option value="agency">Agency</option>
                            <option value="other">Other</option>
                          </select>
                          {errors.businessType && (
                            <p id="businessType-error" className="text-destructive dark:text-destructive text-sm mt-1">{errors.businessType}</p>
                          )}
                        </motion.div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Payment */}
                  {step === 3 && (
                    <motion.div variants={containerVariants} initial="hidden" animate="show">
                      <h2 className="text-xl font-semibold text-muted-foreground dark:text-foreground mb-6 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-[#3B82F6]" />
                        Payment Information
                      </h2>

                      <div className="bg-primary dark:bg-primary/20 border border-primary dark:border-primary rounded-lg p-4 mb-6">
                        <div className="flex items-center gap-2 text-primary dark:text-primary mb-1">
                          <Shield className="w-4 h-4" />
                          <span className="text-sm font-medium">Secure Payment</span>
                        </div>
                        <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                          Your payment information is encrypted and secure. We never store your card details.
                        </p>
                      </div>
                      
                      <div className="space-y-4">
                        <motion.div variants={itemVariants}>
                          <label htmlFor="cardNumber" className="block text-sm font-medium text-muted-foreground dark:text-foreground mb-2">
                            Card Number
                          </label>
                          <input
                            id="cardNumber"
                            type="text"
                            value={formData.cardNumber}
                            onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                            className={`w-full px-4 py-2.5 bg-background dark:bg-surface border rounded-lg text-muted-foreground dark:text-foreground placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]/50 transition-all duration-150 ${
                              errors.cardNumber ? 'border-destructive dark:border-destructive' : 'border-border dark:border-border'
                            }`}
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                            aria-invalid={errors.cardNumber ? "true" : "false"}
                            aria-describedby={errors.cardNumber ? "cardNumber-error" : undefined}
                          />
                          {errors.cardNumber && (
                            <p id="cardNumber-error" className="text-destructive dark:text-destructive text-sm mt-1">{errors.cardNumber}</p>
                          )}
                        </motion.div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <motion.div variants={itemVariants}>
                            <label htmlFor="expiryDate" className="block text-sm font-medium text-muted-foreground dark:text-foreground mb-2">
                              <Calendar className="w-4 h-4 inline mr-1" />
                              Expiry Date
                            </label>
                            <input
                              id="expiryDate"
                              type="text"
                              value={formData.expiryDate}
                              onChange={(e) => handleInputChange('expiryDate', formatExpiryDate(e.target.value))}
                              className={`w-full px-4 py-2.5 bg-background dark:bg-surface border rounded-lg text-muted-foreground dark:text-foreground placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]/50 transition-all duration-150 ${
                                errors.expiryDate ? 'border-destructive dark:border-destructive' : 'border-border dark:border-border'
                              }`}
                              placeholder="MM/YY"
                              maxLength={5}
                              aria-invalid={errors.expiryDate ? "true" : "false"}
                              aria-describedby={errors.expiryDate ? "expiryDate-error" : undefined}
                            />
                            {errors.expiryDate && (
                              <p id="expiryDate-error" className="text-destructive dark:text-destructive text-sm mt-1">{errors.expiryDate}</p>
                            )}
                          </motion.div>

                          <motion.div variants={itemVariants}>
                            <label htmlFor="cvv" className="block text-sm font-medium text-muted-foreground dark:text-foreground mb-2">
                              <Lock className="w-4 h-4 inline mr-1" />
                              CVV
                            </label>
                            <input
                              id="cvv"
                              type="text"
                              value={formData.cvv}
                              onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, ''))}
                              className={`w-full px-4 py-2.5 bg-background dark:bg-surface border rounded-lg text-muted-foreground dark:text-foreground placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]/50 transition-all duration-150 ${
                                errors.cvv ? 'border-destructive dark:border-destructive' : 'border-border dark:border-border'
                              }`}
                              placeholder="123"
                              maxLength={4}
                              aria-invalid={errors.cvv ? "true" : "false"}
                              aria-describedby={errors.cvv ? "cvv-error" : undefined}
                            />
                            {errors.cvv && (
                              <p id="cvv-error" className="text-destructive dark:text-destructive text-sm mt-1">{errors.cvv}</p>
                            )}
                          </motion.div>
                        </div>

                        <motion.div variants={itemVariants}>
                          <label htmlFor="cardholderName" className="block text-sm font-medium text-muted-foreground dark:text-foreground mb-2">
                            Cardholder Name
                          </label>
                          <input
                            id="cardholderName"
                            type="text"
                            value={formData.cardholderName}
                            onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                            className={`w-full px-4 py-2.5 bg-background dark:bg-surface border rounded-lg text-muted-foreground dark:text-foreground placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]/50 transition-all duration-150 ${
                              errors.cardholderName ? 'border-destructive dark:border-destructive' : 'border-border dark:border-border'
                            }`}
                            placeholder="John Doe"
                            aria-invalid={errors.cardholderName ? "true" : "false"}
                            aria-describedby={errors.cardholderName ? "cardholderName-error" : undefined}
                          />
                          {errors.cardholderName && (
                            <p id="cardholderName-error" className="text-destructive dark:text-destructive text-sm mt-1">{errors.cardholderName}</p>
                          )}
                        </motion.div>
                      </div>

                      {errors.payment && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-4 p-4 bg-destructive dark:bg-destructive/20 border border-destructive dark:border-destructive rounded-lg flex items-center gap-2 text-destructive dark:text-destructive"
                          role="alert"
                        >
                          <AlertCircle className="w-5 h-5" />
                          <p className="text-sm">{errors.payment}</p>
                        </motion.div>
                      )}
                    </motion.div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between mt-8">
                    <motion.button
                      onClick={step === 1 ? onCancel : handleBack}
                      className="px-6 py-2.5 bg-surface dark:bg-surface text-muted-foreground dark:text-foreground rounded-lg hover:bg-surface dark:hover:bg-surface transition-all duration-150 font-medium text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      aria-label={step === 1 ? "Cancel checkout" : "Go back to previous step"}
                    >
                      {step === 1 ? 'Cancel' : 'Back'}
                    </motion.button>

                    {step < 3 ? (
                      <motion.button
                        onClick={handleNext}
                        className="px-6 py-2.5 bg-[#3B82F6] text-foreground rounded-lg hover:bg-primary transition-all duration-150 font-medium text-sm flex items-center gap-2 shadow-md hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        aria-label="Continue to next step"
                      >
                        Continue
                        <ChevronRight className="w-4 h-4" />
                      </motion.button>
                    ) : (
                      <motion.button
                        onClick={handleSubmit}
                        disabled={isProcessing}
                        className="px-6 py-2.5 bg-[#3B82F6] text-foreground rounded-lg hover:bg-primary transition-all duration-150 font-medium text-sm flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50"
                        whileHover={!isProcessing ? { scale: 1.02 } : {}}
                        whileTap={!isProcessing ? { scale: 0.98 } : {}}
                        aria-label={isProcessing ? "Processing payment" : "Complete purchase"}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4" />
                            Complete Purchase
                          </>
                        )}
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                  className="bg-background dark:bg-surface border border-border dark:border-border rounded-xl p-8 text-center"
                  role="status"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-20 h-20 bg-primary dark:bg-primary rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <Check className="w-10 h-10 text-[#3B82F6]" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-muted-foreground dark:text-foreground mb-2">Payment Successful!</h2>
                  <p className="text-muted-foreground dark:text-muted-foreground mb-6">
                    Your insurance coverage is now active. Check your email for confirmation.
                  </p>
                  <motion.div
                    className="inline-flex items-center gap-2 text-sm text-[#3B82F6]"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Shield className="w-4 h-4" />
                    Coverage Active
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-background dark:bg-surface border border-border dark:border-border rounded-xl p-6 shadow-sm sticky top-8"
            >
              <h3 className="text-lg font-semibold text-muted-foreground dark:text-foreground mb-4">Order Summary</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <h4 className="font-medium text-muted-foreground dark:text-foreground mb-2">{planName}</h4>
                  <ul className="space-y-2">
                    {planFeatures.map((feature, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="flex items-start gap-2 text-sm text-muted-foreground dark:text-muted-foreground"
                      >
                        <Check className="w-4 h-4 text-[#3B82F6] mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="border-t border-border dark:border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground dark:text-muted-foreground">Subtotal</span>
                  <span className="text-muted-foreground dark:text-foreground">${planPrice}.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground dark:text-muted-foreground">Processing Fee</span>
                  <span className="text-muted-foreground dark:text-foreground">$0.00</span>
                </div>
                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-border dark:border-border">
                  <span className="text-muted-foreground dark:text-foreground">Total</span>
                  <span className="text-[#3B82F6]">${planPrice}.00/mo</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-surface dark:bg-surface rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  <span>30-day money-back guarantee</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function InsuranceCheckoutDemo() {
  return <InsuranceCheckout />
}