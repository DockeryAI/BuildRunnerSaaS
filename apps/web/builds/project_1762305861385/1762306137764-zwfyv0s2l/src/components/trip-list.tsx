'use client'

import { useState, useEffect } from 'react'
import { MapPin, Calendar, Users, Star, Plus, Search, Filter, ChevronRight } from 'lucide-react'

interface Trip {
  id: string
  name: string
  location: string
  startDate: string
  endDate: string
  participants: number
  maxParticipants: number
  difficulty: 'Easy' | 'Moderate' | 'Hard'
  status: 'Planning' | 'Confirmed' | 'Completed'
  imageUrl: string
  description: string
  organizer: string
  tags: string[]
}

interface TripListProps {
  trips?: Trip[]
  onTripSelect?: (trip: Trip) => void
  onCreateTrip?: () => void
  showFilters?: boolean
  searchPlaceholder?: string
}

const DEFAULT_TRIPS: Trip[] = [
  {
    id: '1',
    name: 'Moab Desert Adventure',
    location: 'Moab, Utah',
    startDate: '2024-03-15',
    endDate: '2024-03-17',
    participants: 6,
    maxParticipants: 8,
    difficulty: 'Moderate',
    status: 'Planning',
    imageUrl: '/api/placeholder/400/200',
    description: 'Epic red rock trails and stunning desert landscapes',
    organizer: 'Sarah Johnson',
    tags: ['Desert', 'Rock Crawling', 'Camping']
  },
  {
    id: '2',
    name: 'Colorado Mountain Trail',
    location: 'Silverton, Colorado',
    startDate: '2024-04-20',
    endDate: '2024-04-22',
    participants: 4,
    maxParticipants: 6,
    difficulty: 'Hard',
    status: 'Confirmed',
    imageUrl: '/api/placeholder/400/200',
    description: 'High altitude technical trails with breathtaking views',
    organizer: 'Mike Chen',
    tags: ['Mountains', 'Technical', 'Alpine']
  },
  {
    id: '3',
    name: 'Forest Creek Run',
    location: 'Olympic National Forest, WA',
    startDate: '2024-05-10',
    endDate: '2024-05-12',
    participants: 8,
    maxParticipants: 8,
    difficulty: 'Easy',
    status: 'Confirmed',
    imageUrl: '/api/placeholder/400/200',
    description: 'Family-friendly trails through lush Pacific Northwest forests',
    organizer: 'Alex Rivera',
    tags: ['Forest', 'Family', 'Scenic']
  }
]

