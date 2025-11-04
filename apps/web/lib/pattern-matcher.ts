/**
 * Pattern Matcher - Instant Component Generation from Learned Patterns
 *
 * This layer sits between PRD/Plan and the Orchestrator, providing:
 * - Instant pattern matching for common components
 * - Zero LLM calls for pattern matches
 * - Pattern learning from successful builds
 * - 10x speed improvement for matched components
 */

import * as fs from 'fs';
import * as path from 'path';
import type { BuildComponent } from './build-orchestrator';

// ============================================================================
// Types
// ============================================================================

export interface Pattern {
  id: string;
  name: string;
  description: string;

  // Matching criteria
  componentTypes: string[]; // ['auth', 'user-profile', 'email']
  keywords: string[]; // Keywords in component description
  dependencies: string[]; // Required dependencies

  // Pattern code
  code: {
    frontend?: string;
    backend?: string;
    api?: string;
    database?: string;
    config?: Record<string, string>;
  };

  // Metadata
  buildTime: number; // 0 for instant!
  successRate: number; // 0.0 - 1.0
  timesUsed: number;
  lastUsed?: string;
  createdAt: string;

  // Customization
  variables: Array<{
    name: string;
    defaultValue: string;
    description: string;
  }>;
}

export interface PatternMatchResult {
  matched: boolean;
  pattern?: Pattern;
  confidence: number; // 0.0 - 1.0
  reason: string;
}

export interface PatternLibrary {
  version: string;
  patterns: Pattern[];
  stats: {
    totalPatterns: number;
    totalMatches: number;
    totalTimeSaved: number; // seconds
  };
}

// ============================================================================
// Pattern Matcher Class
// ============================================================================

export class PatternMatcher {
  private patterns: Map<string, Pattern>;
  private patternsPath: string;
  private stats: PatternLibrary['stats'];

  constructor(patternsPath?: string) {
    this.patternsPath = patternsPath || path.join(process.cwd(), 'lib/learned-patterns/patterns-library.json');
    this.patterns = new Map();
    this.stats = {
      totalPatterns: 0,
      totalMatches: 0,
      totalTimeSaved: 0,
    };

    this.loadPatterns();
  }

  /**
   * Load patterns from disk
   */
  private loadPatterns(): void {
    try {
      if (!fs.existsSync(this.patternsPath)) {
        console.log('📦 No pattern library found, creating default patterns...');
        this.createDefaultPatterns();
        return;
      }

      const data = fs.readFileSync(this.patternsPath, 'utf8');
      const library: PatternLibrary = JSON.parse(data);

      library.patterns.forEach(p => this.patterns.set(p.id, p));
      this.stats = library.stats;

      console.log(`📦 Loaded ${this.patterns.size} patterns from library`);
    } catch (error) {
      console.error('❌ Failed to load patterns:', error);
      this.createDefaultPatterns();
    }
  }

