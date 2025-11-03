# Interactive Preview System - Implementation Plan

## Overview
This document outlines the complete architecture for BuildRunner's interactive preview system with AI-powered auto-fix capabilities. This system works for both **web apps (Next.js)** and **mobile apps (Expo)**.

## Core Features

### 1. Universal Preview Support
- **Web Apps**: Next.js running on `npm run dev`
- **Mobile Apps**: Expo running on `npx expo start --web`
- Auto-detects app type from package.json
- Single unified preview interface for both

### 2. Live Preview + Feedback Interface
```
┌────────────────────────────────────────────┐
│  Interactive Preview                       │
├───────────────────┬────────────────────────┤
│   Live App        │   Feedback Sidebar     │
│   (iframe)        │                        │
│                   │   [Feedback Items]     │
│   [Your App]      │   - Pending            │
│                   │   - In Progress        │
│   Auto-refreshes  │   - Ready for Review   │
│                   │   - Verified           │
└───────────────────┴────────────────────────┘
```

### 3. Context-Aware Feedback
- Click elements to capture context
- Auto-detects current route/screen
- Captures screenshots
- Maps to source component files

### 4. AI Auto-Fix System
- Analyzes feedback + context
- Makes code changes automatically
- Uses hot reload for instant preview
- Requires approval before committing

### 5. Approval Workflow
- ✅ Approve: Changes become permanent
- ❌ Reject: Changes rolled back, AI retries
- Diff view for all changes
- One-click rollback capability

## Architecture

### Backend Components

#### 1. Preview Server API (`/api/build/preview/route.ts`)
**Status**: Partially implemented (web only)

**Enhancements Needed**:
- Detect Expo apps from package.json
- Start Expo with `npx expo start --web --port {port}`
- Track app type in server metadata
- Return app type to frontend

**Endpoints**:
- `POST /api/build/preview` - Start preview server
- `DELETE /api/build/preview?serverId=X` - Stop server
- `GET /api/build/preview` - List active servers

#### 2. Feedback API (`/api/build/feedback/route.ts`)
**Status**: Not implemented

**Endpoints**:
- `POST /api/build/feedback` - Submit new feedback
- `GET /api/build/feedback?buildId=X` - Get all feedback items
- `PATCH /api/build/feedback/:id` - Update feedback status
- `DELETE /api/build/feedback/:id` - Delete feedback

