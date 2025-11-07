'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap,
  MapPin,
  Clock,
  DollarSign,
  Star,
  BatteryCharging,
  ChevronRight,
  ChevronLeft,
  Search,
  Filter,
  X,
  Plus,
  Minus,
  CalendarDays,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react'

// Helper function for debouncing
function debounce<T extends (...args: any[]) => void>(func: T, delay: number) {
  let timeout: NodeJS.Timeout
  return function(this: any, ...args: Parameters<T>) {
    const context = this
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(context, args), delay)
  } as T
}

// Data Models
interface Charger {
  id: string
  name: string
  location: string
  distance: number
  availability: string // e.g., "Available", "Occupied", "Offline"
  chargeRate: number // kW
  pricePerHour: number // USD
  connectorType: 'Type 1' | 'Type 2' | 'CCS' | 'CHAdeMO'
  rating: number // 1-5
  reviews: number
  imageUrl: string
  isFavorite?: boolean
  ownerId: string
  description?: string
  amenities?: string[]
  latitude: number
  longitude: number
}

interface FilterOptions {
  connectorType: ('Type 1' | 'Type 2' | 'CCS' | 'CHAdeMO')[]
  minChargeRate: number
  maxPricePerHour: number
  minRating: number
  availability: ('Available' | 'Occupied' | 'Offline')[]
}

interface ChargerListProps {
  chargers?: Charger[]
  onChargerSelect?: (chargerId: string) => void
  initialFilters?: FilterOptions
  isLoading?: boolean
  error?: string | null
}

const DEFAULT_CHARGERS: Charger[] = [
  {
    id: 'chr-001',
    name: 'Sunny Side Charger',
    location: '123 Main St, Anytown',
    distance: 0.5,
    availability: 'Available',
    chargeRate: 7.2,
    pricePerHour: 2.50,
    connectorType: 'Type 2',
    rating: 4.8,
    reviews: 120,
    imageUrl: 'https://images.unsplash.com/photo-1621980838848-18544976451e?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    isFavorite: true,
    ownerId: 'usr-001',
    description: 'Reliable Type 2 charger in a quiet residential area. Perfect for overnight charging.',
    amenities: ['Wi-Fi', 'Restroom', 'Coffee'],
    latitude: 34.052235,
    longitude: -118.243683
  },
  {
    id: 'chr-002',
    name: 'Urban Fast Charge',
    location: '456 Oak Ave, Cityville',
    distance: 1.2,
    availability: 'Occupied',
    chargeRate: 22,
    pricePerHour: 5.00,
    connectorType: 'CCS',
    rating: 4.5,
    reviews: 85,
    imageUrl: 'https://images.unsplash.com/photo-1621980838848-18544976451e?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    isFavorite: false,
    ownerId: 'usr-002',
    description: 'High-speed CCS charger located near downtown. Great for a quick top-up.',
    amenities: ['Shopping', 'Restaurant'],
    latitude: 34.052235,
    longitude: -118.243683
  },
  {
    id: 'chr-003',
    name: 'Green Valley Station',
    location: '789 Pine Ln, Greendale',
    distance: 3.1,
    availability: 'Available',
    chargeRate: 11,
    pricePerHour: 3.00,
    connectorType: 'Type 1',
    rating: 4.9,
    reviews: 210,
    imageUrl: 'https://images.unsplash.com/photo-1621980838848-18544976451e?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    isFavorite: true,
    ownerId: 'usr-003',
    description: 'Eco-friendly Type 1 charger with solar power. Enjoy the scenic views while you charge.',
    amenities: ['Park', 'Nature Trail'],
    latitude: 34.052235,
    longitude: -118.243683
  },
  {
    id: 'chr-004',
    name: 'Riverside Power',
    location: '101 River Rd, Waterside',
    distance: 0.8,
    availability: 'Available',
    chargeRate: 7.2,
    pricePerHour: 2.75,
    connectorType: 'Type 2',
    rating: 4.6,
    reviews: 95,
    imageUrl: 'https://images.unsplash.com/photo-1621980838848-18544976451e?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    isFavorite: false,
    ownerId: 'usr-004',
    description: 'Standard Type 2 charger with easy access. Close to local shops.',
    amenities: ['Grocery Store', 'Pharmacy'],
    latitude: 34.052235,
    longitude: -118.243683
  },
  {
    id: 'chr-005',
    name: 'Tech Hub Charger',
    location: '202 Innovation Dr, Techville',
    distance: 2.0,
    availability: 'Offline',
    chargeRate: 50,
    pricePerHour: 7.00,
    connectorType: 'CHAdeMO',
    rating: 4.7,
    reviews: 60,
    imageUrl: 'https://images.unsplash.com/photo-1621980838848-18544976451e?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    isFavorite: false,
    ownerId: 'usr-005',
    description: 'Ultra-fast CHAdeMO charger in a bustling tech park. Currently offline for maintenance.',
    amenities: ['Co-working Space', 'Cafeteria'],
    latitude: 34.052235,
    longitude: -118.243683
  }
]

