'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Star,
  MapPin,
  Plug,
  BatteryCharging,
  DollarSign,
  Calendar,
  Clock,
  Wifi,
  Coffee,
  Car,
  Info,
  ChevronLeft,
  Heart,
  Share2,
  CheckCircle,
  XCircle,
  Loader2,
  CalendarDays,
  Hourglass,
  Zap,
  Bath, // Specific restroom icon
  Chair, // Specific seating icon
  PawPrint, // Specific pet icon
  WifiIcon, // Renamed to avoid conflict
} from 'lucide-react'

interface Amenity {
  icon: React.ElementType
  name: string
}

interface AvailabilitySlot {
  id: string
  startTime: string
  endTime: string
  isAvailable: boolean
}

interface StationDetailsData {
  id: string
  name: string
  address: string
  rating: number
  reviewsCount: number
  chargerType: string
  powerOutputKw: number
  pricePerKwh: number
  imageUrl: string
  description: string
  amenities: string[]
  hostName: string
  hostJoinedDate: string
  availability: {
    [date: string]: AvailabilitySlot[]
  }
}

interface StationDetailsProps {
  stationId?: string
  initialData?: StationDetailsData
  onBack?: () => void
  onBookNow?: (stationId: string, selectedSlotId: string) => void
  onFavoriteToggle?: (stationId: string, isFavorite: boolean) => void
  isFavorite?: boolean
}

const DEFAULT_STATION_DATA: StationDetailsData = {
  id: 'stn_001',
  name: 'Urban Oasis Charger',
  address: '123 EV Street, Metropolis, CA 90210',
  rating: 4.8,
  reviewsCount: 124,
  chargerType: 'Type 2 (AC)',
  powerOutputKw: 7.2,
  pricePerKwh: 0.35,
  imageUrl: 'https://images.unsplash.com/photo-1621985160803-01314644e5f2?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  description:
    'Conveniently located in the heart of the city, this private Level 2 charger offers a reliable and efficient charging experience. Enjoy a peaceful wait with complimentary Wi-Fi and a cozy seating area. Perfect for a quick top-up or an overnight charge. Available during off-peak hours to help you save!',
  amenities: ['Wifi', 'Coffee', 'Restroom', 'Seating Area', 'Pet Friendly'],
  hostName: 'Alex P.',
  hostJoinedDate: 'Joined May 2022',
  availability: {
    '2024-08-01': [
      { id: 'slot_001', startTime: '18:00', endTime: '20:00', isAvailable: true },
      { id: 'slot_002', startTime: '20:00', endTime: '22:00', isAvailable: true },
      { id: 'slot_003', startTime: '22:00', endTime: '00:00', isAvailable: false },
    ],
    '2024-08-02': [
      { id: 'slot_004', startTime: '19:00', endTime: '21:00', isAvailable: true },
      { id: 'slot_005', startTime: '21:00', endTime: '23:00', isAvailable: true },
    ],
    '2024-08-03': [
      { id: 'slot_006', startTime: '17:00', endTime: '19:00', isAvailable: true },
      { id: 'slot_007', startTime: '19:00', endTime: '21:00', isAvailable: false },
      { id: 'slot_008', startTime: '21:00', endTime: '23:00', isAvailable: true },
    ],
  },
}

const AMENITY_ICONS: { [key: string]: React.ElementType } = {
  Wifi: WifiIcon,
  Coffee: Coffee,
  Restroom: Bath,
  'Seating Area': Chair,
  'Pet Friendly': PawPrint,
}

