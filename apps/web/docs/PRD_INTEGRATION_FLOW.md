# PRD Integration Flow Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Interactive Preview                          │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                     Top Toolbar                           │  │
│  │  [Desktop] [Tablet] [Mobile]  [Screenshot] [Fullscreen] │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌────────────────────┐  ┌────────────────────────────────────┐ │
│  │                    │  │   Right Sidebar (w/ Tabs)          │ │
│  │                    │  │ ┌────────────┬──────────────────┐  │ │
│  │   Preview Area     │  │ │ Feedback   │  PRD Suggestions │  │ │
│  │   (iframe)         │  │ └────────────┴──────────────────┘  │ │
│  │                    │  │                                     │ │
│  │                    │  │  [Active Tab Content]              │ │
│  │                    │  │                                     │ │
│  │                    │  │  Feedback Tab:                     │ │
│  │                    │  │  - Search & Filters                │ │
│  │                    │  │  - Feedback Items                  │ │
│  │                    │  │  - Status groups                   │ │
│  │                    │  │                                     │ │
│  │                    │  │  PRD Tab:                          │ │
│  │                    │  │  - AI Suggestions List             │ │
│  │                    │  │  - Add/Preview/Dismiss            │ │
│  └────────────────────┘  └────────────────────────────────────┘ │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Feedback Input (Bottom)                  │  │
│  │  [Text input] [Type] [Priority] [Screenshot] [Submit]   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Feature Addition Flow

```
User Feedback → Verified Feature → Add to PRD
═══════════════════════════════════════════════

1. User submits feedback
   │
   ├─→ FeedbackInput Component
   │   └─→ POST /api/build/feedback
   │       └─→ Feedback Store
   │
2. Auto-fix workflow
   │
   ├─→ FeedbackItem shows "Auto-Fix" button
   │   └─→ POST /api/build/autofix
   │       ├─→ Status: analyzing
   │       ├─→ Status: in_progress
   │       └─→ Status: ready
   │
3. User approves changes
   │
   ├─→ FeedbackItem shows "Approve" button
   │   └─→ PATCH /api/build/autofix
   │       └─→ Status: verified ✓
   │
4. "Add to PRD" button appears
   │
   ├─→ Only for verified + feature type
   │
5. User clicks "Add to PRD"
   │
   ├─→ PRDUpdater.generateFeatureSquare()
   │   ├─→ Extract title
   │   ├─→ Enhance description with context
   │   ├─→ Classify type (feature/enhancement/bug)
   │   └─→ Set priority from feedback
   │
   └─→ POST /api/prd/update-from-preview
       ├─→ PRDUpdater.addFeatureToPRD()
       │   ├─→ Fetch current PRD
       │   ├─→ Find insertion point
       │   ├─→ Format as markdown
       │   └─→ Save updated PRD
       │
       └─→ Success! "Added to PRD" shown
```

## AI Suggestion Flow

```
Automatic Analysis → Smart Suggestions → User Action
═══════════════════════════════════════════════════

1. PRDSuggestionsPanel mounts
   │
   ├─→ Initial load
   │   └─→ GET /api/prd/update-from-preview
   │       └─→ Returns cached suggestions
   │
2. Every 30 seconds (automatic)
   │
   ├─→ Fetch current feedback
   │   └─→ GET /api/build/feedback
   │
   ├─→ Generate AI suggestions
   │   └─→ PUT /api/prd/update-from-preview/generate
   │       │
   │       ├─→ AISuggestionsGenerator.generateSuggestions()
   │       │   │
   │       │   ├─→ Rule-based checks
   │       │   │   ├─→ Analytics missing?
   │       │   │   ├─→ Error tracking needed?
   │       │   │   ├─→ Onboarding missing?
   │       │   │   ├─→ Design system needed?
   │       │   │   ├─→ Performance issues?
   │       │   │   └─→ Testing needed?
   │       │   │
   │       │   ├─→ Pattern analysis
   │       │   │   ├─→ Group similar feedback
   │       │   │   ├─→ Count occurrences
   │       │   │   └─→ Suggest fixes for patterns (3+)
   │       │   │
   │       │   └─→ Feature gap analysis
   │       │       ├─→ Check for common features
   │       │       ├─→ Match with user requests
   │       │       └─→ Prioritize by demand
   │       │
   │       └─→ Return prioritized suggestions
   │
3. Display suggestions
   │
   ├─→ Show in PRD tab
   │   ├─→ Badge count on tab
   │   ├─→ Type/Priority/Source badges
   │   └─→ Preview/Add/Dismiss actions
   │
4. User actions
   │
   ├─→ Add to PRD
   │   └─→ POST /api/prd/update-from-preview
   │       └─→ Feature added + removed from suggestions
   │
   ├─→ Preview
   │   └─→ Expand full description inline
   │
   └─→ Dismiss
       └─→ DELETE /api/prd/update-from-preview
           └─→ Suggestion removed
```

## Data Flow Diagram

```
┌──────────────┐
│  User Input  │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│  Feedback System     │
│  ─────────────────   │
│  • FeedbackInput     │
│  • FeedbackItem      │
│  • FeedbackSidebar   │
└──────┬───────────────┘
       │
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌──────────────┐   ┌─────────────────┐
│  Feedback    │   │  AI Analysis    │
│  Storage     │◄──┤  Engine         │
│  (In-Memory) │   │  ──────────     │
└──────┬───────┘   │  • Rules        │
       │           │  • Patterns     │
       │           │  • Gaps         │
       │           └─────────┬───────┘
       │                     │
       ▼                     ▼
┌──────────────────────────────────┐
│  PRD Suggestions                 │
│  ────────────────                │
│  • User-generated (from feedback)│
│  • AI-generated (from analysis)  │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────┐
│  PRD Document        │
│  ──────────────      │
│  • Features section  │
│  • Formatted markdown│
│  • Context preserved │
└──────────────────────┘
```

