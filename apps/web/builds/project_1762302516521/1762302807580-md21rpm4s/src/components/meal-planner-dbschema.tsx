'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Users, MapPin, Utensils, Plus, Edit3, Trash2, Save, X } from 'lucide-react'

interface MealPlan {
  id: string
  tripId: string
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  date: string
  time: string
  name: string
  description: string
  servings: number
  assignedTo: string[]
  ingredients: Ingredient[]
  cookingMethod: 'campfire' | 'camp-stove' | 'grill' | 'no-cook'
  prepTime: number
  difficulty: 'easy' | 'medium' | 'hard'
  dietary: string[]
  status: 'planned' | 'shopping' | 'prepared' | 'completed'
  notes: string
  createdAt: string
  updatedAt: string
}

interface Ingredient {
  id: string
  name: string
  quantity: number
  unit: string
  category: 'protein' | 'vegetables' | 'grains' | 'dairy' | 'spices' | 'other'
  purchased: boolean
  assignedTo?: string
}

interface GroupMember {
  id: string
  name: string
  email: string
  avatar?: string
  dietary: string[]
}

interface MealPlannerDBSchemaProps {
  tripId?: string
  groupMembers?: GroupMember[]
  onMealPlanUpdate?: (mealPlan: MealPlan) => void
  onIngredientUpdate?: (ingredient: Ingredient) => void
}

const MEAL_TYPES = [
  { value: 'breakfast', label: 'Breakfast', icon: '🌅' },
  { value: 'lunch', label: 'Lunch', icon: '☀️' },
  { value: 'dinner', label: 'Dinner', icon: '🌙' },
  { value: 'snack', label: 'Snack', icon: '🥜' }
] as const

const COOKING_METHODS = [
  { value: 'campfire', label: 'Campfire', icon: '🔥' },
  { value: 'camp-stove', label: 'Camp Stove', icon: '🏕️' },
  { value: 'grill', label: 'Grill', icon: '🍖' },
  { value: 'no-cook', label: 'No Cook', icon: '🥗' }
] as const

const DIFFICULTY_LEVELS = [
  { value: 'easy', label: 'Easy', color: 'bg-[rgb(34,139,34)]' },
  { value: 'medium', label: 'Medium', color: 'bg-[rgb(249,115,22)]' },
  { value: 'hard', label: 'Hard', color: 'bg-[rgb(220,38,38)]' }
] as const

const INGREDIENT_CATEGORIES = [
  'protein', 'vegetables', 'grains', 'dairy', 'spices', 'other'
] as const

const DIETARY_OPTIONS = [
  'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'keto', 'paleo'
] as const

