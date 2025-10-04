export interface ContentStats {
  wordCount: number;
  characterCount: number;
  characterCountNoSpaces: number;
  sentenceCount: number;
  paragraphCount: number;
  readingTimeMinutes: number;
  avgWordsPerSentence: number;
  avgSentencesPerParagraph: number;
}

export const calculateContentStats = (content: string): ContentStats => {
  if (!content || !content.trim()) {
    return {
      wordCount: 0,
      characterCount: 0,
      characterCountNoSpaces: 0,
      sentenceCount: 0,
      paragraphCount: 0,
      readingTimeMinutes: 0,
      avgWordsPerSentence: 0,
      avgSentencesPerParagraph: 0,
    };
  }

  const trimmedContent = content.trim();
  
  // Word count
  const words = trimmedContent.split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;
  
  // Character count
  const characterCount = trimmedContent.length;
  const characterCountNoSpaces = trimmedContent.replace(/\s/g, '').length;
  
  // Sentence count (split by . ! ?)
  const sentences = trimmedContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const sentenceCount = sentences.length;
  
  // Paragraph count (split by double newline or single newline for markdown)
  const paragraphs = trimmedContent.split(/\n\n+|\n/).filter(p => p.trim().length > 0);
  const paragraphCount = paragraphs.length;
  
  // Reading time (average 225 words per minute)
  const readingTimeMinutes = Math.ceil(wordCount / 225);
  
  // Averages
  const avgWordsPerSentence = sentenceCount > 0 ? Math.round(wordCount / sentenceCount) : 0;
  const avgSentencesPerParagraph = paragraphCount > 0 ? Number((sentenceCount / paragraphCount).toFixed(1)) : 0;
  
  return {
    wordCount,
    characterCount,
    characterCountNoSpaces,
    sentenceCount,
    paragraphCount,
    readingTimeMinutes,
    avgWordsPerSentence,
    avgSentencesPerParagraph,
  };
};

export const analyzeSentiment = (content: string): { score: number; label: string; color: string } => {
  if (!content) return { score: 0, label: 'Neutral', color: 'hsl(var(--muted-foreground))' };
  
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'positive', 'success', 'achievement', 'innovative'];
  const negativeWords = ['bad', 'poor', 'terrible', 'awful', 'negative', 'failure', 'problem', 'issue', 'concern', 'risk'];
  
  const lowerContent = content.toLowerCase();
  let score = 0;
  
  positiveWords.forEach(word => {
    const matches = lowerContent.match(new RegExp(`\\b${word}\\b`, 'g'));
    if (matches) score += matches.length;
  });
  
  negativeWords.forEach(word => {
    const matches = lowerContent.match(new RegExp(`\\b${word}\\b`, 'g'));
    if (matches) score -= matches.length;
  });
  
  const normalizedScore = Math.max(-5, Math.min(5, score));
  
  if (normalizedScore > 2) return { score: normalizedScore, label: 'Positive', color: 'hsl(142, 76%, 36%)' };
  if (normalizedScore < -2) return { score: normalizedScore, label: 'Negative', color: 'hsl(0, 84%, 60%)' };
  if (normalizedScore > 0) return { score: normalizedScore, label: 'Slightly Positive', color: 'hsl(142, 76%, 50%)' };
  if (normalizedScore < 0) return { score: normalizedScore, label: 'Slightly Negative', color: 'hsl(0, 84%, 70%)' };
  return { score: 0, label: 'Neutral', color: 'hsl(var(--muted-foreground))' };
};

export const calculateReadability = (content: string): { score: number; level: string; color: string } => {
  const stats = calculateContentStats(content);
  
  if (stats.wordCount === 0) return { score: 0, level: 'N/A', color: 'hsl(var(--muted-foreground))' };
  
  // Simple readability approximation
  const avgWordLength = stats.characterCountNoSpaces / stats.wordCount;
  const complexityScore = (stats.avgWordsPerSentence * 0.4) + (avgWordLength * 10);
  
  if (complexityScore < 25) return { score: 100, level: 'Very Easy', color: 'hsl(142, 76%, 36%)' };
  if (complexityScore < 35) return { score: 80, level: 'Easy', color: 'hsl(142, 76%, 50%)' };
  if (complexityScore < 45) return { score: 60, level: 'Moderate', color: 'hsl(47, 96%, 53%)' };
  if (complexityScore < 55) return { score: 40, level: 'Difficult', color: 'hsl(25, 95%, 53%)' };
  return { score: 20, level: 'Very Difficult', color: 'hsl(0, 84%, 60%)' };
};
