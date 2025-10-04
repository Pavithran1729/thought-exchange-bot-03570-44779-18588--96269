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
    const { content, enhancementType = 'expand', tone = 'professional' } = await req.json();

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'Content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Enhancing content, type:', enhancementType);

    let systemPrompt = 'You are an expert content editor. ';
    let userPrompt = '';

    switch (enhancementType) {
      case 'expand':
        systemPrompt += 'Expand and elaborate on the provided content while maintaining its structure and key points. Add relevant details, examples, and insights.';
        userPrompt = `Expand this content:\n\n${content}`;
        break;
      case 'summarize':
        systemPrompt += 'Create a concise summary that captures the main points and key insights.';
        userPrompt = `Summarize this content:\n\n${content}`;
        break;
      case 'improve':
        systemPrompt += 'Improve the writing quality, clarity, and flow while maintaining the original meaning and structure.';
        userPrompt = `Improve this content:\n\n${content}`;
        break;
      case 'rephrase':
        systemPrompt += 'Rephrase the content using different wording while maintaining the same meaning and tone.';
        userPrompt = `Rephrase this content:\n\n${content}`;
        break;
      default:
        systemPrompt += 'Enhance and improve the overall quality of the content.';
        userPrompt = `Enhance this content:\n\n${content}`;
    }

    systemPrompt += ` Use a ${tone} tone. Preserve markdown formatting.`;

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
      throw new Error('Failed to enhance content');
    }

    const data = await response.json();
    const enhancedContent = data.choices?.[0]?.message?.content;

    if (!enhancedContent) {
      throw new Error('No enhanced content generated');
    }

    console.log('Content enhanced successfully');

    return new Response(
      JSON.stringify({ content: enhancedContent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in enhance-content:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});