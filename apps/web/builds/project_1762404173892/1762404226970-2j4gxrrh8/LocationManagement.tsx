'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, Heart, Star, AlertTriangle, Inbox } from 'lucide-react'

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

interface LocationManagementProps {
  initialLocations?: Location[]
  onSaveLocation?: (location: Location) => void
  onError?: (error: string) => void
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

export function LocationManagement({
  initialLocations = DEFAULT_LOCATIONS,
  onSaveLocation = () => {},
  onError = () => {}
}: LocationManagementProps) {
  const [locations, setLocations] = useState<Location[]>(initialLocations)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 500)
  }

  const toggleFavorite = (locationId: string) => {
    setLocations(prev => 
      prev.map(loc => 
        loc.id === locationId 
          ? { ...loc, isFavorite: !loc.isFavorite }
          : loc
      )
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="min-h-screen bg-background dark:bg-surface p-24"
    >
      <div className="max-w-7xl mx-auto">
        <div className="relative mb-24">
          <Search className="absolute left-16 top-1/2 -translate-y-1/2 text-muted-foreground dark:text-muted-foreground" />
          <input
            type="text"
            placeholder="Search locations..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-48 pr-16 py-16 bg-background dark:bg-surface border border-border dark:border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary dark:focus:border-primary outline-none text-muted-foreground dark:text-foreground placeholder:text-muted-foreground dark:placeholder:text-muted-foreground transition-all duration-200"
          />
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-16 p-16 bg-secondary dark:bg-secondary/20 border border-secondary dark:border-secondary rounded-lg flex items-center gap-8"
            >
              <AlertTriangle className="text-secondary dark:text-secondary" />
              <span className="text-secondary dark:text-secondary">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {filteredLocations.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-48"
          >
            <Inbox className="w-32 h-32 mx-auto mb-16 text-muted-foreground dark:text-muted-foreground" />
            <h3 className="text-lg font-medium text-muted-foreground dark:text-foreground mb-8">No locations found</h3>
            <p className="text-muted-foreground dark:text-muted-foreground">Try adjusting your search criteria</p>
          </motion.div>
        )}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-24"
        >
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <div
                key={i}
                className="h-[400px] bg-surface dark:bg-surface animate-pulse rounded-lg"
              />
            ))
          ) : (
            filteredLocations.map(location => (
              <motion.div
                key={location.id}
                variants={itemVariants}
                whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                className="bg-background dark:bg-surface border border-border dark:border-border rounded-lg overflow-hidden transition-all duration-300"
              >
                <div className="relative h-48">
                  <img
                    src={location.imageUrl}
                    alt={location.name}
                    className="w-full h-full object-cover"
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleFavorite(location.id)}
                    className="absolute top-16 right-16 p-8 bg-background/80 dark:bg-surface/80 rounded-full hover:bg-background dark:hover:bg-surface transition-all duration-200"
                    aria-label={location.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Heart
                      className={`w-20 h-20 ${
                        location.isFavorite 
                          ? 'fill-primary text-primary' 
                          : 'text-muted-foreground dark:text-muted-foreground'
                      }`}
                    />
                  </motion.button>
                </div>
                
                <div className="p-16">
                  <div className="flex items-start justify-between">
                    <h3 className="font-medium text-muted-foreground dark:text-foreground">{location.name}</h3>
                    <div className="flex items-center gap-4">
                      <Star className="w-16 h-16 text-accent fill-yellow-400" />
                      <span className="text-sm text-muted-foreground dark:text-muted-foreground">
                        {location.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  
                  <p className="mt-8 text-sm text-muted-foreground dark:text-muted-foreground">
                    {location.description}
                  </p>
                  
                  <div className="mt-16 flex items-center gap-8">
                    <span className={`px-8 py-4 text-xs rounded-full ${
                      location.difficulty === 'Easy' 
                        ? 'bg-primary dark:bg-primary/20 text-primary dark:text-primary' 
                        : location.difficulty === 'Moderate'
                        ? 'bg-accent dark:bg-accent/20 text-accent dark:text-accent'
                        : 'bg-secondary dark:bg-secondary/20 text-secondary dark:text-secondary'
                    }`}>
                      {location.difficulty}
                    </span>
                    <span className="text-xs text-muted-foreground dark:text-muted-foreground">
                      {location.terrain}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}

const DEFAULT_LOCATIONS: Location[] = [
  {
    id: '1',
    name: 'Rocky Mountain Trail',
    description: 'Challenging trail with spectacular mountain views',
    difficulty: 'Hard',
    terrain: 'Mountain',
    coordinates: { lat: 40.3428, lng: -105.6836 },
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b',
    isFavorite: false
  },
  {
    id: '2',
    name: 'Desert Canyon Route',
    description: 'Scenic desert trail through red rock canyons',
    difficulty: 'Moderate',
    terrain: 'Desert',
    coordinates: { lat: 36.8529, lng: -111.3743 },
    rating: 4.5,
    imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800',
    isFavorite: true
  }
]

export default function LocationManagementDemo() {
  return <LocationManagement />
}