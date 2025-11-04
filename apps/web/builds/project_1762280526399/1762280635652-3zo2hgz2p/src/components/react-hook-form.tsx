'use client'

import { useState } from 'react'
import { Send, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

interface FormField {
  id: string
  label: string
  type: 'text' | 'email' | 'textarea' | 'select' | 'date' | 'number'
  placeholder?: string
  required?: boolean
  options?: { value: string; label: string }[]
  validation?: {
    pattern?: RegExp
    message?: string
    min?: number
    max?: number
  }
}

interface FormData {
  [key: string]: string | number
}

interface FormErrors {
  [key: string]: string
}

interface ReactHookFormProps {
  fields?: FormField[]
  title?: string
  description?: string
  submitLabel?: string
  onSubmit?: (data: FormData) => Promise<void> | void
  className?: string
}

export function ReactHookForm({
  fields = DEFAULT_FIELDS,
  title = 'Trip Planning Form',
  description = 'Fill out the details for your off-roading adventure',
  submitLabel = 'Submit',
  onSubmit = handleDefaultSubmit,
  className = ''
}: ReactHookFormProps = {}) {
  const [formData, setFormData] = useState<FormData>({})
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const validateField = (field: FormField, value: string | number): string => {
    if (field.required && (!value || value.toString().trim() === '')) {
      return `${field.label} is required`
    }

    if (field.validation) {
      const { pattern, message, min, max } = field.validation

      if (pattern && typeof value === 'string' && !pattern.test(value)) {
        return message || `${field.label} format is invalid`
      }

      if (typeof value === 'number') {
        if (min !== undefined && value < min) {
          return `${field.label} must be at least ${min}`
        }
        if (max !== undefined && value > max) {
          return `${field.label} must be no more than ${max}`
        }
      }

      if (typeof value === 'string') {
        if (min !== undefined && value.length < min) {
          return `${field.label} must be at least ${min} characters`
        }
        if (max !== undefined && value.length > max) {
          return `${field.label} must be no more than ${max} characters`
        }
      }
    }

    return ''
  }

  const handleInputChange = (fieldId: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }))
    
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: '' }))
    }
    
    // Reset submit status
    if (submitStatus !== 'idle') {
      setSubmitStatus('idle')
    }
  }

  const handleBlur = (field: FormField) => {
    const value = formData[field.id] || ''
    const error = validateField(field, value)
    
    if (error) {
      setErrors(prev => ({ ...prev, [field.id]: error }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    
    fields.forEach(field => {
      const value = formData[field.id] || ''
      const error = validateField(field, value)
      if (error) {
        newErrors[field.id] = error
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      await onSubmit(formData)
      setSubmitStatus('success')
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({})
        setSubmitStatus('idle')
      }, 2000)
    } catch (error) {
      setSubmitStatus('error')
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderField = (field: FormField) => {
    const value = formData[field.id] || ''
    const error = errors[field.id]
    const hasError = !!error

    const baseInputClasses = `
      w-full px-3 py-3 text-base font-medium
      border-2 rounded-lg
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-2
      ${hasError 
        ? 'border-[rgb(239,68,68)] focus:border-[rgb(239,68,68)] focus:ring-[rgb(239,68,68)]' 
        : 'border-[rgb(226,232,240)] focus:border-[rgb(34,139,34)] focus:ring-[rgb(34,139,34)]'
      }
      bg-[rgb(255,255,255)] text-[rgb(15,23,42)]
      placeholder:text-[rgb(148,163,184)]
    `

    return (
      <div key={field.id} className="space-y-2">
        <label 
          htmlFor={field.id}
          className="block text-sm font-semibold text-[rgb(15,23,42)]"
        >
          {field.label}
          {field.required && (
            <span className="text-[rgb(239,68,68)] ml-1" aria-label="required">*</span>
          )}
        </label>

        {field.type === 'textarea' ? (
          <textarea
            id={field.id}
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            onBlur={() => handleBlur(field)}
            placeholder={field.placeholder}
            rows={4}
            className={`${baseInputClasses} resize-vertical min-h-[100px]`}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${field.id}-error` : undefined}
          />
        ) : field.type === 'select' ? (
          <select
            id={field.id}
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            onBlur={() => handleBlur(field)}
            className={baseInputClasses}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${field.id}-error` : undefined}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={field.id}
            type={field.type}
            value={value}
            onChange={(e) => {
              const newValue = field.type === 'number' ? Number(e.target.value) : e.target.value
              handleInputChange(field.id, newValue)
            }}
            onBlur={() => handleBlur(field)}
            placeholder={field.placeholder}
            className={baseInputClasses}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${field.id}-error` : undefined}
            min={field.type === 'number' ? field.validation?.min : undefined}
            max={field.type === 'number' ? field.validation?.max : undefined}
          />
        )}

        {hasError && (
          <div 
            id={`${field.id}-error`}
            className="flex items-center gap-2 text-sm text-[rgb(239,68,68)]"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`max-w-2xl mx-auto p-4 ${className}`}>
      <div className="bg-[rgb(255,255,255)] rounded-xl shadow-lg border border-[rgb(226,232,240)] overflow-hidden">
        {/* Header */}
        <div className="bg-[rgb(248,250,252)] px-6 py-4 border-b border-[rgb(226,232,240)]">
          <h2 className="text-xl font-bold text-[rgb(15,23,42)] mb-1">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-[rgb(100,116,139)]">
              {description}
            </p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {fields.map(renderField)}

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`
                w-full flex items-center justify-center gap-2
                px-6 py-3 text-base font-semibold rounded-lg
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(34,139,34)]
                ${isSubmitting
                  ? 'bg-[rgb(148,163,184)] text-[rgb(255,255,255)] cursor-not-allowed'
                  : submitStatus === 'success'
                  ? 'bg-[rgb(34,139,34)] text-[rgb(255,255,255)]'
                  : submitStatus === 'error'
                  ? 'bg-[rgb(239,68,68)] text-[rgb(255,255,255)]'
                  : 'bg-[rgb(34,139,34)] text-[rgb(255,255,255)] hover:bg-[rgb(22,101,22)] active:bg-[rgb(20,83,20)]'
                }
              `}
              style={{ minHeight: '48px' }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : submitStatus === 'success' ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Success!</span>
                </>
              ) : submitStatus === 'error' ? (
                <>
                  <AlertCircle className="w-5 h-5" />
                  <span>Try Again</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>{submitLabel}</span>
                </>
              )}
            </button>
          </div>

          {/* Status Messages */}
          {submitStatus === 'success' && (
            <div className="flex items-center gap-2 p-3 bg-[rgb(240,253,244)] border border-[rgb(34,139,34)] rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-[rgb(34,139,34)]" />
              <span className="text-sm font-medium text-[rgb(34,139,34)]">
                Form submitted successfully!
              </span>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="flex items-center gap-2 p-3 bg-[rgb(254,242,242)] border border-[rgb(239,68,68)] rounded-lg">
              <AlertCircle className="w-5 h-5 text-[rgb(239,68,68)]" />
              <span className="text-sm font-medium text-[rgb(239,68,68)]">
                Something went wrong. Please try again.
              </span>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

// Default form fields for trip planning
const DEFAULT_FIELDS: FormField[] = [
  {
    id: 'tripName',
    label: 'Trip Name',
    type: 'text',
    placeholder: 'Enter trip name',
    required: true,
    validation: {
      min: 3,
      max: 50
    }
  },
  {
    id: 'location',
    label: 'Location',
    type: 'text',
    placeholder: 'Enter destination',
    required: true,
    validation: {
      min: 3,
      max: 100
    }
  },
  {
    id: 'startDate',
    label: 'Start Date',
    type: 'date',
    required: true
  },
  {
    id: 'endDate',
    label: 'End Date',
    type: 'date',
    required: true
  },
  {
    id: 'groupSize',
    label: 'Group Size',
    type: 'number',
    placeholder: 'Number of participants',
    required: true,
    validation: {
      min: 1,
      max: 20
    }
  },
  {
    id: 'difficulty',
    label: 'Difficulty Level',
    type: 'select',
    required: true,
    options: [
      { value: 'easy', label: 'Easy - Beginner friendly' },
      { value: 'moderate', label: 'Moderate - Some experience required' },
      { value: 'hard', label: 'Hard - Advanced skills needed' },
      { value: 'extreme', label: 'Extreme - Expert level only' }
    ]
  },
  {
    id: 'email',
    label: 'Contact Email',
    type: 'email',
    placeholder: 'your@email.com',
    required: true,
    validation: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address'
    }
  },
  {
    id: 'description',
    label: 'Trip Description',
    type: 'textarea',
    placeholder: 'Describe your off-roading adventure...',
    validation: {
      max: 500
    }
  }
]

// Default submit handler
async function handleDefaultSubmit(data: FormData): Promise<void> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  console.log('Form submitted with data:', data)
  
  // Simulate random success/failure for demo
  if (Math.random() > 0.8) {
    throw new Error('Simulated submission error')
  }
}

// Demo component for page.tsx
export default function ReactHookFormDemo() {
  const handleCustomSubmit = async (data: FormData) => {
    console.log('Custom submit handler:', data)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // You would typically send this to your API
    // const response = await fetch('/api/trips', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data)
    // })
  }

  return (
    <div className="min-h-screen bg-[rgb(248,250,252)] py-8">
      <ReactHookForm
        title="Plan Your Off-Road Adventure"
        description="Create an amazing outdoor experience for your group"
        onSubmit={handleCustomSubmit}
      />
    </div>
  )
}