'use client'

import { useState, useEffect } from 'react'
import { Menu, X, Home, MapPin, Users, Calendar, MessageSquare, ChefHat, Settings } from 'lucide-react'

interface ResponsiveLayoutProps {
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
  { id: 'locations', label: 'Locations', icon: MapPin, href: '/locations' },
  { id: 'group', label: 'Group', icon: Users, href: '/group' },
  { id: 'calendar', label: 'Calendar', icon: Calendar, href: '/calendar' },
  { id: 'chat', label: 'Chat', icon: MessageSquare, href: '/chat' },
  { id: 'meals', label: 'Meals', icon: ChefHat, href: '/meals' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' }
];

export function ResponsiveLayout({
  children = <DefaultContent />,
  currentPage = 'dashboard',
  onNavigate = (page: string) => console.log('Navigate to:', page)
}: ResponsiveLayoutProps = {}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };

  return (
    <div className="min-h-screen bg-[rgb(255,255,255)] font-medium" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Mobile Header */}
      {isMobile && (
        <header className="fixed top-0 left-0 right-0 z-50 bg-[rgb(255,255,255)] border-b border-[rgb(226,232,240)] shadow-sm">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-xl font-semibold text-[rgb(15,23,42)]">Off-Road Planner</h1>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              onKeyDown={(e) => handleKeyDown(e, () => setIsMobileMenuOpen(!isMobileMenuOpen))}
              className="p-2 rounded-lg hover:bg-[rgb(241,245,249)] focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:ring-offset-2 transition-colors"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-[rgb(15,23,42)]" />
              ) : (
                <Menu className="w-6 h-6 text-[rgb(15,23,42)]" />
              )}
            </button>
          </div>
        </header>
      )}

      <div className="flex">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <aside className="fixed left-0 top-0 h-full w-64 bg-[rgb(248,250,252)] border-r border-[rgb(226,232,240)] shadow-sm">
            <div className="p-6">
              <h1 className="text-2xl font-bold text-[rgb(34,139,34)]">Off-Road Planner</h1>
            </div>
            <nav className="px-4 pb-4" role="navigation" aria-label="Main navigation">
              <ul className="space-y-2">
                {NAVIGATION_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => handleNavigate(item.id)}
                        onKeyDown={(e) => handleKeyDown(e, () => handleNavigate(item.id))}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:ring-offset-2 ${
                          isActive
                            ? 'bg-[rgb(34,139,34)] text-[rgb(255,255,255)]'
                            : 'text-[rgb(15,23,42)] hover:bg-[rgb(241,245,249)]'
                        }`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>
        )}

        {/* Mobile Sidebar Overlay */}
        {isMobile && isMobileMenuOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-hidden="true"
            />
            <aside className="fixed left-0 top-0 h-full w-64 bg-[rgb(248,250,252)] z-50 shadow-lg">
              <div className="p-6 border-b border-[rgb(226,232,240)]">
                <h1 className="text-xl font-bold text-[rgb(34,139,34)]">Off-Road Planner</h1>
              </div>
              <nav className="p-4" role="navigation" aria-label="Main navigation">
                <ul className="space-y-2">
                  {NAVIGATION_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.id;
                    
                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => handleNavigate(item.id)}
                          onKeyDown={(e) => handleKeyDown(e, () => handleNavigate(item.id))}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:ring-offset-2 min-h-[44px] ${
                            isActive
                              ? 'bg-[rgb(34,139,34)] text-[rgb(255,255,255)]'
                              : 'text-[rgb(15,23,42)] hover:bg-[rgb(241,245,249)]'
                          }`}
                          aria-current={isActive ? 'page' : undefined}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{item.label}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </aside>
          </>
        )}

        {/* Main Content */}
        <main 
          className={`flex-1 ${
            isMobile ? 'pt-20' : 'ml-64'
          } min-h-screen`}
          role="main"
        >
          <div className="p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <nav 
          className="fixed bottom-0 left-0 right-0 bg-[rgb(255,255,255)] border-t border-[rgb(226,232,240)] shadow-lg"
          role="navigation"
          aria-label="Bottom navigation"
        >
          <div className="flex justify-around py-2">
            {NAVIGATION_ITEMS.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  onKeyDown={(e) => handleKeyDown(e, () => handleNavigate(item.id))}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:ring-offset-2 min-h-[44px] min-w-[44px] ${
                    isActive
                      ? 'text-[rgb(34,139,34)]'
                      : 'text-[rgb(15,23,42)] hover:text-[rgb(34,139,34)]'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={item.label}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}

function DefaultContent() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-[rgb(255,255,255)] rounded-lg border border-[rgb(226,232,240)] shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-[rgb(15,23,42)] mb-4">Welcome to Off-Road Planner</h2>
        <p className="text-[rgb(15,23,42)] mb-6">
          Plan your next off-roading adventure with ease. Organize locations, assign tasks to group members, 
          check weather conditions, and coordinate with your team.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-[rgb(248,250,252)] rounded-lg p-4 border border-[rgb(226,232,240)]">
            <MapPin className="w-8 h-8 text-[rgb(34,139,34)] mb-3" />
            <h3 className="font-semibold text-[rgb(15,23,42)] mb-2">Save Locations</h3>
            <p className="text-sm text-[rgb(15,23,42)]">Discover and save your favorite off-road destinations</p>
          </div>
          
          <div className="bg-[rgb(248,250,252)] rounded-lg p-4 border border-[rgb(226,232,240)]">
            <Users className="w-8 h-8 text-[rgb(34,139,34)] mb-3" />
            <h3 className="font-semibold text-[rgb(15,23,42)] mb-2">Organize Groups</h3>
            <p className="text-sm text-[rgb(15,23,42)]">Assign tasks and coordinate with your adventure crew</p>
          </div>
          
          <div className="bg-[rgb(248,250,252)] rounded-lg p-4 border border-[rgb(226,232,240)]">
            <Calendar className="w-8 h-8 text-[rgb(34,139,34)] mb-3" />
            <h3 className="font-semibold text-[rgb(15,23,42)] mb-2">Plan Events</h3>
            <p className="text-sm text-[rgb(15,23,42)]">Schedule trips and send calendar invites to your group</p>
          </div>
        </div>
      </div>
      
      <div className="bg-[rgb(255,255,255)] rounded-lg border border-[rgb(226,232,240)] shadow-md p-6">
        <h3 className="text-lg font-semibold text-[rgb(15,23,42)] mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 bg-[rgb(34,139,34)] text-[rgb(255,255,255)] rounded-lg hover:bg-[rgb(34,139,34)]/90 focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:ring-offset-2 transition-colors font-medium min-h-[44px]">
            Plan New Trip
          </button>
          <button className="px-4 py-2 bg-[rgb(248,250,252)] text-[rgb(15,23,42)] rounded-lg border border-[rgb(226,232,240)] hover:bg-[rgb(241,245,249)] focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:ring-offset-2 transition-colors font-medium min-h-[44px]">
            View Weather
          </button>
          <button className="px-4 py-2 bg-[rgb(248,250,252)] text-[rgb(15,23,42)] rounded-lg border border-[rgb(226,232,240)] hover:bg-[rgb(241,245,249)] focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:ring-offset-2 transition-colors font-medium min-h-[44px]">
            Check Group Chat
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ResponsiveLayoutDemo() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  
  return (
    <ResponsiveLayout 
      currentPage={currentPage}
      onNavigate={setCurrentPage}
    />
  );
}