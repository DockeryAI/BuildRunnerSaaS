# CRITICAL BuildRunner Issues - Must Fix Immediately

## Problem: BuildRunner generates code files, NOT runnable applications

### Current Broken Behavior:
- Generates 42 `.tsx` component files
- Generates service/API files
- **DOES NOT generate a working project structure**
- **CANNOT be run on iOS simulator**
- **CANNOT be deployed**
- **NOT A REAL APP**

### What's Missing for Mobile Apps (React Native/iOS):

#### 1. Project Structure Files
- ❌ `app.json` - Expo configuration
- ❌ `package.json` with correct dependencies (react-native, expo, navigation, etc.)
- ❌ `App.tsx` or `App.js` - Main entry point
- ❌ `index.js` - Metro bundler entry
- ❌ `metro.config.js` - Bundler configuration
- ❌ `babel.config.js` - Babel configuration
- ❌ `tsconfig.json` - TypeScript configuration for React Native

#### 2. Navigation Setup
- ❌ No navigation structure (React Navigation)
- ❌ No screen routing
- ❌ No tab navigation setup
- ❌ Components exist in isolation, not connected to navigation

#### 3. App Entry Point
- ❌ No main `App.tsx` that imports and renders components
- ❌ No root component structure
- ❌ Components can't actually be displayed

#### 4. Dependencies
- ❌ Missing `react-native`
- ❌ Missing `expo` or `@react-native-community/*` packages
- ❌ Missing `react-navigation`
- ❌ Missing all the actual libraries needed to run

#### 5. Build Configuration
- ❌ No iOS build configuration
- ❌ No Android build configuration
- ❌ Can't run `npx expo start`
- ❌ Can't open in iOS Simulator
- ❌ Can't build to `.ipa` or `.apk`

### What's Missing for Web Apps (Next.js):

#### 1. App Router Structure
- ❌ No `app/page.tsx` with actual component imports
- ❌ No `app/layout.tsx` properly configured
- ❌ Components not imported or rendered
- ❌ Just individual files, not assembled into pages

#### 2. Routing
- ❌ No route structure
- ❌ No page definitions
- ❌ Can't navigate between features

#### 3. State Management
- ❌ No context providers
- ❌ No state setup
- ❌ Components can't share data

## What BuildRunner MUST Do:

### For Mobile Apps:
1. **Detect app type from PRD** (iOS, Android, cross-platform)
2. **Generate complete Expo/React Native project structure**
   - Full `package.json` with ALL dependencies
   - `app.json` with bundle ID, app name, icons, splash
   - `App.tsx` that imports and renders generated components
   - Navigation setup connecting all screens
   - `metro.config.js`, `babel.config.js`, `tsconfig.json`

3. **Create runnable entry point**
   - Main App component that uses React Navigation
   - Tab navigator or Stack navigator
   - Connect all generated screens

4. **Generate build files**
   - `eas.json` for Expo builds
   - iOS configuration for native builds
   - Android configuration

5. **Result**: `npx expo start` should WORK immediately
   - Should open in iOS Simulator
   - Should open in Android Emulator
   - Should work in Expo Go app
   - Can build to `.ipa` or `.apk`

### For Web Apps:
1. **Detect framework** (Next.js, React, Vue, etc.)
2. **Generate complete Next.js App Router structure**
   - `app/page.tsx` that imports and renders components
   - `app/layout.tsx` with providers and metadata
   - Route pages for each major feature
   - `next.config.js`

3. **Create working navigation**
   - Link components between pages
   - Menu/navigation component
   - Proper routing setup

4. **Result**: `npm run dev` should WORK immediately
   - App loads at localhost:3000
   - Can navigate between features
   - All components render correctly

## Implementation Requirements:

### File Writer Enhancement Needed:
```typescript
// BuildFileWriter needs:
class BuildFileWriter {
  async initializeProject(type: 'mobile' | 'web', framework: string) {
    // Create complete project structure
    // Install dependencies
    // Configure build tools
  }

  async createEntryPoint(components: Component[]) {
    // Create App.tsx/page.tsx that imports ALL components
    // Set up navigation
    // Wire up state management
  }

  async generateRunConfiguration() {
    // Create package.json with run scripts
    // Create build configuration
    // Create deployment configuration
  }
}
```

### Orchestrator Enhancement Needed:
```typescript
// After generating all components:
await fileWriter.assembleApplication({
  components: generatedComponents,
  appType: 'mobile', // or 'web'
  framework: 'expo', // or 'next', 'react-native'
  navigation: 'tabs', // or 'stack', 'drawer'
});
```

## Files to Modify:

1. **lib/file-writer.ts**
   - Add `initializeProject()` method
   - Add `createAppStructure()` method
   - Add framework-specific templates
   - Add navigation setup logic

2. **lib/build-orchestrator.ts**
   - After `buildComponents()`, call `assembleApplication()`
   - Verify app can run before marking build complete
   - Test that `npm run dev` or `npx expo start` works

3. **Add new directory: `lib/templates/`**
   - `templates/expo/` - Expo project templates
   - `templates/react-native/` - RN templates
   - `templates/nextjs/` - Next.js templates
   - Each with `package.json`, config files, entry points

## Success Criteria:

✅ User runs build → Gets complete app
✅ For mobile: `cd build && npx expo start` → App opens in simulator
✅ For web: `cd build && npm run dev` → App opens at localhost:3000
✅ All generated components are imported and usable
✅ Navigation works between screens/pages
✅ App can be built and deployed (ipa/apk/vercel)

## Current State:
❌ BuildRunner generates loose files
❌ Cannot run the app
❌ Cannot test the app
❌ Cannot deploy the app
❌ **NOT PRODUCTION READY**

## Priority: P0 - CRITICAL
This makes BuildRunner unusable for its core purpose. Must be fixed before any other features.
