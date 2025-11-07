'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BatteryCharging,
  MapPin,
  Star,
  Zap,
  Calendar,
  Clock,
  DollarSign,
  ChevronRight,
  Plus,
  Minus,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react'

interface Charger {
  id: string
  name: string
  location: string
  rating: number
  reviews: number
  pricePerHour: number
  availability: {
    day: string
    timeSlots: { start: string; end: string; available: boolean }[]
  }[]
  type: 'Level 2' | 'DC Fast'
  power: number // kW
  imageUrl: string
}

interface BookingDetails {
  chargerId: string
  chargerName: string
  date: string
  startTime: string
  endTime: string
  durationHours: number
  totalCost: number
}

interface ChargerBookingProps {
  charger?: Charger
  onBook?: (details: BookingDetails) => void
  onCancel?: () => void
}

const DEFAULT_CHARGER: Charger = {
  id: 'charger-101',
  name: 'EcoCharge Home Station',
  location: '123 EV Lane, Green City',
  rating: 4.8,
  reviews: 124,
  pricePerHour: 5.50,
  availability: [
    {
      day: 'Monday',
      timeSlots: [
        { start: '08:00', end: '09:00', available: false },
        { start: '09:00', end: '10:00', available: true },
        { start: '10:00', end: '11:00', available: true },
        { start: '11:00', end: '12:00', available: false },
        { start: '12:00', end: '13:00', available: true },
        { start: '13:00', end: '14:00', available: true },
        { start: '14:00', end: '15:00', available: false },
        { start: '15:00', end: '16:00', available: true },
        { start: '16:00', end: '17:00', available: true },
      ],
    },
    {
      day: 'Tuesday',
      timeSlots: [
        { start: '09:00', end: '10:00', available: true },
        { start: '10:00', end: '11:00', available: true },
        { start: '11:00', end: '12:00', available: true },
        { start: '12:00', end: '13:00', available: true },
        { start: '13:00', end: '14:00', available: true },
        { start: '14:00', end: '15:00', available: true },
      ],
    },
    {
      day: 'Wednesday',
      timeSlots: [
        { start: '08:00', end: '09:00', available: true },
        { start: '09:00', end: '10:00', available: true },
        { start: '10:00', end: '11:00', available: true },
        { start: '11:00', end: '12:00', available: true },
        { start: '12:00', end: '13:00', available: true },
        { start: '13:00', end: '14:00', available: true },
        { start: '14:00', end: '15:00', available: true },
        { start: '15:00', end: '16:00', available: true },
        { start: '16:00', end: '17:00', available: true },
      ],
    },
    {
      day: 'Thursday',
      timeSlots: [
        { start: '09:00', end: '10:00', available: true },
        { start: '10:00', end: '11:00', available: true },
        { start: '11:00', end: '12:00', available: true },
        { start: '12:00', end: '13:00', available: true },
        { start: '13:00', end: '14:00', available: true },
        { start: '14:00', end: '15:00', available: true },
      ],
    },
    {
      day: 'Friday',
      timeSlots: [
        { start: '08:00', end: '09:00', available: true },
        { start: '09:00', end: '10:00', available: true },
        { start: '10:00', end: '11:00', available: true },
        { start: '11:00', end: '12:00', available: true },
        { start: '12:00', end: '13:00', available: true },
        { start: '13:00', end: '14:00', available: true },
        { start: '14:00', end: '15:00', available: true },
        { start: '15:00', end: '16:00', available: true },
        { start: '16:00', end: '17:00', available: true },
      ],
    },
    {
      day: 'Saturday',
      timeSlots: [
        { start: '09:00', end: '10:00', available: true },
        { start: '10:00', end: '11:00', available: true },
        { start: '11:00', end: '12:00', available: true },
        { start: '12:00', end: '13:00', available: true },
        { start: '13:00', end: '14:00', available: true },
        { start: '14:00', end: '15:00', available: true },
      ],
    },
    {
      day: 'Sunday',
      timeSlots: [
        { start: '08:00', end: '09:00', available: true },
        { start: '09:00', end: '10:00', available: true },
        { start: '10:00', end: '11:00', available: true },
        { start: '11:00', end: '12:00', available: true },
        { start: '12:00', end: '13:00', available: true },
        { start: '13:00', end: '14:00', available: true },
        { start: '14:00', end: '15:00', available: true },
        { start: '15:00', end: '16:00', available: true },
        { start: '16:00', end: '17:00', available: true },
      ],
    },
  ],
  type: 'Level 2',
  power: 7.2,
  imageUrl: 'https://images.unsplash.com/photo-1621961448100-349633e2182b?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
}

