import { type TemplatePack } from './schemas';

/**
 * Predefined composable packs for common functionality
 */
export const BUILT_IN_PACKS: Omit<TemplatePack, 'id' | 'created_at' | 'updated_at' | 'installs_count'>[] = [
  {
    slug: 'nextjs-auth-supabase',
    title: 'Next.js + Supabase Authentication',
    description: 'Complete authentication system with Supabase including login, signup, password reset, and protected routes',
    json_patch: [
      {
        op: 'add',
        path: '/milestones/-',
        value: {
          id: 'tpl(nextjs-auth-supabase):p1',
          title: 'Authentication System',
          steps: [
            {
              id: 'tpl(nextjs-auth-supabase):p1.s1',
              title: 'Supabase Setup',
              microsteps: [
                {
                  id: 'tpl(nextjs-auth-supabase):p1.s1.ms1',
                  title: 'Configure Supabase client',
                  status: 'todo',
                  criteria: [
                    'Supabase project created',
                    'Environment variables configured',
                    'Supabase client initialized'
                  ]
                },
                {
                  id: 'tpl(nextjs-auth-supabase):p1.s1.ms2',
                  title: 'Setup auth tables and policies',
                  status: 'todo',
                  criteria: [
                    'User profiles table created',
                    'RLS policies configured',
                    'Auth triggers setup'
                  ]
                }
              ]
            },
            {
              id: 'tpl(nextjs-auth-supabase):p1.s2',
              title: 'Auth Components',
              microsteps: [
                {
                  id: 'tpl(nextjs-auth-supabase):p1.s2.ms1',
                  title: 'Create login component',
                  status: 'todo',
                  criteria: [
                    'Login form with email/password',
                    'Social login options',
                    'Error handling implemented'
                  ]
                },
                {
                  id: 'tpl(nextjs-auth-supabase):p1.s2.ms2',
                  title: 'Create signup component',
                  status: 'todo',
                  criteria: [
                    'Signup form with validation',
                    'Email confirmation flow',
                    'Terms of service acceptance'
                  ]
                },
                {
                  id: 'tpl(nextjs-auth-supabase):p1.s2.ms3',
                  title: 'Password reset flow',
                  status: 'todo',
                  criteria: [
                    'Forgot password form',
                    'Reset password page',
                    'Email templates configured'
                  ]
                }
              ]
            },
            {
              id: 'tpl(nextjs-auth-supabase):p1.s3',
              title: 'Protected Routes',
              microsteps: [
                {
                  id: 'tpl(nextjs-auth-supabase):p1.s3.ms1',
                  title: 'Auth middleware',
                  status: 'todo',
                  criteria: [
                    'Route protection middleware',
                    'Redirect logic implemented',
                    'Session management'
                  ]
                },
                {
                  id: 'tpl(nextjs-auth-supabase):p1.s3.ms2',
                  title: 'User profile management',
                  status: 'todo',
                  criteria: [
                    'Profile page created',
                    'Update profile functionality',
                    'Avatar upload support'
                  ]
                }
              ]
            }
          ]
        }
      }
    ],
    tags: ['nextjs', 'supabase', 'authentication', 'auth'],
    author_id: 'system',
    is_public: true,
    is_featured: true,
    dependencies: [],
    conflicts: ['firebase-auth', 'auth0-auth'],
  },
  {
    slug: 'stripe-billing',
    title: 'Stripe Billing & Subscriptions',
    description: 'Complete billing system with Stripe including subscription management, payment processing, and webhooks',
    json_patch: [
      {
        op: 'add',
        path: '/milestones/-',
        value: {
          id: 'tpl(stripe-billing):p1',
          title: 'Billing System',
          steps: [
            {
              id: 'tpl(stripe-billing):p1.s1',
              title: 'Stripe Integration',
              microsteps: [
                {
                  id: 'tpl(stripe-billing):p1.s1.ms1',
                  title: 'Configure Stripe SDK',
                  status: 'todo',
                  criteria: [
                    'Stripe account setup',
                    'API keys configured',
                    'Stripe SDK initialized'
                  ]
                },
                {
                  id: 'tpl(stripe-billing):p1.s1.ms2',
                  title: 'Create subscription products',
                  status: 'todo',
                  criteria: [
                    'Products created in Stripe',
                    'Pricing tiers configured',
                    'Webhook endpoints setup'
                  ]
                }
              ]
            },
            {
              id: 'tpl(stripe-billing):p1.s2',
              title: 'Payment Components',
              microsteps: [
                {
                  id: 'tpl(stripe-billing):p1.s2.ms1',
                  title: 'Pricing page',
                  status: 'todo',
                  criteria: [
                    'Pricing table component',
                    'Feature comparison',
                    'CTA buttons implemented'
                  ]
                },
                {
                  id: 'tpl(stripe-billing):p1.s2.ms2',
                  title: 'Checkout flow',
                  status: 'todo',
                  criteria: [
                    'Stripe Checkout integration',
                    'Payment success page',
                    'Error handling'
                  ]
                },
                {
                  id: 'tpl(stripe-billing):p1.s2.ms3',
                  title: 'Billing dashboard',
                  status: 'todo',
                  criteria: [
                    'Subscription status display',
                    'Payment history',
                    'Cancel/upgrade options'
                  ]
                }
              ]
            }
          ]
        }
      }
    ],
    tags: ['stripe', 'billing', 'payments', 'subscriptions'],
    author_id: 'system',
    is_public: true,
    is_featured: true,
    dependencies: [],
    conflicts: ['paypal-billing', 'paddle-billing'],
  },
  {
    slug: 'email-onboarding',
    title: 'Email Onboarding & Notifications',
    description: 'Email system with onboarding sequences, transactional emails, and notification preferences',
    json_patch: [
      {
        op: 'add',
        path: '/milestones/-',
        value: {
          id: 'tpl(email-onboarding):p1',
          title: 'Email System',
          steps: [
            {
              id: 'tpl(email-onboarding):p1.s1',
              title: 'Email Service Setup',
              microsteps: [
                {
                  id: 'tpl(email-onboarding):p1.s1.ms1',
                  title: 'Configure email provider',
                  status: 'todo',
                  criteria: [
                    'Email service provider chosen',
                    'SMTP/API credentials configured',
                    'Domain verification completed'
                  ]
                },
                {
                  id: 'tpl(email-onboarding):p1.s1.ms2',
                  title: 'Email templates',
                  status: 'todo',
                  criteria: [
                    'Welcome email template',
                    'Onboarding sequence templates',
                    'Transactional email templates'
                  ]
                }
              ]
            },
            {
              id: 'tpl(email-onboarding):p1.s2',
              title: 'Onboarding Flow',
              microsteps: [
                {
                  id: 'tpl(email-onboarding):p1.s2.ms1',
                  title: 'Welcome sequence',
                  status: 'todo',
                  criteria: [
                    'Day 0: Welcome email',
                    'Day 1: Getting started guide',
                    'Day 7: Feature highlights'
                  ]
                },
                {
                  id: 'tpl(email-onboarding):p1.s2.ms2',
                  title: 'User preferences',
                  status: 'todo',
                  criteria: [
                    'Email preference center',
                    'Unsubscribe handling',
                    'Frequency controls'
                  ]
                }
              ]
            }
          ]
        }
      }
    ],
    tags: ['email', 'onboarding', 'notifications', 'marketing'],
    author_id: 'system',
    is_public: true,
    is_featured: true,
    dependencies: [],
    conflicts: [],
  },
  {
    slug: 'analytics-metrics',
    title: 'Analytics & Metrics Tracking',
    description: 'Comprehensive analytics with user tracking, event logging, and dashboard metrics',
    json_patch: [
      {
        op: 'add',
        path: '/milestones/-',
        value: {
          id: 'tpl(analytics-metrics):p1',
          title: 'Analytics System',
          steps: [
            {
              id: 'tpl(analytics-metrics):p1.s1',
              title: 'Analytics Setup',
              microsteps: [
                {
                  id: 'tpl(analytics-metrics):p1.s1.ms1',
                  title: 'Configure analytics providers',
                  status: 'todo',
                  criteria: [
                    'Google Analytics 4 setup',
                    'Custom event tracking',
                    'Privacy compliance'
                  ]
                },
                {
                  id: 'tpl(analytics-metrics):p1.s1.ms2',
                  title: 'User behavior tracking',
                  status: 'todo',
                  criteria: [
                    'Page view tracking',
                    'User interaction events',
                    'Conversion funnel setup'
                  ]
                }
              ]
            },
            {
              id: 'tpl(analytics-metrics):p1.s2',
              title: 'Metrics Dashboard',
              microsteps: [
                {
                  id: 'tpl(analytics-metrics):p1.s2.ms1',
                  title: 'Admin analytics dashboard',
                  status: 'todo',
                  criteria: [
                    'Key metrics display',
                    'Real-time user count',
                    'Revenue tracking'
                  ]
                },
                {
                  id: 'tpl(analytics-metrics):p1.s2.ms2',
                  title: 'User insights',
                  status: 'todo',
                  criteria: [
                    'User journey mapping',
                    'Feature usage analytics',
                    'Retention metrics'
                  ]
                }
              ]
            }
          ]
        }
      }
    ],
    tags: ['analytics', 'metrics', 'tracking', 'dashboard'],
    author_id: 'system',
    is_public: true,
    is_featured: true,
    dependencies: [],
    conflicts: [],
  },
  {
    slug: 'blog-docs',
    title: 'Blog & Documentation',
    description: 'Content management system with blog, documentation, and SEO optimization',
    json_patch: [
      {
        op: 'add',
        path: '/milestones/-',
        value: {
          id: 'tpl(blog-docs):p1',
          title: 'Content Management',
          steps: [
            {
              id: 'tpl(blog-docs):p1.s1',
              title: 'Blog System',
              microsteps: [
                {
                  id: 'tpl(blog-docs):p1.s1.ms1',
                  title: 'Blog post management',
                  status: 'todo',
                  criteria: [
                    'Markdown blog posts',
                    'Author management',
                    'Category and tag system'
                  ]
                },
                {
                  id: 'tpl(blog-docs):p1.s1.ms2',
                  title: 'Blog frontend',
                  status: 'todo',
                  criteria: [
                    'Blog listing page',
                    'Individual post pages',
                    'Search functionality'
                  ]
                }
              ]
            },
            {
              id: 'tpl(blog-docs):p1.s2',
              title: 'Documentation',
              microsteps: [
                {
                  id: 'tpl(blog-docs):p1.s2.ms1',
                  title: 'Documentation structure',
                  status: 'todo',
                  criteria: [
                    'Hierarchical docs organization',
                    'Navigation sidebar',
                    'Search within docs'
                  ]
                },
                {
                  id: 'tpl(blog-docs):p1.s2.ms2',
                  title: 'SEO optimization',
                  status: 'todo',
                  criteria: [
                    'Meta tags and descriptions',
                    'Sitemap generation',
                    'Open Graph tags'
                  ]
                }
              ]
            }
          ]
        }
      }
    ],
    tags: ['blog', 'documentation', 'content', 'seo'],
    author_id: 'system',
    is_public: true,
    is_featured: true,
    dependencies: [],
    conflicts: [],
  },
];

