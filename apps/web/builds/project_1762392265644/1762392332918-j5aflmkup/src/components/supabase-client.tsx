'use client'

import React from 'react'
import { createClient } from '@supabase/supabase-js'
import { motion } from 'framer-motion'
import { Database } from '@/types/supabase'
import { AlertTriangle, CheckCircle } from 'lucide-react'

interface SupabaseConfig {
  supabaseUrl?: string
  supabaseKey?: string
  options?: {
    auth?: {
      autoRefreshToken?: boolean
      persistSession?: boolean 
    }
    db?: {
      schema?: string
    }
  }
}

interface SupabaseClientProps {
  config?: SupabaseConfig
  onError?: (error: Error) => void
  onSuccess?: () => void
}

const DEFAULT_CONFIG: SupabaseConfig = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  options: {
    auth: {
      autoRefreshToken: true,
      persistSession: true
    },
    db: {
      schema: 'public'
    }
  }
}

export function SupabaseClient({
  config = DEFAULT_CONFIG,
  onError = () => {},
  onSuccess = () => {}
}: SupabaseClientProps = {}) {

  const supabase = createClient<Database>(
    config.supabaseUrl ?? '',
    config.supabaseKey ?? '',
    config.options
  )

  if (!config.supabaseUrl || !config.supabaseKey) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="p-6 bg-destructive/10 dark:bg-destructive/20 border border-destructive/20 dark:border-destructive/30 rounded-xl font-sans shadow-sm hover:shadow-md transition-all duration-250"
      >
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 10, scale: 1.05 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className="p-2 bg-destructive/20 dark:bg-destructive/30 rounded-lg"
          >
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </motion.div>
          <div className="flex-1">
            <h3 className="font-semibold text-destructive text-base leading-tight">
              Configuration Error
            </h3>
            <p className="mt-1 text-sm text-destructive/80 leading-normal">
              Missing required Supabase configuration. Please check your environment variables.
            </p>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="p-6 bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30 rounded-xl font-sans shadow-sm hover:shadow-md transition-all duration-250"
    >
      <div className="flex items-center gap-3">
        <motion.div 
          whileHover={{ rotate: 10, scale: 1.05 }}
          transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
          className="p-2 bg-primary/20 dark:bg-primary/30 rounded-lg"
        >
          <CheckCircle className="w-5 h-5 text-primary" />
        </motion.div>
        <div className="flex-1">
          <h3 className="font-semibold text-primary text-base leading-tight">
            Connected to Supabase
          </h3>
          <p className="mt-1 text-sm text-primary/80 leading-normal">
            Database connection established successfully
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default function SupabaseClientDemo() {
  return (
    <div className="max-w-md mx-auto p-6 font-sans">
      <SupabaseClient />
    </div>
  )
}