# BuildRunner SaaS - Complete User Workflow Guide

## Overview
This document outlines the complete user journey through the BuildRunner SaaS platform, from initial product idea to completed PRD document.

## Phase 1: Onboarding & Setup

### Step 1: Landing Page Experience
- **URL**: `http://localhost:3001/create`
- **Design**: Beautiful lightbulb-themed gradient background
- **Elements**:
  - Large "What would you like to build?" heading
  - Prominent textarea for product idea input
  - 6 example product ideas for inspiration
  - API key status indicator
  - "Start AI Brainstorming" button

### Step 2: API Key Configuration (If Needed)
- **Trigger**: Missing or invalid API keys
- **Process**:
  - Yellow warning banner appears
  - "Setup Required" message with settings link
  - Navigate to `/settings/api-keys`
  - Configure OpenRouter and Supabase keys
  - Return to create page

### Step 3: Product Idea Input
- **Requirements**: 
  - Minimum 10 characters for idea description
  - API keys must be configured
- **Best Practices**:
  - Be specific about target users
  - Include key functionality
  - Mention unique value proposition
- **Examples**:
  - "AI agent that follows up on leads via SMS and schedules appointments"
  - "SaaS platform for automated CI/CD pipelines"
  - "Mobile app for team project management with real-time chat"

## Phase 2: AI Brainstorming Session

### Step 4: Session Initialization
- **Automatic Actions**:
  - AI generates professional product description
  - Creates welcome message with 3-step process
  - Initializes PRD document with product overview
  - Sets category to "Product" for first discussion

### Step 5: Interactive Chat Interface
- **Layout**: 2-column design
  - **Left**: Live PRD document with drop zones
  - **Right**: AI chat interface with category tabs
- **Category Tabs**:
  - **Product**: Features, UX, technical requirements
  - **Strategy**: Market positioning, success metrics
  - **Competitor**: Competitive analysis, differentiation
  - **Monetization**: Revenue models, pricing strategies

### Step 6: AI Response Pattern
- **User Input**: Ask questions about current category
- **AI Response**: Brief introduction ("Here are some ideas for your [product]...")
- **Suggestions**: 3-5 draggable cards appear below AI message
- **Card Format**:
  - Compact one-line title with impact score
  - Expandable details with full description
  - Category icon and implementation effort indicator
  - Drag handle for moving to PRD

## Phase 3: PRD Document Building

### Step 7: Drag-and-Drop Workflow
- **Process**:
  1. Read AI suggestion in chat
  2. Click expand arrow for full details
  3. Grab suggestion by drag handle
  4. Drag to appropriate PRD section
  5. Drop into highlighted drop zone
  6. Watch PRD auto-populate with suggestion

### Step 8: PRD Section Mapping
- **Key Features** (Green drop zone):
  - Drag product category suggestions
  - Features, functionality, user stories
  - Technical requirements and specifications
- **Success Metrics** (Purple drop zone):
  - Drag strategy category suggestions
  - KPIs, measurement criteria
  - Business objectives and goals
- **Monetization** (Yellow drop zone):
  - Drag monetization category suggestions
  - Revenue models, pricing strategies
  - Subscription tiers, payment methods

### Step 9: Iterative Development
- **Category Switching**:
  - Click different category tabs
  - Ask specific questions for each area
  - Collect suggestions for all aspects
- **Continuous Building**:
  - PRD grows with each dragged suggestion
  - Maintain conversation context
  - Build comprehensive product documentation

## Phase 4: Advanced Features

### Step 10: Suggestion Card Details
- **Compact View**:
  - One-line title for space efficiency
  - Impact score (1-10) display
  - Category icon and effort indicator
- **Expanded View** (Click down arrow):
  - Full feature description
  - Value proposition and usage scenarios
  - Implementation dependencies
  - Success metrics and risk assessment

### Step 11: PRD Document Features
- **Auto-Generated Elements**:
  - Product name (extracted from idea)
  - Professional description (AI-generated)
  - Target users (populated during discussion)
- **User-Populated Sections**:
  - Key features (from dragged suggestions)
  - Success metrics (from strategy discussions)
  - Monetization strategy (from revenue talks)

### Step 12: Session Management
- **Persistence**: All data saved to localStorage
- **Fresh Start**: "New Product" button clears session
- **Export**: Download PRD as markdown file
- **Continuation**: Resume session after browser refresh

## Phase 5: Completion & Export

### Step 13: PRD Review
- **Quality Check**:
  - Verify all sections are populated
  - Review dragged suggestions for completeness
  - Ensure comprehensive coverage of product aspects
- **Visual Indicators**:
  - Populated sections show organized content
  - Empty sections display helpful prompts
  - Color-coded organization for easy navigation

### Step 14: Export Process
- **Export Button**: "Export PRD" in header
- **Format**: Markdown file with structured sections
- **Content**: Complete PRD with all dragged suggestions
- **Filename**: `brainstorm_session_[date].md`

### Step 15: Next Steps
- **New Product**: Clear session and start fresh
- **Iteration**: Continue brainstorming for more ideas
- **Sharing**: Use exported PRD for stakeholder review
- **Implementation**: Begin development based on PRD

## Best Practices

### Effective Brainstorming
1. **Start Broad**: Begin with general product questions
2. **Get Specific**: Ask about particular features or use cases
3. **Cover All Categories**: Don't skip strategy or monetization
4. **Expand Details**: Click arrows to understand full suggestions
5. **Be Selective**: Only drag relevant, valuable suggestions

### PRD Quality
1. **Comprehensive Coverage**: Fill all major sections
2. **Balanced Content**: Mix high and low effort features
3. **Clear Metrics**: Include measurable success criteria
4. **Realistic Monetization**: Choose appropriate revenue models
5. **Export Early**: Save progress frequently

### AI Interaction
1. **Specific Questions**: Ask about particular aspects
2. **Context Building**: Reference previous suggestions
3. **Category Focus**: Stay on topic for current tab
4. **Follow-up**: Ask for variations or alternatives
5. **Clarification**: Request more details when needed

## Troubleshooting

### Common Issues
- **No Suggestions**: Check API key configuration
- **Generic Responses**: Ensure product idea is specific
- **Drag Not Working**: Verify browser drag-and-drop support
- **Session Lost**: Check localStorage permissions
- **Export Failed**: Ensure browser download permissions

### Performance Tips
- **Efficient Dragging**: Use compact view for quick scanning
- **Category Switching**: Complete one area before moving
- **Regular Export**: Save progress to prevent data loss
- **Browser Compatibility**: Use modern browsers for best experience
- **Network Stability**: Ensure stable internet for AI responses

## Success Metrics

### Session Completion Indicators
- **PRD Sections Filled**: All major areas populated
- **Suggestion Utilization**: High percentage of suggestions dragged
- **Category Coverage**: Discussion across all focus areas
- **Export Completion**: Successful PRD download
- **Time Efficiency**: Comprehensive PRD in 30-60 minutes

### Quality Indicators
- **Specific Suggestions**: AI provides product-relevant ideas
- **Detailed Expansion**: Full feature descriptions available
- **Organized Output**: Well-structured PRD document
- **Actionable Content**: Implementation-ready specifications
- **Professional Format**: Export-ready for stakeholder sharing
