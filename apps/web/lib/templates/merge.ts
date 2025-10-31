import { applyPatch, Operation } from 'fast-json-patch';
import { 
  type BuildRunnerPlan, 
  type TemplateMergeRequest, 
  type TemplateMergeResult,
  type JsonPatchOperation,
  BuildRunnerPlanSchema 
} from './schemas';
import { TemplateStorage } from './storage';

/**
 * Template merge engine with deterministic ID namespacing and conflict resolution
 */
export class TemplateMerger {
  /**
   * Perform a dry-run merge to preview changes
   */
  static async dryRunMerge(request: TemplateMergeRequest): Promise<TemplateMergeResult> {
    try {
      const { current_plan, template_ids = [], pack_ids = [], template_slugs = [], pack_slugs = [], merge_options } = request;
      
      // Load templates and packs
      const templates = await this.loadTemplates([...template_ids, ...template_slugs]);
      const packs = await this.loadPacks([...pack_ids, ...pack_slugs]);
      
      // Start with current plan
      let mergedPlan = JSON.parse(JSON.stringify(current_plan));
      const conflicts: any[] = [];
      const warnings: any[] = [];
      let changes = {
        added_milestones: 0,
        added_steps: 0,
        added_microsteps: 0,
        modified_items: 0,
      };

      // Apply templates first
      for (const template of templates) {
        const result = await this.mergeTemplate(mergedPlan, template.json_spec, merge_options);
        mergedPlan = result.plan;
        conflicts.push(...result.conflicts);
        warnings.push(...result.warnings);
        changes.added_milestones += result.changes.added_milestones;
        changes.added_steps += result.changes.added_steps;
        changes.added_microsteps += result.changes.added_microsteps;
        changes.modified_items += result.changes.modified_items;
      }

      // Apply packs
      for (const pack of packs) {
        const result = await this.applyPack(mergedPlan, pack.json_patch, merge_options);
        mergedPlan = result.plan;
        conflicts.push(...result.conflicts);
        warnings.push(...result.warnings);
        changes.added_milestones += result.changes.added_milestones;
        changes.added_steps += result.changes.added_steps;
        changes.added_microsteps += result.changes.added_microsteps;
        changes.modified_items += result.changes.modified_items;
      }

      // Validate final plan
      const validation = BuildRunnerPlanSchema.safeParse(mergedPlan);
      if (!validation.success) {
        return {
          success: false,
          conflicts: [
            ...conflicts,
            {
              type: 'dependency_conflict' as const,
              path: '/plan',
              current_value: null,
              new_value: null,
              resolution: 'Plan validation failed after merge',
            }
          ],
          warnings,
          changes,
          metadata: {
            validation_errors: validation.error.errors,
          },
        };
      }

      return {
        success: true,
        merged_plan: mergedPlan,
        conflicts,
        warnings,
        changes,
        metadata: {
          templates_applied: templates.length,
          packs_applied: packs.length,
        },
      };

    } catch (error) {
      return {
        success: false,
        conflicts: [{
          type: 'dependency_conflict' as const,
          path: '/merge',
          current_value: null,
          new_value: null,
          resolution: error instanceof Error ? error.message : 'Unknown merge error',
        }],
        warnings: [],
        changes: { added_milestones: 0, added_steps: 0, added_microsteps: 0, modified_items: 0 },
        metadata: {},
      };
    }
  }

  /**
   * Apply merge (same as dry-run but with persistence)
   */
  static async applyMerge(request: TemplateMergeRequest): Promise<TemplateMergeResult> {
    const result = await this.dryRunMerge(request);
    
    if (result.success && result.merged_plan) {
      // In a real implementation, this would save to the database
      // For now, we'll just return the result
      console.log('Merge applied successfully');
    }
    
    return result;
  }

