'use client'

import { useState, useEffect } from 'react'
import { Calendar, MapPin, Users, Clock, Plus, X, Search, ChevronDown, ChevronRight } from 'lucide-react'

interface Location {
  id: string
  name: string
  address: string
  coordinates: { lat: number; lng: number }
  type: 'campground' | 'trail' | 'scenic' | 'custom'
}

interface GroupMember {
  id: string
  name: string
  email: string
  avatar?: string
  status: 'invited' | 'accepted' | 'declined' | 'pending'
}

interface TripFormData {
  name: string
  description: string
  startDate: string
  endDate: string
  location: Location | null
  groupMembers: GroupMember[]
  maxParticipants: number
  difficulty: 'easy' | 'moderate' | 'hard'
  vehicleRequirements: string[]
}

interface CreateTripProps {
  onTripCreated?: (trip: TripFormData) => void
  initialData?: Partial<TripFormData>
}

const MOCK_LOCATIONS: Location[] = [
  {
    id: '1',
    name: 'Moab Desert Trail',
    address: 'Moab, UT 84532',
    coordinates: { lat: 38.5733, lng: -109.5498 },
    type: 'trail'
  },
  {
    id: '2',
    name: 'Red Rock Canyon',
    address: 'Las Vegas, NV 89161',
    coordinates: { lat: 36.1349, lng: -115.4194 },
    type: 'scenic'
  },
  {
    id: '3',
    name: 'Joshua Tree Campground',
    address: 'Twentynine Palms, CA 92277',
    coordinates: { lat: 33.8734, lng: -115.9010 },
    type: 'campground'
  }
]

