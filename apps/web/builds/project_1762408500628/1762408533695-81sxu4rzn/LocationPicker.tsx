'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, Heart, Star, AlertCircle } from 'lucide-react'
import { useDebounce } from '@/lib/hooks/useDebounce'

interface Location {
  id: string
  name: string
  description: string
  difficulty: 'Easy' | 'Moderate' | 'Hard'
  terrain: string
  coordinates: {
    lat: number
    lng: number
  }
  rating: number
  imageUrl: string
  isFavorite?: boolean
}

interface LocationPickerProps {
  onLocationSelect?: (location: Location) => void
  initialLocations?: Location[]
  defaultLocation?: Location
  isLoading?: boolean
  error?: string
}

export function LocationPicker({
  onLocationSelect = () => {},
  initialLocations = DEFAULT_LOCATIONS,
  defaultLocation,
  isLoading = false,
  error
}: LocationPickerProps = {}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [locations, setLocations] = useState<Location[]>(initialLocations)
  const [favorites, setFavorites] = useState<string[]>([])
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(defaultLocation || null)

  const debouncedSearch = useDebounce(searchQuery, 300)

  useEffect(() => {
    const filtered = initialLocations.filter(location =>
      location.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      location.terrain.toLowerCase().includes(debouncedSearch.toLowerCase())
    )
    setLocations(filtered)
  }, [debouncedSearch, initialLocations])

  const toggleFavorite = (locationId: string) => {
    setFavorites(prev => 
      prev.includes(locationId) 
        ? prev.filter(id => id !== locationId)
        : [...prev, locationId]
    )
  }

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location)
    onLocationSelect(location)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto bg-background dark:bg-surface p-8 rounded-lg shadow-lg"
    >
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground dark:text-muted-foreground" />
        <input
          type="text"
          placeholder="Search locations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-background dark:bg-surface border border-border dark:border-border rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
            text-muted-foreground dark:text-foreground placeholder:text-muted-foreground dark:placeholder:text-muted-foreground
            transition-all duration-200"
          aria-label="Search locations"
        />
      </div>

      {error && (
        <div className="rounded-lg bg-secondary dark:bg-secondary/20 border border-secondary dark:border-secondary p-4 mb-8">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-secondary dark:text-secondary mr-2" />
            <p className="text-sm text-secondary dark:text-secondary">{error}</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-8 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-surface dark:bg-surface rounded-lg"></div>
          ))}
        </div>
      ) : locations.length === 0 ? (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 mx-auto mb-4 text-muted-foreground dark:text-muted-foreground" />
          <h3 className="text-lg font-medium text-muted-foreground dark:text-foreground mb-2">No locations found</h3>
          <p className="text-muted-foreground dark:text-muted-foreground">Try adjusting your search terms</p>
        </div>
      ) : (
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.1 }
            }
          }}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          <AnimatePresence>
            {locations.map(location => (
              <motion.div
                key={location.id}
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  show: { opacity: 1, x: 0 }
                }}
                whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                transition={{ duration: 0.2 }}
                className={`p-6 bg-background dark:bg-surface border border-border dark:border-border rounded-lg cursor-pointer
                  hover:border-primary dark:hover:border-primary transition-all duration-300
                  ${selectedLocation?.id === location.id ? 'ring-2 ring-primary' : ''}`}
                onClick={() => handleLocationSelect(location)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-muted-foreground dark:text-foreground text-lg">{location.name}</h3>
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-2">{location.description}</p>
                    
                    <div className="flex items-center gap-8 mt-4">
                      <span className="inline-flex items-center text-sm text-muted-foreground dark:text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-2" />
                        {location.terrain}
                      </span>
                      
                      <span className={`px-3 py-1 text-xs font-medium rounded-full
                        ${location.difficulty === 'Easy' 
                          ? 'bg-primary text-primary dark:bg-primary/20 dark:text-primary' 
                          : location.difficulty === 'Moderate'
                          ? 'bg-accent text-accent dark:bg-accent/20 dark:text-accent'
                          : 'bg-secondary text-secondary dark:bg-secondary/20 dark:text-secondary'
                        }`}>
                        {location.difficulty}
                      </span>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFavorite(location.id)
                    }}
                    className="p-2 hover:bg-surface dark:hover:bg-surface rounded-full transition-colors duration-200
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label={favorites.includes(location.id) ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        favorites.includes(location.id)
                          ? 'fill-primary stroke-primary'
                          : 'stroke-gray-400 dark:stroke-gray-500'
                      }`}
                    />
                  </motion.button>
                </div>

                <div className="flex items-center mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < location.rating
                          ? 'fill-primary stroke-primary'
                          : 'stroke-gray-300 dark:stroke-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  )
}

const DEFAULT_LOCATIONS: Location[] = [
  {
    id: '1',
    name: 'Mountain Creek Trail',
    description: 'Scenic mountain trail with challenging rock formations',
    difficulty: 'Moderate',
    terrain: 'Rocky mountain',
    coordinates: { lat: 34.0522, lng: -118.2437 },
    rating: 4,
    imageUrl: '/trails/mountain-creek.jpg'
  },
  {
    id: '2',
    name: 'Desert Ridge Route',
    description: 'Wide open desert trails with sand dunes',
    difficulty: 'Hard',
    terrain: 'Desert',
    coordinates: { lat: 36.1699, lng: -115.1398 },
    rating: 5,
    imageUrl: '/trails/desert-ridge.jpg'
  },
  {
    id: '3', 
    name: 'Forest Loop',
    description: 'Gentle forest path with stream crossings',
    difficulty: 'Easy',
    terrain: 'Forest',
    coordinates: { lat: 37.7749, lng: -122.4194 },
    rating: 3,
    imageUrl: '/trails/forest-loop.jpg'
  }
]

export default function LocationPickerDemo() {
  return <LocationPicker />
}