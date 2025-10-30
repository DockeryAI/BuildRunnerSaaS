'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkUser = async () => {
      try {
        // First check if we have a stored admin session
        const storedUser = localStorage.getItem('buildrunner_user');
        if (storedUser) {
          console.log('Found stored user:', storedUser);
          setUser(JSON.parse(storedUser));
          setLoading(false);
          return;
        }

        // Then check Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const supabaseUser = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name,
            avatar: session.user.user_metadata?.avatar_url,
          };
          setUser(supabaseUser);
          localStorage.setItem('buildrunner_user', JSON.stringify(supabaseUser));
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session);

        // Don't override admin login with Supabase auth changes
        const storedUser = localStorage.getItem('buildrunner_user');
        if (storedUser && JSON.parse(storedUser).id === 'admin-user') {
          console.log('Preserving admin session');
          return;
        }

        if (session?.user) {
          const supabaseUser = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name,
            avatar: session.user.user_metadata?.avatar_url,
          };
          setUser(supabaseUser);
          localStorage.setItem('buildrunner_user', JSON.stringify(supabaseUser));
        } else {
          // Only clear user if no stored admin session
          if (!storedUser) {
            setUser(null);
          }
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('SignIn called with:', { email, password });

    // Check for admin credentials first
    if (email === 'admin@dockeryai.com' && password === 'admin123') {
      console.log('Admin credentials matched, setting admin user');
      const adminUser = {
        id: 'admin-user',
        email: 'admin@dockeryai.com',
        name: 'Admin User',
        avatar: undefined,
      };
      setUser(adminUser);
      localStorage.setItem('buildrunner_user', JSON.stringify(adminUser));
      console.log('Admin user set and stored:', adminUser);
      return;
    }

    // Try Supabase auth for other users
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error) {
      // If Supabase fails, allow demo mode for any other credentials
      console.log('Supabase auth failed, using demo mode');
      const demoUser = {
        id: 'demo-user',
        email: email,
        name: 'Demo User',
        avatar: undefined,
      };
      setUser(demoUser);
    }
  };

  const signOut = async () => {
    // Clear local storage
    localStorage.removeItem('buildrunner_user');
    setUser(null);

    // Also sign out from Supabase if there's a session
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.log('Supabase signout error (expected for admin):', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { supabase };
