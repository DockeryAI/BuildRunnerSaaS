Here's a comprehensive set of unit tests for the TestFlightDistributionService component:

```typescript
import { TestFlightDistributionService } from './TestFlightDistributionService';

describe('TestFlightDistributionService', () => {
  const validConfig = {
    appId: 'com.test.app',
    apiKey: 'test-api-key',
    isExternalTesting: true,
    expirationDays: 30
  };

  let service: TestFlightDistributionService;

  beforeEach(() => {
    service = new TestFlightDistributionService(validConfig);
  });

  describe('constructor', () => {
    it('should create instance with valid config', () => {
      expect(service).toBeInstanceOf(TestFlightDistributionService);
    });

    it('should throw error when appId is missing', () => {
      const invalidConfig = { ...validConfig, appId: '' };
      expect(() => new TestFlightDistributionService(invalidConfig)).toThrow('App ID is required');
    });

    it('should throw error when apiKey is missing', () => {
      const invalidConfig = { ...validConfig, apiKey: '' };
      expect(() => new TestFlightDistributionService(invalidConfig)).toThrow('API key is required');
    });

    it('should use default expiration days when not provided', () => {
      const configWithoutExpiration = {
        appId: 'com.test.app',
        apiKey: 'test-api-key',
        isExternalTesting: true
      };
      const instance = new TestFlightDistributionService(configWithoutExpiration);
      expect(instance['config'].expirationDays).toBe(30);
    });
  });

  describe('inviteBetaTester', () => {
    const validTester = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe'
    };

    it('should successfully invite beta tester', async () => {
      const result = await service.inviteBetaTester(validTester);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should throw error when email is missing', async () => {
      const invalidTester = { ...validTester, email: '' };
      await expect(service.inviteBetaTester(invalidTester)).rejects.toThrow('Tester email is required');
    });

    it('should generate unique invitation IDs for different testers', async () => {
      const result1 = await service.inviteBetaTester(validTester);
      const result2 = await service.inviteBetaTester(validTester);
      expect(result1).not.toBe(result2);
    });
  });

  describe('distributeBuild', () => {
    const validBuildInfo = {
      buildNumber: '123',
      version: '1.0.0',
      notes: 'Test build'
    };

    it('should successfully distribute build', async () => {
      await expect(service.distributeBuild(validBuildInfo)).resolves.not.toThrow();
    });

    it('should distribute build to specific groups', async () => {
      const groupIds = ['group1', 'group2'];
      await expect(service.distributeBuild(validBuildInfo, groupIds)).resolves.not.toThrow();
    });

    it('should throw error when build number is missing', async () => {
      const invalidBuildInfo = { ...validBuildInfo, buildNumber: '' };
      await expect(service.distributeBuild(invalidBuildInfo)).rejects.toThrow('Build number is required');
    });

    it('should throw error when version is missing', async () => {
      const invalidBuildInfo = { ...validBuildInfo, version: '' };
      await expect(service.distributeBuild(invalidBuildInfo)).rejects.toThrow('Version number is required');
    });
  });

  describe('removeBetaTester', () => {
    it('should successfully remove beta tester', async () => {
      await expect(service.removeBetaTester('test@example.com')).resolves.not.toThrow();
    });

    it('should throw error when email is missing', async () => {
      await expect(service.removeBetaTester('')).rejects.toThrow('Tester email is required');
    });
  });

  // Testing private methods through public methods
  describe('private method behavior', () => {
    it('should validate build info before distribution', async () => {
      const invalidBuildInfo = {
        buildNumber: '',
        version: '',
        notes: 'Test'
      };
      await expect(service.distributeBuild(invalidBuildInfo)).rejects.toThrow('Build number is required');
    });

    it('should handle API errors gracefully', async () => {
      // Mock implementation to simulate API error
      jest.spyOn(service as any, 'uploadBuild').mockRejectedValue(new Error('API Error'));
      
      await expect(service.distributeBuild({
        buildNumber: '123',
        version: '1.0.0'
      })).rejects.toThrow('Failed to distribute build: API Error');
    });
  });

  // Mock integration tests
  describe('API integration', () => {
    beforeEach(() => {
      jest.spyOn(service as any, 'sendInvitation').mockResolvedValue(undefined);
      jest.spyOn(service as any, 'uploadBuild').mockResolvedValue(undefined);
      jest.spyOn(service as any, 'assignBuildToGroups').mockResolvedValue(undefined);
      jest.spyOn(service as any, 'notifyTesters').mockResolvedValue(undefined);
      jest.spyOn(service as any, 'deleteTesterAccess').mockResolvedValue(undefined);
    });

    it('should call all required methods during build distribution', async () => {
      const buildInfo = {
        buildNumber: '123',
        version: '1.0.0'
      };
      const groupIds = ['group1'];

      await service.distributeBuild(buildInfo, groupIds);

      expect(service['uploadBuild']).toHaveBeenCalledWith(buildInfo);
      expect(service['assignBuildToGroups']).toHaveBeenCalledWith(buildInfo.buildNumber, groupIds);
      expect(service['notifyTesters']).toHaveBeenCalledWith(buildInfo);
    });

    it('should call required methods during tester invitation', async () => {
      const tester = {
        email: 'test@example.com',
        firstName: 'John'
      };

      await service.inviteBetaTester(tester);

      expect(service['sendInvitation']).toHaveBeenCalled();
    });
  });
});
```

This test suite includes:

1. Constructor tests for proper initialization and validation
2. Tests for all public methods (inviteBetaTester, distributeBuild, removeBetaTester)
3. Error handling tests
4. Validation tests
5. Mock integration tests for API calls
6. Private method behavior testing through public methods
7. Edge cases and error conditions

Key testing patterns used:

- Before/after hooks for setup and teardown
- Mock implementations for API calls
- Async/await testing
- Error assertion testing
- Type checking
- Input validation testing
- Integration flow testing

To run these tests:

1. Make sure you have Jest installed in your project
2. Save the test file as `TestFlightDistributionService.test.ts`
3. Run `jest` or `npm test`

You might need to add these Jest configuration options to handle TypeScript:

```json
{
  "jest": {
    "preset": "ts-jest",
    "testEnvironment": "node",
    "moduleFileExtensions": ["ts", "tsx", "js", "jsx", "json", "node"]
  }
}
```