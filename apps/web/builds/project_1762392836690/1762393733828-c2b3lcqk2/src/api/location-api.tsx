'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, Heart, AlertCircle } from 'lucide-react'
import debounce from 'lodash/debounce'

interface Location {
  id: string
  name: string
  coordinates: {
    lat: number
    lng: number
  }
  difficulty: 'easy' | 'moderate' | 'hard'
  terrain: string[]
  description: string
  imageUrl?: string
}

interface LocationAPIProps {
  onLocationSelect?: (location: Location) => void
  initialLocations?: Location[]
  favorites?: string[]
  onToggleFavorite?: (locationId: string) => void
}

const DEFAULT_LOCATIONS: Location[] = [
  {
    id: '1',
    name: 'Moab Rock Crawling Trail',
    coordinates: {
      lat: 38.5733,
      lng: -109.5498
    },
    difficulty: 'hard',
    terrain: ['rocks', 'desert', 'canyons'],
    description: 'Famous rock crawling trails through red rock canyons',
    imageUrl: '/images/moab.jpg'
  },
  {
    id: '2',
    name: 'Rubicon Trail',
    coordinates: {
      lat: 38.9799,
      lng: -120.1386
    },
    difficulty: 'hard',
    terrain: ['mountain', 'forest', 'rocks'],
    description: 'Historic 22-mile trail through the Sierra Nevada',
    imageUrl: '/images/rubicon.jpg'
  }
]

export function LocationAPI({
  onLocationSelect = () => {},
  initialLocations = DEFAULT_LOCATIONS,
  favorites = [],
  onToggleFavorite = () => {}
}: LocationAPIProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [locations, setLocations] = useState<Location[]>(initialLocations)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const debouncedSearch = debounce(async (term: string) => {
    if (!term) {
      setLocations(initialLocations)
      return
    }

    setLoading(true)
    setError('')

    try {
      const filtered = initialLocations.filter(loc => 
        loc.name.toLowerCase().includes(term.toLowerCase()) ||
        loc.terrain.some(t => t.toLowerCase().includes(term.toLowerCase()))
      )
      setLocations(filtered)
    } catch (err) {
      setError('Failed to search locations. Please try again.')
    } finally {
      setLoading(false)
    }
  }, 300)

  useEffect(() => {
    debouncedSearch(searchTerm)
    return () => debouncedSearch.cancel()
  }, [searchTerm])

  return (
    <div className="w-full max-w-3xl mx-auto p-6 space-y-6 font-sans">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-mutedForeground" size={20} />
        <input
          type="text"
          placeholder="Search trails, terrain, or locations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-surface dark:bg-surface-dark border border-border 
                   rounded-md text-foreground dark:text-foreground-dark placeholder-mutedForeground
                   focus:border-primary focus:ring-2 focus:ring-ring transition-all duration-200
                   shadow-sm hover:border-primary/50"
          aria-label="Search locations"
        />
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-4 bg-destructive/10 border border-destructive/20 rounded-md flex items-center gap-3
                     text-destructive"
          >
            <AlertCircle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted dark:bg-surface-dark rounded-md animate-pulse" />
            ))}
          </div>
        ) : locations.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 mx-auto mb-4 text-mutedForeground" />
            <h3 className="text-lg font-semibold text-foreground dark:text-foreground-dark mb-2">
              No locations found
            </h3>
            <p className="text-sm text-mutedForeground">Try adjusting your search terms</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {locations.map(location => (
              <motion.div
                key={location.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(45, 90, 39, 0.08)' }}
                className="bg-surface dark:bg-surface-dark rounded-md shadow-md border border-border
                         overflow-hidden hover:border-primary transition-all duration-300"
              >
                <button
                  onClick={() => onLocationSelect(location)}
                  className="w-full p-4 text-left flex gap-4 items-start focus:outline-none
                           focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  {location.imageUrl && (
                    <div className="w-24 h-24 rounded-md overflow-hidden flex-shrink-0">
                      <img 
                        src={location.imageUrl}
                        alt={location.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg text-foreground dark:text-foreground-dark">
                        {location.name}
                      </h3>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          onToggleFavorite(location.id)
                        }}
                        className="p-2 hover:bg-muted rounded-full transition-colors duration-200
                                 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        aria-label={favorites.includes(location.id) ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Heart
                          size={20}
                          className={favorites.includes(location.id)
                            ? 'fill-accent text-accent'
                            : 'text-mutedForeground'}
                        />
                      </motion.button>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm text-mutedForeground">
                      <MapPin size={16} />
                      <span>
                        {location.coordinates.lat.toFixed(2)}, {location.coordinates.lng.toFixed(2)}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium
                        ${location.difficulty === 'easy' 
                          ? 'bg-primary/10 text-primary' 
                          : location.difficulty === 'moderate'
                          ? 'bg-secondary/10 text-secondary'
                          : 'bg-destructive/10 text-destructive'}`}>
                        {location.difficulty}
                      </span>
                      {location.terrain.map(t => (
                        <span 
                          key={t}
                          className="px-3 py-1 rounded-full text-xs font-medium bg-muted
                                   dark:bg-surface-dark text-mutedForeground"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default function LocationAPIDemo() {
  const [favorites, setFavorites] = useState<string[]>([])

  return (
    <LocationAPI
      onLocationSelect={(loc) => console.log('Selected:', loc)}
      favorites={favorites}
      onToggleFavorite={(id) => {
        setFavorites(curr => 
          curr.includes(id) 
            ? curr.filter(f => f !== id)
            : [...curr, id]
        )
      }}
    />
  )
}