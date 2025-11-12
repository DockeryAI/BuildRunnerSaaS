'use client'

import { useState, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash } from 'lucide-react'

interface MealEntry {
  id: string
  name: string
  calories: number
}

interface CalorieEntryProps {
  initialEntries?: MealEntry[]
  onSave?: (entries: MealEntry[]) => void
}

export function CalorieEntry({
  initialEntries = [],
  onSave = () => { }
}: CalorieEntryProps) {
  const [entries, setEntries] = useState<MealEntry[]>(initialEntries)
  const [newMeal, setNewMeal] = useState({ name: '', calories: '' })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false); // For potential future async operations

  const handleAddMeal = () => {
    setError(null); // Clear previous errors
    if (!newMeal.name.trim() || !newMeal.calories.trim()) {
      setError("Meal name and calories cannot be empty.");
      return;
    }
    const calories = parseInt(newMeal.calories);
    if (isNaN(calories) || calories <= 0) {
      setError("Calories must be a positive number.");
      return;
    }

    const newEntry: MealEntry = {
      id: useId(), // Use useId for better unique IDs
      name: newMeal.name.trim(),
      calories: calories
    }
    setEntries(prevEntries => [...prevEntries, newEntry])
    setNewMeal({ name: '', calories: '' })
  }

  const handleRemoveMeal = (id: string) => {
    setEntries(prevEntries => prevEntries.filter(entry => entry.id !== id))
  }

  const totalCalories = entries.reduce((sum, entry) => sum + entry.calories, 0)

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await onSave(entries);
      // Optionally, show a success message
    } catch (err) {
      setError("Failed to save entries. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="bg-background rounded-lg border border-[#E5E7EB] p-6 font-inter"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="space-y-6">
        {error && (
          <div
            className="rounded-lg bg-destructive border border-destructive p-4"
            role="alert"
          >
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {entries.length === 0 && !isLoading ? (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-surface rounded-full mx-auto mb-4 flex items-center justify-center">
                <Plus className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No meals added yet</h3>
              <p className="text-muted-foreground text-sm">Get started by adding your first meal entry</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {isLoading ? (
                Array.from({ length: 2 }).map((_, index) => (
                  <div key={`skeleton-${index}`} className="flex items-center justify-between bg-surface rounded-lg p-4 border border-[#E5E7EB] animate-pulse">
                    <div>
                      <div className="h-4 bg-surface rounded w-32 mb-2"></div>
                      <div className="h-3 bg-surface rounded w-20"></div>
                    </div>
                    <div className="h-5 w-5 bg-surface rounded-full"></div>
                  </div>
                ))
              ) : (
                <AnimatePresence>
                  {entries.map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      className="flex items-center justify-between bg-surface rounded-lg p-4 border border-[#E5E7EB]"
                      initial={{ opacity: 0, x: -20, height: 0, padding: 0 }}
                      animate={{ opacity: 1, x: 0, height: 'auto', padding: '1rem' }}
                      exit={{ opacity: 0, x: 20, height: 0, padding: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      layout
                    >
                      <div>
                        <p className="text-muted-foreground font-medium">{entry.name}</p>
                        <p className="text-muted-foreground text-sm">{entry.calories} calories</p>
                      </div>
                      <button
                        onClick={() => handleRemoveMeal(entry.id)}
                        className="text-destructive hover:text-destructive transition-colors
                                   focus:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2
                                   hover:scale-[1.05] active:scale-[0.95] duration-150"
                        aria-label={`Remove ${entry.name}`}
                      >
                        <Trash className="h-5 w-5" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          )}
        </AnimatePresence>

        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Meal name"
            value={newMeal.name}
            onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
            className="flex-1 bg-background border border-[#E5E7EB] rounded-lg px-4 py-2 text-muted-foreground placeholder:text-muted-foreground
                       focus:ring-2 focus:ring-[#3B82F6] focus:outline-none transition-all duration-200"
            aria-label="Meal name"
          />
          <input
            type="number"
            placeholder="Calories"
            value={newMeal.calories}
            onChange={(e) => setNewMeal({ ...newMeal, calories: e.target.value })}
            className="w-24 bg-background border border-[#E5E7EB] rounded-lg px-4 py-2 text-muted-foreground placeholder:text-muted-foreground
                       focus:ring-2 focus:ring-[#3B82F6] focus:outline-none transition-all duration-200"
            aria-label="Calories"
          />
          <button
            onClick={handleAddMeal}
            className="bg-[#3B82F6] text-foreground rounded-lg px-4 py-2 hover:bg-primary transition-colors
                       flex items-center gap-2 font-medium
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2
                       hover:scale-[1.02] active:scale-[0.98] duration-150"
            aria-label="Add meal"
          >
            <Plus className="h-5 w-5" />
            <span>Add</span>
          </button>
        </div>

        <div className="pt-6 border-t border-[#E5E7EB]">
          <p className="text-lg font-medium text-muted-foreground">
            Total Calories: <span className="text-[#3B82F6]">{totalCalories}</span>
          </p>
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-surface text-foreground rounded-lg px-4 py-2 hover:bg-surface transition-colors
                     font-medium
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-muted focus-visible:ring-offset-2
                     hover:scale-[1.02] active:scale-[0.98] duration-150"
          disabled={isLoading || entries.length === 0}
          aria-label="Save entries"
        >
          {isLoading ? 'Saving...' : 'Save Entries'}
        </button>
      </div>
    </motion.div>
  )
}

const DEFAULT_ENTRIES = [
  { id: 'meal-1', name: 'Breakfast', calories: 300 },
  { id: 'meal-2', name: 'Lunch', calories: 500 }
]

export default function CalorieEntryDemo() {
  return <CalorieEntry initialEntries={DEFAULT_ENTRIES} onSave={(entries) => console.log("Saved entries:", entries)} />
}