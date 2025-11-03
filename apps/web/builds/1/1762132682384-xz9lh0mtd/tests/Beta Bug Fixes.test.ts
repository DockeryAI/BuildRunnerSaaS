Here's a comprehensive set of unit tests for the BetaBugFixes component using Jest:

```typescript
import { BetaBugFixes } from './BetaBugFixes';

describe('BetaBugFixes', () => {
  let betaBugFixes: BetaBugFixes;

  beforeEach(() => {
    betaBugFixes = new BetaBugFixes();
  });

  describe('addBugFix', () => {
    it('should add a new bug fix with required fields', async () => {
      const bugFix = {
        description: 'Test bug fix',
        priority: 'high' as const,
      };

      const id = await betaBugFixes.addBugFix(bugFix);
      const added = await betaBugFixes.getBugFix(id);

      expect(added).toMatchObject({
        description: bugFix.description,
        priority: bugFix.priority,
        status: 'open',
      });
      expect(added.id).toBeDefined();
      expect(added.dateCreated).toBeInstanceOf(Date);
    });

    it('should throw error when description is missing', async () => {
      await expect(betaBugFixes.addBugFix({}))
        .rejects
        .toThrow('Failed to add bug fix: Bug fix description is required');
    });

    it('should use default medium priority when not specified', async () => {
      const id = await betaBugFixes.addBugFix({ description: 'Test bug' });
      const added = await betaBugFixes.getBugFix(id);
      
      expect(added.priority).toBe('medium');
    });
  });

  describe('updateBugFix', () => {
    let bugFixId: string;

    beforeEach(async () => {
      bugFixId = await betaBugFixes.addBugFix({
        description: 'Initial bug fix'
      });
    });

    it('should update existing bug fix', async () => {
      const updates = {
        description: 'Updated description',
        priority: 'high' as const,
      };

      await betaBugFixes.updateBugFix(bugFixId, updates);
      const updated = await betaBugFixes.getBugFix(bugFixId);

      expect(updated).toMatchObject(updates);
    });

    it('should throw error when updating non-existent bug fix', async () => {
      await expect(betaBugFixes.updateBugFix('non-existent', {}))
        .rejects
        .toThrow('Failed to update bug fix: Bug fix with ID non-existent not found');
    });

    it('should not allow updating the ID', async () => {
      const originalBugFix = await betaBugFixes.getBugFix(bugFixId);
      await betaBugFixes.updateBugFix(bugFixId, { id: 'new-id' });
      const updated = await betaBugFixes.getBugFix(bugFixId);
      
      expect(updated.id).toBe(originalBugFix.id);
    });
  });

  describe('getAllBugFixes', () => {
    beforeEach(async () => {
      await betaBugFixes.addBugFix({
        description: 'Bug 1',
        priority: 'high'
      });
      await betaBugFixes.addBugFix({
        description: 'Bug 2',
        priority: 'low'
      });
    });

    it('should retrieve all bug fixes', async () => {
      const fixes = await betaBugFixes.getAllBugFixes();
      expect(fixes).toHaveLength(2);
    });

    it('should filter bug fixes by criteria', async () => {
      const fixes = await betaBugFixes.getAllBugFixes({ priority: 'high' });
      expect(fixes).toHaveLength(1);
      expect(fixes[0].priority).toBe('high');
    });
  });

  describe('deleteBugFix', () => {
    it('should delete existing bug fix', async () => {
      const id = await betaBugFixes.addBugFix({
        description: 'To be deleted'
      });

      await betaBugFixes.deleteBugFix(id);
      
      await expect(betaBugFixes.getBugFix(id))
        .rejects
        .toThrow(`Bug fix with ID ${id} not found`);
    });

    it('should throw error when deleting non-existent bug fix', async () => {
      await expect(betaBugFixes.deleteBugFix('non-existent'))
        .rejects
        .toThrow('Failed to delete bug fix: Bug fix with ID non-existent not found');
    });
  });

  describe('resolveBugFix', () => {
    let bugFixId: string;

    beforeEach(async () => {
      bugFixId = await betaBugFixes.addBugFix({
        description: 'To be resolved'
      });
    });

    it('should mark bug fix as resolved', async () => {
      await betaBugFixes.resolveBugFix(bugFixId);
      const resolved = await betaBugFixes.getBugFix(bugFixId);

      expect(resolved.status).toBe('resolved');
      expect(resolved.dateResolved).toBeInstanceOf(Date);
    });

    it('should throw error when resolving non-existent bug fix', async () => {
      await expect(betaBugFixes.resolveBugFix('non-existent'))
        .rejects
        .toThrow('Failed to resolve bug fix: Bug fix with ID non-existent not found');
    });
  });

  describe('getStatistics', () => {
    beforeEach(async () => {
      const bug1 = await betaBugFixes.addBugFix({ description: 'Bug 1' });
      const bug2 = await betaBugFixes.addBugFix({ description: 'Bug 2' });
      await betaBugFixes.resolveBugFix(bug1);
    });

    it('should return correct statistics', async () => {
      const stats = await betaBugFixes.getStatistics();

      expect(stats).toMatchObject({
        total: 2,
        open: 1,
        resolved: 1,
      });
      expect(stats.averageResolutionTime).toBeDefined();
      expect(typeof stats.averageResolutionTime).toBe('number');
    });

    it('should handle empty bug fixes list', async () => {
      const emptyBugFixes = new BetaBugFixes();
      const stats = await emptyBugFixes.getStatistics();

      expect(stats).toEqual({
        total: 0,
        open: 0,
        resolved: 0,
        averageResolutionTime: undefined,
      });
    });
  });
});
```

This test suite includes:

1. Setup and teardown using `beforeEach`
2. Tests for all public methods
3. Edge cases and error conditions
4. Input validation
5. Data consistency checks
6. Statistics calculation verification

Key testing patterns used:

- Async/await for all asynchronous operations
- Error case testing using `expect().rejects.toThrow()`
- Object matching using `toMatchObject()`
- Type checking using `toBeInstanceOf()`
- Complex state setup for statistics testing
- Isolation between tests using fresh instances

Additional considerations:

1. You might want to add more specific tests for:
   - Different priority levels
   - Status transitions
   - Filter combinations
   - Edge cases in date calculations

2. You could mock `crypto.randomUUID()` if you want more predictable IDs in tests

3. Consider adding tests for concurrent operations if that's a concern in your application

4. You might want to add performance tests for large datasets if that's relevant

This test suite provides good coverage of the component's functionality while remaining maintainable and readable.