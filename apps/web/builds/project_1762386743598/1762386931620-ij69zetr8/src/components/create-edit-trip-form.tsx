'use client'

import { useState } from 'react'
import { Calendar, MapPin, Users, Clock, Save, X, Plus, Trash2 } from 'lucide-react'

interface TripFormData {
  name: string
  description: string
  location: string
  startDate: string
  endDate: string
  maxParticipants: number
  difficulty: 'easy' | 'moderate' | 'hard' | 'expert'
  tags: string[]
}

interface CreateEditTripFormProps {
  initialData?: Partial<TripFormData>
  onSubmit?: (data: TripFormData) => void
  onCancel?: () => void
  isEditing?: boolean
}

export function CreateEditTripForm({
  initialData = {},
  onSubmit = () => console.log('Trip submitted'),
  onCancel = () => console.log('Form cancelled'),
  isEditing = false
}: CreateEditTripFormProps = {}) {
  const [formData, setFormData] = useState<TripFormData>({
    name: initialData.name || '',
    description: initialData.description || '',
    location: initialData.location || '',
    startDate: initialData.startDate || '',
    endDate: initialData.endDate || '',
    maxParticipants: initialData.maxParticipants || 8,
    difficulty: initialData.difficulty || 'moderate',
    tags: initialData.tags || []
  })

  const [newTag, setNewTag] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof TripFormData, string>>>({})

  const difficultyOptions = [
    { value: 'easy', label: 'Easy', color: 'bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:text-primary dark:border-primary/30' },
    { value: 'moderate', label: 'Moderate', color: 'bg-accent/10 text-accent border-accent/20 dark:bg-accent/20 dark:text-accent dark:border-accent/30' },
    { value: 'hard', label: 'Hard', color: 'bg-secondary/10 text-secondary border-secondary/20 dark:bg-secondary/20 dark:text-secondary dark:border-secondary/30' },
    { value: 'expert', label: 'Expert', color: 'bg-destructive/10 text-destructive border-destructive/20 dark:bg-destructive/20 dark:text-destructive dark:border-destructive/30' }
  ]

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
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      onSubmit(formData)
    } catch (error) {
      console.error('Error submitting trip:', error)
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <div className="min-h-screen bg-background dark:bg-background p-4 font-sans">
      <div className="max-w-2xl mx-auto">
        <div className="bg-surface dark:bg-surface rounded-2xl border border-border dark:border-border shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between p-6 border-b border-border dark:border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary dark:text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground dark:text-foreground">
                  {isEditing ? 'Edit Trip' : 'Create New Trip'}
                </h1>
                <p className="text-sm text-mutedForeground dark:text-mutedForeground">
                  Plan your next off-road adventure
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="w-10 h-10 bg-muted dark:bg-muted hover:bg-muted/80 dark:hover:bg-muted/80 rounded-xl flex items-center justify-center transition-all duration-150 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring"
              aria-label="Close form"
            >
              <X className="w-5 h-5 text-mutedForeground dark:text-mutedForeground" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-2">
              <label htmlFor="trip-name" className="block text-sm font-medium text-foreground dark:text-foreground">
                Trip Name *
              </label>
              <input
                id="trip-name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-3 bg-background dark:bg-background border border-border dark:border-border rounded-xl text-foreground dark:text-foreground placeholder-mutedForeground dark:placeholder-mutedForeground focus:border-ring dark:focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:focus:ring-ring/50 transition-all duration-200"
                placeholder="Enter trip name"
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errors.name && (
                <p id="name-error" className="text-sm text-destructive dark:text-destructive" role="alert">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="location" className="block text-sm font-medium text-foreground dark:text-foreground">
                Location *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-mutedForeground dark:text-mutedForeground" />
                <input
                  id="location"
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-background dark:bg-background border border-border dark:border-border rounded-xl text-foreground dark:text-foreground placeholder-mutedForeground dark:placeholder-mutedForeground focus:border-ring dark:focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:focus:ring-ring/50 transition-all duration-200"
                  placeholder="Enter trail or location"
                  aria-describedby={errors.location ? 'location-error' : undefined}
                />
              </div>
              {errors.location && (
                <p id="location-error" className="text-sm text-destructive dark:text-destructive" role="alert">
                  {errors.location}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="start-date" className="block text-sm font-medium text-foreground dark:text-foreground">
                  Start Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-mutedForeground dark:text-mutedForeground" />
                  <input
                    id="start-date"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-background dark:bg-background border border-border dark:border-border rounded-xl text-foreground dark:text-foreground focus:border-ring dark:focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:focus:ring-ring/50 transition-all duration-200"
                    aria-describedby={errors.startDate ? 'start-date-error' : undefined}
                  />
                </div>
                {errors.startDate && (
                  <p id="start-date-error" className="text-sm text-destructive dark:text-destructive" role="alert">
                    {errors.startDate}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="end-date" className="block text-sm font-medium text-foreground dark:text-foreground">
                  End Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-mutedForeground dark:text-mutedForeground" />
                  <input
                    id="end-date"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-background dark:bg-background border border-border dark:border-border rounded-xl text-foreground dark:text-foreground focus:border-ring dark:focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:focus:ring-ring/50 transition-all duration-200"
                    aria-describedby={errors.endDate ? 'end-date-error' : undefined}
                  />
                </div>
                {errors.endDate && (
                  <p id="end-date-error" className="text-sm text-destructive dark:text-destructive" role="alert">
                    {errors.endDate}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-medium text-foreground dark:text-foreground">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-background dark:bg-background border border-border dark:border-border rounded-xl text-foreground dark:text-foreground placeholder-mutedForeground dark:placeholder-mutedForeground focus:border-ring dark:focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:focus:ring-ring/50 transition-all duration-200 resize-none"
                placeholder="Describe your trip, terrain, requirements..."
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="max-participants" className="block text-sm font-medium text-foreground dark:text-foreground">
                Max Participants
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-mutedForeground dark:text-mutedForeground" />
                <input
                  id="max-participants"
                  type="number"
                  min="1"
                  max="50"
                  value={formData.maxParticipants}
                  onChange={(e) => handleInputChange('maxParticipants', parseInt(e.target.value) || 1)}
                  className="w-full pl-12 pr-4 py-3 bg-background dark:bg-background border border-border dark:border-border rounded-xl text-foreground dark:text-foreground focus:border-ring dark:focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:focus:ring-ring/50 transition-all duration-200"
                  aria-describedby={errors.maxParticipants ? 'participants-error' : undefined}
                />
              </div>
              {errors.maxParticipants && (
                <p id="participants-error" className="text-sm text-destructive dark:text-destructive" role="alert">
                  {errors.maxParticipants}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-foreground dark:text-foreground">
                Difficulty Level
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {difficultyOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleInputChange('difficulty', option.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all duration-150 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring/50 ${
                      formData.difficulty === option.value
                        ? option.color
                        : 'bg-muted dark:bg-muted text-mutedForeground dark:text-mutedForeground border-border dark:border-border hover:bg-muted/80 dark:hover:bg-muted/80'
                    }`}
                    aria-label={`Select ${option.label} difficulty`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label htmlFor="new-tag" className="block text-sm font-medium text-foreground dark:text-foreground">
                Tags
              </label>
              <div className="flex gap-2">
                <input
                  id="new-tag"
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 px-4 py-2 bg-background dark:bg-background border border-border dark:border-border rounded-lg text-foreground dark:text-foreground placeholder-mutedForeground dark:placeholder-mutedForeground focus:border-ring dark:focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:focus:ring-ring/50 transition-all duration-200"
                  placeholder="Add a tag"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-primary dark:bg-primary hover:bg-primary/90 dark:hover:bg-primary/90 text-primaryForeground dark:text-primaryForeground rounded-lg transition-all duration-150 flex items-center gap-2 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring"
                  aria-label="Add tag"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-muted dark:bg-muted text-foreground dark:text-foreground rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="w-4 h-4 hover:bg-muted/80 dark:hover:bg-muted/80 rounded-full flex items-center justify-center transition-all duration-150 hover:scale-110 active:scale-90 focus:outline-none focus:ring-1 focus:ring-ring/50"
                        aria-label={`Remove ${tag} tag`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-6 py-3 bg-muted dark:bg-muted hover:bg-muted/80 dark:hover:bg-muted/80 text-foreground dark:text-foreground rounded-xl transition-all duration-150 font-medium hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring"
                aria-label="Cancel form"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-primary dark:bg-primary hover:bg-primary/90 dark:hover:bg-primary/90 disabled:bg-primary/50 dark:disabled:bg-primary/50 text-primaryForeground dark:text-primaryForeground rounded-xl transition-all duration-150 font-medium flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring"
                aria-label={isEditing ? 'Update trip' : 'Create trip'}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primaryForeground/30 dark:border-primaryForeground/30 border-t-primaryForeground dark:border-t-primaryForeground rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {isEditing ? 'Update Trip' : 'Create Trip'}
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

export default function CreateEditTripFormDemo() {
  const [showForm, setShowForm] = useState(true)

  const handleSubmit = (data: TripFormData) => {
    console.log('Trip data:', data)
    alert('Trip created successfully!')
    setShowForm(false)
  }

  const handleCancel = () => {
    setShowForm(false)
  }

  if (!showForm) {
    return (
      <div className="min-h-screen bg-background dark:bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-full mx-auto mb-4 flex items-center justify-center">
            <MapPin className="w-8 h-8 text-primary dark:text-primary" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground dark:text-foreground mb-2">Trip Created!</h2>
          <p className="text-mutedForeground dark:text-mutedForeground text-sm mb-6">Your adventure is ready to begin</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 bg-primary dark:bg-primary hover:bg-primary/90 dark:hover:bg-primary/90 text-primaryForeground dark:text-primaryForeground rounded-xl transition-all duration-150 font-medium hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring"
            aria-label="Create another trip"
          >
            Create Another Trip
          </button>
        </div>
      </div>
    )
  }

  return (
    <CreateEditTripForm
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  )
}