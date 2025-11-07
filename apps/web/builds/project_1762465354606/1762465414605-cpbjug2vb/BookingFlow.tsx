'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CalendarDays,
  Clock,
  MapPin,
  BatteryCharging,
  DollarSign,
  CheckCircle,
  XCircle,
  ArrowLeft,
  ArrowRight,
  Info,
  Zap,
  Star,
  Loader2,
} from 'lucide-react'

// Mock data models
interface Station {
  id: string
  name: string
  address: string
  connectorType: 'Type 1' | 'Type 2' | 'CCS' | 'CHAdeMO'
  powerKw: number
  pricePerKwh: number
  availability: {
    date: string
    slots: {
      time: string
      available: boolean
    }[]
  }[]
  rating: number
  reviews: number
  hostName: string
  hostImage: string
}

interface BookingDetails {
  stationId: string
  stationName: string
  stationAddress: string
  date: string
  time: string
  durationHours: number
  connectorType: 'Type 1' | 'Type 2' | 'CCS' | 'CHAdeMO'
  powerKw: number
  totalPrice: number
}

interface BookingFlowProps {
  initialStation?: Station
  onBookingComplete?: (booking: BookingDetails) => void
  onBookingCancel?: () => void
}

const DEFAULT_STATION: Station = {
  id: 'stn-001',
  name: 'Urban Oasis Charger',
  address: '123 EV Street, Metropolis, CA 90210',
  connectorType: 'Type 2',
  powerKw: 11,
  pricePerKwh: 0.25,
  availability: [
    {
      date: '2024-07-20',
      slots: [
        { time: '09:00', available: true },
        { time: '10:00', available: true },
        { time: '11:00', available: false },
        { time: '12:00', available: true },
        { time: '13:00', available: true },
        { time: '14:00', available: false },
        { time: '15:00', available: true },
        { time: '16:00', available: true },
      ],
    },
    {
      date: '2024-07-21',
      slots: [
        { time: '09:00', available: true },
        { time: '10:00', available: true },
        { time: '11:00', available: true },
        { time: '12:00', available: true },
        { time: '13:00', available: true },
        { time: '14:00', available: true },
        { time: '15:00', available: true },
        { time: '16:00', available: true },
      ],
    },
    {
      date: '2024-07-22',
      slots: [
        { time: '09:00', available: false },
        { time: '10:00', available: true },
        { time: '11:00', available: true },
        { time: '12:00', available: true },
        { time: '13:00', available: false },
        { time: '14:00', available: true },
        { time: '15:00', available: true },
        { time: '16:00', available: true },
      ],
    },
  ],
  rating: 4.8,
  reviews: 124,
  hostName: 'Alex Johnson',
  hostImage: 'https://api.dicebear.com/7.x/initials/svg?seed=Alex+Johnson',
}

const DURATION_OPTIONS = [1, 2, 3, 4, 5, 6] // in hours

