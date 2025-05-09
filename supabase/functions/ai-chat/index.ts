
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, username } = await req.json();
    
    if (!query) {
      throw new Error('No query provided');
    }

    if (!username) {
      throw new Error('No username provided');
    }

    // Create a Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the user's classification and releasability levels
    const { data: userAccess, error: userError } = await supabase
      .from('user_access')
      .select('classification_levels, releasability_levels')
      .eq('username', username)
      .single();

    if (userError || !userAccess) {
      throw new Error(`Error fetching user access levels: ${userError?.message || 'User not found'}`);
    }

    // Parse the comma-separated strings into arrays
    const allowedClassifications = userAccess.classification_levels
      .split(',')
      .map(level => level.trim().toUpperCase());
    const allowedReleasability = userAccess.releasability_levels
      .split(',')
      .map(level => level.trim().toUpperCase());

    console.log(`User ${username} classification levels:`, allowedClassifications);
    console.log(`User ${username} releasability levels:`, allowedReleasability);

    // Fetch data feeds accessible to the user based on their security clearance
    const { data: feeds, error: feedsError } = await supabase
      .from('data_feeds')
      .select('*')
      .order('timestamp', { ascending: false });

    if (feedsError) {
      throw new Error(`Error fetching data feeds: ${feedsError.message}`);
    }

    // Filter feeds based on user's security clearance
    const accessibleFeeds = feeds.filter(feed => {
      const feedClassification = feed.security_classification.trim().toUpperCase();
      const feedReleasability = feed.releasability.trim().toUpperCase();

      const hasClassificationAccess = allowedClassifications.some(level => 
        feedClassification === level
      );

      const hasReleasabilityAccess = allowedReleasability.some(level => 
        feedReleasability === level
      );

      return hasClassificationAccess && hasReleasabilityAccess;
    });

    console.log(`Found ${accessibleFeeds.length} accessible feeds for user ${username}`);

    if (accessibleFeeds.length === 0) {
      return new Response(JSON.stringify({
        response: "I don't have any information in my knowledge base that matches your security clearance level."
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Prepare context for OpenAI by formatting the accessible feeds
    const context = accessibleFeeds.map(feed => {
      return `
Title: ${feed.title}
Content: ${feed.content || 'No content available'}
Source: ${feed.source}
Classification: ${feed.security_classification}
Releasability: ${feed.releasability}
Date: ${new Date(feed.timestamp).toLocaleString()}
${feed.PIR ? `PIR: ${feed.PIR}` : ''}
`;
    }).join('\n---\n');

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant with access to secure data feeds. You must only answer questions based on the information provided in the context below. If the information isn't in the context, say you don't have that information. Always mention the classification level and releasability of the information you're sharing.

CONTEXT:
${context}`
          },
          {
            role: 'user',
            content: query
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      throw new Error(`OpenAI API error: ${openAIResponse.status} - ${errorText}`);
    }

    const openAIData = await openAIResponse.json();
    const aiResponse = openAIData.choices[0].message.content;

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in AI chat function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
