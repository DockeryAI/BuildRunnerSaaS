'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../lib/auth';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { ProjectProvider, useProject } from '../../lib/project';
import { TabSafeProjectProvider, useTabSafeProject } from '../../lib/project-context';
import { StrategeryProvider, useStrategery } from '../../lib/strategery-context';
import { APIAssistantProvider, useAPIAssistant } from '../../lib/api-assistant-context';
import { OracleProvider, useOracle } from '../../lib/oracle-context';
import { ProjectSelector } from '../../components/project/ProjectSelector';
import OracleChat from '../../components/OracleChat';
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
  TrendingUp,
  Package,
  Shield,
  Lightbulb,
  FolderOpen,
  ChevronLeft,
  ChevronRight,
  BookTemplate,
  DollarSign,
  Sparkles,
  GitBranch,
  MessageSquare
} from 'lucide-react';
import { SyncStatusWidget } from '../../components/github-sync/SyncStatusWidget';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';
import dynamic from 'next/dynamic';

// Dynamic imports for voice components (client-side only)
const VoiceProvider = dynamic(
  () => import('../../components/voice/VoiceProvider').then((mod) => mod.VoiceProvider),
  { ssr: false }
);
const VoiceMicrophone = dynamic(
  () => import('../../components/voice/VoiceMicrophone').then((mod) => mod.VoiceMicrophone),
  { ssr: false }
);
const VoiceTranscript = dynamic(
  () => import('../../components/voice/VoiceTranscript').then((mod) => mod.VoiceTranscript),
  { ssr: false }
);
const VoiceStatus = dynamic(
  () => import('../../components/voice/VoiceStatus').then((mod) => mod.VoiceStatus),
  { ssr: false }
);
const APIAssistant = dynamic(
  () => import('../../components/APIAssistant'),
  { ssr: false }
);
const StrategeryAssistant = dynamic(
  () => import('../../components/StrategeryAssistant'),
  { ssr: false }
);

const navigation = [
  { name: 'Projects', href: '/projects', icon: FolderOpen, description: 'Project library' },
  { name: 'Create', href: '/create', icon: Lightbulb, description: 'Build PRD with AI' },
  { name: 'PRD', href: '/create?view=prd', icon: FileText, description: 'View/Edit PRD', highlight: true },
  { name: 'Templates', href: '/templates', icon: BookTemplate, description: 'PRD templates' },
  { name: 'Plan', href: '/plan', icon: Edit3, description: 'Project plan & timeline' },
  { name: 'Build', href: '/workbench', icon: Wrench, description: 'Code & tests' },
  { name: 'Coordination', href: '/coordination', icon: Sparkles, description: 'AI coordination' },
  { name: 'Cost', href: '/cost', icon: DollarSign, description: 'Cost optimization' },
  { name: 'Analytics', href: '/analytics', icon: TrendingUp, description: 'Metrics & insights' },
  { name: 'Settings', href: '/settings', icon: Settings, description: 'API keys & governance' },
];

