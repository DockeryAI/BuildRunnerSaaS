'use client';

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import PptxGenJS from 'pptxgenjs';

interface PRDSection {
  items: Array<{
    title: string;
    shortDescription: string;
    fullDescription?: string;
    acceptanceCriteria?: string[];
  }>;
}

interface PRDData {
  productName: string;
  productIdea: string;
  prdSections: {
    [phase: string]: PRDSection[];
  };
}

export function exportToPDF(prdData: PRDData) {
  const doc = new jsPDF();
  let yPosition = 20;

  // Title
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Product Requirements Document', 105, yPosition, { align: 'center' });
  yPosition += 15;

  // Product Name
  doc.setFontSize(18);
  doc.text(prdData.productName || 'Product Name', 105, yPosition, { align: 'center' });
  yPosition += 15;

  // Product Idea
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Product Vision:', 20, yPosition);
  yPosition += 8;

  doc.setFont('helvetica', 'normal');
  const ideaLines = doc.splitTextToSize(prdData.productIdea, 170);
  doc.text(ideaLines, 20, yPosition);
  yPosition += (ideaLines.length * 7) + 10;

  // Sections
  Object.entries(prdData.prdSections).forEach(([phase, sections]) => {
    sections.forEach((section: any) => {
      if (section.items && section.items.length > 0) {
        // Check if we need a new page
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        // Section Title
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(section.name || 'Section', 20, yPosition);
        yPosition += 10;

        // Items
        section.items.forEach((item: any) => {
          if (yPosition > 260) {
            doc.addPage();
            yPosition = 20;
          }

          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          doc.text(`• ${item.title}`, 25, yPosition);
          yPosition += 6;

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          const descLines = doc.splitTextToSize(item.shortDescription, 160);
          doc.text(descLines, 30, yPosition);
          yPosition += (descLines.length * 5) + 5;
        });

        yPosition += 5;
      }
    });
  });

  // Save
  doc.save(`${prdData.productName || 'PRD'}.pdf`);
}

export function exportToPPT(prdData: PRDData) {
  const pptx = new PptxGenJS();

  // Title Slide
  const titleSlide = pptx.addSlide();
  titleSlide.background = { color: '4472C4' };
  titleSlide.addText('Product Requirements Document', {
    x: 0.5,
    y: 1.5,
    w: 9,
    h: 1,
    fontSize: 44,
    bold: true,
    color: 'FFFFFF',
    align: 'center',
  });
  titleSlide.addText(prdData.productName || 'Product Name', {
    x: 0.5,
    y: 2.8,
    w: 9,
    h: 0.6,
    fontSize: 32,
    color: 'FFFFFF',
    align: 'center',
  });

  // Vision Slide
  const visionSlide = pptx.addSlide();
  visionSlide.addText('Product Vision', {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.6,
    fontSize: 32,
    bold: true,
    color: '4472C4',
  });
  visionSlide.addText(prdData.productIdea, {
    x: 0.5,
    y: 1.5,
    w: 9,
    h: 4,
    fontSize: 18,
    color: '000000',
    valign: 'top',
  });

  // Sections
  Object.entries(prdData.prdSections).forEach(([phase, sections]) => {
    sections.forEach((section: any) => {
      if (section.items && section.items.length > 0) {
        const slide = pptx.addSlide();

        // Section Title
        slide.addText(section.name || 'Section', {
          x: 0.5,
          y: 0.5,
          w: 9,
          h: 0.6,
          fontSize: 28,
          bold: true,
          color: '4472C4',
        });

        // Items as bullets
        const bulletText = section.items.map((item: any) => ({
          text: item.title,
          options: { bullet: true, fontSize: 16, color: '000000' },
        }));

        slide.addText(bulletText, {
          x: 0.5,
          y: 1.5,
          w: 9,
          h: 4,
        });
      }
    });
  });

  // Save
  pptx.writeFile({ fileName: `${prdData.productName || 'PRD'}.pptx` });
}

/**
 * Export PRD as Markdown for Claude Code / Developer Context
 * This format is optimized to be used as a source of truth in Claude Code conversations
 */
