import { NextRequest, NextResponse } from 'next/server';
import { PRDTemplate } from '@/components/templates/PRDTemplateLibrary';

const mockTemplates: PRDTemplate[] = [
  {
    id: 'saas-mvp',
    name: 'SaaS MVP Template',
    category: 'saas',
    description: 'Complete PRD template for building a SaaS MVP with authentication, billing, and core features',
    industry: ['B2B SaaS', 'Enterprise Software'],
    estimatedTime: '8-12 weeks',
    complexity: 'moderate',
    rating: 4.8,
    usageCount: 1247,
    isFavorite: false,
    tags: ['saas', 'mvp', 'authentication', 'billing', 'stripe'],
    techStack: ['React', 'Node.js', 'PostgreSQL', 'Stripe', 'Auth0'],
    sections: [
      { id: '1', title: 'Executive Summary', content: 'High-level overview of the SaaS product vision and market opportunity', order: 1 },
      { id: '2', title: 'User Authentication', content: 'Email/password login, OAuth, SSO integration, role-based access control', order: 2 },
      { id: '3', title: 'Subscription Management', content: 'Tiered pricing, Stripe integration, usage tracking, billing portal', order: 3 },
    ],
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  let filtered = mockTemplates;
  if (category && category !== 'all') {
    filtered = filtered.filter((t) => t.category === category);
  }
  return NextResponse.json(filtered);
}
