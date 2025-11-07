'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plug,
  MapPin,
  Star,
  Zap,
  DollarSign,
  Calendar,
  Clock,
  BatteryCharging,
  Info,
  ChevronRight,
  ChevronLeft,
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit,
} from 'lucide-react'

import { cn } from '@/lib/utils' // Assuming this utility exists for tailwind-merge or similar

interface ChargingStation {
  id: string
  name: string
  location: string
  rating: number
  reviews: number
  pricePerHour: number
  availability: {
    monday: string
    tuesday: string
    wednesday: string
    thursday: string
    friday: string
    saturday: string
    sunday: string
  }
  chargerType: 'Type 1' | 'Type 2' | 'CCS' | 'CHAdeMO'
  powerOutputKw: number
  images: string[]
  description: string
}

interface ChargingStationListingProps {
  stations?: ChargingStation[]
  onSelectStation?: (stationId: string) => void
  onEditStation?: (stationId: string) => void
  onDeleteStation?: (stationId: string) => void
  onAddStation?: () => void
  isLoading?: boolean
  error?: string | null
}

const DEFAULT_STATIONS: ChargingStation[] = [
  {
    id: 'cs-101',
    name: 'Urban Oasis Charger',
    location: '123 Main St, Anytown, CA',
    rating: 4.8,
    reviews: 124,
    pricePerHour: 5.5,
    availability: {
      monday: '6:00 PM - 6:00 AM',
      tuesday: '6:00 PM - 6:00 AM',
      wednesday: '6:00 PM - 6:00 AM',
      thursday: '6:00 PM - 6:00 AM',
      friday: '7:00 PM - 7:00 AM',
      saturday: 'All Day',
      sunday: 'All Day',
    },
    chargerType: 'Type 2',
    powerOutputKw: 7.2,
    images: [
      'https://images.unsplash.com/photo-1621996384260-b9643831899a?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      'https://images.unsplash.com/photo-1631548651717-3843a850438a?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      'https://images.unsplash.com/photo-1621996384260-b9643831899a?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    ],
    description:
      'Convenient Type 2 charger located in a quiet residential area. Perfect for overnight charging. Enjoy a peaceful stay while your EV powers up.',
  },
  {
    id: 'cs-102',
    name: 'Eco-Friendly Fast Charge',
    location: '456 Oak Ave, Metropolis, CA',
    rating: 4.5,
    reviews: 88,
    pricePerHour: 7.0,
    availability: {
      monday: '7:00 PM - 5:00 AM',
      tuesday: '7:00 PM - 5:00 AM',
      wednesday: '7:00 PM - 5:00 AM',
      thursday: '7:00 PM - 5:00 AM',
      friday: '8:00 PM - 6:00 AM',
      saturday: '10:00 AM - 10:00 PM',
      sunday: '10:00 AM - 10:00 PM',
    },
    chargerType: 'CCS',
    powerOutputKw: 50,
    images: [
      'https://images.unsplash.com/photo-1631548651717-3843a850438a?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      'https://images.unsplash.com/photo-1621996384260-b9643831899a?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    ],
    description:
      'High-speed CCS charger available in a well-lit, secure location. Get a quick boost for your journey. Solar-powered for a greener charge!',
  },
  {
    id: 'cs-103',
    name: 'Riverside Retreat Charger',
    location: '789 River Rd, Green Valley, CA',
    rating: 4.9,
    reviews: 201,
    pricePerHour: 4.0,
    availability: {
      monday: 'All Day',
      tuesday: 'All Day',
      wednesday: 'All Day',
      thursday: 'All Day',
      friday: 'All Day',
      saturday: 'All Day',
      sunday: 'All Day',
    },
    chargerType: 'CHAdeMO',
    powerOutputKw: 25,
    images: [
      'https://images.unsplash.com/photo-1621996384260-b9643831899a?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    ],
    description:
      'Enjoy a scenic view by the river while your car charges. CHAdeMO compatible, perfect for a relaxed charging experience. Available 24/7.',
  },
]

export function ChargingStationListing({
  stations = DEFAULT_STATIONS,
  onSelectStation = () => console.log('Station selected'),
  onEditStation = () => console.log('Edit station'),
  onDeleteStation = () => console.log('Delete station'),
  onAddStation = () => console.log('Add new station'),
  isLoading = false,
  error = null,
}: ChargingStationListingProps = {}) {
  const [currentImageIndex, setCurrentImageIndex] = useState<{
    [key: string]: number
  }>({})

  useEffect(() => {
    // Initialize currentImageIndex for all stations
    const initialIndices: { [key: string]: number } = {}
    stations.forEach((station) => {
      initialIndices[station.id] = 0
    })
    setCurrentImageIndex(initialIndices)
  }, [stations])

  const goToNextImage = (stationId: string, totalImages: number) => {
    setCurrentImageIndex((prev) => ({
      ...prev,
      [stationId]: (prev[stationId] + 1) % totalImages,
    }))
  }

  const goToPrevImage = (stationId: string, totalImages: number) => {
    setCurrentImageIndex((prev) => ({
      ...prev,
      [stationId]:
        ((prev[stationId] - 1 + totalImages) % totalImages),
    }))
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0 },
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const primaryColor = '#3B82F6' // primary
  const backgroundColor = '#FFFFFF' // background
  const borderColor = '#E5E7EB' // border
  const foregroundColor = '#1F2937' // text-foreground (dark gray)
  const mutedForeground = '#6B7280' // text-muted-foreground (medium gray)
  const surfaceColor = '#F9FAFB' // bg-surface (light gray)
  const destructiveColor = '#EF4444' // bg-destructive (red)
  const accentColor = '#FBBF24' // text-accent (yellow for stars)

  // Dark mode variants
  const darkBackgroundColor = '#1F2937'
  const darkForegroundColor = '#F9FAFB'
  const darkMutedForeground = '#9CA3AF'
  const darkSurfaceColor = '#374151'
  const darkBorderColor = '#4B5563'
  const darkDestructiveColor = '#DC2626'

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className={cn(
        'min-h-screen font-sans',
        'bg-background text-muted-foreground', // Light mode defaults
        'dark:bg-surface dark:text-muted-foreground' // Dark mode
      )}
      style={{
        '--primary': primaryColor,
        '--background': backgroundColor,
        '--border': borderColor,
        '--foreground': foregroundColor,
        '--muted-foreground': mutedForeground,
        '--surface': surfaceColor,
        '--destructive': destructiveColor,
        '--accent': accentColor,
        '--dark-background': darkBackgroundColor,
        '--dark-foreground': darkForegroundColor,
        '--dark-muted-foreground': darkMutedForeground,
        '--dark-surface': darkSurfaceColor,
        '--dark-border': darkBorderColor,
        '--dark-destructive': darkDestructiveColor,
      } as React.CSSProperties}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground dark:text-dark-foreground">
            Your Charging Stations
          </h1>
          <motion.button
            onClick={onAddStation}
            className={cn(
              'inline-flex items-center justify-center px-4 py-2 rounded-lg shadow-md font-medium text-sm',
              'bg-primary text-foreground hover:bg-primary/90', // Light mode
              'dark:bg-primary dark:text-foreground dark:hover:bg-primary/80', // Dark mode
              'transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50'
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            aria-label="Add new charging station"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Station
          </motion.button>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive dark:bg-destructive/20 border border-destructive dark:border-destructive p-4">
            <p className="text-sm text-destructive dark:text-destructive">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="bg-surface dark:bg-dark-surface border border-border dark:border-dark-border rounded-xl shadow-sm overflow-hidden flex flex-col animate-pulse"
              >
                <div className="h-48 w-full bg-surface dark:bg-surface"></div>
                <div className="p-4 flex flex-col flex-grow">
                  <div className="h-6 bg-surface dark:bg-surface rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-surface dark:bg-surface rounded w-1/2 mb-4"></div>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="h-4 bg-surface dark:bg-surface rounded"></div>
                    <div className="h-4 bg-surface dark:bg-surface rounded"></div>
                    <div className="h-4 bg-surface dark:bg-surface rounded"></div>
                    <div className="h-4 bg-surface dark:bg-surface rounded"></div>
                  </div>
                  <div className="h-16 bg-surface dark:bg-surface rounded mb-4"></div>
                  <div className="mt-auto flex justify-end space-x-2 pt-4 border-t border-border dark:border-dark-border">
                    <div className="h-8 w-20 bg-surface dark:bg-surface rounded-md"></div>
                    <div className="h-8 w-20 bg-surface dark:bg-surface rounded-md"></div>
                    <div className="h-8 w-24 bg-surface dark:bg-surface rounded-md"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : stations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground dark:text-dark-muted-foreground"
          >
            <Zap className="h-16 w-16 mb-4 text-muted-foreground dark:text-dark-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2 text-foreground dark:text-dark-foreground">No Charging Stations Listed Yet</h2>
            <p className="max-w-md mb-6">
              It looks like you haven't added any charging stations. Click the "Add Station" button to get started and earn some extra income!
            </p>
            <motion.button
              onClick={onAddStation}
              className={cn(
                'inline-flex items-center justify-center px-6 py-3 rounded-lg shadow-md font-medium text-base',
                'bg-primary text-foreground hover:bg-primary/90', // Light mode
                'dark:bg-primary dark:text-foreground dark:hover:bg-primary/80', // Dark mode
                'transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50'
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-label="Add your first charging station"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Your First Station
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {stations.map((station) => (
                <motion.div
                  key={station.id}
                  variants={itemVariants}
                  layout
                  className={cn(
                    'bg-background border rounded-xl shadow-sm overflow-hidden flex flex-col',
                    'border-border', // Light mode
                    'dark:bg-surface dark:border-border', // Dark mode
                  )}
                  whileHover={{ y: -4, boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)' }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="relative h-48 w-full bg-surface dark:bg-surface flex items-center justify-center">
                    {station.images && station.images.length > 0 ? (
                      <>
                        <img
                          src={
                            station.images[currentImageIndex[station.id] || 0]
                          }
                          alt={`Image of ${station.name}`}
                          className="w-full h-full object-cover"
                        />
                        {station.images.length > 1 && (
                          <>
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation()
                                goToPrevImage(station.id, station.images.length)
                              }}
                              className={cn(
                                'absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full',
                                'bg-background/50 text-foreground',
                                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50'
                              )}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              aria-label="Previous image"
                            >
                              <ChevronLeft className="h-5 w-5" />
                            </motion.button>
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation()
                                goToNextImage(station.id, station.images.length)
                              }}
                              className={cn(
                                'absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full',
                                'bg-background/50 text-foreground',
                                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50'
                              )}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              aria-label="Next image"
                            >
                              <ChevronRight className="h-5 w-5" />
                            </motion.button>
                          </>
                        )}
                        <div className="absolute bottom-2 right-2 flex space-x-1">
                          {station.images.map((_, idx) => (
                            <span
                              key={idx}
                              className={cn(
                                'h-1.5 w-1.5 rounded-full bg-background',
                                (currentImageIndex[station.id] || 0) === idx
                                  ? 'opacity-100'
                                  : 'opacity-50'
                              )}
                            />
                          ))}
                        </div>
                      </>
                    ) : (
                      <ImageIcon className="h-12 w-12 text-muted-foreground dark:text-muted-foreground" />
                    )}
                  </div>

                  <div className="p-4 flex flex-col flex-grow">
                    <h2 className="text-lg font-semibold mb-1 text-foreground dark:text-dark-foreground">
                      {station.name}
                    </h2>
                    <p className="text-sm flex items-center mb-2 text-muted-foreground dark:text-dark-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      {station.location}
                    </p>

                    <div className="flex items-center text-sm text-muted-foreground dark:text-dark-muted-foreground mb-3">
                      <Star className="h-4 w-4 mr-1 text-accent" />
                      <span>{station.rating.toFixed(1)}</span>
                      <span className="ml-1">({station.reviews} reviews)</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                      <div className="flex items-center text-muted-foreground dark:text-dark-muted-foreground">
                        <Plug className="h-4 w-4 mr-2 text-primary" />
                        <span>{station.chargerType}</span>
                      </div>
                      <div className="flex items-center text-muted-foreground dark:text-dark-muted-foreground">
                        <BatteryCharging className="h-4 w-4 mr-2 text-primary" />
                        <span>{station.powerOutputKw} kW</span>
                      </div>
                      <div className="flex items-center text-muted-foreground dark:text-dark-muted-foreground">
                        <DollarSign className="h-4 w-4 mr-2 text-primary" />
                        <span>${station.pricePerHour.toFixed(2)}/hr</span>
                      </div>
                      <div className="flex items-center text-muted-foreground dark:text-dark-muted-foreground">
                        <Clock className="h-4 w-4 mr-2 text-primary" />
                        <span>Flexible hours</span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground dark:text-dark-muted-foreground mb-4 line-clamp-2">
                      {station.description}
                    </p>

                    <div className="mt-auto flex justify-end space-x-2 pt-4 border-t border-border dark:border-border">
                      <motion.button
                        onClick={() => onEditStation(station.id)}
                        className={cn(
                          'inline-flex items-center justify-center px-3 py-1.5 rounded-md text-sm font-medium',
                          'bg-surface text-muted-foreground hover:bg-surface', // Light mode
                          'dark:bg-surface dark:text-muted-foreground dark:hover:bg-surface', // Dark mode
                          'transition-colors duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50'
                        )}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        aria-label={`Edit ${station.name}`}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </motion.button>
                      <motion.button
                        onClick={() => onDeleteStation(station.id)}
                        className={cn(
                          'inline-flex items-center justify-center px-3 py-1.5 rounded-md text-sm font-medium',
                          'bg-destructive text-foreground hover:bg-destructive/90', // Light mode
                          'dark:bg-dark-destructive dark:text-foreground dark:hover:bg-dark-destructive/90', // Dark mode
                          'transition-colors duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50'
                        )}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        aria-label={`Delete ${station.name}`}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </motion.button>
                      <motion.button
                        onClick={() => onSelectStation(station.id)}
                        className={cn(
                          'inline-flex items-center justify-center px-3 py-1.5 rounded-md text-sm font-medium',
                          'bg-primary text-foreground hover:bg-primary/90', // Light mode
                          'dark:bg-primary dark:text-foreground dark:hover:bg-primary/80', // Dark mode
                          'transition-colors duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50'
                        )}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        aria-label={`View details for ${station.name}`}
                      >
                        View Details
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function ChargingStationListingDemo() {
  return <ChargingStationListing />
}