/**
 * Patch validation utilities for rescope operations
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface PlanNode {
  id: string;
  title: string;
  type: 'phase' | 'milestone' | 'step' | 'microstep';
  parentId?: string;
  children?: PlanNode[];
  dependencies?: string[];
  status?: string;
  criteria?: string[];
  metadata?: Record<string, any>;
}

export interface PatchOperation {
  op: 'add' | 'remove' | 'replace' | 'move';
  path: string;
  value?: any;
  from?: string;
}

/**
 * Validates a patch before applying it to the plan
 */
export function validatePatch(
  currentPlan: any,
  patch: PatchOperation[]
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Create a copy of the plan to test the patch
    const testPlan = JSON.parse(JSON.stringify(currentPlan));
    
    // Apply patch operations to test plan
    for (const operation of patch) {
      try {
        applyOperation(testPlan, operation);
      } catch (error) {
        errors.push(`Failed to apply operation ${operation.op} at ${operation.path}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // If patch application failed, return early
    if (errors.length > 0) {
      return { isValid: false, errors, warnings };
    }

    // Validate the resulting plan structure
    const structureValidation = validatePlanStructure(testPlan);
    errors.push(...structureValidation.errors);
    warnings.push(...structureValidation.warnings);

    // Validate dependencies
    const dependencyValidation = validateDependencies(testPlan);
    errors.push(...dependencyValidation.errors);
    warnings.push(...dependencyValidation.warnings);

    // Validate IDs are unique
    const idValidation = validateUniqueIds(testPlan);
    errors.push(...idValidation.errors);
    warnings.push(...idValidation.warnings);

    // Validate required fields
    const fieldValidation = validateRequiredFields(testPlan);
    errors.push(...fieldValidation.errors);
    warnings.push(...fieldValidation.warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      warnings,
    };
  }
}

/**
 * Apply a single patch operation to a plan object
 */
function applyOperation(plan: any, operation: PatchOperation): void {
  const { op, path, value, from } = operation;
  const pathParts = path.split('/').filter(part => part !== '');

  switch (op) {
    case 'add':
      addValue(plan, pathParts, value);
      break;
    case 'remove':
      removeValue(plan, pathParts);
      break;
    case 'replace':
      replaceValue(plan, pathParts, value);
      break;
    case 'move':
      if (!from) throw new Error('Move operation requires "from" field');
      const fromParts = from.split('/').filter(part => part !== '');
      const valueToMove = getValue(plan, fromParts);
      removeValue(plan, fromParts);
      addValue(plan, pathParts, valueToMove);
      break;
    default:
      throw new Error(`Unsupported operation: ${op}`);
  }
}

/**
 * Get value at path
 */
function getValue(obj: any, pathParts: string[]): any {
  let current = obj;
  for (const part of pathParts) {
    if (current === null || current === undefined) {
      throw new Error(`Path not found: ${pathParts.join('/')}`);
    }
    current = current[part];
  }
  return current;
}

/**
 * Add value at path
 */
function addValue(obj: any, pathParts: string[], value: any): void {
  if (pathParts.length === 0) {
    throw new Error('Cannot add to root');
  }

  const parentPath = pathParts.slice(0, -1);
  const key = pathParts[pathParts.length - 1];
  
  let parent = obj;
  for (const part of parentPath) {
    if (parent[part] === undefined) {
      parent[part] = {};
    }
    parent = parent[part];
  }

  if (Array.isArray(parent)) {
    const index = parseInt(key, 10);
    if (isNaN(index)) {
      throw new Error(`Invalid array index: ${key}`);
    }
    parent.splice(index, 0, value);
  } else {
    parent[key] = value;
  }
}

/**
 * Remove value at path
 */
function removeValue(obj: any, pathParts: string[]): void {
  if (pathParts.length === 0) {
    throw new Error('Cannot remove root');
  }

  const parentPath = pathParts.slice(0, -1);
  const key = pathParts[pathParts.length - 1];
  
  let parent = obj;
  for (const part of parentPath) {
    if (parent[part] === undefined) {
      throw new Error(`Path not found: ${pathParts.join('/')}`);
    }
    parent = parent[part];
  }

  if (Array.isArray(parent)) {
    const index = parseInt(key, 10);
    if (isNaN(index)) {
      throw new Error(`Invalid array index: ${key}`);
    }
    parent.splice(index, 1);
  } else {
    delete parent[key];
  }
}

/**
 * Replace value at path
 */
function replaceValue(obj: any, pathParts: string[], value: any): void {
  if (pathParts.length === 0) {
    throw new Error('Cannot replace root');
  }

  const parentPath = pathParts.slice(0, -1);
  const key = pathParts[pathParts.length - 1];
  
  let parent = obj;
  for (const part of parentPath) {
    if (parent[part] === undefined) {
      throw new Error(`Path not found: ${pathParts.join('/')}`);
    }
    parent = parent[part];
  }

  if (Array.isArray(parent)) {
    const index = parseInt(key, 10);
    if (isNaN(index)) {
      throw new Error(`Invalid array index: ${key}`);
    }
    parent[index] = value;
  } else {
    parent[key] = value;
  }
}

/**
 * Validate plan structure
 */
function validatePlanStructure(plan: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!plan || typeof plan !== 'object') {
    errors.push('Plan must be an object');
    return { isValid: false, errors, warnings };
  }

  if (!plan.phases || !Array.isArray(plan.phases)) {
    errors.push('Plan must have a phases array');
    return { isValid: false, errors, warnings };
  }

  // Validate each phase
  for (let i = 0; i < plan.phases.length; i++) {
    const phase = plan.phases[i];
    const phaseErrors = validatePhaseStructure(phase, `phases[${i}]`);
    errors.push(...phaseErrors);
  }

  return { isValid: errors.length === 0, errors, warnings };
}

/**
 * Validate phase structure
 */
function validatePhaseStructure(phase: any, path: string): string[] {
  const errors: string[] = [];

  if (!phase || typeof phase !== 'object') {
    errors.push(`${path}: Phase must be an object`);
    return errors;
  }

  if (!phase.id || typeof phase.id !== 'string') {
    errors.push(`${path}: Phase must have a string id`);
  }

  if (!phase.title || typeof phase.title !== 'string') {
    errors.push(`${path}: Phase must have a string title`);
  }

  if (phase.milestones && Array.isArray(phase.milestones)) {
    for (let i = 0; i < phase.milestones.length; i++) {
      const milestone = phase.milestones[i];
      const milestoneErrors = validateMilestoneStructure(milestone, `${path}.milestones[${i}]`);
      errors.push(...milestoneErrors);
    }
  }

  return errors;
}

/**
 * Validate milestone structure
 */
function validateMilestoneStructure(milestone: any, path: string): string[] {
  const errors: string[] = [];

  if (!milestone || typeof milestone !== 'object') {
    errors.push(`${path}: Milestone must be an object`);
    return errors;
  }

  if (!milestone.id || typeof milestone.id !== 'string') {
    errors.push(`${path}: Milestone must have a string id`);
  }

  if (!milestone.title || typeof milestone.title !== 'string') {
    errors.push(`${path}: Milestone must have a string title`);
  }

  return errors;
}

/**
 * Validate dependencies are acyclic
 */
function validateDependencies(plan: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Extract all nodes and their dependencies
  const nodes = new Map<string, string[]>();
  
  function extractNodes(obj: any, parentId?: string) {
    if (obj.id) {
      nodes.set(obj.id, obj.dependencies || []);
    }
    
    // Recursively extract from children
    ['milestones', 'steps', 'microsteps'].forEach(key => {
      if (obj[key] && Array.isArray(obj[key])) {
        obj[key].forEach((child: any) => extractNodes(child, obj.id));
      }
    });
  }

  if (plan.phases) {
    plan.phases.forEach((phase: any) => extractNodes(phase));
  }

  // Check for cycles using DFS
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function hasCycle(nodeId: string): boolean {
    if (recursionStack.has(nodeId)) {
      return true; // Cycle detected
    }
    
    if (visited.has(nodeId)) {
      return false; // Already processed
    }

    visited.add(nodeId);
    recursionStack.add(nodeId);

    const dependencies = nodes.get(nodeId) || [];
    for (const depId of dependencies) {
      if (hasCycle(depId)) {
        return true;
      }
    }

    recursionStack.delete(nodeId);
    return false;
  }

  for (const nodeId of nodes.keys()) {
    if (hasCycle(nodeId)) {
      errors.push(`Circular dependency detected involving node: ${nodeId}`);
      break; // One cycle detection is enough
    }
  }

  return { isValid: errors.length === 0, errors, warnings };
}

/**
 * Validate all IDs are unique
 */
function validateUniqueIds(plan: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const seenIds = new Set<string>();

  function checkIds(obj: any, path: string) {
    if (obj.id) {
      if (seenIds.has(obj.id)) {
        errors.push(`Duplicate ID found: ${obj.id} at ${path}`);
      } else {
        seenIds.add(obj.id);
      }
    }

    // Recursively check children
    ['phases', 'milestones', 'steps', 'microsteps'].forEach(key => {
      if (obj[key] && Array.isArray(obj[key])) {
        obj[key].forEach((child: any, index: number) => {
          checkIds(child, `${path}.${key}[${index}]`);
        });
      }
    });
  }

  checkIds(plan, 'root');

  return { isValid: errors.length === 0, errors, warnings };
}

/**
 * Validate required fields are present
 */
function validateRequiredFields(plan: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  function checkRequiredFields(obj: any, path: string, type: string) {
    const requiredFields = {
      phase: ['id', 'title'],
      milestone: ['id', 'title'],
      step: ['id', 'title'],
      microstep: ['id', 'title', 'status'],
    };

    const required = requiredFields[type as keyof typeof requiredFields] || [];
    
    for (const field of required) {
      if (!obj[field]) {
        errors.push(`Missing required field '${field}' in ${type} at ${path}`);
      }
    }

    // Check microstep-specific requirements
    if (type === 'microstep') {
      if (!obj.criteria || !Array.isArray(obj.criteria) || obj.criteria.length === 0) {
        warnings.push(`Microstep at ${path} should have acceptance criteria`);
      }
    }
  }

  function validateNode(obj: any, path: string, type: string) {
    checkRequiredFields(obj, path, type);

    // Recursively validate children
    const childTypes = {
      phase: 'milestone',
      milestone: 'step',
      step: 'microstep',
    };

    const childKey = {
      phase: 'milestones',
      milestone: 'steps',
      step: 'microsteps',
    };

    const childType = childTypes[type as keyof typeof childTypes];
    const childArrayKey = childKey[type as keyof typeof childKey];

    if (childType && childArrayKey && obj[childArrayKey]) {
      obj[childArrayKey].forEach((child: any, index: number) => {
        validateNode(child, `${path}.${childArrayKey}[${index}]`, childType);
      });
    }
  }

  if (plan.phases) {
    plan.phases.forEach((phase: any, index: number) => {
      validateNode(phase, `phases[${index}]`, 'phase');
    });
  }

  return { isValid: errors.length === 0, errors, warnings };
}
