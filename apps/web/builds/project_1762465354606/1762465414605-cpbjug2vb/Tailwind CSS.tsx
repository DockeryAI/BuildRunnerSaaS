'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap,
  MapPin,
  Star,
  DollarSign,
  Clock,
  BatteryCharging,
  Search,
  Filter,
  X,
  Plus,
  ChevronDown,
  ChevronRight,
  Calendar,
  Gauge,
  Wifi,
  Thermometer,
  Cloud,
  Sun,
  Moon,
  Wind,
  Droplet,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
  Sunrise,
  Sunset,
  GaugeCircle,
  Car,
  Plug,
  Info,
  AlertCircle,
  CheckCircle,
  Loader2,
  ListFilter,
  SlidersHorizontal,
  RefreshCcw,
  CalendarDays,
  Hourglass,
  Wallet,
  CreditCard,
  Banknote,
  Settings,
  User,
  HelpCircle,
  LogOut,
  Home,
  MessageSquare,
  Bell,
  BarChart2,
  Map,
  MapPinned,
  MapPinOff,
  MapPinDot,
  MapPinFilled,
  MapPinPlus,
  MapPinMinus,
  MapPinCheck,
  MapPinX,
  MapPinQuestion,
  MapPinAlert,
  MapPinSearch,
  MapPinEdit,
  MapPinHeart,
  MapPinOffLine,
  MapPinOnLine,
  MapPinOutline,
  MapPinSolid,
  MapPinStroke,
  MapPinTwoTone,
  MapPinFilledTwoTone,
  MapPinOutlineTwoTone,
  MapPinSolidTwoTone,
  MapPinStrokeTwoTone,
  MapPinTwoToneFilled,
  MapPinTwoToneOutline,
  MapPinTwoToneSolid,
  MapPinTwoToneStroke,
  MapPinTwoToneFilledOutline,
  MapPinTwoToneFilledSolid,
  MapPinTwoToneFilledStroke,
  MapPinTwoToneOutlineSolid,
  MapPinTwoToneOutlineStroke,
  MapPinTwoToneSolidStroke,
  MapPinTwoToneFilledOutlineSolid,
  MapPinTwoToneFilledOutlineStroke,
  MapPinTwoToneFilledSolidStroke,
  MapPinTwoToneOutlineSolidStroke,
  MapPinTwoToneFilledOutlineSolidStroke
} from 'lucide-react'

// Helper for conditional class names
import { cn } from '@/lib/utils'

interface Charger {
  id: string
  name: string
  location: string
  distance: string
  pricePerHour: number
  availability: string
  rating: number
  chargerType: 'Type 1' | 'Type 2' | 'CCS' | 'CHAdeMO'
  powerOutput: number // kW
  isAvailable: boolean
  imageUrl: string
  ownerId: string
  lastCharged: string
  amenities: string[]
  description: string
}

interface FilterOptions {
  chargerType: string[]
  minPowerOutput: number
  maxPrice: number
  minRating: number
  availability: 'any' | 'available' | 'unavailable'
}

interface EVChargingNetworkProps {
  chargers?: Charger[]
  onSelectCharger?: (chargerId: string) => void
  onBookCharger?: (chargerId: string, durationHours: number) => void
  onFilterChange?: (filters: FilterOptions) => void
  initialSearchTerm?: string
  isLoading?: boolean
  error?: string | null
}

