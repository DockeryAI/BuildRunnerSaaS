'use client'

import { useState } from 'react'
import { Palette, Type, Layout, Smartphone, Monitor, Tablet, Copy, Check } from 'lucide-react'

interface ColorSwatch {
  name: string
  value: string
  description: string
}

interface TypographyExample {
  size: string
  class: string
  weight: string
}

interface ComponentExample {
  name: string
  description: string
}

export function DesignSystem() {
  const [copiedColor, setCopiedColor] = useState<string | null>(null)

  const colors: ColorSwatch[] = [
    { name: 'Primary', value: 'rgb(34, 139, 34)', description: 'Main brand color for CTAs and highlights' },
    { name: 'Primary Foreground', value: 'rgb(255, 255, 255)', description: 'Text on primary backgrounds' },
    { name: 'Secondary', value: 'rgb(248, 250, 252)', description: 'Secondary backgrounds and surfaces' },
    { name: 'Accent', value: 'rgb(245, 158, 11)', description: 'Accent color for notifications and highlights' },
    { name: 'Background', value: 'rgb(255, 255, 255)', description: 'Main background color' },
    { name: 'Foreground', value: 'rgb(15, 23, 42)', description: 'Primary text color' },
    { name: 'Border', value: 'rgb(226, 232, 240)', description: 'Border and divider color' },
    { name: 'Muted', value: 'rgb(241, 245, 249)', description: 'Muted backgrounds and disabled states' },
    { name: 'Destructive', value: 'rgb(239, 68, 68)', description: 'Error and destructive actions' }
  ]

  const typography: TypographyExample[] = [
    { size: '3xl', class: 'text-3xl', weight: 'font-bold' },
    { size: '2xl', class: 'text-2xl', weight: 'font-bold' },
    { size: 'xl', class: 'text-xl', weight: 'font-semibold' },
    { size: 'lg', class: 'text-lg', weight: 'font-medium' },
    { size: 'base', class: 'text-base', weight: 'font-medium' },
    { size: 'sm', class: 'text-sm', weight: 'font-medium' },
    { size: 'xs', class: 'text-xs', weight: 'font-medium' }
  ]

  const components: ComponentExample[] = [
    { name: 'Button Primary', description: 'Main action buttons' },
    { name: 'Button Secondary', description: 'Secondary actions' },
    { name: 'Card', description: 'Content containers' },
    { name: 'Input', description: 'Form inputs' },
    { name: 'Badge', description: 'Status indicators' }
  ]

  const copyToClipboard = async (text: string, colorName: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedColor(colorName)
      setTimeout(() => setCopiedColor(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-[rgb(226,232,240)] bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[rgb(34,139,34)] rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-[rgb(15,23,42)]">Design System</h1>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-[rgb(15,23,42)]" />
              <span className="text-sm font-medium text-[rgb(15,23,42)]">Mobile-First</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Brand Overview */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-[rgb(15,23,42)] mb-4">Brand Personality</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Adventurous', 'Rugged', 'Trustworthy', 'Community-focused'].map((trait) => (
              <div key={trait} className="p-4 bg-[rgb(248,250,252)] rounded-lg border border-[rgb(226,232,240)]">
                <span className="text-sm font-medium text-[rgb(15,23,42)]">{trait}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Color Palette */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Palette className="w-6 h-6 text-[rgb(34,139,34)]" />
            <h2 className="text-2xl font-bold text-[rgb(15,23,42)]">Color Palette</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {colors.map((color) => (
              <div key={color.name} className="p-4 bg-white rounded-lg border border-[rgb(226,232,240)] shadow-sm">
                <div 
                  className="w-full h-16 rounded-lg mb-3 border border-[rgb(226,232,240)]"
                  style={{ backgroundColor: color.value }}
                />
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-[rgb(15,23,42)]">{color.name}</h3>
                  <button
                    onClick={() => copyToClipboard(color.value, color.name)}
                    className="p-1 hover:bg-[rgb(241,245,249)] rounded transition-colors"
                    aria-label={`Copy ${color.name} color value`}
                  >
                    {copiedColor === color.name ? (
                      <Check className="w-4 h-4 text-[rgb(34,139,34)]" />
                    ) : (
                      <Copy className="w-4 h-4 text-[rgb(15,23,42)]" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-[rgb(15,23,42)] opacity-70 mb-2">{color.description}</p>
                <code className="text-xs bg-[rgb(241,245,249)] px-2 py-1 rounded font-mono">
                  {color.value}
                </code>
              </div>
            ))}
          </div>
        </section>

        {/* Typography */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Type className="w-6 h-6 text-[rgb(34,139,34)]" />
            <h2 className="text-2xl font-bold text-[rgb(15,23,42)]">Typography</h2>
          </div>
          <div className="bg-white rounded-lg border border-[rgb(226,232,240)] p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-[rgb(15,23,42)] mb-2">Font Family</h3>
              <p className="text-base font-medium text-[rgb(15,23,42)]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                Inter, system-ui, sans-serif
              </p>
              <p className="text-sm font-medium text-[rgb(15,23,42)] mt-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                JetBrains Mono, monospace (code)
              </p>
            </div>
            <div className="space-y-4">
              {typography.map((typo) => (
                <div key={typo.size} className="flex items-center gap-4 p-3 hover:bg-[rgb(248,250,252)] rounded-lg">
                  <div className="w-12 text-xs text-[rgb(15,23,42)] opacity-70">{typo.size}</div>
                  <div className={`${typo.class} ${typo.weight} text-[rgb(15,23,42)] flex-1`}>
                    The quick brown fox jumps over the lazy dog
                  </div>
                  <code className="text-xs bg-[rgb(241,245,249)] px-2 py-1 rounded font-mono">
                    {typo.class} {typo.weight}
                  </code>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Component Examples */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Layout className="w-6 h-6 text-[rgb(34,139,34)]" />
            <h2 className="text-2xl font-bold text-[rgb(15,23,42)]">Components</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Buttons */}
            <div className="bg-white rounded-lg border border-[rgb(226,232,240)] p-6">
              <h3 className="text-lg font-semibold text-[rgb(15,23,42)] mb-4">Buttons</h3>
              <div className="space-y-3">
                <button className="w-full px-4 py-3 bg-[rgb(34,139,34)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity">
                  Primary Button
                </button>
                <button className="w-full px-4 py-3 bg-[rgb(248,250,252)] text-[rgb(15,23,42)] rounded-lg font-medium border border-[rgb(226,232,240)] hover:bg-[rgb(241,245,249)] transition-colors">
                  Secondary Button
                </button>
                <button className="w-full px-4 py-3 bg-[rgb(239,68,68)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity">
                  Destructive Button
                </button>
              </div>
            </div>

            {/* Form Elements */}
            <div className="bg-white rounded-lg border border-[rgb(226,232,240)] p-6">
              <h3 className="text-lg font-semibold text-[rgb(15,23,42)] mb-4">Form Elements</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Enter text..."
                  className="w-full px-3 py-3 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent"
                />
                <select className="w-full px-3 py-3 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent">
                  <option>Select option...</option>
                  <option>Option 1</option>
                  <option>Option 2</option>
                </select>
                <div className="flex gap-2">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-[rgb(34,139,34)] text-white">
                    Active
                  </span>
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-[rgb(245,158,11)] text-white">
                    Warning
                  </span>
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-[rgb(241,245,249)] text-[rgb(15,23,42)]">
                    Muted
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Responsive Breakpoints */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Monitor className="w-6 h-6 text-[rgb(34,139,34)]" />
            <h2 className="text-2xl font-bold text-[rgb(15,23,42)]">Responsive Breakpoints</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg border border-[rgb(226,232,240)]">
              <div className="flex items-center gap-2 mb-2">
                <Smartphone className="w-5 h-5 text-[rgb(34,139,34)]" />
                <h3 className="font-semibold text-[rgb(15,23,42)]">Mobile</h3>
              </div>
              <p className="text-sm text-[rgb(15,23,42)] opacity-70 mb-2">Default (0px+)</p>
              <code className="text-xs bg-[rgb(241,245,249)] px-2 py-1 rounded font-mono">
                Mobile-first approach
              </code>
            </div>
            <div className="p-4 bg-white rounded-lg border border-[rgb(226,232,240)]">
              <div className="flex items-center gap-2 mb-2">
                <Tablet className="w-5 h-5 text-[rgb(34,139,34)]" />
                <h3 className="font-semibold text-[rgb(15,23,42)]">Tablet</h3>
              </div>
              <p className="text-sm text-[rgb(15,23,42)] opacity-70 mb-2">768px+</p>
              <code className="text-xs bg-[rgb(241,245,249)] px-2 py-1 rounded font-mono">
                md:
              </code>
            </div>
            <div className="p-4 bg-white rounded-lg border border-[rgb(226,232,240)]">
              <div className="flex items-center gap-2 mb-2">
                <Monitor className="w-5 h-5 text-[rgb(34,139,34)]" />
                <h3 className="font-semibold text-[rgb(15,23,42)]">Desktop</h3>
              </div>
              <p className="text-sm text-[rgb(15,23,42)] opacity-70 mb-2">1024px+</p>
              <code className="text-xs bg-[rgb(241,245,249)] px-2 py-1 rounded font-mono">
                lg:
              </code>
            </div>
          </div>
        </section>

        {/* Spacing System */}
        <section>
          <h2 className="text-2xl font-bold text-[rgb(15,23,42)] mb-6">Spacing System</h2>
          <div className="bg-white rounded-lg border border-[rgb(226,232,240)] p-6">
            <p className="text-sm text-[rgb(15,23,42)] opacity-70 mb-4">8px base unit system</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'xs', value: '2px', class: 'p-0.5' },
                { name: 'sm', value: '4px', class: 'p-1' },
                { name: 'base', value: '8px', class: 'p-2' },
                { name: 'md', value: '16px', class: 'p-4' },
                { name: 'lg', value: '24px', class: 'p-6' },
                { name: 'xl', value: '32px', class: 'p-8' }
              ].map((space) => (
                <div key={space.name} className="text-center">
                  <div className="bg-[rgb(34,139,34)] mx-auto mb-2" style={{ width: space.value, height: space.value }} />
                  <div className="text-xs font-medium text-[rgb(15,23,42)]">{space.name}</div>
                  <div className="text-xs text-[rgb(15,23,42)] opacity-70">{space.value}</div>
                  <code className="text-xs bg-[rgb(241,245,249)] px-1 py-0.5 rounded font-mono">
                    {space.class}
                  </code>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default function DesignSystemDemo() {
  return <DesignSystem />
}