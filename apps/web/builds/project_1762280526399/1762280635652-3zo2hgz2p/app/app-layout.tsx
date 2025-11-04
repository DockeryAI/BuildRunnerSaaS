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
  Bell,
  Search
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
}

const NAVIGATION_ITEMS: NavigationItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/dashboard' },
  { id: 'locations', label: 'Locations', icon: Map, href: '/locations' },
  { id: 'calendar', label: 'Calendar', icon: Calendar, href: '/calendar' },
  { id: 'group', label: 'Group', icon: Users, href: '/group' },
  { id: 'chat', label: 'Chat', icon: MessageCircle, href: '/chat' },
  { id: 'meals', label: 'Meals', icon: UtensilsCrossed, href: '/meals' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' }
];

export function AppLayout({
  children = <DefaultContent />,
  currentPage = 'dashboard',
  onNavigate = (page: string) => console.log('Navigate to:', page)
}: AppLayoutProps = {}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);

  useEffect(() => {
    // Close mobile menu when page changes
    setIsMobileMenuOpen(false);
  }, [currentPage]);

  const handleNavigation = (page: string) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white font-medium">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-[rgb(226,232,240)] px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 rounded-md hover:bg-[rgb(241,245,249)] transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="h-6 w-6 text-[rgb(15,23,42)]" />
        </button>
        
        <h1 className="text-lg font-semibold text-[rgb(15,23,42)]">
          Off-Road Planner
        </h1>
        
        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-md hover:bg-[rgb(241,245,249)] transition-colors"
            aria-label="Search"
          >
            <Search className="h-5 w-5 text-[rgb(15,23,42)]" />
          </button>
          <button
            className="p-2 rounded-md hover:bg-[rgb(241,245,249)] transition-colors relative"
            aria-label={`Notifications (${notifications})`}
          >
            <Bell className="h-5 w-5 text-[rgb(15,23,42)]" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-[rgb(239,68,68)] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {notifications}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
            <div className="flex items-center justify-between p-4 border-b border-[rgb(226,232,240)]">
              <h2 className="text-lg font-semibold text-[rgb(15,23,42)]">Menu</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-md hover:bg-[rgb(241,245,249)] transition-colors"
                aria-label="Close navigation menu"
              >
                <X className="h-6 w-6 text-[rgb(15,23,42)]" />
              </button>
            </div>
            <nav className="p-4">
              <ul className="space-y-2">
                {NAVIGATION_ITEMS.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => handleNavigation(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors ${
                        currentPage === item.id
                          ? 'bg-[rgb(34,139,34)] text-white'
                          : 'text-[rgb(15,23,42)] hover:bg-[rgb(241,245,249)]'
                      }`}
                      aria-current={currentPage === item.id ? 'page' : undefined}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}

      <div className="lg:flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 bg-white border-r border-[rgb(226,232,240)] min-h-screen sticky top-0">
          <div className="p-6 border-b border-[rgb(226,232,240)]">
            <h1 className="text-xl font-bold text-[rgb(15,23,42)]">
              Off-Road Planner
            </h1>
            <p className="text-sm text-[rgb(100,116,139)] mt-1">
              Adventure awaits
            </p>
          </div>
          
          <nav className="p-4">
            <ul className="space-y-2">
              {NAVIGATION_ITEMS.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavigation(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors ${
                      currentPage === item.id
                        ? 'bg-[rgb(34,139,34)] text-white shadow-md'
                        : 'text-[rgb(15,23,42)] hover:bg-[rgb(241,245,249)]'
                    }`}
                    aria-current={currentPage === item.id ? 'page' : undefined}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Desktop Notifications */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-[rgb(248,250,252)] rounded-lg p-4 border border-[rgb(226,232,240)]">
              <div className="flex items-center gap-2 mb-2">
                <Bell className="h-4 w-4 text-[rgb(245,158,11)]" />
                <span className="text-sm font-medium text-[rgb(15,23,42)]">
                  Notifications
                </span>
                <span className="bg-[rgb(239,68,68)] text-white text-xs rounded-full px-2 py-1">
                  {notifications}
                </span>
              </div>
              <p className="text-xs text-[rgb(100,116,139)]">
                New trip updates available
              </p>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen bg-[rgb(248,250,252)]">
          <div className="p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// Default content component for demo
function DefaultContent() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md border border-[rgb(226,232,240)] p-6 mb-6">
        <h2 className="text-2xl font-bold text-[rgb(15,23,42)] mb-4">
          Welcome to Off-Road Planner
        </h2>
        <p className="text-[rgb(100,116,139)] mb-6">
          Plan your next adventure with friends. Organize locations, assign tasks, 
          check weather, and coordinate meals all in one place.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-[rgb(248,250,252)] rounded-lg p-4 border border-[rgb(226,232,240)]">
            <Map className="h-8 w-8 text-[rgb(34,139,34)] mb-3" />
            <h3 className="font-semibold text-[rgb(15,23,42)] mb-2">Locations</h3>
            <p className="text-sm text-[rgb(100,116,139)]">
              Save and organize your favorite off-road destinations
            </p>
          </div>
          
          <div className="bg-[rgb(248,250,252)] rounded-lg p-4 border border-[rgb(226,232,240)]">
            <Users className="h-8 w-8 text-[rgb(34,139,34)] mb-3" />
            <h3 className="font-semibold text-[rgb(15,23,42)] mb-2">Group Tasks</h3>
            <p className="text-sm text-[rgb(100,116,139)]">
              Assign responsibilities like meals and supplies to group members
            </p>
          </div>
          
          <div className="bg-[rgb(248,250,252)] rounded-lg p-4 border border-[rgb(226,232,240)]">
            <Calendar className="h-8 w-8 text-[rgb(34,139,34)] mb-3" />
            <h3 className="font-semibold text-[rgb(15,23,42)] mb-2">Smart Scheduling</h3>
            <p className="text-sm text-[rgb(100,116,139)]">
              Check calendars and send invites with weather integration
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md border border-[rgb(226,232,240)] p-6">
          <h3 className="text-lg font-semibold text-[rgb(15,23,42)] mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-[rgb(248,250,252)] rounded-lg">
              <div className="w-2 h-2 bg-[rgb(34,139,34)] rounded-full"></div>
              <span className="text-sm text-[rgb(15,23,42)]">
                New trip "Moab Adventure" created
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-[rgb(248,250,252)] rounded-lg">
              <div className="w-2 h-2 bg-[rgb(245,158,11)] rounded-full"></div>
              <span className="text-sm text-[rgb(15,23,42)]">
                Weather alert for weekend trip
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-[rgb(226,232,240)] p-6">
          <h3 className="text-lg font-semibold text-[rgb(15,23,42)] mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button className="w-full bg-[rgb(34,139,34)] text-white px-4 py-3 rounded-lg font-medium hover:bg-[rgb(22,101,22)] transition-colors">
              Plan New Trip
            </button>
            <button className="w-full bg-[rgb(248,250,252)] text-[rgb(15,23,42)] px-4 py-3 rounded-lg font-medium border border-[rgb(226,232,240)] hover:bg-[rgb(241,245,249)] transition-colors">
              Browse Locations
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Demo component for page.tsx
export default function AppLayoutDemo() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  return (
    <AppLayout 
      currentPage={currentPage}
      onNavigate={setCurrentPage}
    />
  );
}