**Feedback Item Schema**:
```typescript
{
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
    files: Array<{path: string, diff: string}>;
    summary: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

#### 3. Auto-Fix API (`/api/build/autofix/route.ts`)
**Status**: Not implemented

**Endpoints**:
- `POST /api/build/autofix` - Trigger AI fix for feedback item
- `GET /api/build/autofix/:id/status` - Get fix progress
- `POST /api/build/autofix/:id/approve` - Approve changes
- `POST /api/build/autofix/:id/reject` - Reject and rollback

**Fix Process**:
1. Analyze feedback + context
2. Read relevant source files
3. Generate code changes
4. Apply changes to build directory
5. Validate (lint, compile check)
6. Mark as "ready for review"
7. Wait for approval
8. On approve: Commit changes
9. On reject: Rollback and retry

#### 4. File Watcher (`lib/file-watcher.ts`)
**Status**: Not implemented

**Purpose**: Monitor build directory for changes, trigger iframe refresh

**Implementation**:
```typescript
export class BuildFileWatcher {
  watch(buildDir: string, callback: () => void): void;
  stop(): void;
}
```

### Frontend Components

#### 1. Interactive Preview Component (`components/InteractivePreview.tsx`)
**Status**: Not implemented

**Features**:
- Split layout: iframe + sidebar
- Responsive (collapses sidebar on mobile)
- Viewport selector (mobile/tablet/desktop)
- Screenshot capture
- Click-to-capture element context

**Props**:
```typescript
interface InteractivePreviewProps {
  buildId: string;
  projectId: string;
  appType: 'web' | 'mobile';
  previewUrl: string;
}
```

#### 2. Feedback Sidebar (`components/FeedbackSidebar.tsx`)
**Status**: Not implemented

**Features**:
- List all feedback items
- Filter by status, type, priority
- Collapsible for more preview space
- Real-time updates via polling/websocket
- Toast notifications for status changes

#### 3. Feedback Input (`components/FeedbackInput.tsx`)
**Status**: Not implemented

**Features**:
- Always visible at bottom
- Shows current context
- Type/priority selectors
- Submit with Cmd+Enter
- Auto-capture screenshot

#### 4. Feedback Item Card (`components/FeedbackItem.tsx`)
**Status**: Not implemented

**Features**:
- Status indicator (colored)
- Progress bar (when in progress)
- Diff viewer (when ready)
- Approve/Reject buttons
- Expandable for details

#### 5. Diff Viewer (`components/DiffViewer.tsx`)
**Status**: Exists (rescope/PatchPreview.tsx)

**Status**: Can be reused, may need enhancements

### AI Auto-Fix System

#### Core Logic (`lib/autofix-agent.ts`)
**Status**: Not implemented

**Process**:
```typescript
export class AutoFixAgent {
  async analyzeFeedback(feedback: FeedbackItem): Promise<FixPlan>;
  async generateFix(plan: FixPlan): Promise<CodeChanges>;
  async applyChanges(changes: CodeChanges, buildDir: string): Promise<void>;
  async rollback(changeId: string): Promise<void>;
  async validate(buildDir: string): Promise<ValidationResult>;
}
```

**Analysis Phase**:
- Parse feedback description
- Read screenshot (if available)
- Identify affected components
- Find relevant files
- Understand current implementation

**Planning Phase**:
- Determine root cause
- List files to modify
- Outline approach
- Estimate complexity

**Execution Phase**:
- Generate code changes
- Apply to files
- Run linter
- Check compilation
- Create diff

**Validation Phase**:
- Syntax check
- Type check (if TypeScript)
- Run tests (if available)
- Mark ready or failed

#### Context Mapper (`lib/context-mapper.ts`)
**Status**: Not implemented

**Purpose**: Map UI elements back to source code

**For Web Apps**:
```typescript
// Uses source maps + React DevTools
export function mapDomToComponent(domPath: string, buildDir: string): ComponentInfo;
```

**For Mobile Apps**:
```typescript
// Uses component name from screenshot description
export function inferComponentFromContext(
  route: string,
  description: string,
  buildDir: string
): ComponentInfo;
```

## Implementation Phases

### Phase 1: Foundation (4 hours)
- ✅ Update preview API for Expo support
- ✅ Create InteractivePreview component
- ✅ Create FeedbackSidebar skeleton
- ✅ Create Feedback API endpoints
- ✅ Test basic preview for web + mobile

### Phase 2: Feedback System (4 hours)
- ✅ Implement FeedbackInput component
- ✅ Implement FeedbackItem cards
- ✅ Add context capture (screenshot, route)
- ✅ Real-time feedback list updates
- ✅ Filter/search functionality

### Phase 3: AI Auto-Fix (6 hours)
- ✅ Build AutoFixAgent core logic
- ✅ Integrate with Claude API
- ✅ Implement file analysis/reading
- ✅ Implement code generation
- ✅ Implement change application
- ✅ Add validation checks

### Phase 4: Approval & Rollback (3 hours)
- ✅ Build approval workflow UI
- ✅ Implement rollback mechanism
- ✅ Add diff viewer integration
- ✅ Add retry on rejection
- ✅ Git commit integration (optional)

### Phase 5: Polish & Testing (3 hours)
- ✅ Add loading states
- ✅ Add error handling
- ✅ Add keyboard shortcuts
- ✅ Mobile responsiveness
- ✅ End-to-end testing

**Total Estimated Time**: ~20 hours

## Mobile-Specific Considerations

### Expo Web Mode
- Runs on `localhost:19006` by default
- Supports hot reload
- Can be embedded in iframe
- Limited to web-compatible components

### Context Detection Differences
**Web**: DOM inspection + source maps
**Mobile**: Screenshot analysis + component names

### Hot Reload
**Web**: Next.js Fast Refresh
**Mobile**: Expo Fast Refresh (via WebSocket)

### Viewport Testing
**Web**: Browser DevTools
**Mobile**: iPhone/Android frame overlays in preview

## Security Considerations

1. **Code Execution**: AI-generated code runs in isolated build directory, not production
2. **File Access**: Preview API only accesses builds/ directory
3. **Approval Required**: No automatic deployment without user approval
4. **Rollback Safety**: All changes tracked, can revert instantly
5. **API Rate Limits**: Throttle AI requests to prevent abuse

## Success Metrics

1. **Time to Fix**: Measure average time from feedback to verified fix
2. **Fix Accuracy**: % of fixes approved on first attempt
3. **User Satisfaction**: Feedback on preview experience
4. **Coverage**: % of feedback items successfully auto-fixed

## Future Enhancements

1. **Real iOS/Android Testing**: Connect to actual simulators
2. **Collaborative Feedback**: Multiple users can give feedback
3. **Video Recording**: Record interactions for bug reports
4. **A/B Testing**: Compare different fix approaches
5. **Learning**: AI learns from approval/rejection patterns

## Technical Stack

- **Frontend**: React, Next.js, TailwindCSS
- **Backend**: Next.js API Routes, Node.js
- **AI**: Claude API (Anthropic)
- **File Watching**: chokidar
- **Diff Generation**: diff library
- **State Management**: React Context + localStorage
- **Real-time**: Polling (Phase 1), WebSocket (Phase 2)

---

**Status**: Ready to implement
**Start Date**: November 2, 2025
**Target Completion**: November 3, 2025
