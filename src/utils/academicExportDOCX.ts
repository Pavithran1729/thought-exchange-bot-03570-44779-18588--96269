import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  AlignmentType, 
  BorderStyle, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  VerticalAlign,
  PageNumber,
  Footer,
  Header,
  NumberFormat,
  PageBreak,
  convertInchesToTwip
} from 'docx';
import { saveAs } from 'file-saver';
import { sanitizeFilename, parseMarkdownToSections } from './exportHelpers';
import type { AcademicReportConfig } from '@/types/academicReport';
import type { ExtractedData } from './regexProcessor';

const FONT_SIZES = {
  title: 48,
  h1: 28,
  h2: 24,
  h3: 22,
  body: 24,
  small: 20,
};

export const exportToAcademicDOCX = async (
  title: string,
  content: string,
  config: AcademicReportConfig,
  extractedData: ExtractedData[]
): Promise<void> => {
  const { academicDetails, structure } = config;
  const documentChildren: (Paragraph | Table)[] = [];
  let sectionNumber = 0;
  let subsectionNumber = 0;

  // Helper to strip existing section numbering from headings
  const stripExistingNumbering = (text: string): string => {
    // Remove patterns like "1. ", "1.1 ", "2.1.3 ", "SECTION 1:", etc.
    return text
      .replace(/^[\d.]+\s*/, '')
      .replace(/^SECTION\s*\d+[:.]\s*/i, '')
      .replace(/^CHAPTER\s*\d+[:.]\s*/i, '')
      .trim();
  };

  // Helper to parse text with bold/italic
  const parseTextRuns = (text: string): TextRun[] => {
    const runs: TextRun[] = [];
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    
    parts.forEach((part) => {
      if (!part) return;
      
      if (part.startsWith('**') && part.endsWith('**')) {
        runs.push(new TextRun({
          text: part.slice(2, -2),
          bold: true,
          size: FONT_SIZES.body,
          font: 'Times New Roman',
        }));
      } else if (part.startsWith('*') && part.endsWith('*')) {
        runs.push(new TextRun({
          text: part.slice(1, -1),
          italics: true,
          size: FONT_SIZES.body,
          font: 'Times New Roman',
        }));
      } else {
        runs.push(new TextRun({
          text: part,
          size: FONT_SIZES.body,
          font: 'Times New Roman',
        }));
      }
    });
    
    return runs;
  };

  // === COVER PAGE ===
  if (structure.includeCoverPage) {
    // Institution name
    if (academicDetails.institution) {
      documentChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: academicDetails.institution.toUpperCase(),
              bold: true,
              size: 32,
              font: 'Times New Roman',
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        })
      );
    }

    // Department
    if (academicDetails.department) {
      documentChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: academicDetails.department,
              size: 26,
              font: 'Times New Roman',
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 600 },
        })
      );
    }

    // Spacer
    for (let i = 0; i < 3; i++) {
      documentChildren.push(new Paragraph({ text: '', spacing: { after: 400 } }));
    }

    // Report Title
    documentChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: title.toUpperCase(),
            bold: true,
            size: FONT_SIZES.title,
            font: 'Times New Roman',
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 400 },
      })
    );

    // Report Type
    const reportTypeLabel = config.reportType.replace(/-/g, ' ').toUpperCase();
    documentChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `A ${reportTypeLabel}`,
            size: 24,
            font: 'Times New Roman',
            italics: true,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 800 },
      })
    );

    // Spacer
    for (let i = 0; i < 4; i++) {
      documentChildren.push(new Paragraph({ text: '', spacing: { after: 400 } }));
    }

    // Author details
    if (academicDetails.authorName) {
      documentChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Submitted by:',
              size: 22,
              font: 'Times New Roman',
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: academicDetails.authorName,
              bold: true,
              size: 26,
              font: 'Times New Roman',
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
        })
      );

      if (academicDetails.studentId) {
        documentChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `ID: ${academicDetails.studentId}`,
                size: 22,
                font: 'Times New Roman',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
          })
        );
      }
    }

    // Supervisor
    if (academicDetails.supervisorName) {
      documentChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Under the guidance of:',
              size: 22,
              font: 'Times New Roman',
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: academicDetails.supervisorName,
              bold: true,
              size: 24,
              font: 'Times New Roman',
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        })
      );
    }

    // Date
    documentChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: new Date(academicDetails.submissionDate).toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            }),
            size: 22,
            font: 'Times New Roman',
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 400 },
      })
    );

    // Page break after cover
    documentChildren.push(
      new Paragraph({
        children: [new PageBreak()],
      })
    );
  }

  // === TABLE OF CONTENTS (Placeholder) ===
  if (structure.includeToc) {
    documentChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'TABLE OF CONTENTS',
            bold: true,
            size: 28,
            font: 'Times New Roman',
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      })
    );

    documentChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: '[Table of Contents - Update field after opening in Word]',
            size: 22,
            font: 'Times New Roman',
            italics: true,
            color: '666666',
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    );

    documentChildren.push(
      new Paragraph({
        children: [new PageBreak()],
      })
    );
  }

  // === MAIN CONTENT ===
  const sections = parseMarkdownToSections(content);

  sections.forEach((section) => {
    switch (section.type) {
      case 'heading':
        if (section.level === 1) {
          sectionNumber++;
          subsectionNumber = 0;
          
          const cleanH1 = stripExistingNumbering(section.content);
          documentChildren.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${sectionNumber}. ${cleanH1.toUpperCase()}`,
                  bold: true,
                  size: FONT_SIZES.h1,
                  font: 'Times New Roman',
                }),
              ],
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 400, after: 200 },
            })
          );
        } else if (section.level === 2) {
          subsectionNumber++;
          
          const cleanH2 = stripExistingNumbering(section.content);
          documentChildren.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${sectionNumber}.${subsectionNumber} ${cleanH2}`,
                  bold: true,
                  size: FONT_SIZES.h2,
                  font: 'Times New Roman',
                }),
              ],
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 300, after: 150 },
            })
          );
        } else {
          const cleanH3 = stripExistingNumbering(section.content);
          documentChildren.push(
            new Paragraph({
              children: parseTextRuns(cleanH3),
              heading: HeadingLevel.HEADING_3,
              spacing: { before: 200, after: 100 },
            })
          );
        }
        break;

      case 'paragraph':
        if (section.content.trim()) {
          documentChildren.push(
            new Paragraph({
              children: parseTextRuns(section.content),
              spacing: {
                after: 200,
                line: 360, // 1.5 line spacing
              },
              indent: {
                firstLine: convertInchesToTwip(0.5), // First line indent
              },
            })
          );
        }
        break;

      case 'list-item':
      case 'ordered-list-item':
        documentChildren.push(
          new Paragraph({
            children: parseTextRuns(section.content),
            bullet: section.type === 'ordered-list-item' ? undefined : { level: 0 },
            numbering: section.type === 'ordered-list-item' ? {
              reference: 'default-numbering',
              level: 0,
            } : undefined,
            spacing: { after: 100, line: 360 },
          })
        );
        break;

      case 'table':
        if (section.rows && section.rows.length > 0) {
          const tableRows = section.rows.map((row, rowIndex) =>
            new TableRow({
              children: row.map(cell =>
                new TableCell({
                  children: [new Paragraph({
                    children: [new TextRun({
                      text: cell,
                      bold: rowIndex === 0,
                      size: 22,
                      font: 'Times New Roman',
                    })],
                    alignment: AlignmentType.CENTER,
                  })],
                  shading: rowIndex === 0 ? { fill: 'E8E8E8' } : undefined,
                  verticalAlign: VerticalAlign.CENTER,
                  margins: {
                    top: 100,
                    bottom: 100,
                    left: 100,
                    right: 100,
                  },
                })
              ),
            })
          );

          documentChildren.push(
            new Table({
              rows: tableRows,
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1 },
                bottom: { style: BorderStyle.SINGLE, size: 1 },
                left: { style: BorderStyle.SINGLE, size: 1 },
                right: { style: BorderStyle.SINGLE, size: 1 },
                insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
                insideVertical: { style: BorderStyle.SINGLE, size: 1 },
              },
            })
          );

          documentChildren.push(
            new Paragraph({ text: '', spacing: { after: 200 } })
          );
        }
        break;

      case 'code':
        documentChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: section.content,
                font: 'Courier New',
                size: 20,
              }),
            ],
            shading: { fill: 'F5F5F5' },
            spacing: { before: 150, after: 150 },
            border: {
              top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
              left: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
              right: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
            },
          })
        );
        break;

      case 'space':
        documentChildren.push(
          new Paragraph({ text: '', spacing: { after: 150 } })
        );
        break;
    }
  });

  // === REFERENCES SECTION ===
  if (structure.includeReferences) {
    documentChildren.push(
      new Paragraph({
        children: [new PageBreak()],
      })
    );

    sectionNumber++;
    documentChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${sectionNumber}. REFERENCES`,
            bold: true,
            size: FONT_SIZES.h1,
            font: 'Times New Roman',
          }),
        ],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 300 },
      })
    );

    documentChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: '[Add your references here in ' + structure.citationStyle.toUpperCase() + ' format]',
            size: 22,
            font: 'Times New Roman',
            italics: true,
            color: '666666',
          }),
        ],
        spacing: { after: 200 },
      })
    );
  }

  // Create document with proper margins and page numbers
  const doc = new Document({
    numbering: {
      config: [{
        reference: 'default-numbering',
        levels: [{
          level: 0,
          format: NumberFormat.DECIMAL,
          text: '%1.',
          alignment: AlignmentType.LEFT,
        }],
      }],
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1.25), // Wider left margin for binding
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: title,
                    size: 20,
                    font: 'Times New Roman',
                    italics: true,
                  }),
                ],
                alignment: AlignmentType.RIGHT,
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 22,
                    font: 'Times New Roman',
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        },
        children: documentChildren,
      },
    ],
  });

  // Generate and save
  const blob = await Packer.toBlob(doc);
  const filename = `${sanitizeFilename(title)}_Academic.docx`;
  saveAs(blob, filename);
};
