'use client';

import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  Save, 
  Eye, 
  Palette, 
  Type, 
  Image, 
  Mail, 
  Download,
  RefreshCw,
  Check,
  X,
  AlertTriangle,
  Paintbrush,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react';

interface BrandingConfig {
  logo_url?: string;
  favicon_url?: string;
  brand_name?: string;
  theme: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      foreground: string;
      muted: string;
      border: string;
    };
    typography: {
      font_family: string;
      heading_weight: string;
      body_weight: string;
    };
    radius: string;
  };
  email_templates: {
    welcome: string;
    invite: string;
    invoice: string;
    report: string;
  };
  custom_css?: string;
}

const defaultTheme: BrandingConfig['theme'] = {
  colors: {
    primary: '#3B82F6',
    secondary: '#64748B',
    accent: '#F59E0B',
    background: '#FFFFFF',
    foreground: '#0F172A',
    muted: '#F8FAFC',
    border: '#E2E8F0',
  },
  typography: {
    font_family: 'Inter',
    heading_weight: '600',
    body_weight: '400',
  },
  radius: '0.5rem',
};

const fontOptions = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Source Sans Pro',
  'Nunito',
];

const radiusOptions = [
  { label: 'None', value: '0' },
  { label: 'Small', value: '0.25rem' },
  { label: 'Medium', value: '0.5rem' },
  { label: 'Large', value: '0.75rem' },
  { label: 'Extra Large', value: '1rem' },
];

