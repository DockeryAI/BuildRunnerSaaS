/**
 * PRD Change Detector
 * Detects changes in PRD and triggers task list updates
 */

import crypto from 'crypto';

export interface PRDChangeResult {
  hasChanged: boolean;
  changes: Array<{
    type: 'added' | 'removed' | 'modified';
    section: string;
    description: string;
  }>;
  previousHash?: string;
  currentHash: string;
}

export class PRDChangeDetector {

  /**
   * Detect changes between old and new PRD
   */
  detectChanges(oldPRD: any, newPRD: any): PRDChangeResult {
    const changes: PRDChangeResult['changes'] = [];

    // Hash comparison
    const oldHash = this.hashPRD(oldPRD);
    const newHash = this.hashPRD(newPRD);

    if (oldHash === newHash) {
      return {
        hasChanged: false,
        changes: [],
        previousHash: oldHash,
        currentHash: newHash
      };
    }

    // Feature changes
    const oldFeatures = oldPRD.features || [];
    const newFeatures = newPRD.features || [];

    this.detectArrayChanges(oldFeatures, newFeatures, 'Features').forEach(change => {
      changes.push(change);
    });

    // Technical requirements changes
    const oldTechReq = oldPRD.technicalRequirements || [];
    const newTechReq = newPRD.technicalRequirements || [];

    this.detectArrayChanges(oldTechReq, newTechReq, 'Technical Requirements').forEach(change => {
      changes.push(change);
    });

    // User flows changes
    const oldFlows = oldPRD.userFlows || [];
    const newFlows = newPRD.userFlows || [];

    this.detectArrayChanges(oldFlows, newFlows, 'User Flows').forEach(change => {
      changes.push(change);
    });

    // Basic field changes
    if (oldPRD.productName !== newPRD.productName) {
      changes.push({
        type: 'modified',
        section: 'Product Name',
        description: `Changed from "${oldPRD.productName}" to "${newPRD.productName}"`
      });
    }

    if (oldPRD.productIdea !== newPRD.productIdea) {
      changes.push({
        type: 'modified',
        section: 'Product Description',
        description: 'Product description was modified'
      });
    }

    return {
      hasChanged: true,
      changes,
      previousHash: oldHash,
      currentHash: newHash
    };
  }

  /**
   * Detect changes in array fields
   */
  private detectArrayChanges(
    oldArray: any[],
    newArray: any[],
    sectionName: string
  ): PRDChangeResult['changes'] {
    const changes: PRDChangeResult['changes'] = [];

    // Normalize to comparable format
    const oldItems = oldArray.map(item =>
      typeof item === 'string' ? item : (item.name || item.title || JSON.stringify(item))
    );
    const newItems = newArray.map(item =>
      typeof item === 'string' ? item : (item.name || item.title || JSON.stringify(item))
    );

    // Find added items
    newItems.forEach(item => {
      if (!oldItems.includes(item)) {
        changes.push({
          type: 'added',
          section: sectionName,
          description: `Added: ${item}`
        });
      }
    });

    // Find removed items
    oldItems.forEach(item => {
      if (!newItems.includes(item)) {
        changes.push({
          type: 'removed',
          section: sectionName,
          description: `Removed: ${item}`
        });
      }
    });

    // Find modified items (same name but different content)
    oldArray.forEach((oldItem, index) => {
      const oldItemName = typeof oldItem === 'string' ? oldItem : (oldItem.name || oldItem.title);
      const newItem = newArray.find(ni =>
        (typeof ni === 'string' ? ni : (ni.name || ni.title)) === oldItemName
      );

      if (newItem) {
        const oldHash = crypto.createHash('md5').update(JSON.stringify(oldItem)).digest('hex');
        const newHash = crypto.createHash('md5').update(JSON.stringify(newItem)).digest('hex');

        if (oldHash !== newHash) {
          changes.push({
            type: 'modified',
            section: sectionName,
            description: `Modified: ${oldItemName}`
          });
        }
      }
    });

    return changes;
  }

  /**
   * Generate hash of PRD for comparison
   */
  hashPRD(prd: any): string {
    // Create a deterministic hash of PRD content
    const normalized = {
      productName: prd.productName || '',
      productIdea: prd.productIdea || '',
      features: (prd.features || []).map((f: any) => ({
        name: f.name || f.title || '',
        description: f.description || ''
      })),
      technicalRequirements: prd.technicalRequirements || [],
      userFlows: prd.userFlows || []
    };

    const content = JSON.stringify(normalized);
    return crypto.createHash('md5').update(content).digest('hex');
  }

  /**
   * Generate change summary
   */
  generateChangeSummary(changeResult: PRDChangeResult): string {
    if (!changeResult.hasChanged) {
      return 'No changes detected in PRD';
    }

    let summary = `# PRD Changes Detected\n\n`;
    summary += `**Total Changes:** ${changeResult.changes.length}\n\n`;

    const byType = {
      added: changeResult.changes.filter(c => c.type === 'added'),
      removed: changeResult.changes.filter(c => c.type === 'removed'),
      modified: changeResult.changes.filter(c => c.type === 'modified')
    };

    if (byType.added.length > 0) {
      summary += `## Added (${byType.added.length})\n\n`;
      byType.added.forEach(change => {
        summary += `- **${change.section}:** ${change.description}\n`;
      });
      summary += '\n';
    }

    if (byType.modified.length > 0) {
      summary += `## Modified (${byType.modified.length})\n\n`;
      byType.modified.forEach(change => {
        summary += `- **${change.section}:** ${change.description}\n`;
      });
      summary += '\n';
    }

    if (byType.removed.length > 0) {
      summary += `## Removed (${byType.removed.length})\n\n`;
      byType.removed.forEach(change => {
        summary += `- **${change.section}:** ${change.description}\n`;
      });
      summary += '\n';
    }

    summary += `\n---\n\n`;
    summary += `**Action Required:** Task list needs to be regenerated to reflect these changes.\n`;

    return summary;
  }

  /**
   * Determine if task list needs regeneration
   */
  needsTaskListUpdate(changeResult: PRDChangeResult): boolean {
    if (!changeResult.hasChanged) {
      return false;
    }

    // Any added/removed features requires task list update
    const criticalChanges = changeResult.changes.filter(c =>
      (c.type === 'added' || c.type === 'removed') &&
      (c.section === 'Features' || c.section === 'User Flows')
    );

    return criticalChanges.length > 0;
  }
}

export const prdChangeDetector = new PRDChangeDetector();
