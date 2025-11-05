'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { Shield, AlertCircle, CheckCircle } from 'lucide-react'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting session:', error)
        } else {
          setSession(session)
          setUser(session?.user ?? null)
        }
      } catch (error) {
        console.error('Error in getSession:', error)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error: error.message }
      }

      return {}
    } catch (error) {
      return { error: 'An unexpected error occurred' }
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        return { error: error.message }
      }

      return {}
    } catch (error) {
      return { error: 'An unexpected error occurred' }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        return { error: error.message }
      }

      return {}
    } catch (error) {
      return { error: 'An unexpected error occurred' }
    }
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Auth Status Component for debugging/development
export function AuthStatus() {
  const { user, session, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-3 bg-[#f1f5f9] border border-[#e2e8f0] rounded-lg">
        <div className="w-4 h-4 border-2 border-[#228b22] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium text-[#0f172a]">Loading auth...</span>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2 p-3 bg-[#fef2f2] border border-[#fecaca] rounded-lg">
        <AlertCircle className="w-4 h-4 text-[#dc2626]" />
        <span className="text-sm font-medium text-[#dc2626]">Not authenticated</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 p-3 bg-[#f0fdf4] border border-[#bbf7d0] rounded-lg">
      <CheckCircle className="w-4 h-4 text-[#228b22]" />
      <div className="flex flex-col">
        <span className="text-sm font-medium text-[#0f172a]">Authenticated</span>
        <span className="text-xs text-[#64748b]">{user.email}</span>
      </div>
    </div>
  )
}

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#ffffff] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-3 border-[#228b22] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#64748b] font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return fallback || (
      <div className="min-h-screen bg-[#ffffff] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#ffffff] border border-[#e2e8f0] rounded-xl p-8 shadow-md">
          <div className="flex flex-col items-center gap-6">
            <div className="w-16 h-16 bg-[#f59e0b] rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-[#ffffff]" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-[#0f172a] mb-2">
                Authentication Required
              </h2>
              <p className="text-[#64748b]">
                Please sign in to access this page
              </p>
            </div>
            <button
              onClick={() => window.location.href = '/auth/signin'}
              className="w-full py-3 px-4 bg-[#228b22] text-[#ffffff] rounded-lg font-medium hover:bg-[#1e7b1e] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#228b22] focus:ring-offset-2"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Demo component for development
export default function AuthProviderDemo() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#ffffff] p-4">
        <div className="max-w-md mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#0f172a] mb-2">
              Auth Provider Demo
            </h1>
            <p className="text-[#64748b]">
              Authentication context for off-road trip planning
            </p>
          </div>
          
          <AuthStatus />
          
          <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg p-4">
            <h3 className="font-semibold text-[#0f172a] mb-2">Features:</h3>
            <ul className="space-y-1 text-sm text-[#64748b]">
              <li>• User authentication state management</li>
              <li>• Sign in/up/out functionality</li>
              <li>• Password reset support</li>
              <li>• Protected route wrapper</li>
              <li>• Loading and error states</li>
            </ul>
          </div>
        </div>
      </div>
    </AuthProvider>
  )
}