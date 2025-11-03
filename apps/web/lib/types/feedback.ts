// Shared types for the Interactive Preview System

export interface FeedbackItem {
  id: string;
  buildId: string;
  projectId: string;
  status: 'pending' | 'analyzing' | 'in_progress' | 'ready' | 'verified' | 'rejected';
  type: 'bug' | 'feature' | 'design' | 'performance';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  context: {
    route: string;
    component?: string;
    file?: string;
    lineNumber?: number;
    screenshot?: string;
    deviceType?: string;
  };
  changes?: {
    files: Array<{ path: string; diff: string }>;
    summary: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AutoFixJob {
  id: string;
  feedbackId: string;
  status: 'analyzing' | 'generating' | 'ready' | 'applied' | 'failed';
  plan?: any;
  changes?: any;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PreviewServer {
  serverId: string;
  port: number;
  url: string;
  appType: 'web' | 'mobile';
  buildDir: string;
  status: 'started' | 'running' | 'stopped';
}