export function TripList({
  trips = DEFAULT_TRIPS,
  onTripSelect = (trip) => console.log('Selected trip:', trip.name),
  onCreateTrip = () => console.log('Create new trip'),
  showFilters = true,
  searchPlaceholder = 'Search trips...'
}: TripListProps = {}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'planning' | 'confirmed' | 'completed'>('all')
  const [filteredTrips, setFilteredTrips] = useState(trips)

  useEffect(() => {
    let filtered = trips

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(trip =>
        trip.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Apply status filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(trip =>
        trip.status.toLowerCase() === selectedFilter
      )
    }

    setFilteredTrips(filtered)
  }, [searchQuery, selectedFilter, trips])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-[rgb(34,139,34)] text-white'
      case 'Moderate': return 'bg-[rgb(245,158,11)] text-white'
      case 'Hard': return 'bg-[rgb(220,38,38)] text-white'
      default: return 'bg-[rgb(241,245,249)] text-[rgb(15,23,42)]'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Planning': return 'bg-[rgb(245,158,11)]/10 text-[rgb(245,158,11)] border-[rgb(245,158,11)]/20'
      case 'Confirmed': return 'bg-[rgb(34,139,34)]/10 text-[rgb(34,139,34)] border-[rgb(34,139,34)]/20'
      case 'Completed': return 'bg-[rgb(241,245,249)] text-[rgb(15,23,42)] border-[rgb(226,232,240)]'
      default: return 'bg-[rgb(241,245,249)] text-[rgb(15,23,42)] border-[rgb(226,232,240)]'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-[rgb(255,255,255)] font-medium">
      {/* Header */}
      <div className="sticky top-0 bg-[rgb(255,255,255)] border-b border-[rgb(226,232,240)] z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-[rgb(15,23,42)]">Off-Road Trips</h1>
            <button
              onClick={onCreateTrip}
              className="flex items-center gap-2 px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors duration-150 shadow-md active:scale-95"
              aria-label="Create new trip"
            >
              <Plus size={20} />
              <span className="hidden sm:inline">New Trip</span>
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[rgb(15,23,42)]/40" size={20} />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[rgb(248,250,252)] border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] placeholder-[rgb(15,23,42)]/40 focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)]/20 transition-all duration-150"
              aria-label="Search trips"
            />
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[
                { key: 'all', label: 'All' },
                { key: 'planning', label: 'Planning' },
                { key: 'confirmed', label: 'Confirmed' },
                { key: 'completed', label: 'Completed' }
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setSelectedFilter(filter.key as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-150 ${
                    selectedFilter === filter.key
                      ? 'bg-[rgb(34,139,34)] text-white shadow-md'
                      : 'bg-[rgb(248,250,252)] text-[rgb(15,23,42)] hover:bg-[rgb(241,245,249)] border border-[rgb(226,232,240)]'
                  }`}
                  aria-label={`Filter by ${filter.label}`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Trip List */}
      <div className="px-4 py-4">
        {filteredTrips.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="mx-auto mb-4 text-[rgb(15,23,42)]/20" size={48} />
            <h3 className="text-lg font-semibold text-[rgb(15,23,42)] mb-2">No trips found</h3>
            <p className="text-[rgb(15,23,42)]/60 mb-6">
              {searchQuery ? 'Try adjusting your search terms' : 'Start planning your first off-road adventure'}
            </p>
            <button
              onClick={onCreateTrip}
              className="px-6 py-3 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors duration-150 shadow-md active:scale-95"
            >
              Create Your First Trip
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTrips.map((trip) => (
              <div
                key={trip.id}
                onClick={() => onTripSelect(trip)}
                className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-xl p-4 hover:border-[rgb(34,139,34)]/30 hover:shadow-md transition-all duration-200 cursor-pointer active:scale-[0.98]"
                role="button"
                tabIndex={0}
                aria-label={`View details for ${trip.name}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onTripSelect(trip)
                  }
                }}
              >
                <div className="flex items-start gap-4">
                  {/* Trip Image */}
                  <div className="w-20 h-20 bg-[rgb(241,245,249)] rounded-lg flex-shrink-0 overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-[rgb(34,139,34)]/20 to-[rgb(245,158,11)]/20 flex items-center justify-center">
                      <MapPin className="text-[rgb(34,139,34)]" size={24} />
                    </div>
                  </div>

                  {/* Trip Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-[rgb(15,23,42)] truncate pr-2">{trip.name}</h3>
                      <ChevronRight className="text-[rgb(15,23,42)]/40 flex-shrink-0" size={20} />
                    </div>

                    <div className="flex items-center gap-2 mb-2 text-sm text-[rgb(15,23,42)]/60">
                      <MapPin size={14} />
                      <span className="truncate">{trip.location}</span>
                    </div>

                    <div className="flex items-center gap-2 mb-3 text-sm text-[rgb(15,23,42)]/60">
                      <Calendar size={14} />
                      <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
                    </div>

                    {/* Status and Difficulty Badges */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(trip.status)}`}>
                        {trip.status}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(trip.difficulty)}`}>
                        {trip.difficulty}
                      </span>
                    </div>

                    {/* Participants */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-[rgb(15,23,42)]/60">
                        <Users size={14} />
                        <span>{trip.participants}/{trip.maxParticipants} participants</span>
                      </div>
                      <div className="text-xs text-[rgb(15,23,42)]/40">
                        by {trip.organizer}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function TripListDemo() {
  return <TripList />
}