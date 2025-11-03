Here's a comprehensive set of unit tests for the ProjectSetup component using Jest:

```typescript
// projectSetup.test.ts

import { ProjectSetup, createDefaultSetup } from './projectSetup';
import * as fs from 'fs';
import * as path from 'path';
import rimraf from 'rimraf';

jest.mock('fs');
jest.mock('path');
jest.mock('rimraf');

describe('ProjectSetup', () => {
  const mockConfig = {
    name: 'test-project',
    rootDir: '/test/path',
    directories: ['src', 'tests'],
    files: [
      {
        path: 'package.json',
        content: '{"name": "test-project"}'
      }
    ]
  };

  let projectSetup: ProjectSetup;

  beforeEach(() => {
    projectSetup = new ProjectSetup(mockConfig);
    jest.clearAllMocks();
  });

  describe('validateConfig', () => {
    test('should validate correct configuration', () => {
      expect(() => {
        (projectSetup as any).validateConfig();
      }).not.toThrow();
    });

    test('should throw error for missing project name', () => {
      const invalidConfig = { ...mockConfig, name: '' };
      const invalidSetup = new ProjectSetup(invalidConfig);

      expect(() => {
        (invalidSetup as any).validateConfig();
      }).toThrow('Invalid project name');
    });

    test('should throw error for missing root directory', () => {
      const invalidConfig = { ...mockConfig, rootDir: '' };
      const invalidSetup = new ProjectSetup(invalidConfig);

      expect(() => {
        (invalidSetup as any).validateConfig();
      }).toThrow('Invalid root directory');
    });

    test('should throw error for invalid directories array', () => {
      const invalidConfig = { ...mockConfig, directories: 'not-an-array' as any };
      const invalidSetup = new ProjectSetup(invalidConfig);

      expect(() => {
        (invalidSetup as any).validateConfig();
      }).toThrow('Directories must be an array');
    });

    test('should throw error for invalid files array', () => {
      const invalidConfig = { ...mockConfig, files: 'not-an-array' as any };
      const invalidSetup = new ProjectSetup(invalidConfig);

      expect(() => {
        (invalidSetup as any).validateConfig();
      }).toThrow('Files must be an array');
    });
  });

  describe('initialize', () => {
    beforeEach(() => {
      (fs.mkdir as jest.Mock).mockImplementation((path, options, callback) => {
        callback(null);
      });
      (fs.writeFile as jest.Mock).mockImplementation((path, content, options, callback) => {
        callback(null);
      });
    });

    test('should successfully initialize project structure', async () => {
      await expect(projectSetup.initialize()).resolves.not.toThrow();
      expect(fs.mkdir).toHaveBeenCalled();
      expect(fs.writeFile).toHaveBeenCalled();
    });

    test('should throw error when directory creation fails', async () => {
      (fs.mkdir as jest.Mock).mockImplementation((path, options, callback) => {
        callback(new Error('Directory creation failed'));
      });

      await expect(projectSetup.initialize()).rejects.toThrow(
        'Project initialization failed: Failed to create directories: Directory creation failed'
      );
    });

    test('should throw error when file creation fails', async () => {
      (fs.writeFile as jest.Mock).mockImplementation((path, content, options, callback) => {
        callback(new Error('File creation failed'));
      });

      await expect(projectSetup.initialize()).rejects.toThrow(
        'Project initialization failed: Failed to create files: File creation failed'
      );
    });
  });

  describe('cleanup', () => {
    test('should successfully cleanup project directory', async () => {
      (rimraf as unknown as jest.Mock).mockImplementation((path, callback) => {
        callback(null);
      });

      await expect(projectSetup.cleanup()).resolves.not.toThrow();
      expect(rimraf).toHaveBeenCalledWith(mockConfig.rootDir, expect.any(Function));
    });

    test('should handle cleanup errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (rimraf as unknown as jest.Mock).mockImplementation((path, callback) => {
        callback(new Error('Cleanup failed'));
      });

      await projectSetup.cleanup();
      expect(consoleSpy).toHaveBeenCalledWith('Cleanup failed: Cleanup failed');
      consoleSpy.mockRestore();
    });
  });

  describe('createDefaultSetup', () => {
    test('should create ProjectSetup instance with default configuration', () => {
      const name = 'test-project';
      const rootDir = '/test/path';
      const setup = createDefaultSetup(name, rootDir);

      expect(setup).toBeInstanceOf(ProjectSetup);
      expect((setup as any).config).toMatchObject({
        name,
        rootDir,
        directories: expect.arrayContaining(['src', 'tests', 'config']),
        files: expect.arrayContaining([
          expect.objectContaining({
            path: 'package.json',
            content: expect.any(String)
          }),
          expect.objectContaining({
            path: 'tsconfig.json',
            content: expect.any(String)
          }),
          expect.objectContaining({
            path: 'src/index.ts',
            content: expect.any(String)
          })
        ])
      });
    });
  });
});
```

This test suite includes:

1. Mocking of file system operations and external dependencies
2. Tests for configuration validation
3. Tests for project initialization
4. Tests for cleanup functionality
5. Tests for default setup creation
6. Error handling tests
7. Coverage of edge cases and failure scenarios

Key testing patterns used:

- Jest mocks for fs, path, and rimraf modules
- Async/await testing patterns
- Error case testing
- Spy on console.error for cleanup error handling
- Type checking with instanceof
- Deep object matching with expect.objectContaining
- Array matching with expect.arrayContaining

To run these tests, you'll need to have the following dev dependencies in your package.json:

```json
{
  "devDependencies": {
    "@types/jest": "^27.0.0",
    "@types/node": "^16.0.0",
    "jest": "^27.0.0",
    "ts-jest": "^27.0.0",
    "typescript": "^4.0.0"
  }
}
```

And a jest.config.js configuration:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['/node_modules/']
};
```

These tests provide good coverage of the component's functionality while maintaining readability and maintainability.