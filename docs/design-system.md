# BuildRunner Design System Guide

This guide covers the BuildRunner Design System integration with Figma, including design token synchronization, component parity checks, and visual regression testing.

## Table of Contents

- [Overview](#overview)
- [Setup & Configuration](#setup--configuration)
- [Design Token Sync](#design-token-sync)
- [Component Parity](#component-parity)
- [Visual Regression Testing](#visual-regression-testing)
- [Workflow & Commands](#workflow--commands)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)

## Overview

The BuildRunner Design System provides:

- **Design Token Sync**: Automatic synchronization of colors, typography, spacing, and other design tokens from Figma
- **Component Parity**: Mapping and validation between Figma components and React components
- **Visual Regression**: Automated visual testing to ensure design consistency
- **Governance**: Policy-driven design system compliance and drift detection

## Setup & Configuration

### Environment Variables

Add the following environment variables (server-side only):

```bash
# Figma Integration (Server-Only)
FIGMA_PROJECT_ID=your-figma-project-id
FIGMA_FILE_ID=your-figma-file-id
FIGMA_TOKEN=your-figma-access-token
```

### Figma Access Token

1. Go to Figma → Settings → Account → Personal Access Tokens
2. Generate a new token with appropriate permissions
3. Add the token to your environment variables

**Security Note**: Figma tokens are server-side only and never exposed to the client.

### File Structure

```
design/
├── tokens.json              # Generated design tokens
├── theme.config.ts          # Tailwind theme configuration
├── component-map.json       # Figma ↔ React component mapping
└── reports/                 # Parity and drift reports
    ├── component-parity.json
    └── patch.md

scripts/design/
├── fetch-figma-tokens.ts    # Fetch tokens from Figma
├── generate-theme.ts        # Generate Tailwind theme
├── sync.ts                  # Complete sync workflow
└── check-component-parity.ts # Component drift detection
```

## Design Token Sync

### Fetching Tokens

```bash
# Fetch design tokens from Figma
npm run design:fetch

# Generate Tailwind theme from tokens
npm run design:generate

# Complete sync workflow
npm run design:sync
```

### Token Categories

The system automatically categorizes tokens:

- **Colors**: Brand colors, semantic colors, state colors
- **Typography**: Font families, sizes, weights, line heights
- **Spacing**: Margins, paddings, gaps
- **Radius**: Border radius values
- **Shadows**: Box shadow definitions

### Token Normalization

Tokens are normalized for CSS/Tailwind usage:

```json
{
  "colors": {
    "primary": {
      "name": "primary",
      "value": "#3b82f6",
      "type": "color",
      "category": "colors",
      "description": "Primary brand color"
    }
  },
  "spacing": {
    "md": {
      "name": "md",
      "value": "1rem",
      "type": "spacing",
      "category": "spacing",
      "description": "Medium spacing"
    }
  }
}
```

### CSS Variables

Generated CSS variables are available:

```css
:root {
  /* Colors */
  --color-primary: #3b82f6;
  --color-secondary: #64748b;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  
  /* Border Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
}
```

### Tailwind Integration

The generated theme extends your Tailwind configuration:

```typescript
// tailwind.config.ts
import { designSystemTheme } from "./design/theme.config";

export default {
  theme: {
    extend: designSystemTheme
  }
}
```

## Component Parity

### Component Mapping

The `design/component-map.json` file maps Figma components to React components:

```json
{
  "button-primary": {
    "figmaComponentId": "1:123",
    "reactComponent": "components/ui/button.tsx",
    "exportName": "Button",
    "variants": {
      "variant": ["default", "destructive", "outline"],
      "size": ["default", "sm", "lg"]
    },
    "props": {
      "variant": "string",
      "size": "string",
      "disabled": "boolean"
    }
  }
}
```

### Parity Checking

```bash
# Check component parity
tsx scripts/design/check-component-parity.ts

# Generate patch suggestions
# Results in design/reports/patch.md
```

### Drift Detection

The system detects:
- Missing components in React that exist in Figma
- Extra components in React not found in Figma
- Variant mismatches between Figma and React
- Prop type inconsistencies

## Visual Regression Testing

### Screenshot Tests

Visual regression tests capture component screenshots:

```typescript
// apps/web/tests/visual/components.spec.ts
import { test, expect } from '@playwright/test';

test('Button component visual regression', async ({ page }) => {
  await page.goto('/design-system');
  
  // Capture button variants
  await expect(page.locator('[data-testid="button-default"]')).toHaveScreenshot('button-default.png');
  await expect(page.locator('[data-testid="button-outline"]')).toHaveScreenshot('button-outline.png');
});
```

### Similarity Threshold

Configure visual regression sensitivity in `governance/policy.yml`:

```yaml
design_system:
  visual_regression:
    similarity_threshold: 0.95
    pixel_diff_threshold: 100
```

### Running Visual Tests

```bash
# Install Playwright
npx playwright install

# Run visual regression tests
cd apps/web
npx playwright test tests/visual/

# Update screenshots (when design changes are intentional)
npx playwright test tests/visual/ --update-snapshots
```

## Workflow & Commands

### Daily Workflow

1. **Check for design updates**:
   ```bash
   npm run design:sync
   ```

2. **Review changes**:
   - Check `design/tokens.json` for token updates
   - Review generated `design/theme.config.ts`
   - Examine parity reports in `design/reports/`

3. **Update components** (if needed):
   - Address component parity issues
   - Update React components to match Figma designs
   - Run visual regression tests

4. **Commit changes**:
   ```bash
   git add design/ apps/web/styles/
   git commit -m "design: sync tokens and update theme"
   ```

### Sync Options

```bash
# Force sync even if no changes detected
npm run design:sync --force

# Skip build step for faster sync
npm run design:sync --skip-build

# Verbose output for debugging
npm run design:sync --verbose

# Get help
npm run design:sync --help
```

### Environment Verification

```bash
# Verify environment variables
npm run verify:env
```

## CI/CD Integration

### GitHub Actions

The design parity workflow runs automatically:

```yaml
# .github/workflows/design-parity.yml
name: Design Parity Check

on:
  pull_request:
    paths:
      - 'design/**'
      - 'apps/web/components/ui/**'
      - 'apps/web/styles/**'
```

### Workflow Steps

1. **Token Sync**: Fetch latest tokens from Figma
2. **Theme Generation**: Update Tailwind configuration
3. **Component Parity**: Check for drift between Figma and React
4. **Visual Regression**: Run screenshot tests
5. **Report Generation**: Create parity and drift reports

### PR Comments

The workflow automatically comments on PRs with:
- Design token summary
- Component parity score
- Visual regression results
- Next steps and recommendations

## Governance Integration

### Policy Configuration

Design system governance is configured in `governance/policy.yml`:

```yaml
design_system:
  design_parity_required: true
  design_token_threshold: 95
  
  component_parity:
    enforce_figma_mapping: true
    require_component_docs: true
    allowed_drift_percentage: 5
  
  token_sync:
    auto_sync_enabled: false
    require_manual_approval: true
```

### Compliance Checks

- **Token Threshold**: Minimum percentage of tokens that must be synced
- **Component Mapping**: Enforce Figma component mapping
- **Drift Limits**: Maximum allowed drift percentage
- **Manual Approval**: Require approval for automatic syncs

## Troubleshooting

### Common Issues

1. **Figma API Authentication Failed**
   ```bash
   # Check token validity
   curl -H "X-Figma-Token: $FIGMA_TOKEN" \
        https://api.figma.com/v1/me
   ```

2. **No Tokens Found**
   - Verify Figma file contains design tokens/variables
   - Check file permissions and access
   - Ensure file ID is correct

3. **Build Failures After Token Sync**
   ```bash
   # Check Tailwind configuration
   cd apps/web
   npm run build
   
   # Verify CSS variables
   grep -r "var(--" apps/web/styles/
   ```

4. **Component Parity Failures**
   - Review `design/reports/component-parity.json`
   - Update component mapping in `design/component-map.json`
   - Ensure React components match Figma variants

5. **Visual Regression Failures**
   ```bash
   # View test results
   npx playwright show-report
   
   # Update snapshots if changes are intentional
   npx playwright test --update-snapshots
   ```

### Debug Mode

Enable verbose logging:

```bash
# Detailed sync output
npm run design:sync --verbose

# Debug Figma API calls
DEBUG=figma npm run design:fetch
```

### Manual Token Inspection

```bash
# View current tokens
cat design/tokens.json | jq '.tokens.colors'

# Check token checksum
cat design/tokens.json | jq '.checksum'

# Compare with previous version
git diff HEAD~1 design/tokens.json
```

### Support Escalation

For design system issues:

1. **Level 1**: Check this documentation and troubleshooting guide
2. **Level 2**: Review GitHub Actions workflow logs
3. **Level 3**: Create issue with design parity report attached
4. **Level 4**: Contact design system team with Figma file access

### Best Practices

1. **Regular Syncs**: Run `npm run design:sync` daily or before major releases
2. **Version Control**: Always commit token changes with descriptive messages
3. **Testing**: Run visual regression tests after design updates
4. **Documentation**: Update component documentation when adding new variants
5. **Collaboration**: Coordinate with design team on token structure changes

---

For additional help, see the [Figma API Documentation](https://www.figma.com/developers/api) or contact the BuildRunner design team.
