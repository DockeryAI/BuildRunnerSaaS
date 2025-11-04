'use client'

import { useState, useEffect } from 'react'
import { ChefHat, Clock, Users, Plus, Edit2, Trash2, Calendar, MapPin } from 'lucide-react'

interface Meal {
  id: string
  name: string
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  day: string
  time: string
  assignedTo: string[]
  ingredients: string[]
  servings: number
  notes?: string
  location?: string
}

interface MenuAPIProps {
  tripId?: string
  meals?: Meal[]
  onMealUpdate?: (meal: Meal) => void
  onMealDelete?: (mealId: string) => void
  onMealCreate?: (meal: Omit<Meal, 'id'>) => void
  groupMembers?: Array<{ id: string; name: string; email: string }>
  readonly?: boolean
}

const DEFAULT_MEALS: Meal[] = [
  {
    id: '1',
    name: 'Trail Mix Pancakes',
    type: 'breakfast',
    day: 'Saturday',
    time: '08:00',
    assignedTo: ['john-doe', 'jane-smith'],
    ingredients: ['Pancake mix', 'Trail mix', 'Maple syrup', 'Butter'],
    servings: 8,
    notes: 'Cook on camp stove, serve hot',
    location: 'Base camp'
  },
  {
    id: '2',
    name: 'Grilled Sandwiches',
    type: 'lunch',
    day: 'Saturday',
    time: '12:30',
    assignedTo: ['mike-wilson'],
    ingredients: ['Bread', 'Ham', 'Cheese', 'Tomatoes', 'Lettuce'],
    servings: 8,
    notes: 'Use portable grill',
    location: 'Trail stop'
  },
  {
    id: '3',
    name: 'Campfire Chili',
    type: 'dinner',
    day: 'Saturday',
    time: '18:00',
    assignedTo: ['sarah-jones', 'tom-brown'],
    ingredients: ['Ground beef', 'Beans', 'Tomatoes', 'Onions', 'Spices'],
    servings: 8,
    notes: 'Slow cook over fire, serve with cornbread',
    location: 'Base camp'
  }
]

const DEFAULT_GROUP_MEMBERS = [
  { id: 'john-doe', name: 'John Doe', email: 'john@example.com' },
  { id: 'jane-smith', name: 'Jane Smith', email: 'jane@example.com' },
  { id: 'mike-wilson', name: 'Mike Wilson', email: 'mike@example.com' },
  { id: 'sarah-jones', name: 'Sarah Jones', email: 'sarah@example.com' },
  { id: 'tom-brown', name: 'Tom Brown', email: 'tom@example.com' }
]

