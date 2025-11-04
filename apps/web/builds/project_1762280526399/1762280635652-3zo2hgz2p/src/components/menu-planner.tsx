'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit3, Trash2, Clock, Users, ChefHat, Calendar } from 'lucide-react'

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
  difficulty: 'easy' | 'medium' | 'hard'
}

interface MenuPlannerProps {
  tripDays?: string[]
  groupMembers?: { id: string; name: string; avatar?: string }[]
  onMealUpdate?: (meal: Meal) => void
  onMealDelete?: (mealId: string) => void
}

const DEFAULT_TRIP_DAYS = [
  'Friday, Oct 25',
  'Saturday, Oct 26', 
  'Sunday, Oct 27'
]

const DEFAULT_GROUP_MEMBERS = [
  { id: '1', name: 'Alex Chen', avatar: 'AC' },
  { id: '2', name: 'Sarah Johnson', avatar: 'SJ' },
  { id: '3', name: 'Mike Rodriguez', avatar: 'MR' },
  { id: '4', name: 'Emma Davis', avatar: 'ED' }
]

const DEFAULT_MEALS: Meal[] = [
  {
    id: '1',
    name: 'Campfire Pancakes',
    type: 'breakfast',
    day: 'Saturday, Oct 26',
    time: '8:00 AM',
    assignedTo: ['1', '2'],
    ingredients: ['Pancake mix', 'Eggs', 'Milk', 'Butter', 'Syrup'],
    servings: 6,
    difficulty: 'easy',
    notes: 'Pre-mix dry ingredients at home'
  },
  {
    id: '2',
    name: 'Trail Sandwiches',
    type: 'lunch',
    day: 'Saturday, Oct 26',
    time: '12:30 PM',
    assignedTo: ['3'],
    ingredients: ['Bread', 'Turkey', 'Cheese', 'Lettuce', 'Tomatoes'],
    servings: 6,
    difficulty: 'easy'
  },
  {
    id: '3',
    name: 'Campfire Chili',
    type: 'dinner',
    day: 'Saturday, Oct 26',
    time: '6:00 PM',
    assignedTo: ['4', '1'],
    ingredients: ['Ground beef', 'Beans', 'Tomatoes', 'Onions', 'Spices'],
    servings: 6,
    difficulty: 'medium',
    notes: 'Can prep at home and reheat'
  }
]

