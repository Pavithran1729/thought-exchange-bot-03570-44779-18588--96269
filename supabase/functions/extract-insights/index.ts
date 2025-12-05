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
    const { content } = await req.json();

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'Content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
    if (!PERPLEXITY_API_KEY) {
      throw new Error('PERPLEXITY_API_KEY not configured');
    }

    console.log('Extracting comprehensive insights from content');

    const systemPrompt = `You are an expert data analyst with deep analytical capabilities and attention to detail. Always respond with valid JSON only.`;

    const userPrompt = `Thoroughly analyze the provided content and extract comprehensive, detailed insights, statistics, and summaries.

Return a JSON object with the following structure:
{
  "insights": [
    {
      "type": "key_point" | "statistic" | "quote" | "finding" | "trend" | "recommendation",
      "title": "brief descriptive title",
      "content": "detailed insight content with comprehensive explanation and context",
      "importance": "high" | "medium" | "low",
      "category": "relevant category",
      "details": "additional supporting information and implications"
    }
  ],
  "summary": "comprehensive multi-paragraph executive summary covering all major points, themes, and key findings in detail",
  "keywords": ["keyword1", "keyword2", "keyword3", ...],
  "statistics": [
    {
      "label": "statistic name with context",
      "value": "statistic value",
      "significance": "explanation of what this statistic means"
    }
  ],
  "trends": ["detailed trend 1 with analysis", "detailed trend 2 with implications", ...],
  "recommendations": ["detailed actionable recommendation 1", "detailed recommendation 2", ...]
}

Focus on:
- Quantitative data and specific metrics with context
- Important patterns, correlations, and relationships
- Actionable insights with detailed explanations
- Emerging trends and their comprehensive implications
- Detailed recommendations with implementation guidance
- Context and supporting evidence for each insight
- Multiple perspectives and comprehensive analysis

Extract AT LEAST 8-12 detailed insights covering different aspects of the content. Provide in-depth analysis with substantial detail for each field.

Content to analyze:

${content}`;

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
      throw new Error('Failed to extract insights');
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content;

    if (!rawContent) {
      throw new Error('No insights generated');
    }

    // Try to parse JSON from the response
    let insights;
    try {
      // Remove markdown code blocks if present
      const cleanedContent = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      insights = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse insights JSON:', parseError);
      // Fallback to returning raw content if JSON parsing fails
      insights = {
        insights: [],
        summary: rawContent,
        keywords: []
      };
    }

    console.log('Insights extracted successfully');

    return new Response(
      JSON.stringify(insights),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in extract-insights:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
