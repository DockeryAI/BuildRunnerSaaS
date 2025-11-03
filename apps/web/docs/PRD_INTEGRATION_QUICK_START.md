# PRD Integration - Quick Start Guide

## For Developers

### Quick Links
- **API Routes**: `/app/api/prd/update-from-preview/route.ts`
- **Components**: `/components/PRDSuggestionsPanel.tsx`
- **AI Engine**: `/lib/ai-suggestions.ts`
- **PRD Utilities**: `/lib/prd-updater.ts`

### Test the Integration

1. **Start the preview system**:
   ```bash
   npm run dev
   ```

2. **Open Interactive Preview**:
   - Navigate to a build's preview page
   - You should see two tabs: "Feedback" and "PRD"

3. **Test Feedback to PRD Flow**:
   ```
   a. Click "Feedback" tab
   b. Submit feedback (type: feature)
   c. Click "Auto-Fix"
   d. Approve the changes
   e. Click "Add to PRD"
   f. Verify success message
   ```

4. **Test AI Suggestions**:
   ```
   a. Click "PRD" tab
   b. Wait for AI suggestions to generate (auto, or click refresh)
   c. Click "Preview" to see full description
   d. Click "Add to PRD" to accept
   e. Click "Dismiss" to reject
   ```

### Common Use Cases

#### Use Case 1: Add Custom Suggestion Rule

Edit `/lib/ai-suggestions.ts`:

```typescript
// Add to initializeRules() array
{
  name: 'my-custom-rule',
  condition: (ctx) => {
    // Your condition logic
    return !this.hasFeatureKeyword(ctx.implementedFeatures, 'myFeature');
  },
  generate: (ctx) => [{
    title: 'My Custom Suggestion',
    description: 'Description here...',
    type: 'new_feature',
    priority: 'medium',
    suggestedBy: 'ai',
    status: 'pending',
  }],
}
```

#### Use Case 2: Customize Suggestion Display

Edit `/components/PRDSuggestionsPanel.tsx`:

```typescript
// Modify the suggestion card rendering
<div className="border border-gray-200 rounded-lg">
  {/* Add custom fields */}
  <div className="p-3">
    <h4>{suggestion.title}</h4>
    <p>{suggestion.description}</p>
    {/* Your custom content */}
  </div>
</div>
```

#### Use Case 3: Add New API Endpoint

Edit `/app/api/prd/update-from-preview/route.ts`:

```typescript
// Add new method handler
export async function PATCH(request: NextRequest) {
  // Your custom logic
}
```

#### Use Case 4: Integrate with Database

Replace in-memory storage:

```typescript
// Before (in-memory)
const suggestionsStore = new Map<string, PRDFeature[]>();

// After (database)
import { db } from '@/lib/db';

async function getSuggestions(projectId: string, buildId: string) {
  return await db.prdSuggestions.findMany({
    where: { projectId, buildId, dismissedAt: null }
  });
}
```

### Configuration Options

#### Polling Interval

Change in `/components/PRDSuggestionsPanel.tsx`:

```typescript
// Default: 30 seconds
const interval = setInterval(() => {
  fetchSuggestions(true);
  generateAISuggestions();
}, 30000); // Change this value (in milliseconds)
```

#### Suggestion Limit

Change in `/lib/ai-suggestions.ts`:

```typescript
// In deduplicate() method
return unique.slice(0, 10); // Limit to 10 suggestions
```

#### Priority Thresholds

Change in `/lib/ai-suggestions.ts`:

```typescript
// Adjust thresholds for pattern detection
if (items.length >= 5) { // Change from 3 to 5
  priority = 'high';
}
```

### Debugging Tips

#### Enable Detailed Logging

Add to API route:

```typescript
console.log('[PRD API] Request:', {
  projectId,
  buildId,
  suggestionCount: suggestions.length
});
```

#### Check Network Requests

Open browser DevTools → Network tab:
- Filter by "prd"
- Look for status codes
- Check request/response payloads

#### Verify State Updates

Add to component:

```typescript
useEffect(() => {
  console.log('[PRD Panel] State:', {
    suggestions: suggestions.length,
    loading,
    activeTab
  });
}, [suggestions, loading]);
```

### Common Issues & Solutions

#### Issue: Suggestions not appearing

