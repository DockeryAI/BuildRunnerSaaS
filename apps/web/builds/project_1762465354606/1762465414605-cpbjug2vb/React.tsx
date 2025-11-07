'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin,
  BatteryCharging,
  Star,
  DollarSign,
  Calendar,
  Clock,
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Zap,
  Gauge,
} from 'lucide-react'

// Helper for conditional class names
import { cn } from '@/lib/utils'

interface ChargingStation {
  id: string
  name: string
  location: string
  rating: number
  pricePerHour: number
  availability: {
    startDate: string
    endDate: string
    startTime: string
    endTime: string
  }
  chargerType: 'Type 1' | 'Type 2' | 'CCS' | 'CHAdeMO'
  powerOutputKw: number
  amenities: string[]
  imageUrl: string
  isAvailable: boolean
}

interface ChargingStationListProps {
  stations?: ChargingStation[]
  onStationSelect?: (stationId: string) => void
  isLoading?: boolean
  error?: string | null
}

interface FilterOptions {
  chargerType: string[]
  minPowerOutput: number
  maxPrice: number
  amenities: string[]
}

const DEFAULT_STATIONS: ChargingStation[] = [
  {
    id: '1',
    name: 'EcoCharge Hub',
    location: '123 Green St, Metropolis',
    rating: 4.8,
    pricePerHour: 5.50,
    availability: {
      startDate: '2023-10-26',
      endDate: '2023-11-30',
      startTime: '08:00',
      endTime: '22:00',
    },
    chargerType: 'Type 2',
    powerOutputKw: 22,
    amenities: ['Wi-Fi', 'Restroom', 'Coffee'],
    imageUrl: 'https://images.unsplash.com/photo-1621939572421-2a0d0d0d0d0d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjVlMjJ8MHwxfHNlYXJjaHwxfHxldl9jaGFyZ2luZ19zdGF0aW9ufGVufDB8fHx8MTY3ODg4ODg4OHw&ixlib=rb-4.0.3&q=80&w=400',
    isAvailable: true,
  },
  {
    id: '2',
    name: 'Urban Power Point',
    location: '456 City Ave, Metropolis',
    rating: 4.5,
    pricePerHour: 6.00,
    availability: {
      startDate: '2023-10-27',
      endDate: '2023-12-15',
      startTime: '07:00',
      endTime: '23:00',
    },
    chargerType: 'CCS',
    powerOutputKw: 50,
    amenities: ['Restroom', 'Snacks'],
    imageUrl: 'https://images.unsplash.com/photo-1621939572421-2a0d0d0d0d0d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjVlMjJ8MHwxfHNlYXJjaHwxfHxldl9jaGFyZ2luZ19zdGF0aW9uXzJ8ZW58MHx8fHwxNjc4ODg4ODg4OHw&ixlib=rb-4.0.3&q=80&w=400',
    isAvailable: true,
  },
  {
    id: '3',
    name: 'Home Charge Spot',
    location: '789 Quiet Ln, Suburbia',
    rating: 4.9,
    pricePerHour: 4.00,
    availability: {
      startDate: '2023-10-25',
      endDate: '2023-11-20',
      startTime: '18:00',
      endTime: '06:00',
    },
    chargerType: 'Type 1',
    powerOutputKw: 7,
    amenities: ['Garden', 'Pet-friendly'],
    imageUrl: 'https://images.unsplash.com/photo-1621939572421-2a0d0d0d0d0d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjVlMjJ8MHwxfHNlYXJjaHwxfHxldl9jaGFyZ2luZ19zdGF0aW9uXzN8ZW58MHx8fHwxNjc4ODg4ODg4OHw&ixlib=rb-4.0.3&q=80&w=400',
    isAvailable: false,
  },
  {
    id: '4',
    name: 'Highway Fast Charge',
    location: '101 Interstate Rd, Outskirts',
    rating: 4.2,
    pricePerHour: 7.50,
    availability: {
      startDate: '2023-10-28',
      endDate: '2023-12-31',
      startTime: '00:00',
      endTime: '23:59',
    },
    chargerType: 'CHAdeMO',
    powerOutputKw: 100,
    amenities: ['Food Court', 'Shopping'],
    imageUrl: 'https://images.unsplash.com/photo-1621939572421-2a0d0d0d0d0d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjVlMjJ8MHwxfHNlYXJjaHwxfHxldl9jaGFyZ2luZ19zdGF0aW9uXzR8ZW58MHx8fHwxNjc4ODg4ODg4OHw&ixlib=rb-4.0.3&q=80&w=400',
    isAvailable: true,
  },
]

