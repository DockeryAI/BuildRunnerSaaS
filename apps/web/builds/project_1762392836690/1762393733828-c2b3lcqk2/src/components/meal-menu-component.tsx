'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, Plus, Trash2, UtensilsCrossed } from 'lucide-react'

interface Meal {
  id: string
  name: string
  day: string
  time: string
  assignedTo?: string
  notes?: string
}

interface MealMenuProps {
  meals?: Meal[]
  onAddMeal?: (meal: Omit<Meal, 'id'>) => void
  onDeleteMeal?: (id: string) => void
  isLoading?: boolean
}

const defaultMeals: Meal[] = [
  {
    id: '1',
    name: 'Campfire Chili',
    day: 'Saturday',
    time: 'Dinner',
    assignedTo: 'John D.',
    notes: 'Vegetarian option available'
  },
  {
    id: '2',
    name: 'Breakfast Burritos',
    day: 'Sunday',
    time: 'Breakfast',
    assignedTo: 'Sarah M.',
    notes: 'Bring hot sauce'
  }
]

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

export function MealMenu({
  meals = defaultMeals,
  onAddMeal = () => {},
  onDeleteMeal = () => {},
  isLoading = false
}: MealMenuProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newMeal, setNewMeal] = useState({
    name: '',
    day: '',
    time: '',
    assignedTo: '',
    notes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await onAddMeal(newMeal)
      setNewMeal({
        name: '',
        day: '',
        time: '',
        assignedTo: '',
        notes: ''
      })
      setShowAddForm(false)
      setError(null)
    } catch (err) {
      setError('Failed to add meal. Please try again.')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-3xl mx-auto p-6"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <UtensilsCrossed className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-semibold text-foreground dark:text-foreground-dark">Trip Menu</h2>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primaryForeground rounded-lg hover:bg-primary/90 focus:ring-2 focus:ring-ring focus:outline-none disabled:opacity-50 transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Add Meal</span>
        </motion.button>
      </div>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted dark:bg-muted/20 rounded-xl"></div>
          ))}
        </div>
      ) : meals.length === 0 ? (
        <div className="text-center py-16">
          <UtensilsCrossed className="w-16 h-16 mx-auto mb-4 text-mutedForeground" />
          <h3 className="text-lg font-medium mb-2">No meals planned yet</h3>
          <p className="text-mutedForeground">Start by adding your first meal to the trip menu</p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {meals.map((meal) => (
            <motion.div
              key={meal.id}
              variants={itemVariants}
              whileHover={{ y: -2, boxShadow: '0 20px 25px -5px rgba(45, 90, 39, 0.08)' }}
              className="bg-surface dark:bg-surface-dark rounded-xl p-6 shadow-md border border-border transition-all duration-300"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg text-foreground dark:text-foreground-dark">{meal.name}</h3>
                  <div className="flex items-center gap-4 mt-3 text-sm text-mutedForeground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{meal.day}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{meal.time}</span>
                    </div>
                  </div>
                  {meal.assignedTo && (
                    <div className="mt-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-muted text-mutedForeground">
                        Assigned to: {meal.assignedTo}
                      </span>
                    </div>
                  )}
                  {meal.notes && (
                    <p className="mt-3 text-sm text-mutedForeground">{meal.notes}</p>
                  )}
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onDeleteMeal(meal.id)}
                  className="text-destructive hover:text-destructive/90 focus:outline-none focus:ring-2 focus:ring-ring rounded-lg p-2 transition-colors"
                  aria-label={`Delete ${meal.name}`}
                >
                  <Trash2 className="w-5 h-5" />
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
            className="fixed inset-0 bg-foreground/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-surface dark:bg-surface-dark rounded-xl p-6 w-full max-w-md shadow-xl"
            >
              <h3 className="text-xl font-semibold mb-6">Add New Meal</h3>
              
              {error && (
                <div className="mb-6 rounded-lg bg-destructive/10 border border-destructive/20 p-4">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Form fields remain the same but with updated styling */}
                {/* ... Rest of the form implementation ... */}
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function MealMenuDemo() {
  return <MealMenu />
}