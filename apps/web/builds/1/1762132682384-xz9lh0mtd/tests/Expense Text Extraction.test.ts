Here's a comprehensive set of unit tests for the ExpenseTextExtraction component:

```typescript
import { ExpenseTextExtraction } from './ExpenseTextExtraction';

describe('ExpenseTextExtraction', () => {
  let extractor: ExpenseTextExtraction;

  beforeEach(() => {
    extractor = new ExpenseTextExtraction({
      categories: ['Groceries', 'Entertainment', 'Travel']
    });
  });

  describe('constructor', () => {
    it('should initialize with default config when no config provided', () => {
      const defaultExtractor = new ExpenseTextExtraction();
      expect(defaultExtractor['config']).toEqual({
        locale: 'en-US',
        dateFormat: 'MM/DD/YYYY',
        currency: 'USD',
        categories: []
      });
    });

    it('should merge provided config with defaults', () => {
      expect(extractor['config']).toEqual({
        locale: 'en-US',
        dateFormat: 'MM/DD/YYYY',
        currency: 'USD',
        categories: ['Groceries', 'Entertainment', 'Travel']
      });
    });
  });

  describe('extractExpense', () => {
    it('should successfully extract complete expense data', async () => {
      const text = 'Walmart Groceries $52.99 on 12/25/2023';
      const result = await extractor.extractExpense(text);

      expect(result).toEqual({
        amount: 52.99,
        date: new Date('2023-12-25'),
        vendor: 'Walmart',
        category: 'Groceries',
        description: 'Walmart Groceries'
      });
    });

    it('should throw error for invalid input', async () => {
      await expect(extractor.extractExpense('')).rejects.toThrow('Invalid input text');
      await expect(extractor.extractExpense(null as any)).rejects.toThrow('Invalid input text');
    });

    it('should handle text without optional fields', async () => {
      const text = '$25.00 12/25/2023';
      const result = await extractor.extractExpense(text);

      expect(result).toEqual({
        amount: 25.00,
        date: new Date('2023-12-25')
      });
    });
  });

  describe('extractAmount', () => {
    it('should extract amount with dollar sign', () => {
      expect(extractor['extractAmount']('$52.99')).toBe(52.99);
    });

    it('should extract amount without dollar sign', () => {
      expect(extractor['extractAmount']('52.99')).toBe(52.99);
    });

    it('should extract whole numbers', () => {
      expect(extractor['extractAmount']('$52')).toBe(52);
    });

    it('should throw error for invalid amount', () => {
      expect(() => extractor['extractAmount']('no amount')).toThrow('Could not find valid amount in text');
    });
  });

  describe('extractDate', () => {
    it('should extract valid date', () => {
      const result = extractor['extractDate']('12/25/2023');
      expect(result).toEqual(new Date('2023-12-25'));
    });

    it('should handle single digit month/day', () => {
      const result = extractor['extractDate']('1/5/2023');
      expect(result).toEqual(new Date('2023-1-5'));
    });

    it('should throw error for invalid date format', () => {
      expect(() => extractor['extractDate']('2023-12-25')).toThrow('Could not find valid date in text');
    });
  });

  describe('extractCategory', () => {
    it('should extract matching category', () => {
      expect(extractor['extractCategory']('Groceries purchase')).toBe('Groceries');
    });

    it('should be case insensitive', () => {
      expect(extractor['extractCategory']('groceries purchase')).toBe('Groceries');
    });

    it('should return undefined for no matching category', () => {
      expect(extractor['extractCategory']('Random purchase')).toBeUndefined();
    });

    it('should return undefined when no categories configured', () => {
      const noCategoryExtractor = new ExpenseTextExtraction();
      expect(noCategoryExtractor['extractCategory']('Groceries')).toBeUndefined();
    });
  });

  describe('extractVendor', () => {
    it('should extract capitalized vendor name', () => {
      expect(extractor['extractVendor']('Walmart purchase')).toBe('Walmart');
    });

    it('should extract multi-word vendor name', () => {
      expect(extractor['extractVendor']('Target Super Store')).toBe('Target Super Store');
    });

    it('should return undefined for no vendor match', () => {
      expect(extractor['extractVendor']('purchase at store')).toBeUndefined();
    });
  });

  describe('extractDescription', () => {
    it('should extract description excluding amount and date', () => {
      const result = extractor['extractDescription']('Walmart Groceries $52.99 12/25/2023');
      expect(result).toBe('Walmart Groceries');
    });

    it('should return undefined for empty description', () => {
      const result = extractor['extractDescription']('$52.99 12/25/2023');
      expect(result).toBeUndefined();
    });
  });

  describe('updateConfig', () => {
    it('should update existing config', () => {
      extractor.updateConfig({ locale: 'en-GB', currency: 'GBP' });
      expect(extractor['config']).toEqual({
        locale: 'en-GB',
        dateFormat: 'MM/DD/YYYY',
        currency: 'GBP',
        categories: ['Groceries', 'Entertainment', 'Travel']
      });
    });

    it('should preserve existing config values not specified in update', () => {
      extractor.updateConfig({ locale: 'en-GB' });
      expect(extractor['config'].currency).toBe('USD');
    });
  });
});
```

This test suite includes:

1. Constructor tests for default and custom configurations
2. Integration tests for the main `extractExpense` method
3. Unit tests for each private extraction method
4. Error handling tests
5. Edge cases and boundary conditions
6. Configuration update tests

Key testing patterns used:

- Before each test, a new instance is created with standard test categories
- Private methods are accessed using bracket notation with TypeScript's type system
- Async/await testing for the main extraction method
- Error cases are tested using expect().rejects.toThrow()
- Various input formats and scenarios are tested
- Both successful and failure cases are covered
- Config updates are verified to work correctly

The tests cover all the main functionality while maintaining good isolation between test cases. Each test focuses on a specific aspect of the functionality, making it easier to identify issues when tests fail.