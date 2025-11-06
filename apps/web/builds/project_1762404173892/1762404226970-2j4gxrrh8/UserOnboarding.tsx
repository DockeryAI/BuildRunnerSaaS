'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Calendar, MapPin, Users, MessageCircle, ChevronRight } from 'lucide-react'

interface OnboardingStep {
  id: number
  title: string
  description: string
  icon: React.ReactNode
}

interface UserOnboardingProps {
  onComplete?: () => void
  initialStep?: number
  isLoading?: boolean
}

const steps: OnboardingStep[] = [
  {
    id: 1,
    title: "Plan Your Adventure",
    description: "Create off-road trips and mark your favorite trail locations",
    icon: <MapPin className="w-6 h-6" />
  },
  {
    id: 2, 
    title: "Coordinate with Friends",
    description: "Assign tasks, plan meals, and manage group responsibilities",
    icon: <Users className="w-6 h-6" />
  },
  {
    id: 3,
    title: "Schedule Events",
    description: "Check shared calendars and send trip invites to your group",
    icon: <Calendar className="w-6 h-6" />
  },
  {
    id: 4,
    title: "Stay Connected",
    description: "Chat with your group and share trip updates in real-time",
    icon: <MessageCircle className="w-6 h-6" />
  }
]

export function UserOnboarding({
  onComplete = () => {},
  initialStep = 1,
  isLoading = false
}: UserOnboardingProps = {}) {
  const [currentStep, setCurrentStep] = useState(initialStep)
  const [error, setError] = useState<string | null>(null)

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

  const handleNext = async () => {
    try {
      if (currentStep < steps.length) {
        setCurrentStep(prev => prev + 1)
      } else {
        await onComplete()
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background dark:bg-surface px-32 py-48">
        <div className="max-w-md mx-auto space-y-32 animate-pulse">
          <div className="h-16 bg-surface dark:bg-surface rounded-lg"></div>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-surface dark:bg-surface rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      className="min-h-screen bg-background dark:bg-surface px-32 py-48"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div 
        className="max-w-md mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {error && (
          <motion.div 
            className="mb-32 p-16 rounded-lg bg-secondary dark:bg-secondary/20 border border-secondary dark:border-secondary"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-sm text-secondary dark:text-secondary">{error}</p>
          </motion.div>
        )}

        <motion.div 
          className="text-center mb-32"
          variants={itemVariants}
        >
          <h1 className="font-inter text-2xl font-bold text-muted-foreground dark:text-foreground mb-8">
            Welcome to TrailMate
          </h1>
          <p className="font-inter text-muted-foreground dark:text-muted-foreground">
            Let's get you set up for your next adventure
          </p>
        </motion.div>

        <motion.div 
          className="space-y-16"
          variants={containerVariants}
        >
          {steps.map(step => (
            <motion.div
              key={step.id}
              variants={itemVariants}
              className={`p-24 rounded-xl border transition-all duration-300
                ${currentStep === step.id 
                  ? 'bg-primary dark:bg-primary/20 border-primary dark:border-primary' 
                  : 'bg-background dark:bg-surface border-border dark:border-border hover:border-primary dark:hover:border-primary'
                }`}
              whileHover={{ y: -4, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
            >
              <div className="flex items-start gap-16">
                <div className={`p-8 rounded-lg ${
                  currentStep === step.id 
                    ? 'bg-primary text-foreground' 
                    : 'bg-surface dark:bg-surface text-muted-foreground dark:text-muted-foreground'
                }`}>
                  {step.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-inter font-medium text-muted-foreground dark:text-foreground mb-4">{step.title}</h3>
                  <p className="font-inter text-sm text-muted-foreground dark:text-muted-foreground">{step.description}</p>
                </div>
                {currentStep === step.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-8 h-8 rounded-full bg-primary"
                  />
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mt-32"
          variants={itemVariants}
        >
          <button
            onClick={handleNext}
            className="w-full p-16 bg-primary text-foreground rounded-lg font-medium 
              hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary/50 
              active:bg-primary disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            aria-label={currentStep < steps.length ? 'Continue to next step' : 'Complete onboarding'}
          >
            {currentStep < steps.length ? 'Continue' : 'Get Started'}
            <ChevronRight className="inline-block w-16 h-16 ml-8" />
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export default function UserOnboardingDemo() {
  return <UserOnboarding />
}