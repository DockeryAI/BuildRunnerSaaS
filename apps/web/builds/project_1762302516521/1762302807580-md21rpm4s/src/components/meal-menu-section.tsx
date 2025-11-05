'use client'

import { useState } from 'react'
import { Plus, Clock, Users, ChefHat, Calendar, Edit3, Trash2, Check, X } from 'lucide-react'

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
  status: 'planned' | 'in-progress' | 'completed'
}

interface MealMenuSectionProps {
  tripId?: string
  meals?: Meal[]
  groupMembers?: { id: string; name: string; avatar?: string }[]
  onAddMeal?: (meal: Omit<Meal, 'id'>) => void
  onUpdateMeal?: (id: string, meal: Partial<Meal>) => void
  onDeleteMeal?: (id: string) => void
}

const DEFAULT_MEALS: Meal[] = [
  {
    id: '1',
    name: 'Campfire Breakfast Burritos',
    type: 'breakfast',
    day: 'Saturday',
    time: '8:00 AM',
    assignedTo: ['john', 'sarah'],
    ingredients: ['Eggs', 'Tortillas', 'Cheese', 'Bacon', 'Peppers'],
    servings: 8,
    notes: 'Prep ingredients night before',
    status: 'planned'
  },
  {
    id: '2',
    name: 'Trail Mix & Sandwiches',
    type: 'lunch',
    day: 'Saturday',
    time: '12:30 PM',
    assignedTo: ['mike'],
    ingredients: ['Bread', 'Turkey', 'Cheese', 'Trail Mix', 'Apples'],
    servings: 8,
    status: 'planned'
  },
  {
    id: '3',
    name: 'Grilled Steaks & Veggies',
    type: 'dinner',
    day: 'Saturday',
    time: '6:00 PM',
    assignedTo: ['john', 'alex'],
    ingredients: ['Ribeye Steaks', 'Bell Peppers', 'Zucchini', 'Corn', 'Seasonings'],
    servings: 8,
    notes: 'Marinate steaks 2 hours before',
    status: 'planned'
  },
  {
    id: '4',
    name: 'Pancakes & Coffee',
    type: 'breakfast',
    day: 'Sunday',
    time: '9:00 AM',
    assignedTo: ['sarah'],
    ingredients: ['Pancake Mix', 'Syrup', 'Berries', 'Coffee', 'Milk'],
    servings: 8,
    status: 'planned'
  }
]

const DEFAULT_MEMBERS = [
  { id: 'john', name: 'John D.' },
  { id: 'sarah', name: 'Sarah M.' },
  { id: 'mike', name: 'Mike R.' },
  { id: 'alex', name: 'Alex K.' }
]

