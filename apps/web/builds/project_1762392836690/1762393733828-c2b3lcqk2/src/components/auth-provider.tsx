'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, LogOut, UserPlus, AlertCircle } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

interface AuthContextType {
  user: any | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  signIn: async () => {},
  signOut: async () => {},
  signUp: async () => {}
})

interface AuthProviderProps {
  children?: React.ReactNode
  supabaseUrl?: string
  supabaseKey?: string
}

export function AuthProvider({
  children,
  supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
}: AuthProviderProps = {}) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [supabase] = useState(() => createClient(supabaseUrl!, supabaseKey!))

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const signIn = async (email: string, password: string) => {
    try {
      setError(null)
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    } catch (e: any) {
      setError(e.message)
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      setError(null)
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
    } catch (e: any) {
      setError(e.message)
    }
  }

  const signOut = async () => {
    try {
      setError(null)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, signIn, signOut, signUp }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen bg-[#F8F7F4] dark:bg-[#1A1D1A] font-sans"
      >
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center min-h-screen"
            >
              <div className="p-8 bg-white dark:bg-[#242824] rounded-lg shadow-md">
                <div className="w-8 h-8 border-4 border-[#2D5A27] border-t-transparent rounded-full animate-spin" />
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-4"
            >
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
                >
                  <div className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructiveForeground rounded-md shadow-lg">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                </motion.div>
              )}

              {user ? (
                <motion.div 
                  className="fixed top-4 right-4 flex items-center gap-4 p-2 bg-white dark:bg-[#242824] rounded-lg shadow-md"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <User className="w-6 h-6 text-[#2D5A27]" />
                  <span className="font-medium text-foreground dark:text-[#E5E7E5]">{user.email}</span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={signOut}
                    className="p-2 text-white bg-[#2D5A27] rounded-lg hover:bg-[#1F3D1C] focus:ring-2 focus:ring-[#2D5A2733] focus:outline-none transition-all duration-200 disabled:opacity-50"
                    aria-label="Sign out"
                  >
                    <LogOut className="w-5 h-5" />
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div 
                  className="fixed top-4 right-4"
                  whileHover={{ scale: 1.02 }}
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => signIn('demo@example.com', 'password')}
                    className="flex items-center gap-2 px-4 py-2 text-white bg-[#2D5A27] rounded-lg hover:bg-[#1F3D1C] focus:ring-2 focus:ring-[#2D5A2733] focus:outline-none transition-all duration-200 disabled:opacity-50"
                  >
                    <UserPlus className="w-5 h-5" />
                    <span className="font-medium">Sign In</span>
                  </motion.button>
                </motion.div>
              )}
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default function AuthProviderDemo() {
  const { user } = useAuth()
  
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-[#2D5A27] dark:text-[#E5E7E5]">Protected Content</h1>
      {!user ? (
        <div className="mt-8 text-center py-12">
          <div className="w-16 h-16 bg-muted dark:bg-[#242824] rounded-full mx-auto mb-4 flex items-center justify-center">
            <User className="w-8 h-8 text-mutedForeground" />
          </div>
          <p className="text-lg text-mutedForeground">Sign in to view this content</p>
        </div>
      ) : (
        <p className="mt-4 text-foreground dark:text-[#E5E7E5]">Welcome back! Your content is ready.</p>
      )}
    </div>
  )
}