export function MenuAPI({
  tripId = 'demo-trip',
  meals = DEFAULT_MEALS,
  onMealUpdate = (meal) => console.log('Update meal:', meal),
  onMealDelete = (mealId) => console.log('Delete meal:', mealId),
  onMealCreate = (meal) => console.log('Create meal:', meal),
  groupMembers = DEFAULT_GROUP_MEMBERS,
  readonly = false
}: MenuAPIProps = {}) {
  const [currentMeals, setCurrentMeals] = useState<Meal[]>(meals)
  const [selectedDay, setSelectedDay] = useState<string>('Saturday')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null)
  const [loading, setLoading] = useState(false)

  const days = ['Friday', 'Saturday', 'Sunday']
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'] as const

  const getMealsByDay = (day: string) => {
    return currentMeals
      .filter(meal => meal.day === day)
      .sort((a, b) => a.time.localeCompare(b.time))
  }

  const getMealTypeColor = (type: string) => {
    switch (type) {
      case 'breakfast': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'lunch': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'dinner': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'snack': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-[rgb(241, 245, 249)] text-gray-800 border-[rgb(226, 232, 240)]'
    }
  }

  const getMemberName = (memberId: string) => {
    const member = groupMembers.find(m => m.id === memberId)
    return member ? member.name : memberId
  }

  const handleCreateMeal = async (mealData: Omit<Meal, 'id'>) => {
    setLoading(true)
    try {
      const newMeal: Meal = {
        ...mealData,
        id: `meal-${Date.now()}`
      }
      setCurrentMeals(prev => [...prev, newMeal])
      onMealCreate(mealData)
      setShowCreateForm(false)
    } catch (error) {
      console.error('Error creating meal:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateMeal = async (meal: Meal) => {
    setLoading(true)
    try {
      setCurrentMeals(prev => prev.map(m => m.id === meal.id ? meal : m))
      onMealUpdate(meal)
      setEditingMeal(null)
    } catch (error) {
      console.error('Error updating meal:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMeal = async (mealId: string) => {
    if (!confirm('Are you sure you want to delete this meal?')) return
    
    setLoading(true)
    try {
      setCurrentMeals(prev => prev.filter(m => m.id !== mealId))
      onMealDelete(mealId)
    } catch (error) {
      console.error('Error deleting meal:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6 font-medium" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: 'rgb(34, 139, 34)' }}>
            <ChefHat className="w-6 h-6" style={{ color: 'rgb(255, 255, 255)' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'rgb(15, 23, 42)' }}>
              Trip Menu
            </h1>
            <p className="text-sm" style={{ color: 'rgb(100, 116, 139)' }}>
              Plan and manage meals for your off-road adventure
            </p>
          </div>
        </div>
        
        {!readonly && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors min-h-[44px]"
            style={{ 
              backgroundColor: 'rgb(34, 139, 34)',
              color: 'rgb(255, 255, 255)'
            }}
            aria-label="Add new meal"
          >
            <Plus className="w-4 h-4" />
            Add Meal
          </button>
        )}
      </div>

      {/* Day Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {days.map(day => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors min-h-[44px] ${
              selectedDay === day
                ? 'text-white'
                : 'border'
            }`}
            style={{
              backgroundColor: selectedDay === day ? 'rgb(34, 139, 34)' : 'rgb(255, 255, 255)',
              color: selectedDay === day ? 'rgb(255, 255, 255)' : 'rgb(15, 23, 42)',
              borderColor: selectedDay === day ? 'transparent' : 'rgb(226, 232, 240)'
            }}
            aria-label={`View meals for ${day}`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Meals List */}
      <div className="space-y-4">
        {getMealsByDay(selectedDay).length === 0 ? (
          <div className="text-center py-12 rounded-lg border-2 border-dashed" style={{ borderColor: 'rgb(226, 232, 240)' }}>
            <ChefHat className="w-12 h-12 mx-auto mb-4" style={{ color: 'rgb(148, 163, 184)' }} />
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'rgb(15, 23, 42)' }}>
              No meals planned for {selectedDay}
            </h3>
            <p className="mb-4" style={{ color: 'rgb(100, 116, 139)' }}>
              Add your first meal to get started with meal planning
            </p>
            {!readonly && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-4 py-2 rounded-lg font-medium transition-colors"
                style={{ 
                  backgroundColor: 'rgb(34, 139, 34)',
                  color: 'rgb(255, 255, 255)'
                }}
              >
                Add First Meal
              </button>
            )}
          </div>
        ) : (
          getMealsByDay(selectedDay).map(meal => (
            <div
              key={meal.id}
              className="p-6 rounded-lg border shadow-md"
              style={{ 
                backgroundColor: 'rgb(255, 255, 255)',
                borderColor: 'rgb(226, 232, 240)'
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-semibold" style={{ color: 'rgb(15, 23, 42)' }}>
                      {meal.name}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getMealTypeColor(meal.type)}`}>
                      {meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: 'rgb(100, 116, 139)' }}>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {meal.time}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {meal.servings} servings
                    </div>
                    {meal.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {meal.location}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium" style={{ color: 'rgb(15, 23, 42)' }}>
                        Assigned to:
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {meal.assignedTo.map(memberId => (
                          <span
                            key={memberId}
                            className="px-2 py-1 text-xs rounded-full"
                            style={{ 
                              backgroundColor: 'rgb(241, 245, 249)',
                              color: 'rgb(15, 23, 42)'
                            }}
                          >
                            {getMemberName(memberId)}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-sm font-medium" style={{ color: 'rgb(15, 23, 42)' }}>
                        Ingredients:
                      </span>
                      <p className="text-sm mt-1" style={{ color: 'rgb(100, 116, 139)' }}>
                        {meal.ingredients.join(', ')}
                      </p>
                    </div>

                    {meal.notes && (
                      <div>
                        <span className="text-sm font-medium" style={{ color: 'rgb(15, 23, 42)' }}>
                          Notes:
                        </span>
                        <p className="text-sm mt-1" style={{ color: 'rgb(100, 116, 139)' }}>
                          {meal.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {!readonly && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingMeal(meal)}
                      className="p-2 rounded-lg border transition-colors min-h-[44px] min-w-[44px]"
                      style={{ 
                        backgroundColor: 'rgb(255, 255, 255)',
                        borderColor: 'rgb(226, 232, 240)',
                        color: 'rgb(100, 116, 139)'
                      }}
                      aria-label={`Edit ${meal.name}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteMeal(meal.id)}
                      className="p-2 rounded-lg border transition-colors min-h-[44px] min-w-[44px]"
                      style={{ 
                        backgroundColor: 'rgb(255, 255, 255)',
                        borderColor: 'rgb(226, 232, 240)',
                        color: 'rgb(239, 68, 68)'
                      }}
                      aria-label={`Delete ${meal.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Meal Modal */}
      {(showCreateForm || editingMeal) && (
        <MealForm
          meal={editingMeal}
          groupMembers={groupMembers}
          days={days}
          onSubmit={editingMeal ? handleUpdateMeal : handleCreateMeal}
          onCancel={() => {
            setShowCreateForm(false)
            setEditingMeal(null)
          }}
          loading={loading}
        />
      )}
    </div>
  )
}

interface MealFormProps {
  meal?: Meal | null
  groupMembers: Array<{ id: string; name: string; email: string }>
  days: string[]
  onSubmit: (meal: any) => void
  onCancel: () => void
  loading: boolean
}

function MealForm({ meal, groupMembers, days, onSubmit, onCancel, loading }: MealFormProps) {
  const [formData, setFormData] = useState({
    name: meal?.name || '',
    type: meal?.type || 'breakfast' as const,
    day: meal?.day || 'Saturday',
    time: meal?.time || '08:00',
    assignedTo: meal?.assignedTo || [],
    ingredients: meal?.ingredients?.join(', ') || '',
    servings: meal?.servings || 4,
    notes: meal?.notes || '',
    location: meal?.location || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const mealData = {
      ...formData,
      ingredients: formData.ingredients.split(',').map(i => i.trim()).filter(Boolean)
    }

    if (meal) {
      onSubmit({ ...meal, ...mealData })
    } else {
      onSubmit(mealData)
    }
  }

  const toggleAssignment = (memberId: string) => {
    setFormData(prev => ({
      ...prev,
      assignedTo: prev.assignedTo.includes(memberId)
        ? prev.assignedTo.filter(id => id !== memberId)
        : [...prev.assignedTo, memberId]
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div 
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg shadow-lg"
        style={{ backgroundColor: 'rgb(255, 255, 255)' }}
      >
        <div className="p-6">
          <h2 className="text-xl font-bold mb-6" style={{ color: 'rgb(15, 23, 42)' }}>
            {meal ? 'Edit Meal' : 'Add New Meal'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(15, 23, 42)' }}>
                  Meal Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{ 
                    borderColor: 'rgb(226, 232, 240)',
                    focusRingColor: 'rgb(34, 139, 34)'
                  }}
                  required
                  aria-label="Meal name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(15, 23, 42)' }}>
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{ 
                    borderColor: 'rgb(226, 232, 240)',
                    focusRingColor: 'rgb(34, 139, 34)'
                  }}
                  aria-label="Meal type"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(15, 23, 42)' }}>
                  Day
                </label>
                <select
                  value={formData.day}
                  onChange={(e) => setFormData(prev => ({ ...prev, day: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{ 
                    borderColor: 'rgb(226, 232, 240)',
                    focusRingColor: 'rgb(34, 139, 34)'
                  }}
                  aria-label="Day"
                >
                  {days.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(15, 23, 42)' }}>
                  Time
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{ 
                    borderColor: 'rgb(226, 232, 240)',
                    focusRingColor: 'rgb(34, 139, 34)'
                  }}
                  required
                  aria-label="Meal time"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(15, 23, 42)' }}>
                  Servings
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.servings}
                  onChange={(e) => setFormData(prev => ({ ...prev, servings: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{ 
                    borderColor: 'rgb(226, 232, 240)',
                    focusRingColor: 'rgb(34, 139, 34)'
                  }}
                  required
                  aria-label="Number of servings"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(15, 23, 42)' }}>
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{ 
                    borderColor: 'rgb(226, 232, 240)',
                    focusRingColor: 'rgb(34, 139, 34)'
                  }}
                  placeholder="e.g., Base camp, Trail stop"
                  aria-label="Meal location"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(15, 23, 42)' }}>
                Assigned To
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {groupMembers.map(member => (
                  <label
                    key={member.id}
                    className="flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors"
                    style={{ 
                      backgroundColor: formData.assignedTo.includes(member.id) 
                        ? 'rgb(241, 245, 249)' 
                        : 'rgb(255, 255, 255)',
                      borderColor: formData.assignedTo.includes(member.id)
                        ? 'rgb(34, 139, 34)'
                        : 'rgb(226, 232, 240)'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.assignedTo.includes(member.id)}
                      onChange={() => toggleAssignment(member.id)}
                      className="sr-only"
                    />
                    <div 
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        formData.assignedTo.includes(member.id) ? 'border-green-600' : 'border-gray-300'
                      }`}
                      style={{
                        backgroundColor: formData.assignedTo.includes(member.id) ? 'rgb(34, 139, 34)' : 'transparent'
                      }}
                    >
                      {formData.assignedTo.includes(member.id) && (
                        <div className="w-2 h-2 bg-white rounded-sm" />
                      )}
                    </div>
                    <span className="text-sm" style={{ color: 'rgb(15, 23, 42)' }}>
                      {member.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(15, 23, 42)' }}>
                Ingredients (comma-separated)
              </label>
              <textarea
                value={formData.ingredients}
                onChange={(e) => setFormData(prev => ({ ...prev, ingredients: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{ 
                  borderColor: 'rgb(226, 232, 240)',
                  focusRingColor: 'rgb(34, 139, 34)'
                }}
                rows={3}
                placeholder="e.g., Ground beef, Beans, Tomatoes, Onions"
                required
                aria-label="Meal ingredients"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(15, 23, 42)' }}>
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{ 
                  borderColor: 'rgb(226, 232, 240)',
                  focusRingColor: 'rgb(34, 139, 34)'
                }}
                rows={2}
                placeholder="Cooking instructions, special requirements, etc."
                aria-label="Meal notes"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 min-h-[44px]"
                style={{ 
                  backgroundColor: 'rgb(34, 139, 34)',
                  color: 'rgb(255, 255, 255)'
                }}
              >
                {loading ? 'Saving...' : (meal ? 'Update Meal' : 'Add Meal')}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2 rounded-lg font-medium border transition-colors min-h-[44px]"
                style={{ 
                  backgroundColor: 'rgb(255, 255, 255)',
                  borderColor: 'rgb(226, 232, 240)',
                  color: 'rgb(15, 23, 42)'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function MenuAPIDemo() {
  return <MenuAPI />
}