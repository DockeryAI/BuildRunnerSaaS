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
  children?: React.ReactNode;
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  badge?: number;
}

const navigationItems: NavigationItem[] = [
  { id: 'trips', label: 'Trips', icon: Map, href: '/trips' },
  { id: 'calendar', label: 'Calendar', icon: Calendar, href: '/calendar' },
  { id: 'group', label: 'Group', icon: Users, href: '/group' },
  { id: 'chat', label: 'Chat', icon: MessageCircle, href: '/chat', badge: 3 },
  { id: 'meals', label: 'Meals', icon: UtensilsCrossed, href: '/meals' }
];

export function AppLayout({
  children,
  currentPage = 'trips',
  onNavigate = (page: string) => console.log('Navigate to:', page)
}: AppLayoutProps = {}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleNavigation = (page: string) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[rgb(255,255,255)] font-medium">
      {/* Offline Indicator */}
      {!isOnline && (
        <div className="bg-[rgb(220,38,38)] text-white px-4 py-2 text-center text-sm font-medium">
          You're offline. Some features may be limited.
        </div>
      )}

      {/* Header */}
      <header className="bg-[rgb(255,255,255)] border-b border-[rgb(226,232,240)] sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-[rgb(241,245,249)] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:ring-offset-2"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-[rgb(15,23,42)]" />
              ) : (
                <Menu className="w-5 h-5 text-[rgb(15,23,42)]" />
              )}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[rgb(34,139,34)] rounded-lg flex items-center justify-center">
                <Map className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-semibold text-[rgb(15,23,42)]">
                TrailPlan
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleNavigation('new-trip')}
              className="p-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:ring-offset-2 shadow-md active:scale-95"
              aria-label="Create new trip"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleNavigation('settings')}
              className="p-2 rounded-lg hover:bg-[rgb(241,245,249)] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:ring-offset-2"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5 text-[rgb(15,23,42)]" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="fixed left-0 top-0 h-full w-64 bg-[rgb(255,255,255)] shadow-lg transform transition-transform duration-300">
            <div className="p-4 border-b border-[rgb(226,232,240)]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[rgb(34,139,34)] rounded-lg flex items-center justify-center">
                  <Map className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-[rgb(15,23,42)]">
                  TrailPlan
                </h2>
              </div>
            </div>
            <nav className="p-4">
              <ul className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => handleNavigation(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:ring-offset-2 ${
                          isActive
                            ? 'bg-[rgb(34,139,34)] text-white'
                            : 'text-[rgb(15,23,42)] hover:bg-[rgb(241,245,249)]'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                        {item.badge && (
                          <span className="ml-auto bg-[rgb(245,158,11)] text-white text-xs px-2 py-1 rounded-full font-medium">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 bg-[rgb(255,255,255)] border-r border-[rgb(226,232,240)] min-h-screen">
          <nav className="p-4">
            <ul className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleNavigation(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:ring-offset-2 ${
                        isActive
                          ? 'bg-[rgb(34,139,34)] text-white'
                          : 'text-[rgb(15,23,42)] hover:bg-[rgb(241,245,249)]'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto bg-[rgb(245,158,11)] text-white text-xs px-2 py-1 rounded-full font-medium">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen pb-20 lg:pb-0">
          {children || (
            <div className="p-4 lg:p-6">
              <div className="max-w-4xl mx-auto">
                <div className="bg-[rgb(248,250,252)] rounded-xl p-8 text-center shadow-sm">
                  <Map className="w-12 h-12 text-[rgb(34,139,34)] mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-[rgb(15,23,42)] mb-2">
                    Welcome to TrailPlan
                  </h2>
                  <p className="text-[rgb(15,23,42)]/70 mb-6">
                    Plan your next off-roading adventure with your group. Organize locations, assign tasks, and coordinate meals.
                  </p>
                  <button
                    onClick={() => handleNavigation('new-trip')}
                    className="px-6 py-3 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors duration-150 font-medium shadow-md hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:ring-offset-2"
                  >
                    Plan Your First Trip
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Bottom Navigation (Mobile) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[rgb(255,255,255)] border-t border-[rgb(226,232,240)] z-30 shadow-lg">
        <div className="flex">
          {navigationItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:ring-offset-2 min-h-[44px] ${
                  isActive
                    ? 'text-[rgb(34,139,34)]'
                    : 'text-[rgb(15,23,42)]/60 hover:text-[rgb(15,23,42)]'
                }`}
                aria-label={item.label}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {item.badge && (
                    <span className="absolute -top-2 -right-2 bg-[rgb(245,158,11)] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

// Demo component for page.tsx
export default function AppLayoutDemo() {
  const [currentPage, setCurrentPage] = useState('trips');

  return (
    <AppLayout 
      currentPage={currentPage}
      onNavigate={setCurrentPage}
    />
  );
}