export function exportToMarkdown(prdData: PRDData): string {
  let markdown = `# Product Requirements Document: ${prdData.productName}\n\n`;

  // Metadata section with full timestamp to ensure unique hash on each export
  const now = new Date();
  markdown += `> **Generated**: ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}\n`;
  markdown += `> **Build Trigger**: ${now.toISOString()}\n`;
  markdown += `> **Status**: Active Development\n`;
  markdown += `> **Purpose**: Source of truth for all feature development and AI-assisted coding\n\n`;

  markdown += `---\n\n`;

  // Product Vision
  markdown += `## Product Vision\n\n`;
  markdown += `${prdData.productIdea}\n\n`;
  markdown += `---\n\n`;

  // All Sections
  Object.entries(prdData.prdSections).forEach(([phase, sections]) => {
    markdown += `## Phase: ${phase}\n\n`;

    sections.forEach((section: any) => {
      if (section.items && section.items.length > 0) {
        markdown += `### ${section.name || 'Section'}\n\n`;

        if (section.description) {
          markdown += `${section.description}\n\n`;
        }

        section.items.forEach((item: any) => {
          markdown += `#### ${item.title}\n\n`;

          // Add full description if available, otherwise short description
          if (item.fullDescription) {
            markdown += `${item.fullDescription}\n\n`;
          } else {
            markdown += `${item.shortDescription}\n\n`;
          }

          // Add acceptance criteria if available
          if (item.acceptanceCriteria && item.acceptanceCriteria.length > 0) {
            markdown += `**Acceptance Criteria:**\n\n`;
            item.acceptanceCriteria.forEach((criterion: string) => {
              markdown += `- ${criterion}\n`;
            });
            markdown += `\n`;
          }
        });

        markdown += `\n`;
      }
    });
  });

  // Add usage instructions for Claude Code
  markdown += `---\n\n`;
  markdown += `## How to Use This PRD with Claude Code\n\n`;
  markdown += `This document serves as the source of truth for all development decisions. When working with Claude Code:\n\n`;
  markdown += `1. **Reference this PRD** in your prompts: "Following the PRD, implement the [feature name]"\n`;
  markdown += `2. **Keep it updated** as requirements evolve\n`;
  markdown += `3. **Use sections as context** when implementing specific features\n`;
  markdown += `4. **Validate implementations** against the acceptance criteria listed here\n\n`;
  markdown += `### Suggested Claude Code Workflow\n\n`;
  markdown += `\`\`\`bash\n`;
  markdown += `# Option 1: Reference in prompts\n`;
  markdown += `"Read PRD.md and implement the User Authentication feature"\n\n`;
  markdown += `# Option 2: Copy specific sections\n`;
  markdown += `"Implement this feature: [paste section from PRD]"\n\n`;
  markdown += `# Option 3: Use as project context\n`;
  markdown += `# Place this file in your project root or .claude/context/ folder\n`;
  markdown += `\`\`\`\n`;

  return markdown;
}

/**
 * Download markdown file to user's computer
 */
export function downloadMarkdown(prdData: PRDData) {
  const markdown = exportToMarkdown(prdData);
  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${prdData.productName || 'PRD'}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export PRD to Claude Builder daemon directory for automatic building
 * This triggers the daemon to detect changes and start a build
 */
export async function exportToClaudeBuilder(
  prdData: PRDData,
  projectName: string
): Promise<{ success: boolean; message: string; path?: string }> {
  try {
    console.log('[exportToClaudeBuilder] Starting export for project:', projectName);
    console.log('[exportToClaudeBuilder] PRD data:', {
      productName: prdData.productName,
      ideaLength: prdData.productIdea?.length || 0,
      sectionsCount: Object.keys(prdData.prdSections || {}).length,
    });

    const markdown = exportToMarkdown(prdData);
    console.log('[exportToClaudeBuilder] Generated markdown, length:', markdown.length);

    // Call API route to write file server-side
    console.log('[exportToClaudeBuilder] Calling API endpoint...');
    const response = await fetch('/api/claude-builder/export-prd', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectName,
        prdContent: markdown,
      }),
    });

    console.log('[exportToClaudeBuilder] API response status:', response.status);
    const result = await response.json();
    console.log('[exportToClaudeBuilder] API response data:', result);

    if (!response.ok) {
      throw new Error(result.error || 'Failed to export PRD');
    }

    console.log('[exportToClaudeBuilder] ✅ Export successful!');
    return {
      success: true,
      message: 'PRD exported successfully. Daemon will detect changes and start building.',
      path: result.path,
    };
  } catch (error) {
    console.error('[exportToClaudeBuilder] ❌ Export failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to export PRD',
    };
  }
}
