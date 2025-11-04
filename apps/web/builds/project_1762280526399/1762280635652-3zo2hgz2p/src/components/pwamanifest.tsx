'use client'

import { useEffect, useState } from 'react'

interface PWAManifestProps {
  appName?: string;
  shortName?: string;
  description?: string;
  themeColor?: string;
  backgroundColor?: string;
  startUrl?: string;
  display?: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
  orientation?: 'portrait' | 'landscape' | 'any';
  scope?: string;
}

interface ManifestIcon {
  src: string;
  sizes: string;
  type: string;
  purpose?: string;
}

export function PWAManifest({
  appName = 'OffRoad Planner',
  shortName = 'OffRoad',
  description = 'Plan and organize your off-roading adventures with friends',
  themeColor = '#228B22',
  backgroundColor = '#FFFFFF',
  startUrl = '/',
  display = 'standalone',
  orientation = 'portrait',
  scope = '/'
}: PWAManifestProps = {}) {
  const [isInstallable, setIsInstallable] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  const manifestData = {
    name: appName,
    short_name: shortName,
    description: description,
    start_url: startUrl,
    display: display,
    orientation: orientation,
    theme_color: themeColor,
    background_color: backgroundColor,
    scope: scope,
    icons: [
      {
        src: '/icons/icon-72x72.png',
        sizes: '72x72',
        type: 'image/png',
        purpose: 'maskable any'
      },
      {
        src: '/icons/icon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
        purpose: 'maskable any'
      },
      {
        src: '/icons/icon-128x128.png',
        sizes: '128x128',
        type: 'image/png',
        purpose: 'maskable any'
      },
      {
        src: '/icons/icon-144x144.png',
        sizes: '144x144',
        type: 'image/png',
        purpose: 'maskable any'
      },
      {
        src: '/icons/icon-152x152.png',
        sizes: '152x152',
        type: 'image/png',
        purpose: 'maskable any'
      },
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable any'
      },
      {
        src: '/icons/icon-384x384.png',
        sizes: '384x384',
        type: 'image/png',
        purpose: 'maskable any'
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable any'
      }
    ] as ManifestIcon[],
    categories: ['travel', 'outdoor', 'social', 'productivity'],
    lang: 'en-US',
    dir: 'ltr'
  }

  useEffect(() => {
    // Create and inject manifest
    const manifestBlob = new Blob([JSON.stringify(manifestData, null, 2)], {
      type: 'application/json'
    })
    const manifestURL = URL.createObjectURL(manifestBlob)
    
    let manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement
    if (!manifestLink) {
      manifestLink = document.createElement('link')
      manifestLink.rel = 'manifest'
      document.head.appendChild(manifestLink)
    }
    manifestLink.href = manifestURL

    // Set theme color
    let themeColorMeta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement
    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta')
      themeColorMeta.name = 'theme-color'
      document.head.appendChild(themeColorMeta)
    }
    themeColorMeta.content = themeColor

    // Set apple-mobile-web-app-capable
    let appleMeta = document.querySelector('meta[name="apple-mobile-web-app-capable"]') as HTMLMetaElement
    if (!appleMeta) {
      appleMeta = document.createElement('meta')
      appleMeta.name = 'apple-mobile-web-app-capable'
      document.head.appendChild(appleMeta)
    }
    appleMeta.content = 'yes'

    // Set apple-mobile-web-app-status-bar-style
    let appleStatusMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]') as HTMLMetaElement
    if (!appleStatusMeta) {
      appleStatusMeta = document.createElement('meta')
      appleStatusMeta.name = 'apple-mobile-web-app-status-bar-style'
      document.head.appendChild(appleStatusMeta)
    }
    appleStatusMeta.content = 'default'

    // Handle install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    const handleAppInstalled = () => {
      setIsInstallable(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      URL.revokeObjectURL(manifestURL)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [manifestData, themeColor])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setIsInstallable(false)
      setDeferredPrompt(null)
    }
  }

  const isStandalone = () => {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone ||
           document.referrer.includes('android-app://')
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isInstallable && !isStandalone() && (
        <div 
          className="bg-white border border-[rgb(226,232,240)] rounded-lg shadow-lg p-4 max-w-sm"
          role="dialog"
          aria-labelledby="install-prompt-title"
          aria-describedby="install-prompt-description"
        >
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-[rgb(34,139,34)] rounded-lg flex items-center justify-center flex-shrink-0">
              <svg 
                className="w-6 h-6 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 18l9-5-9-5-9 5 9 5z" 
                />
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 12l0 6" 
                />
              </svg>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 
                id="install-prompt-title"
                className="text-sm font-semibold text-[rgb(15,23,42)] mb-1"
              >
                Install {shortName}
              </h3>
              <p 
                id="install-prompt-description"
                className="text-xs text-[rgb(100,116,139)] mb-3"
              >
                Add to your home screen for quick access and offline use
              </p>
              
              <div className="flex gap-2">
                <button
                  onClick={handleInstallClick}
                  className="px-3 py-1.5 bg-[rgb(34,139,34)] text-white text-xs font-medium rounded-md hover:bg-[rgb(34,139,34)]/90 transition-colors focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:ring-offset-2"
                  aria-label="Install application"
                >
                  Install
                </button>
                <button
                  onClick={() => setIsInstallable(false)}
                  className="px-3 py-1.5 bg-[rgb(248,250,252)] text-[rgb(15,23,42)] text-xs font-medium rounded-md hover:bg-[rgb(241,245,249)] transition-colors focus:outline-none focus:ring-2 focus:ring-[rgb(226,232,240)] focus:ring-offset-2"
                  aria-label="Dismiss install prompt"
                >
                  Later
                </button>
              </div>
            </div>
            
            <button
              onClick={() => setIsInstallable(false)}
              className="text-[rgb(100,116,139)] hover:text-[rgb(15,23,42)] transition-colors focus:outline-none focus:ring-2 focus:ring-[rgb(226,232,240)] rounded p-1"
              aria-label="Close install prompt"
            >
              <svg 
                className="w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      {isStandalone() && (
        <div className="bg-[rgb(34,139,34)] text-white px-3 py-2 rounded-lg text-xs font-medium shadow-md">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            App Mode
          </div>
        </div>
      )}
    </div>
  )
}

