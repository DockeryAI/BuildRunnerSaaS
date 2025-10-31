'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Package,
  Star,
  TrendingUp,
  Plus,
  Grid,
  List,
  Download,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { TemplateCard } from '../../../components/templates/TemplateCard';
import { type TemplateDef, type TemplatePack } from '../../../lib/templates/schemas';

type ViewMode = 'grid' | 'list';
type FilterTab = 'all' | 'templates' | 'packs' | 'featured';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<TemplateDef[]>([]);
  const [packs, setPacks] = useState<TemplatePack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  useEffect(() => {
    loadTemplatesAndPacks();
  }, []);

  const loadTemplatesAndPacks = async () => {
    try {
      setIsLoading(true);
      
      // In production, these would be API calls
      // For now, use mock data
      const mockTemplates: TemplateDef[] = [
        {
          id: '1',
          slug: 'nextjs-starter',
          title: 'Next.js Starter Template',
          description: 'A complete Next.js starter template with TypeScript, Tailwind CSS, and basic project structure',
          json_spec: { title: 'Next.js Starter', milestones: [] },
          version: '1.0.0',
          tags: ['nextjs', 'typescript', 'starter'],
          installs_count: 1250,
          author_id: 'system',
          is_public: true,
          is_featured: true,
          created_at: '2024-01-15T00:00:00Z',
          updated_at: '2024-01-15T00:00:00Z',
        },
        {
          id: '2',
          slug: 'react-dashboard',
          title: 'React Admin Dashboard',
          description: 'Complete admin dashboard with charts, tables, and user management',
          json_spec: { title: 'React Dashboard', milestones: [] },
          version: '2.1.0',
          tags: ['react', 'dashboard', 'admin'],
          installs_count: 890,
          author_id: 'community',
          is_public: true,
          is_featured: false,
          created_at: '2024-02-01T00:00:00Z',
          updated_at: '2024-02-01T00:00:00Z',
        },
      ];

      const mockPacks: TemplatePack[] = [
        {
          id: '3',
          slug: 'nextjs-auth-supabase',
          title: 'Next.js + Supabase Authentication',
          description: 'Complete authentication system with Supabase including login, signup, password reset, and protected routes',
          json_patch: [],
          tags: ['nextjs', 'supabase', 'authentication'],
          installs_count: 2100,
          author_id: 'system',
          is_public: true,
          is_featured: true,
          dependencies: [],
          conflicts: ['firebase-auth'],
          created_at: '2024-01-10T00:00:00Z',
          updated_at: '2024-01-10T00:00:00Z',
        },
        {
          id: '4',
          slug: 'stripe-billing',
          title: 'Stripe Billing & Subscriptions',
          description: 'Complete billing system with Stripe including subscription management and webhooks',
          json_patch: [],
          tags: ['stripe', 'billing', 'payments'],
          installs_count: 1680,
          author_id: 'system',
          is_public: true,
          is_featured: true,
          dependencies: [],
          conflicts: ['paypal-billing'],
          created_at: '2024-01-12T00:00:00Z',
          updated_at: '2024-01-12T00:00:00Z',
        },
      ];

      setTemplates(mockTemplates);
      setPacks(mockPacks);
    } catch (error) {
      console.error('Failed to load templates and packs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstall = (id: string, type: 'template' | 'pack') => {
    // Navigate to import page with selected item
    window.location.href = `/templates/import?${type}=${id}`;
  };

  const handleViewDetails = (id: string, type: 'template' | 'pack') => {
    // Navigate to details page
    window.location.href = `/templates/${type}/${id}`;
  };

  const filteredItems = () => {
    let items: (TemplateDef | TemplatePack)[] = [];
    
    switch (activeFilter) {
      case 'templates':
        items = templates;
        break;
      case 'packs':
        items = packs;
        break;
      case 'featured':
        items = [...templates, ...packs].filter(item => item.is_featured);
        break;
      default:
        items = [...templates, ...packs];
    }

    // Apply search filter
    if (searchQuery) {
      items = items.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      items = items.filter(item =>
        selectedTags.some(tag => item.tags.includes(tag))
      );
    }

    return items;
  };

  const allTags = [...new Set([...templates, ...packs].flatMap(item => item.tags))];

  const filterTabs = [
    { id: 'all', label: 'All', count: templates.length + packs.length },
    { id: 'templates', label: 'Templates', count: templates.length },
    { id: 'packs', label: 'Packs', count: packs.length },
    { id: 'featured', label: 'Featured', count: [...templates, ...packs].filter(item => item.is_featured).length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Templates & Packs</h1>
          <p className="text-gray-600">Discover and install templates and composable packs for your projects</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/templates/import">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Import
            </Button>
          </Link>
          <Link href="/templates/publish">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Publish Template
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates and packs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as FilterTab)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeFilter === tab.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                {tab.label}
                <Badge variant="outline" className="ml-2">
                  {tab.count}
                </Badge>
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${
                viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md ${
                viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tag Filters */}
        {allTags.length > 0 && (
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {allTags.slice(0, 10).map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    if (selectedTags.includes(tag)) {
                      setSelectedTags(selectedTags.filter(t => t !== tag));
                    } else {
                      setSelectedTags([...selectedTags, tag]);
                    }
                  }}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-blue-100 text-blue-700 border-blue-300'
                      : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600">
                {filteredItems().length} {filteredItems().length === 1 ? 'item' : 'items'} found
              </p>
            </div>

            {filteredItems().length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
              }>
                {filteredItems().map((item) => (
                  <TemplateCard
                    key={item.id}
                    template={'json_spec' in item ? item : undefined}
                    pack={'json_patch' in item ? item : undefined}
                    onInstall={handleInstall}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Popular Tags */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-800 mb-3">Popular Tags</h3>
        <div className="flex flex-wrap gap-2">
          {['nextjs', 'react', 'typescript', 'authentication', 'billing', 'dashboard'].map((tag) => (
            <Badge key={tag} variant="outline" className="text-blue-700 border-blue-300">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
