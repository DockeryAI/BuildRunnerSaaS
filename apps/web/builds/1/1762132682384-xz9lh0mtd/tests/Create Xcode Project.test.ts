Here's a comprehensive set of unit tests for the XcodeProjectCreator component using Jest:

```typescript
import { XcodeProjectCreator } from './XcodeProjectCreator';
import { InstagramAPI } from '../apis/instagram';
import { Project, ProjectConfig } from '../types/project';

// Mock InstagramAPI
jest.mock('../apis/instagram');

describe('XcodeProjectCreator', () => {
  let xcodeProjectCreator: XcodeProjectCreator;
  let mockInstagramApi: jest.Mocked<InstagramAPI>;

  const validOptions = {
    name: 'TestProject',
    bundleId: 'com.test.project',
    teamId: 'ABC123',
    deploymentTarget: '14.0',
    devices: ['iPhone' as const],
    capabilities: ['push-notifications']
  };

  beforeEach(() => {
    mockInstagramApi = {
      getApiKey: jest.fn().mockResolvedValue('mock-api-key')
    } as any;
    xcodeProjectCreator = new XcodeProjectCreator(mockInstagramApi);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createProject', () => {
    it('should create a project successfully with valid options', async () => {
      const expectedProject: Project = {
        name: validOptions.name,
        path: `./projects/${validOptions.name}`,
        config: {
          ...validOptions,
          instagramApiKey: 'mock-api-key'
        }
      };

      const result = await xcodeProjectCreator.createProject(validOptions);
      expect(result).toEqual(expectedProject);
      expect(mockInstagramApi.getApiKey).toHaveBeenCalledTimes(1);
    });

    it('should throw error when Instagram API key retrieval fails', async () => {
      mockInstagramApi.getApiKey.mockRejectedValue(new Error('API Error'));

      await expect(xcodeProjectCreator.createProject(validOptions))
        .rejects
        .toThrow('Failed to create Xcode project: API Error');
    });

    describe('option validation', () => {
      it('should throw error when project name is missing', async () => {
        const invalidOptions = { ...validOptions, name: '' };
        
        await expect(xcodeProjectCreator.createProject(invalidOptions))
          .rejects
          .toThrow('Failed to create Xcode project: Project name is required');
      });

      it('should throw error when bundle ID is missing', async () => {
        const invalidOptions = { ...validOptions, bundleId: '' };
        
        await expect(xcodeProjectCreator.createProject(invalidOptions))
          .rejects
          .toThrow('Failed to create Xcode project: Bundle ID is required');
      });

      it('should throw error when deployment target is missing', async () => {
        const invalidOptions = { ...validOptions, deploymentTarget: '' };
        
        await expect(xcodeProjectCreator.createProject(invalidOptions))
          .rejects
          .toThrow('Failed to create Xcode project: Deployment target is required');
      });

      it('should throw error when no devices are specified', async () => {
        const invalidOptions = { ...validOptions, devices: [] };
        
        await expect(xcodeProjectCreator.createProject(invalidOptions))
          .rejects
          .toThrow('Failed to create Xcode project: At least one device type must be specified');
      });
    });
  });

  describe('private methods', () => {
    describe('createProjectDirectory', () => {
      it('should return correct project path', async () => {
        // @ts-ignore - accessing private method for testing
        const result = await xcodeProjectCreator.createProjectDirectory('TestProject');
        expect(result).toBe('./projects/TestProject');
      });
    });

    describe('generateProjectStructure', () => {
      it('should not throw error when called with valid parameters', async () => {
        const projectPath = './projects/TestProject';
        const config: ProjectConfig = {
          ...validOptions,
          instagramApiKey: 'mock-api-key'
        };

        await expect(
          // @ts-ignore - accessing private method for testing
          xcodeProjectCreator.generateProjectStructure(projectPath, config)
        ).resolves.not.toThrow();
      });
    });

    describe('createProjectFiles', () => {
      it('should not throw error when called with valid parameters', async () => {
        const projectPath = './projects/TestProject';
        const config: ProjectConfig = {
          ...validOptions,
          instagramApiKey: 'mock-api-key'
        };

        await expect(
          // @ts-ignore - accessing private method for testing
          xcodeProjectCreator.createProjectFiles(projectPath, config)
        ).resolves.not.toThrow();
      });
    });
  });

  describe('error handling', () => {
    it('should wrap and rethrow errors from project generation', async () => {
      // Mock implementation to force an error
      jest.spyOn(xcodeProjectCreator as any, 'generateXcodeProject')
        .mockRejectedValue(new Error('Generation failed'));

      await expect(xcodeProjectCreator.createProject(validOptions))
        .rejects
        .toThrow('Failed to create Xcode project: Generation failed');
    });
  });
});
```

This test suite includes:

1. Proper mocking of dependencies (InstagramAPI)
2. Testing of successful project creation
3. Validation of required options
4. Error handling scenarios
5. Testing of private methods (though normally you'd want to test through public interfaces)
6. Edge cases and error conditions

Key testing patterns used:

- `beforeEach`/`afterEach` for test setup and cleanup
- Mock implementations using Jest's mocking capabilities
- Async/await testing with `resolves`/`rejects` expectations
- Type safety with TypeScript
- Comprehensive error case coverage
- Testing of both public and private interfaces

To run these tests, you'll need to have Jest configured in your project with TypeScript support. You might also need to add the following to your Jest configuration to handle TypeScript paths and modules:

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
```

Remember to install the necessary dependencies:

```bash
npm install --save-dev jest @types/jest ts-jest
```