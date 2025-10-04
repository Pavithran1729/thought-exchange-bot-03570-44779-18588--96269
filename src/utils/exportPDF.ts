import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { sanitizeFilename, formatDate, parseMarkdownToSections, createExtractedDataTable } from './exportHelpers';
import type { Template } from './templates';
import type { ExtractedData } from './regexProcessor';

export const exportToPDF = async (
  title: string,
  content: string,
  template: Template,
  extractedData: ExtractedData[]
): Promise<void> => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Helper to add new page if needed
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Add header with title
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  const titleLines = pdf.splitTextToSize(title, contentWidth);
  pdf.text(titleLines, margin, yPosition);
  yPosition += titleLines.length * 10 + 5;

  // Add accent bar if template uses it
  if (template.styles.decoration.accentBar) {
    pdf.setDrawColor(59, 130, 246); // Primary blue
    pdf.setLineWidth(2);
    pdf.line(margin, yPosition, margin + 30, yPosition);
    yPosition += 10;
  }

  // Add date
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  pdf.text(formatDate(), margin, yPosition);
  yPosition += 15;

  // Parse and add content
  const sections = parseMarkdownToSections(content);
  pdf.setTextColor(0, 0, 0);

  sections.forEach((section) => {
    checkPageBreak(15);

    switch (section.type) {
      case 'heading':
        if (section.level === 1) {
          pdf.setFontSize(20);
          pdf.setFont('helvetica', 'bold');
          yPosition += 10;
        } else if (section.level === 2) {
          pdf.setFontSize(16);
          pdf.setFont('helvetica', 'bold');
          yPosition += 8;
        } else {
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'bold');
          yPosition += 6;
        }
        const headingLines = pdf.splitTextToSize(section.content, contentWidth);
        pdf.text(headingLines, margin, yPosition);
        yPosition += headingLines.length * 7 + 5;
        
        if (template.styles.decoration.headingUnderline && section.level === 1) {
          pdf.setDrawColor(200, 200, 200);
          pdf.setLineWidth(0.5);
          pdf.line(margin, yPosition - 3, pageWidth - margin, yPosition - 3);
        }
        break;

      case 'paragraph':
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        const paraLines = pdf.splitTextToSize(section.content, contentWidth);
        pdf.text(paraLines, margin, yPosition);
        yPosition += paraLines.length * 6 + 3;
        break;

      case 'list-item':
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        pdf.text('•', margin, yPosition);
        const listLines = pdf.splitTextToSize(section.content, contentWidth - 5);
        pdf.text(listLines, margin + 5, yPosition);
        yPosition += listLines.length * 6 + 2;
        break;

      case 'space':
        yPosition += 5;
        break;
    }
  });

  // Add extracted data section
  if (extractedData.length > 0) {
    checkPageBreak(30);
    yPosition += 15;
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Extracted Data', margin, yPosition);
    yPosition += 10;

    const dataTable = createExtractedDataTable(extractedData);
    if (dataTable) {
      Object.entries(dataTable).forEach(([type, values]) => {
        checkPageBreak(20);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${type}:`, margin, yPosition);
        yPosition += 7;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        values.forEach((value) => {
          checkPageBreak(8);
          pdf.text(`  • ${value}`, margin + 5, yPosition);
          yPosition += 6;
        });
        yPosition += 3;
      });
    }
  }

  // Add footer to all pages
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(9);
    pdf.setTextColor(150, 150, 150);
    pdf.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  const filename = `${sanitizeFilename(title)}.pdf`;
  pdf.save(filename);
};
