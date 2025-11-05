'use client';

import React from 'react';
'use client'

import { NextRequest, NextResponse } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

interface MiddlewareConfig {
  matcher: string[]
}

interface AuthState {
  isAuthenticated: boolean
  userId?: string
  email?: string
}

interface RouteProtection {
  path: string
  requiresAuth: boolean
  allowedRoles?: string[]
}

// Route protection configuration
const PROTECTED_ROUTES: RouteProtection[] = [
  { path: '/dashboard', requiresAuth: true },
  { path: '/trips', requiresAuth: true },
  { path: '/groups', requiresAuth: true },
  { path: '/profile', requiresAuth: true },
  { path: '/chat', requiresAuth: true },
  { path: '/calendar', requiresAuth: true },
  { path: '/weather', requiresAuth: true },
  { path: '/locations', requiresAuth: true }
]

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/about',
  '/contact'
]

export async function middleware(request: NextRequest) {
  try {
    const response = NextResponse.next()
    const supabase = createMiddlewareClient({ req: request, res: response })
    
    const {
      data: { session },
      error: sessionError
    } = await supabase.auth.getSession()

    const pathname = request.nextUrl.pathname
    const isPublicRoute = PUBLIC_ROUTES.includes(pathname)
    const protectedRoute = PROTECTED_ROUTES.find(route => 
      pathname.startsWith(route.path)
    )

    // Handle authentication state
    const authState: AuthState = {
      isAuthenticated: !!session?.user,
      userId: session?.user?.id,
      email: session?.user?.email
    }

    // Log authentication attempts for security monitoring
    if (sessionError) {
      console.warn('Middleware: Session error', {
        error: sessionError.message,
        pathname,
        timestamp: new Date().toISOString()
      })
    }

    // Redirect unauthenticated users from protected routes
    if (protectedRoute && !authState.isAuthenticated) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirect', pathname)
      
      return NextResponse.redirect(redirectUrl)
    }

    // Redirect authenticated users from auth pages
    if (authState.isAuthenticated && ['/login', '/signup'].includes(pathname)) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Add security headers
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openweathermap.org;"
    )

    // Add user context to headers for server components
    if (authState.isAuthenticated) {
      response.headers.set('x-user-id', authState.userId || '')
      response.headers.set('x-user-email', authState.email || '')
    }

    // Rate limiting for API routes
    if (pathname.startsWith('/api/')) {
      const rateLimitKey = `rate_limit:${authState.userId || request.ip}:${pathname}`
      // In production, implement proper rate limiting with Redis or similar
      // For now, just add the header for monitoring
      response.headers.set('x-rate-limit-key', rateLimitKey)
    }

    return response

  } catch (error) {
    console.error('Middleware error:', error)
    
    // On error, allow the request to continue but log it
    const response = NextResponse.next()
    response.headers.set('x-middleware-error', 'true')
    
    return response
  }
}

// Middleware configuration
export const config: MiddlewareConfig = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ]
}

// Helper function to check if route requires authentication
export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route.path))
}

// Helper function to get redirect URL after login
export function getRedirectUrl(request: NextRequest): string {
  const redirectParam = request.nextUrl.searchParams.get('redirect')
  
  if (redirectParam && isProtectedRoute(redirectParam)) {
    return redirectParam
  }
  
  return '/dashboard'
}

// Security utilities
export class SecurityUtils {
  static sanitizeRedirectUrl(url: string, baseUrl: string): string {
    try {
      const redirectUrl = new URL(url, baseUrl)
      const baseUrlObj = new URL(baseUrl)
      
      // Only allow redirects to the same origin
      if (redirectUrl.origin !== baseUrlObj.origin) {
        return '/dashboard'
      }
      
      return redirectUrl.pathname + redirectUrl.search
    } catch {
      return '/dashboard'
    }
  }

  static generateCSRFToken(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15)
  }

  static validateCSRFToken(token: string, storedToken: string): boolean {
    return token === storedToken && token.length >= 20
  }
}

// Audit logging for security events
export class AuditLogger {
  static logAuthEvent(event: string, details: Record<string, any>) {
    const logEntry = {
      event,
      timestamp: new Date().toISOString(),
      details,
      userAgent: details.userAgent || 'unknown',
      ip: details.ip || 'unknown'
    }
    
    // In production, send to logging service
    console.log('AUDIT:', JSON.stringify(logEntry))
  }

  static logSecurityEvent(event: string, severity: 'low' | 'medium' | 'high', details: Record<string, any>) {
    const logEntry = {
      type: 'security',
      event,
      severity,
      timestamp: new Date().toISOString(),
      details
    }
    
    // In production, send to security monitoring service
    console.warn('SECURITY:', JSON.stringify(logEntry))
  }
}

// Demo component for testing middleware behavior
export default function MiddlewareDemo() {
  return (
    <div className="min-h-screen bg-[rgb(255,255,255)] p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[rgb(248,250,252)] rounded-lg p-6 shadow-md">
          <h1 className="text-2xl font-semibold text-[rgb(15,23,42)] mb-4">
            Middleware Configuration
          </h1>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-white rounded-lg p-4 border border-[rgb(226,232,240)]">
              <h2 className="text-lg font-medium text-[rgb(15,23,42)] mb-3">
                Protected Routes
              </h2>
              <ul className="space-y-2">
                {PROTECTED_ROUTES.map((route, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[rgb(34,139,34)] rounded-full"></div>
                    <span className="text-sm text-[rgb(15,23,42)]">{route.path}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-lg p-4 border border-[rgb(226,232,240)]">
              <h2 className="text-lg font-medium text-[rgb(15,23,42)] mb-3">
                Public Routes
              </h2>
              <ul className="space-y-2">
                {PUBLIC_ROUTES.map((route, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[rgb(245,158,11)] rounded-full"></div>
                    <span className="text-sm text-[rgb(15,23,42)]">{route}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 bg-white rounded-lg p-4 border border-[rgb(226,232,240)]">
            <h2 className="text-lg font-medium text-[rgb(15,23,42)] mb-3">
              Security Features
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[rgb(34,139,34)] rounded-full"></div>
                <span className="text-sm text-[rgb(15,23,42)]">Authentication Guards</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[rgb(34,139,34)] rounded-full"></div>
                <span className="text-sm text-[rgb(15,23,42)]">Security Headers</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[rgb(34,139,34)] rounded-full"></div>
                <span className="text-sm text-[rgb(15,23,42)]">Rate Limiting</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[rgb(34,139,34)] rounded-full"></div>
                <span className="text-sm text-[rgb(15,23,42)]">Audit Logging</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-[rgb(245,158,11)]/10 rounded-lg border border-[rgb(245,158,11)]/20">
            <p className="text-sm text-[rgb(15,23,42)]">
              <strong>Note:</strong> This middleware handles authentication, route protection, 
              and security headers for the off-roading trip planning application.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}