const DEFAULT_FILTERS: FilterOptions = {
  connectorType: [],
  minChargeRate: 0,
  maxPricePerHour: 100,
  minRating: 0,
  availability: []
}

export function ChargerList({
  chargers = DEFAULT_CHARGERS,
  onChargerSelect = () => console.log('Charger selected'),
  initialFilters = DEFAULT_FILTERS,
  isLoading = false,
  error = null,
}: ChargerListProps = {}) {
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [filters, setFilters] = useState<FilterOptions>(initialFilters)
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState<boolean>(false)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const chargersPerPage = 5

  const filterPanelRef = useRef<HTMLDivElement>(null)

  const handleSearchChange = useCallback(
    debounce((value: string) => {
      setSearchTerm(value)
      setCurrentPage(1) // Reset to first page on search
    }, 300),
    []
  )

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1) // Reset to first page on filter change
  }

  const handleConnectorTypeChange = (type: Charger['connectorType']) => {
    setFilters(prev => {
      const currentTypes = prev.connectorType
      if (currentTypes.includes(type)) {
        return { ...prev, connectorType: currentTypes.filter(t => t !== type) }
      } else {
        return { ...prev, connectorType: [...currentTypes, type] }
      }
    })
    setCurrentPage(1)
  }

  const handleAvailabilityChange = (status: Charger['availability']) => {
    setFilters(prev => {
      const currentStatus = prev.availability
      if (currentStatus.includes(status)) {
        return { ...prev, availability: currentStatus.filter(s => s !== status) }
      } else {
        return { ...prev, availability: [...currentStatus, status] }
      }
    })
    setCurrentPage(1)
  }

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS)
    setSearchTerm('')
    setCurrentPage(1)
  }

  const filteredChargers = chargers.filter(charger => {
    const matchesSearch = charger.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          charger.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          charger.description?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesConnectorType = filters.connectorType.length === 0 ||
                                 filters.connectorType.includes(charger.connectorType)

    const matchesChargeRate = charger.chargeRate >= filters.minChargeRate

    const matchesPrice = charger.pricePerHour <= filters.maxPricePerHour

    const matchesRating = charger.rating >= filters.minRating

    const matchesAvailability = filters.availability.length === 0 ||
                                filters.availability.includes(charger.availability)

    return matchesSearch && matchesConnectorType && matchesChargeRate && matchesPrice && matchesRating && matchesAvailability
  })

  // Pagination logic
  const indexOfLastCharger = currentPage * chargersPerPage
  const indexOfFirstCharger = indexOfLastCharger - chargersPerPage
  const currentChargers = filteredChargers.slice(indexOfFirstCharger, indexOfLastCharger)
  const totalPages = Math.ceil(filteredChargers.length / chargersPerPage)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  // Close filter panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterPanelRef.current && !filterPanelRef.current.contains(event.target as Node)) {
        setIsFilterPanelOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

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

  const getAvailabilityStyles = (availability: string) => {
    switch (availability) {
      case 'Available':
        return 'bg-[#D1FAE5] text-[#065F46] dark:bg-[#14532D] dark:text-[#A7F3D0]'; // Greenish
      case 'Occupied':
        return 'bg-[#FEE2E2] text-[#991B1B] dark:bg-[#7F1D1D] dark:text-[#FECACA]'; // Reddish
      case 'Offline':
        return 'bg-[#E5E7EB] text-[#4B5563] dark:bg-[#374151] dark:text-[#D1D5DB]'; // Grayish
      default:
        return 'bg-[#E5E7EB] text-[#4B5563] dark:bg-[#374151] dark:text-[#D1D5DB]';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="min-h-screen bg-background text-[#1F2937] font-['Inter',_system-ui,_sans-serif] dark:bg-[#111827] dark:text-[#F9FAFB]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-[#1F2937] dark:text-[#F9FAFB] mb-6">Available Charging Stations</h1>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#6B7280] dark:text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search by name, location, or description..."
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-[#E5E7EB] rounded-lg text-[#1F2937] placeholder-[#6B7280] focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/50 outline-none transition-all duration-150 dark:bg-[#1F2937] dark:border-[#374151] dark:text-[#F9FAFB] dark:placeholder-[#9CA3AF]"
              onChange={(e) => handleSearchChange(e.target.value)}
              defaultValue={searchTerm}
              aria-label="Search chargers"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#F3F4F6] text-[#1F2937] rounded-lg hover:bg-[#E5E7EB] transition-all duration-150 font-medium text-sm border border-[#E5E7EB] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50 focus-visible:ring-offset-2 dark:bg-[#374151] dark:text-[#F9FAFB] dark:border-[#4B5563] dark:hover:bg-[#4B5563]"
            aria-expanded={isFilterPanelOpen}
            aria-controls="filter-panel"
          >
            <Filter className="h-5 w-5" />
            Filters
            {Object.values(filters).some(f => (Array.isArray(f) ? f.length > 0 : f > (DEFAULT_FILTERS as any)[Object.keys(filters).find(key => (DEFAULT_FILTERS as any)[key] === f)!])) && (
              <span className="ml-1 px-2 py-0.5 bg-[#3B82F6] text-foreground text-xs rounded-full">
                {Object.values(filters).filter(f => (Array.isArray(f) ? f.length > 0 : f > (DEFAULT_FILTERS as any)[Object.keys(filters).find(key => (DEFAULT_FILTERS as any)[key] === f)!])).length}
              </span>
            )}
          </motion.button>
        </div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-lg bg-[#FEE2E2] dark:bg-[#7F1D1D]/20 border border-[#FCA5A5] dark:border-[#7F1D1D] p-4 mb-6"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-[#DC2626]" />
              <p className="text-sm text-[#DC2626] dark:text-[#FCA5A5] font-medium">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Filter Panel */}
        <AnimatePresence>
          {isFilterPanelOpen && (
            <motion.div
              ref={filterPanelRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              id="filter-panel"
              className="bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg p-6 mb-8 overflow-hidden dark:bg-[#1F2937] dark:border-[#374151]"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Connector Type */}
                <div>
                  <h3 className="text-lg font-semibold text-[#1F2937] dark:text-[#F9FAFB] mb-3">Connector Type</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Type 1', 'Type 2', 'CCS', 'CHAdeMO'].map(type => (
                      <motion.button
                        key={type}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleConnectorTypeChange(type as Charger['connectorType'])}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50 focus-visible:ring-offset-2
                          ${filters.connectorType.includes(type as Charger['connectorType'])
                            ? 'bg-[#3B82F6] text-foreground'
                            : 'bg-background text-[#1F2937] border border-[#E5E7EB] hover:bg-[#F3F4F6] dark:bg-[#111827] dark:text-[#F9FAFB] dark:border-[#374151] dark:hover:bg-[#1F2937]'
                          }`}
                        aria-pressed={filters.connectorType.includes(type as Charger['connectorType'])}
                      >
                        {type}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Charge Rate */}
                <div>
                  <h3 className="text-lg font-semibold text-[#1F2937] dark:text-[#F9FAFB] mb-3">Min Charge Rate (kW)</h3>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={filters.minChargeRate}
                    onChange={(e) => handleFilterChange('minChargeRate', Number(e.target.value))}
                    className="w-full h-2 bg-[#E5E7EB] rounded-lg appearance-none cursor-pointer accent-[#3B82F6] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50 focus-visible:ring-offset-2 dark:bg-[#374151]"
                    aria-label="Minimum charge rate"
                  />
                  <div className="flex justify-between text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-1">
                    <span>0 kW</span>
                    <span>{filters.minChargeRate} kW</span>
                    <span>50 kW</span>
                  </div>
                </div>

                {/* Max Price */}
                <div>
                  <h3 className="text-lg font-semibold text-[#1F2937] dark:text-[#F9FAFB] mb-3">Max Price per Hour ($)</h3>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={filters.maxPricePerHour}
                    onChange={(e) => handleFilterChange('maxPricePerHour', Number(e.target.value))}
                    className="w-full h-2 bg-[#E5E7EB] rounded-lg appearance-none cursor-pointer accent-[#3B82F6] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50 focus-visible:ring-offset-2 dark:bg-[#374151]"
                    aria-label="Maximum price per hour"
                  />
                  <div className="flex justify-between text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-1">
                    <span>$0</span>
                    <span>${filters.maxPricePerHour.toFixed(2)}</span>
                    <span>$20</span>
                  </div>
                </div>

                {/* Min Rating */}
                <div>
                  <h3 className="text-lg font-semibold text-[#1F2937] dark:text-[#F9FAFB] mb-3">Min Rating</h3>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <motion.button
                        key={star}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleFilterChange('minRating', star)}
                        className={`text-2xl transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50 focus-visible:ring-offset-2
                          ${filters.minRating >= star ? 'text-[#FBBF24]' : 'text-[#9CA3AF] hover:text-[#FBBF24]/70'}`}
                        aria-label={`${star} stars and above`}
                      >
                        <Star fill="currentColor" strokeWidth={0} className="h-6 w-6" />
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <h3 className="text-lg font-semibold text-[#1F2937] dark:text-[#F9FAFB] mb-3">Availability</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Available', 'Occupied', 'Offline'].map(status => (
                      <motion.button
                        key={status}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAvailabilityChange(status as Charger['availability'])}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50 focus-visible:ring-offset-2
                          ${filters.availability.includes(status as Charger['availability'])
                            ? 'bg-[#3B82F6] text-foreground'
                            : 'bg-background text-[#1F2937] border border-[#E5E7EB] hover:bg-[#F3F4F6] dark:bg-[#111827] dark:text-[#F9FAFB] dark:border-[#374151] dark:hover:bg-[#1F2937]'
                          }`}
                        aria-pressed={filters.availability.includes(status as Charger['availability'])}
                      >
                        {status}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={resetFilters}
                  className="px-5 py-2.5 bg-background text-[#1F2937] rounded-lg hover:bg-[#F3F4F6] transition-all duration-150 font-medium text-sm border border-[#E5E7EB] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50 focus-visible:ring-offset-2 dark:bg-[#111827] dark:text-[#F9FAFB] dark:border-[#374151] dark:hover:bg-[#1F2937]"
                >
                  Reset Filters
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsFilterPanelOpen(false)}
                  className="px-5 py-2.5 bg-[#3B82F6] text-foreground rounded-lg hover:bg-[#2563EB] transition-all duration-150 font-medium text-sm shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50 focus-visible:ring-offset-2"
                >
                  Apply Filters
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: chargersPerPage }).map((_, index) => (
              <div key={index} className="bg-background dark:bg-[#1F2937] border border-[#E5E7EB] dark:border-[#374151] rounded-xl p-4 shadow-sm animate-pulse">
                <div className="h-48 w-full mb-4 rounded-lg bg-[#F3F4F6] dark:bg-[#374151]"></div>
                <div className="h-6 bg-[#F3F4F6] dark:bg-[#374151] rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-[#F3F4F6] dark:bg-[#374151] rounded w-1/2 mb-3"></div>
                <div className="flex items-center justify-between mb-3">
                  <div className="h-4 bg-[#F3F4F6] dark:bg-[#374151] rounded w-1/3"></div>
                  <div className="h-4 bg-[#F3F4F6] dark:bg-[#374151] rounded w-1/4"></div>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-5 bg-[#F3F4F6] dark:bg-[#374151] rounded w-1/4"></div>
                  <div className="h-5 bg-[#F3F4F6] dark:bg-[#374151] rounded w-1/6"></div>
                </div>
                <div className="h-10 bg-[#F3F4F6] dark:bg-[#374151] rounded-lg w-full"></div>
              </div>
            ))}
          </div>
        ) : filteredChargers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 text-[#6B7280] dark:text-[#9CA3AF]"
          >
            <Info className="h-16 w-16 mb-4" />
            <p className="text-xl font-semibold mb-2">No chargers found</p>
            <p className="text-center max-w-md text-base">
              Adjust your search or filter criteria. We're always expanding our network!
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={resetFilters}
              className="mt-6 px-6 py-3 bg-[#3B82F6] text-foreground rounded-lg hover:bg-[#2563EB] transition-all duration-150 font-medium text-base shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50 focus-visible:ring-offset-2"
            >
              Clear All Filters
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {currentChargers.map(charger => (
              <motion.div
                key={charger.id}
                variants={itemVariants}
                whileHover={{ y: -4, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
                whileTap={{ scale: 0.99 }}
                onClick={() => onChargerSelect(charger.id)}
                className="bg-background border border-[#E5E7EB] rounded-xl p-4 cursor-pointer transition-all duration-200 shadow-sm hover:border-[#3B82F6]/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50 focus-visible:ring-offset-2 dark:bg-[#1F2937] dark:border-[#374151] dark:hover:border-[#3B82F6]"
                role="button"
                tabIndex={0}
                aria-label={`View details for ${charger.name}`}
              >
                <div className="relative h-48 w-full mb-4 rounded-lg overflow-hidden">
                  <img
                    src={charger.imageUrl}
                    alt={charger.name}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute top-3 right-3 px-3 py-1 bg-background/80 backdrop-blur-sm rounded-full text-sm font-medium text-[#1F2937] flex items-center gap-1 dark:bg-[#1F2937]/80 dark:text-[#F9FAFB]">
                    <MapPin className="h-4 w-4 text-[#6B7280] dark:text-[#9CA3AF]" />
                    {charger.distance.toFixed(1)} mi
                  </div>
                  <div className={`absolute bottom-3 left-3 px-3 py-1 rounded-full text-xs font-medium ${getAvailabilityStyles(charger.availability)}`}>
                    {charger.availability}
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-[#1F2937] dark:text-[#F9FAFB] mb-2">{charger.name}</h2>
                <p className="text-[#6B7280] dark:text-[#9CA3AF] text-sm mb-3 flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> {charger.location}
                </p>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1 text-[#FBBF24]">
                    <Star fill="currentColor" strokeWidth={0} className="h-4 w-4" />
                    <span className="font-medium">{charger.rating.toFixed(1)}</span>
                    <span className="text-[#6B7280] dark:text-[#9CA3AF] text-sm">({charger.reviews} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#1F2937] dark:text-[#F9FAFB]">
                    <BatteryCharging className="h-4 w-4 text-[#3B82F6]" />
                    <span className="font-medium">{charger.chargeRate} kW</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-bold text-[#3B82F6]">${charger.pricePerHour.toFixed(2)}<span className="text-sm font-normal text-[#6B7280] dark:text-[#9CA3AF]">/hr</span></span>
                  <span className="px-3 py-1 bg-[#F3F4F6] text-[#1F2937] rounded-full text-xs font-medium border border-[#E5E7EB] dark:bg-[#374151] dark:text-[#F9FAFB] dark:border-[#4B5563]">
                    {charger.connectorType}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-4 py-2.5 bg-[#3B82F6] text-foreground rounded-lg hover:bg-[#2563EB] transition-all duration-150 font-medium text-sm shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50 focus-visible:ring-offset-2"
                >
                  View Details
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Pagination */}
        {filteredChargers.length > chargersPerPage && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 bg-[#F3F4F6] text-[#1F2937] rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#E5E7EB] transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50 focus-visible:ring-offset-2 dark:bg-[#374151] dark:text-[#F9FAFB] dark:hover:bg-[#4B5563]"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-5 w-5" />
            </motion.button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <motion.button
                key={page}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => paginate(page)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50 focus-visible:ring-offset-2
                  ${currentPage === page ? 'bg-[#3B82F6] text-foreground' : 'bg-[#F3F4F6] text-[#1F2937] hover:bg-[#E5E7EB] dark:bg-[#374151] dark:text-[#F9FAFB] dark:hover:bg-[#4B5563]'}`}
                aria-current={currentPage === page ? 'page' : undefined}
                aria-label={`Page ${page}`}
              >
                {page}
              </motion.button>
            ))}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 bg-[#F3F4F6] text-[#1F2937] rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#E5E7EB] transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50 focus-visible:ring-offset-2 dark:bg-[#374151] dark:text-[#F9FAFB] dark:hover:bg-[#4B5563]"
              aria-label="Next page"
            >
              <ChevronRight className="h-5 w-5" />
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function ChargerListDemo() {
  const handleChargerSelect = (id: string) => {
    console.log(`Charger ${id} selected! Navigating to details.`)
    // In a real app, this would navigate to a detailed view
  }

  const [demoLoading, setDemoLoading] = useState(true);
  const [demoError, setDemoError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDemoLoading(false);
      // setDemoError("Failed to load chargers. Please try again later."); // Uncomment to test error state
    }, 1500); // Simulate network delay
    return () => clearTimeout(timer);
  }, []);

  return <ChargerList onChargerSelect={handleChargerSelect} isLoading={demoLoading} error={demoError} />
}