'use client'

import { useState } from 'react'
import { Calendar, MapPin, Users, Clock, Mountain, Plus, X } from 'lucide-react'

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

interface CreateTripFormProps {
  onSubmit?: (data: TripFormData) => void
  onCancel?: () => void
  initialData?: Partial<TripFormData>
}

export function CreateTripForm({
  onSubmit = (data) => console.log('Trip created:', data),
  onCancel = () => console.log('Form cancelled'),
  initialData = {}
}: CreateTripFormProps = {}) {
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

  const [newTag, setNewTag] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof TripFormData, string>>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof TripFormData, string>> = {}

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      onSubmit(formData)
    } catch (error) {
      console.error('Failed to create trip:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof TripFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const difficultyOptions = [
    { value: 'easy', label: 'Easy', color: 'bg-green-100 text-green-800 border-green-200' },
    { value: 'moderate', label: 'Moderate', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { value: 'hard', label: 'Hard', color: 'bg-red-100 text-red-800 border-red-200' }
  ]

  return (
    <div className="min-h-screen bg-[rgb(255,255,255)] font-medium">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-[rgb(34,139,34)] rounded-lg">
            <Mountain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[rgb(15,23,42)]">Create New Trip</h1>
            <p className="text-sm text-gray-600">Plan your next off-road adventure</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Trip Name */}
          <div>
            <label htmlFor="tripName" className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
              Trip Name *
            </label>
            <input
              id="tripName"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter trip name"
              className={`w-full px-4 py-3 bg-white border rounded-lg text-[rgb(15,23,42)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent transition-all duration-200 ${
                errors.name ? 'border-[rgb(220,38,38)]' : 'border-[rgb(226,232,240)]'
              }`}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && (
              <p id="name-error" className="mt-1 text-sm text-[rgb(220,38,38)]" role="alert">
                {errors.name}
              </p>
            )}
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
              Location *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                id="location"
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Enter destination"
                className={`w-full pl-11 pr-4 py-3 bg-white border rounded-lg text-[rgb(15,23,42)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent transition-all duration-200 ${
                  errors.location ? 'border-[rgb(220,38,38)]' : 'border-[rgb(226,232,240)]'
                }`}
                aria-describedby={errors.location ? 'location-error' : undefined}
              />
            </div>
            {errors.location && (
              <p id="location-error" className="mt-1 text-sm text-[rgb(220,38,38)]" role="alert">
                {errors.location}
              </p>
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                Start Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full pl-11 pr-4 py-3 bg-white border rounded-lg text-[rgb(15,23,42)] focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent transition-all duration-200 ${
                    errors.startDate ? 'border-[rgb(220,38,38)]' : 'border-[rgb(226,232,240)]'
                  }`}
                  aria-describedby={errors.startDate ? 'start-date-error' : undefined}
                />
              </div>
              {errors.startDate && (
                <p id="start-date-error" className="mt-1 text-sm text-[rgb(220,38,38)]" role="alert">
                  {errors.startDate}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                End Date *
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                  className={`w-full pl-11 pr-4 py-3 bg-white border rounded-lg text-[rgb(15,23,42)] focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent transition-all duration-200 ${
                    errors.endDate ? 'border-[rgb(220,38,38)]' : 'border-[rgb(226,232,240)]'
                  }`}
                  aria-describedby={errors.endDate ? 'end-date-error' : undefined}
                />
              </div>
              {errors.endDate && (
                <p id="end-date-error" className="mt-1 text-sm text-[rgb(220,38,38)]" role="alert">
                  {errors.endDate}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your trip plans, terrain, requirements..."
              rows={4}
              className="w-full px-4 py-3 bg-white border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent transition-all duration-200 resize-none"
            />
          </div>

          {/* Max Participants */}
          <div>
            <label htmlFor="maxParticipants" className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
              Max Participants
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                id="maxParticipants"
                type="number"
                min="1"
                max="50"
                value={formData.maxParticipants}
                onChange={(e) => handleInputChange('maxParticipants', parseInt(e.target.value) || 1)}
                className={`w-full pl-11 pr-4 py-3 bg-white border rounded-lg text-[rgb(15,23,42)] focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent transition-all duration-200 ${
                  errors.maxParticipants ? 'border-[rgb(220,38,38)]' : 'border-[rgb(226,232,240)]'
                }`}
                aria-describedby={errors.maxParticipants ? 'participants-error' : undefined}
              />
            </div>
            {errors.maxParticipants && (
              <p id="participants-error" className="mt-1 text-sm text-[rgb(220,38,38)]" role="alert">
                {errors.maxParticipants}
              </p>
            )}
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-3">
              Difficulty Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {difficultyOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleInputChange('difficulty', option.value)}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:ring-offset-2 ${
                    formData.difficulty === option.value
                      ? `${option.color} border-current`
                      : 'bg-white border-[rgb(226,232,240)] text-gray-600 hover:border-gray-300'
                  }`}
                  aria-pressed={formData.difficulty === option.value}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="newTag" className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-3">
              <input
                id="newTag"
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add tags (e.g., camping, hiking)"
                className="flex-1 px-4 py-3 bg-white border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent transition-all duration-200"
              />
              <button
                type="button"
                onClick={addTag}
                disabled={!newTag.trim()}
                className="px-4 py-3 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:ring-offset-2"
                aria-label="Add tag"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-[rgb(245,247,250)] text-[rgb(15,23,42)] rounded-full text-sm border border-[rgb(226,232,240)]"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="p-0.5 hover:bg-gray-200 rounded-full transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-[rgb(34,139,34)]"
                      aria-label={`Remove ${tag} tag`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 bg-white text-[rgb(15,23,42)] border border-[rgb(226,232,240)] rounded-lg hover:bg-[rgb(248,250,252)] transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:ring-offset-2 shadow-md"
            >
              {isSubmitting ? 'Creating Trip...' : 'Create Trip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function CreateTripFormDemo() {
  return <CreateTripForm />
}