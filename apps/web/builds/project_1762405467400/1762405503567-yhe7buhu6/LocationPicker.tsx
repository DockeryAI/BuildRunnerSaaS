'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, Heart, Star, ChevronDown } from 'lucide-react'
import { debounce } from '@/lib/utils'

interface Location {
  id: string
  name: string
  description: string
  difficulty: 'Easy' | 'Moderate' | 'Hard'
  terrain: string
  imageUrl: string
  isFavorite: boolean
  rating: number
}

interface LocationPickerProps {
  onLocationSelect?: (location: Location) => void
  initialLocations?: Location[]
  defaultLocation?: Location
}

export function LocationPicker({
  onLocationSelect = () => {},
  initialLocations = DEFAULT_LOCATIONS,
  defaultLocation
}: LocationPickerProps = {}) {
  const [locations, setLocations] = useState<Location[]>(initialLocations)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(defaultLocation || null)
  const [favorites, setFavorites] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = debounce((query: string) => {
    setIsLoading(true)
    try {
      const filtered = DEFAULT_LOCATIONS.filter(location => 
        location.name.toLowerCase().includes(query.toLowerCase()) ||
        location.description.toLowerCase().includes(query.toLowerCase())
      )
      setLocations(filtered)
      setError(null)
    } catch (err) {
      setError('Failed to search locations')
    } finally {
      setIsLoading(false)
    }
  }, 300)

  const toggleFavorite = (locationId: string) => {
    setFavorites(prev => 
      prev.includes(locationId) 
        ? prev.filter(id => id !== locationId)
        : [...prev, locationId]
    )
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="w-full max-w-3xl mx-auto p-8"
    >
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground dark:text-muted-foreground" />
        <input
          type="text"
          placeholder="Search locations..."
          onChange={(e) => {
            setSearchQuery(e.target.value)
            handleSearch(e.target.value)
          }}
          className="w-full pl-12 pr-4 py-4 bg-background dark:bg-surface border border-border dark:border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary dark:focus:border-primary text-muted-foreground dark:text-foreground placeholder:text-muted-foreground dark:placeholder:text-muted-foreground transition-all duration-200"
          aria-label="Search locations"
        />
      </div>

      {error && (
        <div className="rounded-lg bg-secondary dark:bg-secondary/20 border border-secondary dark:border-secondary p-4 mb-8">
          <p className="text-sm text-secondary dark:text-secondary">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-8 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-[400px] bg-surface dark:bg-surface rounded-xl"></div>
          ))}
        </div>
      ) : locations.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-surface dark:bg-surface rounded-full mx-auto mb-4 flex items-center justify-center">
            <MapPin className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-muted-foreground dark:text-foreground mb-2">No locations found</h3>
          <p className="text-muted-foreground dark:text-muted-foreground">Try adjusting your search criteria</p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          <AnimatePresence>
            {locations.map(location => (
              <motion.div
                key={location.id}
                variants={itemVariants}
                whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                transition={{ duration: 0.3 }}
                className="bg-background dark:bg-surface border border-border dark:border-border rounded-xl overflow-hidden shadow-lg"
              >
                <div className="relative h-56">
                  <img 
                    src={location.imageUrl}
                    alt={location.name}
                    className="w-full h-full object-cover"
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleFavorite(location.id)}
                    className="absolute top-4 right-4 p-3 bg-background/90 dark:bg-surface/90 rounded-full shadow-lg hover:bg-background dark:hover:bg-surface transition-all duration-200"
                    aria-label={favorites.includes(location.id) ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Heart 
                      className={`w-5 h-5 ${favorites.includes(location.id) ? 'text-secondary fill-red-500' : 'text-muted-foreground dark:text-muted-foreground'}`}
                    />
                  </motion.button>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-muted-foreground dark:text-foreground">{location.name}</h3>
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-accent fill-yellow-400" />
                      <span className="text-sm font-medium text-muted-foreground dark:text-foreground">{location.rating}</span>
                    </div>
                  </div>

                  <p className="text-base text-muted-foreground dark:text-muted-foreground mb-6">{location.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                        location.difficulty === 'Easy' ? 'bg-primary text-primary dark:bg-primary/30 dark:text-primary' :
                        location.difficulty === 'Moderate' ? 'bg-accent text-accent dark:bg-accent/30 dark:text-accent' :
                        'bg-secondary text-secondary dark:bg-secondary/30 dark:text-secondary'
                      }`}>
                        {location.difficulty}
                      </span>
                      <span className="text-sm text-muted-foreground dark:text-muted-foreground">{location.terrain}</span>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSelectedLocation(location)
                        onLocationSelect(location)
                      }}
                      className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-foreground rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                    >
                      <MapPin className="w-4 h-4" />
                      Select
                    </motion.button>
                  </div>
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
    description: 'Challenging mountain trail with rocky terrain and stream crossings',
    difficulty: 'Hard',
    terrain: 'Rocky, Steep',
    imageUrl: '/images/trail1.jpg',
    isFavorite: false,
    rating: 4.8
  },
  {
    id: '2',
    name: 'Desert Ridge Path',
    description: 'Scenic desert trail with sand dunes and desert vegetation',
    difficulty: 'Moderate',
    terrain: 'Sandy, Rolling',
    imageUrl: '/images/trail2.jpg',
    isFavorite: false,
    rating: 4.5
  },
  {
    id: '3',
    name: 'Forest Loop',
    description: 'Gentle forest trail perfect for beginners',
    difficulty: 'Easy',
    terrain: 'Wooded, Flat',
    imageUrl: '/images/trail3.jpg',
    isFavorite: false,
    rating: 4.2
  }
]

export default function LocationPickerDemo() {
  return <LocationPicker />
}