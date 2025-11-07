'use client'

import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Database,
  Plug,
  Zap,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Loader2,
  Trash2,
  Edit,
  PlusCircle,
  CloudOff,
  Settings,
  Key,
  User,
  Info,
  Copy
} from 'lucide-react'

// Design System Colors
const colors = {
  primary: '#3B82F6', // Blue-500
  background: '#FFFFFF', // White
  foreground: '#1F2937', // Gray-800
  muted: '#F3F4F6', // Gray-100
  'muted-foreground': '#6B7280', // Gray-500
  border: '#E5E7EB', // Gray-200
  card: '#FFFFFF', // White
  'card-foreground': '#1F2937', // Gray-800
  accent: '#10B981', // Green-500
  'accent-foreground': '#FFFFFF', // White
  destructive: '#EF4444', // Red-500
  'destructive-foreground': '#FFFFFF', // White
  ring: '#3B82F6', // Primary
}

// Dark Mode Colors (example, adjust as needed)
const darkColors = {
  primary: '#60A5FA', // Blue-400
  background: '#111827', // Gray-900
  foreground: '#F9FAFB', // Gray-50
  muted: '#1F2937', // Gray-800
  'muted-foreground': '#9CA3AF', // Gray-400
  border: '#374151', // Gray-700
  card: '#1F2937', // Gray-800
  'card-foreground': '#F9FAFB', // Gray-50
  accent: '#34D399', // Green-400
  'accent-foreground': '#111827', // Gray-900
  destructive: '#F87171', // Red-400
  'destructive-foreground': '#111827', // Gray-900
  ring: '#60A5FA', // Primary (dark)
}

// Helper to apply colors dynamically
const getCssVar = (name: keyof typeof colors) => `var(--${name})`

// Define the Supabase client type for better type safety
interface SupabaseClient {
  from: (tableName: string) => {
    select: (columns?: string) => {
      eq: (column: string, value: any) => Promise<{ data: any[] | null; error: any }>
      order: (column: string, options?: { ascending?: boolean }) => Promise<{ data: any[] | null; error: any }>
      limit: (count: number) => Promise<{ data: any[] | null; error: any }>
    }
    insert: (data: any | any[]) => Promise<{ data: any[] | null; error: any }>
    update: (data: any) => {
      eq: (column: string, value: any) => Promise<{ data: any[] | null; error: any }>
    }
    delete: () => {
      eq: (column: string, value: any) => Promise<{ data: any[] | null; error: any }>
    }
  }
  auth: {
    getUser: () => Promise<{ data: { user: any | null }; error: any }>
    signInWithPassword: (credentials: { email?: string; password?: string }) => Promise<{ data: { user: any | null }; error: any }>
    signUp: (credentials: { email?: string; password?: string }) => Promise<{ data: { user: any | null }; error: any }>
    signOut: () => Promise<{ error: any }>
  }
}

// Mock Supabase client for demonstration purposes
const mockSupabaseClient: SupabaseClient = {
  from: (tableName: string) => ({
    select: async (columns?: string) => {
      await new Promise(resolve => setTimeout(resolve, 800)) // Simulate network delay
      if (tableName === 'charging_stations') {
        return {
          data: [
            { id: 'cs1', name: 'Home Charger 1', location: '123 Main St', status: 'available', price: 0.25, ownerId: 'user1' },
            { id: 'cs2', name: 'Work Charger', location: '456 Oak Ave', status: 'charging', price: 0.30, ownerId: 'user2' },
            { id: 'cs3', name: 'Public Station', location: '789 Pine Ln', status: 'unavailable', price: 0.20, ownerId: 'user1' },
          ],
          error: null
        }
      }
      return { data: [], error: null }
    },
    insert: async (data: any | any[]) => {
      await new Promise(resolve => setTimeout(resolve, 800))
      console.log('Mock Supabase Insert:', tableName, data)
      return { data: Array.isArray(data) ? data.map((d, i) => ({ ...d, id: `new-${i}` })) : [{ ...data, id: 'new-1' }], error: null }
    },
    update: (data: any) => ({
      eq: async (column: string, value: any) => {
        await new Promise(resolve => setTimeout(resolve, 800))
        console.log('Mock Supabase Update:', tableName, column, value, data)
        return { data: [{ ...data, id: value }], error: null }
      }
    }),
    delete: () => ({
      eq: async (column: string, value: any) => {
        await new Promise(resolve => setTimeout(resolve, 800))
        console.log('Mock Supabase Delete:', tableName, column, value)
        return { data: [], error: null }
      }
    })
  }),
  auth: {
    getUser: async () => {
      await new Promise(resolve => setTimeout(resolve, 500))
      return { data: { user: { id: 'user1', email: 'test@example.com' } }, error: null }
    },
    signInWithPassword: async (credentials) => {
      await new Promise(resolve => setTimeout(resolve, 500))
      if (credentials.email === 'test@example.com' && credentials.password === 'password') {
        return { data: { user: { id: 'user1', email: 'test@example.com' } }, error: null }
      }
      return { data: { user: null }, error: { message: 'Invalid credentials' } }
    },
    signUp: async (credentials) => {
      await new Promise(resolve => setTimeout(resolve, 500))
      if (credentials.email && credentials.password) {
        return { data: { user: { id: 'new-user', email: credentials.email } }, error: null }
      }
      return { data: { user: null }, error: { message: 'Sign up failed' } }
    },
    signOut: async () => {
      await new Promise(resolve => setTimeout(resolve, 300))
      return { error: null }
    }
  }
}

