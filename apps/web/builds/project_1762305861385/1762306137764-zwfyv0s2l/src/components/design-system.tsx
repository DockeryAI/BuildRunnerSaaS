'use client'

import { useState } from 'react'
import { Palette, Type, Layout, Smartphone, Accessibility, Zap } from 'lucide-react'

interface DesignTokenProps {
  showCode?: boolean;
  interactive?: boolean;
}

interface ColorToken {
  name: string;
  value: string;
  usage: string;
}

interface TypographyToken {
  name: string;
  size: string;
  weight: string;
  usage: string;
}

interface SpacingToken {
  name: string;
  value: string;
  pixels: string;
}

export function DesignSystem({
  showCode = false,
  interactive = true
}: DesignTokenProps = {}) {
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'spacing' | 'components'>('colors')
  const [selectedColor, setSelectedColor] = useState<string | null>(null)

  const colorTokens: ColorToken[] = [
    { name: 'Primary', value: 'rgb(34, 139, 34)', usage: 'Main brand color, CTAs, active states' },
    { name: 'Primary Foreground', value: 'rgb(255, 255, 255)', usage: 'Text on primary backgrounds' },
    { name: 'Secondary', value: 'rgb(248, 250, 252)', usage: 'Secondary backgrounds, subtle elements' },
    { name: 'Accent', value: 'rgb(245, 158, 11)', usage: 'Highlights, warnings, attention' },
    { name: 'Background', value: 'rgb(255, 255, 255)', usage: 'Main page background' },
    { name: 'Foreground', value: 'rgb(15, 23, 42)', usage: 'Primary text color' },
    { name: 'Border', value: 'rgb(226, 232, 240)', usage: 'Borders, dividers' },
    { name: 'Muted', value: 'rgb(241, 245, 249)', usage: 'Disabled states, subtle backgrounds' },
    { name: 'Destructive', value: 'rgb(220, 38, 38)', usage: 'Errors, delete actions' }
  ]

  const typographyTokens: TypographyToken[] = [
    { name: 'Heading XL', size: '2.25rem', weight: '700', usage: 'Page titles' },
    { name: 'Heading Large', size: '1.875rem', weight: '600', usage: 'Section headers' },
    { name: 'Heading Medium', size: '1.5rem', weight: '600', usage: 'Card titles' },
    { name: 'Body Large', size: '1.125rem', weight: '400', usage: 'Large body text' },
    { name: 'Body', size: '1rem', weight: '400', usage: 'Default body text' },
    { name: 'Body Small', size: '0.875rem', weight: '400', usage: 'Secondary text' },
    { name: 'Caption', size: '0.75rem', weight: '500', usage: 'Labels, captions' }
  ]

  const spacingTokens: SpacingToken[] = [
    { name: 'xs', value: '0.5', pixels: '8px' },
    { name: 'sm', value: '1', pixels: '16px' },
    { name: 'md', value: '1.5', pixels: '24px' },
    { name: 'lg', value: '2', pixels: '32px' },
    { name: 'xl', value: '3', pixels: '48px' },
    { name: '2xl', value: '4', pixels: '64px' }
  ]

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'rgb(255, 255, 255)' }}>
      {/* Header */}
      <div className="border-b" style={{ borderColor: 'rgb(226, 232, 240)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: 'rgb(34, 139, 34)' }}
            >
              <Palette className="w-6 h-6" style={{ color: 'rgb(255, 255, 255)' }} />
            </div>
            <div>
              <h1 
                className="text-3xl font-bold font-['Inter']"
                style={{ color: 'rgb(15, 23, 42)' }}
              >
                Off-Road Trip Planner Design System
              </h1>
              <p 
                className="text-lg mt-1 font-['Inter']"
                style={{ color: 'rgb(100, 116, 139)' }}
              >
                Adventurous • Rugged • Trustworthy • Community-Focused
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-1 mt-6 p-1 rounded-lg w-fit" style={{ backgroundColor: 'rgb(248, 250, 252)' }}>
          {[
            { id: 'colors', label: 'Colors', icon: Palette },
            { id: 'typography', label: 'Typography', icon: Type },
            { id: 'spacing', label: 'Spacing', icon: Layout },
            { id: 'components', label: 'Components', icon: Smartphone }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 font-['Inter'] ${
                activeTab === id
                  ? 'shadow-sm'
                  : 'hover:bg-white/50'
              }`}
              style={{
                backgroundColor: activeTab === id ? 'rgb(255, 255, 255)' : 'transparent',
                color: activeTab === id ? 'rgb(34, 139, 34)' : 'rgb(100, 116, 139)'
              }}
              aria-label={`View ${label} tokens`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'colors' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2 font-['Inter']" style={{ color: 'rgb(15, 23, 42)' }}>
                Color Palette
              </h2>
              <p className="font-['Inter']" style={{ color: 'rgb(100, 116, 139)' }}>
                Our color system reflects the rugged outdoor spirit while maintaining accessibility and usability.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {colorTokens.map((token) => (
                <div
                  key={token.name}
                  className="rounded-xl border p-6 cursor-pointer transition-all duration-200 hover:shadow-lg"
                  style={{ 
                    borderColor: 'rgb(226, 232, 240)',
                    backgroundColor: 'rgb(255, 255, 255)'
                  }}
                  onClick={() => {
                    setSelectedColor(selectedColor === token.name ? null : token.name)
                    if (interactive) copyToClipboard(token.value)
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Copy ${token.name} color value`}
                >
                  <div
                    className="w-full h-16 rounded-lg mb-4 border"
                    style={{ 
                      backgroundColor: token.value,
                      borderColor: 'rgb(226, 232, 240)'
                    }}
                  />
                  <h3 className="font-semibold text-lg mb-1 font-['Inter']" style={{ color: 'rgb(15, 23, 42)' }}>
                    {token.name}
                  </h3>
                  <p className="text-sm font-mono mb-2 font-['JetBrains_Mono']" style={{ color: 'rgb(100, 116, 139)' }}>
                    {token.value}
                  </p>
                  <p className="text-sm font-['Inter']" style={{ color: 'rgb(100, 116, 139)' }}>
                    {token.usage}
                  </p>
                  {selectedColor === token.name && (
                    <div className="mt-3 p-2 rounded text-xs font-['Inter']" style={{ backgroundColor: 'rgb(34, 139, 34)', color: 'rgb(255, 255, 255)' }}>
                      Copied to clipboard!
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'typography' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2 font-['Inter']" style={{ color: 'rgb(15, 23, 42)' }}>
                Typography Scale
              </h2>
              <p className="font-['Inter']" style={{ color: 'rgb(100, 116, 139)' }}>
                Using Inter for clarity and JetBrains Mono for code. Optimized for mobile readability.
              </p>
            </div>

            <div className="space-y-4">
              {typographyTokens.map((token) => (
                <div
                  key={token.name}
                  className="rounded-xl border p-6"
                  style={{ 
                    borderColor: 'rgb(226, 232, 240)',
                    backgroundColor: 'rgb(255, 255, 255)'
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1">
                      <div
                        className="font-['Inter'] mb-2"
                        style={{
                          fontSize: token.size,
                          fontWeight: token.weight,
                          color: 'rgb(15, 23, 42)'
                        }}
                      >
                        The quick brown fox jumps
                      </div>
                      <div className="flex gap-4 text-sm">
                        <span className="font-semibold font-['Inter']" style={{ color: 'rgb(15, 23, 42)' }}>
                          {token.name}
                        </span>
                        <span className="font-mono font-['JetBrains_Mono']" style={{ color: 'rgb(100, 116, 139)' }}>
                          {token.size} / {token.weight}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm font-['Inter']" style={{ color: 'rgb(100, 116, 139)' }}>
                      {token.usage}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'spacing' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2 font-['Inter']" style={{ color: 'rgb(15, 23, 42)' }}>
                Spacing System
              </h2>
              <p className="font-['Inter']" style={{ color: 'rgb(100, 116, 139)' }}>
                8px base unit system for consistent spacing across all components.
              </p>
            </div>

            <div className="space-y-4">
              {spacingTokens.map((token) => (
                <div
                  key={token.name}
                  className="rounded-xl border p-6"
                  style={{ 
                    borderColor: 'rgb(226, 232, 240)',
                    backgroundColor: 'rgb(255, 255, 255)'
                  }}
                >
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4">
                      <div
                        className="rounded"
                        style={{
                          width: `${parseFloat(token.value) * 16}px`,
                          height: '24px',
                          backgroundColor: 'rgb(34, 139, 34)'
                        }}
                      />
                      <div>
                        <div className="font-semibold font-['Inter']" style={{ color: 'rgb(15, 23, 42)' }}>
                          {token.name}
                        </div>
                        <div className="text-sm font-mono font-['JetBrains_Mono']" style={{ color: 'rgb(100, 116, 139)' }}>
                          {token.value}rem ({token.pixels})
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'components' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-2 font-['Inter']" style={{ color: 'rgb(15, 23, 42)' }}>
                Component Examples
              </h2>
              <p className="font-['Inter']" style={{ color: 'rgb(100, 116, 139)' }}>
                Core UI components following our design principles.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Buttons */}
              <div
                className="rounded-xl border p-6"
                style={{ 
                  borderColor: 'rgb(226, 232, 240)',
                  backgroundColor: 'rgb(255, 255, 255)'
                }}
              >
                <h3 className="font-semibold text-lg mb-4 font-['Inter']" style={{ color: 'rgb(15, 23, 42)' }}>
                  Buttons
                </h3>
                <div className="space-y-3">
                  <button
                    className="px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 min-h-[44px] font-['Inter']"
                    style={{ 
                      backgroundColor: 'rgb(34, 139, 34)',
                      color: 'rgb(255, 255, 255)'
                    }}
                    aria-label="Primary action button"
                  >
                    Plan New Trip
                  </button>
                  <button
                    className="px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 border hover:shadow-sm min-h-[44px] font-['Inter']"
                    style={{ 
                      borderColor: 'rgb(226, 232, 240)',
                      color: 'rgb(15, 23, 42)',
                      backgroundColor: 'rgb(255, 255, 255)'
                    }}
                    aria-label="Secondary action button"
                  >
                    View Saved Trips
                  </button>
                </div>
              </div>

              {/* Cards */}
              <div
                className="rounded-xl border p-6"
                style={{ 
                  borderColor: 'rgb(226, 232, 240)',
                  backgroundColor: 'rgb(255, 255, 255)'
                }}
              >
                <h3 className="font-semibold text-lg mb-4 font-['Inter']" style={{ color: 'rgb(15, 23, 42)' }}>
                  Trip Card
                </h3>
                <div
                  className="rounded-lg border p-4 hover:shadow-md transition-all duration-200"
                  style={{ 
                    borderColor: 'rgb(226, 232, 240)',
                    backgroundColor: 'rgb(255, 255, 255)'
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: 'rgb(34, 139, 34)' }}
                    />
                    <span className="font-semibold font-['Inter']" style={{ color: 'rgb(15, 23, 42)' }}>
                      Moab Adventure
                    </span>
                  </div>
                  <p className="text-sm mb-3 font-['Inter']" style={{ color: 'rgb(100, 116, 139)' }}>
                    4-day off-road expedition through Utah's red rock country
                  </p>
                  <div className="flex gap-2">
                    <span
                      className="px-2 py-1 rounded text-xs font-medium font-['Inter']"
                      style={{ 
                        backgroundColor: 'rgb(245, 158, 11)',
                        color: 'rgb(255, 255, 255)'
                      }}
                    >
                      4 days
                    </span>
                    <span
                      className="px-2 py-1 rounded text-xs font-medium font-['Inter']"
                      style={{ 
                        backgroundColor: 'rgb(248, 250, 252)',
                        color: 'rgb(100, 116, 139)'
                      }}
                    >
                      8 members
                    </span>
                  </div>
                </div>
              </div>

              {/* Accessibility Features */}
              <div
                className="lg:col-span-2 rounded-xl border p-6"
                style={{ 
                  borderColor: 'rgb(226, 232, 240)',
                  backgroundColor: 'rgb(255, 255, 255)'
                }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Accessibility className="w-6 h-6" style={{ color: 'rgb(34, 139, 34)' }} />
                  <h3 className="font-semibold text-lg font-['Inter']" style={{ color: 'rgb(15, 23, 42)' }}>
                    Accessibility Features
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: 'rgb(34, 139, 34)' }}
                    />
                    <span className="text-sm font-['Inter']" style={{ color: 'rgb(100, 116, 139)' }}>
                      WCAG 2.1 AA compliant color contrast
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: 'rgb(34, 139, 34)' }}
                    />
                    <span className="text-sm font-['Inter']" style={{ color: 'rgb(100, 116, 139)' }}>
                      44px minimum touch targets
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: 'rgb(34, 139, 34)' }}
                    />
                    <span className="text-sm font-['Inter']" style={{ color: 'rgb(100, 116, 139)' }}>
                      Keyboard navigation support
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: 'rgb(34, 139, 34)' }}
                    />
                    <span className="text-sm font-['Inter']" style={{ color: 'rgb(100, 116, 139)' }}>
                      Screen reader optimized
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Optimization Notice */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div
          className="rounded-xl border p-6"
          style={{ 
            borderColor: 'rgb(226, 232, 240)',
            backgroundColor: 'rgb(248, 250, 252)'
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <Smartphone className="w-6 h-6" style={{ color: 'rgb(34, 139, 34)' }} />
            <h3 className="font-semibold text-lg font-['Inter']" style={{ color: 'rgb(15, 23, 42)' }}>
              Mobile-First Design
            </h3>
          </div>
          <p className="font-['Inter']" style={{ color: 'rgb(100, 116, 139)' }}>
            This design system prioritizes mobile experience with 90% of users on mobile devices. 
            All components are optimized for touch interaction and thumb-friendly navigation.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function DesignSystemDemo() {
  return <DesignSystem />
}