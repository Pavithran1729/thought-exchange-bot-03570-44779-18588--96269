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
    const { title, template = 'professional', additionalContext = '' } = await req.json();

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

    console.log('Generating detailed report for title:', title);

    const systemPrompt = `You are an expert report writer with exceptional attention to detail. Generate highly detailed, comprehensive, well-structured reports using professional markdown formatting.`;

    const userPrompt = `Generate a highly detailed, comprehensive, well-structured report based on the provided title and context.

Requirements:
- Use professional markdown formatting with clear hierarchy (# ## ### ####)
- Include extensive sections with proper headings and detailed subsections
- Add comprehensive tables for data presentation with multiple examples
- Use LaTeX notation for mathematical formulas (wrap in $ for inline, $$ for block)
- Include detailed bullet points and numbered lists with extensive explanations
- Ensure the report is extremely detailed, informative, and well-organized
- Provide in-depth analysis, multiple examples, case studies, and thorough explanations for each section
- Use **bold** for emphasis and key terms
- Use *italic* for definitions and foreign terms

Structure (with extensive detail in each section):
1. **Executive Summary** (detailed overview with key findings)
2. **Introduction** (comprehensive background and context)
3. **Background/Literature Review** (extensive research context)
4. **Main Content** (multiple detailed sections with subsections):
   - Each section should be thorough with examples
   - Include data tables, statistics, and analysis
   - Provide comprehensive explanations
5. **Detailed Analysis** (in-depth examination with multiple perspectives)
6. **Case Studies/Examples** (multiple real-world applications)
7. **Findings and Discussion** (thorough analysis of results)
8. **Conclusions** (comprehensive summary of insights)
9. **Detailed Recommendations** (actionable steps with implementation details)
10. **Future Outlook** (trends and predictions)

Template Style: ${template}
${template === 'technical' ? 'Focus on extensive technical details, specifications, code examples, diagrams, and comprehensive data-driven analysis with detailed explanations.' : ''}
${template === 'business' ? 'Focus on detailed business metrics, comprehensive ROI analysis, market research, competitive analysis, financial projections, and strategic recommendations with extensive supporting data.' : ''}
${template === 'academic' ? 'Focus on thorough research methodology, extensive citations, scholarly analysis, comprehensive literature review, detailed findings with supporting evidence, and rigorous academic standards.' : ''}
${template === 'creative' ? 'Use engaging language and creative presentation while maintaining professionalism. Include detailed examples, case studies, comprehensive storytelling, and innovative perspectives.' : ''}
${template === 'professional' ? 'Use formal corporate language, extensive data tables, detailed analysis, comprehensive recommendations, and professional formatting throughout.' : ''}

CRITICAL: Generate a COMPLETE, FULL-LENGTH report with:
- Minimum 3000-4000 words of substantial content
- At least 8-10 major sections with multiple subsections each
- Detailed explanations for every point (not just bullet points)
- Multiple comprehensive examples and case studies
- Thorough analysis with extensive supporting data
- Detailed recommendations with step-by-step implementation guidelines
- Professional tables with substantial data
- In-depth insights and comprehensive discussion

Report Title: "${title}"${additionalContext ? `\n\nAdditional Context:\n${additionalContext}` : ''}

Generate the most comprehensive, detailed, and thorough report possible. Do not cut short - provide complete, extensive content for all sections.`;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
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

    console.log('Report generated successfully');

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