/**
 * Initialize built-in packs in the database
 */
export async function seedBuiltInPacks() {
  const { TemplateStorage } = await import('./storage');
  
  for (const packData of BUILT_IN_PACKS) {
    try {
      // Check if pack already exists
      const existing = await TemplateStorage.getPack(packData.slug);
      if (!existing) {
        await TemplateStorage.createPack(packData);
        console.log(`Created built-in pack: ${packData.slug}`);
      }
    } catch (error) {
      console.error(`Failed to create pack ${packData.slug}:`, error);
    }
  }
}

/**
 * Get pack recommendations based on existing plan
 */
export function getPackRecommendations(currentPlan: any): string[] {
  const recommendations: string[] = [];
  
  // Analyze current plan to suggest relevant packs
  const planText = JSON.stringify(currentPlan).toLowerCase();
  
  if (!planText.includes('auth') && !planText.includes('login')) {
    recommendations.push('nextjs-auth-supabase');
  }
  
  if (!planText.includes('billing') && !planText.includes('payment')) {
    recommendations.push('stripe-billing');
  }
  
  if (!planText.includes('email') && !planText.includes('notification')) {
    recommendations.push('email-onboarding');
  }
  
  if (!planText.includes('analytics') && !planText.includes('tracking')) {
    recommendations.push('analytics-metrics');
  }
  
  if (!planText.includes('blog') && !planText.includes('documentation')) {
    recommendations.push('blog-docs');
  }
  
  return recommendations;
}

/**
 * Check for pack conflicts
 */
export function checkPackConflicts(selectedPacks: string[]): { conflicts: string[]; warnings: string[] } {
  const conflicts: string[] = [];
  const warnings: string[] = [];
  
  for (const packSlug of selectedPacks) {
    const pack = BUILT_IN_PACKS.find(p => p.slug === packSlug);
    if (pack) {
      // Check for conflicts with other selected packs
      const conflictingPacks = selectedPacks.filter(slug => 
        pack.conflicts.includes(slug) && slug !== packSlug
      );
      
      if (conflictingPacks.length > 0) {
        conflicts.push(`${packSlug} conflicts with: ${conflictingPacks.join(', ')}`);
      }
      
      // Check for missing dependencies
      const missingDeps = pack.dependencies.filter(dep => !selectedPacks.includes(dep));
      if (missingDeps.length > 0) {
        warnings.push(`${packSlug} requires: ${missingDeps.join(', ')}`);
      }
    }
  }
  
  return { conflicts, warnings };
}