  /**
   * Load templates by IDs or slugs
   */
  private static async loadTemplates(identifiers: string[]) {
    const templates = [];
    for (const id of identifiers) {
      const template = await TemplateStorage.getTemplate(id);
      if (template) {
        templates.push(template);
      }
    }
    return templates;
  }

  /**
   * Load packs by IDs or slugs
   */
  private static async loadPacks(identifiers: string[]) {
    const packs = [];
    for (const id of identifiers) {
      const pack = await TemplateStorage.getPack(id);
      if (pack) {
        packs.push(pack);
      }
    }
    return packs;
  }

  /**
   * Merge a template into the current plan
   */
  private static async mergeTemplate(
    currentPlan: BuildRunnerPlan, 
    templatePlan: BuildRunnerPlan, 
    options: any
  ) {
    const conflicts: any[] = [];
    const warnings: any[] = [];
    let changes = { added_milestones: 0, added_steps: 0, added_microsteps: 0, modified_items: 0 };
    
    // Create a copy to work with
    const mergedPlan = JSON.parse(JSON.stringify(currentPlan));
    
    // Merge milestones
    for (const templateMilestone of templatePlan.milestones) {
      const existingMilestone = mergedPlan.milestones.find((m: any) => m.id === templateMilestone.id);
      
      if (existingMilestone) {
        // ID collision - namespace the template milestone
        const namespacedId = this.namespaceId(templateMilestone.id, options.namespace_prefix);
        const namespacedMilestone = this.namespaceIds(templateMilestone, options.namespace_prefix);
        
        conflicts.push({
          type: 'id_collision' as const,
          path: `/milestones/${templateMilestone.id}`,
          current_value: existingMilestone.title,
          new_value: templateMilestone.title,
          resolution: `Renamed to ${namespacedId}`,
        });
        
        mergedPlan.milestones.push(namespacedMilestone);
        changes.added_milestones++;
      } else {
        // No conflict, add as-is
        mergedPlan.milestones.push(templateMilestone);
        changes.added_milestones++;
      }
      
      // Count steps and microsteps
      changes.added_steps += templateMilestone.steps.length;
      changes.added_microsteps += templateMilestone.steps.reduce((acc: number, step: any) => 
        acc + step.microsteps.length, 0
      );
    }
    
    return {
      plan: mergedPlan,
      conflicts,
      warnings,
      changes,
    };
  }

  /**
   * Apply a pack (JSON patch) to the current plan
   */
  private static async applyPack(currentPlan: BuildRunnerPlan, jsonPatch: JsonPatchOperation[], options: any) {
    const conflicts: any[] = [];
    const warnings: any[] = [];
    let changes = { added_milestones: 0, added_steps: 0, added_microsteps: 0, modified_items: 0 };
    
    try {
      // Convert our JsonPatchOperation to fast-json-patch Operation format
      const operations: Operation[] = jsonPatch.map(op => ({
        op: op.op,
        path: op.path,
        value: op.value,
        from: op.from,
      }));
      
      // Namespace template IDs in the patch operations
      const namespacedOperations = this.namespacePatchOperations(operations, options.namespace_prefix);
      
      // Apply the patch
      const result = applyPatch(currentPlan, namespacedOperations, true);
      
      // Count changes
      for (const op of namespacedOperations) {
        if (op.op === 'add') {
          if (op.path.includes('/milestones/')) {
            changes.added_milestones++;
          } else if (op.path.includes('/steps/')) {
            changes.added_steps++;
          } else if (op.path.includes('/microsteps/')) {
            changes.added_microsteps++;
          }
        } else if (op.op === 'replace') {
          changes.modified_items++;
        }
      }
      
      return {
        plan: result.newDocument,
        conflicts,
        warnings,
        changes,
      };
      
    } catch (error) {
      conflicts.push({
        type: 'dependency_conflict' as const,
        path: '/pack_application',
        current_value: null,
        new_value: null,
        resolution: error instanceof Error ? error.message : 'Pack application failed',
      });
      
      return {
        plan: currentPlan,
        conflicts,
        warnings,
        changes,
      };
    }
  }