const ALL_CHARGER_TYPES = ['Type 1', 'Type 2', 'CCS', 'CHAdeMO']
const ALL_AMENITIES = ['Wi-Fi', 'Restroom', 'Coffee', 'Snacks', 'Garden', 'Pet-friendly', 'Food Court', 'Shopping']

export function ChargingStationList({
  stations = DEFAULT_STATIONS,
  onStationSelect = () => { },
  isLoading = false,
  error = null,
}: ChargingStationListProps = {}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>({
    chargerType: [],
    minPowerOutput: 0,
    maxPrice: 100,
    amenities: [],
  })

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleFilterChange = (
    type: keyof FilterOptions,
    value: string | number | boolean,
    isChecked?: boolean
  ) => {
    setFilters((prevFilters) => {
      if (type === 'chargerType' || type === 'amenities') {
        const currentArray = prevFilters[type] as string[]
        if (isChecked) {
          return { ...prevFilters, [type]: [...currentArray, value as string] }
        } else {
          return { ...prevFilters, [type]: currentArray.filter((item) => item !== value) }
        }
      }
      return { ...prevFilters, [type]: value }
    })
  }

  const resetFilters = () => {
    setFilters({
      chargerType: [],
      minPowerOutput: 0,
      maxPrice: 100,
      amenities: [],
    })
  }

  const filteredStations = useMemo(() => {
    return stations.filter((station) => {
      const matchesSearch =
        station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        station.location.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesChargerType =
        filters.chargerType.length === 0 || filters.chargerType.includes(station.chargerType)

      const matchesPowerOutput = station.powerOutputKw >= filters.minPowerOutput

      const matchesPrice = station.pricePerHour <= filters.maxPrice

      const matchesAmenities =
        filters.amenities.length === 0 ||
        filters.amenities.every((amenity) => station.amenities.includes(amenity))

      return (
        matchesSearch &&
        matchesChargerType &&
        matchesPowerOutput &&
        matchesPrice &&
        matchesAmenities
      )
    })
  }, [stations, searchTerm, filters])

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center justify-center min-h-[300px] p-6 bg-background dark:bg-surface rounded-lg shadow-md text-destructive dark:text-destructive border border-destructive dark:border-destructive"
      >
        <X className="h-12 w-12 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Error Loading Stations</h3>
        <p className="text-center text-muted-foreground dark:text-muted-foreground">{error}</p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-6 px-5 py-2.5 bg-[#3B82F6] text-foreground rounded-lg hover:bg-[#3B82F6]/90 transition-colors duration-150 font-medium text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50 focus-visible:ring-offset-2"
          onClick={() => window.location.reload()}
          aria-label="Retry loading stations"
        >
          Retry
        </motion.button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="min-h-screen bg-background dark:bg-surface font-sans text-muted-foreground dark:text-foreground"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6 text-muted-foreground dark:text-foreground">Available Charging Stations</h1>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground dark:text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or location..."
              className="w-full pl-10 pr-4 py-2.5 bg-surface dark:bg-surface border border-[#E5E7EB] dark:border-border rounded-lg text-muted-foreground dark:text-foreground placeholder-gray-500 dark:placeholder-gray-400 focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]/50 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50 focus-visible:ring-offset-2"
              value={searchTerm}
              onChange={handleSearchChange}
              aria-label="Search charging stations"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-surface dark:bg-surface text-muted-foreground dark:text-foreground rounded-lg hover:bg-surface dark:hover:bg-surface transition-colors duration-150 font-medium text-sm border border-[#E5E7EB] dark:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50 focus-visible:ring-offset-2"
            onClick={() => setShowFilters(!showFilters)}
            aria-expanded={showFilters}
            aria-controls="filter-panel"
            aria-label={showFilters ? 'Hide filters' : 'Show filters'}
          >
            <Filter className="h-5 w-5" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
            {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </motion.button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              id="filter-panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="bg-surface dark:bg-surface p-6 rounded-lg mb-6 border border-[#E5E7EB] dark:border-border overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold text-lg mb-3 text-muted-foreground dark:text-foreground">Charger Type</h4>
                  <div className="flex flex-wrap gap-2">
                    {ALL_CHARGER_TYPES.map((type) => (
                      <motion.label
                        key={type}
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center gap-2 cursor-pointer px-3 py-1.5 bg-background dark:bg-surface rounded-full border border-[#E5E7EB] dark:border-border text-sm text-muted-foreground dark:text-foreground has-[:checked]:bg-[#3B82F6] has-[:checked]:text-foreground transition-colors duration-150 focus-within:ring-2 focus-within:ring-[#3B82F6]/50 focus-within:ring-offset-2"
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          value={type}
                          checked={filters.chargerType.includes(type)}
                          onChange={(e) =>
                            handleFilterChange('chargerType', type, e.target.checked)
                          }
                          aria-label={`Filter by charger type: ${type}`}
                        />
                        {type}
                      </motion.label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-lg mb-3 text-muted-foreground dark:text-foreground">Power Output (kW)</h4>
                  <input
                    type="range"
                    min="0"
                    max="150"
                    step="5"
                    value={filters.minPowerOutput}
                    onChange={(e) =>
                      handleFilterChange('minPowerOutput', parseInt(e.target.value))
                    }
                    className="w-full h-2 bg-[#E5E7EB] dark:bg-surface rounded-lg appearance-none cursor-pointer accent-[#3B82F6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50 focus-visible:ring-offset-2"
                    aria-label={`Minimum power output: ${filters.minPowerOutput} kW`}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground dark:text-muted-foreground mt-2">
                    <span>0 kW</span>
                    <span>{filters.minPowerOutput} kW</span>
                    <span>150 kW+</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-lg mb-3 text-muted-foreground dark:text-foreground">Max Price ($/hr)</h4>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="0.5"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', parseFloat(e.target.value))}
                    className="w-full h-2 bg-[#E5E7EB] dark:bg-surface rounded-lg appearance-none cursor-pointer accent-[#3B82F6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50 focus-visible:ring-offset-2"
                    aria-label={`Maximum price per hour: $${filters.maxPrice}`}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground dark:text-muted-foreground mt-2">
                    <span>$0</span>
                    <span>${filters.maxPrice.toFixed(2)}</span>
                    <span>$20+</span>
                  </div>
                </div>

                <div className="md:col-span-2 lg:col-span-3">
                  <h4 className="font-semibold text-lg mb-3 text-muted-foreground dark:text-foreground">Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {ALL_AMENITIES.map((amenity) => (
                      <motion.label
                        key={amenity}
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center gap-2 cursor-pointer px-3 py-1.5 bg-background dark:bg-surface rounded-full border border-[#E5E7EB] dark:border-border text-sm text-muted-foreground dark:text-foreground has-[:checked]:bg-[#3B82F6] has-[:checked]:text-foreground transition-colors duration-150 focus-within:ring-2 focus-within:ring-[#3B82F6]/50 focus-within:ring-offset-2"
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          value={amenity}
                          checked={filters.amenities.includes(amenity)}
                          onChange={(e) =>
                            handleFilterChange('amenities', amenity, e.target.checked)
                          }
                          aria-label={`Filter by amenity: ${amenity}`}
                        />
                        {amenity}
                      </motion.label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-2.5 bg-surface dark:bg-surface text-muted-foreground dark:text-foreground rounded-lg hover:bg-surface dark:hover:bg-surface transition-colors duration-150 font-medium text-sm border border-[#E5E7EB] dark:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50 focus-visible:ring-offset-2"
                  onClick={resetFilters}
                  aria-label="Reset all filters"
                >
                  Reset Filters
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-2.5 bg-[#3B82F6] text-foreground rounded-lg hover:bg-[#3B82F6]/90 transition-colors duration-150 font-medium text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50 focus-visible:ring-offset-2"
                  onClick={() => setShowFilters(false)}
                  aria-label="Apply filters"
                >
                  Apply Filters
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <motion.div
            initial="hidden"
            animate="show"
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            aria-label="Loading charging stations"
          >
            {Array.from({ length: 3 }).map((_, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-background dark:bg-surface rounded-xl p-6 shadow-sm border border-[#E5E7EB] dark:border-border animate-pulse"
              >
                <div className="h-40 bg-surface dark:bg-surface rounded-lg mb-4"></div>
                <div className="h-6 bg-surface dark:bg-surface rounded-md w-3/4 mb-2"></div>
                <div className="h-4 bg-surface dark:bg-surface rounded-md w-1/2 mb-4"></div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-4 w-4 bg-surface dark:bg-surface rounded-full"></div>
                  <div className="h-4 bg-surface dark:bg-surface rounded-md w-1/4"></div>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-4 w-4 bg-surface dark:bg-surface rounded-full"></div>
                  <div className="h-4 bg-surface dark:bg-surface rounded-md w-1/3"></div>
                </div>
                <div className="h-10 bg-surface dark:bg-surface rounded-lg w-full"></div>
              </motion.div>
            ))}
          </motion.div>
        ) : filteredStations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center min-h-[300px] p-6 bg-background dark:bg-surface rounded-lg shadow-md border border-[#E5E7EB] dark:border-border"
          >
            <Zap className="h-12 w-12 text-muted-foreground dark:text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-muted-foreground dark:text-foreground">No Stations Found</h3>
            <p className="text-center text-muted-foreground dark:text-muted-foreground">
              Adjust your search or filters to find available charging stations.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-6 px-5 py-2.5 bg-surface dark:bg-surface text-muted-foreground dark:text-foreground rounded-lg hover:bg-surface dark:hover:bg-surface transition-colors duration-150 font-medium text-sm border border-[#E5E7EB] dark:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50 focus-visible:ring-offset-2"
              onClick={resetFilters}
              aria-label="Clear all filters"
            >
              Clear Filters
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredStations.map((station) => (
              <motion.div
                key={station.id}
                variants={itemVariants}
                whileHover={{ y: -4, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'bg-background dark:bg-surface rounded-xl p-6 shadow-sm border border-[#E5E7EB] dark:border-border flex flex-col',
                  !station.isAvailable && 'opacity-60 grayscale'
                )}
                role="listitem"
                aria-labelledby={`station-name-${station.id}`}
                aria-describedby={`station-location-${station.id}`}
              >
                <div className="relative h-40 w-full mb-4 rounded-lg overflow-hidden">
                  <img
                    src={station.imageUrl}
                    alt={`Image of ${station.name}`}
                    className="object-cover w-full h-full"
                  />
                  {!station.isAvailable && (
                    <div className="absolute inset-0 bg-surface/50 dark:bg-surface/70 flex items-center justify-center">
                      <span className="text-foreground font-bold text-lg">Unavailable</span>
                    </div>
                  )}
                </div>
                <h3 id={`station-name-${station.id}`} className="text-xl font-semibold mb-2 text-muted-foreground dark:text-foreground">
                  {station.name}
                </h3>
                <p id={`station-location-${station.id}`} className="flex items-center text-muted-foreground dark:text-muted-foreground mb-2 text-sm">
                  <MapPin className="h-4 w-4 mr-2" />
                  {station.location}
                </p>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center text-accent text-sm">
                    <Star className="h-4 w-4 mr-1 fill-yellow-500 stroke-yellow-500" />
                    <span>{station.rating.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground dark:text-foreground text-lg font-bold">
                    <DollarSign className="h-5 w-5" />
                    <span>{station.pricePerHour.toFixed(2)}/hr</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm text-muted-foreground dark:text-muted-foreground mb-4">
                  <div className="flex items-center">
                    <BatteryCharging className="h-4 w-4 mr-2 text-[#3B82F6]" />
                    <span>{station.chargerType}</span>
                  </div>
                  <div className="flex items-center">
                    <Gauge className="h-4 w-4 mr-2 text-[#3B82F6]" />
                    <span>{station.powerOutputKw} kW</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-[#3B82F6]" />
                    <span>{station.availability.startDate} - {station.availability.endDate}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-[#3B82F6]" />
                    <span>{station.availability.startTime} - {station.availability.endTime}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {station.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="px-3 py-1 bg-surface dark:bg-surface text-muted-foreground dark:text-muted-foreground rounded-full text-xs font-medium border border-[#E5E7EB] dark:border-border"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-auto w-full px-5 py-2.5 bg-[#3B82F6] text-foreground rounded-lg hover:bg-[#3B82F6]/90 transition-colors duration-150 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50 focus-visible:ring-offset-2"
                  onClick={() => onStationSelect(station.id)}
                  disabled={!station.isAvailable}
                  aria-label={`View details for ${station.name}`}
                >
                  {station.isAvailable ? 'View Details' : 'Unavailable'}
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

export default function ChargingStationListDemo() {
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null)
  const [demoLoading, setDemoLoading] = useState(true)
  const [demoError, setDemoError] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDemoLoading(false)
      // setDemoError("Failed to fetch stations. Please check your internet connection.") // Uncomment to test error state
    }, 1500) // Simulate network request

    return () => clearTimeout(timer)
  }, [])

  const handleStationSelect = (id: string) => {
    setSelectedStationId(id)
    alert(`Selected station: ${id}`)
  }

  return (
    <div className="bg-background dark:bg-surface min-h-screen font-sans">
      <ChargingStationList
        onStationSelect={handleStationSelect}
        isLoading={demoLoading}
        error={demoError}
      />
      {selectedStationId && (
        <div className="fixed bottom-4 right-4 bg-[#3B82F6] text-foreground p-3 rounded-lg shadow-lg text-sm">
          Selected Station ID: {selectedStationId}
        </div>
      )}
    </div>
  )
}