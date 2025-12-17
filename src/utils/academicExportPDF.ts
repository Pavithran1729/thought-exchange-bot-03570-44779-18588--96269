import jsPDF from 'jspdf';
import { sanitizeFilename, parseMarkdownToSections } from './exportHelpers';
import type { AcademicReportConfig } from '@/types/academicReport';
import type { ExtractedData } from './regexProcessor';

export const exportToAcademicPDF = async (
  title: string,
  content: string,
  config: AcademicReportConfig,
  extractedData: ExtractedData[]
): Promise<void> => {
  const { academicDetails, structure } = config;
  
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 25;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;
  let currentPage = 1;
  let sectionNumber = 0;
  let subsectionNumber = 0;

  // Helper to add new page if needed
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin - 15) {
      pdf.addPage();
      currentPage++;
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Helper to process text style
  const processTextStyle = (text: string) => {
    return text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');
  };

  // === COVER PAGE ===
  if (structure.includeCoverPage) {
    // Institution name
    if (academicDetails.institution) {
      pdf.setFontSize(16);
      pdf.setFont('times', 'bold');
      const instLines = pdf.splitTextToSize(academicDetails.institution.toUpperCase(), contentWidth);
      pdf.text(instLines, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += instLines.length * 7 + 5;
    }

    // Department
    if (academicDetails.department) {
      pdf.setFontSize(12);
      pdf.setFont('times', 'normal');
      pdf.text(academicDetails.department, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;
    }

    // Move down for title
    yPosition = pageHeight * 0.35;

    // Report Title
    pdf.setFontSize(24);
    pdf.setFont('times', 'bold');
    const titleLines = pdf.splitTextToSize(title.toUpperCase(), contentWidth);
    pdf.text(titleLines, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += titleLines.length * 10 + 10;

    // Report Type
    const reportTypeLabel = config.reportType.replace(/-/g, ' ').toUpperCase();
    pdf.setFontSize(12);
    pdf.setFont('times', 'italic');
    pdf.text(`A ${reportTypeLabel}`, pageWidth / 2, yPosition, { align: 'center' });
    
    // Move down for author info
    yPosition = pageHeight * 0.65;

    // Author details
    if (academicDetails.authorName) {
      pdf.setFontSize(11);
      pdf.setFont('times', 'normal');
      pdf.text('Submitted by:', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;
      
      pdf.setFontSize(14);
      pdf.setFont('times', 'bold');
      pdf.text(academicDetails.authorName, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;

      if (academicDetails.studentId) {
        pdf.setFontSize(11);
        pdf.setFont('times', 'normal');
        pdf.text(`ID: ${academicDetails.studentId}`, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 12;
      }
    }

    // Supervisor
    if (academicDetails.supervisorName) {
      yPosition += 5;
      pdf.setFontSize(11);
      pdf.setFont('times', 'normal');
      pdf.text('Under the guidance of:', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;
      
      pdf.setFontSize(12);
      pdf.setFont('times', 'bold');
      pdf.text(academicDetails.supervisorName, pageWidth / 2, yPosition, { align: 'center' });
    }

    // Date at bottom
    yPosition = pageHeight - 40;
    pdf.setFontSize(11);
    pdf.setFont('times', 'normal');
    const dateStr = new Date(academicDetails.submissionDate).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
    pdf.text(dateStr, pageWidth / 2, yPosition, { align: 'center' });

    // New page after cover
    pdf.addPage();
    currentPage++;
    yPosition = margin;
  }

  // === TABLE OF CONTENTS ===
  if (structure.includeToc) {
    pdf.setFontSize(16);
    pdf.setFont('times', 'bold');
    pdf.text('TABLE OF CONTENTS', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    pdf.setFontSize(11);
    pdf.setFont('times', 'italic');
    pdf.setTextColor(100, 100, 100);
    pdf.text('[Table of Contents - Generate from document outline]', margin, yPosition);
    pdf.setTextColor(0, 0, 0);
    
    pdf.addPage();
    currentPage++;
    yPosition = margin;
  }

  // === MAIN CONTENT ===
  const sections = parseMarkdownToSections(content);

  sections.forEach((section) => {
    checkPageBreak(20);

    switch (section.type) {
      case 'heading':
        if (section.level === 1) {
          sectionNumber++;
          subsectionNumber = 0;
          
          checkPageBreak(25);
          yPosition += 10;
          pdf.setFontSize(14);
          pdf.setFont('times', 'bold');
          const headingText = `${sectionNumber}. ${section.content.toUpperCase()}`;
          const h1Lines = pdf.splitTextToSize(headingText, contentWidth);
          pdf.text(h1Lines, margin, yPosition);
          yPosition += h1Lines.length * 7 + 8;
        } else if (section.level === 2) {
          subsectionNumber++;
          
          checkPageBreak(20);
          yPosition += 6;
          pdf.setFontSize(12);
          pdf.setFont('times', 'bold');
          const h2Text = `${sectionNumber}.${subsectionNumber} ${section.content}`;
          const h2Lines = pdf.splitTextToSize(h2Text, contentWidth);
          pdf.text(h2Lines, margin, yPosition);
          yPosition += h2Lines.length * 6 + 6;
        } else {
          checkPageBreak(15);
          yPosition += 4;
          pdf.setFontSize(11);
          pdf.setFont('times', 'bold');
          const cleanHeading = processTextStyle(section.content);
          const h3Lines = pdf.splitTextToSize(cleanHeading, contentWidth);
          pdf.text(h3Lines, margin, yPosition);
          yPosition += h3Lines.length * 5 + 5;
        }
        break;

      case 'paragraph':
        pdf.setFontSize(11);
        pdf.setFont('times', 'normal');
        const cleanPara = processTextStyle(section.content);
        if (cleanPara.trim()) {
          // Add first line indent
          const paraLines = pdf.splitTextToSize(cleanPara, contentWidth - 10);
          if (paraLines.length > 0) {
            // First line with indent
            pdf.text(paraLines[0], margin + 10, yPosition);
            yPosition += 6;
            // Rest of lines
            for (let i = 1; i < paraLines.length; i++) {
              checkPageBreak(6);
              pdf.text(paraLines[i], margin, yPosition);
              yPosition += 6;
            }
          }
          yPosition += 3;
        }
        break;

      case 'list-item':
      case 'ordered-list-item':
        pdf.setFontSize(11);
        pdf.setFont('times', 'normal');
        const bullet = section.type === 'ordered-list-item' ? '•' : '•';
        pdf.text(bullet, margin + 5, yPosition);
        const cleanList = processTextStyle(section.content);
        const listLines = pdf.splitTextToSize(cleanList, contentWidth - 15);
        pdf.text(listLines, margin + 12, yPosition);
        yPosition += listLines.length * 6 + 2;
        break;

      case 'table':
        if (section.rows && section.rows.length > 0) {
          checkPageBreak(25 + section.rows.length * 8);
          
          const colCount = section.rows[0].length;
          const colWidth = contentWidth / colCount;
          const rowHeight = 8;
          
          section.rows.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
              const x = margin + colIndex * colWidth;
              const y = yPosition + rowIndex * rowHeight;
              
              // Draw cell border
              pdf.setDrawColor(150, 150, 150);
              pdf.setLineWidth(0.3);
              pdf.rect(x, y, colWidth, rowHeight);
              
              // Header row background
              if (rowIndex === 0) {
                pdf.setFillColor(230, 230, 230);
                pdf.rect(x, y, colWidth, rowHeight, 'F');
                pdf.setFont('times', 'bold');
              } else {
                pdf.setFont('times', 'normal');
              }
              
              pdf.setFontSize(9);
              const cellText = pdf.splitTextToSize(cell, colWidth - 4);
              pdf.text(cellText[0] || '', x + 2, y + 5);
            });
          });
          
          yPosition += section.rows.length * rowHeight + 10;
        }
        break;

      case 'code':
        checkPageBreak(25);
        pdf.setFillColor(245, 245, 245);
        const codeLines = section.content.split('\n');
        const codeHeight = Math.max(15, codeLines.length * 4 + 8);
        pdf.rect(margin, yPosition - 3, contentWidth, codeHeight, 'F');
        pdf.setFont('courier', 'normal');
        pdf.setFontSize(9);
        codeLines.forEach((line, idx) => {
          pdf.text(line, margin + 3, yPosition + idx * 4);
        });
        yPosition += codeHeight + 5;
        break;

      case 'space':
        yPosition += 4;
        break;
    }
  });

  // === REFERENCES SECTION ===
  if (structure.includeReferences) {
    pdf.addPage();
    currentPage++;
    yPosition = margin;
    
    sectionNumber++;
    pdf.setFontSize(14);
    pdf.setFont('times', 'bold');
    pdf.text(`${sectionNumber}. REFERENCES`, margin, yPosition);
    yPosition += 15;
    
    pdf.setFontSize(11);
    pdf.setFont('times', 'italic');
    pdf.setTextColor(100, 100, 100);
    pdf.text(`[Add your references here in ${structure.citationStyle.toUpperCase()} format]`, margin, yPosition);
    pdf.setTextColor(0, 0, 0);
  }

  // === ADD PAGE NUMBERS ===
  const totalPages = pdf.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(10);
    pdf.setFont('times', 'normal');
    pdf.setTextColor(100, 100, 100);
    
    // Page number at bottom center
    pdf.text(
      `${i}`,
      pageWidth / 2,
      pageHeight - 12,
      { align: 'center' }
    );
    
    // Header with title (skip cover page)
    if (i > (structure.includeCoverPage ? 1 : 0)) {
      pdf.setFontSize(9);
      pdf.setFont('times', 'italic');
      const headerTitle = title.length > 50 ? title.substring(0, 47) + '...' : title;
      pdf.text(headerTitle, pageWidth - margin, 12, { align: 'right' });
    }
  }

  // Save the PDF
  const filename = `${sanitizeFilename(title)}_Academic.pdf`;
  pdf.save(filename);
};
