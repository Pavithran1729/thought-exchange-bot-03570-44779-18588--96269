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

  // Helper to process text with bold/italic
  const processTextStyle = (text: string) => {
    return text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');
  };

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
        } else if (section.level === 3) {
          pdf.setFontSize(14);
          pdf.setFont('helvetica', 'bold');
          yPosition += 6;
        } else {
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          yPosition += 5;
        }
        const cleanHeading = processTextStyle(section.content);
        const headingLines = pdf.splitTextToSize(cleanHeading, contentWidth);
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
        
        // Handle bold and italic text
        const parts = section.content.split(/(\*\*.*?\*\*|\*.*?\*)/g);
        let xOffset = margin;
        
        parts.forEach((part) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            pdf.setFont('helvetica', 'bold');
            const text = part.slice(2, -2);
            pdf.text(text, xOffset, yPosition);
            xOffset += pdf.getTextWidth(text);
          } else if (part.startsWith('*') && part.endsWith('*')) {
            pdf.setFont('helvetica', 'italic');
            const text = part.slice(1, -1);
            pdf.text(text, xOffset, yPosition);
            xOffset += pdf.getTextWidth(text);
          } else if (part) {
            pdf.setFont('helvetica', 'normal');
            const paraLines = pdf.splitTextToSize(part, contentWidth - (xOffset - margin));
            pdf.text(paraLines, xOffset, yPosition);
            yPosition += (paraLines.length - 1) * 6;
            xOffset = margin;
          }
        });
        yPosition += 9;
        break;

      case 'list-item':
      case 'ordered-list-item':
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        const bullet = section.type === 'ordered-list-item' ? '  ' : '•';
        pdf.text(bullet, margin, yPosition);
        const cleanList = processTextStyle(section.content);
        const listLines = pdf.splitTextToSize(cleanList, contentWidth - 8);
        pdf.text(listLines, margin + 8, yPosition);
        yPosition += listLines.length * 6 + 2;
        break;

      case 'table':
        if (section.rows && section.rows.length > 0) {
          checkPageBreak(20 + section.rows.length * 8);
          
          const colWidth = contentWidth / section.rows[0].length;
          const rowHeight = 8;
          
          // Draw table
          section.rows.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
              const x = margin + colIndex * colWidth;
              const y = yPosition + rowIndex * rowHeight;
              
              // Draw cell border
              pdf.setDrawColor(200, 200, 200);
              pdf.rect(x, y, colWidth, rowHeight);
              
              // Draw cell text
              if (rowIndex === 0) {
                pdf.setFont('helvetica', 'bold');
                pdf.setFillColor(240, 240, 240);
                pdf.rect(x, y, colWidth, rowHeight, 'F');
              } else {
                pdf.setFont('helvetica', 'normal');
              }
              
              pdf.setFontSize(10);
              const cellText = pdf.splitTextToSize(cell, colWidth - 2);
              pdf.text(cellText, x + 1, y + 5);
            });
          });
          
          yPosition += section.rows.length * rowHeight + 10;
        }
        break;

      case 'code':
        checkPageBreak(30);
        pdf.setFillColor(245, 245, 245);
        pdf.rect(margin, yPosition, contentWidth, 20, 'F');
        pdf.setFont('courier', 'normal');
        pdf.setFontSize(9);
        const codeLines = section.content.split('\n');
        codeLines.forEach((line, idx) => {
          pdf.text(line, margin + 2, yPosition + 5 + idx * 4);
        });
        yPosition += Math.max(20, codeLines.length * 4 + 10);
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
