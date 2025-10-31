'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../lib/auth';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { ProjectProvider } from '../../lib/project';
import { ProjectSelector } from '../../components/project/ProjectSelector';
import {
  FileText,
  Edit3,
  Wrench,
  GitMerge,
  CheckSquare,
  Settings,
  Menu,
  User,
  LogOut,
  BarChart3,
  Shield
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';

const navigation = [
  { name: 'Create', href: '/create', icon: FileText },
  { name: 'Plan', href: '/plan', icon: Edit3 },
  { name: 'Flow', href: '/flow', icon: GitMerge },
  { name: 'Timeline', href: '/timeline', icon: BarChart3 },
  { name: 'Workbench', href: '/workbench', icon: Wrench },
  { name: 'Reconcile', href: '/reconcile', icon: GitMerge },
  { name: 'Tests', href: '/tests', icon: CheckSquare },
  { name: 'Governance', href: '/governance', icon: Shield },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { user, signOut } = useAuth();

  return (
    <ProtectedRoute>
      <ProjectProvider>
        <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">BuildRunner</h1>
          </div>

          {/* Project Selector */}
          <ProjectSelector />

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5",
                      isActive ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="px-4 py-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <div className="text-sm font-medium text-gray-900">{user?.name || 'User'}</div>
                <div className="text-xs text-gray-500">{user?.email}</div>
              </div>
              <Button variant="ghost" size="icon" className="ml-2" onClick={signOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h2 className="ml-2 text-lg font-semibold text-gray-900 lg:ml-0">
                {navigation.find(item => item.href === pathname)?.name || 'BuildRunner'}
              </h2>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Phase 4 - UI MVP
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
        </div>
      </ProjectProvider>
    </ProtectedRoute>
  );
}
