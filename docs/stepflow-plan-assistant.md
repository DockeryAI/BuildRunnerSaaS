# Plan Assistant Chat - Step Flow

## Overview
Interactive chat assistant on the project plan page that helps users with technology setup, API key acquisition, and finding easier alternatives to complex integrations.

## User Flow

### 1. Entry Point
- User navigates to `/plan` page
- Floating chat button appears in bottom-right corner
- Green badge shows "need assistance?" tooltip
- Button is visible but non-intrusive

### 2. Opening Chat
- User clicks floating chat button
- Chat window opens (400px wide, 600px tall)
- Header shows "Setup Assistant" with chat icon
- First message from assistant welcomes user and explains available help

### 3. Chat Interaction
**User Can Ask About:**
- How to get API keys for recommended technologies
- Step-by-step setup instructions
- Alternatives to complex integrations (e.g., "Is there an easier way than Microsoft Graph?")
- Technology-specific questions ("Why was Supabase recommended?")
- General project setup questions

**Assistant Provides:**
- Context-aware responses based on project's technology stack
- Step-by-step guidance for API key acquisition
- Links to signup pages and setup guides
- Suggestions for easier alternatives
- Encouragement and support for non-technical users
- Concise responses (2-4 paragraphs max, 800 tokens)

### 4. Technology Context
**Assistant Has Access To:**
- Full list of recommended technologies in plan
- Technology categories (frontend, backend, database, etc.)
- Difficulty levels (easy, medium, advanced)
- Reasoning for each technology recommendation
- Signup URLs and setup guide URLs

**Assistant Knows:**
- Which technologies are already set up
- Which require API keys
- Which can be integrated in-app (currently only Supabase)
- Standard development tools vs. cloud services

### 5. Example Conversations

**Example 1: API Key Help**
```
User: "How do I get the Resend API key?"
Assistant: "Great question! Resend is a modern email API with a simple setup process. Here's how to get your API key:

1. Go to resend.com/signup and create a free account
2. Verify your email address
3. Navigate to resend.com/api-keys
4. Click 'Create API Key'
5. Give it sending permissions
6. Copy the key (starts with 're_')

Once you have it, click the 'Add API Key' button for Resend in your project plan to save it securely!"
```

**Example 2: Easier Alternative**
```
User: "Microsoft Graph seems complicated. Is there an easier way to integrate email?"
Assistant: "You're absolutely right - Microsoft Graph can be complex for beginners. I'd suggest using the Gmail API or even simpler, Resend for sending emails.

Resend is much easier to set up and works great for most email needs. It has:
- Simple API (just one key needed)
- Good free tier
- Excellent documentation
- No complex OAuth flows

Would you like me to walk you through setting up Resend instead?"
```

**Example 3: Understanding Recommendations**
```
User: "Why was Supabase recommended?"
Assistant: "Supabase is perfect for your project because it's an all-in-one backend platform that includes:

- PostgreSQL database (reliable and powerful)
- Built-in authentication (no extra setup needed)
- File storage (for images, documents, etc.)
- Auto-generated APIs (saves tons of development time)

Best part: you can set it up entirely within BuildRunner without leaving this page! Just click the green 'Connect Now' button for Supabase in your technology list."
```

### 6. Chat Features
**UI Elements:**
- Collapsible chat window (can close and reopen)
- Message history persists during session
- User messages: blue bubbles, right-aligned
- Assistant messages: white bubbles with border, left-aligned
- Loading indicator (animated dots) while AI thinks
- Text input with "Send" button
- Keyboard shortcuts: Enter to send, Shift+Enter for new line

**UX Considerations:**
- Chat state persists during page session
- Smooth animations for opening/closing
- Auto-scroll to latest message
- Disabled input while loading response
- Error handling with friendly messages
- Mobile-responsive (adapts to smaller screens)

## Technical Implementation

### Component: PlanAssistantChat.tsx
**Props:**
- `technologies`: Array of Technology objects from project plan

**State:**
- `isOpen`: Chat window visibility
- `messages`: Array of Message objects (role + content)
- `input`: Current user input text
- `isLoading`: AI response loading state

**Methods:**
- `handleSend()`: Sends message to API and displays response
- `scrollToBottom()`: Auto-scrolls to latest message

### API Endpoint: /api/plan/assistant-chat/route.ts
**Request:**
```typescript
{
  messages: Array<{ role: 'user' | 'assistant', content: string }>,
  technologies: Array<Technology>
}
```

**Response:**
```typescript
{
  message: string // AI assistant's response
}
```

**AI Model:**
- Model: `anthropic/claude-3.5-sonnet` via OpenRouter
- Temperature: 0.7 (conversational but focused)
- Max tokens: 800 (concise responses)
- System prompt: Includes technology context and core principles

**System Prompt Includes:**
- Role definition (helpful setup assistant)
- Core principles (suggest easiest alternatives)
- Recommended alternatives (OpenRouter, Resend, Supabase, etc.)
- Full technology context from project plan
- Response guidelines (concise, actionable, encouraging)