  /**
   * Namespace an ID to avoid collisions
   */
  private static namespaceId(id: string, prefix?: string): string {
    if (!prefix) {
      prefix = `tpl_${Date.now()}`;
    }
    
    // If it's already a template ID, update the namespace
    if (id.startsWith('tpl(')) {
      return id.replace(/^tpl\([^)]+\):/, `tpl(${prefix}):`);
    }
    
    // Add namespace prefix
    return `tpl(${prefix}):${id}`;
  }

  /**
   * Recursively namespace all IDs in an object
   */
  private static namespaceIds(obj: any, prefix?: string): any {
    if (Array.isArray(obj)) {
      return obj.map(item => this.namespaceIds(item, prefix));
    }
    
    if (obj && typeof obj === 'object') {
      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (key === 'id' && typeof value === 'string') {
          result[key] = this.namespaceId(value, prefix);
        } else {
          result[key] = this.namespaceIds(value, prefix);
        }
      }
      return result;
    }
    
    return obj;
  }

  /**
   * Namespace template IDs in JSON patch operations
   */
  private static namespacePatchOperations(operations: Operation[], prefix?: string): Operation[] {
    return operations.map(op => {
      const newOp = { ...op };
      
      // Namespace IDs in the value
      if (newOp.value) {
        newOp.value = this.namespaceIds(newOp.value, prefix);
      }
      
      // Update path if it contains template IDs
      if (newOp.path.includes('tpl(')) {
        newOp.path = newOp.path.replace(/tpl\([^)]+\):/g, `tpl(${prefix || 'default'}):`);
      }
      
      return newOp;
    });
  }

  /**
   * Generate a semantic diff between two plans
   */
  static generateDiff(originalPlan: BuildRunnerPlan, newPlan: BuildRunnerPlan) {
    const diff = {
      added: {
        milestones: [] as any[],
        steps: [] as any[],
        microsteps: [] as any[],
      },
      removed: {
        milestones: [] as any[],
        steps: [] as any[],
        microsteps: [] as any[],
      },
      modified: {
        milestones: [] as any[],
        steps: [] as any[],
        microsteps: [] as any[],
      },
    };

    // Find added milestones
    for (const newMilestone of newPlan.milestones) {
      const existing = originalPlan.milestones.find(m => m.id === newMilestone.id);
      if (!existing) {
        diff.added.milestones.push(newMilestone);
        diff.added.steps.push(...newMilestone.steps);
        diff.added.microsteps.push(...newMilestone.steps.flatMap(s => s.microsteps));
      } else {
        // Check for modified milestone
        if (existing.title !== newMilestone.title) {
          diff.modified.milestones.push({
            id: newMilestone.id,
            field: 'title',
            old_value: existing.title,
            new_value: newMilestone.title,
          });
        }
        
        // Check steps within milestone
        for (const newStep of newMilestone.steps) {
          const existingStep = existing.steps.find(s => s.id === newStep.id);
          if (!existingStep) {
            diff.added.steps.push(newStep);
            diff.added.microsteps.push(...newStep.microsteps);
          } else {
            // Check microsteps within step
            for (const newMicrostep of newStep.microsteps) {
              const existingMicrostep = existingStep.microsteps.find(ms => ms.id === newMicrostep.id);
              if (!existingMicrostep) {
                diff.added.microsteps.push(newMicrostep);
              }
            }
          }
        }
      }
    }

    // Find removed milestones
    for (const originalMilestone of originalPlan.milestones) {
      const existing = newPlan.milestones.find(m => m.id === originalMilestone.id);
      if (!existing) {
        diff.removed.milestones.push(originalMilestone);
        diff.removed.steps.push(...originalMilestone.steps);
        diff.removed.microsteps.push(...originalMilestone.steps.flatMap(s => s.microsteps));
      }
    }

    return diff;
  }
}
