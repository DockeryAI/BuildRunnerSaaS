'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, Heart, Star, ChevronDown, AlertCircle } from 'lucide-react'
import debounce from 'lodash/debounce'

interface Location {
  id: string
  name: string
  description: string
  difficulty: 'Easy' | 'Moderate' | 'Hard'
  terrain: string[]
  rating: number
  imageUrl: string
  isFavorite: boolean
}

interface LocationSelectorProps {
  onLocationSelect?: (location: Location) => void
  initialLocations?: Location[]
  defaultLocation?: Location
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

export function LocationSelector({
  onLocationSelect = () => {},
  initialLocations = DEFAULT_LOCATIONS,
  defaultLocation
}: LocationSelectorProps = {}) {
  const [locations, setLocations] = useState<Location[]>(initialLocations)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(defaultLocation || null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      try {
        setIsLoading(true)
        setError(null)
        const filtered = initialLocations.filter(location =>
          location.name.toLowerCase().includes(query.toLowerCase())
        )
        setLocations(filtered)
      } catch (err) {
        setError('Failed to search locations')
      } finally {
        setIsLoading(false)
      }
    }, 300),
    [initialLocations]
  )

  useEffect(() => {
    debouncedSearch(searchQuery)
  }, [searchQuery, debouncedSearch])

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location)
    onLocationSelect(location)
    setIsExpanded(false)
  }

  const toggleFavorite = (locationId: string) => {
    setLocations(prev =>
      prev.map(loc =>
        loc.id === locationId ? { ...loc, isFavorite: !loc.isFavorite } : loc
      )
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto bg-surface-light dark:bg-surface-dark rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
    >
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-mutedForeground" size={20} />
          <input
            type="text"
            placeholder="Search locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-muted dark:bg-surface-dark rounded-md text-foreground-light dark:text-foreground-dark placeholder-mutedForeground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            aria-label="Search locations"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border-l-4 border-destructive">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-destructive mr-2" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {isLoading ? (
          <div className="p-4 space-y-4">
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-muted rounded-md" />
              ))}
            </div>
          </div>
        ) : locations.length === 0 ? (
          <div className="p-8 text-center">
            <MapPin className="w-12 h-12 text-mutedForeground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground-light dark:text-foreground-dark mb-2">
              No locations found
            </h3>
            <p className="text-sm text-mutedForeground">
              Try adjusting your search terms
            </p>
          </div>
        ) : selectedLocation && !isExpanded ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => setIsExpanded(true)}
          >
            <div className="flex items-center gap-3">
              <MapPin className="text-primary" size={20} />
              <span className="font-medium text-foreground-light dark:text-foreground-dark">
                {selectedLocation.name}
              </span>
            </div>
            <ChevronDown className="text-primary" size={20} />
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="max-h-96 overflow-y-auto"
          >
            {locations.map(location => (
              <motion.div
                key={location.id}
                variants={itemVariants}
                className="p-4 border-b border-border hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => handleLocationSelect(location)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground-light dark:text-foreground-dark">
                      {location.name}
                    </h3>
                    <p className="text-sm text-mutedForeground mt-1">
                      {location.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-1 text-xs font-medium bg-muted rounded-full">
                        {location.difficulty}
                      </span>
                      <div className="flex items-center">
                        <Star className="text-accent" size={16} />
                        <span className="ml-1 text-sm">{location.rating}</span>
                      </div>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFavorite(location.id)
                    }}
                    className="ml-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-full p-1"
                    aria-label={location.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Heart
                      className={location.isFavorite ? 'fill-accent text-accent' : 'text-mutedForeground'}
                      size={20}
                    />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const DEFAULT_LOCATIONS: Location[] = [
  {
    id: '1',
    name: 'Moab Desert Trail',
    description: 'Challenging desert terrain with stunning red rock formations',
    difficulty: 'Hard',
    terrain: ['Desert', 'Rock', 'Sand'],
    rating: 4.8,
    imageUrl: '/locations/moab.jpg',
    isFavorite: false
  },
  {
    id: '2',
    name: 'Mountain Creek Pass',
    description: 'Scenic mountain trail with creek crossings',
    difficulty: 'Moderate',
    terrain: ['Mountain', 'Forest', 'Water'],
    rating: 4.5,
    imageUrl: '/locations/mountain-creek.jpg',
    isFavorite: false
  },
  {
    id: '3',
    name: 'Pine Forest Loop',
    description: 'Easy forest trail perfect for beginners',
    difficulty: 'Easy',
    terrain: ['Forest', 'Dirt'],
    rating: 4.2,
    imageUrl: '/locations/pine-forest.jpg',
    isFavorite: false
  }
]

export default function LocationSelectorDemo() {
  return <LocationSelector />
}