interface SupabaseContextType {
  supabase: SupabaseClient
  user: any | null
  loadingUser: boolean
  signIn: (email?: string, password?: string) => Promise<boolean>
  signUp: (email?: string, password?: string) => Promise<boolean>
  signOut: () => Promise<void>
  fetchData: <T>(tableName: string, query?: { column?: string; value?: any; orderColumn?: string; ascending?: boolean; limit?: number }) => Promise<T[] | null>
  insertData: <T>(tableName: string, data: Partial<T> | Partial<T>[]) => Promise<T[] | null>
  updateData: <T>(tableName: string, id: string, data: Partial<T>) => Promise<T[] | null>
  deleteData: (tableName: string, id: string) => Promise<boolean>
  error: string | null
  clearError: () => void
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

interface SupabaseProviderProps {
  children: React.ReactNode
  client?: SupabaseClient
}

export function SupabaseProvider({ children, client = mockSupabaseClient }: SupabaseProviderProps) {
  const [user, setUser] = useState<any | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => setError(null), [])

  const fetchUser = useCallback(async () => {
    setLoadingUser(true)
    clearError()
    try {
      const { data: { user }, error: authError } = await client.auth.getUser()
      if (authError) throw authError
      setUser(user)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user session.')
      setUser(null)
    } finally {
      setLoadingUser(false)
    }
  }, [client, clearError])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const signIn = useCallback(async (email?: string, password?: string) => {
    clearError()
    try {
      const { data, error: authError } = await client.auth.signInWithPassword({ email, password })
      if (authError) throw authError
      setUser(data.user)
      return true
    } catch (err: any) {
      setError(err.message || 'Sign in failed.')
      return false
    }
  }, [client, clearError])

  const signUp = useCallback(async (email?: string, password?: string) => {
    clearError()
    try {
      const { data, error: authError } = await client.auth.signUp({ email, password })
      if (authError) throw authError
      setUser(data.user)
      return true
    } catch (err: any) {
      setError(err.message || 'Sign up failed.')
      return false
    }
  }, [client, clearError])

  const signOut = useCallback(async () => {
    clearError()
    try {
      const { error: authError } = await client.auth.signOut()
      if (authError) throw authError
      setUser(null)
    } catch (err: any) {
      setError(err.message || 'Sign out failed.')
    }
  }, [client, clearError])

  const fetchData = useCallback(async <T>(
    tableName: string,
    query?: { column?: string; value?: any; orderColumn?: string; ascending?: boolean; limit?: number }
  ): Promise<T[] | null> => {
    clearError()
    try {
      let queryBuilder = client.from(tableName).select('*')
      if (query?.column && query.value !== undefined) {
        queryBuilder = queryBuilder.eq(query.column, query.value) as any // Type assertion for chaining
      }
      if (query?.orderColumn) {
        queryBuilder = queryBuilder.order(query.orderColumn, { ascending: query.ascending ?? true }) as any
      }
      if (query?.limit) {
        queryBuilder = queryBuilder.limit(query.limit) as any
      }

      const { data, error: dbError } = await queryBuilder
      if (dbError) throw dbError
      return data as T[]
    } catch (err: any) {
      setError(`Failed to fetch data from ${tableName}: ${err.message}`)
      return null
    }
  }, [client, clearError])

