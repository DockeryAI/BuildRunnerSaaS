'use client'

import { useState, useEffect } from 'react'
import { MapPin, Calendar, Users, Plus, Search, Filter, Star, Clock, Navigation } from 'lucide-react'

interface Trip {
  id: string
  name: string
  location: string
  startDate: string
  endDate: string
  memberCount: number
  status: 'planning' | 'confirmed' | 'completed'
  difficulty: 'easy' | 'moderate' | 'hard'
  imageUrl: string
  description: string
  organizer: string
  isStarred: boolean
}

interface TripListPageProps {
  trips?: Trip[]
  onTripSelect?: (tripId: string) => void
  onCreateTrip?: () => void
  searchQuery?: string
  filterStatus?: string
}

export function TripListPage({
  trips = DEFAULT_TRIPS,
  onTripSelect = (id) => console.log('Trip selected:', id),
  onCreateTrip = () => console.log('Create new trip'),
  searchQuery = '',
  filterStatus = 'all'
}: TripListPageProps = {}) {
  const [searchTerm, setSearchTerm] = useState(searchQuery)
  const [filter, setFilter] = useState(filterStatus)
  const [starredTrips, setStarredTrips] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = trip.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trip.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || trip.status === filter
    return matchesSearch && matchesFilter
  })

  const toggleStar = (tripId: string) => {
    setStarredTrips(prev => {
      const newStarred = new Set(prev)
      if (newStarred.has(tripId)) {
        newStarred.delete(tripId)
      } else {
        newStarred.add(tripId)
      }
      return newStarred
    })
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700 border-green-200'
      case 'moderate': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'hard': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-[rgb(248, 250, 252)] text-gray-700 border-[rgb(226, 232, 240)]'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'confirmed': return 'bg-green-100 text-green-700 border-green-200'
      case 'completed': return 'bg-[rgb(248, 250, 252)] text-gray-700 border-[rgb(226, 232, 240)]'
      default: return 'bg-[rgb(248, 250, 252)] text-gray-700 border-[rgb(226, 232, 240)]'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-[#ffffff] font-medium">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#ffffff] border-b border-[#e2e8f0] px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-[#0f172a]">Off-Road Trips</h1>
          <button
            onClick={onCreateTrip}
            className="flex items-center gap-2 px-4 py-2 bg-[#228b22] text-[#ffffff] rounded-lg hover:bg-[#1e7b1e] transition-colors duration-150 font-medium shadow-md hover:shadow-lg active:scale-95 min-h-[44px]"
            aria-label="Create new trip"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">New Trip</span>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search trips or locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#ffffff] border border-[#e2e8f0] rounded-lg text-[#0f172a] placeholder-gray-400 focus:border-[#228b22] focus:outline-none focus:ring-1 focus:ring-[#228b22]/50 transition-all duration-150 min-h-[44px]"
              aria-label="Search trips"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 pr-8 py-3 bg-[#ffffff] border border-[#e2e8f0] rounded-lg text-[#0f172a] focus:border-[#228b22] focus:outline-none focus:ring-1 focus:ring-[#228b22]/50 transition-all duration-150 min-h-[44px] appearance-none"
              aria-label="Filter trips by status"
            >
              <option value="all">All Trips</option>
              <option value="planning">Planning</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Trip List */}
      <div className="px-4 py-6">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-[#f8fafc] rounded-xl p-4 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className="text-center py-12">
            <Navigation className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-lg font-semibold text-[#0f172a] mb-2">No trips found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm ? 'Try adjusting your search terms' : 'Start planning your first off-road adventure!'}
            </p>
            <button
              onClick={onCreateTrip}
              className="px-6 py-3 bg-[#228b22] text-[#ffffff] rounded-lg hover:bg-[#1e7b1e] transition-colors duration-150 font-medium shadow-md hover:shadow-lg active:scale-95 min-h-[44px]"
            >
              Create Your First Trip
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTrips.map((trip) => (
              <div
                key={trip.id}
                onClick={() => onTripSelect(trip.id)}
                className="bg-[#ffffff] border border-[#e2e8f0] rounded-xl p-4 hover:border-[#228b22]/50 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer active:scale-[0.98]"
                role="button"
                tabIndex={0}
                aria-label={`View trip: ${trip.name}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onTripSelect(trip.id)
                  }
                }}
              >
                <div className="flex gap-4">
                  {/* Trip Image */}
                  <div className="relative">
                    <img
                      src={trip.imageUrl}
                      alt={trip.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleStar(trip.id)
                      }}
                      className="absolute -top-2 -right-2 p-1 bg-[#ffffff] rounded-full shadow-md hover:shadow-lg transition-all duration-150 active:scale-95 min-h-[32px] min-w-[32px] flex items-center justify-center"
                      aria-label={starredTrips.has(trip.id) ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Star
                        size={16}
                        className={starredTrips.has(trip.id) ? 'text-[#f97316] fill-current' : 'text-gray-400'}
                      />
                    </button>
                  </div>

                  {/* Trip Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-[#0f172a] truncate pr-2">{trip.name}</h3>
                      <div className="flex gap-2 flex-shrink-0">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(trip.difficulty)}`}>
                          {trip.difficulty}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(trip.status)}`}>
                          {trip.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                      <MapPin size={14} />
                      <span className="truncate">{trip.location}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>{formatDate(trip.startDate)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users size={14} />
                          <span>{trip.memberCount} members</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock size={12} />
                        <span>by {trip.organizer}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom spacing for mobile navigation */}
      <div className="h-20 sm:h-0"></div>
    </div>
  )
}

const DEFAULT_TRIPS: Trip[] = [
  {
    id: '1',
    name: 'Moab Desert Adventure',
    location: 'Moab, Utah',
    startDate: '2024-03-15',
    endDate: '2024-03-17',
    memberCount: 8,
    status: 'confirmed',
    difficulty: 'hard',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    description: 'Epic 3-day off-road adventure through the red rocks of Moab',
    organizer: 'Mike Johnson',
    isStarred: false
  },
  {
    id: '2',
    name: 'Big Sur Coastal Trail',
    location: 'Big Sur, California',
    startDate: '2024-04-20',
    endDate: '2024-04-22',
    memberCount: 6,
    status: 'planning',
    difficulty: 'moderate',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    description: 'Scenic coastal off-roading with ocean views',
    organizer: 'Sarah Chen',
    isStarred: true
  },
  {
    id: '3',
    name: 'Death Valley Expedition',
    location: 'Death Valley, Nevada',
    startDate: '2024-02-10',
    endDate: '2024-02-12',
    memberCount: 12,
    status: 'completed',
    difficulty: 'hard',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    description: 'Challenging desert expedition through remote terrain',
    organizer: 'Alex Rodriguez',
    isStarred: false
  },
  {
    id: '4',
    name: 'Tahoe Forest Run',
    location: 'Lake Tahoe, California',
    startDate: '2024-05-05',
    endDate: '2024-05-07',
    memberCount: 4,
    status: 'planning',
    difficulty: 'easy',
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    description: 'Family-friendly forest trails around Lake Tahoe',
    organizer: 'Emma Wilson',
    isStarred: true
  }
]

export default function TripListPageDemo() {
  return <TripListPage />
}