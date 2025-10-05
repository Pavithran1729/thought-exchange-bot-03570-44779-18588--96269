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

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Generating report for title:', title);

    const systemPrompt = `You are an expert report writer. Generate comprehensive, professionally formatted reports in markdown format that match academic and corporate standards.

Structure your reports with:
1. Clear hierarchy using markdown headers (# ## ### ####)
2. Executive summary section
3. Detailed findings with subsections
4. Data-driven insights with tables and statistics
5. Actionable recommendations
6. Professional conclusion

CRITICAL FORMATTING REQUIREMENTS:
- Use **bold text** for emphasis and key terms (e.g., **Important:** or **Key Finding**)
- Use *italic text* for definitions and foreign terms
- Create tables using markdown table syntax for data presentation:
  | Header 1 | Header 2 | Header 3 |
  |----------|----------|----------|
  | Data 1   | Data 2   | Data 3   |
- Use numbered lists (1. 2. 3.) for sequential steps
- Use bullet points (- or *) for non-sequential items
- Include code blocks with \`\`\` for technical content

For mathematical formulas and equations, use LaTeX notation:
- Inline math: $formula$ (e.g., $E = mc^2$ for energy-mass equivalence)
- Display math: $$formula$$ (e.g., $$\\int_{0}^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$$)
- Use proper LaTeX syntax for fractions $\\frac{a}{b}$, integrals $\\int$, summations $\\sum$, Greek letters $\\alpha, \\beta, \\gamma$

STYLE GUIDELINES:
- Use proper spacing between sections
- Bold all subheadings (## **Introduction**)
- Include tables for comparative data
- Use horizontal rules (---) to separate major sections
- Make the content ${template === 'professional' ? 'formal and corporate with data tables' : template === 'creative' ? 'engaging and innovative with visual elements' : template === 'academic' ? 'scholarly and research-focused with citations and formulas' : 'clear and informative with structured data'}.`;

    const userPrompt = `Generate a comprehensive report on: "${title}"${additionalContext ? `\n\nAdditional context: ${additionalContext}` : ''}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: 2000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits depleted. Please add more credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
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