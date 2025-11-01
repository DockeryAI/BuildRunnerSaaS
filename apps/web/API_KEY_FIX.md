# API Key Persistence Fix

## Issue Resolved

**Problem**: API keys entered in Settings page were not persisting or being used by the orchestration system.

**Root Cause**: The LLM Gateway was trying to use `process.env.OPENROUTER_API_KEY` which doesn't work in the browser. The Settings page correctly saved keys to localStorage, but the LLM Gateway wasn't reading from there.

## Fix Applied

Modified `lib/orchestration/llm-gateway.ts` (line 301-322) to:

1. **Read from localStorage when in browser**:
   ```typescript
   const savedKeys = localStorage.getItem('buildrunner_api_keys');
   const keys = JSON.parse(savedKeys);
   return keys.openrouter || keys.OPENROUTER_API_KEY;
   ```

2. **Fallback to environment variable on server**:
   ```typescript
   return process.env.OPENROUTER_API_KEY;
   ```

3. **Support both key naming conventions**:
   - `openrouter` (used by Settings page)
   - `OPENROUTER_API_KEY` (alternative format)

4. **Show clear error if no key found**:
   ```typescript
   if (!apiKey) {
     throw new Error('OpenRouter API key not configured. Please add it in Settings → API Keys.');
   }
   ```

## Your API Keys Will Now Persist ✅

### Storage Location
- **localStorage key**: `buildrunner_api_keys`
- **Format**: `{ "openrouter": "your-key-here", ... }`
- **Persistence**: Survives page reloads and app restarts

### What's Persisted
- OpenRouter API Key
- Supabase URL and keys
- GitHub token
- Crunchbase key (optional)
- ProductHunt key (optional)

### Will NOT Clear On
- ✅ Page reload
- ✅ Server restart
- ✅ Code changes (hot reload)
- ✅ Browser close/reopen
- ✅ App updates

### Will ONLY Clear On
- ❌ Manually clearing browser localStorage
- ❌ Explicitly clicking "Clear All" in browser settings
- ❌ Incognito/Private mode closing

## How to Add Your API Keys Now

### Option 1: Settings Page (Recommended)

1. **Go to Settings**:
   ```
   http://localhost:3005/settings/api-keys
   ```

2. **Enter your OpenRouter API key**
   - Paste key in "OpenRouter API Key" field
   - Click "Save Keys"
   - Keys are now saved to localStorage permanently

3. **Test the connection**
   - Click "Test" button next to the key
   - Should show green checkmark if valid

### Option 2: Browser Console (Quick Test)

```javascript
// Open browser console (F12) and run:
localStorage.setItem('buildrunner_api_keys', JSON.stringify({
  openrouter: 'sk-or-v1-your-actual-key-here'
}));

// Then refresh the page
location.reload();
```

### Option 3: Environment Variable (Server-side only)

Create `.env.local` in `/apps/web/`:

```bash
OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

This works for server-side rendering but not for client-side API calls.

## Verification

### Check if Keys are Saved

Open browser console and run:
```javascript
JSON.parse(localStorage.getItem('buildrunner_api_keys'))
```

Should show:
```json
{
  "openrouter": "sk-or-v1-...",
  "supabase_url": "https://...",
  "github_token": "ghp_..."
}
```

### Test Feature Extraction

1. Go to http://localhost:3005/create
2. Enter a product idea
3. Click "Extract Features with AI"
4. Should extract features without errors
5. Check console - should see "✅ anthropic/claude-haiku responded..."

## Technical Details

### Code Change Location
- **File**: `lib/orchestration/llm-gateway.ts`
- **Lines**: 301-322
- **Function**: `callModel()` → `getApiKey()`

### How It Works Now

```
Feature Extraction Request
    ↓
LLM Gateway.callModel()
    ↓
getApiKey() function:
  - Check if running in browser (typeof window !== 'undefined')
  - If browser: Read from localStorage.getItem('buildrunner_api_keys')
  - Parse JSON and get keys.openrouter or keys.OPENROUTER_API_KEY
  - If server: Use process.env.OPENROUTER_API_KEY
  - Throw error if no key found
    ↓
Use API key in OpenRouter request
    ↓
Feature extraction succeeds
```

### Backward Compatibility

The fix supports both naming conventions:
- `{ openrouter: "key" }` ← Settings page format
- `{ OPENROUTER_API_KEY: "key" }` ← Alternative format

So whether you entered keys before or after this fix, they will work.

## Summary

✅ **API keys NOW persist across**:
- Page reloads
- Server restarts
- Code changes
- Browser sessions

✅ **Settings page works correctly**:
- Keys save to localStorage
- Keys persist permanently
- LLM Gateway reads from localStorage

✅ **No more "No cookie auth credentials" errors**

✅ **Feature extraction will work after entering keys**

---

**Next Step**: Go to http://localhost:3005/settings/api-keys and enter your OpenRouter API key. It will persist from now on!
