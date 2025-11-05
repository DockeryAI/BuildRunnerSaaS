'use client'

import { useState, useEffect } from 'react'
import { 
  Map, 
  Calendar, 
  Users, 
  MessageCircle, 
  UtensilsCrossed, 
  Settings,
  Menu,
  X,
  Home,
  Plus
} from 'lucide-react'

interface AppLayoutProps {
  children?: React.ReactNode
  currentPage?: string
  onNavigate?: (page: string) => void
}

interface NavigationItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  badge?: number
}

export function AppLayout({
  children,
  currentPage = 'dashboard',
  onNavigate = () => {}
}: AppLayoutProps = {}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isOnline, setIsOnline] = useState(true)

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const navigationItems: NavigationItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/dashboard' },
    { id: 'locations', label: 'Locations', icon: Map, href: '/locations' },
    { id: 'calendar', label: 'Calendar', icon: Calendar, href: '/calendar' },
    { id: 'group', label: 'Group', icon: Users, href: '/group', badge: 3 },
    { id: 'chat', label: 'Chat', icon: MessageCircle, href: '/chat', badge: 2 },
    { id: 'meals', label: 'Meals', icon: UtensilsCrossed, href: '/meals' }
  ]

  const handleNavigation = (item: NavigationItem) => {
    onNavigate(item.id)
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-[#ffffff] font-medium">
      {/* Offline Indicator */}
      {!isOnline && (
        <div className="bg-[#dc2626] text-white px-4 py-2 text-center text-sm font-medium">
          You're offline. Some features may be limited.
        </div>
      )}

      {/* Header */}
      <header className="bg-[#ffffff] border-b border-[#e2e8f0] px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-[#f8fafc] transition-colors duration-150"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-[#0f172a]" />
              ) : (
                <Menu className="w-5 h-5 text-[#0f172a]" />
              )}
            </button>
            <h1 className="text-xl font-bold text-[#0f172a]">OffRoad Planner</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="p-2 rounded-lg bg-[#228b22] text-white hover:bg-[#1e7b1e] transition-colors duration-150 shadow-md"
              aria-label="Create new trip"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              className="p-2 rounded-lg hover:bg-[#f8fafc] transition-colors duration-150"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5 text-[#0f172a]" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:border-[#e2e8f0] lg:bg-[#ffffff] lg:min-h-screen">
          <nav className="flex-1 px-4 py-6">
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = currentPage === item.id
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 ${
                      isActive
                        ? 'bg-[#228b22] text-white shadow-md'
                        : 'text-[#0f172a] hover:bg-[#f8fafc]'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto bg-[#f97316] text-white text-xs px-2 py-0.5 rounded-full font-medium">
                        {item.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </nav>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}>
            <aside className="fixed left-0 top-0 h-full w-64 bg-[#ffffff] border-r border-[#e2e8f0] transform transition-transform duration-200">
              <div className="p-4 border-b border-[#e2e8f0]">
                <h2 className="text-lg font-bold text-[#0f172a]">Navigation</h2>
              </div>
              <nav className="flex-1 px-4 py-6">
                <div className="space-y-2">
                  {navigationItems.map((item) => {
                    const Icon = item.icon
                    const isActive = currentPage === item.id
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavigation(item)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150 ${
                          isActive
                            ? 'bg-[#228b22] text-white shadow-md'
                            : 'text-[#0f172a] hover:bg-[#f8fafc]'
                        }`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium">{item.label}</span>
                        {item.badge && (
                          <span className="ml-auto bg-[#f97316] text-white text-xs px-2 py-0.5 rounded-full font-medium">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </nav>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 min-h-screen bg-[#f8fafc] lg:bg-[#ffffff]">
          <div className="h-full">
            {children || (
              <div className="p-4 lg:p-8">
                <div className="max-w-4xl mx-auto">
                  <div className="bg-[#ffffff] rounded-xl border border-[#e2e8f0] p-6 lg:p-8 shadow-md">
                    <h2 className="text-2xl font-bold text-[#0f172a] mb-4">Welcome to OffRoad Planner</h2>
                    <p className="text-[#64748b] mb-6">
                      Plan your next off-roading adventure with ease. Organize locations, assign tasks, 
                      coordinate meals, and keep your group connected.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {navigationItems.slice(1).map((item) => {
                        const Icon = item.icon
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleNavigation(item)}
                            className="p-4 bg-[#f8fafc] rounded-lg border border-[#e2e8f0] hover:border-[#228b22] hover:bg-[#ffffff] transition-all duration-150 text-left group"
                          >
                            <Icon className="w-6 h-6 text-[#228b22] mb-2 group-hover:scale-110 transition-transform duration-150" />
                            <h3 className="font-semibold text-[#0f172a] mb-1">{item.label}</h3>
                            <p className="text-sm text-[#64748b]">
                              {item.id === 'locations' && 'Discover and save amazing off-road locations'}
                              {item.id === 'calendar' && 'Schedule trips and check availability'}
                              {item.id === 'group' && 'Manage your adventure crew'}
                              {item.id === 'chat' && 'Stay connected with your group'}
                              {item.id === 'meals' && 'Plan delicious outdoor meals'}
                            </p>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#ffffff] border-t border-[#e2e8f0] px-2 py-2 z-30">
        <div className="flex items-center justify-around">
          {navigationItems.slice(0, 5).map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-all duration-150 min-w-[44px] min-h-[44px] ${
                  isActive
                    ? 'text-[#228b22]'
                    : 'text-[#64748b] hover:text-[#0f172a]'
                }`}
                aria-current={isActive ? 'page' : undefined}
                aria-label={item.label}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 bg-[#f97316] text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-medium">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Bottom padding for mobile navigation */}
      <div className="lg:hidden h-20" />
    </div>
  )
}

// Demo component for page.tsx
export default function AppLayoutDemo() {
  const [currentPage, setCurrentPage] = useState('dashboard')

  return (
    <AppLayout 
      currentPage={currentPage}
      onNavigate={setCurrentPage}
    />
  )
}