'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Sun, Moon, Palette, Type, Grid, Layout, Box, 
  Layers, Spacing, ArrowRight, Search
} from 'lucide-react'

interface DesignToken {
  name: string
  value: string
  description: string
  icon: React.ReactNode
}

interface DesignSystemProps {
  onTokenSelect?: (token: DesignToken) => void
  defaultCategory?: string
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

export function DesignSystem({
  onTokenSelect = () => {},
  defaultCategory = 'colors'
}: DesignSystemProps = {}) {
  const [activeCategory, setActiveCategory] = useState(defaultCategory)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const categories = {
    colors: [
      { name: 'primary', value: 'bg-[#3B82F6]', description: 'Primary brand color', icon: <Palette className="w-4 h-4" /> },
      { name: 'secondary', value: 'bg-secondary', description: 'Secondary brand color', icon: <Palette className="w-4 h-4" /> },
      { name: 'accent', value: 'bg-accent', description: 'Accent color for highlights', icon: <Palette className="w-4 h-4" /> }
    ],
    typography: [
      { name: 'heading', value: 'text-foreground font-bold', description: 'Heading text style', icon: <Type className="w-4 h-4" /> },
      { name: 'body', value: 'text-muted-foreground', description: 'Body text style', icon: <Type className="w-4 h-4" /> }
    ],
    spacing: [
      { name: 'small', value: 'p-2', description: '8px spacing', icon: <Spacing className="w-4 h-4" /> },
      { name: 'medium', value: 'p-4', description: '16px spacing', icon: <Spacing className="w-4 h-4" /> },
      { name: 'large', value: 'p-6', description: '24px spacing', icon: <Spacing className="w-4 h-4" /> }
    ]
  }

  const filteredTokens = categories[activeCategory as keyof typeof categories].filter(token =>
    token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#FFFFFF] dark:bg-surface p-8"
    >
      <Card className="max-w-4xl mx-auto bg-background dark:bg-surface border border-[#E5E7EB] dark:border-border shadow-lg">
        <div className="p-8">
          <motion.div className="flex flex-col gap-8">
            <motion.div 
              className="flex flex-col gap-2"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              <h1 className="text-2xl font-bold text-muted-foreground dark:text-foreground font-inter">Design System</h1>
              <p className="text-muted-foreground dark:text-muted-foreground">Explore and copy design tokens for consistent styling</p>
            </motion.div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search tokens..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background dark:bg-surface border-[#E5E7EB] dark:border-border focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] transition-all duration-200"
                  aria-label="Search design tokens"
                />
              </div>
              
              <div className="flex gap-2">
                {Object.keys(categories).map(category => (
                  <motion.button
                    key={category}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveCategory(category)}
                    className={`px-4 py-2 rounded-md font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 ${
                      activeCategory === category 
                        ? 'bg-[#3B82F6] text-foreground'
                        : 'bg-surface dark:bg-surface text-muted-foreground dark:text-muted-foreground hover:bg-surface dark:hover:bg-surface'
                    }`}
                    aria-label={`Switch to ${category} category`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </motion.button>
                ))}
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-secondary dark:bg-secondary/20 border border-secondary dark:border-secondary p-4">
                <p className="text-sm text-secondary dark:text-secondary">{error}</p>
              </div>
            )}

            {isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="space-y-4 animate-pulse">
                    <div className="h-4 bg-surface dark:bg-surface rounded w-3/4"></div>
                    <div className="h-4 bg-surface dark:bg-surface rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show" 
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                <AnimatePresence mode="wait">
                  {filteredTokens.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <div className="w-16 h-16 bg-surface dark:bg-surface rounded-full mx-auto mb-4 flex items-center justify-center">
                        <Search className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium text-muted-foreground dark:text-foreground mb-2">No tokens found</h3>
                      <p className="text-muted-foreground dark:text-muted-foreground text-sm">Try adjusting your search query</p>
                    </div>
                  ) : (
                    filteredTokens.map(token => (
                      <motion.div
                        key={token.name}
                        variants={itemVariants}
                        layout
                        whileHover={{ y: -4 }}
                        className="relative group"
                      >
                        <Card className="p-4 hover:border-[#3B82F6]/50 hover:shadow-lg transition-all duration-300">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                              {token.icon}
                              <div>
                                <Label className="font-medium text-muted-foreground dark:text-foreground">{token.name}</Label>
                                <p className="text-sm text-muted-foreground dark:text-muted-foreground">{token.description}</p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onTokenSelect(token)}
                              className="opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                              aria-label={`Copy ${token.name} token`}
                            >
                              <ArrowRight className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className={`mt-3 p-3 rounded ${token.value}`}>
                            <code className="text-xs font-mono">{token.value}</code>
                          </div>
                        </Card>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </motion.div>
        </div>
      </Card>
    </motion.div>
  )
}

export default function DesignSystemDemo() {
  return <DesignSystem />
}