/**
 * Utility to extract build components from a project plan
 */

import type { ProjectPlan, Technology, Milestone, Step, Microstep } from './project';
import type { BuildComponent } from './build-orchestrator';

type ComponentType = 'frontend' | 'backend' | 'api' | 'database' | 'service';

/**
 * Extract build components from a project plan
 *
 * This converts the project plan structure (technologies + microsteps) into
 * BuildComponent objects that the orchestrator can use.
 */
export function extractBuildComponents(plan: ProjectPlan): BuildComponent[] {
  const components: BuildComponent[] = [];

  // 1. Skip architecture/technologies - those are infrastructure, not buildable components
  // The build orchestrator will set up the tech stack automatically

  // 2. Extract high-level components from milestones
  plan.milestones.forEach((milestone, milestoneIndex) => {
    // Handle new plan format with components directly in milestones
    if (milestone.components) {
      milestone.components.forEach((component, componentIndex) => {
        components.push({
          id: component.id,
          name: component.name,
          type: component.type || 'frontend',
          dependencies: component.dependencies || [],
          status: 'pending',
          priority: (milestoneIndex + 1) * 100 + componentIndex,
          description: component.description,
          filePath: component.filePath,
          criticality: component.criticality,
        });
      });
    }
    // Handle old plan format with steps and microsteps
    else if (milestone.steps) {
      milestone.steps.forEach((step) => {
        // Group microsteps into logical components
        const componentGroups = groupMicrostepsIntoComponents(step.microsteps, milestone.id, step.id);

        componentGroups.forEach((group, groupIndex) => {
          components.push({
            id: group.id,
            name: group.name,
            type: group.type,
            dependencies: group.dependencies,
            status: 'pending',
            priority: (milestoneIndex + 1) * 100 + groupIndex,
            description: group.description,
            microsteps: group.microsteps,
          });
        });
      });
    }
  });

  // 3. Resolve dependencies based on plan structure
  components.forEach((component) => {
    if (component.type === 'frontend') {
      // Frontend depends on API
      const apiComponent = components.find(c => c.type === 'api');
      if (apiComponent) {
        component.dependencies.push(apiComponent.id);
      }
    } else if (component.type === 'api') {
      // API depends on database
      const dbComponent = components.find(c => c.type === 'database');
      if (dbComponent) {
        component.dependencies.push(dbComponent.id);
      }
    }
  });

  // 4. Remove duplicates by ID
  const uniqueComponents = Array.from(
    new Map(components.map(c => [c.id, c])).values()
  );

  console.log(`✅ Extracted ${uniqueComponents.length} build components from plan`);

  return uniqueComponents;
}

/**
 * Map technology category to component type
 */
function mapTechnologyToComponentType(category: string): ComponentType {
  const categoryMap: Record<string, ComponentType> = {
    'frontend': 'frontend',
    'backend': 'backend',
    'database': 'database',
    'infrastructure': 'service',
    'service': 'service',
  };

  return categoryMap[category] || 'service';
}

/**
 * Group microsteps into logical components
 *
 * Microsteps are grouped by analyzing their titles and descriptions
 * to identify logical components (e.g., "User Authentication", "Dashboard UI")
 */
function groupMicrostepsIntoComponents(
  microsteps: Microstep[],
  milestoneId: string,
  stepId: string
): Array<{
  id: string;
  name: string;
  type: ComponentType;
  dependencies: string[];
  description?: string;
  microsteps?: Array<{
    id: string;
    title: string;
    description: string;
    estimatedHours: number;
    status: 'pending' | 'in_progress' | 'completed';
  }>;
}> {
  const groups: Array<{
    id: string;
    name: string;
    type: ComponentType;
    dependencies: string[];
    description?: string;
    microsteps?: Array<{
      id: string;
      title: string;
      description: string;
      estimatedHours: number;
      status: 'pending' | 'in_progress' | 'completed';
    }>;
  }> = [];

  // Simple grouping strategy: each microstep becomes a component
  // In production, you'd have more sophisticated grouping logic
  microsteps.forEach((microstep, index) => {
    const componentType = inferComponentTypeFromMicrostep(microstep);

    groups.push({
      id: `${milestoneId}-${stepId}-${microstep.id}`,
      name: microstep.title,
      type: componentType,
      dependencies: microstep.dependencies,
      description: microstep.description,
      microsteps: [
        {
          id: microstep.id,
          title: microstep.title,
          description: microstep.description,
          estimatedHours: microstep.estimatedHours,
          status: microstep.status,
        },
      ],
    });
  });

  return groups;
}

/**
 * Infer component type from microstep content
 */
function inferComponentTypeFromMicrostep(microstep: Microstep): ComponentType {
  const title = microstep.title.toLowerCase();
  const description = microstep.description.toLowerCase();
  const text = `${title} ${description}`;

  if (
    text.includes('ui') ||
    text.includes('frontend') ||
    text.includes('component') ||
    text.includes('page') ||
    text.includes('dashboard')
  ) {
    return 'frontend';
  }

  if (
    text.includes('database') ||
    text.includes('schema') ||
    text.includes('migration') ||
    text.includes('table')
  ) {
    return 'database';
  }

  if (
    text.includes('api') ||
    text.includes('endpoint') ||
    text.includes('route')
  ) {
    return 'api';
  }

  if (
    text.includes('service') ||
    text.includes('backend') ||
    text.includes('server')
  ) {
    return 'backend';
  }

  // Default to service for anything else
  return 'service';
}

/**
 * Calculate visual positions for components in the workbench
 *
 * This arranges components in a grid based on their dependencies
 */
export function calculateComponentPositions(
  components: BuildComponent[]
): BuildComponent[] {
  const COLUMN_WIDTH = 300;
  const ROW_HEIGHT = 150;
  const START_X = 100;
  const START_Y = 100;

  // Group components by type
  const byType: Record<ComponentType, BuildComponent[]> = {
    frontend: [],
    backend: [],
    api: [],
    database: [],
    service: [],
  };

  components.forEach(component => {
    // Handle components with type that might not exist in byType
    if (byType[component.type]) {
      byType[component.type].push(component);
    } else {
      // Default unknown types to 'service'
      byType.service.push(component);
    }
  });

  const positioned = [...components];
  let currentX = START_X;
  let currentY = START_Y;

  // Position database components first (leftmost)
  byType.database.forEach((component, index) => {
    const comp = positioned.find(c => c.id === component.id);
    if (comp) {
      (comp as any).x = currentX;
      (comp as any).y = START_Y + (index * ROW_HEIGHT);
    }
  });
  currentX += COLUMN_WIDTH;

  // Position API/backend components
  [...byType.api, ...byType.backend].forEach((component, index) => {
    const comp = positioned.find(c => c.id === component.id);
    if (comp) {
      (comp as any).x = currentX;
      (comp as any).y = START_Y + (index * ROW_HEIGHT);
    }
  });
  currentX += COLUMN_WIDTH;

  // Position frontend components
  byType.frontend.forEach((component, index) => {
    const comp = positioned.find(c => c.id === component.id);
    if (comp) {
      (comp as any).x = currentX;
      (comp as any).y = START_Y + (index * ROW_HEIGHT);
    }
  });
  currentX += COLUMN_WIDTH;

  // Position service components
  byType.service.forEach((component, index) => {
    const comp = positioned.find(c => c.id === component.id);
    if (comp) {
      (comp as any).x = currentX;
      (comp as any).y = START_Y + (index * ROW_HEIGHT);
    }
  });

  return positioned;
}
