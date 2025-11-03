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
