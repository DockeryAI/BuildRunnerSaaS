'use client'

import { useState } from 'react'
import { 
  Map, 
  Calendar, 
  Users, 
  MessageCircle, 
  UtensilsCrossed, 
  Settings,
  Menu,
  X,
  MapPin,
  Bell,
  Search
} from 'lucide-react'

interface AppLayoutProps {
  children?: React.ReactNode;
  currentPage?: string;
  userName?: string;
  notifications?: number;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: number;
}

const navigationItems: NavigationItem[] = [
  { id: 'map', label: 'Map', icon: Map, href: '/map' },
  { id: 'trips', label: 'Trips', icon: Calendar, href: '/trips' },
  { id: 'group', label: 'Group', icon: Users, href: '/group' },
  { id: 'chat', label: 'Chat', icon: MessageCircle, href: '/chat', badge: 3 },
  { id: 'meals', label: 'Meals', icon: UtensilsCrossed, href: '/meals' },
]

export function AppLayout({
  children,
  currentPage = 'map',
  userName = 'Trail Explorer',
  notifications = 2
}: AppLayoutProps = {}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-background dark:bg-background font-sans">
      {/* Mobile Header */}
      <header className="lg:hidden bg-surface dark:bg-surface border-b border-border dark:border-border px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleMobileMenu}
              className="p-2 text-mutedForeground dark:text-mutedForeground hover:text-foreground dark:hover:text-foreground hover:bg-muted dark:hover:bg-muted rounded-lg transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <MapPin className="w-6 h-6 text-primary dark:text-primary" />
              <span className="text-foreground dark:text-foreground font-semibold text-lg">TrailPlan</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              className="relative p-2 text-mutedForeground dark:text-mutedForeground hover:text-foreground dark:hover:text-foreground hover:bg-muted dark:hover:bg-muted rounded-lg transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring"
              aria-label={`${notifications} notifications`}
            >
              <Bell className="w-5 h-5" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent dark:bg-accent text-accentForeground dark:text-accentForeground text-xs rounded-full flex items-center justify-center font-semibold">
                  {notifications}
                </span>
              )}
            </button>
            <button 
              className="p-2 text-mutedForeground dark:text-mutedForeground hover:text-foreground dark:hover:text-foreground hover:bg-muted dark:hover:bg-muted rounded-lg transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="mt-3 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-mutedForeground dark:text-mutedForeground" />
          <input
            type="text"
            placeholder="Search locations, trips..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-surface dark:bg-surface border border-border dark:border-border rounded-lg text-foreground dark:text-foreground placeholder-mutedForeground dark:placeholder-mutedForeground focus:border-ring dark:focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:focus:ring-ring/50 transition-all duration-200"
          />
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={closeMobileMenu}>
          <div className="fixed inset-y-0 left-0 w-80 bg-surface dark:bg-surface border-r border-border dark:border-border p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <MapPin className="w-8 h-8 text-primary dark:text-primary" />
                <span className="text-foreground dark:text-foreground font-bold text-xl">TrailPlan</span>
              </div>
              <button
                onClick={closeMobileMenu}
                className="p-2 text-mutedForeground dark:text-mutedForeground hover:text-foreground dark:hover:text-foreground hover:bg-muted dark:hover:bg-muted rounded-lg transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring"
                aria-label="Close menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-3 p-3 bg-muted dark:bg-muted rounded-lg hover:bg-muted/80 dark:hover:bg-muted/80 transition-colors duration-150">
                <div className="w-10 h-10 bg-primary dark:bg-primary rounded-full flex items-center justify-center text-primaryForeground dark:text-primaryForeground font-semibold">
                  {userName.charAt(0)}
                </div>
                <div>
                  <p className="text-foreground dark:text-foreground font-medium">{userName}</p>
                  <p className="text-mutedForeground dark:text-mutedForeground text-sm">Trip Organizer</p>
                </div>
              </div>
            </div>

            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = item.id === currentPage
                
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring ${
                      isActive
                        ? 'bg-primary/20 dark:bg-primary/20 text-primary dark:text-primary border border-primary/30 dark:border-primary/30'
                        : 'text-mutedForeground dark:text-mutedForeground hover:text-foreground dark:hover:text-foreground hover:bg-muted dark:hover:bg-muted'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto px-2 py-1 bg-accent dark:bg-accent text-accentForeground dark:text-accentForeground text-xs rounded-full font-semibold">
                        {item.badge}
                      </span>
                    )}
                  </a>
                )
              })}
            </nav>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-surface dark:bg-surface border-r border-border dark:border-border shadow-sm">
          <div className="flex items-center gap-2 p-6 border-b border-border dark:border-border">
            <MapPin className="w-8 h-8 text-primary dark:text-primary" />
            <span className="text-foreground dark:text-foreground font-bold text-xl">TrailPlan</span>
          </div>

          <div className="p-6 border-b border-border dark:border-border">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-mutedForeground dark:text-mutedForeground" />
              <input
                type="text"
                placeholder="Search locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-background dark:bg-background border border-border dark:border-border rounded-lg text-foreground dark:text-foreground placeholder-mutedForeground dark:placeholder-mutedForeground focus:border-ring dark:focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:focus:ring-ring/50 transition-all duration-200"
              />
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted dark:bg-muted rounded-lg hover:bg-muted/80 dark:hover:bg-muted/80 transition-colors duration-150">
              <div className="w-10 h-10 bg-primary dark:bg-primary rounded-full flex items-center justify-center text-primaryForeground dark:text-primaryForeground font-semibold">
                {userName.charAt(0)}
              </div>
              <div>
                <p className="text-foreground dark:text-foreground font-medium">{userName}</p>
                <p className="text-mutedForeground dark:text-mutedForeground text-sm">Trip Organizer</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-6">
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = item.id === currentPage
                
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring ${
                      isActive
                        ? 'bg-primary/20 dark:bg-primary/20 text-primary dark:text-primary border border-primary/30 dark:border-primary/30'
                        : 'text-mutedForeground dark:text-mutedForeground hover:text-foreground dark:hover:text-foreground hover:bg-muted dark:hover:bg-muted'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto px-2 py-1 bg-accent dark:bg-accent text-accentForeground dark:text-accentForeground text-xs rounded-full font-semibold">
                        {item.badge}
                      </span>
                    )}
                  </a>
                )
              })}
            </div>
          </nav>

          <div className="p-6 border-t border-border dark:border-border">
            <div className="flex items-center justify-between">
              <button className="flex items-center gap-2 text-mutedForeground dark:text-mutedForeground hover:text-foreground dark:hover:text-foreground transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring rounded-lg p-2">
                <Bell className="w-5 h-5" />
                <span className="font-medium">Notifications</span>
              </button>
              {notifications > 0 && (
                <span className="px-2 py-1 bg-accent dark:bg-accent text-accentForeground dark:text-accentForeground text-xs rounded-full font-semibold">
                  {notifications}
                </span>
              )}
            </div>
            <button className="flex items-center gap-2 text-mutedForeground dark:text-mutedForeground hover:text-foreground dark:hover:text-foreground transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring rounded-lg p-2 mt-3">
              <Settings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64">
          <div className="min-h-screen">
            {children || (
              <div className="p-6">
                <div className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border p-8 text-center shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                  <MapPin className="w-16 h-16 text-primary dark:text-primary mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-foreground dark:text-foreground mb-2">Welcome to TrailPlan</h2>
                  <p className="text-mutedForeground dark:text-mutedForeground mb-6">Plan your next off-roading adventure with your crew</p>
                  <button className="px-6 py-3 bg-primary dark:bg-primary text-primaryForeground dark:text-primaryForeground rounded-lg hover:bg-primary/90 dark:hover:bg-primary/90 transition-all duration-150 font-medium shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring">
                    Start Planning
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface dark:bg-surface border-t border-border dark:border-border px-4 py-2 z-40 shadow-lg">
        <div className="flex items-center justify-around">
          {navigationItems.slice(0, 5).map((item) => {
            const Icon = item.icon
            const isActive = item.id === currentPage
            
            return (
              <a
                key={item.id}
                href={item.href}
                className={`relative flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-150 min-w-[44px] min-h-[44px] hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring ${
                  isActive
                    ? 'text-primary dark:text-primary'
                    : 'text-mutedForeground dark:text-mutedForeground hover:text-foreground dark:hover:text-foreground'
                }`}
                aria-label={item.label}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
                {item.badge && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent dark:bg-accent text-accentForeground dark:text-accentForeground text-xs rounded-full flex items-center justify-center font-semibold">
                    {item.badge}
                  </span>
                )}
              </a>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

export default function AppLayoutDemo() {
  return (
    <AppLayout currentPage="map">
      <div className="p-6 space-y-6">
        <div className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <h3 className="text-xl font-semibold text-foreground dark:text-foreground mb-4">Current Trip</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted dark:bg-muted rounded-lg hover:bg-muted/80 dark:hover:bg-muted/80 transition-colors duration-150">
              <div>
                <h4 className="font-medium text-foreground dark:text-foreground">Moab Adventure</h4>
                <p className="text-mutedForeground dark:text-mutedForeground text-sm">March 15-17, 2024</p>
              </div>
              <span className="px-3 py-1 bg-primary/20 dark:bg-primary/20 text-primary dark:text-primary rounded-full text-xs font-medium border border-primary/30 dark:border-primary/30">
                Active
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted dark:bg-muted rounded-lg text-center hover:bg-muted/80 dark:hover:bg-muted/80 transition-colors duration-150">
                <p className="text-2xl font-bold text-foreground dark:text-foreground">8</p>
                <p className="text-mutedForeground dark:text-mutedForeground text-sm">Members</p>
              </div>
              <div className="p-4 bg-muted dark:bg-muted rounded-lg text-center hover:bg-muted/80 dark:hover:bg-muted/80 transition-colors duration-150">
                <p className="text-2xl font-bold text-foreground dark:text-foreground">3</p>
                <p className="text-mutedForeground dark:text-mutedForeground text-sm">Days</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <h3 className="text-xl font-semibold text-foreground dark:text-foreground mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button className="p-4 bg-primary/20 dark:bg-primary/20 text-primary dark:text-primary rounded-lg hover:bg-primary/30 dark:hover:bg-primary/30 transition-all duration-150 border border-primary/30 dark:border-primary/30 text-left hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring">
              <Calendar className="w-6 h-6 mb-2" />
              <p className="font-medium">Schedule Trip</p>
              <p className="text-sm opacity-80">Plan your next adventure</p>
            </button>
            <button className="p-4 bg-secondary/20 dark:bg-secondary/20 text-secondary dark:text-secondary rounded-lg hover:bg-secondary/30 dark:hover:bg-secondary/30 transition-all duration-150 border border-secondary/30 dark:border-secondary/30 text-left hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring">
              <Users className="w-6 h-6 mb-2" />
              <p className="font-medium">Invite Friends</p>
              <p className="text-sm opacity-80">Add members to your group</p>
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}