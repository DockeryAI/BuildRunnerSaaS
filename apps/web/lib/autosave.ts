/**
 * Autosave utility for BuildRunner
 * Prevents data loss across all stages: PRD, Plan, Build
 */

// Debounce utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Check localStorage availability
export function isLocalStorageAvailable(): boolean {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

// Save with error handling
export function safeLocalStorageSet(key: string, value: any): boolean {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage not available');
    return false;
  }

  try {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, stringValue);
    return true;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded');
      // Clear old autosaves to make space
      clearOldAutosaves();
      // Retry
      try {
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
        return true;
      } catch {
        return false;
      }
    }
    console.error('localStorage error:', error);
    return false;
  }
}

// Get with error handling
export function safeLocalStorageGet<T = any>(key: string): T | null {
  if (!isLocalStorageAvailable()) return null;

  try {
    const value = localStorage.getItem(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  } catch (error) {
    console.error('localStorage get error:', error);
    return null;
  }
}

// Clear old autosaves (keep last 3 versions)
function clearOldAutosaves() {
  const keys = Object.keys(localStorage);
  const autosaveKeys = keys.filter(k =>
    k.startsWith('prd_draft_') ||
    k.startsWith('plan_progress_') ||
    k.startsWith('build_progress_')
  );

  // Group by type
  const grouped: Record<string, string[]> = {};
  autosaveKeys.forEach(key => {
    const prefix = key.split('_').slice(0, 2).join('_');
    if (!grouped[prefix]) grouped[prefix] = [];
    grouped[prefix].push(key);
  });

  // Keep only last 3 of each type
  Object.values(grouped).forEach(keys => {
    if (keys.length > 3) {
      keys.slice(3).forEach(key => localStorage.removeItem(key));
    }
  });
}

// PRD Autosave
export function savePRDDraft(projectId: string, prdData: any) {
  const key = `prd_draft_${projectId}`;
  const data = {
    ...prdData,
    _autosaved: new Date().toISOString(),
    _version: 1
  };
  return safeLocalStorageSet(key, data);
}

export function loadPRDDraft(projectId: string) {
  const key = `prd_draft_${projectId}`;
  return safeLocalStorageGet(key);
}

export function clearPRDDraft(projectId: string) {
  const key = `prd_draft_${projectId}`;
  localStorage.removeItem(key);
}

// Build Progress Autosave
export function saveBuildProgress(buildId: string, progressData: any) {
  const key = `build_progress_${buildId}`;
  const data = {
    ...progressData,
    _autosaved: new Date().toISOString()
  };
  return safeLocalStorageSet(key, data);
}

export function loadBuildProgress(buildId: string) {
  const key = `build_progress_${buildId}`;
  return safeLocalStorageGet(key);
}

export function clearBuildProgress(buildId: string) {
  const key = `build_progress_${buildId}`;
  localStorage.removeItem(key);
}

// Plan Progress Autosave
export function savePlanProgress(projectId: string, planData: any) {
  const key = `plan_progress_${projectId}`;
  const data = {
    ...planData,
    _autosaved: new Date().toISOString()
  };
  return safeLocalStorageSet(key, data);
}

export function loadPlanProgress(projectId: string) {
  const key = `plan_progress_${projectId}`;
  return safeLocalStorageGet(key);
}

export function clearPlanProgress(projectId: string) {
  const key = `plan_progress_${projectId}`;
  localStorage.removeItem(key);
}

// Check for unfinished work on app load
export function checkForUnfinishedWork() {
  const keys = Object.keys(localStorage);
  const unfinished = {
    prds: keys.filter(k => k.startsWith('prd_draft_')),
    builds: keys.filter(k => k.startsWith('build_progress_')),
    plans: keys.filter(k => k.startsWith('plan_progress_'))
  };

  const hasUnfinishedWork =
    unfinished.prds.length > 0 ||
    unfinished.builds.length > 0 ||
    unfinished.plans.length > 0;

  return { hasUnfinishedWork, unfinished };
}

// Update project status in localStorage
export function updateProjectStatus(
  projectId: string,
  updates: {
    status?: 'active' | 'completed' | 'archived';
    currentPhase?: 'prd' | 'plan' | 'build' | 'complete';
    lastBuildId?: string;
    phaseProgress?: { prd: boolean; plan: boolean; build: boolean };
  }
) {
  const projectsData = localStorage.getItem('buildrunner_projects');
  if (!projectsData) return false;

  try {
    const projects = JSON.parse(projectsData);
    const project = projects.find((p: any) => p.id === projectId || p.id === String(projectId));

    if (!project) return false;

    Object.assign(project, updates);
    project.updated_at = new Date().toISOString();

    localStorage.setItem('buildrunner_projects', JSON.stringify(projects));
    return true;
  } catch (error) {
    console.error('Failed to update project status:', error);
    return false;
  }
}
