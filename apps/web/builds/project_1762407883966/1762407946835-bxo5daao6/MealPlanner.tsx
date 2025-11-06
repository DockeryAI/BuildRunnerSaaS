'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Calendar, Clock, Plus, Trash2, Users, AlertCircle } from 'lucide-react'

interface Meal {
  id: string
  name: string
  date: string
  time: string
  assignedTo: string[]
  description?: string
}

interface MealPlannerProps {
  initialMeals?: Meal[]
  onMealAdd?: (meal: Meal) => void
  onMealDelete?: (id: string) => void
  isLoading?: boolean
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export function MealPlanner({
  initialMeals = DEFAULT_MEALS,
  onMealAdd = () => {},
  onMealDelete = () => {},
  isLoading = false
}: MealPlannerProps = {}) {
  const [meals, setMeals] = useState<Meal[]>(initialMeals)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newMeal, setNewMeal] = useState<Partial<Meal>>({})
  const [error, setError] = useState<string>('')

  const handleAddMeal = () => {
    setError('')
    if (!newMeal.name || !newMeal.date || !newMeal.time) {
      setError('Please fill in all required fields')
      return
    }

    const meal = {
      id: Math.random().toString(36).slice(2),
      name: newMeal.name,
      date: newMeal.date,
      time: newMeal.time,
      assignedTo: newMeal.assignedTo || [],
      description: newMeal.description
    }

    setMeals([...meals, meal])
    onMealAdd(meal)
    setNewMeal({})
    setShowAddForm(false)
  }

  const handleDeleteMeal = (id: string) => {
    setMeals(meals.filter(m => m.id !== id))
    onMealDelete(id)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-3xl mx-auto p-8"
    >
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-semibold text-muted-foreground dark:text-foreground font-inter">Meal Planner</h2>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddForm(true)}
          className="bg-[#3B82F6] text-foreground px-4 py-2 rounded-lg flex items-center gap-2 shadow-md hover:bg-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 disabled:opacity-50 transition-all duration-200"
          aria-label="Add new meal"
        >
          <Plus size={20} />
          Add Meal
        </motion.button>
      </div>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-surface dark:bg-surface rounded-lg"></div>
          ))}
        </div>
      ) : meals.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-surface dark:bg-surface rounded-full mx-auto mb-4 flex items-center justify-center">
            <Calendar className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-muted-foreground dark:text-foreground mb-2">No meals planned</h3>
          <p className="text-muted-foreground dark:text-muted-foreground">Get started by adding your first meal</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-background dark:bg-surface border border-[#E5E7EB] rounded-lg p-6 mb-8 shadow-lg"
            >
              <div className="space-y-4">
                {error && (
                  <div className="rounded-lg bg-secondary dark:bg-secondary/20 border border-secondary dark:border-secondary p-4 flex items-center gap-2">
                    <AlertCircle className="text-secondary" size={16} />
                    <p className="text-sm text-secondary dark:text-secondary">{error}</p>
                  </div>
                )}

                <input
                  type="text"
                  placeholder="Meal name"
                  value={newMeal.name || ''}
                  onChange={e => setNewMeal({ ...newMeal, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-[#E5E7EB] bg-background dark:bg-surface text-muted-foreground dark:text-foreground focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] transition-all duration-200"
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="date"
                    value={newMeal.date || ''}
                    onChange={e => setNewMeal({ ...newMeal, date: e.target.value })}
                    className="px-4 py-2 rounded-lg border border-[#E5E7EB] bg-background dark:bg-surface text-muted-foreground dark:text-foreground focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] transition-all duration-200"
                  />
                  <input
                    type="time"
                    value={newMeal.time || ''}
                    onChange={e => setNewMeal({ ...newMeal, time: e.target.value })}
                    className="px-4 py-2 rounded-lg border border-[#E5E7EB] bg-background dark:bg-surface text-muted-foreground dark:text-foreground focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] transition-all duration-200"
                  />
                </div>

                <textarea
                  placeholder="Description (optional)"
                  value={newMeal.description || ''}
                  onChange={e => setNewMeal({ ...newMeal, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-[#E5E7EB] bg-background dark:bg-surface text-muted-foreground dark:text-foreground focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] transition-all duration-200"
                />

                <div className="flex justify-end gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 rounded-lg bg-surface dark:bg-surface text-muted-foreground dark:text-muted-foreground hover:bg-surface dark:hover:bg-surface focus:outline-none focus:ring-2 focus:ring-muted/50 transition-all duration-200"
                    aria-label="Cancel adding meal"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddMeal}
                    className="px-4 py-2 rounded-lg bg-[#3B82F6] text-foreground hover:bg-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 transition-all duration-200"
                    aria-label="Save meal"
                  >
                    Save Meal
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {meals.map(meal => (
              <motion.div
                key={meal.id}
                variants={itemVariants}
                whileHover={{ y: -4, shadow: 'lg' }}
                className="bg-background dark:bg-surface border border-[#E5E7EB] rounded-lg p-6 shadow-md transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-muted-foreground dark:text-foreground">{meal.name}</h3>
                    {meal.description && (
                      <p className="mt-1 text-muted-foreground dark:text-muted-foreground text-sm">{meal.description}</p>
                    )}
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground dark:text-muted-foreground">
                        <Calendar size={16} />
                        <span>{new Date(meal.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground dark:text-muted-foreground">
                        <Clock size={16} />
                        <span>{meal.time}</span>
                      </div>
                      {meal.assignedTo.length > 0 && (
                        <div className="flex items-center gap-2 text-muted-foreground dark:text-muted-foreground">
                          <Users size={16} />
                          <span>{meal.assignedTo.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDeleteMeal(meal.id)}
                    className="text-secondary hover:text-secondary focus:outline-none focus:ring-2 focus:ring-secondary/50 rounded-full p-2 transition-all duration-200"
                    aria-label="Delete meal"
                  >
                    <Trash2 size={20} />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  )
}

const DEFAULT_MEALS: Meal[] = [
  {
    id: '1',
    name: 'Saturday Breakfast',
    date: '2024-03-16',
    time: '08:00',
    assignedTo: ['John', 'Sarah'],
    description: 'Pancakes and bacon'
  },
  {
    id: '2', 
    name: 'Saturday Lunch',
    date: '2024-03-16',
    time: '12:30',
    assignedTo: ['Mike'],
    description: 'Sandwiches and chips'
  }
]

export default function MealPlannerDemo() {
  return <MealPlanner />
}