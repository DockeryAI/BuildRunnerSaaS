'use client'

import React from 'react'
import { Palette, Type, Spacing, Layers, Zap, Shield, Smartphone, Globe } from 'lucide-react'

interface DesignTokenProps {
  showCode?: boolean
}

interface ColorToken {
  name: string
  value: string
  usage: string
}

interface TypographyToken {
  name: string
  size: string
  weight: string
  usage: string
}

interface SpacingToken {
  name: string
  value: string
  usage: string
}

interface ComponentPattern {
  name: string
  description: string
  example: string
}

export function DesignSystem({ showCode = false }: DesignTokenProps = {}) {
  const [activeTab, setActiveTab] = React.useState('colors')

  const colorTokens: ColorToken[] = [
    { name: 'Primary', value: '#2D5A27', usage: 'Main brand color, primary actions' },
    { name: 'Primary Foreground', value: '#FFFFFF', usage: 'Text on primary background' },
    { name: 'Secondary', value: '#8B7355', usage: 'Secondary actions, earth tones' },
    { name: 'Accent', value: '#D97706', usage: 'Highlights, warnings, adventure spirit' },
    { name: 'Background', value: '#FEFEFE', usage: 'Main app background' },
    { name: 'Surface', value: '#F8F9FA', usage: 'Card and component backgrounds' },
    { name: 'Foreground', value: '#1F2937', usage: 'Primary text color' },
    { name: 'Border', value: '#E5E7EB', usage: 'Component borders, dividers' },
    { name: 'Muted', value: '#F1F5F4', usage: 'Subtle backgrounds, disabled states' },
    { name: 'Destructive', value: '#DC2626', usage: 'Error states, dangerous actions' }
  ]

  const typographyTokens: TypographyToken[] = [
    { name: 'Heading 1', size: '2.25rem', weight: '700', usage: 'Page titles' },
    { name: 'Heading 2', size: '1.875rem', weight: '600', usage: 'Section headers' },
    { name: 'Heading 3', size: '1.5rem', weight: '600', usage: 'Subsection headers' },
    { name: 'Body Large', size: '1.125rem', weight: '400', usage: 'Important body text' },
    { name: 'Body', size: '1rem', weight: '400', usage: 'Default body text' },
    { name: 'Body Small', size: '0.875rem', weight: '400', usage: 'Secondary text' },
    { name: 'Caption', size: '0.75rem', weight: '500', usage: 'Labels, captions' }
  ]

  const spacingTokens: SpacingToken[] = [
    { name: 'xs', value: '0.25rem (4px)', usage: 'Tight spacing' },
    { name: 'sm', value: '0.5rem (8px)', usage: 'Small gaps' },
    { name: 'md', value: '1rem (16px)', usage: 'Default spacing' },
    { name: 'lg', value: '1.5rem (24px)', usage: 'Section spacing' },
    { name: 'xl', value: '2rem (32px)', usage: 'Large gaps' },
    { name: '2xl', value: '3rem (48px)', usage: 'Component separation' }
  ]

  const componentPatterns: ComponentPattern[] = [
    {
      name: 'Adventure Card',
      description: 'Primary content card with outdoor-inspired styling',
      example: 'bg-surface border border-border rounded-xl shadow-sm hover:shadow-lg transition-all duration-300'
    },
    {
      name: 'Trail Button',
      description: 'Primary action button with adventure theme',
      example: 'bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 focus:ring-2 focus:ring-ring transition-all duration-150'
    },
    {
      name: 'Map Container',
      description: 'Full-width map interface container',
      example: 'w-full h-96 rounded-xl overflow-hidden border border-border shadow-md'
    },
    {
      name: 'Group Badge',
      description: 'Member status and role indicators',
      example: 'px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium'
    }
  ]

  const tabs = [
    { id: 'colors', label: 'Colors', icon: Palette },
    { id: 'typography', label: 'Typography', icon: Type },
    { id: 'spacing', label: 'Spacing', icon: Spacing },
    { id: 'components', label: 'Components', icon: Layers },
    { id: 'principles', label: 'Principles', icon: Zap }
  ]

  return (
    <div className="min-h-screen bg-background dark:bg-[#0F1419] font-sans transition-colors duration-300">
      <div className="bg-surface dark:bg-[#1A1F24] border-b border-border dark:border-[#374151] sticky top-0 z-50 backdrop-blur-sm bg-surface/95 dark:bg-[#1A1F24]/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary dark:bg-[#4ADE80] rounded-lg flex items-center justify-center shadow-sm">
                <Layers className="w-5 h-5 text-primary-foreground dark:text-[#0F1419]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground dark:text-[#F9FAFB]">Design System</h1>
                <p className="text-sm text-muted-foreground dark:text-[#9CA3AF]">Off-Road Trip Planner</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-primary/10 dark:bg-[#4ADE80]/10 text-primary dark:text-[#4ADE80] rounded-full text-sm font-medium">
                v1.0.0
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-[#4ADE80] hover:scale-[1.02] active:scale-[0.98] ${
                  activeTab === tab.id
                    ? 'bg-primary dark:bg-[#4ADE80] text-primary-foreground dark:text-[#0F1419] shadow-md'
                    : 'bg-surface dark:bg-[#1A1F24] text-muted-foreground dark:text-[#9CA3AF] hover:bg-muted dark:hover:bg-[#262B30] border border-border dark:border-[#374151]'
                }`}
                aria-label={`View ${tab.label} section`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {activeTab === 'colors' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground dark:text-[#F9FAFB] mb-4">Color Palette</h2>
              <p className="text-muted-foreground dark:text-[#9CA3AF] mb-6 text-lg leading-relaxed">
                Our color system reflects the rugged beauty of outdoor adventures while maintaining accessibility and brand consistency.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {colorTokens.map((token) => (
                <div key={token.name} className="bg-surface dark:bg-[#1A1F24] border border-border dark:border-[#374151] rounded-xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div 
                    className="w-full h-16 rounded-lg mb-4 border border-border dark:border-[#374151] shadow-inner"
                    style={{ backgroundColor: token.value }}
                    aria-label={`Color swatch for ${token.name}`}
                  />
                  <h3 className="font-semibold text-foreground dark:text-[#F9FAFB] mb-1">{token.name}</h3>
                  <p className="text-sm font-mono text-muted-foreground dark:text-[#9CA3AF] mb-2 bg-muted dark:bg-[#262B30] px-2 py-1 rounded">{token.value}</p>
                  <p className="text-sm text-muted-foreground dark:text-[#9CA3AF] leading-relaxed">{token.usage}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'typography' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground dark:text-[#F9FAFB] mb-4">Typography</h2>
              <p className="text-muted-foreground dark:text-[#9CA3AF] mb-6 text-lg leading-relaxed">
                Inter provides excellent readability across all devices, essential for outdoor conditions and mobile usage.
              </p>
            </div>

            <div className="bg-surface dark:bg-[#1A1F24] border border-border dark:border-[#374151] rounded-xl p-6 shadow-sm">
              <h3 className="font-semibold text-foreground dark:text-[#F9FAFB] mb-4">Font Family</h3>
              <p className="font-mono text-sm text-muted-foreground dark:text-[#9CA3AF] mb-6 bg-muted dark:bg-[#262B30] px-3 py-2 rounded">
                Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
              </p>
              
              <div className="space-y-6">
                {typographyTokens.map((token) => (
                  <div key={token.name} className="border-b border-border dark:border-[#374151] pb-6 last:border-b-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                      <h4 className="font-medium text-foreground dark:text-[#F9FAFB]">{token.name}</h4>
                      <div className="flex gap-4 text-sm text-muted-foreground dark:text-[#9CA3AF]">
                        <span className="bg-muted dark:bg-[#262B30] px-2 py-1 rounded">Size: {token.size}</span>
                        <span className="bg-muted dark:bg-[#262B30] px-2 py-1 rounded">Weight: {token.weight}</span>
                      </div>
                    </div>
                    <p 
                      className="text-foreground dark:text-[#F9FAFB] mb-3"
                      style={{ 
                        fontSize: token.size, 
                        fontWeight: token.weight 
                      }}
                    >
                      The quick brown fox jumps over the lazy dog
                    </p>
                    <p className="text-sm text-muted-foreground dark:text-[#9CA3AF] leading-relaxed">{token.usage}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'spacing' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground dark:text-[#F9FAFB] mb-4">Spacing System</h2>
              <p className="text-muted-foreground dark:text-[#9CA3AF] mb-6 text-lg leading-relaxed">
                Consistent spacing creates visual hierarchy and improves touch targets for mobile users.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {spacingTokens.map((token) => (
                <div key={token.name} className="bg-surface dark:bg-[#1A1F24] border border-border dark:border-[#374151] rounded-xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground dark:text-[#F9FAFB]">{token.name}</h3>
                    <span className="font-mono text-sm text-muted-foreground dark:text-[#9CA3AF] bg-muted dark:bg-[#262B30] px-2 py-1 rounded">{token.value}</span>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div 
                      className="bg-primary dark:bg-[#4ADE80] rounded shadow-sm"
                      style={{ 
                        width: token.value.split('(')[1]?.split('px')[0] + 'px' || '16px',
                        height: '16px'
                      }}
                      aria-label={`Spacing example for ${token.name}`}
                    />
                    <span className="text-sm text-muted-foreground dark:text-[#9CA3AF]">Visual representation</span>
                  </div>
                  <p className="text-sm text-muted-foreground dark:text-[#9CA3AF] leading-relaxed">{token.usage}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'components' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground dark:text-[#F9FAFB] mb-4">Component Patterns</h2>
              <p className="text-muted-foreground dark:text-[#9CA3AF] mb-6 text-lg leading-relaxed">
                Reusable patterns that embody our adventure-focused design philosophy.
              </p>
            </div>

            <div className="space-y-6">
              {componentPatterns.map((pattern) => (
                <div key={pattern.name} className="bg-surface dark:bg-[#1A1F24] border border-border dark:border-[#374151] rounded-xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <h3 className="font-semibold text-foreground dark:text-[#F9FAFB] mb-2">{pattern.name}</h3>
                  <p className="text-muted-foreground dark:text-[#9CA3AF] mb-4 leading-relaxed">{pattern.description}</p>
                  
                  {showCode && (
                    <div className="bg-muted dark:bg-[#262B30] rounded-lg p-4 mb-4">
                      <code className="text-sm font-mono text-foreground dark:text-[#F9FAFB] break-all">
                        className="{pattern.example}"
                      </code>
                    </div>
                  )}
                  
                  {pattern.name === 'Adventure Card' && (
                    <div className="mt-4">
                      <div className="bg-surface dark:bg-[#1A1F24] border border-border dark:border-[#374151] rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-4">
                        <h4 className="font-medium text-foreground dark:text-[#F9FAFB] mb-2">Example Adventure Card</h4>
                        <p className="text-sm text-muted-foreground dark:text-[#9CA3AF]">This is how the pattern looks in practice.</p>
                      </div>
                    </div>
                  )}
                  
                  {pattern.name === 'Trail Button' && (
                    <div className="mt-4">
                      <button className="bg-primary dark:bg-[#4ADE80] text-primary-foreground dark:text-[#0F1419] px-6 py-3 rounded-lg font-medium hover:bg-primary/90 dark:hover:bg-[#4ADE80]/90 focus:ring-2 focus:ring-ring dark:focus:ring-[#4ADE80] transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] focus:outline-none">
                        Example Trail Button
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'principles' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground dark:text-[#F9FAFB] mb-4">Design Principles</h2>
              <p className="text-muted-foreground dark:text-[#9CA3AF] mb-6 text-lg leading-relaxed">
                Core principles that guide our design decisions and ensure consistency across the platform.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-surface dark:bg-[#1A1F24] border border-border dark:border-[#374151] rounded-xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 dark:bg-[#4ADE80]/10 rounded-lg flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-primary dark:text-[#4ADE80]" />
                  </div>
                  <h3 className="font-semibold text-foreground dark:text-[#F9FAFB]">Mobile-First</h3>
                </div>
                <p className="text-muted-foreground dark:text-[#9CA3AF] leading-relaxed">
                  90% of our users are on mobile devices. Every design decision prioritizes mobile experience and touch interactions.
                </p>
              </div>

              <div className="bg-surface dark:bg-[#1A1F24] border border-border dark:border-[#374151] rounded-xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 dark:bg-[#4ADE80]/10 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary dark:text-[#4ADE80]" />
                  </div>
                  <h3 className="font-semibold text-foreground dark:text-[#F9FAFB]">Accessibility</h3>
                </div>
                <p className="text-muted-foreground dark:text-[#9CA3AF] leading-relaxed">
                  WCAG 2.1 AA compliance ensures our app works for everyone, including users with disabilities in outdoor environments.
                </p>
              </div>

              <div className="bg-surface dark:bg-[#1A1F24] border border-border dark:border-[#374151] rounded-xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 dark:bg-[#4ADE80]/10 rounded-lg flex items-center justify-center">
                    <Globe className="w-5 h-5 text-primary dark:text-[#4ADE80]" />
                  </div>
                  <h3 className="font-semibold text-foreground dark:text-[#F9FAFB]">Offline-Ready</h3>
                </div>
                <p className="text-muted-foreground dark:text-[#9CA3AF] leading-relaxed">
                  Outdoor adventures often lack reliable internet. Our design supports offline functionality and clear connection status.
                </p>
              </div>

              <div className="bg-surface dark:bg-[#1A1F24] border border-border dark:border-[#374151] rounded-xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 dark:bg-[#4ADE80]/10 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-primary dark:text-[#4ADE80]" />
                  </div>
                  <h3 className="font-semibold text-foreground dark:text-[#F9FAFB]">Performance</h3>
                </div>
                <p className="text-muted-foreground dark:text-[#9CA3AF] leading-relaxed">
                  Fast loading times and smooth interactions are crucial when planning time-sensitive outdoor activities.
                </p>
              </div>
            </div>

            <div className="bg-primary/5 dark:bg-[#4ADE80]/5 border border-primary/20 dark:border-[#4ADE80]/20 rounded-xl p-6">
              <h3 className="font-semibold text-foreground dark:text-[#F9FAFB] mb-4">Brand Personality</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary dark:bg-[#4ADE80] rounded-full mx-auto mb-3 flex items-center justify-center shadow-sm">
                    <span className="text-primary-foreground dark:text-[#0F1419] font-bold">A</span>
                  </div>
                  <p className="text-sm font-medium text-foreground dark:text-[#F9FAFB]">Adventurous</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-secondary dark:bg-[#A3906B] rounded-full mx-auto mb-3 flex items-center justify-center shadow-sm">
                    <span className="text-secondary-foreground dark:text-[#0F1419] font-bold">R</span>
                  </div>
                  <p className="text-sm font-medium text-foreground dark:text-[#F9FAFB]">Rugged</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-accent dark:bg-[#FB923C] rounded-full mx-auto mb-3 flex items-center justify-center shadow-sm">
                    <span className="text-accent-foreground dark:text-[#0F1419] font-bold">T</span>
                  </div>
                  <p className="text-sm font-medium text-foreground dark:text-[#F9FAFB]">Trustworthy</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary dark:bg-[#4ADE80] rounded-full mx-auto mb-3 flex items-center justify-center shadow-sm">
                    <span className="text-primary-foreground dark:text-[#0F1419] font-bold">C</span>
                  </div>
                  <p className="text-sm font-medium text-foreground dark:text-[#F9FAFB]">Community</p>
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