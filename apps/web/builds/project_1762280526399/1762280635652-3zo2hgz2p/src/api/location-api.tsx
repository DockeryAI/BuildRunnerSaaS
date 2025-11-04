'use client'

import { useState, useEffect } from 'react'
import { Search, MapPin, Star, StarOff, Loader2, AlertCircle, Mountain, Compass, Gauge } from 'lucide-react'

interface Location {
  id: string
  name: string
  description: string
  latitude: number
  longitude: number
  difficulty: 'easy' | 'moderate' | 'difficult' | 'extreme'
  terrain: string[]
  rating: number
  isFavorite: boolean
  imageUrl?: string
  amenities: string[]
  lastVisited?: string
}

interface LocationAPIProps {
  onLocationSelect?: (location: Location) => void
  onLocationSave?: (location: Location) => void
  initialSearchTerm?: string
  showFavorites?: boolean
}

interface LocationSearchResult {
  locations: Location[]
  total: number
  hasMore: boolean
}

export function LocationAPI({
  onLocationSelect = () => console.log('Location selected'),
  onLocationSave = () => console.log('Location saved'),
  initialSearchTerm = '',
  showFavorites = false
}: LocationAPIProps = {}) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm)
  const [locations, setLocations] = useState<Location[]>([])
  const [favorites, setFavorites] = useState<Location[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'search' | 'favorites'>(showFavorites ? 'favorites' : 'search')
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)

  // Mock API data
  const mockLocations: Location[] = [
    {
      id: '1',
      name: 'Moab Desert Trail',
      description: 'Iconic red rock formations with challenging terrain perfect for experienced off-roaders.',
      latitude: 38.5733,
      longitude: -109.5498,
      difficulty: 'difficult',
      terrain: ['rock', 'sand', 'steep'],
      rating: 4.8,
      isFavorite: false,
      amenities: ['parking', 'restrooms', 'camping'],
      imageUrl: '/api/placeholder/300/200'
    },
    {
      id: '2',
      name: 'Pine Valley Loop',
      description: 'Scenic forest trail with moderate difficulty and beautiful mountain views.',
      latitude: 37.3861,
      longitude: -113.3094,
      difficulty: 'moderate',
      terrain: ['dirt', 'gravel', 'forest'],
      rating: 4.5,
      isFavorite: true,
      amenities: ['parking', 'picnic', 'trails'],
      lastVisited: '2024-01-15'
    },
    {
      id: '3',
      name: 'Desert Wash Adventure',
      description: 'Easy desert trail perfect for beginners with stunning sunset views.',
      latitude: 33.7490,
      longitude: -116.1739,
      difficulty: 'easy',
      terrain: ['sand', 'wash', 'flat'],
      rating: 4.2,
      isFavorite: false,
      amenities: ['parking', 'shade']
    },
    {
      id: '4',
      name: 'Rocky Mountain Challenge',
      description: 'Extreme terrain for expert drivers only. Technical rock crawling required.',
      latitude: 39.7392,
      longitude: -104.9903,
      difficulty: 'extreme',
      terrain: ['rock', 'steep', 'technical'],
      rating: 4.9,
      isFavorite: true,
      amenities: ['parking', 'emergency'],
      lastVisited: '2024-02-20'
    }
  ]

  // Simulate API search
  const searchLocations = async (term: string): Promise<LocationSearchResult> => {
    setIsLoading(true)
    setError(null)

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800))

      const filtered = mockLocations.filter(location =>
        location.name.toLowerCase().includes(term.toLowerCase()) ||
        location.description.toLowerCase().includes(term.toLowerCase()) ||
        location.terrain.some(t => t.toLowerCase().includes(term.toLowerCase()))
      )

      return {
        locations: filtered,
        total: filtered.length,
        hasMore: false
      }
    } catch (err) {
      throw new Error('Failed to search locations. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle search with debouncing
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    if (searchTerm.trim()) {
      const timeout = setTimeout(async () => {
        try {
          const result = await searchLocations(searchTerm)
          setLocations(result.locations)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Search failed')
        }
      }, 300)
      setSearchTimeout(timeout)
    } else {
      setLocations([])
    }

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
    }
  }, [searchTerm])

  // Load favorites
  useEffect(() => {
    const favoriteLocations = mockLocations.filter(loc => loc.isFavorite)
    setFavorites(favoriteLocations)
  }, [])

  const toggleFavorite = (locationId: string) => {
    const location = [...locations, ...favorites].find(loc => loc.id === locationId)
    if (!location) return

    const updatedLocation = { ...location, isFavorite: !location.isFavorite }
    
    if (updatedLocation.isFavorite) {
      setFavorites(prev => [...prev.filter(fav => fav.id !== locationId), updatedLocation])
    } else {
      setFavorites(prev => prev.filter(fav => fav.id !== locationId))
    }

    setLocations(prev => prev.map(loc => 
      loc.id === locationId ? updatedLocation : loc
    ))

    onLocationSave(updatedLocation)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'moderate': return 'bg-yellow-100 text-yellow-800'
      case 'difficult': return 'bg-orange-100 text-orange-800'
      case 'extreme': return 'bg-red-100 text-red-800'
      default: return 'bg-[rgb(241, 245, 249)] text-gray-800'
    }
  }

  const LocationCard = ({ location }: { location: Location }) => (
    <div className="bg-white rounded-lg shadow-md border border-[rgb(226,232,240)] overflow-hidden">
      <div className="h-32 bg-gradient-to-r from-[rgb(34,139,34)] to-[rgb(245,158,11)] relative">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="absolute top-3 right-3">
          <button
            onClick={() => toggleFavorite(location.id)}
            className="p-2 rounded-full bg-white bg-opacity-90 hover:bg-opacity-100 transition-all"
            aria-label={location.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {location.isFavorite ? (
              <Star className="w-4 h-4 text-[rgb(245,158,11)] fill-current" />
            ) : (
              <StarOff className="w-4 h-4 text-gray-600" />
            )}
          </button>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-[rgb(15,23,42)] text-lg">{location.name}</h3>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(location.difficulty)}`}>
            {location.difficulty}
          </span>
        </div>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{location.description}</p>
        
        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-[rgb(245,158,11)] fill-current" />
            <span className="text-sm font-medium">{location.rating}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {location.terrain.map((terrain, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs bg-[rgb(241,245,249)] text-gray-700 rounded"
            >
              {terrain}
            </span>
          ))}
        </div>
        
        {location.lastVisited && (
          <p className="text-xs text-gray-500 mb-3">
            Last visited: {new Date(location.lastVisited).toLocaleDateString()}
          </p>
        )}
        
        <button
          onClick={() => onLocationSelect(location)}
          className="w-full py-2 px-4 bg-[rgb(34,139,34)] text-white rounded-md hover:bg-[rgb(34,139,34)]/90 transition-colors font-medium"
        >
          Select Location
        </button>
      </div>
    </div>
  )

  const EmptyState = ({ type }: { type: 'search' | 'favorites' | 'no-results' }) => {
    const content = {
      search: {
        icon: <Search className="w-12 h-12 text-gray-400" />,
        title: 'Search for Locations',
        description: 'Enter a location name, terrain type, or difficulty level to find your next adventure.'
      },
      favorites: {
        icon: <Star className="w-12 h-12 text-gray-400" />,
        title: 'No Favorites Yet',
        description: 'Star locations you love to save them for quick access later.'
      },
      'no-results': {
        icon: <Mountain className="w-12 h-12 text-gray-400" />,
        title: 'No Locations Found',
        description: 'Try adjusting your search terms or browse our featured locations.'
      }
    }

    const { icon, title, description } = content[type]

    return (
      <div className="text-center py-12">
        <div className="flex justify-center mb-4">{icon}</div>
        <h3 className="text-lg font-semibold text-[rgb(15,23,42)] mb-2">{title}</h3>
        <p className="text-gray-600 max-w-sm mx-auto">{description}</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[rgb(15,23,42)] mb-2 flex items-center gap-2">
          <Compass className="w-6 h-6 text-[rgb(34,139,34)]" />
          Location Explorer
        </h1>
        <p className="text-gray-600">Discover and save amazing off-road destinations</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex mb-6 border-b border-[rgb(226,232,240)]">
        <button
          onClick={() => setActiveTab('search')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'search'
              ? 'text-[rgb(34,139,34)] border-b-2 border-[rgb(34,139,34)]'
              : 'text-gray-600 hover:text-[rgb(15,23,42)]'
          }`}
        >
          Search Locations
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'favorites'
              ? 'text-[rgb(34,139,34)] border-b-2 border-[rgb(34,139,34)]'
              : 'text-gray-600 hover:text-[rgb(15,23,42)]'
          }`}
        >
          Favorites ({favorites.length})
        </button>
      </div>

      {/* Search Tab */}
      {activeTab === 'search' && (
        <>
          {/* Search Input */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search locations, terrain, or difficulty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent"
            />
            {isLoading && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[rgb(34,139,34)] animate-spin" />
            )}
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <div>
                <p className="text-red-800 font-medium">Search Error</p>
                <p className="text-[rgb(255, 255, 255)] text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Search Results */}
          {searchTerm.trim() ? (
            locations.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {locations.map((location) => (
                  <LocationCard key={location.id} location={location} />
                ))}
              </div>
            ) : !isLoading ? (
              <EmptyState type="no-results" />
            ) : null
          ) : (
            <EmptyState type="search" />
          )}
        </>
      )}

      {/* Favorites Tab */}
      {activeTab === 'favorites' && (
        <>
          {favorites.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {favorites.map((location) => (
                <LocationCard key={location.id} location={location} />
              ))}
            </div>
          ) : (
            <EmptyState type="favorites" />
          )}
        </>
      )}

      {/* Loading Skeleton */}
      {isLoading && searchTerm.trim() && (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-md border border-[rgb(226,232,240)] overflow-hidden animate-pulse">
              <div className="h-32 bg-gray-200"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-3 w-3/4"></div>
                <div className="flex gap-2 mb-3">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function LocationAPIDemo() {
  return <LocationAPI />
}