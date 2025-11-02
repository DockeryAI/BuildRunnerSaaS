/**
 * Restoration script for project with completed build
 * Run this in browser console on localhost:3005
 */

function restoreProject() {
  // Get current projects from localStorage
  const projectsData = localStorage.getItem('buildrunner_projects');
  if (!projectsData) {
    console.error('No projects found in localStorage');
    return;
  }

  const projects = JSON.parse(projectsData);

  // Find project with ID 1
  const project = projects.find(p => p.id === '1' || p.id === 1);
  if (!project) {
    console.error('Project 1 not found');
    return;
  }

  console.log('Current project:', project);

  // Update project with completed build
  project.status = 'completed';
  project.currentPhase = 'complete';
  project.lastBuildId = '1762055895639-ctpi588xt';
  project.updated_at = new Date().toISOString();
  project.phaseProgress = {
    prd: true,
    plan: true,
    build: true
  };

  // Add build metadata if not exists
  if (!project.builds) {
    project.builds = [];
  }

  // Check if build already exists
  const existingBuild = project.builds.find(b => b.buildId === '1762055895639-ctpi588xt');

  if (!existingBuild) {
    project.builds.unshift({
      buildId: '1762055895639-ctpi588xt',
      timestamp: '2025-11-01T22:58:00.000Z',
      componentCount: 46,
      fileCount: 92,
      status: 'completed',
      buildDirectory: 'builds/1/1762055895639-ctpi588xt',
      duration: 0
    });
  }

  // Save back to localStorage
  localStorage.setItem('buildrunner_projects', JSON.stringify(projects));

  console.log('✅ Project restored successfully!');
  console.log('Updated project:', project);
  console.log('Reload the page to see changes');
}

// Run the restoration
restoreProject();