  const insertData = useCallback(async <T>(tableName: string, data: Partial<T> | Partial<T>[]): Promise<T[] | null> => {
    clearError()
    try {
      const { data: insertedData, error: dbError } = await client.from(tableName).insert(data)
      if (dbError) throw dbError
      return insertedData as T[]
    } catch (err: any) {
      setError(`Failed to insert data into ${tableName}: ${err.message}`)
      return null
    }
  }, [client, clearError])

  const updateData = useCallback(async <T>(tableName: string, id: string, data: Partial<T>): Promise<T[] | null> => {
    clearError()
    try {
      const { data: updatedData, error: dbError } = await client.from(tableName).update(data).eq('id', id)
      if (dbError) throw dbError
      return updatedData as T[]
    } catch (err: any) {
      setError(`Failed to update data in ${tableName}: ${err.message}`)
      return null
    }
  }, [client, clearError])

  const deleteData = useCallback(async (tableName: string, id: string): Promise<boolean> => {
    clearError()
    try {
      const { error: dbError } = await client.from(tableName).delete().eq('id', id)
      if (dbError) throw dbError
      return true
    } catch (err: any) {
      setError(`Failed to delete data from ${tableName}: ${err.message}`)
      return false
    }
  }, [client, clearError])

  const value = {
    supabase: client,
    user,
    loadingUser,
    signIn,
    signUp,
    signOut,
    fetchData,
    insertData,
    updateData,
    deleteData,
    error,
    clearError,
  }

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  )
}

export function useSupabase() {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}

interface ChargingStation {
  id: string
  name: string
  location: string
  status: 'available' | 'charging' | 'unavailable'
  price: number
  ownerId: string
}

interface SupabaseIntegrationProps {
  initialStations?: ChargingStation[]
}

