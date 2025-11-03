```typescript
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Test suite for core business logic
 */
describe('Core Logic Unit Tests', () => {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('Data Processing', () => {
    /**
     * Tests data transformation functionality
     */
    it('should transform data correctly', () => {
      const input = { foo: 'bar' };
      const expected = { foo: 'BAR' };
      
      const result = transformData(input);
      expect(result).to.deep.equal(expected);
    });

    /**
     * Tests error handling during data processing
     */
    it('should handle invalid input gracefully', () => {
      const invalidInput = null;
      
      expect(() => transformData(invalidInput)).to.throw(Error);
    });
  });

  describe('Business Rules', () => {
    /**
     * Tests core business rule validation
     */
    it('should validate business rules correctly', () => {
      const validData = {
        id: '123',
        status: 'active',
        value: 100
      };

      const result = validateBusinessRules(validData);
      expect(result.isValid).to.be.true;
    });

    /**
     * Tests business rule violation handling
     */
    it('should detect business rule violations', () => {
      const invalidData = {
        id: '123',
        status: 'invalid_status',
        value: -1
      };

      const result = validateBusinessRules(invalidData);
      expect(result.isValid).to.be.false;
      expect(result.errors).to.have.length.greaterThan(0);
    });
  });

  describe('Integration Tests', () => {
    let mockService: sinon.SinonStubbedInstance<any>;

    beforeEach(() => {
      mockService = sandbox.createStubInstance(ExternalService);
    });

    /**
     * Tests integration with external services
     */
    it('should handle external service integration', async () => {
      const expectedResponse = { success: true };
      mockService.process.resolves(expectedResponse);

      const result = await processWithExternalService(mockService, { data: 'test' });
      expect(result).to.deep.equal(expectedResponse);
    });

    /**
     * Tests error handling for external service failures
     */
    it('should handle external service failures', async () => {
      mockService.process.rejects(new Error('Service unavailable'));

      try {
        await processWithExternalService(mockService, { data: 'test' });
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error).to.be.instanceOf(Error);
        expect(error.message).to.equal('Service unavailable');
      }
    });
  });
});

/**
 * Transforms input data according to business rules
 * @param input Input data to transform
 * @throws {Error} If input is invalid
 */
function transformData<T>(input: T): T {
  if (!input) {
    throw new Error('Invalid input');
  }

  // Implementation would go here
  return input;
}

/**
 * Validates data against business rules
 * @param data Data to validate
 */
function validateBusinessRules(data: any): { isValid: boolean; errors?: string[] } {
  const errors: string[] = [];

  if (!data.id) {
    errors.push('ID is required');
  }

  if (!['active', 'inactive', 'pending'].includes(data.status)) {
    errors.push('Invalid status');
  }

  if (typeof data.value !== 'number' || data.value < 0) {
    errors.push('Invalid value');
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

/**
 * Processes data with external service
 * @param service External service instance
 * @param data Data to process
 */
async function processWithExternalService(
  service: any,
  data: unknown
): Promise<unknown> {
  try {
    return await service.process(data);
  } catch (error) {
    throw error;
  }
}

/**
 * Mock external service class
 */
class ExternalService {
  public async process(data: unknown): Promise<unknown> {
    return Promise.resolve(data);
  }
}

export {
  transformData,
  validateBusinessRules,
  processWithExternalService,
  ExternalService
};
```