export function MenuPlanner({
  tripDays = DEFAULT_TRIP_DAYS,
  groupMembers = DEFAULT_GROUP_MEMBERS,
  onMealUpdate = () => {},
  onMealDelete = () => {}
}: MenuPlannerProps = {}) {
  const [meals, setMeals] = useState<Meal[]>(DEFAULT_MEALS)
  const [selectedDay, setSelectedDay] = useState(tripDays[0])
  const [showAddMeal, setShowAddMeal] = useState(false)
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null)
  const [newMeal, setNewMeal] = useState<Partial<Meal>>({
    type: 'breakfast',
    day: selectedDay,
    assignedTo: [],
    ingredients: [],
    servings: 4,
    difficulty: 'easy'
  })

  const mealTypes = [
    { value: 'breakfast', label: 'Breakfast', icon: '🌅' },
    { value: 'lunch', label: 'Lunch', icon: '☀️' },
    { value: 'dinner', label: 'Dinner', icon: '🌙' },
    { value: 'snack', label: 'Snack', icon: '🥨' }
  ]

  const filteredMeals = meals.filter(meal => meal.day === selectedDay)

  const handleAddMeal = () => {
    if (!newMeal.name || !newMeal.time) return

    const meal: Meal = {
      id: Date.now().toString(),
      name: newMeal.name,
      type: newMeal.type as Meal['type'],
      day: selectedDay,
      time: newMeal.time,
      assignedTo: newMeal.assignedTo || [],
      ingredients: newMeal.ingredients || [],
      servings: newMeal.servings || 4,
      difficulty: newMeal.difficulty as Meal['difficulty'],
      notes: newMeal.notes
    }

    setMeals([...meals, meal])
    onMealUpdate(meal)
    setNewMeal({
      type: 'breakfast',
      day: selectedDay,
      assignedTo: [],
      ingredients: [],
      servings: 4,
      difficulty: 'easy'
    })
    setShowAddMeal(false)
  }

  const handleEditMeal = (meal: Meal) => {
    setEditingMeal(meal)
    setNewMeal(meal)
    setShowAddMeal(true)
  }

  const handleUpdateMeal = () => {
    if (!editingMeal || !newMeal.name || !newMeal.time) return

    const updatedMeal: Meal = {
      ...editingMeal,
      name: newMeal.name,
      type: newMeal.type as Meal['type'],
      time: newMeal.time,
      assignedTo: newMeal.assignedTo || [],
      ingredients: newMeal.ingredients || [],
      servings: newMeal.servings || 4,
      difficulty: newMeal.difficulty as Meal['difficulty'],
      notes: newMeal.notes
    }

    setMeals(meals.map(m => m.id === editingMeal.id ? updatedMeal : m))
    onMealUpdate(updatedMeal)
    setEditingMeal(null)
    setNewMeal({
      type: 'breakfast',
      day: selectedDay,
      assignedTo: [],
      ingredients: [],
      servings: 4,
      difficulty: 'easy'
    })
    setShowAddMeal(false)
  }

  const handleDeleteMeal = (mealId: string) => {
    setMeals(meals.filter(m => m.id !== mealId))
    onMealDelete(mealId)
  }

  const toggleAssignment = (memberId: string) => {
    const current = newMeal.assignedTo || []
    const updated = current.includes(memberId)
      ? current.filter(id => id !== memberId)
      : [...current, memberId]
    setNewMeal({ ...newMeal, assignedTo: updated })
  }

  const addIngredient = (ingredient: string) => {
    if (!ingredient.trim()) return
    const current = newMeal.ingredients || []
    setNewMeal({ ...newMeal, ingredients: [...current, ingredient.trim()] })
  }

  const removeIngredient = (index: number) => {
    const current = newMeal.ingredients || []
    setNewMeal({ ...newMeal, ingredients: current.filter((_, i) => i !== index) })
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-[rgb(241, 245, 249)] text-gray-800'
    }
  }

  const getMemberName = (memberId: string) => {
    return groupMembers.find(m => m.id === memberId)?.name || 'Unknown'
  }

  return (
    <div className="min-h-screen bg-[rgb(255,255,255)] font-medium">
      {/* Header */}
      <div className="bg-[rgb(34,139,34)] text-[rgb(255,255,255)] p-4 shadow-md">
        <div className="flex items-center gap-3 mb-4">
          <ChefHat className="w-6 h-6" />
          <h1 className="text-xl font-semibold">Menu Planner</h1>
        </div>
        
        {/* Day Selector */}
        <div className="flex gap-2 overflow-x-auto">
          {tripDays.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                selectedDay === day
                  ? 'bg-[rgb(255,255,255)] text-[rgb(34,139,34)]'
                  : 'bg-[rgb(34,139,34)] text-[rgb(255,255,255)] border border-[rgb(255,255,255)]/20'
              }`}
              aria-label={`Select ${day}`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Add Meal Button */}
        <button
          onClick={() => setShowAddMeal(true)}
          className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] hover:border-[rgb(34,139,34)] hover:text-[rgb(34,139,34)] transition-colors"
          aria-label="Add new meal"
        >
          <Plus className="w-5 h-5" />
          Add Meal
        </button>

        {/* Meals List */}
        <div className="space-y-3">
          {filteredMeals.length === 0 ? (
            <div className="text-center py-8 text-[rgb(15,23,42)]/60">
              <ChefHat className="w-12 h-12 mx-auto mb-3 text-[rgb(226,232,240)]" />
              <p>No meals planned for {selectedDay}</p>
              <p className="text-sm">Add your first meal to get started!</p>
            </div>
          ) : (
            filteredMeals
              .sort((a, b) => a.time.localeCompare(b.time))
              .map((meal) => (
                <div
                  key={meal.id}
                  className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">
                          {mealTypes.find(t => t.value === meal.type)?.icon}
                        </span>
                        <h3 className="font-semibold text-[rgb(15,23,42)]">{meal.name}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(meal.difficulty)}`}>
                          {meal.difficulty}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-[rgb(15,23,42)]/60">
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
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditMeal(meal)}
                        className="p-2 text-[rgb(15,23,42)]/60 hover:text-[rgb(34,139,34)] transition-colors"
                        aria-label={`Edit ${meal.name}`}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMeal(meal.id)}
                        className="p-2 text-[rgb(15,23,42)]/60 hover:text-[rgb(239,68,68)] transition-colors"
                        aria-label={`Delete ${meal.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Assigned Members */}
                  {meal.assignedTo.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-[rgb(15,23,42)] mb-2">Assigned to:</p>
                      <div className="flex flex-wrap gap-2">
                        {meal.assignedTo.map((memberId) => (
                          <span
                            key={memberId}
                            className="px-2 py-1 bg-[rgb(248,250,252)] text-[rgb(15,23,42)] text-sm rounded-full"
                          >
                            {getMemberName(memberId)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ingredients */}
                  {meal.ingredients.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-[rgb(15,23,42)] mb-2">Ingredients:</p>
                      <div className="flex flex-wrap gap-1">
                        {meal.ingredients.map((ingredient, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-[rgb(241,245,249)] text-[rgb(15,23,42)] text-xs rounded"
                          >
                            {ingredient}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {meal.notes && (
                    <div className="text-sm text-[rgb(15,23,42)]/70 bg-[rgb(241,245,249)] p-2 rounded">
                      {meal.notes}
                    </div>
                  )}
                </div>
              ))
          )}
        </div>
      </div>

      {/* Add/Edit Meal Modal */}
      {showAddMeal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-[rgb(255,255,255)] w-full sm:w-96 sm:rounded-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-[rgb(226,232,240)]">
              <h2 className="text-lg font-semibold text-[rgb(15,23,42)]">
                {editingMeal ? 'Edit Meal' : 'Add New Meal'}
              </h2>
            </div>

            <div className="p-4 space-y-4">
              {/* Meal Name */}
              <div>
                <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-1">
                  Meal Name
                </label>
                <input
                  type="text"
                  value={newMeal.name || ''}
                  onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
                  className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent"
                  placeholder="Enter meal name"
                />
              </div>

              {/* Meal Type */}
              <div>
                <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-1">
                  Meal Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {mealTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setNewMeal({ ...newMeal, type: type.value as Meal['type'] })}
                      className={`p-3 rounded-lg border transition-colors ${
                        newMeal.type === type.value
                          ? 'border-[rgb(34,139,34)] bg-[rgb(34,139,34)]/10 text-[rgb(34,139,34)]'
                          : 'border-[rgb(226,232,240)] text-[rgb(15,23,42)]'
                      }`}
                    >
                      <div className="text-lg mb-1">{type.icon}</div>
                      <div className="text-sm">{type.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-1">
                  Time
                </label>
                <input
                  type="time"
                  value={newMeal.time || ''}
                  onChange={(e) => setNewMeal({ ...newMeal, time: e.target.value })}
                  className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent"
                />
              </div>

              {/* Servings & Difficulty */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-1">
                    Servings
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newMeal.servings || 4}
                    onChange={(e) => setNewMeal({ ...newMeal, servings: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-1">
                    Difficulty
                  </label>
                  <select
                    value={newMeal.difficulty || 'easy'}
                    onChange={(e) => setNewMeal({ ...newMeal, difficulty: e.target.value as Meal['difficulty'] })}
                    className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* Assign Members */}
              <div>
                <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                  Assign Members
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {groupMembers.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => toggleAssignment(member.id)}
                      className={`p-2 rounded-lg border text-left transition-colors ${
                        (newMeal.assignedTo || []).includes(member.id)
                          ? 'border-[rgb(34,139,34)] bg-[rgb(34,139,34)]/10 text-[rgb(34,139,34)]'
                          : 'border-[rgb(226,232,240)] text-[rgb(15,23,42)]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-[rgb(34,139,34)] text-[rgb(255,255,255)] rounded-full flex items-center justify-center text-xs">
                          {member.avatar}
                        </div>
                        <span className="text-sm">{member.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                  Ingredients
                </label>
                <div className="space-y-2">
                  {(newMeal.ingredients || []).map((ingredient, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="flex-1 px-2 py-1 bg-[rgb(241,245,249)] rounded text-sm">
                        {ingredient}
                      </span>
                      <button
                        onClick={() => removeIngredient(index)}
                        className="p-1 text-[rgb(239,68,68)] hover:bg-[rgb(239,68,68)]/10 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <input
                    type="text"
                    placeholder="Add ingredient and press Enter"
                    className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addIngredient(e.currentTarget.value)
                        e.currentTarget.value = ''
                      }
                    }}
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={newMeal.notes || ''}
                  onChange={(e) => setNewMeal({ ...newMeal, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent"
                  rows={3}
                  placeholder="Any special instructions or notes..."
                />
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-[rgb(226,232,240)] flex gap-3">
              <button
                onClick={() => {
                  setShowAddMeal(false)
                  setEditingMeal(null)
                  setNewMeal({
                    type: 'breakfast',
                    day: selectedDay,
                    assignedTo: [],
                    ingredients: [],
                    servings: 4,
                    difficulty: 'easy'
                  })
                }}
                className="flex-1 px-4 py-2 border border-[rgb(226,232,240)] text-[rgb(15,23,42)] rounded-lg hover:bg-[rgb(241,245,249)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingMeal ? handleUpdateMeal : handleAddMeal}
                disabled={!newMeal.name || !newMeal.time}
                className="flex-1 px-4 py-2 bg-[rgb(34,139,34)] text-[rgb(255,255,255)] rounded-lg hover:bg-[rgb(34,139,34)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {editingMeal ? 'Update Meal' : 'Add Meal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function MenuPlannerDemo() {
  return <MenuPlanner />
}