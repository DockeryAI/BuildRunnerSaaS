'use client'

import { useState } from 'react'
import { Calendar, MapPin, Users, Clock, Camera, Plus, X } from 'lucide-react'

interface TripFormData {
  name: string
  location: string
  startDate: string
  endDate: string
  description: string
  maxParticipants: number
  difficulty: 'easy' | 'moderate' | 'hard'
  tags: string[]
}

interface TripFormProps {
  onSubmit?: (data: TripFormData) => void
  initialData?: Partial<TripFormData>
  isLoading?: boolean
}

const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Easy', color: 'bg-green-100 text-green-800' },
  { value: 'moderate', label: 'Moderate', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'hard', label: 'Hard', color: 'bg-red-100 text-red-800' }
] as const

const POPULAR_TAGS = [
  'Camping', 'Rock Crawling', 'Scenic Views', 'Photography', 
  'Beginner Friendly', 'Advanced Trails', 'Water Crossing', 'Desert'
]

export function TripForm({
  onSubmit = (data) => console.log('Trip submitted:', data),
  initialData = {},
  isLoading = false
}: TripFormProps = {}) {
  const [formData, setFormData] = useState<TripFormData>({
    name: '',
    location: '',
    startDate: '',
    endDate: '',
    description: '',
    maxParticipants: 8,
    difficulty: 'moderate',
    tags: [],
    ...initialData
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [customTag, setCustomTag] = useState('')

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Trip name is required'
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required'
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required'
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required'
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date'
    }

    if (formData.maxParticipants < 1 || formData.maxParticipants > 50) {
      newErrors.maxParticipants = 'Participants must be between 1 and 50'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const updateField = (field: keyof TripFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      updateField('tags', [...formData.tags, tag])
    }
  }

  const removeTag = (tagToRemove: string) => {
    updateField('tags', formData.tags.filter(tag => tag !== tagToRemove))
  }

  const addCustomTag = () => {
    if (customTag.trim()) {
      addTag(customTag.trim())
      setCustomTag('')
    }
  }

  return (
    <div className="min-h-screen bg-[#ffffff] font-medium">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-[#ffffff] rounded-xl border border-[#e2e8f0] shadow-md p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#228b22] rounded-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-[#ffffff]" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-[#0f172a]">Plan New Trip</h1>
              <p className="text-sm text-gray-600">Create an off-roading adventure</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Trip Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#0f172a] mb-2">
                Trip Name *
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="e.g., Moab Desert Adventure"
                className="w-full px-4 py-3 bg-[#ffffff] border border-[#e2e8f0] rounded-lg text-[#0f172a] placeholder-gray-400 focus:border-[#228b22] focus:outline-none focus:ring-2 focus:ring-[#228b22]/20 transition-all duration-150"
                aria-describedby={errors.name ? "name-error" : undefined}
              />
              {errors.name && (
                <p id="name-error" className="mt-1 text-sm text-[#dc2626]" role="alert">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-[#0f172a] mb-2">
                Location *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => updateField('location', e.target.value)}
                  placeholder="e.g., Moab, Utah"
                  className="w-full pl-10 pr-4 py-3 bg-[#ffffff] border border-[#e2e8f0] rounded-lg text-[#0f172a] placeholder-gray-400 focus:border-[#228b22] focus:outline-none focus:ring-2 focus:ring-[#228b22]/20 transition-all duration-150"
                  aria-describedby={errors.location ? "location-error" : undefined}
                />
              </div>
              {errors.location && (
                <p id="location-error" className="mt-1 text-sm text-[#dc2626]" role="alert">
                  {errors.location}
                </p>
              )}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-[#0f172a] mb-2">
                  Start Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => updateField('startDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-4 py-3 bg-[#ffffff] border border-[#e2e8f0] rounded-lg text-[#0f172a] focus:border-[#228b22] focus:outline-none focus:ring-2 focus:ring-[#228b22]/20 transition-all duration-150"
                    aria-describedby={errors.startDate ? "startDate-error" : undefined}
                  />
                </div>
                {errors.startDate && (
                  <p id="startDate-error" className="mt-1 text-sm text-[#dc2626]" role="alert">
                    {errors.startDate}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-[#0f172a] mb-2">
                  End Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => updateField('endDate', e.target.value)}
                    min={formData.startDate || new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-4 py-3 bg-[#ffffff] border border-[#e2e8f0] rounded-lg text-[#0f172a] focus:border-[#228b22] focus:outline-none focus:ring-2 focus:ring-[#228b22]/20 transition-all duration-150"
                    aria-describedby={errors.endDate ? "endDate-error" : undefined}
                  />
                </div>
                {errors.endDate && (
                  <p id="endDate-error" className="mt-1 text-sm text-[#dc2626]" role="alert">
                    {errors.endDate}
                  </p>
                )}
              </div>
            </div>

            {/* Difficulty & Participants */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="difficulty" className="block text-sm font-medium text-[#0f172a] mb-2">
                  Difficulty Level
                </label>
                <select
                  id="difficulty"
                  value={formData.difficulty}
                  onChange={(e) => updateField('difficulty', e.target.value as TripFormData['difficulty'])}
                  className="w-full px-4 py-3 bg-[#ffffff] border border-[#e2e8f0] rounded-lg text-[#0f172a] focus:border-[#228b22] focus:outline-none focus:ring-2 focus:ring-[#228b22]/20 transition-all duration-150"
                >
                  {DIFFICULTY_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="maxParticipants" className="block text-sm font-medium text-[#0f172a] mb-2">
                  Max Participants
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="maxParticipants"
                    type="number"
                    min="1"
                    max="50"
                    value={formData.maxParticipants}
                    onChange={(e) => updateField('maxParticipants', parseInt(e.target.value) || 1)}
                    className="w-full pl-10 pr-4 py-3 bg-[#ffffff] border border-[#e2e8f0] rounded-lg text-[#0f172a] focus:border-[#228b22] focus:outline-none focus:ring-2 focus:ring-[#228b22]/20 transition-all duration-150"
                    aria-describedby={errors.maxParticipants ? "maxParticipants-error" : undefined}
                  />
                </div>
                {errors.maxParticipants && (
                  <p id="maxParticipants-error" className="mt-1 text-sm text-[#dc2626]" role="alert">
                    {errors.maxParticipants}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-[#0f172a] mb-2">
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Describe the trip, what to expect, what to bring..."
                className="w-full px-4 py-3 bg-[#ffffff] border border-[#e2e8f0] rounded-lg text-[#0f172a] placeholder-gray-400 focus:border-[#228b22] focus:outline-none focus:ring-2 focus:ring-[#228b22]/20 transition-all duration-150 resize-none"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-[#0f172a] mb-2">
                Tags
              </label>
              
              {/* Selected Tags */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-[#228b22]/10 text-[#228b22] rounded-full text-sm border border-[#228b22]/20"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="w-4 h-4 rounded-full hover:bg-[#228b22]/20 flex items-center justify-center transition-colors duration-150"
                        aria-label={`Remove ${tag} tag`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Popular Tags */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                {POPULAR_TAGS.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => addTag(tag)}
                    disabled={formData.tags.includes(tag)}
                    className={`px-3 py-2 text-sm rounded-lg border transition-all duration-150 ${
                      formData.tags.includes(tag)
                        ? 'bg-[#f1f5f9] text-gray-400 border-[#e2e8f0] cursor-not-allowed'
                        : 'bg-[#ffffff] text-[#0f172a] border-[#e2e8f0] hover:border-[#228b22] hover:bg-[#228b22]/5'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Custom Tag Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())}
                  placeholder="Add custom tag..."
                  className="flex-1 px-4 py-2 bg-[#ffffff] border border-[#e2e8f0] rounded-lg text-[#0f172a] placeholder-gray-400 focus:border-[#228b22] focus:outline-none focus:ring-2 focus:ring-[#228b22]/20 transition-all duration-150"
                />
                <button
                  type="button"
                  onClick={addCustomTag}
                  disabled={!customTag.trim()}
                  className="px-4 py-2 bg-[#228b22] text-[#ffffff] rounded-lg hover:bg-[#1e7a1e] transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[44px]"
                  aria-label="Add custom tag"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-4 bg-[#228b22] text-[#ffffff] rounded-lg hover:bg-[#1e7a1e] transition-all duration-150 font-medium shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[56px]"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Trip...
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5" />
                    Create Trip
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// Demo component for page.tsx
export default function TripFormDemo() {
  const handleSubmit = (data: TripFormData) => {
    console.log('Trip created:', data)
    // Simulate API call
    setTimeout(() => {
      alert('Trip created successfully!')
    }, 1000)
  }

  return (
    <TripForm 
      onSubmit={handleSubmit}
      initialData={{
        difficulty: 'moderate',
        maxParticipants: 6
      }}
    />
  )
}