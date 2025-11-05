'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase-client'

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
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting session:', error.message)
        } else {
          setSession(session)
          setUser(session?.user ?? null)
        }
      } catch (error) {
        console.error('Unexpected error getting session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)

        // Handle sign out
        if (event === 'SIGNED_OUT') {
          setUser(null)
          setSession(null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      })

      if (error) {
        return { error: error.message }
      }

      return {}
    } catch (error) {
      return { error: 'An unexpected error occurred. Please try again.' }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName.trim()
          }
        }
      })

      if (error) {
        return { error: error.message }
      }

      return {}
    } catch (error) {
      return { error: 'An unexpected error occurred. Please try again.' }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error signing out:', error.message)
      }
    } catch (error) {
      console.error('Unexpected error signing out:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: `${window.location.origin}/reset-password`
        }
      )

      if (error) {
        return { error: error.message }
      }

      return {}
    } catch (error) {
      return { error: 'An unexpected error occurred. Please try again.' }
    }
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword
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

// Demo component showing auth state
function AuthDemo() {
  const { user, loading, signIn, signUp, signOut } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      if (isSignUp) {
        const result = await signUp(email, password, fullName)
        if (result.error) {
          setError(result.error)
        }
      } else {
        const result = await signIn(email, password)
        if (result.error) {
          setError(result.error)
        }
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[rgb(255,255,255)] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-[rgb(248,250,252)] rounded-xl p-8 animate-pulse">
            <div className="h-8 bg-[rgb(226,232,240)] rounded-lg mb-6"></div>
            <div className="space-y-4">
              <div className="h-12 bg-[rgb(226,232,240)] rounded-lg"></div>
              <div className="h-12 bg-[rgb(226,232,240)] rounded-lg"></div>
              <div className="h-12 bg-[rgb(226,232,240)] rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (user) {
    return (
      <div className="min-h-screen bg-[rgb(255,255,255)] p-4">
        <div className="max-w-md mx-auto pt-16">
          <div className="bg-[rgb(248,250,252)] rounded-xl p-8 shadow-md">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[rgb(34,139,34)] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-[rgb(255,255,255)] text-xl font-semibold">
                  {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <h2 className="text-xl font-semibold text-[rgb(15,23,42)] mb-2">
                Welcome back!
              </h2>
              <p className="text-[rgb(100,116,139)] text-sm">
                {user.user_metadata?.full_name || user.email}
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-[rgb(255,255,255)] rounded-lg p-4 border border-[rgb(226,232,240)]">
                <p className="text-sm text-[rgb(100,116,139)] mb-1">Email</p>
                <p className="text-[rgb(15,23,42)] font-medium">{user.email}</p>
              </div>

              <div className="bg-[rgb(255,255,255)] rounded-lg p-4 border border-[rgb(226,232,240)]">
                <p className="text-sm text-[rgb(100,116,139)] mb-1">Account Status</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[rgb(34,139,34)] rounded-full"></div>
                  <p className="text-[rgb(15,23,42)] font-medium">Active</p>
                </div>
              </div>

              <button
                onClick={signOut}
                className="w-full h-12 bg-[rgb(220,38,38)] text-[rgb(255,255,255)] rounded-lg font-medium hover:bg-[rgb(185,28,28)] transition-colors duration-150 active:scale-95"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[rgb(255,255,255)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[rgb(34,139,34)] rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[rgb(255,255,255)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[rgb(15,23,42)] mb-2">
            Off-Road Planner
          </h1>
          <p className="text-[rgb(100,116,139)]">
            Plan your next adventure with friends
          </p>
        </div>

        <div className="bg-[rgb(248,250,252)] rounded-xl p-8 shadow-md">
          <div className="flex bg-[rgb(226,232,240)] rounded-lg p-1 mb-6">
            <button
              onClick={() => setIsSignUp(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-150 ${
                !isSignUp 
                  ? 'bg-[rgb(255,255,255)] text-[rgb(15,23,42)] shadow-sm' 
                  : 'text-[rgb(100,116,139)] hover:text-[rgb(15,23,42)]'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors duration-150 ${
                isSignUp 
                  ? 'bg-[rgb(255,255,255)] text-[rgb(15,23,42)] shadow-sm' 
                  : 'text-[rgb(100,116,139)] hover:text-[rgb(15,23,42)]'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-12 px-4 bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] placeholder-[rgb(148,163,184)] focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)]/20 transition-all duration-150"
                  placeholder="Enter your full name"
                  required={isSignUp}
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] placeholder-[rgb(148,163,184)] focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)]/20 transition-all duration-150"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 px-4 bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] placeholder-[rgb(148,163,184)] focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)]/20 transition-all duration-150"
                placeholder="Enter your password"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="bg-[rgb(254,242,242)] border border-[rgb(252,165,165)] rounded-lg p-3">
                <p className="text-[rgb(220,38,38)] text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-[rgb(34,139,34)] text-[rgb(255,255,255)] rounded-lg font-medium hover:bg-[rgb(22,101,52)] transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              {isSubmitting ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function AuthProviderDemo() {
  return (
    <AuthProvider>
      <AuthDemo />
    </AuthProvider>
  )
}