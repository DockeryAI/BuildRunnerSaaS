/**
 * Multi-Tab Project Manager
 * Enables safe concurrent project editing across multiple browser tabs
 *
 * Architecture:
 * - URL params for project identity (tab isolation)
 * - SessionStorage for tab-specific state
 * - IndexedDB for large project data
 * - BroadcastChannel for cross-tab sync (optional)
 */

import { offlineDB as db } from './offline/db';

// Tab-specific identifier
let tabId: string;
if (typeof window !== 'undefined') {
  tabId = sessionStorage.getItem('tab_id') || `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  sessionStorage.setItem('tab_id', tabId);
}

export const getTabId = () => tabId;

// Project context for this tab
interface TabProjectContext {
  projectId: string;
  tabId: string;
  openedAt: string;
  lastActivity: string;
  phase: 'prd' | 'plan' | 'build' | 'workbench';
}

/**
 * Get project ID from URL or session
 * Priority: URL param > sessionStorage > null
 */
export function getProjectIdFromContext(): string | null {
  if (typeof window === 'undefined') return null;

  // 1. Check URL params (highest priority)
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('projectId');
  if (projectId) {
    // Store in session for this tab
    sessionStorage.setItem(`${tabId}_projectId`, projectId);
    return projectId;
  }

  // 2. Check sessionStorage (this tab's memory)
  const sessionProjectId = sessionStorage.getItem(`${tabId}_projectId`);
  if (sessionProjectId) return sessionProjectId;

  return null;
}

/**
 * Set project context for this tab only
 * Updates URL without page reload
 */
export function setProjectContext(projectId: string, phase?: string) {
  if (typeof window === 'undefined') return;

  // Update session storage
  sessionStorage.setItem(`${tabId}_projectId`, projectId);
  sessionStorage.setItem(`${tabId}_lastActivity`, new Date().toISOString());

  // Update URL params (doesn't reload page)
  const url = new URL(window.location.href);
  url.searchParams.set('projectId', projectId);
  if (phase) url.searchParams.set('phase', phase);
  window.history.replaceState({}, '', url.toString());

  // Track active tabs for this project
  trackActiveTab(projectId);
}

/**
 * Track which tabs have which projects open
 * Stored in localStorage for cross-tab visibility
 */
function trackActiveTab(projectId: string) {
  const activeTabsKey = 'active_project_tabs';
  const activeTabs: TabProjectContext[] = JSON.parse(
    localStorage.getItem(activeTabsKey) || '[]'
  );

  // Remove old entries for this tab
  const filtered = activeTabs.filter(t => t.tabId !== tabId);

  // Add this tab
  filtered.push({
    projectId,
    tabId,
    openedAt: sessionStorage.getItem(`${tabId}_openedAt`) || new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    phase: getCurrentPhase(),
  });

  localStorage.setItem(activeTabsKey, JSON.stringify(filtered));
}

/**
 * Get current phase from URL or default
 */
function getCurrentPhase(): 'prd' | 'plan' | 'build' | 'workbench' {
  const path = window.location.pathname;
  if (path.includes('/create')) return 'prd';
  if (path.includes('/plan')) return 'plan';
  if (path.includes('/workbench')) return 'workbench';
  return 'build';
}

/**
 * Check if a project is open in other tabs
 */
export function getOtherTabsWithProject(projectId: string): TabProjectContext[] {
  const activeTabsKey = 'active_project_tabs';
  const activeTabs: TabProjectContext[] = JSON.parse(
    localStorage.getItem(activeTabsKey) || '[]'
  );

  // Filter out stale tabs (no activity in 5 minutes) and this tab
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  return activeTabs.filter(
    t =>
      t.projectId === projectId &&
      t.tabId !== tabId &&
      new Date(t.lastActivity).getTime() > fiveMinutesAgo
  );
}

/**
 * Cleanup this tab on unload
 */
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    const activeTabsKey = 'active_project_tabs';
    const activeTabs: TabProjectContext[] = JSON.parse(
      localStorage.getItem(activeTabsKey) || '[]'
    );
    const filtered = activeTabs.filter(t => t.tabId !== tabId);
    localStorage.setItem(activeTabsKey, JSON.stringify(filtered));
  });

  // Heartbeat to update last activity
  setInterval(() => {
    const projectId = getProjectIdFromContext();
    if (projectId) {
      trackActiveTab(projectId);
    }
  }, 30000); // Every 30 seconds
}

/**
 * Cross-tab communication via BroadcastChannel
 */
let broadcastChannel: BroadcastChannel | null = null;

export function enableCrossTabSync(projectId: string, onMessage: (data: any) => void) {
  if (typeof window === 'undefined' || !('BroadcastChannel' in window)) {
    console.warn('BroadcastChannel not supported');
    return null;
  }

  broadcastChannel = new BroadcastChannel(`project_${projectId}`);

  broadcastChannel.onmessage = (event) => {
    // Ignore messages from this tab
    if (event.data.tabId === tabId) return;
    onMessage(event.data);
  };

  return broadcastChannel;
}

export function broadcastToOtherTabs(projectId: string, data: any) {
  if (!broadcastChannel) return;

  broadcastChannel.postMessage({
    tabId,
    timestamp: new Date().toISOString(),
    ...data,
  });
}

export function closeCrossTabSync() {
  if (broadcastChannel) {
    broadcastChannel.close();
    broadcastChannel = null;
  }
}

/**
 * Memory management: Clear project data on tab close
 */
export function cleanupProjectData(projectId: string) {
  // Clear session storage for this tab
  const keys = Object.keys(sessionStorage);
  keys.forEach(key => {
    if (key.startsWith(`${tabId}_`)) {
      sessionStorage.removeItem(key);
    }
  });

  // Clear any cached data in memory
  if (typeof window !== 'undefined') {
    (window as any).__projectCache = (window as any).__projectCache || {};
    delete (window as any).__projectCache[projectId];
  }
}

/**
 * Save data to IndexedDB instead of localStorage
 * Prevents quota errors and improves performance
 */
export async function saveProjectDataToIndexedDB(projectId: string, key: string, data: any) {
  try {
    await db.projectData.put({
      projectId,
      key,
      data,
      updatedAt: new Date().toISOString(),
      tabId,
    });
    return true;
  } catch (error) {
    console.error('IndexedDB save error:', error);
    return false;
  }
}

export async function loadProjectDataFromIndexedDB(projectId: string, key: string) {
  try {
    const result = await db.projectData
      .where({ projectId, key })
      .first();
    return result?.data || null;
  } catch (error) {
    console.error('IndexedDB load error:', error);
    return null;
  }
}

/**
 * Migrate from localStorage to IndexedDB
 */
export async function migrateProjectToIndexedDB(projectId: string) {
  const keysToMigrate = [
    `prd_draft_${projectId}`,
    `plan_progress_${projectId}`,
    `buildrunner_plan_${projectId}`,
  ];

  for (const key of keysToMigrate) {
    const data = localStorage.getItem(key);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        await saveProjectDataToIndexedDB(projectId, key, parsed);
        // Don't remove from localStorage yet (gradual migration)
        console.log(`Migrated ${key} to IndexedDB`);
      } catch (error) {
        console.error(`Failed to migrate ${key}:`, error);
      }
    }
  }
}

/**
 * Check if user wants to sync changes from another tab
 */
export function promptForTabSync(otherTabs: TabProjectContext[]): Promise<boolean> {
  if (otherTabs.length === 0) return Promise.resolve(false);

  const tabList = otherTabs
    .map(t => `- ${t.phase} phase (last active: ${new Date(t.lastActivity).toLocaleTimeString()})`)
    .join('\n');

  return new Promise((resolve) => {
    const userWantsSync = confirm(
      `This project is open in ${otherTabs.length} other tab(s):\n${tabList}\n\n` +
      `Do you want to load the latest changes from other tabs?`
    );
    resolve(userWantsSync);
  });
}
