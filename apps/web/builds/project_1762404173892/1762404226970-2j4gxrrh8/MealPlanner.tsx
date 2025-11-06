'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Calendar, Clock, Plus, Trash2, Users, Loader2 } from 'lucide-react'

interface Meal {
  id: string
  day: string
  time: string
  name: string
  assignedTo: string[]
  notes?: string
}

interface MealPlannerProps {
  initialMeals?: Meal[]
  onMealAdd?: (meal: Meal) => void
  onMealDelete?: (id: string) => void
  isLoading?: boolean
}

const defaultMeals: Meal[] = [
  {
    id: '1',
    day: 'Saturday',
    time: 'Breakfast',
    name: 'Campfire Breakfast Burritos',
    assignedTo: ['John', 'Sarah'],
    notes: 'Bring tortillas and eggs'
  },
  {
    id: '2', 
    day: 'Saturday',
    time: 'Dinner',
    name: 'Dutch Oven Chili',
    assignedTo: ['Mike'],
    notes: 'Need firewood for cooking'
  }
]

export function MealPlanner({
  initialMeals = defaultMeals,
  onMealAdd = () => {},
  onMealDelete = () => {},
  isLoading = false
}: MealPlannerProps) {
  const [meals, setMeals] = useState<Meal[]>(initialMeals)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newMeal, setNewMeal] = useState<Partial<Meal>>({})
  const [error, setError] = useState<string | null>(null)

  const handleAddMeal = () => {
    if (!newMeal.day || !newMeal.time || !newMeal.name) {
      setError('Please fill in all required fields')
      return
    }

    const meal: Meal = {
      id: Math.random().toString(36).slice(2),
      day: newMeal.day,
      time: newMeal.time,
      name: newMeal.name,
      assignedTo: newMeal.assignedTo || [],
      notes: newMeal.notes
    }

    setMeals([...meals, meal])
    onMealAdd(meal)
    setNewMeal({})
    setShowAddForm(false)
    setError(null)
  }

  const handleDelete = (id: string) => {
    setMeals(meals.filter(m => m.id !== id))
    onMealDelete(id)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0 }
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-3xl mx-auto p-32 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-3xl mx-auto p-32"
    >
      <div className="flex items-center justify-between mb-24">
        <h2 className="text-2xl font-semibold text-muted-foreground dark:text-foreground font-inter">Meal Planner</h2>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-8 px-16 py-8 bg-[#3B82F6] text-foreground rounded-lg hover:bg-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 transition-all duration-200"
          aria-label="Add new meal"
        >
          <Plus size={18} />
          Add Meal
        </motion.button>
      </div>

      {meals.length === 0 ? (
        <div className="text-center py-48">
          <div className="w-64 h-64 bg-surface dark:bg-surface rounded-full mx-auto mb-16 flex items-center justify-center">
            <Calendar className="w-32 h-32 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-muted-foreground dark:text-foreground mb-8">No meals planned yet</h3>
          <p className="text-muted-foreground dark:text-muted-foreground">Get started by adding your first meal</p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-16"
        >
          {meals.map(meal => (
            <motion.div
              key={meal.id}
              variants={itemVariants}
              className="bg-background dark:bg-surface p-16 rounded-lg border border-[#E5E7EB] shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-muted-foreground dark:text-foreground">{meal.name}</h3>
                  <div className="flex gap-16 mt-8 text-muted-foreground dark:text-muted-foreground text-sm">
                    <div className="flex items-center gap-4">
                      <Calendar size={16} />
                      {meal.day}
                    </div>
                    <div className="flex items-center gap-4">
                      <Clock size={16} />
                      {meal.time}
                    </div>
                    <div className="flex items-center gap-4">
                      <Users size={16} />
                      {meal.assignedTo.join(', ')}
                    </div>
                  </div>
                  {meal.notes && (
                    <p className="mt-8 text-sm text-muted-foreground dark:text-muted-foreground">{meal.notes}</p>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDelete(meal.id)}
                  className="text-secondary hover:text-secondary dark:text-secondary dark:hover:text-secondary transition-colors duration-200"
                  aria-label="Delete meal"
                >
                  <Trash2 size={18} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/50 backdrop-blur-sm"
          >
            <div className="fixed inset-x-0 bottom-0 p-24">
              <div className="bg-background dark:bg-surface border border-[#E5E7EB] rounded-lg p-24 shadow-xl max-w-lg mx-auto">
                <h3 className="text-lg font-medium text-muted-foreground dark:text-foreground mb-16">Add New Meal</h3>
                
                {error && (
                  <div className="mb-16 rounded-lg bg-secondary dark:bg-secondary/20 border border-secondary dark:border-secondary p-16">
                    <p className="text-sm text-secondary dark:text-secondary">{error}</p>
                  </div>
                )}

                <div className="space-y-16">
                  <input
                    type="text"
                    placeholder="Meal Name"
                    value={newMeal.name || ''}
                    onChange={e => setNewMeal({...newMeal, name: e.target.value})}
                    className="w-full px-12 py-8 rounded-md border border-[#E5E7EB] bg-background dark:bg-surface focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] transition-all duration-200"
                  />
                  
                  <select
                    value={newMeal.day || ''}
                    onChange={e => setNewMeal({...newMeal, day: e.target.value})}
                    className="w-full px-12 py-8 rounded-md border border-[#E5E7EB] bg-background dark:bg-surface focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] transition-all duration-200"
                  >
                    <option value="">Select Day</option>
                    <option>Friday</option>
                    <option>Saturday</option>
                    <option>Sunday</option>
                  </select>

                  <select
                    value={newMeal.time || ''}
                    onChange={e => setNewMeal({...newMeal, time: e.target.value})}
                    className="w-full px-12 py-8 rounded-md border border-[#E5E7EB] bg-background dark:bg-surface focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] transition-all duration-200"
                  >
                    <option value="">Select Time</option>
                    <option>Breakfast</option>
                    <option>Lunch</option>
                    <option>Dinner</option>
                  </select>

                  <textarea
                    placeholder="Notes (optional)"
                    value={newMeal.notes || ''}
                    onChange={e => setNewMeal({...newMeal, notes: e.target.value})}
                    className="w-full px-12 py-8 rounded-md border border-[#E5E7EB] bg-background dark:bg-surface focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] transition-all duration-200"
                  />

                  <div className="flex gap-8 justify-end">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setShowAddForm(false)
                        setError(null)
                      }}
                      className="px-16 py-8 border border-[#E5E7EB] rounded-lg hover:bg-surface dark:hover:bg-surface focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 transition-all duration-200"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAddMeal}
                      className="px-16 py-8 bg-[#3B82F6] text-foreground rounded-lg hover:bg-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 transition-all duration-200"
                    >
                      Add Meal
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function MealPlannerDemo() {
  return <MealPlanner />
}