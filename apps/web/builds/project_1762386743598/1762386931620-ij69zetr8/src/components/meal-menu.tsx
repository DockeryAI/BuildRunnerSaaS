'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Users, Plus, Edit3, Trash2, ChefHat, MapPin } from 'lucide-react'

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
  location?: string
}

interface MealMenuProps {
  tripId?: string
  meals?: Meal[]
  groupMembers?: { id: string; name: string; avatar?: string }[]
  onMealUpdate?: (meal: Meal) => void
  onMealDelete?: (mealId: string) => void
  onMealAdd?: (meal: Omit<Meal, 'id'>) => void
}

const DEFAULT_MEALS: Meal[] = [
  {
    id: '1',
    name: 'Trail Mix Pancakes',
    type: 'breakfast',
    date: '2024-01-20',
    time: '08:00',
    assignedTo: ['john', 'sarah'],
    ingredients: ['Pancake mix', 'Trail mix', 'Maple syrup', 'Coffee'],
    servings: 6,
    notes: 'Cook on camp stove',
    location: 'Base camp'
  },
  {
    id: '2',
    name: 'Mountain Sandwiches',
    type: 'lunch',
    date: '2024-01-20',
    time: '12:30',
    assignedTo: ['mike'],
    ingredients: ['Bread', 'Turkey', 'Cheese', 'Vegetables'],
    servings: 6,
    location: 'Trail stop'
  },
  {
    id: '3',
    name: 'Campfire Chili',
    type: 'dinner',
    date: '2024-01-20',
    time: '18:00',
    assignedTo: ['sarah', 'alex'],
    ingredients: ['Ground beef', 'Beans', 'Tomatoes', 'Spices'],
    servings: 6,
    notes: 'Slow cook over fire',
    location: 'Base camp'
  }
]

const DEFAULT_MEMBERS = [
  { id: 'john', name: 'John D.' },
  { id: 'sarah', name: 'Sarah M.' },
  { id: 'mike', name: 'Mike R.' },
  { id: 'alex', name: 'Alex K.' }
]