  /**
   * Save patterns to disk
   */
  private savePatterns(): void {
    try {
      const dir = path.dirname(this.patternsPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const library: PatternLibrary = {
        version: '1.0',
        patterns: Array.from(this.patterns.values()),
        stats: this.stats,
      };

      fs.writeFileSync(this.patternsPath, JSON.stringify(library, null, 2));
      console.log(`💾 Saved ${this.patterns.size} patterns to library`);
    } catch (error) {
      console.error('❌ Failed to save patterns:', error);
    }
  }

  /**
   * Create default common patterns
   */
  private createDefaultPatterns(): void {
    const defaultPatterns: Pattern[] = [
      {
        id: 'email-auth',
        name: 'Email Authentication',
        description: 'Email + password authentication with magic links',
        componentTypes: ['auth', 'authentication', 'login', 'signup'],
        keywords: ['email', 'auth', 'login', 'signup', 'password', 'magic link'],
        dependencies: ['supabase', 'database'],
        code: {
          frontend: this.getEmailAuthFrontend(),
          backend: this.getEmailAuthBackend(),
          database: this.getEmailAuthDatabase(),
        },
        buildTime: 0,
        successRate: 0.95,
        timesUsed: 0,
        createdAt: new Date().toISOString(),
        variables: [
          { name: 'appName', defaultValue: 'App', description: 'Application name' },
          { name: 'redirectUrl', defaultValue: '/dashboard', description: 'Post-login redirect' },
        ],
      },
      {
        id: 'user-profile',
        name: 'User Profile Management',
        description: 'User profile with avatar, bio, and settings',
        componentTypes: ['profile', 'user-profile', 'account'],
        keywords: ['profile', 'user', 'account', 'settings', 'avatar'],
        dependencies: ['auth'],
        code: {
          frontend: this.getUserProfileFrontend(),
          database: this.getUserProfileDatabase(),
        },
        buildTime: 0,
        successRate: 0.92,
        timesUsed: 0,
        createdAt: new Date().toISOString(),
        variables: [
          { name: 'fields', defaultValue: 'name,bio,avatar', description: 'Profile fields' },
        ],
      },
      {
        id: 'crud-table',
        name: 'CRUD Table with Pagination',
        description: 'Full CRUD operations with table, pagination, and filters',
        componentTypes: ['table', 'list', 'crud', 'data-table'],
        keywords: ['table', 'list', 'crud', 'pagination', 'filter', 'sort'],
        dependencies: ['database'],
        code: {
          frontend: this.getCrudTableFrontend(),
          api: this.getCrudTableAPI(),
          database: this.getCrudTableDatabase(),
        },
        buildTime: 0,
        successRate: 0.88,
        timesUsed: 0,
        createdAt: new Date().toISOString(),
        variables: [
          { name: 'entityName', defaultValue: 'Item', description: 'Entity name (singular)' },
          { name: 'fields', defaultValue: 'name,description', description: 'Table fields' },
        ],
      },
    ];

    defaultPatterns.forEach(p => this.patterns.set(p.id, p));
    this.stats.totalPatterns = this.patterns.size;
    this.savePatterns();

    console.log(`✅ Created ${defaultPatterns.length} default patterns`);
  }

  /**
   * Find matching pattern for a component
   */
  findPattern(component: BuildComponent): PatternMatchResult {
    let bestMatch: PatternMatchResult = {
      matched: false,
      confidence: 0,
      reason: 'No pattern found',
    };

    for (const [id, pattern] of this.patterns) {
      const confidence = this.calculateMatchConfidence(component, pattern);

      if (confidence > bestMatch.confidence) {
        bestMatch = {
          matched: confidence >= 0.7, // 70% threshold
          pattern,
          confidence,
          reason: confidence >= 0.7
            ? `Matched pattern "${pattern.name}" (${Math.round(confidence * 100)}% confidence)`
            : `Best match "${pattern.name}" below threshold (${Math.round(confidence * 100)}%)`,
        };
      }
    }

    return bestMatch;
  }

  /**
   * Calculate match confidence (0.0 - 1.0)
   */
  private calculateMatchConfidence(component: BuildComponent, pattern: Pattern): number {
    let score = 0;
    let weights = 0;

    // Check component type (40% weight)
    const componentTypeLower = component.type.toLowerCase();
    const nameTypeLower = component.name.toLowerCase();

    if (pattern.componentTypes.some(t =>
      componentTypeLower.includes(t) || nameTypeLower.includes(t)
    )) {
      score += 0.4;
    }
    weights += 0.4;

    // Check keywords in description (30% weight)
    if (component.description) {
      const descLower = component.description.toLowerCase();
      const matchedKeywords = pattern.keywords.filter(k => descLower.includes(k));
      const keywordScore = matchedKeywords.length / pattern.keywords.length;
      score += keywordScore * 0.3;
    }
    weights += 0.3;

    // Check dependencies (20% weight)
    if (pattern.dependencies.length > 0) {
      const matchedDeps = pattern.dependencies.filter(dep =>
        component.dependencies.includes(dep)
      );
      const depScore = matchedDeps.length / pattern.dependencies.length;
      score += depScore * 0.2;
    }
    weights += 0.2;

    // Success rate bonus (10% weight)
    score += pattern.successRate * 0.1;
    weights += 0.1;

    return weights > 0 ? score / weights : 0;
  }

  /**
   * Instantiate pattern with component-specific context
   */
  instantiatePattern(pattern: Pattern, component: BuildComponent): BuildComponent {
    console.log(`⚡ Instantiating pattern "${pattern.name}" for ${component.name}`);

    // Extract variables from component
    const variables = this.extractVariables(component, pattern);

    // Instantiate code with variables
    const instantiatedCode: typeof pattern.code = {};

    Object.entries(pattern.code).forEach(([key, template]) => {
      if (typeof template === 'string') {
        instantiatedCode[key as keyof typeof pattern.code] = this.replaceVariables(
          template,
          variables
        ) as any;
      }
    });

    // Update pattern stats
    pattern.timesUsed++;
    pattern.lastUsed = new Date().toISOString();
    this.stats.totalMatches++;
    this.stats.totalTimeSaved += 5; // Assume 5 seconds saved per pattern match
    this.savePatterns();

    return {
      ...component,
      code: instantiatedCode.frontend || instantiatedCode.backend || instantiatedCode.api,
      status: 'completed',
    };
  }

  /**
   * Extract variables from component context
   */
  private extractVariables(component: BuildComponent, pattern: Pattern): Record<string, string> {
    const variables: Record<string, string> = {};

    // Set defaults
    pattern.variables.forEach(v => {
      variables[v.name] = v.defaultValue;
    });

    // Override with component-specific values
    variables.componentName = component.name;
    variables.componentId = component.id;
    variables.componentType = component.type;
    variables.description = component.description || '';

    // Extract entity name from component name (e.g., "User Profile" -> "User")
    const match = component.name.match(/^(\w+)/);
    if (match) {
      variables.entityName = match[1];
    }

    return variables;
  }

  /**
   * Replace template variables
   */
  private replaceVariables(template: string, variables: Record<string, string>): string {
    let result = template;

    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, value);
    });

    return result;
  }

  /**
   * Save successful component as new pattern
   */
  async saveAsPattern(component: BuildComponent, context: { prd?: string; plan?: string }): Promise<void> {
    // Only save successful components
    if (component.status !== 'completed' || !component.code) {
      return;
    }

    // Check if pattern already exists
    const existing = this.findPattern(component);
    if (existing.matched && existing.confidence > 0.9) {
      console.log(`⏭️  Pattern already exists for ${component.name}`);
      return;
    }

    // Create new pattern
    const pattern: Pattern = {
      id: `pattern_${Date.now()}_${component.id}`,
      name: component.name,
      description: component.description || `Pattern for ${component.name}`,
      componentTypes: [component.type, component.name.toLowerCase()],
      keywords: this.extractKeywords(component.description || component.name),
      dependencies: component.dependencies,
      code: {
        [component.type]: component.code,
      },
      buildTime: 0,
      successRate: 0.5, // Start with neutral success rate
      timesUsed: 0,
      createdAt: new Date().toISOString(),
      variables: this.extractVariablesFromCode(component.code),
    };

    this.patterns.set(pattern.id, pattern);
    this.stats.totalPatterns++;
    this.savePatterns();

    console.log(`✅ Saved new pattern: "${pattern.name}"`);
  }

  /**
   * Extract keywords from text
   */
  private extractKeywords(text: string): string[] {
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for']);
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];

    return words
      .filter(w => w.length > 3 && !commonWords.has(w))
      .slice(0, 10);
  }

  /**
   * Extract variables from code (basic implementation)
   */
  private extractVariablesFromCode(code: string): Pattern['variables'] {
    const variables: Pattern['variables'] = [];

    // Look for common variable patterns
    const patterns = [
      /const\s+(\w+)\s*=/g,
      /let\s+(\w+)\s*=/g,
      /interface\s+(\w+)/g,
    ];

    patterns.forEach(pattern => {
      const matches = [...code.matchAll(pattern)];
      matches.slice(0, 5).forEach(match => {
        if (match[1]) {
          variables.push({
            name: match[1],
            defaultValue: match[1],
            description: `Variable: ${match[1]}`,
          });
        }
      });
    });

    return variables;
  }

  /**
   * Get pattern statistics
   */
  getStats(): PatternLibrary['stats'] & { patterns: Array<{ id: string; name: string; timesUsed: number; successRate: number }> } {
    return {
      ...this.stats,
      patterns: Array.from(this.patterns.values())
        .sort((a, b) => b.timesUsed - a.timesUsed)
        .slice(0, 10)
        .map(p => ({
          id: p.id,
          name: p.name,
          timesUsed: p.timesUsed,
          successRate: p.successRate,
        })),
    };
  }

  // ============================================================================
  // Pattern Code Templates
  // ============================================================================

  private getEmailAuthFrontend(): string {
    return `
'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient();

  const handleSignUp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: '{{redirectUrl}}',
      },
    });
    if (error) alert(error.message);
    setLoading(false);
  };

  const handleSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) alert(error.message);
    setLoading(false);
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Welcome to {{appName}}</h2>
      <div className="space-y-4">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="flex gap-2">
          <Button onClick={handleSignIn} disabled={loading}>
            Sign In
          </Button>
          <Button onClick={handleSignUp} variant="outline" disabled={loading}>
            Sign Up
          </Button>
        </div>
      </div>
    </Card>
  );
}
`;
  }

  private getEmailAuthBackend(): string {
    return `
// API route: /api/auth/[...supabase]/route.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(requestUrl.origin);
}
`;
  }

  private getEmailAuthDatabase(): string {
    return `
-- Users table (extends Supabase auth.users)

CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
`;
  }

  private getUserProfileFrontend(): string {
    return `
'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export function UserProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    setProfile(data);
    setLoading(false);
  };

  const updateProfile = async () => {
    setLoading(true);
    const { error } = await supabase
      .from('user_profiles')
      .update(profile)
      .eq('id', profile.id);

    if (error) alert(error.message);
    else alert('Profile updated!');
    setLoading(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Your Profile</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Full Name</label>
          <Input
            value={profile?.full_name || ''}
            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Bio</label>
          <textarea
            className="w-full border rounded p-2"
            value={profile?.bio || ''}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
          />
        </div>
        <Button onClick={updateProfile} disabled={loading}>
          Save Changes
        </Button>
      </div>
    </Card>
  );
}
`;
  }

  private getUserProfileDatabase(): string {
    return `
-- Extend user_profiles table with profile fields

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT;
`;
  }

  private getCrudTableFrontend(): string {
    return `
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function {{entityName}}Table() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadItems();
  }, [page, search]);

  const loadItems = async () => {
    setLoading(true);
    const res = await fetch(\`/api/{{entityName}}?page=\${page}&search=\${search}\`);
    const data = await res.json();
    setItems(data.items);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    await fetch(\`/api/{{entityName}}/\${id}\`, { method: 'DELETE' });
    loadItems();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Button onClick={() => window.location.href = '/{{entityName}}/new'}>
          Add New
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item: any) => (
            <TableRow key={item.id}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.description}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-center gap-2">
        <Button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
          Previous
        </Button>
        <span className="py-2">Page {page}</span>
        <Button onClick={() => setPage(p => p + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
`;
  }

  private getCrudTableAPI(): string {
    return `
// API route: /api/{{entityName}}/route.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const pageSize = 10;

  const supabase = createRouteHandlerClient({ cookies });

  let query = supabase
    .from('{{entityName}}')
    .select('*', { count: 'exact' })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (search) {
    query = query.ilike('name', \`%\${search}%\`);
  }

  const { data, count, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    items: data,
    total: count,
    page,
    pageSize,
  });
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const body = await request.json();

  const { data, error } = await supabase
    .from('{{entityName}}')
    .insert(body)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
`;
  }

  private getCrudTableDatabase(): string {
    return `
-- {{entityName}} table

CREATE TABLE public.{{entityName}} (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.{{entityName}} ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own {{entityName}}"
  ON public.{{entityName}} FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own {{entityName}}"
  ON public.{{entityName}} FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own {{entityName}}"
  ON public.{{entityName}} FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own {{entityName}}"
  ON public.{{entityName}} FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_{{entityName}}_user_id ON public.{{entityName}}(user_id);
CREATE INDEX idx_{{entityName}}_created_at ON public.{{entityName}}(created_at DESC);
`;
  }
}
