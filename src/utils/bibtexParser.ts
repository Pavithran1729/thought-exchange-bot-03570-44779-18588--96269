export interface ParsedCitation {
  type: string;
  citationKey: string;
  title: string;
  authors: string[];
  year: number | null;
  journal?: string;
  volume?: string;
  pages?: string;
  doi?: string;
  url?: string;
  bibtexRaw: string;
}

export const parseBibTeX = (bibtex: string): ParsedCitation[] => {
  const citations: ParsedCitation[] = [];
  
  // Match individual entries
  const entryRegex = /@(\w+)\s*\{\s*([^,]+)\s*,([^@]*)\}/g;
  let match;
  
  while ((match = entryRegex.exec(bibtex)) !== null) {
    const [fullMatch, entryType, citationKey, fieldsStr] = match;
    
    const fields: Record<string, string> = {};
    
    // Parse fields - handle multi-line values with braces
    const fieldRegex = /(\w+)\s*=\s*[{"]((?:[^{}"]|{[^{}]*})*)[}"]/g;
    let fieldMatch;
    
    while ((fieldMatch = fieldRegex.exec(fieldsStr)) !== null) {
      const [, fieldName, fieldValue] = fieldMatch;
      fields[fieldName.toLowerCase()] = fieldValue.trim();
    }
    
    // Parse authors
    const authorsStr = fields.author || '';
    const authors = authorsStr
      .split(/\s+and\s+/i)
      .map(a => a.trim())
      .filter(a => a.length > 0);
    
    // Parse year
    const yearStr = fields.year || '';
    const year = yearStr ? parseInt(yearStr, 10) : null;
    
    citations.push({
      type: entryType.toLowerCase(),
      citationKey: citationKey.trim(),
      title: fields.title || 'Untitled',
      authors,
      year: isNaN(year as number) ? null : year,
      journal: fields.journal || fields.booktitle,
      volume: fields.volume,
      pages: fields.pages,
      doi: fields.doi,
      url: fields.url,
      bibtexRaw: fullMatch,
    });
  }
  
  return citations;
};

export const generateBibTeXEntry = (citation: {
  citationKey: string;
  title: string;
  authors: string[];
  year?: number;
  journal?: string;
  volume?: string;
  pages?: string;
  doi?: string;
  url?: string;
}): string => {
  const type = citation.journal ? 'article' : 'misc';
  const lines: string[] = [];
  
  lines.push(`@${type}{${citation.citationKey},`);
  lines.push(`  title = {${citation.title}},`);
  
  if (citation.authors.length > 0) {
    lines.push(`  author = {${citation.authors.join(' and ')}},`);
  }
  
  if (citation.year) {
    lines.push(`  year = {${citation.year}},`);
  }
  
  if (citation.journal) {
    lines.push(`  journal = {${citation.journal}},`);
  }
  
  if (citation.volume) {
    lines.push(`  volume = {${citation.volume}},`);
  }
  
  if (citation.pages) {
    lines.push(`  pages = {${citation.pages}},`);
  }
  
  if (citation.doi) {
    lines.push(`  doi = {${citation.doi}},`);
  }
  
  if (citation.url) {
    lines.push(`  url = {${citation.url}},`);
  }
  
  // Remove trailing comma from last line
  if (lines.length > 1) {
    lines[lines.length - 1] = lines[lines.length - 1].replace(/,$/, '');
  }
  
  lines.push('}');
  
  return lines.join('\n');
};
