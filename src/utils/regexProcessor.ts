export interface RegexPattern {
  type: string;
  pattern: RegExp;
  description: string;
}

export interface ExtractedData {
  type: string;
  value: string;
  pattern: string;
}

export interface ExtractedDataWithPosition extends ExtractedData {
  startIndex: number;
  endIndex: number;
}

export const regexPatterns: RegexPattern[] = [
  {
    type: "Email",
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    description: "Email addresses",
  },
  {
    type: "Phone",
    pattern: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
    description: "Phone numbers",
  },
  {
    type: "Date",
    pattern: /\b(\d{1,2}[/.]\d{1,2}[/.]\d{4}|\d{4}-\d{2}-\d{2})\b/g,
    description: "Dates",
  },
  {
    type: "Currency",
    pattern: /\$\d+(?:,\d{3})*(?:\.\d{2})?/g,
    description: "Currency amounts",
  },
  {
    type: "URL",
    pattern: /https?:\/\/[^\s]+/g,
    description: "Web URLs",
  },
  {
    type: "Time",
    pattern: /\b([01]?[0-9]|2[0-3]):[0-5][0-9](?::[0-5][0-9])?\s?(?:AM|PM|am|pm)?\b/g,
    description: "Time stamps",
  },
  {
    type: "Percentage",
    pattern: /\d+(?:\.\d+)?%/g,
    description: "Percentages",
  },
  {
    type: "SSN",
    pattern: /\b\d{3}-\d{2}-\d{4}\b/g,
    description: "Social Security Numbers",
  },
  {
    type: "IP Address",
    pattern: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    description: "IP addresses",
  },
  {
    type: "Hashtag",
    pattern: /#[a-zA-Z0-9_]+/g,
    description: "Social media hashtags",
  },
];

// Academic-specific regex patterns for highlighting
export const academicPatterns: RegexPattern[] = [
  {
    type: "Citation",
    pattern: /\[(\d+(?:,\s*\d+)*)\]/g,
    description: "Numeric citations [1], [2,3]",
  },
  {
    type: "Citation",
    pattern: /\(([A-Z][a-z]+(?:\s+(?:et\s+al\.?|&|and)\s+[A-Z][a-z]+)*,?\s*\d{4}[a-z]?)\)/g,
    description: "Author-year citations (Smith, 2023)",
  },
  {
    type: "Figure Reference",
    pattern: /\b(Figure|Fig\.?)\s+\d+(\.\d+)?[a-z]?\b/gi,
    description: "Figure references",
  },
  {
    type: "Table Reference",
    pattern: /\bTable\s+\d+(\.\d+)?\b/gi,
    description: "Table references",
  },
  {
    type: "Equation Reference",
    pattern: /\b(Equation|Eq\.?)\s+\d+(\.\d+)?\b/gi,
    description: "Equation references",
  },
  {
    type: "Section Reference",
    pattern: /\bSection\s+\d+(\.\d+)*\b/gi,
    description: "Section references",
  },
  {
    type: "Key Term",
    pattern: /\*\*([^*]+)\*\*/g,
    description: "Bold key terms",
  },
  {
    type: "Definition",
    pattern: /\*([^*]+)\*/g,
    description: "Italic definitions",
  },
  {
    type: "DOI",
    pattern: /\b10\.\d{4,}\/[^\s]+/g,
    description: "DOI identifiers",
  },
  {
    type: "ISBN",
    pattern: /\bISBN[:\s]*([\d-]{10,17})\b/gi,
    description: "ISBN numbers",
  },
];

export const processText = (text: string): ExtractedData[] => {
  const results: ExtractedData[] = [];
  const seen = new Set<string>();

  regexPatterns.forEach(({ type, pattern, description }) => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach((match) => {
        const key = `${type}:${match}`;
        if (!seen.has(key)) {
          seen.add(key);
          results.push({
            type,
            value: match,
            pattern: description,
          });
        }
      });
    }
  });

  return results;
};

export const processTextWithPositions = (text: string, includeAcademic: boolean = false): ExtractedDataWithPosition[] => {
  const results: ExtractedDataWithPosition[] = [];
  const seen = new Set<string>();
  const patterns = includeAcademic ? [...regexPatterns, ...academicPatterns] : regexPatterns;

  patterns.forEach(({ type, pattern, description }) => {
    // Reset regex index for each pattern
    const regex = new RegExp(pattern.source, pattern.flags);
    let match;

    while ((match = regex.exec(text)) !== null) {
      const key = `${type}:${match[0]}:${match.index}`;
      if (!seen.has(key)) {
        seen.add(key);
        results.push({
          type,
          value: match[0],
          pattern: description,
          startIndex: match.index,
          endIndex: match.index + match[0].length,
        });
      }
    }
  });

  return results;
};

export const processAcademicText = (text: string): ExtractedDataWithPosition[] => {
  return processTextWithPositions(text, true);
};

export const convertLatexToReadable = (text: string): string => {
  // Convert common LaTeX patterns to human-readable text
  let readable = text;
  
  // Inline math: \(...\)
  readable = readable.replace(/\\\((.*?)\\\)/g, (_, formula) => {
    return convertFormulaToText(formula);
  });
  
  // Display math: $$...$$
  readable = readable.replace(/\$\$(.*?)\$\$/g, (_, formula) => {
    return `\n${convertFormulaToText(formula)}\n`;
  });
  
  return readable;
};

const convertFormulaToText = (formula: string): string => {
  let text = formula;
  
  // Common conversions
  text = text.replace(/\^2/g, " squared");
  text = text.replace(/\^3/g, " cubed");
  text = text.replace(/\^(\d+)/g, " to the power of $1");
  text = text.replace(/\\frac\{(.*?)\}\{(.*?)\}/g, "($1 divided by $2)");
  text = text.replace(/\\sqrt\{(.*?)\}/g, "square root of $1");
  text = text.replace(/\\sum/g, "sum of");
  text = text.replace(/\\int/g, "integral of");
  text = text.replace(/\\pi/g, "pi");
  text = text.replace(/\\alpha/g, "alpha");
  text = text.replace(/\\beta/g, "beta");
  text = text.replace(/\\gamma/g, "gamma");
  text = text.replace(/\\Delta/g, "Delta");
  
  return text;
};