export function SupabaseIntegration({ initialStations = [] }: SupabaseIntegrationProps = {}) {
  const {
    user,
    loadingUser,
    signIn,
    signOut,
    fetchData,
    insertData,
    updateData,
    deleteData,
    error,
    clearError
  } = useSupabase()

  const [stations, setStations] = useState<ChargingStation[]>(initialStations)
  const [loadingStations, setLoadingStations] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [isEditing, setIsEditing] = useState<ChargingStation | null>(null)
  const [newStationName, setNewStationName] = useState('')
  const [newStationLocation, setNewStationLocation] = useState('')
  const [newStationPrice, setNewStationPrice] = useState(0.25)
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authMode, setAuthMode] = useState<'signIn' | 'signUp'>('signIn')
  const [authLoading, setAuthLoading] = useState(false)
  const [copiedApiKey, setCopiedApiKey] = useState(false)

  const fetchChargingStations = useCallback(async () => {
    setLoadingStations(true)
    const data = await fetchData<ChargingStation>('charging_stations', { orderColumn: 'name' })
    if (data) {
      setStations(data)
    }
    setLoadingStations(false)
  }, [fetchData])

  useEffect(() => {
    if (!loadingUser && user) {
      fetchChargingStations()
    } else if (!user) {
      setStations([]) // Clear stations if user logs out
    }
  }, [user, loadingUser, fetchChargingStations])

  const handleAddStation = async () => {
    if (!user) {
      clearError()
      // Use a more prominent error display for user actions
      setError('You must be logged in to add a station.')
      return
    }
    if (!newStationName.trim() || !newStationLocation.trim() || newStationPrice <= 0) {
      clearError()
      setError('Please fill in all station details correctly.')
      return
    }
    setIsAdding(true)
    const newStation: Partial<ChargingStation> = {
      name: newStationName.trim(),
      location: newStationLocation.trim(),
      price: newStationPrice,
      status: 'available',
      ownerId: user.id,
    }
    const result = await insertData<ChargingStation>('charging_stations', newStation)
    if (result) {
      setStations(prev => [...prev, result[0]])
      setNewStationName('')
      setNewStationLocation('')
      setNewStationPrice(0.25)
      clearError() // Clear any previous errors on success
    }
    setIsAdding(false)
  }

  const handleUpdateStation = async () => {
    if (!isEditing || !user) return
    if (!isEditing.name.trim() || !isEditing.location.trim() || isEditing.price <= 0) {
      clearError()
      setError('Please fill in all station details correctly.')
      return
    }
    setIsAdding(true) // Re-using for loading state
    const result = await updateData<ChargingStation>('charging_stations', isEditing.id, {
      name: isEditing.name.trim(),
      location: isEditing.location.trim(),
      price: isEditing.price,
      status: isEditing.status,
    })
    if (result) {
      setStations(prev => prev.map(s => (s.id === isEditing.id ? result[0] : s)))
      setIsEditing(null)
      clearError() // Clear any previous errors on success
    }
    setIsAdding(false)
  }

  const handleDeleteStation = async (id: string) => {
    const success = await deleteData('charging_stations', id)
    if (success) {
      setStations(prev => prev.filter(s => s.id !== id))
      clearError() // Clear any previous errors on success
    }
  }

  const handleAuthSubmit = async () => {
    setAuthLoading(true)
    clearError()
    let success = false
    if (authMode === 'signIn') {
      success = await signIn(authEmail, authPassword)
    } else {
      success = await useSupabase().signUp(authEmail, authPassword)
    }
    if (success) {
      setAuthEmail('')
      setAuthPassword('')
    }
    setAuthLoading(false)
  }

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText('sk.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')
    setCopiedApiKey(true)
    setTimeout(() => setCopiedApiKey(false), 2000)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] } }
  }

  return (
    <SupabaseProvider client={mockSupabaseClient}>
      <style jsx global>{`
        :root {
          --primary: ${colors.primary};
          --background: ${colors.background};
          --foreground: ${colors.foreground};
          --muted: ${colors.muted};
          --muted-foreground: ${colors['muted-foreground']};
          --border: ${colors.border};
          --card: ${colors.card};
          --card-foreground: ${colors['card-foreground']};
          --accent: ${colors.accent};
          --accent-foreground: ${colors['accent-foreground']};
          --destructive: ${colors.destructive};
          --destructive-foreground: ${colors['destructive-foreground']};
          --ring: ${colors.ring};
        }
        @media (prefers-color-scheme: dark) {
          :root {
            --primary: ${darkColors.primary};
            --background: ${darkColors.background};
            --foreground: ${darkColors.foreground};
            --muted: ${darkColors.muted};
            --muted-foreground: ${darkColors['muted-foreground']};
            --border: ${darkColors.border};
            --card: ${darkColors.card};
            --card-foreground: ${darkColors['card-foreground']};
            --accent: ${darkColors.accent};
            --accent-foreground: ${darkColors['accent-foreground']};
            --destructive: ${darkColors.destructive};
            --destructive-foreground: ${darkColors['destructive-foreground']};
            --ring: ${darkColors.ring};
          }
        }
        body {
          font-family: 'Inter', system-ui, sans-serif;
          line-height: 1.5;
          letter-spacing: -0.01em;
        }
        .focus-visible-ring:focus-visible {
          outline: 2px solid var(--ring);
          outline-offset: 2px;
        }
      `}</style>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className="min-h-screen bg-background text-foreground font-sans p-4 sm:p-6 lg:p-8"
      >
        <div className="max-w-4xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex items-center justify-between bg-primary text-primary-foreground p-6 rounded-xl shadow-lg"
          >
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Database size={32} /> Supabase Integration
            </h1>
            <motion.button
              onClick={fetchChargingStations}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2 bg-primary-foreground text-primary rounded-lg font-medium text-sm shadow-md hover:bg-primary-foreground/90 transition-all duration-150 focus-visible-ring"
              aria-label="Refresh charging stations"
            >
              <RefreshCw size={18} /> Refresh Data
            </motion.button>
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.2 }}
                className="rounded-lg bg-destructive/10 border border-destructive text-destructive p-4 flex items-start gap-3 shadow-sm"
                role="alert"
              >
                <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
                <div className="flex-grow">
                  <p className="font-medium">Error:</p>
                  <p className="text-sm">{error}</p>
                </div>
                <motion.button
                  onClick={clearError}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-destructive hover:text-destructive/80 transition-colors focus-visible-ring"
                  aria-label="Clear error message"
                >
                  &times;
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* User Authentication Section */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-card border border-border rounded-xl p-6 shadow-md"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <User size={20} /> User Authentication
            </h2>
            {loadingUser ? (
              <div className="flex items-center gap-2 text-muted-foreground py-4">
                <Loader2 className="animate-spin" size={20} /> Loading user...
              </div>
            ) : user ? (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-lg font-medium flex items-center gap-2">
                  <CheckCircle size={20} className="text-accent" /> Logged in as: <span className="text-primary">{user.email}</span>
                </p>
                <motion.button
                  onClick={signOut}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg font-medium text-sm shadow-md hover:bg-destructive/90 transition-all duration-150 focus-visible-ring"
                  aria-label="Sign out"
                >
                  Sign Out
                </motion.button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <motion.button
                    onClick={() => setAuthMode('signIn')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-150 focus-visible-ring ${
                      authMode === 'signIn' ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                    aria-label="Switch to sign in"
                  >
                    Sign In
                  </motion.button>
                  <motion.button
                    onClick={() => setAuthMode('signUp')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-150 focus-visible-ring ${
                      authMode === 'signUp' ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                    aria-label="Switch to sign up"
                  >
                    Sign Up
                  </motion.button>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    placeholder="Email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="flex-grow px-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all duration-150 focus-visible-ring"
                    aria-label="Email input for authentication"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="flex-grow px-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all duration-150 focus-visible-ring"
                    aria-label="Password input for authentication"
                  />
                  <motion.button
                    onClick={handleAuthSubmit}
                    disabled={authLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-2 bg-accent text-accent-foreground rounded-lg font-medium text-sm shadow-md hover:bg-accent/90 transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus-visible-ring"
                    aria-label={authMode === 'signIn' ? "Sign in" : "Sign up"}
                  >
                    {authLoading && <Loader2 size={18} className="animate-spin" />}
                    {authMode === 'signIn' ? 'Sign In' : 'Sign Up'}
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Charging Stations Section */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-card border border-border rounded-xl p-6 shadow-md"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Zap size={20} /> Charging Stations
            </h2>

            {loadingStations ? (
              <motion.div
                initial="hidden"
                animate="show"
                variants={containerVariants}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {[1, 2, 3, 4].map((i) => (
                  <motion.div key={i} variants={itemVariants} className="bg-muted/50 border border-border rounded-lg p-4 h-32 animate-pulse">
                    <div className="h-4 bg-muted-foreground/20 rounded w-3/4 mb-3"></div>
                    <div className="h-3 bg-muted-foreground/10 rounded w-1/2 mb-4"></div>
                    <div className="flex justify-between">
                      <div className="h-3 bg-muted-foreground/20 rounded w-1/4"></div>
                      <div className="h-3 bg-muted-foreground/20 rounded w-1/4"></div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : stations.length === 0 && user ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-muted-foreground py-12 flex flex-col items-center gap-4"
              >
                <div className="w-16 h-16 bg-muted rounded-full mx-auto flex items-center justify-center">
                  <CloudOff size={32} className="text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground">No charging stations found.</h3>
                <p className="text-sm">Add your first charging station to get started!</p>
              </motion.div>
            ) : stations.length === 0 && !user ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-muted-foreground py-12 flex flex-col items-center gap-4"
              >
                <div className="w-16 h-16 bg-muted rounded-full mx-auto flex items-center justify-center">
                  <Info size={32} className="text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground">Log in to view and manage charging stations.</h3>
                <p className="text-sm">Authenticate to access station data.</p>
              </motion.div>
            ) : (
              <motion.div
                initial="hidden"
                animate="show"
                variants={containerVariants}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {stations.map((station) => (
                  <motion.div
                    key={station.id}
                    variants={itemVariants}
                    whileHover={{ y: -4, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
                    transition={{ duration: 0.2 }}
                    className="bg-card border border-border rounded-lg p-4 shadow-sm hover:border-primary/50 transition-all duration-200"
                  >
                    {isEditing?.id === station.id ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={isEditing.name}
                          onChange={(e) => setIsEditing({ ...isEditing, name: e.target.value })}
                          className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all duration-150 focus-visible-ring"
                          aria-label="Edit station name"
                        />
                        <input
                          type="text"
                          value={isEditing.location}
                          onChange={(e) => setIsEditing({ ...isEditing, location: e.target.value })}
                          className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all duration-150 focus-visible-ring"
                          aria-label="Edit station location"
                        />
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Price: $</span>
                          <input
                            type="number"
                            step="0.01"
                            value={isEditing.price}
                            onChange={(e) => setIsEditing({ ...isEditing, price: parseFloat(e.target.value) })}
                            className="w-24 px-3 py-2 bg-muted border border-border rounded-md text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all duration-150 focus-visible-ring"
                            aria-label="Edit station price"
                          />
                          <select
                            value={isEditing.status}
                            onChange={(e) => setIsEditing({ ...isEditing, status: e.target.value as any })}
                            className="flex-grow px-3 py-2 bg-muted border border-border rounded-md text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all duration-150 focus-visible-ring"
                            aria-label="Edit station status"
                          >
                            <option value="available">Available</option>
                            <option value="charging">Charging</option>
                            <option value="unavailable">Unavailable</option>
                          </select>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <motion.button
                            onClick={() => setIsEditing(null)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-3 py-1.5 bg-muted text-muted-foreground rounded-md text-sm hover:bg-muted/80 transition-colors focus-visible-ring"
                            aria-label="Cancel edit"
                          >
                            Cancel
                          </motion.button>
                          <motion.button
                            onClick={handleUpdateStation}
                            disabled={isAdding}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed focus-visible-ring"
                            aria-label="Save changes"
                          >
                            {isAdding && <Loader2 size={16} className="animate-spin" />} Save
                          </motion.button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Plug size={18} className="text-primary" /> {station.name}
                        </h3>
                        <p className="text-muted-foreground text-sm">{station.location}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            station.status === 'available' ? 'bg-accent/20 text-accent' :
                            station.status === 'charging' ? 'bg-primary/20 text-primary' :
                            'bg-destructive/20 text-destructive'
                          }`}>
                            {station.status}
                          </span>
                          <span className="font-medium text-foreground">${station.price.toFixed(2)} / kWh</span>
                        </div>
                        {user?.id === station.ownerId && (
                          <div className="flex gap-2 justify-end mt-3">
                            <motion.button
                              onClick={() => setIsEditing(station)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="text-muted-foreground hover:text-primary transition-colors focus-visible-ring"
                              aria-label={`Edit ${station.name}`}
                            >
                              <Edit size={18} />
                            </motion.button>
                            <motion.button
                              onClick={() => handleDeleteStation(station.id)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="text-muted-foreground hover:text-destructive transition-colors focus-visible-ring"
                              aria-label={`Delete ${station.name}`}
                            >
                              <Trash2 size={18} />
                            </motion.button>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}

            {user && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-8 pt-6 border-t border-border space-y-4"
              >
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <PlusCircle size={20} /> Add New Charging Station
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Station Name"
                    value={newStationName}
                    onChange={(e) => setNewStationName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all duration-150 focus-visible-ring"
                    aria-label="New station name"
                  />
                  <input
                    type="text"
                    placeholder="Location (e.g., 123 Main St)"
                    value={newStationLocation}
                    onChange={(e) => setNewStationLocation(e.target.value)}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all duration-150 focus-visible-ring"
                    aria-label="New station location"
                  />
                  <div className="flex items-center gap-2 col-span-full sm:col-span-1">
                    <span className="text-muted-foreground">Price per kWh ($):</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={newStationPrice}
                      onChange={(e) => setNewStationPrice(parseFloat(e.target.value))}
                      className="w-32 px-4 py-2.5 bg-background border border-border rounded-lg text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all duration-150 focus-visible-ring"
                      aria-label="New station price per kWh"
                    />
                  </div>
                </div>
                <motion.button
                  onClick={handleAddStation}
                  disabled={isAdding || !user}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium text-base shadow-md hover:bg-primary/90 transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus-visible-ring"
                  aria-label="Add new charging station"
                >
                  {isAdding && <Loader2 size={20} className="animate-spin" />}
                  Add Station
                </motion.button>
              </motion.div>
            )}
          </motion.div>

          {/* Settings/API Keys Section (Example of more Supabase interaction) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="bg-card border border-border rounded-xl p-6 shadow-md"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Settings size={20} /> Application Settings
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Key size={20} className="text-muted-foreground" />
                <p className="text-foreground font-medium">API Key:</p>
                <span className="flex-grow bg-muted text-muted-foreground px-3 py-2 rounded-md text-sm font-mono truncate">
                  sk.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
                </span>
                <motion.button
                  onClick={handleCopyApiKey}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1 focus-visible-ring"
                  aria-label="Copy API key"
                >
                  {copiedApiKey ? <CheckCircle size={18} /> : <Copy size={18} />}
                  {copiedApiKey ? 'Copied!' : 'Copy'}
                </motion.button>
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Info size={16} /> This is a mock API key. In a real app, you'd fetch this securely.
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </SupabaseProvider>
  )
}

export default function SupabaseIntegrationDemo() {
  return <SupabaseIntegration />
}