export function StationDetails({
  stationId = DEFAULT_STATION_DATA.id,
  initialData = DEFAULT_STATION_DATA,
  onBack = () => console.log('Back clicked'),
  onBookNow = (id, slot) => console.log(`Booking station ${id}, slot ${slot}`),
  onFavoriteToggle = (id, isFav) => console.log(`Toggling favorite for ${id}: ${isFav}`),
  isFavorite = false,
}: StationDetailsProps = {}) {
  const [station, setStation] = useState<StationDetailsData | null>(initialData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [isStationFavorite, setIsStationFavorite] = useState(isFavorite)

  useEffect(() => {
    // Simulate fetching data based on stationId if not provided or different
    if (!initialData || initialData.id !== stationId) {
      setLoading(true)
      setError(null)
      setTimeout(() => {
        if (stationId === DEFAULT_STATION_DATA.id) {
          setStation(DEFAULT_STATION_DATA)
        } else {
          setError('Station not found.')
          setStation(null)
        }
        setLoading(false)
      }, 800)
    } else {
      setStation(initialData)
    }
  }, [stationId, initialData])

  useEffect(() => {
    setIsStationFavorite(isFavorite)
  }, [isFavorite])

  const handleDateSelect = useCallback((date: string) => {
    setSelectedDate(date)
    setSelectedSlotId(null) // Reset selected slot when date changes
  }, [])

  const handleSlotSelect = useCallback((slotId: string) => {
    setSelectedSlotId(slotId)
  }, [])

  const handleBookClick = useCallback(() => {
    if (station && selectedSlotId) {
      onBookNow(station.id, selectedSlotId)
    }
  }, [station, selectedSlotId, onBookNow])

  const handleFavoriteClick = useCallback(() => {
    if (station) {
      const newFavoriteStatus = !isStationFavorite
      setIsStationFavorite(newFavoriteStatus)
      onFavoriteToggle(station.id, newFavoriteStatus)
    }
  }, [station, isStationFavorite, onFavoriteToggle])

  const availableDates = useMemo(() => {
    if (!station?.availability) return []
    return Object.keys(station.availability).sort()
  }, [station?.availability])

  const currentDaySlots = useMemo(() => {
    if (!station?.availability || !selectedDate) return []
    return station.availability[selectedDate] || []
  }, [station?.availability, selectedDate])

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-muted-foreground dark:text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6]" />
          <p className="mt-4 text-lg">Loading station details...</p>
          <div className="space-y-4 animate-pulse mt-8 w-full max-w-md">
            <div className="h-64 bg-surface dark:bg-surface rounded-xl"></div>
            <div className="h-24 bg-surface dark:bg-surface rounded-xl"></div>
            <div className="h-16 bg-surface dark:bg-surface rounded-xl"></div>
            <div className="h-32 bg-surface dark:bg-surface rounded-xl"></div>
          </div>
        </div>
      )
    }

    if (error || !station) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-destructive dark:text-destructive">
          <XCircle className="h-8 w-8" />
          <p className="mt-4 text-lg">{error || 'Failed to load station details.'}</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onBack}
            className="mt-6 px-6 py-3 bg-[#3B82F6] text-foreground rounded-lg font-medium text-base shadow-md hover:bg-[#3B82F6]/90 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            aria-label="Go Back"
          >
            Go Back
          </motion.button>
        </div>
      )
    }

    return (
      <div className="flex flex-col gap-6">
        {/* Image Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="relative h-64 md:h-96 w-full overflow-hidden rounded-xl shadow-lg"
        >
          <img
            src={station.imageUrl}
            alt={station.name}
            className="object-cover w-full h-full"
          />
          <div className="absolute top-4 left-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="p-2 bg-background/80 dark:bg-surface/80 backdrop-blur-sm rounded-full shadow-md text-muted-foreground dark:text-foreground hover:bg-surface dark:hover:bg-surface transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              aria-label="Go back"
            >
              <ChevronLeft className="h-6 w-6" />
            </motion.button>
          </div>
          <div className="absolute top-4 right-4 flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleFavoriteClick}
              className={`p-2 bg-background/80 dark:bg-surface/80 backdrop-blur-sm rounded-full shadow-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
                isStationFavorite ? 'text-destructive hover:bg-destructive dark:hover:bg-destructive/20' : 'text-muted-foreground dark:text-foreground hover:bg-surface dark:hover:bg-surface'
              }`}
              aria-label={isStationFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart className={`h-6 w-6 ${isStationFavorite ? 'fill-current' : ''}`} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 bg-background/80 dark:bg-surface/80 backdrop-blur-sm rounded-full shadow-md text-muted-foreground dark:text-foreground hover:bg-surface dark:hover:bg-surface transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              aria-label="Share station"
            >
              <Share2 className="h-6 w-6" />
            </motion.button>
          </div>
        </motion.div>

        {/* Station Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-background dark:bg-surface rounded-xl p-6 shadow-md border border-[#E5E7EB] dark:border-border"
        >
          <h1 className="text-3xl font-bold text-muted-foreground dark:text-foreground mb-2 font-inter">
            {station.name}
          </h1>
          <div className="flex items-center text-muted-foreground dark:text-muted-foreground text-sm mb-4">
            <Star className="h-4 w-4 text-accent mr-1 fill-yellow-500" />
            <span>{station.rating.toFixed(1)}</span>
            <span className="mx-1">•</span>
            <span>{station.reviewsCount} reviews</span>
            <span className="mx-1">•</span>
            <MapPin className="h-4 w-4 mr-1" />
            <span>{station.address}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-b border-[#E5E7EB] dark:border-border py-4 my-4">
            <div className="flex items-center text-muted-foreground dark:text-foreground">
              <Plug className="h-5 w-5 text-[#3B82F6] mr-2" />
              <span className="font-medium">Charger Type:</span>
              <span className="ml-2 text-muted-foreground dark:text-muted-foreground">{station.chargerType}</span>
            </div>
            <div className="flex items-center text-muted-foreground dark:text-foreground">
              <Zap className="h-5 w-5 text-[#3B82F6] mr-2" />
              <span className="font-medium">Power Output:</span>
              <span className="ml-2 text-muted-foreground dark:text-muted-foreground">{station.powerOutputKw} kW</span>
            </div>
            <div className="flex items-center text-muted-foreground dark:text-foreground">
              <DollarSign className="h-5 w-5 text-[#3B82F6] mr-2" />
              <span className="font-medium">Price:</span>
              <span className="ml-2 text-muted-foreground dark:text-muted-foreground">${station.pricePerKwh.toFixed(2)} / kWh</span>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-muted-foreground dark:text-foreground mb-2 font-inter">About this station</h2>
          <p className="text-muted-foreground dark:text-muted-foreground leading-relaxed">{station.description}</p>
        </motion.div>

        {/* Host Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-background dark:bg-surface rounded-xl p-6 shadow-md border border-[#E5E7EB] dark:border-border"
        >
          <h2 className="text-xl font-semibold text-muted-foreground dark:text-foreground mb-4 font-inter">Hosted by {station.hostName}</h2>
          <div className="flex items-center text-muted-foreground dark:text-muted-foreground">
            <img
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${station.hostName}`}
              alt={station.hostName}
              className="h-12 w-12 rounded-full mr-4 bg-surface dark:bg-surface"
            />
            <div>
              <p className="font-medium text-muted-foreground dark:text-foreground">{station.hostName}</p>
              <p className="text-sm">{station.hostJoinedDate}</p>
            </div>
          </div>
        </motion.div>

        {/* Amenities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="bg-background dark:bg-surface rounded-xl p-6 shadow-md border border-[#E5E7EB] dark:border-border"
        >
          <h2 className="text-xl font-semibold text-muted-foreground dark:text-foreground mb-4 font-inter">What this place offers</h2>
          <div className="grid grid-cols-2 gap-4">
            {station.amenities.map((amenity, index) => {
              const Icon = AMENITY_ICONS[amenity] || Info
              return (
                <motion.div
                  key={amenity}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.4 + index * 0.05 }}
                  className="flex items-center text-muted-foreground dark:text-foreground"
                >
                  <Icon className="h-5 w-5 text-[#3B82F6] mr-3" />
                  <span>{amenity}</span>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Availability */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="bg-background dark:bg-surface rounded-xl p-6 shadow-md border border-[#E5E7EB] dark:border-border"
        >
          <h2 className="text-xl font-semibold text-muted-foreground dark:text-foreground mb-4 font-inter">Select a charging slot</h2>
          <div className="flex flex-nowrap overflow-x-auto gap-3 pb-4 scrollbar-hide">
            {availableDates.length > 0 ? (
              availableDates.map((date) => (
                <motion.button
                  key={date}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleDateSelect(date)}
                  className={`flex-shrink-0 px-5 py-3 rounded-lg border text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900
                    ${selectedDate === date
                      ? 'bg-[#3B82F6] text-foreground border-[#3B82F6] shadow-sm'
                      : 'bg-surface dark:bg-surface text-muted-foreground dark:text-muted-foreground border-[#E5E7EB] dark:border-border hover:bg-surface dark:hover:bg-surface'
                    }`}
                  aria-label={`Select date ${new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`}
                >
                  <CalendarDays className="h-4 w-4 inline-block mr-2" />
                  {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </motion.button>
              ))
            ) : (
              <div className="text-center py-8 col-span-full">
                <div className="w-16 h-16 bg-surface dark:bg-surface rounded-full mx-auto mb-4 flex items-center justify-center">
                  <CalendarDays className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-muted-foreground dark:text-foreground mb-2 font-inter">No availability found</h3>
                <p className="text-muted-foreground dark:text-muted-foreground text-sm">Please check back later or try another station.</p>
              </div>
            )}
          </div>

          {selectedDate && (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedDate}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
              >
                {currentDaySlots.length > 0 ? (
                  currentDaySlots.map((slot) => (
                    <motion.button
                      key={slot.id}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSlotSelect(slot.id)}
                      disabled={!slot.isAvailable}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900
                        ${slot.isAvailable
                          ? selectedSlotId === slot.id
                            ? 'bg-[#3B82F6] text-foreground border-[#3B82F6] shadow-sm'
                            : 'bg-background dark:bg-surface text-muted-foreground dark:text-foreground border-[#E5E7EB] dark:border-border hover:bg-surface dark:hover:bg-surface'
                          : 'bg-surface dark:bg-surface text-muted-foreground dark:text-muted-foreground border-[#E5E7EB] dark:border-border opacity-60 cursor-not-allowed'
                        }`}
                      aria-label={`Slot from ${slot.startTime} to ${slot.endTime}, ${slot.isAvailable ? 'available' : 'unavailable'}`}
                    >
                      <Hourglass className="h-4 w-4 mb-1" />
                      <span className="font-medium">{slot.startTime} - {slot.endTime}</span>
                      {!slot.isAvailable && <span className="text-xs mt-1">Booked</span>}
                    </motion.button>
                  ))
                ) : (
                  <div className="text-center py-8 col-span-full">
                    <div className="w-16 h-16 bg-surface dark:bg-surface rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Hourglass className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-muted-foreground dark:text-foreground mb-2 font-inter">No slots available</h3>
                    <p className="text-muted-foreground dark:text-muted-foreground text-sm">Try selecting a different date.</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </motion.div>

        {/* Fixed Bottom Bar for Booking */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="fixed bottom-0 left-0 right-0 bg-background dark:bg-surface border-t border-[#E5E7EB] dark:border-border p-4 shadow-lg z-10 md:static md:p-0 md:border-none md:shadow-none"
        >
          <div className="max-w-md mx-auto flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-lg font-bold text-muted-foreground dark:text-foreground font-inter">
                ${station.pricePerKwh.toFixed(2)} <span className="text-muted-foreground dark:text-muted-foreground text-sm font-normal">/ kWh</span>
              </span>
              {selectedDate && selectedSlotId && (
                <span className="text-sm text-[#3B82F6] flex items-center mt-1">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Selected: {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ({currentDaySlots.find(s => s.id === selectedSlotId)?.startTime} - {currentDaySlots.find(s => s.id === selectedSlotId)?.endTime})
                </span>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBookClick}
              disabled={!selectedSlotId}
              className={`px-8 py-3 rounded-lg font-semibold text-base shadow-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900
                ${selectedSlotId
                  ? 'bg-[#3B82F6] text-foreground hover:bg-[#3B82F6]/90'
                  : 'bg-surface dark:bg-surface text-muted-foreground dark:text-muted-foreground cursor-not-allowed opacity-70'
                }`}
              aria-label="Book now"
            >
              Book Now
            </motion.button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="min-h-screen bg-background dark:bg-surface text-muted-foreground dark:text-foreground font-inter antialiased"
    >
      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {renderContent()}
      </div>
    </motion.div>
  )
}

// Demo component for page.tsx
export default function StationDetailsDemo() {
  const [isFavorite, setIsFavorite] = useState(false)

  const handleFavoriteToggle = (stationId: string, newFavoriteStatus: boolean) => {
    console.log(`Demo: Station ${stationId} favorite status toggled to ${newFavoriteStatus}`)
    setIsFavorite(newFavoriteStatus)
  }

  return (
    <div className="min-h-screen bg-surface dark:bg-surface p-4">
      <StationDetails
        onBack={() => alert('Navigating back!')}
        onBookNow={(stationId, slotId) => alert(`Booking station ${stationId} for slot ${slotId}`)}
        onFavoriteToggle={handleFavoriteToggle}
        isFavorite={isFavorite}
      />
    </div>
  )
}