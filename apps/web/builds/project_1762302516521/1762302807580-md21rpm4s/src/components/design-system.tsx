'use client'

import { useState } from 'react'
import { Palette, Type, Layout, Smartphone, Accessibility, Zap } from 'lucide-react'

interface ColorSwatch {
  name: string
  value: string
  description: string
}

interface TypographyScale {
  size: string
  weight: string
  usage: string
}

interface ComponentPattern {
  name: string
  description: string
  example: string
}

const BRAND_COLORS: ColorSwatch[] = [
  { name: 'Primary', value: 'rgb(34, 139, 34)', description: 'Main brand color for CTAs and highlights' },
  { name: 'Primary Foreground', value: 'rgb(255, 255, 255)', description: 'Text on primary backgrounds' },
  { name: 'Secondary', value: 'rgb(245, 247, 250)', description: 'Secondary backgrounds and surfaces' },
  { name: 'Accent', value: 'rgb(249, 115, 22)', description: 'Accent color for notifications and alerts' },
  { name: 'Background', value: 'rgb(255, 255, 255)', description: 'Main background color' },
  { name: 'Foreground', value: 'rgb(15, 23, 42)', description: 'Primary text color' },
  { name: 'Border', value: 'rgb(226, 232, 240)', description: 'Border and divider color' },
  { name: 'Muted', value: 'rgb(248, 250, 252)', description: 'Muted backgrounds and disabled states' },
  { name: 'Destructive', value: 'rgb(220, 38, 38)', description: 'Error and destructive actions' }
]

const TYPOGRAPHY_SCALE: TypographyScale[] = [
  { size: '0.75rem', weight: '400', usage: 'Captions, labels' },
  { size: '0.875rem', weight: '400', usage: 'Body text small' },
  { size: '1rem', weight: '500', usage: 'Body text' },
  { size: '1.125rem', weight: '500', usage: 'Subheadings' },
  { size: '1.25rem', weight: '600', usage: 'Card titles' },
  { size: '1.5rem', weight: '600', usage: 'Section headers' },
  { size: '1.875rem', weight: '700', usage: 'Page titles' },
  { size: '2.25rem', weight: '700', usage: 'Hero headings' }
]

const COMPONENT_PATTERNS: ComponentPattern[] = [
  { name: 'Navigation', description: 'Bottom tabs for mobile-first navigation', example: 'Fixed bottom navigation with 4-5 primary actions' },
  { name: 'Cards', description: 'Elevated cards with subtle shadows', example: 'Trip cards, member cards, task cards' },
  { name: 'Buttons', description: 'Touch-friendly with 44px minimum height', example: 'Primary, secondary, and destructive variants' },
  { name: 'Forms', description: 'Large touch targets with clear validation', example: 'Trip creation, member invitation forms' },
  { name: 'Lists', description: 'Swipe actions and infinite scroll', example: 'Trip list, member list, task assignments' },
  { name: 'Modals', description: 'Full-screen on mobile, centered on desktop', example: 'Trip details, member profiles, confirmations' }
]

interface DesignSystemProps {
  section?: 'colors' | 'typography' | 'components' | 'principles' | 'all'
}

