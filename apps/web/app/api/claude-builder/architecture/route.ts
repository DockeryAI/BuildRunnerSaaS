import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

/**
 * Architecture Visualization API
 *
 * GET /api/claude-builder/architecture?projectName=MyProject
 * - Returns architecture data from ARCHITECTURE.md or generated from project structure
 */

interface ArchitectureNode {
  id: string;
  type: 'component' | 'page' | 'api' | 'util' | 'database';
  label: string;
  description?: string;
  dependencies?: string[];
}

function getProjectPath(projectName: string): string {
  const homeDir = os.homedir();
  const sanitizedName = projectName.replace(/[^a-zA-Z0-9-_]/g, '-');
  return path.join(homeDir, 'Projects', 'BuildRunnerProjects', sanitizedName);
}

function parseArchitectureFile(content: string): ArchitectureNode[] {
  const nodes: ArchitectureNode[] = [];
  const nodeBlocks = content.split(/^### /gm).slice(1);

  nodeBlocks.forEach((block) => {
    const lines = block.split('\n');
    const label = lines[0]?.trim();
    if (!label) return;

    const node: Partial<ArchitectureNode> = {
      id: label.toLowerCase().replace(/\s+/g, '-'),
      label,
      dependencies: [],
    };

    lines.forEach((line) => {
      const trimmedLine = line.trim();

      if (trimmedLine.startsWith('**Type:**')) {
        node.type = trimmedLine
          .replace('**Type:**', '')
          .trim()
          .toLowerCase() as ArchitectureNode['type'];
      } else if (trimmedLine.startsWith('**Description:**')) {
        node.description = trimmedLine.replace('**Description:**', '').trim();
      } else if (trimmedLine.startsWith('**Dependencies:**')) {
        const deps = trimmedLine.replace('**Dependencies:**', '').trim();
        node.dependencies = deps
          .split(',')
          .map((d) => d.trim().toLowerCase().replace(/\s+/g, '-'))
          .filter((d) => d);
      }
    });

    if (node.id && node.label && node.type) {
      nodes.push(node as ArchitectureNode);
    }
  });

  return nodes;
}

function generateArchitectureFromStructure(projectPath: string): ArchitectureNode[] {
  const nodes: ArchitectureNode[] = [];

  // Check for src directory
  const srcPath = path.join(projectPath, 'src');
  if (!fs.existsSync(srcPath)) {
    return [];
  }

  try {
    // Scan for pages
    const pagesPath = path.join(srcPath, 'pages');
    if (fs.existsSync(pagesPath)) {
      const pages = fs.readdirSync(pagesPath).filter((f) => f.endsWith('.tsx') || f.endsWith('.ts'));
      pages.forEach((page, index) => {
        nodes.push({
          id: `page-${index}`,
          type: 'page',
          label: page.replace(/\.(tsx|ts)$/, ''),
          description: `Page component`,
        });
      });
    }

    // Scan for components
    const componentsPath = path.join(srcPath, 'components');
    if (fs.existsSync(componentsPath)) {
      const components = fs.readdirSync(componentsPath).filter((f) => f.endsWith('.tsx') || f.endsWith('.ts'));
      components.forEach((component, index) => {
        nodes.push({
          id: `component-${index}`,
          type: 'component',
          label: component.replace(/\.(tsx|ts)$/, ''),
          description: `Reusable component`,
        });
      });
    }

    // Scan for API routes
    const apiPath = path.join(srcPath, 'api');
    if (fs.existsSync(apiPath)) {
      const apis = fs.readdirSync(apiPath).filter((f) => f.endsWith('.tsx') || f.endsWith('.ts'));
      apis.forEach((api, index) => {
        nodes.push({
          id: `api-${index}`,
          type: 'api',
          label: api.replace(/\.(tsx|ts)$/, ''),
          description: `API endpoint`,
        });
      });
    }

    // Scan for utils
    const utilsPath = path.join(srcPath, 'utils');
    if (fs.existsSync(utilsPath)) {
      const utils = fs.readdirSync(utilsPath).filter((f) => f.endsWith('.tsx') || f.endsWith('.ts'));
      utils.forEach((util, index) => {
        nodes.push({
          id: `util-${index}`,
          type: 'util',
          label: util.replace(/\.(tsx|ts)$/, ''),
          description: `Utility function`,
        });
      });
    }
  } catch (error) {
    console.error('[Claude Builder] Error scanning project structure:', error);
  }

  return nodes;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectName = searchParams.get('projectName');

    if (!projectName) {
      return NextResponse.json(
        { error: 'projectName is required' },
        { status: 400 }
      );
    }

    const projectPath = getProjectPath(projectName);
    const architecturePath = path.join(projectPath, 'ARCHITECTURE.md');

    let architecture: ArchitectureNode[] = [];

    if (fs.existsSync(architecturePath)) {
      // Parse from ARCHITECTURE.md
      const content = fs.readFileSync(architecturePath, 'utf8');
      architecture = parseArchitectureFile(content);
    } else {
      // Generate from project structure
      architecture = generateArchitectureFromStructure(projectPath);
    }

    return NextResponse.json({
      exists: architecture.length > 0,
      architecture,
    });
  } catch (error) {
    console.error('[Claude Builder] Get architecture error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch architecture',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
