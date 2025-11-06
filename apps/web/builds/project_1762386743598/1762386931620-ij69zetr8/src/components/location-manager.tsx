'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, MapPin, Heart, Star, Compass, Mountain, Trees, Navigation, Plus, Filter, X } from 'lucide-react'

interface Location {
  id: string
  name: string
  description: string
  coordinates: {
    lat: number
    lng: number
  }
  difficulty: 'Easy' | 'Moderate' | 'Hard' | 'Expert'
  terrain: string[]
  rating: number
  reviewCount: number
  distance?: number
  isFavorite: boolean
  features: string[]
  lastVisited?: string
  tags: string[]
}

interface LocationManagerProps {
  locations?: Location[]
  onLocationSelect?: (location: Location) => void
  onLocationSave?: (location: Location) => void
  onLocationToggleFavorite?: (locationId: string) => void
  currentLocation?: { lat: number; lng: number }
  searchRadius?: number
}

const MOCK_LOCATIONS: Location[] = [
  {
    id: '1',
    name: 'Moab Slickrock Trail',
    description: 'World-famous slickrock trail with stunning red rock formations and challenging terrain.',
    coordinates: { lat: 38.5816, lng: -109.5498 },
    difficulty: 'Hard',
    terrain: ['Rock', 'Slickrock', 'Technical'],
    rating: 4.8,
    reviewCount: 1247,
    distance: 12.3,
    isFavorite: true,
    features: ['Scenic Views', 'Technical Driving', 'Photo Opportunities'],
    lastVisited: '2024-01-15',
    tags: ['Utah', 'Desert', 'Advanced']
  },
  {
    id: '2',
    name: 'Rubicon Trail',
    description: 'Legendary 22-mile trail through the Sierra Nevada mountains with granite obstacles.',
    coordinates: { lat: 39.0968, lng: -120.1430 },
    difficulty: 'Expert',
    terrain: ['Granite', 'Boulders', 'Technical'],
    rating: 4.9,
    reviewCount: 892,
    distance: 35.7,
    isFavorite: false,
    features: ['Extreme Technical', 'Multi-Day', 'Camping'],
    tags: ['California', 'Mountains', 'Expert']
  },
  {
    id: '3',
    name: 'Black Bear Pass',
    description: 'High-altitude trail with breathtaking views and steep switchbacks.',
    coordinates: { lat: 37.9067, lng: -107.7123 },
    difficulty: 'Hard',
    terrain: ['Alpine', 'Switchbacks', 'Exposure'],
    rating: 4.6,
    reviewCount: 634,
    distance: 28.9,
    isFavorite: true,
    features: ['High Altitude', 'Scenic Views', 'Waterfalls'],
    tags: ['Colorado', 'Alpine', 'Scenic']
  },
  {
    id: '4',
    name: 'Fordyce Creek Trail',
    description: 'Technical granite trail with water crossings and challenging obstacles.',
    coordinates: { lat: 39.3498, lng: -120.4567 },
    difficulty: 'Moderate',
    terrain: ['Granite', 'Water Crossings', 'Forest'],
    rating: 4.4,
    reviewCount: 423,
    distance: 18.2,
    isFavorite: false,
    features: ['Water Crossings', 'Forest Trail', 'Rock Crawling'],
    tags: ['California', 'Forest', 'Water']
  }
]

const DIFFICULTY_COLORS = {
  Easy: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800',
  Moderate: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800',
  Hard: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800',
  Expert: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
}

const TERRAIN_ICONS = {
  Rock: Mountain,
  Slickrock: Mountain,
  Technical: Compass,
  Granite: Mountain,
  Boulders: Mountain,
  Alpine: Mountain,
  Switchbacks: Navigation,
  Exposure: Mountain,
  'Water Crossings': Trees,
  Forest: Trees
}

