'use client';

import React from 'react';
'use client'

import { NextRequest, NextResponse } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session if expired - required for Server Components
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protected routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/trips',
    '/groups',
    '/profile',
    '/settings',
    '/chat',
    '/calendar'
  ]

  // Public routes that redirect to dashboard if authenticated
  const publicRoutes = [
    '/login',
    '/signup',
    '/forgot-password'
  ]

  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )
  
  const isPublicRoute = publicRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect authenticated users from public routes to dashboard
  if (isPublicRoute && session) {
    const redirectTo = req.nextUrl.searchParams.get('redirectTo')
    const redirectUrl = new URL(redirectTo || '/dashboard', req.url)
    return NextResponse.redirect(redirectUrl)
  }

  // API route protection
  if (req.nextUrl.pathname.startsWith('/api/')) {
    // Allow public API routes
    const publicApiRoutes = [
      '/api/auth',
      '/api/health',
      '/api/webhook'
    ]

    const isPublicApiRoute = publicApiRoutes.some(route =>
      req.nextUrl.pathname.startsWith(route)
    )

    if (!isPublicApiRoute && !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
  }

  // Add security headers
  const response = NextResponse.next()
  
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.openweathermap.org;"
  )

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

// Demo component for testing middleware behavior
export default function MiddlewareDemo() {
  return (
    <div className="min-h-screen bg-[rgb(255,255,255)] font-medium">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-[rgb(248,250,252)] border border-[rgb(226,232,240)] rounded-xl p-6 shadow-md">
          <h1 className="text-2xl font-bold text-[rgb(15,23,42)] mb-6">
            Middleware Configuration
          </h1>
          
          <div className="space-y-6">
            <div className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg p-4">
              <h2 className="text-lg font-semibold text-[rgb(15,23,42)] mb-3">
                Protected Routes
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {['/dashboard', '/trips', '/groups', '/profile', '/settings', '/chat', '/calendar'].map((route) => (
                  <div
                    key={route}
                    className="px-3 py-2 bg-[rgb(34,139,34)] bg-opacity-10 text-[rgb(34,139,34)] rounded-md text-sm font-medium border border-[rgb(34,139,34)] border-opacity-20"
                  >
                    {route}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg p-4">
              <h2 className="text-lg font-semibold text-[rgb(15,23,42)] mb-3">
                Public Routes
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {['/login', '/signup', '/forgot-password'].map((route) => (
                  <div
                    key={route}
                    className="px-3 py-2 bg-[rgb(249,115,22)] bg-opacity-10 text-[rgb(249,115,22)] rounded-md text-sm font-medium border border-[rgb(249,115,22)] border-opacity-20"
                  >
                    {route}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg p-4">
              <h2 className="text-lg font-semibold text-[rgb(15,23,42)] mb-3">
                Security Features
              </h2>
              <ul className="space-y-2 text-sm text-[rgb(15,23,42)]">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[rgb(34,139,34)] rounded-full"></div>
                  Authentication-based route protection
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[rgb(34,139,34)] rounded-full"></div>
                  Automatic session refresh
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[rgb(34,139,34)] rounded-full"></div>
                  API route authorization
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[rgb(34,139,34)] rounded-full"></div>
                  Security headers (CSP, X-Frame-Options)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[rgb(34,139,34)] rounded-full"></div>
                  Redirect handling with return URLs
                </li>
              </ul>
            </div>

            <div className="bg-[rgb(245,247,250)] border border-[rgb(226,232,240)] rounded-lg p-4">
              <h2 className="text-lg font-semibold text-[rgb(15,23,42)] mb-2">
                How It Works
              </h2>
              <p className="text-sm text-[rgb(15,23,42)] leading-relaxed">
                This middleware runs on every request to protect routes, manage authentication state, 
                and apply security headers. It automatically redirects users based on their authentication 
                status and the route they're trying to access.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}