const DEFAULT_CHARGERS: Charger[] = [
  {
    id: '1',
    name: 'EcoCharge Home Station',
    location: '123 Green St, Metropolis',
    distance: '2.5 miles',
    pricePerHour: 5.00,
    availability: 'Available now',
    rating: 4.8,
    chargerType: 'Type 2',
    powerOutput: 7.2,
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1621960251147-3844577881d7?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    ownerId: 'user1',
    lastCharged: '2 hours ago',
    amenities: ['Wi-Fi', 'Restroom', 'Coffee'],
    description: 'Reliable Type 2 charger in a quiet residential area. Perfect for overnight charging.'
  },
  {
    id: '2',
    name: 'Urban Fast Charge Point',
    location: '456 City Ave, Metropolis',
    distance: '0.8 miles',
    pricePerHour: 8.50,
    availability: 'Available in 30 min',
    rating: 4.5,
    chargerType: 'CCS',
    powerOutput: 50,
    isAvailable: false,
    imageUrl: 'https://images.unsplash.com/photo-1621960251147-3844577881d7?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    ownerId: 'user2',
    lastCharged: '1 hour ago',
    amenities: ['Food nearby', 'Shopping'],
    description: 'High-speed CCS charger located near downtown. Great for a quick top-up.'
  },
  {
    id: '3',
    name: 'Suburban Power Hub',
    location: '789 Oak Ln, Suburbia',
    distance: '5.1 miles',
    pricePerHour: 4.00,
    availability: 'Available now',
    rating: 4.9,
    chargerType: 'CHAdeMO',
    powerOutput: 25,
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1621960251147-3844577881d7?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    ownerId: 'user3',
    lastCharged: '4 hours ago',
    amenities: ['Garden', 'Quiet street'],
    description: 'CHAdeMO charger in a peaceful suburban setting. Enjoy the tranquility while you charge.'
  },
  {
    id: '4',
    name: 'Downtown EV Spot',
    location: '101 Market St, Metropolis',
    distance: '1.2 miles',
    pricePerHour: 6.50,
    availability: 'Available now',
    rating: 4.7,
    chargerType: 'Type 1',
    powerOutput: 6.6,
    isAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1621960251147-3844577881d7?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    ownerId: 'user4',
    lastCharged: '1 hour ago',
    amenities: ['Public transport', 'Restaurants'],
    description: 'Convenient Type 1 charger in the heart of downtown. Explore the city while your car charges.'
  },
  {
    id: '5',
    name: 'Riverside Charger',
    location: '202 River Rd, Waterside',
    distance: '3.0 miles',
    pricePerHour: 5.50,
    availability: 'Available tomorrow',
    rating: 4.6,
    chargerType: 'Type 2',
    powerOutput: 11,
    isAvailable: false,
    imageUrl: 'https://images.unsplash.com/photo-1621960251147-3844577881d7?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    ownerId: 'user5',
    lastCharged: '6 hours ago',
    amenities: ['Scenic view', 'Walking path'],
    description: 'Enjoy a beautiful riverside view with this Type 2 charger. Perfect for a leisurely charge.'
  }
]

const DEFAULT_FILTER_OPTIONS: FilterOptions = {
  chargerType: [],
  minPowerOutput: 0,
  maxPrice: 100,
  minRating: 0,
  availability: 'any'
}