export function MealMenu({
  tripId = 'trip-1',
  meals = DEFAULT_MEALS,
  groupMembers = DEFAULT_MEMBERS,
  onMealUpdate = () => console.log('Meal updated'),
  onMealDelete = () => console.log('Meal deleted'),
  onMealAdd = () => console.log('Meal added')
}: MealMenuProps = {}) {
  const [selectedDate, setSelectedDate] = useState('2024-01-20')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newMeal, setNewMeal] = useState<Partial<Meal>>({
    type: 'breakfast',
    date: selectedDate,
    time: '08:00',
    assignedTo: [],
    ingredients: [],
    servings: 4
  })

  const mealTypes = [
    { type: 'breakfast' as const, icon: '🌅', label: 'Breakfast' },
    { type: 'lunch' as const, icon: '☀️', label: 'Lunch' },
    { type: 'dinner' as const, icon: '🌙', label: 'Dinner' },
    { type: 'snack' as const, icon: '🥜', label: 'Snack' }
  ]

  const filteredMeals = meals.filter(meal => meal.date === selectedDate)
  const sortedMeals = filteredMeals.sort((a, b) => a.time.localeCompare(b.time))

  const uniqueDates = [...new Set(meals.map(meal => meal.date))].sort()

  const handleAddMeal = async () => {
    if (newMeal.name && newMeal.type && newMeal.time) {
      setIsLoading(true)
      setError(null)
      try {
        const meal: Omit<Meal, 'id'> = {
          name: newMeal.name,
          type: newMeal.type,
          date: selectedDate,
          time: newMeal.time,
          assignedTo: newMeal.assignedTo || [],
          ingredients: newMeal.ingredients || [],
          servings: newMeal.servings || 4,
          notes: newMeal.notes,
          location: newMeal.location
        }
        onMealAdd(meal)
        setNewMeal({
          type: 'breakfast',
          date: selectedDate,
          time: '08:00',
          assignedTo: [],
          ingredients: [],
          servings: 4
        })
        setShowAddForm(false)
      } catch (err) {
        setError('Failed to add meal. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleEditMeal = (meal: Meal) => {
    setEditingMeal(meal)
    setNewMeal(meal)
    setShowAddForm(true)
  }

  const handleUpdateMeal = async () => {
    if (editingMeal && newMeal.name && newMeal.type && newMeal.time) {
      setIsLoading(true)
      setError(null)
      try {
        const updatedMeal: Meal = {
          ...editingMeal,
          name: newMeal.name,
          type: newMeal.type,
          time: newMeal.time,
          assignedTo: newMeal.assignedTo || [],
          ingredients: newMeal.ingredients || [],
          servings: newMeal.servings || 4,
          notes: newMeal.notes,
          location: newMeal.location
        }
        onMealUpdate(updatedMeal)
        setEditingMeal(null)
        setNewMeal({
          type: 'breakfast',
          date: selectedDate,
          time: '08:00',
          assignedTo: [],
          ingredients: [],
          servings: 4
        })
        setShowAddForm(false)
      } catch (err) {
        setError('Failed to update meal. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const getMealTypeColor = (type: string) => {
    switch (type) {
      case 'breakfast': return 'bg-accent/20 text-accent border-accent/30 dark:bg-accent/20 dark:text-accent dark:border-accent/30'
      case 'lunch': return 'bg-secondary/20 text-secondary border-secondary/30 dark:bg-secondary/20 dark:text-secondary dark:border-secondary/30'
      case 'dinner': return 'bg-primary/20 text-primary border-primary/30 dark:bg-primary/20 dark:text-primary dark:border-primary/30'
      case 'snack': return 'bg-primary/20 text-primary border-primary/30 dark:bg-primary/20 dark:text-primary dark:border-primary/30'
      default: return 'bg-muted/20 text-mutedForeground border-border dark:bg-muted/20 dark:text-mutedForeground dark:border-border'
    }
  }

  return (
    <div className="min-h-screen bg-background dark:bg-background font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <ChefHat className="w-8 h-8 text-primary dark:text-primary" />
            <h1 className="text-2xl font-bold text-foreground dark:text-foreground">Meal Menu</h1>
          </div>
          
          {/* Date Selector */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {uniqueDates.map(date => (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-150 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-ring focus-visible:ring-2 focus-visible:ring-ring ${
                  selectedDate === date
                    ? 'bg-primary text-primaryForeground shadow-md hover:bg-primary/90 dark:bg-primary dark:text-primaryForeground dark:hover:bg-primary/90'
                    : 'bg-surface text-foreground hover:bg-muted border border-border dark:bg-surface dark:text-foreground dark:hover:bg-muted dark:border-border'
                }`}
                aria-label={`Select date ${date}`}
              >
                {new Date(date).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </button>
            ))}
          </div>
        </div>

        {/* Add Meal Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(true)}
            disabled={isLoading}
            className="w-full sm:w-auto px-4 py-3 bg-primary text-primaryForeground rounded-lg hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 font-medium shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 dark:bg-primary dark:text-primaryForeground dark:hover:bg-primary/90"
            aria-label="Add new meal"
          >
            <Plus className="w-5 h-5" />
            Add Meal
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 rounded-lg bg-destructive/10 border border-destructive/20 p-4 dark:bg-destructive/10 dark:border-destructive/20">
            <p className="text-sm text-destructive dark:text-destructive">{error}</p>
          </div>
        )}

        {/* Meals List */}
        <div className="space-y-4 mb-6">
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-surface rounded-xl border border-border p-6 dark:bg-surface dark:border-border">
                  <div className="h-4 bg-muted rounded w-3/4 mb-3 dark:bg-muted"></div>
                  <div className="h-4 bg-muted rounded w-1/2 mb-3 dark:bg-muted"></div>
                  <div className="h-4 bg-muted rounded w-2/3 dark:bg-muted"></div>
                </div>
              ))}
            </div>
          ) : sortedMeals.length === 0 ? (
            <div className="bg-surface rounded-xl border border-border p-8 text-center dark:bg-surface dark:border-border">
              <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center dark:bg-muted">
                <ChefHat className="w-8 h-8 text-mutedForeground dark:text-mutedForeground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2 dark:text-foreground">No meals planned</h3>
              <p className="text-mutedForeground mb-4 text-sm dark:text-mutedForeground">Add your first meal to get started</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-primary text-primaryForeground rounded-lg hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 font-medium focus:outline-none focus:ring-2 focus:ring-ring focus-visible:ring-2 focus-visible:ring-ring dark:bg-primary dark:text-primaryForeground dark:hover:bg-primary/90"
              >
                Add Meal
              </button>
            </div>
          ) : (
            sortedMeals.map(meal => (
              <div
                key={meal.id}
                className="bg-surface rounded-xl border border-border p-6 hover:border-primary/50 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 shadow-sm dark:bg-surface dark:border-border dark:hover:border-primary/50 dark:hover:shadow-lg"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground dark:text-foreground">{meal.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getMealTypeColor(meal.type)}`}>
                        {mealTypes.find(t => t.type === meal.type)?.icon} {meal.type}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-mutedForeground mb-3 dark:text-mutedForeground">
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
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditMeal(meal)}
                      className="p-2 text-mutedForeground hover:text-primary hover:bg-muted rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-ring focus-visible:ring-2 focus-visible:ring-ring dark:text-mutedForeground dark:hover:text-primary dark:hover:bg-muted"
                      aria-label={`Edit ${meal.name}`}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onMealDelete(meal.id)}
                      className="p-2 text-mutedForeground hover:text-destructive hover:bg-muted rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-ring focus-visible:ring-2 focus-visible:ring-ring dark:text-mutedForeground dark:hover:text-destructive dark:hover:bg-muted"
                      aria-label={`Delete ${meal.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Assigned Members */}
                {meal.assignedTo.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm text-mutedForeground mb-2 dark:text-mutedForeground">Assigned to:</p>
                    <div className="flex flex-wrap gap-2">
                      {meal.assignedTo.map(memberId => {
                        const member = groupMembers.find(m => m.id === memberId)
                        return member ? (
                          <span
                            key={memberId}
                            className="px-3 py-1 bg-muted text-foreground rounded-full text-xs font-medium dark:bg-muted dark:text-foreground"
                          >
                            {member.name}
                          </span>
                        ) : null
                      })}
                    </div>
                  </div>
                )}

                {/* Ingredients */}
                {meal.ingredients.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm text-mutedForeground mb-2 dark:text-mutedForeground">Ingredients:</p>
                    <div className="flex flex-wrap gap-2">
                      {meal.ingredients.map((ingredient, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-primary/20 text-primary rounded text-xs border border-primary/30 dark:bg-primary/20 dark:text-primary dark:border-primary/30"
                        >
                          {ingredient}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {meal.notes && (
                  <div className="text-sm text-foreground bg-muted/50 rounded-lg p-3 dark:text-foreground dark:bg-muted/50">
                    {meal.notes}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Add/Edit Meal Form */}
        {showAddForm && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 dark:bg-background/80">
            <div className="bg-surface rounded-xl border border-border p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl dark:bg-surface dark:border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4 dark:text-foreground">
                {editingMeal ? 'Edit Meal' : 'Add New Meal'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2 dark:text-foreground">
                    Meal Name
                  </label>
                  <input
                    type="text"
                    value={newMeal.name || ''}
                    onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder-mutedForeground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all duration-200 dark:bg-background dark:border-border dark:text-foreground dark:placeholder-mutedForeground dark:focus:border-ring dark:focus:ring-ring/50"
                    placeholder="Enter meal name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2 dark:text-foreground">
                    Meal Type
                  </label>
                  <select
                    value={newMeal.type || 'breakfast'}
                    onChange={(e) => setNewMeal({ ...newMeal, type: e.target.value as Meal['type'] })}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all duration-200 dark:bg-background dark:border-border dark:text-foreground dark:focus:border-ring dark:focus:ring-ring/50"
                  >
                    {mealTypes.map(type => (
                      <option key={type.type} value={type.type}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2 dark:text-foreground">
                    Time
                  </label>
                  <input
                    type="time"
                    value={newMeal.time || '08:00'}
                    onChange={(e) => setNewMeal({ ...newMeal, time: e.target.value })}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all duration-200 dark:bg-background dark:border-border dark:text-foreground dark:focus:border-ring dark:focus:ring-ring/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2 dark:text-foreground">
                    Servings
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newMeal.servings || 4}
                    onChange={(e) => setNewMeal({ ...newMeal, servings: parseInt(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all duration-200 dark:bg-background dark:border-border dark:text-foreground dark:focus:border-ring dark:focus:ring-ring/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2 dark:text-foreground">
                    Location (Optional)
                  </label>
                  <input
                    type="text"
                    value={newMeal.location || ''}
                    onChange={(e) => setNewMeal({ ...newMeal, location: e.target.value })}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder-mutedForeground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all duration-200 dark:bg-background dark:border-border dark:text-foreground dark:placeholder-mutedForeground dark:focus:border-ring dark:focus:ring-ring/50"
                    placeholder="e.g., Base camp, Trail stop"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2 dark:text-foreground">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={newMeal.notes || ''}
                    onChange={(e) => setNewMeal({ ...newMeal, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder-mutedForeground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all duration-200 resize-none dark:bg-background dark:border-border dark:text-foreground dark:placeholder-mutedForeground dark:focus:border-ring dark:focus:ring-ring/50"
                    placeholder="Cooking instructions, dietary notes, etc."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddForm(false)
                    setEditingMeal(null)
                    setError(null)
                    setNewMeal({
                      type: 'breakfast',
                      date: selectedDate,
                      time: '08:00',
                      assignedTo: [],
                      ingredients: [],
                      servings: 4
                    })
                  }}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 font-medium focus:outline-none focus:ring-2 focus:ring-ring focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 dark:bg-muted dark:text-foreground dark:hover:bg-muted/80"
                >
                  Cancel
                </button>
                <button
                  onClick={editingMeal ? handleUpdateMeal : handleAddMeal}
                  disabled={isLoading || !newMeal.name || !newMeal.type || !newMeal.time}
                  className="flex-1 px-4 py-2 bg-primary text-primaryForeground rounded-lg hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 font-medium shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 dark:bg-primary dark:text-primaryForeground dark:hover:bg-primary/90"
                >
                  {isLoading ? 'Saving...' : editingMeal ? 'Update' : 'Add'} Meal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function MealMenuDemo() {
  return <MealMenu />
}