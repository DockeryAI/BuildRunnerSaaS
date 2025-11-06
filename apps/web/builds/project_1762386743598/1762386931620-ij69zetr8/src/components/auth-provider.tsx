'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (email: string, password: string, metadata?: { displayName?: string }) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting session:', error.message)
        } else {
          setUser(session?.user ?? null)
        }
      } catch (error) {
        console.error('Unexpected error getting session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)

        if (event === 'SIGNED_OUT') {
          localStorage.removeItem('offroad-trip-cache')
        }

        if (event === 'SIGNED_IN' && session?.user) {
          await initializeUserProfile(session.user)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const initializeUserProfile = async (user: User) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (error && error.code === 'PGRST116') {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            display_name: user.user_metadata?.displayName || user.email?.split('@')[0] || 'Adventurer',
            avatar_url: user.user_metadata?.avatar_url || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (insertError) {
          console.error('Error creating user profile:', insertError.message)
        }
      }
    } catch (error) {
      console.error('Error initializing user profile:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      })

      if (error) {
        return { error: getAuthErrorMessage(error.message) }
      }

      return {}
    } catch (error) {
      return { error: 'An unexpected error occurred. Please try again.' }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, metadata?: { displayName?: string }) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            displayName: metadata?.displayName || email.split('@')[0]
          }
        }
      })

      if (error) {
        return { error: getAuthErrorMessage(error.message) }
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
          redirectTo: `${window.location.origin}/auth/reset-password`
        }
      )

      if (error) {
        return { error: getAuthErrorMessage(error.message) }
      }

      return {}
    } catch (error) {
      return { error: 'An unexpected error occurred. Please try again.' }
    }
  }

  const getAuthErrorMessage = (errorMessage: string): string => {
    const errorMap: Record<string, string> = {
      'Invalid login credentials': 'Invalid email or password. Please check your credentials and try again.',
      'Email not confirmed': 'Please check your email and click the confirmation link before signing in.',
      'User already registered': 'An account with this email already exists. Try signing in instead.',
      'Password should be at least 6 characters': 'Password must be at least 6 characters long.',
      'Unable to validate email address: invalid format': 'Please enter a valid email address.',
      'signup_disabled': 'New registrations are currently disabled. Please contact support.',
      'email_address_invalid': 'Please enter a valid email address.',
      'password_too_short': 'Password must be at least 6 characters long.',
      'weak_password': 'Please choose a stronger password with at least 6 characters.',
      'email_taken': 'An account with this email already exists. Try signing in instead.',
      'invalid_credentials': 'Invalid email or password. Please check your credentials and try again.',
      'too_many_requests': 'Too many attempts. Please wait a moment before trying again.',
      'network_error': 'Network error. Please check your connection and try again.'
    }

    return errorMap[errorMessage] || 'An error occurred. Please try again.'
  }

  const value: AuthContextType = {
    user,
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

export default function AuthProviderDemo() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-background to-surface dark:from-background dark:to-surface p-4 font-sans">
        <div className="max-w-md mx-auto pt-16">
          <div className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-foreground dark:text-foreground mb-4 tracking-tight">
              Auth Provider Demo
            </h2>
            <AuthStatus />
          </div>
        </div>
      </div>
    </AuthProvider>
  )
}

function AuthStatus() {
  const { user, loading, signOut } = useAuth()

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-4 bg-muted dark:bg-muted rounded"></div>
        <div className="h-4 bg-muted dark:bg-muted rounded w-3/4"></div>
      </div>
    )
  }

  if (user) {
    return (
      <div className="space-y-4">
        <div className="text-primary dark:text-primary text-sm font-medium flex items-center gap-2">
          <div className="w-2 h-2 bg-primary dark:bg-primary rounded-full"></div>
          Authenticated as {user.email}
        </div>
        <button
          onClick={signOut}
          className="w-full px-4 py-2 bg-destructive dark:bg-destructive text-destructiveForeground dark:text-destructiveForeground rounded-lg hover:bg-destructive/90 dark:hover:bg-destructive/90 focus:outline-none focus:ring-2 focus:ring-destructive/50 dark:focus:ring-destructive/50 focus:ring-offset-2 focus:ring-offset-background dark:focus:ring-offset-background active:scale-[0.98] transition-all duration-150 font-medium text-sm"
          aria-label="Sign out of your account"
        >
          Sign Out
        </button>
      </div>
    )
  }

  return (
    <div className="text-center py-8">
      <div className="w-12 h-12 bg-muted dark:bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
        <svg className="w-6 h-6 text-mutedForeground dark:text-mutedForeground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <h3 className="text-base font-medium text-foreground dark:text-foreground mb-2">Not authenticated</h3>
      <p className="text-mutedForeground dark:text-mutedForeground text-sm leading-relaxed">
        Use this provider to wrap your app and access auth state throughout your application.
      </p>
    </div>
  )
}