const MOCK_MEMBERS: GroupMember[] = [
  { id: '1', name: 'John Smith', email: 'john@example.com', status: 'accepted' },
  { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com', status: 'pending' },
  { id: '3', name: 'Mike Wilson', email: 'mike@example.com', status: 'accepted' }
]

const VEHICLE_OPTIONS = [
  '4WD Required',
  'High Clearance',
  'Stock Vehicle OK',
  'ATV/UTV Only',
  'Motorcycle Friendly'
]

export function CreateTrip({
  onTripCreated = () => console.log('Trip created'),
  initialData = {}
}: CreateTripProps = {}) {
  const [formData, setFormData] = useState<TripFormData>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    location: null,
    groupMembers: [],
    maxParticipants: 8,
    difficulty: 'moderate',
    vehicleRequirements: [],
    ...initialData
  })

  const [showLocationSearch, setShowLocationSearch] = useState(false)
  const [locationQuery, setLocationQuery] = useState('')
  const [showMemberSearch, setShowMemberSearch] = useState(false)
  const [memberQuery, setMemberQuery] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const filteredLocations = MOCK_LOCATIONS.filter(location =>
    location.name.toLowerCase().includes(locationQuery.toLowerCase()) ||
    location.address.toLowerCase().includes(locationQuery.toLowerCase())
  )

  const filteredMembers = MOCK_MEMBERS.filter(member =>
    !formData.groupMembers.find(gm => gm.id === member.id) &&
    (member.name.toLowerCase().includes(memberQuery.toLowerCase()) ||
     member.email.toLowerCase().includes(memberQuery.toLowerCase()))
  )

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Trip name is required'
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required'
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required'
    }

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = 'End date must be after start date'
    }

    if (!formData.location) {
      newErrors.location = 'Location is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      onTripCreated(formData)
    } catch (error) {
      console.error('Failed to create trip:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addMember = (member: GroupMember) => {
    setFormData(prev => ({
      ...prev,
      groupMembers: [...prev.groupMembers, { ...member, status: 'invited' }]
    }))
    setMemberQuery('')
    setShowMemberSearch(false)
  }

  const removeMember = (memberId: string) => {
    setFormData(prev => ({
      ...prev,
      groupMembers: prev.groupMembers.filter(m => m.id !== memberId)
    }))
  }

  const toggleVehicleRequirement = (requirement: string) => {
    setFormData(prev => ({
      ...prev,
      vehicleRequirements: prev.vehicleRequirements.includes(requirement)
        ? prev.vehicleRequirements.filter(r => r !== requirement)
        : [...prev.vehicleRequirements, requirement]
    }))
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'rgb(255, 255, 255)' }}>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'rgb(15, 23, 42)' }}>
            Create New Trip
          </h1>
          <p className="text-lg" style={{ color: 'rgb(100, 116, 139)' }}>
            Plan your next off-road adventure with your group
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-md border p-6" style={{ borderColor: 'rgb(226, 232, 240)' }}>
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2" style={{ color: 'rgb(15, 23, 42)' }}>
              <Calendar className="w-5 h-5" style={{ color: 'rgb(34, 139, 34)' }} />
              Trip Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(15, 23, 42)' }}>
                  Trip Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{ 
                    borderColor: errors.name ? 'rgb(239, 68, 68)' : 'rgb(226, 232, 240)',
                    focusRingColor: 'rgb(34, 139, 34)'
                  }}
                  placeholder="Enter trip name"
                  aria-label="Trip name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm" style={{ color: 'rgb(239, 68, 68)' }}>
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(15, 23, 42)' }}>
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{ 
                    borderColor: errors.startDate ? 'rgb(239, 68, 68)' : 'rgb(226, 232, 240)',
                    focusRingColor: 'rgb(34, 139, 34)'
                  }}
                  aria-label="Start date"
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm" style={{ color: 'rgb(239, 68, 68)' }}>
                    {errors.startDate}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(15, 23, 42)' }}>
                  End Date *
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{ 
                    borderColor: errors.endDate ? 'rgb(239, 68, 68)' : 'rgb(226, 232, 240)',
                    focusRingColor: 'rgb(34, 139, 34)'
                  }}
                  aria-label="End date"
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm" style={{ color: 'rgb(239, 68, 68)' }}>
                    {errors.endDate}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(15, 23, 42)' }}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{ 
                    borderColor: 'rgb(226, 232, 240)',
                    focusRingColor: 'rgb(34, 139, 34)'
                  }}
                  placeholder="Describe your trip..."
                  aria-label="Trip description"
                />
              </div>
            </div>
          </div>

          {/* Location Selection */}
          <div className="bg-white rounded-lg shadow-md border p-6" style={{ borderColor: 'rgb(226, 232, 240)' }}>
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2" style={{ color: 'rgb(15, 23, 42)' }}>
              <MapPin className="w-5 h-5" style={{ color: 'rgb(34, 139, 34)' }} />
              Location *
            </h2>

            <div className="relative">
              {formData.location ? (
                <div className="flex items-center justify-between p-4 border rounded-md" style={{ backgroundColor: 'rgb(248, 250, 252)', borderColor: 'rgb(226, 232, 240)' }}>
                  <div>
                    <h3 className="font-medium" style={{ color: 'rgb(15, 23, 42)' }}>
                      {formData.location.name}
                    </h3>
                    <p className="text-sm" style={{ color: 'rgb(100, 116, 139)' }}>
                      {formData.location.address}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, location: null }))}
                    className="p-1 hover:bg-gray-200 rounded"
                    aria-label="Remove location"
                  >
                    <X className="w-4 h-4" style={{ color: 'rgb(100, 116, 139)' }} />
                  </button>
                </div>
              ) : (
                <div>
                  <button
                    type="button"
                    onClick={() => setShowLocationSearch(!showLocationSearch)}
                    className="w-full flex items-center justify-between p-3 border rounded-md hover:bg-[rgb(255, 255, 255)]"
                    style={{ borderColor: errors.location ? 'rgb(239, 68, 68)' : 'rgb(226, 232, 240)' }}
                    aria-label="Select location"
                  >
                    <span style={{ color: 'rgb(100, 116, 139)' }}>Select a location</span>
                    {showLocationSearch ? (
                      <ChevronDown className="w-4 h-4" style={{ color: 'rgb(100, 116, 139)' }} />
                    ) : (
                      <ChevronRight className="w-4 h-4" style={{ color: 'rgb(100, 116, 139)' }} />
                    )}
                  </button>

                  {showLocationSearch && (
                    <div className="mt-2 border rounded-md" style={{ borderColor: 'rgb(226, 232, 240)' }}>
                      <div className="p-3 border-b" style={{ borderColor: 'rgb(226, 232, 240)' }}>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'rgb(100, 116, 139)' }} />
                          <input
                            type="text"
                            value={locationQuery}
                            onChange={(e) => setLocationQuery(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-offset-2"
                            style={{ 
                              borderColor: 'rgb(226, 232, 240)',
                              focusRingColor: 'rgb(34, 139, 34)'
                            }}
                            placeholder="Search locations..."
                            aria-label="Search locations"
                          />
                        </div>
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {filteredLocations.map((location) => (
                          <button
                            key={location.id}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, location }))
                              setShowLocationSearch(false)
                              setLocationQuery('')
                            }}
                            className="w-full text-left p-3 hover:bg-[rgb(255, 255, 255)] border-b last:border-b-0"
                            style={{ borderColor: 'rgb(226, 232, 240)' }}
                          >
                            <div className="font-medium" style={{ color: 'rgb(15, 23, 42)' }}>
                              {location.name}
                            </div>
                            <div className="text-sm" style={{ color: 'rgb(100, 116, 139)' }}>
                              {location.address}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {errors.location && (
                <p className="mt-1 text-sm" style={{ color: 'rgb(239, 68, 68)' }}>
                  {errors.location}
                </p>
              )}
            </div>
          </div>

          {/* Trip Settings */}
          <div className="bg-white rounded-lg shadow-md border p-6" style={{ borderColor: 'rgb(226, 232, 240)' }}>
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2" style={{ color: 'rgb(15, 23, 42)' }}>
              <Clock className="w-5 h-5" style={{ color: 'rgb(34, 139, 34)' }} />
              Trip Settings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(15, 23, 42)' }}>
                  Difficulty Level
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as 'easy' | 'moderate' | 'hard' }))}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{ 
                    borderColor: 'rgb(226, 232, 240)',
                    focusRingColor: 'rgb(34, 139, 34)'
                  }}
                  aria-label="Difficulty level"
                >
                  <option value="easy">Easy</option>
                  <option value="moderate">Moderate</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(15, 23, 42)' }}>
                  Max Participants
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) || 8 }))}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{ 
                    borderColor: 'rgb(226, 232, 240)',
                    focusRingColor: 'rgb(34, 139, 34)'
                  }}
                  aria-label="Maximum participants"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-3" style={{ color: 'rgb(15, 23, 42)' }}>
                  Vehicle Requirements
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {VEHICLE_OPTIONS.map((option) => (
                    <label key={option} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.vehicleRequirements.includes(option)}
                        onChange={() => toggleVehicleRequirement(option)}
                        className="rounded focus:ring-2 focus:ring-offset-2"
                        style={{ accentColor: 'rgb(34, 139, 34)' }}
                        aria-label={`Vehicle requirement: ${option}`}
                      />
                      <span className="text-sm" style={{ color: 'rgb(15, 23, 42)' }}>
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Group Members */}
          <div className="bg-white rounded-lg shadow-md border p-6" style={{ borderColor: 'rgb(226, 232, 240)' }}>
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2" style={{ color: 'rgb(15, 23, 42)' }}>
              <Users className="w-5 h-5" style={{ color: 'rgb(34, 139, 34)' }} />
              Group Members
            </h2>

            {/* Current Members */}
            {formData.groupMembers.length > 0 && (
              <div className="mb-4 space-y-2">
                {formData.groupMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border rounded-md" style={{ backgroundColor: 'rgb(248, 250, 252)', borderColor: 'rgb(226, 232, 240)' }}>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium" style={{ backgroundColor: 'rgb(34, 139, 34)', color: 'rgb(255, 255, 255)' }}>
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium" style={{ color: 'rgb(15, 23, 42)' }}>
                          {member.name}
                        </div>
                        <div className="text-sm" style={{ color: 'rgb(100, 116, 139)' }}>
                          {member.email}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMember(member.id)}
                      className="p-1 hover:bg-gray-200 rounded"
                      aria-label={`Remove ${member.name}`}
                    >
                      <X className="w-4 h-4" style={{ color: 'rgb(100, 116, 139)' }} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Member */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMemberSearch(!showMemberSearch)}
                className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed rounded-md hover:bg-[rgb(255, 255, 255)]"
                style={{ borderColor: 'rgb(226, 232, 240)' }}
                aria-label="Add group member"
              >
                <Plus className="w-4 h-4" style={{ color: 'rgb(34, 139, 34)' }} />
                <span style={{ color: 'rgb(34, 139, 34)' }}>Add Group Member</span>
              </button>

              {showMemberSearch && (
                <div className="mt-2 border rounded-md" style={{ borderColor: 'rgb(226, 232, 240)' }}>
                  <div className="p-3 border-b" style={{ borderColor: 'rgb(226, 232, 240)' }}>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'rgb(100, 116, 139)' }} />
                      <input
                        type="text"
                        value={memberQuery}
                        onChange={(e) => setMemberQuery(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-offset-2"
                        style={{ 
                          borderColor: 'rgb(226, 232, 240)',
                          focusRingColor: 'rgb(34, 139, 34)'
                        }}
                        placeholder="Search members..."
                        aria-label="Search group members"
                      />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {filteredMembers.map((member) => (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => addMember(member)}
                        className="w-full text-left p-3 hover:bg-[rgb(255, 255, 255)] border-b last:border-b-0 flex items-center space-x-3"
                        style={{ borderColor: 'rgb(226, 232, 240)' }}
                      >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium" style={{ backgroundColor: 'rgb(34, 139, 34)', color: 'rgb(255, 255, 255)' }}>
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium" style={{ color: 'rgb(15, 23, 42)' }}>
                            {member.name}
                          </div>
                          <div className="text-sm" style={{ color: 'rgb(100, 116, 139)' }}>
                            {member.email}
                          </div>
                        </div>
                      </button>
                    ))}
                    {filteredMembers.length === 0 && (
                      <div className="p-3 text-center" style={{ color: 'rgb(100, 116, 139)' }}>
                        No members found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              type="button"
              className="flex-1 px-6 py-3 border rounded-md font-medium hover:bg-[rgb(255, 255, 255)] transition-colors"
              style={{ 
                borderColor: 'rgb(226, 232, 240)',
                color: 'rgb(100, 116, 139)'
              }}
              aria-label="Cancel trip creation"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: 'rgb(34, 139, 34)',
                color: 'rgb(255, 255, 255)'
              }}
              aria-label="Create trip"
            >
              {isSubmitting ? 'Creating Trip...' : 'Create Trip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function CreateTripDemo() {
  return <CreateTrip />
}