## Plan Generation Updates

### Respecting the PRD + Easier Alternatives System

The AI plan generator follows two key principles:
1. **RESPECT THE PRD**: Include technologies mentioned in the PRD/user request
2. **SUGGEST EASIER ALTERNATIVES**: For medium/advanced tech, offer simpler options

**How It Works:**
- If PRD says "Outlook integration", AI includes Microsoft Graph (requested)
- For medium/advanced difficulty tech, AI also provides an `easierAlternative` field
- Alternative includes: name, reasoning, difficulty, and honest trade-offs
- User sees both options and can choose which to use
- "Accept" button switches to the alternative
- "Dismiss" (X) button removes the suggestion

**Example Alternatives:**
- Microsoft Graph (advanced) → Gmail API or Resend (easy)
  - Trade-off: "Less enterprise features, but sufficient for most use cases"
- AWS S3 (medium) → Supabase Storage (easy)
  - Trade-off: "Smaller scale limits, but easier setup and built-in auth"
- Auth0 (medium) → Supabase Auth (easy)
  - Trade-off: "Fewer SSO options, but included with Supabase database"
- OpenAI API (medium) → OpenRouter (easy)
  - Trade-off: "Slightly higher per-token cost, but supports multiple models with one key"

**NOT Recommended to Suggest:**
- Twilio (too complex, expensive for beginners)

**Alternatives Display:**
- Shown in blue panel below setup buttons
- Only appears for medium/advanced difficulty technologies
- User can accept (switches tech) or dismiss (keeps original)

**Technology Status Labels:**
- "Integrated with your account" - In-app integrations (Supabase)
- "Already configured in your account" - External services already set up
- "Already included" - Standard development tools (was "Standard development tool")
- "Commonly pre-installed" - Local tools (Git, VS Code, Docker)
- No label - Needs account creation

### In-App Integration Detection
Currently only **Supabase** can be fully integrated without leaving BuildRunner:
- Has Management API for programmatic project creation
- Can be set up with just SUPABASE_ACCESS_TOKEN
- Marked with green border and "Connect Now" button
- Shows "✨ Can be connected without leaving this app" message

All other services require external account creation:
- Marked with orange border and "Add API Key" button
- Wizard guides users through external signup process
- Validates API keys after user creates account

## Skip API Setup - "Start Building Now"

Users are not forced to set up all API keys before proceeding. A prominent "Start Building Now" button is displayed at the top of the technology stack section.

**Button Location:**
- Positioned below the recommended architecture description
- Above all technology sections
- Prominent blue gradient styling with shadow

**Button Text:**
- Primary: "Start Building Now →"
- Context: "You can set up API keys later. Start building your project now and add integrations as you go."

**User Flow:**
1. User reviews recommended technologies
2. Sees some require API keys they don't have yet
3. Clicks "Start Building Now" to skip setup phase
4. Redirects to /build page
5. Can return to add API keys later as needed

**Benefits:**
- Removes friction from getting started
- Users can build core functionality first
- Add integrations incrementally as needed
- Reduces abandonment due to setup complexity

## Success Metrics
- Users successfully get API keys with chat assistance
- Reduction in support requests for API key help
- User satisfaction with suggested alternatives
- Time to complete technology setup
- Chat engagement rate (% of users who open chat)
- Average conversation length
- Problem resolution rate (did chat answer the question?)
- % of users who skip API setup initially
- Time to first code written (shorter is better)

## Future Enhancements
- [ ] Streaming responses for faster perceived performance
- [ ] "Copy to clipboard" buttons for important info (URLs, commands)
- [ ] Rich message formatting (code blocks, links, lists)
- [ ] Quick action buttons ("Set up Resend now", "Show me alternatives")
- [ ] Persistent chat history across sessions (localStorage)
- [ ] Suggested questions/prompts based on current technology stack
- [ ] Integration with wizard (launch wizard from chat)
- [ ] Voice input for hands-free interaction
- [ ] Multi-language support for international users
- [ ] Analytics dashboard for most common questions

## Build Files Browser Workflow

The Build Files browser is integrated into the Workbench page, allowing users to view and explore all generated code in real-time as the build progresses.

### User Flow

#### 1. Starting the Build
- User navigates to `/workbench` page
- Views component dependency diagram
- Clicks "Start Building" button
- Build orchestrator initializes and creates file structure
- Files are written to `./builds/{projectId}/{buildId}/` as components are generated

#### 2. Monitoring Build Progress
- Bottom panel shows two tabs: **Live Feed** and **Build Files**
- **Live Feed** (default) shows real-time build logs
  - Component started/completed events
  - AI generation progress
  - Error messages and warnings
  - Badge shows total log count
- **Build Files** shows generated code structure
  - Real-time updates as files are created
  - Hierarchical folder tree
  - File metadata (size, modified date)

