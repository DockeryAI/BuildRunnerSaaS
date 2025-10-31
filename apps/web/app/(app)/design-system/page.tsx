'use client';

import React, { useState, useEffect } from 'react';
import { Palette, Type, Spacing, CornerDownRight, Zap, Download, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Separator } from '../../../components/ui/separator';

interface DesignToken {
  name: string;
  value: string | number;
  type: 'color' | 'typography' | 'spacing' | 'radius' | 'shadow';
  category: string;
  description?: string;
}

interface TokenCollection {
  version: string;
  timestamp: string;
  checksum: string;
  tokens: {
    colors: Record<string, DesignToken>;
    typography: Record<string, DesignToken>;
    spacing: Record<string, DesignToken>;
    radius: Record<string, DesignToken>;
    shadows: Record<string, DesignToken>;
  };
  metadata: {
    totalTokens: number;
    lastSync: string;
  };
}

export default function DesignSystemPage() {
  const [tokens, setTokens] = useState<TokenCollection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('colors');

  useEffect(() => {
    loadDesignTokens();
  }, []);

  const loadDesignTokens = async () => {
    try {
      setIsLoading(true);
      
      // Mock design tokens - in production this would load from the actual tokens file
      const mockTokens: TokenCollection = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        checksum: 'abc123def456',
        tokens: {
          colors: {
            primary: {
              name: 'primary',
              value: '#3b82f6',
              type: 'color',
              category: 'colors',
              description: 'Primary brand color',
            },
            secondary: {
              name: 'secondary',
              value: '#64748b',
              type: 'color',
              category: 'colors',
              description: 'Secondary color',
            },
            background: {
              name: 'background',
              value: '#ffffff',
              type: 'color',
              category: 'colors',
              description: 'Background color',
            },
            foreground: {
              name: 'foreground',
              value: '#0f172a',
              type: 'color',
              category: 'colors',
              description: 'Foreground text color',
            },
            muted: {
              name: 'muted',
              value: '#f1f5f9',
              type: 'color',
              category: 'colors',
              description: 'Muted background color',
            },
            accent: {
              name: 'accent',
              value: '#f1f5f9',
              type: 'color',
              category: 'colors',
              description: 'Accent color',
            },
          },
          typography: {},
          spacing: {
            xs: {
              name: 'xs',
              value: '0.25rem',
              type: 'spacing',
              category: 'spacing',
              description: 'Extra small spacing',
            },
            sm: {
              name: 'sm',
              value: '0.5rem',
              type: 'spacing',
              category: 'spacing',
              description: 'Small spacing',
            },
            md: {
              name: 'md',
              value: '1rem',
              type: 'spacing',
              category: 'spacing',
              description: 'Medium spacing',
            },
            lg: {
              name: 'lg',
              value: '1.5rem',
              type: 'spacing',
              category: 'spacing',
              description: 'Large spacing',
            },
            xl: {
              name: 'xl',
              value: '2rem',
              type: 'spacing',
              category: 'spacing',
              description: 'Extra large spacing',
            },
          },
          radius: {
            none: {
              name: 'none',
              value: '0',
              type: 'radius',
              category: 'radius',
              description: 'No border radius',
            },
            sm: {
              name: 'sm',
              value: '0.25rem',
              type: 'radius',
              category: 'radius',
              description: 'Small border radius',
            },
            md: {
              name: 'md',
              value: '0.5rem',
              type: 'radius',
              category: 'radius',
              description: 'Medium border radius',
            },
            lg: {
              name: 'lg',
              value: '0.75rem',
              type: 'radius',
              category: 'radius',
              description: 'Large border radius',
            },
          },
          shadows: {},
        },
        metadata: {
          totalTokens: 12,
          lastSync: new Date().toISOString(),
        },
      };

      setTokens(mockTokens);
    } catch (error) {
      console.error('Failed to load design tokens:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'colors':
        return <Palette className="h-4 w-4" />;
      case 'typography':
        return <Type className="h-4 w-4" />;
      case 'spacing':
        return <Spacing className="h-4 w-4" />;
      case 'radius':
        return <CornerDownRight className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const renderColorToken = (token: DesignToken) => (
    <div key={token.name} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded border border-gray-300"
          style={{ backgroundColor: String(token.value) }}
        />
        <div>
          <div className="font-medium text-gray-900">{token.name}</div>
          <div className="text-sm text-gray-600">{token.description}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-mono text-sm text-gray-900">{String(token.value)}</div>
        <div className="text-xs text-gray-500">CSS: var(--color-{token.name})</div>
      </div>
    </div>
  );

  const renderSpacingToken = (token: DesignToken) => (
    <div key={token.name} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 border border-gray-300 rounded">
          <div
            className="bg-blue-500 rounded"
            style={{
              width: `${Math.min(parseFloat(String(token.value)) * 16, 24)}px`,
              height: `${Math.min(parseFloat(String(token.value)) * 16, 24)}px`,
            }}
          />
        </div>
        <div>
          <div className="font-medium text-gray-900">{token.name}</div>
          <div className="text-sm text-gray-600">{token.description}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-mono text-sm text-gray-900">{String(token.value)}</div>
        <div className="text-xs text-gray-500">CSS: var(--spacing-{token.name})</div>
      </div>
    </div>
  );

  const renderRadiusToken = (token: DesignToken) => (
    <div key={token.name} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 bg-blue-500 border border-gray-300"
          style={{ borderRadius: String(token.value) }}
        />
        <div>
          <div className="font-medium text-gray-900">{token.name}</div>
          <div className="text-sm text-gray-600">{token.description}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-mono text-sm text-gray-900">{String(token.value)}</div>
        <div className="text-xs text-gray-500">CSS: var(--radius-{token.name})</div>
      </div>
    </div>
  );

  const renderTokens = (category: string) => {
    if (!tokens) return null;

    const categoryTokens = tokens.tokens[category as keyof typeof tokens.tokens];
    const tokenEntries = Object.entries(categoryTokens);

    if (tokenEntries.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No {category} tokens found
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {tokenEntries.map(([name, token]) => {
          switch (category) {
            case 'colors':
              return renderColorToken(token);
            case 'spacing':
              return renderSpacingToken(token);
            case 'radius':
              return renderRadiusToken(token);
            default:
              return (
                <div key={name} className="p-3 border border-gray-200 rounded-lg">
                  <div className="font-medium">{token.name}</div>
                  <div className="text-sm text-gray-600">{String(token.value)}</div>
                </div>
              );
          }
        })}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Palette className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading Design System...</h1>
        </div>
      </div>
    );
  }

  const categories = [
    { id: 'colors', name: 'Colors', count: Object.keys(tokens?.tokens.colors || {}).length },
    { id: 'spacing', name: 'Spacing', count: Object.keys(tokens?.tokens.spacing || {}).length },
    { id: 'radius', name: 'Radius', count: Object.keys(tokens?.tokens.radius || {}).length },
    { id: 'typography', name: 'Typography', count: Object.keys(tokens?.tokens.typography || {}).length },
    { id: 'shadows', name: 'Shadows', count: Object.keys(tokens?.tokens.shadows || {}).length },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Design System</h1>
        <p className="text-gray-600">
          Design tokens and components synchronized with Figma
        </p>
      </div>

      {/* Stats */}
      {tokens && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-900">{tokens.metadata.totalTokens}</div>
              <div className="text-sm text-gray-600">Total Tokens</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-900">{tokens.checksum.substring(0, 8)}</div>
              <div className="text-sm text-gray-600">Checksum</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-900">{new Date(tokens.timestamp).toLocaleDateString()}</div>
              <div className="text-sm text-gray-600">Last Updated</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900">Sync Status</div>
                <div className="text-sm text-gray-600">Up to date</div>
              </div>
              <Badge variant="outline" className="text-green-600 bg-green-50">
                ✅ Synced
              </Badge>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Category Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-50 text-blue-900 border border-blue-200'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(category.id)}
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {category.count}
                    </Badge>
                  </button>
                ))}
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Export Tokens
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View in Figma
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Token Display */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {getCategoryIcon(selectedCategory)}
                  {categories.find(c => c.id === selectedCategory)?.name} Tokens
                </CardTitle>
                <Badge variant="outline">
                  {categories.find(c => c.id === selectedCategory)?.count} tokens
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {renderTokens(selectedCategory)}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