export function BookingFlow({
  initialStation = DEFAULT_STATION,
  onBookingComplete = () => console.log('Booking completed'),
  onBookingCancel = () => console.log('Booking cancelled'),
}: BookingFlowProps = {}) {
  const [station, setStation] = useState<Station>(initialStation)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedDuration, setSelectedDuration] = useState<number>(1)
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const availableDates = station.availability.map((a) => a.date)
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    if (!selectedDate && availableDates.length > 0) {
      setSelectedDate(availableDates[0])
    }
  }, [selectedDate, availableDates])

  const calculateTotalPrice = useCallback(() => {
    if (!selectedDuration || !station.pricePerKwh || !station.powerKw) return 0
    return selectedDuration * station.powerKw * station.pricePerKwh
  }, [selectedDuration, station.pricePerKwh, station.powerKw])

  const handleNextStep = () => {
    setError(null)
    if (currentStep === 1 && (!selectedDate || !selectedTime)) {
      setError('Please select a date and time.')
      return
    }
    if (currentStep === 2 && !selectedDuration) {
      setError('Please select a charging duration.')
      return
    }
    setCurrentStep((prev) => prev + 1)
  }

  const handlePreviousStep = () => {
    setError(null)
    setCurrentStep((prev) => prev - 1)
  }

  const handleConfirmBooking = async () => {
    if (!selectedDate || !selectedTime || !selectedDuration) {
      setError('Missing booking details. Please go back and select all options.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const booking: BookingDetails = {
        stationId: station.id,
        stationName: station.name,
        stationAddress: station.address,
        date: selectedDate,
        time: selectedTime,
        durationHours: selectedDuration,
        connectorType: station.connectorType,
        powerKw: station.powerKw,
        totalPrice: calculateTotalPrice(),
      }
      onBookingComplete(booking)
      setCurrentStep(4) // Booking confirmed step
    } catch (err) {
      setError('Failed to confirm booking. Please try again.')
      console.error('Booking error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3 }}
            className="space-y-24"
          >
            <h2 className="text-xl font-semibold text-foreground">
              1. Select Date & Time
            </h2>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-8 rounded-lg bg-destructive dark:bg-destructive/20 border border-destructive dark:border-destructive p-16 text-sm text-destructive dark:text-destructive"
                role="alert"
              >
                <XCircle className="h-16 w-16 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
            <div className="space-y-16">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-foreground">
                  Available Dates
                </h3>
              </div>
              <div className="flex gap-16 overflow-x-auto pb-8">
                {availableDates.length === 0 ? (
                  <div className="text-center py-48 w-full">
                    <div className="w-40 h-40 bg-surface dark:bg-surface rounded-full mx-auto mb-16 flex items-center justify-center">
                      <CalendarDays className="w-32 h-32 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-muted-foreground dark:text-foreground mb-8">No available dates</h3>
                    <p className="text-muted-foreground dark:text-muted-foreground text-sm">Please check back later or select another station.</p>
                  </div>
                ) : (
                  availableDates.map((date) => (
                    <motion.button
                      key={date}
                      onClick={() => {
                        setSelectedDate(date)
                        setSelectedTime(null) // Reset time when date changes
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex-shrink-0 rounded-lg px-16 py-8 text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:ring-offset-2 dark:focus:ring-offset-background ${
                        selectedDate === date
                          ? 'bg-[#3B82F6] text-foreground shadow-md'
                          : 'bg-surface dark:bg-surface text-muted-foreground dark:text-muted-foreground hover:bg-surface dark:hover:bg-surface'
                      }`}
                      aria-label={`Select date ${new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                    >
                      {new Date(date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                      {date === today && ' (Today)'}
                    </motion.button>
                  ))
                )}
              </div>
            </div>

            {selectedDate && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-16"
              >
                <h3 className="text-lg font-medium text-foreground">
                  Available Times for{' '}
                  {new Date(selectedDate).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </h3>
                <div className="grid grid-cols-3 gap-16 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                  {station.availability
                    .find((a) => a.date === selectedDate)
                    ?.slots.map((slot) => (
                      <motion.button
                        key={slot.time}
                        onClick={() => slot.available && setSelectedTime(slot.time)}
                        whileHover={slot.available ? { scale: 1.02 } : {}}
                        whileTap={slot.available ? { scale: 0.98 } : {}}
                        disabled={!slot.available}
                        className={`rounded-lg px-12 py-8 text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:ring-offset-2 dark:focus:ring-offset-background ${
                          slot.available
                            ? selectedTime === slot.time
                              ? 'bg-[#3B82F6] text-foreground shadow-md'
                              : 'bg-surface dark:bg-surface text-muted-foreground dark:text-muted-foreground hover:bg-surface dark:hover:bg-surface'
                            : 'cursor-not-allowed bg-surface/50 dark:bg-surface/50 text-muted-foreground dark:text-muted-foreground opacity-60'
                        }`}
                        aria-label={slot.available ? `Select time ${slot.time}` : `Time ${slot.time} - Not available`}
                      >
                        {slot.time}
                      </motion.button>
                    ))}
                </div>
                {station.availability.find((a) => a.date === selectedDate)?.slots.length === 0 && (
                  <div className="text-center py-48 w-full">
                    <div className="w-40 h-40 bg-surface dark:bg-surface rounded-full mx-auto mb-16 flex items-center justify-center">
                      <Clock className="w-32 h-32 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-muted-foreground dark:text-foreground mb-8">No available slots for this date</h3>
                    <p className="text-muted-foreground dark:text-muted-foreground text-sm">Please choose another date.</p>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        )
      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3 }}
            className="space-y-24"
          >
            <h2 className="text-xl font-semibold text-foreground">
              2. Select Duration
            </h2>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-8 rounded-lg bg-destructive dark:bg-destructive/20 border border-destructive dark:border-destructive p-16 text-sm text-destructive dark:text-destructive"
                role="alert"
              >
                <XCircle className="h-16 w-16 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
            <div className="space-y-16">
              <h3 className="text-lg font-medium text-foreground">
                How long do you need to charge?
              </h3>
              <div className="grid grid-cols-3 gap-16 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                {DURATION_OPTIONS.map((duration) => (
                  <motion.button
                    key={duration}
                    onClick={() => setSelectedDuration(duration)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`rounded-lg px-12 py-8 text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:ring-offset-2 dark:focus:ring-offset-background ${
                      selectedDuration === duration
                        ? 'bg-[#3B82F6] text-foreground shadow-md'
                        : 'bg-surface dark:bg-surface text-muted-foreground dark:text-muted-foreground hover:bg-surface dark:hover:bg-surface'
                    }`}
                    aria-label={`Select duration ${duration} hours`}
                  >
                    {duration} hour{duration > 1 ? 's' : ''}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )
      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.3 }}
            className="space-y-24"
          >
            <h2 className="text-xl font-semibold text-foreground">
              3. Confirm Booking
            </h2>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-8 rounded-lg bg-destructive dark:bg-destructive/20 border border-destructive dark:border-destructive p-16 text-sm text-destructive dark:text-destructive"
                role="alert"
              >
                <XCircle className="h-16 w-16 flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
            <div className="rounded-xl border border-[#E5E7EB] dark:border-border bg-background dark:bg-surface p-24 shadow-sm">
              <h3 className="mb-16 text-lg font-medium text-foreground">
                Booking Summary
              </h3>
              <div className="space-y-12 text-sm text-muted-foreground dark:text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-8">
                    <MapPin className="h-16 w-16 text-[#3B82F6]" /> Station
                  </span>
                  <span className="font-medium text-foreground">
                    {station.name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-8">
                    <CalendarDays className="h-16 w-16 text-[#3B82F6]" /> Date
                  </span>
                  <span className="font-medium text-foreground">
                    {selectedDate
                      ? new Date(selectedDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-8">
                    <Clock className="h-16 w-16 text-[#3B82F6]" /> Time
                  </span>
                  <span className="font-medium text-foreground">
                    {selectedTime || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-8">
                    <BatteryCharging className="h-16 w-16 text-[#3B82F6]" /> Duration
                  </span>
                  <span className="font-medium text-foreground">
                    {selectedDuration} hour{selectedDuration > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-8">
                    <Zap className="h-16 w-16 text-[#3B82F6]" /> Power
                  </span>
                  <span className="font-medium text-foreground">
                    {station.powerKw} kW
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-8">
                    <DollarSign className="h-16 w-16 text-[#3B82F6]" /> Price per kWh
                  </span>
                  <span className="font-medium text-foreground">
                    ${station.pricePerKwh.toFixed(2)}
                  </span>
                </div>
                <div className="pt-12">
                  <div className="flex items-center justify-between border-t border-[#E5E7EB] dark:border-border pt-12 text-base font-semibold text-foreground">
                    <span>Total Estimated Price</span>
                    <span>${calculateTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-[#E5E7EB] dark:border-border bg-background dark:bg-surface p-16 text-sm text-muted-foreground dark:text-muted-foreground shadow-sm">
              <div className="flex items-start gap-12">
                <Info className="h-20 w-20 flex-shrink-0 text-[#3B82F6]" />
                <p>
                  This is an estimated price. Final cost may vary based on actual
                  charging duration and energy consumed.
                </p>
              </div>
            </div>
          </motion.div>
        )
      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center space-y-24 text-center"
          >
            <CheckCircle className="h-64 w-64 text-[#3B82F6]" />
            <h2 className="text-2xl font-bold text-foreground">
              Booking Confirmed!
            </h2>
            <p className="text-muted-foreground dark:text-muted-foreground">
              Your charging session at{' '}
              <span className="font-medium text-foreground">{station.name}</span>{' '}
              on{' '}
              <span className="font-medium text-foreground">
                {selectedDate
                  ? new Date(selectedDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                    })
                  : ''}{' '}
                at {selectedTime}
              </span>{' '}
              has been successfully booked.
            </p>
            <p className="text-lg font-semibold text-foreground">
              Total Estimated Price: ${calculateTotalPrice().toFixed(2)}
            </p>
            <motion.button
              onClick={() => window.location.reload()} // Or navigate to a dashboard
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-16 rounded-lg bg-[#3B82F6] px-24 py-12 text-base font-medium text-foreground shadow-md transition-all duration-150 hover:bg-[#3B82F6]/90 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:ring-offset-2 dark:focus:ring-offset-background"
              aria-label="View My Bookings"
            >
              View My Bookings
            </motion.button>
          </motion.div>
        )
      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="min-h-screen bg-background dark:bg-surface p-16 sm:p-24 md:p-32 font-inter"
    >
      <div className="mx-auto max-w-2xl rounded-xl border border-[#E5E7EB] dark:border-border bg-background dark:bg-surface p-24 shadow-lg sm:p-32">
        <div className="mb-24 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Book Charging</h1>
          <motion.button
            onClick={onBookingCancel}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-muted-foreground dark:text-muted-foreground hover:text-foreground transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:ring-offset-2 dark:focus:ring-offset-background"
            aria-label="Cancel booking"
          >
            <XCircle className="h-24 w-24" />
          </motion.button>
        </div>

        {/* Station Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="mb-24 rounded-xl border border-[#E5E7EB] dark:border-border bg-surface dark:bg-surface/20 p-16 shadow-sm hover:-translate-y-8 hover:shadow-xl transition-all duration-300"
        >
          <div className="flex items-center gap-16">
            <div className="h-48 w-48 flex-shrink-0 overflow-hidden rounded-full bg-[#3B82F6]/20">
              <img
                src={station.hostImage}
                alt={`${station.hostName}'s profile picture`}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-grow">
              <h3 className="text-lg font-semibold text-foreground">
                {station.name}
              </h3>
              <p className="flex items-center gap-4 text-sm text-muted-foreground dark:text-muted-foreground">
                <MapPin className="h-12 w-12" /> {station.address}
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground dark:text-muted-foreground">
              <Star className="h-16 w-16 text-[#3B82F6]" /> {station.rating} (
              {station.reviews})
            </div>
          </div>
          <div className="mt-12 flex flex-wrap items-center gap-x-16 gap-y-8 text-sm text-muted-foreground dark:text-muted-foreground">
            <span className="flex items-center gap-4">
              <BatteryCharging className="h-16 w-16 text-[#3B82F6]" />{' '}
              {station.connectorType}
            </span>
            <span className="flex items-center gap-4">
              <Zap className="h-16 w-16 text-[#3B82F6]" /> {station.powerKw} kW
            </span>
            <span className="flex items-center gap-4">
              <DollarSign className="h-16 w-16 text-[#3B82F6]" />{' '}
              {station.pricePerKwh.toFixed(2)}/kWh
            </span>
          </div>
        </motion.div>

        <div className="mb-24 h-2 w-full rounded-full bg-surface dark:bg-surface">
          <motion.div
            className="h-full rounded-full bg-[#3B82F6]"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / 4) * 100}%` }}
            transition={{ duration: 0.5 }}
            role="progressbar"
            aria-valuenow={(currentStep / 4) * 100}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Booking progress: Step ${currentStep} of 4`}
          />
        </div>

        <AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>

        <div className="mt-32 flex justify-between gap-16">
          {currentStep > 1 && currentStep < 4 && (
            <motion.button
              onClick={handlePreviousStep}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-8 rounded-lg border border-[#E5E7EB] dark:border-border bg-surface dark:bg-surface px-20 py-10 text-sm font-medium text-foreground shadow-sm transition-all duration-150 hover:bg-surface dark:hover:bg-surface focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:ring-offset-2 dark:focus:ring-offset-background"
              aria-label="Go to previous step"
            >
              <ArrowLeft className="h-16 w-16" /> Back
            </motion.button>
          )}

          {currentStep < 3 && (
            <motion.button
              onClick={handleNextStep}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="ml-auto flex items-center gap-8 rounded-lg bg-[#3B82F6] px-20 py-10 text-sm font-medium text-foreground shadow-md transition-all duration-150 hover:bg-[#3B82F6]/90 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:ring-offset-2 dark:focus:ring-offset-background"
              aria-label="Go to next step"
            >
              Next <ArrowRight className="h-16 w-16" />
            </motion.button>
          )}

          {currentStep === 3 && (
            <motion.button
              onClick={handleConfirmBooking}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              className="ml-auto flex items-center gap-8 rounded-lg bg-[#3B82F6] px-20 py-10 text-sm font-medium text-foreground shadow-md transition-all duration-150 hover:bg-[#3B82F6]/90 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:ring-offset-2 dark:focus:ring-offset-background"
              aria-label={isLoading ? "Confirming booking..." : "Confirm booking"}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-16 w-16 animate-spin" />
                  Confirming...
                </>
              ) : (
                <>
                  Confirm Booking <CheckCircle className="h-16 w-16" />
                </>
              )}
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function BookingFlowDemo() {
  const handleBookingComplete = (booking: BookingDetails) => {
    console.log('Demo: Booking completed!', booking)
    alert(
      `Booking Confirmed!\nStation: ${booking.stationName}\nDate: ${booking.date}\nTime: ${booking.time}\nTotal: $${booking.totalPrice.toFixed(2)}`,
    )
  }

  const handleBookingCancel = () => {
    console.log('Demo: Booking cancelled!')
    alert('Booking process cancelled.')
  }

  return (
    <div className="min-h-screen bg-background dark:bg-surface p-16">
      <BookingFlow
        onBookingComplete={handleBookingComplete}
        onBookingCancel={handleBookingCancel}
      />
    </div>
  )
}