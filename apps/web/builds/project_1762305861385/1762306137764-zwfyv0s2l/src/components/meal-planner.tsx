'use client'

import { useState, useEffect } from 'react'
import { Plus, Calendar, Users, Clock, ChefHat, Trash2, Edit3, Check, X } from 'lucide-react'

interface Meal {
  id: string
  name: string
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  date: string
  time: string
  assignedTo: string[]
  ingredients: string[]
  servings: number
  notes?: string
  status: 'planned' | 'in-progress' | 'completed'
}

interface GroupMember {
  id: string
  name: string
  avatar?: string
}

interface MealPlannerProps {
  tripId?: string
  groupMembers?: GroupMember[]
  onMealUpdate?: (meal: Meal) => void
  onMealDelete?: (mealId: string) => void
}

const DEFAULT_MEMBERS: GroupMember[] = [
  { id: '1', name: 'Alex Chen' },
  { id: '2', name: 'Sarah Johnson' },
  { id: '3', name: 'Mike Rodriguez' },
  { id: '4', name: 'Emma Davis' }
]

const DEFAULT_MEALS: Meal[] = [
  {
    id: '1',
    name: 'Trail Mix Pancakes',
    type: 'breakfast',
    date: '2024-01-15',
    time: '08:00',
    assignedTo: ['1', '2'],
    ingredients: ['Pancake mix', 'Trail mix', 'Maple syrup', 'Coffee'],
    servings: 6,
    notes: 'Make extra for late risers',
    status: 'planned'
  },
  {
    id: '2',
    name: 'Campfire Chili',
    type: 'lunch',
    date: '2024-01-15',
    time: '12:30',
    assignedTo: ['3'],
    ingredients: ['Ground beef', 'Beans', 'Tomatoes', 'Spices', 'Bread'],
    servings: 6,
    status: 'planned'
  },
  {
    id: '3',
    name: 'Grilled Fish & Vegetables',
    type: 'dinner',
    date: '2024-01-15',
    time: '18:00',
    assignedTo: ['4', '1'],
    ingredients: ['Fresh fish', 'Bell peppers', 'Zucchini', 'Seasoning'],
    servings: 6,
    status: 'planned'
  }
]