## Component Hierarchy

```
InteractivePreview
├── Top Toolbar
│   ├── Viewport Selector
│   ├── Screenshot Button
│   └── Fullscreen Toggle
│
├── Preview Area (iframe)
│
├── Right Sidebar (Tabbed)
│   ├── Tab Switcher
│   │   ├── Feedback Tab
│   │   └── PRD Tab (with badge)
│   │
│   ├── Feedback Content
│   │   └── FeedbackSidebar
│   │       ├── Search & Filters
│   │       └── FeedbackItem[] (list)
│   │           ├── Status badges
│   │           ├── Action buttons
│   │           └── "Add to PRD" (if verified)
│   │
│   └── PRD Content
│       └── PRDSuggestionsPanel
│           ├── Refresh button
│           ├── Notifications
│           └── Suggestion[] (list)
│               ├── Type/Priority/Source badges
│               ├── Description preview
│               ├── Add to PRD button
│               ├── Preview button
│               ├── Dismiss button
│               └── Expanded preview (optional)
│
└── Feedback Input (Bottom)
    ├── Text Input
    ├── Type Selector
    ├── Priority Selector
    └── Submit Button
```

## State Management

```
┌─────────────────────────────────────────────────────┐
│               InteractivePreview                     │
│  ─────────────────────────────────                  │
│  State:                                              │
│  • viewport: mobile | tablet | desktop              │
│  • sidebarCollapsed: boolean                        │
│  • activeTab: 'feedback' | 'prd'                    │
│  • currentRoute: string                             │
│  • isFullscreen: boolean                            │
└─────────────────────────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
        ▼                           ▼
┌──────────────────┐      ┌──────────────────────┐
│  FeedbackSidebar │      │  PRDSuggestionsPanel │
│  ──────────────  │      │  ──────────────────  │
│  State:          │      │  State:              │
│  • items[]       │      │  • suggestions[]     │
│  • loading       │      │  • loading           │
│  • filters       │      │  • refreshing        │
│  • searchQuery   │      │  • adding            │
└──────┬───────────┘      │  • previewing        │
       │                  │  • notification      │
       ▼                  └──────────────────────┘
┌──────────────────┐
│  FeedbackItem    │
│  ──────────────  │
│  State:          │
│  • expanded      │
│  • processing    │
│  • addingToPRD   │
│  • addedToPRD    │
│  • autoFixJobId  │
└──────────────────┘
```

## API Endpoints Summary

```
Feedback APIs:
──────────────
POST   /api/build/feedback           Submit new feedback
GET    /api/build/feedback            Get feedback list
PATCH  /api/build/feedback            Update feedback status
DELETE /api/build/feedback            Delete feedback
POST   /api/build/autofix             Trigger auto-fix
PATCH  /api/build/autofix             Approve/reject fix

PRD APIs:
─────────
POST   /api/prd/update-from-preview   Add feature to PRD
GET    /api/prd/update-from-preview   Get suggestions
PUT    /api/prd/update-from-preview/generate  Generate AI suggestions
DELETE /api/prd/update-from-preview   Dismiss suggestion
```

## Timing & Performance

```
Event Timeline:
───────────────

T+0s    User opens preview
        └─→ Initial feedback load (< 200ms)
        └─→ Initial suggestions load (< 100ms cached)
        └─→ Generate AI suggestions (< 500ms)

T+5s    User submits feedback
        └─→ Save feedback (< 100ms)
        └─→ Update UI immediately

T+30s   Auto-refresh cycle
        └─→ Fetch feedback (< 200ms)
        └─→ Generate AI suggestions (< 500ms)
        └─→ Update suggestions (< 100ms)

T+60s   Another auto-refresh
        └─→ (repeat every 30s)

Performance Targets:
────────────────────
• Feedback submission: < 200ms
• Suggestion generation: < 500ms
• Add to PRD: < 300ms
• UI updates: < 100ms
• Tab switching: < 50ms
```

## Error Handling Flow

```
API Error → Graceful Degradation
────────────────────────────────

1. Network Error
   │
   ├─→ Show error notification
   ├─→ Keep existing data visible
   ├─→ Retry on next interval
   └─→ Don't crash UI

2. Validation Error
   │
   ├─→ Show specific error message
   ├─→ Highlight invalid field
   └─→ Allow user to fix

3. Server Error (500)
   │
   ├─→ Show generic error
   ├─→ Log to console
   ├─→ Retry with exponential backoff
   └─→ Don't lose user input

4. Not Found (404)
   │
   ├─→ Show "not found" message
   └─→ Redirect to safe state
```

## Security Flow

```
Request → Validation → Authorization → Action
───────────────────────────────────────────────

1. Client Request
   │
   ├─→ Include credentials
   └─→ HTTPS only

2. Server Validation
   │
   ├─→ Check required fields
   ├─→ Sanitize inputs
   ├─→ Validate types
   └─→ Rate limiting check

3. Authorization
   │
   ├─→ Verify user session
   ├─→ Check project access
   └─→ Verify permissions

4. Action
   │
   ├─→ Execute request
   ├─→ Log audit trail
   └─→ Return result
```

This integration provides a seamless experience for users to contribute to PRDs directly from preview mode, with intelligent AI assistance every step of the way.
