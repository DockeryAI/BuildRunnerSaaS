# Build File Storage Guide

## Overview

The BuildRunner system now includes comprehensive file storage for all generated code. Files are persisted to disk during the build process and can be browsed via the Workbench UI.

## File Storage Locations

### Demo / Local Development
```
./builds/
  {projectId}/          # e.g., "1", "project-abc"
    {buildId}/          # e.g., "build-123abc-456def"
      src/
        components/     # React components (.tsx, .jsx)
        services/       # Business logic services
        api/            # API endpoints and handlers
        lib/            # Shared libraries and utilities
        types/          # TypeScript type definitions
        utils/          # Helper functions
      public/           # Static assets
      tests/            # Test files
      package.json      # Dependencies
      README.md         # Project documentation
```

### Production / Cloud
For production deployments, the file storage works the same way but can be configured to:

1. **GitHub Integration**: Automatically push generated code to a GitHub repository
2. **Cloud Storage**: Use S3, Google Cloud Storage, or Supabase Storage
3. **Container Volumes**: Persist in Docker volumes for containerized deployments

## File Writer API

### BuildFileWriter Class

Located in: `lib/file-writer.ts`

#### Key Methods:

```typescript
// Initialize build directory
await fileWriter.initialize();

// Write single file
await fileWriter.writeFile('src/components/Button.tsx', componentCode);

// Write multiple files
await fileWriter.writeFiles([
  { path: 'src/components/Button.tsx', content: buttonCode },
  { path: 'src/services/api.ts', content: apiCode }
]);

// Get file tree for UI
const tree = await fileWriter.getFileTree();

// Read file content
const content = await fileWriter.readFile('src/components/Button.tsx');

// List all files (flat)
const files = await fileWriter.listFiles();
```

## File Browser UI

### Location
- Workbench page: Bottom panel "Build Files" tab
- Component: `components/FileBrowser.tsx`

### Features
- **Tree View**: Hierarchical display of folders and files
- **File Preview**: Click any file to view contents
- **Syntax Highlighting**: Color-coded by file type
- **File Metadata**: Shows file size and last modified time
- **Real-time Updates**: Refreshes as build progresses
- **Search**: Quick file navigation

## API Endpoints

### Get File Tree
```
GET /api/build/files?projectId={id}&buildId={id}&action=tree
```

Returns hierarchical file structure for the file browser.

### Read File
```
GET /api/build/files?projectId={id}&buildId={id}&action=read&file={path}
```

Returns the content of a specific file.

### List Files
```
GET /api/build/files?projectId={id}&buildId={id}&action=list
```

Returns a flat list of all file paths.

## Integrating File Writing into Build Process

To integrate the BuildFileWriter into the build orchestrator:

```typescript
import { BuildFileWriter, inferFilePath } from './file-writer';

// In build orchestrator
const projectId = localStorage.getItem('currentProjectId') || '1';
const buildId = this.state.id;
const fileWriter = new BuildFileWriter(projectId, buildId);

// Initialize on build start
await fileWriter.initialize();

// Write component code when completed
await fileWriter.writeFile(
  inferFilePath({ name: component.name, type: component.type }),
  generatedCode
);
```

## File Path Inference

The system automatically infers file paths based on component type:

- `frontend` / `component` → `src/components/{Name}.tsx`
- `api` / `endpoint` → `src/api/{Name}.ts`
- `service` → `src/services/{Name}.ts`
- `backend` / `server` → `src/server/{Name}.ts`
- `database` / `schema` → `src/database/{Name}.ts`
- `util` / `helper` → `src/utils/{Name}.ts`
- `type` / `interface` → `src/types/{Name}.ts`
- `test` → `tests/{Name}.test.ts`

## Next Steps (Production Deployment)

### GitHub Integration
1. Create GitHub App or use Personal Access Token
2. Automatically create repository for each project
3. Push generated files on build completion
4. Create PR for review before merging

### Cloud Storage
1. Configure storage provider (AWS S3, Google Cloud Storage, Supabase)
2. Upload files with proper access control
3. Generate signed URLs for file downloads
4. Implement versioning for build history

### CI/CD Integration
1. Trigger automated tests on file creation
2. Run linting and type checking
3. Deploy to preview environment
4. Notify user of build status

## Security Considerations

- **Access Control**: Only authenticated users can access their project files
- **Path Traversal Protection**: File paths are sanitized to prevent directory traversal
- **File Size Limits**: Implement limits to prevent disk space exhaustion
- **Cleanup**: Old builds can be archived or deleted after retention period

## Example: Complete Build Flow

```typescript
// 1. Start build
const buildId = await startBuild(components);

// 2. Initialize file storage
const fileWriter = new BuildFileWriter(projectId, buildId);
await fileWriter.initialize();

// 3. Build each component
for (const component of components) {
  const code = await generateCode(component);

  // 4. Write to disk
  await fileWriter.writeFile(
    inferFilePath(component),
    code
  );

  // 5. Emit SSE event
  emitEvent('component_completed', {
    componentId: component.id,
    code,
  });
}

// 6. Generate package.json
await fileWriter.writePackageJson({
  name: projectName,
  version: '1.0.0',
  dependencies: extractedDependencies,
});

// 7. Generate README
await fileWriter.writeReadme(generateReadme(project));

// 8. Optionally push to GitHub
if (config.githubIntegration) {
  await pushToGitHub(fileWriter.getBuildDir(), projectRepo);
}
```

## Troubleshooting

### Build directory not found
- Ensure the build was started successfully
- Check that the `builds/` directory has write permissions
- Verify projectId and buildId are correct

### Files not appearing in browser
- Click the "Refresh" button in the file browser
- Check browser console for API errors
- Verify the build has completed at least one component

### Cannot read file
- Ensure the file path is correct (case-sensitive)
- Check that the file was actually written during build
- Verify file permissions allow reading

## Configuration

Environment variables (optional):

```env
# Custom builds directory
BUILDS_DIR=/var/buildrunner/builds

# Enable GitHub integration
ENABLE_GITHUB_PUSH=true
GITHUB_TOKEN=ghp_xxxx

# Enable cloud storage
ENABLE_CLOUD_STORAGE=true
STORAGE_PROVIDER=s3
S3_BUCKET=buildrunner-builds
```