export function MealPlanner({
  tripId = 'trip-1',
  groupMembers = DEFAULT_MEMBERS,
  onMealUpdate = () => console.log('Meal updated'),
  onMealDelete = () => console.log('Meal deleted')
}: MealPlannerProps = {}) {
  const [meals, setMeals] = useState<Meal[]>(DEFAULT_MEALS)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingMeal, setEditingMeal] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState('2024-01-15')
  const [newMeal, setNewMeal] = useState<Partial<Meal>>({
    type: 'breakfast',
    date: selectedDate,
    time: '08:00',
    assignedTo: [],
    ingredients: [],
    servings: 4,
    status: 'planned'
  })

  const mealTypes = [
    { value: 'breakfast', label: 'Breakfast', icon: '🌅' },
    { value: 'lunch', label: 'Lunch', icon: '☀️' },
    { value: 'dinner', label: 'Dinner', icon: '🌙' },
    { value: 'snack', label: 'Snack', icon: '🥜' }
  ]

  const filteredMeals = meals.filter(meal => meal.date === selectedDate)

  const handleAddMeal = () => {
    if (!newMeal.name || !newMeal.type) return

    const meal: Meal = {
      id: Date.now().toString(),
      name: newMeal.name,
      type: newMeal.type as Meal['type'],
      date: newMeal.date || selectedDate,
      time: newMeal.time || '08:00',
      assignedTo: newMeal.assignedTo || [],
      ingredients: newMeal.ingredients || [],
      servings: newMeal.servings || 4,
      notes: newMeal.notes,
      status: 'planned'
    }

    setMeals(prev => [...prev, meal])
    onMealUpdate(meal)
    setShowAddForm(false)
    setNewMeal({
      type: 'breakfast',
      date: selectedDate,
      time: '08:00',
      assignedTo: [],
      ingredients: [],
      servings: 4,
      status: 'planned'
    })
  }

  const handleDeleteMeal = (mealId: string) => {
    setMeals(prev => prev.filter(meal => meal.id !== mealId))
    onMealDelete(mealId)
  }

  const handleStatusUpdate = (mealId: string, status: Meal['status']) => {
    setMeals(prev => prev.map(meal => 
      meal.id === mealId ? { ...meal, status } : meal
    ))
  }

  const getMemberName = (memberId: string) => {
    return groupMembers.find(member => member.id === memberId)?.name || 'Unknown'
  }

  const getStatusColor = (status: Meal['status']) => {
    switch (status) {
      case 'completed': return 'bg-[rgb(34,139,34)] text-white'
      case 'in-progress': return 'bg-[rgb(245,158,11)] text-white'
      default: return 'bg-[rgb(241,245,249)] text-[rgb(15,23,42)]'
    }
  }

  return (
    <div className="min-h-screen bg-[rgb(255,255,255)] font-medium">
      {/* Header */}
      <div className="sticky top-0 bg-[rgb(255,255,255)] border-b border-[rgb(226,232,240)] z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <ChefHat className="w-6 h-6 text-[rgb(34,139,34)]" />
              <h1 className="text-xl font-semibold text-[rgb(15,23,42)]">Meal Planner</h1>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors duration-150 shadow-md active:scale-95"
              aria-label="Add new meal"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Meal</span>
            </button>
          </div>

          {/* Date Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {Array.from({ length: 7 }, (_, i) => {
              const date = new Date('2024-01-15')
              date.setDate(date.getDate() + i)
              const dateStr = date.toISOString().split('T')[0]
              const isSelected = selectedDate === dateStr
              
              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                    isSelected
                      ? 'bg-[rgb(34,139,34)] text-white'
                      : 'bg-[rgb(248,250,252)] text-[rgb(15,23,42)] hover:bg-[rgb(241,245,249)]'
                  }`}
                  aria-label={`Select ${date.toLocaleDateString()}`}
                >
                  <div className="text-center">
                    <div className="text-xs opacity-75">
                      {date.toLocaleDateString('en', { weekday: 'short' })}
                    </div>
                    <div>{date.getDate()}</div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Meal List */}
      <div className="px-4 py-6 space-y-4">
        {filteredMeals.length === 0 ? (
          <div className="text-center py-12">
            <ChefHat className="w-12 h-12 text-[rgb(226,232,240)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[rgb(15,23,42)] mb-2">No meals planned</h3>
            <p className="text-[rgb(100,116,139)] mb-4">Add your first meal for this day</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors duration-150"
            >
              Add Meal
            </button>
          </div>
        ) : (
          filteredMeals
            .sort((a, b) => a.time.localeCompare(b.time))
            .map((meal) => (
              <div
                key={meal.id}
                className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">
                        {mealTypes.find(type => type.value === meal.type)?.icon}
                      </span>
                      <div>
                        <h3 className="text-lg font-semibold text-[rgb(15,23,42)]">{meal.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-[rgb(100,116,139)]">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {meal.time}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {meal.servings} servings
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(meal.status)}`}>
                      {meal.status.replace('-', ' ')}
                    </span>
                    <button
                      onClick={() => handleDeleteMeal(meal.id)}
                      className="p-2 text-[rgb(220,38,38)] hover:bg-[rgb(220,38,38)]/10 rounded-lg transition-colors duration-150"
                      aria-label="Delete meal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Assigned Members */}
                {meal.assignedTo.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-[rgb(15,23,42)] mb-2">Assigned to:</h4>
                    <div className="flex flex-wrap gap-2">
                      {meal.assignedTo.map(memberId => (
                        <span
                          key={memberId}
                          className="px-3 py-1 bg-[rgb(248,250,252)] text-[rgb(15,23,42)] rounded-full text-sm"
                        >
                          {getMemberName(memberId)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ingredients */}
                {meal.ingredients.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-[rgb(15,23,42)] mb-2">Ingredients:</h4>
                    <div className="flex flex-wrap gap-2">
                      {meal.ingredients.map((ingredient, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-[rgb(241,245,249)] text-[rgb(15,23,42)] rounded text-sm"
                        >
                          {ingredient}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {meal.notes && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-[rgb(15,23,42)] mb-1">Notes:</h4>
                    <p className="text-sm text-[rgb(100,116,139)]">{meal.notes}</p>
                  </div>
                )}

                {/* Status Actions */}
                <div className="flex gap-2 pt-4 border-t border-[rgb(226,232,240)]">
                  {meal.status === 'planned' && (
                    <button
                      onClick={() => handleStatusUpdate(meal.id, 'in-progress')}
                      className="flex items-center gap-2 px-3 py-2 bg-[rgb(245,158,11)] text-white rounded-lg hover:bg-[rgb(245,158,11)]/90 transition-colors duration-150 text-sm"
                    >
                      <Clock className="w-4 h-4" />
                      Start Cooking
                    </button>
                  )}
                  {meal.status === 'in-progress' && (
                    <button
                      onClick={() => handleStatusUpdate(meal.id, 'completed')}
                      className="flex items-center gap-2 px-3 py-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors duration-150 text-sm"
                    >
                      <Check className="w-4 h-4" />
                      Mark Complete
                    </button>
                  )}
                </div>
              </div>
            ))
        )}
      </div>

      {/* Add Meal Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-[rgb(255,255,255)] rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[rgb(255,255,255)] border-b border-[rgb(226,232,240)] px-6 py-4 rounded-t-2xl sm:rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[rgb(15,23,42)]">Add New Meal</h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-2 hover:bg-[rgb(241,245,249)] rounded-lg transition-colors duration-150"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Meal Name */}
              <div>
                <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                  Meal Name *
                </label>
                <input
                  type="text"
                  value={newMeal.name || ''}
                  onChange={(e) => setNewMeal(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] placeholder-[rgb(100,116,139)] focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)]/20 transition-colors duration-150"
                  placeholder="Enter meal name"
                />
              </div>

              {/* Meal Type */}
              <div>
                <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                  Meal Type *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {mealTypes.map(type => (
                    <button
                      key={type.value}
                      onClick={() => setNewMeal(prev => ({ ...prev, type: type.value as Meal['type'] }))}
                      className={`flex items-center gap-2 p-3 rounded-lg border transition-colors duration-150 ${
                        newMeal.type === type.value
                          ? 'border-[rgb(34,139,34)] bg-[rgb(34,139,34)]/10 text-[rgb(34,139,34)]'
                          : 'border-[rgb(226,232,240)] hover:border-[rgb(34,139,34)]/50'
                      }`}
                    >
                      <span className="text-lg">{type.icon}</span>
                      <span className="text-sm font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                  Time
                </label>
                <input
                  type="time"
                  value={newMeal.time || '08:00'}
                  onChange={(e) => setNewMeal(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full px-4 py-3 border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)]/20 transition-colors duration-150"
                />
              </div>

              {/* Servings */}
              <div>
                <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                  Servings
                </label>
                <input
                  type="number"
                  min="1"
                  value={newMeal.servings || 4}
                  onChange={(e) => setNewMeal(prev => ({ ...prev, servings: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)]/20 transition-colors duration-150"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                  Notes
                </label>
                <textarea
                  value={newMeal.notes || ''}
                  onChange={(e) => setNewMeal(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] placeholder-[rgb(100,116,139)] focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)]/20 transition-colors duration-150 resize-none"
                  placeholder="Any special instructions or notes..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-3 border border-[rgb(226,232,240)] text-[rgb(15,23,42)] rounded-lg hover:bg-[rgb(241,245,249)] transition-colors duration-150 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMeal}
                  disabled={!newMeal.name || !newMeal.type}
                  className="flex-1 px-4 py-3 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 font-medium"
                >
                  Add Meal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function MealPlannerDemo() {
  return <MealPlanner />
}