export function MealMenuSection({
  tripId = 'trip-1',
  meals = DEFAULT_MEALS,
  groupMembers = DEFAULT_MEMBERS,
  onAddMeal = () => console.log('Add meal'),
  onUpdateMeal = () => console.log('Update meal'),
  onDeleteMeal = () => console.log('Delete meal')
}: MealMenuSectionProps = {}) {
  const [selectedDay, setSelectedDay] = useState('All Days')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingMeal, setEditingMeal] = useState<string | null>(null)
  const [newMeal, setNewMeal] = useState<Partial<Meal>>({
    name: '',
    type: 'breakfast',
    day: 'Saturday',
    time: '',
    assignedTo: [],
    ingredients: [],
    servings: 8,
    notes: '',
    status: 'planned'
  })

  const days = ['All Days', 'Saturday', 'Sunday']
  const mealTypes = [
    { value: 'breakfast', label: 'Breakfast', icon: '🌅' },
    { value: 'lunch', label: 'Lunch', icon: '☀️' },
    { value: 'dinner', label: 'Dinner', icon: '🌙' },
    { value: 'snack', label: 'Snack', icon: '🥨' }
  ]

  const filteredMeals = selectedDay === 'All Days' 
    ? meals 
    : meals.filter(meal => meal.day === selectedDay)

  const groupedMeals = filteredMeals.reduce((acc, meal) => {
    const key = `${meal.day}-${meal.type}`
    if (!acc[key]) acc[key] = []
    acc[key].push(meal)
    return acc
  }, {} as Record<string, Meal[]>)

  const handleAddMeal = () => {
    if (newMeal.name && newMeal.time) {
      onAddMeal(newMeal as Omit<Meal, 'id'>)
      setNewMeal({
        name: '',
        type: 'breakfast',
        day: 'Saturday',
        time: '',
        assignedTo: [],
        ingredients: [],
        servings: 8,
        notes: '',
        status: 'planned'
      })
      setShowAddForm(false)
    }
  }

  const handleStatusUpdate = (mealId: string, status: Meal['status']) => {
    onUpdateMeal(mealId, { status })
  }

  const getMemberName = (memberId: string) => {
    return groupMembers.find(m => m.id === memberId)?.name || memberId
  }

  const getStatusColor = (status: Meal['status']) => {
    switch (status) {
      case 'completed': return 'bg-[rgb(34,139,34)] text-white'
      case 'in-progress': return 'bg-[rgb(249,115,22)] text-white'
      default: return 'bg-[rgb(245,247,250)] text-[rgb(15,23,42)]'
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
              <h1 className="text-xl font-semibold text-[rgb(15,23,42)]">Meal Menu</h1>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg shadow-md active:scale-95 transition-transform"
              aria-label="Add new meal"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">Add Meal</span>
            </button>
          </div>

          {/* Day Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {days.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                  selectedDay === day
                    ? 'bg-[rgb(34,139,34)] text-white'
                    : 'bg-[rgb(248,250,252)] text-[rgb(15,23,42)] hover:bg-[rgb(245,247,250)]'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Meals List */}
      <div className="px-4 py-6 space-y-6">
        {Object.entries(groupedMeals).map(([key, dayMeals]) => {
          const [day, type] = key.split('-')
          const mealType = mealTypes.find(mt => mt.value === type)
          
          return (
            <div key={key} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{mealType?.icon}</span>
                <h2 className="text-lg font-semibold text-[rgb(15,23,42)]">
                  {day} {mealType?.label}
                </h2>
              </div>
              
              {dayMeals.map((meal) => (
                <div
                  key={meal.id}
                  className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-xl p-4 shadow-md"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-[rgb(15,23,42)] mb-1">{meal.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{meal.time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{meal.servings} servings</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(meal.status)}`}>
                        {meal.status.replace('-', ' ')}
                      </span>
                      <button
                        onClick={() => setEditingMeal(editingMeal === meal.id ? null : meal.id)}
                        className="p-2 hover:bg-[rgb(248,250,252)] rounded-lg transition-colors"
                        aria-label="Edit meal"
                      >
                        <Edit3 className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>

                  {/* Assigned Members */}
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-1">Assigned to:</p>
                    <div className="flex flex-wrap gap-2">
                      {meal.assignedTo.map((memberId) => (
                        <span
                          key={memberId}
                          className="px-3 py-1 bg-[rgb(245,247,250)] text-[rgb(15,23,42)] rounded-full text-sm"
                        >
                          {getMemberName(memberId)}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Ingredients */}
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-1">Ingredients:</p>
                    <div className="flex flex-wrap gap-1">
                      {meal.ingredients.map((ingredient, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-[rgb(248,250,252)] text-[rgb(15,23,42)] rounded text-xs"
                        >
                          {ingredient}
                        </span>
                      ))}
                    </div>
                  </div>

                  {meal.notes && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-1">Notes:</p>
                      <p className="text-sm text-[rgb(15,23,42)]">{meal.notes}</p>
                    </div>
                  )}

                  {/* Status Actions */}
                  <div className="flex gap-2 pt-3 border-t border-[rgb(226,232,240)]">
                    {meal.status === 'planned' && (
                      <button
                        onClick={() => handleStatusUpdate(meal.id, 'in-progress')}
                        className="flex-1 py-2 bg-[rgb(249,115,22)] text-white rounded-lg text-sm font-medium active:scale-95 transition-transform"
                      >
                        Start Cooking
                      </button>
                    )}
                    {meal.status === 'in-progress' && (
                      <button
                        onClick={() => handleStatusUpdate(meal.id, 'completed')}
                        className="flex-1 py-2 bg-[rgb(34,139,34)] text-white rounded-lg text-sm font-medium active:scale-95 transition-transform"
                      >
                        Mark Complete
                      </button>
                    )}
                    {meal.status === 'completed' && (
                      <div className="flex-1 py-2 bg-[rgb(34,139,34)] text-white rounded-lg text-sm font-medium text-center">
                        ✓ Completed
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        })}

        {filteredMeals.length === 0 && (
          <div className="text-center py-12">
            <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[rgb(15,23,42)] mb-2">No meals planned</h3>
            <p className="text-gray-600 mb-4">Start planning your adventure meals</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 bg-[rgb(34,139,34)] text-white rounded-lg font-medium active:scale-95 transition-transform"
            >
              Add First Meal
            </button>
          </div>
        )}
      </div>

      {/* Add Meal Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-[rgb(255,255,255)] rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[rgb(255,255,255)] border-b border-[rgb(226,232,240)] px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[rgb(15,23,42)]">Add New Meal</h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-2 hover:bg-[rgb(248,250,252)] rounded-lg transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                  Meal Name *
                </label>
                <input
                  type="text"
                  value={newMeal.name || ''}
                  onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
                  className="w-full px-4 py-3 border border-[rgb(226,232,240)] rounded-lg focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent"
                  placeholder="e.g., Campfire Breakfast"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                    Type
                  </label>
                  <select
                    value={newMeal.type || 'breakfast'}
                    onChange={(e) => setNewMeal({ ...newMeal, type: e.target.value as Meal['type'] })}
                    className="w-full px-4 py-3 border border-[rgb(226,232,240)] rounded-lg focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent"
                  >
                    {mealTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                    Day
                  </label>
                  <select
                    value={newMeal.day || 'Saturday'}
                    onChange={(e) => setNewMeal({ ...newMeal, day: e.target.value })}
                    className="w-full px-4 py-3 border border-[rgb(226,232,240)] rounded-lg focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent"
                  >
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                    Time *
                  </label>
                  <input
                    type="time"
                    value={newMeal.time || ''}
                    onChange={(e) => setNewMeal({ ...newMeal, time: e.target.value })}
                    className="w-full px-4 py-3 border border-[rgb(226,232,240)] rounded-lg focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                    Servings
                  </label>
                  <input
                    type="number"
                    value={newMeal.servings || 8}
                    onChange={(e) => setNewMeal({ ...newMeal, servings: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 border border-[rgb(226,232,240)] rounded-lg focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                  Notes
                </label>
                <textarea
                  value={newMeal.notes || ''}
                  onChange={(e) => setNewMeal({ ...newMeal, notes: e.target.value })}
                  className="w-full px-4 py-3 border border-[rgb(226,232,240)] rounded-lg focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent"
                  rows={3}
                  placeholder="Special instructions, prep notes..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-3 border border-[rgb(226,232,240)] text-[rgb(15,23,42)] rounded-lg font-medium active:scale-95 transition-transform"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMeal}
                  disabled={!newMeal.name || !newMeal.time}
                  className="flex-1 py-3 bg-[rgb(34,139,34)] text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-transform"
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

export default function MealMenuSectionDemo() {
  return <MealMenuSection />
}