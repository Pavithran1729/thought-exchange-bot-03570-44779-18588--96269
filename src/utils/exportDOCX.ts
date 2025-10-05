import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, Table, TableRow, TableCell, WidthType, VerticalAlign } from 'docx';
import { saveAs } from 'file-saver';
import { sanitizeFilename, formatDate, parseMarkdownToSections, createExtractedDataTable } from './exportHelpers';
import type { Template } from './templates';
import type { ExtractedData } from './regexProcessor';

export const exportToDOCX = async (
  title: string,
  content: string,
  template: Template,
  extractedData: ExtractedData[]
): Promise<void> => {
  const sections = parseMarkdownToSections(content);
  const documentChildren: (Paragraph | Table)[] = [];

  // Add title
  documentChildren.push(
    new Paragraph({
      text: title,
      heading: HeadingLevel.TITLE,
      spacing: {
        after: 200,
      },
    })
  );

  // Add date
  documentChildren.push(
    new Paragraph({
      children: [
        new TextRun({
          text: formatDate(),
          size: 20,
          color: '666666',
        }),
      ],
      spacing: {
        after: 400,
      },
    })
  );

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
          size: 22,
        }));
      } else if (part.startsWith('*') && part.endsWith('*')) {
        runs.push(new TextRun({
          text: part.slice(1, -1),
          italics: true,
          size: 22,
        }));
      } else {
        runs.push(new TextRun({
          text: part,
          size: 22,
        }));
      }
    });
    
    return runs;
  };

  // Add content sections
  sections.forEach((section) => {
    switch (section.type) {
      case 'heading':
        const headingLevel = section.level === 1 
          ? HeadingLevel.HEADING_1 
          : section.level === 2 
          ? HeadingLevel.HEADING_2 
          : section.level === 3
          ? HeadingLevel.HEADING_3
          : HeadingLevel.HEADING_4;

        documentChildren.push(
          new Paragraph({
            children: parseTextRuns(section.content),
            heading: headingLevel,
            spacing: {
              before: 240,
              after: 120,
            },
            border: template.styles.decoration.headingUnderline && section.level === 1 ? {
              bottom: {
                color: 'CCCCCC',
                space: 1,
                style: BorderStyle.SINGLE,
                size: 6,
              },
            } : undefined,
          })
        );
        break;

      case 'paragraph':
        if (section.content.trim()) {
          documentChildren.push(
            new Paragraph({
              children: parseTextRuns(section.content),
              spacing: {
                after: 160,
                line: 360,
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
            bullet: section.type === 'ordered-list-item' ? undefined : {
              level: 0,
            },
            numbering: section.type === 'ordered-list-item' ? {
              reference: 'default-numbering',
              level: 0,
            } : undefined,
            spacing: {
              after: 100,
            },
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
                      size: 20,
                    })],
                  })],
                  shading: rowIndex === 0 ? {
                    fill: 'F0F0F0',
                  } : undefined,
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
              width: {
                size: 100,
                type: WidthType.PERCENTAGE,
              },
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
            new Paragraph({
              text: '',
              spacing: { after: 200 },
            })
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
                size: 18,
              }),
            ],
            shading: {
              fill: 'F5F5F5',
            },
            spacing: {
              before: 120,
              after: 120,
            },
          })
        );
        break;

      case 'space':
        documentChildren.push(
          new Paragraph({
            text: '',
            spacing: {
              after: 120,
            },
          })
        );
        break;
    }
  });

  // Add extracted data section
  if (extractedData.length > 0) {
    documentChildren.push(
      new Paragraph({
        text: '',
        spacing: { after: 400 },
      })
    );

    documentChildren.push(
      new Paragraph({
        text: 'Extracted Data',
        heading: HeadingLevel.HEADING_1,
        spacing: {
          before: 240,
          after: 200,
        },
      })
    );

    const dataTable = createExtractedDataTable(extractedData);
    if (dataTable) {
      Object.entries(dataTable).forEach(([type, values]) => {
        documentChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${type}:`,
                bold: true,
                size: 24,
              }),
            ],
            spacing: {
              before: 120,
              after: 80,
            },
          })
        );

        values.forEach((value) => {
          documentChildren.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: value,
                  size: 22,
                }),
              ],
              bullet: {
                level: 0,
              },
              spacing: {
                after: 60,
              },
            })
          );
        });
      });
    }
  }

  // Create document
  const doc = new Document({
    numbering: {
      config: [{
        reference: 'default-numbering',
        levels: [{
          level: 0,
          format: 'decimal',
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
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: documentChildren,
      },
    ],
  });

  // Generate and save
  const blob = await Packer.toBlob(doc);
  const filename = `${sanitizeFilename(title)}.docx`;
  saveAs(blob, filename);
};