// Demo component showing PWA manifest configuration
export default function PWAManifestDemo() {
  const [config, setConfig] = useState({
    appName: 'OffRoad Planner',
    shortName: 'OffRoad',
    description: 'Plan and organize your off-roading adventures with friends',
    themeColor: '#228B22',
    backgroundColor: '#FFFFFF'
  })

  return (
    <div className="min-h-screen bg-[rgb(248,250,252)] p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md border border-[rgb(226,232,240)] p-6 mb-6">
          <h1 className="text-2xl font-bold text-[rgb(15,23,42)] mb-2">
            PWA Manifest Configuration
          </h1>
          <p className="text-[rgb(100,116,139)] mb-6">
            Configure your Progressive Web App settings for optimal mobile experience
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                  App Name
                </label>
                <input
                  type="text"
                  value={config.appName}
                  onChange={(e) => setConfig(prev => ({ ...prev, appName: e.target.value }))}
                  className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                  Short Name
                </label>
                <input
                  type="text"
                  value={config.shortName}
                  onChange={(e) => setConfig(prev => ({ ...prev, shortName: e.target.value }))}
                  className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                  Description
                </label>
                <textarea
                  value={config.description}
                  onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                  Theme Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={config.themeColor}
                    onChange={(e) => setConfig(prev => ({ ...prev, themeColor: e.target.value }))}
                    className="w-12 h-10 border border-[rgb(226,232,240)] rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.themeColor}
                    onChange={(e) => setConfig(prev => ({ ...prev, themeColor: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-[rgb(226,232,240)] rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-[rgb(248,250,252)] rounded-lg p-4">
                <h3 className="font-semibold text-[rgb(15,23,42)] mb-3">PWA Features</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[rgb(34,139,34)] rounded-full"></div>
                    <span>Offline functionality</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[rgb(34,139,34)] rounded-full"></div>
                    <span>Add to home screen</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[rgb(34,139,34)] rounded-full"></div>
                    <span>App-like experience</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[rgb(34,139,34)] rounded-full"></div>
                    <span>Push notifications</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-[rgb(34,139,34)] rounded-full"></div>
                    <span>Background sync</span>
                  </div>
                </div>
              </div>

              <div className="bg-[rgb(245,158,11)]/10 border border-[rgb(245,158,11)]/20 rounded-lg p-4">
                <h4 className="font-medium text-[rgb(15,23,42)] mb-2">Installation Tip</h4>
                <p className="text-sm text-[rgb(100,116,139)]">
                  The install prompt will appear automatically when PWA criteria are met. 
                  Users can also install manually through their browser menu.
                </p>
              </div>
            </div>
          </div>
        </div>

        <PWAManifest {...config} />
      </div>
    </div>
  )
}