#### 3. Switching to Build Files Tab
- User clicks "Build Files" tab in bottom panel
- File browser loads file tree from build directory
- Shows organized folder structure:
  - `src/components/` - React components
  - `src/services/` - Business logic
  - `src/api/` - API endpoints
  - `src/lib/` - Shared libraries
  - `src/types/` - TypeScript types
  - `src/utils/` - Helper functions
  - `tests/` - Test files
  - `public/` - Static assets

#### 4. Navigating File Tree
- **Folders**: Click to expand/collapse
  - Chevron icon shows expansion state
  - Folder icon changes from closed to open
  - Sub-folders and files appear when expanded
- **Files**: Click to preview contents
  - File icon with extension indicator
  - File size and last modified date shown
  - Click opens preview modal

#### 5. Viewing File Contents
- Modal opens showing full file content
- **Header**:
  - File path (e.g., `src/components/UserProfile.tsx`)
  - Detected language (from file extension)
  - File size
  - Close button (X)
- **Content**:
  - Syntax-highlighted code display
  - Line numbers for reference
  - Scroll for long files
  - Monospace font for code readability

#### 6. Refreshing File List
- Click "Refresh" button to reload file tree
- Useful during active builds to see newly generated files
- File tree updates automatically on new file creation
- Shows latest file metadata (size, modified time)

#### 7. Empty States
- **No Build Started**: "No build in progress. Start a build to see generated files."
- **Build Started, No Files Yet**: "Build in progress. Files will appear as they are generated."
- **Build Directory Empty**: "No files generated yet. Check Live Feed for build status."

### File Path Inference Logic

The system automatically organizes files based on component types:

| Component Type | Generated File Path |
|---------------|---------------------|
| `frontend` / `component` | `src/components/{Name}.tsx` |
| `api` / `endpoint` | `src/api/{Name}.ts` |
| `service` | `src/services/{Name}.ts` |
| `database` / `schema` | `src/database/{Name}.ts` |
| `backend` / `server` | `src/server/{Name}.ts` |
| `test` | `tests/{Name}.test.ts` |
| Default | `src/{Name}.ts` |

### Integration with Build Process

**Real-Time File Writing:**
1. Build orchestrator starts component generation
2. AI generates code for component
3. `BuildFileWriter.writeFile()` called immediately
4. File written to `./builds/{projectId}/{buildId}/{inferredPath}`
5. File browser UI updates automatically
6. User can view file contents while build continues

**Parallel Operations:**
- Build orchestrator continues building next components
- User can browse already-generated files
- File browser refreshes to show new files
- Live Feed shows ongoing progress
- No interruption to build process

### Use Cases

#### During Build
- **Monitor Progress**: Switch between Live Feed and Build Files to see both logs and output
- **Verify Generated Code**: Check if AI is generating correct code structure
- **Catch Errors Early**: Spot issues in generated code before build completes
- **Understand Structure**: See how components are organized

#### After Build
- **Review All Files**: Browse complete file structure
- **Copy Code**: View and copy generated code for external use
- **Verify Tests**: Check generated test files
- **Plan Next Steps**: Understand what was built to plan enhancements

### Technical Details

**API Endpoints:**
- `GET /api/build/files?projectId={id}&buildId={id}&action=tree`
  - Returns hierarchical file structure as JSON
- `GET /api/build/files?projectId={id}&buildId={id}&action=read&file={path}`
  - Returns file content with syntax highlighting metadata
- `GET /api/build/files?projectId={id}&buildId={id}&action=list`
  - Returns flat list of all file paths

**File Tree Structure:**
```typescript
interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;              // Bytes (files only)
  modified?: Date;            // Last modified (files only)
  children?: FileTreeNode[];  // Sub-items (directories only)
}
```

**FileBrowser Component Props:**
```typescript
interface FileBrowserProps {
  projectId: string;          // Current project ID
  buildId: string | null;     // Current build ID
  onFileSelect?: (filePath: string, content: string) => void;
}
```

### Future Enhancements

- [ ] Download individual files or entire build as ZIP
- [ ] In-browser code editor for file modifications
- [ ] Diff view between build versions
- [ ] Search across all generated files
- [ ] File filtering by type or name
- [ ] Copy file path or content to clipboard
- [ ] Share file links with team members
- [ ] Export to GitHub repository
- [ ] Deploy directly to cloud platforms

### Success Metrics

- User engagement with Build Files tab (% of users who view files)
- Time spent reviewing generated code
- Files viewed per build session
- User satisfaction with file organization
- Early error detection rate (catching issues before build completes)

## Related Features
- API Key Setup Wizard (launched via "Add API Key" button)
- Technology recommendations in plan generation
- In-app Supabase integration
- Project plan hierarchical view
- Build orchestration system (BuildOrchestrator)
- Real-time event system (Server-Sent Events)
- Live Feed panel (build logs)
