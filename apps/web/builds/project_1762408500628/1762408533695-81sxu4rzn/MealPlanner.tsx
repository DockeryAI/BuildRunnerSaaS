'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, Plus, Trash2, Users } from 'lucide-react'

interface Meal {
  id: string
  name: string
  date: string
  time: string
  assignedTo: string[]
  notes: string
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

const inputStyles = "w-full p-16 bg-background dark:bg-surface border border-[#E5E7EB] dark:border-border rounded-lg focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] dark:focus:border-[#3B82F6] outline-none transition-all duration-200 font-inter text-muted-foreground dark:text-foreground"
const buttonStyles = "inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"

export function MealPlanner({
  initialMeals = DEFAULT_MEALS,
  onMealAdd = () => {},
  onMealDelete = () => {},
  isLoading = false
}: MealPlannerProps = {}) {
  const [meals, setMeals] = useState<Meal[]>(initialMeals)
  const [showAddForm, setShowAddForm] = useState(false)
  const [error, setError] = useState('')
  const [newMeal, setNewMeal] = useState<Partial<Meal>>({
    name: '',
    date: '',
    time: '',
    assignedTo: [],
    notes: ''
  })

  const handleAddMeal = () => {
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
      notes: newMeal.notes || ''
    }

    setMeals([...meals, meal])
    onMealAdd(meal)
    setNewMeal({
      name: '',
      date: '',
      time: '',
      assignedTo: [],
      notes: ''
    })
    setError('')
    setShowAddForm(false)
  }

  const handleDeleteMeal = (id: string) => {
    setMeals(meals.filter(meal => meal.id !== id))
    onMealDelete(id)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background dark:bg-surface p-32">
        <div className="max-w-3xl mx-auto space-y-24 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-surface dark:bg-surface rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background dark:bg-surface p-32"
    >
      <div className="max-w-3xl mx-auto">
        <header className="mb-48">
          <h1 className="text-3xl font-semibold text-muted-foreground dark:text-foreground mb-16 font-inter">Meal Planner</h1>
          <p className="text-muted-foreground dark:text-muted-foreground font-inter">Plan and assign meals for your trip</p>
        </header>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`${buttonStyles} w-full mb-48 p-24 bg-[#3B82F6] text-foreground rounded-lg shadow-md hover:bg-[#2563EB] dark:hover:bg-[#1D4ED8]`}
          onClick={() => setShowAddForm(true)}
          aria-label="Add new meal"
        >
          <Plus size={20} className="mr-8" />
          Add Meal
        </motion.button>

        {meals.length === 0 && !showAddForm && (
          <div className="text-center py-96">
            <div className="w-64 h-64 bg-surface dark:bg-surface rounded-full mx-auto mb-32 flex items-center justify-center">
              <Calendar className="w-32 h-32 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-medium text-muted-foreground dark:text-foreground mb-16">No meals planned yet</h3>
            <p className="text-muted-foreground dark:text-muted-foreground">Get started by adding your first meal</p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-48 p-32 bg-background dark:bg-surface border border-[#E5E7EB] dark:border-border rounded-lg shadow-lg"
            >
              {error && (
                <div className="mb-24 p-16 bg-secondary dark:bg-secondary/20 border border-secondary dark:border-secondary rounded-lg">
                  <p className="text-sm text-secondary dark:text-secondary">{error}</p>
                </div>
              )}

              <div className="space-y-24">
                <input
                  type="text"
                  placeholder="Meal name"
                  className={inputStyles}
                  value={newMeal.name}
                  onChange={e => setNewMeal({ ...newMeal, name: e.target.value })}
                  aria-label="Meal name"
                />
                <div className="grid grid-cols-2 gap-24">
                  <input
                    type="date"
                    className={inputStyles}
                    value={newMeal.date}
                    onChange={e => setNewMeal({ ...newMeal, date: e.target.value })}
                    aria-label="Meal date"
                  />
                  <input
                    type="time"
                    className={inputStyles}
                    value={newMeal.time}
                    onChange={e => setNewMeal({ ...newMeal, time: e.target.value })}
                    aria-label="Meal time"
                  />
                </div>
                <textarea
                  placeholder="Notes"
                  className={`${inputStyles} min-h-[120px]`}
                  value={newMeal.notes}
                  onChange={e => setNewMeal({ ...newMeal, notes: e.target.value })}
                  aria-label="Meal notes"
                />
                <div className="flex gap-16">
                  <button
                    onClick={handleAddMeal}
                    className={`${buttonStyles} flex-1 p-16 bg-[#3B82F6] text-foreground rounded-lg hover:bg-[#2563EB] dark:hover:bg-[#1D4ED8]`}
                    aria-label="Save meal"
                  >
                    Save Meal
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className={`${buttonStyles} flex-1 p-16 bg-surface dark:bg-surface text-muted-foreground dark:text-foreground rounded-lg hover:bg-surface dark:hover:bg-surface`}
                    aria-label="Cancel"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-24"
        >
          {meals.map(meal => (
            <motion.div
              key={meal.id}
              variants={itemVariants}
              whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
              className="p-24 bg-background dark:bg-surface border border-[#E5E7EB] dark:border-border rounded-lg shadow-md transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-16">
                <h3 className="text-xl font-medium text-muted-foreground dark:text-foreground">{meal.name}</h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDeleteMeal(meal.id)}
                  className="text-secondary hover:text-secondary dark:text-secondary dark:hover:text-secondary transition-colors duration-200"
                  aria-label="Delete meal"
                >
                  <Trash2 size={18} />
                </motion.button>
              </div>
              
              <div className="space-y-16 text-sm text-muted-foreground dark:text-muted-foreground">
                <div className="flex items-center gap-8">
                  <Calendar size={16} />
                  <span>{new Date(meal.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-8">
                  <Clock size={16} />
                  <span>{meal.time}</span>
                </div>
                {meal.assignedTo.length > 0 && (
                  <div className="flex items-center gap-8">
                    <Users size={16} />
                    <span>{meal.assignedTo.join(', ')}</span>
                  </div>
                )}
                {meal.notes && (
                  <p className="mt-16 text-muted-foreground dark:text-foreground">{meal.notes}</p>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
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
    notes: 'Pancakes and bacon'
  },
  {
    id: '2', 
    name: 'Saturday Dinner',
    date: '2024-03-16',
    time: '18:00',
    assignedTo: ['Mike', 'Lisa'],
    notes: 'Grilled burgers and corn'
  }
]

export default function MealPlannerDemo() {
  return <MealPlanner />
}