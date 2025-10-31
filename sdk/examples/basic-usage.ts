#!/usr/bin/env tsx

/**
 * BuildRunner SDK - Basic Usage Example
 * 
 * This example demonstrates the basic usage of the BuildRunner SDK
 * including project management, planning, and execution.
 */

import { BuildRunnerSDK, createClient } from '../src/index';

// Configuration
const config = {
  baseUrl: process.env.BUILDRUNNER_API_URL || 'https://api.buildrunner.com',
  apiKey: process.env.BUILDRUNNER_API_KEY || 'br_example_key_12345',
  projectId: process.env.BUILDRUNNER_PROJECT_ID || 'proj_example_12345',
  timeout: 10000,
};

async function basicUsageExample() {
  console.log('🚀 BuildRunner SDK - Basic Usage Example\n');

  try {
    // Create SDK client
    const client = createClient(config);
    console.log('✅ SDK client created');

    // Test connectivity
    console.log('\n📡 Testing API connectivity...');
    const pingResult = await client.ping();
    
    if (pingResult.error) {
      console.log('❌ API connectivity test failed:', pingResult.error);
      console.log('   This is expected when running against mock/example endpoints');
    } else {
      console.log('✅ API connectivity test passed:', pingResult.data);
    }

    // List projects
    console.log('\n📋 Listing projects...');
    const projectsResult = await client.projects.list({ limit: 5 });
    
    if (projectsResult.error) {
      console.log('❌ Failed to list projects:', projectsResult.error);
      console.log('   Code:', projectsResult.code);
    } else {
      console.log('✅ Projects retrieved:', projectsResult.data?.projects?.length || 0);
      projectsResult.data?.projects?.forEach(project => {
        console.log(`   - ${project.name} (${project.status})`);
      });
    }

    // Get specific project
    if (config.projectId && config.projectId !== 'proj_example_12345') {
      console.log('\n🔍 Getting project details...');
      const projectResult = await client.projects.get(config.projectId);
      
      if (projectResult.error) {
        console.log('❌ Failed to get project:', projectResult.error);
      } else {
        console.log('✅ Project details:', projectResult.data?.name);
      }

      // Get project plan
      console.log('\n📊 Getting project plan...');
      const planResult = await client.planning.getPlan();
      
      if (planResult.error) {
        console.log('❌ Failed to get plan:', planResult.error);
      } else {
        console.log('✅ Plan retrieved with', planResult.data?.phases?.length || 0, 'phases');
        planResult.data?.phases?.forEach(phase => {
          console.log(`   - Phase ${phase.id}: ${phase.title} (${phase.status || 'not_started'})`);
        });
      }

      // Dry run sync
      console.log('\n🔄 Running dry sync...');
      const syncResult = await client.execution.sync({ dry_run: true });
      
      if (syncResult.error) {
        console.log('❌ Failed to sync:', syncResult.error);
      } else {
        console.log('✅ Dry sync completed:', syncResult.data?.summary);
      }
    } else {
      console.log('\n⚠️  Skipping project-specific operations (using example project ID)');
      console.log('   Set BUILDRUNNER_PROJECT_ID environment variable to test with real project');
    }

    console.log('\n✅ Basic usage example completed successfully!');

  } catch (error) {
    console.error('\n❌ Example failed with error:', error);
    process.exit(1);
  }
}

async function createProjectExample() {
  console.log('\n🏗️  Create Project Example\n');

  try {
    const client = createClient(config);

    // Create a new project
    const newProject = {
      name: 'SDK Example Project',
      description: 'A project created using the BuildRunner SDK',
      settings: {
        framework: 'react',
        language: 'typescript',
        deployment: 'vercel',
      },
    };

    console.log('📝 Creating new project...');
    const createResult = await client.projects.create(newProject);

    if (createResult.error) {
      console.log('❌ Failed to create project:', createResult.error);
      return;
    }

    console.log('✅ Project created:', createResult.data?.name);
    console.log('   ID:', createResult.data?.id);

    // Update the project
    const projectId = createResult.data?.id;
    if (projectId) {
      console.log('\n📝 Updating project...');
      const updateResult = await client.projects.update(projectId, {
        description: 'Updated description via SDK',
        settings: {
          ...newProject.settings,
          updated_via: 'sdk',
        },
      });

      if (updateResult.error) {
        console.log('❌ Failed to update project:', updateResult.error);
      } else {
        console.log('✅ Project updated successfully');
      }
    }

  } catch (error) {
    console.error('❌ Create project example failed:', error);
  }
}

