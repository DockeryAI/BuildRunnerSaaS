export interface DependencyGraph {
  nodes: Map<string, string[]>; // componentId -> [dependency IDs]
  components: Map<string, any>; // componentId -> component
}

export class DependencyAnalyzer {
  /**
   * Build dependency graph from components
   */
  buildDependencyGraph(components: any[]): DependencyGraph {
    const nodes = new Map<string, string[]>();
    const componentMap = new Map<string, any>();

    // Initialize graph
    for (const component of components) {
      const id = component.id || component.name;
      nodes.set(id, []);
      componentMap.set(id, component);
    }

    // Extract dependencies
    for (const component of components) {
      const id = component.id || component.name;
      const deps = this.extractDependencies(component, components);
      nodes.set(id, deps);
    }

    return { nodes, components: componentMap };
  }

  /**
   * Extract dependencies from a component
   */
  private extractDependencies(component: any, allComponents: any[]): string[] {
    const deps = new Set<string>();

    // Get component description/metadata
    const description = (component.description || component.prompt || '').toLowerCase();
    const code = component.code || '';

    // Check for explicit dependencies in description
    for (const other of allComponents) {
      if (component.id === other.id) continue;

      const otherName = (other.name || '').toLowerCase();
      const otherId = other.id || other.name;

      // Pattern matching in description
      if (
        description.includes(`depends on ${otherName}`) ||
        description.includes(`uses ${otherName}`) ||
        description.includes(`requires ${otherName}`) ||
        description.includes(`${otherName} service`) ||
        description.includes(`${otherName} component`)
      ) {
        deps.add(otherId);
      }

      // Check code imports if available
      if (code) {
        const importPattern = new RegExp(`from ['"].*${otherName}`, 'i');
        if (importPattern.test(code)) {
          deps.add(otherId);
        }
      }
    }

    // Type-based dependencies
    const type = component.type?.toLowerCase();

    // Frontend depends on services
    if (type === 'frontend' || type === 'component') {
      for (const other of allComponents) {
        if (other.type === 'service' || other.type === 'api') {
          deps.add(other.id || other.name);
        }
      }
    }

    // Services depend on database
    if (type === 'service' || type === 'api') {
      for (const other of allComponents) {
        if (other.type === 'database' || other.type === 'schema') {
          deps.add(other.id || other.name);
        }
      }
    }

    return Array.from(deps);
  }

  /**
   * Get build order in batches (topological sort)
   */
  getExecutionBatches(graph: DependencyGraph): any[][] {
    const batches: any[][] = [];
    const completed = new Set<string>();
    const components = graph.components;

    while (completed.size < components.size) {
      const batch: any[] = [];

      // Find components with all dependencies satisfied
      for (const [id, component] of components) {
        if (completed.has(id)) continue;

        const deps = graph.nodes.get(id) || [];
        const allDepsSatisfied = deps.every(dep => completed.has(dep));

        if (allDepsSatisfied) {
          batch.push(component);
        }
      }

      // If no components can be built, we have a circular dependency
      if (batch.length === 0 && completed.size < components.size) {
        throw new Error('Circular dependency detected in build plan');
      }

      // Mark batch as completed
      for (const component of batch) {
        const id = component.id || component.name;
        completed.add(id);
      }

      batches.push(batch);
    }

    return batches;
  }

  /**
   * Validate no circular dependencies exist
   */
  validateNoCycles(graph: DependencyGraph): void {
    const visiting = new Set<string>();
    const visited = new Set<string>();

    const hasCycle = (nodeId: string): boolean => {
      if (visiting.has(nodeId)) return true; // Found cycle
      if (visited.has(nodeId)) return false; // Already checked

      visiting.add(nodeId);

      const deps = graph.nodes.get(nodeId) || [];
      for (const dep of deps) {
        if (hasCycle(dep)) return true;
      }

      visiting.delete(nodeId);
      visited.add(nodeId);
      return false;
    };

    for (const nodeId of graph.nodes.keys()) {
      if (hasCycle(nodeId)) {
        throw new Error(`Circular dependency detected involving: ${nodeId}`);
      }
    }
  }

  /**
   * Get dependency tree for a component (for debugging)
   */
  getDependencyTree(componentId: string, graph: DependencyGraph): any {
    const tree: any = {
      id: componentId,
      component: graph.components.get(componentId),
      dependencies: [],
    };

    const deps = graph.nodes.get(componentId) || [];
    for (const dep of deps) {
      tree.dependencies.push(this.getDependencyTree(dep, graph));
    }

    return tree;
  }
}