export function DesignSystem({ section = 'all' }: DesignSystemProps = {}) {
  const [activeTab, setActiveTab] = useState<string>(section === 'all' ? 'colors' : section)

  const tabs = [
    { id: 'colors', label: 'Colors', icon: Palette },
    { id: 'typography', label: 'Typography', icon: Type },
    { id: 'components', label: 'Components', icon: Layout },
    { id: 'principles', label: 'Principles', icon: Zap }
  ]

  return (
    <div className="min-h-screen bg-[rgb(255,255,255)] font-medium">
      {/* Header */}
      <div className="bg-[rgb(34,139,34)] text-[rgb(255,255,255)] p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">TrailPlan Design System</h1>
          <p className="text-lg opacity-90">Adventurous • Rugged • Trustworthy • Community-Focused</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-[rgb(245,247,250)] border-b border-[rgb(226,232,240)] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'border-[rgb(34,139,34)] text-[rgb(34,139,34)]'
                      : 'border-transparent text-[rgb(15,23,42)] hover:text-[rgb(34,139,34)]'
                  }`}
                  aria-label={`View ${tab.label} section`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Colors Section */}
        {activeTab === 'colors' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-[rgb(15,23,42)] mb-4">Brand Colors</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {BRAND_COLORS.map((color) => (
                  <div
                    key={color.name}
                    className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-200"
                  >
                    <div
                      className="w-full h-16 rounded-md mb-3 border border-[rgb(226,232,240)]"
                      style={{ backgroundColor: color.value }}
                      aria-label={`${color.name} color swatch`}
                    />
                    <h3 className="font-semibold text-[rgb(15,23,42)] mb-1">{color.name}</h3>
                    <p className="text-sm text-[rgb(15,23,42)] opacity-70 mb-2">{color.value}</p>
                    <p className="text-xs text-[rgb(15,23,42)] opacity-60">{color.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[rgb(248,250,252)] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-[rgb(15,23,42)] mb-3">Usage Guidelines</h3>
              <ul className="space-y-2 text-sm text-[rgb(15,23,42)]">
                <li>• Use Primary (Forest Green) for main CTAs and active states</li>
                <li>• Use Accent (Orange) sparingly for notifications and warnings</li>
                <li>• Maintain 4.5:1 contrast ratio for accessibility compliance</li>
                <li>• Test colors in both light and outdoor lighting conditions</li>
              </ul>
            </div>
          </div>
        )}

        {/* Typography Section */}
        {activeTab === 'typography' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-[rgb(15,23,42)] mb-4">Typography Scale</h2>
              <div className="space-y-4">
                {TYPOGRAPHY_SCALE.map((type, index) => (
                  <div
                    key={index}
                    className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg p-4 shadow-md"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="text-[rgb(15,23,42)]"
                        style={{ fontSize: type.size, fontWeight: type.weight }}
                      >
                        The quick brown fox jumps
                      </span>
                      <div className="text-xs text-[rgb(15,23,42)] opacity-60 text-right">
                        <div>{type.size}</div>
                        <div>Weight: {type.weight}</div>
                      </div>
                    </div>
                    <p className="text-sm text-[rgb(15,23,42)] opacity-70">{type.usage}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[rgb(248,250,252)] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-[rgb(15,23,42)] mb-3">Font Guidelines</h3>
              <ul className="space-y-2 text-sm text-[rgb(15,23,42)]">
                <li>• Primary: Inter (system fallback: system-ui, sans-serif)</li>
                <li>• Monospace: JetBrains Mono for code and data</li>
                <li>• Line height: 1.5 for body text, 1.2 for headings</li>
                <li>• Use font-medium (500) as default weight for better mobile readability</li>
              </ul>
            </div>
          </div>
        )}

        {/* Components Section */}
        {activeTab === 'components' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-[rgb(15,23,42)] mb-4">Component Patterns</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {COMPONENT_PATTERNS.map((pattern) => (
                  <div
                    key={pattern.name}
                    className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-200"
                  >
                    <h3 className="text-lg font-semibold text-[rgb(15,23,42)] mb-2">{pattern.name}</h3>
                    <p className="text-sm text-[rgb(15,23,42)] opacity-70 mb-3">{pattern.description}</p>
                    <p className="text-xs text-[rgb(15,23,42)] opacity-60 bg-[rgb(248,250,252)] p-3 rounded">
                      Example: {pattern.example}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[rgb(248,250,252)] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-[rgb(15,23,42)] mb-3">Component Standards</h3>
              <ul className="space-y-2 text-sm text-[rgb(15,23,42)]">
                <li>• Minimum touch target: 44px × 44px for mobile accessibility</li>
                <li>• Use 8px spacing scale (gap-2, gap-4, gap-6, gap-8)</li>
                <li>• Apply subtle shadows (shadow-md) for depth and hierarchy</li>
                <li>• Include hover and focus states for all interactive elements</li>
              </ul>
            </div>
          </div>
        )}

        {/* Principles Section */}
        {activeTab === 'principles' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg p-6 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <Smartphone className="w-6 h-6 text-[rgb(34,139,34)]" />
                  <h3 className="text-lg font-semibold text-[rgb(15,23,42)]">Mobile-First</h3>
                </div>
                <ul className="space-y-2 text-sm text-[rgb(15,23,42)]">
                  <li>• 90% of users are on mobile devices</li>
                  <li>• Design for thumb navigation</li>
                  <li>• Test on actual devices outdoors</li>
                  <li>• Optimize for one-handed use</li>
                </ul>
              </div>

              <div className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg p-6 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <Accessibility className="w-6 h-6 text-[rgb(34,139,34)]" />
                  <h3 className="text-lg font-semibold text-[rgb(15,23,42)]">Accessibility</h3>
                </div>
                <ul className="space-y-2 text-sm text-[rgb(15,23,42)]">
                  <li>• WCAG 2.1 AA compliance</li>
                  <li>• Keyboard navigation support</li>
                  <li>• Screen reader compatibility</li>
                  <li>• High contrast for outdoor use</li>
                </ul>
              </div>

              <div className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg p-6 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="w-6 h-6 text-[rgb(34,139,34)]" />
                  <h3 className="text-lg font-semibold text-[rgb(15,23,42)]">Performance</h3>
                </div>
                <ul className="space-y-2 text-sm text-[rgb(15,23,42)]">
                  <li>• Offline-first architecture</li>
                  <li>• Optimistic UI updates</li>
                  <li>• Lazy loading and code splitting</li>
                  <li>• Battery-efficient animations</li>
                </ul>
              </div>

              <div className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg p-6 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <Layout className="w-6 h-6 text-[rgb(34,139,34)]" />
                  <h3 className="text-lg font-semibold text-[rgb(15,23,42)]">User Experience</h3>
                </div>
                <ul className="space-y-2 text-sm text-[rgb(15,23,42)]">
                  <li>• Clear visual hierarchy</li>
                  <li>• Consistent interaction patterns</li>
                  <li>• Helpful empty and error states</li>
                  <li>• Progressive disclosure</li>
                </ul>
              </div>
            </div>

            <div className="bg-[rgb(34,139,34)] text-[rgb(255,255,255)] rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3">Brand Personality</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">Adventurous</div>
                  <div className="text-sm opacity-80">Bold, exploratory</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">Rugged</div>
                  <div className="text-sm opacity-80">Durable, reliable</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">Trustworthy</div>
                  <div className="text-sm opacity-80">Safe, dependable</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">Community</div>
                  <div className="text-sm opacity-80">Connected, social</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function DesignSystemDemo() {
  return <DesignSystem />
}