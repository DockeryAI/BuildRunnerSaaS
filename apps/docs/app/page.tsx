'use client';

import React from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Code, 
  Terminal, 
  Zap, 
  Shield, 
  BarChart3,
  ArrowRight,
  Github,
  ExternalLink
} from 'lucide-react';

export default function DocsHomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">BR</span>
                </div>
                <span className="text-xl font-bold text-gray-900">BuildRunner</span>
                <span className="text-sm text-gray-500 ml-2">Docs</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="https://app.buildrunner.com" 
                className="text-gray-600 hover:text-gray-900 flex items-center space-x-1"
              >
                <span>Dashboard</span>
                <ExternalLink className="h-4 w-4" />
              </Link>
              <Link 
                href="https://github.com/buildrunner/buildrunner" 
                className="text-gray-600 hover:text-gray-900"
              >
                <Github className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            BuildRunner Documentation
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Everything you need to build, deploy, and manage projects with BuildRunner. 
            From quickstart guides to advanced integrations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/quickstart"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <span>Get Started</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link 
              href="/api-reference"
              className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
            >
              <Code className="h-4 w-4" />
              <span>API Reference</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Navigation */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Explore the Documentation
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Quickstart */}
            <Link href="/quickstart" className="group">
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-xl border border-green-200 hover:shadow-lg transition-all duration-200 group-hover:scale-105">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Quickstart</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Get up and running with BuildRunner in minutes. Create your first project and deploy.
                </p>
                <div className="flex items-center text-green-600 font-medium">
                  <span>Start building</span>
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* API Reference */}
            <Link href="/api-reference" className="group">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-xl border border-blue-200 hover:shadow-lg transition-all duration-200 group-hover:scale-105">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Code className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">API Reference</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Complete API documentation with interactive examples and code snippets.
                </p>
                <div className="flex items-center text-blue-600 font-medium">
                  <span>Explore APIs</span>
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* CLI Guide */}
            <Link href="/cli" className="group">
              <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-6 rounded-xl border border-purple-200 hover:shadow-lg transition-all duration-200 group-hover:scale-105">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                    <Terminal className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">CLI Guide</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Master the BuildRunner CLI with commands, examples, and automation tips.
                </p>
                <div className="flex items-center text-purple-600 font-medium">
                  <span>Learn CLI</span>
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* SDK */}
            <Link href="/sdk" className="group">
              <div className="bg-gradient-to-br from-orange-50 to-amber-100 p-6 rounded-xl border border-orange-200 hover:shadow-lg transition-all duration-200 group-hover:scale-105">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">TypeScript SDK</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Type-safe SDK for JavaScript and TypeScript with comprehensive examples.
                </p>
                <div className="flex items-center text-orange-600 font-medium">
                  <span>Use SDK</span>
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Governance */}
            <Link href="/governance" className="group">
              <div className="bg-gradient-to-br from-red-50 to-rose-100 p-6 rounded-xl border border-red-200 hover:shadow-lg transition-all duration-200 group-hover:scale-105">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Governance</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Security, compliance, and governance features for enterprise teams.
                </p>
                <div className="flex items-center text-red-600 font-medium">
                  <span>Learn more</span>
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            {/* Analytics */}
            <Link href="/analytics" className="group">
              <div className="bg-gradient-to-br from-teal-50 to-cyan-100 p-6 rounded-xl border border-teal-200 hover:shadow-lg transition-all duration-200 group-hover:scale-105">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Analytics</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Monitor performance, costs, and usage with detailed analytics and reporting.
                </p>
                <div className="flex items-center text-teal-600 font-medium">
                  <span>View analytics</span>
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Guides */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Popular Guides
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                <Link href="/guides/sync-plan-open-pr" className="hover:text-blue-600">
                  Sync Plan & Open PR
                </Link>
              </h3>
              <p className="text-gray-600 mb-4">
                Learn how to synchronize your project plan and automatically open pull requests for review.
              </p>
              <Link href="/guides/sync-plan-open-pr" className="text-blue-600 hover:text-blue-700 font-medium">
                Read guide →
              </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                <Link href="/guides/detect-drift-reconcile" className="hover:text-blue-600">
                  Detect Drift & Reconcile
                </Link>
              </h3>
              <p className="text-gray-600 mb-4">
                Identify when your project drifts from the plan and automatically reconcile differences.
              </p>
              <Link href="/guides/detect-drift-reconcile" className="text-blue-600 hover:text-blue-700 font-medium">
                Read guide →
              </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                <Link href="/guides/enforce-governance-ci" className="hover:text-blue-600">
                  Enforce Governance in CI
                </Link>
              </h3>
              <p className="text-gray-600 mb-4">
                Set up governance policies and enforce them in your CI/CD pipeline for compliance.
              </p>
              <Link href="/guides/enforce-governance-ci" className="text-blue-600 hover:text-blue-700 font-medium">
                Read guide →
              </Link>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                <Link href="/guides/design-system-sync" className="hover:text-blue-600">
                  Design System Sync
                </Link>
              </h3>
              <p className="text-gray-600 mb-4">
                Keep your design system in sync with Figma using automated token synchronization.
              </p>
              <Link href="/guides/design-system-sync" className="text-blue-600 hover:text-blue-700 font-medium">
                Read guide →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">BR</span>
                </div>
                <span className="text-xl font-bold">BuildRunner</span>
              </div>
              <p className="text-gray-400">
                The modern project management and automation platform for development teams.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Documentation</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/quickstart" className="hover:text-white">Quickstart</Link></li>
                <li><Link href="/api-reference" className="hover:text-white">API Reference</Link></li>
                <li><Link href="/cli" className="hover:text-white">CLI Guide</Link></li>
                <li><Link href="/sdk" className="hover:text-white">SDK</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/guides" className="hover:text-white">Guides</Link></li>
                <li><Link href="/examples" className="hover:text-white">Examples</Link></li>
                <li><Link href="/changelog" className="hover:text-white">Changelog</Link></li>
                <li><Link href="/support" className="hover:text-white">Support</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="https://github.com/buildrunner" className="hover:text-white">GitHub</a></li>
                <li><a href="https://discord.gg/buildrunner" className="hover:text-white">Discord</a></li>
                <li><a href="https://twitter.com/buildrunner" className="hover:text-white">Twitter</a></li>
                <li><a href="mailto:support@buildrunner.com" className="hover:text-white">Email</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 BuildRunner. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
