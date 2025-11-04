# Component Generation Fix - Implementation Plan

## Problem: AI generates non-working components
- Required props but used without props
- Invalid imports (@heroicons → lucide-react)
- No TypeScript validation
- Result: 0% demos work

## Solution: 3 Layers

### Layer 1: Smart Prompts (ai-component-generator.ts)
- ALL props optional with defaults
- lucide-react only
- Export demo component as default

### Layer 2: Validation (build-validator.ts - NEW)
- Run tsc after generation
- Auto-fix common errors
- Retry with error context

### Layer 3: Smart Pages (file-writer.ts)
- Tabs UI instead of dump
- Group by type

## Expected: 0% → 80% working builds
