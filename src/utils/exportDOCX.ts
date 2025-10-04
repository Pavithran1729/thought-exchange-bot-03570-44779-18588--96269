import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx';
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
  const documentChildren: Paragraph[] = [];

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

  // Add content sections
  sections.forEach((section) => {
    switch (section.type) {
      case 'heading':
        const headingLevel = section.level === 1 
          ? HeadingLevel.HEADING_1 
          : section.level === 2 
          ? HeadingLevel.HEADING_2 
          : HeadingLevel.HEADING_3;

        documentChildren.push(
          new Paragraph({
            text: section.content,
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
              children: [
                new TextRun({
                  text: section.content,
                  size: 22,
                }),
              ],
              spacing: {
                after: 120,
              },
            })
          );
        }
        break;

      case 'list-item':
        documentChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: section.content,
                size: 22,
              }),
            ],
            bullet: {
              level: 0,
            },
            spacing: {
              after: 80,
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
    sections: [
      {
        properties: {},
        children: documentChildren,
      },
    ],
  });

  // Generate and save
  const blob = await Packer.toBlob(doc);
  const filename = `${sanitizeFilename(title)}.docx`;
  saveAs(blob, filename);
};
