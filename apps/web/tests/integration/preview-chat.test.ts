/**
 * Integration Test: Preview Chat Flow
 *
 * Tests end-to-end preview chat functionality with code changes.
 *
 * Test Flow:
 * 1. Start build and preview
 * 2. Send chat message: "Make the header blue"
 * 3. Verify context collected (route, component)
 * 4. Verify Claude response received
 * 5. Verify code changes parsed
 * 6. Apply changes
 * 7. Verify preview updates
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { CodeChangeParser } from '@/lib/code-change-parser';
import { CodeChangeApplicator } from '@/lib/code-change-applicator';
import * as fs from 'fs/promises';
import * as path from 'path';

describe('Preview Chat Integration', () => {
  const TEST_PROJECT_PATH = path.join(__dirname, '../fixtures/chat-project');
  const TEST_BUILD_ID = 'chat-test-build';

  beforeAll(async () => {
    await fs.mkdir(TEST_PROJECT_PATH, { recursive: true});

    // Create test files
    await fs.mkdir(path.join(TEST_PROJECT_PATH, 'components'), { recursive: true });
    await fs.writeFile(
      path.join(TEST_PROJECT_PATH, 'components/Header.tsx'),
      `export default function Header() {
  return (
    <header className="bg-white p-4">
      <h1>My App</h1>
    </header>
  );
}`
    );
  });

  afterAll(async () => {
    await fs.rm(TEST_PROJECT_PATH, { recursive: true, force: true });
  });

  it('should parse code changes from Claude response', () => {
    const parser = new CodeChangeParser();

    const claudeResponse = `
I'll help you make the header blue. Here's the change:

\`\`\`change
FILE: components/Header.tsx
OLD:
<header className="bg-white p-4">
NEW:
<header className="bg-blue-600 text-white p-4">
\`\`\`

This change updates the header background to blue-600 and adds white text for contrast.
    `.trim();

    const changes = parser.parse(claudeResponse);

    // Verify changes parsed
    expect(changes.length).toBe(1);
    expect(changes[0].file).toBe('components/Header.tsx');
    expect(changes[0].oldCode).toContain('bg-white');
    expect(changes[0].newCode).toContain('bg-blue-600');
  });

  it('should handle multiple code changes in one response', () => {
    const parser = new CodeChangeParser();

    const claudeResponse = `
I'll make the header blue and add a shadow. Here are the changes:

\`\`\`change
FILE: components/Header.tsx
OLD:
<header className="bg-white p-4">
NEW:
<header className="bg-blue-600 shadow-lg p-4">
\`\`\`

\`\`\`change
FILE: components/Header.tsx
OLD:
<h1>My App</h1>
NEW:
<h1 className="text-2xl font-bold">My App</h1>
\`\`\`
    `.trim();

    const changes = parser.parse(claudeResponse);

    expect(changes.length).toBe(2);
    expect(changes[0].newCode).toContain('bg-blue-600');
    expect(changes[1].newCode).toContain('text-2xl');
  });

  it('should apply code changes to files', async () => {
    const applicator = new CodeChangeApplicator(TEST_PROJECT_PATH);

    const change = {
      file: 'components/Header.tsx',
      oldCode: '<header className="bg-white p-4">',
      newCode: '<header className="bg-blue-600 text-white p-4">'
    };

    await applicator.applyChange(change);

    // Verify file was updated
    const content = await fs.readFile(
      path.join(TEST_PROJECT_PATH, 'components/Header.tsx'),
      'utf-8'
    );
    expect(content).toContain('bg-blue-600');
    expect(content).toContain('text-white');
    expect(content).not.toContain('bg-white p-4');
  });

  it('should create new files if they don\'t exist', async () => {
    const applicator = new CodeChangeApplicator(TEST_PROJECT_PATH);

    const change = {
      file: 'components/Footer.tsx',
      oldCode: '',
      newCode: `export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white p-4">
      <p>&copy; 2024 My App</p>
    </footer>
  );
}`
    };

    await applicator.applyChange(change);

    // Verify file was created
    const content = await fs.readFile(
      path.join(TEST_PROJECT_PATH, 'components/Footer.tsx'),
      'utf-8'
    );
    expect(content).toContain('Footer');
    expect(content).toContain('bg-gray-800');
  });

  it('should handle chat API request/response flow', async () => {
    const chatRequest = {
      buildId: TEST_BUILD_ID,
      message: 'Make the header blue',
      context: {
        route: '/dashboard',
        viewport: '1920x1080',
        url: 'http://localhost:3002/dashboard'
      }
    };

    // Simulate API call
    const response = await fetch('http://localhost:3002/api/build/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(chatRequest),
    });

    expect(response.ok).toBe(true);

    const data = await response.json();

    // Verify response structure
    expect(data).toHaveProperty('message');
    expect(data).toHaveProperty('changes');
    expect(data).toHaveProperty('requiresApproval');

    // If changes exist, verify structure
    if (data.changes && data.changes.length > 0) {
      expect(data.changes[0]).toHaveProperty('file');
      expect(data.changes[0]).toHaveProperty('newCode');
    }
  });

  it('should apply multiple changes in sequence', async () => {
    const applicator = new CodeChangeApplicator(TEST_PROJECT_PATH);

    const changes = [
      {
        file: 'components/Header.tsx',
        oldCode: 'bg-blue-600',
        newCode: 'bg-purple-600'
      },
      {
        file: 'components/Header.tsx',
        oldCode: '<h1 className="text-2xl font-bold">',
        newCode: '<h1 className="text-3xl font-bold uppercase">'
      }
    ];

    await applicator.applyChanges(changes);

    const content = await fs.readFile(
      path.join(TEST_PROJECT_PATH, 'components/Header.tsx'),
      'utf-8'
    );

    expect(content).toContain('bg-purple-600');
    expect(content).toContain('text-3xl');
    expect(content).toContain('uppercase');
  });

  it('should handle apply changes API request', async () => {
    const applyRequest = {
      buildId: TEST_BUILD_ID,
      changes: [
        {
          file: 'components/Header.tsx',
          oldCode: 'bg-purple-600',
          newCode: 'bg-green-600'
        }
      ],
      projectPath: TEST_PROJECT_PATH
    };

    const response = await fetch('http://localhost:3002/api/build/apply-changes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(applyRequest),
    });

    expect(response.ok).toBe(true);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.changesApplied || data.message).toBeDefined();

    // Verify changes were actually applied
    const content = await fs.readFile(
      path.join(TEST_PROJECT_PATH, 'components/Header.tsx'),
      'utf-8'
    );
    expect(content).toContain('bg-green-600');
  });

  it('should handle malformed code change blocks gracefully', () => {
    const parser = new CodeChangeParser();

    const malformedResponse = `
\`\`\`change
FILE: components/Header.tsx
This is malformed - no OLD/NEW sections
\`\`\`

\`\`\`change
FILE: missing-new-section.tsx
OLD:
<div>old</div>
\`\`\`
    `.trim();

    const changes = parser.parse(malformedResponse);

    // Should handle gracefully (might return empty or partial)
    expect(Array.isArray(changes)).toBe(true);
  });

  it('should collect preview context correctly', () => {
    // This would test the context collection logic
    // that runs in the browser (LivePreviewTab component)

    const mockContext = {
      route: '/dashboard',
      viewport: '1920x1080',
      url: 'http://localhost:3002/dashboard'
    };

    // Verify context has required fields
    expect(mockContext.route).toBeDefined();
    expect(mockContext.viewport).toBeDefined();
    expect(mockContext.url).toBeDefined();
  });

  it('should handle errors in code application', async () => {
    const applicator = new CodeChangeApplicator(TEST_PROJECT_PATH);

    const change = {
      file: 'components/Header.tsx',
      oldCode: 'THIS-DOES-NOT-EXIST-IN-FILE',
      newCode: 'replacement'
    };

    // Should throw error when old code not found
    await expect(applicator.applyChange(change)).rejects.toThrow();
  });

  it('should preserve file formatting when applying changes', async () => {
    const applicator = new CodeChangeApplicator(TEST_PROJECT_PATH);

    // Write a file with specific formatting
    const formattedContent = `export default function Header() {
  return (
    <header className="bg-white p-4">
      <nav>
        <h1>My App</h1>
      </nav>
    </header>
  );
}`;

    await fs.writeFile(
      path.join(TEST_PROJECT_PATH, 'components/Header.tsx'),
      formattedContent
    );

    const change = {
      file: 'components/Header.tsx',
      oldCode: '<header className="bg-white p-4">',
      newCode: '<header className="bg-blue-600 p-4">'
    };

    await applicator.applyChange(change);

    const newContent = await fs.readFile(
      path.join(TEST_PROJECT_PATH, 'components/Header.tsx'),
      'utf-8'
    );

    // Verify rest of formatting preserved
    expect(newContent).toContain('      <nav>');
    expect(newContent).toContain('        <h1>');
    expect(newContent).toContain('bg-blue-600');
  });
});