**Solution**:
1. Check browser console for errors
2. Verify API endpoint is accessible: `curl http://localhost:3000/api/prd/update-from-preview?projectId=1&buildId=1`
3. Check if feedback exists: `curl http://localhost:3000/api/build/feedback?projectId=1&buildId=1`

#### Issue: "Add to PRD" button not showing

**Solution**:
1. Verify feedback is type "feature"
2. Check feedback status is "verified"
3. Inspect FeedbackItem component state

#### Issue: Duplicate suggestions

**Solution**:
1. Check `deduplicate()` function in ai-suggestions.ts
2. Verify suggestion titles are unique
3. Clear in-memory store: restart server

#### Issue: Slow suggestion generation

**Solution**:
1. Profile with `console.time()/timeEnd()`
2. Check feedback count (optimize if > 1000)
3. Consider caching strategy
4. Use async/await properly

### Performance Monitoring

Add timing metrics:

```typescript
// In PRDSuggestionsPanel
const generateAISuggestions = async () => {
  const start = performance.now();

  try {
    await fetch('/api/prd/update-from-preview/generate', {
      method: 'PUT',
      // ...
    });
  } finally {
    const duration = performance.now() - start;
    console.log(`[Perf] AI generation took ${duration}ms`);
  }
};
```

### Extension Points

#### 1. Custom Suggestion Sources

Add new suggestion sources:

```typescript
// In AISuggestionsGenerator
async generateFromExternal(url: string): Promise<PRDFeature[]> {
  const response = await fetch(url);
  const data = await response.json();
  return data.suggestions;
}
```

#### 2. Webhook Integration

Trigger on PRD update:

```typescript
// In API route after successful add
await fetch(WEBHOOK_URL, {
  method: 'POST',
  body: JSON.stringify({
    event: 'prd_updated',
    feature,
    projectId,
  }),
});
```

#### 3. Notification System

Notify users of new suggestions:

```typescript
// When new suggestions generated
if (suggestions.length > previousCount) {
  showNotification('info', `${suggestions.length - previousCount} new suggestions available`);
}
```

### Testing Checklist

- [ ] Submit feedback → verify appears in list
- [ ] Click Auto-Fix → verify status changes
- [ ] Approve fix → verify "Add to PRD" appears
- [ ] Click "Add to PRD" → verify success
- [ ] Switch to PRD tab → verify suggestions load
- [ ] Wait 30s → verify auto-refresh works
- [ ] Click Preview → verify expands correctly
- [ ] Click Dismiss → verify removes suggestion
- [ ] Refresh page → verify state persists
- [ ] Test with multiple users → verify isolation

### Code Style Guidelines

1. **Component naming**: Use PascalCase (e.g., `PRDSuggestionsPanel`)
2. **File naming**: Use kebab-case (e.g., `ai-suggestions.ts`)
3. **Props**: Use TypeScript interfaces
4. **State**: Group related state together
5. **API responses**: Always include `success` boolean
6. **Error handling**: Use try/catch with specific error messages
7. **Loading states**: Show spinners for async operations
8. **Comments**: Document complex logic

### Useful Commands

```bash
# Run type check
npx tsc --noEmit

# Lint code
npm run lint

# Format code
npm run format

# Build for production
npm run build

# Test API endpoint
curl -X POST http://localhost:3000/api/prd/update-from-preview \
  -H "Content-Type: application/json" \
  -d '{"projectId":"1","buildId":"1","feature":{...}}'

# Watch for changes
npm run dev
```

### Key Dependencies

- **Next.js 14**: App router and API routes
- **React 18**: Components and hooks
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Lucide React**: Icons

### Environment Variables

No additional env vars required for basic functionality.

Optional for enhancements:
```env
# For external AI services
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# For webhooks
PRD_WEBHOOK_URL=https://...
```

### Architecture Notes

- **Client-side**: React components with local state
- **Server-side**: Next.js API routes (serverless)
- **Storage**: In-memory (Map) - migrate to DB for production
- **Real-time**: Polling (30s interval) - consider WebSockets
- **AI**: Rule-based + pattern detection - consider LLM integration

### Next Steps

1. **Test thoroughly** with various scenarios
2. **Gather feedback** from users
3. **Monitor performance** metrics
4. **Plan database migration** when ready
5. **Consider Claude API** integration for advanced NLP
6. **Add analytics** to track usage patterns

### Support

For questions or issues:
1. Check existing feedback system
2. Review component props and state
3. Inspect network requests
4. Check server logs
5. Consult documentation files

Happy coding!
