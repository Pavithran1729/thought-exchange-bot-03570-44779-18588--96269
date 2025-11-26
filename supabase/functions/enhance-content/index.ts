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

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    console.log('Enhancing content with extensive detail, type:', enhancementType);

    const enhancementPrompts = {
      expand: 'Significantly expand this content with extensive details, multiple examples, comprehensive explanations, and in-depth analysis. Add substantial context, supporting information, data points, case studies, and detailed elaborations for each point. Transform every point into a well-developed paragraph with thorough explanations. Make it at least 3-4x longer with rich, valuable, detailed content.',
      summarize: 'Create a detailed yet concise summary of this content while preserving all key points, important information, and critical insights. Include main arguments, supporting details, and essential context in a well-structured format.',
      improve: 'Thoroughly improve the clarity, structure, flow, and professionalism of this content. Enhance explanations with more detail, add transitional phrases, fix any grammar or style issues, improve formatting with proper sections, and make the content significantly more comprehensive, detailed, and engaging.',
      rephrase: 'Completely rephrase this content using different words, varied sentence structures, and alternative expressions while maintaining and even enhancing the meaning, depth, detail, and message. Make it more engaging, detailed, and professionally written.'
    };

    const prompt = `You are an expert content editor with exceptional attention to detail and comprehensive writing skills. ${enhancementPrompts[enhancementType as keyof typeof enhancementPrompts]} 
    
Maintain a ${tone} tone throughout. Use proper markdown formatting with:
- Clear headings and subheadings
- Detailed bullet points and numbered lists
- Emphasis with **bold** for key terms and *italic* for definitions
- Tables for data organization where appropriate
- Code blocks for technical content if relevant

Preserve any mathematical formulas in LaTeX notation (both inline $...$ and display $$...$$). 

CRITICAL: Provide extensive, detailed, comprehensive content. Every point should be well-developed with thorough explanations, examples, and supporting information. Do not abbreviate or summarize unless specifically asked to summarize.

Content to enhance:\n\n${content}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          maxOutputTokens: 32000,
          temperature: 0.7,
        }
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
      console.error('Gemini API error:', response.status, errorText);
      throw new Error('Failed to enhance content');
    }

    const data = await response.json();
    const enhancedContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

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