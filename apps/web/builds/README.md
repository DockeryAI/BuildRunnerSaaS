# Build Output Directory

This directory contains generated code from the BuildRunner build process.

## Structure
```
builds/
  {projectId}/
    {buildId}/
      src/
        components/
        services/
        api/
        lib/
        types/
        utils/
      tests/
      public/
      package.json
      README.md
```

## Note
- Files in this directory are automatically generated and should not be edited manually
- For production deployments, these files are pushed to GitHub or cloud storage
- Local builds are stored here for development and testing
- Old builds can be cleaned up periodically to save disk space

## File Browser
All files generated during a build can be browsed via the Workbench UI:
1. Start a build
2. Navigate to the "Build Files" tab in the bottom panel
3. Click on any file to view its contents
4. Files are organized by type automatically

## Production Deployment
In production, builds are:
- Automatically pushed to GitHub repositories
- Or uploaded to cloud storage (S3, Supabase Storage)
- Or deployed directly to preview environments
