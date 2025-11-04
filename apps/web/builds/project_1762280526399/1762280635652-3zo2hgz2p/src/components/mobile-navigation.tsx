'use client'

import { useState } from 'react'
import { 
  MapPin, 
  Calendar, 
  Users, 
  MessageCircle, 
  UtensilsCrossed,
  Home,
  Settings
} from 'lucide-react'

interface NavigationItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  badge?: number
}

interface MobileNavigationProps {
  activeTab?: string
  onTabChange?: (tabId: string) => void
  unreadMessages?: number
  pendingRSVPs?: number
}

const DEFAULT_NAVIGATION_ITEMS: NavigationItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    href: '/'
  },
  {
    id: 'locations',
    label: 'Locations',
    icon: MapPin,
    href: '/locations'
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: Calendar,
    href: '/calendar'
  },
  {
    id: 'group',
    label: 'Group',
    icon: Users,
    href: '/group'
  },
  {
    id: 'chat',
    label: 'Chat',
    icon: MessageCircle,
    href: '/chat'
  },
  {
    id: 'meals',
    label: 'Meals',
    icon: UtensilsCrossed,
    href: '/meals'
  }
]

export function MobileNavigation({
  activeTab = 'home',
  onTabChange = (tabId: string) => console.log('Tab changed:', tabId),
  unreadMessages = 3,
  pendingRSVPs = 2
}: MobileNavigationProps = {}) {
  const [currentTab, setCurrentTab] = useState(activeTab)

  const handleTabClick = (tabId: string) => {
    setCurrentTab(tabId)
    onTabChange(tabId)
  }

  const getBadgeCount = (tabId: string): number | undefined => {
    switch (tabId) {
      case 'chat':
        return unreadMessages
      case 'group':
        return pendingRSVPs
      default:
        return undefined
    }
  }

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav 
        className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[rgb(226,232,240)] shadow-lg"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="grid grid-cols-6 h-16">
          {DEFAULT_NAVIGATION_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = currentTab === item.id
            const badgeCount = getBadgeCount(item.id)

            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`
                  relative flex flex-col items-center justify-center h-full px-1 transition-colors duration-200
                  ${isActive 
                    ? 'text-[rgb(34,139,34)]' 
                    : 'text-[rgb(100,116,139)] hover:text-[rgb(34,139,34)]'
                  }
                  focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:ring-offset-2
                  active:scale-95 transition-transform
                `}
                aria-label={`Navigate to ${item.label}`}
                aria-current={isActive ? 'page' : undefined}
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                <div className="relative">
                  <Icon 
                    className={`w-5 h-5 ${isActive ? 'stroke-2' : 'stroke-1.5'}`}
                    aria-hidden="true"
                  />
                  
                  {/* Badge for notifications */}
                  {badgeCount && badgeCount > 0 && (
                    <span 
                      className="absolute -top-2 -right-2 min-w-[18px] h-[18px] bg-[rgb(239,68,68)] text-white text-xs font-medium rounded-full flex items-center justify-center px-1"
                      aria-label={`${badgeCount} notifications`}
                    >
                      {badgeCount > 99 ? '99+' : badgeCount}
                    </span>
                  )}
                </div>
                
                <span 
                  className={`text-xs font-medium mt-1 leading-none ${
                    isActive ? 'text-[rgb(34,139,34)]' : 'text-[rgb(100,116,139)]'
                  }`}
                >
                  {item.label}
                </span>

                {/* Active indicator */}
                {isActive && (
                  <div 
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-[rgb(34,139,34)] rounded-full"
                    aria-hidden="true"
                  />
                )}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Spacer to prevent content from being hidden behind fixed nav */}
      <div className="h-16" aria-hidden="true" />
    </>
  )
}

// Demo component for page.tsx
export default function MobileNavigationDemo() {
  const [activeTab, setActiveTab] = useState('home')

  return (
    <div className="min-h-screen bg-[rgb(248,250,252)] pb-20">
      {/* Demo content */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-[rgb(15,23,42)] mb-4">
            Off-Road Trip Planner
          </h1>
          <p className="text-[rgb(100,116,139)] mb-4">
            Current active tab: <span className="font-medium text-[rgb(34,139,34)]">{activeTab}</span>
          </p>
          <div className="space-y-4">
            <div className="p-4 bg-[rgb(241,245,249)] rounded-lg">
              <h3 className="font-medium text-[rgb(15,23,42)] mb-2">Next Trip</h3>
              <p className="text-sm text-[rgb(100,116,139)]">Moab Adventure - March 15-17</p>
            </div>
            <div className="p-4 bg-[rgb(241,245,249)] rounded-lg">
              <h3 className="font-medium text-[rgb(15,23,42)] mb-2">Group Status</h3>
              <p className="text-sm text-[rgb(100,116,139)]">8 members • 2 pending RSVPs</p>
            </div>
            <div className="p-4 bg-[rgb(241,245,249)] rounded-lg">
              <h3 className="font-medium text-[rgb(15,23,42)] mb-2">Recent Activity</h3>
              <p className="text-sm text-[rgb(100,116,139)]">3 new messages in group chat</p>
            </div>
          </div>
        </div>

        {/* Settings button for demo */}
        <button className="w-full flex items-center justify-center gap-2 p-4 bg-white rounded-lg shadow-md border border-[rgb(226,232,240)] hover:bg-[rgb(248,250,252)] transition-colors">
          <Settings className="w-5 h-5 text-[rgb(100,116,139)]" />
          <span className="font-medium text-[rgb(15,23,42)]">Settings</span>
        </button>
      </div>

      <MobileNavigation 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        unreadMessages={3}
        pendingRSVPs={2}
      />
    </div>
  )
}