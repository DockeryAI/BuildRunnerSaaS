/**
 * Code Change Parser
 * Parses Claude's code change suggestions from chat responses
 */

export interface CodeChange {
  file: string;
  oldCode: string;
  newCode: string;
  description?: string;
}

export class CodeChangeParser {
  /**
   * Parse code changes from Claude's response
   * Expects format:
   * ```change
   * FILE: path/to/file.tsx
   * OLD:
   * [old code]
   * NEW:
   * [new code]
   * ```
   */
  parse(claudeResponse: string): CodeChange[] {
    const changes: CodeChange[] = [];

    // Match code change blocks
    const changeBlockRegex = /```change\n([\s\S]*?)```/g;
    let match;

    while ((match = changeBlockRegex.exec(claudeResponse)) !== null) {
      const block = match[1];
      const change = this.parseChangeBlock(block);
      if (change) {
        changes.push(change);
      }
    }

    return changes;
  }

  private parseChangeBlock(block: string): CodeChange | null {
    // Extract FILE, OLD, NEW sections
    const fileMatch = block.match(/FILE:\s*(.+)/);
    const oldMatch = block.match(/OLD:\n([\s\S]*?)(?:NEW:|$)/);
    const newMatch = block.match(/NEW:\n([\s\S]*?)$/);

    if (!fileMatch) {
      return null;
    }

    return {
      file: fileMatch[1].trim(),
      oldCode: oldMatch ? oldMatch[1].trim() : '',
      newCode: newMatch ? newMatch[1].trim() : ''
    };
  }

  /**
   * Parse changes from JSON format (alternative)
   */
  parseJSON(claudeResponse: string): CodeChange[] {
    try {
      const jsonMatch = claudeResponse.match(/\{[\s\S]*"changes"[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.changes || [];
      }
    } catch (error) {
      // JSON parsing failed, return empty
    }
    return [];
  }
}
