
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { systemPrompt, knowledgeContent, messages } = await req.json();

    if (!systemPrompt || !messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error('Missing required parameters');
    }

    console.log('Processing AI agent chat request with conversation history');
    console.log(`Received ${messages.length} messages in history`);

    // Construct the complete messages array with system prompt and knowledge
    const completeMessages: Message[] = [
      { 
        role: 'system', 
        content: systemPrompt + (knowledgeContent ? `\n\nReference knowledge: ${knowledgeContent}` : '') 
      },
      ...messages.slice(-10) // Only use the last 10 messages for context
    ];

    console.log('Sending request to OpenAI');
    
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: completeMessages,
        temperature: 0.7,
        max_tokens: 1200, // Increased from 800 to 1200 tokens
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('Successfully received AI response');

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error in ai-agent-chat function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