export function ChargerBooking({
  charger = DEFAULT_CHARGER,
  onBook = () => console.log('Booking confirmed'),
  onCancel = () => console.log('Booking cancelled'),
}: ChargerBookingProps = {}) {
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('')
  const [durationHours, setDurationHours] = useState<number>(1)
  const [bookingConfirmed, setBookingConfirmed] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const today = useMemo(() => new Date(), [])
  const formatDate = (date: Date) => date.toISOString().split('T')[0]
  const getDayName = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { weekday: 'long' })
  }

  useEffect(() => {
    // Reset time slot if selected date changes
    setSelectedTimeSlot('')
    setError(null)
  }, [selectedDate])

  const availableDays = useMemo(() => charger.availability.map(a => a.day), [charger.availability])

  const getFutureDatesForDay = (dayName: string, count: number = 7) => {
    const dates: { date: string; day: string }[] = []
    let currentDate = new Date(today)
    for (let i = 0; i < count * 7; i++) {
      if (getDayName(formatDate(currentDate)) === dayName) {
        dates.push({ date: formatDate(currentDate), day: dayName })
        if (dates.length === count) break
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }
    return dates
  }

  const availableDatesOptions = useMemo(() => {
    const uniqueDays = Array.from(new Set(availableDays));
    const allDates = uniqueDays.flatMap(dayName =>
      getFutureDatesForDay(dayName, 2)
    );
    return allDates.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [availableDays, today]);

  const handleDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDate(e.target.value)
  }

  const handleTimeSlotChange = (time: string) => {
    setSelectedTimeSlot(time)
  }

  const handleDurationChange = (change: number) => {
    setDurationHours(prev => Math.max(1, prev + change))
  }

  const calculateTotalCost = () => {
    return (charger.pricePerHour * durationHours).toFixed(2)
  }

  const calculateEndTime = (startTime: string, duration: number) => {
    const [hours, minutes] = startTime.split(':').map(Number)
    const start = new Date()
    start.setHours(hours, minutes, 0, 0)
    start.setHours(start.getHours() + duration)
    return `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`
  }

  const handleBooking = () => {
    if (!selectedDate || !selectedTimeSlot) {
      setError('Please select a date and time slot.')
      return
    }

    setIsLoading(true)
    setError(null)

    const bookingDetails: BookingDetails = {
      chargerId: charger.id,
      chargerName: charger.name,
      date: selectedDate,
      startTime: selectedTimeSlot,
      endTime: calculateEndTime(selectedTimeSlot, durationHours),
      durationHours: durationHours,
      totalCost: parseFloat(calculateTotalCost()),
    }

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setBookingConfirmed(true)
      onBook(bookingDetails)
    }, 1500)
  }

  const currentDayAvailability = useMemo(() => {
    if (!selectedDate) return undefined
    return charger.availability.find(
      (a) => a.day === getDayName(selectedDate)
    )
  }, [selectedDate, charger.availability])

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="min-h-screen bg-background text-[#1F2937] font-sans p-4 sm:p-6 lg:p-8 dark:bg-[#1A202C] dark:text-[#E2E8F0]"
    >
      <div className="max-w-3xl mx-auto">
        <motion.div
          whileHover={{ y: -4, boxShadow: "0 16px 24px -4px rgba(0, 0, 0, 0.1), 0 8px 8px -4px rgba(0, 0, 0, 0.04)" }}
          className="bg-background border border-[#E5E7EB] rounded-xl p-6 shadow-md overflow-hidden transition-all duration-300 dark:bg-[#2D3748] dark:border-[#4A5568]"
        >
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/2">
              <img
                src={charger.imageUrl}
                alt={charger.name}
                className="w-full h-48 object-cover rounded-lg mb-4 shadow-sm"
              />
              <h1 className="text-2xl font-bold text-[#1F2937] mb-2 dark:text-[#E2E8F0]">{charger.name}</h1>
              <div className="flex items-center text-[#6B7280] text-sm mb-2 dark:text-[#A0AEC0]">
                <MapPin size={16} className="mr-1 text-[#3B82F6]" />
                <span>{charger.location}</span>
              </div>
              <div className="flex items-center text-[#6B7280] text-sm mb-4 dark:text-[#A0AEC0]">
                <Star size={16} className="mr-1 text-[#F59E0B] fill-[#F59E0B]" />
                <span>{charger.rating} ({charger.reviews} reviews)</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div className="flex items-center">
                  <Zap size={16} className="mr-2 text-[#3B82F6]" />
                  <span className="font-medium">{charger.type}</span>
                </div>
                <div className="flex items-center">
                  <BatteryCharging size={16} className="mr-2 text-[#3B82F6]" />
                  <span className="font-medium">{charger.power} kW</span>
                </div>
              </div>
              <div className="flex items-center text-lg font-semibold text-[#1F2937] dark:text-[#E2E8F0]">
                <DollarSign size={20} className="mr-1 text-[#3B82F6]" />
                <span>{charger.pricePerHour.toFixed(2)} / hour</span>
              </div>
            </div>

            <div className="md:w-1/2 space-y-6">
              <h2 className="text-xl font-semibold text-[#1F2937] dark:text-[#E2E8F0]">Book Your Charging Slot</h2>

              <AnimatePresence mode="wait">
                {bookingConfirmed ? (
                  <motion.div
                    key="confirmation"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center justify-center p-6 bg-[#F3F4F6] rounded-lg text-center dark:bg-[#4A5568]"
                  >
                    <CheckCircle size={48} className="text-[#3B82F6] mb-4" />
                    <h3 className="text-xl font-semibold text-[#1F2937] mb-2 dark:text-[#E2E8F0]">Booking Confirmed!</h3>
                    <p className="text-[#6B7280] mb-4 dark:text-[#A0AEC0]">
                      Your charging session for {charger.name} has been successfully booked.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setBookingConfirmed(false);
                        setSelectedDate('');
                        setSelectedTimeSlot('');
                        setDurationHours(1);
                      }}
                      className="px-5 py-2.5 bg-[#3B82F6] text-foreground rounded-lg hover:bg-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 transition-all duration-150 font-medium text-sm shadow-sm"
                      aria-label="Book another slot"
                    >
                      Book Another Slot
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="booking-form"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div>
                      <label htmlFor="date-select" className="block text-sm font-medium text-[#1F2937] mb-1 dark:text-[#E2E8F0]">
                        Select Date
                      </label>
                      <div className="relative">
                        <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#A0AEC0]" />
                        <select
                          id="date-select"
                          value={selectedDate}
                          onChange={handleDateChange}
                          className="w-full pl-10 pr-4 py-2.5 bg-background border border-[#E5E7EB] rounded-lg text-[#1F2937] placeholder-[#6B7280] focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]/50 transition-all duration-150 appearance-none dark:bg-[#2D3748] dark:border-[#4A5568] dark:text-[#E2E8F0] dark:placeholder-[#A0AEC0]"
                          aria-label="Select booking date"
                        >
                          <option value="" disabled>Choose a date</option>
                          {availableDatesOptions.map((dateOption) => (
                            <option key={dateOption.date} value={dateOption.date}>
                              {new Date(dateOption.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </option>
                          ))}
                        </select>
                        <ChevronRight size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] rotate-90 pointer-events-none dark:text-[#A0AEC0]" />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="time-select" className="block text-sm font-medium text-[#1F2937] mb-1 dark:text-[#E2E8F0]">
                        Select Time Slot (1-hour increments)
                      </label>
                      <div className="relative">
                        <Clock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#A0AEC0]" />
                        <select
                          id="time-select"
                          value={selectedTimeSlot}
                          onChange={(e) => handleTimeSlotChange(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-background border border-[#E5E7EB] rounded-lg text-[#1F2937] placeholder-[#6B7280] focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]/50 transition-all duration-150 appearance-none disabled:opacity-70 disabled:cursor-not-allowed dark:bg-[#2D3748] dark:border-[#4A5568] dark:text-[#E2E8F0] dark:placeholder-[#A0AEC0]"
                          disabled={!selectedDate}
                          aria-label="Select booking time slot"
                        >
                          <option value="" disabled>Choose a time</option>
                          {currentDayAvailability?.timeSlots.length === 0 && (
                            <option value="" disabled>No slots available for this day</option>
                          )}
                          {currentDayAvailability?.timeSlots.map((slot, index) => (
                            <option
                              key={index}
                              value={slot.start}
                              disabled={!slot.available}
                              className={!slot.available ? 'text-[#9CA3AF] italic dark:text-[#6B7280]' : ''}
                            >
                              {slot.start} - {slot.end} {slot.available ? '' : '(Booked)'}
                            </option>
                          ))}
                        </select>
                        <ChevronRight size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] rotate-90 pointer-events-none dark:text-[#A0AEC0]" />
                      </div>
                      {!selectedDate && (
                        <p className="text-sm text-[#6B7280] mt-1 dark:text-[#A0AEC0]">Please select a date first to see available times.</p>
                      )}
                      {selectedDate && currentDayAvailability?.timeSlots.length === 0 && (
                        <p className="text-sm text-[#EF4444] mt-1 dark:text-[#FCA5A5]">No time slots available for the selected date.</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="duration-input" className="block text-sm font-medium text-[#1F2937] mb-1 dark:text-[#E2E8F0]">
                        Duration (hours)
                      </label>
                      <div className="flex items-center border border-[#E5E7EB] rounded-lg bg-background dark:bg-[#2D3748] dark:border-[#4A5568]">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDurationChange(-1)}
                          disabled={durationHours <= 1}
                          className="p-2 text-[#6B7280] hover:text-[#1F2937] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 rounded-l-lg dark:text-[#A0AEC0] dark:hover:text-[#E2E8F0]"
                          aria-label="Decrease duration"
                        >
                          <Minus size={20} />
                        </motion.button>
                        <input
                          id="duration-input"
                          type="number"
                          value={durationHours}
                          readOnly
                          className="flex-grow text-center py-2.5 bg-transparent text-[#1F2937] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none dark:text-[#E2E8F0]"
                          aria-live="polite"
                          aria-atomic="true"
                        />
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDurationChange(1)}
                          className="p-2 text-[#6B7280] hover:text-[#1F2937] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 rounded-r-lg dark:text-[#A0AEC0] dark:hover:text-[#E2E8F0]"
                          aria-label="Increase duration"
                        >
                          <Plus size={20} />
                        </motion.button>
                      </div>
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-lg bg-[#FEF2F2] dark:bg-[#450A0A]/20 border border-[#FEE2E2] dark:border-[#7F1D1D] p-3 flex items-center text-sm text-[#EF4444] dark:text-[#FCA5A5]"
                      >
                        <XCircle size={16} className="mr-2 flex-shrink-0" />
                        {error}
                      </motion.div>
                    )}

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-lg font-semibold text-[#1F2937] dark:text-[#E2E8F0]">Total:</span>
                      <span className="text-2xl font-bold text-[#3B82F6]">
                        ${calculateTotalCost()}
                      </span>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleBooking}
                      disabled={!selectedDate || !selectedTimeSlot || !!error || isLoading}
                      className="w-full px-5 py-3 bg-[#3B82F6] text-foreground rounded-lg hover:bg-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 transition-all duration-150 font-medium text-base shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      aria-label="Confirm booking"
                    >
                      {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                      {isLoading ? 'Booking...' : 'Confirm Booking'}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default function ChargerBookingDemo() {
  return <ChargerBooking />
}