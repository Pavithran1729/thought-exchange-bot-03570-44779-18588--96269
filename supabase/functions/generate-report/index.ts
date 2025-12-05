import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      title, 
      template = 'professional', 
      documentContent = '', 
      additionalInstructions = '' 
    } = await req.json();

    if (!title) {
      return new Response(
        JSON.stringify({ error: 'Title is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
    if (!PERPLEXITY_API_KEY) {
      throw new Error('PERPLEXITY_API_KEY not configured');
    }

    console.log('Generating report for title:', title);
    console.log('Document content length:', documentContent.length);
    console.log('Additional instructions:', additionalInstructions);

    const hasDocument = documentContent && documentContent.trim().length > 0;

    const systemPrompt = `You are an expert report writer and document analyst with exceptional attention to detail. Your task is to analyze documents and generate comprehensive, well-structured reports using professional markdown formatting.`;

    let userPrompt = '';

    if (hasDocument) {
      // Document-based report generation
      userPrompt = `Analyze the following document and generate a comprehensive, well-structured report based on it.

=== DOCUMENT CONTENT ===
${documentContent}
=== END OF DOCUMENT ===

Report Title: "${title}"
Template Style: ${template}

${additionalInstructions ? `
=== USER INSTRUCTIONS ===
${additionalInstructions}
=== END OF INSTRUCTIONS ===

Follow the user's specific instructions above when analyzing the document and creating the report.
` : ''}

Requirements:
- Thoroughly analyze the document content
- Use professional markdown formatting with clear hierarchy (# ## ### ####)
- Include comprehensive sections with proper headings
- Add tables for data presentation where relevant
- Use LaTeX notation for mathematical formulas (wrap in $ for inline, $$ for block)
- Include bullet points and numbered lists
- Use **bold** for emphasis and key terms
- Use *italic* for definitions

Structure your report based on the document content:
1. **Executive Summary** - Key findings and highlights from the document
2. **Document Overview** - What the document contains
3. **Detailed Analysis** - In-depth examination of the content
4. **Key Findings** - Important data, facts, and insights extracted
5. **Conclusions** - Summary and implications
6. **Recommendations** - Suggested actions based on the analysis

${template === 'technical' ? 'Focus on technical details, specifications, and data-driven analysis.' : ''}
${template === 'business' ? 'Focus on business metrics, ROI analysis, and strategic recommendations.' : ''}
${template === 'academic' ? 'Focus on research methodology, citations, and scholarly analysis.' : ''}
${template === 'creative' ? 'Use engaging language while maintaining professionalism.' : ''}
${template === 'professional' ? 'Use formal corporate language with detailed analysis.' : ''}

Generate a thorough report analyzing the provided document content.`;

    } else {
      // Title-only report generation (original behavior)
      userPrompt = `Generate a highly detailed, comprehensive, well-structured report based on the provided title.

Report Title: "${title}"
Template Style: ${template}

${additionalInstructions ? `Additional Context/Instructions:\n${additionalInstructions}\n` : ''}

Requirements:
- Use professional markdown formatting with clear hierarchy (# ## ### ####)
- Include extensive sections with proper headings and detailed subsections
- Add comprehensive tables for data presentation
- Use LaTeX notation for mathematical formulas (wrap in $ for inline, $$ for block)
- Include detailed bullet points and numbered lists
- Use **bold** for emphasis and key terms
- Use *italic* for definitions

Structure:
1. **Executive Summary**
2. **Introduction**
3. **Background/Literature Review**
4. **Main Content** (multiple detailed sections)
5. **Detailed Analysis**
6. **Case Studies/Examples**
7. **Findings and Discussion**
8. **Conclusions**
9. **Recommendations**
10. **Future Outlook**

${template === 'technical' ? 'Focus on technical details, specifications, and data-driven analysis.' : ''}
${template === 'business' ? 'Focus on business metrics, ROI analysis, and strategic recommendations.' : ''}
${template === 'academic' ? 'Focus on research methodology, citations, and scholarly analysis.' : ''}
${template === 'creative' ? 'Use engaging language while maintaining professionalism.' : ''}
${template === 'professional' ? 'Use formal corporate language with detailed analysis.' : ''}

Generate a comprehensive report with substantial content.`;
    }

    console.log('Sending request to Perplexity API...');

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
        return_images: false,
        return_related_questions: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('Perplexity API error:', response.status, errorText);
      throw new Error('Failed to generate report');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content generated');
    }

    console.log('Report generated successfully, length:', content.length);

    return new Response(
      JSON.stringify({ content }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-report:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