// Inner component that uses the context hooks
function AppLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [showStrategeryBtn, setShowStrategeryBtn] = useState(false);
  const [showAPIBtn, setShowAPIBtn] = useState(false);

  const { user, signOut } = useAuth();
  const { currentProject } = useTabSafeProject();
  const { toggleOpen: toggleStrategery } = useStrategery();
  const { toggleOpen: toggleAPIAssistant } = useAPIAssistant();
  const { projectContext } = useOracle();

  // Check visibility for both assistants
  useEffect(() => {
    const checkVisibility = () => {
      const currentProjectId = localStorage.getItem('currentProjectId');
      console.log('[Assistant Visibility] currentProjectId:', currentProjectId);

      if (!currentProjectId) {
        console.log('[Assistant Visibility] No project ID, hiding assistants');
        setShowStrategeryBtn(false);
        setShowAPIBtn(false);
        return;
      }

      // Show Strategery after idea submission
      const savedProject = localStorage.getItem(`buildrunner_project_${currentProjectId}`);
      console.log('[Assistant Visibility] savedProject:', savedProject ? 'found' : 'not found');

      if (savedProject) {
        try {
          const project = JSON.parse(savedProject);
          const hasIdea = !!project.productIdea;
          console.log('[Assistant Visibility] Has product idea:', hasIdea);
          setShowStrategeryBtn(hasIdea);
        } catch (error) {
          console.error('[Assistant Visibility] Failed to parse project:', error);
          setShowStrategeryBtn(false);
        }
      } else {
        setShowStrategeryBtn(false);
      }

      // Show API Assistant after plan generation
      const savedPlan = localStorage.getItem(`buildrunner_plan_${currentProjectId}`);
      const hasPlan = !!savedPlan;
      console.log('[Assistant Visibility] Has plan:', hasPlan);
      setShowAPIBtn(hasPlan);
    };

    // Check immediately on mount
    checkVisibility();

    // Also check when pathname or currentProject changes
  }, [pathname, currentProject]);

  // Load sidebar states from localStorage on mount
  useEffect(() => {
    const savedCollapsed = localStorage.getItem('sidebar_collapsed');
    if (savedCollapsed !== null) {
      setSidebarCollapsed(savedCollapsed === 'true');
    }

    const savedHidden = localStorage.getItem('sidebar_hidden');
    if (savedHidden !== null) {
      setSidebarHidden(savedHidden === 'true');
    }
  }, []);

  // Save sidebar collapsed state to localStorage when it changes
  const toggleSidebarCollapsed = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem('sidebar_collapsed', String(newState));
  };

  // Toggle sidebar completely hidden
  const toggleSidebarHidden = () => {
    const newState = !sidebarHidden;
    setSidebarHidden(newState);
    localStorage.setItem('sidebar_hidden', String(newState));
  };

  return (
      <VoiceProvider
        deepgramApiKey={process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY || ''}
        elevenLabsApiKey={process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || ''}
        elevenLabsVoiceId={process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID || ''}
        anthropicApiKey={process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || ''}
        autoSpeak={true}
      >
      <div className="h-screen flex overflow-hidden bg-gray-100">
            {/* Sidebar */}
            {!sidebarHidden && (
            <div className={cn(
              "fixed inset-y-0 left-0 z-50 bg-white shadow-lg transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
              sidebarOpen ? "translate-x-0" : "-translate-x-full",
              sidebarCollapsed ? "w-16" : "w-64"
            )}>
              <div className="flex flex-col h-full">
                {/* Logo */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
                  {!sidebarCollapsed && (
                    <h1 className="text-xl font-bold text-gray-900">BuildRunner</h1>
                  )}
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hidden lg:flex"
                      onClick={toggleSidebarCollapsed}
                      title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                      {sidebarCollapsed ? (
                        <ChevronRight className="h-4 w-4" />
                      ) : (
                        <ChevronLeft className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleSidebarHidden}
                      title="Minimize Navigation"
                      className="hover:bg-red-50 border border-gray-300"
                    >
                      <span className="text-lg font-bold text-gray-700">−</span>
                    </Button>
                  </div>
                </div>

                {/* Project Selector */}
                {!sidebarCollapsed && <ProjectSelector />}

                {/* Navigation */}
                <nav className="flex-1 px-2 py-4 space-y-1">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    const isHighlight = (item as any).highlight;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                          isActive && !isHighlight
                            ? "bg-blue-100 text-blue-700"
                            : isHighlight
                            ? "bg-purple-100 text-purple-700 border-2 border-purple-300"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                          sidebarCollapsed ? "justify-center" : ""
                        )}
                        title={sidebarCollapsed ? item.name : undefined}
                      >
                        <item.icon
                          className={cn(
                            sidebarCollapsed ? "" : "mr-3",
                            "h-5 w-5",
                            isActive && !isHighlight ? "text-blue-500" : isHighlight ? "text-purple-600" : "text-gray-400 group-hover:text-gray-500"
                          )}
                        />
                        {!sidebarCollapsed && item.name}
                      </Link>
                    );
                  })}
                </nav>

                {/* User Menu */}
                <div className="px-2 py-4 border-t border-gray-200">
                  {sidebarCollapsed ? (
                    <div className="flex flex-col items-center space-y-2">
                      <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <Button variant="ghost" size="icon" onClick={signOut}>
                        <LogOut className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center px-2">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{user?.name || 'User'}</div>
                        <div className="text-xs text-gray-500 truncate">{user?.email}</div>
                      </div>
                      <Button variant="ghost" size="icon" className="ml-2" onClick={signOut}>
                        <LogOut className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Show arrow tab when sidebar is hidden */}
          {sidebarHidden && (
            <button
              onClick={toggleSidebarHidden}
              className="fixed left-0 top-1/2 -translate-y-1/2 z-50 bg-white shadow-lg rounded-r-lg p-2 hover:bg-gray-50 transition-colors border border-l-0 border-gray-200"
              title="Show navigation"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          )}

          {/* Main content */}
          <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
            {/* Top bar */}
            <header className="bg-white shadow-sm border-b border-gray-200">
              <div className="flex items-center justify-between h-16 px-6">
                <div className="flex items-center gap-4">
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

                  {/* PRD Button - Shows when project is selected */}
                  {currentProject && (
                    <Link href="/create?view=prd">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-50"
                      >
                        <FileText className="h-4 w-4" />
                        <span className="hidden sm:inline">What's Your Idea?</span>
                      </Button>
                    </Link>
                  )}

                  {/* Strategery Assistant - Shows after idea submission */}
                  {showStrategeryBtn && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleStrategery}
                      className="flex items-center gap-2 border-purple-300 text-purple-700 hover:bg-purple-50"
                      title="Strategery Assistant"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span className="hidden sm:inline">Strategy</span>
                    </Button>
                  )}

                  {/* API Assistant - Shows after plan generation */}
                  {showAPIBtn && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleAPIAssistant}
                      className="flex items-center gap-2 border-blue-400 text-blue-800 hover:bg-blue-50"
                      title="API Assistant"
                    >
                      <Settings className="h-4 w-4" />
                      <span className="hidden sm:inline">APIs</span>
                    </Button>
                  )}
                </div>

                <div className="flex items-center space-x-4">
                  <SyncStatusWidget
                    status={{ lastSync: null, nextSync: null, status: 'idle', message: 'Not configured' }}
                    compact={true}
                  />
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

          {/* Voice UI Components */}
          <VoiceMicrophone />
          <VoiceTranscript />
          <VoiceStatus />

          {/* Global Assistants */}
          <APIAssistant />
          <StrategeryAssistant />
          <OracleChat projectContext={projectContext} />
        </div>
      </VoiceProvider>
  );
}

// Wrapper component that provides the contexts
function AppLayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <OracleProvider>
      <StrategeryProvider>
        <APIAssistantProvider>
          <AppLayoutInner>{children}</AppLayoutInner>
        </APIAssistantProvider>
      </StrategeryProvider>
    </OracleProvider>
  );
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <TabSafeProjectProvider>
        <AppLayoutContent>{children}</AppLayoutContent>
      </TabSafeProjectProvider>
    </ProtectedRoute>
  );
}