export function LocationManager({
  locations = MOCK_LOCATIONS,
  onLocationSelect = () => {},
  onLocationSave = () => {},
  onLocationToggleFavorite = () => {},
  currentLocation,
  searchRadius = 50
}: LocationManagerProps = {}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('')
  const [selectedTerrain, setSelectedTerrain] = useState<string>('')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)

  useEffect(() => {
    if (searchQuery) {
      setIsLoading(true)
      const timer = setTimeout(() => setIsLoading(false), 300)
      return () => clearTimeout(timer)
    }
  }, [searchQuery])

  const filteredLocations = useMemo(() => {
    return locations.filter(location => {
      const matchesSearch = location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          location.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          location.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesDifficulty = !selectedDifficulty || location.difficulty === selectedDifficulty
      const matchesTerrain = !selectedTerrain || location.terrain.includes(selectedTerrain)
      const matchesFavorites = !showFavoritesOnly || location.isFavorite

      return matchesSearch && matchesDifficulty && matchesTerrain && matchesFavorites
    })
  }, [locations, searchQuery, selectedDifficulty, selectedTerrain, showFavoritesOnly])

  const uniqueTerrainTypes = useMemo(() => {
    const terrains = new Set<string>()
    locations.forEach(location => {
      location.terrain.forEach(terrain => terrains.add(terrain))
    })
    return Array.from(terrains).sort()
  }, [locations])

  const handleLocationClick = (location: Location) => {
    setSelectedLocation(location)
    onLocationSelect(location)
  }

  const handleToggleFavorite = (e: React.MouseEvent, locationId: string) => {
    e.stopPropagation()
    onLocationToggleFavorite(locationId)
  }

  const clearFilters = () => {
    setSelectedDifficulty('')
    setSelectedTerrain('')
    setShowFavoritesOnly(false)
    setSearchQuery('')
  }

  const activeFiltersCount = [selectedDifficulty, selectedTerrain, showFavoritesOnly].filter(Boolean).length

  return (
    <div className="min-h-screen bg-background dark:bg-background font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground dark:text-foreground mb-2">Trail Locations</h1>
          <p className="text-mutedForeground dark:text-mutedForeground">Discover and save your favorite off-road destinations</p>
        </div>

        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-mutedForeground dark:text-mutedForeground w-5 h-5" />
            <input
              type="text"
              placeholder="Search trails, locations, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-surface dark:bg-surface border border-border dark:border-border rounded-lg text-foreground dark:text-foreground placeholder-mutedForeground dark:placeholder-mutedForeground focus:border-ring dark:focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:focus:ring-ring/50 transition-all duration-150"
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-surface dark:bg-surface border border-border dark:border-border rounded-lg hover:border-ring/50 dark:hover:border-ring/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 text-sm font-medium text-foreground dark:text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 dark:focus:ring-ring/50"
                aria-label="Toggle filters"
              >
                <Filter className="w-4 h-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="px-2 py-0.5 bg-primary dark:bg-primary text-primaryForeground dark:text-primaryForeground rounded-full text-xs">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring/50 dark:focus:ring-ring/50 ${
                  showFavoritesOnly
                    ? 'bg-primary dark:bg-primary text-primaryForeground dark:text-primaryForeground'
                    : 'bg-surface dark:bg-surface border border-border dark:border-border hover:border-ring/50 dark:hover:border-ring/50 text-foreground dark:text-foreground'
                }`}
                aria-label={showFavoritesOnly ? 'Show all locations' : 'Show favorites only'}
              >
                <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                Favorites
              </button>
            </div>

            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-3 py-2 text-mutedForeground dark:text-mutedForeground hover:text-foreground dark:hover:text-foreground hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 dark:focus:ring-ring/50 rounded"
                aria-label="Clear all filters"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>

          {showFilters && (
            <div className="bg-surface dark:bg-surface border border-border dark:border-border rounded-xl p-6 space-y-4 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground dark:text-foreground mb-2">Difficulty</label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full px-4 py-2 bg-background dark:bg-background border border-border dark:border-border rounded-lg text-foreground dark:text-foreground focus:border-ring dark:focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:focus:ring-ring/50 transition-all duration-150"
                  >
                    <option value="">All Difficulties</option>
                    <option value="Easy">Easy</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Hard">Hard</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground dark:text-foreground mb-2">Terrain Type</label>
                  <select
                    value={selectedTerrain}
                    onChange={(e) => setSelectedTerrain(e.target.value)}
                    className="w-full px-4 py-2 bg-background dark:bg-background border border-border dark:border-border rounded-lg text-foreground dark:text-foreground focus:border-ring dark:focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:focus:ring-ring/50 transition-all duration-150"
                  >
                    <option value="">All Terrain</option>
                    {uniqueTerrainTypes.map(terrain => (
                      <option key={terrain} value={terrain}>{terrain}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mb-6">
          <p className="text-mutedForeground dark:text-mutedForeground text-sm">
            {isLoading ? 'Searching...' : `${filteredLocations.length} locations found`}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-surface dark:bg-surface rounded-xl p-6 animate-pulse border border-border dark:border-border">
                <div className="h-4 bg-muted dark:bg-muted rounded mb-3"></div>
                <div className="h-3 bg-muted dark:bg-muted rounded mb-4 w-3/4"></div>
                <div className="flex gap-2 mb-4">
                  <div className="h-6 bg-muted dark:bg-muted rounded w-16"></div>
                  <div className="h-6 bg-muted dark:bg-muted rounded w-20"></div>
                </div>
                <div className="h-3 bg-muted dark:bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted dark:bg-muted rounded w-1/2"></div>
              </div>
            ))
          ) : filteredLocations.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="w-16 h-16 bg-muted dark:bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                <MapPin className="w-8 h-8 text-mutedForeground dark:text-mutedForeground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground dark:text-foreground mb-2">No locations found</h3>
              <p className="text-mutedForeground dark:text-mutedForeground mb-6">Try adjusting your search criteria or filters</p>
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-primary dark:bg-primary text-primaryForeground dark:text-primaryForeground rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 font-medium focus:outline-none focus:ring-2 focus:ring-ring/50 dark:focus:ring-ring/50"
                aria-label="Clear all filters"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            filteredLocations.map((location) => {
              const TerrainIcon = TERRAIN_ICONS[location.terrain[0] as keyof typeof TERRAIN_ICONS] || Mountain
              
              return (
                <div
                  key={location.id}
                  onClick={() => handleLocationClick(location)}
                  className={`bg-surface dark:bg-surface rounded-xl border p-6 hover:border-ring/50 dark:hover:border-ring/50 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer shadow-sm ${
                    selectedLocation?.id === location.id 
                      ? 'border-ring dark:border-ring shadow-md' 
                      : 'border-border dark:border-border'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <TerrainIcon className="w-5 h-5 text-primary dark:text-primary" />
                      <h3 className="font-semibold text-foreground dark:text-foreground text-lg">{location.name}</h3>
                    </div>
                    <button
                      onClick={(e) => handleToggleFavorite(e, location.id)}
                      className="p-1 hover:bg-muted dark:hover:bg-muted rounded hover:scale-110 active:scale-95 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-ring/50 dark:focus:ring-ring/50"
                      aria-label={location.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Heart 
                        className={`w-5 h-5 ${
                          location.isFavorite 
                            ? 'text-destructive dark:text-destructive fill-current' 
                            : 'text-mutedForeground dark:text-mutedForeground hover:text-destructive dark:hover:text-destructive'
                        }`} 
                      />
                    </button>
                  </div>

                  <p className="text-mutedForeground dark:text-mutedForeground text-sm mb-4 line-clamp-2">{location.description}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${DIFFICULTY_COLORS[location.difficulty]}`}>
                      {location.difficulty}
                    </span>
                    {location.terrain.slice(0, 2).map(terrain => (
                      <span key={terrain} className="px-3 py-1 bg-muted dark:bg-muted text-mutedForeground dark:text-mutedForeground rounded-full text-xs font-medium">
                        {terrain}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-accent dark:text-accent fill-current" />
                      <span className="text-foreground dark:text-foreground font-medium">{location.rating}</span>
                      <span className="text-mutedForeground dark:text-mutedForeground">({location.reviewCount})</span>
                    </div>
                    {location.distance && (
                      <span className="text-mutedForeground dark:text-mutedForeground">{location.distance} mi</span>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-border dark:border-border">
                    <div className="flex flex-wrap gap-1">
                      {location.features.slice(0, 3).map(feature => (
                        <span key={feature} className="px-2 py-1 bg-primary/10 dark:bg-primary/10 text-primary dark:text-primary rounded text-xs">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  {location.lastVisited && (
                    <div className="mt-3 text-xs text-mutedForeground dark:text-mutedForeground">
                      Last visited: {new Date(location.lastVisited).toLocaleDateString()}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        <div className="fixed bottom-6 right-6">
          <button
            onClick={() => onLocationSave({} as Location)}
            className="w-14 h-14 bg-primary dark:bg-primary text-primaryForeground dark:text-primaryForeground rounded-full shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-150 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-ring/50 dark:focus:ring-ring/50"
            aria-label="Add new location"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function LocationManagerDemo() {
  const [locations, setLocations] = useState(MOCK_LOCATIONS)

  const handleLocationSelect = (location: Location) => {
    console.log('Selected location:', location.name)
  }

  const handleLocationSave = (location: Location) => {
    console.log('Save location:', location)
  }

  const handleToggleFavorite = (locationId: string) => {
    setLocations(prev => prev.map(loc => 
      loc.id === locationId 
        ? { ...loc, isFavorite: !loc.isFavorite }
        : loc
    ))
  }

  return (
    <LocationManager
      locations={locations}
      onLocationSelect={handleLocationSelect}
      onLocationSave={handleLocationSave}
      onLocationToggleFavorite={handleToggleFavorite}
      currentLocation={{ lat: 39.0968, lng: -120.1430 }}
    />
  )
}