export default function BrandingPage() {
  const [branding, setBranding] = useState<BrandingConfig>({
    theme: defaultTheme,
    email_templates: {
      welcome: '',
      invite: '',
      invoice: '',
      report: '',
    },
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'logo' | 'emails' | 'css'>('colors');

  // Load current branding configuration
  useEffect(() => {
    loadBranding();
  }, []);

  const loadBranding = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/branding');
      const data = await response.json();
      
      if (data.branding) {
        setBranding({
          ...branding,
          ...data.branding,
          theme: { ...defaultTheme, ...data.branding.theme },
        });
      }
    } catch (error) {
      console.error('Error loading branding:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const response = await fetch('/api/branding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(branding),
      });
      
      if (response.ok) {
        // Show success message
        console.log('Branding saved successfully');
        
        // Apply theme to current page
        applyThemeToPage();
      }
    } catch (error) {
      console.error('Error saving branding:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('logo', file);

    try {
      const response = await fetch('/api/branding/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      if (data.url) {
        setBranding(prev => ({ ...prev, logo_url: data.url }));
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
    }
  };

  const handleColorChange = (colorKey: string, value: string) => {
    setBranding(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        colors: {
          ...prev.theme.colors,
          [colorKey]: value,
        },
      },
    }));
  };

  const handleTypographyChange = (key: string, value: string) => {
    setBranding(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        typography: {
          ...prev.theme.typography,
          [key]: value,
        },
      },
    }));
  };

  const handleEmailTemplateChange = (template: string, value: string) => {
    setBranding(prev => ({
      ...prev,
      email_templates: {
        ...prev.email_templates,
        [template]: value,
      },
    }));
  };

  const applyThemeToPage = () => {
    const root = document.documentElement;
    const colors = branding.theme.colors;
    
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--secondary', colors.secondary);
    root.style.setProperty('--accent', colors.accent);
    root.style.setProperty('--background', colors.background);
    root.style.setProperty('--foreground', colors.foreground);
    root.style.setProperty('--muted', colors.muted);
    root.style.setProperty('--border', colors.border);
    root.style.setProperty('--radius', branding.theme.radius);
    root.style.setProperty('--font-family', branding.theme.typography.font_family);
  };

  const resetToDefault = () => {
    setBranding({
      theme: defaultTheme,
      email_templates: {
        welcome: '',
        invite: '',
        invoice: '',
        report: '',
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Paintbrush className="h-8 w-8 animate-pulse mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading branding settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Brand Customization</h1>
              <p className="text-gray-600 mt-2">Customize your tenant's branding and appearance</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Preview Mode Toggle */}
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setPreviewMode('desktop')}
                  className={`p-2 rounded ${previewMode === 'desktop' ? 'bg-white shadow-sm' : ''}`}
                >
                  <Monitor className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPreviewMode('tablet')}
                  className={`p-2 rounded ${previewMode === 'tablet' ? 'bg-white shadow-sm' : ''}`}
                >
                  <Tablet className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPreviewMode('mobile')}
                  className={`p-2 rounded ${previewMode === 'mobile' ? 'bg-white shadow-sm' : ''}`}
                >
                  <Smartphone className="h-4 w-4" />
                </button>
              </div>
              
              <button
                onClick={resetToDefault}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Reset</span>
              </button>
              
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'colors', label: 'Colors', icon: Palette },
                    { id: 'typography', label: 'Typography', icon: Type },
                    { id: 'logo', label: 'Logo & Assets', icon: Image },
                    { id: 'emails', label: 'Email Templates', icon: Mail },
                    { id: 'css', label: 'Custom CSS', icon: Paintbrush },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'colors' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Color Palette</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(branding.theme.colors).map(([key, value]) => (
                        <div key={key} className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700 capitalize">
                            {key.replace('_', ' ')}
                          </label>
                          <div className="flex items-center space-x-3">
                            <input
                              type="color"
                              value={value}
                              onChange={(e) => handleColorChange(key, e.target.value)}
                              className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={value}
                              onChange={(e) => handleColorChange(key, e.target.value)}
                              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'typography' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Typography</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
                        <select
                          value={branding.theme.typography.font_family}
                          onChange={(e) => handleTypographyChange('font_family', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {fontOptions.map(font => (
                            <option key={font} value={font}>{font}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Border Radius</label>
                        <select
                          value={branding.theme.radius}
                          onChange={(e) => setBranding(prev => ({
                            ...prev,
                            theme: { ...prev.theme, radius: e.target.value }
                          }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {radiusOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'logo' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Logo & Assets</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Brand Name</label>
                        <input
                          type="text"
                          value={branding.brand_name || ''}
                          onChange={(e) => setBranding(prev => ({ ...prev, brand_name: e.target.value }))}
                          placeholder="Your Brand Name"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
                        <div className="flex items-center space-x-4">
                          {branding.logo_url && (
                            <img
                              src={branding.logo_url}
                              alt="Logo"
                              className="w-16 h-16 object-contain border border-gray-300 rounded"
                            />
                          )}
                          <label className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
                            <Upload className="h-4 w-4" />
                            <span>Upload Logo</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleLogoUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'emails' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Email Templates</h3>
                    
                    <div className="space-y-4">
                      {Object.entries(branding.email_templates).map(([template, content]) => (
                        <div key={template}>
                          <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                            {template} Email Template
                          </label>
                          <textarea
                            value={content}
                            onChange={(e) => handleEmailTemplateChange(template, e.target.value)}
                            rows={4}
                            placeholder={`Enter ${template} email template...`}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'css' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900">Custom CSS</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional CSS (Advanced)
                      </label>
                      <textarea
                        value={branding.custom_css || ''}
                        onChange={(e) => setBranding(prev => ({ ...prev, custom_css: e.target.value }))}
                        rows={12}
                        placeholder="/* Enter custom CSS here */"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-sm text-gray-600 mt-2">
                        Add custom CSS to further customize your brand appearance. Use with caution.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Live Preview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border sticky top-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <Eye className="h-5 w-5 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Live Preview</h3>
                </div>
              </div>
              
              <div className="p-6">
                <div 
                  className={`border border-gray-300 rounded-lg overflow-hidden ${
                    previewMode === 'mobile' ? 'w-64 mx-auto' :
                    previewMode === 'tablet' ? 'w-80 mx-auto' :
                    'w-full'
                  }`}
                  style={{
                    fontFamily: branding.theme.typography.font_family,
                    '--primary': branding.theme.colors.primary,
                    '--background': branding.theme.colors.background,
                    '--foreground': branding.theme.colors.foreground,
                    '--radius': branding.theme.radius,
                  } as React.CSSProperties}
                >
                  {/* Preview Header */}
                  <div 
                    className="px-4 py-3 border-b"
                    style={{ 
                      backgroundColor: branding.theme.colors.primary,
                      color: branding.theme.colors.background 
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      {branding.logo_url && (
                        <img
                          src={branding.logo_url}
                          alt="Logo"
                          className="w-8 h-8 object-contain"
                        />
                      )}
                      <span className="font-semibold">
                        {branding.brand_name || 'Your Brand'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Preview Content */}
                  <div 
                    className="p-4 space-y-3"
                    style={{ 
                      backgroundColor: branding.theme.colors.background,
                      color: branding.theme.colors.foreground 
                    }}
                  >
                    <h4 className="font-semibold">Dashboard</h4>
                    <div 
                      className="p-3 rounded border"
                      style={{ 
                        backgroundColor: branding.theme.colors.muted,
                        borderColor: branding.theme.colors.border,
                        borderRadius: branding.theme.radius 
                      }}
                    >
                      <p className="text-sm">Sample content with your branding</p>
                    </div>
                    <button
                      className="px-3 py-2 text-sm font-medium text-white rounded"
                      style={{ 
                        backgroundColor: branding.theme.colors.primary,
                        borderRadius: branding.theme.radius 
                      }}
                    >
                      Primary Button
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
