import type { Template } from "./templates";
import type { ExtractedData } from "./regexProcessor";

export const sanitizeFilename = (filename: string): string => {
  return filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
};

export const formatDate = (): string => {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const parseMarkdownToSections = (content: string) => {
  const lines = content.split('\n');
  const sections: { type: string; content: string; level?: number }[] = [];

  lines.forEach((line) => {
    if (line.startsWith('### ')) {
      sections.push({ type: 'heading', content: line.slice(4), level: 3 });
    } else if (line.startsWith('## ')) {
      sections.push({ type: 'heading', content: line.slice(3), level: 2 });
    } else if (line.startsWith('# ')) {
      sections.push({ type: 'heading', content: line.slice(2), level: 1 });
    } else if (line.trim() === '') {
      sections.push({ type: 'space', content: '' });
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      sections.push({ type: 'list-item', content: line.slice(2) });
    } else {
      sections.push({ type: 'paragraph', content: line });
    }
  });

  return sections;
};

export const createExtractedDataTable = (extractedData: ExtractedData[]) => {
  if (extractedData.length === 0) return null;

  const groupedData: Record<string, string[]> = {};
  
  extractedData.forEach((item) => {
    if (!groupedData[item.type]) {
      groupedData[item.type] = [];
    }
    groupedData[item.type].push(item.value);
  });

  return groupedData;
};

export const calculateReadingTime = (content: string): number => {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
  return Math.ceil(wordCount / wordsPerMinute);
};