export function MealPlannerDBSchema({
  tripId = 'trip-1',
  groupMembers = DEFAULT_GROUP_MEMBERS,
  onMealPlanUpdate = () => console.log('Meal plan updated'),
  onIngredientUpdate = () => console.log('Ingredient updated')
}: MealPlannerDBSchemaProps = {}) {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>(DEFAULT_MEAL_PLANS)
  const [selectedMeal, setSelectedMeal] = useState<MealPlan | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<MealPlan>>({})
  const [activeTab, setActiveTab] = useState<'overview' | 'ingredients' | 'assignments'>('overview')
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])

  useEffect(() => {
    // Simulate loading meal plans from database
    const loadMealPlans = async () => {
      // In real app, this would be an API call
      setMealPlans(DEFAULT_MEAL_PLANS.filter(meal => meal.tripId === tripId))
    }
    loadMealPlans()
  }, [tripId])

  const handleCreateMeal = () => {
    const newMeal: MealPlan = {
      id: `meal-${Date.now()}`,
      tripId,
      mealType: 'dinner',
      date: selectedDate,
      time: '18:00',
      name: 'New Meal',
      description: '',
      servings: groupMembers.length,
      assignedTo: [],
      ingredients: [],
      cookingMethod: 'campfire',
      prepTime: 30,
      difficulty: 'easy',
      dietary: [],
      status: 'planned',
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setMealPlans(prev => [...prev, newMeal])
    setSelectedMeal(newMeal)
    setEditForm(newMeal)
    setIsEditing(true)
  }

  const handleSaveMeal = () => {
    if (!selectedMeal || !editForm) return

    const updatedMeal = {
      ...selectedMeal,
      ...editForm,
      updatedAt: new Date().toISOString()
    }

    setMealPlans(prev => prev.map(meal => 
      meal.id === selectedMeal.id ? updatedMeal : meal
    ))
    setSelectedMeal(updatedMeal)
    setIsEditing(false)
    onMealPlanUpdate(updatedMeal)
  }

  const handleDeleteMeal = (mealId: string) => {
    setMealPlans(prev => prev.filter(meal => meal.id !== mealId))
    if (selectedMeal?.id === mealId) {
      setSelectedMeal(null)
    }
  }

  const handleAddIngredient = () => {
    if (!selectedMeal) return

    const newIngredient: Ingredient = {
      id: `ingredient-${Date.now()}`,
      name: 'New Ingredient',
      quantity: 1,
      unit: 'piece',
      category: 'other',
      purchased: false
    }

    const updatedMeal = {
      ...selectedMeal,
      ingredients: [...selectedMeal.ingredients, newIngredient]
    }

    setSelectedMeal(updatedMeal)
    setMealPlans(prev => prev.map(meal => 
      meal.id === selectedMeal.id ? updatedMeal : meal
    ))
  }

  const handleUpdateIngredient = (ingredientId: string, updates: Partial<Ingredient>) => {
    if (!selectedMeal) return

    const updatedIngredients = selectedMeal.ingredients.map(ingredient =>
      ingredient.id === ingredientId ? { ...ingredient, ...updates } : ingredient
    )

    const updatedMeal = {
      ...selectedMeal,
      ingredients: updatedIngredients
    }

    setSelectedMeal(updatedMeal)
    setMealPlans(prev => prev.map(meal => 
      meal.id === selectedMeal.id ? updatedMeal : meal
    ))

    const updatedIngredient = updatedIngredients.find(ing => ing.id === ingredientId)
    if (updatedIngredient) {
      onIngredientUpdate(updatedIngredient)
    }
  }

  const getMealsByDate = (date: string) => {
    return mealPlans
      .filter(meal => meal.date === date)
      .sort((a, b) => {
        const timeOrder = { breakfast: 0, lunch: 1, dinner: 2, snack: 3 }
        return timeOrder[a.mealType] - timeOrder[b.mealType]
      })
  }

  const getStatusColor = (status: MealPlan['status']) => {
    switch (status) {
      case 'planned': return 'bg-[rgb(226,232,240)] text-[rgb(15,23,42)]'
      case 'shopping': return 'bg-[rgb(249,115,22)] text-white'
      case 'prepared': return 'bg-[rgb(34,139,34)] text-white'
      case 'completed': return 'bg-[rgb(15,23,42)] text-white'
      default: return 'bg-[rgb(226,232,240)] text-[rgb(15,23,42)]'
    }
  }

  return (
    <div className="min-h-screen bg-[rgb(255,255,255)] font-medium">
      {/* Header */}
      <div className="bg-[rgb(34,139,34)] text-white p-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Utensils className="w-6 h-6" />
            <h1 className="text-xl font-semibold">Meal Planner</h1>
          </div>
          <button
            onClick={handleCreateMeal}
            className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition-colors duration-200"
            aria-label="Add new meal"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Meal</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)]">
        {/* Meal List */}
        <div className="w-full lg:w-1/3 border-r border-[rgb(226,232,240)] bg-[rgb(248,250,252)]">
          {/* Date Selector */}
          <div className="p-4 border-b border-[rgb(226,232,240)]">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent"
            />
          </div>

          {/* Meals for Selected Date */}
          <div className="overflow-y-auto h-full">
            {getMealsByDate(selectedDate).map((meal) => (
              <div
                key={meal.id}
                onClick={() => setSelectedMeal(meal)}
                className={`p-4 border-b border-[rgb(226,232,240)] cursor-pointer hover:bg-white transition-colors duration-200 ${
                  selectedMeal?.id === meal.id ? 'bg-white border-l-4 border-l-[rgb(34,139,34)]' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">
                        {MEAL_TYPES.find(type => type.value === meal.mealType)?.icon}
                      </span>
                      <h3 className="font-semibold text-[rgb(15,23,42)]">{meal.name}</h3>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Clock className="w-4 h-4" />
                      <span>{meal.time}</span>
                      <Users className="w-4 h-4 ml-2" />
                      <span>{meal.servings} people</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(meal.status)}`}>
                        {meal.status}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs text-white ${
                        DIFFICULTY_LEVELS.find(d => d.value === meal.difficulty)?.color
                      }`}>
                        {meal.difficulty}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteMeal(meal.id)
                    }}
                    className="p-1 text-[rgb(220,38,38)] hover:bg-red-50 rounded"
                    aria-label="Delete meal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {getMealsByDate(selectedDate).length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <Utensils className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No meals planned for this date</p>
                <button
                  onClick={handleCreateMeal}
                  className="mt-4 px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors duration-200"
                >
                  Add First Meal
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Meal Details */}
        <div className="flex-1 bg-white">
          {selectedMeal ? (
            <div className="h-full flex flex-col">
              {/* Meal Header */}
              <div className="p-6 border-b border-[rgb(226,232,240)]">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-[rgb(15,23,42)] mb-2">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.name || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                          className="text-2xl font-semibold bg-transparent border-b-2 border-[rgb(34,139,34)] focus:outline-none"
                        />
                      ) : (
                        selectedMeal.name
                      )}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{selectedMeal.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{selectedMeal.time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{selectedMeal.servings} servings</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleSaveMeal}
                          className="p-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors duration-200"
                          aria-label="Save changes"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setIsEditing(false)
                            setEditForm({})
                          }}
                          className="p-2 bg-[rgb(226,232,240)] text-[rgb(15,23,42)] rounded-lg hover:bg-gray-300 transition-colors duration-200"
                          aria-label="Cancel editing"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setIsEditing(true)
                          setEditForm(selectedMeal)
                        }}
                        className="p-2 bg-[rgb(245,247,250)] text-[rgb(15,23,42)] rounded-lg hover:bg-gray-200 transition-colors duration-200"
                        aria-label="Edit meal"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-[rgb(226,232,240)]">
                  {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'ingredients', label: 'Ingredients' },
                    { id: 'assignments', label: 'Assignments' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-4 py-2 font-medium transition-colors duration-200 ${
                        activeTab === tab.id
                          ? 'text-[rgb(34,139,34)] border-b-2 border-[rgb(34,139,34)]'
                          : 'text-gray-500 hover:text-[rgb(15,23,42)]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                        Description
                      </label>
                      {isEditing ? (
                        <textarea
                          value={editForm.description || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent"
                          rows={3}
                        />
                      ) : (
                        <p className="text-gray-600">{selectedMeal.description || 'No description'}</p>
                      )}
                    </div>

                    {/* Cooking Method */}
                    <div>
                      <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                        Cooking Method
                      </label>
                      {isEditing ? (
                        <select
                          value={editForm.cookingMethod || selectedMeal.cookingMethod}
                          onChange={(e) => setEditForm(prev => ({ ...prev, cookingMethod: e.target.value as any }))}
                          className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent"
                        >
                          {COOKING_METHODS.map((method) => (
                            <option key={method.value} value={method.value}>
                              {method.icon} {method.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {COOKING_METHODS.find(m => m.value === selectedMeal.cookingMethod)?.icon}
                          </span>
                          <span>{COOKING_METHODS.find(m => m.value === selectedMeal.cookingMethod)?.label}</span>
                        </div>
                      )}
                    </div>

                    {/* Prep Time & Difficulty */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                          Prep Time (minutes)
                        </label>
                        {isEditing ? (
                          <input
                            type="number"
                            value={editForm.prepTime || selectedMeal.prepTime}
                            onChange={(e) => setEditForm(prev => ({ ...prev, prepTime: parseInt(e.target.value) }))}
                            className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent"
                          />
                        ) : (
                          <p className="text-gray-600">{selectedMeal.prepTime} minutes</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                          Difficulty
                        </label>
                        {isEditing ? (
                          <select
                            value={editForm.difficulty || selectedMeal.difficulty}
                            onChange={(e) => setEditForm(prev => ({ ...prev, difficulty: e.target.value as any }))}
                            className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent"
                          >
                            {DIFFICULTY_LEVELS.map((level) => (
                              <option key={level.value} value={level.value}>
                                {level.label}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className={`inline-block px-3 py-1 rounded-full text-xs text-white ${
                            DIFFICULTY_LEVELS.find(d => d.value === selectedMeal.difficulty)?.color
                          }`}>
                            {selectedMeal.difficulty}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Dietary Restrictions */}
                    <div>
                      <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                        Dietary Considerations
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {DIETARY_OPTIONS.map((option) => (
                          <label key={option} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isEditing 
                                ? (editForm.dietary || selectedMeal.dietary).includes(option)
                                : selectedMeal.dietary.includes(option)
                              }
                              onChange={(e) => {
                                if (!isEditing) return
                                const current = editForm.dietary || selectedMeal.dietary
                                const updated = e.target.checked
                                  ? [...current, option]
                                  : current.filter(d => d !== option)
                                setEditForm(prev => ({ ...prev, dietary: updated }))
                              }}
                              disabled={!isEditing}
                              className="rounded border-[rgb(226,232,240)] text-[rgb(34,139,34)] focus:ring-[rgb(34,139,34)]"
                            />
                            <span className="text-sm">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                        Notes
                      </label>
                      {isEditing ? (
                        <textarea
                          value={editForm.notes || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                          className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent"
                          rows={3}
                          placeholder="Any special instructions or notes..."
                        />
                      ) : (
                        <p className="text-gray-600">{selectedMeal.notes || 'No notes'}</p>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'ingredients' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-[rgb(15,23,42)]">Ingredients</h3>
                      <button
                        onClick={handleAddIngredient}
                        className="flex items-center gap-2 px-3 py-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors duration-200"
                      >
                        <Plus className="w-4 h-4" />
                        Add Ingredient
                      </button>
                    </div>

                    <div className="space-y-3">
                      {selectedMeal.ingredients.map((ingredient) => (
                        <div
                          key={ingredient.id}
                          className="flex items-center gap-3 p-3 border border-[rgb(226,232,240)] rounded-lg"
                        >
                          <input
                            type="checkbox"
                            checked={ingredient.purchased}
                            onChange={(e) => handleUpdateIngredient(ingredient.id, { purchased: e.target.checked })}
                            className="rounded border-[rgb(226,232,240)] text-[rgb(34,139,34)] focus:ring-[rgb(34,139,34)]"
                          />
                          <div className="flex-1 grid grid-cols-3 gap-2">
                            <input
                              type="text"
                              value={ingredient.name}
                              onChange={(e) => handleUpdateIngredient(ingredient.id, { name: e.target.value })}
                              className="px-2 py-1 border border-[rgb(226,232,240)] rounded focus:ring-1 focus:ring-[rgb(34,139,34)] focus:border-transparent"
                              placeholder="Ingredient name"
                            />
                            <div className="flex gap-1">
                              <input
                                type="number"
                                value={ingredient.quantity}
                                onChange={(e) => handleUpdateIngredient(ingredient.id, { quantity: parseFloat(e.target.value) })}
                                className="flex-1 px-2 py-1 border border-[rgb(226,232,240)] rounded focus:ring-1 focus:ring-[rgb(34,139,34)] focus:border-transparent"
                                placeholder="Qty"
                              />
                              <input
                                type="text"
                                value={ingredient.unit}
                                onChange={(e) => handleUpdateIngredient(ingredient.id, { unit: e.target.value })}
                                className="flex-1 px-2 py-1 border border-[rgb(226,232,240)] rounded focus:ring-1 focus:ring-[rgb(34,139,34)] focus:border-transparent"
                                placeholder="Unit"
                              />
                            </div>
                            <select
                              value={ingredient.category}
                              onChange={(e) => handleUpdateIngredient(ingredient.id, { category: e.target.value as any })}
                              className="px-2 py-1 border border-[rgb(226,232,240)] rounded focus:ring-1 focus:ring-[rgb(34,139,34)] focus:border-transparent"
                            >
                              {INGREDIENT_CATEGORIES.map((category) => (
                                <option key={category} value={category}>
                                  {category}
                                </option>
                              ))}
                            </select>
                          </div>
                          <button
                            onClick={() => {
                              const updatedIngredients = selectedMeal.ingredients.filter(ing => ing.id !== ingredient.id)
                              const updatedMeal = { ...selectedMeal, ingredients: updatedIngredients }
                              setSelectedMeal(updatedMeal)
                              setMealPlans(prev => prev.map(meal => 
                                meal.id === selectedMeal.id ? updatedMeal : meal
                              ))
                            }}
                            className="p-1 text-[rgb(220,38,38)] hover:bg-red-50 rounded"
                            aria-label="Remove ingredient"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {selectedMeal.ingredients.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <p>No ingredients added yet</p>
                        <button
                          onClick={handleAddIngredient}
                          className="mt-2 px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors duration-200"
                        >
                          Add First Ingredient
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'assignments' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-[rgb(15,23,42)]">Task Assignments</h3>
                    
                    <div className="space-y-3">
                      <div className="p-4 border border-[rgb(226,232,240)] rounded-lg">
                        <h4 className="font-medium text-[rgb(15,23,42)] mb-3">Cooking & Prep</h4>
                        <div className="space-y-2">
                          {groupMembers.map((member) => (
                            <label key={member.id} className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={selectedMeal.assignedTo.includes(member.id)}
                                onChange={(e) => {
                                  const updatedAssigned = e.target.checked
                                    ? [...selectedMeal.assignedTo, member.id]
                                    : selectedMeal.assignedTo.filter(id => id !== member.id)
                                  
                                  const updatedMeal = { ...selectedMeal, assignedTo: updatedAssigned }
                                  setSelectedMeal(updatedMeal)
                                  setMealPlans(prev => prev.map(meal => 
                                    meal.id === selectedMeal.id ? updatedMeal : meal
                                  ))
                                }}
                                className="rounded border-[rgb(226,232,240)] text-[rgb(34,139,34)] focus:ring-[rgb(34,139,34)]"
                              />
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-[rgb(34,139,34)] rounded-full flex items-center justify-center text-white text-sm font-medium">
                                  {member.name.charAt(0)}
                                </div>
                                <span>{member.name}</span>
                                {member.dietary.length > 0 && (
                                  <span className="text-xs text-gray-500">
                                    ({member.dietary.join(', ')})
                                  </span>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="p-4 border border-[rgb(226,232,240)] rounded-lg">
                        <h4 className="font-medium text-[rgb(15,23,42)] mb-3">Shopping Assignments</h4>
                        <div className="space-y-2">
                          {selectedMeal.ingredients
                            .filter(ingredient => !ingredient.purchased)
                            .map((ingredient) => (
                            <div key={ingredient.id} className="flex items-center justify-between">
                              <span className="text-sm">
                                {ingredient.quantity} {ingredient.unit} {ingredient.name}
                              </span>
                              <select
                                value={ingredient.assignedTo || ''}
                                onChange={(e) => handleUpdateIngredient(ingredient.id, { assignedTo: e.target.value })}
                                className="px-2 py-1 text-sm border border-[rgb(226,232,240)] rounded focus:ring-1 focus:ring-[rgb(34,139,34)] focus:border-transparent"
                              >
                                <option value="">Unassigned</option>
                                {groupMembers.map((member) => (
                                  <option key={member.id} value={member.id}>
                                    {member.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Utensils className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">Select a meal to view details</p>
                <p className="text-sm">Or create a new meal to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Mock data
const DEFAULT_GROUP_MEMBERS: GroupMember[] = [
  {
    id: 'member-1',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    dietary: ['vegetarian']
  },
  {
    id: 'member-2',
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    dietary: ['gluten-free']
  },
  {
    id: 'member-3',
    name: 'Mike Rodriguez',
    email: 'mike@example.com',
    dietary: []
  },
  {
    id: 'member-4',
    name: 'Emma Wilson',
    email: 'emma@example.com',
    dietary: ['dairy-free', 'nut-free']
  }
]

const DEFAULT_MEAL_PLANS: MealPlan[] = [
  {
    id: 'meal-1',
    tripId: 'trip-1',
    mealType: 'breakfast',
    date: new Date().toISOString().split('T')[0],
    time: '08:00',
    name: 'Campfire Pancakes',
    description: 'Fluffy pancakes cooked over the campfire with fresh berries and maple syrup',
    servings: 4,
    assignedTo: ['member-1', 'member-2'],
    ingredients: [
      {
        id: 'ing-1',
        name: 'Pancake Mix',
        quantity: 2,
        unit: 'cups',
        category: 'grains',
        purchased: false,
        assignedTo: 'member-1'
      },
      {
        id: 'ing-2',
        name: 'Fresh Blueberries',
        quantity: 1,
        unit: 'cup',
        category: 'other',
        purchased: true
      },
      {
        id: 'ing-3',
        name: 'Maple Syrup',
        quantity: 1,
        unit: 'bottle',
        category: 'other',
        purchased: false,
        assignedTo: 'member-2'
      }
    ],
    cookingMethod: 'campfire',
    prepTime: 20,
    difficulty: 'easy',
    dietary: ['vegetarian'],
    status: 'planned',
    notes: 'Make sure to bring a good cast iron pan',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'meal-2',
    tripId: 'trip-1',
    mealType: 'dinner',
    date: new Date().toISOString().split('T')[0],
    time: '18:30',
    name: 'Grilled Salmon & Vegetables',
    description: 'Fresh salmon fillets with grilled seasonal vegetables',
    servings: 4,
    assignedTo: ['member-3', 'member-4'],
    ingredients: [
      {
        id: 'ing-4',
        name: 'Salmon Fillets',
        quantity: 4,
        unit: 'pieces',
        category: 'protein',
        purchased: false,
        assignedTo: 'member-3'
      },
      {
        id: 'ing-5',
        name: 'Bell Peppers',
        quantity: 3,
        unit: 'pieces',
        category: 'vegetables',
        purchased: false,
        assignedTo: 'member-4'
      },
      {
        id: 'ing-6',
        name: 'Zucchini',
        quantity: 2,
        unit: 'pieces',
        category: 'vegetables',
        purchased: true
      }
    ],
    cookingMethod: 'grill',
    prepTime: 45,
    difficulty: 'medium',
    dietary: ['gluten-free', 'dairy-free'],
    status: 'shopping',
    notes: 'Marinate salmon for at least 30 minutes before grilling',
    createdAt: '2024-01-15T11:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z'
  }
]

export default function MealPlannerDBSchemaDemo() {
  return <MealPlannerDBSchema />
}