async function planningExample() {
  console.log('\n📋 Planning Example\n');

  try {
    const client = createClient(config);

    // Example plan structure
    const examplePlan = {
      phases: [
        {
          id: 'p1',
          title: 'Foundation & Setup',
          description: 'Initial project setup and configuration',
          steps: [
            {
              id: 'p1.s1',
              title: 'Project Initialization',
              description: 'Set up the basic project structure',
              microsteps: [
                {
                  id: 'p1.s1.ms1',
                  title: 'Initialize repository',
                  description: 'Create Git repository and initial commit',
                  criteria: [
                    'Git repository created',
                    'Initial commit made',
                    'README.md file present',
                  ],
                  status: 'completed' as const,
                },
                {
                  id: 'p1.s1.ms2',
                  title: 'Setup package.json',
                  description: 'Configure package.json with dependencies',
                  criteria: [
                    'package.json created',
                    'Dependencies defined',
                    'Scripts configured',
                  ],
                  status: 'in_progress' as const,
                },
              ],
              status: 'in_progress' as const,
            },
          ],
          status: 'in_progress' as const,
        },
        {
          id: 'p2',
          title: 'Development',
          description: 'Core development phase',
          steps: [
            {
              id: 'p2.s1',
              title: 'Core Features',
              description: 'Implement main application features',
              microsteps: [
                {
                  id: 'p2.s1.ms1',
                  title: 'User authentication',
                  description: 'Implement user login and registration',
                  criteria: [
                    'Login form created',
                    'Registration form created',
                    'Authentication middleware implemented',
                  ],
                  status: 'not_started' as const,
                },
              ],
              status: 'not_started' as const,
            },
          ],
          status: 'not_started' as const,
        },
      ],
      metadata: {
        created_by: 'sdk_example',
        framework: 'react',
        estimated_duration: '4 weeks',
      },
    };

    console.log('📊 Creating example plan...');
    
    // Note: This will fail against mock endpoints, but demonstrates the API
    const planResult = await client.planning.updatePlan(examplePlan, config.projectId);

    if (planResult.error) {
      console.log('❌ Failed to create plan:', planResult.error);
      console.log('   This is expected when running against mock/example endpoints');
    } else {
      console.log('✅ Plan created with', planResult.data?.phases?.length || 0, 'phases');
    }

  } catch (error) {
    console.error('❌ Planning example failed:', error);
  }
}

// Main execution
async function main() {
  console.log('BuildRunner SDK Examples');
  console.log('========================\n');

  // Check configuration
  if (config.apiKey === 'br_example_key_12345') {
    console.log('⚠️  Using example API key. Set BUILDRUNNER_API_KEY for real testing.');
  }

  if (config.projectId === 'proj_example_12345') {
    console.log('⚠️  Using example project ID. Set BUILDRUNNER_PROJECT_ID for real testing.');
  }

  console.log('🔧 Configuration:');
  console.log(`   Base URL: ${config.baseUrl}`);
  console.log(`   API Key: ${config.apiKey.substring(0, 8)}...`);
  console.log(`   Project ID: ${config.projectId}`);
  console.log(`   Timeout: ${config.timeout}ms\n`);

  // Run examples
  await basicUsageExample();
  await createProjectExample();
  await planningExample();

  console.log('\n🎉 All examples completed!');
  console.log('\nNext steps:');
  console.log('1. Set real API credentials in environment variables');
  console.log('2. Explore the full SDK API documentation');
  console.log('3. Check out more examples in the examples/ directory');
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