export function EVChargingNetwork({
  chargers = DEFAULT_CHARGERS,
  onSelectCharger = () => console.log('Charger selected'),
  onBookCharger = () => console.log('Charger booked'),
  onFilterChange = () => console.log('Filters changed'),
  initialSearchTerm = '',
  isLoading = false,
  error = null
}: EVChargingNetworkProps = {}) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm)
  const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTER_OPTIONS)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [selectedChargerId, setSelectedChargerId] = useState<string | null>(null)
  const [bookingDuration, setBookingDuration] = useState(1) // in hours
  const [showBookingModal, setShowBookingModal] = useState(false)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      onFilterChange(newFilters);
      return newFilters;
    });
  }

  const applyFilters = () => {
    setShowFilterModal(false)
    onFilterChange(filters)
  }

  const resetFilters = () => {
    setFilters(DEFAULT_FILTER_OPTIONS)
    onFilterChange(DEFAULT_FILTER_OPTIONS)
    setShowFilterModal(false)
  }

  const filteredChargers = useMemo(() => {
    return chargers.filter(charger => {
      const matchesSearch = charger.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            charger.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            charger.description.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesChargerType = filters.chargerType.length === 0 || filters.chargerType.includes(charger.chargerType)
      const matchesPowerOutput = charger.powerOutput >= filters.minPowerOutput
      const matchesPrice = charger.pricePerHour <= filters.maxPrice
      const matchesRating = charger.rating >= filters.minRating
      const matchesAvailability = filters.availability === 'any' ||
                                  (filters.availability === 'available' && charger.isAvailable) ||
                                  (filters.availability === 'unavailable' && !charger.isAvailable)

      return matchesSearch && matchesChargerType && matchesPowerOutput && matchesPrice && matchesRating && matchesAvailability
    })
  }, [chargers, searchTerm, filters])

  const handleCardClick = (chargerId: string) => {
    setSelectedChargerId(chargerId)
    onSelectCharger(chargerId)
  }

  const handleBookClick = (chargerId: string) => {
    setSelectedChargerId(chargerId)
    setShowBookingModal(true)
  }

  const confirmBooking = () => {
    if (selectedChargerId) {
      onBookCharger(selectedChargerId, bookingDuration)
      setShowBookingModal(false)
      setSelectedChargerId(null)
      setBookingDuration(1)
    }
  }

  const selectedCharger = useMemo(() => chargers.find(c => c.id === selectedChargerId), [chargers, selectedChargerId]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0 }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15, ease: "easeIn" } }
  };

  const filterCount = useMemo(() => {
    let count = 0;
    if (filters.chargerType.length > 0) count++;
    if (filters.minPowerOutput > DEFAULT_FILTER_OPTIONS.minPowerOutput) count++;
    if (filters.maxPrice < DEFAULT_FILTER_OPTIONS.maxPrice) count++;
    if (filters.minRating > DEFAULT_FILTER_OPTIONS.minRating) count++;
    if (filters.availability !== DEFAULT_FILTER_OPTIONS.availability) count++;
    return count;
  }, [filters]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="min-h-screen bg-background dark:bg-surface text-muted-foreground dark:text-foreground font-['Inter',_system-ui,_sans-serif]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.h1
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-3xl sm:text-4xl font-bold text-muted-foreground dark:text-foreground mb-6 text-center sm:text-left"
        >
          Find EV Charging Stations
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground dark:text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by location, name, or type..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2.5 bg-background dark:bg-surface border border-border dark:border-border rounded-lg text-muted-foreground dark:text-foreground placeholder-gray-500 dark:placeholder-gray-400 focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/50 focus:outline-none transition-all duration-200 shadow-sm"
              aria-label="Search charging stations"
            />
          </div>
          <motion.button
            onClick={() => setShowFilterModal(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-surface dark:bg-surface text-muted-foreground dark:text-foreground rounded-lg hover:bg-surface dark:hover:bg-surface transition-all duration-200 font-medium text-sm border border-border dark:border-border shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:ring-offset-2 dark:focus:ring-offset-gray-950"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            aria-haspopup="dialog"
            aria-expanded={showFilterModal}
            aria-label="Open filter options"
          >
            <ListFilter className="h-5 w-5" />
            Filters
            {filterCount > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-[#3B82F6] text-foreground text-xs rounded-full">
                {filterCount}
              </span>
            )}
          </motion.button>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="rounded-lg bg-destructive dark:bg-destructive/20 border border-destructive dark:border-destructive p-4 mb-8"
          >
            <p className="text-sm text-destructive dark:text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" /> {error}
            </p>
          </motion.div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-background dark:bg-surface border border-border dark:border-border rounded-xl p-6 shadow-sm animate-pulse">
                <div className="h-40 w-full mb-4 rounded-lg bg-surface dark:bg-surface"></div>
                <div className="h-6 bg-surface dark:bg-surface rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-surface dark:bg-surface rounded w-1/2 mb-1"></div>
                <div className="h-4 bg-surface dark:bg-surface rounded w-1/3 mb-3"></div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <div className="h-6 w-20 bg-surface dark:bg-surface rounded-full"></div>
                  <div className="h-6 w-16 bg-surface dark:bg-surface rounded-full"></div>
                </div>
                <div className="h-4 bg-surface dark:bg-surface rounded w-full mb-4"></div>
                <div className="h-10 bg-surface dark:bg-surface rounded-lg w-full"></div>
              </div>
            ))}
          </div>
        ) : filteredChargers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="text-center py-16 bg-surface dark:bg-surface rounded-xl border border-border dark:border-border shadow-sm"
          >
            <MapPinOff className="mx-auto h-16 w-16 text-muted-foreground dark:text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground dark:text-foreground mb-2">No charging stations found</h3>
            <p className="text-muted-foreground dark:text-muted-foreground mb-6">Try adjusting your search or filter criteria.</p>
            <motion.button
              onClick={resetFilters}
              className="px-5 py-2.5 bg-[#3B82F6] text-foreground rounded-lg hover:bg-[#3B82F6]/90 transition-all duration-200 font-medium text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:ring-offset-2 dark:focus:ring-offset-gray-950"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <RefreshCcw className="inline-block h-4 w-4 mr-2" />
              Reset Filters
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredChargers.map(charger => (
              <motion.div
                key={charger.id}
                variants={itemVariants}
                whileHover={{ y: -4, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
                transition={{ duration: 0.2 }}
                className="bg-background dark:bg-surface border border-border dark:border-border rounded-xl p-6 shadow-sm hover:border-[#3B82F6]/50 transition-all duration-200 cursor-pointer flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950"
                onClick={() => handleCardClick(charger.id)}
                role="button"
                tabIndex={0}
                aria-label={`View details for ${charger.name}`}
              >
                <div className="relative h-40 w-full mb-4 rounded-lg overflow-hidden">
                  <img
                    src={charger.imageUrl}
                    alt={charger.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-background/80 dark:bg-surface/80 backdrop-blur-sm text-muted-foreground dark:text-foreground text-xs font-medium px-2 py-1 rounded-md flex items-center gap-1">
                    <Star className="h-3 w-3 text-accent" /> {charger.rating.toFixed(1)}
                  </div>
                  <div className={cn(
                    "absolute bottom-2 left-2 px-3 py-1 rounded-full text-xs font-medium",
                    charger.isAvailable ? "bg-secondary dark:bg-secondary/30 text-secondary dark:text-secondary border border-secondary dark:border-secondary" : "bg-surface dark:bg-surface/30 text-muted-foreground dark:text-muted-foreground border border-border dark:border-border"
                  )}>
                    {charger.isAvailable ? 'Available' : 'Occupied'}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-muted-foreground dark:text-foreground mb-2 leading-tight">{charger.name}</h3>
                <p className="text-muted-foreground dark:text-muted-foreground text-sm flex items-center gap-1 mb-1">
                  <MapPin className="h-4 w-4" /> {charger.location} ({charger.distance})
                </p>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-muted-foreground dark:text-foreground font-bold text-lg flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-secondary" /> {charger.pricePerHour.toFixed(2)}/hr
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground dark:text-muted-foreground">
                    <BatteryCharging className="h-4 w-4" /> {charger.powerOutput} kW
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-surface dark:bg-surface text-muted-foreground dark:text-muted-foreground text-xs rounded-full border border-border dark:border-border">
                    {charger.chargerType}
                  </span>
                  {charger.amenities.slice(0, 2).map((amenity, index) => (
                    <span key={index} className="px-3 py-1 bg-surface dark:bg-surface text-muted-foreground dark:text-muted-foreground text-xs rounded-full border border-border dark:border-border">
                      {amenity}
                    </span>
                  ))}
                  {charger.amenities.length > 2 && (
                    <span className="px-3 py-1 bg-surface dark:bg-surface text-muted-foreground dark:text-muted-foreground text-xs rounded-full border border-border dark:border-border">
                      +{charger.amenities.length - 2} more
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground line-clamp-2 mb-4 flex-grow">{charger.description}</p>
                <motion.button
                  onClick={(e) => { e.stopPropagation(); handleBookClick(charger.id); }}
                  className="w-full px-5 py-2.5 bg-[#3B82F6] text-foreground rounded-lg hover:bg-[#3B82F6]/90 transition-all duration-200 font-medium text-sm shadow-md mt-auto disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#3B82F6] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:ring-offset-2 dark:focus:ring-offset-gray-950"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={!charger.isAvailable}
                  aria-label={charger.isAvailable ? `Book ${charger.name}` : `Charger ${charger.name} is currently occupied`}
                >
                  {charger.isAvailable ? 'Book Now' : 'Currently Occupied'}
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {showFilterModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-surface/50 dark:bg-surface/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowFilterModal(false)}
            aria-modal="true"
            role="dialog"
            aria-labelledby="filter-modal-title"
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="bg-background dark:bg-surface rounded-xl p-6 w-full max-w-md shadow-lg border border-border dark:border-border"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 id="filter-modal-title" className="text-xl font-bold text-muted-foreground dark:text-foreground">Filter Stations</h2>
                <motion.button
                  onClick={() => setShowFilterModal(false)}
                  className="p-2 rounded-full text-muted-foreground dark:text-muted-foreground hover:bg-surface dark:hover:bg-surface transition-colors focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                  whileHover={{ rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Close filter options"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground dark:text-foreground mb-2">Charger Type</label>
                  <div className="flex flex-wrap gap-2">
                    {['Type 1', 'Type 2', 'CCS', 'CHAdeMO'].map(type => (
                      <motion.button
                        key={type}
                        onClick={() => {
                          const newTypes = filters.chargerType.includes(type)
                            ? filters.chargerType.filter(t => t !== type)
                            : [...filters.chargerType, type]
                          handleFilterChange('chargerType', newTypes)
                        }}
                        className={cn(
                          "px-4 py-2 rounded-full text-sm font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900",
                          filters.chargerType.includes(type)
                            ? "bg-[#3B82F6] text-foreground border-[#3B82F6]"
                            : "bg-surface dark:bg-surface text-muted-foreground dark:text-muted-foreground border-border dark:border-border hover:bg-surface dark:hover:bg-surface"
                        )}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-pressed={filters.chargerType.includes(type)}
                      >
                        {type}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="minPowerOutput" className="block text-sm font-medium text-muted-foreground dark:text-foreground mb-2">
                    Minimum Power Output ({filters.minPowerOutput} kW)
                  </label>
                  <input
                    id="minPowerOutput"
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={filters.minPowerOutput}
                    onChange={(e) => handleFilterChange('minPowerOutput', Number(e.target.value))}
                    className="w-full h-2 bg-surface dark:bg-surface rounded-lg appearance-none cursor-pointer accent-[#3B82F6] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                    aria-valuenow={filters.minPowerOutput}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>

                <div>
                  <label htmlFor="maxPrice" className="block text-sm font-medium text-muted-foreground dark:text-foreground mb-2">
                    Max Price Per Hour (${filters.maxPrice.toFixed(2)})
                  </label>
                  <input
                    id="maxPrice"
                    type="range"
                    min="0"
                    max="20"
                    step="0.5"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', Number(e.target.value))}
                    className="w-full h-2 bg-surface dark:bg-surface rounded-lg appearance-none cursor-pointer accent-[#3B82F6] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                    aria-valuenow={filters.maxPrice}
                    aria-valuemin={0}
                    aria-valuemax={20}
                  />
                </div>

                <div>
                  <label htmlFor="minRating" className="block text-sm font-medium text-muted-foreground dark:text-foreground mb-2">
                    Minimum Rating ({filters.minRating} <Star className="inline-block h-4 w-4 text-accent" />)
                  </label>
                  <input
                    id="minRating"
                    type="range"
                    min="0"
                    max="5"
                    step="0.5"
                    value={filters.minRating}
                    onChange={(e) => handleFilterChange('minRating', Number(e.target.value))}
                    className="w-full h-2 bg-surface dark:bg-surface rounded-lg appearance-none cursor-pointer accent-[#3B82F6] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                    aria-valuenow={filters.minRating}
                    aria-valuemin={0}
                    aria-valuemax={5}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground dark:text-foreground mb-2">Availability</label>
                  <div className="flex gap-2">
                    {['any', 'available', 'unavailable'].map(status => (
                      <motion.button
                        key={status}
                        onClick={() => handleFilterChange('availability', status)}
                        className={cn(
                          "px-4 py-2 rounded-full text-sm font-medium border transition-colors capitalize focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900",
                          filters.availability === status
                            ? "bg-[#3B82F6] text-foreground border-[#3B82F6]"
                            : "bg-surface dark:bg-surface text-muted-foreground dark:text-muted-foreground border-border dark:border-border hover:bg-surface dark:hover:bg-surface"
                        )}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-pressed={filters.availability === status}
                      >
                        {status}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <motion.button
                  onClick={resetFilters}
                  className="px-5 py-2.5 bg-surface dark:bg-surface text-muted-foreground dark:text-foreground rounded-lg hover:bg-surface dark:hover:bg-surface transition-all duration-200 font-medium text-sm border border-border dark:border-border shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Reset
                </motion.button>
                <motion.button
                  onClick={applyFilters}
                  className="px-5 py-2.5 bg-[#3B82F6] text-foreground rounded-lg hover:bg-[#3B82F6]/90 transition-all duration-200 font-medium text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Apply Filters
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBookingModal && selectedCharger && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-surface/50 dark:bg-surface/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowBookingModal(false)}
            aria-modal="true"
            role="dialog"
            aria-labelledby="booking-modal-title"
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="bg-background dark:bg-surface rounded-xl p-6 w-full max-w-md shadow-lg border border-border dark:border-border"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 id="booking-modal-title" className="text-xl font-bold text-muted-foreground dark:text-foreground">Book Charger: {selectedCharger.name}</h2>
                <motion.button
                  onClick={() => setShowBookingModal(false)}
                  className="p-2 rounded-full text-muted-foreground dark:text-muted-foreground hover:bg-surface dark:hover:bg-surface transition-colors focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                  whileHover={{ rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Close booking modal"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>

              <div className="space-y-4">
                <p className="text-muted-foreground dark:text-muted-foreground text-sm flex items-center">
                  <MapPin className="inline-block h-4 w-4 mr-1" /> {selectedCharger.location}
                </p>
                <p className="text-muted-foreground dark:text-muted-foreground text-sm flex items-center">
                  <BatteryCharging className="inline-block h-4 w-4 mr-1" /> {selectedCharger.chargerType} ({selectedCharger.powerOutput} kW)
                </p>
                <p className="text-muted-foreground dark:text-foreground font-semibold text-lg flex items-center gap-1">
                  <DollarSign className="h-5 w-5 text-secondary" /> {selectedCharger.pricePerHour.toFixed(2)}/hr
                </p>

                <div>
                  <label htmlFor="bookingDuration" className="block text-sm font-medium text-muted-foreground dark:text-foreground mb-2">
                    Booking Duration (hours)
                  </label>
                  <input
                    id="bookingDuration"
                    type="number"
                    min="1"
                    max="24"
                    value={bookingDuration}
                    onChange={(e) => setBookingDuration(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-background dark:bg-surface border border-border dark:border-border rounded-lg text-muted-foreground dark:text-foreground placeholder-gray-500 dark:placeholder-gray-400 focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]/50 transition-all duration-200 shadow-sm"
                    aria-label="Booking duration in hours"
                  />
                </div>

                <div className="text-lg font-bold text-muted-foreground dark:text-foreground flex justify-between items-center pt-2">
                  <span>Total Cost:</span>
                  <span className="text-[#3B82F6]">${(selectedCharger.pricePerHour * bookingDuration).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <motion.button
                  onClick={() => setShowBookingModal(false)}
                  className="px-5 py-2.5 bg-surface dark:bg-surface text-muted-foreground dark:text-foreground rounded-lg hover:bg-surface dark:hover:bg-surface transition-all duration-200 font-medium text-sm border border-border dark:border-border shadow-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={confirmBooking}
                  className="px-5 py-2.5 bg-[#3B82F6] text-foreground rounded-lg hover:bg-[#3B82F6]/90 transition-all duration-200 font-medium text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  aria-label={`Confirm booking for ${bookingDuration} hours`}
                >
                  Confirm Booking
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function EVChargingNetworkDemo() {
  return <EVChargingNetwork />
}